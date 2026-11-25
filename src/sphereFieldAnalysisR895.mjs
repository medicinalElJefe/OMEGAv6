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

// R895 pairwise relational analysis: compare the same 20,736 inner coordinates
// across each selected agent. Pearson correlation is a synthetic field statistic,
// not a physical causal relation or a trained model's inference. Zero-variance
// comparisons are undefined (null), never represented as artificial agreement.
export function analyzeCollectiveRelationsR895(fabric,members){
 if(!fabric||!(fabric.active instanceof Map)||!Array.isArray(members)||members.length<1||members.length>R895_FIELD_MAX_AGENTS)
  throw new RangeError('Pairwise field analysis requires 1–12 logical agents');
 const seen=new Set();
 for(const id of members){
  if(!Number.isSafeInteger(id)||id<0||id>=AGENTS||seen.has(id))throw new RangeError('Invalid or duplicate logical agent');
  seen.add(id);
 }
 // Snapshot each logical value once, in member order. Temporary Float64 buffers
 // are bounded to 12 × 20,736 values and never become fabric state.
 const fields=members.map(id=>{
  const values=new Float64Array(SIZE);
  for(let inner=0;inner<SIZE;inner++){
   const value=stateValue(fabric,id,inner);
   if(!Number.isFinite(value)||value<0||value>1)throw new Error('Invalid paired logical state');
   values[inner]=value;
  }
  return values;
 });
 const pairs=[];
 for(let a=0;a<members.length;a++)for(let b=a+1;b<members.length;b++){
  const agentA=members[a],agentB=members[b];
  let meanA=0,meanB=0,m2A=0,m2B=0,cross=0;
  // Bivariate Welford update avoids unstable E[XY]-E[X]E[Y] subtraction.
  for(let inner=0;inner<SIZE;inner++){
   const x=fields[a][inner],y=fields[b][inner];
   const n=inner+1,dx=x-meanA,dy=y-meanB;
   meanA+=dx/n;meanB+=dy/n;
   m2A+=dx*(x-meanA);m2B+=dy*(y-meanB);
   cross+=dx*(y-meanB);
  }
  const varA=Math.max(0,m2A/SIZE),varB=Math.max(0,m2B/SIZE);
  const covariance=cross/SIZE;
  if(!Number.isFinite(varA)||!Number.isFinite(varB)||!Number.isFinite(covariance))throw new Error('Invalid bivariate field accumulator');
  const correlation=varA===0||varB===0?null:Math.max(-1,Math.min(1,covariance/Math.sqrt(varA*varB)));
  if(correlation!==null&&!Number.isFinite(correlation))throw new Error('Invalid paired field correlation');
  pairs.push({agentA,agentB,sharedCoordinates:SIZE,covariance,correlation,varianceA:varA,varianceB:varB,
   undefinedReason:correlation===null?'ZERO_VARIANCE':null});
 }
 return {schema:'OMEGA_SPHERE_FIELD_RELATIONS_R895',evidence:R895_FIELD_EVIDENCE,memberCount:members.length,
  sharedInnerCoordinates:SIZE,pairCount:pairs.length,pairs,canonMutated:false,cloudDispatch:false,
  learnedModel:false,physicalCausalityClaimed:false};
}
