import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('R735 exact production SHA required');
 const response=await fetch(base+'/omega-build-receipt.json?r735='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('R735 production receipt unavailable '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)throw Error('R735 exact production SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:device==='mobile'?2:1});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r735='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
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
   const summary=await profile.locator('[data-r735-summary]').innerText();
   if(!/computed steps/.test(summary)||!/cycle|bounded continuation/.test(summary))throw Error(device+': route witness missing');
   await profile.locator('[data-r735-limit]').selectOption('16');
   if(await profile.locator('[data-r735-table] tbody tr').count()>16)throw Error(device+': route bound ignored');
   await instrument.locator('[data-r734-channel]').selectOption('successorDeltaC');
   if(!(await instrument.locator('[data-r735-route-profile]').innerText()).includes('Δ successor'))throw Error(device+': gradient column unavailable');
   await instrument.locator('[data-r733-address]').fill('0');
   await instrument.locator('[data-r733-jump]').click();
   await workspace.locator('[data-address="0"]').first().waitFor({state:'attached',timeout:10000}).catch(async()=>{
    if(await workspace.getAttribute('data-address')!=='0')throw Error(device+': address selection not committed');
   });
   const rows=await profile.locator('[data-r735-table] tbody tr').count();
   if(rows<1||rows>16)throw Error(device+': source route rows out of bounds');
   if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>8)throw Error(device+': horizontal overflow');
   if(errors.length)throw Error(device+': page errors '+errors.slice(0,3).join(' | '));
   console.log('R735 '+device+' exact successor profile, source channel switch, bounded route, address selection and containment PASS');
  }finally{await context.close();}
 }
}finally{await browser.close();}
