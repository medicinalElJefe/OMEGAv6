import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const tucson={lon:-110.9747,lat:32.2226};
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1720,height:1080},geolocation:{longitude:tucson.lon,latitude:tucson.lat,accuracy:18},permissions:['geolocation']});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root failed ${response?.status()}`);

  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R249'&&globalThis.OMEGA_EARTH_AWARENESS&&globalThis.OMEGA_WATER_OBSERVATION&&globalThis.OMEGA_EARTH_TEMPORAL_SYNC&&globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT&&globalThis.OMEGA_SAR_INTERACTION,null,{timeout:30000});
  await page.waitForSelector('#omegaPrecisionStrip',{state:'visible',timeout:30000});
  await page.waitForSelector('#omegaEarthAwarenessHud',{state:'attached',timeout:30000});
  await page.waitForSelector('#omegaJrcWaterControl',{state:'attached',timeout:30000});
  await page.waitForSelector('#omegaTemporalSyncHud',{state:'attached',timeout:30000});

  await page.evaluate(({lon,lat})=>globalThis.OMEGA_SAR_LOCATION.jump(lon,lat,{name:'Tucson',region:'Arizona',country:'United States'}),tucson);
  await page.waitForFunction(({lon,lat})=>{const t=globalThis.OMEGA_SAR_NAVIGATION?.target,v=globalThis.OMEGA_SAR_NAVIGATION?.view;return t&&v&&Math.abs(t.lon-lon)<1e-6&&Math.abs(t.lat-lat)<1e-6&&Math.abs(v.centerLon-lon)<1e-6&&Math.abs(v.centerLat-lat)<1e-6;},tucson,{timeout:20000});

  // Wide camera must remain truthful: no full-GRD browser read and no false measurement promotion.
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state==='SOURCE_CONTEXT_SCALE',null,{timeout:15000});
  const wide=await page.evaluate(()=>({scale:globalThis.OMEGA_SAR_RENDERER?.view?.scale,regional:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state,regionalVisible:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.visible,source:globalThis.OMEGA_SAR_SOURCE_FRAME?.src||null,browseMeasurement:globalThis.OMEGA_SAR_SOURCE_FRAME?.measurementPromotion||false}));
  assert.ok(wide.scale<260);assert.equal(wide.regional,'SOURCE_CONTEXT_SCALE');assert.equal(wide.regionalVisible,false);assert.equal(wide.browseMeasurement,false);

  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:90000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src,null,{timeout:30000});

  // Earth-awareness context: sourced terrain + separately labelled derived hydrology.
  await page.waitForFunction(()=>globalThis.OMEGA_EARTH_AWARENESS?.state==='READY'&&globalThis.OMEGA_EARTH_AWARENESS?.terrain?.rawDem===true&&globalThis.OMEGA_EARTH_AWARENESS?.water?.geometry?.accumulation?.length>100,null,{timeout:60000});
  const awareness=await page.evaluate(()=>globalThis.OMEGA_EARTH_AWARENESS.snapshot());
  assert.equal(awareness.terrain.measuredSar,false);assert.equal(awareness.water.observedWater,false);assert.ok(awareness.water.summary.cells>100);assert.match(awareness.water.summary.boundary,/not observed water depth/i);

  // EC JRC observed historical water is a separate observation context and remains non-numeric RGB map support.
  await page.waitForFunction(()=>['READY','OUT_OF_SCALE'].includes(globalThis.OMEGA_WATER_OBSERVATION?.state),null,{timeout:45000});
  const waterObs=await page.evaluate(()=>globalThis.OMEGA_WATER_OBSERVATION.snapshot());
  assert.equal(waterObs.source,'EC_JRC_GLOBAL_SURFACE_WATER_2024');assert.equal(waterObs.period,'1984-2024');assert.match(waterObs.analysisBoundary,/not decoded as numeric/i);
  if(waterObs.state==='READY')assert.ok(waterObs.visibleTiles>0);

  // Source event metadata is synchronized to the actual SAR acquisition time and target without causal inflation.
  await page.waitForFunction(()=>globalThis.OMEGA_EARTH_TEMPORAL_SYNC?.state==='SYNCHRONIZED'&&globalThis.OMEGA_EARTH_TEMPORAL_SYNC?.sceneTime,null,{timeout:45000});
  const sync=await page.evaluate(()=>globalThis.OMEGA_EARTH_TEMPORAL_SYNC.snapshot());
  assert.equal(sync.state,'SYNCHRONIZED');assert.ok(sync.sceneTime);assert.ok(sync.target);assert.match(sync.boundary,/not evidence of causation/i);

  // Exact measured Sentinel-1 remains the mandatory high-fidelity local evidence plane.
  let exact=await page.evaluate(()=>globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH');
  if(!exact){await page.evaluate(()=>globalThis.OMEGA_SAR_INTERACTION.settleExactMeasurement({maxScenes:24}));}
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&globalThis.OMEGA_SAR_EARTH_OVERLAY?.measurement===true&&globalThis.OMEGA_SAR_BLADE_FOCUS?.lens?.state==='BLADE_LENS_READY'&&document.querySelector('#omegaFitSar')?.disabled===false,null,{timeout:120000,polling:250});
  const exactProof=await page.evaluate(()=>{const p=globalThis.OMEGA_SAR_RENDERER.sarOverlay.patch;return {state:p.state,validCount:p.stats?.validCount||0,mesh:p.geoMesh?.validNodeCount||0,evidence:p.evidence,blade:globalThis.OMEGA_SAR_BLADE_FOCUS?.lens,view:{...globalThis.OMEGA_SAR_RENDERER.view}};});
  assert.ok(exactProof.validCount>0);assert.ok(exactProof.mesh>=4);assert.equal(exactProof.evidence?.measured,true);assert.equal(exactProof.evidence?.inferred,false);assert.ok(exactProof.blade?.conditionNumber>0);

  // FIT SAR is explicit user framing; it must expose the exact patch and suppress broader source/regional imagery.
  await page.click('#omegaFitSar');
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT_EXPLICIT'&&globalThis.OMEGA_SAR_RENDERER?.view?.scale>=900,null,{timeout:30000});
  await page.waitForTimeout(400);
  const fitted=await page.evaluate(()=>({view:{...globalThis.OMEGA_SAR_RENDERER.view},target:{...globalThis.OMEGA_SAR_NAVIGATION.target},regionalState:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state,regionalVisible:document.querySelector('.omega-regional-sar-layer canvas')?.dataset.visible,browseVisible:document.querySelector('.sar-source-browse-canvas')?.dataset.mainMapVisible,precision:globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot}));
  assert.ok(fitted.view.scale>=900);assert.ok(Math.abs(fitted.target.lon-tucson.lon)<1e-4&&Math.abs(fitted.target.lat-tucson.lat)<1e-4);assert.equal(fitted.regionalVisible,'false');assert.equal(fitted.browseVisible,'false');assert.equal(fitted.precision?.truth?.exactMeasured,true);

  const runtime=await page.evaluate(()=>globalThis.OMEGA_SAR_R4_RUNTIME);
  assert.equal(runtime.boundaries.browseIsMeasurement,false);assert.equal(runtime.boundaries.topographicFlowPotentialIsObservedWater,false);assert.equal(runtime.boundaries.jrcRgbTilesAreNumericWaterAnalysis,false);assert.equal(runtime.boundaries.eventProximityImpliesCausation,false);assert.equal(runtime.boundaries.canonIsPhysicalMeasurement,false);
  assert.deepEqual(pageErrors,[],`page script errors: ${pageErrors.join(' | ')}`);

  await mkdir('test-results',{recursive:true});await page.locator('.map-wrap').screenshot({path:'test-results/r249-full-build.png'});
  console.log('SAR_R4_R249_FULL_BUILD_PASS',JSON.stringify({wide,awareness,waterObs,sync,exactProof,fitted},null,2));
}finally{await browser.close();}
