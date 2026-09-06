import {api} from './platformAdapter';

export type R147ExecutorState='AVAILABLE'|'UNAVAILABLE'|'DEVICE_PROOF_REQUIRED'|'DISCOVERED';
export type R147ExecutorDirectory={schema:string;revision:'R147';executors:Record<string,{state:R147ExecutorState;domains:string[];[key:string]:unknown}>;canonicalMutation:false;canonicalAdmissionAuthority:'R125'};
export async function executorDirectoryR147(){const r=await api.get<any>('/api/execution/executors');return r.data as R147ExecutorDirectory}
export async function dispatchExecutionRunR147(runId:string,input:Record<string,unknown>={}){const r=await api.post<any>(`/api/execution/runs/${encodeURIComponent(runId)}/dispatch`,input);return r.data}
export async function pollExecutionRunR147(runId:string){const r=await api.post<any>(`/api/execution/runs/${encodeURIComponent(runId)}/poll`,{});return r.data}
export async function executionResultR147(runId:string){const r=await api.get<any>(`/api/execution/runs/${encodeURIComponent(runId)}/result`);return r.data}

export function availableExecutorsR147(directory:R147ExecutorDirectory|null|undefined){if(!directory?.executors)return[];return Object.entries(directory.executors).filter(([,x])=>x.state==='AVAILABLE').map(([id])=>id)}
export const R147_EXECUTION_BOUNDARY='Executor availability and dispatch are not execution verification. Hybrid requires R141 exact return proof; model/swarm/federation return hashes prove returned payload integrity only; R125 alone admits CanonState.';
