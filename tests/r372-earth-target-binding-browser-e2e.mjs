import assert from 'node:assert/strict';
import {chromium} from 'playwright';

// Deliberately synthetic transport regression. This is never a live-source receipt.
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const target={lat:32.2226,lon:-110.9747};
const envelope=(lat,lon,hash)=>({schema:'OMEGA_EARTH_EVIDENCE_V1',target:{lat,lon,crs:'WGS84 / EPSG:4326'},evidenceHash:hash,verifiedAt:'2026-09-27T00:00:00Z',sources:{},localConditions:{},truthBoundary:'SYNTHETIC TRANSPORT REGRESSION ONLY'});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,permissions:['geolocation'],geolocation:{latitude:target.lat,longitude:target.lon}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  let oldRequest=null,mismatch=false;
  await page.route('**/api/earth/noaa/catalog',route=>route.fulfill({json:{coverages:[]}}));
  await page.route('**/api/earth/evidence?*',async route=>{
   const url=new URL(route.request().url()),lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon'));
   if(!oldRequest){oldRequest={route,lat,lon};return;}
   await route.fulfill({json:mismatch?envelope(0,0,'f'.repeat(64)):envelope(lat,lon,'2'.repeat(64))});
  });
  await page.goto(base+'/?omega6=1',{waitUntil:'domcontentloaded',timeout:45000});
  const firstRequest=page.waitForRequest(r=>new URL(r.url()).pathname==='/api/earth/evidence',{timeout:30000});
  await page.getByLabel('Open Earth Now',{exact:true}).click();await firstRequest;
  await page.waitForSelector('.earth-r372-exact-coords',{timeout:30000});
  await page.locator('.earth-r72-console').getByRole('button',{name:'Use my location',exact:true}).click();
  await page.waitForFunction(hash=>document.querySelector('.earth-r72-proof code')?.textContent===hash,'2'.repeat(64),{timeout:20000});
  const olderReturned=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/earth/evidence'&&Number(new URL(r.url()).searchParams.get('lat'))===oldRequest.lat,{timeout:10000});
  await oldRequest.route.fulfill({json:envelope(oldRequest.lat,oldRequest.lon,'1'.repeat(64))});await (await olderReturned).finished();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await page.locator('.earth-r72-proof code').innerText(),'2'.repeat(64),`${label}: older target overwrote current evidence`);
  const coords=await page.locator('.earth-r72-coords input').evaluateAll(inputs=>inputs.map(x=>Number(x.value)));
  assert.deepEqual(coords,[target.lat,target.lon],`${label}: selected device target changed`);
  const fullScreen=page.locator('.earth-r372-display-menu').getByRole('button',{name:'Full screen display',exact:true});
  await fullScreen.click();
  await page.waitForFunction(()=>document.querySelector('.earth-r279-stage')?.getAttribute('data-display-expanded')==='true',{timeout:10000});
  const topbar=page.locator('.workstation-topbar').first();
  assert.equal(await topbar.evaluate(el=>getComputedStyle(el).visibility),'hidden',`${label}: global workstation topbar did not yield to Earth full screen`);
  const exitFull=page.locator('.earth-r372-expanded-bar').getByRole('button',{name:'Exit full screen',exact:true});
  await exitFull.waitFor({state:'visible',timeout:10000});
  assert.equal(await exitFull.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return hit===el||el.contains(hit)}),true,`${label}: Earth exit-full-screen control is occluded at its hit target`);
  await exitFull.click();
  await page.waitForFunction(()=>document.querySelector('.earth-r279-stage')?.getAttribute('data-display-expanded')==='false',{timeout:10000});
  assert.notEqual(await topbar.evaluate(el=>getComputedStyle(el).visibility),'hidden',`${label}: global workstation topbar did not restore after Earth full screen exit`);
  mismatch=true;
  await page.getByRole('button',{name:'Refresh returned evidence',exact:true}).click();
  await page.getByText('Returned Earth evidence does not match the selected target.',{exact:true}).waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('.earth-r72-proof code').innerText(),'not available',`${label}: mismatched provider target was admitted`);
  assert.match(await page.locator('.earth-r72-truth').innerText(),/EVIDENCE NOT YET BOUND/);
  assert.deepEqual(errors,[],`${label}: page errors`);
  await context.close();
 }
 console.log('R372 TARGET/FULLSCREEN REGRESSION PASS · synthetic responses only · desktop/mobile · late older response rejected · mismatched returned target rejected · Earth full-screen hit ownership proved · no source or CanonState admission claimed');
}finally{await browser.close()}
