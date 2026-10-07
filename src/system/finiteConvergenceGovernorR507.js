export const R507_FINITE_CONVERGENCE_SCHEMA='OMEGA_FINITE_CONVERGENCE_GOVERNOR_R507';
export const R507_MAX_SAME_FINGERPRINT_ATTEMPTS=2;
export const R507_MAX_REPAIR_HYPOTHESIS_ATTEMPTS=4;

const CONSUMING_OUTCOMES=new Set(['PROPOSED','FAILED','NO_GAIN','REJECTED']);
const upper=value=>String(value??'').trim().toUpperCase();
const finiteInt=value=>Math.max(0,Math.floor(Number.isFinite(Number(value))?Number(value):0));

export function consumesRepairBudgetR507(outcome){
 return CONSUMING_OUTCOMES.has(upper(outcome));
}

export function repairBudgetR507({
 history=[],
 fingerprint,
 repairId,
 maxSameFingerprint=R507_MAX_SAME_FINGERPRINT_ATTEMPTS,
 maxHypothesis=R507_MAX_REPAIR_HYPOTHESIS_ATTEMPTS,
}={}){
 const rows=Array.isArray(history)?history:[];
 const id=String(repairId||'UNSPECIFIED');
 const fp=String(fingerprint||'UNPROVEN');
 const sameFingerprintAttempts=rows.filter(row=>
  String(row?.repairId||'UNSPECIFIED')===id&&
  String(row?.fingerprint||'UNPROVEN')===fp&&
  consumesRepairBudgetR507(row?.outcome)
 ).length;
 const hypothesisAttempts=rows.filter(row=>
  String(row?.repairId||'UNSPECIFIED')===id&&
  consumesRepairBudgetR507(row?.outcome)
 ).length;
 const sameCap=Math.max(1,finiteInt(maxSameFingerprint)||R507_MAX_SAME_FINGERPRINT_ATTEMPTS);
 const hypothesisCap=Math.max(sameCap,finiteInt(maxHypothesis)||R507_MAX_REPAIR_HYPOTHESIS_ATTEMPTS);
 const remainingSameFingerprint=Math.max(0,sameCap-sameFingerprintAttempts);
 const remainingHypothesis=Math.max(0,hypothesisCap-hypothesisAttempts);
 const allow=remainingSameFingerprint>0&&remainingHypothesis>0;
 const reason=allow
  ?'finite repair budget remains'
  :remainingSameFingerprint===0
   ?'same residual fingerprint + repair hypothesis exhausted; require a changed residual state or repair hypothesis'
   :'repair hypothesis exhausted across residual fingerprints; require a different bounded repair hypothesis or operator-supplied evidence';
 return Object.freeze({
  schema:R507_FINITE_CONVERGENCE_SCHEMA,
  allow,
  repairId:id,
  fingerprint:fp,
  sameFingerprintAttempts,
  hypothesisAttempts,
  maxSameFingerprint:sameCap,
  maxHypothesis:hypothesisCap,
  remainingSameFingerprint,
  remainingHypothesis,
  remaining:Math.min(remainingSameFingerprint,remainingHypothesis),
  reason,
 });
}

export function backlogPotentialR507({
 remaining=0,
 selfEditableCount=0,
 eligibleCount=0,
 heldRecentDeclinesCount=0,
 heldGovernanceCount=0,
}={}){
 const unresolved=finiteInt(remaining);
 const selfEditable=finiteInt(selfEditableCount);
 const eligible=finiteInt(eligibleCount);
 const heldRecentDeclines=finiteInt(heldRecentDeclinesCount);
 const heldGovernance=finiteInt(heldGovernanceCount);
 let state='ACTIVE';
 if(unresolved===0)state='COMPLETE';
 else if(selfEditable===0)state='AWAIT_EXTERNAL_OR_GOVERNANCE_EVIDENCE';
 else if(eligible===0)state='HELD_UNTIL_NEW_EVIDENCE';
 return Object.freeze({
  schema:R507_FINITE_CONVERGENCE_SCHEMA,
  state,
  remaining:unresolved,
  selfEditable,
  eligible,
  heldRecentDeclines,
  heldGovernance,
  mutationBudget:eligible,
  terminalForCurrentEvidence:state!=='ACTIVE',
  reason:state==='ACTIVE'
   ?'at least one unresolved self-editable convergence item remains eligible'
   :state==='COMPLETE'
    ?'all convergence backlog items are completed or independently advanced'
    :state==='HELD_UNTIL_NEW_EVIDENCE'
     ?'all unresolved self-editable items are held by returned decline evidence; retries are forbidden until the evidence state changes'
     :'remaining obligations are external/governance-only and cannot be honestly self-mutated',
 });
}

export function finiteConvergencePotentialR507({
 selfBuildState={},
 retry=null,
 backlog=null,
 openAutonomousCandidates=0,
}={}){
 const maxGenerations=finiteInt(selfBuildState?.maxAutonomousGenerations);
 const admitted=Array.isArray(selfBuildState?.admittedSourceCapsules)?selfBuildState.admittedSourceCapsules.length:0;
 const staticRemaining=Math.max(0,maxGenerations-admitted);
 const r314Remaining=retry?.allow===true?finiteInt(retry.remaining??Math.min(retry.remainingSameFingerprint??0,retry.remainingHypothesis??0)):0;
 const r388Remaining=finiteInt(backlog?.potential?.mutationBudget??backlog?.eligibleCount??0);
 const openCandidates=finiteInt(openAutonomousCandidates);
 const mutationBudget=staticRemaining+r314Remaining+r388Remaining;
 const terminalForCurrentEvidence=openCandidates===0&&mutationBudget===0;
 return Object.freeze({
  schema:R507_FINITE_CONVERGENCE_SCHEMA,
  staticRemaining,
  r314Remaining,
  r388Remaining,
  openCandidates,
  mutationBudget,
  terminalForCurrentEvidence,
  terminalState:terminalForCurrentEvidence
   ?String(backlog?.potential?.state||'QUIESCENT')
   :'ACTIVE',
  law:'For one fixed evidence epoch, every autonomous mutation must consume at least one unit of a finite budget. One-open-candidate serialization prevents concurrent mutation. A depleted budget may be replenished only by independently returned new evidence or a changed bounded repair hypothesis, never by retrying a held result.',
  canonicalAdmission:false,
  directProductionMutation:false,
 });
}

export const R507_FINITE_CONVERGENCE_LAWS=Object.freeze([
 'PROPOSED_REPAIR_CONSUMES_RETRY_BUDGET',
 'SAME_FINGERPRINT_PLUS_HYPOTHESIS_IS_FINITE',
 'SAME_HYPOTHESIS_ACROSS_FINGERPRINT_CHURN_IS_FINITE',
 'HELD_R388_ITEM_IS_NOT_RESELECTED_WITHOUT_NEW_EVIDENCE',
 'DECLINE_SCAR_CARRY_MAY_REDUCE_ELIGIBLE_SET_BUT_MUST_NOT_ADVANCE_COMPLETION',
 'ONE_OPEN_AUTONOMOUS_CANDIDATE_SERIALIZES_MUTATION',
 'ZERO_MUTATION_BUDGET_MEANS_QUIESCENT_NOT_RETRY',
 'EXTERNAL_OR_GOVERNANCE_OBLIGATION_NEVER_FORCES_FAKE_SELF_MUTATION',
 'R125_CANON_ADMISSION_AND_CI_PRODUCTION_AUTHORITY_REMAIN_UNCHANGED',
]);
