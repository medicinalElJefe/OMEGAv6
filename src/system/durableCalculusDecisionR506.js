import {developmentalDeltaScoreR503} from './calculusNativeAutonomyR503.js';

export const R506_DURABLE_CALCULUS_DECISION_SCHEMA='OMEGA_DURABLE_CALCULUS_DECISION_R506';

const nonEmpty=v=>typeof v==='string'&&v.trim().length>0;
const uniq=a=>[...new Set(Array.isArray(a)?a.map(v=>String(v).trim()).filter(Boolean):[])];

export function buildDurableCalculusDecisionR506(repair,{residualId=null,baseSha=null}={}){
 const reasons=[];
 const proposal=repair?.proposal||{};
 const application=repair?.workerApplication||{};
 const decisionProof=repair?.workerDecision||{};
 const contextId=String(proposal?.calculusContextId||application?.contextId||decisionProof?.contextId||'');
 const appliedCalculus=uniq(proposal?.appliedCalculus);
 const alternatives=uniq(proposal?.alternativesConsidered);
 const selectedAlternative=String(proposal?.selectedAlternative||'');
 const decision=String(proposal?.decision||'');
 const decisionRationale=String(proposal?.decisionRationale||'').trim();
 const residualEvidenceIds=uniq(proposal?.residualEvidenceIds);
 const developmentalDelta=proposal?.developmentalDelta&&typeof proposal.developmentalDelta==='object'
  ? structuredClone(proposal.developmentalDelta):null;
 const developmentalDeltaScore=developmentalDelta?developmentalDeltaScoreR503(developmentalDelta):0;

 if(repair?.ok!==true)reasons.push('R506_REPAIR_NOT_ACCEPTED');
 if(application?.valid!==true)reasons.push('R506_R505_APPLICATION_NOT_VALID');
 if(decisionProof?.valid!==true)reasons.push('R506_R504_DECISION_NOT_VALID');
 if(!nonEmpty(contextId))reasons.push('R506_CONTEXT_ID_REQUIRED');
 if(appliedCalculus.length<2)reasons.push('R506_APPLIED_CALCULUS_REQUIRED');
 if(alternatives.length<2)reasons.push('R506_ALTERNATIVES_REQUIRED');
 if(!selectedAlternative||!alternatives.includes(selectedAlternative))reasons.push('R506_SELECTED_ALTERNATIVE_INVALID');
 if(decision!=='TURN')reasons.push('R506_ACCEPTED_MUTATION_MUST_BE_TURN');
 if(decisionRationale.length<24)reasons.push('R506_DECISION_RATIONALE_TOO_THIN');
 if(residualEvidenceIds.length<1)reasons.push('R506_RESIDUAL_EVIDENCE_REQUIRED');
 if(!developmentalDelta)reasons.push('R506_DEVELOPMENTAL_DELTA_REQUIRED');
 if(residualId&&String(developmentalDelta?.intendedResidual||'')!==String(residualId))reasons.push('R506_RESIDUAL_BINDING_MISMATCH');
 if(!(developmentalDeltaScore>0))reasons.push('R506_POSITIVE_PREDICTED_DELTA_REQUIRED');

 return{
  schema:R506_DURABLE_CALCULUS_DECISION_SCHEMA,
  valid:reasons.length===0,
  reasons,
  contextId:contextId||null,
  baseSha:baseSha||null,
  residualId:residualId||developmentalDelta?.intendedResidual||null,
  appliedCalculus,
  alternativesConsidered:alternatives,
  selectedAlternative:selectedAlternative||null,
  decision:decision||null,
  decisionRationale:decisionRationale||null,
  residualEvidenceIds,
  developmentalDelta,
  developmentalDeltaScore,
  resultCondition:{
   state:'PREDICTED_PENDING_RETURNED_PROOF',
   predictedDeltaScore:developmentalDeltaScore,
   observedOutcome:null,
   observedDeltaScore:null,
   calibrationError:null,
  },
  canonicalAdmission:false,
  directProductionMutation:false,
  canonicalMutation:false,
 };
}
