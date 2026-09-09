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
  const initial=await page.evaluate(()=>({cells:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.length,modes:globalThis.OMEGA_SAR_SKINS,prior:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.filter(c=>c.state==='CONTEXT_PRIOR').length}));
  assert.ok(initial.cells>100,'continuous field not initialized');
  assert.ok(initial.prior>0,'world structural prior missing before local SAR load');
  for(const name of ['OVERALL_CANON','UNIFIED_COHERENCE','MODE188','DEEP_MOTHER','HIGH_FATHER','NO_NOTHING_TRUTH','GUIDANCE_FIELD','FULL_SPHERE','ALPHA','CRIMSON','FORECAST','RECOVERY','STABILIZATION','INTEGRATION','TRUTH_TRAVERSAL','RAFT188','CTDE','GAMMA_ADMISSION','CONTINUANCE_EVOLUTION','HEAVY_PRUNE','REALTIME_SATELLITE_SKIN'])assert.ok(initial.modes.includes(name),`mode missing: ${name}`);

  // Exact user complaint: USE DEVICE LOCATION must actually move and bind the map to that location.
  await page.click('#deviceLocation');
  await page.waitForFunction(({lat,lon})=>{
    const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);return !!p&&Math.abs(Number(p[1])-lat)<.01&&Math.abs(Number(p[2])-lon)<.01;
  },tucson,{timeout:20000});
  await page.waitForFunction(({lat,lon})=>{
    const v=globalThis.OMEGA_SAR_NAVIGATION?.view;return v&&Math.abs(v.centerLat-lat)<.03&&Math.abs(v.centerLon-lon)<.03&&v.scale>=700;
  },tucson,{timeout:15000});
  const locationState=await page.evaluate(()=>({point:document.querySelector('#point')?.textContent,selected:document.querySelector('#selectedPlaceCoords')?.textContent||'',view:globalThis.OMEGA_SAR_NAVIGATION?.view,status:document.querySelector('#status')?.textContent||''}));
  assert.match(locationState.point,/32\.22/);assert.ok(locationState.view.scale>=700,'device target remained at a regional/world scale');

  // A pan must never become a new measurement target.
  const mapBox=await page.locator('#map').boundingBox();assert.ok(mapBox,'map has no browser box');
  const pointBeforePan=await page.textContent('#point');
  await page.mouse.move(mapBox.x+mapBox.width*.55,mapBox.y+mapBox.height*.55);
  await page.mouse.down();await page.mouse.move(mapBox.x+mapBox.width*.68,mapBox.y+mapBox.height*.63,{steps:7});await page.mouse.up();
  await page.waitForTimeout(350);
  const pointAfterPan=await page.textContent('#point');
  assert.equal(pointAfterPan,pointBeforePan,'drag/pan silently rebound the SAR measurement target');

  // Wheel zoom must stay anchored to the geographic point under the cursor.
  const anchorX=mapBox.x+mapBox.width*.72,anchorY=mapBox.y+mapBox.height*.38;
  const beforeZoom=await page.evaluate(({x,y})=>{const r=document.querySelector('#map').getBoundingClientRect(),v=globalThis.OMEGA_SAR_NAVIGATION.view;return {lon:v.centerLon+(x-r.left-r.width/2)/((r.width/360)*v.scale),lat:v.centerLat-(y-r.top-r.height/2)/((r.height/180)*v.scale),scale:v.scale};},{x:anchorX,y:anchorY});
  await page.mouse.move(anchorX,anchorY);await page.mouse.wheel(0,-420);await page.waitForTimeout(250);
  const afterZoom=await page.evaluate(({x,y})=>{const r=document.querySelector('#map').getBoundingClientRect(),v=globalThis.OMEGA_SAR_NAVIGATION.view;return {lon:v.centerLon+(x-r.left-r.width/2)/((r.width/360)*v.scale),lat:v.centerLat-(y-r.top-r.height/2)/((r.height/180)*v.scale),scale:v.scale};},{x:anchorX,y:anchorY});
  assert.ok(afterZoom.scale>beforeZoom.scale,'wheel did not zoom in');
  assert.ok(Math.abs(afterZoom.lon-beforeZoom.lon)<1e-5&&Math.abs(afterZoom.lat-beforeZoom.lat)<1e-5,`wheel zoom drifted off pointer anchor: ${JSON.stringify({beforeZoom,afterZoom})}`);
  assert.equal(await page.textContent('#point'),pointBeforePan,'zoom changed the selected measurement target');

  // Device target activation must load real acquisitions and show a footprint-registered source SAR scene.
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:60000});
  await page.waitForFunction(()=>{
    const i=globalThis.OMEGA_SAR_INTERACTION,c=document.querySelector('.sar-source-browse-canvas'),f=globalThis.OMEGA_SAR_SOURCE_FRAME;
    return i?.sourceSequence>=1&&c?.dataset.ready==='true'&&f?.src&&f.registration==='FOOTPRINT_QUAD_WARP';
  },null,{timeout:30000});

  const selected=await page.evaluate(()=>({
    point:document.querySelector('#point')?.textContent,
    obs:Number(document.querySelector('#obsCount')?.textContent||0),
    scene:document.querySelector('#currentScene')?.textContent,
    time:document.querySelector('#currentTime')?.textContent,
    sourceSequence:globalThis.OMEGA_SAR_INTERACTION?.sourceSequence,
    sourceScene:globalThis.OMEGA_SAR_INTERACTION?.lastSourceScene,
    sourceSrc:globalThis.OMEGA_SAR_SOURCE_FRAME?.src,
    registration:globalThis.OMEGA_SAR_SOURCE_FRAME?.registration,
    measurementPromotion:globalThis.OMEGA_SAR_SOURCE_FRAME?.measurementPromotion,
    phase:document.querySelector('#omegaActionHud')?.dataset.phase,
    action:document.querySelector('#omegaActionHud')?.textContent||'',
    continuousCells:globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length||0,
    view:globalThis.OMEGA_SAR_NAVIGATION?.view
  }));
  assert.ok(selected.obs>0,'device location did not automatically load acquisitions');
  assert.ok(selected.sourceSequence>=1&&selected.sourceSrc,'device location did not visibly bind a source SAR scene');
  assert.equal(selected.sourceScene,selected.scene,'source SAR overlay is not synchronized with current acquisition');
  assert.equal(selected.registration,'FOOTPRINT_QUAD_WARP','source browse reverted to bounding-box stretch');
  assert.equal(selected.measurementPromotion,false,'browse visual was incorrectly promoted to measurement evidence');
  assert.match(selected.action,/source SAR|Location is live|calibrated/i);

  // Play must change the actual footprint-registered SAR frame, not merely the counter/timestamp.
  const beforeScene=selected.scene,beforeSrc=selected.sourceSrc,beforeSeq=selected.sourceSequence;
  await page.click('#play');
  await page.waitForFunction(({beforeScene,beforeSrc,beforeSeq})=>{
    const i=globalThis.OMEGA_SAR_INTERACTION,f=globalThis.OMEGA_SAR_SOURCE_FRAME,scene=document.querySelector('#currentScene')?.textContent||'';
    return i?.playing===true&&i.sourceSequence>beforeSeq&&scene&&scene!==beforeScene&&f?.src&&f.src!==beforeSrc&&f.registration==='FOOTPRINT_QUAD_WARP';
  },{beforeScene,beforeSrc,beforeSeq},{timeout:45000});
  const playedOnce=await page.evaluate(()=>({scene:document.querySelector('#currentScene')?.textContent,time:document.querySelector('#currentTime')?.textContent,sourceSequence:globalThis.OMEGA_SAR_INTERACTION?.sourceSequence,sourceScene:globalThis.OMEGA_SAR_INTERACTION?.lastSourceScene,sourceSrc:globalThis.OMEGA_SAR_SOURCE_FRAME?.src,registration:globalThis.OMEGA_SAR_SOURCE_FRAME?.registration,playing:globalThis.OMEGA_SAR_INTERACTION?.playing,phase:document.querySelector('#omegaActionHud')?.dataset.phase}));
  assert.notEqual(playedOnce.scene,beforeScene,'Play advanced no acquisition');
  assert.notEqual(playedOnce.sourceSrc,beforeSrc,'Play advanced metadata but not visible source SAR');
  assert.equal(playedOnce.sourceScene,playedOnce.scene,'visible SAR scene is not synchronized to timeline scene');

  await page.waitForFunction(seq=>globalThis.OMEGA_SAR_INTERACTION?.sourceSequence>=seq+1,playedOnce.sourceSequence,{timeout:45000});
  const playedTwice=await page.evaluate(()=>({scene:document.querySelector('#currentScene')?.textContent,sourceSequence:globalThis.OMEGA_SAR_INTERACTION?.sourceSequence,sourceSrc:globalThis.OMEGA_SAR_SOURCE_FRAME?.src}));
  assert.notEqual(playedTwice.scene,playedOnce.scene,'second playback step did not change scene');
  assert.notEqual(playedTwice.sourceSrc,playedOnce.sourceSrc,'second playback step did not change visible SAR source');
  await page.click('#play');await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.playing===false,null,{timeout:5000});

  let calibrated=false;
  try{await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.patchSequence>=1,null,{timeout:30000});calibrated=true;}catch{}
  const after=await page.evaluate(()=>{
    const f=globalThis.OMEGA_SAR_CONTINUOUS_FIELD;
    return {patchSequence:globalThis.OMEGA_SAR_INTERACTION?.patchSequence||0,anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length||0,numeric:f?.cells?.filter(c=>Number.isFinite(c.value)).length||0,badAdmission:f?.cells?.filter(c=>c.gammaAdmission?.startsWith('ADMIT')&&!Number.isFinite(c.value)).length||0,measuredAndInferred:f?.cells?.filter(c=>c.measured&&c.inferred).length||0,action:document.querySelector('#omegaActionHud')?.textContent||'',fieldHud:document.querySelector('#omegaFieldHud')?.textContent||''};
  });
  if(calibrated){assert.ok(after.anchors>=4,'calibrated patch completed but did not enter OMEGA field');assert.ok(after.numeric>0,'calibrated patch completed but field remained nonnumeric');}
  assert.equal(after.badAdmission,0,'Gamma/Mode188 admitted a cell without numeric state');
  assert.equal(after.measuredAndInferred,0,'measured/inferred identity collision');
  assert.match(after.action,/Playback paused|source SAR|calibrated/i);assert.match(after.fieldHud,/Ω CONTINUOUS SAR/i);

  const visual=await page.evaluate(()=>{
    const map=document.querySelector('#map'),ctx=map.getContext('2d'),data=ctx.getImageData(0,0,map.width,map.height).data;let min=255,max=0,count=0;const step=Math.max(4,Math.floor((map.width*map.height)/12000));
    for(let p=0;p<map.width*map.height;p+=step){const i=p*4,y=(data[i]+data[i+1]+data[i+2])/3;if(data[i+3]){min=Math.min(min,y);max=Math.max(max,y);count++;}}
    const c=document.querySelector('.sar-source-browse-canvas'),r=c?.getBoundingClientRect();return {range:max-min,count,sourceVisible:c?.dataset.ready==='true',sourceWidth:r?.width||0,sourceHeight:r?.height||0,registration:globalThis.OMEGA_SAR_SOURCE_FRAME?.registration};
  });
  assert.ok(visual.count>100&&visual.range>20,'main Earth field lacks visible structure');
  assert.ok(visual.sourceVisible&&visual.sourceWidth>20&&visual.sourceHeight>20,'source SAR is not visibly rendered on Earth');
  assert.equal(visual.registration,'FOOTPRINT_QUAD_WARP');
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log(JSON.stringify({initial,locationState,beforeZoom,afterZoom,selected,playedOnce,playedTwice,calibrated,after,visual},null,2));
  console.log('SAR_R4_DEVICE_NAV_ALIGNMENT_PLAYBACK_PASS');
}finally{await browser.close();}
