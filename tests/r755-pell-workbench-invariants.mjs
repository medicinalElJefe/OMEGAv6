import assert from 'node:assert/strict';
import {computePellWorkbenchR755,verifyPellWorkbenchR755,R755_WORKBENCH_BOUNDARY} from '../src/proof/singmasterResearchWorkbenchR755.js';
for(const t of [2,3,4,5]){
 const packet=computePellWorkbenchR755(String(t),undefined,undefined,undefined);
 assert.equal(packet.schema,'OMEGA_R755_EXACT_PELL_WORKBENCH_V1');
 assert.equal(packet.classification.status,'CLASSIFIED_EXACT_ADJACENT_PAIR');
 assert.equal(packet.classification.steps,t);
 assert.equal(packet.crossing.excludesEquality,true);
 assert.equal(packet.boundary.sharpSingmaster,'OPEN');
 assert.equal(packet.boundary.fourfoldClosures,0);
 assert.deepEqual(verifyPellWorkbenchR755(JSON.stringify(packet)),packet);
 const altered=JSON.parse(JSON.stringify(packet));altered.crossing.excludesEquality=false;
 assert.throws(()=>verifyPellWorkbenchR755(JSON.stringify(altered)),/differs from fresh/);
 const alteredPrime=JSON.parse(JSON.stringify(packet));alteredPrime.valuation.requiredMinCarries=999;
 assert.throws(()=>verifyPellWorkbenchR755(JSON.stringify(alteredPrime)),/differs from fresh/);
}
const p=computePellWorkbenchR755('3','274','550','5');
assert.equal(p.pair.n,'714');assert.equal(p.pair.k,'272');
assert.equal(p.crossing.coveredRows,714-2-2*274+1);
assert.equal(p.candidate.row,550);
assert.throws(()=>computePellWorkbenchR755('6','274','550','5'),/Pell index/);
assert.throws(()=>computePellWorkbenchR755('3','273','550','5'),/Higher column/);
assert.throws(()=>computePellWorkbenchR755('3','274','547','5'),/Candidate row/);
assert.throws(()=>computePellWorkbenchR755('3','274','550','4'),/Prime/);
assert.throws(()=>verifyPellWorkbenchR755('{"schema":"OMEGA_R755_EXACT_PELL_WORKBENCH_V1","input":{}}'));
assert.throws(()=>verifyPellWorkbenchR755('x'));
assert.equal(R755_WORKBENCH_BOUNDARY.physicalDimensions,false);
console.log('R755 executable Pell/Kummer/crossing, exact recovery and tamper refusal PASS');
