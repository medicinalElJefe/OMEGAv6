import {restoreComputationalSessionR711,executeComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareCrossFrameInterventionsR718} from './crossFrameDevelopmentalInteractionR718.mjs';

// R720: independently recompute the five-field trajectory of one selected node.
// The four source histories are models, not measurements of physical motion.
const METRICS=Object.freeze(['continuity','burden','scar','contradiction','plasticity']);
const SERIES=Object.freeze(['baseline','first','second','joint','residual']);
const EPS=1e-9;
export function traceCrossFrameTrajectoryR720(sessionJson,selection,{nodeId,metric='continuity'}={}){
 const baseline=restoreComputationalSessionR711(sessionJson);
 const comparison=compareCrossFrameInterventionsR718(baseline.sessionJson,selection);
 if(!METRICS.includes(metric))throw Error('R720 metric must be one of the five R706 model fields');
 const id=nodeId??baseline.sourceScenario.nodes[0]?.id;
 if(typeof id!=='string'||!baseline.sourceScenario.nodes.some(n=>n.id===id))
  throw Error('R720 node must exist in the source scenario');
 const run=(chosen)=>{
  const scenario=JSON.parse(JSON.stringify(baseline.sourceScenario));
  for(const {frameIndex,edgeIndex} of chosen)scenario.edgeFrames[frameIndex][edgeIndex].kind='BLOCKED';
  return executeComputationalSessionR711(scenario,{origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored});
 };
 const first=run([comparison.selected[0]]);
 const second=run([comparison.selected[1]]);
 const joint=run(comparison.selected);
 const histories=[baseline,first,second,joint].map(session=>session.replay.canonicalHistory);
 const stateCount=histories[0].length;
 if(histories.some(history=>history.length!==stateCount)||stateCount!==comparison.timeline.length)
  throw Error('R720 four-way source history length drift');
 const states=Array.from({length:stateCount},(_,stateIndex)=>{
  const values=histories.map(history=>{
   const node=history[stateIndex].find(n=>n.id===id);
   if(!node)throw Error('R720 node identity drift across source histories');
   const value=node[metric];
   if(typeof value!=='number'||!Number.isFinite(value))throw Error('R720 nonfinite source-model state');
   return value;
  });
  const residual=values[3]-values[1]-values[2]+values[0];
  if(!Number.isFinite(residual)||Math.abs(residual)>comparison.timeline[stateIndex].absoluteInteraction+EPS)
   throw Error('R720 residual disagrees with independently computed R718 interaction');
  return {stateIndex,baseline:values[0],first:values[1],second:values[2],joint:values[3],residual};
 });
 const difference=(rows)=>rows.slice(1).map((row,i)=>{
  const prior=rows[i],delta={stateIndex:row.stateIndex};
  for(const key of SERIES)delta[key]=row[key]-prior[key];
  return delta;
 });
 const velocity=difference(states),acceleration=difference(velocity),jerk=difference(acceleration);
 const absoluteResidual=states.reduce((sum,row)=>sum+Math.abs(row.residual),0);
 const peak=states.reduce((winner,row)=>Math.abs(row.residual)>Math.abs(winner.residual)?row:winner,states[0]);
 return {schema:'OMEGA_CROSS_FRAME_TRAJECTORY_R720',
  truthClass:'RECOMPUTED_NODE_METRIC_SOURCE_TRAJECTORY_ONLY',
  selected:comparison.selected.map(({frameIndex,edgeIndex})=>({frameIndex,edgeIndex})),
  origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  nodeId:id,metric,sourceFrameCount:baseline.sourceScenario.edgeFrames.length,
  states,derivatives:{velocity,acceleration,jerk},
  absoluteResidual,peakResidual:{stateIndex:peak.stateIndex,value:peak.residual},
  r718InteractionSamples:comparison.interactionSamples,
  boundary:'Four independent R711 source histories, one source node and one of five R706 model fields. Finite differences are per model state step, not measured time. Residual = joint - first - second + baseline. No empirical causality, historical donor parity, physical dimensions, native host action, CanonState admission or production proof.'};
}
