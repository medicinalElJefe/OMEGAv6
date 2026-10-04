import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const ROUTE_BUDGET_MS=8000;
const SHELL_BUDGET_MS=4000;
const P95_BUDGET_MS=6000;
const routes=[
 'Command Center','Hybrid Link','Workspace','Cockpit','Immersive Traversal','Matter Traversal','Extreme Traversal','Visual Instrument','Relativity','Earth Now','Forecast','Atlas','Traversal','Create','Field','Data Motion','Reality Lab','Atlas Calculator','Infinity','Convergence','Quality Compiler','Build Out','Projects','Render Queue','Assets','Modes','Kernel Intelligence','Evidence & Proof','Memory','Archive Census','Archive Operators','Development','Canon Evolution','SAI Lab','Governance','Consolidation','Instructions','Plugins','Settings','System','Validation','System Atlas','Scale Compiler','Control Matrix'
];

async function mocks(page){
 const fulfill=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>fulfill(r,{status:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}}));
 await page.route('**/api/restoration',r=>fulfill(r,{status:'RETURNED'}));
 await page.route('**/api/hybrid/status',r=>fulfill(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/hybrid/capabilities',r=>fulfill(r,{state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{}}));
 await page.route('**/api/earth/noaa/catalog',r=>fulfill(r,{schema:'OMEGA_EARTH_NOAA_CATALOG_V1',coverages:[{id:'R452_PERF'}]}));
 await page.route('**/api/route-preview',r=>fulfill(r,{route:'FAST_DETERMINISTIC'}));
 await page.route('**/api/chat',r=>fulfill(r,{reply:'R452 deterministic performance fixture',provider:'R452_FIXTURE',modelInvoked:false}));
}

async function open(page,route){
 const start=performance.now();
 await page.locator('.o7-search-trigger').click();
 const input=page.locator('.o7-command input');
 await input.fill(route);
 const result=page.locator(`[data-command-route="${route}"]`);
 await result.waitFor({state:'visible',timeout:ROUTE_BUDGET_MS});
 await result.click();
 await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:ROUTE_BUDGET_MS});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:ROUTE_BUDGET_MS});
 await page.waitForFunction(()=>!document.querySelector('.o7-native-loading')&&!document.querySelector('[data-omega7-failure]'),{timeout:ROUTE_BUDGET_MS});
 const elapsed=performance.now()-start;
 const back=page.locator('.o7-native-toolbar button');
 if(await back.count())await back.click();
 return elapsed;
}

const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 const page=await context.newPage();
 await mocks(page);
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 const start=performance.now();
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 const shell=performance.now()-start;
 if(shell>SHELL_BUDGET_MS)throw new Error(`R452 shell budget exceeded ${shell.toFixed(0)}ms > ${SHELL_BUDGET_MS}ms`);

 const timings=[];
 for(const route of routes){
  const elapsed=await open(page,route);
  timings.push([route,elapsed]);
  if(elapsed>ROUTE_BUDGET_MS)throw new Error(`R452 ${route} budget exceeded ${elapsed.toFixed(0)}ms > ${ROUTE_BUDGET_MS}ms`);
 }
 const sorted=timings.map(x=>x[1]).sort((a,b)=>a-b);
 const p95=sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)];
 if(p95>P95_BUDGET_MS)throw new Error(`R452 all-route p95 ${p95.toFixed(0)}ms > ${P95_BUDGET_MS}ms`);
 if(errors.length)throw new Error('R452 all-route performance produced unhandled page errors: '+errors.join(' | ').slice(0,1800));
 console.log('OMEGA7 R452 PERFORMANCE PASS · shell '+shell.toFixed(0)+'ms · 44-route p95 '+p95.toFixed(0)+'ms · slowest '+[...timings].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([r,t])=>r+':'+t.toFixed(0)+'ms').join(' · '));
 await context.close();
}finally{await browser.close()}
