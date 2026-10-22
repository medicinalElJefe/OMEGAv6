import assert from'node:assert/strict';
import{compileCanonicalTypedFieldR349}from'../src/system/wovenHardwareFieldR349';
import{executeProofCarryingWovenStepV1}from'../src/system/proofCarryingWovenDynamics';
import{compilePcwdR356CandidateV1,convergeProofCarryingR356V1,PCWD_R356_BRIDGE_BOUNDARY}from'../src/system/proofCarryingConvergenceBridge';

const parentSha='6a1cebcb09f4432ae711ff28b0af4cbc304a3912',candidateSha='d82ea398f536395d454b1512780ee9841548ae7b';
const observations=['GITHUB','CLOUD','SOVEREIGN','OBSERVATION'].map(frame=>({frame,canonicalHash:'canon-A',artifactHash:'artifact-A',state:'LIVE',health:'HEALTHY'}));
const inheritedEvidence={admissionAuthorized:true,rollbackParentRetained:true,returnProof:true,directProductionMutation:false};
const source=compileCanonicalTypedFieldR349(0,a=>({continuity:.9,plasticity:.8,burden:.03,contradiction:.01,scar:(a%3)/100,evidence:.95,invariantCarry:.5,motionRate:.1,support:.95,orientation:1 as const}));
const good=await executeProofCarryingWovenStepV1(source,{tick:1,address:73,orientation:1,transportRate:.125,evidence:{admissible:true,sources:['DECLARED_BRIDGE_TEST_SOURCE'],support:.95,authority:'TEST',observedClaim:false}});
const candidate=compilePcwdR356CandidateV1(good.packet,{parentSha,candidateSha,evidence:inheritedEvidence});
assert.equal(candidate.parentSha,parentSha);
assert.equal(candidate.candidateSha,candidateSha);
assert.equal(candidate.evidence.pcwdPromotionEligible,true);
assert.equal(candidate.metrics.authorityConflict,false);
assert.equal(candidate.metrics.invariantFailure,false);
assert.equal(candidate.metrics.proofConflict,false);

const admitted=await convergeProofCarryingR356V1({observations,packet:good.packet,identity:{parentSha,candidateSha,evidence:inheritedEvidence}});
assert.equal(admitted.pcwdGate,true);
assert.equal(admitted.receiptVerified,true);
assert.equal(admitted.inherited.admissionReceipt.allow,true);
assert.equal(admitted.allow,true);
assert.equal(admitted.next,'ADMIT');
assert.equal(admitted.canonicalMutation,false);
assert.equal(admitted.productionMutation,false);
assert.match(PCWD_R356_BRIDGE_BOUNDARY,/additive gate/);

const held=await executeProofCarryingWovenStepV1(source,{tick:1,address:73,orientation:1,transportRate:.125,evidence:{admissible:false,sources:[],support:0,authority:'UNBOUND',observedClaim:false}});
const blocked=await convergeProofCarryingR356V1({observations,packet:held.packet,identity:{parentSha,candidateSha,evidence:inheritedEvidence}});
assert.equal(blocked.pcwdGate,false);
assert.equal(blocked.receiptVerified,true);
assert.equal(blocked.allow,false);
assert.equal(blocked.next,'ESCALATE');
assert.ok(blocked.reasons.includes('PCWD_PROMOTION_GATES_HELD'));

const diverged=await convergeProofCarryingR356V1({observations:observations.map((x,i)=>i===1?{...x,artifactHash:'artifact-B'}:x),packet:good.packet,identity:{parentSha,candidateSha,evidence:inheritedEvidence}});
assert.equal(diverged.pcwdGate,true);
assert.equal(diverged.inherited.admissionReceipt.allow,false);
assert.equal(diverged.allow,false);
assert.ok(diverged.reasons.includes('RELATIVE_FRAMES_NOT_CONVERGED'));

console.log('PCWD ↔ R356 BRIDGE PASS · PCWD proof gate AND inherited R356 frame/admission gate required · fail-closed convergence · no Canon/dispatch/production authority inflation');
