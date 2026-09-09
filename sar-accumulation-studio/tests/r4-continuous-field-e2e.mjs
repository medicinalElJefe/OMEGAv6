import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;assert.ok(base,'SAR_TEST_URL is required');
const browser=await chromium.launch({headless:true});const tucson={lon:-110.9747,lat:32.2226};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},geolocation:{longitude:tucson.lon,latitude:tucson.lat,accuracy:18},permissions:['geolocation']});
  const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForSelector('#omegaFieldHud',{state:'visible',timeout:20000});await page.waitForSelector('#omegaActionHud',{state:'visible',timeout:20000});await page.waitForSelector('#omegaMapNav',{state:'visible',timeout:20000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length>100&&globalThis.OMEGA_SAR_LOCATION?.jump&&globalThis.OMEGA_SAR_NAVIGATION?.focusLocation,null,{timeout:30000});

  // Exercise the exact post-search path without depending on a geocoder during CI.
  await page.evaluate(({lon,lat})=>globalThis.OMEGA_SAR_LOCATION.jump(lon,lat,{name:'Tucson',region:'Arizona',country:'United States'}),tucson);
  await page.waitForFunction(({lat,lon})=>{const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/),v=globalThis.OMEGA_SAR_NAVIGATION?.view;return !!p&&v&&Math.abs(Number(p[1])-lat)<1e-4&&Math.abs(Number(p[2])-lon)<1e-4&&Math.abs(v.centerLat-lat)<1e-6&&Math.abs(v.centerLon-lon)<1e-6&&v.scale>=100&&v.scale<=180;},tucson,{timeout:20000});
  assert.equal(await page.locator('.omega-local-nav-map').count(),0,'conventional local map layer was reintroduced');

  // Prove the click inverse comes from the exact same camera used by the visible SAR Earth surface.
  const mapBox=await page.locator('#map').boundingBox();assert.ok(mapBox,'map has no browser box');
  const clickX=mapBox.x+mapBox.width*.58,clickY=mapBox.y+mapBox.height*.54;
  const expected=await page.evaluate(({x,y})=>{const rect=document.querySelector('#map').getBoundingClientRect(),r=globalThis.OMEGA_SAR_NAVIGATION.renderer();const px=x-rect.left,py=y-rect.top,[lon,lat]=r.unproject(px,py);return {lon,lat};},{x:clickX,y:clickY});
  await page.mouse.click(clickX,clickY);await page.waitForFunction(({lon,lat})=>{const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);return !!p&&Math.abs(Number(p[1])-lat)<2e-4&&Math.abs(Number(p[2])-lon)<2e-4;},expected,{timeout:8000});

  // Return through the same search-result path and prove the camera/target converge again.
  await page.evaluate(({lon,lat})=>globalThis.OMEGA_SAR_LOCATION.jump(lon,lat,{name:'Tucson',region:'Arizona',country:'United States'}),tucson);
  await page.waitForFunction(({lat,lon})=>{const v=globalThis.OMEGA_SAR_NAVIGATION?.view;return v&&Math.abs(v.centerLat-lat)<1e-6&&Math.abs(v.centerLon-lon)<1e-6;},tucson,{timeout:10000});
  const pointBeforePan=await page.textContent('#point');
  await page.mouse.move(mapBox.x+mapBox.width*.55,mapBox.y+mapBox.height*.55);await page.mouse.down();await page.mouse.move(mapBox.x+mapBox.width*.68,mapBox.y+mapBox.height*.63,{steps:7});await page.mouse.up();await page.waitForTimeout(250);assert.equal(await page.textContent('#point'),pointBeforePan,'drag/pan rebound the SAR target');

  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:70000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src&&globalThis.OMEGA_SAR_INTERACTION?.sourceSequence>=1,null,{timeout:30000});
  const sourceState=await page.evaluate(()=>({scale:globalThis.OMEGA_SAR_NAVIGATION?.view?.scale,mainVisible:document.querySelector('.sar-source-browse-canvas')?.dataset.mainMapVisible,registration:globalThis.OMEGA_SAR_SOURCE_FRAME?.registration,src:globalThis.OMEGA_SAR_SOURCE_FRAME?.src}));
  assert.ok(sourceState.scale<=180,'source SAR stage jumped to an unsupported local map scale');assert.equal(sourceState.mainVisible,'true','source SAR browse is not visible during source-backed regional stage');assert.equal(sourceState.registration,'FOOTPRINT_QUAD_WARP');assert.ok(sourceState.src);

  // Play must visibly change the real source SAR scene before exact local calibration.
  const beforeScene=await page.textContent('#currentScene'),beforeSrc=sourceState.src,beforeSeq=await page.evaluate(()=>globalThis.OMEGA_SAR_INTERACTION?.sourceSequence||0);
  await page.click('#play');await page.waitForFunction(({beforeScene,beforeSrc,beforeSeq})=>{const i=globalThis.OMEGA_SAR_INTERACTION,f=globalThis.OMEGA_SAR_SOURCE_FRAME,scene=document.querySelector('#currentScene')?.textContent||'';return i?.playing===true&&i.sourceSequence>beforeSeq&&scene!==beforeScene&&f?.src&&f.src!==beforeSrc;},{beforeScene,beforeSrc,beforeSeq},{timeout:45000});
  await page.click('#play');await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.playing===false,null,{timeout:5000});

  // Exact local SAR is mandatory: real pixels + LUT + source Earth registration + main-map overlay.
  const patch=await page.evaluate(async()=>{const p=await globalThis.OMEGA_SAR_SENTINEL?.loadCalibratedCurrent?.({force:true});return p?{state:p.state,id:p.id,target:p.target,validCount:p.stats?.validCount,geolocation:p.geolocation,mesh:p.geoMesh,evidence:p.evidence}:null;});
  assert.ok(patch,`exact Sentinel calibration returned no patch: ${await page.textContent('#rasterEmpty')}`);assert.equal(patch.state,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.ok(patch.validCount>0);assert.equal(patch.evidence?.measured,true);assert.equal(patch.evidence?.inferred,false);assert.ok(patch.mesh?.validNodeCount>=4);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length>=4,null,{timeout:15000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT',null,{timeout:10000});
  const local=await page.evaluate(()=>({scale:globalThis.OMEGA_SAR_NAVIGATION?.view?.scale,browseMain:document.querySelector('.sar-source-browse-canvas')?.dataset.mainMapVisible,overlay:globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state,focus:globalThis.OMEGA_SAR_LOCAL_FOCUS,anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length||0,rasterStats:document.querySelector('#rasterStats')?.textContent||''}));
  assert.ok(local.scale>180,'calibrated SAR patch did not become the local primary view');assert.equal(local.browseMain,'false','regional quicklook still covers exact local SAR');assert.equal(local.overlay,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.ok(local.anchors>=4);assert.match(local.rasterStats,/CALIBRATED GRD/);

  const field=await page.evaluate(()=>{const f=globalThis.OMEGA_SAR_CONTINUOUS_FIELD;return {numeric:f?.cells?.filter(c=>Number.isFinite(c.value)).length||0,badAdmission:f?.cells?.filter(c=>c.gammaAdmission?.startsWith('ADMIT')&&!Number.isFinite(c.value)).length||0,measuredAndInferred:f?.cells?.filter(c=>c.measured&&c.inferred).length||0};});
  assert.ok(field.numeric>0);assert.equal(field.badAdmission,0);assert.equal(field.measuredAndInferred,0);assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log(JSON.stringify({expected,sourceState,patch,local,field},null,2));console.log('SAR_R4_SINGLE_CAMERA_SOURCE_TO_CALIBRATED_SAR_PASS');
}finally{await browser.close();}
