import type {SaiImprovementProposal} from './saiB059Runtime';

export const SAI_HYBRID_HANDOFF_REVISION='R196.1';
export const SAI_HYBRID_HANDOFF_SCHEMA='OMEGA_SAI_HYBRID_GOVERNED_HANDOFF_R196_1';
export const SAI_HYBRID_HANDOFF_BOUNDARY='SAI may compile a source-grounded request into the existing Hybrid draft/validation contract. This handoff never confirms, queues, claims, or executes native work.';

export type SaiHybridHandoffR1961={
 schema:typeof SAI_HYBRID_HANDOFF_SCHEMA;
 revision:typeof SAI_HYBRID_HANDOFF_REVISION;
 proposalId:string;
 stateId:number;
 address:number;
 decision:string;
 priority:string;
 root:'.';
 prompt:string;
 expectedDraftState:'DRAFT_ONLY_NOT_QUEUED';
 confirmationRequired:true;
 deviceBindingRequiredForExecution:true;
 mayQueue:false;
 mayConfirm:false;
 mayExecute:false;
 canonicalMutation:false;
 canonicalAdmissionAuthority:'R125';
 authorityChain:string[];
 boundary:string;
};

function clean(text:unknown){return String(text??'').replace(/\s+/g,' ').trim()}

export function compileSaiHybridHandoffR1961(proposal:SaiImprovementProposal):SaiHybridHandoffR1961{
 const observations=proposal.observations.map(clean).filter(Boolean).slice(0,8);
 const targets=proposal.targets.map(x=>`${clean(x.area)}: ${clean(x.reason)} ACCEPTANCE: ${clean(x.acceptance)}`).slice(0,8);
 const prompt=[
  `OMEGA SAI governed improvement proposal ${clean(proposal.proposalId)}.`,
  `Current state ${Number(proposal.stateId)} at address ${Number(proposal.address)}; decision ${clean(proposal.decision)}; priority ${clean(proposal.priority)}.`,
  'Treat this only as a bounded candidate request. Inspect the current project, preserve accepted production behavior and authority boundaries, identify the smallest source-backed change that can satisfy the proposal, hash affected inputs, and prepare a typed governed plan.',
  observations.length?`OBSERVATIONS: ${observations.join(' | ')}`:'OBSERVATIONS: none supplied.',
  targets.length?`TARGETS: ${targets.join(' | ')}`:'TARGETS: none supplied.',
  'Do not claim the PC is online without current authenticated heartbeat proof. Do not silently mutate source, queue native work, alter foundation weights, deploy, promote, or admit CanonState. Return a DRAFT_ONLY_NOT_QUEUED plan for explicit review and validation.'
 ].join(' ');
 return{
  schema:SAI_HYBRID_HANDOFF_SCHEMA,revision:SAI_HYBRID_HANDOFF_REVISION,proposalId:proposal.proposalId,stateId:Number(proposal.stateId),address:Number(proposal.address),decision:proposal.decision,priority:proposal.priority,root:'.',prompt,
  expectedDraftState:'DRAFT_ONLY_NOT_QUEUED',confirmationRequired:true,deviceBindingRequiredForExecution:true,mayQueue:false,mayConfirm:false,mayExecute:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  authorityChain:['B059_SAI_PROPOSAL','R196_1_HANDOFF_COMPILER','R8_HYBRID_DRAFT','R8_HYBRID_VALIDATION','OPERATOR_REVIEW_CONFIRMATION','R147_EXECUTOR_SELECTION','AUTHENTICATED_HYBRID_ADMISSION','R141_EXACT_RETURN_PROOF','R146_DURABLE_HISTORY','R125_SEPARATE_CANON_ADMISSION'],
  boundary:SAI_HYBRID_HANDOFF_BOUNDARY
 };
}

export function verifyHybridDraftForSaiR1961(handoff:SaiHybridHandoffR1961,draft:any,validation?:any){
 const errors:string[]=[];
 if(!draft||typeof draft!=='object')errors.push('HYBRID_DRAFT_MISSING');
 if(String(draft?.state||'')!==handoff.expectedDraftState)errors.push('DRAFT_STATE_NOT_HELD');
 if(draft?.confirmed!==false)errors.push('DRAFT_MUST_BE_UNCONFIRMED');
 if(draft?.deviceId!==null)errors.push('DRAFT_MUST_NOT_BIND_DEVICE');
 if(!Array.isArray(draft?.operations)||draft.operations.length<1)errors.push('TYPED_OPERATIONS_MISSING');
 if(validation&&validation.valid!==true)errors.push('HYBRID_VALIDATION_FAILED');
 return{schema:'OMEGA_SAI_HYBRID_HANDOFF_PROOF_R196_1',revision:SAI_HYBRID_HANDOFF_REVISION,passed:errors.length===0,errors,proposalId:handoff.proposalId,draftState:draft?.state??null,confirmed:draft?.confirmed??null,deviceId:draft?.deviceId??null,operationCount:Array.isArray(draft?.operations)?draft.operations.length:0,validationPassed:validation?.valid===true,queueMutation:false,executionClaimed:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125' as const};
}
