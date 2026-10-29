import {restoreComputationalSessionR711,executeComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from './computationalSessionComparisonR713.mjs';

// Exhaustive within the declared page, never an empirical forecast or canonical writer.
// The edge index is the source edge position, not a rendered geometry coordinate.
export function enumerateInterventionFrontierR715(sessionJson,{frameIndex=0,offset=0,limit=8}={}){
 const baseline=restoreComputationalSessionR711(sessionJson);
 const scenario=baseline.sourceScenario;
 if(!Number.isSafeInteger(frameIndex)||frameIndex<0||frameIndex>=scenario.edgeFrames.length)
  throw Error('R715 frame index outside source history');
 if(!Number.isSafeInteger(offset)||offset<0)throw Error('R715 invalid nonnegative offset');
 if(!Number.isSafeInteger(limit)||limit<1||limit>12)throw Error('R715 page limit must be 1..12');
 const eligible=scenario.edgeFrames[frameIndex]
  .map((edge,edgeIndex)=>({edge,edgeIndex}))
  .filter(({edge})=>edge.kind!=='BLOCKED'&&edge.weight>0);
 if(offset>eligible.length)throw Error('R715 offset exceeds eligible edge count');
 const selected=eligible.slice(offset,offset+limit);
 const candidates=selected.map(({edge,edgeIndex})=>{
  const source=JSON.parse(JSON.stringify(scenario));
  source.edgeFrames[frameIndex][edgeIndex].kind='BLOCKED';
  const intervention=executeComputationalSessionR711(source,{origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored});
  const comparison=compareComputationalSessionsR713(baseline.sessionJson,intervention.sessionJson);
  const routeLossFrames=comparison.routes.filter(r=>r.baselineReachable&&!r.interventionReachable).length;
  const peakByOrder=Object.fromEntries(['velocity','acceleration','jerk'].map(order=>[
   order,comparison.developmentalSensitivity.orders[order].peak?.absoluteDelta??0
  ]));
  return {edgeIndex,from:edge.from,to:edge.to,kind:edge.kind,weight:edge.weight,
   changedNodeStates:comparison.changedNodeStates,changedRouteFrames:comparison.changedRouteFrames,
   routeLossFrames,firstStateDivergence:comparison.firstStateDivergence,
   firstRouteDivergence:comparison.firstRouteDivergence,peakByOrder,
   gate:routeLossFrames>0?'MODEL_ROUTE_LOSS':comparison.changedNodeStates>0?'MODEL_STATE_SENSITIVITY':'NO_OBSERVED_MODEL_STATE_CHANGE'};
 });
 const ranking=[...candidates].sort((a,b)=>b.routeLossFrames-a.routeLossFrames||
  b.changedRouteFrames-a.changedRouteFrames||b.changedNodeStates-a.changedNodeStates||
  b.peakByOrder.jerk-a.peakByOrder.jerk||a.edgeIndex-b.edgeIndex);
 return {schema:'OMEGA_BOUNDED_INTERVENTION_FRONTIER_R715',truthClass:'LOCAL_ENUMERATED_MODEL_INTERVENTIONS_ONLY',
  frameIndex,origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  totalEligible:eligible.length,offset,limit,evaluated:candidates.length,
  hasMore:offset+candidates.length<eligible.length,
  coverage:offset===0&&candidates.length===eligible.length?'COMPLETE_DECLARED_FRAME':'PARTIAL_DECLARED_FRAME',
  candidates,ranking,
  boundary:'Each eligible source edge in this page is blocked separately, then both R711 histories and R713/R714 comparisons are recomputed. Ranking is model sensitivity only; partial pages are not complete coverage. No empirical prediction, causation, historical AG-009 parity, physical dimensionality, native execution or canonical admission is implied.'};
}
