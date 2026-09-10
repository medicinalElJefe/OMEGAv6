import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1649,height:927},deviceScaleFactor:1});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R257'&&globalThis.OMEGA_SAR_EXPERIENCE?.ready===true&&globalThis.OMEGA_SAR_PRIMARY_WORKSTATION?.state==='READY'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.state==='READY'&&globalThis.OMEGA_SAR_R257_EXPERIENCE?.state==='READY',null,{timeout:30000});

  const initial=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s)?.getBoundingClientRect()||null;
    const visible=s=>{const n=document.querySelector(s);if(!n)return false;const cs=getComputedStyle(n),r=n.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0&&r.width>1&&r.height>1&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;};
    const map=rect('.map-wrap'),top=rect('.topbar'),dock=rect('.place-dock'),search=rect('.place-search'),controls=rect('#omegaSarPrimaryControls'),transport=rect('.transport-deck');
    const visibleMap={width:Math.max(0,Math.min(map.right,innerWidth)-Math.max(map.left,0)),height:Math.max(0,Math.min(map.bottom,innerHeight)-Math.max(map.top,0))};
    const center={left:innerWidth*.24,right:innerWidth*.76,top:map.top+map.height*.20,bottom:map.top+map.height*.76};
    const selectors=['#omegaExperienceStatus','#omegaQuickRail','.transport-deck','#omegaMapNav','#omegaR257ProofStack'];
    const hits=selectors.filter(visible).map(s=>({selector:s,rect:rect(s)})).filter(({rect:r})=>r.left<center.right&&r.right>center.left&&r.top<center.bottom&&r.bottom>center.top);
    return {vw:innerWidth,vh:innerHeight,map,visibleMap,top,dock,search,controls,transport,hits,layout:globalThis.OMEGA_SAR_R4_RUNTIME.experience.layout,surface:globalThis.OMEGA_SAR_PRIMARY_WORKSTATION.surface,nativeSurface:globalThis.OMEGA_DATA_NATIVE_SURFACE.surface,overlapPolicy:globalThis.OMEGA_SAR_R257_EXPERIENCE.overlapPolicy};
  });
  assert.equal(initial.layout,'SAR_PRIMARY_VIEW_WITH_COMMAND_STRIP_RESERVED_ZONES_BOUNDED_DRAWERS_AND_SINGLE_PROOF_TELEMETRY_STACK');
  assert.equal(initial.overlapPolicy,'RESERVED_ZONES_AND_SINGLE_STACK');
  assert.ok(initial.dock.height<=40,`command strip is too tall: ${initial.dock.height}px`);
  assert.ok(initial.search.height<=30,`location search is too tall: ${initial.search.height}px`);
  assert.ok(initial.controls.height<=30,`SAR controls are too tall: ${initial.controls.height}px`);
  assert.ok(initial.visibleMap.width>initial.vw*.98,`SAR view lost width: ${initial.visibleMap.width}/${initial.vw}`);
  assert.ok(initial.visibleMap.height>initial.vh*.88,`SAR view lost too much height: ${initial.visibleMap.height}/${initial.vh}`);
  assert.ok(initial.map.top>=initial.dock.bottom-2,'map overlaps command strip');
  assert.ok(initial.map.bottom>=initial.vh-8,`SAR view ends too high: ${initial.map.bottom}/${initial.vh}`);
  assert.deepEqual(initial.hits.map(x=>x.selector),[],`center SAR image is obscured by ${initial.hits.map(x=>x.selector).join(', ')}`);

  // Use the same location path a real user uses. Selecting a target must leave world-navigation
  // mode and enter the bounded regional measured-SAR scale automatically.
  await page.evaluate(()=>globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'}));
  await page.waitForFunction(()=>{const v=globalThis.OMEGA_SAR_RENDERER?.view,t=globalThis.OMEGA_SAR_NAVIGATION?.target;return v&&t&&Math.abs(t.lat-32.2226)<1e-5&&Math.abs(t.lon+110.9747)<1e-5&&v.scale>=260&&v.scale<=720;},null,{timeout:30000});
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0&&globalThis.OMEGA_SAR_INTERACTION?.activating===false,null,{timeout:90000});
  await page.waitForFunction(()=>{const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;return r?.state==='READY'&&r.visible===true&&r.patch?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&r.patch?.evidence?.measured===true&&r.patch?.stats?.validCount>100;},null,{timeout:150000,polling:300});
  await page.waitForFunction(()=>globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface==='REGIONAL_SHAPED_SAR'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.regionalStats?.validSar>100,null,{timeout:90000,polling:250});

  const measured=await page.evaluate(()=>({
    view:{...globalThis.OMEGA_SAR_RENDERER.view},
    surface:globalThis.OMEGA_SAR_PRIMARY_WORKSTATION.surface,
    nativeSurface:globalThis.OMEGA_DATA_NATIVE_SURFACE.surface,
    nativeStats:globalThis.OMEGA_DATA_NATIVE_SURFACE.regionalStats,
    regional:{state:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.state,visible:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.visible,width:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch?.width||0,height:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch?.height||0,validCount:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch?.stats?.validCount||0,evidence:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch?.evidence||null},
    nativeCanvas:getComputedStyle(document.querySelector('.omega-data-native-surface canvas')).opacity,
    regionalCanvas:getComputedStyle(document.querySelector('.omega-regional-sar-layer canvas')).opacity,
    globalCanvas:getComputedStyle(document.querySelector('.omega-global-sar-fabric canvas')).opacity,
    controls:document.querySelector('#omegaSarPrimaryControls')?.innerText||'',
    loadStage:document.querySelector('#omegaR257Stage')?.innerText||''
  }));
  assert.equal(measured.surface,'REGIONAL_MEASURED');assert.equal(measured.nativeSurface,'REGIONAL_SHAPED_SAR');assert.equal(measured.regional.state,'READY');assert.equal(measured.regional.visible,true);assert.equal(measured.regional.evidence?.measured,true);assert.equal(measured.regional.evidence?.inferred,false);assert.ok(measured.regional.validCount>100);assert.ok(measured.nativeStats?.validSar>100);assert.ok(measured.nativeStats?.terrainCoverage>.35,'source DEM did not materially shape the calibrated SAR display');assert.ok(Number(measured.nativeCanvas)>=.95,'data-native shaped SAR is not visually primary');assert.ok(Number(measured.regionalCanvas)<=.03,'legacy flat regional SAR still competes with shaped surface');assert.ok(Number(measured.globalCanvas)<=.01,'global support fabric is washing out measured SAR');assert.match(measured.controls,/SAR/);assert.match(measured.controls,/WORLD/);assert.match(measured.controls,/DATA/);assert.match(measured.loadStage,/REGIONAL|MEASURED|EXACT/i);

  // Navigation must still work after high-detail shaped measurement is on screen.
  const before=measured.view;await page.click('#omegaZoomOut');await page.waitForTimeout(700);const afterZoom=await page.evaluate(()=>({...globalThis.OMEGA_SAR_RENDERER.view}));assert.ok(afterZoom.scale<before.scale,'zoom-out control did not move the SAR camera');
  await page.click('#omegaSarFocus');await page.waitForFunction(()=>Math.abs((globalThis.OMEGA_SAR_RENDERER?.view?.scale||0)-420)<1,null,{timeout:10000});
  await page.click('#omegaSarWorld');await page.waitForFunction(()=>Math.abs((globalThis.OMEGA_SAR_RENDERER?.view?.scale||0)-1)<.01,null,{timeout:10000});
  await page.click('#omegaSarFocus');await page.waitForFunction(()=>{const v=globalThis.OMEGA_SAR_RENDERER?.view;return v&&v.scale>=260&&v.scale<=720;},null,{timeout:10000});

  await mkdir('test-results',{recursive:true});
  await page.screenshot({path:'test-results/r255-sar-primary-workstation.png',fullPage:false});

  await page.click('#omegaSarEvidence');await page.waitForTimeout(320);const evidence=await page.evaluate(()=>({drawer:document.body.dataset.drawer,d:document.querySelector('.evidence-dock').getBoundingClientRect(),vw:innerWidth,proofDisplay:getComputedStyle(document.querySelector('#omegaR257ProofStack')).display,mapNavOpacity:getComputedStyle(document.querySelector('#omegaMapNav')).opacity}));assert.equal(evidence.drawer,'evidence');assert.ok(evidence.d.width<=342);assert.ok(evidence.d.left>evidence.vw*.76);assert.equal(evidence.proofDisplay,'none');assert.equal(Number(evidence.mapNavOpacity),0);await page.keyboard.press('Escape');
  assert.deepEqual(pageErrors,[],`page script errors: ${pageErrors.join(' | ')}`);
  console.log('SAR_R4_R257_PRIMARY_WORKSTATION_PASS',JSON.stringify({initial,measured,afterZoom,evidence},null,2));
}finally{await browser.close();}
