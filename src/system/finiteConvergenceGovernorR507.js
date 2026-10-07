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
 contractReadyCount=0,
 needsAcceptanceContractCount=0,
 eligibleCount=0,
 proofReadyCount=0,
 liveBrowserProofDebtCount=0,
 externalEvidenceDebtCount=0,
 invalidContractCount=0,
 heldRecentDeclinesCount=0,
 heldGovernanceCount=0,
}={}){
 const unresolved=finiteInt(remaining);
 const selfEditable=finiteInt(selfEditableCount);
 const contractReady=finiteInt(contractReadyCount);
 const needsAcceptanceContract=finiteInt(needsAcceptanceContractCount);
 const eligible=finiteInt(eligibleCount);
 const proofReady=finiteInt(proofReadyCount);
 const liveBrowserProofDebt=finiteInt(liveBrowserProofDebtCount);
 const externalEvidenceDebt=finiteInt(externalEvidenceDebtCount);
 const invalidContracts=finiteInt(invalidContractCount);
 const heldRecentDeclines=finiteInt(heldRecentDeclinesCount);
 const heldGovernance=finiteInt(heldGovernanceCount);
 let state='ACTIVE_MUTATION';
 if(unresolved===0)state='COMPLETE';
 else if(eligible>0)state='ACTIVE_MUTATION';
 else if(proofReady>0)state='ACTIVE_PROOF';
 else if(invalidContracts>0)state='INVALID_CONTRACT_HELD';
 else if(liveBrowserProofDebt>0)state='AWAIT_LIVE_BROWSER_PROOF';
 else if(externalEvidenceDebt>0)state='AWAIT_EXTERNAL_EVIDENCE';
 else if(contractReady>0&&heldRecentDeclines>=contractReady)state='HELD_UNTIL_NEW_EVIDENCE';
 else if(needsAcceptanceContract>0)state='AWAIT_ACCEPTANCE_CONTRACT';
 else if(selfEditable===0)state='AWAIT_EXTERNAL_OR_GOVERNANCE_EVIDENCE';
 else state='QUIESCENT';
 return Object.freeze({
  schema:R507_FINITE_CONVERGENCE_SCHEMA,
  state,
  remaining:unresolved,
  selfEditable,
  contractReady,
  needsAcceptanceContract,
  eligible,
  proofReady,
  liveBrowserProofDebt,
  externalEvidenceDebt,
  invalidContracts,
  heldRecentDeclines,
  heldGovernance,
  blockers:Object.freeze([
   ...(needsAcceptanceContract>0?['ACCEPTANCE_CONTRACT_REQUIRED']:[]),
   ...(liveBrowserProofDebt>0?['LIVE_BROWSER_PROOF_REQUIRED']:[]),
   ...(externalEvidenceDebt>0?['EXTERNAL_OR_HOST_EVIDENCE_REQUIRED']:[]),
   ...(invalidContracts>0?['INVALID_CAPABILITY_CONTRACT']:[]),
   ...(heldRecentDeclines>0?['RETURNED_DECLINE_EVIDENCE']:[]),
   ...(heldGovernance>0?['EXTERNAL_OR_GOVERNANCE_EVIDENCE']:[]),
  ]),
  mutationBudget:eligible,
  proofBudget:proofReady,
  actionBudget:eligible+proofReady,
  terminalForCurrentEvidence:state!=='ACTIVE_MUTATION'&&state!=='ACTIVE_PROOF',
  reason:state==='ACTIVE_MUTATION'
   ?'at least one unresolved acceptance-contracted convergence item remains mutation-ready'
   :state==='ACTIVE_PROOF'
    ?'at least one qualified current-source proof contract is ready for exact-source evaluation and governed proof-only reconciliation'
   :state==='COMPLETE'
    ?'all convergence backlog items are completed or independently advanced'
    :state==='INVALID_CONTRACT_HELD'
     ?'one or more capability contracts failed R509 qualification and are held before any autonomous action'
     :state==='AWAIT_LIVE_BROWSER_PROOF'
      ?'qualified capability contracts require a non-text exact-head live browser proof before completion; product mutation remains unauthorized'
      :state==='AWAIT_EXTERNAL_EVIDENCE'
       ?'qualified capability contracts require returned provider or Hybrid-host evidence; source mutation remains unauthorized'
       :state==='HELD_UNTIL_NEW_EVIDENCE'
        ?'all action-ready contracted items are held by returned decline evidence; retries are forbidden until the evidence state changes'
        :state==='AWAIT_ACCEPTANCE_CONTRACT'
         ?'unresolved self-editable objectives remain without explicit qualified contracts; autonomous mutation is forbidden until proof criteria are defined'
         :state==='AWAIT_EXTERNAL_OR_GOVERNANCE_EVIDENCE'
          ?'remaining obligations are external/governance-only and cannot be honestly self-mutated'
          :'no mutation-ready or proof-ready work exists for the current evidence epoch',
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
 const r388ProofRemaining=finiteInt(backlog?.potential?.proofBudget??backlog?.proofReadyCount??0);
 const openCandidates=finiteInt(openAutonomousCandidates);
 const mutationBudget=staticRemaining+r314Remaining+r388Remaining;
 const actionBudget=mutationBudget+r388ProofRemaining;
 const terminalForCurrentEvidence=openCandidates===0&&actionBudget===0;
 return Object.freeze({
  schema:R507_FINITE_CONVERGENCE_SCHEMA,
  staticRemaining,
  r314Remaining,
  r388Remaining,
  r388ProofRemaining,
  openCandidates,
  mutationBudget,
  actionBudget,
  terminalForCurrentEvidence,
  terminalState:terminalForCurrentEvidence
   ?String(backlog?.potential?.state||'QUIESCENT')
   :'ACTIVE',
  law:'For one fixed evidence epoch, every autonomous mutation or governed proof-only reconciliation must consume one finite action slot. Product mutation remains separately bounded. One-open-candidate serialization prevents concurrent action. A depleted action budget may be replenished only by independently returned new evidence, a newly qualified falsifiable capability contract, or a genuinely changed bounded repair hypothesis.',
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
 'UNCONTRACTED_OBJECTIVE_IS_CONTRACT_DEBT_NOT_MUTATION_BUDGET',
 'QUALIFIED_PROOF_ONLY_WORK_IS_ACTION_BUDGET_NOT_MUTATION_BUDGET',
 'EXTERNAL_OR_LIVE_PROOF_CONTRACTS_NEVER_GAIN_SOURCE_MUTATION_AUTHORITY',
 'R125_CANON_ADMISSION_AND_CI_PRODUCTION_AUTHORITY_REMAIN_UNCHANGED',
]);
