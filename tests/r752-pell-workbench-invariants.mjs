import assert from 'node:assert/strict';
import {computePellWorkbenchR752,verifyPellWorkbenchR752} from '../src/proof/pellWorkbenchR752.js';
for(const t of [0,1,2,3,8,16,32,64]){
 const packet=computePellWorkbenchR752(t);
 assert.equal(packet.schema,'OMEGA_R752_PELL_EXECUTABLE_WITNESS_V1');
 assert.equal(packet.norm.value,'-4');
 assert.equal(packet.polynomial.isGlobalIdentity,true);
 assert.equal(packet.inverse.n,packet.pair.n);
 assert.equal(packet.inverse.k,packet.pair.k);
 assert.equal(packet.classification.classified,t>0);
 assert.deepEqual(verifyPellWorkbenchR752(JSON.stringify(packet)),packet);
 assert.throws(()=>verifyPellWorkbenchR752(JSON.stringify({...packet,norm:{...packet.norm,value:'-5'}})),/mismatch/);
 assert.throws(()=>verifyPellWorkbenchR752(JSON.stringify({...packet,truth:{...packet.truth,physicalMeasurement:true}})),/mismatch/);
}
for(const bad of ['-1','65','1.5','1e2','NaN','',{},null])assert.throws(()=>computePellWorkbenchR752(bad),/index/);
assert.throws(()=>verifyPellWorkbenchR752('{}'),/schema/);
console.log('R752 EXECUTABLE PELL WORKBENCH PASS · bounded BigInt · exact inverse · classification · export recovery · tamper refusal');
