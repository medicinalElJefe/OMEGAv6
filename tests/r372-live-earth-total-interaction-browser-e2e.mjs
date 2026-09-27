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
  if(await tabs.count()!==8)throw new Error(`${label}: R372 expected 8 Earth views, found ${await tabs.count()}`);
  for(const [name,selector] of VIEW_EXPECTATIONS){
   const tab=tabs.filter({hasText:name}).first();await tab.click();
   if(await tab.getAttribute('aria-pressed')!=='true')throw new Error(`${label}: ${name} tab did not activate`);
   await page.waitForSelector(selector,{state:'visible',timeout:25000});
   const stage=await page.locator('.earth-r279-stage').boundingBox();
   if(!stage||stage.width<(label==='desktop'?500:300)||stage.height<300)throw new Error(`${label}: ${name} stage unusable ${JSON.stringify(stage)}`);
   await contained(page,`${label} ${name}`);
  }

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
  const cards=page.locator('.r284-lens-card');
  if(await cards.count()!==12)throw new Error(`${label}: expected exactly 12 chain-lemma lenses`);
  const names=new Set();
  for(let i=0;i<12;i++){
   const card=cards.nth(i);names.add((await card.locator('header b').innerText()).trim());await card.click();
   await page.waitForFunction(index=>document.querySelectorAll('.r284-lens-card')[index]?.getAttribute('data-active')==='true',i,{timeout:10000});
   const canvas=page.locator('.r3565-lemma-canvas[data-truth-class="DERIVED_TRIANGULATED"]');await canvas.waitFor({state:'visible',timeout:10000});
   if(await canvas.getAttribute('data-lemma-view')!==LENS_IDS[i])throw new Error(`${label}: lens ${i+1} selection did not bind ${LENS_IDS[i]}`);
   if(await canvas.locator(':scope > i').count()<4096)throw new Error(`${label}: lens ${i+1} lacks its derived field`);
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
 console.log(`R372 LIVE EARTH TOTAL INTERACTION PASS · exact source + promoted SHA ${expectedSha} before/after · place/address/device target + returned evidence hash · all 8 Earth views · loaded NOAA pixels · motion pause/resume + returned refresh · ground target/hash refresh · SAR targeting + 12 unique lenses actuated · GRD/SLC · desktop/mobile containment per view/lens · no page errors`);
}finally{await browser.close()}
