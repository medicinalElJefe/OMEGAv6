import{sarMeasurementRasterR337}from'./sarMeasurementRasterR337.js';

export const SAR_PAIR_FIELDS_SCHEMA_R341='OMEGA_SAR_PAIR_FIELDS_R341';
export const SAR_PAIR_FIELDS_REVISION_R341='R341';
const GRID_TOL=1e-9,WINDOW_RADIUS=1;

const finite=v=>typeof v==='number'&&Number.isFinite(v);
const close=(a,b,t=GRID_TOL)=>finite(a)&&finite(b)&&Math.abs(a-b)<=t;
function sameAffine(a,b){
 if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length||a.length<6)return false;
 return a.every((v,i)=>close(Number(v),Number(b[i])));
}
function gridIdentity(master,slave){
 const m=master?.raster,s=slave?.raster,reasons=[];
 if(!m||!s)return{admitted:false,reasons:['TWO_DECODED_SLC_RASTERS_REQUIRED']};
 if(m.width!==s.width||m.height!==s.height)reasons.push('OUTPUT_GRID_SHAPE_MISMATCH');
 if(m.sampling?.sourceWidth!==s.sampling?.sourceWidth||m.sampling?.sourceHeight!==s.sampling?.sourceHeight)reasons.push('NATIVE_GRID_SHAPE_MISMATCH');
 if(m.sampling?.method!==s.sampling?.method)reasons.push('SAMPLING_OPERATOR_MISMATCH');
 const mg=m.georeference,sg=s.georeference;
 if(!mg?.bound||!sg?.bound)reasons.push('GEOREFERENCE_REQUIRED_FOR_PAIR_ADMISSION');
 if(!mg?.affineBound||!sg?.affineBound)reasons.push('AFFINE_GRID_IDENTITY_REQUIRED');
 if((mg?.crs||null)!==(sg?.crs||null))reasons.push('COMMON_CRS_REQUIRED');
 if(mg?.affineBound&&sg?.affineBound&&!sameAffine(mg.affine,sg.affine))reasons.push('AFFINE_GRID_MISMATCH');
 return{admitted:reasons.length===0,reasons,tolerance:GRID_TOL,method:'EXACT_SAME_AFFINE_GRID_NO_RESAMPLING'};
}
function interferogramAt(mi,mq,si,sq){
 // (mi+i mq) * conj(si+i sq)
 const real=mi*si+mq*sq,imag=mq*si-mi*sq;
 return{real,imag,phaseRad:Math.atan2(imag,real)};
}
function coherenceAt(mI,mQ,sI,sQ,mask,w,h,x,y,radius=WINDOW_RADIUS){
 let re=0,im=0,eM=0,eS=0,n=0;
 for(let yy=Math.max(0,y-radius);yy<=Math.min(h-1,y+radius);yy++)for(let xx=Math.max(0,x-radius);xx<=Math.min(w-1,x+radius);xx++){
  const k=yy*w+xx;if(!mask[k])continue;
  const mi=mI[k],mq=mQ[k],si=sI[k],sq=sQ[k];
  if(![mi,mq,si,sq].every(finite))continue;
  re+=mi*si+mq*sq;im+=mq*si-mi*sq;eM+=mi*mi+mq*mq;eS+=si*si+sq*sq;n++;
 }
 const den=Math.sqrt(eM*eS);
 return n>=3&&den>0?Math.min(1,Math.max(0,Math.hypot(re,im)/den)):NaN;
}
function pairFields(master,slave){
 const m=master.raster,s=slave.raster,w=m.width,h=m.height,total=w*h;
 const mask=new Array(total).fill(0),real=new Array(total).fill(NaN),imag=new Array(total).fill(NaN),phase=new Array(total).fill(NaN),coh=new Array(total).fill(NaN);
 for(let k=0;k<total;k++){
  const valid=Number(m.validMask?.[k])>0&&Number(s.validMask?.[k])>0&&[m.complexI?.[k],m.complexQ?.[k],s.complexI?.[k],s.complexQ?.[k]].every(finite);
  if(!valid)continue;mask[k]=1;
  const z=interferogramAt(m.complexI[k],m.complexQ[k],s.complexI[k],s.complexQ[k]);real[k]=z.real;imag[k]=z.imag;phase[k]=z.phaseRad;
 }
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;if(mask[k])coh[k]=coherenceAt(m.complexI,m.complexQ,s.complexI,s.complexQ,mask,w,h,x,y)}
 const finiteC=coh.filter(finite),meanCoherence=finiteC.length?finiteC.reduce((a,b)=>a+b,0)/finiteC.length:null;
 return{mask,real,imag,phase,coh,meanCoherence,validPairSamples:mask.reduce((a,b)=>a+b,0),coherenceSamples:finiteC.length,total};
}
function childUrl(url,prefix){
 const u=new URL(url.toString());
 for(const key of ['collection','productId','assetKey']){const v=url.searchParams.get(prefix+key[0].toUpperCase()+key.slice(1));if(v)u.searchParams.set(key,v);else u.searchParams.delete(key)}
 return u;
}
export async function sarPairFieldsR341(url){
 const started=Date.now(),base={schema:SAR_PAIR_FIELDS_SCHEMA_R341,revision:SAR_PAIR_FIELDS_REVISION_R341,verifiedAt:new Date().toISOString()};
 const required=['masterCollection','masterProductId','masterAssetKey','slaveCollection','slaveProductId','slaveAssetKey'];
 const missing=required.filter(k=>!url.searchParams.get(k));
 if(missing.length)return{ok:false,...base,state:'INVALID_REQUEST',missing,truthBoundary:'R341 requires explicit master/slave SLC product and asset identities. No pair field is inferred from catalogue proximity alone.'};
 const masterCollection=String(url.searchParams.get('masterCollection')||'').toLowerCase(),slaveCollection=String(url.searchParams.get('slaveCollection')||'').toLowerCase(),masterProductId=String(url.searchParams.get('masterProductId')||''),slaveProductId=String(url.searchParams.get('slaveProductId')||''),masterAssetKey=String(url.searchParams.get('masterAssetKey')||''),slaveAssetKey=String(url.searchParams.get('slaveAssetKey')||''),requestedDt=Number(url.searchParams.get('temporalBaselineDays'));
 const requestReasons=[];
 if(masterCollection!=='sentinel-1-slc'||slaveCollection!=='sentinel-1-slc')requestReasons.push('TWO_SENTINEL1_SLC_PRODUCTS_REQUIRED');
 if(masterProductId===slaveProductId)requestReasons.push('DISTINCT_ACQUISITIONS_REQUIRED');
 if(masterAssetKey.toLowerCase()!==slaveAssetKey.toLowerCase())requestReasons.push('SAME_POLARIZATION_ASSET_REQUIRED');
 if(!Number.isFinite(requestedDt)||requestedDt<=0)requestReasons.push('POSITIVE_TEMPORAL_BASELINE_REQUIRED');
 if(requestReasons.length)return{ok:false,...base,state:'PAIR_REQUEST_HELD',reasons:requestReasons,truthBoundary:'R341 pair-field computation requires two distinct Sentinel-1 SLC acquisitions, the same measurement asset key/polarization, and a positive declared temporal baseline before any complex pair operator runs.'};
 const [master,slave]=await Promise.all([sarMeasurementRasterR337(childUrl(url,'master')),sarMeasurementRasterR337(childUrl(url,'slave'))]);
 if(!master?.complexDataBound||!slave?.complexDataBound)return{ok:false,...base,state:'PAIR_SOURCE_HELD',latencyMs:Date.now()-started,master:{state:master?.state,productId:master?.productId,assetKey:master?.assetKey},slave:{state:slave?.state,productId:slave?.productId,assetKey:slave?.assetKey},truthBoundary:'R341 computes pair fields only after both exact SLC complex sources are independently decoded by R337.'};
 const grid=gridIdentity(master,slave);
 if(!grid.admitted)return{ok:false,...base,state:'COREGISTRATION_REQUIRED',latencyMs:Date.now()-started,grid,master:{productId:master.productId,assetKey:master.assetKey},slave:{productId:slave.productId,assetKey:slave.assetKey},truthBoundary:'R341 refuses pair-derived physics unless both decoded SLC rasters already occupy the same declared affine grid. General SAR co-registration/resampling remains a separate required operator.'};
 const f=pairFields(master,slave),temporalBaselineDays=requestedDt;
 const raster={...master.raster,sourceId:`${master.productId}:${master.assetKey} × ${slave.productId}:${slave.assetKey}`,interferogramReal:f.real,interferogramImag:f.imag,interferogramPhaseRad:f.phase,coherence:f.coh,pairValidMask:f.mask,derivationR341:{schema:SAR_PAIR_FIELDS_SCHEMA_R341,masterSourceId:master.raster.sourceId,slaveSourceId:slave.raster.sourceId,gridAdmission:grid.method,gridTolerance:grid.tolerance,coherenceWindow:'3x3',validPairSamples:f.validPairSamples,coherenceSamples:f.coherenceSamples,meanCoherence:f.meanCoherence,temporalBaselineDays:Number.isFinite(temporalBaselineDays)?temporalBaselineDays:null,operators:['MASTER_TIMES_CONJUGATE_SLAVE','WRAPPED_ARGUMENT_ATAN2','LOCAL_NORMALIZED_COMPLEX_CROSS_CORRELATION'],truthBoundary:'Pair fields are derived only on an already-identical affine grid. No interpolation, orbit correction, topographic phase removal, atmospheric correction, phase unwrapping, or metric displacement is claimed.'}};
 return{ok:true,...base,state:'PAIR_FIELDS_BOUND',latencyMs:Date.now()-started,pairDerivedBound:true,wrappedInterferogramBound:true,coherenceBound:f.coherenceSamples>0,meanCoherence:f.meanCoherence,temporalBaselineDays:Number.isFinite(temporalBaselineDays)?temporalBaselineDays:null,grid,raster,master:{productId:master.productId,assetKey:master.assetKey},slave:{productId:slave.productId,assetKey:slave.assetKey},truthBoundary:'R341 computes a wrapped interferogram and local coherence only when R337-decoded master/slave SLC samples are already on the same affine grid. These are pair-derived measurements, not deformation. Metric LOS remains gated by unwrapping plus orbit/topography/atmosphere/noise handling.'};
}
export const R341_TESTABLE=Object.freeze({sameAffine,gridIdentity,interferogramAt,coherenceAt,pairFields});
