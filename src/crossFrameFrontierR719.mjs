import {restoreComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareCrossFrameInterventionsR718} from './crossFrameDevelopmentalInteractionR718.mjs';

// R719: deterministic bounded discovery of actual R718 cross-frame interventions.
// A page is evaluated, not the entire universe unless coverage explicitly says so.
const MAX_PAIRS=256;
const MAX_PAGE=4;
export function enumerateCrossFrameFrontierR719(sessionJson,{offset=0,limit=4}={}){
 if(!Number.isSafeInteger(offset)||offset<0)throw Error('R719 offset must be a nonnegative safe integer');
 if(!Number.isSafeInteger(limit)||limit<1||limit>MAX_PAGE)throw Error('R719 page limit must be 1..4');
 const baseline=restoreComputationalSessionR711(sessionJson);
 const frames=baseline.sourceScenario.edgeFrames;
 const eligible=frames.map(edges=>edges.map((edge,index)=>({edge,index}))
  .filter(({edge})=>edge.kind!=='BLOCKED'&&edge.weight>0));
 const pairs=[];
 let framePairCount=0;
 for(let firstFrameIndex=0;firstFrameIndex<eligible.length;firstFrameIndex++)
  for(let secondFrameIndex=firstFrameIndex+1;secondFrameIndex<eligible.length;secondFrameIndex++){
   if(!eligible[firstFrameIndex].length||!eligible[secondFrameIndex].length)continue;
   framePairCount++;
   for(const a of eligible[firstFrameIndex])for(const b of eligible[secondFrameIndex]){
    if(pairs.length>=MAX_PAIRS)throw Error('R719 more than 256 eligible cross-frame pairs; narrow the source scenario before analysis');
    pairs.push({firstFrameIndex,firstEdgeIndex:a.index,secondFrameIndex,secondEdgeIndex:b.index});
   }
  }
 if(offset>pairs.length)throw Error('R719 offset exceeds eligible cross-frame pair count');
 const candidates=pairs.slice(offset,offset+limit).map((selection,i)=>{
  const proof=compareCrossFrameInterventionsR718(baseline.sessionJson,selection);
  const routeLossFrames=proof.routeFrames.filter(r=>r.baselineReachable&&!r.jointReachable).map(r=>r.frameIndex);
  const gate=proof.jointOnlyRouteLossFrames.length?'JOINT_ONLY_ROUTE_LOSS':
   routeLossFrames.length?'MODEL_ROUTE_LOSS':
   proof.jointChangedRouteFrames?'MODEL_ROUTE_CHANGE':
   proof.interactionSamples?'NONADDITIVE_MODEL_STATE':
   proof.jointChangedNodeStates?'MODEL_STATE_CHANGE':'NO_OBSERVED_MODEL_CHANGE';
  return {ordinal:offset+i,selection,edges:proof.selected.map(e=>({
   frameIndex:e.frameIndex,edgeIndex:e.edgeIndex,from:e.from,to:e.to,kind:e.kind,weight:e.weight
  })),gate,changedNodeStates:proof.jointChangedNodeStates,
   changedRouteFrames:proof.jointChangedRouteFrames,
   interactionSamples:proof.interactionSamples,
   peakInteraction:proof.peakInteraction,
   tailChangedStates:proof.tailChangedStates,
   routeLossFrames,jointOnlyRouteLossFrames:proof.jointOnlyRouteLossFrames,
   peakJointJerkDelta:proof.peakJointJerkDelta};
 });
 return {schema:'OMEGA_BOUNDED_CROSS_FRAME_FRONTIER_R719',
  truthClass:'PAGED_RECOMPUTED_CROSS_FRAME_SOURCE_MODEL_ONLY',
  origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  sourceFrameCount:frames.length,eligibleFramePairs:framePairCount,
  totalEligiblePairs:pairs.length,offset,limit,evaluated:candidates.length,
  hasMore:offset+candidates.length<pairs.length,
  coverage:offset===0&&candidates.length===pairs.length?
   'COMPLETE_SOURCE_CROSS_FRAME_PAIRS':'PARTIAL_SOURCE_CROSS_FRAME_PAIRS',
  candidates,
  boundary:'Each returned pair is independently recomputed through R718 four-way source-model replay. Total eligible pairs counts only ascending distinct-frame positive-weight unblocked source edges. Pagination is not exhaustive proof until all pairs are evaluated; no claim of global optimality, empirical causation, physical dimensionality, original historical parity, native execution, CanonState admission or production proof.'};
}
