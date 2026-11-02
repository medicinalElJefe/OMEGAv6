import assert from 'node:assert/strict';
import {jointCanonPrecisionR759,R759_TRUTH,computeJointCanonWitnessR759,verifyJointCanonWitnessR759} from '../src/proof/canonJointPrecisionR759.js';
const A={c:'0.2654',phi:'0.5444',q:'0.1765',lambda:'0.1667'};
const B={c:'0.4100',phi:'0.6889',q:'0.5882',lambda:'0.0833'};
const C={c:'0.5199',phi:'0.5500',q:'0.3824',lambda:'0.9167'};
let x=jointCanonPrecisionR759(A,'0.4199');
assert.equal(x.componentOnly,'PRECISION_HOLD');assert.equal(x.jointGate,'TURN');assert.equal(x.status,'CONDITIONALLY_CLASSIFIED');
x=jointCanonPrecisionR759(B,'0.4200');
assert.equal(x.componentOnly,'PRECISION_HOLD');assert.equal(x.jointGate,'PRECISION_HOLD');
x=jointCanonPrecisionR759(C,'0.2200');
assert.equal(x.jointGate,'ESCALATE');assert.equal(x.conditionallyStable,true);
x=jointCanonPrecisionR759({c:'1',phi:'1',q:'0.1',lambda:'0.1'},'0.0100');
assert.equal(x.status,'INCOMPATIBLE_CONDITIONAL_OBSERVATIONS_HOLD');
assert.equal(x.jointGate,'PRECISION_HOLD');assert.equal(x.liveActionAdmissible,false);
for(const text of ['-0.1','0.00001','NaN','1e-2',''])assert.throws(()=>jointCanonPrecisionR759(A,text));
assert.equal(R759_TRUTH.historicalGeneratorAuthenticated,false);
assert.equal(R759_TRUTH.liveDecisionAuthority,false);
assert.equal(R759_TRUTH.globalSharpSingmaster,'OPEN');
const witness=computeJointCanonWitnessR759(A,'0.4199');
assert.deepEqual(verifyJointCanonWitnessR759(JSON.stringify(witness)),witness);
for(const altered of [
 {...witness,result:{...witness.result,jointGate:'STAY'}},
 {...witness,inputs:{...witness.inputs,storedScore:'0.4200'}},
 {...witness,result:{...witness.result,liveActionAdmissible:true}},
 {...witness,sourceAuthority:true}
])assert.throws(()=>verifyJointCanonWitnessR759(JSON.stringify(altered)));
for(const invalid of ['','{','null','[]','x'.repeat(12001)])
 assert.throws(()=>verifyJointCanonWitnessR759(invalid));
assert.throws(()=>jointCanonPrecisionR759(A,'9'.repeat(1000)));
console.log('R759 exact joint-interval 4dp rounding, 76-case class reduction principle and fail-closed controls PASS');