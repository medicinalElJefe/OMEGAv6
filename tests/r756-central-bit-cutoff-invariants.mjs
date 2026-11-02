import assert from 'node:assert/strict';
import {binomialExactR756,certifiedCentralCutoffR756,R756_TRUTH} from '../src/proof/centralCutoffBitBoundR756.js';
assert.equal(binomialExactR756(15,5),3003n);
for(const[n,k,expected]of[[15,5,6],[104,39,49],[714,272,342],[4895,1869,2347],[33552,12815,16094]]){
 const c=certifiedCentralCutoffR756(n,k);
 assert.equal(c.status,'EXACT_CUTOFF_CERTIFIED');
 assert.equal(c.lastPossibleColumn,expected);
 assert.equal(c.firstImpossibleColumn,expected+1);
 assert.equal(c.fullFiberProved,false);
 assert.equal(c.fourfoldRegionsClosed,0);
 assert.equal(c.sharpSingmaster,'OPEN');
 assert(c.firstCertifiedPossible<=c.lastPossibleColumn);
 assert(c.firstExcludedByBitBound>c.lastPossibleColumn);
}
const hold=certifiedCentralCutoffR756(33552,12815,{maxN:500});
assert.equal(hold.status,'RESOURCE_HOLD_NO_INFERENCE');assert.equal(hold.canonicalMutation,false);
assert.throws(()=>certifiedCentralCutoffR756(15,9));
assert.throws(()=>certifiedCentralCutoffR756(200001,2));
assert.equal(R756_TRUTH.productionAuthority,false);
console.log('R756 exact central cutoff t=1..5, bit sandwich and resource refusal PASS; sharp Singmaster OPEN');