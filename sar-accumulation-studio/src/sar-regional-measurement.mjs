import { s3ToHttps } from './stac.mjs';
import { resolveSentinel1ProductBundle, stacAffineGeolocate, resolveStacAffineOrientation } from './sentinel1-calibration-r4.mjs';
import { supportTransportUrl, calibrationLutAt, geolocateToPixel } from './sentinel1-calibration-core.mjs';
import { buildPatchGeoMesh } from './sar-registration.mjs';

const TIFF_CACHE=new Map();
let geotiffModulePromise=null;
const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));

async function openMeasurement(url){
  const source=s3ToHttps(url);if(!source)throw new Error('Missing Sentinel-1 regional measurement asset');
  if(!TIFF_CACHE.has(source))TIFF_CACHE.set(source,(async()=>{
    if(!geotiffModulePromise)geotiffModulePromise=import('../vendor/geotiff.bundle.mjs');
    const mod=await geotiffModulePromise,tiff=await mod.fromUrl(supportTransportUrl(source,'raster'),{cacheSize:48*1024*1024,blockSize:65536}),full=await tiff.getImage(0);
    return {tiff,full,source};
  })());
  return TIFF_CACHE.get(source);
}

function intersection(a,b){
  if(!Array.isArray(a)||a.length!==4||!Array.isArray(b)||b.length!==4)return null;
  const west=Math.max(Number(a[0]),Number(b[0])),south=Math.max(Number(a[1]),Number(b[1])),east=Math.min(Number(a[2]),Number(b[2])),north=Math.min(Number(a[3]),Number(b[3]));
  return east>west&&north>south?[west,south,east,north]:null;
}
function percentile(values,p){const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const q=(a.length-1)*p,lo=Math.floor(q),hi=Math.ceil(q);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(q-lo);}
function worldAtAffine(support,pixel,line){const A=support.affine,u=support.orientation==='SWAPPED_SOURCE_AXES'?line:pixel,v=support.orientation==='SWAPPED_SOURCE_AXES'?pixel:line;return {lon:A.a*u+A.b*v+A.c,lat:A.d*u+A.e*v+A.f};}
function affineMesh(support,sourceWindow,segments=10){
  const [x0,y0,x1,y1]=sourceWindow,n=Math.max(2,Math.min(12,Math.round(segments))),nodes=[];let valid=0;
  for(let gy=0;gy<=n;gy++){const row=[];for(let gx=0;gx<=n;gx++){
    const pixel=x0+(x1-1-x0)*(gx/n),line=y0+(y1-1-y0)*(gy/n),g=worldAtAffine(support,pixel,line);row.push({gx,gy,pixel,line,lon:g.lon,lat:g.lat,state:'PIXEL_GEOLOCATED_STAC_AFFINE'});valid++;
  }nodes.push(row);}
  return {state:'PATCH_GEOREGISTERED_STAC_AFFINE',segments:n,sourceWindow:[...sourceWindow],nodes,validNodeCount:valid,totalNodeCount:(n+1)*(n+1),source:'EARTH_SEARCH_PROJ_TRANSFORM',orientation:support.orientation,measurementPromotion:false,semantics:'Full-resolution source coordinates mapped through the orientation-validated STAC EPSG:4326 affine. Geolocation only; SAR values remain source measured.'};
}
async function selectOverview(tiff,full,sourceWindow,maxSamples){
  const fullW=full.getWidth(),fullH=full.getHeight(),spanW=sourceWindow[2]-sourceWindow[0],spanH=sourceWindow[3]-sourceWindow[1],count=await tiff.getImageCount();
  let best={image:full,index:0,sx:1,sy:1,score:Infinity};
  for(let i=0;i<count;i++){
    const image=await tiff.getImage(i),sx=image.getWidth()/fullW,sy=image.getHeight()/fullH,projected=Math.max(spanW*sx,spanH*sy),score=Math.abs(Math.log(Math.max(1,projected)/Math.max(64,maxSamples)));
    if(projected>=48&&score<best.score)best={image,index:i,sx,sy,score};
  }
  return best;
}
function sourceLocation(product,detail,full,lon,lat){return product?geolocateToPixel(product,lon,lat):stacAffineGeolocate(detail,full,lon,lat);}

export async function calibratedRegionalViewport(record,viewBbox,{polarization='vv',quantity='sigmaNought',maxSamples=384,signal,onStage}={}){
  if(!record?.id)throw new Error('Regional SAR requires a current Sentinel-1 scene');
  onStage?.('REGIONAL_RESOLVE_PRODUCT');
  // Product-detail/XML support caches are shared with exact-local calibration. Do not
  // attach this rapidly cancelled camera request to those shared cache promises: a pan
  // or zoom must never poison the exact target calibration with an AbortError. Stale
  // regional results are still rejected below by the runtime generation/authority gate.
  const {detail,assets,calibration,product}=await resolveSentinel1ProductBundle(record,polarization,undefined),{tiff,full}=await openMeasurement(assets.measurement.href);
  if(signal?.aborted)throw new DOMException('Regional SAR request superseded','AbortError');
  const sceneBbox=Array.isArray(detail?.bbox)&&detail.bbox.length===4?detail.bbox.map(Number):Array.isArray(detail?.properties?.['proj:bbox'])?detail.properties['proj:bbox'].map(Number):null;
  const requested=Array.isArray(viewBbox)&&viewBbox.length===4?viewBbox.map(Number):sceneBbox,coverage=sceneBbox&&requested?intersection(requested,sceneBbox):sceneBbox||requested;
  if(!coverage)throw new Error('Current camera does not intersect the current Sentinel-1 measurement footprint');
  const [w,s,e,n]=coverage,epsLon=Math.max(1e-7,(e-w)*1e-5),epsLat=Math.max(1e-7,(n-s)*1e-5),samples=[[w+epsLon,s+epsLat],[e-epsLon,s+epsLat],[w+epsLon,n-epsLat],[e-epsLon,n-epsLat],[(w+e)/2,(s+n)/2]];
  onStage?.('REGIONAL_INVERT_EARTH_TO_SOURCE');
  const sourcePoints=samples.map(([lon,lat])=>sourceLocation(product,detail,full,lon,lat)).filter(g=>finite(g?.pixel)&&finite(g?.line));
  if(sourcePoints.length<3)throw new Error('Regional camera intersection could not be inverted into enough source pixels');
  const fullW=full.getWidth(),fullH=full.getHeight(),margin=4,x0=clamp(Math.floor(Math.min(...sourcePoints.map(g=>g.pixel)))-margin,0,fullW-1),y0=clamp(Math.floor(Math.min(...sourcePoints.map(g=>g.line)))-margin,0,fullH-1),x1=clamp(Math.ceil(Math.max(...sourcePoints.map(g=>g.pixel)))+margin+1,1,fullW),y1=clamp(Math.ceil(Math.max(...sourcePoints.map(g=>g.line)))+margin+1,1,fullH);
  if(x1-x0<2||y1-y0<2)throw new Error('Regional source window collapsed');
  const sourceWindow=[x0,y0,x1,y1];
  onStage?.('REGIONAL_SELECT_COG_OVERVIEW');
  const overview=await selectOverview(tiff,full,sourceWindow,Math.max(96,Math.min(768,Number(maxSamples)||384))),ow=overview.image.getWidth(),oh=overview.image.getHeight();
  const ox0=clamp(Math.floor(x0*overview.sx),0,ow-1),oy0=clamp(Math.floor(y0*overview.sy),0,oh-1),ox1=clamp(Math.ceil(x1*overview.sx),1,ow),oy1=clamp(Math.ceil(y1*overview.sy),1,oh),spanX=Math.max(1,ox1-ox0),spanY=Math.max(1,oy1-oy0),limit=Math.max(96,Math.min(768,Number(maxSamples)||384)),scale=Math.min(1,limit/Math.max(spanX,spanY)),width=Math.max(32,Math.round(spanX*scale)),height=Math.max(32,Math.round(spanY*scale));
  onStage?.('REGIONAL_READ_COG');
  const raw=await overview.image.readRasters({window:[ox0,oy0,ox1,oy1],width,height,samples:[0],interleave:true}),nodataRaw=overview.image.getGDALNoData?.(),nodata=nodataRaw==null?0:Number(nodataRaw),db=new Float32Array(raw.length),power=new Float32Array(raw.length),valid=[];
  if(signal?.aborted)throw new DOMException('Regional SAR request superseded','AbortError');
  onStage?.('REGIONAL_CALIBRATE_LUT');
  for(let py=0,k=0;py<height;py++)for(let px=0;px<width;px++,k++){
    const dn=Number(raw[k]);if(!finite(dn)||dn===nodata){db[k]=NaN;power[k]=NaN;continue;}
    const sourcePixel=x0+(px+.5)/width*(x1-x0),sourceLine=y0+(py+.5)/height*(y1-y0),lut=calibrationLutAt(calibration,sourceLine,sourcePixel,quantity);
    if(!finite(lut)||lut===0){db[k]=NaN;power[k]=NaN;continue;}
    const value=dn*dn/(lut*lut);power[k]=value;db[k]=value>0?10*Math.log10(value):NaN;if(finite(db[k]))valid.push(db[k]);
  }
  if(valid.length<Math.max(64,width*height*.05))throw new Error('Regional calibrated viewport returned insufficient valid measurement samples');
  const affineSupport=product?null:resolveStacAffineOrientation(detail,full),geoMesh=product?buildPatchGeoMesh(product,sourceWindow,10):affineMesh(affineSupport,sourceWindow,10),quality=product?'PRODUCT_GCP_MESH':'COG_STAC_AFFINE_EPSG4326',stats={validCount:valid.length,p02:percentile(valid,.02),p50:percentile(valid,.5),p98:percentile(valid,.98)};
  onStage?.('REGIONAL_READY');
  return {state:'CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT',id:record.id,startTime:record.startTime||detail?.properties?.datetime||null,platform:record.platform||detail?.properties?.platform||'sentinel-1',target:{lon:(w+e)/2,lat:(s+n)/2},viewBbox:[...requested],coverageBbox:coverage,polarization:String(polarization).toUpperCase(),quantity,sourceWindow,width,height,rawDn:raw,power,db,stats,geoMesh,overview:{index:overview.index,width:ow,height:oh,scaleX:overview.sx,scaleY:overview.sy},geolocation:{quality,source:product?'SAFE_PRODUCT_GCP':'EARTH_SEARCH_STAC_AFFINE'},processing:{radiometricCalibration:'PRODUCT_LUT',terrainFlattened:false,localIncidenceAngleCorrected:false,overviewResampled:true},evidence:{grade:product?'A-':'B+',measured:true,inferred:false},provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product?.sourceHref||null,manifest:assets.manifest?.sourceHref||assets.manifest?.href||null,stacItem:record.id,stacTransform:detail?.properties?.['proj:transform']||null},boundary:'Adaptive regional view of actual Sentinel-1 GRD measurement samples, radiometrically calibrated with the product LUT and georegistered through SAFE GCPs or an orientation-validated EPSG:4326 STAC affine. The selected internal COG overview/resampling changes display sampling only. Not RTC, not SLC phase, not InSAR displacement, and no pixels are synthesized outside source coverage.'};
}

export function clearRegionalMeasurementCache(){TIFF_CACHE.clear();}
