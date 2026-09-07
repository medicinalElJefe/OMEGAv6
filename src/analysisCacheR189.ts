import {corpusState,decodeAddress,encodeAddress} from './corpusRuntime';
import type {Mandala20736Field} from './mandala20736Runtime';
import {INTERFERENCE_CALIBRATION_R184} from './interferenceResolutionR184';

export const ANALYSIS_CACHE_REVISION='R189' as const;
export type AnalysisStateR189={address:number;stateId:number;decision:string;residual:number;continuity:number;plasticity:number;contradiction:number;burden:number;scar:number;evidence:number;motion:number;velocity:number;acceleration:number;phase:number;phasePressure:number};
export type AnalysisRelationR189='ADMITTED_NEXT'|'D+'|'D-'|'P+'|'P-'|'R+'|'R-'|'L+'|'L-';
export type AnalysisCacheR189={
  field:Mandala20736Field;
  state:(address:number)=>AnalysisStateR189;
  neighbors:(address:number)=>Array<[AnalysisRelationR189,number]>;
  structural:(address:number)=>number[];
  stats:()=>{stateHits:number;stateMisses:number;neighborHits:number;neighborMisses:number;cachedStates:number;cachedNeighborhoods:number};
  clear:()=>void;
  boundary:string;
};
const EPS=1e-9,cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0)),signed=(x:number)=>Math.max(-1,Math.min(1,Number.isFinite(x)?x:0));
const wrap=(x:number)=>{const t=Math.PI*2;return((x+Math.PI)%t+t)%t-Math.PI};
export function createAnalysisCacheR189(field:Mandala20736Field):AnalysisCacheR189{
 const stateCache=new Map<number,AnalysisStateR189>(),neighborCache=new Map<number,Array<[AnalysisRelationR189,number]>>();let stateHits=0,stateMisses=0,neighborHits=0,neighborMisses=0;
 const state=(address:number)=>{const a=Math.max(0,Math.min(field.count-1,Math.floor(address))),cached=stateCache.get(a);if(cached){stateHits++;return cached}stateMisses++;const r=corpusState(a),n=field.routeNext[a]??a,w=INTERFERENCE_CALIBRATION_R184,continuity=cl(Number(r.metrics.continuity)),plasticity=cl(Number(r.metrics.plasticity)),contradiction=cl(Number(r.metrics.contradiction)),burden=cl(Number(r.metrics.burden)),scar=cl(Number(r.metrics.scar)),evidence=cl(Number(r.metrics.evidence)),motion=cl(Number(r.math.normalizedMotionRelativity)),velocity=signed(Number(field.velocity[a])),acceleration=signed(Number(field.acceleration[a])),phase=Number(field.phase[a])||0,phasePressure=cl(Math.abs(wrap(Number(field.phase[n])-phase))/Math.PI),pressure=w.burdenPressure*burden+w.contradictionPressure*contradiction+w.scarPressure*scar*(1-continuity)+w.phasePressure*phasePressure+w.accelerationPressure*Math.abs(acceleration),protect=w.continuityProtective*continuity+w.evidenceProtection*evidence,residual=cl(pressure/(pressure+protect+EPS)),row={address:a,stateId:a+1,decision:String(r.metrics.decision),residual,continuity,plasticity,contradiction,burden,scar,evidence,motion,velocity,acceleration,phase,phasePressure};stateCache.set(a,row);return row};
 const neighbors=(address:number)=>{const a=Math.max(0,Math.min(field.count-1,Math.floor(address))),cached=neighborCache.get(a);if(cached){neighborHits++;return cached}neighborMisses++;const c=decodeAddress(a),rows:Array<[AnalysisRelationR189,number]>=[['ADMITTED_NEXT',field.routeNext[a]??a],['D+',encodeAddress((c.d+1)%12,c.p,c.r,c.l)],['D-',encodeAddress((c.d+11)%12,c.p,c.r,c.l)],['P+',encodeAddress(c.d,(c.p+1)%12,c.r,c.l)],['P-',encodeAddress(c.d,(c.p+11)%12,c.r,c.l)],['R+',encodeAddress(c.d,c.p,(c.r+1)%12,c.l)],['R-',encodeAddress(c.d,c.p,(c.r+11)%12,c.l)],['L+',encodeAddress(c.d,c.p,c.r,(c.l+1)%12)],['L-',encodeAddress(c.d,c.p,c.r,(c.l+11)%12)]],seen=new Set<number>(),dedup=rows.filter(([,x])=>x!==a&&!seen.has(x)&&seen.add(x));neighborCache.set(a,dedup);return dedup};
 return{field,state,neighbors,structural:(address:number)=>neighbors(address).filter(([rel])=>rel!=='ADMITTED_NEXT').map(([,a])=>a),stats:()=>({stateHits,stateMisses,neighborHits,neighborMisses,cachedStates:stateCache.size,cachedNeighborhoods:neighborCache.size}),clear:()=>{stateCache.clear();neighborCache.clear();stateHits=stateMisses=neighborHits=neighborMisses=0},boundary:'R189 is an in-memory memoization authority only. It centralizes the exact R184 residual calculation and actual-state neighborhood topology so R184-R188 can share computation without changing any score, route, evidence, CanonState, or execution authority.'}
}
