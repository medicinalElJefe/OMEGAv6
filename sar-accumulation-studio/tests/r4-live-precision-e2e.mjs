import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R248'&&/ADAPTIVE_MEASURED_REGIONAL_SAR/.test(globalThis.OMEGA_SAR_R4_RUNTIME?.visualState||''),null,{timeout:30000});
  await page.waitForSelector('#omegaPrecisionStrip',{state:'visible',timeout:30000});
  assert.match(await page.title(),/OMEGA SAR R4/);

  await page.locator('#jumpLat').fill('32.222600');
  await page.locator('#jumpLon').fill('-110.974700');
  await page.locator('#jumpLocation').click();

  await page.waitForFunction(()=>{const p=globalThis.OMEGA_SAR_RENDERER?.point;return p&&Math.abs(p.lat-32.2226)<1e-5&&Math.abs(p.lon+110.9747)<1e-5;},null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:80000});

  // At regional scale the primary evidence should become actual calibrated Sentinel-1,
  // not an enlarged quicklook. This is allowed to be measured before the local target
  // patch resolves, but it does not substitute for the exact-patch gate below.
  await page.waitForFunction(()=>{const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT,s=globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot;return r?.state==='READY'&&r.visible===true&&r.patch?.evidence?.measured===true&&s?.truth?.regionalMeasured===true;},null,{timeout:120000,polling:250});
  const regionalProof=await page.evaluate(()=>({precision:globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot,regional:{state:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state,visible:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.visible,patchState:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.state,validCount:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.stats?.validCount,evidence:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.evidence},sourceVisibility:globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY}));
  assert.equal(regionalProof.precision.truth.surface,'CALIBRATED REGIONAL SAR');assert.equal(regionalProof.precision.truth.regionalMeasured,true);assert.equal(regionalProof.regional.patchState,'CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT');assert.ok(regionalProof.regional.validCount>100);assert.equal(regionalProof.regional.evidence?.inferred,false);

  // Exact target measurement remains a separate, stronger gate.
  if(globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot?.truth?.exactMeasured!==true){await page.evaluate(()=>globalThis.OMEGA_SAR_INTERACTION.settleExactMeasurement({maxScenes:24}));}
  await page.waitForFunction(()=>{const s=globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot;return s?.sceneId&&s?.sceneTime&&s.truth?.exactMeasured===true&&globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH';},null,{timeout:120000,polling:250});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length>1000,null,{timeout:60000,polling:250});

  await page.waitForFunction(()=>document.querySelector('#omegaFitSar')?.disabled===false,null,{timeout:30000});
  const preFit=await page.evaluate(()=>({...globalThis.OMEGA_SAR_RENDERER.view}));
  await page.locator('#omegaFitSar').click();
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT_EXPLICIT'&&globalThis.OMEGA_SAR_RENDERER?.view?.scale>=900,null,{timeout:30000});
  await page.waitForTimeout(300);

  const proof=await page.evaluate(preFit=>({
    runtime:globalThis.OMEGA_SAR_R4_RUNTIME,
    precision:globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot,
    overlay:globalThis.OMEGA_SAR_EARTH_OVERLAY,
    regional:{state:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state,visible:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.visible,canvasVisible:document.querySelector('.omega-regional-sar-layer canvas')?.dataset.visible},
    awareness:globalThis.OMEGA_EARTH_AWARENESS?.snapshot?.()||null,
    blade:globalThis.OMEGA_SAR_BLADE_FOCUS?.lens||null,
    renderPolicy:globalThis.OMEGA_SAR_RENDER_POLICY,
    target:globalThis.OMEGA_SAR_RENDERER?.point,
    view:globalThis.OMEGA_SAR_RENDERER?.view,
    preFit,
    focus:globalThis.OMEGA_SAR_LOCAL_FOCUS,
    settlement:globalThis.OMEGA_SAR_EXACT_SETTLEMENT||null,
    field:{cells:globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length||0,summary:globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.summary||null},
    liveTag:document.querySelector('#liveTag')?.textContent,
    precisionText:document.querySelector('#omegaPrecisionStrip')?.innerText,
    sourceVisibility:globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY,
    actionText:document.querySelector('#omegaActionHud')?.innerText
  }),preFit);

  assert.equal(proof.precision.truth.surface,'CALIBRATED LOCAL SAR');
  assert.equal(proof.precision.truth.measured,true);assert.equal(proof.precision.truth.exactMeasured,true);
  assert.equal(proof.overlay.measurement,true);assert.ok(proof.precision.meshNodes>=4);assert.ok(proof.field.cells>1000);
  assert.ok(proof.preFit.scale<=180,'measurement patch must not silently force local camera scale');assert.ok(proof.view.scale>=900);assert.ok(proof.view.scale>proof.preFit.scale);
  assert.equal(proof.focus.state,'CALIBRATED_PATCH_FIT_EXPLICIT');assert.equal(proof.blade?.state,'BLADE_LENS_READY');assert.ok(Math.abs(proof.target.lat-32.2226)<1e-5);assert.ok(Math.abs(proof.target.lon+110.9747)<1e-5);
  assert.equal(proof.renderPolicy.mode,'SAR_FIRST');assert.equal(proof.runtime.boundaries.browseIsMeasurement,false);assert.equal(proof.runtime.boundaries.inferenceIsObservation,false);assert.equal(proof.runtime.boundaries.topographicFlowPotentialIsObservedWater,false);assert.equal(proof.runtime.boundaries.canonIsPhysicalMeasurement,false);assert.equal(proof.runtime.boundaries.realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling,true);
  assert.match(proof.precisionText,/CALIBRATED LOCAL SAR/);assert.equal(proof.sourceVisibility?.mainMapVisible,false,'source browse must be hidden at exact local measurement scale');assert.equal(proof.regional.canvasVisible,'false','regional measured viewport must yield at exact local measurement scale');

  await mkdir('test-results',{recursive:true});
  await page.locator('.map-wrap').screenshot({path:'test-results/r4-live-precision.png'});
  console.log('SAR_R4_R248_LIVE_PRECISION_VISUAL_PASS',JSON.stringify({regionalProof,proof},null,2));
}finally{await browser.close();}
