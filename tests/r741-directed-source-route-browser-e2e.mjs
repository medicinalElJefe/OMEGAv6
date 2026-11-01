import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('R741 exact production SHA required');
 const response=await fetch(base+'/omega-build-receipt.json?r741='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('R741 production receipt unavailable '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)
  throw Error('R741 exact production SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:device==='mobile'?2:1,acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  try{
   await page.goto(base+'/?omega7=1&r741='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
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
   const rows=ledger.locator('[data-r740-table] tbody tr');
   assert.ok(await rows.count()>0,device+': basin rows missing');
   const first=rows.first().locator('button[data-r740-select]');
   const source=Number((await first.innerText()).match(/Select (\d+)/)?.[1]);
   assert.ok(Number.isSafeInteger(source));
   await first.click();
   await page.locator('.o7-science-workspace[data-route="Atlas"][data-address="'+source+'"]').waitFor({state:'visible',timeout:10000});
   const explorer=instrument.locator('[data-r741-route]');
   await explorer.waitFor({state:'visible',timeout:20000});
   await explorer.locator('[data-r741-self]').click();
   assert.match(await explorer.locator('[data-r741-summary]').innerText(),/Reachable · 0 exact forward steps/);
   const next=Number((await explorer.locator('[data-r741-next]').innerText()).match(/successor · (\d+)/)?.[1]);
   assert.ok(Number.isSafeInteger(next),device+': successor target unavailable');
   await explorer.locator('[data-r741-next]').click();
   const steps=source===next?0:1;
   assert.match(await explorer.locator('[data-r741-summary]').innerText(),new RegExp('Reachable · '+steps+' exact forward steps'));
   assert.match(await explorer.locator('[data-r741-path]').innerText(),/Source path:/);
   const downloadPromise=page.waitForEvent('download',{timeout:20000});
   await explorer.locator('[data-r741-export]').click();
   const download=await downloadPromise;
   assert.equal(download.suggestedFilename(),'omega-r741-directed-source-route.json');
   const witness=JSON.parse(await readFile(await download.path(),'utf8'));
   assert.equal(witness.schema,'OMEGA_SOURCE_DIRECTED_ROUTE_R741_V1');
   assert.equal(witness.from,source);assert.equal(witness.to,next);
   assert.equal(witness.steps,steps);assert.equal(witness.reachable,true);
   assert.equal(witness.addresses[0],source);
   assert.equal(witness.addresses.at(-1),next);
   assert.equal(witness.canonicalMutation,false);assert.equal(witness.physicalMeasurement,false);
   if(await rows.count()>1){
    const second=rows.nth(1).locator('button[data-r740-select]');
    const other=Number((await second.innerText()).match(/Select (\d+)/)?.[1]);
    await explorer.locator('[data-r741-target]').fill(String(other));
    assert.match(await explorer.locator('[data-r741-summary]').innerText(),/Unreachable · different source basins/);
   }
   await explorer.locator('[data-r741-target]').fill('20736');
   assert.match(await explorer.locator('[data-r741-summary]').innerText(),/Enter an integer target address/);
   await explorer.locator('[data-r741-next]').click();
   assert.match((await explorer.locator('[data-r741-boundary]').innerText()).toLowerCase(),/not physical travel/);
   if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>8)throw Error(device+': horizontal overflow');
   if(errors.length)throw Error(device+': browser errors '+errors.slice(0,3).join(' | '));
   console.log('R741 '+device+' directed successor, self-route, unreachable basin, JSON witness, invalid target and containment PASS');
  }finally{await context.close()}
 }
}finally{await browser.close()}
