import assert from'node:assert/strict';
import{PCWD_PROFILE_BUILDERS}from'../src/system/pcwdSemanticProfiles';
import{QUBIT,type Matrix2V1}from'../src/system/proofCarryingWovenSpecializations';
import{compareDirectAndLensBridgePathsV1,verifyBridgePathComparisonReceiptV1}from'../src/system/pcwdBridgePathComparison';

const[pQubit,pLens,pVector]=await Promise.all([
 PCWD_PROFILE_BUILDERS.qubit(),
 PCWD_PROFILE_BUILDERS.lens(),
 PCWD_PROFILE_BUILDERS.vector8(),
]);

const rho:Matrix2V1=[
 QUBIT.c(.5),QUBIT.c(0,-.5),
 QUBIT.c(0,.5),QUBIT.c(.5),
];

const receipt=await compareDirectAndLensBridgePathsV1(rho,pQubit,pLens,pVector,1e-12);

assert.equal(receipt.gates.sameTypedEndpoints,true);
assert.equal(receipt.gates.directEligible,true);
assert.equal(receipt.gates.indirectEligible,true);
assert.equal(receipt.gates.endpointEquivalent,true);
assert.equal(receipt.gates.sourceRecoveryEquivalent,true);
assert.equal(receipt.gates.pathReceiptsDistinct,true);
assert.equal(receipt.gates.semanticScarDistinct,true);
assert.equal(receipt.pathEquivalent,true);
assert.equal(receipt.numericallyFlatLoop,true);
assert.equal(receipt.semanticScarRetained,true);
assert.equal(receipt.physicalHolonomyClaimed,false);
assert.equal(receipt.semanticEquivalenceClaimed,false);
assert.ok(receipt.endpointMaxError<=1e-12);
assert.ok(receipt.sourceRecoveryPathDifference<=1e-12);
assert.ok(receipt.directRecoveryError<=1e-12);
assert.ok(receipt.indirectRecoveryError<=1e-12);
assert.equal(receipt.comparisonTolerance,1e-12);
assert.ok(!receipt.directLossKinds.includes('NUMERIC_RESIDUAL'));
assert.ok(receipt.indirectLossKinds.includes('NUMERIC_RESIDUAL'));
assert.ok(receipt.indirectLossKinds.length>receipt.directLossKinds.length);
assert.match(receipt.directReceiptDigest,/^[0-9a-f]{64}$/);
assert.match(receipt.indirectReceiptDigest,/^[0-9a-f]{64}$/);
assert.match(receipt.receiptDigest,/^[0-9a-f]{64}$/);
assert.equal(await verifyBridgePathComparisonReceiptV1(receipt),true);

const tampered=structuredClone(receipt);
tampered.semanticScarRetained=false;
assert.equal(await verifyBridgePathComparisonReceiptV1(tampered),false);

const tamperedLoss=structuredClone(receipt);
tamperedLoss.indirectLossKinds=[];
assert.equal(await verifyBridgePathComparisonReceiptV1(tamperedLoss),false);

console.log(JSON.stringify({
 sourceDomain:receipt.sourceDomain,
 targetDomain:receipt.targetDomain,
 endpointMaxError:receipt.endpointMaxError,
 sourceRecoveryPathDifference:receipt.sourceRecoveryPathDifference,
 directLossKinds:receipt.directLossKinds,
 indirectLossKinds:receipt.indirectLossKinds,
 gates:receipt.gates,
 numericallyFlatLoop:receipt.numericallyFlatLoop,
 semanticScarRetained:receipt.semanticScarRetained,
},null,2));
console.log('R363 PATH COMPARISON PASS · direct and via-lens paths reach the same typed endpoint and recover the same source · numerical loop is flat · proof/loss path remains distinct · semantic scar retained without a physical-holonomy claim');
