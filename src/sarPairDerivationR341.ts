import type{SarRasterFieldR283}from'./sarRasterR283';

export const SAR_PAIR_DERIVATION_SCHEMA_R341='OMEGA_SAR_PAIR_DERIVATION_R341';

export type SarPairDerivationStateR341=
 |'PAIR_FIELDS_BOUND'
 |'GRID_IDENTITY_REQUIRED'
 |'COMPLEX_PAIR_REQUIRED'
 |'DIMENSION_MISMATCH'
 |'EMPTY_OVERLAP';

export interface SarPairDerivationR341{
 schema:string;
 state:SarPairDerivationStateR341;
 pairRaster?:SarRasterFieldR283;
 commonValid:number;
 expected:number;
 coverage:number;
 windowRadius:number;
 gridIdentity:boolean;
 gridReason:string;
 truthBoundary:string;
}

const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
const close=(a:number,b:number,tol=1e-10)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tol;
const sameArray=(a:number[]|null|undefined,b:number[]|null|undefined,tol=1e-10)=>!!a&&!!b&&a.length===b.length&&a.every((v,i)=>close(Number(v),Number(b[i]),tol));
const validAt=(r:SarRasterFieldR283,i:number)=>Number(r.validMask?.[i]??1)>0&&finite(r.complexI?.[i])&&finite(r.complexQ?.[i]);

export function sarSampledGridIdentityR341(a:SarRasterFieldR283,b:SarRasterFieldR283){
 if(a.width!==b.width||a.height!==b.height)return{ok:false,reason:'DISPLAY_GRID_DIMENSION_MISMATCH'};
 const as=a.sampling,bs=b.sampling;
 if(!as||!bs)return{ok:false,reason:'SAMPLING_RECEIPT_REQUIRED'};
 if(as.sourceWidth!==bs.sourceWidth||as.sourceHeight!==bs.sourceHeight)return{ok:false,reason:'NATIVE_SOURCE_DIMENSION_MISMATCH'};
 if(as.method!==bs.method)return{ok:false,reason:'SAMPLING_METHOD_MISMATCH'};
 const ag=a.georeference,bg=b.georeference;
 if(!ag?.bound||!bg?.bound)return{ok:false,reason:'GEOREFERENCE_REQUIRED'};
 if(ag.crs!==bg.crs||ag.epsg!==bg.epsg)return{ok:false,reason:'CRS_MISMATCH'};
 if(ag.affineBound&&bg.affineBound&&sameArray(ag.affine,bg.affine,1e-10))return{ok:true,reason:'EXACT_AFFINE_SAMPLED_GRID_IDENTITY'};
 if(ag.gcpBound&&bg.gcpBound&&ag.gcps?.length&&ag.gcps.length===bg.gcps?.length){
  const ok=ag.gcps.every((g,i)=>{const h=bg.gcps?.[i];return!!h&&close(g.pixel,h.pixel)&&close(g.line,h.line)&&close(g.x,h.x,1e-8)&&close(g.y,h.y,1e-8)&&close(g.z,h.z,1e-5)});
  if(ok)return{ok:true,reason:'EXACT_GCP_SAMPLED_GRID_IDENTITY'};
 }
 return{ok:false,reason:'SUBPIXEL_COREGISTRATION_NOT_PROVEN'};
}

function interferogramAt(mi:number,mq:number,si:number,sq:number){
 const re=mi*si+mq*sq,im=mq*si-mi*sq;
 return{re,im,phaseRad:Math.atan2(im,re),magnitude:Math.hypot(re,im)};
}

function localCoherence(master:SarRasterFieldR283,slave:SarRasterFieldR283,x:number,y:number,radius:number){
 let nr=0,ni=0,pm=0,ps=0,n=0;
 for(let yy=Math.max(0,y-radius);yy<=Math.min(master.height-1,y+radius);yy++)for(let xx=Math.max(0,x-radius);xx<=Math.min(master.width-1,x+radius);xx++){
  const i=yy*master.width+xx;
  if(!validAt(master,i)||!validAt(slave,i))continue;
  const mi=Number(master.complexI![i]),mq=Number(master.complexQ![i]),si=Number(slave.complexI![i]),sq=Number(slave.complexQ![i]);
  const z=interferogramAt(mi,mq,si,sq);
  nr+=z.re;ni+=z.im;pm+=mi*mi+mq*mq;ps+=si*si+sq*sq;n++;
 }
 const den=Math.sqrt(pm*ps);
 return n>=3&&den>0?Math.min(1,Math.max(0,Math.hypot(nr,ni)/den)):null;
}

export function deriveSarPairFieldsR341(master:SarRasterFieldR283,slave:SarRasterFieldR283,windowRadius=1):SarPairDerivationR341{
 const expected=Math.max(0,master.width*master.height);
 if(!master.complexI?.length||!master.complexQ?.length||!slave.complexI?.length||!slave.complexQ?.length)return{schema:SAR_PAIR_DERIVATION_SCHEMA_R341,state:'COMPLEX_PAIR_REQUIRED',commonValid:0,expected,coverage:0,windowRadius,gridIdentity:false,gridReason:'COMPLEX_IQ_ARRAYS_REQUIRED',truthBoundary:'R341 derives pair fields only from two decoded complex SLC rasters.'};
 if(master.width!==slave.width||master.height!==slave.height)return{schema:SAR_PAIR_DERIVATION_SCHEMA_R341,state:'DIMENSION_MISMATCH',commonValid:0,expected,coverage:0,windowRadius,gridIdentity:false,gridReason:'DISPLAY_GRID_DIMENSION_MISMATCH',truthBoundary:'Pair fields remain held until both complex rasters occupy one proven sampled grid.'};
 const grid=sarSampledGridIdentityR341(master,slave);
 if(!grid.ok)return{schema:SAR_PAIR_DERIVATION_SCHEMA_R341,state:'GRID_IDENTITY_REQUIRED',commonValid:0,expected,coverage:0,windowRadius,gridIdentity:false,gridReason:grid.reason,truthBoundary:'R341 refuses interferometric products until sampled-grid identity is proven. Metadata pair compatibility alone is insufficient; unproven subpixel co-registration stays held.'};

 const n=expected,phase=new Array(n).fill(0),coherence=new Array(n).fill(0),mask=new Array(n).fill(0),timeStackRelative=new Array(n).fill(0),scar=new Array(n).fill(1),proof=new Array(n).fill(0);
 let commonValid=0;
 for(let y=0;y<master.height;y++)for(let x=0;x<master.width;x++){
  const i=y*master.width+x;
  if(!validAt(master,i)||!validAt(slave,i))continue;
  const mi=Number(master.complexI![i]),mq=Number(master.complexQ![i]),si=Number(slave.complexI![i]),sq=Number(slave.complexQ![i]);
  const z=interferogramAt(mi,mq,si,sq),gamma=localCoherence(master,slave,x,y,Math.max(1,Math.min(3,Math.floor(windowRadius))));
  phase[i]=z.phaseRad;
  if(gamma!=null)coherence[i]=gamma;
  const ma=Math.hypot(mi,mq),sa=Math.hypot(si,sq);
  timeStackRelative[i]=Math.log((sa+1)/(ma+1));
  mask[i]=1;scar[i]=gamma==null?1:Math.max(0,1-gamma);proof[i]=1;commonValid++;
 }
 if(!commonValid)return{schema:SAR_PAIR_DERIVATION_SCHEMA_R341,state:'EMPTY_OVERLAP',commonValid:0,expected,coverage:0,windowRadius,gridIdentity:true,gridReason:grid.reason,truthBoundary:'The proven common grid contains no jointly valid complex samples.'};
 const pairRaster:SarRasterFieldR283={...master,sourceId:`${master.sourceId}::PAIR::${slave.sourceId}`,native:false,interferogramPhaseRad:phase,coherence,timeStackRelative,validMask:mask,scarBurden:scar,proofCoverage:proof,pairDerivationR341:{schema:SAR_PAIR_DERIVATION_SCHEMA_R341,masterSourceId:master.sourceId,slaveSourceId:slave.sourceId,gridIdentity:grid.reason,windowRadius:Math.max(1,Math.min(3,Math.floor(windowRadius))),commonValid}};
 return{schema:SAR_PAIR_DERIVATION_SCHEMA_R341,state:'PAIR_FIELDS_BOUND',pairRaster,commonValid,expected,coverage:commonValid/Math.max(1,expected),windowRadius:grid.ok?Math.max(1,Math.min(3,Math.floor(windowRadius))):windowRadius,gridIdentity:true,gridReason:grid.reason,truthBoundary:'R341 computes wrapped interferogram phase, local normalized complex coherence, two-epoch log-amplitude change, pair missingness burden, and evidence coverage only on a proven identical sampled complex grid. It does not claim Sentinel-1 TOPS subpixel co-registration, phase unwrapping, orbit/topographic/atmospheric correction, calibrated backscatter, or metric deformation.'};
}

export const R341_TESTABLE=Object.freeze({interferogramAt,localCoherence});
