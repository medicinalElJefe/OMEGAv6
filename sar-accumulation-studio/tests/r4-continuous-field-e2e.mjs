import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;
assert.ok(base,'SAR_TEST_URL is required');
const browser=await chromium.launch({headless:true});
const tucson={lon:-110.9747,lat:32.2226};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},geolocation:{longitude:tucson.lon,latitude:tucson.lat,accuracy:18},permissions:['geolocation']});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForSelector('#omegaFieldHud',{state:'visible',timeout:20000});
  await page.waitForSelector('#omegaActionHud',{state:'visible',timeout:20000});
  await page.waitForSelector('#omegaMapNav',{state:'visible',timeout:20000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length>100,null,{timeout:30000});

  await page.click('#deviceLocation');
  await page.waitForFunction(({lat,lon})=>{
    const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);return !!p&&Math.abs(Number(p[1])-lat)<.01&&Math.abs(Number(p[2])-lon)<.01;
  },tucson,{timeout:20000});
  await page.waitForFunction(({lat,lon})=>{const v=globalThis.OMEGA_SAR_NAVIGATION?.view;return v&&Math.abs(v.centerLat-lat)<.03&&Math.abs(v.centerLon-lon)<.05&&v.scale>=700;},tucson,{timeout:15000});

  const mapBox=await page.locator('#map').boundingBox();assert.ok(mapBox,'map has no browser box');
  const pointBeforePan=await page.textContent('#point');
  await page.mouse.move(mapBox.x+mapBox.width*.55,mapBox.y+mapBox.height*.55);await page.mouse.down();await page.mouse.move(mapBox.x+mapBox.width*.68,mapBox.y+mapBox.height*.63,{steps:7});await page.mouse.up();await page.waitForTimeout(350);
  assert.equal(await page.textContent('#point'),pointBeforePan,'drag/pan silently rebound the SAR measurement target');

  const anchorX=mapBox.x+mapBox.width*.72,anchorY=mapBox.y+mapBox.height*.38;
  const beforeZoom=await page.evaluate(({x,y})=>{const r=document.querySelector('#map').getBoundingClientRect(),v=globalThis.OMEGA_SAR_NAVIGATION.view;return {lon:v.centerLon+(x-r.left-r.width/2)/((r.width/360)*v.scale),lat:v.centerLat-(y-r.top-r.height/2)/((r.height/180)*v.scale),scale:v.scale};},{x:anchorX,y:anchorY});
  await page.mouse.move(anchorX,anchorY);await page.mouse.wheel(0,-420);await page.waitForTimeout(250);
  const afterZoom=await page.evaluate(({x,y,before})=>{const r=document.querySelector('#map').getBoundingClientRect(),v=globalThis.OMEGA_SAR_NAVIGATION.view;const projectedX=r.left+r.width/2+(before.lon-v.centerLon)*(r.width/360)*v.scale,projectedY=r.top+r.height/2-(before.lat-v.centerLat)*(r.height/180)*v.scale;return {scale:v.scale,anchorDriftPx:Math.hypot(projectedX-x,projectedY-y)};},{x:anchorX,y:anchorY,before:beforeZoom});
  assert.ok(afterZoom.scale>beforeZoom.scale,'wheel did not zoom in');assert.ok(afterZoom.anchorDriftPx<=1.5,`wheel zoom pointer drift ${afterZoom.anchorDriftPx}px`);
  assert.equal(await page.textContent('#point'),pointBeforePan,'zoom changed measurement target');

  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:60000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src&&globalThis.OMEGA_SAR_INTERACTION?.sourceSequence>=1,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_MAP?.active===true&&globalThis.OMEGA_SAR_LOCAL_MAP?.tileCount>0,null,{timeout:15000});
  const localLod=await page.evaluate(()=>({view:globalThis.OMEGA_SAR_NAVIGATION?.view,local:globalThis.OMEGA_SAR_LOCAL_MAP,browseMain:document.querySelector('.sar-source-browse-canvas')?.dataset.mainMapVisible,registration:globalThis.OMEGA_SAR_SOURCE_FRAME?.registration}));
  assert.ok(localLod.view.scale>180,'test never reached local scale');
  assert.equal(localLod.browseMain,'false','regional Sentinel quicklook is still covering the local navigation map');
  assert.equal(localLod.registration,'FOOTPRINT_QUAD_WARP');

  const beforeScene=await page.textContent('#currentScene'),beforeSrc=await page.evaluate(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src),beforeSeq=await page.evaluate(()=>globalThis.OMEGA_SAR_INTERACTION?.sourceSequence||0);
  await page.click('#play');
  await page.waitForFunction(({beforeScene,beforeSrc,beforeSeq})=>{const i=globalThis.OMEGA_SAR_INTERACTION,f=globalThis.OMEGA_SAR_SOURCE_FRAME,scene=document.querySelector('#currentScene')?.textContent||'';return i?.playing===true&&i.sourceSequence>beforeSeq&&scene!==beforeScene&&f?.src&&f.src!==beforeSrc;},{beforeScene,beforeSrc,beforeSeq},{timeout:45000});
  await page.click('#play');await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.playing===false,null,{timeout:5000});

  // Exact calibrated measurement is now a mandatory release gate, not an optional enhancement.
  await page.evaluate(()=>globalThis.OMEGA_SAR_SENTINEL?.loadCalibratedCurrent?.({force:true}));
  let calibrated=false;try{await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.patchSequence>=1,null,{timeout:45000});calibrated=true;}catch{}
  const calibration=await page.evaluate(()=>({
    calibrated,
    patchSequence:globalThis.OMEGA_SAR_INTERACTION?.patchSequence||0,
    anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length||0,
    badge:document.querySelector('#sarCalProof')?.textContent||'',
    rasterMessage:document.querySelector('#rasterEmpty')?.textContent||'',
    rasterStats:document.querySelector('#rasterStats')?.textContent||'',
    scene:document.querySelector('#currentScene')?.textContent||''
  }));
  assert.ok(calibrated,`exact Sentinel calibration did not resolve: ${JSON.stringify(calibration)}`);
  assert.ok(calibration.anchors>=4,'calibrated patch completed but did not enter OMEGA field');
  assert.match(calibration.rasterStats,/CALIBRATED GRD/);

  const field=await page.evaluate(()=>{const f=globalThis.OMEGA_SAR_CONTINUOUS_FIELD;return {numeric:f?.cells?.filter(c=>Number.isFinite(c.value)).length||0,badAdmission:f?.cells?.filter(c=>c.gammaAdmission?.startsWith('ADMIT')&&!Number.isFinite(c.value)).length||0,measuredAndInferred:f?.cells?.filter(c=>c.measured&&c.inferred).length||0};});
  assert.ok(field.numeric>0,'calibrated field remained nonnumeric');assert.equal(field.badAdmission,0);assert.equal(field.measuredAndInferred,0);
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log(JSON.stringify({pointBeforePan,beforeZoom,afterZoom,localLod,calibration,field},null,2));
  console.log('SAR_R4_LOCAL_NAV_EXACT_CALIBRATION_PASS');
}finally{await browser.close();}
