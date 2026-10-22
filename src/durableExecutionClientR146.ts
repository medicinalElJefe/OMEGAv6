import {api} from './platformAdapter';
import type {AuthoritativeRouteOperationR143} from './authoritativeOperationChainR143';

export type DurableExecutionRunR146={
 id:string;state:string;headSha256?:string;contract:AuthoritativeRouteOperationR143;canonicalMutation:false;canonicalAdmissionAuthority:'R125';events?:unknown[];error?:string
};

export async function createAuthorizedOperationRunR146(contract:AuthoritativeRouteOperationR143,context:Record<string,unknown>={}){
 const created=await api.post<any>('/api/execution/runs',{
  intent:`${contract.routeId} → ${contract.capabilityId} → ${contract.executionDomain}`,
  contract,
  metadata:{...context,source:'R143_UI_OPERATION_CHAIN',receiptAuthority:'R142',durableRuntime:'R146'}
 });
 const run=created.data?.run as DurableExecutionRunR146|undefined;
 if(!run?.id)throw new Error('R146 durable run was not returned.');
 const authorized=await api.post<any>(`/api/execution/runs/${encodeURIComponent(run.id)}/transition`,{
  state:'AUTHORIZED',
  reason:'Authenticated operator selected the R143-authoritative route contract.',
  evidence:{proofRef:'R146_AUTHENTICATED_OPERATOR_SELECTION'}
 });
 return authorized.data?.run as DurableExecutionRunR146||run;
}

export async function listDurableOperationRunsR146(){
 const r=await api.get<any>('/api/execution/runs');
 return Array.isArray(r.data?.runs)?r.data.runs as DurableExecutionRunR146[]:[];
}

export async function replayDurableOperationRunR146(id:string){
 const r=await api.post<any>(`/api/execution/runs/${encodeURIComponent(id)}/replay`,{});
 return r.data?.receipt;
}
