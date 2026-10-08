import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=String(process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(!/^https:\/\//i.test(base))throw new Error('R512 candidate Preview requires an HTTPS Cloudflare Preview URL');
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('R512 requires exact candidate SHA');

const receiptResponse=await fetch(`${base}/omega-build-receipt.json?r512=${Date.now()}`,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
const receiptRaw=await receiptResponse.text();
if(!receiptResponse.ok)throw new Error(`R512 candidate receipt HTTP ${receiptResponse.status}: ${receiptRaw.slice(0,400)}`);
const receipt=JSON.parse(receiptRaw);
assert.equal(receipt?.schema,'OMEGA_GOVERNED_BUILD_RECEIPT_V1');
assert.equal(receipt?.source?.sha,expected,'Preview must serve exact PR-head source SHA');
assert.equal(receipt?.promotion?.candidateSha,expected,'Preview receipt must identify exact candidate head');
assert.equal(receipt?.promotion?.promotedMergeSha,null,'Preview must not impersonate a promoted merge');
assert.equal(receipt?.promotion?.rollbackSha,null,'Preview must not claim production rollback lineage');
assert.equal(receipt?.deployment?.publicWorkerMutationAuthority,false);

const healthResponse=await fetch(`${base}/api/core-health?r512=${Date.now()}`,{headers:{'cache-control':'no-cache'}});
const healthRaw=await healthResponse.text();
if(!healthResponse.ok)throw new Error(`R512 Preview core health HTTP ${healthResponse.status}: ${healthRaw.slice(0,400)}`);
const health=JSON.parse(healthRaw);
assert.equal(health?.schema,'OMEGA_CANONICAL_CORE_HEALTH_R163');
assert.equal(health?.state,'LIVE');
assert.equal(health?.ok,true);

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
  const page=await context.newPage(),pageErrors=[],assetFailures=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('requestfailed',request=>{if(/\/assets\/.*\.(?:js|css)(?:\?|$)/i.test(request.url()))assetFailures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText||'FAILED'}`)});
  page.on('response',response=>{if(response.status()>=400&&/\/assets\/.*\.(?:js|css)(?:\?|$)/i.test(response.url()))assetFailures.push(`${response.status()} ${response.url()}`)});

  await page.goto(`${base}/?omega7=1&r512=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  if(await page.locator('main.r71-home').count())throw new Error(`${label}: candidate Preview fell back to plain OMEGA6`);
  if(await page.locator('.o7-home-actions').count())throw new Error(`${label}: deprecated OMEGA7 button-board HOME resurfaced`);

  const home=page.locator('.o7-home-established[data-r510-visual-restoration="CURRENT_R71_CANONICAL_HOME"]');
  await home.waitFor({state:'visible',timeout:30000});
  await home.locator('.r134-stage').waitFor({state:'visible',timeout:30000});
  await home.locator('canvas[aria-label="GPU woven 4-coordinate relational continuum"]').waitFor({state:'visible',timeout:30000});

  const recovered=page.locator('.o7-recovered[data-r486-visible-convergence="true"]');
  await recovered.waitFor({state:'visible',timeout:20000});
  const initial=(await recovered.innerText()).toLowerCase();
  for(const token of ['recovered capability fabric','browse recovered capabilities','execute now','active adapters','truth/device gated','bound to current routes']){
   if(!initial.includes(token))throw new Error(`${label}: candidate Preview missing visible recovered-fabric token ${token}`);
  }
  const summary=await recovered.locator('.o7-recovered-summary article b').allTextContents();
  if(summary.length!==4)throw new Error(`${label}: recovered summary count ${summary.length} != 4`);
  const parts=String(summary[3]).split('/').map(Number),routable=parts[0],total=parts[1];
  if(!Number.isFinite(routable)||!Number.isFinite(total)||total<40||routable!==total)throw new Error(`${label}: invalid recovered routability ${JSON.stringify(summary)}`);

  await recovered.getByRole('button',{name:'Browse recovered capabilities',exact:true}).click();
  const nav=recovered.getByRole('navigation',{name:'Recovered capability groups'});
  await nav.waitFor({state:'visible',timeout:10000});
  for(const group of ['All','Understand','Explore','Create','Build','Work','Recover']){
   if(!(await nav.getByRole('button',{name:group,exact:true}).isVisible()))throw new Error(`${label}: recovered group ${group} missing`);
  }
  await nav.getByRole('button',{name:'All',exact:true}).click();
  await page.waitForFunction(expected=>document.querySelectorAll('.o7-recovered-grid > article').length===expected,total,{timeout:15000});

  const geometry=await page.evaluate(()=>{
   const h=document.querySelector('.o7-home-established')?.getBoundingClientRect();
   const f=document.querySelector('.o7-home-established .r134-stage')?.getBoundingClientRect();
   const r=document.querySelector('.o7-recovered[data-r486-visible-convergence="true"]')?.getBoundingClientRect();
   return h&&f&&r?{homeBottom:h.bottom,recoveredTop:r.top,fieldHeight:f.height,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth}:null;
  });
  if(!geometry)throw new Error(`${label}: candidate Preview geometry unavailable`);
  if(geometry.recoveredTop<geometry.homeBottom-8)throw new Error(`${label}: recovered fabric overlaps/replaces visual HOME ${JSON.stringify(geometry)}`);
  if(geometry.fieldHeight<Math.min(360,viewport.height*.42))throw new Error(`${label}: visual field is not dominant ${JSON.stringify(geometry)}`);
  if(geometry.overflow>12)throw new Error(`${label}: horizontal overflow ${geometry.overflow}px`);

  if(pageErrors.length)throw new Error(`${label}: candidate Preview page errors ${pageErrors.join(' | ').slice(0,2400)}`);
  if(assetFailures.length)throw new Error(`${label}: candidate Preview asset failures ${assetFailures.join(' | ').slice(0,3000)}`);
  await context.close();
 }
}finally{await browser.close()}

console.log(`R512 EXACT CANDIDATE PREVIEW PASS · ${expected} · Cloudflare-isolated runtime + candidate-owned assets + R510 visual HOME + R486 recovered fabric desktop/mobile · no production promotion claimed`);
