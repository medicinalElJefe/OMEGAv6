import{partitionInteractionCasesR355,R313_WORKLOAD_CENSUS_SOURCE_R355}from'./r313InteractionWorkloadR355.js';

export const R408_PROOF_WORKLOAD_SCHEMA='OMEGA_PROOF_WORKLOAD_SCAR_R408';
export const R408_PROOF_CLASSES=Object.freeze(['disclosure','interaction','no_dead_control']);
export const R408_EWMA_ALPHA=0.35;

export function emptyProofWorkloadScarR408(){
 return{schema:R408_PROOF_WORKLOAD_SCHEMA,version:1,classes:{}};
}
function validClass(proofClass){
 if(!R408_PROOF_CLASSES.includes(proofClass))throw new Error('R408 unsupported proof class '+proofClass);
 return proofClass;
}
function finitePositive(v,fallback){
 const n=Number(v);return Number.isFinite(n)&&n>0?n:fallback;
}
export function normalizeProofWorkloadScarR408(input){
 if(!input||input.schema!==R408_PROOF_WORKLOAD_SCHEMA)return emptyProofWorkloadScarR408();
 const out=emptyProofWorkloadScarR408();
 for(const proofClass of R408_PROOF_CLASSES){
  const src=input.classes?.[proofClass];
  if(!src)continue;
  const history=Array.isArray(src.history)?src.history.filter(x=>Number.isInteger(x?.shardIndex)&&x.shardIndex>=0&&Number.isFinite(Number(x?.observedMs))&&Number(x.observedMs)>0).map(x=>({...x,observedMs:Number(x.observedMs),predictedMs:Number(x.predictedMs)||null})):[],
        ewmaByShard=src.ewmaByShard&&typeof src.ewmaByShard==='object'?{...src.ewmaByShard}:{};
  out.classes[proofClass]={priorSource:src.priorSource||R313_WORKLOAD_CENSUS_SOURCE_R355,history,ewmaByShard};
 }
 return out;
}
export function estimateProofShardsR408({surfaces,shardCount,proofClass,scar}){
 validClass(proofClass);
 const bins=partitionInteractionCasesR355({surfaces,shardCount});
 const state=normalizeProofWorkloadScarR408(scar),cls=state.classes[proofClass]||{ewmaByShard:{}};
 return bins.map(bin=>{
  const key=String(shardCount)+':'+String(bin.index);
  const learned=finitePositive(cls.ewmaByShard?.[key]?.ewmaMs,NaN);
  const predictedMs=Number.isFinite(learned)?Math.max(bin.weight,learned):bin.weight;
  return{index:bin.index,baselineMs:bin.weight,predictedMs,cases:bin.cases};
 }).sort((a,b)=>b.predictedMs-a.predictedMs||a.index-b.index);
}
export function recordProofShardObservationR408({scar,proofClass,shardCount,shardIndex,predictedMs,observedMs,runId,sha,at,success=true}){
 validClass(proofClass);
 const state=normalizeProofWorkloadScarR408(scar);
 const cls=state.classes[proofClass]||{priorSource:R313_WORKLOAD_CENSUS_SOURCE_R355,history:[],ewmaByShard:{}};
 const key=String(shardCount)+':'+String(shardIndex);
 const prev=finitePositive(cls.ewmaByShard?.[key]?.ewmaMs,NaN),obs=finitePositive(observedMs,1);
 const ok=success!==false;
 const ewmaMs=ok?(Number.isFinite(prev)?(1-R408_EWMA_ALPHA)*prev+R408_EWMA_ALPHA*obs:obs):prev;
 const record={proofClass,shardCount,shardIndex,predictedMs:finitePositive(predictedMs,null),observedMs:obs,success:ok,runId:runId||null,sha:sha||null,at:at||new Date().toISOString()};
 cls.history=[...(cls.history||[]),record];
 if(ok)cls.ewmaByShard={...(cls.ewmaByShard||{}),[key]:{ewmaMs,observations:(Number(cls.ewmaByShard?.[key]?.observations)||0)+1,lastObservedMs:obs,lastAt:record.at}};
 state.classes[proofClass]=cls;
 return state;
}
export function auditProofWorkloadScarR408(scar){
 const state=normalizeProofWorkloadScarR408(scar);
 return{schema:'OMEGA_PROOF_WORKLOAD_SCAR_AUDIT_R408',classes:R408_PROOF_CLASSES.map(proofClass=>({proofClass,historyCount:state.classes?.[proofClass]?.history?.length||0,learnedShardCount:Object.keys(state.classes?.[proofClass]?.ewmaByShard||{}).length})),preservesHistory:true,separateClassNamespaces:true};
}
