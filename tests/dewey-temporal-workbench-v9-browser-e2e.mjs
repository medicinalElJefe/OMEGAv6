import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {verifyTemporalWorkbenchV9} from '../src/proof/deweyTemporalWorkbenchRuntimeV9.js';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('V9 exact SHA required');
 const response=await fetch(base+'/omega-build-receipt.json?v9='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('V9 exact build receipt unavailable');
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)throw Error('V9 exact deployed SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&v9='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
   const portal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
   await portal.waitFor({state:'visible',timeout:20000});
   await portal.locator('button[data-r519-node="Relativity"]').click();
   await portal.locator('button[data-r519-launch="Relativity"]').click();
   const science=page.locator('.o7-science-workspace[data-route="Relativity"]');
   await science.waitFor({state:'visible',timeout:30000});
   const open=science.locator('.o7-open-instrument');
   if(await open.count())await open.click();
   const instrument=science.locator('[data-dewey-v9-workbench="executable"]');
   await instrument.waitFor({state:'visible',timeout:30000});
   await instrument.locator('[data-v9-model]').selectOption('anisotropic');
   await instrument.locator('[data-v9-x]').fill('1');
   await instrument.locator('[data-v9-y]').fill('2');
   await instrument.locator('[data-v9-time]').fill('1');
   await instrument.locator('[data-v9-rotation]').fill('1');
   assert.equal((await instrument.locator('[data-v9-composition]').innerText()).trim(),'5');
   assert.equal((await instrument.locator('[data-v9-equivariance]').innerText()).trim(),'NO');
   await instrument.locator('[data-v9-model]').selectOption('relative');
   assert.equal((await instrument.locator('[data-v9-composition]').innerText()).trim(),'0');
   assert.equal((await instrument.locator('[data-v9-return]').innerText()).trim(),'0');
   const downloadPromise=page.waitForEvent('download',{timeout:20000});
   await instrument.locator('[data-v9-export]').click();
   const download=await downloadPromise;
   assert.equal(download.suggestedFilename(),'omega-dewey-v9-temporal-witness.json');
   const witness=JSON.parse(await readFile(await download.path(),'utf8'));
   assert.deepEqual(verifyTemporalWorkbenchV9(JSON.stringify(witness)),witness);
   await instrument.locator('details summary').click();
   await instrument.locator('[data-v9-verify]').click();
   assert.match(await instrument.locator('[data-v9-recovery]').innerText(),/PASS: exact witness recomputed/);
   await instrument.locator('[data-v9-import]').fill(JSON.stringify({...witness,physicalMeasurement:true}));
   await instrument.locator('[data-v9-verify]').click();
   assert.match(await instrument.locator('[data-v9-recovery]').innerText(),/REFUSED:/);
   const pell=science.locator('[data-r752-pell-workbench="executable"]');
   await pell.waitFor({state:'visible',timeout:30000});
   await pell.locator('[data-r752-index]').fill('2');
   assert.equal((await pell.locator('[data-r752-classification]').innerText()).trim(),'CLASSIFIED_EXACT_ADJACENT_PAIR');
   assert.equal((await pell.locator('[data-r752-norm]').innerText()).trim(),'-4');
   const pellDownloadPromise=page.waitForEvent('download',{timeout:20000});
   await pell.locator('[data-r752-export]').click();
   const pellDownload=await pellDownloadPromise;
   assert.equal(pellDownload.suggestedFilename(),'omega-r752-pell-witness.json');
   const pellPacket=JSON.parse(await readFile(await pellDownload.path(),'utf8'));
   assert.equal(pellPacket.classification.classified,true);
   await pell.locator('details summary').click();
   await pell.locator('[data-r752-verify]').click();
   assert.match(await pell.locator('[data-r752-status]').innerText(),/PASS: exact Pell witness recomputed/);
   await pell.locator('[data-r752-import]').fill(JSON.stringify({...pellPacket,truth:{...pellPacket.truth,physicalMeasurement:true}}));
   await pell.locator('[data-r752-verify]').click();
   assert.match(await pell.locator('[data-r752-status]').innerText(),/REFUSED:/);
   await pell.locator('[data-r752-index]').fill('65');
   assert.match(await pell.locator('[role="alert"]').innerText(),/index must be a whole number/);
   await instrument.locator('[data-v9-time]').fill('17');
   assert.match(await instrument.locator('[role="alert"]').innerText(),/time must be an integer/);
   assert.equal(errors.length,0,label+': browser errors '+errors.join(' | '));
   const width=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(width.page<=width.viewport+8,label+': page horizontal overflow '+JSON.stringify(width));
   console.log('R750 V9 '+label+' executable Relativity model, exact export/recovery, tamper refusal and invalid input PASS');
  }finally{await context.close()}
 }
}finally{await browser.close()}
