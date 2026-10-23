import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R682 exact promoted SHA required');
 const r=await fetch(base+'/omega-build-receipt.json?r682='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R682 promoted build receipt HTTP '+r.status);
 const q=await r.json();
 if(q?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||q?.source?.sha!==expectedSha||q?.promotion?.promotedMergeSha!==expectedSha)
  throw Error('R682 live source response not bound to promoted SHA');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(String(error)));
  let attempts=0;
  await page.route('**/api/earth/noaa/catalog*',async route=>{
   attempts++;
   if(attempts<=3)await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic transport outage for TEST ONLY; no coverage or image bytes returned'})});
   else await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({coverages:[{id:'G19-FD',label:'GOES-19 Full Disk',state:'RETURNED',lastModified:'2026-10-22T00:00:00Z'}]})});
  });
  try{
   await page.goto(base+'/?omega7=1&r682='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
   await page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"] button[data-r519-direct="Earth Now"]').click();
   await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Earth Now',null,{timeout:30000});
   const earth=page.locator('.earth-r279-satellite');
   await earth.waitFor({state:'visible',timeout:30000});
   await page.waitForFunction(()=>document.querySelector('.earth-r279-satellite')?.getAttribute('data-noaa-state')==='ERROR',null,{timeout:20000});
   if(attempts!==3)throw Error(device+': expected three bounded failed source attempts; received '+attempts);
   if(await earth.locator('.earth-r279-sat-main figure img').count())throw Error(device+': unavailable NOAA source fabricated image pixels');
   const error=await earth.getByRole('alert').innerText();
   if(!error.includes('3 verified requests'))throw Error(device+': false source-error evidence or missing bounded attempt count');
   await earth.getByRole('button',{name:'Retry satellite catalogue'}).click();
   await page.waitForFunction(()=>document.querySelector('.earth-r279-satellite')?.getAttribute('data-noaa-state')==='RETURNED',null,{timeout:30000});
   if(attempts!==4)throw Error(device+': did not recover via exact fourth source-fixture response '+attempts);
   const img=earth.locator('.earth-r279-sat-main figure img').first();
   await img.waitFor({state:'visible',timeout:15000});
   const src=await img.getAttribute('src');
   if(!src||!new URL(src,base).pathname.startsWith('/api/earth/noaa/image'))throw Error(device+': recovered image source not real NOAA endpoint');
   if(errors.length)throw Error(device+': runtime errors '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': layout overflow '+overflow);
   console.log('R682 '+device+' PASS: three simulated source transport outages retain NO PIXELS, fourth deterministic source response restores catalogue; real NOAA imagery remains a separate mandatory production proof');
  }finally{await context.close()}
 }
}finally{await browser.close()}
