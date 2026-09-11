import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(!base)throw new Error('OMEGA_E2E_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA must be the exact promoted SHA');

const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{if(!r.ok)throw new Error(`receipt HTTP ${r.status}`);return r.json()});
const served=receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||'';
if(served!==expectedSha)throw new Error(`R283 live Earth proof SHA mismatch expected ${expectedSha} served ${served||'NONE'}`);

async function enterEarth(page){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count()&&await expand.first().isVisible())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000}).catch(()=>{});
 const earth=page.locator('.r89-flat-route').filter({has:page.locator('b',{hasText:'Earth Now'})}).first();
 await earth.waitFor({state:'visible',timeout:15000});await earth.click();
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
 const planet=page.locator('.earth-r279-view-tabs button').filter({hasText:'Planet'}).first();await planet.waitFor({state:'visible',timeout:15000});await planet.click();
 await page.waitForSelector('.earth-r283-globe[data-earth-view="PLANET"]',{state:'visible',timeout:20000});
}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${base}/?r283-live=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});await enterEarth(page);
  let observed=false;for(let attempt=1;attempt<=3;attempt++){
   try{await page.waitForFunction(()=>document.querySelector('.earth-r283-globe')?.getAttribute('data-source-state')==='OBSERVED',{timeout:25000});observed=true;break}catch{const reload=page.getByRole('button',{name:'Reload observed texture'});if(await reload.isVisible())await reload.click()}
  }
  if(!observed){const state=await page.locator('.earth-r283-globe').getAttribute('data-source-state'),text=await page.locator('.earth-r283-globe').innerText();throw new Error(`${name}: live observed Earth did not bind after bounded retries: ${state} · ${text.slice(0,500)}`)}
  const planet=page.locator('.earth-r283-globe'),canvas=planet.locator('canvas'),rect=await canvas.boundingBox();if(!rect||rect.width<260||rect.height<420)throw new Error(`${name}: live R283 globe canvas unusable ${JSON.stringify(rect)}`);
  const projection=await planet.getAttribute('data-projection'),crs=await planet.getAttribute('data-source-crs');if(projection!=='WGS84_ELLIPSOID_ORTHOGRAPHIC'||crs!=='EPSG:4326')throw new Error(`${name}: live R283 projection/source identity mismatch ${projection} ${crs}`);
  const sampled=await canvas.evaluate(c=>{const ctx=c.getContext('2d');if(!ctx)return{unique:0};const d=ctx.getImageData(0,0,c.width,c.height).data,u=new Set();for(let y=0;y<c.height&&u.size<96;y+=Math.max(1,Math.floor(c.height/40)))for(let x=0;x<c.width&&u.size<96;x+=Math.max(1,Math.floor(c.width/40))){const i=(y*c.width+x)*4;u.add(`${d[i]},${d[i+1]},${d[i+2]},${d[i+3]}`)}return{unique:u.size,width:c.width,height:c.height,render:Number(c.dataset.surfaceRender||0),dpr:Number(c.dataset.devicePixelRatio||0)}});
  if(sampled.unique<20)throw new Error(`${name}: live R283 returned Earth is not materially varied ${JSON.stringify(sampled)}`);
  const text=await planet.innerText();for(const token of ['OBSERVED TEXTURE','NASA-GIBS-VIIRS-SNPP-TRUECOLOR-GLOBAL','EPSG:4326','WGS84 ELLIPSOID','SOURCE BRIGHTNESS','DERIVED UTC GEOMETRY','Truth boundary.'])if(!text.includes(token))throw new Error(`${name}: live R283 visual truth missing ${token}`);
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);if(overflow>12)throw new Error(`${name}: live R283 Earth introduced ${overflow}px horizontal overflow`);if(errors.length)throw new Error(`${name}: live R283 browser errors ${errors.join(' | ')}`);
  await context.close();
 }
 console.log(`R283 LIVE EARTH BROWSER PASS · exact promoted SHA ${expectedSha} · real NASA GIBS source rendered on WGS84 ellipsoid · desktop + 2×DPR mobile · source/derived visual boundaries · materially varied pixels · no overflow or page errors`);
}finally{await browser.close()}
