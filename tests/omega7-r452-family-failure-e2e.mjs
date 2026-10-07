import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const families=[
 ['COMMAND_RUNTIME','Command Center','Earth Now'],
 ['EARTH_WEATHER','Earth Now','Command Center'],
 ['MOTION_TRAVERSAL','Traversal','Earth Now'],
 ['SCIENCE_RELATIVITY_ATLAS','Relativity','Earth Now'],
 ['FORECAST_VISUAL_FIELD','Forecast','Earth Now'],
 ['WORK_CREATE_CONTINUITY','Workspace','Earth Now'],
 ['DEVELOPMENT_COMPUTE','Hybrid Link','Earth Now'],
 ['SYSTEM_EVIDENCE_GOVERNANCE','Evidence & Proof','Earth Now']
];

async function mocks(page){
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}}));
 await page.route('**/api/restoration',r=>json(r,{status:'RETURNED'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/hybrid/capabilities',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{}}));
 await page.route('**/api/earth/noaa/catalog',r=>json(r,{schema:'OMEGA_EARTH_NOAA_CATALOG_V1',coverages:[{id:'R452_FAILURE'}]}));
 await page.route('**/api/route-preview',r=>json(r,{route:'FAST_DETERMINISTIC'}));
 await page.route('**/api/chat',r=>json(r,{reply:'R452 deterministic failure fixture',provider:'R452_FIXTURE',modelInvoked:false}));
 await page.route('**/api/plugins**',r=>json(r,{plugins:[],status:'RETURNED'}));
 await page.route('**/api/archive**',r=>json(r,{items:[],count:0,status:'RETURNED'}));
}

async function openRoute(page,route){
 await page.locator('.o7-search-trigger').click();
 const input=page.locator('.o7-command input');
 await input.fill(route);
 const result=page.locator(`[data-command-route="${route}"]`);
 await result.waitFor({state:'visible',timeout:10000});
 await result.click();
 await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:15000});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:15000});
}

async function proveFamilyFailure(browser,family,route,recovery){
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await mocks(page);
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 // R502 HOME now intentionally preloads the Earth visual family. Failure injection must
 // target the requested family's next lazy script, not a family already admitted by HOME.
 await page.waitForTimeout(800);

 let injected=false;
 await page.route('**/assets/*.js',async requestRoute=>{
  if(!injected&&requestRoute.request().resourceType()==='script'){
   injected=true;
   await requestRoute.abort('failed');
   return;
  }
  await requestRoute.continue();
 });

 await openRoute(page,route);
 const failure=page.locator('[data-omega7-failure]');
 await failure.waitFor({state:'visible',timeout:20000});
 const failureText=await failure.innerText();
 if(!failureText.includes('Your OMEGA state was not discarded.'))throw new Error(`${family}: missing preserved-state failure message`);
 if(!await page.locator('.o7-app').isVisible())throw new Error(`${family}: shell died after family chunk failure`);
 if(!injected)throw new Error(`${family}: no lazy family chunk was intercepted`);

 await page.unroute('**/assets/*.js');
 await page.locator('.o7-native-toolbar button').first().click();
 await page.waitForFunction(()=>!document.querySelector('.o7-main')?.getAttribute('data-native-route'),{timeout:10000});
 await openRoute(page,recovery);
 await page.waitForFunction(()=>Boolean(document.querySelector('.o7-native-workspace'))&&!document.querySelector('.o7-native-loading')&&!document.querySelector('[data-omega7-failure]'),{timeout:25000});
 if(errors.length>1)throw new Error(`${family}: repeated unhandled page errors ${errors.join(' | ').slice(0,1200)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 for(const [family,route,recovery] of families)await proveFamilyFailure(browser,family,route,recovery);
 console.log('OMEGA7 R452 FAMILY FAILURE PASS · 8/8 native family lazy boundaries fail isolated · shell survives · state-preservation message retained · alternate native route recovers');
}finally{await browser.close()}
