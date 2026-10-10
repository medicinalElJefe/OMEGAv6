import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
const useFixtures=process.env.OMEGA_R525_USE_FIXTURES==='1';
async function prepare(page){
 if(!useFixtures)return;
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[]}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_R525_TEST_TRANSPORT_FIXTURE',nodes:[]}));
}
async function prove(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await prepare(page);
  await page.goto(base+'/?omega7=1&r525='+Date.now()+'-'+label,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
  const portal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
  await portal.waitFor({state:'visible',timeout:18000});
  await portal.locator('button[data-r519-node="Atlas"]').click();
  await portal.locator('.o7-r519-inspector[data-r519-focus="Atlas"]').waitFor({state:'visible',timeout:10000});
  await portal.locator('button[data-r519-launch="Atlas"]').click();
  const native=page.locator('.o7-science-workspace[data-route="Atlas"]');
  await native.waitFor({state:'visible',timeout:28000});
  const open=native.locator('.o7-open-instrument');
  if(await open.count())await open.click();
  const sphere=native.locator('[data-r525-sphere="OMEGA_FULL_SPHERE_ARCHIVE_GRAMMAR_R525"]');
  await sphere.waitFor({state:'visible',timeout:20000});
  if(await sphere.locator('[data-r525-shell]').count()!==3||await sphere.locator('line[data-r525-edge]').count()!==90)throw new Error(label+': 3 genuine nested 20-vertex/30-edge shells not rendered');
  if(!(await native.locator('canvas').count()))throw new Error(label+': prior original AtlasViewport canvas was lost');
  const words=await sphere.innerText();
  if(!words.includes('not an observation')&& !words.includes('Observation is not inferred'))throw new Error(label+': epistemic projection disclosure missing');
  if(!words.includes('No physics units')||!words.includes('historical six-video grammar'))throw new Error(label+': false historical/source claims');
  const rect=await sphere.boundingBox();
  if(!rect||rect.width<245||rect.x<0||rect.x+rect.width>viewport.width+4)throw new Error(label+': responsive Full Sphere instrument geometry invalid '+JSON.stringify(rect));
  const first=sphere.locator('line[data-r525-edge]').first();
  const before=await first.getAttribute('x1');
  await sphere.locator('input[aria-label="Full Sphere observer rotation"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(before=>{
   const el=document.querySelector('line[data-r525-edge]');
   return Boolean(el&&el.getAttribute('x1')!==before);
  },before,{timeout:7000});
  const after=await first.getAttribute('x1');
  if(before===after)throw new Error(label+': rotation control did not change projected geometry');
  const start=Number(await sphere.getAttribute('data-r525-active-address'));
  const hit=sphere.locator('[data-r525-action="antipode"]');
  await hit.click();
  await page.waitForFunction(start=>Number(document.querySelector('[data-r525-sphere]')?.getAttribute('data-r525-active-address'))!==start,start,{timeout:15000});
  const anti=Number(await sphere.getAttribute('data-r525-active-address'));
  if(anti===start)throw new Error(label+': exact antipode did not actuate shared atlas state');
  if(Number(await native.getAttribute('data-address'))!==anti)throw new Error(label+': model update did not reach canonical Atlas address binding');
  await hit.click();
  await page.waitForFunction(start=>Number(document.querySelector('[data-r525-sphere]')?.getAttribute('data-r525-active-address'))===start,start,{timeout:10000});
  if(Number(await sphere.getAttribute('data-r525-active-address'))!==start)throw new Error(label+': antipodal involution failed through real UI clicks');
  await sphere.locator('button[data-r525-time="HISTORY"]').click();
  const history=Number(await sphere.getAttribute('data-r525-active-address'));
  if(history!==(start+20735)%20736)throw new Error(label+': historical *address* topology did not move to previous indexed state');
  if(!(await sphere.innerText()).includes('NOT an observation of historical time'))throw new Error(label+': history confused with temporal observation');
  await sphere.locator('button[data-r525-time="FORECAST"]').click();
  if(!(await sphere.innerText()).includes('No external future measurement'))throw new Error(label+': model forecast confused with observed future');
  await sphere.locator('button[data-r525-time="NOW"]').click();
  await sphere.locator('button[data-r525-lens="SCAR"]').click();
  if(await sphere.locator('button[data-r525-lens="SCAR"]').getAttribute('aria-pressed')!=='true')throw new Error(label+': scar projection control did not update');
  await sphere.locator('button[data-r525-motion="paused"]').click();
  await sphere.locator('button[data-r525-motion="playing"]').waitFor({state:'visible',timeout:3000});
  await sphere.locator('button[data-r525-motion="playing"]').click();
  if(!(await sphere.locator('button[data-r525-motion="paused"]').count()))throw new Error(label+': source projection did not pause');
  if(errors.length)throw new Error(label+': uncaught R525 browser errors '+errors.join(' | ').slice(0,700));
  console.log('R525 '+label+' FULL SPHERE OPERATION PASS · 3 nested 30-edge true meshes · rotation motion · exact antipode twice · history/forecast boundaries · prior Atlas preserved');
 }finally{await context.close()}
}
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R525 exact promoted SHA must be full commit');
 const response=await fetch(base+'/omega-build-receipt.json?r525='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw new Error('R525 production build receipt HTTP '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw new Error('R525 live source/promoted receipt mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 await prove(browser,'desktop',{width:1440,height:960});
 await prove(browser,'mobile',{width:390,height:844});
 console.log('R525 FULL SPHERE BROWSER PASS · typed original geometry + existing Atlas state; no native/historical video fidelity claims');
}finally{await browser.close()}
