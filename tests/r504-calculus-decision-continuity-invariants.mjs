import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 buildCalculusNativeWorkerPacketR503,
 referenceDeterministicWorkerAttestationR503,
} from '../src/system/calculusNativeAutonomyR503.js';
import {validateReasoningWorkerDecisionR504} from '../src/system/calculusDecisionContinuityR504.js';
import {calculusNativeRepairInstructionsR504,autonomousRepairCorrectionPromptR314} from '../src/system/autonomousRepairPolicyR314.js';

const read=p=>fs.readFileSync(p,'utf8');
const built=buildCalculusNativeWorkerPacketR503({
 baseSha:'b'.repeat(40),
 capabilitySource:read('src/yearCorpusCapabilityGraphR474.ts'),
 executionSource:read('src/yearCorpusExecutionR473.ts'),
 heightenedLedger:JSON.parse(read('src7/heightenedModeR457.ledger.json')),
 selfBuildState:JSON.parse(read('public/omega-r170-selfbuild-state.json')),
 governedSource:read('src/system/governedSelfBuildContractR245.js'),
});
assert.equal(built.valid,true,built.reasons.join(','));

const att=referenceDeterministicWorkerAttestationR503(built.packet);
att.workerClass='REASONING_DEVELOPER';
att.alternativesConsidered=['STAY_OBSERVE','TURN_BOUNDED_SOURCE'];
att.residualEvidenceIds=['R387_CONVERGENCE_MATRIX:R388-C-03'];
att.developmentalDelta={
 targetCapability:'EARTH_TRAVERSAL',
 intendedResidual:'R388-C-03',
 capabilityGain:.35,coherenceGain:.25,autonomyGain:.1,usabilityGain:.3,recoverabilityGain:.15,
 regressionRisk:.08,duplicationRisk:.04,authorityFragmentationRisk:0,
};
const proposal={
 schema:'OMEGA_AUTONOMOUS_REPAIR_POLICY_R314',
 residualId:'R388-C-03',
 files:[{path:'src/EarthObservatoryR8.tsx',preimageSha:'a'.repeat(40),replacements:[{before:'x',after:'y'}]}],
 canonicalAdmission:false,
 directProductionMutation:false,
 expectedProofs:['R202 Operational Source Authority','R241 Archive Convergence Visual Intelligence'],
 workerAttestation:att,
 developmentalDelta:att.developmentalDelta,
 alternativesConsidered:att.alternativesConsidered,
 residualEvidenceIds:att.residualEvidenceIds,
 selectedAlternative:'TURN_BOUNDED_SOURCE',
 decision:'TURN',
 decisionRationale:'Choose one bounded current-source improvement because the residual is targetable and independently proof-bound.',
};
let checked=validateReasoningWorkerDecisionR504(built.packet,proposal,{residualId:'R388-C-03'});
assert.equal(checked.valid,true,checked.reasons.join(','));
assert.equal(checked.developmentalDeltaScore>0,true);

const zero=structuredClone(proposal);
for(const k of ['capabilityGain','coherenceGain','autonomyGain','usabilityGain','recoverabilityGain'])zero.developmentalDelta[k]=0;
zero.workerAttestation.developmentalDelta=zero.developmentalDelta;
checked=validateReasoningWorkerDecisionR504(built.packet,zero,{residualId:'R388-C-03'});
assert.equal(checked.valid,false);
assert.ok(checked.reasons.includes('R504_MUTATION_REQUIRES_POSITIVE_DELTA'));

const stale=structuredClone(proposal);
stale.developmentalDelta.intendedResidual='R388-C-99';
stale.workerAttestation.developmentalDelta=stale.developmentalDelta;
checked=validateReasoningWorkerDecisionR504(built.packet,stale,{residualId:'R388-C-03'});
assert.equal(checked.valid,false);
assert.ok(checked.reasons.includes('R504_INTENDED_RESIDUAL_MISMATCH'));

const stay=structuredClone(proposal);stay.decision='STAY';
checked=validateReasoningWorkerDecisionR504(built.packet,stay,{residualId:'R388-C-03'});
assert.equal(checked.valid,false);
assert.ok(checked.reasons.includes('R504_MUTATION_REQUIRES_TURN'));

const stage={calculusWorkerPacket:built.packet};
const instructions=calculusNativeRepairInstructionsR504(stage);
for(const needle of ['selectedAlternative','decisionRationale','capabilityGain','coherenceGain','autonomyGain','usabilityGain','recoverabilityGain','regressionRisk','duplicationRisk','authorityFragmentationRisk','Never drop workerAttestation'])assert.ok(instructions.includes(needle),needle);

const correction=autonomousRepairCorrectionPromptR314({
 residual:{id:'R388-C-03'},
 stage,
 contextFiles:[{path:'src/EarthObservatoryR8.tsx',sha:'c'.repeat(40),text:'const uniqueR504Anchor = true;'}],
 rejection:{state:'REJECTED_BY_R314_POLICY',reasons:['FILE_1_REPLACEMENT_1_PREIMAGE_OCCURRENCES_0'],proposal:null},
 attempt:2,
});
assert.ok(correction.includes(built.packet.contextId),'correction must carry exact R503 context');
assert.ok(correction.includes('R503/R504 CALCULUS-NATIVE WORKER ADMISSION AND DECISION CONTINUITY'));
assert.ok(correction.includes('capabilityGain'));
assert.ok(correction.includes('selectedAlternative'));

const cloud=read('cloudflare/lib/r314-ai-repair.mjs');
for(const needle of ['validateReasoningWorkerDecisionR504','BLOCKED_BY_R504_CALCULUS_DECISION',"state==='BLOCKED_BY_R504_CALCULUS_DECISION'"])assert.ok(cloud.includes(needle),'cloud retry continuity missing '+needle);

console.log('R504 CALCULUS DECISION CONTINUITY PASS · correction retries retain exact calculus context + residual-bound positive developmental TURN gate');
