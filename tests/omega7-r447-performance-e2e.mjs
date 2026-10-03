import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const ROUTE_BUDGET_MS=8000;
const SHELL_BUDGET_MS=4000;
const representatives=['Command Center','Earth Now','Traversal','Relativity','Forecast','Workspace','Hybrid Link','Evidence & Proof'];

async function mocks(page){
 await page.route('**/api/status',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}})}));
 await page.route('**/api/restoration',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'RETURNED'})}));
 await page.route('**/api/hybrid/status',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]})}));
 await page.route('**/api/hybrid/capabilities',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{}})}));
 await page.route('**/api/earth/noaa/catalog',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schema:'OMEGA_EARTH_NOAA_CATALOG_V1',coverages:[{id:'R447_PERF'}]})}));
 await page.route('**/api/route-preview',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({route:'FAST_DETERMINISTIC'})}));
}
async function open(page,route){
 const start=performance.now();
 await page.locator('.o7-search-trigger').click();
 await page.locator('.o7-command input').fill(route);
 await page.locator(`[data-command-route="${route}"]`).click();
 await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:ROUTE_BUDGET_MS});
 await page.waitForFunction(()=>Boolean(document.querySelector('.o7-native-workspace'))&&!document.querySelector('.o7-native-loading')&&!document.querySelector('[data-omega7-failure]'),{timeout:ROUTE_BUDGET_MS});
 const elapsed=performance.now()-start;
 await page.locator('.o7-native-toolbar button').click();
 return elapsed;
}
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 const page=await context.newPage();await mocks(page);
 const start=performance.now();
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 const shell=performance.now()-start;
 if(shell>SHELL_BUDGET_MS)throw new Error(`R447 shell budget exceeded ${shell.toFixed(0)}ms > ${SHELL_BUDGET_MS}ms`);
 const timings=[];
 for(const route of representatives){const elapsed=await open(page,route);timings.push([route,elapsed]);if(elapsed>ROUTE_BUDGET_MS)throw new Error(`R447 ${route} budget exceeded ${elapsed.toFixed(0)}ms`)}
 const sorted=timings.map(x=>x[1]).sort((a,b)=>a-b),p95=sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))];
 if(p95>6000)throw new Error(`R447 representative p95 ${p95.toFixed(0)}ms > 6000ms`);
 const nav=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return n?{domContentLoaded:n.domContentLoadedEventEnd,duration:n.duration}:null});
 console.log('OMEGA7 R447 PERFORMANCE PASS · shell '+shell.toFixed(0)+'ms · representative p95 '+p95.toFixed(0)+'ms · '+timings.map(([r,t])=>r+':'+t.toFixed(0)+'ms').join(' · ')+' · nav '+JSON.stringify(nav));
 await context.close();
}finally{await browser.close()}
