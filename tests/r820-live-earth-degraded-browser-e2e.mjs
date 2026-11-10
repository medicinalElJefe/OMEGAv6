import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
assert.ok(base&&/^[a-f0-9]{40}$/i.test(expected),'R820 degraded browser requires URL and exact SHA');
const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{assert.ok(r.ok,'receipt HTTP '+r.status);return r.json()});
assert.equal(receipt?.promotion?.promotedMergeSha||receipt?.source?.sha,expected,'R820 live receipt SHA mismatch');
const fault={ok:false,code:'GIBS_GLOBAL_NO_VALID_OBSERVATION',requestedDate:'2026-11-09',attempts:[{date:'2026-11-09',code:'NO_VALID_OBSERVED_RASTER',bytes:1836,contentType:'image/jpeg'}],truth:'NO_SYNTHETIC_SUBSTITUTE'};
const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/api/earth/gibs/global?*',route=>route.fulfill({status:502,contentType:'application/json',body:JSON.stringify(fault)}));
  await page.goto(base+'/?omega6=1&r820-degraded='+name,{waitUntil:'domcontentloaded',timeout:45000});
  await page.getByLabel('Open Earth Now').click({timeout:20000});
  await page.waitForSelector('.earth-r279',{state:'visible',timeout:30000});
  await page.locator('.earth-r279-view-tabs button').filter({hasText:'Planet'}).first().click();
  const planet=page.locator('.earth-r281-globe[data-earth-view="PLANET"]');
  await planet.waitFor({state:'visible',timeout:20000});
  await page.waitForFunction(()=>document.querySelector('.earth-r281-globe')?.getAttribute('data-source-state')==='UNAVAILABLE',null,{timeout:30000});
  assert.equal(await planet.getAttribute('data-source-state'),'UNAVAILABLE');
  const text=await planet.innerText();
  assert.ok(text.includes('global observed image HTTP 502'),name+': external failure not displayed');
  assert.ok(!text.includes('OBSERVED TEXTURE'),name+': synthetic observation claim on fault');
  assert.equal(errors.length,0,name+': browser page errors '+errors.join(' | '));
  await context.close();
 }
 console.log('R820 LIVE DEGRADED EARTH BROWSER PASS · exact promoted SHA '+expected+' · injected NASA GIBS HTTP 502 remains UNAVAILABLE, never OBSERVED · desktop/mobile · no page errors · real observed imagery NOT CLAIMED');
}finally{await browser.close()}
