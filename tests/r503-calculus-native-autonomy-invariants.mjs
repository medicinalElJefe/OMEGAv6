import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 buildCalculusNativeWorkerPacketR503,
 referenceDeterministicWorkerAttestationR503,
 validateWorkerAttestationR503,
 validateReasoningWorkerProposalR503,
 developmentalDeltaScoreR503,
 R503_ARCHITECTURE_PILLARS,
 R503_DEVELOPMENTAL_OPERATORS,
} from '../src/system/calculusNativeAutonomyR503.js';

const read=p=>fs.readFileSync(p,'utf8');
const heightened=JSON.parse(read('src7/heightenedModeR457.ledger.json'));
const state=JSON.parse(read('public/omega-r170-selfbuild-state.json'));
const built=buildCalculusNativeWorkerPacketR503({
 baseSha:'a'.repeat(40),
 capabilitySource:read('src/yearCorpusCapabilityGraphR474.ts'),
 executionSource:read('src/yearCorpusExecutionR473.ts'),
 heightenedLedger:heightened,
 selfBuildState:state,
 governedSource:read('src/system/governedSelfBuildContractR245.js'),
});
assert.equal(built.valid,true,built.reasons.join(','));
assert.equal(built.packet.architecture.pillars.length,12);
assert.deepEqual(built.packet.architecture.pillars,[...R503_ARCHITECTURE_PILLARS]);
assert.equal(built.packet.architecture.capabilityCount>=69,true);
assert.equal(built.packet.developmentalContinuity.mode,'HEIGHTENED_MODE');
assert.deepEqual(built.packet.calculus.operators,[...R503_DEVELOPMENTAL_OPERATORS]);
assert.equal(built.packet.authority.canonAdmission,'R125');
assert.equal(built.packet.authority.sourcePromotion,'R240');
assert.equal(built.packet.authority.productionWriter,'ci.yml');
assert.equal(built.packet.truthBoundaries.newPhysicalPrimitiveAllowed,false);
assert.equal(built.packet.truthBoundaries.representationalAddressScaleIsPhysicalDimension,false);
assert.equal(built.packet.workerContract.unqualifiedWorkerMutationAllowed,false);

const deterministic=referenceDeterministicWorkerAttestationR503(built.packet);
assert.equal(validateWorkerAttestationR503(built.packet,deterministic).valid,true);
assert.equal(developmentalDeltaScoreR503(deterministic.developmentalDelta),0);

const badPhysical=structuredClone(deterministic);badPhysical.reconstruction.physicalDimensionInflation=true;
assert.equal(validateWorkerAttestationR503(built.packet,badPhysical).valid,false);
const badContext=structuredClone(deterministic);badContext.contextId='R503:STALE';
assert.equal(validateWorkerAttestationR503(built.packet,badContext).valid,false);

const reasoning=structuredClone(deterministic);
reasoning.workerClass='REASONING_DEVELOPER';
reasoning.alternativesConsidered=['STAY_AND_OBSERVE','TURN_WITH_BOUNDED_PRODUCT_PATCH','ESCALATE_FOR_EXTERNAL_PROOF'];
reasoning.residualEvidenceIds=['R164:SIMULATED_CURRENT_RESIDUAL'];
reasoning.developmentalDelta={targetCapability:'SIM_CAP',intendedResidual:'SIM_RESIDUAL',capabilityGain:.4,coherenceGain:.3,autonomyGain:.2,usabilityGain:.3,recoverabilityGain:.2,regressionRisk:.1,duplicationRisk:.05,authorityFragmentationRisk:0};
const proposal={workerAttestation:reasoning,developmentalDelta:reasoning.developmentalDelta,alternativesConsidered:reasoning.alternativesConsidered,residualEvidenceIds:reasoning.residualEvidenceIds};
assert.equal(validateReasoningWorkerProposalR503(built.packet,proposal).valid,true);
assert.equal(developmentalDeltaScoreR503(reasoning.developmentalDelta)>.9,true);

const workflow=read('.github/workflows/r170-governed-selfbuild.yml');
for(const needle of ['OMEGA_R503_REQUIRE_WORKER_ADMISSION','r503-build-calculus-worker-packet.mjs','r503-calculus-native-autonomy-invariants.mjs'])assert.ok(workflow.includes(needle),'R170 workflow missing '+needle);
const engine=read('scripts/r170-selfbuild-engine.mjs');
for(const needle of ['BLOCKED_BY_CALCULUS_LITERACY_GATE','validateWorkerAttestationR503','workerAdmissionR503'])assert.ok(engine.includes(needle),'R170 engine missing '+needle);
const cloud=read('cloudflare/lib/github-machine.mjs');
for(const needle of ['buildCalculusNativeWorkerPacketR503','workerContextR503','calculusWorkerPacket'])assert.ok(cloud.includes(needle),'CLOUD-01 machine missing '+needle);
const ai=read('cloudflare/lib/r314-ai-repair.mjs');
for(const needle of ['validateReasoningWorkerProposalR503','BLOCKED_BY_R503_CALCULUS_LITERACY'])assert.ok(ai.includes(needle),'CLOUD-01 AI gate missing '+needle);
const policy=read('src/system/autonomousRepairPolicyR314.js');
assert.ok(policy.includes('workerAttestation'),'R314 prompt must require calculus worker attestation when supplied');

console.log('R503 CALCULUS-NATIVE AUTONOMY PASS · cold-start packet + deterministic R170 admission + reasoning-worker attestation + developmental delta + fail-closed authority boundaries');
