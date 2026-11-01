import assert from 'node:assert/strict';
import {binomialExactR754,certifyHigherColumnR754,pellPairR754,R754_BOUNDARY} from '../src/proof/singmasterColumnCrossingR754.js';
assert.equal(binomialExactR754(78,2),3003n);
assert.equal(binomialExactR754(14,6),3003n);
assert.equal(binomialExactR754(15,5),3003n);
assert.deepEqual([1,2,3,4,5].map(t=>{const x=pellPairR754(t);return[x.n,x.k]}),[[15,5],[104,39],[714,272],[4895,1869],[33552,12815]]);
for(const t of [2,3,4,5]){
 const {n,k}=pellPairR754(t),hi=Math.floor((n-2)/2);
 const tests=[k+2,Math.min(k+4,hi),hi].filter((v,i,a)=>a.indexOf(v)===i);
 for(const l of tests){const result=certifyHigherColumnR754(n,k,l);
  assert.equal(result.complete,true);assert.equal(result.excludesEquality,true);
  assert.equal(result.globalFourfoldClosure,false);
  assert.equal(result.coveredRows,n-2-2*l+1);
 }
}
assert.equal(certifyHigherColumnR754(15,5,2).status,'OUTSIDE_DECLARED_HIGHER_COLUMN_DOMAIN');
assert.equal(certifyHigherColumnR754(15,5,7).status,'OUTSIDE_DECLARED_HIGHER_COLUMN_DOMAIN');
assert.throws(()=>binomialExactR754(-1,1));
assert.throws(()=>certifyHigherColumnR754(15,5,-1));
assert.equal(R754_BOUNDARY.sharpSingmaster,'OPEN');
assert.equal(R754_BOUNDARY.canonicalMutation,false);
console.log('R754 exact monotonic higher-column crossing certificates PASS; global Singmaster OPEN');
