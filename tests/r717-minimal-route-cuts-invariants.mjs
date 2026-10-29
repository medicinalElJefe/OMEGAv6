import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {analyzeMinimalRouteCutsR717} from '../src/minimalRouteCutsR717.mjs';

const original=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'B',target:'A',mirrored:true});
const first=analyzeMinimalRouteCutsR717(original.sessionJson,{frameIndex:1});
assert.equal(first.schema,'OMEGA_MINIMAL_ROUTE_CUT_ANALYSIS_R717');
assert.equal(first.truthClass,'BOUNDED_EXACT_SOURCE_MODEL_ONLY');
assert.equal(first.evaluatedSingletons,2);
assert.equal(first.evaluatedPairs,0,'single-cut proof prunes unnecessary pairs');
assert.equal(first.frames[1].minimumCutSize,1);
assert.deepEqual(first.frames[1].witnesses.map(w=>w.edgeIndices),[[1]]);
assert.equal(first.frames[1].status,'MINIMUM_CUT_PROVED');
assert.deepEqual(analyzeMinimalRouteCutsR717(original.sessionJson,{frameIndex:1}),first);
assert.equal(original.sourceScenario.edgeFrames[1][1].kind,'RETURN');

const alternate=structuredClone(DEFAULT_SCENARIO_R706);
alternate.nodes.push({id:'C',continuity:0.4,scar:0,contradiction:0,plasticity:1});
alternate.edgeFrames=Array.from({length:3},()=>[
 {from:'A',to:'B',kind:'INGRESS',weight:0.5},
 {from:'A',to:'C',kind:'INGRESS',weight:0.5},
 {from:'C',to:'B',kind:'INGRESS',weight:0.5}
]);
const alt=executeComputationalSessionR711(alternate,{origin:'A',target:'B'});
const joint=analyzeMinimalRouteCutsR717(alt.sessionJson,{frameIndex:0});
assert.equal(joint.evaluatedSingletons,3);
assert.equal(joint.evaluatedPairs,3);
assert.equal(joint.frames[0].minimumCutSize,2);
assert.deepEqual(joint.frames[0].witnesses.map(w=>w.edgeIndices),[[0,1],[0,2]]);
assert.equal(joint.frames[0].witnesses[0].edges[0].from,'A');
assert.equal(joint.frames[0].witnesses[0].edges[1].to,'C');
assert.ok(joint.frames[0].witnesses.every(w=>Number.isFinite(w.peakJerkDelta)));

const blocked=structuredClone(DEFAULT_SCENARIO_R706);
blocked.edgeFrames[0]=blocked.edgeFrames[0].map(e=>({...e,kind:'BLOCKED'}));
const noRoute=executeComputationalSessionR711(blocked,{origin:'B',target:'A'});
const result=analyzeMinimalRouteCutsR717(noRoute.sessionJson,{frameIndex:0});
assert.equal(result.frames[0].status,'BASELINE_UNREACHABLE');
assert.equal(result.frames[0].minimumCutSize,null);
assert.equal(result.evaluatedSingletons,0);

const dense=structuredClone(DEFAULT_SCENARIO_R706);
dense.edgeFrames[0]=Array.from({length:9},()=>({from:'A',to:'B',kind:'INGRESS',weight:0.5}));
const denseSession=executeComputationalSessionR711(dense);
assert.throws(()=>analyzeMinimalRouteCutsR717(denseSession.sessionJson),/R717 refuses more than 8/);
for(const bad of [-1,3,0.5,NaN])assert.throws(()=>analyzeMinimalRouteCutsR717(original.sessionJson,{frameIndex:bad}),/R717/);
assert.throws(()=>analyzeMinimalRouteCutsR717(JSON.stringify({...JSON.parse(original.sessionJson),productionProof:true})),/session envelope/);
const ui=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const token of ['analyzeMinimalRouteCutsR717','data-r717-run','data-r717-result','data-r717-row','data-r717-boundary'])
 assert.ok(ui.includes(token),'missing R717 UI '+token);
console.log('R717 exact bounded minimum route-cut witnesses, singleton pruning and refusal PASS');
