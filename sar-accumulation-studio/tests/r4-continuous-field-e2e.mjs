import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;
assert.ok(base,'SAR_TEST_URL is required');
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForSelector('#omegaFieldHud',{state:'visible',timeout:20000});
  await page.waitForSelector('#omegaActionHud',{state:'visible',timeout:20000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length>100,null,{timeout:30000});
  const initial=await page.evaluate(()=>({cells:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.length,modes:globalThis.OMEGA_SAR_SKINS,prior:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.filter(c=>c.state==='CONTEXT_PRIOR').length}));
  assert.ok(initial.cells>100,'continuous field not initialized');
  assert.ok(initial.prior>0,'world structural prior missing before local SAR load');
  for(const name of ['OVERALL_CANON','UNIFIED_COHERENCE','MODE188','DEEP_MOTHER','HIGH_FATHER','NO_NOTHING_TRUTH','GUIDANCE_FIELD','FULL_SPHERE','ALPHA','CRIMSON','FORECAST','RECOVERY','STABILIZATION','INTEGRATION','TRUTH_TRAVERSAL','RAFT188','CTDE','GAMMA_ADMISSION','CONTINUANCE_EVOLUTION','HEAVY_PRUNE','REALTIME_SATELLITE_SKIN'])assert.ok(initial.modes.includes(name),`mode missing: ${name}`);

  // Real user path: click Tucson. This must load catalog and show a real source SAR scene without a manual Load click.
  await page.waitForFunction(()=>document.querySelector('#map')?.getBoundingClientRect().width>500);
  const mapBox=await page.locator('#map').boundingBox();assert.ok(mapBox,'map has no browser box');
  const tucson={lon:-110.9747,lat:32.2226};
  await page.mouse.click(mapBox.x+mapBox.width/2+tucson.lon*(mapBox.width/360),mapBox.y+mapBox.height/2-tucson.lat*(mapBox.height/180));
  await page.waitForFunction(()=>{
    const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);return !!p&&Math.abs(Number(p[1])-32.2226)<1&&Math.abs(Number(p[2])+110.9747)<1;
  },null,{timeout:10000});
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:60000});
  await page.waitForFunction(()=>{
    const i=globalThis.OMEGA_SAR_INTERACTION,img=document.querySelector('.sar-source-browse-layer img');
    return i?.sourceSequence>=1&&img?.complete&&img.naturalWidth>0&&parseFloat(getComputedStyle(img).opacity)>.1;
  },null,{timeout:30000});

  const selected=await page.evaluate(()=>({
    point:document.querySelector('#point')?.textContent,
    obs:Number(document.querySelector('#obsCount')?.textContent||0),
    scene:document.querySelector('#currentScene')?.textContent,
    time:document.querySelector('#currentTime')?.textContent,
    sourceSequence:globalThis.OMEGA_SAR_INTERACTION?.sourceSequence,
    sourceScene:globalThis.OMEGA_SAR_INTERACTION?.lastSourceScene,
    sourceSrc:document.querySelector('.sar-source-browse-layer img')?.currentSrc||document.querySelector('.sar-source-browse-layer img')?.src,
    phase:document.querySelector('#omegaActionHud')?.dataset.phase,
    action:document.querySelector('#omegaActionHud')?.textContent||'',
    continuousCells:globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length||0
  }));
  assert.ok(selected.obs>0,'clicking Earth did not automatically load acquisitions');
  assert.ok(selected.sourceSequence>=1&&selected.sourceSrc,'clicking Earth did not visibly bind a source SAR scene');
  assert.equal(selected.sourceScene,selected.scene,'source SAR overlay is not synchronized with current acquisition');
  assert.match(selected.action,/source SAR|Location is live|calibrated/i);

  // Play must change the actual source SAR frame, not merely the counter/timestamp.
  const beforeScene=selected.scene,beforeSrc=selected.sourceSrc,beforeSeq=selected.sourceSequence;
  await page.click('#play');
  await page.waitForFunction(({beforeScene,beforeSrc,beforeSeq})=>{
    const i=globalThis.OMEGA_SAR_INTERACTION,img=document.querySelector('.sar-source-browse-layer img'),scene=document.querySelector('#currentScene')?.textContent||'',src=img?.currentSrc||img?.src||'';
    return i?.playing===true&&i.sourceSequence>beforeSeq&&scene&&scene!==beforeScene&&src&&src!==beforeSrc&&img?.complete&&img.naturalWidth>0;
  },{beforeScene,beforeSrc,beforeSeq},{timeout:45000});
  const playedOnce=await page.evaluate(()=>({scene:document.querySelector('#currentScene')?.textContent,time:document.querySelector('#currentTime')?.textContent,sourceSequence:globalThis.OMEGA_SAR_INTERACTION?.sourceSequence,sourceScene:globalThis.OMEGA_SAR_INTERACTION?.lastSourceScene,sourceSrc:document.querySelector('.sar-source-browse-layer img')?.currentSrc||document.querySelector('.sar-source-browse-layer img')?.src,playing:globalThis.OMEGA_SAR_INTERACTION?.playing,phase:document.querySelector('#omegaActionHud')?.dataset.phase}));
  assert.notEqual(playedOnce.scene,beforeScene,'Play advanced no acquisition');
  assert.notEqual(playedOnce.sourceSrc,beforeSrc,'Play advanced metadata but not visible source SAR');
  assert.equal(playedOnce.sourceScene,playedOnce.scene,'visible SAR scene is not synchronized to timeline scene');

  await page.waitForFunction(seq=>globalThis.OMEGA_SAR_INTERACTION?.sourceSequence>=seq+1,playedOnce.sourceSequence,{timeout:45000});
  const playedTwice=await page.evaluate(()=>({scene:document.querySelector('#currentScene')?.textContent,sourceSequence:globalThis.OMEGA_SAR_INTERACTION?.sourceSequence,sourceSrc:document.querySelector('.sar-source-browse-layer img')?.currentSrc||document.querySelector('.sar-source-browse-layer img')?.src}));
  assert.notEqual(playedTwice.scene,playedOnce.scene,'second playback step did not change scene');
  assert.notEqual(playedTwice.sourceSrc,playedOnce.sourceSrc,'second playback step did not change visible SAR source');
  await page.click('#play');await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.playing===false,null,{timeout:5000});

  // Exact calibrated patch is an evidence-strengthening layer. Allow a bounded window; never let its latency block source playback.
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

  // Main view must contain both Earth and a visible SAR overlay element.
  const visual=await page.evaluate(()=>{
    const map=document.querySelector('#map'),ctx=map.getContext('2d'),data=ctx.getImageData(0,0,map.width,map.height).data;let min=255,max=0,count=0;const step=Math.max(4,Math.floor((map.width*map.height)/12000));
    for(let p=0;p<map.width*map.height;p+=step){const i=p*4,y=(data[i]+data[i+1]+data[i+2])/3;if(data[i+3]){min=Math.min(min,y);max=Math.max(max,y);count++;}}
    const img=document.querySelector('.sar-source-browse-layer img'),rect=img?.getBoundingClientRect();return {range:max-min,count,sourceVisible:!!img&&img.complete&&img.naturalWidth>0&&parseFloat(getComputedStyle(img).opacity)>.1,sourceWidth:rect?.width||0,sourceHeight:rect?.height||0};
  });
  assert.ok(visual.count>100&&visual.range>20,'main Earth field lacks visible structure');
  assert.ok(visual.sourceVisible&&visual.sourceWidth>20&&visual.sourceHeight>20,'source SAR is not visibly rendered on Earth');
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log(JSON.stringify({initial,selected,playedOnce,playedTwice,calibrated,after,visual},null,2));
  console.log('SAR_R4_LOCATION_SOURCE_PLAYBACK_PASS');
}finally{await browser.close();}
