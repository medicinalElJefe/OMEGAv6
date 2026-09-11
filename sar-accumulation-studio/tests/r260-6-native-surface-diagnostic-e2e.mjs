import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1649,height:927},deviceScaleFactor:1});
  const terrainResponses=[],terrainFailures=[],pageErrors=[];
  page.on('response',r=>{if(r.url().includes('/api/terrain'))terrainResponses.push({url:r.url(),status:r.status()});});
  page.on('requestfailed',r=>{if(r.url().includes('/api/terrain'))terrainFailures.push({url:r.url(),failure:r.failure()?.errorText||'unknown'});});
  page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R257'&&globalThis.OMEGA_SAR_LOCATION?.jump&&globalThis.OMEGA_DATA_NATIVE_TERRAIN&&globalThis.OMEGA_DATA_NATIVE_SURFACE&&globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT,null,{timeout:30000});
  await page.evaluate(()=>globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'}));
  await page.waitForFunction(()=>{const v=globalThis.OMEGA_SAR_RENDERER?.view,t=globalThis.OMEGA_SAR_NAVIGATION?.target;return v&&t&&Math.abs(t.lat-32.2226)<1e-5&&Math.abs(t.lon+110.9747)<1e-5&&v.scale>=260&&v.scale<=720;},null,{timeout:30000});
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0&&globalThis.OMEGA_SAR_INTERACTION?.activating===false,null,{timeout:90000});
  await page.waitForFunction(()=>{const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;return r?.state==='READY'&&r.visible===true&&r.patch?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&r.patch?.evidence?.measured===true&&r.patch?.stats?.validCount>100;},null,{timeout:150000,polling:300});
  let promoted=true;
  try{await page.waitForFunction(()=>globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface==='REGIONAL_SHAPED_SAR'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.regionalStats?.validSar>100,null,{timeout:45000,polling:250});}catch{promoted=false;}
  const snapshot=await page.evaluate(()=>{
    const t=globalThis.OMEGA_DATA_NATIVE_TERRAIN,s=globalThis.OMEGA_DATA_NATIVE_SURFACE,r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT,v=globalThis.OMEGA_SAR_RENDERER?.view;
    return {
      view:v?{...v,bbox:globalThis.OMEGA_SAR_RENDERER.viewBounds?.()}:null,
      terrain:t?{state:t.state,stage:t.stage,error:t.error,updatedAt:t.updatedAt,policy:t.policy,terrain:t.terrain?{bbox:t.terrain.bbox,width:t.terrain.width,height:t.terrain.height,z:t.terrain.z,tileCount:t.terrain.tileCount,min:t.terrain.min,max:t.terrain.max}:null}:null,
      surface:s?{state:s.state,surface:s.surface,terrainReady:s.terrainReady,regionalReady:s.regionalReady,regionalStats:s.regionalStats,admission:s.admission,layerOwnership:s.layerOwnership}:null,
      regional:r?{state:r.state,visible:r.visible,error:r.error,requestedBbox:r.requestedBbox,patch:r.patch?{id:r.patch.id,width:r.patch.width,height:r.patch.height,coverageBbox:r.patch.coverageBbox,sourceWindow:r.patch.sourceWindow,validCount:r.patch.stats?.validCount,meshState:r.patch.geoMesh?.state,meshNodes:r.patch.geoMesh?.validNodeCount}:null}:null,
      transport:globalThis.OMEGA_SAR_BROWSER_TRANSPORT?.snapshot?.()||null
    };
  });
  console.log('SAR_R2606_NATIVE_SURFACE_DIAGNOSIS',JSON.stringify({promoted,snapshot,terrainResponses,terrainFailures,pageErrors},null,2));
  assert.deepEqual(pageErrors,[],'page errors occurred');
  if(!promoted)process.exitCode=2;
}finally{await browser.close();}
