import assert from 'node:assert/strict';
import {piAxisNeighborsR742,piAxisWitnessR742} from '../src/piAtlasTraversalR742.mjs';
import {METRIC_ATLAS_CHANNELS_R743,computeMetricAtlasRouteR743,verifyMetricAtlasRouteR743} from '../src/sourceMetricAtlasRouteR743.mjs';
const COUNT=20736;
const field={count:COUNT};
for(const channel of METRIC_ATLAS_CHANNELS_R743){
 const values=new Float32Array(COUNT);
 for(let i=0;i<COUNT;i++)values[i]=channel==='C'?(i%37)/36:channel==='q'?(i%19)/18:0.5;
 field[channel]=values;
}
for(const [from,to] of [[0,0],[0,1728],[0,20735],[12000,17000],[20735,0],[42,14022],[1234,19012]]){
 for(const channel of ['C','q','Phi']){
  const route=computeMetricAtlasRouteR743(field,from,to,channel);
  assert.equal(route.addresses[0],from);assert.equal(route.addresses.at(-1),to);
  assert.equal(route.steps,route.addresses.length-1);
  assert.equal(route.steps,route.axisMoves.length);
  assert.ok(route.steps>=route.axisLowerBound);
  assert.ok(route.weightedCost>=route.steps);
  let cost=0;
  for(let i=0;i<route.steps;i++){
   const a=route.addresses[i],b=route.addresses[i+1];
   const neighbors=piAxisNeighborsR742(a),j=neighbors.indexOf(b);
   assert.ok(j>=0,'every move must be an actual reversible neighbor');
   assert.deepEqual(route.axisMoves[i],{axis:j>>1,direction:j%2===0?1:-1});
   cost+=1+Math.abs(field[channel][a]-field[channel][b]);
  }
  assert.ok(Math.abs(cost-route.weightedCost)<1e-9,'cost equals actual source-edge sum');
  const axis=piAxisWitnessR742(from,to);
  let axisCost=0;
  for(let i=0;i<axis.steps;i++)axisCost+=1+Math.abs(field[channel][axis.path[i]]-field[channel][axis.path[i+1]]);
  assert.ok(route.weightedCost<=axisCost+1e-9,'optimized route no worse than deterministic R742 route');
  assert.deepEqual(verifyMetricAtlasRouteR743(JSON.stringify(route),field),route);
  assert.throws(()=>verifyMetricAtlasRouteR743(JSON.stringify({...route,weightedCost:route.weightedCost+1}),field),/differs/);
  assert.equal(route.donorWeighted,false);assert.equal(route.physicalMeasurement,false);
 }
}
const flat=computeMetricAtlasRouteR743(field,0,20735,'Phi');
assert.equal(flat.steps,4);assert.equal(flat.weightedCost,4);
assert.throws(()=>computeMetricAtlasRouteR743(field,0,20736),/outside/);
assert.throws(()=>computeMetricAtlasRouteR743(field,0,1,'successorDeltaC'),/unsupported/);
assert.throws(()=>verifyMetricAtlasRouteR743('{broken',field),/invalid JSON/);
assert.throws(()=>verifyMetricAtlasRouteR743('x'.repeat(262145),field),/size refused/);
const damaged={...field,C:new Float32Array(COUNT)};
damaged.C[42]=NaN;
assert.throws(()=>computeMetricAtlasRouteR743(damaged,0,1),/nonfinite/);
const ui=(await import('node:fs')).readFileSync(new URL('../src7/workspaces/RouteBasinInstrumentR732.tsx',import.meta.url),'utf8');
for(const marker of ['data-r743-target','data-r743-channel','data-r743-summary','data-r743-path','data-r743-step','data-r743-export','data-r743-import','data-r743-recovery'])assert.ok(ui.includes(marker),'R743 UI missing '+marker);
console.log('R743 source-metric A* weighted optimal routes, 20,736-address field validation, interactive bindings, export recovery and tamper refusal PASS');
