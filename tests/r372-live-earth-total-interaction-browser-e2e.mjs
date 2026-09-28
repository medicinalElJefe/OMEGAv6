import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!base)throw new Error('OMEGA_E2E_URL or OMEGA_PUBLIC_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA or OMEGA_PROMOTED_SHA must be exact promoted SHA');

const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{if(!r.ok)throw new Error(`receipt HTTP ${r.status}`);return r.json()});
function verifyReceipt(receipt){
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha||receipt?.promotion?.authority!=='GITHUB_MERGE_PARENTS')throw new Error(`R372 exact source/promotion receipt mismatch for ${expectedSha}`);
}
verifyReceipt(receipt);

async function contained(page,label){
 const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
 if(overflow>12)throw new Error(`${label}: R372 introduced ${overflow}px horizontal overflow`);
}
function targetResponse(response,path,lat,lon){
 const url=new URL(response.url());
 return url.pathname===path&&Math.abs(Number(url.searchParams.get('lat'))-lat)<0.000011&&Math.abs(Number(url.searchParams.get('lon'))-lon)<0.000011;
}
function verifyTarget(data,lat,lon,label){
 if(!Number.isFinite(data?.target?.lat)||!Number.isFinite(data?.target?.lon)||Math.abs(data.target.lat-lat)>0.000011||Math.abs(data.target.lon-lon)>0.000011||!/^[0-9a-f]{64}$/i.test(data?.evidenceHash||''))throw new Error(`${label}: returned evidence target/hash mismatch`);
}
async function bindTarget(page,action,lat,lon){
 const waiting=page.waitForResponse(r=>targetResponse(r,'/api/earth/evidence',lat,lon),{timeout:30000});
 await action();const response=await waiting;
 if(!response.ok())throw new Error(`Earth evidence HTTP ${response.status()}`);
 const evidence=await response.json();verifyTarget(evidence,lat,lon,'Earth');
 await page.waitForFunction(({lat,lon,hash})=>{
  const coords=document.querySelectorAll('.earth-r72-coords input');
  return coords.length===2&&Math.abs(Number(coords[0].value)-lat)<0.000011&&Math.abs(Number(coords[1].value)-lon)<0.000011&&document.querySelector('.earth-r72-proof code')?.textContent===hash;
 },{lat,lon,hash:evidence.evidenceHash},{timeout:20000});
}
async function searchTarget(page,{input,find,results,query}){
 await input.fill(query);
 const waiting=page.waitForResponse(r=>{const u=new URL(r.url());return u.pathname==='/api/earth/geocode'&&u.searchParams.get('q')===query},{timeout:30000});
 await find.click();const response=await waiting;
 if(!response.ok())throw new Error(`Geocode HTTP ${response.status()}: ${query}`);
 const data=await response.json(),row=data?.results?.[0];
 if(!Number.isFinite(Number(row?.lat))||!Number.isFinite(Number(row?.lon)))throw new Error(`No numeric location returned for ${query}`);
 const first=results.first();await first.waitFor({state:'visible',timeout:15000});
 const shown=await first.innerText();
 if(!shown.includes(String(row.name||row.displayName)))throw new Error(`Place picker differs from returned geocoder result: ${query}`);
 await bindTarget(page,()=>first.click(),Number(row.lat),Number(row.lon));
}

const VIEW_EXPECTATIONS=[
 ['Satellite','.earth-r279-satellite'],
 ['Planet','.earth-r281-globe'],
 ['Global motion','.earth-r279-instrument[data-earth-mode="MOTION"]'],
 ['Evidence','.earth-r279-instrument[data-earth-mode="EVIDENCE"]'],
 ['Weather','.earth-r375-weather[data-earth-view="WEATHER"]'],
 ['Earth / space','.earth-r279-instrument[data-earth-mode="SPACE"]'],
 ['Ground','.earth-r279-ground'],
 ['Calculus','.earth-r279-calculus'],
 ['SAR Truth','.earth-r283-sar']
];
const LENS_IDS=['SOURCE','AMPLITUDE','PHASE','COHERENCE','INTERFEROGRAM','DEFORMATION','ELEVATION','POLARIMETRY','MULTI_BAND','TIME_STACK','SCAR_UNCERTAINTY','PROOF'];

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,permissions:['geolocation'],geolocation:{latitude:32.2226,longitude:-110.9747}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${base}/?r372-live=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.getByLabel('Open Earth Now').click();
  await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
  await page.waitForSelector('.earth-r279',{state:'visible',timeout:30000});

  const displayMenu=page.locator('.earth-r372-display-menu');await displayMenu.waitFor({state:'visible',timeout:10000});
  const focusDisplay=displayMenu.getByRole('button',{name:'Focus display',exact:true});
  const fullScreen=displayMenu.getByRole('button',{name:'Full screen display',exact:true});
  await focusDisplay.click();if(await page.locator('.earth-r72-console').isVisible())throw new Error(`${label}: focus display did not yield Earth console`);await displayMenu.getByRole('button',{name:'Restore panels',exact:true}).click();
  await fullScreen.click();await page.waitForFunction(()=>document.querySelector('.earth-r279-stage')?.getAttribute('data-display-expanded')==='true',{timeout:10000});
  const expanded=await page.locator('.earth-r279-stage').boundingBox();if(!expanded||expanded.width<viewport.width-8||expanded.height<viewport.height-8)throw new Error(`${label}: full screen display did not occupy viewport ${JSON.stringify(expanded)}`);
  await page.locator('.earth-r372-expanded-bar').getByRole('button',{name:'Exit full screen',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.earth-r279-stage')?.getAttribute('data-display-expanded')==='false',{timeout:10000});

  const exact=page.locator('.earth-r372-exact-coords');
  if(!(await exact.count()))throw new Error(`${label}: R372 exact-coordinate advanced control missing`);
  if(await exact.evaluate(el=>el.hasAttribute('open')))throw new Error(`${label}: R372 exact coordinates must default collapsed`);
  if(await page.locator('.earth-r72-console>.earth-r72-coords').count())throw new Error(`${label}: manual coordinates remain primary in Earth console`);

  const place=page.getByLabel('Search Earth location');await place.waitFor({state:'visible',timeout:10000});
  for(const query of ['Tucson Arizona','1600 Pennsylvania Avenue NW, Washington, DC']){
   await searchTarget(page,{input:place,find:page.locator('.earth-r72-console').getByRole('button',{name:'Find',exact:true}),results:page.locator('.earth-r3563-results button'),query});
   await contained(page,`${label} Earth search ${query}`);
  }
  await bindTarget(page,()=>page.locator('.earth-r72-console').getByRole('button',{name:'Use my location',exact:true}).click(),32.2226,-110.9747);

  const tabs=page.locator('.earth-r279-view-tabs button');
  if(await tabs.count()!==9)throw new Error(`${label}: R375 expected 9 Earth views, found ${await tabs.count()}`);
  for(const [name,selector] of VIEW_EXPECTATIONS){
   const tab=tabs.filter({hasText:name}).first();await tab.click();
   if(await tab.getAttribute('aria-pressed')!=='true')throw new Error(`${label}: ${name} tab did not activate`);
   await page.waitForSelector(selector,{state:'visible',timeout:25000});
   const stage=await page.locator('.earth-r279-stage').boundingBox();
   if(!stage||stage.width<(label==='desktop'?500:300)||stage.height<300)throw new Error(`${label}: ${name} stage unusable ${JSON.stringify(stage)}`);
   await contained(page,`${label} ${name}`);
  }

  const weatherTab=tabs.filter({hasText:'Weather'}).first();
  const weatherReturn=page.waitForResponse(r=>targetResponse(r,'/api/earth/weather',32.2226,-110.9747),{timeout:30000});
  await weatherTab.click();const weatherResponse=await weatherReturn;
  if(!weatherResponse.ok())throw new Error(`${label}: weather HTTP ${weatherResponse.status()}`);
  const weather=await weatherResponse.json();verifyTarget(weather,32.2226,-110.9747,'Weather');
  if(weather?.schema!=='OMEGA_EARTH_WEATHER_R375'||weather?.canonicalMutation!==false)throw new Error(`${label}: R375 weather schema/authority mismatch`);
  if(!Array.isArray(weather?.hourly)||weather.hourly.length<24||!Array.isArray(weather?.daily)||weather.daily.length<7)throw new Error(`${label}: R375 weather horizon incomplete`);
  if(!weather?.sources?.openMeteo?.ok||!weather?.derived?.truth?.includes('RELATIONAL_FORECAST_STRUCTURE_ONLY'))throw new Error(`${label}: R375 weather provenance/derived boundary missing`);
  await page.waitForSelector('.earth-r375-hourly-card',{state:'visible',timeout:15000});
  if(await page.locator('.earth-r375-hourly-card').count()<24)throw new Error(`${label}: R375 hourly surface has fewer than 24 returned points`);
  await page.getByRole('button',{name:'Weekly · 7 day',exact:true}).click();
  await page.waitForSelector('.earth-r375-day-card',{state:'visible',timeout:10000});
  if(await page.locator('.earth-r375-day-card').count()<7)throw new Error(`${label}: R375 weekly surface has fewer than 7 returned days`);
  await contained(page,`${label} Weather hourly/weekly`);

  const satTab=tabs.filter({hasText:'Satellite'}).first();await satTab.click();
  const satImg=page.locator('.earth-r279-sat-main figure img').first();await satImg.waitFor({state:'visible',timeout:20000});
  await page.waitForFunction(()=>{const img=document.querySelector('.earth-r279-sat-main figure img');return img?.complete&&img.naturalWidth>100&&img.naturalHeight>100},{timeout:30000});
  if(!new URL(await satImg.getAttribute('src'),base).pathname.startsWith('/api/earth/noaa/image'))throw new Error(`${label}: satellite source path changed`);

  const motionTab=tabs.filter({hasText:'Global motion'}).first();await motionTab.click();
  const motionCanvas=page.getByLabel('Interactive motion Earth view');await motionCanvas.waitFor({state:'visible',timeout:15000});
  const motion=page.locator('.earth-r279-instrument[data-earth-mode="MOTION"]');
  await motion.getByRole('button',{name:'Pause motion',exact:true}).click();
  await motion.getByRole('button',{name:'Resume motion',exact:true}).waitFor({state:'visible'});
  await motion.getByRole('button',{name:'Resume motion',exact:true}).click();
  await motion.getByRole('button',{name:'Pause motion',exact:true}).waitFor({state:'visible'});
  const refresh=motion.getByRole('button',{name:'Refresh global field',exact:true});await refresh.waitFor({state:'visible',timeout:30000});
  const refreshed=page.waitForResponse(r=>new URL(r.url()).hostname==='api.open-meteo.com'&&new URL(r.url()).pathname==='/v1/forecast',{timeout:30000});
  await refresh.click();const motionResponse=await refreshed;
  if(!motionResponse.ok())throw new Error(`${label}: global field refresh HTTP ${motionResponse.status()}`);
  await motion.getByRole('button',{name:'Refresh global field',exact:true}).waitFor({state:'visible',timeout:30000});
  if(!/\b[1-9]\d*\/\d+ RETURNED\b/.test(await motion.locator('.earth-kpi').first().innerText()))throw new Error(`${label}: refreshed global field has no fully returned samples`);

  const groundTab=tabs.filter({hasText:'Ground'}).first();await groundTab.click();
  const groundRefresh=page.getByRole('button',{name:'Refresh ground evidence',exact:true});await groundRefresh.waitFor({state:'visible',timeout:30000});
  const groundReturn=page.waitForResponse(r=>targetResponse(r,'/api/earth/ground/evidence',32.2226,-110.9747),{timeout:30000});
  await groundRefresh.click();const groundResponse=await groundReturn;
  if(!groundResponse.ok())throw new Error(`${label}: ground refresh HTTP ${groundResponse.status()}`);
  const ground=await groundResponse.json();verifyTarget(ground,32.2226,-110.9747,'Ground');
  await page.waitForFunction(hash=>document.querySelector('.earth-ground-r9 footer code')?.textContent===hash,ground.evidenceHash,{timeout:20000});
  await groundRefresh.waitFor({state:'visible',timeout:20000});
  await contained(page,`${label} refreshed ground`);

  const sarTab=tabs.filter({hasText:'SAR Truth'}).first();await sarTab.click();
  await page.waitForSelector('.sar-r285-live',{state:'visible',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('.r284-lens-card[data-r3565-lemma="true"]').length===12,{timeout:45000});
  const sar=page.locator('.sar-r285-live');
  await searchTarget(page,{input:page.getByLabel('Search SAR location'),find:sar.getByRole('button',{name:'Find location',exact:true}),results:page.locator('.r3564-sar-results button'),query:'Tucson Arizona'});
  await bindTarget(page,()=>sar.getByRole('button',{name:'Use my location',exact:true}).click(),32.2226,-110.9747);
  await page.waitForFunction(()=>document.querySelectorAll('.r284-lens-card[data-r3565-lemma="true"]').length===12,{timeout:45000});
  const sarInstrument=sar.locator('.sar-r280');const cleanToggle=sarInstrument.getByRole('button',{name:'VIEW DETAILS',exact:true});await cleanToggle.waitFor({state:'visible',timeout:10000});if(await sarInstrument.locator('.r280-screen').getAttribute('data-clean-view')!=='true')throw new Error(`${label}: SAR result viewport must default unobstructed`);if(await sarInstrument.locator('.r3565-lemma-badge').isVisible())throw new Error(`${label}: SAR clean view still overlays chain-lemma badge`);await cleanToggle.click();if(await sarInstrument.locator('.r280-screen').getAttribute('data-clean-view')!=='false')throw new Error(`${label}: SAR detail overlay restore failed`);await sarInstrument.getByRole('button',{name:'CLEAN VIEW',exact:true}).click();
  const sarFocus=sar.getByRole('button',{name:'FOCUS FIELD',exact:true});await sarFocus.click();if(await sar.locator('.r280-left').isVisible()||await sar.locator('.r280-right').isVisible())throw new Error(`${label}: SAR focus field did not yield inspectors`);await sar.getByRole('button',{name:'RESTORE INSPECTORS',exact:true}).click();
  const cards=page.locator('.r284-lens-card');
  if(await cards.count()!==12)throw new Error(`${label}: expected exactly 12 chain-lemma lenses`);
  const names=new Set();
  for(let i=0;i<12;i++){
   const card=cards.nth(i);names.add((await card.locator('header b').innerText()).trim());await card.click();
   await page.waitForFunction(index=>document.querySelectorAll('.r284-lens-card')[index]?.getAttribute('data-active')==='true',i,{timeout:10000});
   const canvas=page.locator('.r3565-lemma-canvas[data-truth-class="DERIVED_TRIANGULATED"]');await canvas.waitFor({state:'visible',timeout:10000});
   const blockers=await sarInstrument.locator('.r280-screen').locator('.r3565-lemma-badge,.r284-view-readout,.r285-field-empty,.r280-geometry-overlay,.r284-geometry-hud,.r280-range-labels,.r284-scale').evaluateAll(els=>els.filter(el=>getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden').length);if(blockers!==0)throw new Error(`${label}: ${LENS_IDS[i]} clean SAR view still has ${blockers} obstructing overlay(s)`);
   const status=await sarInstrument.locator('.r374-below-canvas-status').boundingBox();const screen=await sarInstrument.locator('.r280-screen').boundingBox();if(!status||!screen||status.y<screen.y+screen.height-1)throw new Error(`${label}: ${LENS_IDS[i]} status is not outside the SAR viewport`);
   if(await canvas.getAttribute('data-lemma-view')!==LENS_IDS[i])throw new Error(`${label}: lens ${i+1} selection did not bind ${LENS_IDS[i]}`);
   if(await canvas.locator(':scope > i').count()<4096)throw new Error(`${label}: lens ${i+1} lacks its derived field`);
   const thumb=card.locator('.r3565-mini-lemma');const thumbBox=await thumb.boundingBox();if(!thumbBox||Math.abs((thumbBox.width/thumbBox.height)-(13/8))>.18)throw new Error(`${label}: lens ${i+1} preview aspect is not proportional ${JSON.stringify(thumbBox)}`);
   await contained(page,`${label} SAR lens ${i+1}`);
  }
  if(names.size!==12)throw new Error(`${label}: duplicate lens identities`);
  for(const mode of ['SLC','GRD']){
   const control=sar.locator('.r285-mode button').filter({hasText:mode}).first();await control.click();
   if(await control.getAttribute('aria-pressed')!=='true')throw new Error(`${label}: ${mode} did not activate`);
  }

  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>12)throw new Error(`${label}: R372 introduced ${overflow}px horizontal overflow`);
  if(errors.length)throw new Error(`${label}: R372 browser errors ${errors.join(' | ')}`);
  await context.close();
 }
 verifyReceipt(await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(r=>{if(!r.ok)throw new Error(`final receipt HTTP ${r.status}`);return r.json()}));
 console.log(`R372 LIVE EARTH TOTAL INTERACTION PASS · exact source + promoted SHA ${expectedSha} before/after · place/address/device target + returned evidence hash · all 9 Earth views · loaded NOAA pixels · motion pause/resume + returned refresh · ground target/hash refresh · SAR targeting + 12 unique lenses actuated · GRD/SLC · desktop/mobile containment per view/lens · no page errors`);
}finally{await browser.close()}
