import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;
assert.ok(base,'SAR_TEST_URL is required');
const tucson={lon:-110.9747,lat:32.2226};
const browser=await chromium.launch({headless:true});
const close=(a,b,eps=2e-5)=>Math.abs(Number(a)-Number(b))<=eps;
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});assert.ok(response?.ok(),`root HTTP ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_NAVIGATION?.selectTarget&&globalThis.OMEGA_SAR_RENDERER&&globalThis.OMEGA_SAR_INTERACTION,null,{timeout:20000});

  await page.evaluate(async p=>{await globalThis.OMEGA_SAR_NAVIGATION.selectTarget(p,{scale:120,reason:'R4 authority proof'});},tucson);
  await page.waitForFunction(p=>{const n=globalThis.OMEGA_SAR_NAVIGATION;return n?.target&&Math.abs(n.target.lon-p.lon)<1e-6&&Math.abs(n.target.lat-p.lat)<1e-6;},tucson,{timeout:10000});
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:70000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src&&globalThis.OMEGA_SAR_INTERACTION?.sourceSequence>=1,null,{timeout:30000});

  const authority=await page.evaluate(()=>({target:globalThis.OMEGA_SAR_NAVIGATION.target,view:{...globalThis.OMEGA_SAR_RENDERER.view},point:document.querySelector('#point')?.textContent||'',opacity:globalThis.OMEGA_SAR_RENDERER.baseOpacity,source:globalThis.OMEGA_SAR_SOURCE_FRAME?.id||null}));
  assert.ok(close(authority.target.lon,tucson.lon,1e-6)&&close(authority.target.lat,tucson.lat,1e-6),`target authority drifted ${JSON.stringify(authority)}`);
  assert.ok(close(authority.view.centerLon,tucson.lon,1e-6)&&close(authority.view.centerLat,tucson.lat,1e-6),`camera did not center target ${JSON.stringify(authority)}`);
  assert.ok(authority.opacity<=.14,`Earth context dominates SAR surface: opacity ${authority.opacity}`);

  // A post-search click must be interpreted by the current camera, not a stale whole-world frame.
  const clickPlan=await page.evaluate(()=>{const c=document.querySelector('#map'),r=c.getBoundingClientRect(),x=r.left+r.width*.61,y=r.top+r.height*.47;const [lon,lat]=globalThis.OMEGA_SAR_RENDERER.unproject(x-r.left,y-r.top);return {x,y,lon,lat,before:{...globalThis.OMEGA_SAR_RENDERER.view}};});
  await page.mouse.click(clickPlan.x,clickPlan.y);
  await page.waitForFunction(p=>{const n=globalThis.OMEGA_SAR_NAVIGATION?.target;return n&&Math.abs(n.lon-p.lon)<3e-5&&Math.abs(n.lat-p.lat)<3e-5;},{lon:clickPlan.lon,lat:clickPlan.lat},{timeout:10000});
  const clicked=await page.evaluate(()=>({target:globalThis.OMEGA_SAR_NAVIGATION.target,view:{...globalThis.OMEGA_SAR_RENDERER.view},point:document.querySelector('#point')?.textContent||''}));
  assert.ok(close(clicked.target.lon,clickPlan.lon,3e-5)&&close(clicked.target.lat,clickPlan.lat,3e-5),`click used stale coordinate frame ${JSON.stringify({clickPlan,clicked})}`);
  assert.ok(Math.abs(clicked.target.lon-tucson.lon)<1&&Math.abs(clicked.target.lat-tucson.lat)<1,`local click jumped to remote Earth location ${JSON.stringify(clicked.target)}`);

  // Return to Tucson and prove calibration cannot silently move the camera.
  await page.evaluate(async p=>{await globalThis.OMEGA_SAR_NAVIGATION.selectTarget(p,{scale:120,reason:'return target'});},tucson);
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:70000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_SENTINEL?.loadCalibratedCurrent,null,{timeout:20000});
  const beforeCal=await page.evaluate(()=>({...globalThis.OMEGA_SAR_RENDERER.view}));
  const patch=await page.evaluate(async()=>{const p=await globalThis.OMEGA_SAR_SENTINEL.loadCalibratedCurrent({force:true});return p?{state:p.state,id:p.id,measured:p.evidence?.measured,mesh:p.geoMesh?.validNodeCount,target:p.target}:null;});
  assert.equal(patch?.state,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.equal(patch?.measured,true);assert.ok(patch?.mesh>=4);
  await page.waitForTimeout(300);
  const afterCal=await page.evaluate(()=>({view:{...globalThis.OMEGA_SAR_RENDERER.view},overlay:globalThis.OMEGA_SAR_EARTH_OVERLAY,opacity:globalThis.OMEGA_SAR_RENDERER.baseOpacity,fitDisabled:document.querySelector('#omegaFitSar')?.disabled}));
  assert.ok(close(beforeCal.centerLon,afterCal.view.centerLon,1e-8)&&close(beforeCal.centerLat,afterCal.view.centerLat,1e-8)&&close(beforeCal.scale,afterCal.view.scale,1e-8),`calibrated patch hijacked camera ${JSON.stringify({beforeCal,afterCal})}`);
  assert.equal(afterCal.overlay?.measurement,true,'exact measured SAR did not bind to main Earth renderer');
  assert.ok(afterCal.opacity<=.05,`calibrated SAR is not primary surface: context opacity ${afterCal.opacity}`);
  assert.equal(afterCal.fitDisabled,false,'FIT SAR was not enabled for exact measured patch');

  await page.click('#omegaFitSar');await page.waitForTimeout(150);
  const fitted=await page.evaluate(()=>({view:{...globalThis.OMEGA_SAR_RENDERER.view},focus:globalThis.OMEGA_SAR_LOCAL_FOCUS,target:globalThis.OMEGA_SAR_NAVIGATION.target}));
  assert.equal(fitted.focus?.state,'CALIBRATED_PATCH_FIT_EXPLICIT');assert.ok(fitted.view.scale>beforeCal.scale,'explicit FIT SAR did not zoom to measured patch');
  assert.ok(close(fitted.target.lon,tucson.lon,1e-6)&&close(fitted.target.lat,tucson.lat,1e-6),'FIT SAR changed target identity');
  assert.deepEqual(errors,[],`page errors: ${errors.join(' | ')}`);
  console.log(JSON.stringify({authority,clickPlan,clicked,patch,afterCal,fitted},null,2));
  console.log('SAR_R4_SINGLE_CAMERA_TARGET_AUTHORITY_PASS');
}finally{await browser.close();}
