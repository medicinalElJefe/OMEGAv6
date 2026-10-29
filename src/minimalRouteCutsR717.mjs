import {restoreComputationalSessionR711,executeComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from './computationalSessionComparisonR713.mjs';

// R717: exact, bounded minimum route-cut cardinality within one declared source frame.
// Cut membership is frame-specific. A two-edge proof is not a claim about larger cuts.
const MAX_EDGES=8;
export function analyzeMinimalRouteCutsR717(sessionJson,{frameIndex=0}={}){
 const baseline=restoreComputationalSessionR711(sessionJson);
 const scenario=baseline.sourceScenario;
 if(!Number.isSafeInteger(frameIndex)||frameIndex<0||frameIndex>=scenario.edgeFrames.length)
  throw Error('R717 frame index outside source history');
 const eligible=scenario.edgeFrames[frameIndex].map((edge,index)=>({edge,index}))
  .filter(({edge})=>edge.kind!=='BLOCKED'&&edge.weight>0);
 if(eligible.length>MAX_EDGES)throw Error('R717 refuses more than 8 eligible edges; exhaustive two-edge proof not computed');
 const original=baseline.continuity.frames.map(frame=>frame.reachable);
 const singles=new Map(),pairs=new Map();
 const executeCuts=indices=>{
  const altered=JSON.parse(JSON.stringify(scenario));
  for(const index of indices)altered.edgeFrames[frameIndex][index].kind='BLOCKED';
  const session=executeComputationalSessionR711(altered,{origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored});
  for(let t=0;t<original.length;t++)if(t!==frameIndex&&session.continuity.frames[t].reachable!==original[t])
   throw Error('R717 nonselected frame route changed; cut proof refused');
  return session;
 };
 for(const {index} of eligible)singles.set(index,executeCuts([index]));
 const needsPairs=original[frameIndex]&&
  ![...singles.values()].some(session=>!session.continuity.frames[frameIndex].reachable);
 if(needsPairs)for(let i=0;i<eligible.length;i++)for(let j=i+1;j<eligible.length;j++){
  const indices=[eligible[i].index,eligible[j].index];
  pairs.set(indices.join(','),executeCuts(indices));
 }
 const edgeWitness=index=>{
  const edge=scenario.edgeFrames[frameIndex][index];
  return {index,from:edge.from,to:edge.to,kind:edge.kind,weight:edge.weight};
 };
 const witness=(indices,session)=>{
  const comparison=compareComputationalSessionsR713(baseline.sessionJson,session.sessionJson);
  return {edgeIndices:indices,edges:indices.map(edgeWitness),
   changedNodeStates:comparison.changedNodeStates,
   peakJerkDelta:comparison.developmentalSensitivity.orders.jerk.peak?.absoluteDelta??0};
 };
 const frames=original.map((reachable,t)=>{
  if(t!==frameIndex)return {frameIndex:t,baselineReachable:reachable,minimumCutSize:null,
   status:'OUTSIDE_SELECTED_SOURCE_FRAME',witnesses:[]};
  if(!reachable)return {frameIndex:t,baselineReachable:false,minimumCutSize:null,
   status:'BASELINE_UNREACHABLE',witnesses:[]};
  const singleCuts=[...singles].filter(([,session])=>!session.continuity.frames[t].reachable);
  if(singleCuts.length)return {frameIndex:t,baselineReachable:true,minimumCutSize:1,
   status:'MINIMUM_CUT_PROVED',witnesses:singleCuts.map(([index,session])=>witness([index],session))};
  const pairCuts=[...pairs].filter(([,session])=>!session.continuity.frames[t].reachable);
  if(pairCuts.length)return {frameIndex:t,baselineReachable:true,minimumCutSize:2,
   status:'MINIMUM_CUT_PROVED',witnesses:pairCuts.map(([key,session])=>witness(key.split(',').map(Number),session))};
  return {frameIndex:t,baselineReachable:true,minimumCutSize:null,
   status:'NO_CUT_OF_SIZE_ONE_OR_TWO',witnesses:[]};
 });
 return {schema:'OMEGA_MINIMAL_ROUTE_CUT_ANALYSIS_R717',truthClass:'BOUNDED_EXACT_SOURCE_MODEL_ONLY',
  frameIndex,origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  eligibleEdges:eligible.map(({index})=>edgeWitness(index)),maxEligibleEdges:MAX_EDGES,
  evaluatedSingletons:singles.size,evaluatedPairs:pairs.size,
  totalPossiblePairs:eligible.length*(eligible.length-1)/2,
  coverage:'EXACT_MINIMUM_UP_TO_TWO_WITH_PROVEN_SINGLETON_PRUNING',
  frames,boundary:'Only source-frame cuts of size one or two are considered; other frames are reported out of scope. A minimum is proven for each reachable baseline frame when found; no cut up to two does not prove resilience against larger cuts. All routes and developmental witnesses are independently recomputed from R711/R713/R714. No empirical causal claim, original historical equation parity, native execution, physical dimensionality or CanonState admission.'};
}
