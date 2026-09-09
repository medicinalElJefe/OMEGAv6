import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;
assert.ok(base,'SAR_TEST_URL is required');
const tucson={lon:-110.9747,lat:32.2226};
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},geolocation:{longitude:tucson.lon,latitude:tucson.lat,accuracy:18},permissions:['geolocation']});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForSelector('#omegaMapNav',{state:'visible',timeout:20000});
  await page.click('#deviceLocation');
  await page.waitForFunction(({lat,lon})=>{
    const p=(document.querySelector('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    return !!p&&Math.abs(Number(p[1])-lat)<1e-4&&Math.abs(Number(p[2])-lon)<1e-4;
  },tucson,{timeout:20000});
  await page.waitForFunction(()=>Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:70000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_SOURCE_FRAME?.src&&globalThis.OMEGA_SAR_INTERACTION?.sourceSequence>=1,null,{timeout:30000});
  await page.waitForTimeout(800);

  const nav=await page.evaluate(({lat,lon})=>{
    const n=globalThis.OMEGA_SAR_NAVIGATION,v=n?.view,e=n?.centerErrorPixels?.({lat,lon});
    return {view:v,error:e,point:document.querySelector('#point')?.textContent||'',status:document.querySelector('#status')?.textContent||''};
  },tucson);
  assert.ok(nav.view,'navigation state missing');
  assert.ok(nav.error&&nav.error.distance<=1.5,`camera is not centered on Tucson target within 1.5 CSS px: ${JSON.stringify(nav)}`);

  const sourceDiagnostic=await page.evaluate(async()=>{
    const id=(document.querySelector('#currentScene')?.textContent||'').trim();
    const detailResponse=await fetch(`/api/stac/item?id=${encodeURIComponent(id)}`,{headers:{accept:'application/geo+json,application/json'}});
    const detail=detailResponse.ok?await detailResponse.json():null;
    const simplifyAsset=a=>a?{
      href:a.href||null,type:a.type||null,title:a.title||null,resolution:a['omega:resolution']||a.omegaResolution||null,validated:a['omega:validated']??null,
      projEpsg:a['proj:epsg']??null,projShape:a['proj:shape']??null,projTransform:a['proj:transform']??null,projBbox:a['proj:bbox']??null,
      rasterBands:a['raster:bands']??null
    }:null;
    const out={id,itemStatus:detailResponse.status,properties:detail?{
      resolved:detail.properties?.['omega:resolved_product_annotations']??null,
      validated:detail.properties?.['omega:validated_product_annotations']??null,
      unresolved:detail.properties?.['omega:unresolved_product_annotations']??null,
      projEpsg:detail.properties?.['proj:epsg']??null,
      projShape:detail.properties?.['proj:shape']??null,
      projTransform:detail.properties?.['proj:transform']??null,
      projBbox:detail.properties?.['proj:bbox']??null
    }:null,assets:{
      vh:simplifyAsset(detail?.assets?.vh),vv:simplifyAsset(detail?.assets?.vv),
      productVh:simplifyAsset(detail?.assets?.['schema-product-vh']),productVv:simplifyAsset(detail?.assets?.['schema-product-vv']),
      calibrationVh:simplifyAsset(detail?.assets?.['schema-calibration-vh']),calibrationVv:simplifyAsset(detail?.assets?.['schema-calibration-vv']),
      manifest:simplifyAsset(detail?.assets?.['safe-manifest'])
    },transport:null,geotiff:null};
    const measurement=detail?.assets?.vh?.href||detail?.assets?.vv?.href;
    if(measurement){
      const proxy=`/api/raster?url=${encodeURIComponent(measurement)}`;
      try{
        const head=await fetch(proxy,{method:'HEAD',cache:'no-store'});
        const range=await fetch(proxy,{headers:{range:'bytes=0-65535'},cache:'no-store'});
        const bytes=range.ok?new Uint8Array(await range.arrayBuffer()):new Uint8Array();
        const first16=[...bytes.slice(0,16)].map(v=>v.toString(16).padStart(2,'0')).join(' ');
        out.transport={head:{status:head.status,contentLength:head.headers.get('content-length'),acceptRanges:head.headers.get('accept-ranges'),contentType:head.headers.get('content-type'),etag:head.headers.get('etag')},range:{status:range.status,contentLength:range.headers.get('content-length'),contentRange:range.headers.get('content-range'),acceptRanges:range.headers.get('accept-ranges'),contentType:range.headers.get('content-type'),receivedBytes:bytes.length,first16}};
      }catch(error){out.transport={error:error?.stack||error?.message||String(error)};}
      try{
        const mod=await import('/vendor/geotiff.bundle.mjs');
        const tiff=await mod.fromUrl(proxy,{cacheSize:8*1024*1024,blockSize:65536});
        const image=await tiff.getImage(0),fd=image.fileDirectory||{};
        const arr=v=>v==null?null:Array.from(v);
        let bbox=null,origin=null,resolution=null,geoKeys=null;
        try{bbox=image.getBoundingBox?.()||null}catch{}
        try{origin=image.getOrigin?.()||null}catch{}
        try{resolution=image.getResolution?.()||null}catch{}
        try{geoKeys=image.getGeoKeys?.()||null}catch{}
        out.geotiff={width:image.getWidth(),height:image.getHeight(),bbox:arr(bbox),origin:arr(origin),resolution:arr(resolution),geoKeys,
          modelPixelScale:arr(fd.ModelPixelScale),modelTiepoint:arr(fd.ModelTiepoint),modelTransformation:arr(fd.ModelTransformation),
          gdalMetadata:fd.GDAL_METADATA||null,gdalNoData:fd.GDAL_NODATA||null};
      }catch(error){out.geotiff={error:error?.stack||error?.message||String(error)};}
    }
    return out;
  });
  console.log('TUCSON_SOURCE_GEOREFERENCE_DIAGNOSTIC',JSON.stringify(sourceDiagnostic,null,2));

  const calibration=await page.evaluate(async()=>{
    const select=document.querySelector('#assetSelect');
    if(select&&[...select.options].some(o=>o.value.toLowerCase()==='vh')){select.value='vh';select.dispatchEvent(new Event('change',{bubbles:true}));}
    const sentinel=globalThis.OMEGA_SAR_SENTINEL;
    if(!sentinel?.loadCalibratedCurrent)return {ok:false,error:'OMEGA_SAR_SENTINEL.loadCalibratedCurrent unavailable'};
    const started=performance.now();
    let patch=null,error=null;
    try{patch=await sentinel.loadCalibratedCurrent({force:true});}catch(e){error=e?.stack||e?.message||String(e);}
    const badge=document.querySelector('#sarCalProof')?.textContent||'';
    const rasterEmpty=document.querySelector('#rasterEmpty')?.textContent||'';
    const rasterStats=document.querySelector('#rasterStats')?.textContent||'';
    const visibility=globalThis.OMEGA_SAR_SOURCE_OVERLAY_VISIBILITY||null;
    return {ok:!!patch,error,elapsedMs:Math.round(performance.now()-started),badge,rasterEmpty,rasterStats,visibility,patch:patch?{state:patch.state,id:patch.id,target:patch.target,polarization:patch.polarization,quantity:patch.quantity,validCount:patch.stats?.validCount,geolocation:patch.geolocation,geoMesh:patch.geoMesh,product:patch.product,provenance:patch.provenance,evidence:patch.evidence}:null};
  });
  console.log('TUCSON_CALIBRATION_DIAGNOSTIC',JSON.stringify(calibration,null,2));
  assert.ok(calibration.ok,`Tucson calibrated Sentinel patch failed: ${JSON.stringify(calibration)}`);
  assert.equal(calibration.patch?.state,'CALIBRATED_SENTINEL1_TARGET_PATCH');
  assert.ok(calibration.patch?.validCount>0,'calibrated patch contains no valid measurement pixels');
  assert.ok(Number.isFinite(calibration.patch?.target?.lon)&&Math.abs(calibration.patch.target.lon-tucson.lon)<1e-4,'calibrated patch longitude is not the Tucson target');
  assert.ok(Number.isFinite(calibration.patch?.target?.lat)&&Math.abs(calibration.patch.target.lat-tucson.lat)<1e-4,'calibrated patch latitude is not the Tucson target');
  assert.ok(calibration.patch?.geoMesh?.validNodeCount>=4,`calibrated patch did not obtain an Earth-registration mesh: ${JSON.stringify(calibration.patch?.geoMesh)}`);
  assert.ok(/PRODUCT_GCP|COG_GEOTIFF/.test(calibration.patch?.geolocation?.quality||''),`calibrated patch is not source-geolocated: ${JSON.stringify(calibration.patch?.geolocation)}`);
  assert.equal(calibration.patch?.evidence?.measured,true,'calibrated patch lost measured identity');
  assert.equal(calibration.patch?.evidence?.inferred,false,'calibrated patch was incorrectly marked inferred');
  assert.equal(calibration.visibility?.mainMapVisible,false,`regional source quicklook remained painted over the local map: ${JSON.stringify(calibration.visibility)}`);
  assert.equal(calibration.visibility?.reason,'LOCAL_SCALE_REQUIRES_EXACT_GCP');
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log('SAR_R4_TUCSON_EXACT_CALIBRATION_PASS');
}finally{await browser.close();}
