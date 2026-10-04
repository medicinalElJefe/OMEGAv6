import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const nav=fs.readFileSync(new URL('../src/navigationRegistry.ts',import.meta.url),'utf8');
const block=nav.slice(nav.indexOf('export const OMEGA_NAVIGATION=['),nav.indexOf('export const OMEGA_NAV_GROUPS'));
const routes=[...block.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
if(routes.length!==44||new Set(routes).size!==44)throw new Error(`R446 expected 44 unique canonical routes, got ${routes.length}/${new Set(routes).size}`);

async function mockBoundedApis(page){
 await page.route('**/api/status',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'READY',state:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}})}));
 await page.route('**/api/restoration',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'RETURNED',state:'RETURNED'})}));
 await page.route('**/api/hybrid/status',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]})}));
 await page.route('**/api/hybrid/capabilities',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{},boundaries:['CI_SYNTHETIC_HELD_STATE_ONLY']})}));
 await page.route('**/api/earth/noaa/catalog',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schema:'OMEGA_EARTH_NOAA_CATALOG_V1',coverages:[{id:'R446_SYNTHETIC_UI_PROBE'}],truthBoundary:'R446 browser transport fixture only'})}));
 await page.route('**/api/route-preview',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({route:'FAST_DETERMINISTIC',truthBoundary:'R446 browser transport fixture only'})}));
}

async function openRoute(page,route,label){
 const trigger=page.locator('.o7-search-trigger');
 await trigger.click();
 const input=page.locator('.o7-command input');
 await input.fill(route);
 const result=page.locator(`[data-command-route="${route}"]`);
 await result.waitFor({state:'visible',timeout:10000});
 await result.click();
 await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:15000});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:15000});
 await page.waitForFunction(()=>{
  const host=document.querySelector('.o7-native-host');
  if(!host)return false;
  return Boolean(host.querySelector('.o7-native-workspace,.o7-native-failure'))&&!host.querySelector('.o7-native-loading');
 },{timeout:20000});
 const failed=page.locator('.o7-native-failure');
 if(await failed.count())throw new Error(`${label}: ${route} entered native failure state: ${(await failed.innerText()).slice(0,500)}`);
 const visibleText=(await page.locator('.o7-native-host').innerText()).trim();
 if(visibleText.length<20)throw new Error(`${label}: ${route} rendered effectively blank`);
 const back=page.locator('.o7-native-toolbar button');
 await back.click();
 await page.waitForFunction(()=>!document.querySelector('.o7-main')?.getAttribute('data-native-route'),{timeout:10000});
}

async function proveViewport(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:1});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await mockBoundedApis(page);
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 if(await page.locator('.o7-nav button').count()!==6)throw new Error(`${label}: expected six primary human domains`);
 const nativeCount=await page.locator('.o7-app').getAttribute('data-omega7');
 if(nativeCount!=='true')throw new Error(`${label}: OMEGA7 shell identity missing`);

 // Shell controls: depth, health drawer, command palette.
 const depth=page.locator('.o7-top-actions select');
 await depth.selectOption('ADVANCED');if(await depth.inputValue()!=='ADVANCED')throw new Error(`${label}: Advanced depth did not apply`);
 await depth.selectOption('CANON');if(await depth.inputValue()!=='CANON')throw new Error(`${label}: Canon depth did not apply`);
 await depth.selectOption('STANDARD');
 await page.locator('.o7-health-button').click();
 await page.locator('.o7-status').waitFor({state:'visible'});
 await page.locator('.o7-status header button').click();

 for(const route of routes)await openRoute(page,route,label);

 const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth);
 if(overflow>8)throw new Error(`${label}: horizontal overflow ${overflow}px`);
 const scrollOwners=await page.evaluate(()=>{
  const main=document.querySelector('.o7-main');if(!main)return null;
  const cs=getComputedStyle(main);
  return{mainOverflowY:cs.overflowY,bodyOverflow:getComputedStyle(document.body).overflow,appHeight:(document.querySelector('.o7-app'))?.getBoundingClientRect().height||0,viewport:window.innerHeight};
 });
 if(!scrollOwners||!['auto','scroll'].includes(scrollOwners.mainOverflowY))throw new Error(`${label}: OMEGA7 main is not the page scroll owner: ${JSON.stringify(scrollOwners)}`);
 if(Math.abs(scrollOwners.appHeight-scrollOwners.viewport)>2)throw new Error(`${label}: shell escaped viewport: ${JSON.stringify(scrollOwners)}`);
 if(errors.length)throw new Error(`${label}: unhandled page errors: ${errors.join(' | ').slice(0,2400)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 await proveViewport(browser,'desktop',{width:1440,height:960});
 await proveViewport(browser,'mobile',{width:390,height:844});
 console.log('OMEGA7 R446 BROWSER PARITY PASS · 44/44 routes opened through OMEGA7 on desktop + mobile · six-domain shell controls work · one scroll owner · no blank/native-failure surfaces · no unhandled page errors');
}finally{await browser.close()}
