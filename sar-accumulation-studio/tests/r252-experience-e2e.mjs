import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R252'&&globalThis.OMEGA_SAR_EXPERIENCE?.ready===true&&globalThis.OMEGA_SAR_EXPERIENCE_COMPAT?.state==='READY'&&globalThis.OMEGA_SAR_SMOOTH_MOTION?.state==='READY',null,{timeout:30000});
  await page.waitForSelector('.omega-global-sar-fabric canvas',{state:'attached',timeout:30000});

  const initial=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s)?.getBoundingClientRect(),style=s=>{const n=document.querySelector(s);return n?getComputedStyle(n):null;};
    const map=rect('.map-wrap'),rail=rect('.mission-rail'),dock=rect('.evidence-dock'),analysis=rect('.analysis-deck'),quick=rect('#omegaQuickRail'),transport=rect('.transport-deck');
    return {vw:innerWidth,vh:innerHeight,map,rail,dock,analysis,quick,transport,mode:document.body.dataset.mode,drawer:document.body.dataset.drawer||null,fieldHud:style('#omegaFieldHud')?.display||null,fabricOpacity:style('.omega-global-sar-fabric canvas')?.opacity||null,fabricFilter:style('.omega-global-sar-fabric canvas')?.filter||null,sourceCanvas:rect('#raster'),liveTag:!!document.querySelector('#liveTag')};
  });
  assert.equal(initial.mode,'explore');assert.equal(initial.drawer,null);assert.equal(initial.liveTag,true,'legacy live status write target must remain available');
  assert.ok(initial.map.width>initial.vw*.88,`map width ${initial.map.width} is not immersive at viewport ${initial.vw}`);
  assert.ok(initial.map.height>initial.vh*.86,`map height ${initial.map.height} is not immersive at viewport ${initial.vh}`);
  assert.ok(initial.rail.right<5,'mission rail should be off-canvas in Explore');
  assert.ok(initial.dock.left>initial.vw-5,'evidence dock should be off-canvas in Explore');
  assert.ok(initial.analysis.top>initial.vh-5,'analysis deck should be off-canvas in Explore');
  assert.ok(initial.quick.width>20&&initial.transport.width>400,'quick controls and cinema transport must remain usable');
  assert.equal(initial.fieldHud,'none','legacy field HUD should not cover Explore');
  assert.ok(Number(initial.fabricOpacity)<=.3,'global fabric should be visually subordinate');
  assert.match(initial.fabricFilter,/blur\(/,'global fabric should be softened instead of graph-paper cells');

  await page.click('#omegaQuickRail [data-drawer="evidence"]');
  await page.waitForTimeout(350);
  const evidence=await page.evaluate(()=>{const d=document.querySelector('.evidence-dock').getBoundingClientRect(),r=document.querySelector('#raster').getBoundingClientRect(),p=document.querySelector('.pixel-stage').getBoundingClientRect();return {vw:innerWidth,vh:innerHeight,d,r,p,drawer:document.body.dataset.drawer};});
  assert.equal(evidence.drawer,'evidence');assert.ok(evidence.d.right<=evidence.vw+2&&evidence.d.left>evidence.vw*.65,'evidence drawer should be visible on the right');
  assert.ok(evidence.r.width>evidence.p.width*.85&&evidence.r.height>evidence.p.height*.85,'source raster should be magnified to a useful evidence viewport');

  await page.keyboard.press('Escape');await page.waitForTimeout(280);
  assert.equal(await page.evaluate(()=>document.body.dataset.drawer||null),null);
  await page.keyboard.press('m');await page.waitForTimeout(280);assert.equal(await page.evaluate(()=>document.body.dataset.drawer),'mission');
  await page.keyboard.press('Escape');
  await page.click('#omegaModeSwitch [data-mode="analyze"]');await page.waitForTimeout(320);
  const analyze=await page.evaluate(()=>({vh:innerHeight,mode:document.body.dataset.mode,drawer:document.body.dataset.drawer,deck:document.querySelector('.analysis-deck').getBoundingClientRect()}));
  assert.equal(analyze.mode,'analyze');assert.equal(analyze.drawer,'analysis');assert.ok(analyze.deck.top<analyze.vh-40);
  await page.click('#omegaModeSwitch [data-mode="explore"]');await page.waitForTimeout(280);

  await page.keyboard.press('f');await page.waitForTimeout(80);
  const clean=await page.evaluate(()=>({clean:document.body.classList.contains('omega-clean'),status:getComputedStyle(document.querySelector('#omegaExperienceStatus')).opacity,transport:getComputedStyle(document.querySelector('.transport-deck')).opacity}));
  assert.equal(clean.clean,true);assert.equal(Number(clean.status),0);assert.equal(Number(clean.transport),0);
  await page.keyboard.press('f');

  const experience=await page.evaluate(()=>({state:globalThis.OMEGA_SAR_EXPERIENCE.state,mode:globalThis.OMEGA_SAR_EXPERIENCE.mode,updates:globalThis.OMEGA_SAR_EXPERIENCE.updates,compat:globalThis.OMEGA_SAR_EXPERIENCE_COMPAT,runtime:globalThis.OMEGA_SAR_R4_RUNTIME.experience}));
  assert.equal(experience.state,'READY');assert.ok(experience.updates>0);assert.equal(experience.compat.state,'READY');assert.equal(experience.runtime.layout,'FULL_BLEED_EARTH_WITH_ON_DEMAND_MISSION_EVIDENCE_ANALYSIS_DRAWERS');
  assert.deepEqual(pageErrors,[],`page script errors: ${pageErrors.join(' | ')}`);

  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/r252-immersive-experience.png',fullPage:false});
  console.log('SAR_R4_R252_IMMERSIVE_EXPERIENCE_PASS',JSON.stringify({initial,evidence,analyze,clean,experience},null,2));
}finally{await browser.close();}
