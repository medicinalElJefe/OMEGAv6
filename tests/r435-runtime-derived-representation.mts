import assert from'node:assert/strict';
import{initCorpusPack}from'../src/corpusRuntime';
import{compileRuntimeDerivedRepresentationR435,R435_SCHEMA}from'../src/system/runtimeDerivedRepresentationR435';
import{runtimeReceiptEvidenceR435,publishRuntimeEvidenceR435,readRuntimeEvidenceR435,publishProofReceiptR435,readProofReceiptsR435,clearRuntimeEvidenceR435,clearProofReceiptsR435}from'../src/system/representationEvidenceBusR435';

await initCorpusPack();
clearRuntimeEvidenceR435();clearProofReceiptsR435();

const base=compileRuntimeDerivedRepresentationR435({address:0,theta:0,surface:'Convergence'});
assert.equal(base.schema,R435_SCHEMA);
assert.equal(base.representationState,'MODEL_BOUND');
assert.equal(base.claimCeiling,'DERIVED_MODEL');
assert.equal(base.permissions.renderModelField,true);
assert.equal(base.permissions.renderEmpiricalClaim,false);
assert.equal(base.permissions.renderForecastAsObserved,false);
assert.equal(base.permissions.renderUnsupportedCompletion,false);
assert.equal(base.triangle.gateState,'HOLD');
assert.ok(base.triangle.reasons.includes('REAL_ANCHOR_TRIANGLE_NOT_SUPPLIED'));
assert.equal(base.atlas.hierarchy.address,'00.00.00.00');
assert.equal(base.atlas.bearing.antipode,180);
assert.equal(base.canonicalMutation,false);
assert.equal(base.productionAuthorityChanged,false);

const observedAt='2026-10-03T10:00:00.000Z';
const runtime=runtimeReceiptEvidenceR435({id:'runtime-1',source:'/api/status',sourceFamily:'OMEGAV6_HOSTED_STATUS',claim:'Hosted runtime returned',observedAt,verified:true});
const withRuntime=compileRuntimeDerivedRepresentationR435({address:0,theta:30,surface:'Evidence & Proof',evidence:[runtime]});
assert.equal(withRuntime.representationState,'RUNTIME_BOUND');
assert.equal(withRuntime.claimCeiling,'RETURNED_RUNTIME_STATE');
assert.equal(withRuntime.permissions.renderRuntimeClaim,true);
assert.equal(withRuntime.permissions.renderEmpiricalClaim,false);
assert.equal(withRuntime.truth.runtimeReceiptCount,1);
assert.equal(withRuntime.atlas.bearing.antipode,210);

const measurement:any={id:'measurement-1',kind:'MEASUREMENT',source:'instrument-A',sourceFamily:'independent-A',observedAt,frame:{space:'declared-test-frame',time:'test-event-time'},quantity:{value:42,unit:'unit',uncertainty:.05},claim:'measured datum',verified:true,authority:'MEASURED'};
const empirical=compileRuntimeDerivedRepresentationR435({address:1,theta:45,surface:'Reality Lab',evidence:[measurement]});
assert.equal(empirical.representationState,'EMPIRICAL_BOUND');
assert.equal(empirical.claimCeiling,'OBSERVED_EVIDENCE');
assert.equal(empirical.permissions.renderEmpiricalClaim,true);
assert.equal(empirical.permissions.renderPhysicalMeasurement,true);

const p={id:'a'.repeat(64),proofClass:'MODEL_PROOF' as const,verified:true,source:'PCWD-v1'};
const proofBound=compileRuntimeDerivedRepresentationR435({address:2,proofReceipts:[p]});
assert.equal(proofBound.permissions.renderProofClaim,true);
assert.equal(proofBound.proofLineage.verified,1);
assert.equal(proofBound.permissions.renderEmpiricalClaim,false);

publishRuntimeEvidenceR435([runtime]);
assert.equal(readRuntimeEvidenceR435().length,1);
publishProofReceiptR435(p);
assert.equal(readProofReceiptsR435().length,1);
clearRuntimeEvidenceR435();
assert.equal(readRuntimeEvidenceR435().length,0);
assert.equal(readProofReceiptsR435().length,1);
clearProofReceiptsR435();
assert.equal(readProofReceiptsR435().length,0);

const deterministicA=compileRuntimeDerivedRepresentationR435({address:17,theta:91,surface:'Field',evidence:[runtime],proofReceipts:[p]});
const deterministicB=compileRuntimeDerivedRepresentationR435({address:17,theta:91,surface:'Field',evidence:[runtime],proofReceipts:[p]});
assert.equal(deterministicA.receipt,deterministicB.receipt);
assert.deepEqual(deterministicA.field,deterministicB.field);

console.log('R435 RUNTIME-DERIVED REPRESENTATION PASS · runtime/evidence/proof lineage drives claim ceiling · unsupported completion held');