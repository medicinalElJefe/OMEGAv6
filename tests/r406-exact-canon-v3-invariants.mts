import assert from'node:assert/strict';
import{
 OMEGA_EXACT_CANON_VERSION,OMEGA_EXACT_CANON_BOUNDARY,
 EXACT_ATLAS_RESOLUTION_V3,EXACT_EPSILON_VERSIONS_V3,EXACT_SCORE_VARIANTS_V3,
 EXACT_RECONCILIATION_LOCKS_V3,EXACT_STATE_CONTRACT_V3,
 exactAtlasAddressV3,verifyExactAtlasAddressV3,
 fullSphereCoordinateFromIndexV3,fullSphereRowIdV3,fullSphereAntipodeCoordinateV3,
 canonicalDecisionScoreV3,canonicalDecisionV3,crossDomainWovenCarryV3,
}from'../src/system/omegaExactCanonV3';
import{compileCanonicalTypedFieldR349}from'../src/system/wovenHardwareFieldR349';
import{executeProofCarryingWovenStepV1}from'../src/system/proofCarryingWovenDynamics';

assert.equal(OMEGA_EXACT_CANON_VERSION,'OMEGA_EXACT_CANON_v3');
assert.match(OMEGA_EXACT_CANON_BOUNDARY,/does not convert model state into observation/i);
assert.equal(EXACT_ATLAS_RESOLUTION_V3,20736);
assert.deepEqual(EXACT_EPSILON_VERSIONS_V3,{legacy:.01,canon:.001,pcwdProof:1e-9});
assert.equal(EXACT_SCORE_VARIANTS_V3.length,7);
assert.ok(EXACT_SCORE_VARIANTS_V3.every(x=>x.mergeWithOtherScores===false));
assert.equal(new Set(EXACT_SCORE_VARIANTS_V3.map(x=>x.id)).size,EXACT_SCORE_VARIANTS_V3.length);
assert.ok(EXACT_RECONCILIATION_LOCKS_V3.length>=16);
assert.equal(EXACT_STATE_CONTRACT_V3.schema,'OMEGA_EXACT_STATE_CONTRACT_v3');
assert.ok(EXACT_STATE_CONTRACT_V3.proofTiers.includes('BENCHMARKED'));
assert.ok(EXACT_STATE_CONTRACT_V3.proofTiers.includes('EXTERNALLY_VALIDATED'));

for(let i=0;i<EXACT_ATLAS_RESOLUTION_V3;i++){
 const c=fullSphereCoordinateFromIndexV3(i);
 assert.equal(fullSphereRowIdV3(c),i+1,`R406 forward/inverse mismatch at ${i}`);
 const a=exactAtlasAddressV3(i);
 assert.equal(verifyExactAtlasAddressV3(a),true,`R406 address verification failed at ${i}`);
 const aa=fullSphereAntipodeCoordinateV3(a.antipodeCoordinate);
 assert.deepEqual(aa,c,`R406 antipode involution failed at ${i}`);
 assert.equal(exactAtlasAddressV3(a.antipodeIndex0).antipodeIndex0,i,`R406 antipode RowID involution failed at ${i}`);
}

const d=canonicalDecisionScoreV3({C_omega:.9,Phi:.8,q:.1,Lambda:.2});
assert.ok(Number.isFinite(d));
assert.equal(canonicalDecisionV3(1.081),'STAY');
assert.equal(canonicalDecisionV3(1.08),'TURN');
assert.equal(canonicalDecisionV3(.82),'TURN');
assert.equal(canonicalDecisionV3(.819),'ESCALATE');

const w=crossDomainWovenCarryV3({SA:.8,AA:.6,SB:.7,AB:.5});
assert.ok(Math.abs(w.preservation-.75)<1e-12);
assert.ok(Math.abs(w.differentiation-.55)<1e-12);
assert.ok(w.carry>0&&w.carry<1);

const source=compileCanonicalTypedFieldR349(0,(a:number)=>({
 continuity:.65,plasticity:.6,burden:.1,contradiction:.05,scar:.02,evidence:.9,
 invariantCarry:.8,motionRate:.1,support:.9,orientation:(a%2?1:-1)as -1|1,
}));
const step=await executeProofCarryingWovenStepV1(source,{
 tick:406,address:4242,orientation:1,transportRate:.125,
 evidence:{admissible:true,sources:['R406_DECLARED_TEST_SOURCE'],support:.95,authority:'R406_TEST',observedClaim:false},
});
const A=step.packet.A_t;
assert.equal(A.canonicalV3.schema,'OMEGA_EXACT_ATLAS_ADDRESS_v3');
assert.equal(A.canonicalV3.index0,A.address);
assert.equal(A.canonicalV3.rowId1,A.address+1);
assert.equal(A.canonicalV3.physicalDimensionsClaimed,false);
assert.equal(verifyExactAtlasAddressV3(A.canonicalV3),true);
assert.equal(step.packet.L_t.group,'Z2_ATLAS_COMPLEMENT_WITH_ORIENTATION_INVERSION');
assert.notEqual(A.canonicalV3.transform,step.packet.L_t.group);
assert.equal(step.packet.Pi_t.physicalPrimitiveAdded,false);
assert.equal(step.packet.Pi_t.observedHistoryClaimed,false);

console.log('R406 EXACT CANON v3 PASS · exhaustive 20,736 RowID round-trip + Full-Sphere antipode involution · PCWD Z2 quotient preserved separately · seven score families remain unmerged · epsilon versions explicit · proof tiers and external-truth boundary retained');
