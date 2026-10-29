import {restoreComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareDevelopmentalDerivativesR714} from './developmentalSensitivityR714.mjs';

// Compare two independently recomputed R711 source sessions. No imported outputs
// or external authority claims are trusted, and the initial state is held fixed.
const METRICS=['continuity','burden','scar','contradiction','plasticity'];
export function compareComputationalSessionsR713(baselineJson,interventionJson){
 const baseline=restoreComputationalSessionR711(baselineJson);
 const intervention=restoreComputationalSessionR711(interventionJson);
 const a=baseline.sourceScenario,b=intervention.sourceScenario;
 if(JSON.stringify(a.nodes)!==JSON.stringify(b.nodes)||a.step!==b.step||a.mode!==b.mode||a.alpha!==b.alpha||a.edgeFrames.length!==b.edgeFrames.length)
  throw Error('R713 initial state, kernel parameters and frame count must match');
 if(baseline.origin!==intervention.origin||baseline.target!==intervention.target||baseline.mirrored!==intervention.mirrored)
  throw Error('R713 route endpoints and observer frame must match');
 const changedSourceFrames=a.edgeFrames.flatMap((edges,i)=>JSON.stringify(edges)===JSON.stringify(b.edgeFrames[i])?[]:[i]);
 const states=baseline.replay.canonicalHistory.map((nodes,index)=>{
  const changed=[];
  for(let i=0;i<nodes.length;i++){
   const left=nodes[i],right=intervention.replay.canonicalHistory[index][i];
   if(left.id!==right.id)throw Error('R713 replay identity drift');
   const delta=Object.fromEntries(METRICS.map(metric=>[metric,(right[metric]??0)-(left[metric]??0)]));
   if(Object.values(delta).some(x=>Math.abs(x)>1e-12))changed.push({id:left.id,delta});
  }
  return {stateIndex:index,changedNodes:changed};
 });
 const routes=baseline.continuity.frames.map((left,index)=>{
  const right=intervention.continuity.frames[index];
  return {frameIndex:index,baselineReachable:left.reachable,interventionReachable:right.reachable,
   reachabilityChanged:left.reachable!==right.reachable,
   baselinePath:left.pathNodes,interventionPath:right.pathNodes,
   pathChanged:JSON.stringify(left.pathNodes)!==JSON.stringify(right.pathNodes)};
 });
 return {schema:'OMEGA_COMPUTATIONAL_SESSION_COMPARISON_R713',truthClass:'LOCAL_RECOMPUTED_COUNTERFACTUAL_ONLY',
  origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  sourceFrameCount:a.edgeFrames.length,changedSourceFrames,states,routes,
  developmentalSensitivity:compareDevelopmentalDerivativesR714(baseline.replay.developmental,intervention.replay.developmental),
  changedNodeStates:states.reduce((sum,row)=>sum+row.changedNodes.length,0),
  changedRouteFrames:routes.filter(row=>row.reachabilityChanged||row.pathChanged).length,
  firstStateDivergence:states.find(row=>row.changedNodes.length)?.stateIndex??null,
  firstRouteDivergence:routes.find(row=>row.reachabilityChanged||row.pathChanged)?.frameIndex??null,
  boundary:'Both source inputs independently recomputed through R711/R706/R623/R651/R653/R709. Comparison is a bounded local counterfactual, not empirical causation, canonical admission, historical AG-009 parity, native execution or production proof.'};
}
