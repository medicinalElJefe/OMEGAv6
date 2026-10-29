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
const metrics=['continuity','burden','scar','contradiction','plasticity'];
const initialDeltas=left.map((frame,index)=>frame.map((node,nodeIndex)=>({id:node.id,...Object.fromEntries(metrics.map(metric=>[metric,right[index][nodeIndex][metric]-node[metric]]))})));
const differentiate=frames=>frames.slice(1).map((frame,index)=>frame.map((node,nodeIndex)=>({id:node.id,...Object.fromEntries(metrics.map(metric=>[metric,(node[metric]-frames[index][nodeIndex][metric])/step]))})));
let reference=initialDeltas;
for(const order of ['velocity','acceleration','jerk']){
 reference=differentiate(reference);
 assert.equal(reference.length,result.orders[order].sampleCount,'derivative order length '+order);
 for(const sample of result.orders[order].samples){
  const expected=reference[sample.sampleIndex];
  const actual=new Map(sample.changedNodes.map(node=>[node.id,node.delta]));
  for(const node of expected){
   for(const metric of metrics){
    const observed=actual.get(node.id)?.[metric]??0;
    assert.ok(Math.abs(observed-node[metric])<1e-9,order+' must derive from canonical state: '+node.id+'/'+metric);
   }
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
