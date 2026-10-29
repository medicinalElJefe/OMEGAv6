import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from '../src/computationalSessionComparisonR713.mjs';
import {enumerateJointInterventionsR716} from '../src/jointInterventionCompositionR716.mjs';

const baseline=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'A',target:'B',mirrored:true});
const input=baseline.sessionJson;
const result=enumerateJointInterventionsR716(input,{frameIndex:1});
assert.equal(result.schema,'OMEGA_JOINT_INTERVENTION_COMPOSITION_R716');
assert.equal(result.truthClass,'LOCAL_RECOMPUTED_PAIR_INTERVENTIONS_ONLY');
assert.equal(result.totalEligibleEdges,2);
assert.equal(result.totalEligiblePairs,1);
assert.equal(result.coverage,'COMPLETE_DECLARED_FRAME_PAIRS');
assert.equal(result.evaluated,1);
assert.equal(result.hasMore,false);
assert.deepEqual(result.candidates[0].edgeIndices,[0,1]);
const cut=indices=>{
 const scenario=structuredClone(DEFAULT_SCENARIO_R706);
 for(const index of indices)scenario.edgeFrames[1][index].kind='BLOCKED';
 return executeComputationalSessionR711(scenario,{origin:'A',target:'B',mirrored:true});
};
const singleA=cut([0]),singleB=cut([1]),both=cut([0,1]);
const comparison=compareComputationalSessionsR713(input,both.sessionJson);
const candidate=result.candidates[0];
assert.equal(candidate.changedNodeStates,comparison.changedNodeStates);
assert.equal(candidate.changedRouteFrames,comparison.changedRouteFrames);
assert.equal(candidate.peakJerk,comparison.developmentalSensitivity.orders.jerk.peak?.absoluteDelta??0);
assert.equal(candidate.routeLossFrames,comparison.routes.filter(r=>r.baselineReachable&&!r.interventionReachable).length);
const fields=['continuity','burden','scar','contradiction','plasticity'];
let manualPeak=0,manualCount=0;
for(let t=0;t<baseline.replay.canonicalHistory.length;t++)
 for(let n=0;n<baseline.replay.canonicalHistory[t].length;n++)
  for(const field of fields){
   const residual=both.replay.canonicalHistory[t][n][field]-
    singleA.replay.canonicalHistory[t][n][field]-
    singleB.replay.canonicalHistory[t][n][field]+
    baseline.replay.canonicalHistory[t][n][field];
   if(Math.abs(residual)>1e-12){manualCount++;manualPeak=Math.max(manualPeak,Math.abs(residual));}
  }
assert.equal(candidate.changedInteractionSamples,manualCount);
assert.equal(candidate.peakStateInteraction?.absoluteResidual??0,manualPeak);
assert.deepEqual(enumerateJointInterventionsR716(input,{frameIndex:1}),result);
assert.equal(baseline.sourceScenario.edgeFrames[1][0].kind,'INGRESS','joint cuts must not mutate source');

const alternate=structuredClone(DEFAULT_SCENARIO_R706);
alternate.nodes.push({id:'C',continuity:0.4,scar:0,contradiction:0,plasticity:1});
alternate.edgeFrames=Array.from({length:3},()=>[
 {from:'A',to:'B',kind:'INGRESS',weight:0.5},
 {from:'A',to:'C',kind:'INGRESS',weight:0.5},
 {from:'C',to:'B',kind:'INGRESS',weight:0.5}
]);
const alt=executeComputationalSessionR711(alternate,{origin:'A',target:'B'});
const first=enumerateJointInterventionsR716(alt.sessionJson,{frameIndex:0,limit:1});
assert.equal(first.totalEligiblePairs,3);
assert.equal(first.coverage,'PARTIAL_DECLARED_FRAME_PAIRS');
assert.equal(first.hasMore,true);
assert.deepEqual(first.candidates[0].edgeIndices,[0,1]);
assert.deepEqual(first.candidates[0].singleRouteLossFrames,[0,0]);
assert.deepEqual(first.candidates[0].jointOnlyLossFrames,[0]);
assert.equal(first.candidates[0].gate,'JOINT_ONLY_ROUTE_LOSS');
const second=enumerateJointInterventionsR716(alt.sessionJson,{frameIndex:0,offset:1,limit:2});
assert.equal(second.hasMore,false);
assert.deepEqual([...first.candidates,...second.candidates],enumerateJointInterventionsR716(alt.sessionJson,{frameIndex:0,limit:3}).candidates);
const empty=structuredClone(DEFAULT_SCENARIO_R706);
empty.edgeFrames[0][0].kind='BLOCKED';
empty.edgeFrames[0][1].kind='BLOCKED';
const emptySession=executeComputationalSessionR711(empty);
const none=enumerateJointInterventionsR716(emptySession.sessionJson);
assert.equal(none.totalEligiblePairs,0);
assert.equal(none.coverage,'COMPLETE_DECLARED_FRAME_PAIRS');
for(const bad of [{frameIndex:-1},{frameIndex:3},{frameIndex:1.5},{offset:-1},{offset:2},{limit:0},{limit:7},{limit:1.5}])
 assert.throws(()=>enumerateJointInterventionsR716(input,bad),/R716/);
assert.throws(()=>enumerateJointInterventionsR716(JSON.stringify({...JSON.parse(input),productionProof:true})),/session envelope/);
const ui=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const token of ['enumerateJointInterventionsR716','data-r716-run','data-r716-coverage','data-r716-row','data-r716-gate','data-r716-boundary'])
 assert.ok(ui.includes(token),'missing R716 UI '+token);
console.log('R716 joint intervention composition, route redundancy and residual witnesses PASS');
