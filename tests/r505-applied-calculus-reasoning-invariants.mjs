import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCalculusNativeWorkerPacketR503,validateReasoningWorkerProposalR503} from '../src/system/calculusNativeAutonomyR503.js';
import {validateReasoningWorkerDecisionR504} from '../src/system/calculusDecisionContinuityR504.js';
import {bindAppliedReasoningWorkerR505} from '../src/system/appliedCalculusReasoningR505.js';
import {calculusNativeRepairInstructionsR504} from '../src/system/autonomousRepairPolicyR314.js';

const read=p=>fs.readFileSync(p,'utf8');
const built=buildCalculusNativeWorkerPacketR503({
 baseSha:'c'.repeat(40),
 capabilitySource:read('src/yearCorpusCapabilityGraphR474.ts'),
 executionSource:read('src/yearCorpusExecutionR473.ts'),
 heightenedLedger:JSON.parse(read('src7/heightenedModeR457.ledger.json')),
 selfBuildState:JSON.parse(read('public/omega-r170-selfbuild-state.json')),
 governedSource:read('src/system/governedSelfBuildContractR245.js'),
});
assert.equal(built.valid,true,built.reasons.join(','));

const proposal={
 schema:'OMEGA_AUTONOMOUS_REPAIR_POLICY_R314',
 residualId:'R388-C-03',
 files:[{path:'src/EarthObservatoryR8.tsx',preimageSha:'d'.repeat(40),replacements:[{before:'x',after:'y'}]}],
 canonicalAdmission:false,
 directProductionMutation:false,
 expectedProofs:['R202 Operational Source Authority','R241 Archive Convergence Visual Intelligence'],
 calculusContextId:built.packet.contextId,
 appliedCalculus:['PRUNE','PROVE','TURN','HEIGHTENED_MODE'],
 alternativesConsidered:['STAY_OBSERVE','TURN_BOUNDED_SOURCE','ESCALATE_FOR_RETURNED_EVIDENCE'],
 selectedAlternative:'TURN_BOUNDED_SOURCE',
 decision:'TURN',
 decisionRationale:'TURN one bounded source step because returned residual evidence is targetable while proof authority stays external.',
 residualEvidenceIds:['R387_CONVERGENCE_MATRIX:R388-C-03'],
 developmentalDelta:{
  targetCapability:'EARTH_TRAVERSAL',
  intendedResidual:'R388-C-03',
  capabilityGain:.4,coherenceGain:.3,autonomyGain:.2,usabilityGain:.35,recoverabilityGain:.15,
  regressionRisk:.08,duplicationRisk:.04,authorityFragmentationRisk:0,
 },
};

const bound=bindAppliedReasoningWorkerR505(built.packet,proposal,{residualId:'R388-C-03'});
assert.equal(bound.valid,true,bound.reasons.join(','));
assert.equal(bound.proposal.workerAttestation.schema,'OMEGA_CALCULUS_NATIVE_WORKER_ATTESTATION_R503');
assert.equal(bound.proposal.workerAttestation.workerClass,'REASONING_DEVELOPER');
assert.equal(bound.proposal.workerAttestation.contextId,built.packet.contextId);
assert.deepEqual(bound.proposal.workerAttestation.alternativesConsidered,bound.proposal.alternativesConsidered);
assert.deepEqual(bound.proposal.workerAttestation.residualEvidenceIds,bound.proposal.residualEvidenceIds);
assert.deepEqual(bound.proposal.workerAttestation.developmentalDelta,bound.proposal.developmentalDelta);
assert.equal(validateReasoningWorkerProposalR503(built.packet,bound.proposal).valid,true);
assert.equal(validateReasoningWorkerDecisionR504(built.packet,bound.proposal,{residualId:'R388-C-03'}).valid,true);

const stale=structuredClone(proposal);stale.calculusContextId='R503:STALE';
assert.equal(bindAppliedReasoningWorkerR505(built.packet,stale,{residualId:'R388-C-03'}).valid,false);
const invented=structuredClone(proposal);invented.appliedCalculus=['MAGIC_OPERATOR','TURN'];
assert.equal(bindAppliedReasoningWorkerR505(built.packet,invented,{residualId:'R388-C-03'}).valid,false);
const thin=structuredClone(proposal);thin.appliedCalculus=['TURN'];
assert.equal(bindAppliedReasoningWorkerR505(built.packet,thin,{residualId:'R388-C-03'}).valid,false);

const instructions=calculusNativeRepairInstructionsR504({calculusWorkerPacket:built.packet});
for(const needle of ['calculusContextId','appliedCalculus','APPLY the calculus','selectedAlternative','decisionRationale','Never drop workerAttestation semantics'])assert.ok(instructions.includes(needle),needle);

const cloud=read('cloudflare/lib/r314-ai-repair.mjs');
for(const needle of ['bindAppliedReasoningWorkerR505','BLOCKED_BY_R505_APPLIED_CALCULUS','validateReasoningWorkerProposalR503','validateReasoningWorkerDecisionR504'])assert.ok(cloud.includes(needle),needle);

console.log('R505 APPLIED CALCULUS REASONING PASS · immutable calculus is system-bound while worker intelligence is proved by exact-context applied alternatives/evidence/delta/decision');
