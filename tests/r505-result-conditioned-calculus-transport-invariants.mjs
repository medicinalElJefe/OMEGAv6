import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCalculusNativeWorkerPacketR503} from '../src/system/calculusNativeAutonomyR503.js';
import {validateReasoningWorkerProposalR503} from '../src/system/calculusNativeAutonomyR503.js';
import {validateReasoningWorkerDecisionR504} from '../src/system/calculusDecisionContinuityR504.js';
import {
  R505_DECISION_CAPSULE_SCHEMA,
  R505_DECISION_CONSEQUENCES,
  bindCalculusDecisionCapsuleR505,
  validateCalculusDecisionCapsuleR505,
} from '../cloudflare/lib/r505-result-conditioned-calculus.mjs';
import {proposeAiRepairR314} from '../cloudflare/lib/r314-ai-repair.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const built=buildCalculusNativeWorkerPacketR503({
  baseSha:'5'.repeat(40),
  capabilitySource:read('src/yearCorpusCapabilityGraphR474.ts'),
  executionSource:read('src/yearCorpusExecutionR473.ts'),
  heightenedLedger:JSON.parse(read('src7/heightenedModeR457.ledger.json')),
  selfBuildState:JSON.parse(read('public/omega-r170-selfbuild-state.json')),
  governedSource:read('src/system/governedSelfBuildContractR245.js'),
});
assert.equal(built.valid,true,built.reasons.join(','));

const reconstruction={
  canonAdmission:'R125',
  executionReceipt:'R142',
  residualEvidence:'R164',
  sourcePromotion:'R240',
  productionWriter:'ci.yml',
  capabilityConvergenceUnit:'CAPABILITY_LINEAGE_NOT_ROUTE',
  developmentalMode:'HEIGHTENED_MODE',
  decisionLaw:['STAY','TURN','ESCALATE'],
  growthDefinition:'INCREASE_IN_REACHABLE_COHERENT_LAWFUL_POSSIBILITY',
  proofSequence:['PRUNE','TRANSLATE','PROVE'],
  physicalDimensionInflation:false,
  presentationDefinesCapability:false,
  rendererMayRewriteTruth:false,
  canonicalMutation:false,
};
const vetoes={
  newPhysicalPrimitive:false,
  canonAuthorityChange:false,
  truthClassInflation:false,
  presentationAsAuthority:false,
  directProductionMutation:false,
};
const delta={
  targetCapability:'EARTH_TRAVERSAL',
  intendedResidual:'R388-C-03',
  capabilityGain:.36,
  coherenceGain:.29,
  autonomyGain:.22,
  usabilityGain:.31,
  recoverabilityGain:.18,
  regressionRisk:.07,
  duplicationRisk:.03,
  authorityFragmentationRisk:0,
};
const turnCapsule={
  schema:R505_DECISION_CAPSULE_SCHEMA,
  contextId:built.packet.contextId,
  baseSha:built.packet.baseSha,
  residualId:'R388-C-03',
  reconstruction,
  vetoes,
  alternativesConsidered:['STAY_OBSERVE_CURRENT_EVIDENCE','TURN_BOUNDED_EARTH_SOURCE','ESCALATE_FOR_EXTERNAL_PROOF'],
  selectedAlternative:'TURN_BOUNDED_EARTH_SOURCE',
  decision:'TURN',
  decisionRationale:'The reproducible Earth traversal residual has bounded current product source and independent R202/R241 proof, so one narrow TURN is admissible.',
  residualEvidenceIds:['R387_CONVERGENCE_MATRIX:R388-C-03'],
  developmentalDelta:delta,
};

let checked=validateCalculusDecisionCapsuleR505(built.packet,turnCapsule,{residualId:'R388-C-03'});
assert.equal(checked.valid,true,checked.reasons.join(','));
assert.equal(checked.consequence,R505_DECISION_CONSEQUENCES.TURN);
assert.equal(checked.sourceMutationRequested,true);
assert.equal(checked.canonicalMutation,false);

const baseProposal={
  schema:'OMEGA_AUTONOMOUS_REPAIR_POLICY_R314',
  residualId:'R388-C-03',
  files:[{path:'src/EarthObservatoryR8.tsx',preimageSha:'a'.repeat(40),replacements:[{before:'const uniqueR505Anchor = 1;',after:'const uniqueR505Anchor = 2;'}]}],
  canonicalAdmission:false,
  directProductionMutation:false,
  expectedProofs:['R202 Operational Source Authority','R241 Archive Convergence Visual Intelligence'],
};
const bound=bindCalculusDecisionCapsuleR505(built.packet,baseProposal,turnCapsule,{residualId:'R388-C-03'});
assert.equal(bound.valid,true,bound.reasons.join(','));
assert.equal(validateReasoningWorkerProposalR503(built.packet,bound.proposal).valid,true);
const r504=validateReasoningWorkerDecisionR504(built.packet,bound.proposal,{residualId:'R388-C-03',mutationProposed:true});
assert.equal(r504.valid,true,r504.reasons.join(','));
assert.equal(r504.developmentalDeltaScore>0,true);

const badPhysical=structuredClone(turnCapsule);
badPhysical.reconstruction.physicalDimensionInflation=true;
checked=validateCalculusDecisionCapsuleR505(built.packet,badPhysical,{residualId:'R388-C-03'});
assert.equal(checked.valid,false);
assert.ok(checked.reasons.includes('R505_RECONSTRUCTION_PHYSICALDIMENSIONINFLATION_INVALID'));

const zeroTurn=structuredClone(turnCapsule);
for(const k of ['capabilityGain','coherenceGain','autonomyGain','usabilityGain','recoverabilityGain'])zeroTurn.developmentalDelta[k]=0;
checked=validateCalculusDecisionCapsuleR505(built.packet,zeroTurn,{residualId:'R388-C-03'});
assert.equal(checked.valid,false);
assert.ok(checked.reasons.includes('R505_TURN_REQUIRES_POSITIVE_DELTA'));

let calls=0;
const fakeAi={
  async run(_model,request){
    calls++;
    if(calls===1)return{response:JSON.stringify(turnCapsule)};
    assert.equal(request.messages[0].content.includes('workerAttestation'),false,'patch phase must not ask the model to duplicate the already-bound R505 attestation');
    return{response:JSON.stringify({
      schema:'OMEGA_AUTONOMOUS_REPAIR_POLICY_R314',
      residualId:'R388-C-03',
      files:[{
        path:'src/EarthObservatoryR8.tsx',
        preimageSha:'a'.repeat(40),
        replacements:[{before:'const uniqueR505Anchor = 1;',after:'const uniqueR505Anchor = 2;'}],
      }],
      canonicalAdmission:false,
      directProductionMutation:false,
      expectedProofs:['R202 Operational Source Authority','R241 Archive Convergence Visual Intelligence'],
    })};
  },
};
const integrated=await proposeAiRepairR314({
  ai:fakeAi,
  model:'R505_TEST_MODEL',
  residual:{id:'R388-C-03',evidenceId:'R387_CONVERGENCE_MATRIX',summary:'Bounded Earth traversal residual'},
  stage:{id:'R505_TEST_STAGE',paths:['src/EarthObservatoryR8.tsx'],calculusWorkerPacket:built.packet},
  contextFiles:[{path:'src/EarthObservatoryR8.tsx',sha:'a'.repeat(40),text:'const uniqueR505Anchor = 1;'}],
  maxAttempts:1,
});
assert.equal(calls,2,'R505 must decide first and generate source only after TURN');
assert.equal(integrated.ok,true,integrated.reasons?.join(','));
assert.equal(integrated.proposal.decision,'TURN');
assert.equal(integrated.proposal.workerAttestation.workerClass,'REASONING_DEVELOPER');
assert.equal(integrated.proposal.workerAttestation.contextId,built.packet.contextId);
assert.equal(integrated.patches.length,1);

const stayCapsule=structuredClone(turnCapsule);
stayCapsule.selectedAlternative='STAY_OBSERVE_CURRENT_EVIDENCE';
stayCapsule.decision='STAY';
stayCapsule.decisionRationale='Current evidence is insufficient to justify changing source, so preserve the state and carry the residual forward.';
let stayCalls=0;
const stayAi={async run(){stayCalls++;return{response:JSON.stringify(stayCapsule)}}};
const stayed=await proposeAiRepairR314({
  ai:stayAi,
  model:'R505_TEST_MODEL',
  residual:{id:'R388-C-03',evidenceId:'R387_CONVERGENCE_MATRIX'},
  stage:{id:'R505_STAY_STAGE',paths:['src/EarthObservatoryR8.tsx'],calculusWorkerPacket:built.packet},
  contextFiles:[{path:'src/EarthObservatoryR8.tsx',sha:'a'.repeat(40),text:'const uniqueR505Anchor = 1;'}],
  maxAttempts:1,
});
assert.equal(stayCalls,1,'STAY must terminate before source generation');
assert.equal(stayed.ok,false);
assert.equal(stayed.state,'R505_DECISION_STAY');
assert.equal(stayed.decisionR505.decision,'STAY');

const source=read('cloudflare/lib/r314-ai-repair.mjs');
for(const token of ['proposeCalculusDecisionR505','bindCalculusDecisionCapsuleR505','R505_DECISION_','calculusDecisionR505'])assert.ok(source.includes(token),'R505 cloud integration missing '+token);

console.log('R505 RESULT-CONDITIONED CALCULUS TRANSPORT PASS · decision outcome gates source generation · TURN binds exact R503/R504 attestation · STAY stops before mutation · physical-dimension and authority inflation remain vetoed');
