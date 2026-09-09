import { s3ToHttps } from './stac.mjs';
import {
  fetchSentinel1ItemDetail,
  sentinel1ProductAssets,
  supportTransportUrl,
  parseCalibrationXml,
  parseProductXml,
  geolocateToPixel,
  calibrationLutAt
} from './sentinel1-calibration-core.mjs';

const TIFF_CACHE=new Map();
const TEXT_CACHE=new Map();
let geotiffModulePromise=null;

function normalizedPath(value){return String(value||'').trim().replace(/^\.\//,'').replace(/^\//,'');}
function polToken(filename,pol){const f=String(filename||'').toLowerCase(),p=String(pol||'').toLowerCase();return f.includes(`-${p}-`)||f.endsWith(`-${p}.xml`)||f.includes(`_${p}_`)||f.startsWith(`${p}-`);}
function auxiliaryProductHref(value){const low=String(value||'').toLowerCase();return low.includes('/annotation/rfi/')||low.includes('/annotation/calibration/')||low.includes('/annotation/noise/')||low.includes('/noise-');}

export function manifestProductAnnotations(manifestXml,polarization){
  const pol=String(polarization||'').toLowerCase();if(!pol)return [];
  const hrefs=[...String(manifestXml||'').matchAll(/(?:\b|:)href\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);
  const candidates=[];
  for(const href of hrefs){
    const path=normalizedPath(href),low=path.toLowerCase();if(!low.startsWith('annotation/')||!low.endsWith('.xml'))continue;
    if(low.includes('/calibration/')||low.includes('/rfi/')||low.includes('/noise/'))continue;
    const file=low.split('/').at(-1)||'';if(!polToken(file,pol))continue;
    let score=0;if(/^s1[a-d]-/.test(file))score+=30;if(file.includes('-grd-'))score+=20;if(file.includes(`-${pol}-`))score+=10;score-=path.split('/').length;
    candidates.push({href,score});
  }
  candidates.sort((a,b)=>b.score-a.score||String(a.href).length-String(b.href).length||String(a.href).localeCompare(String(b.href)));
  return [...new Set(candidates.map(x=>x.href))];
}
export function manifestProductAnnotation(manifestXml,polarization){return manifestProductAnnotations(manifestXml,polarization)[0]||null;}
export function resolveRelativeSafeAsset(manifestHref,relativeHref){if(!manifestHref||!relativeHref)return null;const rel=normalizedPath(relativeHref);if(String(manifestHref).startsWith('s3://'))return `${String(manifestHref).replace(/\/[^/]*$/,'')}/${rel}`;try{return new URL(rel,String(manifestHref)).href}catch{return null;}}

async function fetchText(url,signal){
  const source=s3ToHttps(url);if(!source)throw new Error('Missing Sentinel-1 support asset URL');
  if(!TEXT_CACHE.has(source))TEXT_CACHE.set(source,(async()=>{const response=await fetch(supportTransportUrl(source,'source'),{signal,headers:{accept:'application/xml,text/xml,text/plain,*/*'}});if(!response.ok)throw new Error(`Sentinel-1 support asset ${response.status}: ${source}`);return response.text();})());
  return TEXT_CACHE.get(source);
}
async function openMeasurement(url){
  const source=s3ToHttps(url);if(!source)throw new Error('Missing Sentinel-1 measurement asset');
  if(!TIFF_CACHE.has(source))TIFF_CACHE.set(source,(async()=>{if(!geotiffModulePromise)geotiffModulePromise=import('../vendor/geotiff.bundle.mjs');const mod=await geotiffModulePromise,tiff=await mod.fromUrl(supportTransportUrl(source,'raster'),{cacheSize:32*1024*1024,blockSize:65536}),image=await tiff.getImage(0);return {tiff,image,source};})());
  return TIFF_CACHE.get(source);
}
function candidateAsset(current,sourceHref,polarization,resolution){return {...(current||{}),key:`omega-product-${String(polarization).toLowerCase()}`,href:s3ToHttps(sourceHref),sourceHref,title:`Resolved ${String(polarization).toUpperCase()} SAFE Product Annotation`,description:'Root Sentinel-1 SAFE product annotation validated before use. If Earth Search metadata is stale, auxiliary, or 404, manifest.safe is used to recover the existing root annotation.',omegaResolution:resolution};}
async function validateProductCandidate(asset,signal){const sourceHref=asset?.sourceHref||asset?.href;if(!sourceHref||auxiliaryProductHref(sourceHref))return null;try{const xml=await fetchText(sourceHref,signal),product=parseProductXml(xml);if(product.points.length<3)return null;return {asset,xml,product};}catch{return null;}}
async function resolveProductAsset(detail,assets,polarization,signal){
  const current=assets.product,attempts=[];
  if(current?.sourceHref||current?.href)attempts.push(candidateAsset(current,current.sourceHref||current.href,polarization,current.omegaResolution||current['omega:resolution']||'EARTH_SEARCH_DIRECT_VALIDATED'));
  const manifest=assets.manifest||detail?.assets?.['safe-manifest'],manifestHref=manifest?.sourceHref||manifest?.href;
  if(manifestHref){try{const manifestXml=await fetchText(manifestHref,signal);for(const relative of manifestProductAnnotations(manifestXml,polarization)){const sourceHref=resolveRelativeSafeAsset(manifestHref,relative);if(sourceHref)attempts.push(candidateAsset(current,sourceHref,polarization,'SAFE_MANIFEST_ROOT_ANNOTATION_VALIDATED'));}}catch{}}
  const seen=new Set(),tried=[];
  for(const candidate of attempts){const source=s3ToHttps(candidate.sourceHref||candidate.href);if(!source||seen.has(source))continue;seen.add(source);tried.push(source);const validated=await validateProductCandidate(candidate,signal);if(validated)return {...validated,tried};}
  const error=new Error(`No existing root Sentinel-1 SAFE product annotation with geolocation GCPs resolved for ${String(polarization).toUpperCase()}.${tried.length?` Tried: ${tried.join(' | ')}`:''}`);error.tried=tried;throw error;
}

function affineTransform(detail){
  const p=detail?.properties||{},epsg=Number(p['proj:epsg']),t=p['proj:transform'];
  if(epsg!==4326||!Array.isArray(t)||t.length<6||!t.slice(0,6).every(Number.isFinite))return null;
  const [a,b,c,d,e,f]=t.map(Number),det=a*e-b*d;if(Math.abs(det)<1e-18)return null;
  return {a,b,c,d,e,f,det,epsg,bbox:Array.isArray(p['proj:bbox'])&&p['proj:bbox'].length===4?p['proj:bbox'].map(Number):Array.isArray(detail?.bbox)?detail.bbox.map(Number):null,shape:Array.isArray(p['proj:shape'])?p['proj:shape'].map(Number):null};
}
function worldAt(affine,u,v){return {lon:affine.a*u+affine.b*v+affine.c,lat:affine.d*u+affine.e*v+affine.f};}
function boundsFor(affine,uMax,vMax){const q=[worldAt(affine,0,0),worldAt(affine,uMax,0),worldAt(affine,0,vMax),worldAt(affine,uMax,vMax)];return [Math.min(...q.map(x=>x.lon)),Math.min(...q.map(x=>x.lat)),Math.max(...q.map(x=>x.lon)),Math.max(...q.map(x=>x.lat))];}
function bboxError(actual,wanted){if(!Array.isArray(wanted)||wanted.length!==4||!wanted.every(Number.isFinite))return Infinity;const span=Math.max(1e-9,Math.abs(wanted[2]-wanted[0])+Math.abs(wanted[3]-wanted[1]));return actual.reduce((s,v,i)=>s+Math.abs(v-wanted[i]),0)/span;}

export function resolveStacAffineOrientation(detail,image){
  const affine=affineTransform(detail);if(!affine||!image)return null;
  const width=Number(image.getWidth()),height=Number(image.getHeight());if(!(width>0&&height>0))return null;
  const directBounds=boundsFor(affine,width,height),swappedBounds=boundsFor(affine,height,width),directError=bboxError(directBounds,affine.bbox),swappedError=bboxError(swappedBounds,affine.bbox);
  const orientation=swappedError+1e-9<directError?'SWAPPED_SOURCE_AXES':'DIRECT_SOURCE_AXES';
  return {state:'STAC_AFFINE_READY',affine,width,height,orientation,directBounds,swappedBounds,directError,swappedError,declaredBbox:affine.bbox,declaredShape:affine.shape};
}
export function stacAffineGeolocate(detail,image,lon,lat){
  const support=resolveStacAffineOrientation(detail,image);if(!support)return {state:'GEOLOCATION_UNRESOLVED',reason:'No EPSG:4326 STAC affine transform matching this measurement COG'};
  const A=support.affine,x=Number(lon)-A.c,y=Number(lat)-A.f,u=(x*A.e-A.b*y)/A.det,v=(A.a*y-A.d*x)/A.det;
  const pixel=support.orientation==='SWAPPED_SOURCE_AXES'?v:u,line=support.orientation==='SWAPPED_SOURCE_AXES'?u:v;
  const forward=support.orientation==='SWAPPED_SOURCE_AXES'?worldAt(A,line,pixel):worldAt(A,pixel,line),residualDeg=Math.hypot(forward.lon-Number(lon),forward.lat-Number(lat));
  if(pixel<-.5||line<-.5||pixel>support.width-.5||line>support.height-.5)return {state:'GEOLOCATION_UNRESOLVED',reason:'Target is outside source COG support',pixel,line,support,residualDeg};
  return {state:'GEOLOCATED_STAC_AFFINE',pixel,line,residualDeg,quality:'COG_STAC_AFFINE_EPSG4326',support};
}
function affineEarthAtSource(support,pixel,line){return support.orientation==='SWAPPED_SOURCE_AXES'?worldAt(support.affine,line,pixel):worldAt(support.affine,pixel,line);}
function buildAffinePatchGeoMesh(support,sourceWindow,segments=6){
  if(!support||!Array.isArray(sourceWindow)||sourceWindow.length!==4)return {state:'PATCH_GEOREGISTRATION_UNRESOLVED',validNodeCount:0,totalNodeCount:0};
  const [x0,y0,x1,y1]=sourceWindow,n=Math.max(2,Math.min(12,Math.round(segments))),nodes=[];let validNodeCount=0;
  for(let gy=0;gy<=n;gy++){const row=[];for(let gx=0;gx<=n;gx++){const pixel=x0+(x1-x0)*(gx/n),line=y0+(y1-y0)*(gy/n),g=affineEarthAtSource(support,pixel,line);const node={pixel,line,lon:g.lon,lat:g.lat,method:'STAC_AFFINE_EPSG4326'};row.push(node);validNodeCount++;}nodes.push(row);}
  return {state:'PATCH_GEOREGISTERED_STAC_AFFINE',sourceWindow:[...sourceWindow],segments:n,nodes,validNodeCount,totalNodeCount:(n+1)*(n+1),source:'EARTH_SEARCH_PROJ_TRANSFORM',orientation:support.orientation,measurementPromotion:false};
}

export async function resolveSentinel1ProductBundle(record,polarization,signal){
  const detail=await fetchSentinel1ItemDetail(record.id,signal),assets=sentinel1ProductAssets(detail,polarization);
  if(!assets.measurement||!assets.calibration){const keys=Object.keys(detail?.assets||{}).join(', ');throw new Error(`Sentinel-1 ${record.id} lacks required measurement/calibration assets for ${String(polarization).toUpperCase()}; item assets: ${keys}`);}
  const calibrationXml=await fetchText(assets.calibration.sourceHref||assets.calibration.href,signal),calibration=parseCalibrationXml(calibrationXml);if(!calibration.vectors.length)throw new Error(`Calibration annotation parsed 0 vectors from ${assets.calibration.sourceHref}`);
  let product=null,productXml=null,productError=null;
  try{const resolvedProduct=await resolveProductAsset(detail,assets,polarization,signal);assets.product=resolvedProduct.asset;productXml=resolvedProduct.xml;product=resolvedProduct.product;}catch(error){productError=error;assets.product=null;}
  if(product&&product.points.length<3)product=null;
  if(!product&&!affineTransform(detail))throw productError||new Error('Neither SAFE product GCPs nor a source STAC affine transform is available');
  return {detail,assets,calibration,product,productXml,productError};
}
function geolocationQuality(g){if(g.state==='GEOLOCATED_BILINEAR_GCP')return 'PRODUCT_GCP_BILINEAR';if(g.state==='GEOLOCATED_LOCAL_GCP_TRIANGLE')return 'PRODUCT_GCP_LOCAL_TRIANGLE';if(g.state==='GEOLOCATED_STAC_AFFINE')return 'COG_STAC_AFFINE_EPSG4326';return 'NEAREST_GCP_FALLBACK';}
function evidenceGrade(q){return q==='PRODUCT_GCP_BILINEAR'?'A-':q==='PRODUCT_GCP_LOCAL_TRIANGLE'?'B+':q==='COG_STAC_AFFINE_EPSG4326'?'B+':'B';}
async function readSingleDn(image,pixel,line){const width=image.getWidth(),height=image.getHeight(),x=Math.max(0,Math.min(width-1,Math.round(pixel))),y=Math.max(0,Math.min(height-1,Math.round(line))),values=await image.readRasters({window:[x,y,x+1,y+1],samples:[0],interleave:true}),nodataRaw=image.getGDALNoData?.(),nodata=nodataRaw==null?0:Number(nodataRaw),dn=Number(values[0]);return {dn:Number.isFinite(dn)&&dn!==nodata?dn:null,x,y,width,height,nodata};}
function percentile(values,p){const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!sorted.length)return null;const q=(sorted.length-1)*p,lo=Math.floor(q),hi=Math.ceil(q);return lo===hi?sorted[lo]:sorted[lo]+(sorted[hi]-sorted[lo])*(q-lo);}

function productMeta(product,detail,geolocationSource){return {rangePixelSpacing:product?.rangePixelSpacing??null,azimuthPixelSpacing:product?.azimuthPixelSpacing??null,incidenceAngleMidSwath:product?.incidenceAngleMidSwath??null,orbitSource:product?.orbitSource||detail?.properties?.['s1:orbit_source']||null,geolocationSource};}
function processingMeta(product){return {thermalNoiseCorrectionPerformed:product?.thermalNoiseCorrectionPerformed??null,radiometricCalibration:'PRODUCT_LUT',terrainFlattened:false,localIncidenceAngleCorrected:false};}

export async function sampleCalibratedSentinel1(record,lon,lat,{polarization='vv',quantity='sigmaNought',signal}={}){
  const {detail,assets,calibration,product}=await resolveSentinel1ProductBundle(record,polarization,signal),{image}=await openMeasurement(assets.measurement.href);
  const geolocation=product?geolocateToPixel(product,lon,lat):stacAffineGeolocate(detail,image,lon,lat);if(!Number.isFinite(geolocation.pixel)||!Number.isFinite(geolocation.line))return {state:'GEOLOCATION_UNRESOLVED',id:record.id,geolocation};
  const raw=await readSingleDn(image,geolocation.pixel,geolocation.line);if(!Number.isFinite(raw.dn))return {state:'NODATA',id:record.id,geolocation,raw};
  const lut=calibrationLutAt(calibration,geolocation.line,geolocation.pixel,quantity);if(!Number.isFinite(lut)||lut===0)return {state:'CALIBRATION_LUT_UNRESOLVED',id:record.id,geolocation,raw,lut};
  const value=raw.dn*raw.dn/(lut*lut),db=value>0?10*Math.log10(value):null,quality=geolocationQuality(geolocation),source=quality.startsWith('PRODUCT_GCP')?'SAFE_PRODUCT_GCP':'EARTH_SEARCH_STAC_AFFINE';
  return {state:'CALIBRATED_SENTINEL1_GRD_SAMPLE',id:record.id,startTime:record.startTime,platform:record.platform,polarization:String(polarization).toUpperCase(),quantity,value,db,measured:true,inferred:false,dn:raw.dn,lut,pixel:[raw.x,raw.y],fractionalPixel:[geolocation.pixel,geolocation.line],geolocation:{method:geolocation.state,residualDeg:geolocation.residualDeg??null,gcpSpanDeg:geolocation.gcpSpanDeg??null,quality,source},processing:processingMeta(product),product:productMeta(product,detail,source),evidence:{grade:evidenceGrade(quality),measured:true,inferred:false},provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product?.sourceHref||null,noise:assets.noise?.sourceHref||null,manifest:assets.manifest?.sourceHref||assets.manifest?.href||null,productResolution:assets.product?.omegaResolution||assets.product?.['omega:resolution']||null,stacItem:record.id,stacTransform:detail?.properties?.['proj:transform']||null},boundary:'Radiometrically calibrated Sentinel-1 Level-1 GRD backscatter. Geolocation is source-bound to SAFE product GCPs when available, otherwise to the Earth Search EPSG:4326 source affine transform after orientation validation against the COG and declared bbox. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'};
}

export async function calibratedTargetPatch(record,lon,lat,{polarization='vv',quantity='sigmaNought',radiusPixels=64,signal,onStage}={}){
  onStage?.('LOAD_PRODUCT_ANNOTATION');const {detail,assets,calibration,product}=await resolveSentinel1ProductBundle(record,polarization,signal),{image}=await openMeasurement(assets.measurement.href);
  onStage?.('INVERT_PRODUCT_GCP_GRID');const geolocation=product?geolocateToPixel(product,lon,lat):stacAffineGeolocate(detail,image,lon,lat);if(!Number.isFinite(geolocation.pixel)||!Number.isFinite(geolocation.line))throw new Error(`Selected target could not be bound to source geolocation: ${geolocation.reason||geolocation.state}`);
  const fullWidth=image.getWidth(),fullHeight=image.getHeight(),radius=Math.max(16,Math.min(128,Math.round(radiusPixels))),cx=Math.max(0,Math.min(fullWidth-1,Math.round(geolocation.pixel))),cy=Math.max(0,Math.min(fullHeight-1,Math.round(geolocation.line))),x0=Math.max(0,cx-radius),y0=Math.max(0,cy-radius),x1=Math.min(fullWidth,cx+radius+1),y1=Math.min(fullHeight,cy+radius+1);
  onStage?.('READ_TARGET_SOURCE_BLOCKS');const raw=await image.readRasters({window:[x0,y0,x1,y1],samples:[0],interleave:true}),width=x1-x0,height=y1-y0,nodataRaw=image.getGDALNoData?.(),nodata=nodataRaw==null?0:Number(nodataRaw),db=new Float32Array(raw.length),power=new Float32Array(raw.length),valid=[];
  onStage?.('APPLY_PRODUCT_CALIBRATION_LUT');for(let py=0,k=0;py<height;py++)for(let px=0;px<width;px++,k++){const dn=Number(raw[k]);if(!Number.isFinite(dn)||dn===nodata){db[k]=NaN;power[k]=NaN;continue;}const lut=calibrationLutAt(calibration,y0+py,x0+px,quantity);if(!Number.isFinite(lut)||lut===0){db[k]=NaN;power[k]=NaN;continue;}const value=dn*dn/(lut*lut);power[k]=value;db[k]=value>0?10*Math.log10(value):NaN;if(Number.isFinite(db[k]))valid.push(db[k]);}
  const stats={validCount:valid.length,p02:percentile(valid,.02),p50:percentile(valid,.5),p98:percentile(valid,.98)},quality=geolocationQuality(geolocation),source=quality.startsWith('PRODUCT_GCP')?'SAFE_PRODUCT_GCP':'EARTH_SEARCH_STAC_AFFINE',affineSupport=product?null:geolocation.support,geoMesh=affineSupport?buildAffinePatchGeoMesh(affineSupport,[x0,y0,x1,y1],6):null;onStage?.('READY');
  return {state:'CALIBRATED_SENTINEL1_TARGET_PATCH',id:record.id,startTime:record.startTime,platform:record.platform,target:{lon:Number(lon),lat:Number(lat)},polarization:String(polarization).toUpperCase(),quantity,sourceWindow:[x0,y0,x1,y1],width,height,centerPixel:[cx,cy],geolocation:{method:geolocation.state,residualDeg:geolocation.residualDeg??null,gcpSpanDeg:geolocation.gcpSpanDeg??null,quality,source,fractionalPixel:[geolocation.pixel,geolocation.line],orientation:affineSupport?.orientation||null},rawDn:raw,power,db,stats,geoMesh,processing:processingMeta(product),product:productMeta(product,detail,source),evidence:{grade:evidenceGrade(quality),measured:true,inferred:false},provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product?.sourceHref||null,noise:assets.noise?.sourceHref||null,manifest:assets.manifest?.sourceHref||assets.manifest?.href||null,productResolution:assets.product?.omegaResolution||assets.product?.['omega:resolution']||null,stacItem:record.id,stacTransform:detail?.properties?.['proj:transform']||null,stacBbox:detail?.properties?.['proj:bbox']||detail?.bbox||null},boundary:'Target-centered actual Sentinel-1 GRD pixels with the product radiometric LUT. Earth registration uses validated SAFE product GCPs when available; otherwise the source Earth Search EPSG:4326 affine transform is orientation-checked against the actual COG dimensions and declared bbox before use. The affine fallback changes geolocation only, never DN or calibrated values. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'};
}

export function clearR4CalibrationCache(){TIFF_CACHE.clear();TEXT_CACHE.clear();}
