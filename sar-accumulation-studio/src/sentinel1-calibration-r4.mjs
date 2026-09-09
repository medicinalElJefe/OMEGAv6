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
function polToken(filename,pol){
  const f=String(filename||'').toLowerCase(),p=String(pol||'').toLowerCase();
  return f.includes(`-${p}-`)||f.endsWith(`-${p}.xml`)||f.includes(`_${p}_`)||f.startsWith(`${p}-`);
}
function auxiliaryProductHref(value){
  const low=String(value||'').toLowerCase();
  return low.includes('/annotation/rfi/')||low.includes('/annotation/calibration/')||low.includes('/annotation/noise/')||low.includes('/noise-');
}

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

export function resolveRelativeSafeAsset(manifestHref,relativeHref){
  if(!manifestHref||!relativeHref)return null;
  const rel=normalizedPath(relativeHref);
  if(String(manifestHref).startsWith('s3://'))return `${String(manifestHref).replace(/\/[^/]*$/,'')}/${rel}`;
  try{return new URL(rel,String(manifestHref)).href}catch{return null;}
}

async function fetchText(url,signal){
  const source=s3ToHttps(url);if(!source)throw new Error('Missing Sentinel-1 support asset URL');
  if(!TEXT_CACHE.has(source))TEXT_CACHE.set(source,(async()=>{
    const response=await fetch(supportTransportUrl(source,'source'),{signal,headers:{accept:'application/xml,text/xml,text/plain,*/*'}});
    if(!response.ok)throw new Error(`Sentinel-1 support asset ${response.status}: ${source}`);
    return response.text();
  })());
  return TEXT_CACHE.get(source);
}

async function openMeasurement(url){
  const source=s3ToHttps(url);if(!source)throw new Error('Missing Sentinel-1 measurement asset');
  if(!TIFF_CACHE.has(source))TIFF_CACHE.set(source,(async()=>{
    if(!geotiffModulePromise)geotiffModulePromise=import('../vendor/geotiff.bundle.mjs');
    const mod=await geotiffModulePromise;
    const tiff=await mod.fromUrl(supportTransportUrl(source,'raster'),{cacheSize:32*1024*1024,blockSize:65536});
    const image=await tiff.getImage(0);return {tiff,image,source};
  })());
  return TIFF_CACHE.get(source);
}

function candidateAsset(current,sourceHref,polarization,resolution){
  return {
    ...(current||{}),
    key:`omega-product-${String(polarization).toLowerCase()}`,
    href:s3ToHttps(sourceHref),sourceHref,
    title:`Resolved ${String(polarization).toUpperCase()} SAFE Product Annotation`,
    description:'Root Sentinel-1 SAFE product annotation validated before use. If Earth Search metadata is stale, auxiliary, or 404, manifest.safe is used to recover the existing root annotation.',
    omegaResolution:resolution
  };
}

async function validateProductCandidate(asset,signal){
  const sourceHref=asset?.sourceHref||asset?.href;if(!sourceHref||auxiliaryProductHref(sourceHref))return null;
  try{
    const xml=await fetchText(sourceHref,signal),product=parseProductXml(xml);
    if(product.points.length<3)return null;
    return {asset,xml,product};
  }catch{return null;}
}

async function resolveProductAsset(detail,assets,polarization,signal){
  const current=assets.product;
  const attempts=[];
  if(current?.sourceHref||current?.href)attempts.push(candidateAsset(current,current.sourceHref||current.href,polarization,current.omegaResolution||current['omega:resolution']||'EARTH_SEARCH_DIRECT_VALIDATED'));

  const manifest=assets.manifest||detail?.assets?.['safe-manifest'];
  const manifestHref=manifest?.sourceHref||manifest?.href;
  if(manifestHref){
    try{
      const manifestXml=await fetchText(manifestHref,signal);
      for(const relative of manifestProductAnnotations(manifestXml,polarization)){
        const sourceHref=resolveRelativeSafeAsset(manifestHref,relative);if(!sourceHref)continue;
        attempts.push(candidateAsset(current,sourceHref,polarization,'SAFE_MANIFEST_ROOT_ANNOTATION_VALIDATED'));
      }
    }catch{
      // Keep the direct candidate in the attempt set. The final error will preserve every tried source.
    }
  }

  const seen=new Set(),tried=[];
  for(const candidate of attempts){
    const source=s3ToHttps(candidate.sourceHref||candidate.href);if(!source||seen.has(source))continue;seen.add(source);tried.push(source);
    const validated=await validateProductCandidate(candidate,signal);if(validated)return {...validated,tried};
  }
  const suffix=tried.length?` Tried: ${tried.join(' | ')}`:'';
  throw new Error(`No existing root Sentinel-1 SAFE product annotation with geolocation GCPs resolved for ${String(polarization).toUpperCase()}.${suffix}`);
}

export async function resolveSentinel1ProductBundle(record,polarization,signal){
  const detail=await fetchSentinel1ItemDetail(record.id,signal);
  const assets=sentinel1ProductAssets(detail,polarization);
  if(!assets.measurement||!assets.calibration){
    const keys=Object.keys(detail?.assets||{}).join(', ');
    throw new Error(`Sentinel-1 ${record.id} lacks required measurement/calibration assets for ${String(polarization).toUpperCase()}; item assets: ${keys}`);
  }
  const resolvedProduct=await resolveProductAsset(detail,assets,polarization,signal);
  assets.product=resolvedProduct.asset;
  const calibrationXml=await fetchText(assets.calibration.sourceHref||assets.calibration.href,signal),productXml=resolvedProduct.xml;
  const calibration=parseCalibrationXml(calibrationXml),product=resolvedProduct.product;
  if(!calibration.vectors.length)throw new Error(`Calibration annotation parsed 0 vectors from ${assets.calibration.sourceHref}`);
  if(product.points.length<3)throw new Error(`Product annotation parsed ${product.points.length} geolocation points from ${assets.product.sourceHref}`);
  return {detail,assets,calibration,product};
}

function geolocationQuality(g){if(g.state==='GEOLOCATED_BILINEAR_GCP')return 'PRODUCT_GCP_BILINEAR';if(g.state==='GEOLOCATED_LOCAL_GCP_TRIANGLE')return 'PRODUCT_GCP_LOCAL_TRIANGLE';return 'NEAREST_GCP_FALLBACK';}
function evidenceGrade(q){return q==='PRODUCT_GCP_BILINEAR'?'A-':q==='PRODUCT_GCP_LOCAL_TRIANGLE'?'B+':'B';}
async function readSingleDn(image,pixel,line){
  const width=image.getWidth(),height=image.getHeight(),x=Math.max(0,Math.min(width-1,Math.round(pixel))),y=Math.max(0,Math.min(height-1,Math.round(line)));
  const values=await image.readRasters({window:[x,y,x+1,y+1],samples:[0],interleave:true});
  const nodataRaw=image.getGDALNoData?.(),nodata=nodataRaw==null?0:Number(nodataRaw),dn=Number(values[0]);
  return {dn:Number.isFinite(dn)&&dn!==nodata?dn:null,x,y,width,height,nodata};
}
function percentile(values,p){const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!sorted.length)return null;const q=(sorted.length-1)*p,lo=Math.floor(q),hi=Math.ceil(q);return lo===hi?sorted[lo]:sorted[lo]+(sorted[hi]-sorted[lo])*(q-lo);}

export async function sampleCalibratedSentinel1(record,lon,lat,{polarization='vv',quantity='sigmaNought',signal}={}){
  const {detail,assets,calibration,product}=await resolveSentinel1ProductBundle(record,polarization,signal);
  const geolocation=geolocateToPixel(product,lon,lat);if(!Number.isFinite(geolocation.pixel)||!Number.isFinite(geolocation.line))return {state:'GEOLOCATION_UNRESOLVED',id:record.id,geolocation};
  const {image}=await openMeasurement(assets.measurement.href);const raw=await readSingleDn(image,geolocation.pixel,geolocation.line);if(!Number.isFinite(raw.dn))return {state:'NODATA',id:record.id,geolocation,raw};
  const lut=calibrationLutAt(calibration,geolocation.line,geolocation.pixel,quantity);if(!Number.isFinite(lut)||lut===0)return {state:'CALIBRATION_LUT_UNRESOLVED',id:record.id,geolocation,raw,lut};
  const value=raw.dn*raw.dn/(lut*lut),db=value>0?10*Math.log10(value):null,quality=geolocationQuality(geolocation);
  return {state:'CALIBRATED_SENTINEL1_GRD_SAMPLE',id:record.id,startTime:record.startTime,platform:record.platform,polarization:String(polarization).toUpperCase(),quantity,value,db,measured:true,inferred:false,dn:raw.dn,lut,pixel:[raw.x,raw.y],fractionalPixel:[geolocation.pixel,geolocation.line],geolocation:{method:geolocation.state,residualDeg:geolocation.residualDeg??null,gcpSpanDeg:geolocation.gcpSpanDeg??null,quality},processing:{thermalNoiseCorrectionPerformed:product.thermalNoiseCorrectionPerformed,radiometricCalibration:'PRODUCT_LUT',terrainFlattened:false,localIncidenceAngleCorrected:false},product:{rangePixelSpacing:product.rangePixelSpacing,azimuthPixelSpacing:product.azimuthPixelSpacing,incidenceAngleMidSwath:product.incidenceAngleMidSwath,orbitSource:product.orbitSource||detail.properties?.['s1:orbit_source']||null},evidence:{grade:evidenceGrade(quality),measured:true,inferred:false},provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product.sourceHref,noise:assets.noise?.sourceHref||null,productResolution:assets.product.omegaResolution||assets.product['omega:resolution']||'DIRECT'},boundary:'Radiometrically calibrated Sentinel-1 Level-1 GRD backscatter. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'};
}

export async function calibratedTargetPatch(record,lon,lat,{polarization='vv',quantity='sigmaNought',radiusPixels=64,signal,onStage}={}){
  onStage?.('LOAD_PRODUCT_ANNOTATION');
  const {detail,assets,calibration,product}=await resolveSentinel1ProductBundle(record,polarization,signal);
  onStage?.('INVERT_PRODUCT_GCP_GRID');
  const geolocation=geolocateToPixel(product,lon,lat);if(!Number.isFinite(geolocation.pixel)||!Number.isFinite(geolocation.line))throw new Error(`Selected target could not be bound to product GCP grid: ${geolocation.reason||geolocation.state}`);
  const {image}=await openMeasurement(assets.measurement.href),fullWidth=image.getWidth(),fullHeight=image.getHeight(),radius=Math.max(16,Math.min(128,Math.round(radiusPixels)));
  const cx=Math.max(0,Math.min(fullWidth-1,Math.round(geolocation.pixel))),cy=Math.max(0,Math.min(fullHeight-1,Math.round(geolocation.line))),x0=Math.max(0,cx-radius),y0=Math.max(0,cy-radius),x1=Math.min(fullWidth,cx+radius+1),y1=Math.min(fullHeight,cy+radius+1);
  onStage?.('READ_TARGET_SOURCE_BLOCKS');
  const raw=await image.readRasters({window:[x0,y0,x1,y1],samples:[0],interleave:true}),width=x1-x0,height=y1-y0,nodataRaw=image.getGDALNoData?.(),nodata=nodataRaw==null?0:Number(nodataRaw),db=new Float32Array(raw.length),power=new Float32Array(raw.length),valid=[];
  onStage?.('APPLY_PRODUCT_CALIBRATION_LUT');
  for(let py=0,k=0;py<height;py++)for(let px=0;px<width;px++,k++){
    const dn=Number(raw[k]);if(!Number.isFinite(dn)||dn===nodata){db[k]=NaN;power[k]=NaN;continue;}
    const lut=calibrationLutAt(calibration,y0+py,x0+px,quantity);if(!Number.isFinite(lut)||lut===0){db[k]=NaN;power[k]=NaN;continue;}
    const value=dn*dn/(lut*lut);power[k]=value;db[k]=value>0?10*Math.log10(value):NaN;if(Number.isFinite(db[k]))valid.push(db[k]);
  }
  const stats={validCount:valid.length,p02:percentile(valid,.02),p50:percentile(valid,.5),p98:percentile(valid,.98)},quality=geolocationQuality(geolocation);onStage?.('READY');
  return {state:'CALIBRATED_SENTINEL1_TARGET_PATCH',id:record.id,startTime:record.startTime,platform:record.platform,target:{lon:Number(lon),lat:Number(lat)},polarization:String(polarization).toUpperCase(),quantity,sourceWindow:[x0,y0,x1,y1],width,height,centerPixel:[cx,cy],geolocation:{method:geolocation.state,residualDeg:geolocation.residualDeg??null,gcpSpanDeg:geolocation.gcpSpanDeg??null,quality,fractionalPixel:[geolocation.pixel,geolocation.line]},rawDn:raw,power,db,stats,processing:{thermalNoiseCorrectionPerformed:product.thermalNoiseCorrectionPerformed,radiometricCalibration:'PRODUCT_LUT',terrainFlattened:false,localIncidenceAngleCorrected:false},product:{rangePixelSpacing:product.rangePixelSpacing,azimuthPixelSpacing:product.azimuthPixelSpacing,incidenceAngleMidSwath:product.incidenceAngleMidSwath,orbitSource:product.orbitSource||detail.properties?.['s1:orbit_source']||null},evidence:{grade:evidenceGrade(quality),measured:true,inferred:false},provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product.sourceHref,noise:assets.noise?.sourceHref||null,manifest:assets.manifest?.sourceHref||assets.manifest?.href||null,productResolution:assets.product.omegaResolution||assets.product['omega:resolution']||'DIRECT'},boundary:'Target-centered actual Sentinel-1 GRD pixels, product-GCP geolocated and product-LUT calibrated. Root SAFE annotation is validated before use and recovered from manifest.safe when direct STAC metadata is stale, auxiliary, or missing. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'};
}

export function clearR4CalibrationCache(){TIFF_CACHE.clear();TEXT_CACHE.clear();}
