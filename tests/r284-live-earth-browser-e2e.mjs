import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!base)throw new Error('OMEGA_E2E_URL or OMEGA_PUBLIC_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA or OMEGA_PROMOTED_SHA must be the exact promoted SHA');

const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{if(!r.ok)throw new Error(`receipt HTTP ${r.status}`);return r.json()});
const served=receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||'';
if(served!==expectedSha)throw new Error(`R284 live Earth proof SHA mismatch expected ${expectedSha} served ${served||'NONE'}`);

async function enterEarth(page,label){
 const railEarth=page.getByLabel('Open Earth Now');
 await railEarth.waitFor({state:'visible',timeout:15000});
 await railEarth.click();
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
 await page.waitForSelector('.earth-r279',{state:'visible',timeout:30000});
 const tabs=page.locator('.earth-r279-view-tabs button'),count=await tabs.count();if(count!==9)throw new Error(`${label}: live Earth expected nine surfaces including Weather and SAR Truth, found ${count}`);
}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${base}/?r284-live=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});await enterEarth(page,name);
  const planetButton=page.locator('.earth-r279-view-tabs button').filter({hasText:'Planet'}).first();await planetButton.click();await page.waitForSelector('.earth-r281-globe[data-earth-view="PLANET"]',{state:'visible',timeout:20000});
  let observed=false;for(let attempt=1;attempt<=3;attempt++){
   try{await page.waitForFunction(()=>document.querySelector('.earth-r281-globe')?.getAttribute('data-source-state')==='OBSERVED',{timeout:25000});observed=true;break}catch{const reload=page.getByRole('button',{name:'Reload observed texture'});if(await reload.isVisible())await reload.click()}
  }
  const planet=page.locator('.earth-r281-globe');if(!observed){const state=await planet.getAttribute('data-source-state'),text=await planet.innerText();throw new Error(`${name}: live observed Earth did not bind after bounded retries: ${state} · ${text.slice(0,600)}`)}
  const canvas=planet.locator('canvas'),rect=await canvas.boundingBox();if(!rect||rect.width<260||rect.height<420)throw new Error(`${name}: live R284 globe canvas unusable ${JSON.stringify(rect)}`);
  const projection=await planet.getAttribute('data-projection'),crs=await planet.getAttribute('data-source-crs');if(projection!=='WGS84_ELLIPSOID_ORTHOGRAPHIC'||crs!=='EPSG:4326')throw new Error(`${name}: live R284 projection/source identity mismatch ${projection} ${crs}`);
  const sampled=await canvas.evaluate(c=>{const ctx=c.getContext('2d');if(!ctx)return{unique:0};const d=ctx.getImageData(0,0,c.width,c.height).data,u=new Set();for(let y=0;y<c.height&&u.size<96;y+=Math.max(1,Math.floor(c.height/40)))for(let x=0;x<c.width&&u.size<96;x+=Math.max(1,Math.floor(c.width/40))){const i=(y*c.width+x)*4;u.add(`${d[i]},${d[i+1]},${d[i+2]},${d[i+3]}`)}return{unique:u.size,width:c.width,height:c.height,render:Number(c.dataset.surfaceRender||0),dpr:Number(c.dataset.devicePixelRatio||0)}});
  if(sampled.unique<20)throw new Error(`${name}: live R284 returned Earth is not materially varied ${JSON.stringify(sampled)}`);if(dpr===2&&sampled.dpr<1.9)throw new Error(`${name}: live R284 mobile DPR was not preserved ${JSON.stringify(sampled)}`);
  let text=await planet.innerText();for(const token of ['OBSERVED TEXTURE','NASA-GIBS-VIIRS-SNPP-TRUECOLOR-GLOBAL','EPSG:4326','WGS84 ELLIPSOID','SOURCE BRIGHTNESS','DERIVED UTC GEOMETRY','Truth boundary.'])if(!text.includes(token))throw new Error(`${name}: live R284 visual truth missing ${token}`);
  await canvas.dispatchEvent('pointermove',{pointerId:1,pointerType:'mouse',isPrimary:true,clientX:rect.x+rect.width/2,clientY:rect.y+rect.height*.44,bubbles:true});await page.waitForSelector('.r284-inspector',{state:'visible',timeout:5000});const inspector=await page.locator('.r284-inspector').innerText();for(const token of ['OBSERVED PIXEL INSPECTOR','RGB','source RGB sampled before illumination transform'])if(!inspector.includes(token))throw new Error(`${name}: live R284 inspector missing ${token}`);
  await page.getByRole('button',{name:'Enable derived UTC illumination'}).click();await page.waitForTimeout(100);text=await planet.innerText();if(!text.includes('DERIVED UTC ILLUMINATION'))throw new Error(`${name}: live R284 derived illumination state was not visible`);await page.getByRole('button',{name:'Show source brightness'}).click();
  const sarButton=page.locator('.earth-r279-view-tabs button').filter({hasText:'SAR Truth'}).first();await sarButton.click();await page.waitForSelector('.earth-r283-sar[data-earth-view="SAR"]',{state:'visible',timeout:15000});if(!(await page.locator('.earth-r283-sar').innerText()).includes('SAR TRUTH INSTRUMENT'))throw new Error(`${name}: inherited R283 SAR Truth instrument missing after R284 deployment`);
  const placeInput=page.getByLabel('Search SAR location');await placeInput.waitFor({state:'visible',timeout:15000});await placeInput.fill('Tucson Arizona');await page.getByRole('button',{name:'Find location'}).click();
  let geocoded=false;for(let attempt=1;attempt<=3;attempt++){try{await page.waitForSelector('.r3564-sar-results button',{state:'visible',timeout:12000});geocoded=true;break}catch{await page.getByRole('button',{name:'Find location'}).click()}}
  if(!geocoded)throw new Error(`${name}: R356.4 place search returned no selectable Tucson result after bounded retries`);
  const resultButtons=page.locator('.r3564-sar-results button');if(await resultButtons.count()<1)throw new Error(`${name}: R356.4 place picker has no selectable results`);await resultButtons.first().click();
  await page.waitForFunction(()=>document.querySelector('.r3565-lemma-canvas')?.getAttribute('data-truth-class')==='DERIVED_TRIANGULATED',{timeout:35000});
  const lensCards=page.locator('.r284-lens-card');if(await lensCards.count()!==12)throw new Error(`${name}: R356.5 expected 12 analytical lenses, found ${await lensCards.count()}`);
  const lemmaCards=page.locator('.r284-lens-card[data-r3565-lemma="true"]');if(await lemmaCards.count()<12)throw new Error(`${name}: R356.5 expected all 12 unbound lenses to render triangulated lemma fields, found ${await lemmaCards.count()}`);
  const sarText=await page.locator('.earth-r283-sar').innerText();for(const token of ['CHAIN LEMMA','DERIVED','Use my location','WGS84'])if(!sarText.includes(token))throw new Error(`${name}: R356.5 live SAR surface missing ${token}`);
  const lemmaCanvas=page.locator('.r3565-lemma-canvas');const lemmaRect=await lemmaCanvas.boundingBox();if(!lemmaRect||lemmaRect.width<260||lemmaRect.height<260)throw new Error(`${name}: R356.5 chain-lemma field unusable ${JSON.stringify(lemmaRect)}`);
  const colored=await lemmaCanvas.evaluate(el=>{const cells=[...el.querySelectorAll(':scope > i')];return{count:cells.length,unique:new Set(cells.slice(0,1500).map(x=>getComputedStyle(x).backgroundColor)).size}});
  if(colored.count<4096||colored.unique<8)throw new Error(`${name}: R356.5 chain-lemma field is not materially rendered ${JSON.stringify(colored)}`);
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);if(overflow>12)throw new Error(`${name}: live R284 Earth introduced ${overflow}px horizontal overflow`);if(errors.length)throw new Error(`${name}: live R284 browser errors ${errors.join(' | ')}`);await context.close();
 }
 console.log(`R356.5 LIVE EARTH/SAR BROWSER PASS · exact promoted SHA ${expectedSha} · real NASA GIBS source rendered · Tucson place search selectable · chain-lemma derived field materially rendered · all 12 analytical lenses populated · desktop + 2×DPR mobile · no overflow or page errors`);
}finally{await browser.close()}
