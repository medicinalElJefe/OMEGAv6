import { s3ToHttps } from './stac.mjs';

const EARTH_SEARCH_ITEM='https://earth-search.aws.element84.com/v1/collections/sentinel-1-grd/items/';
const TIFF_CACHE=new Map();
const DETAIL_CACHE=new Map();
const XML_CACHE=new Map();
let geotiffPromise=null;

async function geotiff(){
  if(!geotiffPromise)geotiffPromise=import('https://cdn.jsdelivr.net/npm/geotiff@3.0.5/+esm');
  return geotiffPromise;
}

async function openMeasurement(url){
  if(!TIFF_CACHE.has(url))TIFF_CACHE.set(url,(async()=>{
    const mod=await geotiff();
    const tiff=await mod.fromUrl(url,{cacheSize:64*1024*1024});
    const image=await tiff.getImage();
    return {tiff,image};
  })());
  return TIFF_CACHE.get(url);
}

async function fetchText(url,signal){
  if(!XML_CACHE.has(url))XML_CACHE.set(url,(async()=>{
    const response=await fetch(url,{signal});
    if(!response.ok)throw new Error(`Sentinel-1 annotation ${response.status}: ${url}`);
    return response.text();
  })());
  return XML_CACHE.get(url);
}

export async function fetchSentinel1ItemDetail(id,signal){
  if(!id)throw new Error('Sentinel-1 item id is required');
  if(!DETAIL_CACHE.has(id))DETAIL_CACHE.set(id,(async()=>{
    const response=await fetch(`${EARTH_SEARCH_ITEM}${encodeURIComponent(id)}`,{headers:{accept:'application/geo+json,application/json'},signal});
    if(!response.ok)throw new Error(`Earth Search item ${response.status}: ${id}`);
    return response.json();
  })());
  return DETAIL_CACHE.get(id);
}

function asset(detail,key){
  const a=detail?.assets?.[key];
  return a?.href?{...a,key,href:s3ToHttps(a.href),sourceHref:a.href}:null;
}

export function sentinel1ProductAssets(detail,polarization){
  const pol=String(polarization||'').toLowerCase();
  if(!pol)throw new Error('Polarization is required');
  return {
    measurement:asset(detail,pol),
    calibration:asset(detail,`schema-calibration-${pol}`),
    noise:asset(detail,`schema-noise-${pol}`),
    product:asset(detail,`schema-product-${pol}`),
    manifest:asset(detail,'safe-manifest')
  };
}

function xmlDocument(text){
  const doc=new DOMParser().parseFromString(text,'application/xml');
  const error=doc.querySelector('parsererror');
  if(error)throw new Error(`Sentinel-1 XML parse error: ${error.textContent?.slice(0,160)}`);
  return doc;
}

function textOf(node,tag){return node?.querySelector(tag)?.textContent?.trim()??null;}
function numbers(text){return String(text||'').trim().split(/\s+/).filter(Boolean).map(Number).filter(Number.isFinite);}

export function parseCalibrationXml(text){
  const doc=xmlDocument(text);
  const vectors=[...doc.querySelectorAll('calibrationVector')].map(node=>({
    line:Number(textOf(node,'line')),
    pixel:numbers(textOf(node,'pixel')),
    sigmaNought:numbers(textOf(node,'sigmaNought')),
    betaNought:numbers(textOf(node,'betaNought')),
    gamma:numbers(textOf(node,'gamma')),
    dn:numbers(textOf(node,'dn')),
    azimuthTime:textOf(node,'azimuthTime')
  })).filter(v=>Number.isFinite(v.line)&&v.pixel.length);
  vectors.sort((a,b)=>a.line-b.line);
  const absoluteCalibrationConstant=Number(textOf(doc,'absoluteCalibrationConstant'));
  return {vectors,absoluteCalibrationConstant:Number.isFinite(absoluteCalibrationConstant)?absoluteCalibrationConstant:null};
}

export function parseProductXml(text){
  const doc=xmlDocument(text);
  const points=[...doc.querySelectorAll('geolocationGridPoint')].map(node=>({
    line:Number(textOf(node,'line')),
    pixel:Number(textOf(node,'pixel')),
    latitude:Number(textOf(node,'latitude')),
    longitude:Number(textOf(node,'longitude')),
    height:Number(textOf(node,'height')),
    incidenceAngle:Number(textOf(node,'incidenceAngle')),
    elevationAngle:Number(textOf(node,'elevationAngle')),
    azimuthTime:textOf(node,'azimuthTime')
  })).filter(p=>[p.line,p.pixel,p.latitude,p.longitude].every(Number.isFinite));
  return {
    points,
    thermalNoiseCorrectionPerformed:String(textOf(doc,'thermalNoiseCorrectionPerformed')).toLowerCase()==='true',
    rangePixelSpacing:Number(textOf(doc,'rangePixelSpacing'))||null,
    azimuthPixelSpacing:Number(textOf(doc,'azimuthPixelSpacing'))||null,
    numberOfSamples:Number(textOf(doc,'numberOfSamples'))||null,
    numberOfLines:Number(textOf(doc,'numberOfLines'))||null,
    incidenceAngleMidSwath:Number(textOf(doc,'incidenceAngleMidSwath'))||null,
    orbitSource:textOf(doc,'orbitSource')||null
  };
}

function unwrapLon(lon,reference){
  let x=Number(lon),r=Number(reference);
  while(x-r>180)x-=360;
  while(x-r<-180)x+=360;
  return x;
}

function bilinear(c00,c10,c01,c11,u,v){return c00*(1-u)*(1-v)+c10*u*(1-v)+c01*(1-u)*v+c11*u*v;}

function solveCell(targetLon,targetLat,p00,p10,p01,p11){
  const ref=targetLon;
  const L=[p00,p10,p01,p11].map(p=>unwrapLon(p.longitude,ref));
  const T=unwrapLon(targetLon,ref);
  let u=.5,v=.5;
  for(let iter=0;iter<12;iter++){
    const lon=bilinear(L[0],L[1],L[2],L[3],u,v);
    const lat=bilinear(p00.latitude,p10.latitude,p01.latitude,p11.latitude,u,v);
    const f1=lon-T,f2=lat-targetLat;
    const duLon=(L[1]-L[0])*(1-v)+(L[3]-L[2])*v;
    const dvLon=(L[2]-L[0])*(1-u)+(L[3]-L[1])*u;
    const duLat=(p10.latitude-p00.latitude)*(1-v)+(p11.latitude-p01.latitude)*v;
    const dvLat=(p01.latitude-p00.latitude)*(1-u)+(p11.latitude-p10.latitude)*u;
    const det=duLon*dvLat-dvLon*duLat;
    if(Math.abs(det)<1e-14)break;
    const du=(f1*dvLat-f2*dvLon)/det;
    const dv=(duLon*f2-duLat*f1)/det;
    u-=du;v-=dv;
    if(Math.abs(du)+Math.abs(dv)<1e-10)break;
  }
  const lon=bilinear(L[0],L[1],L[2],L[3],u,v);
  const lat=bilinear(p00.latitude,p10.latitude,p01.latitude,p11.latitude,u,v);
  const residualDeg=Math.hypot(lon-T,lat-targetLat);
  if(u<-.02||u>1.02||v<-.02||v>1.02||residualDeg>2e-4)return null;
  return {u,v,residualDeg,pixel:bilinear(p00.pixel,p10.pixel,p01.pixel,p11.pixel,u,v),line:bilinear(p00.line,p10.line,p01.line,p11.line,u,v)};
}

export function geolocateToPixel(product,lon,lat){
  const points=product?.points||[];
  if(points.length<4)return {state:'GEOLOCATION_UNRESOLVED',reason:'No product geolocation grid'};
  const lines=[...new Set(points.map(p=>p.line))].sort((a,b)=>a-b);
  const pixels=[...new Set(points.map(p=>p.pixel))].sort((a,b)=>a-b);
  const byKey=new Map(points.map(p=>[`${p.line}|${p.pixel}`,p]));
  let best=null;
  for(let yi=0;yi<lines.length-1;yi++)for(let xi=0;xi<pixels.length-1;xi++){
    const p00=byKey.get(`${lines[yi]}|${pixels[xi]}`),p10=byKey.get(`${lines[yi]}|${pixels[xi+1]}`),p01=byKey.get(`${lines[yi+1]}|${pixels[xi]}`),p11=byKey.get(`${lines[yi+1]}|${pixels[xi+1]}`);
    if(!p00||!p10||!p01||!p11)continue;
    const candidate=solveCell(Number(lon),Number(lat),p00,p10,p01,p11);
    if(candidate&&(!best||candidate.residualDeg<best.residualDeg))best={...candidate,corners:[p00,p10,p01,p11]};
  }
  if(best)return {state:'GEOLOCATED_BILINEAR_GCP',...best};
  let nearest=null;
  for(const p of points){
    const dx=(unwrapLon(p.longitude,lon)-Number(lon))*Math.cos(Number(lat)*Math.PI/180),dy=p.latitude-Number(lat),d2=dx*dx+dy*dy;
    if(!nearest||d2<nearest.d2)nearest={...p,d2};
  }
  return nearest?{state:'GEOLOCATED_NEAREST_GCP_FALLBACK',pixel:nearest.pixel,line:nearest.line,residualDeg:Math.sqrt(nearest.d2),nearest}: {state:'GEOLOCATION_UNRESOLVED'};
}

function interp1(xs,ys,x){
  if(!xs?.length||xs.length!==ys?.length)return null;
  if(x<=xs[0])return ys[0];
  if(x>=xs.at(-1))return ys.at(-1);
  let lo=0,hi=xs.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(xs[mid]<=x)lo=mid;else hi=mid;}
  const span=xs[hi]-xs[lo];
  if(span===0)return ys[lo];
  const t=(x-xs[lo])/span;
  return ys[lo]+(ys[hi]-ys[lo])*t;
}

function vectorValue(vector,pixel,kind){return interp1(vector.pixel,vector[kind],pixel);}

export function calibrationLutAt(calibration,line,pixel,kind='sigmaNought'){
  const vectors=calibration?.vectors||[];
  if(!vectors.length)return null;
  if(!['sigmaNought','betaNought','gamma','dn'].includes(kind))throw new Error(`Unsupported calibration LUT: ${kind}`);
  let lo=vectors[0],hi=vectors.at(-1);
  for(let i=0;i<vectors.length-1;i++)if(line>=vectors[i].line&&line<=vectors[i+1].line){lo=vectors[i];hi=vectors[i+1];break;}
  if(line<=vectors[0].line)lo=hi=vectors[0];
  if(line>=vectors.at(-1).line)lo=hi=vectors.at(-1);
  const a=vectorValue(lo,pixel,kind),b=vectorValue(hi,pixel,kind);
  if(!Number.isFinite(a)||!Number.isFinite(b))return null;
  if(lo.line===hi.line)return a;
  const t=(line-lo.line)/(hi.line-lo.line);
  return a+(b-a)*t;
}

async function readDn(url,pixel,line){
  const {image}=await openMeasurement(url);
  const width=image.getWidth(),height=image.getHeight();
  const x=Math.max(0,Math.min(width-1,Math.round(pixel))),y=Math.max(0,Math.min(height-1,Math.round(line)));
  const values=await image.readRasters({window:[x,y,x+1,y+1],samples:[0],interleave:true});
  const dn=Number(values[0]);
  const nodataText=image.getGDALNoData?.();
  const nodata=nodataText==null?0:Number(nodataText);
  return {dn:Number.isFinite(dn)&&dn!==nodata?dn:null,x,y,width,height,nodata};
}

export async function sampleCalibratedSentinel1(record,lon,lat,{polarization='vv',quantity='sigmaNought',signal}={}){
  const detail=await fetchSentinel1ItemDetail(record.id,signal);
  const assets=sentinel1ProductAssets(detail,polarization);
  if(!assets.measurement||!assets.calibration||!assets.product)throw new Error(`Sentinel-1 ${record.id} lacks measurement/calibration/product assets for ${polarization.toUpperCase()}`);
  const [calText,productText]=await Promise.all([fetchText(assets.calibration.href,signal),fetchText(assets.product.href,signal)]);
  const calibration=parseCalibrationXml(calText),product=parseProductXml(productText);
  const geolocation=geolocateToPixel(product,lon,lat);
  if(!Number.isFinite(geolocation.pixel)||!Number.isFinite(geolocation.line))return {state:'GEOLOCATION_UNRESOLVED',id:record.id,geolocation};
  const raw=await readDn(assets.measurement.href,geolocation.pixel,geolocation.line);
  if(!Number.isFinite(raw.dn))return {state:'NODATA',id:record.id,geolocation,raw};
  const lut=calibrationLutAt(calibration,geolocation.line,geolocation.pixel,quantity);
  if(!Number.isFinite(lut)||lut===0)return {state:'CALIBRATION_LUT_UNRESOLVED',id:record.id,geolocation,raw,lut};
  const value=(raw.dn*raw.dn)/(lut*lut);
  const db=value>0?10*Math.log10(value):null;
  const thermalNoiseCorrectionPerformed=product.thermalNoiseCorrectionPerformed;
  const quality=geolocation.state==='GEOLOCATED_BILINEAR_GCP'?'PRODUCT_GCP_BILINEAR':'NEAREST_GCP_FALLBACK';
  return {
    state:'CALIBRATED_SENTINEL1_GRD_SAMPLE',
    id:record.id,
    startTime:record.startTime,
    platform:record.platform,
    polarization:String(polarization).toUpperCase(),
    quantity,
    value,
    db,
    measured:true,
    inferred:false,
    dn:raw.dn,
    lut,
    pixel:[raw.x,raw.y],
    fractionalPixel:[geolocation.pixel,geolocation.line],
    geolocation:{method:geolocation.state,residualDeg:geolocation.residualDeg,quality},
    processing:{thermalNoiseCorrectionPerformed,terrainFlattened:false,localIncidenceAngleCorrected:false},
    product:{rangePixelSpacing:product.rangePixelSpacing,azimuthPixelSpacing:product.azimuthPixelSpacing,incidenceAngleMidSwath:product.incidenceAngleMidSwath,orbitSource:product.orbitSource||detail.properties?.['s1:orbit_source']||null},
    evidence:{grade:quality==='PRODUCT_GCP_BILINEAR'?'A-':'B',reason:'Actual GRD DN sampled from measurement TIFF and radiometrically calibrated with the product calibration LUT; terrain flattening/local-incidence correction is not applied.'},
    provenance:{measurement:assets.measurement.sourceHref,calibration:assets.calibration.sourceHref,product:assets.product.sourceHref,noise:assets.noise?.sourceHref||null,stacItem:`${EARTH_SEARCH_ITEM}${encodeURIComponent(record.id)}`},
    boundary:'Radiometrically calibrated ellipsoid-referenced Sentinel-1 Level-1 GRD backscatter. Not radiometric terrain correction, not SLC phase, not InSAR displacement.'
  };
}

export async function calibratedTemporalStack(records,lon,lat,{polarization='vv',quantity='sigmaNought',maxScenes=96,onProgress,signal}={}){
  const out=[];
  const candidates=(records||[]).slice(-Math.max(1,Math.min(Number(maxScenes)||96,256)));
  for(let i=0;i<candidates.length;i++){
    const record=candidates[i];
    try{out.push(await sampleCalibratedSentinel1(record,lon,lat,{polarization,quantity,signal}));}
    catch(error){out.push({state:'SAMPLE_ERROR',id:record.id,startTime:record.startTime,measured:false,error:error.message});}
    onProgress?.(i+1,candidates.length);
  }
  return out;
}

export function clearSentinel1CalibrationCache(){TIFF_CACHE.clear();DETAIL_CACHE.clear();XML_CACHE.clear();}
