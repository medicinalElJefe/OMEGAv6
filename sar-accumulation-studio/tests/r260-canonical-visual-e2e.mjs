import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root HTTP ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.visualRelease==='R260'&&globalThis.OMEGA_EARTH_CANON?.state==='READY'&&globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD&&globalThis.OMEGA_EARTH_CANON_R260_DETAIL,null,{timeout:30000});
  const boot=await page.evaluate(()=>({runtime:globalThis.OMEGA_SAR_R4_RUNTIME,domains:globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD.domains,fieldState:globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD.state}));
  assert.equal(boot.runtime.featureRelease,'R259');assert.equal(boot.runtime.visualRelease,'R260');assert.equal(boot.runtime.patchRelease,'R260.3');assert.equal(boot.runtime.boundaries.structureTensorCreatesMeasurement,false);assert.equal(boot.runtime.boundaries.structureTensorIsInterferometricCoherence,false);for(const k of ['GNSS','STRAIN','SEISMIC','TILT','PORE_PRESSURE','ENVIRONMENT'])assert.equal(boot.domains[k].status,'ADAPTER_PENDING');

  await page.evaluate(()=>{globalThis.OMEGA_SAR_EXPERIENCE?.setMode?.('explore');globalThis.OMEGA_SAR_EXPERIENCE?.setDrawer?.(null);globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'});});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state==='READY'&&globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.evidence?.measured===true,null,{timeout:160000,polling:250});
  await page.waitForFunction(()=>globalThis.OMEGA_EARTH_CANON_CUBE?.renderPlan?.authority==='REGIONAL_MEASURED_SAR'&&globalThis.OMEGA_EARTH_CANON_R260_DETAIL?.state==='READY'&&globalThis.OMEGA_EARTH_CANON_R260_DETAIL?.renderedCells>0&&globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD?.field?.state==='READY'&&globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD?.field?.channels?.measuredLuminance===1,null,{timeout:60000,polling:150});
  const live=await page.evaluate(()=>{
    const detail=globalThis.OMEGA_EARTH_CANON_R260_DETAIL,field=globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD.field,regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch,map=document.querySelector('.map-wrap').getBoundingClientRect(),canvas=document.querySelector('.omega-earth-canon-r260-detail canvas').getBoundingClientRect();
    return {detail:{state:detail.state,source:detail.source,stats:detail.stats,terrainCoverage:detail.terrainCoverage,cells:detail.renderedCells,boundary:detail.boundary},field:{state:field.state,renderState:field.renderState,channels:field.channels,gate:field.gate,support:field.support,boundary:field.boundary},regional:{width:regional.width,height:regional.height,measured:regional.evidence.measured,inferred:regional.evidence.inferred},map:{width:map.width,height:map.height},canvas:{width:canvas.width,height:canvas.height},oldCanonOpacity:Number(getComputedStyle(document.querySelector('.omega-earth-canon-detail')).opacity),r258Opacity:Number(getComputedStyle(document.querySelector('.omega-r258-calculus-layer')).opacity)};
  });
  assert.equal(live.regional.measured,true);assert.equal(live.regional.inferred,false);assert.ok(Math.max(live.regional.width,live.regional.height)>=520);assert.equal(live.detail.source.evidence.measured,true);assert.ok(live.detail.stats.valid>50000);assert.ok(live.detail.stats.tensor.validCount>50000);assert.ok(live.detail.stats.tensor.meanAnisotropy>=0&&live.detail.stats.tensor.meanAnisotropy<=1);assert.ok(live.detail.stats.structureFraction>.90);assert.equal(live.field.channels.measuredLuminance,1);assert.ok(live.field.channels.measuredStructure<=.28);assert.ok(live.field.channels.terrainRelief<=.18);assert.ok(live.field.channels.reconstruction<=.02);assert.match(live.field.boundary,/cannot create missing sensor samples/i);assert.match(live.detail.boundary,/No missing sensor detail|No missing/i);assert.ok(live.map.width>1600&&live.map.height>780,'image plane is not dominant');assert.ok(Math.abs(live.canvas.width-live.map.width)<2&&Math.abs(live.canvas.height-live.map.height)<2,'R260 canvas does not fill image plane');assert.ok(live.oldCanonOpacity<=.001,'R259 detail is still double-exposed under R260');assert.ok(live.r258Opacity<=.001,'R258 calculus detail is still double-exposed under R260');

  await page.selectOption('#omegaR258LayerSelect','gradient');await page.waitForFunction(()=>globalThis.OMEGA_SAR_R258_CALCULUS?.mode==='gradient'&&globalThis.OMEGA_SAR_R258_CALCULUS?.layerVisible===true&&globalThis.OMEGA_EARTH_CANON_R260_DETAIL?.state==='STANDBY_SPECIALIZED_VIEW',null,{timeout:7000});
  await page.selectOption('#omegaR258LayerSelect','detail');await page.waitForFunction(()=>globalThis.OMEGA_EARTH_CANON_R260_DETAIL?.state==='READY'&&globalThis.OMEGA_EARTH_CANON_R260_DETAIL?.renderedCells>0,null,{timeout:7000});

  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/r260-canonical-visual-cube.png',fullPage:false});
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log('SAR_R260_CANONICAL_VISUAL_CUBE_PASS',JSON.stringify({boot:{visualRelease:boot.runtime.visualRelease,patchRelease:boot.runtime.patchRelease},live},null,2));
}finally{await browser.close();}
