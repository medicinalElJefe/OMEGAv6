import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDurableCalculusDecisionR506,R506_DURABLE_CALCULUS_DECISION_SCHEMA} from '../src/system/durableCalculusDecisionR506.js';

const repair={
 ok:true,
 proposal:{
  calculusContextId:'R503:'+('a'.repeat(40))+':R457:R170:R240:69',
  appliedCalculus:['PRUNE','PROVE','HEIGHTENED_MODE'],
  alternativesConsidered:['STAY_AND_OBSERVE','TURN_BOUNDED_PATCH','ESCALATE_EXTERNAL_PROOF'],
  selectedAlternative:'TURN_BOUNDED_PATCH',
  decision:'TURN',
  decisionRationale:'Returned residual evidence supports one bounded source turn while preserving every authority boundary.',
  residualEvidenceIds:['R164:SIMULATED_RESIDUAL'],
  developmentalDelta:{
   targetCapability:'SIM_CAP',intendedResidual:'SIM_RESIDUAL',
   capabilityGain:.4,coherenceGain:.3,autonomyGain:.2,usabilityGain:.2,recoverabilityGain:.2,
   regressionRisk:.1,duplicationRisk:.05,authorityFragmentationRisk:0,
  },
 },
 workerApplication:{valid:true,contextId:'R503:'+('a'.repeat(40))+':R457:R170:R240:69'},
 workerDecision:{valid:true,decision:'TURN',developmentalDeltaScore:1.15},
};
const built=buildDurableCalculusDecisionR506(repair,{residualId:'SIM_RESIDUAL',baseSha:'a'.repeat(40)});
assert.equal(built.schema,R506_DURABLE_CALCULUS_DECISION_SCHEMA);
assert.equal(built.valid,true,built.reasons.join(','));
assert.equal(built.decision,'TURN');
assert.equal(built.selectedAlternative,'TURN_BOUNDED_PATCH');
assert.equal(built.resultCondition.state,'PREDICTED_PENDING_RETURNED_PROOF');
assert.equal(built.canonicalMutation,false);
assert.ok(built.developmentalDeltaScore>0);

const broken=structuredClone(repair);
broken.proposal.selectedAlternative='NOT_CONSIDERED';
assert.equal(buildDurableCalculusDecisionR506(broken,{residualId:'SIM_RESIDUAL'}).valid,false);

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
for(const needle of ['buildDurableCalculusDecisionR506','calculusDecisionR506','PREDICTED_PENDING_RETURNED_PROOF']){
 assert.ok(machine.includes(needle),'CLOUD-01 missing durable calculus decision binding: '+needle);
}
console.log('R506 DURABLE CALCULUS DECISION PASS · applied reasoning survives proposal boundary as exact residual-bound developmental evidence');
