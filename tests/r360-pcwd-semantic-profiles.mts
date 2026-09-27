import assert from'node:assert/strict';
import{compileCanonicalTypedFieldR349}from'../src/system/wovenHardwareFieldR349';
import{executeProofCarryingWovenStepV1}from'../src/system/proofCarryingWovenDynamics';
import{QUBIT,type Matrix2V1}from'../src/system/proofCarryingWovenSpecializations';
import{runQubitThroughUnifiedKernelV1,runR349PacketThroughUnifiedKernelV1,runResolutionLensThroughUnifiedKernelV1}from'../src/system/unifiedProofTransportAdapters';
import{
 PCWD_PROFILE_BUILDERS,PCWD_SEMANTIC_BOUNDARY,
 compileCrossDomainInvariantProjectionV1,compareCrossDomainInvariantShapeV1,metricCompatibilityV1,
 verifyDomainSemanticsProfileV1,
}from'../src/system/pcwdSemanticProfiles';

const field=compileCanonicalTypedFieldR349(0,a=>({
 continuity:.91,plasticity:.82,burden:.04,contradiction:.02,scar:(a%5)/100,evidence:.98,invariantCarry:.55,
 motionRate:.12,support:.96,orientation:(a%2?1:-1) as -1|1,
}));
const base=await executeProofCarryingWovenStepV1(field,{
 tick:3,address:20736,orientation:1,transportRate:.125,
 evidence:{admissible:true,sources:['R360_SEMANTIC_TEST'],support:1,authority:'TEST',observedClaim:false},
});
const r349=await runR349PacketThroughUnifiedKernelV1(base.packet);
const lens=await runResolutionLensThroughUnifiedKernelV1({
 values:[1,1,2,4,8,8,7,3,5,9,2,6],targetCount:3,evidenceAdmissible:true,address:'R360:LENS',
});
const s=1/Math.sqrt(2),z=QUBIT.c(0),one=QUBIT.c(1);
const rho:Matrix2V1=[one,z,z,z],H:Matrix2V1=[QUBIT.c(s),QUBIT.c(s),QUBIT.c(s),QUBIT.c(-s)];
const qubit=await runQubitThroughUnifiedKernelV1({rho,unitary:H,evidenceAdmissible:true,address:'R360:QUBIT'});

const[pR349,pLens,pQubit]=await Promise.all([PCWD_PROFILE_BUILDERS.r349(),PCWD_PROFILE_BUILDERS.lens(),PCWD_PROFILE_BUILDERS.qubit()]);
for(const profile of[pR349,pLens,pQubit]){
 assert.equal(await verifyDomainSemanticsProfileV1(profile),true);
 assert.match(profile.profileDigest,/^[0-9a-f]{64}$/);
 assert.equal(profile.boundary,PCWD_SEMANTIC_BOUNDARY);
 assert.ok(profile.rawDomainFieldsNeverCompared.includes('continuity'));
 assert.ok(profile.rawDomainFieldsNeverCompared.includes('state'));
}

const[pjR349,pjLens,pjQubit]=await Promise.all([
 compileCrossDomainInvariantProjectionV1(r349,pR349),
 compileCrossDomainInvariantProjectionV1(lens,pLens),
 compileCrossDomainInvariantProjectionV1(qubit,pQubit),
]);

for(const projection of[pjR349,pjLens,pjQubit]){
 assert.equal(projection.integrityVerified,true);
 assert.equal(projection.structural.stageOrderValid,true);
 assert.equal(projection.structural.allGateNamesPresent,true);
 assert.equal(projection.structural.promotionDerivedFromAllGates,true);
 assert.equal(projection.structural.decisionIsGateDerived,true);
 assert.equal(projection.structural.boundaryPreserved,true);
 assert.equal(projection.gateTopology.length,8);
 assert.equal(projection.stageTopology.length,7);
 assert.ok(projection.excludedRawFields.includes('continuity'));
 assert.ok(projection.excludedRawFields.includes('recoveryError'));
}

const a=compareCrossDomainInvariantShapeV1(pjR349,pjLens);
const b=compareCrossDomainInvariantShapeV1(pjLens,pjQubit);
assert.equal(a.structuralContractEqual,true);
assert.equal(b.structuralContractEqual,true);
assert.equal(a.rawMetricComparisonAttempted,false);
assert.equal(b.rawMetricComparisonAttempted,false);
assert.ok(a.intentionallyIncomparableFields.includes('governance metric values'));

const c1=metricCompatibilityV1(pR349.governanceMetrics.continuity,pLens.governanceMetrics.continuity);
const c2=metricCompatibilityV1(pLens.governanceMetrics.continuity,pQubit.governanceMetrics.continuity);
assert.equal(c1.comparable,false);
assert.equal(c2.comparable,false);
assert.equal(c1.reason,'DOMAIN_SEMANTICS_DIFFER');
assert.equal(c2.reason,'DOMAIN_SEMANTICS_DIFFER');
assert.notEqual(pR349.governanceMetrics.continuity.id,pLens.governanceMetrics.continuity.id);
assert.notEqual(pLens.governanceMetrics.continuity.id,pQubit.governanceMetrics.continuity.id);

await assert.rejects(()=>compileCrossDomainInvariantProjectionV1(qubit,pLens),/domain\/version mismatch/);

const tampered=structuredClone(pQubit);
tampered.stateSpace='tampered state space';
assert.equal(await verifyDomainSemanticsProfileV1(tampered),false);
await assert.rejects(()=>compileCrossDomainInvariantProjectionV1(qubit,tampered),/profile digest invalid/);

console.log(JSON.stringify({
 domains:[pjR349.domain,pjLens.domain,pjQubit.domain],
 structuralContractEqual:[a.structuralContractEqual,b.structuralContractEqual],
 rawMetricComparisonAttempted:false,
 continuityCompatibility:{r349Lens:c1,lensQubit:c2},
 excludedRawFields:pjQubit.excludedRawFields,
},null,2));
console.log('R360 SEMANTIC LAYER PASS · shared stage/gate/integrity topology proven across R349 + resolution lens + standard-QM adapter · raw governance/error values explicitly non-comparable without semantic identity · profile tamper/mismatch rejected');
