export const SAR_PAIR_PLAN_SCHEMA_R337='OMEGA_SAR_PAIR_PLAN_R337';
export interface SarPairProductR337{id:string;collection:string;acquiredAt:string|null;instrumentMode:string|null;orbitState:string|null;relativeOrbit:number|null;polarizations:string[];bbox:number[]|null}
export interface SarPairPlanR337{schema:string;masterId:string;slaveId:string;state:'COMPATIBLE_METADATA_PAIR'|'HELD';temporalBaselineDays:number|null;commonPolarizations:string[];sameRelativeOrbit:boolean;sameOrbitDirection:boolean;sameInstrumentMode:boolean;footprintOverlap:number|null;reasons:string[];next:string;truthBoundary:string}
const up=(v:string|null)=>String(v||'').toUpperCase();
const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
function overlap(a:number[]|null,b:number[]|null){if(!a||!b||a.length<4||b.length<4)return null;const ax0=Math.min(a[0],a[2]),ax1=Math.max(a[0],a[2]),ay0=Math.min(a[1],a[3]),ay1=Math.max(a[1],a[3]),bx0=Math.min(b[0],b[2]),bx1=Math.max(b[0],b[2]),by0=Math.min(b[1],b[3]),by1=Math.max(b[1],b[3]),ix=Math.max(0,Math.min(ax1,bx1)-Math.max(ax0,bx0)),iy=Math.max(0,Math.min(ay1,by1)-Math.max(ay0,by0)),inter=ix*iy,area=Math.max(1e-12,Math.min((ax1-ax0)*(ay1-ay0),(bx1-bx0)*(by1-by0)));return Math.max(0,Math.min(1,inter/area))}
export function planSarPairR337(master:SarPairProductR337,slave:SarPairProductR337):SarPairPlanR337{
 const reasons:string[]=[],masterTime=Date.parse(master.acquiredAt||''),slaveTime=Date.parse(slave.acquiredAt||''),dt=Number.isFinite(masterTime)&&Number.isFinite(slaveTime)?Math.abs(slaveTime-masterTime)/86400000:null,common=[...new Set(master.polarizations.map(up).filter(Boolean).filter(x=>slave.polarizations.map(up).includes(x)))],sameRelative=finite(master.relativeOrbit)&&finite(slave.relativeOrbit)&&master.relativeOrbit===slave.relativeOrbit,sameDirection=!!up(master.orbitState)&&up(master.orbitState)===up(slave.orbitState),sameMode=!!up(master.instrumentMode)&&up(master.instrumentMode)===up(slave.instrumentMode),ov=overlap(master.bbox,slave.bbox);
 if(master.id===slave.id)reasons.push('DISTINCT_ACQUISITIONS_REQUIRED');
 if(master.collection!=='sentinel-1-slc'||slave.collection!=='sentinel-1-slc')reasons.push('SLC_PAIR_REQUIRED');
 if(!sameMode)reasons.push('COMMON_INSTRUMENT_MODE_REQUIRED');
 if(!sameDirection)reasons.push('COMMON_ORBIT_DIRECTION_REQUIRED');
 if(!sameRelative)reasons.push('COMMON_RELATIVE_ORBIT_REQUIRED');
 if(!common.length)reasons.push('COMMON_POLARIZATION_REQUIRED');
 if(!(dt!=null&&dt>0))reasons.push('NONZERO_TEMPORAL_BASELINE_REQUIRED');
 if(ov!=null&&ov<=0)reasons.push('FOOTPRINT_OVERLAP_REQUIRED');
 const state=reasons.length?'HELD':'COMPATIBLE_METADATA_PAIR';
 return{schema:SAR_PAIR_PLAN_SCHEMA_R337,masterId:master.id,slaveId:slave.id,state,temporalBaselineDays:dt,commonPolarizations:common,sameRelativeOrbit:sameRelative,sameOrbitDirection:sameDirection,sameInstrumentMode:sameMode,footprintOverlap:ov,reasons,next:state==='COMPATIBLE_METADATA_PAIR'?'decode both exact SLC complex assets, bind orbit/burst metadata, then co-register before coherence/interferometry':'resolve the listed metadata incompatibilities before any pair-derived field is admitted',truthBoundary:'R337 metadata compatibility is necessary but not sufficient for interferometry. It never claims co-registration, common burst geometry, precise orbit correction, coherence, interferometric phase, unwrapping, or deformation.'};
}
export function sarPairCandidatesR337(master:SarPairProductR337,products:SarPairProductR337[]){
 return products.filter(x=>x.id!==master.id).map(x=>({product:x,plan:planSarPairR337(master,x)})).sort((a,b)=>{
  if(a.plan.state!==b.plan.state)return a.plan.state==='COMPATIBLE_METADATA_PAIR'?-1:1;
  const ad=a.plan.temporalBaselineDays??Infinity,bd=b.plan.temporalBaselineDays??Infinity;
  return ad-bd;
 });
}
export const R337_PAIR_TESTABLE=Object.freeze({overlap});