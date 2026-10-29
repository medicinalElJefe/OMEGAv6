import {restoreComputationalSessionR711,executeComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from './computationalSessionComparisonR713.mjs';

// R716: bounded joint edge interventions on a single declared source frame.
// Independent recomputation; no empirical causality or CanonState mutation.
const FIELDS=['continuity','burden','scar','contradiction','plasticity'];
const EPS=1e-12;
export function enumerateJointInterventionsR716(sessionJson,{frameIndex=0,offset=0,limit=6}={}){
 const baseline=restoreComputationalSessionR711(sessionJson);
 const scenario=baseline.sourceScenario;
 if(!Number.isSafeInteger(frameIndex)||frameIndex<0||frameIndex>=scenario.edgeFrames.length)
  throw Error('R716 frame index outside source history');
 if(!Number.isSafeInteger(offset)||offset<0)throw Error('R716 invalid nonnegative offset');
 if(!Number.isSafeInteger(limit)||limit<1||limit>6)throw Error('R716 page limit must be 1..6');
 const eligible=scenario.edgeFrames[frameIndex]
  .map((edge,index)=>({edge,index})).filter(({edge})=>edge.kind!=='BLOCKED'&&edge.weight>0);
 const pairs=[];
 for(let i=0;i<eligible.length;i++)for(let j=i+1;j<eligible.length;j++)
  pairs.push([eligible[i],eligible[j]]);
 if(offset>pairs.length)throw Error('R716 offset exceeds eligible pair count');
 const selected=pairs.slice(offset,offset+limit);
 const singleCache=new Map();
 function executeCuts(indices){
  const source=JSON.parse(JSON.stringify(scenario));
  for(const index of indices)source.edgeFrames[frameIndex][index].kind='BLOCKED';
  return executeComputationalSessionR711(source,{origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored});
 }
 function single(index){
  if(!singleCache.has(index))singleCache.set(index,executeCuts([index]));
  return singleCache.get(index);
 }
 const candidates=selected.map(([a,b])=>{
  const left=single(a.index),right=single(b.index),joint=executeCuts([a.index,b.index]);
  const leftComparison=compareComputationalSessionsR713(baseline.sessionJson,left.sessionJson);
  const rightComparison=compareComputationalSessionsR713(baseline.sessionJson,right.sessionJson);
  const jointComparison=compareComputationalSessionsR713(baseline.sessionJson,joint.sessionJson);
  const jointOnlyLossFrames=[];
  let routeLossFrames=0;
  for(let k=0;k<baseline.continuity.frames.length;k++){
   const base=baseline.continuity.frames[k].reachable;
   const l=left.continuity.frames[k].reachable,r=right.continuity.frames[k].reachable;
   const both=joint.continuity.frames[k].reachable;
   if(base&&!both)routeLossFrames++;
   if(base&&l&&r&&!both)jointOnlyLossFrames.push(k);
  }
  let peakStateInteraction=null,changedInteractionSamples=0;
  for(let t=0;t<baseline.replay.canonicalHistory.length;t++){
   const baseNodes=baseline.replay.canonicalHistory[t],aNodes=left.replay.canonicalHistory[t];
   const bNodes=right.replay.canonicalHistory[t],jointNodes=joint.replay.canonicalHistory[t];
   for(let n=0;n<baseNodes.length;n++){
    const id=baseNodes[n].id;
    if(aNodes[n].id!==id||bNodes[n].id!==id||jointNodes[n].id!==id)
     throw Error('R716 source replay node identity drift');
    for(const field of FIELDS){
     const residual=jointNodes[n][field]-aNodes[n][field]-bNodes[n][field]+baseNodes[n][field];
     if(!Number.isFinite(residual))throw Error('R716 nonfinite model interaction');
     if(Math.abs(residual)>EPS){
      changedInteractionSamples++;
      if(!peakStateInteraction||Math.abs(residual)>peakStateInteraction.absoluteResidual)
       peakStateInteraction={stateIndex:t,nodeId:id,field,residual,absoluteResidual:Math.abs(residual)};
     }
    }
   }
  }
  const peakJerk=jointComparison.developmentalSensitivity.orders.jerk.peak?.absoluteDelta??0;
  const gate=jointOnlyLossFrames.length?'JOINT_ONLY_ROUTE_LOSS':
   routeLossFrames?'MODEL_ROUTE_LOSS':
   jointComparison.changedRouteFrames?'MODEL_ROUTE_CHANGE':
   peakStateInteraction?'NONADDITIVE_MODEL_STATE':
   jointComparison.changedNodeStates?'MODEL_STATE_CHANGE':'NO_OBSERVED_MODEL_CHANGE';
  return {edgeIndices:[a.index,b.index],edges:[a.edge,b.edge].map((edge,i)=>({
   index:i===0?a.index:b.index,from:edge.from,to:edge.to,kind:edge.kind,weight:edge.weight
  })),gate,routeLossFrames,jointOnlyLossFrames,
   singleRouteLossFrames:[leftComparison,rightComparison].map(c=>c.routes.filter(r=>r.baselineReachable&&!r.interventionReachable).length),
   changedRouteFrames:jointComparison.changedRouteFrames,changedNodeStates:jointComparison.changedNodeStates,
   changedInteractionSamples,peakStateInteraction,peakJerk};
 });
 return {schema:'OMEGA_JOINT_INTERVENTION_COMPOSITION_R716',truthClass:'LOCAL_RECOMPUTED_PAIR_INTERVENTIONS_ONLY',
  frameIndex,origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  totalEligibleEdges:eligible.length,totalEligiblePairs:pairs.length,offset,limit,evaluated:candidates.length,
  hasMore:offset+candidates.length<pairs.length,
  coverage:offset===0&&candidates.length===pairs.length?'COMPLETE_DECLARED_FRAME_PAIRS':'PARTIAL_DECLARED_FRAME_PAIRS',
  candidates,boundary:'Joint source-edge cuts and both single-edge cuts are independently recomputed through R711/R713/R714. Residual = joint - single A - single B + baseline for model state fields. Joint-only route loss is a graph property, not empirical causation, a physical dimension, historical equation parity, canonical admission, native execution or production proof.'};
}
