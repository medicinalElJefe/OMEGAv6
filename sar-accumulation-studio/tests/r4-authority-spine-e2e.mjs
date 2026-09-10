import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;assert.ok(base,'SAR_TEST_URL is required');
const tucson={lon:-110.9747,lat:32.2226};
const close=(a,b,eps=1e-6)=>Math.abs(Number(a)-Number(b))<=eps;
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},geolocation:{longitude:tucson.lon,latitude:tucson.lat,accuracy:18},permissions:['geolocation']});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});assert.ok(response?.ok(),`root HTTP ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.conception==='CONTINUOUS_SAR_EARTH_INSTRUMENT'&&globalThis.OMEGA_SAR_R4_RUNTIME?.geometry?.focus==='LOCAL_FORWARD_AND_INVERSE_JACOBIAN'&&globalThis.OMEGA_SAR_AUTHORITY&&globalThis.OMEGA_SAR_NAVIGATION?.selectTarget&&globalThis.OMEGA_SAR_INTERACTION&&globalThis.OMEGA_SAR_BLADE_RENDER?.state==='ACTIVE',null,{timeout:30000});
  assert.match(await page.title(),/OMEGA SAR R4/);assert.equal(await page.locator('.omega-local-nav-map').count(),0,'conventional local map must not replace the SAR instrument');

  await page.evaluate(({lon,lat})=>globalThis.OMEGA_SAR_LOCATION.jump(lon,lat,{name:'Tucson',region:'Arizona',country:'United States'}),tucson);
  await page.waitForFunction(({lon,lat})=>{const a=globalThis.OMEGA_SAR_AUTHORITY,n=globalThis.OMEGA_SAR_NAVIGATION;return a?.target&&n?.view&&Math.abs(a.target.lon-lon)<1e-6&&Math.abs(a.target.lat-lat)<1e-6&&Math.abs(n.view.centerLon-lon)<1e-6&&Math.abs(n.view.centerLat-lat)<1e-6&&n.view.scale>=100&&n.view.scale<=180;},tucson,{timeout:20000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0&&globalThis.OMEGA_SAR_SOURCE_FRAME?.src&&globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY,null,{timeout:80000});
  const initial=await page.evaluate(()=>({authority:globalThis.OMEGA_SAR_AUTHORITY.capture(),view:{...globalThis.OMEGA_SAR_RENDERER.view},source:globalThis.OMEGA_SAR_SOURCE_FRAME,visibility:globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY,baseOpacity:globalThis.OMEGA_SAR_RENDERER.baseOpacity,policy:globalThis.OMEGA_SAR_RENDER_POLICY,scene:(document.querySelector('#currentScene')?.textContent||'').trim()}));
  assert.equal(initial.authority.targetKey,`${tucson.lon.toFixed(6)},${tucson.lat.toFixed(6)}`);assert.ok(close(initial.view.centerLon,tucson.lon)&&close(initial.view.centerLat,tucson.lat));assert.equal(initial.policy?.mode,'SAR_FIRST');assert.ok(initial.baseOpacity<=.11);
  assert.notEqual(initial.source.registration,'FOOTPRINT_QUAD_WARP','legacy four-corner thumbnail warp must never return');
  assert.ok(initial.source.registration==='SAFE_PRODUCT_GCP_FULL_SCENE_BLADE_MESH'||String(initial.source.registration||'').startsWith('FOOTPRINT_ONLY_'),`unexpected source registration ${initial.source.registration}`);
  if(initial.visibility.reason==='GCP_BLADE_REGISTERED_SOURCE_BROWSE')assert.equal(initial.visibility.mainMapVisible,true);else assert.equal(initial.visibility.mainMapVisible,false,'unproven regional browse pixels must stay hidden');

  // A visual context from another bbox must never commit to the active SAR camera.
  const stale=await page.evaluate(async()=>{const a=globalThis.OMEGA_SAR_AUTHORITY,before=a.rejected.context;let rejected=false;try{await globalThis.OMEGA_SAR_RENDERER.setBaseImage('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="black"/></svg>',{bbox:[0,0,1,1],date:'2026-09-09'});}catch(e){rejected=e.code==='OMEGA_STALE_CONTEXT'||/Stale Earth context/.test(e.message);}return {rejected,before,after:a.rejected.context,view:{...globalThis.OMEGA_SAR_RENDERER.view}};});
  assert.equal(stale.rejected,true);assert.ok(stale.after>stale.before);assert.ok(close(stale.view.centerLon,tucson.lon)&&close(stale.view.centerLat,tucson.lat));

  // Exact calibration is mandatory in acceptance: no browse/inference substitution is allowed.
  let patch=await page.evaluate(()=>globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch||null);
  if(!patch)patch=await page.evaluate(async()=>globalThis.OMEGA_SAR_SENTINEL.loadCalibratedCurrent({force:true}));
  const readiness=await page.evaluate(()=>globalThis.OMEGA_SAR_MEASUREMENT_READINESS?.scenes?.get((document.querySelector('#currentScene')?.textContent||'').trim())||null);
  if(!patch)throw new Error(`Current acquisition did not resolve exact SAR during acceptance: ${JSON.stringify(readiness)}`);
  const exact={state:patch.state,id:patch.id,target:patch.target,validCount:patch.stats?.validCount,mesh:patch.geoMesh?.validNodeCount,evidence:patch.evidence};
  const scene=(await page.locator('#currentScene').textContent()||'').trim();assert.equal(exact.state,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.equal(exact.id,scene);assert.ok(close(exact.target.lon,tucson.lon,1e-4)&&close(exact.target.lat,tucson.lat,1e-4));assert.ok(exact.validCount>0&&exact.mesh>=4);assert.equal(exact.evidence?.measured,true);assert.equal(exact.evidence?.inferred,false);

  await page.waitForFunction(()=>globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length>=4&&globalThis.OMEGA_SAR_BLADE_FOCUS?.lens?.state==='BLADE_LENS_READY'&&document.querySelector('#omegaFitSar')?.disabled===false,null,{timeout:20000});
  const blade=await page.evaluate(()=>globalThis.OMEGA_SAR_BLADE_FOCUS.lens);
  assert.equal(blade.state,'BLADE_LENS_READY');assert.ok(Number.isFinite(blade.principalMetersPerPixel?.major)&&blade.principalMetersPerPixel.major>0);assert.ok(Number.isFinite(blade.principalMetersPerPixel?.minor)&&blade.principalMetersPerPixel.minor>0);assert.ok(Number.isFinite(blade.conditionNumber)&&blade.conditionNumber>=1);assert.ok(Number.isFinite(blade.inverseSourcePerMeter?.pixelPerEast)&&Number.isFinite(blade.inverseSourcePerMeter?.linePerNorth));
  const reverse=await page.evaluate(()=>globalThis.OMEGA_SAR_BLADE_FOCUS.reverseEastNorth(10,10));assert.ok(Number.isFinite(reverse?.pixel)&&Number.isFinite(reverse?.line));

  // Exact patch gets local visual authority; browse support must leave the local camera.
  const preFit=await page.evaluate(()=>({...globalThis.OMEGA_SAR_RENDERER.view}));await page.click('#omegaFitSar');await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT_EXPLICIT',null,{timeout:10000});
  const fitted=await page.evaluate(()=>({view:{...globalThis.OMEGA_SAR_RENDERER.view},target:globalThis.OMEGA_SAR_AUTHORITY.target,browse:document.querySelector('.sar-source-browse-canvas')?.dataset.mainMapVisible,overlay:globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state,anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length||0,blade:globalThis.OMEGA_SAR_BLADE_FOCUS?.lens?.state,baseOpacity:globalThis.OMEGA_SAR_RENDERER.baseOpacity}));
  assert.ok(fitted.view.scale>preFit.scale&&fitted.view.scale>180);assert.equal(fitted.browse,'false');assert.equal(fitted.overlay,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.equal(fitted.blade,'BLADE_LENS_READY');assert.ok(fitted.anchors>=4);assert.ok(fitted.baseOpacity<=.11);assert.ok(close(fitted.target.lon,tucson.lon,1e-4)&&close(fitted.target.lat,tucson.lat,1e-4));

  // Deliberately late/wrong async products are refused by the authority spine.
  const rejected=await page.evaluate(()=>{const a=globalThis.OMEGA_SAR_AUTHORITY,b={...a.rejected};window.dispatchEvent(new CustomEvent('omega-source-sar-frame',{detail:{id:'WRONG_SCENE',src:'wrong'}}));window.dispatchEvent(new CustomEvent('omega-calibrated-sar-patch',{detail:{patch:{id:'WRONG_SCENE',target:{lon:0,lat:0},evidence:{measured:true}}}}));return {before:b,after:{...a.rejected}};});
  assert.ok(rejected.after.source>rejected.before.source);assert.ok(rejected.after.measurement>rejected.before.measurement);assert.deepEqual(errors,[],`page errors: ${errors.join(' | ')}`);
  console.log(JSON.stringify({initial,stale,readiness,exact,blade,reverse,fitted,rejected},null,2));console.log('SAR_R4_R247_BLADE_AUTHORITY_FULL_PASS');
}finally{await browser.close();}
