import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('R737 exact production SHA required');
 const response=await fetch(base+'/omega-build-receipt.json?r737='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('R737 production receipt unavailable '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)throw Error('R737 exact production SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:device==='mobile'?2:1});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r737='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
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
   const profile=instrument.locator('[data-r735-route-profile]');
   await profile.waitFor({state:'visible',timeout:45000});
   if(await profile.locator('[data-r735-table] tbody tr').count()<1)throw Error(device+': computed route has no steps');
   const portrait=instrument.locator('[data-r736-phase-portrait]');
   await portrait.waitFor({state:'visible',timeout:15000});
   const plot=portrait.locator('[data-r736-plot]');
   if(await plot.locator('circle[data-r736-point]').count()<1)throw Error(device+': no source phase points');
   if(await plot.locator('line').count()<2)throw Error(device+': missing source phase axes');
   const initial=await portrait.locator('[data-r736-summary]').innerText();
   if(!/source points/.test(initial)||!/exact successor edges/.test(initial))throw Error(device+': source phase witness absent');
   await portrait.locator('[data-r736-x]').selectOption('Phi');
   await portrait.locator('[data-r736-y]').selectOption('Lambda');
   if(await portrait.locator('[data-r736-x]').inputValue()===await portrait.locator('[data-r736-y]').inputValue())throw Error(device+': phase axes not distinct');
   if(await plot.locator('circle[data-r736-point]').count()<1)throw Error(device+': source phase rerender empty');

   const exchange=instrument.locator('[data-r737-exchange]');
   await exchange.waitFor({state:'visible',timeout:15000});
   const exchangeSummary=await exchange.locator('[data-r737-summary]').innerText();
   if(!/exact source exchanges/.test(exchangeSummary)||!/orientation/.test(exchangeSummary)||!/cycle/.test(exchangeSummary))throw Error(device+': exchange geometry missing');
   if(await exchange.locator('[data-r737-table] tbody tr').count()<1)throw Error(device+': no visible exchange edges');
   const downloadPromise=page.waitForEvent('download',{timeout:15000});
   await exchange.locator('[data-r737-export]').click();
   const download=await downloadPromise;
   if(!/^omega-r737-source-exchange-\d+\.json$/.test(download.suggestedFilename()))throw Error(device+': wrong exchange export filename');
   const chunks=[];
   for await(const chunk of await download.createReadStream())chunks.push(chunk);
   const exported=JSON.parse(Buffer.concat(chunks).toString('utf8'));
   if(exported.schema!=='OMEGA_SOURCE_PHASE_EXCHANGE_R737_V1'||!exported.sourceBound||exported.canonicalMutation!==false||
      exported.physicalMeasurement!==false||exported.edgeCount!==exported.edges.length||exported.edgeCount<1)
    throw Error(device+': exported source exchange invalid');
   if(exported.cycleStart!==null&&exported.cycleClosureResidual>1e-8)throw Error(device+': source-cycle closure imbalance');
   const summary=await profile.locator('[data-r735-summary]').innerText();
   if(!/computed steps/.test(summary)||!/cycle|bounded continuation/.test(summary))throw Error(device+': route witness missing');
   await profile.locator('[data-r735-limit]').selectOption('16');
   if(await profile.locator('[data-r735-table] tbody tr').count()>16)throw Error(device+': route bound ignored');
   await instrument.locator('[data-r734-channel]').selectOption('successorDeltaC');
   if(!(await instrument.locator('[data-r735-route-profile]').innerText()).includes('Δ successor'))throw Error(device+': gradient column unavailable');
   await instrument.locator('[data-r733-address]').fill('0');
   await instrument.locator('[data-r733-jump]').click();
   await page.locator('.o7-science-workspace[data-route="Atlas"][data-address="0"]').waitFor({state:'visible',timeout:10000});
   const rows=await profile.locator('[data-r735-table] tbody tr').count();
   if(rows<1||rows>16)throw Error(device+': source route rows out of bounds');
   if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>8)throw Error(device+': horizontal overflow');
   if(errors.length)throw Error(device+': page errors '+errors.slice(0,3).join(' | '));
   console.log('R737 '+device+' source exchange geometry, downloadable exact edges, cycle balance and containment PASS');
  }finally{await context.close();}
 }
}finally{await browser.close();}
