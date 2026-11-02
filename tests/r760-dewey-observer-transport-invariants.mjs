import assert from 'node:assert/strict';
import {observerRelativeCanonR760,R760_BOUNDARY} from '../src/proof/deweyObserverTransportR760.js';
const metrics={c:'0.4100',phi:'0.6889',q:'0.5882',lambda:'0.0833'};
function test(input,expected){
 const out=observerRelativeCanonR760({metrics,storedScore:'0.4200',...input,sourceAttested:true});
 assert.equal(out.conditionalGate,expected);
 assert.equal(out.externalObservationVerified,false);
 assert.equal(out.transportBoundExternallyVerified,false);
 assert.equal(out.liveActionAdmissible,false);
 assert.equal(out.originalCanonMutation,false);
 assert.equal(out.sourceAdmission,false);
 return out;
}
assert.equal(test({referenceLower:'0.42002',referenceUpper:'0.42003',error:'0.00001'},'STAY').status,'CONDITIONAL_ONLY_NOT_SOURCE_ADMITTED');
assert.equal(test({referenceLower:'0.41997',referenceUpper:'0.41998',error:'0.00001'},'TURN').status,'CONDITIONAL_ONLY_NOT_SOURCE_ADMITTED');
assert.equal(test({referenceLower:'0.41998',referenceUpper:'0.42002',error:'0.00001'},'PRECISION_HOLD').status,'PRECISION_HOLD');
assert.equal(test({referenceLower:'0.80',referenceUpper:'0.81',error:'0.00001'},'PRECISION_HOLD').status,'CONSTRAINT_CONTRADICTION_HOLD');
assert.equal(test({referenceLower:'0.57997',referenceUpper:'0.57998',scale:'-1',offset:'1',error:'0.000001'},'STAY').conditionalGate,'STAY');
const bad={metrics,storedScore:'0.4200',referenceLower:'0.9',referenceUpper:'0.8'};
assert.throws(()=>observerRelativeCanonR760(bad),/reversed/);
assert.throws(()=>observerRelativeCanonR760({...bad,referenceLower:'0.8',error:'-0.1'}),/negative/);
assert.throws(()=>observerRelativeCanonR760({...bad,referenceLower:'NaN'}));
assert.throws(()=>observerRelativeCanonR760({...bad,referenceLower:'1'.repeat(1000)}));
assert.equal(R760_BOUNDARY.fiveAxisSmoothnessResolvesHold,false);
assert.equal(R760_BOUNDARY.originalCanonRowsNewlyResolved,0);
assert.equal(R760_BOUNDARY.productionAuthority,false);
console.log('R760 exact observer transport: stable conditional crossing, contradiction HOLD, orientation reversal, unverified source refusal PASS');