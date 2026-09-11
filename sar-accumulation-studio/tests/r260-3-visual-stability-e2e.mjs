import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});

async function ready(page){
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForFunction(()=>
    globalThis.OMEGA_SAR_VISUAL_STABILITY?.state==='READY'&&
    globalThis.OMEGA_SAR_PRIMARY_WORKSTATION?.state==='READY'&&
    document.body.dataset.visualStability==='ready',null,{timeout:30000});
  await page.waitForTimeout(500);
}

async function desktopProof(){
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    await ready(page);
    await page.evaluate(()=>{globalThis.OMEGA_SAR_EXPERIENCE?.setMode?.('explore');globalThis.OMEGA_SAR_EXPERIENCE?.setDrawer?.(null);});
    await page.waitForTimeout(100);
    const initial=await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const dock=rect('.place-dock'),map=rect('.map-wrap'),search=rect('.place-search'),controls=rect('#omegaSarPrimaryControls');
      const globalCanvas=getComputedStyle(document.querySelector('.omega-global-sar-fabric canvas'));
      const nativeCanvas=getComputedStyle(document.querySelector('.omega-data-native-surface canvas'));
      return {vw:innerWidth,vh:innerHeight,dock,map,search,controls,scrollWidth:document.documentElement.scrollWidth,
        patch:globalThis.OMEGA_SAR_R4_RUNTIME?.patchRelease,contract:globalThis.OMEGA_SAR_VISUAL_STABILITY?.contract,
        globalOpacity:Number(globalCanvas.opacity),globalFilter:globalCanvas.filter,globalTransform:globalCanvas.transform,
        nativeOpacity:Number(nativeCanvas.opacity),nativeBlend:nativeCanvas.mixBlendMode};
    });
    assert.equal(initial.patch,'R260.3');
    assert.equal(initial.contract,'ONE_COMMAND_BAR_ONE_IMAGE_PLANE_CONTAINED_DRAWERS');
    assert.ok(initial.scrollWidth<=initial.vw+1,`desktop horizontal overflow ${initial.scrollWidth}/${initial.vw}`);
    assert.ok(Math.abs(initial.dock.left-initial.map.left)<1&&Math.abs(initial.dock.right-initial.map.right)<1,'command bar and image plane are not aligned');
    assert.ok(initial.dock.bottom<=initial.map.top+1,'command bar overlaps the image plane');
    assert.ok(initial.search.right<=initial.controls.left+1,'search and primary controls overlap');
    assert.ok(initial.globalOpacity<=.08,`world SAR fabric is too strong: ${initial.globalOpacity}`);
    assert.equal(initial.globalFilter,'none');assert.equal(initial.globalTransform,'none');
    assert.ok(initial.nativeOpacity<=.17,`world relief is washing out imagery: ${initial.nativeOpacity}`);

    await page.click('#omegaQuickRail [data-drawer="mission"]');
    await page.waitForFunction(()=>document.body.dataset.drawer==='mission'&&!document.querySelector('.mission-rail').inert);
    const mission=await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const panel=document.querySelector('.mission-rail'),dock=rect('.place-dock'),map=rect('.map-wrap'),drawer=rect('.mission-rail');
      return {vw:innerWidth,vh:innerHeight,dock,map,drawer,scrollWidth:panel.scrollWidth,clientWidth:panel.clientWidth,
        close:!!panel.querySelector(':scope > .omega-stability-toolbar .omega-drawer-close'),transition:getComputedStyle(document.querySelector('.map-wrap')).transitionDuration,
        evidenceInert:document.querySelector('.evidence-dock').inert};
    });
    assert.ok(mission.drawer.left>=4&&mission.drawer.right<=mission.vw-4,'mission drawer escapes the viewport');
    assert.ok(mission.scrollWidth<=mission.clientWidth+1,'mission controls overflow horizontally');
    assert.ok(mission.map.left>=mission.drawer.right-1,'mission drawer obscures the image plane');
    assert.ok(Math.abs(mission.dock.left-mission.map.left)<1&&Math.abs(mission.dock.right-mission.map.right)<1,'mission command/map reservation differs');
    assert.equal(mission.close,true);assert.equal(mission.evidenceInert,true);assert.equal(mission.transition,'0s');
    await page.click('.mission-rail > .omega-stability-toolbar .omega-drawer-close');
    await page.waitForFunction(()=>!document.body.dataset.drawer);

    await page.click('#omegaQuickRail [data-drawer="evidence"]');
    await page.waitForFunction(()=>document.body.dataset.drawer==='evidence'&&!document.querySelector('.evidence-dock').inert);
    const evidence=await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const panel=document.querySelector('.evidence-dock'),dock=rect('.place-dock'),map=rect('.map-wrap'),drawer=rect('.evidence-dock');
      return {vw:innerWidth,dock,map,drawer,scrollWidth:panel.scrollWidth,clientWidth:panel.clientWidth,
        close:!!panel.querySelector(':scope > .omega-stability-toolbar .omega-drawer-close'),transition:getComputedStyle(document.querySelector('.map-wrap')).transitionDuration};
    });
    assert.ok(evidence.drawer.left>=4&&evidence.drawer.right<=evidence.vw-4,'evidence drawer escapes the viewport');
    assert.ok(evidence.scrollWidth<=evidence.clientWidth+1,'evidence content overflows horizontally');
    assert.ok(evidence.map.right<=evidence.drawer.left+1,'evidence drawer obscures the image plane');
    assert.ok(Math.abs(evidence.dock.left-evidence.map.left)<1&&Math.abs(evidence.dock.right-evidence.map.right)<1,'evidence command/map reservation differs');
    assert.equal(evidence.close,true);assert.equal(evidence.transition,'0s');
    await page.click('.evidence-dock > .omega-stability-toolbar .omega-drawer-close');
    await page.waitForFunction(()=>!document.body.dataset.drawer);
    await mkdir('test-results',{recursive:true});
    await page.screenshot({path:'test-results/r260-3-visual-stability-desktop.png',fullPage:false});
    assert.deepEqual(errors,[],`desktop page errors: ${errors.join(' | ')}`);
    return {initial,mission,evidence};
  }finally{await page.close();}
}

async function mobileProof(){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    await ready(page);
    await page.evaluate(()=>{globalThis.OMEGA_SAR_EXPERIENCE?.setMode?.('explore');globalThis.OMEGA_SAR_EXPERIENCE?.setDrawer?.(null);});
    await page.waitForTimeout(100);
    const initial=await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const visibleChildren=[...document.querySelector('#omegaSarPrimaryControls').children].filter(node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.display!=='none'&&r.width>1;}).map(node=>({id:node.id,left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right}));
      return {vw:innerWidth,vh:innerHeight,htmlScroll:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,
        top:rect('.topbar'),dock:rect('.place-dock'),search:rect('.place-search'),controls:rect('#omegaSarPrimaryControls'),map:rect('.map-wrap'),visibleChildren};
    });
    await mkdir('test-results',{recursive:true});
    await page.screenshot({path:'test-results/r260-3-visual-stability-mobile.png',fullPage:false});
    assert.ok(initial.htmlScroll<=initial.vw+1&&initial.bodyScroll<=initial.vw+1,`mobile horizontal overflow ${initial.htmlScroll}/${initial.bodyScroll}/${initial.vw}`);
    assert.ok(initial.dock.left>=0&&initial.dock.right<=initial.vw,'mobile command bar escapes viewport');
    assert.ok(initial.search.bottom<=initial.controls.top+1,'mobile search and controls overlap');
    assert.ok(initial.map.top>=initial.dock.bottom-1,'mobile command bar overlaps image');
    assert.ok(initial.map.height>initial.vh*.70,'mobile image plane is too short');
    assert.ok(initial.visibleChildren.length>=4,'mobile controls were clipped away');
    for(const child of initial.visibleChildren)assert.ok(child.left>=initial.controls.left-1&&child.right<=initial.controls.right+1,`${child.id||'control'} escapes mobile controls`);

    const mapBefore={...initial.map};
    await page.click('#omegaQuickRail [data-drawer="mission"]');
    await page.waitForFunction(()=>document.body.dataset.drawer==='mission'&&!document.querySelector('.mission-rail').inert);
    const mission=await page.evaluate(()=>{
      const p=document.querySelector('.mission-rail'),r=p.getBoundingClientRect(),m=document.querySelector('.map-wrap').getBoundingClientRect();
      return {vw:innerWidth,vh:innerHeight,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,map:{left:m.left,right:m.right,width:m.width},scrollWidth:p.scrollWidth,clientWidth:p.clientWidth,close:!!p.querySelector('.omega-drawer-close')};
    });
    assert.ok(mission.left>=3&&mission.right<=mission.vw-3&&mission.bottom<=mission.vh,'mobile mission sheet escapes viewport');
    assert.ok(mission.width>mission.vw*.96,'mobile mission sheet is not a usable full sheet');
    assert.ok(mission.scrollWidth<=mission.clientWidth+1,'mobile mission fields overflow horizontally');
    assert.ok(Math.abs(mission.map.left-mapBefore.left)<1&&Math.abs(mission.map.width-mapBefore.width)<1,'mobile drawer resizes the canvas');
    assert.equal(mission.close,true);
    await page.click('.mission-rail .omega-drawer-close');await page.waitForFunction(()=>!document.body.dataset.drawer);

    await page.click('#omegaQuickRail [data-drawer="evidence"]');
    await page.waitForFunction(()=>document.body.dataset.drawer==='evidence'&&!document.querySelector('.evidence-dock').inert);
    const evidence=await page.evaluate(()=>{const p=document.querySelector('.evidence-dock'),r=p.getBoundingClientRect();return {vw:innerWidth,vh:innerHeight,left:r.left,right:r.right,top:r.top,bottom:r.bottom,scrollWidth:p.scrollWidth,clientWidth:p.clientWidth,close:!!p.querySelector('.omega-drawer-close')};});
    assert.ok(evidence.left>=3&&evidence.right<=evidence.vw-3&&evidence.bottom<=evidence.vh,'mobile evidence sheet escapes viewport');
    assert.ok(evidence.scrollWidth<=evidence.clientWidth+1,'mobile evidence content overflows horizontally');
    assert.equal(evidence.close,true);
    await page.screenshot({path:'test-results/r260-3-visual-stability-mobile.png',fullPage:false});
    await page.click('.evidence-dock .omega-drawer-close');
    assert.deepEqual(errors,[],`mobile page errors: ${errors.join(' | ')}`);
    return {initial,mission,evidence};
  }finally{await page.close();}
}

try{
  const desktop=await desktopProof();
  const mobile=await mobileProof();
  console.log('SAR_R260_3_VISUAL_STABILITY_PASS',JSON.stringify({desktop,mobile},null,2));
}finally{await browser.close();}
