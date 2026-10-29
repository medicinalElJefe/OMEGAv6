import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from '../src/computationalSessionComparisonR713.mjs';
import {enumerateInterventionFrontierR715} from '../src/interventionFrontierR715.mjs';

const baseline=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'A',target:'B',mirrored:true});
const input=baseline.sessionJson;
const full=enumerateInterventionFrontierR715(input,{frameIndex:1});
assert.equal(full.schema,'OMEGA_BOUNDED_INTERVENTION_FRONTIER_R715');
assert.equal(full.truthClass,'LOCAL_ENUMERATED_MODEL_INTERVENTIONS_ONLY');
assert.equal(full.coverage,'COMPLETE_DECLARED_FRAME');
assert.equal(full.totalEligible,2);
assert.equal(full.evaluated,2);
assert.deepEqual(full.candidates.map(x=>x.edgeIndex),[0,1]);
assert.equal(full.hasMore,false);
assert.equal(full.candidates[0].gate,'MODEL_ROUTE_LOSS');
assert.ok(full.candidates[0].changedNodeStates>0);
assert.ok(full.candidates[0].peakByOrder.jerk>0);
for(const candidate of full.candidates){
 const altered=structuredClone(DEFAULT_SCENARIO_R706);
 altered.edgeFrames[1][candidate.edgeIndex].kind='BLOCKED';
 const changed=executeComputationalSessionR711(altered,{origin:'A',target:'B',mirrored:true});
 const manual=compareComputationalSessionsR713(input,changed.sessionJson);
 assert.equal(candidate.changedNodeStates,manual.changedNodeStates);
 assert.equal(candidate.changedRouteFrames,manual.changedRouteFrames);
 assert.equal(candidate.routeLossFrames,manual.routes.filter(x=>x.baselineReachable&&!x.interventionReachable).length);
 assert.equal(candidate.peakByOrder.jerk,manual.developmentalSensitivity.orders.jerk.peak?.absoluteDelta??0);
}
const reverseSession=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'B',target:'A',mirrored:true});
const reverse=enumerateInterventionFrontierR715(reverseSession.sessionJson,{frameIndex:1});
assert.equal(reverse.candidates[0].routeLossFrames,0,'A to B INGRESS cut cannot sever reverse B to A path');
assert.ok(reverse.candidates[0].changedNodeStates>0,'forward ingress cut still affects modeled development');
assert.equal(reverse.candidates[0].gate,'MODEL_STATE_SENSITIVITY');
assert.ok(reverse.candidates[1].routeLossFrames>0,'B to A RETURN cut severs reverse path');
assert.equal(reverse.candidates[1].gate,'MODEL_ROUTE_LOSS');
const first=enumerateInterventionFrontierR715(input,{frameIndex:1,limit:1,offset:0});
const second=enumerateInterventionFrontierR715(input,{frameIndex:1,limit:1,offset:1});
assert.equal(first.coverage,'PARTIAL_DECLARED_FRAME');
assert.equal(first.hasMore,true);
assert.equal(second.hasMore,false);
assert.deepEqual([...first.candidates,...second.candidates],full.candidates);
assert.deepEqual(enumerateInterventionFrontierR715(input,{frameIndex:1}),full);
const blocked=structuredClone(DEFAULT_SCENARIO_R706);
blocked.edgeFrames[1][0].kind='BLOCKED';
blocked.edgeFrames[1][1].weight=0;
const empty=executeComputationalSessionR711(blocked);
assert.equal(enumerateInterventionFrontierR715(empty.sessionJson,{frameIndex:1}).totalEligible,0);
assert.equal(enumerateInterventionFrontierR715(empty.sessionJson,{frameIndex:1}).coverage,'COMPLETE_DECLARED_FRAME');
for(const bad of [{frameIndex:-1},{frameIndex:3},{frameIndex:1.2},{offset:-1},{offset:3},{limit:0},{limit:13},{limit:1.5}])
 assert.throws(()=>enumerateInterventionFrontierR715(input,bad),/R715/);
assert.throws(()=>enumerateInterventionFrontierR715(JSON.stringify({...JSON.parse(input),authority:'PRODUCTION'})),/session envelope/);
assert.equal(baseline.sourceScenario.edgeFrames[1][0].kind,'INGRESS','frontier must not mutate baseline');
const alternate=structuredClone(DEFAULT_SCENARIO_R706);
alternate.nodes.push({id:'C',continuity:0.3,scar:0,contradiction:0,plasticity:1});
alternate.edgeFrames=Array.from({length:3},()=>[
 {from:'A',to:'B',kind:'INGRESS',weight:0.5},
 {from:'A',to:'C',kind:'INGRESS',weight:0.5},
 {from:'C',to:'B',kind:'INGRESS',weight:0.5}
]);
const alternateSession=executeComputationalSessionR711(alternate,{origin:'A',target:'B'});
const rerouted=enumerateInterventionFrontierR715(alternateSession.sessionJson,{frameIndex:0});
assert.equal(rerouted.candidates[0].routeLossFrames,0);
assert.ok(rerouted.candidates[0].changedRouteFrames>0);
assert.equal(rerouted.candidates[0].gate,'MODEL_ROUTE_CHANGE');
const many=structuredClone(DEFAULT_SCENARIO_R706);
many.edgeFrames=Array.from({length:3},()=>Array.from({length:9},()=>({from:'A',to:'B',kind:'INGRESS',weight:0.1})));
const manySession=executeComputationalSessionR711(many);
const pageA=enumerateInterventionFrontierR715(manySession.sessionJson,{frameIndex:0,limit:8});
const pageB=enumerateInterventionFrontierR715(manySession.sessionJson,{frameIndex:0,offset:8,limit:8});
assert.equal(pageA.coverage,'PARTIAL_DECLARED_FRAME');
assert.equal(pageA.hasMore,true);
assert.equal(pageB.hasMore,false);
assert.deepEqual([...pageA.candidates,...pageB.candidates].map(x=>x.edgeIndex),Array.from({length:9},(_,i)=>i));
const ui=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const token of ['enumerateInterventionFrontierR715','data-r715-run','data-r715-coverage','data-r715-edge-row','data-r715-boundary','data-r715-error'])
 assert.ok(ui.includes(token),token);
console.log('R715 enumerated source intervention frontier and source UI wiring PASS');
