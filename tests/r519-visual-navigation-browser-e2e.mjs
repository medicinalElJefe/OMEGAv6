import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
const useFixtures=process.env.OMEGA_R519_USE_FIXTURES==='1';
async function prepare(page){
 if(!useFixtures)return;
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[]}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_R519_TEST_TRANSPORT_FIXTURE',nodes:[]}));
}
async function prove(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try{
  await prepare(page);
  await page.goto(base+'/?omega7=1&r519='+Date.now()+'-'+label,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  const nav=page.locator('.o7-nav-r519[data-design-revision="R519"]');
  await nav.waitFor({state:'visible'});
  if(await nav.locator('button').count()!==6)throw new Error(label+': six canonical navigation areas changed');
  const home=page.locator('.o7-home-established[data-r510-visual-restoration="CURRENT_R71_CANONICAL_HOME"]');
  await home.waitFor({state:'visible',timeout:30000});
  await home.locator('.r134-stage').waitFor({state:'visible',timeout:30000});
  await page.locator('.o7-r519-portal[data-r519-visual-navigation="HOME"]').waitFor({state:'visible',timeout:20000});
  await nav.getByRole('button',{name:'Explore'}).click();
  const portal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
  await portal.waitFor({state:'visible',timeout:20000});
  const nodes=portal.locator('button[data-r519-node]');
  if(await nodes.count()<5)throw new Error(label+': constellation lost registered routes');
  const atlasNode=portal.locator('button[data-r519-node="Atlas"]');
  await atlasNode.click();
  const focus=portal.locator('.o7-r519-inspector[data-r519-focus="Atlas"]');
  await focus.waitFor({state:'visible',timeout:10000});
  const text=await focus.innerText();
  if(!text.includes('State Atlas')||!text.includes('Source ready')&&!text.includes('Evidence gated')&&!text.includes('degraded'))throw new Error(label+': inspector not tied to atlas source state: '+text.slice(0,500));
  await portal.locator('button[data-r519-launch="Atlas"]').click();
  await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Atlas',{timeout:20000});
  await page.locator('.o7-native-host').waitFor({state:'visible',timeout:20000});
  if(await page.locator('.o7-native-failure').count())throw new Error(label+': source-linked Atlas launch crashed');
  await page.locator('.o7-native-toolbar button').first().click();
  await page.waitForFunction(()=>!document.querySelector('.o7-main')?.getAttribute('data-native-route'),{timeout:10000});
  const direct=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"] button[data-r519-direct="Earth Now"]');
  await direct.click();
  await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Earth Now',{timeout:20000});
  if(await page.locator('.o7-native-failure').count())throw new Error(label+': source-linked Earth Now shortcut crashed');
  const bounds=await page.evaluate(()=>{
   const nav=document.querySelector('.o7-nav-r519'),main=document.querySelector('.o7-main'),bar=document.querySelector('.o7-topbar');
   if(!nav||!main||!bar)return null;
   const n=nav.getBoundingClientRect(),m=main.getBoundingClientRect(),b=bar.getBoundingClientRect();
   return {bodyWidth:document.body.scrollWidth,viewport:innerWidth,navWidth:n.width,mainWidth:m.width,topbarHeight:b.height};
  });
  if(!bounds||bounds.bodyWidth>bounds.viewport+8||bounds.navWidth<150&&label==='desktop'||bounds.mainWidth<180)throw new Error(label+': responsive visual layout overflow: '+JSON.stringify(bounds));
  if(errors.length)throw new Error(label+': uncaught browser errors '+errors.join(' | ').slice(0,900));
  console.log('R519 '+label+' VISUAL INTERACTION PASS · 6 canonical domains · R71 HOME retained · geometry nodes focus source capability · Atlas/Earth launch · no viewport overflow');
 }finally{await context.close()}
}
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R519 requires full expected SHA');
 const response=await fetch(base+'/omega-build-receipt.json?r519='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw new Error('R519 promoted build receipt HTTP '+response.status);
 const receipt=await response.json();
 if(receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha||receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1')
  throw new Error('R519 promoted receipt does not attest expected exact SHA');
}
const browser=await chromium.launch({headless:true});
try{
 await prove(browser,'desktop',{width:1440,height:960});
 await prove(browser,'mobile',{width:390,height:844});
 console.log('R519 VISUAL NAVIGATION BROWSER PASS · '+(expectedSha?'promoted '+expectedSha:'candidate local build')+' · no new execution authority');
}finally{await browser.close()}
