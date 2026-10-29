import {inspectWovenRouteR708} from './wovenRouteInspectorR708.mjs';

// R710 single-edge failure sensitivity of a *computed* R707 graph. Each trial
// excludes exactly one admissible source edge and reruns the R708 executor.
// These are local counterfactuals, never source frames or production receipts.
export function inspectWovenEdgeResilienceR710(projection,origin,target){
 const baseline=inspectWovenRouteR708(projection,origin,target);
 const admissible=projection.edges.filter(e=>e.kind!=='BLOCKED'&&e.weight>0);
 const baselinePath=baseline.pathEdges.map(e=>e.id).join('|');
 const trials=admissible.map(edge=>{
  const altered={...projection,edges:projection.edges.map(e=>e.id===edge.id?{...e,kind:'BLOCKED',blocked:true}:e)};
  const result=inspectWovenRouteR708(altered,origin,target);
  const pathEdgeIds=result.pathEdges.map(e=>e.id);
  const outcome=!baseline.reachable?'BASELINE_UNREACHABLE':!result.reachable?'PATH_LOST':
   pathEdgeIds.join('|')===baselinePath?'PATH_PRESERVED':'REROUTED';
  return {edgeId:edge.id,from:edge.from,to:edge.to,kind:edge.kind,
   onBaselinePath:baseline.pathEdges.some(e=>e.id===edge.id),
   outcome,reachable:result.reachable,pathNodes:result.pathNodes,pathEdgeIds,
   hops:result.hops,excludedFrontier:result.excludedFrontier};
 });
 const criticalEdgeIds=trials.filter(t=>t.outcome==='PATH_LOST').map(t=>t.edgeId);
 return {schema:'OMEGA_WOVEN_EDGE_RESILIENCE_R710',truthClass:'LOCAL_SINGLE_EDGE_COUNTERFACTUAL_ONLY',
  sourceFrame:projection.frameIndex,origin,target,baselineReachable:baseline.reachable,
  baselinePathNodes:baseline.pathNodes,eligibleEdges:admissible.length,
  criticalEdgeIds,criticalEdgeCount:criticalEdgeIds.length,
  singleEdgeTolerant:baseline.reachable?criticalEdgeIds.length===0:null,trials,
  boundary:'One-at-a-time removal of positive-weight, non-BLOCKED directed graph edges, with R708 recomputation. RESIDUE is eligible carry topology. A critical edge is a structural single-edge cut for this origin/target, not a failure probability or measured transport. Trials are not actual R706 source frames, canonical state, historical AG-009 equations, native-device or production proof.'};
}
