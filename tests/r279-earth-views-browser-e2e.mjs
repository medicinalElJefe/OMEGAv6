import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
const R281_TEXTURE=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAIAAAA8r+mnAAAAJUlEQVR4nGOU09giz/BRnuGTAsMneYaPCgyfIGwWBhsGrIB0CQAAqQk0o7D0sgAAAABJRU5ErkJggg==','base64');
const EXPECT=[
 ['Satellite','.earth-r279-satellite'],
 ['Planet','.earth-r281-globe[data-earth-view="PLANET"]'],
 ['Global motion','.earth-r279-instrument[data-earth-mode="MOTION"]'],
 ['Evidence','.earth-r279-instrument[data-earth-mode="EVIDENCE"]'],
 ['Earth / space','.earth-r279-instrument[data-earth-mode="SPACE"]'],
 ['Ground','.earth-r279-ground'],
 ['Calculus','.earth-r279-calculus']
];

async function enterEarth(page,label){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count()&&await expand.first().isVisible())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000}).catch(()=>{});
 const earth=page.locator('.r89-flat-route').filter({has:page.locator('b', {hasText:'Earth Now'})}).first();
 await earth.waitFor({state:'visible',timeout:15000});
 await earth.click();
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
 await page.waitForSelector('.earth-r279',{state:'visible',timeout:30000});
 const tabs=page.locator('.earth-r279-view-tabs button');
 if(await tabs.count()!==7)throw new Error(`${label}: expected seven Earth view controls, found ${await tabs.count()}`);
}

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.route('**/api/earth/gibs/global*',route=>route.fulfill({status:200,contentType:'image/png',body:R281_TEXTURE,headers:{'x-omega-source':'R281-BROWSER-OBSERVATION-FIXTURE','x-omega-date':'2026-09-09','x-omega-crs':'EPSG:4326','x-omega-truth':'RETURNED_GLOBAL_OBSERVATION'}}));
  await page.goto(`${base}/?r281=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  await enterEarth(page,label);
  for(const [name,selector] of EXPECT){
   const button=page.locator('.earth-r279-view-tabs button').filter({hasText:name}).first();
   await button.waitFor({state:'visible',timeout:10000});
   await button.click();
   await page.waitForSelector(selector,{state:'visible',timeout:20000});
   if(await button.getAttribute('aria-pressed')!=='true')throw new Error(`${label}: ${name} did not become the active Earth view`);
   if(name==='Planet'){
    await page.waitForFunction(()=>document.querySelector('.earth-r281-globe')?.getAttribute('data-source-state')==='OBSERVED',{timeout:20000});
    const globe=page.locator('.earth-r281-globe canvas');
    const rect=await globe.boundingBox();if(!rect||rect.width<260||rect.height<420)throw new Error(`${label}: R281 observed globe canvas unusable ${JSON.stringify(rect)}`);
    const sampled=await globe.evaluate(c=>{const ctx=c.getContext('2d');if(!ctx)return{unique:0,width:c.width,height:c.height};const d=ctx.getImageData(0,0,c.width,c.height).data,unique=new Set();for(let y=0;y<c.height&&unique.size<48;y+=Math.max(1,Math.floor(c.height/32)))for(let x=0;x<c.width&&unique.size<48;x+=Math.max(1,Math.floor(c.width/32))){const i=(y*c.width+x)*4;unique.add(`${d[i]},${d[i+1]},${d[i+2]},${d[i+3]}`)}return{unique:unique.size,width:c.width,height:c.height}});
    if(sampled.unique<8)throw new Error(`${label}: R281 globe did not render a materially varied observed texture (${sampled.unique} sampled colors)`);
    const text=await page.locator('.earth-r281-globe').innerText();for(const token of ['OBSERVED TEXTURE','EPSG:4326','Truth boundary'])if(!text.includes(token))throw new Error(`${label}: R281 source/projection truth missing ${token}`);
   }
  }
  const reset=page.getByRole('button',{name:'Return + query model-mapped target'});
  await reset.waitFor({state:'visible',timeout:10000});
  const lat=page.getByLabel('Latitude'),lon=page.getByLabel('Longitude');
  await lat.fill('12.34');await lon.fill('56.78');
  await reset.click();
  await page.waitForTimeout(100);
  const resetLat=Number(await lat.inputValue()),resetLon=Number(await lon.inputValue());
  if(Math.abs(resetLat-12.34)<.001&&Math.abs(resetLon-56.78)<.001)throw new Error(`${label}: reset/query control did not restore the model-mapped target`);
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>12)throw new Error(`${label}: Earth workspace introduced ${overflow}px horizontal overflow`);
  if(pageErrors.length)throw new Error(`${label}: Earth view browser errors: ${pageErrors.join(' | ')}`);
  await context.close();
 }
 console.log('R279/R281 EARTH VIEW BROWSER PASS · desktop/mobile route to Earth Now · seven Earth menu buttons mount distinct surfaces · R281 Planet renders varied returned-source pixels through orthographic globe projection · reset/query target works · no page errors or viewport overflow');
}finally{await browser.close()}