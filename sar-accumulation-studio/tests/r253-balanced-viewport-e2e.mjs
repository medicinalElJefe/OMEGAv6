import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1649,height:927},deviceScaleFactor:1});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R253'&&globalThis.OMEGA_SAR_EXPERIENCE?.ready===true&&globalThis.OMEGA_SAR_BALANCED_VIEWPORT?.state==='READY',null,{timeout:30000});

  const initial=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s)?.getBoundingClientRect()||null;
    const visible=s=>{const n=document.querySelector(s);if(!n)return false;const cs=getComputedStyle(n),r=n.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0&&r.width>1&&r.height>1&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;};
    const selectors=['.topbar','.place-search','#omegaExperienceStatus','#omegaQuickRail','.transport-deck'];
    const occluders=selectors.filter(visible).map(s=>({selector:s,rect:rect(s)}));
    const center={left:innerWidth*.22,right:innerWidth*.78,top:innerHeight*.20,bottom:innerHeight*.76};
    const hits=occluders.filter(({rect:r})=>r.left<center.right&&r.right>center.left&&r.top<center.bottom&&r.bottom>center.top);
    const map=rect('.map-wrap'),top=rect('.topbar'),dock=rect('.place-dock'),dockStyle=getComputedStyle(document.querySelector('.place-dock'));
    const visibleMap={width:Math.max(0,Math.min(map.right,innerWidth)-Math.max(map.left,0)),height:Math.max(0,Math.min(map.bottom,innerHeight)-Math.max(map.top,0))};
    return {vw:innerWidth,vh:innerHeight,map,visibleMap,top,dock,dockPosition:dockStyle.position,search:rect('.place-search'),status:rect('#omegaExperienceStatus'),quick:rect('#omegaQuickRail'),transport:rect('.transport-deck'),drawer:document.body.dataset.drawer||null,mode:document.body.dataset.mode,hits,layout:globalThis.OMEGA_SAR_R4_RUNTIME.experience.layout,searchLayout:globalThis.OMEGA_SAR_BALANCED_VIEWPORT.searchLayout};
  });
  assert.equal(initial.mode,'explore');assert.equal(initial.drawer,null);assert.equal(initial.layout,'BALANCED_VIEWPORT_WITH_COMPACT_CONTROLS_AND_BOUNDED_DRAWERS');
  assert.equal(initial.searchLayout,'FLOATING_OVER_EARTH_NO_FLOW_ROW');assert.equal(initial.dockPosition,'absolute');
  assert.ok(initial.visibleMap.width>initial.vw*.98,`visible Earth width lost too much space: ${initial.visibleMap.width}/${initial.vw}`);
  assert.ok(initial.visibleMap.height>initial.vh*.94,`visible Earth height lost too much space: ${initial.visibleMap.height}/${initial.vh}`);
  assert.ok(initial.map.top<=initial.top.bottom+8,`Earth begins too far below top bar: map ${initial.map.top}, top ${initial.top.bottom}`);
  assert.ok(initial.map.bottom>=initial.vh-8,`Earth ends too far above viewport bottom: ${initial.map.bottom}/${initial.vh}`);
  assert.ok(initial.dock.height<=34,`location dock still consumes a layout band: ${initial.dock.height}px`);
  assert.ok(initial.top.height<=44,`top bar is oversized: ${initial.top.height}`);
  assert.ok(initial.search.width<=300&&initial.search.height<=34,`search control is oversized: ${initial.search.width}x${initial.search.height}`);
  assert.ok(initial.status.height<=28,`status HUD is oversized: ${initial.status.height}`);
  assert.ok(initial.quick.width<=40,`quick rail is oversized: ${initial.quick.width}`);
  assert.ok(initial.transport.width<=680&&initial.transport.height<=38,`transport is oversized: ${initial.transport.width}x${initial.transport.height}`);
  assert.deepEqual(initial.hits.map(x=>x.selector),[],`primary center view is obscured by ${initial.hits.map(x=>x.selector).join(', ')}`);

  await mkdir('test-results',{recursive:true});
  await page.screenshot({path:'test-results/r253-balanced-viewport.png',fullPage:false});

  await page.keyboard.press('e');await page.waitForTimeout(320);
  const evidence=await page.evaluate(()=>({drawer:document.body.dataset.drawer,d:document.querySelector('.evidence-dock').getBoundingClientRect(),pixel:document.querySelector('.pixel-stage')?.getBoundingClientRect()||null,vw:innerWidth,vh:innerHeight}));
  assert.equal(evidence.drawer,'evidence');assert.ok(evidence.d.width<=342,`evidence drawer too wide: ${evidence.d.width}`);assert.ok(evidence.d.left>evidence.vw*.76,`evidence drawer covers too much Earth: left=${evidence.d.left}`);if(evidence.pixel)assert.ok(evidence.pixel.height<=280,`pixel stage too tall: ${evidence.pixel.height}`);
  await page.keyboard.press('Escape');await page.waitForTimeout(220);

  await page.keyboard.press('a');await page.waitForTimeout(320);
  const analysis=await page.evaluate(()=>({drawer:document.body.dataset.drawer,d:document.querySelector('.analysis-deck').getBoundingClientRect(),vh:innerHeight}));
  assert.equal(analysis.drawer,'analysis');assert.ok(analysis.d.height<=analysis.vh*.47,`analysis drawer buries the view: ${analysis.d.height}/${analysis.vh}`);
  await page.keyboard.press('Escape');

  await page.keyboard.press('f');await page.waitForTimeout(100);
  const clean=await page.evaluate(()=>({clean:document.body.classList.contains('omega-clean'),status:Number(getComputedStyle(document.querySelector('#omegaExperienceStatus')).opacity),transport:Number(getComputedStyle(document.querySelector('.transport-deck')).opacity)}));
  assert.equal(clean.clean,true);assert.equal(clean.status,0);assert.equal(clean.transport,0);
  await page.keyboard.press('f');

  assert.deepEqual(pageErrors,[],`page script errors: ${pageErrors.join(' | ')}`);
  console.log('SAR_R4_R253_BALANCED_VIEWPORT_PASS',JSON.stringify({initial,evidence,analysis,clean},null,2));
}finally{await browser.close();}
