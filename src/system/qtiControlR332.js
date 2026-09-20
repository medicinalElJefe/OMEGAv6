export const R332_QTI_SCHEMA='OMEGA_EXECUTABLE_QTI_R332';
export const R332_QTI_REVISION='R332';
export const R332_GATE_IDS=Object.freeze([
 'G1_EVIDENCE_SUFFICIENCY','G2_STATE_CONSISTENCY','G3_PERMISSION','G4_RESOURCE_BUDGET','G5_REVERSIBILITY',
 'G6_EXTERNAL_CONSEQUENCE','G7_SECURITY','G8_HUMAN_AUTHORIZATION','G9_SIMULATION_VALIDATION','G10_POSTCONDITION_VERIFICATION'
]);
export const R332_OUTCOMES=Object.freeze(['PASS','REVISE','ESCALATE','DENY']);
export const R332_ACTION_CLASSES=Object.freeze(['READ_ONLY','REVERSIBLE_LOCAL','EXTERNAL_REVERSIBLE','IRREVERSIBLE','TRAINING']);

const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
const clean=v=>String(v??'').trim();
const bool=v=>v===true;
const actionClass=v=>R332_ACTION_CLASSES.includes(clean(v).toUpperCase())?clean(v).toUpperCase():'READ_ONLY';

const REQUIRED_BY_CLASS=Object.freeze({
 READ_ONLY:Object.freeze(['G1_EVIDENCE_SUFFICIENCY','G2_STATE_CONSISTENCY','G3_PERMISSION','G4_RESOURCE_BUDGET','G7_SECURITY','G10_POSTCONDITION_VERIFICATION']),
 REVERSIBLE_LOCAL:Object.freeze(R332_GATE_IDS.filter(x=>x!=='G6_EXTERNAL_CONSEQUENCE'&&x!=='G8_HUMAN_AUTHORIZATION')),
 EXTERNAL_REVERSIBLE:Object.freeze(R332_GATE_IDS),
 IRREVERSIBLE:Object.freeze(R332_GATE_IDS),
 TRAINING:Object.freeze(['G1_EVIDENCE_SUFFICIENCY','G2_STATE_CONSISTENCY','G3_PERMISSION','G4_RESOURCE_BUDGET','G5_REVERSIBILITY','G7_SECURITY','G8_HUMAN_AUTHORIZATION','G9_SIMULATION_VALIDATION','G10_POSTCONDITION_VERIFICATION'])
});

function result(id,outcome,required,detail,evidence={}){
 return Object.freeze({id,outcome:R332_OUTCOMES.includes(outcome)?outcome:'DENY',required:Boolean(required),detail:clean(detail).slice(0,500),evidence,canonicalAdmission:false});
}
function requiredSet(proposal){
 const klass=actionClass(proposal?.actionClass);
 const base=new Set(REQUIRED_BY_CLASS[klass]);
 if(proposal?.requiresHumanApproval===true)base.add('G8_HUMAN_AUTHORIZATION');
 if(proposal?.requiresSimulation===true)base.add('G9_SIMULATION_VALIDATION');
 if(proposal?.externalEffect===true)base.add('G6_EXTERNAL_CONSEQUENCE');
 if(proposal?.requiresRollback===true)base.add('G5_REVERSIBILITY');
 return{klass,required:base};
}
function aggregate(gates){
 const required=gates.filter(x=>x.required);
 if(required.some(x=>x.outcome==='DENY'))return'DENY';
 if(required.some(x=>x.outcome==='ESCALATE'))return'ESCALATE';
 if(required.some(x=>x.outcome==='REVISE'))return'REVISE';
 return required.length&&required.every(x=>x.outcome==='PASS')?'PASS':'DENY';
}

export function riskClassR332(proposal={}){
 const klass=actionClass(proposal.actionClass);
 if(klass==='IRREVERSIBLE')return'CRITICAL';
 if(klass==='EXTERNAL_REVERSIBLE')return'HIGH';
 if(klass==='TRAINING')return'HIGH';
 if(klass==='REVERSIBLE_LOCAL')return'MEDIUM';
 return'LOW';
}

export function evaluateQtiR332(proposal={},state={}){
 const {klass,required}=requiredSet(proposal),riskClass=riskClassR332(proposal);
 const evidence=proposal?.evidence&&typeof proposal.evidence==='object'?proposal.evidence:{};
 const permissions=proposal?.permissions&&typeof proposal.permissions==='object'?proposal.permissions:{};
 const resources=proposal?.resources&&typeof proposal.resources==='object'?proposal.resources:{};
 const security=proposal?.security&&typeof proposal.security==='object'?proposal.security:{};
 const simulation=proposal?.simulation&&typeof proposal.simulation==='object'?proposal.simulation:{};
 const postcondition=proposal?.postcondition&&typeof proposal.postcondition==='object'?proposal.postcondition:{};
 const reversibility=proposal?.reversibility&&typeof proposal.reversibility==='object'?proposal.reversibility:{};
 const external=proposal?.externalConsequence&&typeof proposal.externalConsequence==='object'?proposal.externalConsequence:{};

 const evidenceQuality=clamp(evidence.quality??0),evidenceCount=Math.max(0,Math.floor(Number(evidence.count)||0));
 const evidenceThreshold=riskClass==='CRITICAL'?.9:riskClass==='HIGH'?.75:riskClass==='MEDIUM'?.55:.35;
 const g1Outcome=evidenceCount>0&&evidenceQuality>=evidenceThreshold?'PASS':evidenceCount>0?'REVISE':'DENY';

 const expectedState=clean(proposal.stateVersion),currentState=clean(state.stateVersion);
 const invariants=Array.isArray(proposal.invariants)?proposal.invariants:[];
 const invariantsPass=invariants.length?invariants.every(x=>x?.pass===true):proposal.invariantsSatisfied===true;
 const stateVersionPass=Boolean(expectedState&&currentState&&expectedState===currentState);
 const g2Outcome=stateVersionPass&&invariantsPass?'PASS':expectedState&&currentState?'DENY':'REVISE';

 const permissionPass=bool(permissions.capability)&&bool(permissions.scopeAllowed)&&permissions.revoked!==true;
 const g3Outcome=permissionPass?'PASS':permissions.revoked===true?'DENY':'REVISE';

 const budgetNames=['compute','time','tokens','memory','network','actions'];
 let budgetSeen=false,budgetExceeded=false;
 for(const name of budgetNames){
  const used=Number(resources?.used?.[name]),limit=Number(resources?.limit?.[name]);
  if(Number.isFinite(used)&&Number.isFinite(limit)){budgetSeen=true;if(used>limit)budgetExceeded=true}
 }
 const g4Outcome=budgetExceeded?'DENY':budgetSeen?'PASS':'REVISE';

 const rollbackRequired=required.has('G5_REVERSIBILITY');
 const rollbackDeclared=bool(reversibility.rollbackAvailable)||bool(reversibility.safeUndo)||klass==='READ_ONLY';
 const irreversibleAcknowledged=klass!=='IRREVERSIBLE'||(bool(reversibility.explicitIrreversible)&&bool(proposal.requiresHumanApproval));
 const g5Outcome=!rollbackRequired?'PASS':rollbackDeclared&&irreversibleAcknowledged?'PASS':klass==='IRREVERSIBLE'?'DENY':'REVISE';

 const externalRequired=required.has('G6_EXTERNAL_CONSEQUENCE');
 const externalClass=clean(external.classification).toUpperCase();
 const externalEffect=proposal.externalEffect===true||externalRequired;
 const externalAllowed=!externalRequired||bool(external.allowed);
 const externalBounded=!externalRequired||['LOW','MEDIUM','HIGH','CRITICAL'].includes(externalClass);
 const g6Outcome=!externalRequired?'PASS':external.allowed===false?'DENY':externalAllowed&&externalBounded?'PASS':'REVISE';

 const securityPass=bool(security.isolated)&&bool(security.inputValidated)&&bool(security.policyIntegrity)&&security.unresolvedCriticalThreat!==true;
 const g7Outcome=security.unresolvedCriticalThreat===true?'DENY':securityPass?'PASS':'REVISE';

 const humanRequired=required.has('G8_HUMAN_AUTHORIZATION');
 const humanPresent=bool(proposal?.humanAuthorization?.approved)&&clean(proposal?.humanAuthorization?.approvalId);
 const humanStateBound=!humanPresent||clean(proposal?.humanAuthorization?.stateVersion)===expectedState;
 const g8Outcome=!humanRequired?'PASS':humanPresent&&humanStateBound?'PASS':humanPresent&&!humanStateBound?'DENY':'ESCALATE';

 const simulationRequired=required.has('G9_SIMULATION_VALIDATION');
 const simulationPassed=simulation.status==='PASS'&&clamp(simulation.confidence)>=((riskClass==='CRITICAL'||riskClass==='HIGH')?.8:.6);
 const g9Outcome=!simulationRequired?'PASS':simulation.status==='FAIL'?'DENY':simulationPassed?'PASS':'REVISE';

 const postPlan=bool(postcondition.observable)&&Array.isArray(postcondition.checks)&&postcondition.checks.length>0;
 const transactionBound=clean(postcondition.transactionId)&&clean(postcondition.stateVersion)===expectedState;
 const g10Outcome=postPlan&&transactionBound?'PASS':'REVISE';

 const gates=[
  result('G1_EVIDENCE_SUFFICIENCY',g1Outcome,required.has('G1_EVIDENCE_SUFFICIENCY'),`evidence ${evidenceCount} @ ${evidenceQuality.toFixed(3)}; threshold ${evidenceThreshold.toFixed(3)}`,{count:evidenceCount,quality:evidenceQuality,threshold:evidenceThreshold}),
  result('G2_STATE_CONSISTENCY',g2Outcome,required.has('G2_STATE_CONSISTENCY'),stateVersionPass&&invariantsPass?'state version and declared invariants match':'state version or invariant proof is incomplete/inconsistent',{expectedState,currentState,invariantsPass}),
  result('G3_PERMISSION',g3Outcome,required.has('G3_PERMISSION'),permissionPass?'capability and scope are admitted':'capability/scope proof missing or revoked',{capability:Boolean(permissions.capability),scopeAllowed:Boolean(permissions.scopeAllowed),revoked:permissions.revoked===true}),
  result('G4_RESOURCE_BUDGET',g4Outcome,required.has('G4_RESOURCE_BUDGET'),budgetExceeded?'declared resource budget exceeded':budgetSeen?'declared budgets within bounds':'resource budget evidence missing',{budgetSeen,budgetExceeded}),
  result('G5_REVERSIBILITY',g5Outcome,required.has('G5_REVERSIBILITY'),rollbackDeclared?'rollback/safe-undo evidence present':'required rollback/recovery evidence missing',{rollbackDeclared,irreversibleAcknowledged}),
  result('G6_EXTERNAL_CONSEQUENCE',g6Outcome,required.has('G6_EXTERNAL_CONSEQUENCE'),externalRequired?'external consequence classification evaluated':'no external-consequence gate required',{externalEffect,classification:externalClass||null,allowed:externalAllowed}),
  result('G7_SECURITY',g7Outcome,required.has('G7_SECURITY'),securityPass?'security/isolation checks pass':'security evidence incomplete or critical threat unresolved',{isolated:Boolean(security.isolated),inputValidated:Boolean(security.inputValidated),policyIntegrity:Boolean(security.policyIntegrity),unresolvedCriticalThreat:security.unresolvedCriticalThreat===true}),
  result('G8_HUMAN_AUTHORIZATION',g8Outcome,required.has('G8_HUMAN_AUTHORIZATION'),humanRequired?(humanPresent?'human approval presented':'human approval required but absent'):'human approval not required by this proposal class',{approved:Boolean(humanPresent),stateBound:Boolean(humanStateBound)}),
  result('G9_SIMULATION_VALIDATION',g9Outcome,required.has('G9_SIMULATION_VALIDATION'),simulationRequired?`simulation ${clean(simulation.status)||'MISSING'} @ ${clamp(simulation.confidence).toFixed(3)}`:'simulation not required',{status:clean(simulation.status)||null,confidence:clamp(simulation.confidence)}),
  result('G10_POSTCONDITION_VERIFICATION',g10Outcome,required.has('G10_POSTCONDITION_VERIFICATION'),postPlan&&transactionBound?'observable postcondition plan is transaction/state bound':'observable state-bound postcondition plan missing',{observable:Boolean(postcondition.observable),checkCount:Array.isArray(postcondition.checks)?postcondition.checks.length:0,transactionBound:Boolean(transactionBound)})
 ];
 const outcome=aggregate(gates);
 const proposalId=clean(proposal.proposalId);
 return Object.freeze({
  schema:R332_QTI_SCHEMA,revision:R332_QTI_REVISION,proposalId:proposalId||null,actionClass:klass,riskClass,outcome,gates,
  requiredGates:[...required],
  authorizationEligible:outcome==='PASS',
  authorizationRequest:outcome==='PASS'?Object.freeze({
   schema:'OMEGA_QTI_AUTHORIZATION_REQUEST_R332',proposalId:proposalId||null,stateVersion:expectedState,transactionId:clean(postcondition.transactionId)||null,riskClass,
   qtiOutcome:'PASS',requiredGates:[...required],canonicalAdmission:false
  }):null,
  authorizedCommand:null,execution:null,observedOutcome:null,canonicalAdmission:false,
  boundary:'R332 QTI verifies a proposal and may emit an authorization request only. QTI is not the independent authorization authority, does not execute actions, does not infer outcome, and does not admit CanonState.'
 });
}

export function verifyObservedOutcomeR332({authorizationRequest,executionReceipt,observation}={}){
 const tx=clean(authorizationRequest?.transactionId),proposalId=clean(authorizationRequest?.proposalId),stateVersion=clean(authorizationRequest?.stateVersion);
 const executionBound=Boolean(tx&&tx===clean(executionReceipt?.transactionId)&&proposalId===clean(executionReceipt?.proposalId));
 const observedBound=Boolean(tx&&tx===clean(observation?.transactionId)&&stateVersion===clean(observation?.stateVersion));
 const checks=Array.isArray(observation?.checks)?observation.checks:[];
 const checksPass=checks.length>0&&checks.every(x=>x?.pass===true);
 const outcome=executionBound&&observedBound&&checksPass?'PASS':executionReceipt?.status==='FAILED'||checks.some(x=>x?.pass===false)?'DENY':'REVISE';
 return Object.freeze({
  schema:'OMEGA_QTI_POSTCONDITION_R332',revision:R332_QTI_REVISION,proposalId:proposalId||null,transactionId:tx||null,outcome,
  executionBound,observedBound,checksPass,checkCount:checks.length,
  successfulOutcome:outcome==='PASS',
  canonicalAdmission:false,
  boundary:'Execution receipt and observed outcome remain distinct. Success exists only when transaction/proposal/state bindings match and every declared postcondition check passes.'
 });
}

export function qtiManifestR332(){
 return Object.freeze({
  schema:R332_QTI_SCHEMA,revision:R332_QTI_REVISION,
  components:['Q quality/evidence','V executable verification','I invariants','R risk classification','G authorization gates'],
  gates:R332_GATE_IDS,
  outcomes:R332_OUTCOMES,
  law:'Execute(a) only after every policy-required gate passes and a separate authorization authority approves the bound request.',
  cognitionAuthority:false,authorizationAuthority:false,executionAuthority:false,canonicalAdmission:false,
  source:'AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS',
  boundary:'R332 operationalizes G1-G10 as a deterministic fail-closed verification plane. Missing mandatory proof never counts as PASS.'
 });
}

export const R332_B12_PROGRESS_RECEIPT=Object.freeze({
 revision:R332_QTI_REVISION,stage:'R314-B12',state:'ACTIVE_PARTIAL',
 implemented:['QTI Q/V/I/R/G executable verifier','G1-G10 deterministic gate engine','risk/action-class required-gate selection','fail-closed missing proof','authorization-request boundary','postcondition outcome verifier'],
 remaining:['independent safety controller expansion','watchdog resource vector','transactional cognition-to-action integration across R147','adversarial acceptance suite','external benchmark/evaluation'],
 canonicalAdmission:false
});
