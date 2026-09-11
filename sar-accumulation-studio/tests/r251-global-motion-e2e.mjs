import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root failed ${response?.status()}`);

  await page.waitForFunction(()=>{const r=globalThis.OMEGA_SAR_R4_RUNTIME,conception=r?.conception,m=globalThis.OMEGA_SAR_SMOOTH_MOTION,map=document.querySelector('#map'),motionInstalled=m?.contract==='OMEGA_SAR_SMOOTH_MOTION_V1'&&m?.installed===true&&map?.dataset?.omegaSmoothMotion==='true'&&typeof m?.cancel==='function'&&typeof m?.install==='function'&&m?.state!=='INITIALIZING';return ['CONTINUOUS_SAR_EARTH_INSTRUMENT','CONTINUOUS_MULTI_SOURCE_EARTH_COMPUTATION_AND_SAR_INSTRUMENT'].includes(conception)&&motionInstalled&&globalThis.OMEGA_SAR_GLOBAL_FABRIC&&globalThis.OMEGA_SAR_WOVEN_MOTION&&globalThis.OMEGA_SAR_LEMMA_TRANSLATOR;},null,{timeout:45000,polling:100});
  assert.match(await page.title(),/OMEGA SAR R4/);

  try{
    await page.waitForFunction(()=>{const g=globalThis.OMEGA_SAR_GLOBAL_FABRIC;return g?.state==='READY'&&g.fabric?.cells?.some(c=>c.coverage>0)&&g.records?.length>20;},null,{timeout:120000,polling:250});
  }catch(error){
    const diagnosis=await page.evaluate(()=>({fabric:globalThis.OMEGA_SAR_GLOBAL_FABRIC?.snapshot?.()||globalThis.OMEGA_SAR_GLOBAL_FABRIC||null,coherence:globalThis.OMEGA_SAR_FABRIC_COHERENCE_TRANSPORT?.snapshot?.()||globalThis.OMEGA_SAR_FABRIC_COHERENCE_TRANSPORT||null,renderer:globalThis.OMEGA_SAR_RENDERER?.view||null,pageErrors:window.__omegaR251PageErrors||[]}));
    console.error('SAR_R251_GLOBAL_FABRIC_TIMEOUT_DIAGNOSIS',JSON.stringify(diagnosis,null,2));throw error;
  }
  const fabric=await page.evaluate(()=>{const g=globalThis.OMEGA_SAR_GLOBAL_FABRIC,f=g.fabric,covered=f.cells.filter(c=>c.coverage>0),source=covered[0];return {snapshot:g.snapshot(),recordCount:g.records.length,covered:covered.length,total:f.cells.length,lod:f.lod,sourceCell:{coverage:source.coverage,cog:source.cog,lemma:source.lemma},boundary:g.boundary};});
  assert.ok(fabric.recordCount>20);assert.ok(fabric.covered>0);assert.ok(fabric.total>=72);assert.equal(fabric.lod.physicalDimensionClaim,false);assert.equal(fabric.sourceCell.lemma.state,'SOURCE_COVERED');assert.equal(fabric.sourceCell.lemma.proof.measured,false);assert.equal(fabric.sourceCell.lemma.proof.sourceSupported,true);assert.match(fabric.boundary,/not a global calibrated SAR mosaic/i);

  await page.waitForFunction(()=>globalThis.OMEGA_SAR_LEMMA_TRANSLATOR?.state==='READY'&&globalThis.OMEGA_SAR_LEMMA_TRANSLATOR?.annotated>100,null,{timeout:30000,polling:100});
  const lemma=await page.evaluate(()=>globalThis.OMEGA_SAR_LEMMA_TRANSLATOR.snapshot());
  assert.ok(lemma.annotated>100);assert.ok(Object.keys(lemma.counts).length>0);assert.match(lemma.boundary,/does not change measured values/i);

  const framesBefore=await page.evaluate(()=>globalThis.OMEGA_SAR_WOVEN_MOTION.frames);
  await page.waitForTimeout(350);
  const woven=await page.evaluate(()=>({state:globalThis.OMEGA_SAR_WOVEN_MOTION.state,frames:globalThis.OMEGA_SAR_WOVEN_MOTION.frames,boundary:globalThis.OMEGA_SAR_WOVEN_MOTION.boundary}));
  assert.equal(woven.state,'RUNNING');assert.ok(woven.frames>framesBefore);assert.match(woven.boundary,/not measured ground velocity/i);assert.match(woven.boundary,/not.*continuous live radar/i);

  const map=page.locator('#map'),box=await map.boundingBox();assert.ok(box,'map has no browser box');
  await page.evaluate(()=>{window.__omegaMotionSamples=[];window.__omegaSelects=0;const m=document.querySelector('#map');m.addEventListener('omega-map-view',e=>window.__omegaMotionSamples.push({...e.detail,at:performance.now()}));m.addEventListener('omega-map-select',()=>window.__omegaSelects++);});

  await page.mouse.move(box.x+box.width*.57,box.y+box.height*.48);
  const beforeZoom=await page.evaluate(()=>({scale:globalThis.OMEGA_SAR_RENDERER.view.scale,settles:globalThis.OMEGA_SAR_SMOOTH_MOTION.settles}));
  await page.mouse.wheel(0,-320);
  await page.waitForFunction(before=>globalThis.OMEGA_SAR_SMOOTH_MOTION.settles>before.settles&&globalThis.OMEGA_SAR_SMOOTH_MOTION.state==='SMOOTH_ZOOM'||globalThis.OMEGA_SAR_SMOOTH_MOTION.settles>before.settles,beforeZoom,{timeout:10000});
  const zoom=await page.evaluate(before=>{const samples=window.__omegaMotionSamples.map(x=>x.scale),unique=[...new Set(samples.map(x=>Number(x).toFixed(5)))].map(Number),r=globalThis.OMEGA_SAR_RENDERER;let maxRatio=1;for(let i=1;i<unique.length;i++)maxRatio=Math.max(maxRatio,Math.max(unique[i]/unique[i-1],unique[i-1]/unique[i]));return {before:before.scale,after:r.view.scale,samples:unique.length,maxRatio,settles:globalThis.OMEGA_SAR_SMOOTH_MOTION.settles};},beforeZoom);
  assert.ok(zoom.after>zoom.before*1.08,'wheel did not zoom in');assert.ok(zoom.samples>=3,`zoom was not interpolated; only ${zoom.samples} camera states`);assert.ok(zoom.maxRatio<1.25,`zoom had a large single-frame jump ratio ${zoom.maxRatio}`);

  await page.evaluate(()=>{window.__omegaMotionSamples=[];window.__omegaSelects=0;});
  const beforeDrag=await page.evaluate(()=>({view:{...globalThis.OMEGA_SAR_RENDERER.view},settles:globalThis.OMEGA_SAR_SMOOTH_MOTION.settles}));
  await page.mouse.move(box.x+box.width*.54,box.y+box.height*.55);await page.mouse.down();await page.mouse.move(box.x+box.width*.68,box.y+box.height*.62,{steps:12});await page.mouse.up();
  await page.waitForFunction(before=>globalThis.OMEGA_SAR_SMOOTH_MOTION.settles>before.settles&&!globalThis.OMEGA_SAR_SMOOTH_MOTION.drag&&!globalThis.OMEGA_SAR_SMOOTH_MOTION.inertia,beforeDrag,{timeout:12000});
  const drag=await page.evaluate(before=>({before:before.view,after:{...globalThis.OMEGA_SAR_RENDERER.view},samples:window.__omegaMotionSamples.length,selects:window.__omegaSelects,state:globalThis.OMEGA_SAR_SMOOTH_MOTION.state,settles:globalThis.OMEGA_SAR_SMOOTH_MOTION.settles}),beforeDrag);
  assert.ok(Math.abs(drag.after.centerLon-drag.before.centerLon)>.01||Math.abs(drag.after.centerLat-drag.before.centerLat)>.01,'drag did not move camera');assert.ok(drag.samples>=3,'drag was not frame-coalesced across multiple camera states');assert.equal(drag.selects,0,'drag accidentally selected a SAR target');

  const runtime=await page.evaluate(()=>globalThis.OMEGA_SAR_R4_RUNTIME);
  assert.equal(runtime.boundaries.globalFabricIsCalibratedMosaic,false);assert.equal(runtime.boundaries.wovenMotionIsGroundVelocity,false);assert.equal(runtime.boundaries.mode188CreatesPhysicalLaw,false);assert.equal(runtime.boundaries.atlasAddressIsPhysicalDimension,false);
  assert.deepEqual(pageErrors,[],`page script errors: ${pageErrors.join(' | ')}`);

  await mkdir('test-results',{recursive:true});await page.locator('.map-wrap').screenshot({path:'test-results/r251-global-motion.png'});
  console.log('SAR_R4_RELEASE_FORWARD_GLOBAL_MOTION_PASS',JSON.stringify({release:runtime.release,featureRelease:runtime.featureRelease,visualRelease:runtime.visualRelease||null,motionContract:'OMEGA_SAR_SMOOTH_MOTION_V1',fabric,lemma,woven,zoom,drag},null,2));
}finally{await browser.close();}
