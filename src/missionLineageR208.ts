export const R208_REVISION='R208';
export const R208_SCHEMA='OMEGA_END_TO_END_MISSION_LINEAGE_R208';
export const R208_EVENT='omega-r208-lineage-ready';
export const R208_STORAGE_KEY='omega.r208.pendingLineage';
export const R208_BOUNDARY='R208 correlates existing evidence, proposal, held-plan, authorization, executor, return-proof, durable-history and residual identities. It creates no queue, dispatch, device, persistence-owner, scientific-truth or CanonState authority.';
export const R208_INDEPENDENCE_LAW='DERIVED_OR_DESCENDANT_NODES_MAY_NOT_BE_COUNTED_AS_INDEPENDENT_EMPIRICAL_CONFIRMATION_OF_THEIR_ANCESTORS';

export type R208NodeKind='SOURCE_EVIDENCE'|'DERIVED_PROPOSAL'|'HELD_PLAN'|'PLAN_VALIDATION'|'OPERATOR_AUTHORIZATION'|'EXECUTOR_BINDING'|'EXECUTION_RETURN'|'PROOF_CLOSURE'|'DURABLE_HISTORY'|'RESIDUAL'|'REPAIR_PROPOSAL';
export type R208Node={kind:R208NodeKind;id:string;authority:string;parentIds:string[];independence:'EMPIRICAL_SOURCE'|'DERIVED'|'GOVERNANCE'|'EXECUTION'|'PROOF'|'HISTORY';canonicalMutation:false};
export type R208LineageEnvelope={
 schema:typeof R208_SCHEMA;
 revision:typeof R208_REVISION;
 lineageId:string;
 proposalId:string;
 stateId:number;
 address:number;
 draftFingerprint:string;
 draftState:'DRAFT_ONLY_NOT_QUEUED';
 validationState:'VALIDATED_HELD';
 operatorImportRequired:true;
 operatorAccepted:false;
 deviceId:null;
 queueMutation:false;
 dispatchMutation:false;
 executionClaimed:false;
 canonicalMutation:false;
 canonicalAdmissionAuthority:'R125';
 executionHistoryAuthority:'R146';
 executorAuthority:'R147';
 hybridReturnProofAuthority:'R141';
 storageAuthority:'BROWSER_CORRELATION_ONLY';
 independenceLaw:typeof R208_INDEPENDENCE_LAW;
 boundary:typeof R208_BOUNDARY;
 nodes:R208Node[];
 ancestrySha256:string;
 heldDraft:any;
};

const stable=(value:any):any=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const canonical=(value:any)=>JSON.stringify(stable(value));
const clean=(v:any,n=400)=>String(v??'').trim().slice(0,n);
async function sha256(value:any){const bytes=new TextEncoder().encode(typeof value==='string'?value:canonical(value)),digest=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}

export function verifyHeldDraftR208(draft:any,validation:any){
 const errors:string[]=[];
 if(!draft||typeof draft!=='object')errors.push('DRAFT_MISSING');
 if(draft?.state!=='DRAFT_ONLY_NOT_QUEUED')errors.push('DRAFT_NOT_HELD');
 if(draft?.confirmed!==false)errors.push('DRAFT_ALREADY_CONFIRMED');
 if(draft?.deviceId!==null)errors.push('DRAFT_ALREADY_DEVICE_BOUND');
 if(!clean(draft?.fingerprint,256))errors.push('DRAFT_FINGERPRINT_MISSING');
 if(!Array.isArray(draft?.operations)||draft.operations.length<1)errors.push('DRAFT_OPERATIONS_MISSING');
 if(validation?.valid!==true)errors.push('PLAN_VALIDATION_REQUIRED');
 return{ok:errors.length===0,errors};
}

export async function compileSaiHybridLineageR208(input:{proposalId:string;stateId:number;address:number;draft:any;validation:any;evidenceRefs?:string[]}):Promise<R208LineageEnvelope>{
 const checked=verifyHeldDraftR208(input.draft,input.validation);if(!checked.ok)throw new Error(`R208 held-draft boundary failed: ${checked.errors.join(', ')}`);
 const proposalId=clean(input.proposalId,180),draftFingerprint=clean(input.draft.fingerprint,256);if(!proposalId)throw new Error('R208 proposal identity required');
 const evidenceRefs=(input.evidenceRefs||[]).map(x=>clean(x,256)).filter(Boolean).slice(0,32);
 const proposalNodeId=`proposal:${proposalId}`,draftNodeId=`draft:${draftFingerprint}`,validationDigest=await sha256({draftFingerprint,valid:true,errors:Array.isArray(input.validation?.errors)?input.validation.errors:[]}),validationNodeId=`validation:${validationDigest}`;
 const nodes:R208Node[]=[
  ...evidenceRefs.map(id=>({kind:'SOURCE_EVIDENCE' as const,id,authority:'SOURCE_AUTHORITY',parentIds:[],independence:'EMPIRICAL_SOURCE' as const,canonicalMutation:false as const})),
  {kind:'DERIVED_PROPOSAL',id:proposalNodeId,authority:'B059_SAI_PROPOSAL',parentIds:evidenceRefs,independence:'DERIVED',canonicalMutation:false},
  {kind:'HELD_PLAN',id:draftNodeId,authority:'R196_1_TO_R8_HYBRID_DRAFT',parentIds:[proposalNodeId],independence:'DERIVED',canonicalMutation:false},
  {kind:'PLAN_VALIDATION',id:validationNodeId,authority:'R8_HYBRID_VALIDATION',parentIds:[draftNodeId],independence:'PROOF',canonicalMutation:false}
 ];
 const ancestryBody={proposalId,stateId:Number(input.stateId),address:Number(input.address),draftFingerprint,draftState:'DRAFT_ONLY_NOT_QUEUED',validationState:'VALIDATED_HELD',nodes};
 const ancestrySha256=await sha256(ancestryBody),lineageId=`r208_${ancestrySha256.slice(0,32)}`;
 return{schema:R208_SCHEMA,revision:R208_REVISION,lineageId,proposalId,stateId:Number(input.stateId),address:Number(input.address),draftFingerprint,draftState:'DRAFT_ONLY_NOT_QUEUED',validationState:'VALIDATED_HELD',operatorImportRequired:true,operatorAccepted:false,deviceId:null,queueMutation:false,dispatchMutation:false,executionClaimed:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',executionHistoryAuthority:'R146',executorAuthority:'R147',hybridReturnProofAuthority:'R141',storageAuthority:'BROWSER_CORRELATION_ONLY',independenceLaw:R208_INDEPENDENCE_LAW,boundary:R208_BOUNDARY,nodes,ancestrySha256,heldDraft:stable(input.draft)};
}

export function readPendingLineageR208():R208LineageEnvelope|null{try{const raw=localStorage.getItem(R208_STORAGE_KEY);if(!raw)return null;const value=JSON.parse(raw);return value?.schema===R208_SCHEMA&&value?.revision===R208_REVISION?value:null}catch{return null}}
export function publishPendingLineageR208(lineage:R208LineageEnvelope){
 if(lineage.operatorAccepted!==false||lineage.queueMutation!==false||lineage.dispatchMutation!==false||lineage.executionClaimed!==false)throw new Error('R208 pending lineage may not carry execution authority');
 try{localStorage.setItem(R208_STORAGE_KEY,JSON.stringify(lineage));window.dispatchEvent(new CustomEvent(R208_EVENT,{detail:{lineageId:lineage.lineageId,proposalId:lineage.proposalId,draftFingerprint:lineage.draftFingerprint}}))}catch{}
 return lineage;
}
export function clearPendingLineageR208(){try{localStorage.removeItem(R208_STORAGE_KEY)}catch{}}

export function acceptPendingLineageR208(lineage:R208LineageEnvelope|null){
 if(!lineage||lineage.schema!==R208_SCHEMA||lineage.revision!==R208_REVISION)return{ok:false as const,code:'R208_LINEAGE_MISSING'};
 const held=verifyHeldDraftR208(lineage.heldDraft,{valid:lineage.validationState==='VALIDATED_HELD'});if(!held.ok)return{ok:false as const,code:'R208_LINEAGE_DRAFT_INVALID',errors:held.errors};
 if(lineage.operatorAccepted!==false||lineage.deviceId!==null||lineage.queueMutation!==false||lineage.dispatchMutation!==false||lineage.executionClaimed!==false)return{ok:false as const,code:'R208_LINEAGE_AUTHORITY_VIOLATION'};
 return{ok:true as const,lineageId:lineage.lineageId,proposalId:lineage.proposalId,draftFingerprint:lineage.draftFingerprint,draft:stable(lineage.heldDraft),acceptance:{state:'OPERATOR_IMPORTED_HELD_DRAFT' as const,operatorConfirmationStillRequired:true,deviceBindingRequired:true,queueMutation:false as const,dispatchMutation:false as const,executionClaimed:false as const,canonicalMutation:false as const,canonicalAdmissionAuthority:'R125' as const}};
}
