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
  const initial=await page.evaluate(()=>({
    cells:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.length,
    states:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.summary.states,
    modes:globalThis.OMEGA_SAR_SKINS,
    prior:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.filter(c=>c.state==='CONTEXT_PRIOR').length
  }));
  assert.ok(initial.cells>100,'continuous field not initialized');
  assert.ok(initial.prior>0,'world structural prior missing before local SAR load');
  for(const name of ['OVERALL_CANON','UNIFIED_COHERENCE','MODE188','DEEP_MOTHER','HIGH_FATHER','NO_NOTHING_TRUTH','GUIDANCE_FIELD','FULL_SPHERE','ALPHA','CRIMSON','FORECAST','RECOVERY','STABILIZATION','INTEGRATION','TRUTH_TRAVERSAL','RAFT188','CTDE','GAMMA_ADMISSION','CONTINUANCE_EVOLUTION','HEAVY_PRUNE','REALTIME_SATELLITE_SKIN'])assert.ok(initial.modes.includes(name),`mode missing: ${name}`);

  // Real user path: click Tucson on the whole-Earth canvas. No manual Load button.
  await page.waitForFunction(()=>document.querySelector('#map')?.getBoundingClientRect().width>500);
  const mapBox=await page.locator('#map').boundingBox();
  assert.ok(mapBox,'map has no browser box');
  const tucson={lon:-110.9747,lat:32.2226};
  const clickX=mapBox.x+mapBox.width/2+tucson.lon*(mapBox.width/360);
  const clickY=mapBox.y+mapBox.height/2-tucson.lat*(mapBox.height/180);
  await page.mouse.click(clickX,clickY);

  await page.waitForFunction(()=>{
    const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(!p)return false;
    return Math.abs(Number(p[1])-32.2226)<1&&Math.abs(Number(p[2])+110.9747)<1;
  },null,{timeout:10000});
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:60000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.patchSequence>=1,null,{timeout:120000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length>=4,null,{timeout:60000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.some(c=>Number.isFinite(c.value)),null,{timeout:60000});

  const selected=await page.evaluate(()=>({
    point:document.querySelector('#point')?.textContent,
    obs:Number(document.querySelector('#obsCount')?.textContent||0),
    scene:document.querySelector('#currentScene')?.textContent,
    time:document.querySelector('#currentTime')?.textContent,
    patchKey:globalThis.OMEGA_SAR_INTERACTION?.lastPatchKey,
    patchSequence:globalThis.OMEGA_SAR_INTERACTION?.patchSequence,
    viewScale:globalThis.OMEGA_SAR_FIELD_RUNTIME?.view?.scale,
    phase:document.querySelector('#omegaActionHud')?.dataset.phase,
    anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length||0,
    numeric:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.filter(c=>Number.isFinite(c.value)).length
  }));
  assert.ok(selected.obs>0,'clicking Earth did not automatically load acquisitions');
  assert.ok(selected.patchKey,'clicking Earth did not bind a calibrated SAR patch');
  assert.ok(selected.anchors>=4,'calibrated patch did not enter OMEGA anchor field');
  assert.ok(selected.numeric>0,'continuous field did not become numeric after measured SAR binding');
  assert.ok(Number(selected.viewScale)>100,'selected SAR target was not focused enough for the measurement to be visible');

  const beforeScene=selected.scene,beforePatch=selected.patchKey,beforeSeq=selected.patchSequence;
  await page.click('#play');
  await page.waitForFunction(({beforeSeq,beforePatch,beforeScene})=>{
    const i=globalThis.OMEGA_SAR_INTERACTION;
    const scene=document.querySelector('#currentScene')?.textContent||'';
    return i?.playing===true&&i.patchSequence>=beforeSeq+1&&i.lastPatchKey&&i.lastPatchKey!==beforePatch&&scene&&scene!==beforeScene;
  },{beforeSeq,beforePatch,beforeScene},{timeout:150000});
  const playedOnce=await page.evaluate(()=>({
    scene:document.querySelector('#currentScene')?.textContent,
    time:document.querySelector('#currentTime')?.textContent,
    patchKey:globalThis.OMEGA_SAR_INTERACTION?.lastPatchKey,
    patchSequence:globalThis.OMEGA_SAR_INTERACTION?.patchSequence,
    playing:globalThis.OMEGA_SAR_INTERACTION?.playing,
    phase:document.querySelector('#omegaActionHud')?.dataset.phase
  }));
  assert.notEqual(playedOnce.scene,beforeScene,'Play advanced no visible acquisition');
  assert.notEqual(playedOnce.patchKey,beforePatch,'Play advanced metadata but not calibrated SAR evidence');
  assert.ok(playedOnce.patchSequence>beforeSeq,'Play did not complete a new calibrated raster frame');

  await page.waitForFunction(seq=>globalThis.OMEGA_SAR_INTERACTION?.patchSequence>=seq+1,playedOnce.patchSequence,{timeout:150000});
  await page.click('#play');
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.playing===false,null,{timeout:5000});

  const after=await page.evaluate(()=>{
    const f=globalThis.OMEGA_SAR_CONTINUOUS_FIELD;
    return {
      anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME.patchAnchors.length,
      numeric:f.cells.filter(c=>Number.isFinite(c.value)).length,
      admitted:f.summary.admittedFraction,
      contradictions:f.summary.contradictions,
      badAdmission:f.cells.filter(c=>c.gammaAdmission?.startsWith('ADMIT')&&!Number.isFinite(c.value)).length,
      measuredAndInferred:f.cells.filter(c=>c.measured&&c.inferred).length,
      action:document.querySelector('#omegaActionHud')?.textContent||'',
      fieldHud:document.querySelector('#omegaFieldHud')?.textContent||''
    };
  });
  assert.equal(after.badAdmission,0,'Gamma/Mode188 admitted a cell without numeric state');
  assert.equal(after.measuredAndInferred,0,'measured/inferred identity collision');
  assert.match(after.action,/Playback paused|Live calibrated SAR|Playing measured SAR/i);
  assert.match(after.fieldHud,/Ω CONTINUOUS SAR/i);

  const mapStats=await page.evaluate(()=>{
    const canvases=[document.querySelector('#map'),document.querySelector('.sar-earth-overlay')].filter(Boolean);
    let min=255,max=0,count=0;
    for(const c of canvases){const ctx=c.getContext('2d'),w=c.width,h=c.height,data=ctx.getImageData(0,0,w,h).data,step=Math.max(4,Math.floor((w*h)/12000));for(let p=0;p<w*h;p+=step){const i=p*4,y=(data[i]+data[i+1]+data[i+2])/3;if(data[i+3]){min=Math.min(min,y);max=Math.max(max,y);count++;}}}
    return {range:max-min,count};
  });
  assert.ok(mapStats.count>100,'main Earth/SAR field rendered too few pixels');
  assert.ok(mapStats.range>24,`main Earth/SAR field lacks visible structure: range ${mapStats.range}`);
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log(JSON.stringify({initial,selected,playedOnce,after,mapStats},null,2));
  console.log('SAR_R4_LOCATION_AND_PLAYBACK_PASS');
}finally{await browser.close();}
