import {chromium} from 'playwright';

const annotateFailure=error=>{const raw=error?.stack||String(error),message=String(raw).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');console.error(`::error title=R279/R284 EARTH BROWSER PROOF::${message}`)};
process.on('uncaughtException',error=>{annotateFailure(error);process.exit(1)});
process.on('unhandledRejection',error=>{annotateFailure(error);process.exit(1)});

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const viewports=[['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]];
const R284_TEXTURE=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAOUlEQVR4nGPkeB/wX4BBg0GA4QYDNpofhziMZmF4oMHAwHCDgYGBPJqF4QH5mhmo44KHA+6CgQ4DANv2SJzez11TAAAAAElFTkSuQmCC','base64');
const SOURCE_HEADERS={'x-omega-source':'NASA-GIBS-VIIRS-SNPP-TRUECOLOR-GLOBAL','x-omega-date':'2026-09-09','x-omega-crs':'EPSG:4326','x-omega-bbox':'-180,-90,180,90','x-omega-truth':'RETURNED_GLOBAL_OBSERVATION'};
const EXPECT=[
 ['Satellite','.earth-r279-satellite'],
 ['Planet','.earth-r281-globe[data-earth-view="PLANET"]'],
 ['Global motion','.earth-r279-instrument[data-earth-mode="MOTION"]'],
 ['Evidence','.earth-r279-instrument[data-earth-mode="EVIDENCE"]'],
 ['Earth / space','.earth-r279-instrument[data-earth-mode="SPACE"]'],
 ['Ground','.earth-r279-ground'],
 ['Calculus','.earth-r279-calculus'],
 ['SAR Truth','.earth-r283-sar[data-earth-view="SAR"]']
];

async function enterEarth(page,label){
 const railEarth=page.getByLabel('Open Earth Now');
 await railEarth.waitFor({state:'visible',timeout:15000});
 await railEarth.click();
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
 await page.waitForSelector('.earth-r279',{state:'visible',timeout:30000});
 const tabs=page.locator('.earth-r279-view-tabs button'),count=await tabs.count();if(count!==EXPECT.length)throw new Error(`${label}: expected exactly ${EXPECT.length} Earth view controls including SAR Truth, found ${count}`);
}

async function openPlanet(page,label){
 await enterEarth(page,label);const button=page.locator('.earth-r279-view-tabs button').filter({hasText:'Planet'}).first();await button.waitFor({state:'visible',timeout:10000});await button.click();await page.waitForSelector('.earth-r281-globe[data-earth-view="PLANET"]',{state:'visible',timeout:20000});return page.locator('.earth-r281-globe');
}

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr});const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.route('**/api/earth/gibs/global*',route=>route.fulfill({status:200,contentType:'image/png',body:R284_TEXTURE,headers:SOURCE_HEADERS}));
  await page.goto(`${base}/?r284=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});await enterEarth(page,label);
  for(const [name,selector] of EXPECT){
   const button=page.locator('.earth-r279-view-tabs button').filter({hasText:name}).first();await button.waitFor({state:'visible',timeout:10000});await button.click();await page.waitForSelector(selector,{state:'visible',timeout:20000});if(await button.getAttribute('aria-pressed')!=='true')throw new Error(`${label}: ${name} did not become the active Earth view`);
   if(name==='Planet'){
    await page.waitForFunction(()=>document.querySelector('.earth-r281-globe')?.getAttribute('data-source-state')==='OBSERVED',{timeout:20000});const planet=page.locator('.earth-r281-globe'),globe=planet.locator('canvas'),rect=await globe.boundingBox();if(!rect||rect.width<260||rect.height<420)throw new Error(`${label}: R284 observed globe canvas unusable ${JSON.stringify(rect)}`);
    if(await planet.getAttribute('data-projection')!=='WGS84_ELLIPSOID_ORTHOGRAPHIC')throw new Error(`${label}: R284 WGS84 projection identity missing`);if(await planet.getAttribute('data-source-crs')!=='EPSG:4326')throw new Error(`${label}: R284 source CRS identity missing`);
    const backing=await globe.evaluate(c=>({width:c.width,height:c.height,render:Number(c.dataset.surfaceRender||0),ratio:Number(c.dataset.devicePixelRatio||0)}));if(backing.width<rect.width*Math.max(1,dpr)*.9)throw new Error(`${label}: R284 canvas backing resolution too low ${JSON.stringify({rect,backing,dpr})}`);if(backing.render<Math.min(420,rect.width))throw new Error(`${label}: R284 ellipsoid render surface too low ${JSON.stringify(backing)}`);if(dpr===2&&backing.ratio<1.9)throw new Error(`${label}: R284 mobile DPR was not preserved ${JSON.stringify(backing)}`);
    const sampled=await globe.evaluate(c=>{const ctx=c.getContext('2d');if(!ctx)return{unique:0,width:c.width,height:c.height};const d=ctx.getImageData(0,0,c.width,c.height).data,unique=new Set();for(let y=0;y<c.height&&unique.size<64;y+=Math.max(1,Math.floor(c.height/36)))for(let x=0;x<c.width&&unique.size<64;x+=Math.max(1,Math.floor(c.width/36))){const i=(y*c.width+x)*4;unique.add(`${d[i]},${d[i+1]},${d[i+2]},${d[i+3]}`)}return{unique:unique.size,width:c.width,height:c.height}});if(sampled.unique<12)throw new Error(`${label}: R284 globe did not render a materially varied observed texture (${sampled.unique} sampled colors)`);
    let text=await planet.innerText();for(const token of ['OBSERVED TEXTURE','NASA-GIBS-VIIRS-SNPP-TRUECOLOR-GLOBAL','EPSG:4326','WGS84 ELLIPSOID','SOURCE BRIGHTNESS','DERIVED UTC GEOMETRY','Truth boundary'])if(!text.includes(token))throw new Error(`${label}: R284 source/projection truth missing ${token}`);
    const box=await globe.boundingBox();if(!box)throw new Error(`${label}: R284 globe lost bounding box`);await globe.dispatchEvent('pointermove',{pointerId:1,pointerType:'mouse',isPrimary:true,clientX:box.x+box.width/2,clientY:box.y+box.height*.44,bubbles:true});await page.waitForSelector('.r284-inspector',{state:'visible',timeout:5000});const inspector=await page.locator('.r284-inspector').innerText();for(const token of ['OBSERVED PIXEL INSPECTOR','RGB','derived solar elevation','source RGB sampled before illumination transform'])if(!inspector.includes(token))throw new Error(`${label}: R284 observed pixel inspector missing ${token}`);
    const illuminate=page.getByRole('button',{name:'Enable derived UTC illumination'});await illuminate.click();await page.waitForTimeout(80);text=await planet.innerText();if(!text.includes('DERIVED UTC ILLUMINATION'))throw new Error(`${label}: derived illumination did not become visibly declared`);await page.getByRole('button',{name:'Show source brightness'}).click();
    const grid=page.getByRole('button',{name:'Hide geodetic grid'}),terminator=page.getByRole('button',{name:'Hide UTC terminator'});if(!await grid.isVisible()||!await terminator.isVisible())throw new Error(`${label}: R284 geodetic overlay controls missing`);
   }
   if(name==='SAR Truth'){
    const sarText=await page.locator('.earth-r283-sar').innerText();if(!sarText.includes('SAR TRUTH INSTRUMENT'))throw new Error(`${label}: inherited R283 SAR Truth instrument did not remain mounted`);
   }
  }
  const reset=page.getByRole('button',{name:'Return + query model-mapped target'});await reset.waitFor({state:'visible',timeout:10000});const lat=page.getByLabel('Latitude'),lon=page.getByLabel('Longitude');await lat.fill('12.34');await lon.fill('56.78');await reset.click();await page.waitForTimeout(100);const resetLat=Number(await lat.inputValue()),resetLon=Number(await lon.inputValue());if(Math.abs(resetLat-12.34)<.001&&Math.abs(resetLon-56.78)<.001)throw new Error(`${label}: reset/query control did not restore the model-mapped target`);
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);if(overflow>12)throw new Error(`${label}: Earth workspace introduced ${overflow}px horizontal overflow`);if(pageErrors.length)throw new Error(`${label}: Earth view browser errors: ${pageErrors.join(' | ')}`);await context.close();
 }

 const bad=await browser.newContext({viewport:{width:1440,height:960}}),page=await bad.newPage();await page.route('**/api/earth/gibs/global*',route=>route.fulfill({status:200,contentType:'image/png',body:R284_TEXTURE,headers:{...SOURCE_HEADERS,'x-omega-source':'UNVERIFIED-FIXTURE'}}));await page.goto(`${base}/?r284-failclose=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});const planet=await openPlanet(page,'fail-close');await page.waitForFunction(()=>document.querySelector('.earth-r281-globe')?.getAttribute('data-source-state')==='UNAVAILABLE',{timeout:15000});const badText=await planet.innerText();if(!badText.includes('global source identity mismatch'))throw new Error('R284 fail-close did not visibly reject wrong source identity');await bad.close();
 console.log('R279/R284 EARTH VIEW BROWSER PASS · desktop + 2×DPR mobile route to Earth Now · all eight Earth surfaces preserved including R283 SAR Truth · WGS84 Planet renders varied returned-source pixels · observed pixel inspector reports unshaded RGB · source/derived controls explicit · wrong source identity fails closed · target reset works · no browser errors or viewport overflow');
}finally{await browser.close()}
