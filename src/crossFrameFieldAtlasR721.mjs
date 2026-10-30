import {restoreComputationalSessionR711,executeComputationalSessionR711} from './computationalSessionR711.mjs';
import {compareCrossFrameInterventionsR718} from './crossFrameDevelopmentalInteractionR718.mjs';

// R721: independently execute four source histories once and expose every
// declared node x field x model-state residual. Never infer physical dimensions.
const FIELDS=Object.freeze(['continuity','burden','scar','contradiction','plasticity']);
const EPS=1e-12;
export function computeCrossFrameFieldAtlasR721(sessionJson,selection){
 const baseline=restoreComputationalSessionR711(sessionJson);
 const witness=compareCrossFrameInterventionsR718(baseline.sessionJson,selection);
 const run=(cuts)=>{
  const scenario=JSON.parse(JSON.stringify(baseline.sourceScenario));
  for(const {frameIndex,edgeIndex} of cuts)scenario.edgeFrames[frameIndex][edgeIndex].kind='BLOCKED';
  return executeComputationalSessionR711(scenario,{
   origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored
  });
 };
 const histories=[baseline,run([witness.selected[0]]),run([witness.selected[1]]),run(witness.selected)]
  .map(session=>session.replay.canonicalHistory);
 const nodeIds=baseline.sourceScenario.nodes.map(node=>node.id);
 const count=histories[0].length;
 if(!count||histories.some(history=>history.length!==count)||witness.timeline.length!==count)
  throw Error('R721 source-history state count drift');
 const accum=new Map();
 for(const id of nodeIds)for(const field of FIELDS)
  accum.set(id+':'+field,{nodeId:id,field,absoluteResidual:0,tailAbsoluteResidual:0,peakResidual:0,peakStateIndex:0});
 let peak=null;
 const states=Array.from({length:count},(_,stateIndex)=>{
  let absoluteInteraction=0,changedNodes=0;
  const cells=[];
  for(let nodeIndex=0;nodeIndex<nodeIds.length;nodeIndex++){
   const nodeId=nodeIds[nodeIndex];
   let changed=false;
   for(const field of FIELDS){
    const values=histories.map(history=>{
     const node=history[stateIndex][nodeIndex];
     if(node?.id!==nodeId)throw Error('R721 source node identity drift');
     const value=node[field];
     if(typeof value!=='number'||!Number.isFinite(value))
      throw Error('R721 nonfinite source model field');
     return value;
    });
    const residual=values[3]-values[1]-values[2]+values[0];
    if(!Number.isFinite(residual))throw Error('R721 nonfinite interaction residual');
    const cell={nodeId,field,baseline:values[0],first:values[1],second:values[2],joint:values[3],residual};
    cells.push(cell);
    const abs=Math.abs(residual),entry=accum.get(nodeId+':'+field);
    entry.absoluteResidual+=abs;
    if(stateIndex>witness.selected[1].frameIndex+1)entry.tailAbsoluteResidual+=abs;
    if(abs>Math.abs(entry.peakResidual)){entry.peakResidual=residual;entry.peakStateIndex=stateIndex;}
    if(!peak||abs>Math.abs(peak.residual))peak={stateIndex,nodeId,field,residual};
    if(abs>EPS){absoluteInteraction+=abs;changed=true;}
   }
   if(changed)changedNodes++;
  }
  if(Math.abs(absoluteInteraction-witness.timeline[stateIndex].absoluteInteraction)>1e-8||
     changedNodes!==witness.timeline[stateIndex].changedNodes)
   throw Error('R721 aggregate disagrees with independent R718 source witness');
  return {stateIndex,cells,absoluteInteraction,changedNodes};
 });
 const ranking=[...accum.values()].sort((a,b)=>b.absoluteResidual-a.absoluteResidual||
  nodeIds.indexOf(a.nodeId)-nodeIds.indexOf(b.nodeId)||FIELDS.indexOf(a.field)-FIELDS.indexOf(b.field));
 const absoluteInteraction=states.reduce((sum,state)=>sum+state.absoluteInteraction,0);
 return {schema:'OMEGA_CROSS_FRAME_FIELD_ATLAS_R721',
  truthClass:'EXHAUSTIVE_DECLARED_SOURCE_NODE_FIELD_STATES_ONLY',
  selected:witness.selected.map(({frameIndex,edgeIndex})=>({frameIndex,edgeIndex})),
  origin:baseline.origin,target:baseline.target,mirrored:baseline.mirrored,
  nodeIds,fields:[...FIELDS],states,ranking,peak,absoluteInteraction,
  stateCount:count,cellCount:nodeIds.length*FIELDS.length*count,
  coverage:'COMPLETE_DECLARED_SOURCE_NODES_FIELDS_STATES_FOR_SELECTED_PAIR',
  boundary:'Four independently executed R711 source histories, all declared nodes, five model fields and all declared states for one selected ascending frame pair. Nonadditive residual = joint - first - second + baseline. Tail is after the second selected frame. No empirical causality, physical dimensions, original historical donor parity, native execution, CanonState admission or production proof.'};
}
