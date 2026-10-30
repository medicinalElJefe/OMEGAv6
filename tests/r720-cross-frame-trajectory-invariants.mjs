import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareCrossFrameInterventionsR718} from '../src/crossFrameDevelopmentalInteractionR718.mjs';
import {traceCrossFrameTrajectoryR720} from '../src/crossFrameTrajectoryR720.mjs';

const original=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'B',target:'A',mirrored:true});
const input=original.sessionJson;
const selection={firstFrameIndex:0,firstEdgeIndex:0,secondFrameIndex:1,secondEdgeIndex:0};
const r718=compareCrossFrameInterventionsR718(input,selection);
const fields=['continuity','burden','scar','contradiction','plasticity'];
const keys=['baseline','first','second','joint','residual'];
const independent=(cuts)=>{
 const scenario=structuredClone(original.sourceScenario);
 for(const [frame,edge] of cuts)scenario.edgeFrames[frame][edge].kind='BLOCKED';
 return executeComputationalSessionR711(scenario,{origin:'B',target:'A',mirrored:true});
};
const sessions=[original,independent([[0,0]]),independent([[1,0]]),independent([[0,0],[1,0]])];
for(const node of original.sourceScenario.nodes)for(const metric of fields){
 const result=traceCrossFrameTrajectoryR720(input,selection,{nodeId:node.id,metric});
 assert.equal(result.schema,'OMEGA_CROSS_FRAME_TRAJECTORY_R720');
 assert.equal(result.truthClass,'RECOMPUTED_NODE_METRIC_SOURCE_TRAJECTORY_ONLY');
 assert.equal(result.nodeId,node.id);
 assert.equal(result.metric,metric);
 assert.deepEqual(result.selected,[{frameIndex:0,edgeIndex:0},{frameIndex:1,edgeIndex:0}]);
 assert.equal(result.states.length,original.replay.canonicalHistory.length);
 assert.equal(result.r718InteractionSamples,r718.interactionSamples);
 for(const row of result.states){
  const expected=sessions.map(session=>session.replay.canonicalHistory[row.stateIndex].find(n=>n.id===node.id)[metric]);
  for(const [i,key] of keys.slice(0,4).entries())assert.equal(row[key],expected[i]);
  assert.ok(Math.abs(row.residual-(expected[3]-expected[1]-expected[2]+expected[0]))<1e-12);
  assert.ok(Math.abs(row.residual)<=r718.timeline[row.stateIndex].absoluteInteraction+1e-9);
 }
 let prior=result.states;
 for(const order of ['velocity','acceleration','jerk']){
  const current=result.derivatives[order];
  assert.equal(current.length,Math.max(0,prior.length-1));
  for(let i=0;i<current.length;i++)for(const key of keys)
   assert.ok(Math.abs(current[i][key]-(prior[i+1][key]-prior[i][key]))<1e-12);
  prior=current;
 }
 assert.ok(Math.abs(result.absoluteResidual-result.states.reduce((sum,row)=>sum+Math.abs(row.residual),0))<1e-12);
 assert.ok(result.boundary.includes('not measured time'));
}
assert.deepEqual(traceCrossFrameTrajectoryR720(input,selection),traceCrossFrameTrajectoryR720(input,selection));
assert.equal(original.sessionJson,input,'source session must remain unchanged');
for(const options of [{nodeId:'MISSING'},{metric:'gravity'},{metric:'__proto__'}])
 assert.throws(()=>traceCrossFrameTrajectoryR720(input,selection,options),/R720/);
assert.throws(()=>traceCrossFrameTrajectoryR720(input,{...selection,secondFrameIndex:0}),/R718/);
const blocked=structuredClone(DEFAULT_SCENARIO_R706);
blocked.edgeFrames[0][0].kind='BLOCKED';
assert.throws(()=>traceCrossFrameTrajectoryR720(executeComputationalSessionR711(blocked).sessionJson,selection),/R718/);
const ui=readFileSync(new URL('../src7/CrossFrameTrajectoryR720.tsx',import.meta.url),'utf8');
const parent=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const token of ['traceCrossFrameTrajectoryR720','data-r720-run','data-r720-history','data-r720-curve','data-r720-residual','data-r720-state','data-r720-save','data-r720-restore','data-r720-boundary'])
 assert.ok(ui.includes(token),'R720 missing executable UI '+token);
assert.ok(parent.includes('<CrossFrameTrajectoryR720 baselineSession={baselineSession}'),'R720 not mounted in R719/R718 session');
console.log('R720 independent four-way node/metric replay, residuals, finite differences, refusal and UI wiring PASS');
