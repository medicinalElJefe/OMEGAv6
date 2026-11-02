import assert from 'node:assert/strict';
import {completeFixedFiberV19,chooseV19,V19_BOUNDARY} from '../src/proof/singmasterCompleteFixedFiberV19.js';
assert.equal(chooseV19(78,2),3003n);
const expectations=[
 {n:15,k:5,columns:5,multiplicity:3,firstImpossible:7,reps:[[78,2],[15,5],[14,6]]},
 {n:104,k:39,columns:48,multiplicity:2,firstImpossible:50,reps:[[104,39],[103,40]]},
 {n:714,k:272,columns:341,multiplicity:2,firstImpossible:343,reps:[[714,272],[713,273]]},
];
for(const e of expectations){
 const p=completeFixedFiberV19(e.n,e.k,{maxColumns:384});
 assert.equal(p.status,'COMPLETE');
 assert.equal(p.checkedColumns,e.columns);
 assert.equal(p.firstImpossibleColumn,e.firstImpossible);
 assert.equal(p.multiplicity,e.multiplicity);
 assert.deepEqual(p.representations.map(x=>[Number(x.n),x.k]),e.reps);
 assert(p.certificates.every((x,i)=>x.column===i+2));
 assert.equal(p.globalSharpSingmaster,'OPEN');assert.equal(p.canonicalMutation,false);
}
const hold=completeFixedFiberV19(33552,12815,{maxColumns:4});
assert.equal(hold.status,'RESOURCE_HOLD_NO_INFERENCE');
assert.equal(hold.multiplicity,null);
assert.equal(hold.globalSharpSingmaster,'OPEN');
assert.equal(hold.representations.length,0);
assert.throws(()=>completeFixedFiberV19(15,5,{maxColumns:1}));
assert.throws(()=>completeFixedFiberV19(15,5,{maxColumns:NaN}));
assert.equal(V19_BOUNDARY.fourfoldAtlasNewClosures,0);
assert.equal(V19_BOUNDARY.externalCompleteCSVIngested,false);
console.log('V19 complete finite-value multiplicities for t=1..3 and budget hold PASS; global OPEN');
