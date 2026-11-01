import assert from 'node:assert/strict';
import {R752_TRUTH,pellCurveR752,pellForwardR752,pellInverseR752,pellNormR752,certifyPellMapR752,pellThreadR752} from '../src/proof/singmasterPellThreadR752.js';
const pass=certifyPellMapR752();
assert.equal(pass.isGlobalIdentity,true);
assert.deepEqual(pass.anchorResiduals,['0','0','0','0','0','0']);
assert.equal(certifyPellMapR752([8n,-3n,0n,3n,-1n,-1n]).isGlobalIdentity,false,'mutated affine offset must fail');
assert.equal(certifyPellMapR752([8n,-3n,-1n,3n,-1n,0n]).isGlobalIdentity,false,'second mutated offset must fail');
const packet=pellThreadR752(128),rows=packet.states;
assert.equal(rows.length,129);
assert.deepEqual(rows.slice(0,5).map(x=>[x.n,x.k]),[['2','0'],['15','5'],['104','39'],['714','272'],['4895','1869']]);
for(let i=0;i<rows.length;i++){
 const row=rows[i],n=BigInt(row.n),k=BigInt(row.k),next=pellForwardR752(n,k),inverse=pellInverseR752(next.n,next.k);
 assert.equal(pellCurveR752(n,k),0n);assert.equal(pellNormR752(n,k).norm,-4n);
 assert.deepEqual(inverse,{n,k});assert.equal(row.sharpFourfoldStatus,'OPEN');
 if(i>=2){const p=rows[i-1],pp=rows[i-2];assert.equal(n,7n*BigInt(p.n)-BigInt(pp.n)+1n);assert.equal(k,7n*BigInt(p.k)-BigInt(pp.k)+4n)}
}
for(let n=-20;n<=20;n++)for(let k=-20;k<=20;k++){
 const p=pellForwardR752(n,k);assert.equal(pellCurveR752(p.n,p.k),pellCurveR752(n,k));
}
assert.equal(R752_TRUTH.sharpSingmaster,'OPEN');
assert.equal(packet.autopingActivated,false);assert.equal(packet.canonicalMutation,false);
console.log('R752 Pell-family exact degree-2 identity, inverse, 128 threads, negative controls and OPEN gates PASS');
