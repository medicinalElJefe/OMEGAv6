import assert from 'node:assert/strict';
import {computeConstrainedAtlasJourneyR744} from '../src/constrainedAtlasJourneyR744.mjs';
import {computeAtlasTradeoffR747} from '../src/atlasTradeoffR747.mjs';
import {computeBlendedAtlasJourneyR748} from '../src/blendedAtlasJourneyR748.mjs';
import {SOURCE_FRONTIER_WEIGHTS_R749,computeSourceFrontierSweepR749,verifySourceFrontierSweepR749} from '../src/sourceFrontierSweepR749.mjs';
import {piAxisNeighborsR742} from '../src/piAtlasTraversalR742.mjs';
const COUNT=20736,field={count:COUNT,C:new Float32Array(COUNT),q:new Float32Array(COUNT)};
field.C[1]=100;
const primary=computeConstrainedAtlasJourneyR744(field,0,2,'C',[],[]);
const tradeoff=computeAtlasTradeoffR747(field,primary,'q');
const sweep=computeSourceFrontierSweepR749(field,tradeoff);
assert.equal(sweep.schema,'omega.r749.source-frontier-sweep.v1');
assert.deepEqual(sweep.weights,[0,0.25,0.5,0.75,1]);
assert.equal(sweep.samples.length,5);
assert.ok(sweep.uniqueRoutes>=2,'fixture must produce a genuine multi-route tradeoff');
assert.ok(sweep.supportedCount>=2,'both endpoint routes must be non-dominated');
assert.equal(sweep.exhaustivePareto,false);
assert.equal(sweep.donorParity,false);
assert.deepEqual(sweep.samples[0].addresses,tradeoff.secondary.addresses);
assert.deepEqual(sweep.samples.at(-1).addresses,tradeoff.primary.addresses);
for(let i=0;i<sweep.samples.length;i++){
 const sample=sweep.samples[i],reference=computeBlendedAtlasJourneyR748(field,tradeoff,SOURCE_FRONTIER_WEIGHTS_R749[i]);
 assert.deepEqual(sample.addresses,reference.addresses);
 assert.equal(sample.blendedCost,reference.blendedCost);
 let pc=0,sc=0;
 for(let j=1;j<sample.addresses.length;j++){
  const a=sample.addresses[j-1],b=sample.addresses[j];
  assert.ok(piAxisNeighborsR742(a).includes(b),'only reversible axis edges permitted');
  pc+=1+Math.abs(field.C[a]-field.C[b]);
  sc+=1+Math.abs(field.q[a]-field.q[b]);
 }
 assert.ok(Math.abs(pc-sample.primaryCost)<1e-8);
 assert.ok(Math.abs(sc-sample.secondaryCost)<1e-8);
}
for(const index of sweep.supportedIndices){
 const a=sweep.candidates[index];
 assert.equal(a.dominated,false);
 for(const b of sweep.candidates){
  assert.ok(!(b.primaryCost<a.primaryCost-1e-8&&b.secondaryCost<=a.secondaryCost+1e-8),'supported candidate must not be dominated');
 }
}
assert.deepEqual(verifySourceFrontierSweepR749(JSON.stringify(sweep),field),sweep);
assert.throws(()=>verifySourceFrontierSweepR749(JSON.stringify({...sweep,supportedCount:999}),field),/differs/);
assert.throws(()=>verifySourceFrontierSweepR749(JSON.stringify({...sweep,samples:[...sweep.samples.slice(0,1)]}),field),/differs/);
assert.throws(()=>verifySourceFrontierSweepR749('{bad',field),/invalid JSON/);
assert.throws(()=>verifySourceFrontierSweepR749('x'.repeat(4194305),field),/size refused/);
const modified={...field,C:new Float32Array(field.C)};modified.C[1]=0;
assert.throws(()=>verifySourceFrontierSweepR749(JSON.stringify(sweep),modified),/differs|R747 tradeoff differs|R744 journey differs/);
const constrained=computeConstrainedAtlasJourneyR744(field,0,2,'C',[1728],[12]);
const via=computeSourceFrontierSweepR749(field,computeAtlasTradeoffR747(field,constrained,'q'));
assert.ok(via.samples.every(sample=>sample.addresses.includes(1728)&&!sample.addresses.includes(12)));
assert.deepEqual(verifySourceFrontierSweepR749(JSON.stringify(via),field),via);
const ui=(await import('node:fs')).readFileSync(new URL('../src7/workspaces/RouteBasinInstrumentR732.tsx',import.meta.url),'utf8');
for(const marker of ['data-r749-run','data-r749-summary','data-r749-table','data-r749-candidate','data-r749-path','data-r749-step','data-r749-export','data-r749-import','data-r749-recovery'])
 assert.ok(ui.includes(marker),'R749 UI missing '+marker);
console.log('R749 five actual source-weighted A* optima, sampled dominance, source costs, constraints, navigation and tamper-refusing recovery PASS');
