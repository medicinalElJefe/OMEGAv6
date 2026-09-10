import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root HTTP ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R257'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.state==='READY'&&globalThis.OMEGA_DATA_NATIVE_TERRAIN,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.OMEGA_DATA_NATIVE_TERRAIN?.state==='READY'&&globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.rawDem===true,null,{timeout:60000});

  const globalProof=await page.evaluate(()=>({
    release:globalThis.OMEGA_SAR_R4_RUNTIME?.release,
    surface:globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface,
    terrain:{state:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.state,width:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.width,height:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.height,z:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.z,tileCount:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.tileCount,source:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.source},
    canvas:(()=>{const c=document.querySelector('.omega-data-native-surface canvas'),q=c?.getContext('2d'),d=q?.getImageData(0,0,c.width,c.height)?.data;if(!d)return null;let opaque=0,sum=0,sum2=0,n=0;for(let i=0;i<d.length;i+=16){const v=(d[i]+d[i+1]+d[i+2])/3;if(d[i+3]>0)opaque++;sum+=v;sum2+=v*v;n++;}const mean=sum/n;return {opaque,variance:sum2/n-mean*mean,width:c.width,height:c.height};})()
  }));
  assert.equal(globalProof.release,'R4-R257');assert.equal(globalProof.terrain.state,'READY');assert.equal(globalProof.terrain.source,'AWS_OPEN_DATA_TERRAIN_TILES');assert.ok(globalProof.terrain.width>=144&&globalProof.terrain.height>=64);assert.ok(globalProof.terrain.tileCount>0&&globalProof.terrain.tileCount<=24);assert.ok(globalProof.canvas?.opaque>1000,'global data-native surface did not paint source-derived pixels');assert.ok(globalProof.canvas?.variance>20,'global relief surface is visually flat');

  await page.evaluate(()=>globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'}));
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:80000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state==='READY'&&globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.evidence?.measured===true,null,{timeout:120000,polling:250});
  await page.waitForFunction(()=>globalThis.OMEGA_DATA_NATIVE_TERRAIN?.state==='READY'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface==='REGIONAL_SHAPED_SAR'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.regionalStats?.validSar>100,null,{timeout:90000,polling:250});

  const regional=await page.evaluate(()=>({
    view:{...globalThis.OMEGA_SAR_RENDERER.view},
    surface:globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface,
    stats:globalThis.OMEGA_DATA_NATIVE_SURFACE?.regionalStats,
    measured:{state:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.state,valid:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.stats?.validCount,evidence:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.evidence},
    layers:{native:getComputedStyle(document.querySelector('.omega-data-native-surface canvas')).opacity,regional:getComputedStyle(document.querySelector('.omega-regional-sar-layer canvas')).opacity,global:getComputedStyle(document.querySelector('.omega-global-sar-fabric canvas')).opacity,oldAwareness:getComputedStyle(document.querySelector('.omega-earth-awareness-layer canvas')).opacity},
    badge:document.querySelector('#omegaDataNativeBadge')?.textContent,
    workstation:globalThis.OMEGA_SAR_PRIMARY_WORKSTATION?.surface,
    dimensions:(()=>{const map=document.querySelector('#map').getBoundingClientRect(),stage=document.querySelector('.map-wrap').getBoundingClientRect();return {mapW:map.width,mapH:map.height,stageW:stage.width,stageH:stage.height,vw:innerWidth,vh:innerHeight};})()
  }));
  assert.equal(regional.surface,'REGIONAL_SHAPED_SAR');assert.equal(regional.measured.state,'CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT');assert.equal(regional.measured.evidence?.measured,true);assert.equal(regional.measured.evidence?.inferred,false);assert.ok(regional.measured.valid>100);assert.ok(regional.stats.validSar>100);assert.ok(regional.stats.terrainCoverage>.35,'terrain did not materially shape the measured SAR viewport');assert.equal(Number(regional.layers.oldAwareness),0,'legacy line-based terrain canvas still competes with shaped surface');assert.ok(Number(regional.layers.regional)<=.03,'raw regional canvas still washes out shaped output');assert.ok(Number(regional.layers.global)<=.01,'global support fabric still dominates measured surface');assert.match(regional.badge,/MEASURED SAR · .*TERRAIN-SHAPED DISPLAY/);assert.ok(regional.dimensions.stageW>regional.dimensions.vw*.84&&regional.dimensions.stageH>regional.dimensions.vh*.78,'data-native Earth surface is not the dominant workstation view');

  await mkdir('test-results',{recursive:true});
  await page.screenshot({path:'test-results/r256-data-native-regional.png',fullPage:false});

  // Navigation must remain controllable while the high-detail surface is active.
  const beforeScale=regional.view.scale;await page.click('#omegaZoomOut');await page.waitForTimeout(700);const afterScale=await page.evaluate(()=>globalThis.OMEGA_SAR_RENDERER.view.scale);assert.ok(afterScale<beforeScale,'high-detail surface blocked camera controls');await page.click('#omegaSarFocus');await page.waitForFunction(()=>{const s=globalThis.OMEGA_SAR_RENDERER?.view?.scale;return s>=260&&s<=720;},null,{timeout:12000});

  // Exact FIT may enter the high magnification measured patch, but the shaped renderer
  // must still preserve an explicit display-only boundary.
  await page.waitForFunction(()=>document.querySelector('#omegaSarFit')?.disabled===false,null,{timeout:90000});await page.click('#omegaSarFit');await page.waitForFunction(()=>globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface==='EXACT_SHAPED_SAR'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.exactStats?.validSar>100,null,{timeout:30000,polling:200});
  const exact=await page.evaluate(()=>({surface:globalThis.OMEGA_DATA_NATIVE_SURFACE.surface,stats:globalThis.OMEGA_DATA_NATIVE_SURFACE.exactStats,boundary:globalThis.OMEGA_DATA_NATIVE_SURFACE.boundary,patch:{state:globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state,evidence:globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.evidence},scale:globalThis.OMEGA_SAR_RENDERER?.view?.scale}));
  assert.equal(exact.surface,'EXACT_SHAPED_SAR');assert.equal(exact.patch.state,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.equal(exact.patch.evidence?.measured,true);assert.ok(exact.scale>900);assert.match(exact.boundary,/changes display only/i);

  await page.screenshot({path:'test-results/r256-data-native-surface.png',fullPage:false});
  assert.deepEqual(errors,[],`page errors: ${errors.join(' | ')}`);
  console.log('SAR_R256_CONTRACT_UNDER_R257_PASS',JSON.stringify({globalProof,regional,exact},null,2));
}finally{await browser.close();}
