import { s3ToHttps } from './stac.mjs';

const EARTH_SEARCH_ITEM='https://earth-search.aws.element84.com/v1/collections/sentinel-1-grd/items/';
const TIFF_CACHE=new Map();
const DETAIL_CACHE=new Map();
const XML_CACHE=new Map();
let geotiffPromise=null;

function origin(){return globalThis.location?.origin||null;}
function transport(url,kind='source'){
  if(!url)return null;
  const base=origin();
  return base?`${base.replace(/\/$/,'')}/api/${kind}?url=${encodeURIComponent(url)}`:url;
}
async function geotiff(){
  if(!geotiffPromise)geotiffPromise=import('../vendor/geotiff.bundle.mjs');
  return geotiffPromise;
}
async function openMeasurement(url){
  const source=s3ToHttps(url);
  if(!TIFF_CACHE.has(source))TIFF_CACHE.set(source,(async()=>{
    const mod=await geotiff();
    const tiff=await mod.fromUrl(transport(source,'raster'),{cacheSize:32*1024*1024,blockSize:65536});
    const image=await tiff.getImage(0);
    return {tiff,image,source};
  })());
  return TIFF_CACHE.get(source);
}
async function fetchText(url,signal){
  const source=s3ToHttps(url);
  if(!XML_CACHE.has(source))XML_CACHE.set(source,(async()=>{
    const response=await fetch(transport(source,'source'),{signal,headers:{accept:'application/xml,text/xml,text/plain,*/*'}});
    if(!response.ok)throw new Error(`Sentinel-1 support asset ${response.status}: ${source}`);
    return response.text();
  })());
  return XML_CACHE.get(source);
}
async function fetchItem(id,signal){
  if(!DETAIL_CACHE.has(id))DETAIL_CACHE.set(id,(async()=>{
    const base=origin();
    const url=base?`${base.replace(/\/$/,'')}/api/stac/item?id=${encodeURIComponent(id)}`:`${EARTH_SEARCH_ITEM}${encodeURIComponent(id)}`;
    const response=await fetch(url,{signal,headers:{accept:'application/geo+json,application/json'}});
    if(!response.ok)throw new Error(`Earth Search item ${response.status}: ${id}`);
    return response.json();
  })());
  return DETAIL_CACHE.get(id);
}
function asset(detail,key){
  const a=detail?.assets?.[key];
  return a?.href?{...a,key,href:s3ToHttps(a.href),sourceHref:a.href}:null;
}
export function productAssets(detail,polarization){
  const p=String(polarization||'').toLowerCase();
  return {measurement:asset(detail,p),calibration:asset(detail,`schema-calibration-${p}`),noise:asset(detail,`schema-noise-${p}`),product:asset(detail,`schema-product-${p}`),manifest:asset(detail,'safe-manifest')};
}

function esc(name){return String(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function blocks(xml,name){
  const n=esc(name);
  const re=new RegExp(`<(?:(?:[A-Za-z_][\\w.-]*):)?${n}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:(?:[A-Za-z_][\\w.-]*):)?${n}\\s*>`,'gi');
  return [...String(xml||'').matchAll(re)].map(m=>m[1]);
}
function first(xml,name){const b=blocks(xml,name);return b.length?b[0].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').trim():null;}
function nums(text){return String(text||'').trim().split(/\s+/).map(Number).filter(Number.isFinite);}

export function parseCalibrationXmlV2(xml){
  const vectors=blocks(xml,'calibrationVector').map(node=>({
    line:Number(first(node,'line')),pixel:nums(first(node,'pixel')),sigmaNought:nums(first(node,'sigmaNought')),betaNought:nums(first(node,'betaNought')),gamma:nums(first(node,'gamma')),dn:nums(first(node,'dn')),azimuthTime:first(node,'azimuthTime')
  })).filter(v=>Number.isFinite(v.line)&&v.pixel.length).sort((a,b)=>a.line-b.line);
  const c=Number(first(xml,'absoluteCalibrationConstant'));
  return {vectors,absoluteCalibrationConstant:Number.isFinite(c)?c:null};
}
export function parseProductXmlV2(xml){
  const points=blocks(xml,'geolocationGridPoint').map(node=>({
    line:Number(first(node,'line')),pixel:Number(first(node,'pixel')),latitude:Number(first(node,'latitude')),longitude:Number(first(node,'longitude')),height:Number(first(node,'height')),incidenceAngle:Number(first(node,'incidenceAngle')),elevationAngle:Number(first(node,'elevationAngle')),azimuthTime:first(node,'azimuthTime')
  })).filter(p=>[p.line,p.pixel,p.latitude,p.longitude].every(Number.isFinite));
  return {
    points,
    thermalNoiseCorrectionPerformed:String(first(xml,'thermalNoiseCorrectionPerformed')).toLowerCase()==='true',
    rangePixelSpacing:Number(first(xml,'rangePixelSpacing'))||null,
    azimuthPixelSpacing:Number(first(xml,'azimuthPixelSpacing'))||null,
    numberOfSamples:Number(first(xml,'numberOfSamples'))||null,
    numberOfLines:Number(first(xml,'numberOfLines'))||null,
    incidenceAngleMidSwath:Number(first(xml,'incidenceAngleMidSwath'))||null,
    orbitSource:first(xml,'orbitSource')||null
  };
}

function unwrapLon(lon,reference){let x=Number(lon),r=Number(reference);while(x-r>180)x-=360;while(x-r<-180)x+=360;return x;}
function bilinear(c00,c10,c01,c11,u,v){return c00*(1-u)*(1-v)+c10*u*(1-v)+c01*(1-u)*v+c11*u*v;}
function solveQuad(targetLon,targetLat,p00,p10,p01,p11){
  const L=[p00,p10,p01,p11].map(p=>unwrapLon(p.longitude,targetLon)),T=unwrapLon(targetLon,targetLon);
  let u=.5,v=.5;
  for(let i=0;i<20;i++){
    const lon=bilinear(L[0],L[1],L[2],L[3],u,v),lat=bilinear(p00.latitude,p10.latitude,p01.latitude,p11.latitude,u,v),f1=lon-T,f2=lat-targetLat;
    const a=(L[1]-L[0])*(1-v)+(L[3]-L[2])*v,b=(L[2]-L[0])*(1-u)+(L[3]-L[1])*u,c=(p10.latitude-p00.latitude)*(1-v)+(p11.latitude-p01.latitude)*v,d=(p01.latitude-p00.latitude)*(1-u)+(p11.latitude-p10.latitude)*u,det=a*d-b*c;
    if(Math.abs(det)<1e-14)break;
    const du=(f1*d-f2*b)/det,dv=(a*f2-c*f1)/det;u-=du;v-=dv;if(Math.abs(du)+Math.abs(dv)<1e-12)break;
  }
  const lon=bilinear(L[0],L[1],L[2],L[3],u,v),lat=bilinear(p00.latitude,p10.latitude,p01.latitude,p11.latitude,u,v),residualDeg=Math.hypot(lon-T,lat-targetLat);
  if(u<-.03||u>1.03||v<-.03||v>1.03||residualDeg>3e-4)return null;
  return {state:'GEOLOCATED_BILINEAR_GCP',pixel:bilinear(p00.pixel,p10.pixel,p01.pixel,p11.pixel,u,v),line:bilinear(p00.line,p10.line,p01.line,p11.line,u,v),u,v,residualDeg,corners:[p00,p10,p01,p11]};
}
function projected(p,lon,lat){return {x:(unwrapLon(p.longitude,lon)-lon)*Math.cos(lat*Math.PI/180),y:p.latitude-lat};}
function triangleCandidate(a,b,c,lon,lat){
  const A=projected(a,lon,lat),B=projected(b,lon,lat),C=projected(c,lon,lat),det=(B.y-C.y)*(A.x-C.x)+(C.x-B.x)*(A.y-C.y);
  if(Math.abs(det)<1e-12)return null;
  const w1=((B.y-C.y)*(0-C.x)+(C.x-B.x)*(0-C.y))/det,w2=((C.y-A.y)*(0-C.x)+(A.x-C.x)*(0-C.y))/det,w3=1-w1-w2;
  if(Math.min(w1,w2,w3)<-.02||Math.max(w1,w2,w3)>1.02)return null;
  const pixel=w1*a.pixel+w2*b.pixel+w3*c.pixel,line=w1*a.line+w2*b.line+w3*c.line;
  const span=Math.max(Math.hypot(A.x,A.y),Math.hypot(B.x,B.y),Math.hypot(C.x,C.y));
  return {state:'GEOLOCATED_LOCAL_GCP_TRIANGLE',pixel,line,weights:[w1,w2,w3],gcpSpanDeg:span,residualDeg:null,corners:[a,b,c]};
}
export function geolocateToPixelV2(product,lon,lat){
  lon=Number(lon);lat=Number(lat);const points=(product?.points||[]).filter(p=>[p.line,p.pixel,p.latitude,p.longitude].every(Number.isFinite));
  if(points.length<3)return {state:'GEOLOCATION_UNRESOLVED',reason:`Product geolocation grid has ${points.length} valid point(s)`};
  const rows=[...new Set(points.map(p=>p.line))].sort((a,b)=>a-b),byRow=new Map(rows.map(line=>[line,points.filter(p=>p.line===line).sort((a,b)=>a.pixel-b.pixel)]));
  let best=null;
  for(let yi=0;yi<rows.length-1;yi++){
    const r0=byRow.get(rows[yi]),r1=byRow.get(rows[yi+1]);
    for(let i=0;i<r0.length-1;i++){
      const p00=r0[i],p10=r0[i+1];
      let j=0,bestScore=Infinity;
      for(let k=0;k<r1.length-1;k++){const score=Math.abs(r1[k].pixel-p00.pixel)+Math.abs(r1[k+1].pixel-p10.pixel);if(score<bestScore){bestScore=score;j=k;}}
      const q=solveQuad(lon,lat,p00,p10,r1[j],r1[j+1]);if(q&&(!best||q.residualDeg<best.residualDeg))best=q;
    }
  }
  if(best)return best;
  const near=points.map(p=>({p,d:(()=>{const q=projected(p,lon,lat);return Math.hypot(q.x,q.y);})()})).sort((a,b)=>a.d-b.d).slice(0,14);
  let tri=null;
  for(let i=0;i<near.length-2;i++)for(let j=i+1;j<near.length-1;j++)for(let k=j+1;k<near.length;k++){
    const c=triangleCandidate(near[i].p,near[j].p,near[k].p,lon,lat);if(c&&(!tri||c.gcpSpanDeg<tri.gcpSpanDeg))tri=c;
  }
  if(tri)return tri;
  const n=near[0];
  return n&&n.d<.08?{state:'GEOLOCATED_NEAREST_GCP_FALLBACK',pixel:n.p.pixel,line:n.p.line,residualDeg:n.d,nearest:n.p}:{state:'GEOLOCATION_UNRESOLVED',reason:'Target is outside resolved product GCP support',nearestDistanceDeg:n?.d??null};
}

function interp1(xs,ys,x){if(!xs?.length||xs.length!==ys?.length)return null;if(x<=xs[0])return ys[0];if(x>=xs.at(-1))return ys.at(-1);let lo=0,hi=xs.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(xs[m]<=x)lo=m;else hi=m;}const d=xs[hi]-xs[lo];return d===0?ys[lo]:ys[lo]+(ys[hi]-ys[lo])*((x-xs[lo])/d);}
export function calibrationLutAtV2(cal,line,pixel,kind='sigmaNought'){
  const v=cal?.vectors||[];if(!v.length||!['sigmaNought','betaNought','gamma','dn'].includes(kind))return null;let a=v[0],b=v.at(-1);for(let i=0;i<v.length-1;i++)if(line>=v[i].line&&line<=v[i+1].line){a=v[i];b=v[i+1];break;}if(line<=v[0].line)a=b=v[0];if(line>=v.at(-1).line)a=b=v.at(-1];
  const av=interp1(a.pixel,a[kind],pixel),bv=interp1(b.pixel,b[kind],pixel);if(!Number.isFinite(av)||!Number.isFinite(bv))return null;return a.line===b.line?av:av+(bv-av)*((line-a.line)/(b.line-a.line));
}

async function bundle(record,polarization,signal){
  const detail=await fetchItem(record.id,signal),assets=productAssets(detail,polarization);
  if(!assets.measurement||!assets.calibration||!assets.product)throw new Error(`Sentinel-1 ${record.id} lacks measurement/calibration/product assets for ${String(polarization).toUpperCase()}`);
  const [calXml,productXml]=await Promise.all([fetchText(assets.calibration.href,signal),fetchText(assets.product.href,signal)]),calibration=parseCalibrationXmlV2(calXml),product=parseProductXmlV2(productXml);
  if(!calibration.vectors.length)throw new Error(`Calibration annotation parsed 0 vectors from ${assets.calibration.sourceHref}`);
  if(product.points.length<3)throw new Error(`Product annotation parsed ${product.points.length} geolocation points from ${assets.product.sourceHref}`);
  return {detail,assets,calibration,product};
}
function percentile(values,p){const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const q=(a.length-1)*p,l=Math.floor(q),h=Math.ceil(q);return l===h?a[l]:a[l]+(a[h]-a[l])*(q-l);}
function displayByte(v,lo,hi){if(!Number.isFinite(v)||!Number.isFinite(lo)||!Number.isFinite(hi)||hi<=lo)return 0;return Math.round(255*Math.pow(Math.max(0,Math.min(1,(v-lo)/(hi-lo))),.78));}
function quality(g){return g.state==='GEOLOCATED_BILINEAR_GCP'?'PRODUCT_GCP_BILINEAR':g.state==='GEOLOCATED_LOCAL_GCP_TRIANGLE'?'PRODUCT_GCP_LOCAL_TRIANGLE':'NEAREST_GCP_FALLBACK';}
async function readOne(image,pixel,line){const w=image.getWidth(),h=image.getHeight(),x=Math.max(0,Math.min(w-1,Math.round(pixel))),y=Math.max(0,Math.min(h-1,Math.round(line))),a=await image.readRasters({window:[x,y,x+1,y+1],samples:[0],interleave:true}),n=Number(image.getGDALNoData?.()??0),dn=Number(a[0]);return {dn:Number.isFinite(dn)&&dn!==n?dn:null,x,y,w,h,nodata:n};}

export async function sampleCalibratedSentinel1V2(record,lon,lat,{polarization='vv',quantity='sigmaNought',signal}={}){
  const {detail,assets,calibration,product}=await bundle(record,polarization,signal),g=geolocateToPixelV2(product,lon,lat);if(!Number.isFinite(g.pixel)||!Number.isFinite(g.line))return {state:'GEOLOCATION_UNRESOLVED',id:record.id,geolocation:g};
  const {image}=await openMeasurement(assets.measurement.href),raw=await readOne(image,g.pixel,g.line),lut=calibrationLutAtV2(calibration,g.line,g.pixel,quantity);if(!Number.isFinite(raw.dn))return {state:'NODATA',id:record.id,geolocation:g};if(!Number.isFinite(lut)||lut===0)return {state:'CALIBRATION_LUT_UNRESOLVED',id:record.id,geolocation:g,lut};
  const value=raw.dn*raw.dn/(lut*lut),db=value>0?10*Math.log10(value):null,q=quality(g);
  return {state:'CALIBRATED_SENTINEL1_GRD_SAMPLE',id:record.id,startTime:record.startTime,platform:record.platform,polarization:String(polarization).toUpperCase(),quantity,value,db,measured:true,inferred:false,dn:raw.dn,lut,pixel:[raw.x,raw.y],fractionalPixel:[g.pixel,g.line],geolocation:{method:g.state,residualDeg:g.residualDeg??null,gcpSpanDeg:g.gcpSpanDeg??null,quality:q},processing:{thermalNoiseCorrectionPerformed:product.thermalNoiseCorrectionPerformed,radiometricCalibration:'PRODUCT_LUT',terrainFlattened:false,localIncidenceAngleCorrected:false},product:{rangePixelSpacing:product.rangePixelSpacing,azimuthPixelSpacing:product.azimuthPixelSpacing,incidenceAngleMidSwath:product.incidenceAngleMidSwath,orbitSource:product.orbitSource||detail.properties?.['s1:orbit_source']||null},evidence:{grade:q==='PRODUCT_GCP_BILINEAR'?'A-':q==='PRODUCT_GCP_LOCAL_TRIANGLE'?'B+':'B',measured:true,inferred:false},provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product.sourceHref,noise:assets.noise?.sourceHref||null},boundary:'Radiometrically calibrated Sentinel-1 Level-1 GRD backscatter. Not RTC, not SLC phase, not InSAR displacement.'};
}

export async function calibratedTargetPatchV2(record,lon,lat,{polarization='vv',quantity='sigmaNought',radiusPixels=64,signal,onStage}={}){
  onStage?.('LOAD_PRODUCT_ANNOTATION');const {detail,assets,calibration,product}=await bundle(record,polarization,signal);onStage?.('INVERT_PRODUCT_GCP_GRID');const g=geolocateToPixelV2(product,lon,lat);if(!Number.isFinite(g.pixel)||!Number.isFinite(g.line))throw new Error(`Selected target could not be bound to product GCP grid: ${g.reason||g.state}`);
  const {image}=await openMeasurement(assets.measurement.href),W=image.getWidth(),H=image.getHeight(),r=Math.max(24,Math.min(128,Math.round(radiusPixels))),cx=Math.max(0,Math.min(W-1,Math.round(g.pixel))),cy=Math.max(0,Math.min(H-1,Math.round(g.line))),x0=Math.max(0,cx-r),y0=Math.max(0,cy-r),x1=Math.min(W,cx+r+1),y1=Math.min(H,cy+r+1);onStage?.('READ_TARGET_SOURCE_BLOCKS');
  const raw=await image.readRasters({window:[x0,y0,x1,y1],samples:[0],interleave:true}),width=x1-x0,height=y1-y0,nodata=Number(image.getGDALNoData?.()??0),db=new Float32Array(raw.length),power=new Float32Array(raw.length),valid=[];onStage?.('APPLY_PRODUCT_CALIBRATION_LUT');
  for(let py=0,k=0;py<height;py++)for(let px=0;px<width;px++,k++){const dn=Number(raw[k]);if(!Number.isFinite(dn)||dn===nodata){db[k]=NaN;power[k]=NaN;continue;}const lut=calibrationLutAtV2(calibration,y0+py,x0+px,quantity);if(!Number.isFinite(lut)||lut===0){db[k]=NaN;power[k]=NaN;continue;}const v=dn*dn/(lut*lut);power[k]=v;db[k]=v>0?10*Math.log10(v):NaN;if(Number.isFinite(db[k]))valid.push(db[k]);}
  const q=quality(g),stats={validCount:valid.length,p02:percentile(valid,.02),p50:percentile(valid,.5),p98:percentile(valid,.98)};onStage?.('READY');
  return {state:'CALIBRATED_SENTINEL1_TARGET_PATCH_V2',id:record.id,startTime:record.startTime,platform:record.platform,target:{lon:Number(lon),lat:Number(lat)},polarization:String(polarization).toUpperCase(),quantity,sourceWindow:[x0,y0,x1,y1],width,height,centerPixel:[cx,cy],geolocation:{method:g.state,residualDeg:g.residualDeg??null,gcpSpanDeg:g.gcpSpanDeg??null,quality:q,fractionalPixel:[g.pixel,g.line]},rawDn:raw,power,db,stats,processing:{thermalNoiseCorrectionPerformed:product.thermalNoiseCorrectionPerformed,radiometricCalibration:'PRODUCT_LUT',terrainFlattened:false,localIncidenceAngleCorrected:false},product:{rangePixelSpacing:product.rangePixelSpacing,azimuthPixelSpacing:product.azimuthPixelSpacing,incidenceAngleMidSwath:product.incidenceAngleMidSwath,orbitSource:product.orbitSource||detail.properties?.['s1:orbit_source']||null},evidence:{grade:q==='PRODUCT_GCP_BILINEAR'?'A-':q==='PRODUCT_GCP_LOCAL_TRIANGLE'?'B+':'B',measured:true,inferred:false},provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product.sourceHref,noise:assets.noise?.sourceHref||null},boundary:'Target-centered actual Sentinel-1 GRD pixels, product-GCP geolocated and product-LUT calibrated. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'};
}
export function paintCalibratedPatchV2(patch,canvas){const {width,height,db,stats}=patch;canvas.width=width;canvas.height=height;const c=canvas.getContext('2d'),im=c.createImageData(width,height),lo=stats.p02??-30,hi=stats.p98??0;for(let i=0;i<db.length;i++){const j=i*4,v=db[i];if(!Number.isFinite(v)){im.data[j+3]=0;continue;}const b=displayByte(v,lo,hi);im.data[j]=b;im.data[j+1]=Math.min(255,Math.round(b*1.02));im.data[j+2]=Math.min(255,Math.round(b*1.08));im.data[j+3]=255;}c.putImageData(im,0,0);return {displayRangeDb:[lo,hi],displayTransform:'percentile dB stretch only'};}
export function clearCalibrationV2Cache(){TIFF_CACHE.clear();DETAIL_CACHE.clear();XML_CACHE.clear();}
