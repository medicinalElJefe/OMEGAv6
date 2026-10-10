import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const fixtures=process.env.OMEGA_R525_USE_FIXTURES==='1';
async function mockBoundedApis(page){
 if(!fixtures)return;
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}}));
 await page.route('**/api/restoration',r=>json(r,{status:'RETURNED',state:'RETURNED'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/hybrid/capabilities',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,operations:[],profiles:[],workspaceGovernor:{}}));
 await page.route('**/api/plugins**',r=>json(r,{plugins:[],status:'RETURNED'}));
 await page.route('**/api/archive**',r=>json(r,{items:[],count:0,status:'RETURNED'}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_R525_TEST_TRANSPORT_FIXTURE',nodes:[]}));
}
async function prove(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache'}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try{
  await mockBoundedApis(page);
  await page.goto(base+'/?omega7=1&r525='+Date.now()+'-'+label,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.locator('button[data-r520-full-library="open"]').click();
  const library=page.locator('.o7-r520-library');
  await library.waitFor({state:'visible',timeout:15000});
  await library.locator('button[data-r520-tab="RECOVERED"]').click();
  await library.getByRole('textbox',{name:'Search all functions'}).fill('SOMA');
  const group=library.locator('.o7-r520-group-title');
  for(let i=0;i<await group.count();i++){if(await group.nth(i).getAttribute('aria-expanded')!=='true')await group.nth(i).click()}
  const soma=library.locator('[data-r520-recovered="SOMA"]');
  await soma.waitFor({state:'visible',timeout:15000});
  if(!(await soma.innerText()).includes('SONIFY_CANONICAL_PACKET'))throw new Error(label+': SOMA identity/operation missing');
  await soma.getByRole('button',{name:'Open successor'}).click();
  await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='System Atlas',{timeout:20000});
  const engine=page.locator('.soma-audio-r45');
  await engine.waitFor({state:'visible',timeout:30000});
  if(await page.locator('.o7-native-failure').count())throw new Error(label+': System Atlas executor failed');
  const family=page.locator('.atlas-r1-families button.active');
  if(!(await family.innerText()).includes('S17'))throw new Error(label+': recovered SOMA launch did not select S17');
  if(await engine.getAttribute('data-soma-output-proven')!=='false')throw new Error(label+': audio autoplay/receipt without operator gesture');
  await engine.getByRole('button',{name:'Start audio'}).click();
  await page.waitForFunction(()=>document.querySelector('.soma-audio-r45')?.getAttribute('data-soma-output-proven')==='true',{timeout:15000});
  const receipt=JSON.parse(await engine.getAttribute('data-soma-execution-receipt'));
  if(receipt.schema!=='OMEGA_SOMA_WEB_AUDIO_OPERATION_R525'||receipt.contextState!=='running'||receipt.oscillators!==12||!(receipt.rms>0.000001)||receipt.outputDetected!==true||receipt.deviceAuthority!==false)
   throw new Error(label+': Web Audio operation/output/authority receipt invalid: '+JSON.stringify(receipt));
  await engine.getByRole('button',{name:'Stop',exact:true}).click();
  if(await engine.getAttribute('data-soma-output-proven')!=='false')throw new Error(label+': stop failed to revoke active output receipt');
  if(errors.length)throw new Error(label+': browser errors '+errors.join(' | ').slice(0,1000));
  console.log('R525 '+label+' SOMA PASS · recovered deep link → S17 → explicit Start → 12 oscillators → running AudioContext → measured analyser output → local receipt → Stop');
 }finally{await context.close()}
}
const browser=await chromium.launch({headless:true});
try{await prove(browser,'desktop',{width:1440,height:960});await prove(browser,'mobile',{width:390,height:844})}
finally{await browser.close()}
