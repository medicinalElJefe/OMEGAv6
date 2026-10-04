import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const ROUTE_BUDGET_MS=8000;
const P95_BUDGET_MS=6000;
const nav=fs.readFileSync(new URL('../src/navigationRegistry.ts',import.meta.url),'utf8');
const block=nav.slice(nav.indexOf('export const OMEGA_NAVIGATION=['),nav.indexOf('export const OMEGA_NAV_GROUPS'));
const routes=[...block.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
if(routes.length!==44||new Set(routes).size!==44)throw new Error('R452 requires exact 44-route registry');

async function mocks(page){
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}}));
 await page.route('**/api/restoration',r=>json(r,{status:'RETURNED',state:'RETURNED'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/hybrid/capabilities',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{}}));
 await page.route('**/api/earth/noaa/catalog',r=>json(r,{schema:'OMEGA_EARTH_NOAA_CATALOG_V1',coverages:[{id:'R452_PERF'}]}));
 await page.route('**/api/route-preview',r=>json(r,{route:'FAST_DETERMINISTIC'}));
 await page.route('**/api/chat',r=>json(r,{reply:'R452 deterministic performance fixture',provider:'R452_FIXTURE',modelInvoked:false}));
 await page.route('**/api/plugins**',r=>json(r,{plugins:[],status:'RETURNED'}));
 await page.route('**/api/archive**',r=>json(r,{items:[],count:0,status:'RETURNED'}));
}

async function open(page,route){
 const start=performance.now();
 await page.locator('.o7-search-trigger').click();
 const input=page.locator('.o7-command input');
 await input.fill(route);
 await page.locator(`[data-command-route="${route}"]`).click();
 await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:ROUTE_BUDGET_MS});
 await page.waitForFunction(()=>Boolean(document.querySelector('.o7-native-workspace'))&&!document.querySelector('.o7-native-loading')&&!document.querySelector('[data-omega7-failure]'),{timeout:ROUTE_BUDGET_MS});
 const elapsed=performance.now()-start;
 await page.locator('.o7-native-toolbar button').first().click();
 await page.waitForFunction(()=>!document.querySelector('.o7-main')?.getAttribute('data-native-route'),{timeout:10000});
 return elapsed;
}

const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await mocks(page);
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});

 const timings=[];
 for(const route of routes){
  const elapsed=await open(page,route);
  timings.push([route,elapsed]);
  if(elapsed>ROUTE_BUDGET_MS)throw new Error(`R452 ${route} route budget exceeded ${elapsed.toFixed(0)}ms > ${ROUTE_BUDGET_MS}ms`);
 }
 const sorted=timings.map(x=>x[1]).sort((a,b)=>a-b);
 const p95=sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)];
 if(p95>P95_BUDGET_MS)throw new Error(`R452 44-route p95 ${p95.toFixed(0)}ms > ${P95_BUDGET_MS}ms`);
 if(errors.length)throw new Error('R452 unhandled page errors: '+errors.join(' | ').slice(0,2000));
 console.log('OMEGA7 R452 44-ROUTE PERFORMANCE PASS · all routes <='+ROUTE_BUDGET_MS+'ms · p95 '+p95.toFixed(0)+'ms · '+timings.map(([r,t])=>r+':'+t.toFixed(0)+'ms').join(' · '));
 await context.close();
}finally{await browser.close()}
