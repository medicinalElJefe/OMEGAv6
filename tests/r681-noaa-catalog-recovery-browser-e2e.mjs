import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const iconSvg='<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#123456"/></svg>';
const catalog={coverages:[{id:'G19-FD',label:'GOES-19 Full Disk',state:'RETURNED',lastModified:'2026-10-22T00:00:00Z'}]};
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});const page=await context.newPage(),errors=[];let attempts=0;
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/api/earth/noaa/catalog*',async route=>{
   attempts++;
   if(attempts<=2)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,state:'SOURCE_UNAVAILABLE'})});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(catalog)});
  });
  await page.route('**/api/earth/noaa/image*',route=>route.fulfill({status:200,contentType:'image/svg+xml',body:iconSvg}));
  await page.goto(base+'/?omega6=1&r681='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
  const nav=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(await nav.count()&&await nav.first().isVisible())await nav.first().click();
  const earth=page.locator('.r89-flat-route').filter({has:page.locator('b',{hasText:'Earth Now'})}).first();
  await earth.waitFor({state:'visible',timeout:20000});await earth.click();
  await page.locator('.earth-r279').waitFor({state:'visible',timeout:30000});
  await page.locator('.earth-r279-view-tabs button').filter({hasText:'Satellite'}).first().click();
  const panel=page.locator('.earth-r279-sat-main');
  await panel.waitFor({state:'visible',timeout:20000});
  await page.waitForFunction(()=>document.querySelector('.earth-r279-sat-main')?.getAttribute('data-catalog-state')==='READY',{timeout:20000});
  if(attempts!==3)throw Error(label+': expected 2 fail-closed attempts and 1 successful source rebind; got '+attempts);
  await panel.locator('figure img').waitFor({state:'visible',timeout:10000});
  await page.waitForFunction(()=>document.querySelector('.earth-r279-sat-main')?.getAttribute('data-image-state')==='READY',{timeout:15000});
  if(await panel.locator('.earth-r279-sat-empty').count())throw Error(label+': stale empty state survived returned coverage');
  if(errors.length)throw Error(label+': page errors '+errors.join(';'));
  console.log('R681 '+label+' PASS · bounded failed NOAA catalog requests recovered by third source request · real source binding required · no fabricated fallback');
  await context.close();
 }
}finally{await browser.close()}
