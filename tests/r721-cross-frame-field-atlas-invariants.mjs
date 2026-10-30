import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareCrossFrameInterventionsR718} from '../src/crossFrameDevelopmentalInteractionR718.mjs';
import {traceCrossFrameTrajectoryR720} from '../src/crossFrameTrajectoryR720.mjs';
import {computeCrossFrameFieldAtlasR721} from '../src/crossFrameFieldAtlasR721.mjs';

const original=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'B',target:'A',mirrored:true});
const selection={firstFrameIndex:0,firstEdgeIndex:0,secondFrameIndex:1,secondEdgeIndex:0};
const input=original.sessionJson;
const proof=compareCrossFrameInterventionsR718(input,selection);
const atlas=computeCrossFrameFieldAtlasR721(input,selection);
const fields=['continuity','burden','scar','contradiction','plasticity'];
assert.equal(atlas.schema,'OMEGA_CROSS_FRAME_FIELD_ATLAS_R721');
assert.equal(atlas.truthClass,'EXHAUSTIVE_DECLARED_SOURCE_NODE_FIELD_STATES_ONLY');
assert.equal(atlas.coverage,'COMPLETE_DECLARED_SOURCE_NODES_FIELDS_STATES_FOR_SELECTED_PAIR');
assert.deepEqual(atlas.nodeIds,['A','B']);
assert.deepEqual(atlas.fields,fields);
assert.equal(atlas.stateCount,original.replay.canonicalHistory.length);
assert.equal(atlas.cellCount,atlas.nodeIds.length*fields.length*atlas.stateCount);
const independentlyCut=(cuts)=>{
 const scenario=structuredClone(original.sourceScenario);
 for(const [frame,edge] of cuts)scenario.edgeFrames[frame][edge].kind='BLOCKED';
 return executeComputationalSessionR711(scenario,{origin:'B',target:'A',mirrored:true});
};
const histories=[original,independentlyCut([[0,0]]),independentlyCut([[1,0]]),independentlyCut([[0,0],[1,0]])]
 .map(session=>session.replay.canonicalHistory);
for(const state of atlas.states){
 assert.equal(state.cells.length,atlas.nodeIds.length*fields.length);
 let sum=0,changedNodes=new Set();
 for(const cell of state.cells){
  const expected=histories.map(history=>history[state.stateIndex].find(n=>n.id===cell.nodeId)[cell.field]);
  for(const [index,key] of ['baseline','first','second','joint'].entries())
   assert.equal(cell[key],expected[index]);
  const residual=expected[3]-expected[1]-expected[2]+expected[0];
  assert.ok(Math.abs(cell.residual-residual)<1e-12);
  if(Math.abs(residual)>1e-12){sum+=Math.abs(residual);changedNodes.add(cell.nodeId);}
 }
 assert.ok(Math.abs(sum-state.absoluteInteraction)<1e-9);
 assert.equal(state.changedNodes,changedNodes.size);
 assert.ok(Math.abs(state.absoluteInteraction-proof.timeline[state.stateIndex].absoluteInteraction)<1e-8);
 assert.equal(state.changedNodes,proof.timeline[state.stateIndex].changedNodes);
}
for(const entry of atlas.ranking){
 const cells=atlas.states.map(state=>state.cells.find(cell=>cell.nodeId===entry.nodeId&&cell.field===entry.field));
 assert.ok(Math.abs(entry.absoluteResidual-cells.reduce((n,cell)=>n+Math.abs(cell.residual),0))<1e-9);
 assert.ok(Math.abs(entry.tailAbsoluteResidual-cells.slice(selection.secondFrameIndex+2).reduce((n,cell)=>n+Math.abs(cell.residual),0))<1e-9);
 const trace=traceCrossFrameTrajectoryR720(input,selection,{nodeId:entry.nodeId,metric:entry.field});
 assert.deepEqual(cells.map(cell=>cell.residual),trace.states.map(state=>state.residual));
}
assert.deepEqual(computeCrossFrameFieldAtlasR721(input,selection),atlas);
assert.equal(original.sessionJson,input,'atlas may not mutate source session');
assert.ok(atlas.boundary.includes('No empirical causality'));
assert.ok(atlas.boundary.includes('physical dimensions'));
assert.throws(()=>computeCrossFrameFieldAtlasR721(input,{...selection,secondFrameIndex:0}),/R718/);
const blocked=structuredClone(DEFAULT_SCENARIO_R706);
blocked.edgeFrames[0][0].kind='BLOCKED';
assert.throws(()=>computeCrossFrameFieldAtlasR721(executeComputationalSessionR711(blocked).sessionJson,selection),/R718/);
assert.throws(()=>computeCrossFrameFieldAtlasR721(JSON.stringify({...JSON.parse(input),authority:'FORGED'}),selection),/R711/);
const ui=readFileSync(new URL('../src7/CrossFrameFieldAtlasR721.tsx',import.meta.url),'utf8');
const parent=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const token of ['computeCrossFrameFieldAtlasR721','data-r721-run','data-r721-matrix','data-r721-cell','data-r721-state-index','data-r721-detail','data-r721-save','data-r721-restore','data-r721-boundary'])
 assert.ok(ui.includes(token),'R721 missing source-backed UI '+token);
assert.ok(parent.includes('<CrossFrameFieldAtlasR721 baselineSession={baselineSession}'),'R721 not mounted in OMEGA 7 session');
console.log('R721 independently recomputed full node-field-state atlas, R718/R720 parity, source refusals and UI integration PASS');
