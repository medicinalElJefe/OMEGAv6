import assert from'node:assert/strict';
import{PCWD_PROFILE_BUILDERS}from'../src/system/pcwdSemanticProfiles';
import{QUBIT,type Matrix2V1}from'../src/system/proofCarryingWovenSpecializations';
import{
 qubitToLossyResolutionLensBridgeV1,qubitToResolutionLensBridgeV1,
}from'../src/system/pcwdInterDomainBridge';
import{
 executeComposedInterDomainBridgeV1,resolutionLensToVector8BridgeV1,verifyBridgeCompositionReceiptV1,
}from'../src/system/pcwdBridgeComposition';

const[pQubit,pLens,pVector]=await Promise.all([
 PCWD_PROFILE_BUILDERS.qubit(),
 PCWD_PROFILE_BUILDERS.lens(),
 PCWD_PROFILE_BUILDERS.vector8(),
]);

const rho:Matrix2V1=[
 QUBIT.c(.5),QUBIT.c(0,-.5),
 QUBIT.c(0,.5),QUBIT.c(.5),
];

const first=qubitToResolutionLensBridgeV1(pQubit,pLens,1e-12);
const second=resolutionLensToVector8BridgeV1(pLens,pVector,1e-12);
const composed=await executeComposedInterDomainBridgeV1(first,second,rho);

assert.equal(composed.compositionEligible,true);
assert.equal(composed.gates.componentReceiptsValid,true);
assert.equal(composed.gates.componentBridgesEligible,true);
assert.equal(composed.gates.profileChainCompatible,true);
assert.equal(composed.gates.endToEndRecoveryBounded,true);
assert.equal(composed.gates.endToEndInvariantsPreserved,true);
assert.equal(composed.gates.lossLedgerMonotone,true);
assert.equal(composed.gates.noUnmodeledLoss,true);
assert.equal(composed.gates.semanticAuthorityNotTransferred,true);
assert.equal(composed.crossDomainErrorAdditionPerformed,false);
assert.equal(composed.errorAggregation,'SOURCE_DOMAIN_END_TO_END_MEASUREMENT');
assert.equal(composed.semanticEquivalenceClaimed,false);
assert.equal(composed.semanticAuthorityTransferred,false);
assert.equal(composed.endToEndRecoveryError,0);
assert.equal(composed.endToEndInvariants.length,2);
assert.ok(composed.endToEndInvariants.every(x=>x.preserved));
assert.equal(composed.cumulativeLossLedger.length,5);
assert.equal(composed.cumulativeLossLedger.filter(x=>x.originBridge===first.id).length,3);
assert.equal(composed.cumulativeLossLedger.filter(x=>x.originBridge===second.id).length,2);
assert.match(composed.receiptDigest,/^[0-9a-f]{64}$/);
assert.equal(await verifyBridgeCompositionReceiptV1(composed),true);

const lossKinds=composed.cumulativeLossLedger.map(x=>x.kind);
assert.ok(lossKinds.includes('NUMERIC_RESIDUAL'));
assert.ok(lossKinds.filter(x=>x==='SEMANTIC_NON_TRANSFER').length>=2);
assert.ok(lossKinds.filter(x=>x==='AUTHORITY_NON_TRANSFER').length>=2);

const lossyFirst=qubitToLossyResolutionLensBridgeV1(pQubit,pLens,1e-12);
const held=await executeComposedInterDomainBridgeV1(lossyFirst,second,rho);
assert.equal(held.compositionEligible,false);
assert.equal(held.gates.componentBridgesEligible,false);
assert.equal(held.gates.noUnmodeledLoss,false);
assert.ok(held.cumulativeLossLedger.some(x=>x.kind==='UNMODELED_LOSS'));
assert.ok(held.endToEndRecoveryError>0);
assert.equal(await verifyBridgeCompositionReceiptV1(held),true);

const mismatchSecond=resolutionLensToVector8BridgeV1(pQubit,pVector,1e-12);
await assert.rejects(
 ()=>executeComposedInterDomainBridgeV1(first,mismatchSecond,rho),
 /incompatible intermediate semantic profiles/,
);

const tampered=structuredClone(composed);
tampered.cumulativeLossLedger.pop();
assert.equal(await verifyBridgeCompositionReceiptV1(tampered),false);

const receiptTampered=structuredClone(composed);
receiptTampered.endToEndRecoveryError=.25;
assert.equal(await verifyBridgeCompositionReceiptV1(receiptTampered),false);

console.log(JSON.stringify({
 composition:{
  id:composed.compositionId,
  eligible:composed.compositionEligible,
  endToEndRecoveryError:composed.endToEndRecoveryError,
  componentErrors:[composed.firstReceipt.recoveryError,composed.secondReceipt.recoveryError],
  cumulativeLosses:composed.cumulativeLossLedger.map(x=>({origin:x.originBridge,kind:x.kind,declared:x.declared,magnitude:x.magnitude})),
  gates:composed.gates,
 },
 negativeControl:{
  eligible:held.compositionEligible,
  endToEndRecoveryError:held.endToEndRecoveryError,
  gates:held.gates,
  lossKinds:held.cumulativeLossLedger.map(x=>x.kind),
 },
},null,2));
console.log('R362 BRIDGE COMPOSITION PASS · two typed bridges compose · end-to-end recovery measured in original source semantics · component losses accumulate monotonically · cross-domain errors are not numerically added · lossy component holds fail-closed');
