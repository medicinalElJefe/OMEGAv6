import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.visualState==='HIGH_FIDELITY_MEASURED_MESH_PLUS_LIVE_PRECISION',null,{timeout:30000});
  await page.waitForSelector('#omegaPrecisionStrip',{state:'visible',timeout:30000});
  assert.match(await page.title(),/OMEGA SAR R4/);

  await page.locator('#jumpLat').fill('32.222600');
  await page.locator('#jumpLon').fill('-110.974700');
  await page.locator('#jumpLocation').click();

  await page.waitForFunction(()=>{
    const p=globalThis.OMEGA_SAR_RENDERER?.point;
    return p&&Math.abs(p.lat-32.2226)<1e-5&&Math.abs(p.lon+110.9747)<1e-5;
  },null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:80000});

  // A target may initially land on a source-valid acquisition whose exact product
  // calibration is unavailable. Use the actual R4 settlement path to select a real
  // loaded acquisition that proves exact measurement; no scene substitution is legal.
  let measured=await page.evaluate(()=>globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot?.truth?.measured===true);
  if(!measured){
    await page.evaluate(()=>globalThis.OMEGA_SAR_INTERACTION.settleExactMeasurement({maxScenes:24}));
  }
  await page.waitForFunction(()=>{
    const s=globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot;
    return s?.sceneId&&s?.sceneTime&&s.truth?.measured===true&&s.meshNodes>=4;
  },null,{timeout:120000,polling:250});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length>1000,null,{timeout:60000,polling:250});

  // Measurement-scale detail is intentionally explicit. Regional source view must not
  // silently jump the camera. FIT SAR is the governed transition to the georegistered patch.
  await page.waitForFunction(()=>document.querySelector('#omegaFitSar')?.disabled===false,null,{timeout:30000});
  const preFit=await page.evaluate(()=>({...globalThis.OMEGA_SAR_RENDERER.view}));
  await page.locator('#omegaFitSar').click();
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT_EXPLICIT'&&globalThis.OMEGA_SAR_RENDERER?.view?.scale>=900,null,{timeout:30000});

  const proof=await page.evaluate(()=>({
    runtime:globalThis.OMEGA_SAR_R4_RUNTIME,
    precision:globalThis.OMEGA_SAR_LIVE_PRECISION?.snapshot,
    overlay:globalThis.OMEGA_SAR_EARTH_OVERLAY,
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
  }));

  assert.equal(proof.precision.truth.surface,'CALIBRATED SAR');
  assert.equal(proof.precision.truth.measured,true);
  assert.equal(proof.overlay.measurement,true);
  assert.ok(proof.precision.meshNodes>=4);
  assert.ok(proof.field.cells>1000);
  assert.ok(proof.preFit.scale<=180,'measurement patch must not silently force local camera scale');
  assert.ok(proof.view.scale>=900);
  assert.ok(proof.view.scale>proof.preFit.scale);
  assert.equal(proof.focus.state,'CALIBRATED_PATCH_FIT_EXPLICIT');
  assert.ok(Math.abs(proof.target.lat-32.2226)<1e-5);
  assert.ok(Math.abs(proof.target.lon+110.9747)<1e-5);
  assert.equal(proof.renderPolicy.mode,'SAR_FIRST');
  assert.equal(proof.runtime.boundaries.browseIsMeasurement,false);
  assert.equal(proof.runtime.boundaries.inferenceIsObservation,false);
  assert.equal(proof.runtime.boundaries.realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling,true);
  assert.match(proof.precisionText,/CALIBRATED SAR/);
  assert.equal(proof.sourceVisibility?.mainMapVisible,false,'regional browse must be hidden at exact local measurement scale');

  await mkdir('test-results',{recursive:true});
  await page.locator('.map-wrap').screenshot({path:'test-results/r4-live-precision.png'});
  console.log('SAR_R4_LIVE_PRECISION_VISUAL_PASS',JSON.stringify(proof,null,2));
}finally{
  await browser.close();
}
