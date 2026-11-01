import assert from 'node:assert/strict';
import {fibonacciAdjacentPairR752,classifyAdjacentPairR752,R752_CLASSIFICATION_SCOPE,fibonacciPairFastR752} from '../src/proof/singmasterPellClassificationR752.js';
import {pellCurveR752,pellInverseR752} from '../src/proof/singmasterPellThreadR752.js';
const evidence=[];
for(let t=0;t<=128;t++){
 const x=fibonacciAdjacentPairR752(t),n=BigInt(x.n),k=BigInt(x.k);
 assert.equal(pellCurveR752(n,k),0n);
 assert.equal(n-k-1n,BigInt(x.middleF)**2n);
 assert.equal(x.globalSharpStatus,'OPEN');
 if(t>=1){const c=classifyAdjacentPairR752(n,k);assert.equal(c.classified,true);assert.equal(c.t,t);assert.equal(c.sharpSingmaster,'OPEN');assert.equal(c.fourfoldExclusion,false)}
 evidence.push(x);
}
assert.deepEqual(evidence.slice(0,6).map(x=>[x.n,x.k]),[['2','0'],['15','5'],['104','39'],['714','272'],['4895','1869'],['33552','12815']]);
assert.equal(evidence[5].interiorSquare,'20736');
assert.equal(evidence[5].isOmegaCardinalityMatch,true);
assert.equal(evidence[5].omegaPhysicalEquivalence,false);
assert.equal(classifyAdjacentPairR752(16,2).status,'NOT_EQUAL');
assert.equal(classifyAdjacentPairR752(2,0).status,'NOT_ADMISSIBLE');
assert.equal(classifyAdjacentPairR752(33552,12815,{maxSteps:3}).status,'RESOURCE_HOLD_NO_INFERENCE');
assert.equal(fibonacciPairFastR752(12)[0],144n);
assert.equal(R752_CLASSIFICATION_SCOPE.fourfoldAtlasNewClosures,0);
assert.equal(R752_CLASSIFICATION_SCOPE.sharpSingmaster,'OPEN');
assert.equal(R752_CLASSIFICATION_SCOPE.productionAuthority,false);
assert.throws(()=>fibonacciAdjacentPairR752(-1));
assert.throws(()=>classifyAdjacentPairR752(1.2,5));
console.log('R752 V15 exact global adjacent-pair descent and Fibonacci Cassini regression PASS');
