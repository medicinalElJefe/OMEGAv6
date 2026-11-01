import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodePiAddressR742,encodePiAddressR742,piAxisNeighborsR742,piAtlasPositionR742,piAxisWitnessR742,verifyPiAxisWitnessR742} from '../src/piAtlasTraversalR742.mjs';
for(let i=0;i<20736;i++){
 assert.equal(encodePiAddressR742(decodePiAddressR742(i)),i);
 const neighbors=piAxisNeighborsR742(i);
 assert.equal(neighbors.length,8);
 for(let axis=0;axis<4;axis++){
  assert.equal(piAxisNeighborsR742(neighbors[axis*2])[axis*2+1],i);
  assert.equal(piAxisNeighborsR742(neighbors[axis*2+1])[axis*2],i);
 }
}
for(const [a,b] of [[0,20735],[12000,17000],[0,0],[20735,0]]){
 const w=piAxisWitnessR742(a,b);
 assert.equal(w.path[0],a);assert.equal(w.path.at(-1),b);
 assert.equal(w.steps,w.path.length-1);assert.ok(w.steps<=24);
 for(let i=0;i<w.steps;i++)assert.ok(piAxisNeighborsR742(w.path[i]).includes(w.path[i+1]));
 assert.deepEqual(verifyPiAxisWitnessR742(JSON.stringify(w)),w);
 assert.throws(()=>verifyPiAxisWitnessR742(JSON.stringify({...w,steps:999})),/differs/);
}
const donor=JSON.parse(readFileSync(new URL('./fixtures/r742-donor-sampled-geometry.json',import.meta.url),'utf8'));
assert.equal(donor.schema,'omega.r742.donor-sampled-geometry.v1');
for(const sample of donor.samples){
 const position=piAtlasPositionR742(sample.index,sample.metrics);
 for(let axis=0;axis<3;axis++)assert.ok(Math.abs(position[axis]-sample.position[axis])<2e-6,'R742 donor sampled geometry parity '+sample.index+' axis '+axis);
}
assert.equal(piAxisNeighborsR742(0)[0],1728);
assert.equal(piAxisNeighborsR742(0)[1],19008);
assert.equal(piAtlasPositionR742(0).length,3);
assert.throws(()=>piAtlasPositionR742(0,[NaN,0,0]),/finite/);
assert.throws(()=>decodePiAddressR742(20736),/outside/);
const ui=readFileSync(new URL('../src7/workspaces/RouteBasinInstrumentR732.tsx',import.meta.url),'utf8');
for(const marker of ['data-r742-target','data-r742-summary','data-r742-path','data-r742-export','data-r742-import','data-r742-recovery'])assert.ok(ui.includes(marker),'R742 UI missing '+marker);
console.log('R742 20,736 base-12 addresses, 165,888 reversible neighbors, axis witnesses, tamper refusal and UI bindings PASS');
