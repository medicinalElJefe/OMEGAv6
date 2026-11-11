import assert from 'node:assert/strict';
import {pairProductDefectV6,DEWEY_PAIR_PRODUCT_BOUNDARY_V6} from '../src/proof/deweyPairProductV6.js';
const comb=(n,k)=>{let x=1n;for(let i=1;i<=k;i++)x=x*BigInt(n-k+i)/BigInt(i);return x;};
const equalPairs=[
 [16,2,10,3],[21,2,10,4],[56,2,22,3],
 [78,2,15,5],[78,2,14,6],[15,5,14,6],
 [120,2,36,3],[153,2,19,5],[221,2,17,8],
 [104,39,103,40]
];
for(const [n,k,m,l] of equalPairs){
 const p=pairProductDefectV6(n,k,m,l);
 assert.equal(p.defect,'0');assert.equal(p.equal,true);
 assert.equal(p.complementDisplacement,p.rowDisplacement+p.columnDisplacement);
 assert.equal(comb(n,k),comb(m,l));
}
for(const [n,k,m,l] of [[20,2,16,3],[23,2,13,4],[79,2,14,6],[105,39,103,40]]){
 const p=pairProductDefectV6(n,k,m,l);
 assert.equal(p.equal,comb(n,k)===comb(m,l));
 const signed=BigInt(p.defect);
 const difference=comb(n,k)-comb(m,l);
 assert.equal(Math.sign(Number(signed>0n)-Number(signed<0n)),Math.sign(Number(difference>0n)-Number(difference<0n)));
}
assert.match(DEWEY_PAIR_PRODUCT_BOUNDARY_V6,/OPEN/);
assert.throws(()=>pairProductDefectV6(10,3,16,2));
console.log('V6 exact pair-product invariants passed');
