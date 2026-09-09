import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;assert.ok(base,'SAR_TEST_URL is required');
const tucson={lon:-110.9747,lat:32.2226};const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},geolocation:{longitude:tucson.lon,latitude:tucson.lat,accuracy:18},permissions:['geolocation']});
  const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForSelector('#omegaMapNav',{state:'visible',timeout:20000});await page.click('#deviceLocation');
  await page.waitForFunction(({lat,lon})=>{const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/),v=globalThis.OMEGA_SAR_NAVIGATION?.view;return !!p&&v&&Math.abs(Number(p[1])-lat)<1e-4&&Math.abs(Number(p[2])-lon)<1e-4&&Math.abs(v.centerLat-lat)<1e-6&&Math.abs(v.centerLon-lon)<1e-6;},tucson,{timeout:20000});
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:70000});await page.waitForFunction(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src&&globalThis.OMEGA_SAR_INTERACTION?.sourceSequence>=1,null,{timeout:30000});
  const nav=await page.evaluate(({lat,lon})=>{const n=globalThis.OMEGA_SAR_NAVIGATION,v=n?.view,e=n?.centerErrorPixels?.({lat,lon});return {view:v,error:e,point:document.querySelector('#point')?.textContent||'',status:document.querySelector('#status')?.textContent||''};},tucson);
  assert.ok(nav.error&&nav.error.distance<=1.5,`camera is not centered on Tucson: ${JSON.stringify(nav)}`);assert.ok(nav.view.scale<=180,'pre-calibration view abandoned source SAR scale');assert.equal(await page.locator('.omega-local-nav-map').count(),0,'conventional basemap exists in primary SAR instrument');

  const sourceDiagnostic=await page.evaluate(async()=>{
    const id=(document.querySelector('#currentScene')?.textContent||'').trim(),detailResponse=await fetch(`/api/stac/item?id=${encodeURIComponent(id)}`,{headers:{accept:'application/geo+json,application/json'}}),detail=detailResponse.ok?await detailResponse.json():null;
    const simplifyAsset=a=>a?{href:a.href||null,type:a.type||null,resolution:a['omega:resolution']||a.omegaResolution||null,validated:a['omega:validated']??null}:null;
    const out={id,itemStatus:detailResponse.status,properties:detail?{resolved:detail.properties?.['omega:resolved_product_annotations']??null,validated:detail.properties?.['omega:validated_product_annotations']??null,unresolved:detail.properties?.['omega:unresolved_product_annotations']??null,projEpsg:detail.properties?.['proj:epsg']??null,projShape:detail.properties?.['proj:shape']??null,projTransform:detail.properties?.['proj:transform']??null,projBbox:detail.properties?.['proj:bbox']??null}:null,assets:{vh:simplifyAsset(detail?.assets?.vh),vv:simplifyAsset(detail?.assets?.vv),productVh:simplifyAsset(detail?.assets?.['schema-product-vh']),calibrationVh:simplifyAsset(detail?.assets?.['schema-calibration-vh'])},transport:null};
    const measurement=detail?.assets?.vh?.href||detail?.assets?.vv?.href;if(measurement){const proxy=`/api/raster?url=${encodeURIComponent(measurement)}`,head=await fetch(proxy,{method:'HEAD',cache:'no-store'}),range=await fetch(proxy,{headers:{range:'bytes=0-65535'},cache:'no-store'}),bytes=range.ok?new Uint8Array(await range.arrayBuffer()):new Uint8Array();out.transport={head:{status:head.status,contentLength:head.headers.get('content-length'),acceptRanges:head.headers.get('accept-ranges')},range:{status:range.status,contentRange:range.headers.get('content-range'),receivedBytes:bytes.length,first4:[...bytes.slice(0,4)]}};}
    return out;
  });
  console.log('TUCSON_SOURCE_GEOREFERENCE_DIAGNOSTIC',JSON.stringify(sourceDiagnostic,null,2));assert.equal(sourceDiagnostic.transport?.range?.status,206);assert.equal(sourceDiagnostic.properties?.projEpsg,4326);assert.ok(Array.isArray(sourceDiagnostic.properties?.projTransform));

  const calibration=await page.evaluate(async()=>{
    const select=document.querySelector('#assetSelect');if(select&&[...select.options].some(o=>o.value.toLowerCase()==='vh')){select.value='vh';select.dispatchEvent(new Event('change',{bubbles:true}));}
    const sentinel=globalThis.OMEGA_SAR_SENTINEL;if(!sentinel?.loadCalibratedCurrent)return {ok:false,error:'Sentinel runtime unavailable'};
    let patch=null,error=null;try{patch=await sentinel.loadCalibratedCurrent({force:true});}catch(e){error=e?.stack||e?.message||String(e);}
    return {ok:!!patch,error,badge:document.querySelector('#sarCalProof')?.textContent||'',rasterEmpty:document.querySelector('#rasterEmpty')?.textContent||'',rasterStats:document.querySelector('#rasterStats')?.textContent||'',visibility:globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY||null,patch:patch?{state:patch.state,id:patch.id,target:patch.target,polarization:patch.polarization,quantity:patch.quantity,validCount:patch.stats?.validCount,geolocation:patch.geolocation,geoMesh:patch.geoMesh,product:patch.product,provenance:patch.provenance,evidence:patch.evidence}:null};
  });
  console.log('TUCSON_CALIBRATION_DIAGNOSTIC',JSON.stringify(calibration,null,2));
  assert.ok(calibration.ok,`Tucson calibrated Sentinel patch failed: ${JSON.stringify(calibration)}`);assert.equal(calibration.patch?.state,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.ok(calibration.patch?.validCount>0);assert.ok(Math.abs(calibration.patch.target.lon-tucson.lon)<1e-4&&Math.abs(calibration.patch.target.lat-tucson.lat)<1e-4);assert.ok(calibration.patch?.geoMesh?.validNodeCount>=4);assert.ok(/PRODUCT_GCP|COG_STAC_AFFINE/.test(calibration.patch?.geolocation?.quality||''),`calibrated patch lacks source geolocation: ${JSON.stringify(calibration.patch?.geolocation)}`);assert.equal(calibration.patch?.evidence?.measured,true);assert.equal(calibration.patch?.evidence?.inferred,false);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT',null,{timeout:15000});
  const final=await page.evaluate(()=>({view:globalThis.OMEGA_SAR_NAVIGATION?.view,focus:globalThis.OMEGA_SAR_LOCAL_FOCUS,overlay:globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.state,browseMain:document.querySelector('.sar-source-browse-canvas')?.dataset.mainMapVisible,anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length||0}));
  assert.ok(final.view.scale>180,'exact SAR did not become the local primary view');assert.equal(final.overlay,'CALIBRATED_SENTINEL1_TARGET_PATCH');assert.equal(final.browseMain,'false');assert.ok(final.anchors>=4);assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);console.log('SAR_R4_TUCSON_EXACT_SAR_PASS');
}finally{await browser.close();}
