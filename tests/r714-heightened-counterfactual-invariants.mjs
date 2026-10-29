import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from '../src/computationalSessionComparisonR713.mjs';
import {compareDevelopmentalDerivativesR714} from '../src/developmentalSensitivityR714.mjs';

const baseline=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'A',target:'B'});
const identical=compareComputationalSessionsR713(baseline.sessionJson,baseline.sessionJson).developmentalSensitivity;
assert.equal(identical.schema,'OMEGA_HEIGHTENED_COUNTERFACTUAL_SENSITIVITY_R714');
for(const order of ['velocity','acceleration','jerk'])assert.equal(identical.orders[order].changedSamples,0);
const alteredSource=JSON.parse(JSON.stringify(DEFAULT_SCENARIO_R706));
alteredSource.edgeFrames[1][0].kind='BLOCKED';
const intervention=executeComputationalSessionR711(alteredSource,{origin:'A',target:'B'});
const comparison=compareComputationalSessionsR713(baseline.sessionJson,intervention.sessionJson);
const result=comparison.developmentalSensitivity;
assert.deepEqual(['velocity','acceleration','jerk'].map(order=>result.orders[order].sampleCount),[3,2,1]);
assert.ok(result.orders.velocity.changedSamples>0,'source intervention must change actual developmental velocity');
assert.ok(result.orders.jerk.changedSamples>0,'source intervention must propagate into actual jerk');
const step=baseline.sourceScenario.step;
const left=baseline.replay.canonicalHistory,right=intervention.replay.canonicalHistory;
const stateDelta=(index,nodeIndex,metric)=>right[index][nodeIndex][metric]-left[index][nodeIndex][metric];
for(const [sampleIndex,sample] of result.orders.velocity.samples.entries()){
 for(const node of sample.changedNodes){
  const nodeIndex=left[0].findIndex(n=>n.id===node.id);
  for(const metric of ['continuity','burden','scar','contradiction','plasticity']){
   const expected=(stateDelta(sampleIndex+1,nodeIndex,metric)-stateDelta(sampleIndex,nodeIndex,metric))/step;
   assert.ok(Math.abs(node.delta[metric]-expected)<1e-9,'velocity must derive from canonical states: '+metric);
  }
 }
}
const drift=structuredClone(baseline.replay.developmental);
drift.velocity[0][0].id='FORGED';
assert.throws(()=>compareDevelopmentalDerivativesR714(baseline.replay.developmental,drift),/identity drift/);
const nonfinite=structuredClone(baseline.replay.developmental);
nonfinite.jerk[0][0].continuity=NaN;
assert.throws(()=>compareDevelopmentalDerivativesR714(baseline.replay.developmental,nonfinite),/nonfinite/);
const ui=readFileSync(new URL('../src7/SessionCounterfactualR713.tsx',import.meta.url),'utf8');
for(const marker of ['data-r714-derivatives','data-r714-order','data-r714-witnesses','data-r714-boundary','developmentalSensitivity'])assert.ok(ui.includes(marker),marker);
console.log('R714 recomputed Heightened derivative counterfactual invariants PASS');
