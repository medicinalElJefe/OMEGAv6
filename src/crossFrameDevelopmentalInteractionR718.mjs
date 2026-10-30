import {restoreComputationalSessionR711,executeComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from './computationalSessionComparisonR713.mjs';

// R718: two interventions in different source frames, with temporal state carry.
// This is a model-only four-way replay, not an empirical intervention forecast.
const METRICS=['continuity','burden','scar','contradiction','plasticity'];
const EPS=1e-12;
export function compareCrossFrameInterventionsR718(sessionJson,{firstFrameIndex=0,firstEdgeIndex=0,secondFrameIndex=1,secondEdgeIndex=0}={}){
 const baseline=restoreComputationalSessionR711(sessionJson);
 const scenario=baseline.sourceScenario;
 const validIndex=(n,max)=>Number.isSafeInteger(n)&&n>=0&&n<max;
 if(!validIndex(firstFrameIndex,scenario.edgeFrames.length)||
    !validIndex(secondFrameIndex,scenario.edgeFrames.length)||
    firstFrameIndex>=secondFrameIndex)
  throw Error('R718 requires two distinct source frames in ascending temporal order');
 for(const [frame,index] of [[firstFrameIndex,firstEdgeIndex],[secondFrameIndex,secondEdgeIndex]]){
  if(!validIndex(index,scenario.edgeFrames[frame].length))
   throw Error('R718 edge index outside selected source frame');
  const edge=scenario.edgeFrames[frame][index];
  if(edge.kind==='BLOCKED'||edge.weight<=0)
   throw Error('R718 requires eligible nonblocked positive-weight source edges');
 }
 const selected=[{frameIndex:firstFrameIndex,edgeIndex:firstEdgeIndex},
                 {frameIndex:secondFrameIndex,edgeIndex:secondEdgeIndex}].map(({frameIndex,edgeIndex})=>({
  frameIndex,edgeIndex,...scenario.edgeFrames[frameIndex][edgeIndex]
 }));
 const run=choices=>{
  const source=JSON.parse(JSON.stringify(scenario));
  for(const {frameIndex,edgeIndex} of choices)source.edgeFrames[frameIndex][edgeIndex].kind='BLOCKED';
  return executeComputationalSessionR711(source,{origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored});
 };
 const first=run([selected[0]]),second=run([selected[1]]),joint=run(selected);
 const firstComparison=compareComputationalSessionsR713(baseline.sessionJson,first.sessionJson);
 const secondComparison=compareComputationalSessionsR713(baseline.sessionJson,second.sessionJson);
 const jointComparison=compareComputationalSessionsR713(baseline.sessionJson,joint.sessionJson);
 let peakInteraction=null,interactionSamples=0,tailChangedStates=0;
 const timeline=baseline.replay.canonicalHistory.map((nodes,stateIndex)=>{
  const a=first.replay.canonicalHistory[stateIndex],b=second.replay.canonicalHistory[stateIndex];
  const both=joint.replay.canonicalHistory[stateIndex];
  let changedNodes=0,absoluteInteraction=0;
  for(let i=0;i<nodes.length;i++){
   const id=nodes[i].id;
   if(a[i]?.id!==id||b[i]?.id!==id||both[i]?.id!==id)
    throw Error('R718 replay node identity drift');
   let nodeChanged=false;
   for(const field of METRICS){
    const residual=both[i][field]-a[i][field]-b[i][field]+nodes[i][field];
    if(!Number.isFinite(residual))throw Error('R718 nonfinite developmental interaction');
    if(Math.abs(residual)>EPS){
     nodeChanged=true;interactionSamples++;absoluteInteraction+=Math.abs(residual);
     if(!peakInteraction||Math.abs(residual)>peakInteraction.absoluteResidual)
      peakInteraction={stateIndex,nodeId:id,field,residual,absoluteResidual:Math.abs(residual)};
    }
   }
   if(nodeChanged)changedNodes++;
  }
  const jointChangedNodes=jointComparison.states[stateIndex].changedNodes.length;
  if(stateIndex>secondFrameIndex+1&&jointChangedNodes)tailChangedStates++;
  return {stateIndex,changedNodes,jointChangedNodes,absoluteInteraction};
 });
 const routeFrames=baseline.continuity.frames.map((frame,frameIndex)=>({
  frameIndex,baselineReachable:frame.reachable,
  firstReachable:first.continuity.frames[frameIndex].reachable,
  secondReachable:second.continuity.frames[frameIndex].reachable,
  jointReachable:joint.continuity.frames[frameIndex].reachable,
  jointPathNodes:joint.continuity.frames[frameIndex].pathNodes
 }));
 const jointOnlyRouteLossFrames=routeFrames.filter(r=>r.baselineReachable&&r.firstReachable&&r.secondReachable&&!r.jointReachable).map(r=>r.frameIndex);
 return {
  schema:'OMEGA_CROSS_FRAME_DEVELOPMENTAL_INTERACTION_R718',
  truthClass:'RECOMPUTED_TEMPORAL_SOURCE_MODEL_ONLY',
  origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  selected,firstChangedState:firstComparison.firstStateDivergence,
  secondChangedState:secondComparison.firstStateDivergence,
  jointChangedState:jointComparison.firstStateDivergence,
  jointChangedNodeStates:jointComparison.changedNodeStates,
  jointChangedRouteFrames:jointComparison.changedRouteFrames,
  jointOnlyRouteLossFrames,interactionSamples,peakInteraction,
  tailChangedStates,timeline,routeFrames,
  peakJointJerkDelta:jointComparison.developmentalSensitivity.orders.jerk.peak?.absoluteDelta??0,
  coverage:'EXACT_SELECTED_CROSS_FRAME_PAIR_ONLY',
  boundary:'Four R711 source-model histories are independently recomputed with the same initial state, kernel, endpoints and observer. Interaction = joint - first - second + baseline. Tail carry is counted after the second intervention frame, not measured time. This is not exhaustive cross-frame search, empirical causation, historical equation parity, physical dimensionality, CanonState admission, native device execution or production proof.'
 };
}
