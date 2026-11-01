import assert from 'node:assert/strict';
import {chooseExactR751,firstDominanceMR751,fixedGapPairsR751,completeFixedValueFiberR751,SINGMASTER_FIXED_GAP_BOUNDARY_R751} from '../src/proof/singmasterFixedGapR751.js';

assert.equal(chooseExactR751(16,2),120n);
assert.equal(chooseExactR751(104,39).toString(),'61218182743304701891431482520');
for(const [k,d] of [[2,1],[2,6],[2,11],[2,34],[2,63],[2,64],[5,1],[39,1],[50,100],[100,100]]){
 const T=firstDominanceMR751(k,d),minimum=2*(k+1);
 assert(T>=minimum);
 assert(chooseExactR751(T,k+1)>chooseExactR751(T+d,k));
 if(T>minimum)assert(chooseExactR751(T-1,k+1)<=chooseExactR751(T+d-1,k));
}
const expected=[
 [2,6,'120',16,10,3],
 [2,11,'210',21,10,4],
 [2,34,'1540',56,22,3],
 [2,63,'3003',78,15,5],
 [2,64,'3003',78,14,6],
 [5,1,'3003',15,14,6],
 [39,1,'61218182743304701891431482520',104,103,40],
];
for(const [k,d,a,n,m,l] of expected){
 const x=fixedGapPairsR751(k,d);
 assert.equal(x.globalSingmasterClaim,'OPEN');
 assert.equal(x.canonicalMutation,false);
 assert.deepEqual(x.equalities.map(v=>[v.n,v.m,v.l,v.value]),[[n,m,l,a]]);
}
assert.equal(fixedGapPairsR751(2,1).equalities.length,0);
assert.equal(fixedGapPairsR751(2,99).equalities.length,0);
const fib=completeFixedValueFiberR751('61218182743304701891431482520');
assert.deepEqual(fib.representations,[{n:104,k:39},{n:103,k:40}]);
const three=completeFixedValueFiberR751('3003');
assert.deepEqual(three.representations,[{n:78,k:2},{n:15,k:5},{n:14,k:6}]);
assert.equal(three.M,3);
assert.equal(SINGMASTER_FIXED_GAP_BOUNDARY_R751.includes('OPEN'),true);
assert.throws(()=>fixedGapPairsR751(1,5));
assert.throws(()=>fixedGapPairsR751(3,0));
console.log('R751 fixed-(k,d) exact arithmetic regression PASS; G09/G10/G13 OPEN');
