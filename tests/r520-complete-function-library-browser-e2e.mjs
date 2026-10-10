import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
const useFixtures=process.env.OMEGA_R520_USE_FIXTURES==='1';
async function mockBoundedApis(page){
 if(!useFixtures)return;
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}}));
 await page.route('**/api/restoration',r=>json(r,{status:'RETURNED',state:'RETURNED'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/hybrid/capabilities',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{}}));
 await page.route('**/api/plugins**',r=>json(r,{plugins:[],status:'RETURNED'}));
 await page.route('**/api/archive**',r=>json(r,{items:[],count:0,status:'RETURNED'}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_R520_TEST_TRANSPORT_FIXTURE',nodes:[]}));
}
async function check(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await mockBoundedApis(page);
  await page.goto(base+'/?omega7=1&r520='+Date.now()+'-'+label,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  const trigger=page.locator('button[data-r520-full-library="open"]');
  await trigger.waitFor({state:'visible',timeout:20000});
  await trigger.click();
  const pane=page.locator('.o7-r520-library[aria-label="OMEGA complete function library"]');
  await pane.waitFor({state:'visible',timeout:15000});
  if(!(await pane.innerText()).includes('44 Current tools')||!(await pane.innerText()).includes('72 Recovered lineages')||!(await pane.innerText()).includes('100 Historical systems'))throw new Error(label+': one or more source-inventory counts are hidden');
  async function expandAll(){
   const toggles=pane.locator('.o7-r520-group-title');
   const n=await toggles.count();
   if(n<1)throw new Error(label+': function source group empty');
   for(let i=0;i<n;i++){
    const button=toggles.nth(i);
    if(await button.getAttribute('aria-expanded')!=='true')await button.click();
   }
  }
  await expandAll();
  const routeIds=await pane.locator('[data-r520-route]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-r520-route')));
  if(routeIds.length!==44||new Set(routeIds).size!==44)throw new Error(label+': route library omission/duplication: '+routeIds.length);
  for(const route of ['Matter Traversal','Atlas','Earth Now','Forecast','System Atlas','Archive Operators','Hybrid Link','Modes','Visual Instrument']){
   if(!routeIds.includes(route))throw new Error(label+': critical historical current route missing '+route);
  }
  await pane.locator('button[data-r520-tab="RECOVERED"]').click();
  await expandAll();
  const recoveredIds=await pane.locator('[data-r520-recovered]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-r520-recovered')));
  if(recoveredIds.length!==72||new Set(recoveredIds).size!==72)throw new Error(label+': R486 source lineage hidden: '+recoveredIds.length);
  await pane.locator('button[data-r520-tab="HISTORY"]').click();
  await expandAll();
  const historicalIds=await pane.locator('[data-r520-historical]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-r520-historical')));
  if(historicalIds.length!==100||new Set(historicalIds).size!==100)throw new Error(label+': R83 historical source inventory hidden: '+historicalIds.length);
  const donor=pane.locator('[data-r520-state="archive_only"]').first();
  if(await donor.count()===0||!(await donor.innerText()).includes('Inspect lineage'))throw new Error(label+': historical donor masquerading as executable');
  const search=pane.getByRole('textbox',{name:'Search all functions'});
  await search.fill('Omega Atlas Desktop');
  const selected=pane.locator('[data-r520-historical="SYS-002"]');
  await selected.waitFor({state:'visible',timeout:10000});
  if(!(await selected.innerText()).includes('Omega Atlas Desktop'))throw new Error(label+': remembered historical name cannot be recovered');
  await search.fill('');
  for(const [tab,attr,expected] of [['OPTIONS','data-r520-option',36],['CONTRACTS','data-r520-contract',18]]){
    await pane.locator('button[data-r520-tab="'+tab+'"]').click();
    await expandAll();
    const ids=await pane.locator('['+attr+']').evaluateAll((nodes,key)=>nodes.map(n=>n.getAttribute(key)),attr);
    if(ids.length!==expected||new Set(ids).size!==expected)throw new Error(label+': missing historical '+tab+' source entries: '+ids.length);
  }
  await pane.locator('button[data-r520-tab="ROUTES"]').click();
  await pane.getByRole('combobox',{name:'Filter function group'}).selectOption('EXPLORE');
  await expandAll();
  const atlas=pane.locator('[data-r520-route="Atlas"]');
  await atlas.getByRole('button',{name:'Open State Atlas',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Atlas',{timeout:20000});
  if(await page.locator('.o7-r520-library').count())throw new Error(label+': drawer left open over running Atlas');
  await page.locator('.o7-native-host').waitFor({state:'visible',timeout:20000});
  if(await page.locator('.o7-native-failure').count())throw new Error(label+': recovered menu route opens broken Atlas');
  if(errors.length)throw new Error(label+': uncaught browser error '+errors.join(' | ').slice(0,1200));
  console.log('R520 '+label+' COMPLETE FUNCTION LIBRARY PASS · 44 routes · 72 lineages · 100 historical records · source filters · archived donor disclosure · remembered-name search · real Atlas launch');
 }finally{await context.close()}
}
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R520 expected SHA must be full hexadecimal commit');
 const response=await fetch(base+'/omega-build-receipt.json?r520='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw new Error('R520 exact promoted build receipt HTTP '+response.status);
 const receipt=await response.json();
 if(receipt.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw new Error('R520 exact source/promoted build receipt mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 await check(browser,'desktop',{width:1440,height:960});
 await check(browser,'mobile',{width:390,height:844});
 console.log('R520 ALL FUNCTIONS BROWSER PASS · source inventories are not claims that all historical software executes');
}finally{await browser.close()}
