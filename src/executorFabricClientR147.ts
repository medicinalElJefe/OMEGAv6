import {api} from './platformAdapter';

export type R147ExecutorState='AVAILABLE'|'UNAVAILABLE'|'DEVICE_PROOF_REQUIRED'|'DISCOVERED';
export type R147ExecutorDirectory={schema:string;revision:'R147';executors:Record<string,{state:R147ExecutorState;domains:string[];[key:string]:unknown}>;canonicalMutation:false;canonicalAdmissionAuthority:'R125';[key:string]:unknown};

async function optionalGet(path:string){try{return(await api.get<any>(path)).data}catch{return null}}
function currentHybridObserved(hybrid:any){return Boolean(hybrid?.nativeExecutionClaimed===true&&Array.isArray(hybrid?.devices)&&hybrid.devices.some((d:any)=>d?.online===true&&d?.revoked!==true))}

/**
 * First prefer the authenticated R147 directory. If private durable-runtime
 * authorization is not present, synthesize a read-only availability observer
 * from first-hand public runtime health. This deliberately exposes no device
 * IDs, secrets, run state or mutation capability.
 */
export async function executorDirectoryR147(){
 try{const r=await api.get<any>('/api/execution/executors');return r.data as R147ExecutorDirectory}catch{}
 const[core,operational,hybrid]=await Promise.all([optionalGet('/api/core-health'),optionalGet('/api/system/operational'),optionalGet('/api/hybrid/status')]);
 const coreLive=core?.ok===true&&core?.state==='LIVE',optional=core?.optionalCapabilities||{},hybridOnline=currentHybridObserved(hybrid),swarmObserved=Boolean(operational?.summary?.swarm?.hierarchyVerifiedFromManifest),federationObserved=Boolean(optional.genesisMachine&&optional.opticalMachine);
 return{
  schema:'OMEGA_EXECUTOR_DIRECTORY_R147_OBSERVER_R183',revision:'R147',generatedAt:Date.now(),observationMode:'PUBLIC_SANITIZED_FALLBACK',
  executors:{
   WORKERS_AI:{state:coreLive&&optional.workersAI?'AVAILABLE':'UNAVAILABLE',domains:['AI','SAI'],proof:'R163 optional binding observation'},
   HYBRID_HOST:{state:hybridOnline?'AVAILABLE':'DEVICE_PROOF_REQUIRED',domains:['HYBRID','BUILD'],proof:hybridOnline?'current authenticated non-revoked heartbeat observed':'current device proof required'},
   AUTONOMIC_SWARM:{state:coreLive&&swarmObserved?'AVAILABLE':'UNAVAILABLE',domains:['AI','SAI','PROOF','BUILD','LOCAL'],proof:'R130 autonomic hierarchy observation'},
   FEDERATION_CHAIN:{state:coreLive&&federationObserved?'AVAILABLE':'UNAVAILABLE',domains:['AI','SAI','PROOF','LOCAL'],proof:'R163 Genesis + Optical machine binding observation'},
   LOCAL_PROOF:{state:coreLive?'AVAILABLE':'UNAVAILABLE',domains:['PROOF'],proof:'bounded deterministic runtime executor'},
   LOCAL_RUNTIME:{state:coreLive?'AVAILABLE':'UNAVAILABLE',domains:['LOCAL'],proof:'bounded canonical runtime executor'},
   PLUGIN_CONNECTOR:{state:'DISCOVERED',domains:['PLUGIN'],providerExecutionRequiresConcreteAdapter:true}
  },
  canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'Public executor observation reports first-hand binding/readiness evidence only. It exposes no private device identity or durable run state. AVAILABLE is not invocation, return, R141 verification, factual truth, solver validity or R125 CanonState admission.'
 } as R147ExecutorDirectory;
}
export async function dispatchExecutionRunR147(runId:string,input:Record<string,unknown>={}){const r=await api.post<any>(`/api/execution/runs/${encodeURIComponent(runId)}/dispatch`,input);return r.data}
export async function pollExecutionRunR147(runId:string){const r=await api.post<any>(`/api/execution/runs/${encodeURIComponent(runId)}/poll`,{});return r.data}
export async function executionResultR147(runId:string){const r=await api.get<any>(`/api/execution/runs/${encodeURIComponent(runId)}/result`);return r.data}

export function availableExecutorsR147(directory:R147ExecutorDirectory|null|undefined){if(!directory?.executors)return[];return Object.entries(directory.executors).filter(([,x])=>x.state==='AVAILABLE').map(([id])=>id)}
export const R147_EXECUTION_BOUNDARY='Executor availability and dispatch are not execution verification. Public R183 fallback observes only first-hand runtime binding/readiness evidence and never exposes private host identity. Hybrid requires current heartbeat plus R141 exact return proof; model/swarm/federation returns prove returned payload integrity only; R125 alone admits CanonState.';
