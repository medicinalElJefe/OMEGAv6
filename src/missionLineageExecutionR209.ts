import {R209_INDEPENDENCE_LAW,R209_REVISION,R209_SCHEMA,type R209LineageEnvelope,type R209Node} from './missionLineageR209';

export const R209_EXECUTION_SCHEMA='OMEGA_R209_EXECUTION_LINEAGE_CORRELATION';
export const R209_EXECUTION_BOUNDARY='This compiler correlates receipts emitted by existing R179/R147/R141/R146/residual authorities. It cannot authorize, dispatch, execute, verify a host return, mutate durable execution history, or admit CanonState.';

type AuthorizationReceipt={missionId:string;runId:string;headSha256:string;state:string};
type ExecutorReceipt={executorId:string;bindingSha256:string};
type ReturnReceipt={jobId?:string;resultFingerprint:string};
type R141Receipt={state:string;fingerprintVerified:boolean;digestMatch:boolean;semanticMatch:boolean;finalHeadSha256:string;resultFingerprintR141?:string};
type R146Receipt={runId:string;state:string;headSha256:string;replayOk:boolean};
type ResidualReceipt={residualId:string;proofRef?:string};
type RepairReceipt={proposalId:string};
export type R209ExecutionCorrelationInput={authorization?:AuthorizationReceipt;executor?:ExecutorReceipt;executionReturn?:ReturnReceipt;r141?:R141Receipt;r146?:R146Receipt;residual?:ResidualReceipt;repairProposal?:RepairReceipt};

const clean=(v:any,n=320)=>String(v??'').trim().slice(0,n);
const stable=(value:any):any=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
async function sha256(value:any){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(value))));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const lastId=(nodes:R209Node[])=>nodes.at(-1)?.id||'';
const node=(kind:R209Node['kind'],id:string,authority:string,parentIds:string[],independence:R209Node['independence']):R209Node=>({kind,id,authority,parentIds,independence,canonicalMutation:false});

export async function compileExecutionLineageR209(base:R209LineageEnvelope,input:R209ExecutionCorrelationInput){
 if(base?.schema!==R209_SCHEMA||base?.revision!==R209_REVISION)throw new Error('R209 base lineage required');
 const nodes=[...base.nodes],errors:string[]=[];
 let completeThrough:R209Node['kind']='PLAN_VALIDATION';
 const parent=()=>lastId(nodes);

 if(input.authorization){
  const a=input.authorization;if(a.state!=='AUTHORIZED_NOT_DISPATCHED')errors.push('R179_AUTHORIZATION_STATE_REQUIRED');
  if(!clean(a.missionId)||!clean(a.runId)||clean(a.headSha256).length<32)errors.push('R179_AUTHORIZATION_IDENTITY_INCOMPLETE');
  if(!errors.length){nodes.push(node('OPERATOR_AUTHORIZATION',`authorization:${clean(a.missionId)}:${clean(a.runId)}:${clean(a.headSha256,128)}`,'R179_EXPLICIT_OPERATOR_AUTHORIZATION',[parent()],'GOVERNANCE'));completeThrough='OPERATOR_AUTHORIZATION'}
 }
 if(input.executor){
  if(completeThrough!=='OPERATOR_AUTHORIZATION')errors.push('R147_REQUIRES_R179_AUTHORIZATION');
  const e=input.executor;if(!clean(e.executorId)||clean(e.bindingSha256).length<32)errors.push('R147_EXECUTOR_BINDING_INCOMPLETE');
  if(!errors.length){nodes.push(node('EXECUTOR_BINDING',`executor:${clean(e.executorId)}:${clean(e.bindingSha256,128)}`,'R147_EXECUTOR_SELECTION_AND_DISPATCH',[parent()],'EXECUTION'));completeThrough='EXECUTOR_BINDING'}
 }
 if(input.executionReturn){
  if(completeThrough!=='EXECUTOR_BINDING')errors.push('EXECUTION_RETURN_REQUIRES_R147_BINDING');
  const r=input.executionReturn;if(clean(r.resultFingerprint).length<16)errors.push('EXECUTION_RESULT_FINGERPRINT_REQUIRED');
  if(!errors.length){nodes.push(node('EXECUTION_RETURN',`return:${clean(r.jobId||'NO_JOB_ID')}:${clean(r.resultFingerprint,256)}`,'EXISTING_EXECUTOR_RETURN',[parent()],'EXECUTION'));completeThrough='EXECUTION_RETURN'}
 }
 if(input.r141){
  if(completeThrough!=='EXECUTION_RETURN')errors.push('R141_PROOF_REQUIRES_EXECUTION_RETURN');
  const p=input.r141;if(p.state!=='VERIFIED_EXECUTION_RETURN'||p.fingerprintVerified!==true||p.digestMatch!==true||p.semanticMatch!==true||clean(p.finalHeadSha256).length<32)errors.push('R141_EXACT_RETURN_PROOF_REQUIRED');
  if(!errors.length){nodes.push(node('PROOF_CLOSURE',`r141:${clean(p.resultFingerprintR141||p.finalHeadSha256,256)}:${clean(p.finalHeadSha256,128)}`,'R141_EXACT_RETURN_PROOF',[parent()],'PROOF'));completeThrough='PROOF_CLOSURE'}
 }
 if(input.r146){
  if(completeThrough!=='PROOF_CLOSURE')errors.push('R146_VERIFIED_HISTORY_REQUIRES_R141_PROOF');
  const h=input.r146;if(h.state!=='VERIFIED'||h.replayOk!==true||!clean(h.runId)||clean(h.headSha256).length<32)errors.push('R146_VERIFIED_REPLAY_REQUIRED');
  if(!errors.length){nodes.push(node('DURABLE_HISTORY',`r146:${clean(h.runId)}:${clean(h.headSha256,128)}`,'R146_DURABLE_EXECUTION_HISTORY',[parent()],'HISTORY'));completeThrough='DURABLE_HISTORY'}
 }
 if(input.residual){
  if(completeThrough!=='DURABLE_HISTORY')errors.push('RESIDUAL_REQUIRES_VERIFIED_DURABLE_HISTORY');
  const r=input.residual;if(!clean(r.residualId))errors.push('RESIDUAL_ID_REQUIRED');
  if(!errors.length){nodes.push(node('RESIDUAL',`residual:${clean(r.residualId)}:${clean(r.proofRef||'NO_PROOF_REF',256)}`,'EXISTING_RESIDUAL_AUTHORITY',[parent()],'DERIVED'));completeThrough='RESIDUAL'}
 }
 if(input.repairProposal){
  if(completeThrough!=='RESIDUAL')errors.push('REPAIR_PROPOSAL_REQUIRES_RESIDUAL');
  const p=input.repairProposal;if(!clean(p.proposalId))errors.push('REPAIR_PROPOSAL_ID_REQUIRED');
  if(!errors.length){nodes.push(node('REPAIR_PROPOSAL',`repair:${clean(p.proposalId)}`,'SAI_GOVERNED_REPAIR_PROPOSAL',[parent()],'DERIVED'));completeThrough='REPAIR_PROPOSAL'}
 }
 if(errors.length)return{ok:false as const,schema:R209_EXECUTION_SCHEMA,revision:R209_REVISION,lineageId:base.lineageId,errors,completeThrough,nodes,canonicalMutation:false as const,canonicalAdmissionAuthority:'R125' as const,boundary:R209_EXECUTION_BOUNDARY};
 const correlationSha256=await sha256({lineageId:base.lineageId,ancestrySha256:base.ancestrySha256,nodes,completeThrough,independenceLaw:R209_INDEPENDENCE_LAW});
 return{ok:true as const,schema:R209_EXECUTION_SCHEMA,revision:R209_REVISION,lineageId:base.lineageId,proposalId:base.proposalId,draftFingerprint:base.draftFingerprint,ancestrySha256:base.ancestrySha256,correlationSha256,completeThrough,nodes,independenceLaw:R209_INDEPENDENCE_LAW,authorities:{operatorAuthorization:'R179',executor:'R147',hybridReturnProof:'R141',durableHistory:'R146',canonicalAdmission:'R125'},queueAuthority:false,dispatchAuthority:false,executionAuthority:false,persistenceOwner:false,scientificTruthAuthority:false,canonicalMutation:false as const,canonicalAdmissionAuthority:'R125' as const,boundary:R209_EXECUTION_BOUNDARY};
}
