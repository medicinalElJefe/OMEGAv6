import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('R740 exact production SHA required');
 const response=await fetch(base+'/omega-build-receipt.json?r740='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('R740 production receipt unavailable '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)
  throw Error('R740 exact production SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:device==='mobile'?2:1,acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  try{
   await page.goto(base+'/?omega7=1&r740='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
   const portal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
   await portal.waitFor({state:'visible',timeout:20000});
   await portal.locator('button[data-r519-node="Atlas"]').click();
   await portal.locator('button[data-r519-launch="Atlas"]').click();
   const workspace=page.locator('.o7-science-workspace[data-route="Atlas"]');
   await workspace.waitFor({state:'visible',timeout:30000});
   const open=workspace.locator('.o7-open-instrument');
   if(await open.count())await open.click();
   const instrument=workspace.locator('[data-r732-basin-instrument="source-model"]');
   await instrument.waitFor({state:'visible',timeout:30000});
   await instrument.locator('[data-r732-run]').click();
   const ledger=instrument.locator('[data-r740-continuity]');
   await ledger.waitFor({state:'visible',timeout:45000});
   const summary=await ledger.locator('[data-r740-summary]').innerText();
   assert.match(summary,/20,736 verified source addresses/);
   assert.match(summary,/20,736 conserved source edges/);
   assert.match(summary,/conserved basins/);
   assert.match(await ledger.locator('[data-r740-branches]').innerText(),/branching addresses/);
   const rows=ledger.locator('[data-r740-table] tbody tr');
   if(await rows.count()<1)throw Error(device+': no basin ledger rows');
   const first=rows.first();
   const nodes=Number(await first.locator('td').nth(1).innerText());
   const edges=Number(await first.locator('td').nth(2).innerText());
   assert.ok(nodes>0&&nodes===edges,device+': basin conservation failed');
   const select=first.locator('button[data-r740-select]');
   const address=Number((await select.innerText()).match(/Select (\d+)/)?.[1]);
   assert.ok(Number.isSafeInteger(address),device+': basin address unavailable');
   await select.click();
   await page.locator('.o7-science-workspace[data-route="Atlas"][data-address="'+address+'"]').waitFor({state:'visible',timeout:10000});
   assert.match(await ledger.locator('[data-r740-selected]').innerText(),new RegExp('Selected address '+address+' belongs to basin'));
   const downloadPromise=page.waitForEvent('download',{timeout:20000});
   await ledger.locator('[data-r740-export]').click();
   const download=await downloadPromise;
   assert.equal(download.suggestedFilename(),'omega-r740-source-continuity.json');
   const path=await download.path();
   const witness=JSON.parse(await readFile(path,'utf8'));
   assert.equal(witness.schema,'OMEGA_SOURCE_CONTINUITY_R740_V1');
   assert.equal(witness.nodeCount,20736);assert.equal(witness.edgeCount,20736);
   assert.equal(witness.forwardInverseBijection,true);
   assert.equal(witness.edgeConservation,true);
   assert.equal(witness.basinConservation,true);
   assert.equal(witness.canonicalMutation,false);
   assert.equal(witness.physicalMeasurement,false);
   assert.equal(witness.basins.reduce((sum,basin)=>sum+basin.edgeCount,0),20736);
   assert.match((await ledger.locator('[data-r740-boundary]').innerText()).toLowerCase(),/not historical donor parity/);
   if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>8)throw Error(device+': horizontal overflow');
   if(errors.length)throw Error(device+': browser errors '+errors.slice(0,3).join(' | '));
   console.log('R740 '+device+' source conservation, basin navigation, JSON export, scientific boundary and containment PASS');
  }finally{await context.close()}
 }
}finally{await browser.close()}
