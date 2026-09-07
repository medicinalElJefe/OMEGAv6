import {api} from './platformAdapter';

export const R181_REVISION='R181';
export const R181_SCHEMA='OMEGA_LIVING_WORLD_OPERATOR_DISPATCH_R181';
export const R181_AUTHORIZE_CONFIRMATION='AUTHORIZE_SELECTED_R143_CONTRACTS';
export const R181_DISPATCH_CONFIRMATION='DISPATCH_R179_AUTHORIZED_RUNS_VIA_R147';

export type R178ResolvedStep={
 index:number;domain?:string;action?:string;reason?:string;route?:string|null;readiness:string;contract?:Record<string,unknown>|null
};
export type R178Resolution={
 revision?:string;schema?:string;accepted?:boolean;state?:string;worldId?:string;sourceMissionId?:string|null;sourceOperationRef?:unknown;scarCount?:number;adaptiveContext?:unknown;resolvedSteps?:R178ResolvedStep[];canonicalAdmissionAuthority?:string
};
export type R181AuthorizedRun={runId:string;state:string;route?:string;capabilityId?:string;executionDomain?:string;headSha256?:string};
export type R181Authorization={
 ok:true;schema:string;revision:'R181';sourceAuthority:'R179';state:'AUTHORIZED_NOT_DISPATCHED';worldId:string;sourceMissionId:string|null;authorizedStepIndexes:number[];runs:R181AuthorizedRun[];dispatchAuthorized:false;executionInvoked:false;canonicalMutation:false;canonicalAdmissionAuthority:'R125'
};

const ready=(step:R178ResolvedStep)=>Boolean(step?.readiness==='CONTRACT_RESOLVED_NOT_AUTHORIZED'&&step?.contract&&step.contract.schema==='OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'&&step.contract.revision==='R143'&&step.contract.state==='AVAILABLE'&&step.contract.receiptAuthority==='R142'&&step.contract.admissionAuthority==='R125');
const uniqueIndexes=(values:number[])=>[...new Set(values.filter(Number.isInteger))];

export async function authorizeLivingWorldResolutionR181(resolution:R178Resolution,input:{authorized:boolean;confirmation:string;authorizedStepIndexes:number[];reason?:string}):Promise<R181Authorization>{
 if(resolution?.revision!=='R178'||resolution?.accepted!==true||resolution?.canonicalAdmissionAuthority!=='R125')throw new Error('R181 requires an accepted R178 resolution with R125 admission authority preserved.');
 if(input.authorized!==true||input.confirmation!==R181_AUTHORIZE_CONFIRMATION)throw new Error('Explicit R181 authorization confirmation is required.');
 const indexes=uniqueIndexes(input.authorizedStepIndexes||[]);if(!indexes.length)throw new Error('Select at least one R178-resolved step.');
 const steps=Array.isArray(resolution.resolvedSteps)?resolution.resolvedSteps:[];
 const selected=steps.filter(step=>indexes.includes(step.index));
 if(selected.length!==indexes.length||selected.some(step=>!ready(step)))throw new Error('Every selected step must be an AVAILABLE R143 contract resolved by R178.');
 const runs:R181AuthorizedRun[]=[];
 for(const step of selected){
  const created=await api.post<any>('/api/execution/runs',{
   intent:String(step.action||step.reason||step.route||'living-world operation').slice(0,2000),
   contract:step.contract,
   metadata:{sourceRevision:'R179',operatorBridgeRevision:'R181',sourceMissionId:resolution.sourceMissionId||null,worldId:resolution.worldId||'OMEGA_CANONICAL_WORLD',sourceOperationRef:resolution.sourceOperationRef||null,scarCount:Number(resolution.scarCount)||0,adaptiveContext:resolution.adaptiveContext||null,livingWorldStepIndex:step.index,livingWorldDomain:step.domain||null,livingWorldReason:String(step.reason||'').slice(0,500)}
  });
  const run=created.data?.run;if(!run?.id)throw new Error('R146 did not return a durable run.');
  const authorized=await api.post<any>(`/api/execution/runs/${encodeURIComponent(run.id)}/transition`,{state:'AUTHORIZED',reason:String(input.reason||'Explicit operator authorization for R178 living-world mission contract').slice(0,500),evidence:{proofRef:'R179_EXPLICIT_OPERATOR_AUTHORIZATION'}});
  const current=authorized.data?.run;if(!current?.id||current.state!=='AUTHORIZED')throw new Error(`R146 authorization failed for ${run.id}.`);
  runs.push({runId:current.id,state:current.state,route:current.contract?.route,capabilityId:current.contract?.capabilityId,executionDomain:current.contract?.executionDomain,headSha256:current.headSha256});
 }
 return{ok:true,schema:R181_SCHEMA,revision:R181_REVISION,sourceAuthority:'R179',state:'AUTHORIZED_NOT_DISPATCHED',worldId:resolution.worldId||'OMEGA_CANONICAL_WORLD',sourceMissionId:resolution.sourceMissionId||null,authorizedStepIndexes:indexes,runs,dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
}

export async function dispatchLivingWorldAuthorizationR181(authorization:R181Authorization,input:{dispatchConfirmed:boolean;confirmation:string;strategy?:string;prompt?:string;providerBudget?:number}){
 if(authorization?.revision!=='R181'||authorization?.sourceAuthority!=='R179'||authorization?.state!=='AUTHORIZED_NOT_DISPATCHED')throw new Error('R181 dispatch requires its own R179-backed authorization receipt.');
 if(input.dispatchConfirmed!==true||input.confirmation!==R181_DISPATCH_CONFIRMATION)throw new Error('A second explicit operator confirmation is required before R147 dispatch.');
 const results=[] as any[];
 for(const row of authorization.runs||[]){
  if(row.state!=='AUTHORIZED')throw new Error(`Run ${row.runId} is not in AUTHORIZED state.`);
  const response=await api.post<any>(`/api/execution/runs/${encodeURIComponent(row.runId)}/dispatch`,{strategy:input.strategy||'AUTO',prompt:input.prompt,providerBudget:Number.isFinite(Number(input.providerBudget))?Number(input.providerBudget):4,r181DispatchConfirmed:true,r181Confirmation:R181_DISPATCH_CONFIRMATION,sourceAuthority:'R179'});
  results.push({runId:row.runId,ok:response.data?.ok!==false,state:response.data?.run?.state||'UNKNOWN',executorId:response.data?.result?.executorId||response.data?.binding?.executorId||null,result:response.data?.result||null,code:response.data?.code||null});
 }
 const states=results.map(x=>x.state);return{ok:results.every(x=>x.ok),schema:R181_SCHEMA,revision:R181_REVISION,state:'DISPATCHED_VIA_R147',results,executionInvoked:states.some(s=>['INVOKED','RETURNED','VERIFIED'].includes(s)),returned:states.some(s=>['RETURNED','VERIFIED'].includes(s)),verified:states.some(s=>s==='VERIFIED'),canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R181 dispatches only after a second explicit operator confirmation. R147 execution state and persisted receipts remain authoritative; dispatch or return does not equal factual truth or CanonState admission.'};
}

export async function refreshLivingWorldDispatchR181(runIds:string[]){
 const results=[] as any[];for(const runId of runIds){try{const polled=await api.post<any>(`/api/execution/runs/${encodeURIComponent(runId)}/poll`,{});let result=null;try{result=(await api.get<any>(`/api/execution/runs/${encodeURIComponent(runId)}/result`)).data}catch{}results.push({runId,state:polled.data?.run?.state||result?.state||'UNKNOWN',poll:polled.data,result});}catch(error){results.push({runId,state:'ERROR',error:error instanceof Error?error.message:String(error)})}}return{schema:R181_SCHEMA,revision:R181_REVISION,results,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
}
