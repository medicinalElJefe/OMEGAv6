import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareCrossFrameInterventionsR718} from '../src/crossFrameDevelopmentalInteractionR718.mjs';

const base=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'B',target:'A',mirrored:true});
const before=base.sessionJson;
const result=compareCrossFrameInterventionsR718(before,{firstFrameIndex:0,firstEdgeIndex:0,secondFrameIndex:1,secondEdgeIndex:0});
assert.equal(result.schema,'OMEGA_CROSS_FRAME_DEVELOPMENTAL_INTERACTION_R718');
assert.equal(result.truthClass,'RECOMPUTED_TEMPORAL_SOURCE_MODEL_ONLY');
assert.deepEqual(result.selected.map(x=>[x.frameIndex,x.edgeIndex]),[[0,0],[1,0]]);
assert.equal(result.timeline.length,4);
assert.equal(result.routeFrames.length,3);
assert.ok(result.jointChangedNodeStates>0,'two source-frame INGRESS cuts must alter model state');
assert.ok(result.timeline.every(row=>Number.isFinite(row.absoluteInteraction)));
assert.ok(result.peakJointJerkDelta>=0);
assert.equal(base.sessionJson,before,'analysis cannot mutate original session');
assert.deepEqual(compareCrossFrameInterventionsR718(before,{firstFrameIndex:0,secondFrameIndex:1}),result);

const cut=indices=>{
 const scenario=structuredClone(DEFAULT_SCENARIO_R706);
 for(const frame of indices)scenario.edgeFrames[frame][0].kind='BLOCKED';
 return executeComputationalSessionR711(scenario,{origin:'B',target:'A',mirrored:true});
};
const a=cut([0]),b=cut([1]),both=cut([0,1]);
const expected=both.replay.canonicalHistory.map((nodes,t)=>nodes.map((node,i)=>
 node.continuity-a.replay.canonicalHistory[t][i].continuity-
 b.replay.canonicalHistory[t][i].continuity+
 base.replay.canonicalHistory[t][i].continuity));
assert.ok(expected.every((row,t)=>row.every(v=>Number.isFinite(v))));
if(result.peakInteraction){
 const {stateIndex,nodeId,field,residual}=result.peakInteraction;
 const index=base.replay.canonicalHistory[stateIndex].findIndex(n=>n.id===nodeId);
 const manual=both.replay.canonicalHistory[stateIndex][index][field]-
 a.replay.canonicalHistory[stateIndex][index][field]-
 b.replay.canonicalHistory[stateIndex][index][field]+
 base.replay.canonicalHistory[stateIndex][index][field];
 assert.ok(Math.abs(residual-manual)<1e-12,'peak witness must match independent four-way arithmetic');
}
assert.ok(result.boundary.includes('not exhaustive cross-frame search'));
for(const args of [
 {firstFrameIndex:1,secondFrameIndex:1},
 {firstFrameIndex:2,secondFrameIndex:1},
 {firstFrameIndex:-1,secondFrameIndex:1},
 {firstFrameIndex:0,secondFrameIndex:3},
 {firstFrameIndex:0.5,secondFrameIndex:1},
 {firstFrameIndex:0,firstEdgeIndex:99,secondFrameIndex:1},
 {firstFrameIndex:0,secondFrameIndex:1,secondEdgeIndex:NaN}
])assert.throws(()=>compareCrossFrameInterventionsR718(before,args),/R718/);
const blocked=structuredClone(DEFAULT_SCENARIO_R706);
blocked.edgeFrames[0][0].kind='BLOCKED';
assert.throws(()=>compareCrossFrameInterventionsR718(executeComputationalSessionR711(blocked).sessionJson),/eligible/);
// Source indices are not eligible-list ordinals: blocked #0 must not cause
// the UI to submit #0 while visually displaying the eligible #1 option.
const alternate=compareCrossFrameInterventionsR718(executeComputationalSessionR711(blocked).sessionJson,{firstFrameIndex:0,firstEdgeIndex:1,secondFrameIndex:1,secondEdgeIndex:0});
assert.equal(alternate.selected[0].edgeIndex,1);
assert.equal(alternate.selected[0].kind,'RETURN');
assert.throws(()=>compareCrossFrameInterventionsR718(JSON.stringify({...JSON.parse(before),productionProof:true})),/session envelope/);
const ui=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const token of ['compareCrossFrameInterventionsR718','selectedFirstEdge','selectedSecondEdge','data-r718-run','data-r718-result','data-r718-timeline','data-r718-boundary'])
 assert.ok(ui.includes(token),'R718 UI missing '+token);
// React's selected value and the executed frame must share one state source.
// A source-session change resets state through the session-dependent effect.
for(const selector of ['first','second']){
 const tag=ui.split('data-r718-'+selector+'-frame ')[1]?.split('</select>')[0];
 assert.ok(tag,'R718 '+selector+' frame selector missing');
 assert.ok(tag.includes('value={'+selector+'Frame}'),'R718 '+selector+' must be React-controlled');
 assert.ok(!tag.includes('defaultValue='),'R718 '+selector+' must not use a conflicting native default');
 assert.ok(!tag.includes('key={baselineSession.sessionJson}'),'R718 '+selector+' must not remount per session-string recomputation');
 assert.ok(tag.includes('onChange={e=>choose'+(selector==='first'?'First':'Second')+'Frame'),'R718 frame change handler missing');
 assert.ok(!tag.includes('onInput='),'R718 must not double-handle native frame changes');
 assert.ok(tag.includes('data-r718-'+selector+'-frame-state'),'R718 '+selector+' frame state witness missing');
}
console.log('R718 independent cross-frame temporal carry and nonadditive model interaction PASS');
