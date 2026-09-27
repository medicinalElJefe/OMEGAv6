import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!base)throw new Error('OMEGA_E2E_URL or OMEGA_PUBLIC_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA or OMEGA_PROMOTED_SHA must be exact promoted SHA');

const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{if(!r.ok)throw new Error(`receipt HTTP ${r.status}`);return r.json()});
const served=receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||'';
if(served!==expectedSha)throw new Error(`R372 SHA mismatch expected ${expectedSha} served ${served||'NONE'}`);

const VIEW_EXPECTATIONS=[
 ['Satellite','.earth-r279-satellite'],
 ['Planet','.earth-r281-globe'],
 ['Global motion','.earth-r279-instrument[data-earth-mode="MOTION"]'],
 ['Evidence','.earth-r279-instrument[data-earth-mode="EVIDENCE"]'],
 ['Earth / space','.earth-r279-instrument[data-earth-mode="SPACE"]'],
 ['Ground','.earth-r279-ground'],
 ['Calculus','.earth-r279-calculus'],
 ['SAR Truth','.earth-r283-sar']
];

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,permissions:['geolocation'],geolocation:{latitude:32.2226,longitude:-110.9747}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${base}/?r372-live=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.getByLabel('Open Earth Now').click();
  await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
  await page.waitForSelector('.earth-r279',{state:'visible',timeout:30000});

  const exact=page.locator('.earth-r372-exact-coords');
  if(!(await exact.count()))throw new Error(`${label}: R372 exact-coordinate advanced control missing`);
  if(await exact.evaluate(el=>el.hasAttribute('open')))throw new Error(`${label}: R372 exact coordinates must default collapsed`);
  if(await page.locator('.earth-r72-console>.earth-r72-coords').count())throw new Error(`${label}: manual coordinates remain primary in Earth console`);

  const place=page.getByLabel('Search Earth location');await place.waitFor({state:'visible',timeout:10000});
  if(label==='desktop'){
   await place.fill('Tucson Arizona');await page.getByRole('button',{name:'Find'}).click();
   await page.waitForSelector('.earth-r3563-results button',{state:'visible',timeout:20000});
   const first=page.locator('.earth-r3563-results button').first(),txt=await first.innerText();
   if(!/Tucson/i.test(txt))throw new Error(`R372 Earth place search first result unexpected: ${txt.slice(0,200)}`);
   await first.click();
  }else{
   await page.getByRole('button',{name:'Use my location'}).first().click();
   await page.waitForFunction(()=>document.querySelector('.earth-r72-truth')?.textContent?.includes('RETURNED EVIDENCE BOUND'),{timeout:20000});
  }

  const tabs=page.locator('.earth-r279-view-tabs button');
  if(await tabs.count()!==8)throw new Error(`${label}: R372 expected 8 Earth views, found ${await tabs.count()}`);
  for(const [name,selector] of VIEW_EXPECTATIONS){
   const tab=tabs.filter({hasText:name}).first();await tab.click();
   if(await tab.getAttribute('aria-pressed')!=='true')throw new Error(`${label}: ${name} tab did not activate`);
   await page.waitForSelector(selector,{state:'visible',timeout:25000});
   const stage=await page.locator('.earth-r279-stage').boundingBox();
   if(!stage||stage.width<(label==='desktop'?500:300)||stage.height<300)throw new Error(`${label}: ${name} stage unusable ${JSON.stringify(stage)}`);
  }

  const satTab=tabs.filter({hasText:'Satellite'}).first();await satTab.click();
  const satImg=page.locator('.earth-r279-sat-main figure img').first();await satImg.waitFor({state:'visible',timeout:20000});
  if(!(await satImg.evaluate(img=>img.complete&&img.naturalWidth>100&&img.naturalHeight>100)))throw new Error(`${label}: satellite image did not materially load`);

  const motionTab=tabs.filter({hasText:'Global motion'}).first();await motionTab.click();
  const motionCanvas=page.getByLabel('Interactive motion Earth view');await motionCanvas.waitFor({state:'visible',timeout:15000});
  const pause=page.getByRole('button',{name:/Pause motion|Resume motion/}).first();await pause.click();await pause.click();
  const refresh=page.getByRole('button',{name:/Refresh global field|Refreshing/}).first();if(!(await refresh.isVisible()))throw new Error(`${label}: motion refresh control missing`);

  const groundTab=tabs.filter({hasText:'Ground'}).first();await groundTab.click();
  await page.getByRole('button',{name:/Refresh ground evidence|Checking/}).click();

  const sarTab=tabs.filter({hasText:'SAR Truth'}).first();await sarTab.click();
  await page.waitForSelector('.sar-r285-live',{state:'visible',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('.r284-lens-card[data-r3565-lemma="true"]').length===12,{timeout:45000});
  if(!(await page.getByLabel('Search SAR location').isVisible()))throw new Error(`${label}: SAR place search missing`);
  if(!(await page.getByRole('button',{name:'Use my location'}).isVisible()))throw new Error(`${label}: SAR device-location control missing`);

  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>12)throw new Error(`${label}: R372 introduced ${overflow}px horizontal overflow`);
  if(errors.length)throw new Error(`${label}: R372 browser errors ${errors.join(' | ')}`);
  await context.close();
 }
 console.log(`R372 LIVE EARTH TOTAL INTERACTION PASS · exact promoted SHA ${expectedSha} · place-first targeting · exact coords advanced-only · all 8 Earth views actuated · satellite image loaded · motion controls actuated · ground refresh actuated · SAR place/device targeting + 12 chain-lemma lenses · desktop/mobile · no page errors/overflow`);
}finally{await browser.close()}
