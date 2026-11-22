// R895 read-only complete-inner field analytics.
// Evaluates every requested logical value without materializing unmodified
// agent arrays, dispatching cloud missions, or mutating the Canon/state fabric.
import {AGENTS,SIZE,stateValue,nestedId} from './sphereAgentFabricR887.mjs';
export const R895_FIELD_MAX_AGENTS=12;
export const R895_FIELD_EVIDENCE='INTERNALLY_TESTED_SYNTHETIC_LOGICAL_MODEL';

function accumulator(){
 return {count:0,mean:0,m2:0,min:Infinity,max:-Infinity,minAddress:null,maxAddress:null};
}
function append(a,v,address){
 if(!Number.isFinite(v)||v<0||v>1)throw new Error('Invalid logical state during analysis');
 ++a.count;
 const delta=v-a.mean;
 a.mean+=delta/a.count;
 a.m2+=delta*(v-a.mean);
 if(v<a.min){a.min=v;a.minAddress=address}
 if(v>a.max){a.max=v;a.maxAddress=address}
}
function finish(a){
 return {count:a.count,mean:a.mean,variance:a.m2/a.count,stdDev:Math.sqrt(Math.max(0,a.m2/a.count)),
  min:a.min,max:a.max,minAddress:a.minAddress,maxAddress:a.maxAddress};
}
export function analyzeCollectiveFieldR895(fabric,members){
 if(!fabric||!(fabric.active instanceof Map)||!Array.isArray(members)||members.length<1||members.length>R895_FIELD_MAX_AGENTS)
  throw new RangeError('Full-field analysis requires 1–12 distinct logical agents');
 const seen=new Set();
 for(const id of members){
  if(!Number.isSafeInteger(id)||id<0||id>=AGENTS||seen.has(id))throw new RangeError('Invalid or duplicate logical agent');
  seen.add(id);
 }
 const global=accumulator(),agents=[];
 for(const id of members){
  const local=accumulator();
  for(let inner=0;inner<SIZE;inner++){
   const value=stateValue(fabric,id,inner),address=nestedId(id,inner);
   append(local,value,address);
   append(global,value,address);
  }
  agents.push({agent:id,...finish(local)});
 }
 return {schema:'OMEGA_SPHERE_FIELD_ANALYSIS_R895',evidence:R895_FIELD_EVIDENCE,
  memberCount:members.length,innerValuesPerAgent:SIZE,modifiedValues:members.reduce((s,id)=>s+(fabric.active.get(id)?.values.size||0),0),
  ...finish(global),agents,canonMutated:false,cloudDispatch:false,fullScan:true};
}
