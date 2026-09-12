export type QtiMemoryClass='WORKING'|'EPISODIC'|'SEMANTIC'|'PROCEDURAL';
export type QtiEvidenceState='OBSERVED'|'DERIVED'|'HYPOTHESIZED'|'VERIFIED'|'DISPUTED'|'DEPRECATED';
export type QtiStage='PROPOSE'|'SIMULATE'|'VERIFY'|'AUTHORIZE'|'EXECUTE'|'OBSERVE'|'AUDIT';
export type QtiGateId='G1_EVIDENCE'|'G2_STATE'|'G3_PERMISSION'|'G4_RESOURCES'|'G5_REVERSIBILITY'|'G6_EXTERNAL_CONSEQUENCE'|'G7_SECURITY'|'G8_HUMAN_AUTHORIZATION'|'G9_SIMULATION'|'G10_POSTCONDITION';
export type QtiMemoryObject={id:string;memoryClass:QtiMemoryClass;contentHash:string;source:string;time:string;confidence:number;writer:string;scope:string;evidenceState:QtiEvidenceState;supersedes?:string;status:'ACTIVE'|'SUPERSEDED'|'QUARANTINED'};
export type QtiResourceVector={depth:number;timeMs:number;toolCalls:number;memoryWrites:number;externalEffects:number;actuatorRequests:number};
export type QtiIntent={id:string;principal:string;scope:string;action:string;stateVersion:string;expiresAt:string;reversible:boolean;externalConsequence:boolean;humanAuthorizationRequired:boolean;inputHash:string};
export type QtiContext={evidenceBound:boolean;stateConsistent:boolean;permissionGranted:boolean;resourcesWithinBudget:boolean;securityClean:boolean;humanAuthorized:boolean;simulationPassed:boolean;postconditionVerified:boolean};
export type QtiGateResult={gate:QtiGateId;pass:boolean;reason:string};
export type QtiTransaction={intent:QtiIntent;stage:QtiStage;gates:QtiGateResult[];authorized:boolean;executionAdmitted:boolean;revoked:boolean;receiptHashSeed:string;truthBoundary:string};

export const QTI_TRUTH_BOUNDARY='The reasoner may propose and simulate but may not authorize itself. Execution requires an independent controller to pass every required gate; completion is not Canon admission.';
export const QTI_STAGE_ORDER:QtiStage[]=['PROPOSE','SIMULATE','VERIFY','AUTHORIZE','EXECUTE','OBSERVE','AUDIT'];
export const QTI_GATE_IDS:QtiGateId[]=['G1_EVIDENCE','G2_STATE','G3_PERMISSION','G4_RESOURCES','G5_REVERSIBILITY','G6_EXTERNAL_CONSEQUENCE','G7_SECURITY','G8_HUMAN_AUTHORIZATION','G9_SIMULATION','G10_POSTCONDITION'];

const gate=(gate:QtiGateId,pass:boolean,reason:string):QtiGateResult=>({gate,pass,reason});
export function evaluateQtiGatesR291(intent:QtiIntent,ctx:QtiContext):QtiGateResult[]{
 const now=Date.now(),expiry=Date.parse(intent.expiresAt),expired=!Number.isFinite(expiry)||expiry<=now;
 return[
  gate('G1_EVIDENCE',ctx.evidenceBound,'Required evidence/provenance is bound.'),
  gate('G2_STATE',ctx.stateConsistent&&!expired,expired?'Intent expired or expiry invalid.':'State version and intent lifetime are consistent.'),
  gate('G3_PERMISSION',ctx.permissionGranted,'Principal has explicit scope permission.'),
  gate('G4_RESOURCES',ctx.resourcesWithinBudget,'Watchdog resource vector is within declared budget.'),
  gate('G5_REVERSIBILITY',intent.reversible||!intent.externalConsequence,'Irreversible external effects require separate escalation.'),
  gate('G6_EXTERNAL_CONSEQUENCE',!intent.externalConsequence||intent.humanAuthorizationRequired,'External consequence requires explicit authorization policy.'),
  gate('G7_SECURITY',ctx.securityClean,'Security/prompt-injection/identity checks passed.'),
  gate('G8_HUMAN_AUTHORIZATION',!intent.humanAuthorizationRequired||ctx.humanAuthorized,'Required human authorization is present.'),
  gate('G9_SIMULATION',ctx.simulationPassed,'Bounded simulation completed without rejecting postconditions.'),
  gate('G10_POSTCONDITION',ctx.postconditionVerified,'Expected postcondition has a verifiable predicate.')
 ];
}

export function beginQtiTransactionR291(intent:QtiIntent):QtiTransaction{return{intent,stage:'PROPOSE',gates:[],authorized:false,executionAdmitted:false,revoked:false,receiptHashSeed:`${intent.id}:${intent.stateVersion}:${intent.inputHash}`,truthBoundary:QTI_TRUTH_BOUNDARY}}
export function advanceQtiTransactionR291(tx:QtiTransaction,next:QtiStage,ctx?:QtiContext):QtiTransaction{
 if(tx.revoked)throw new Error('QTI transaction revoked');
 const current=QTI_STAGE_ORDER.indexOf(tx.stage),target=QTI_STAGE_ORDER.indexOf(next);if(target!==current+1)throw new Error(`QTI stage transition denied: ${tx.stage} → ${next}`);
 let gates=tx.gates,authorized=tx.authorized,executionAdmitted=tx.executionAdmitted;
 if(next==='AUTHORIZE'){
  if(!ctx)throw new Error('QTI authorization requires independent-controller context');gates=evaluateQtiGatesR291(tx.intent,ctx);authorized=gates.every(g=>g.pass);if(!authorized)throw new Error(`QTI authorization denied: ${gates.filter(g=>!g.pass).map(g=>g.gate).join(', ')}`);
 }
 if(next==='EXECUTE'){if(!authorized)throw new Error('QTI execution denied: independent authorization missing');executionAdmitted=true}
 if((next==='OBSERVE'||next==='AUDIT')&&!executionAdmitted)throw new Error(`QTI ${next.toLowerCase()} denied: no admitted execution`);
 return{...tx,stage:next,gates,authorized,executionAdmitted};
}
export function revokeQtiTransactionR291(tx:QtiTransaction,reason:string):QtiTransaction{return{...tx,revoked:true,executionAdmitted:false,truthBoundary:`${QTI_TRUTH_BOUNDARY} Revoked: ${reason}`}}

export function validateQtiMemoryWriteR291(obj:QtiMemoryObject,allowedWriter:string,allowedScope:string){
 if(obj.writer!==allowedWriter)throw new Error('QTI memory write denied: unauthorized writer');
 if(obj.scope!==allowedScope)throw new Error('QTI memory write denied: scope mismatch');
 if(!/^[a-f0-9]{32,128}$/i.test(obj.contentHash))throw new Error('QTI memory write denied: invalid content hash');
 if(obj.confidence<0||obj.confidence>1)throw new Error('QTI memory write denied: confidence outside [0,1]');
 if(obj.evidenceState==='HYPOTHESIZED'&&obj.memoryClass==='PROCEDURAL')throw new Error('QTI procedural-memory write denied: hypothesis cannot become procedure without verification');
 return obj;
}

export function watchdogQtiResourcesR291(actual:QtiResourceVector,budget:QtiResourceVector){const keys=Object.keys(budget) as (keyof QtiResourceVector)[];const exceeded=keys.filter(k=>actual[k]>budget[k]);return{pass:exceeded.length===0,exceeded,actual,budget,action:exceeded.length?'REVOKE':'CONTINUE'}}
