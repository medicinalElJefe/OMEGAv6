import {
 R503_DECISION_LAW,
 developmentalDeltaScoreR503,
 validateReasoningWorkerProposalR503,
} from './calculusNativeAutonomyR503.js';

export const R504_DECISION_CONTINUITY_SCHEMA='OMEGA_CALCULUS_DECISION_CONTINUITY_R504';

const nonEmpty=v=>typeof v==='string'&&v.trim().length>0;

export function validateReasoningWorkerDecisionR504(packet,proposal,{residualId=null,mutationProposed=null}={}){
 const base=validateReasoningWorkerProposalR503(packet,proposal);
 const reasons=[...base.reasons];
 const alternatives=Array.isArray(proposal?.alternativesConsidered)?proposal.alternativesConsidered.map(String):[];
 const selected=String(proposal?.selectedAlternative||'');
 const decision=String(proposal?.decision||'');
 const rationale=String(proposal?.decisionRationale||'').trim();
 const delta=proposal?.developmentalDelta||{};
 const inferredMutation=mutationProposed===null
  ? Array.isArray(proposal?.files)&&proposal.files.length>0
  : mutationProposed===true;

 if(!nonEmpty(selected))reasons.push('R504_SELECTED_ALTERNATIVE_REQUIRED');
 else if(!alternatives.includes(selected))reasons.push('R504_SELECTED_ALTERNATIVE_NOT_CONSIDERED');
 if(!R503_DECISION_LAW.includes(decision))reasons.push('R504_DECISION_LAW_INVALID');
 if(rationale.length<24)reasons.push('R504_DECISION_RATIONALE_TOO_THIN');
 if(residualId&&String(delta?.intendedResidual||'')!==String(residualId))reasons.push('R504_INTENDED_RESIDUAL_MISMATCH');

 const score=developmentalDeltaScoreR503(delta);
 if(inferredMutation){
  if(decision!=='TURN')reasons.push('R504_MUTATION_REQUIRES_TURN');
  if(!(score>0))reasons.push('R504_MUTATION_REQUIRES_POSITIVE_DELTA');
 }else if(decision==='TURN'){
  reasons.push('R504_TURN_REQUIRES_MUTATION');
 }

 return{
  schema:R504_DECISION_CONTINUITY_SCHEMA,
  valid:reasons.length===0,
  reasons,
  contextId:packet?.contextId||null,
  residualId:residualId||null,
  selectedAlternative:selected||null,
  decision:decision||null,
  developmentalDeltaScore:score,
  mutationProposed:inferredMutation,
 };
}
