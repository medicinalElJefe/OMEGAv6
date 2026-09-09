import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
const MUTATING=new Set(['POST','PUT','PATCH','DELETE']);
const INHERITED_PROOF_TELEMETRY=new Set(['/api/proof/packet','/api/proof/delta','/api/proof/performance']);
const R245_REFRESH_GETS=new Set([
 '/api/core-health','/api/system/operational','/api/system/convergence','/api/hybrid/status','/api/hybrid/connector-manifest','/omega-r170-selfbuild-state.json','/omega-build-receipt.json'
]);
const pathOf=url=>{try{return new URL(url).pathname}catch{return url}};

async function openSystemAtlas(page,name){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count()&&await expand.first().isVisible())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000}).catch(()=>{});
 const opened=await page.evaluate(()=>{
  const buttons=[...document.querySelectorAll('.r89-flat-route')];
  const button=buttons.find(x=>x.querySelector('b')?.textContent?.trim()==='System Atlas');
  if(!button)return false;
  button.click();return true;
 });
 if(!opened)throw new Error(`${name}: System Atlas route control missing`);
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='System Atlas',{timeout:30000});
 await page.waitForSelector('.r245-canon[data-r245-full-overall-canon="true"]',{state:'visible',timeout:30000});
}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[],traffic=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  page.on('request',request=>traffic.push({method:request.method(),url:request.url(),path:pathOf(request.url())}));
  await page.goto(`${base}/?r245=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});

  const openingStart=traffic.length;
  await openSystemAtlas(page,name);
  await page.waitForLoadState('networkidle',{timeout:5000}).catch(()=>{});
  await page.waitForTimeout(500);
  const openingTraffic=traffic.slice(openingStart),openingMutations=openingTraffic.filter(x=>MUTATING.has(x.method));
  const foreignOpeningMutations=openingMutations.filter(x=>!INHERITED_PROOF_TELEMETRY.has(x.path));
  if(foreignOpeningMutations.length)throw new Error(`${name}: opening System Atlas emitted non-proof mutation outside the inherited R52/R53/R55 telemetry plane: ${foreignOpeningMutations.map(x=>`${x.method} ${x.url}`).join(' | ')}`);

  const before=Number(await page.locator('.r245-canon').getAttribute('data-r245-epoch')||0);
  const snapshot=await page.evaluate(()=>{
   const root=document.querySelector('.r245-canon');if(!root)return null;
   const axes=[...root.querySelectorAll('.r245-axis-strip b')].map(x=>x.textContent?.trim());
   const organs=[...root.querySelectorAll('.r245-organs span')].map(x=>x.textContent?.trim());
   const levels=[...root.querySelectorAll('.r245-levels article strong')].map(x=>x.textContent?.trim());
   const authority=root.querySelector('.r245-authority')?.textContent||'';
   const body=root.textContent||'';
   return{
    readOnly:root.getAttribute('data-r245-read-only'),axes,organs,levels,authority,body,
    r153:Boolean(document.querySelector('.r153-completion-executor')),
    overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth
   };
  });
  if(!snapshot)throw new Error(`${name}: R245 Full Overall Canon surface missing`);
  if(snapshot.readOnly!=='true')throw new Error(`${name}: R245 read-only identity missing`);
  if(JSON.stringify(snapshot.axes)!==JSON.stringify(['STATE','RELATION','MEMORY','COMPUTATION','OBSERVATION','ACTION','PROOF']))throw new Error(`${name}: R245 seven Canon axes regressed ${JSON.stringify(snapshot.axes)}`);
  if(snapshot.organs.length!==12)throw new Error(`${name}: R245 expected 12 first-level organs, got ${snapshot.organs.length}`);
  for(const level of ['12','144','1,728','20,736','248,832'])if(!snapshot.levels.includes(level))throw new Error(`${name}: R245 scheduler level ${level} missing`);
  for(const token of ['FULL OVERALL CANON','not physical dimension count','R125 admission','ci.yml production writer'])if(!snapshot.body.includes(token))throw new Error(`${name}: R245 truth/authority token missing: ${token}`);
  if(!snapshot.r153)throw new Error(`${name}: R245 replaced or obscured the existing R153 governed executor`);
  if(snapshot.overflow>12)throw new Error(`${name}: R245 introduced viewport overflow ${snapshot.overflow}px`);

  // Establish a causal boundary after the host surface and its pre-existing proof telemetry settle.
  const refreshStart=traffic.length;
  const refresh=page.getByRole('button',{name:/Refresh exact observation/i}).first();
  await refresh.click();
  await page.waitForFunction(previous=>Number(document.querySelector('.r245-canon')?.getAttribute('data-r245-epoch')||0)>Number(previous),before,{timeout:30000});
  await page.waitForTimeout(250);
  const refreshTraffic=traffic.slice(refreshStart),refreshMutations=refreshTraffic.filter(x=>MUTATING.has(x.method));
  if(refreshMutations.length)throw new Error(`${name}: the R245 manual observation transaction emitted a mutating request: ${refreshMutations.map(x=>`${x.method} ${x.url}`).join(' | ')}`);
  const refreshGets=new Set(refreshTraffic.filter(x=>x.method==='GET').map(x=>x.path));
  const missingGets=[...R245_REFRESH_GETS].filter(path=>!refreshGets.has(path));
  if(missingGets.length)throw new Error(`${name}: R245 refresh did not issue its complete seven-source GET epoch: ${missingGets.join(', ')}`);

  if(pageErrors.length)throw new Error(`${name}: R245 browser page errors: ${pageErrors.join(' | ')}`);
  await context.close();
 }
 console.log('OMEGA R245 BROWSER PASS · desktop/mobile System Atlas → Full Overall Canon · exact seven axes · 12 organs · 12→144→1,728→20,736→248,832 logical scheduler · R153 preserved · inherited R52/R53/R55 proof telemetry causally separated · manual R245 seven-source observation epoch GET-only · no execution/Hybrid/Canon mutation · no viewport overflow');
}finally{await browser.close()}
