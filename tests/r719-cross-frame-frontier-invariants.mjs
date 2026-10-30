import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareCrossFrameInterventionsR718} from '../src/crossFrameDevelopmentalInteractionR718.mjs';
import {enumerateCrossFrameFrontierR719} from '../src/crossFrameFrontierR719.mjs';

const original=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'B',target:'A',mirrored:true});
const input=original.sessionJson;
const first=enumerateCrossFrameFrontierR719(input);
assert.equal(first.schema,'OMEGA_BOUNDED_CROSS_FRAME_FRONTIER_R719');
assert.equal(first.truthClass,'PAGED_RECOMPUTED_CROSS_FRAME_SOURCE_MODEL_ONLY');
assert.equal(first.sourceFrameCount,3);
assert.equal(first.eligibleFramePairs,3);
assert.equal(first.totalEligiblePairs,12);
assert.equal(first.evaluated,4);
assert.equal(first.hasMore,true);
assert.equal(first.coverage,'PARTIAL_SOURCE_CROSS_FRAME_PAIRS');
assert.deepEqual(first.candidates.map(x=>x.selection),[
 {firstFrameIndex:0,firstEdgeIndex:0,secondFrameIndex:1,secondEdgeIndex:0},
 {firstFrameIndex:0,firstEdgeIndex:0,secondFrameIndex:1,secondEdgeIndex:1},
 {firstFrameIndex:0,firstEdgeIndex:1,secondFrameIndex:1,secondEdgeIndex:0},
 {firstFrameIndex:0,firstEdgeIndex:1,secondFrameIndex:1,secondEdgeIndex:1}
]);
const all=[first,...[4,8].map(offset=>enumerateCrossFrameFrontierR719(input,{offset}))];
assert.deepEqual(all.map(p=>p.evaluated),[4,4,4]);
assert.equal(all[2].hasMore,false);
assert.equal(new Set(all.flatMap(p=>p.candidates.map(x=>JSON.stringify(x.selection)))).size,12);
assert.deepEqual(all[2].candidates.at(-1).selection,
 {firstFrameIndex:1,firstEdgeIndex:1,secondFrameIndex:2,secondEdgeIndex:1});
for(const page of all)for(const candidate of page.candidates){
 const exact=compareCrossFrameInterventionsR718(input,candidate.selection);
 assert.deepEqual(candidate.edges.map(e=>[e.frameIndex,e.edgeIndex]),exact.selected.map(e=>[e.frameIndex,e.edgeIndex]));
 assert.equal(candidate.changedNodeStates,exact.jointChangedNodeStates);
 assert.equal(candidate.changedRouteFrames,exact.jointChangedRouteFrames);
 assert.equal(candidate.interactionSamples,exact.interactionSamples);
 assert.deepEqual(candidate.peakInteraction,exact.peakInteraction);
 assert.equal(candidate.tailChangedStates,exact.tailChangedStates);
 assert.deepEqual(candidate.routeLossFrames,exact.routeFrames.filter(r=>r.baselineReachable&&!r.jointReachable).map(r=>r.frameIndex));
 assert.deepEqual(candidate.jointOnlyRouteLossFrames,exact.jointOnlyRouteLossFrames);
 assert.equal(candidate.peakJointJerkDelta,exact.peakJointJerkDelta);
 assert.ok(['JOINT_ONLY_ROUTE_LOSS','MODEL_ROUTE_LOSS','MODEL_ROUTE_CHANGE','NONADDITIVE_MODEL_STATE','MODEL_STATE_CHANGE','NO_OBSERVED_MODEL_CHANGE'].includes(candidate.gate));
}
assert.deepEqual(enumerateCrossFrameFrontierR719(input),first);
assert.equal(original.sessionJson,input,'frontier must not mutate source session');
const blocked=structuredClone(DEFAULT_SCENARIO_R706);
blocked.edgeFrames[0][0].kind='BLOCKED';
const b=enumerateCrossFrameFrontierR719(executeComputationalSessionR711(blocked).sessionJson);
assert.equal(b.totalEligiblePairs,8);
assert.equal(b.candidates[0].selection.firstEdgeIndex,1,'source edge index, not filtered ordinal');
const onlyOne=structuredClone(DEFAULT_SCENARIO_R706);
onlyOne.edgeFrames[0][1].kind='BLOCKED';
onlyOne.edgeFrames[1][1].kind='BLOCKED';
onlyOne.edgeFrames[2].forEach(e=>e.kind='BLOCKED');
const one=enumerateCrossFrameFrontierR719(executeComputationalSessionR711(onlyOne).sessionJson);
assert.equal(one.totalEligiblePairs,1);
assert.equal(one.coverage,'COMPLETE_SOURCE_CROSS_FRAME_PAIRS');
assert.equal(one.hasMore,false);
const empty=structuredClone(DEFAULT_SCENARIO_R706);
empty.edgeFrames.forEach(frame=>frame.forEach(e=>e.kind='BLOCKED'));
const none=enumerateCrossFrameFrontierR719(executeComputationalSessionR711(empty).sessionJson);
assert.equal(none.totalEligiblePairs,0);
assert.equal(none.coverage,'COMPLETE_SOURCE_CROSS_FRAME_PAIRS');
assert.equal(none.evaluated,0);
for(const args of [{offset:-1},{offset:13},{offset:0.5},{limit:0},{limit:5},{limit:1.2}])
 assert.throws(()=>enumerateCrossFrameFrontierR719(input,args),/R719/);
assert.throws(()=>enumerateCrossFrameFrontierR719(JSON.stringify({...JSON.parse(input),productionProof:true})),/session envelope/);
assert.ok(first.boundary.includes('not exhaustive proof'));
const ui=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const token of ['enumerateCrossFrameFrontierR719','data-r719-run','data-r719-result','data-r719-row','data-r719-next','data-r719-inspect','data-r719-boundary'])
 assert.ok(ui.includes(token),'R719 missing usable UI '+token);
console.log('R719 bounded cross-frame frontier, pagination, source indices, independent R718 witnesses and refusal PASS');
