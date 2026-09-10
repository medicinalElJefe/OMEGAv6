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
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.conception==='CONTINUOUS_SAR_EARTH_INSTRUMENT'&&globalThis.OMEGA_SAR_AUTHORITY&&globalThis.OMEGA_SAR_NAVIGATION?.selectTarget&&globalThis.OMEGA_SAR_INTERACTION,null,{timeout:30000});
  assert.match(await page.title(),/OMEGA SAR R4/);assert.equal(await page.locator('.omega-local-nav-map').count(),0,'conventional local map must not replace the SAR instrument');

  await page.evaluate(({lon,lat})=>globalThis.OMEGA_SAR_LOCATION.jump(lon,lat,{name:'Tucson',region:'Arizona',country:'United States'}),tucson);
  await page.waitForFunction(({lon,lat})=>{const a=globalThis.OMEGA_SAR_AUTHORITY,n=globalThis.OMEGA_SAR_NAVIGATION;return a?.target&&n?.view&&Math.abs(a.target.lon-lon)<1e-6&&Math.abs(a.target.lat-lat)<1e-6&&Math.abs(n.view.centerLon-lon)<1e-6&&Math.abs(n.view.centerLat-lat)<1e-6&&n.view.scale>=100&&n.view.scale<=180;},tucson,{timeout:20000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0&&globalThis.OMEGA_SAR_SOURCE_FRAME?.src,null,{timeout:80000});
  const initial=await page.evaluate(()=>({authority:globalThis.OMEGA_SAR_AUTHORITY.capture(),view:{...globalThis.OMEGA_SAR_RENDERER.view},source:globalThis.OMEGA_SAR_SOURCE_FRAME,visibility:globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY,baseOpacity:globalThis.OMEGA_SAR_RENDERER.baseOpacity,policy:globalThis.OMEGA_SAR_RENDER_POLICY,scene:(document.querySelector('#currentScene')?.textContent||'').trim()}));
  assert.equal(initial.authority.targetKey,`${tucson.lon.toFixed(6)},${tucson.lat.toFixed(6)}`);assert.ok(close(initial.view.centerLon,tucson.lon)&&close(initial.view.centerLat,tucson.lat));
  assert.equal(initial.source.registration,'FOOTPRINT_QUAD_WARP');assert.equal(initial.visibility?.mainMapVisible,true,'regional source SAR must be visible');assert.ok(initial.baseOpacity<=.11,'optical context dominates SAR');assert.equal(initial.policy?.mode,'SAR_FIRST');

  // A visual context from another bbox must never commit to the active SAR camera.
  const stale=await page.evaluate(async()=>{const a=globalThis.OMEGA_SAR_AUTHORITY,before=a.rejected.context;let rejected=false;try{await globalThis.OMEGA_SAR_RENDERER.setBaseImage('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="black"/></svg>',{bbox:[0,0,1,1],date:'2026-09-09'});}catch(e){rejected=e.code==='OMEGA_STALE_CONTEXT'||/Stale Earth context/.test(e.message);}return {rejected,before,after:a.rejected.context,view:{...globalThis.OMEGA_SAR_RENDERER.view}};});
  assert.equal(stale.rejected,true);assert.ok(stale.after>stale.before,'stale camera/bbox context was not rejected');assert.ok(close(stale.view.centerLon,tucson.lon)&&close(stale.view.centerLat,tucson.lat));

  // Click inverse comes from the camera the user actually sees, and target change does not recenter it.
  const box=await page.locator('#map').boundingBox();assert.ok(box);const x=box.x+box.width*.58,y=box.y+box.height*.54;
  const planned=await page.evaluate(({x,y})=>{const r=document.querySelector('#map').getBoundingClientRect(),renderer=globalThis.OMEGA_SAR_RENDERER,[lon,lat]=renderer.unproject(x-r.left,y-r.top);return {lon,lat,before:{...renderer.view}};},{x,y});
  await page.mouse.click(x,y);
  await page.waitForFunction(({lon,lat})=>{const a=globalThis.OMEGA_SAR_AUTHORITY,i=globalThis.OMEGA_SAR_INTERACTION;return a?.target&&i?.targetKey===a.targetKey&&Math.abs(a.target.lon-lon)<3e-5&&Math.abs(a.target.lat-lat)<3e-5;},planned,{timeout:10000});
  const clicked=await page.evaluate(()=>({target:globalThis.OMEGA_SAR_AUTHORITY.target,view:{...globalThis.OMEGA_SAR_RENDERER.view},activating:globalThis.OMEGA_SAR_INTERACTION.activating}));
  assert.ok(Math.abs(clicked.target.lon-tucson.lon)<1&&Math.abs(clicked.target.lat-tucson.lat)<1,'local click jumped to a remote Earth coordinate');assert.ok(close(clicked.view.centerLon,planned.before.centerLon,1e-9)&&close(clicked.view.centerLat,planned.before.centerLat,1e-9)&&close(clicked.view.scale,planned.before.scale,1e-9),'click incorrectly recentered camera');

  // Return through location search and prove source SAR/playback share the exact same target authority.
  await page.evaluate(({lon,lat})=>globalThis.OMEGA_SAR_LOCATION.jump(lon,lat,{name:'Tucson',region:'Arizona',country:'United States'}),tucson);
  await page.waitForFunction(({lon,lat})=>{const a=globalThis.OMEGA_SAR_AUTHORITY,i=globalThis.OMEGA_SAR_INTERACTION;return a?.target&&i?.activating===false&&Math.abs(a.target.lon-lon)<1e-6&&Math.abs(a.target.lat-lat)<1e-6&&Number(document.querySelector('#obsCount')?.textContent||0)>0;},tucson,{timeout:80000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src&&globalThis.OMEGA_SAR_SOURCE_FRAME.id===(document.querySelector('#currentScene')?.textContent||'').trim(),null,{timeout:30000});
  const beforePlay=await page.evaluate(()=>({scene:(document.querySelector('#currentScene')?.textContent||'').trim(),src:globalThis.OMEGA_SAR_SOURCE_FRAME?.src,seq:globalThis.OMEGA_SAR_INTERACTION.sourceSequence,target:{...globalThis.OMEGA_SAR_AUTHORITY.target},camera:{...globalThis.OMEGA_SAR_RENDERER.view}}));
  await page.click('#play');await page.waitForFunction(p=>{const scene=(document.querySelector('#currentScene')?.textContent||'').trim(),f=globalThis.OMEGA_SAR_SOURCE_FRAME,i=globalThis.OMEGA_SAR_INTERACTION;return i?.playing===true&&i.sourceSequence>p.seq&&scene!==p.scene&&f?.id===scene&&f.src&&f.src!==p.src;},beforePlay,{timeout:45000});await page.click('#play');
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.playing===false&&globalThis.OMEGA_SAR_INTERACTION?.calibrationBusy===false,null,{timeout:100000});
  const afterPlay=await page.evaluate(()=>({target:globalThis.OMEGA_SAR_AUTHORITY.target,camera:{...globalThis.OMEGA_SAR_RENDERER.view},scene:(document.querySelector('#currentScene')?.textContent||'').trim(),authorityScene:globalThis.OMEGA_SAR_AUTHORITY.sceneKey}));
  assert.deepEqual(afterPlay.target,beforePlay.target,'playback changed target');assert.equal(afterPlay.scene,afterPlay.authorityScene,'scene DOM and authority spine diverged');

  // The current acquisition must either be explicitly SOURCE_ONLY/UNRESOLVED or become
  // an exact measured patch for this same scene/target. No silent substitution is legal.
  let patch=await page.evaluate(()=>{const p=globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch;return p?{state:p.state,id:p.id,target:p.target,validCount:p.stats?.validCount,mesh:p.geoMesh?.validNodeCount,evidence:p.evidence}:null;});
  if(!patch)patch=await page.evaluate(async()=>{const p=await globalThis.OMEGA_SAR_SENTINEL.loadCalibratedCurrent({force:true});return p?{state:p.state,id:p.id,target:p.target,validCount:p.stats?.validCount,mesh:p.geoMesh?.validNodeCount,evidence:p.evidence}:null;});
  const readiness=await page.evaluate(()=>globalThis.OMEGA_SAR_MEASUREMENT_READINESS?.scenes?.get((document.querySelector('#currentScene')?.textContent||'').trim())||null);
  if(!patch){assert.ok(['EXACT_UNRESOLVED','SOURCE_ONLY'].includes(readiness?.state),`unresolved scene lacks explicit readiness state: ${JSON.stringify(readiness)}`);throw new Error(`Current acquisition did not resolve exact SAR during acceptance: ${JSON.stringify(readiness)}`);}
  assert.equal(patch.state,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.equal(patch.id,afterPlay.scene,'calibration silently substituted another acquisition');assert.ok(close(patch.target.lon,tucson.lon,1e-4)&&close(patch.target.lat,tucson.lat,1e-4));assert.ok(patch.validCount>0&&patch.mesh>=4);assert.equal(patch.evidence?.measured,true);assert.equal(patch.evidence?.inferred,false);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length>=4&&document.querySelector('#omegaFitSar')?.disabled===false,null,{timeout:15000});

  // Only explicit FIT SAR may move from regional source scale to the local measured patch.
  const preFit=await page.evaluate(()=>({...globalThis.OMEGA_SAR_RENDERER.view}));await page.click('#omegaFitSar');await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT_EXPLICIT',null,{timeout:10000});
  const fitted=await page.evaluate(()=>({view:{...globalThis.OMEGA_SAR_RENDERER.view},target:globalThis.OMEGA_SAR_AUTHORITY.target,browse:document.querySelector('.sar-source-browse-canvas')?.dataset.mainMapVisible,overlay:globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state,anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length||0,baseOpacity:globalThis.OMEGA_SAR_RENDERER.baseOpacity,rejected:{...globalThis.OMEGA_SAR_AUTHORITY.rejected}}));
  assert.ok(fitted.view.scale>preFit.scale&&fitted.view.scale>180);assert.equal(fitted.browse,'false');assert.equal(fitted.overlay,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.ok(fitted.anchors>=4);assert.ok(fitted.baseOpacity<=.11);assert.ok(close(fitted.target.lon,tucson.lon,1e-4)&&close(fitted.target.lat,tucson.lat,1e-4));

  // Deliberately late/wrong async products are refused by the authority spine.
  const rejected=await page.evaluate(()=>{const a=globalThis.OMEGA_SAR_AUTHORITY,b={...a.rejected};window.dispatchEvent(new CustomEvent('omega-source-sar-frame',{detail:{id:'WRONG_SCENE',src:'wrong'}}));window.dispatchEvent(new CustomEvent('omega-calibrated-sar-patch',{detail:{patch:{id:'WRONG_SCENE',target:{lon:0,lat:0},evidence:{measured:true}}}}));return {before:b,after:{...a.rejected}};});
  assert.ok(rejected.after.source>rejected.before.source);assert.ok(rejected.after.measurement>rejected.before.measurement);assert.deepEqual(errors,[],`page errors: ${errors.join(' | ')}`);
  console.log(JSON.stringify({initial,stale,planned,clicked,beforePlay,afterPlay,readiness,patch,fitted,rejected},null,2));console.log('SAR_R4_AUTHORITY_SPINE_FULL_PASS');
}finally{await browser.close();}
