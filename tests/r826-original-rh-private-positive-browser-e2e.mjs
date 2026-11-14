/**
 * R826: opt-in private original-source positive browser witness.
 *
 * Needs the original workbook on THIS machine. Its bytes are handed only to
 * Playwright's local browser file input, never to GitHub, CI, or the Worker.
 * Standard CI must NEVER set OMEGA_RH_ORIGINAL_XLSX_PATH.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const workbookPath=process.env.OMEGA_RH_ORIGINAL_XLSX_PATH;
const expectedSha=process.env.OMEGA_EXPECTED_SHA?.trim()||'';
const base=(process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
if(!workbookPath||!base||!/^[a-f0-9]{40}$/.test(expectedSha))
 throw Error('R826 requires OMEGA_RH_ORIGINAL_XLSX_PATH, OMEGA_E2E_URL and an exact OMEGA_EXPECTED_SHA');
const origin=new URL(base);
const localHost=['localhost','127.0.0.1'].includes(origin.hostname);
if(!((origin.protocol==='https:'&&origin.hostname==='omegav6.jeffdeweyeljefe.workers.dev')||
     (origin.protocol==='http:'&&localHost)))
 throw Error('R826 refuses unapproved browser host; use canonical HTTPS Worker or localhost preview');
const source=await readFile(new URL('../src7/workspaces/historicalRHSourceR823.ts',import.meta.url),'utf8');
const sourceSha=/export const R823_ORIGINAL_WORKBOOK_SHA256='([a-f0-9]{64})'/.exec(source)?.[1];
const sourceBytes=Number(/export const R823_ORIGINAL_WORKBOOK_BYTES=(\d+)/.exec(source)?.[1]);
if(!sourceSha||!Number.isSafeInteger(sourceBytes))throw Error('R826 original source-admission constants unavailable');
const original=await readFile(workbookPath);
const originalSha=createHash('sha256').update(original).digest('hex');
if(original.byteLength!==sourceBytes||originalSha!==sourceSha)
 throw Error('R826 private workbook is not the exact admitted original; no browser selection attempted');

async function assertExactReceipt(){
 const response=await fetch(base+'/omega-build-receipt.json?r826='+Date.now(),{
  headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(15000)
 });
 if(!response.ok)throw Error('R826 build receipt HTTP '+response.status);
 const r=await response.json();
 if(r?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||
    r?.source?.sha!==expectedSha||r?.promotion?.promotedMergeSha!==expectedSha)
  throw Error('R826 source or promoted merge does not match the explicitly pinned SHA');
}
await assertExactReceipt();
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});
  const errors=[];
  const networkViolations=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?omega7=1&r826='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
  const enter=async()=>{
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Create'}).click();
   await page.locator('.o7-r519-portal[data-r519-visual-navigation="CREATE"] button[data-r519-direct="Visual Instrument"]').click();
   const workspace=page.locator('[data-omega7-native="forecast.visual"][data-route="Visual Instrument"]');
   await workspace.waitFor({state:'visible',timeout:30000});
   await workspace.locator('[data-r621-historical-rh-entry="true"]').getByRole('button',{name:'Open Historical RH Graph'}).click();
   const instrument=workspace.locator('[data-r621-historical-rh-graph="true"]');
   await instrument.waitFor({state:'visible',timeout:15000});
   return instrument;
  };
  let instrument=await enter();
  const status=()=>instrument.locator('[data-r823-import-status]');
  assert.equal(await status().getAttribute('data-r823-import-status'),'PREVIEW_ONLY',label+' must start unadmitted');
  let watchImport=false;
  await page.route('**/*',async route=>{
   const req=route.request(),method=req.method(),url=req.url();
   if(watchImport&&(!['GET','HEAD'].includes(method)||url.length>2048)){
    networkViolations.push(method+' '+new URL(url).origin);
    await route.abort();
    return;
   }
   await route.continue();
  });
  const input=()=>instrument.locator('[data-r823-original-workbook-input="true"]');
  watchImport=true;
  await input().setInputFiles({name:'original-v21-rh.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:original});
  await instrument.locator('[data-r823-import-status="VERIFIED_FULL_LOCAL"]').waitFor({state:'visible',timeout:45000});
  assert.match(await status().innerText(),/ORIGINAL-SHA MATCHED.*320 RH concepts.*25 distinct addresses.*416 typed edges/,label+' source admission incomplete');
  assert.equal(networkViolations.length,0,label+' attempted network writes or oversized URL during private import');
  // R827: execute the verified-original concept lookup, not just source text checks.
  const lookup=instrument.locator('[data-r827-concept-lookup="true"]');
  await lookup.waitFor({state:'visible',timeout:12000});
  await lookup.getByRole('searchbox',{name:'Find verified RH concept'}).fill('RH0001');
  const result=lookup.locator('[data-r827-concept-results] button');
  await result.first().waitFor({state:'visible',timeout:12000});
  assert.match(await result.first().innerText(),/RH0001/,label+' original identity lookup missing');
  await result.first().click();
  await page.waitForFunction(()=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')==='5990',null,{timeout:12000});
  assert.equal(await page.evaluate(()=>localStorage.getItem('omega.v6.address')),'5990',label+' R827 concept navigation not persisted through canonical address authority');
  await lookup.getByRole('searchbox',{name:'Find verified RH concept'}).fill('NO_SUCH_RH_CONCEPT');
  assert.equal(await lookup.locator('[data-r827-concept-results] button').count(),0,label+' invented original concept matches');
  const setAddress=async value=>{
   await page.evaluate(n=>{
    localStorage.setItem('omega.v6.address',String(n));
    window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:n}}));
   },value);
   await page.waitForFunction(n=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')===String(n),value,{timeout:12000});
  };
  await setAddress(5990);
  const multiple=instrument.locator('[data-r823-address-multiplicity="true"]');
  await multiple.waitFor({state:'visible',timeout:12000});
  await instrument.locator('[data-r621-edge="E00001"]').waitFor({state:'visible',timeout:12000});
  assert.match(await instrument.locator('[data-r621-edge="E00001"]').innerText(),/antipode_state.*weight 0\.2/,label+' original antipode edge missing');
  await instrument.locator('[data-r823-typed-filter="true"]').selectOption('prereq');
  await setAddress(18602);
  const prereq=instrument.locator('[data-r621-edge="E00011"]');
  await prereq.waitFor({state:'visible',timeout:12000});
  assert.match(await prereq.innerText(),/prereq.*weight 1/,label+' original prerequisite edge missing');
  await prereq.getByRole('button',{name:'Traverse E00011 to address 18086'}).click();
  await page.waitForFunction(()=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')==='18086',null,{timeout:12000});
  assert.equal(await page.evaluate(()=>localStorage.getItem('omega.v6.address')),'18086',label+' canonical address not carried');
  await instrument.getByRole('button',{name:'Clear imported graph'}).click();
  assert.equal(await status().getAttribute('data-r823-import-status'),'PREVIEW_ONLY',label+' local graph not cleared');
  assert.equal(await instrument.locator('[data-r823-address-multiplicity]').count(),0,label+' private graph survived explicit clear');
  assert.equal(await instrument.locator('[data-r827-concept-lookup]').count(),0,label+' R827 full-source lookup survived explicit clear');
  watchImport=true;
  await input().setInputFiles({name:'original-v21-rh.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:original});
  await instrument.locator('[data-r823-import-status="VERIFIED_FULL_LOCAL"]').waitFor({state:'visible',timeout:45000});
  watchImport=false;
  await page.reload({waitUntil:'domcontentloaded',timeout:45000});
  instrument=await enter();
  assert.equal(await status().getAttribute('data-r823-import-status'),'PREVIEW_ONLY',label+' private workbook was persisted across reload');
  assert.equal(await instrument.locator('[data-r823-address-multiplicity]').count(),0,label+' full graph survived reload');
  assert.deepEqual(networkViolations,[],label+' browser emitted a non-read request during import');
  assert.deepEqual(errors,[],label+' page errors');
  await page.close();
  // Count-only and fingerprint-only receipt; no donor bytes, names or local paths.
  console.log('R826 '+label+' ORIGINAL-SHA_BROWSER_POSITIVE PASS · 320/25/416 · exact merge '+expectedSha+' · no non-read network requests');
 }
 await assertExactReceipt();
 console.log('R826 ORIGINAL RH PRIVATE POSITIVE IMPORT PASS · source SHA '+sourceSha+' · desktop+mobile · ephemeral in-browser only');
}finally{
 await browser.close();
}
