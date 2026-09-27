import assert from'node:assert/strict';
import{PCWD_PROFILE_BUILDERS}from'../src/system/pcwdSemanticProfiles';
import{compileResolutionLensV1,QUBIT,type Matrix2V1}from'../src/system/proofCarryingWovenSpecializations';
import{
 executeInterDomainBridgeV1,qubitToResolutionLensBridgeV1,verifyInterDomainBridgeReceiptV1,
 type InterDomainBridgeContractV1,
}from'../src/system/pcwdInterDomainBridge';

const[pQubit,pLens]=await Promise.all([PCWD_PROFILE_BUILDERS.qubit(),PCWD_PROFILE_BUILDERS.lens()]);
const rho:Matrix2V1=[
 QUBIT.c(.5),QUBIT.c(0,-.5),
 QUBIT.c(0,.5),QUBIT.c(.5),
];

const bridge=qubitToResolutionLensBridgeV1(pQubit,pLens,1e-12);
const receipt=await executeInterDomainBridgeV1(bridge,rho);
assert.equal(receipt.bridgeEligible,true);
assert.equal(receipt.gates.profilesValid,true);
assert.equal(receipt.gates.sourceTargetDistinct,true);
assert.equal(receipt.gates.recoveryBounded,true);
assert.equal(receipt.gates.invariantsPreserved,true);
assert.equal(receipt.gates.allLossDeclared,true);
assert.equal(receipt.gates.noUnmodeledLoss,true);
assert.equal(receipt.gates.semanticAuthorityNotTransferred,true);
assert.equal(receipt.semanticEquivalenceClaimed,false);
assert.equal(receipt.semanticAuthorityTransferred,false);
assert.equal(receipt.canonicalMutation,false);
assert.equal(receipt.physicalLawClaimed,false);
assert.equal(receipt.recoveryError,0);
assert.equal(receipt.invariants.length,2);
assert.ok(receipt.invariants.every(x=>x.preserved));
assert.ok(receipt.lossLedger.some(x=>x.kind==='SEMANTIC_NON_TRANSFER'));
assert.ok(receipt.lossLedger.some(x=>x.kind==='AUTHORITY_NON_TRANSFER'));
assert.ok(receipt.lossLedger.some(x=>x.kind==='NUMERIC_RESIDUAL'));
assert.match(receipt.receiptDigest,/^[0-9a-f]{64}$/);
assert.equal(await verifyInterDomainBridgeReceiptV1(receipt),true);

const tampered=structuredClone(receipt);
tampered.targetMeaning='pretend the lens itself is a quantum state';
assert.equal(await verifyInterDomainBridgeReceiptV1(tampered),false);

const bad:InterDomainBridgeContractV1<Matrix2V1,ReturnType<typeof compileResolutionLensV1>,Matrix2V1>={
 ...bridge,
 id:'OMEGA_QUBIT_TO_LOSSY_LENS_NEGATIVE_CONTROL',
 translate:source=>{
  const flat=source.flatMap(z=>[z.re,z.im]);
  const lens=compileResolutionLensV1(flat,4);
  return{...lens,residual:lens.residual.map(()=>0),exactRecovery:false,recoveryError:1};
 },
 losses:()=>[
  {kind:'UNMODELED_LOSS',declared:false,magnitude:.5,detail:'negative control intentionally deletes the residual sidecar'},
 ],
};
const held=await executeInterDomainBridgeV1(bad,rho);
assert.equal(held.bridgeEligible,false);
assert.equal(held.gates.recoveryBounded,false);
assert.equal(held.gates.allLossDeclared,false);
assert.equal(held.gates.noUnmodeledLoss,false);
assert.ok(held.recoveryError>0);
assert.equal(await verifyInterDomainBridgeReceiptV1(held),true);

console.log(JSON.stringify({
 bridge:{id:receipt.bridgeId,eligible:receipt.bridgeEligible,recoveryError:receipt.recoveryError,invariants:receipt.invariants,lossLedger:receipt.lossLedger,gates:receipt.gates},
 negativeControl:{eligible:held.bridgeEligible,recoveryError:held.recoveryError,gates:held.gates,lossLedger:held.lossLedger},
},null,2));
console.log('R361 INTER-DOMAIN BRIDGE PASS · qubit coefficients → recoverable real-vector lens → exact matrix recovery · trace invariants preserved · semantic/authority non-transfer explicitly retained · deleted-residual negative control held fail-closed');
