import {readRunR146,replayRunR146,transitionRunR146} from './durableOperationExecutionR146.js';
import {runtimeStorageR168} from './runtimeStorageR168.js';
import {manifestR185,planTemporalPerformanceR185,readTemporalPerformanceR185,recordTemporalPerformanceR185} from './temporalRelativityPerformanceR185.js';

export const R147_REVISION='R147';
export const R147_SCHEMA='OMEGA_UNIFIED_EXECUTOR_FABRIC_R147';
export const R147_EXECUTORS=Object.freeze([
 {id:'WORKERS_AI',domains:['AI','SAI'],mode:'SYNCHRONOUS',authority:'MODEL_EXECUTION_RETURN_NOT_CANON'},
 {id:'HYBRID_HOST',domains:['HYBRID','BUILD'],mode:'ASYNCHRONOUS_HOST',authority:'R141_EXACT_HOST_RETURN_REQUIRED'},
 {id:'AUTONOMIC_SWARM',domains:['AI','SAI','PROOF','BUILD','LOCAL'],mode:'ASYNCHRONOUS_SWARM',authority:'R125_SWARM_RECEIPT_NOT_CANON'},
 {id:'FEDERATION_CHAIN',domains:['AI','SAI','PROOF','LOCAL'],mode:'SYNCHRONOUS_SPECIALIST_CHAIN',authority:'R115_PROPOSE_SCREEN_RETURN_NOT_CANON'},
 {id:'LOCAL_PROOF',domains:['PROOF'],mode:'SYNCHRONOUS_DETERMINISTIC',authority:'R146_REPLAY_INTEGRITY_ONLY'},
 {id:'LOCAL_RUNTIME',domains:['LOCAL'],mode:'SYNCHRONOUS_DETERMINISTIC',authority:'LOCAL_RUNTIME_RETURN_NOT_CANON'},
 {id:'PLUGIN_CONNECTOR',domains:['PLUGIN'],mode:'EXTERNAL_CONNECTOR',authority:'PROVIDER_RECEIPT_REQUIRED'}
]);
export const R147_LAWS=Object.freeze([
 'ONE_DURABLE_RUN_ONE_EXECUTOR_BINDING_AT_A_TIME',
 'R143_EXECUTION_DOMAIN_SELECTS_ELIGIBLE_EXECUTORS',
 'R146_STATE_MACHINE_REMAINS_EXECUTION_HISTORY_AUTHORITY',
 'R168_DURABLE_STORAGE_COMPATIBILITY_APPLIES_TO_R147_ARTIFACTS',
 'QUEUEING_IS_NOT_INVOCATION',
 'DISPATCH_ACCEPTANCE_IS_NOT_EXECUTION_SUCCESS',
 'HYBRID_AGENT_CLAIM_ADVANCES_AVAILABLE_TO_INVOKED',
 'HYBRID_RETURN_REQUIRES_R141_CLOSURE_BEFORE_VERIFIED',
 'HYBRID_FAILED_RETURN_TERMINATES_AS_FAILED_NOT_RETURNED_SUCCESS',
 'WORKERS_AI_RETURN_HASH_PROVES_RETURN_INTEGRITY_NOT_FACTUAL_TRUTH',
 'SWARM_EXECUTION_QUORUM_IS_NOT_TRUTH_CONSENSUS',
 'FEDERATION_PROPOSE_AND_SCREEN_ARE_SPECIALIST_RETURNS_NOT_CANON',
 'PLUGIN_REGISTRY_PRESENCE_IS_NOT_PROVIDER_EXECUTION',
 'R144_RUNTIME_ATTESTATION_AND_R145_WORLD_SCAR_REMAIN_EVIDENCE_ONLY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const MODEL='@cf/google/gemma-4-26b-a4b-it';
const BIND_PREFIX='execution:r147:binding:';
const RESULT_PREFIX='execution:r147:result:';
const ARTIFACT_PREFIX='execution:r147:artifact:';
const txt=(v,n=4000)=>String(v??'').trim().slice(0,n);
const sid=v=>{const s=txt(v,180);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=stable(v[k]);return out}return v};
const sha=async v=>{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(v))));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const modelText=r=>{if(typeof r==='string')return r;if(typeof r?.response==='string')return r.response;if(typeof r?.result?.response==='string')return r.result.response;const c=r?.choices?.[0]?.message?.content;if(typeof c==='string')return c;if(Array.isArray(c))return c.map(x=>typeof x==='string'?x:(x?.text||'')).join('\n').trim();return''};
const jsonBody=async response=>{if(!response)return null;try{return await response.clone().json()}catch{return null}};
function packetCandidate(body){return body?.packet||body?.proposal||body?.screened_packet||body?.result||body}
function validProposal(packet){return packet?.schema==='OMEGA_PACKET_v1'&&packet?.source_node==='omega-genesis'&&Boolean(packet?.packet_id)&&Boolean(packet?.state_id)&&packet?.geometry&&Number(packet?.wavelength_nm)>0&&Array.isArray(packet?.lineage)}
function validScreen(packet){return packet?.schema==='OMEGA_PACKET_v1'&&packet?.source_node==='omega-optical'&&Boolean(packet?.packet_id)&&packet?.geometry&&Number(packet?.wavelength_nm)>0&&packet?.scalar_metrics&&packet?.proof&&Array.isArray(packet?.lineage)}
function currentDevices(devices=[]){const t=Date.now();return devices.filter(x=>x&&!x.revoked&&(x.online===true||t-Number(x.lastSeen||0)<30000))}
function capSet(device){return new Set(Array.isArray(device?.capabilities)?device.capabilities:[])}
function executionDomain(run){return txt(run?.contract?.executionDomain,32).toUpperCase()}
const storage=runtime=>runtimeStorageR168(runtime);
async function storagePut(runtime,key,value){await storage(runtime).put(key,value);return value}
async function binding(runtime,runId){return storage(runtime).get(BIND_PREFIX+runId)}
async function result(runtime,runId){return storage(runtime).get(RESULT_PREFIX+runId)}
async function artifactLink(runtime,kind,id){return storage(runtime).get(`${ARTIFACT_PREFIX}${kind}:${id}`)}
async function bindArtifact(runtime,runId,executorId,kind,artifactId,extra={}){const row={schema:'OMEGA_EXECUTOR_BINDING_R147',revision:R147_REVISION,runId,executorId,kind,artifactId,createdAt:Date.now(),canonicalMutation:false,...stable(extra)};row.bindingSha256=await sha(row);await storagePut(runtime,BIND_PREFIX+runId,row);if(kind&&artifactId)await storagePut(runtime,`${ARTIFACT_PREFIX}${kind}:${artifactId}`,{runId,executorId,bindingSha256:row.bindingSha256});return row}
async function persistResult(runtime,runId,executorId,payload,scope){const clean={schema:'OMEGA_EXECUTOR_RESULT_R147',revision:R147_REVISION,runId,executorId,scope,returnedAt:Date.now(),payload:stable(payload),canonicalMutation:false,canonicalAdmissionAuthority:'R125'};clean.resultFingerprint=await sha(clean);await storagePut(runtime,RESULT_PREFIX+runId,clean);return clean}
async function ensureAvailable(runtime,run,executorId,reason){if(run.state==='AUTHORIZED'){const moved=await transitionRunR146(runtime,run.id,{state:'AVAILABLE',reason,evidence:{proofRef:`R147_${executorId}_READINESS`}});return moved.ok?moved.run:run}return run}
async function invoke(runtime,run,executorId){if(run.state!=='AVAILABLE')return{ok:false,status:409,code:'R147_RUN_NOT_AVAILABLE',run};return transitionRunR146(runtime,run.id,{state:'INVOKED',reason:`${executorId} accepted the durable run for execution`,evidence:{proofRef:`R147_${executorId}_INVOKED`}})}
async function returned(runtime,runId,executorId,fingerprint,providerReceipt){const run=await readRunR146(runtime,runId);if(!run)return{ok:false,status:404,code:'R147_RUN_NOT_FOUND'};if(run.state!=='INVOKED')return{ok:false,status:409,code:'R147_RUN_NOT_INVOKED',run};return transitionRunR146(runtime,runId,{state:'RETURNED',reason:`${executorId} returned an execution payload`,evidence:{proofRef:`R147_${executorId}_RETURN`,resultFingerprint:fingerprint,providerReceipt}})}
async function verifyNormal(runtime,runId,executorId,fingerprint,providerReceipt){const run=await readRunR146(runtime,runId);if(!run)return{ok:false,status:404,code:'R147_RUN_NOT_FOUND'};if(run.state!=='RETURNED')return{ok:false,status:409,code:'R147_RUN_NOT_RETURNED',run};return transitionRunR146(runtime,runId,{state:'VERIFIED',reason:`${executorId} return fingerprint matched the persisted R147 result`,evidence:{proofRef:`R147_${executorId}_RETURN_SHA256`,resultFingerprint:fingerprint,providerReceipt}})}

export async function executorDirectoryR147(runtime,env=runtime?.env||{}){
 const devices=typeof runtime?.devices==='function'?await runtime.devices():[],online=currentDevices(devices),hybrid=online.map(d=>({id:d.id,name:d.name||d.id,capabilityRevision:d.capabilityRevision||'UNKNOWN',capabilities:[...capSet(d)]}));
 const buildHosts=hybrid.filter(d=>d.capabilities.includes('BUILD')&&d.capabilities.includes('TEST'));
 return{
  schema:'OMEGA_EXECUTOR_DIRECTORY_R147',revision:R147_REVISION,generatedAt:Date.now(),
  executors:{
   WORKERS_AI:{state:env?.AI?.run?'AVAILABLE':'UNAVAILABLE',model:MODEL,domains:['AI','SAI']},
   HYBRID_HOST:{state:hybrid.length?'AVAILABLE':'DEVICE_PROOF_REQUIRED',devices:hybrid,buildCapableDevices:buildHosts.map(x=>x.id),domains:['HYBRID','BUILD']},
   AUTONOMIC_SWARM:{state:env?.OMEGA_SWARM_AUTONOMIC?'AVAILABLE':'UNAVAILABLE',domains:['AI','SAI','PROOF','BUILD','LOCAL'],hierarchy:'1→12→144→1728→20736 lanes'},
   FEDERATION_CHAIN:{state:env?.OMEGA_GENESIS_MACHINE?.fetch&&env?.OMEGA_OPTICAL_MACHINE?.fetch?'AVAILABLE':'UNAVAILABLE',domains:['AI','SAI','PROOF','LOCAL'],roles:['PROPOSE','SCREEN']},
   LOCAL_PROOF:{state:'AVAILABLE',domains:['PROOF']},
   LOCAL_RUNTIME:{state:'AVAILABLE',domains:['LOCAL']},
   PLUGIN_CONNECTOR:{state:'DISCOVERED',domains:['PLUGIN'],providerExecutionRequiresConcreteAdapter:true}
  },
  performance:{revision:'R185',loop:'PREDICT_CARRY_CORRECT_REALLOCATE',adaptiveSelection:'TERMINAL_HISTORY_MATURED_ONLY'},
  runtimeStorageCompatibility:'R168',
  canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'Executor availability means a concrete transport/binding is presently available. It is not invocation, return, verification, factual truth, solver validity, PC heartbeat proof, or CanonState admission.'
 };
}

export async function selectExecutorR147(runtime,run,input={}){
 const directory=await executorDirectoryR147(runtime),domain=executionDomain(run),requested=txt(input.executorId,64).toUpperCase(),strategy=txt(input.strategy,32).toUpperCase();
 const eligible=R147_EXECUTORS.filter(x=>x.domains.includes(domain)).map(x=>x.id);
 let executorId=requested&&eligible.includes(requested)?requested:null;
 if(!executorId){
  if(domain==='HYBRID'||domain==='BUILD')executorId='HYBRID_HOST';
  else if(domain==='PROOF'&&strategy==='LOCAL')executorId='LOCAL_PROOF';
  else if(strategy==='SWARM'&&eligible.includes('AUTONOMIC_SWARM'))executorId='AUTONOMIC_SWARM';
  else if(strategy==='FEDERATION'&&eligible.includes('FEDERATION_CHAIN'))executorId='FEDERATION_CHAIN';
  else if((domain==='AI'||domain==='SAI')&&directory.executors.WORKERS_AI.state==='AVAILABLE')executorId='WORKERS_AI';
  else if(domain==='PROOF')executorId='LOCAL_PROOF';
  else if(domain==='LOCAL')executorId='LOCAL_RUNTIME';
  else if(domain==='PLUGIN')executorId='PLUGIN_CONNECTOR';
  else executorId=eligible[0]||null;
 }
 const temporalPerformance=await planTemporalPerformanceR185(runtime,{run,directory,eligible,defaultExecutorId:executorId,input}),recommended=temporalPerformance?.selection?.recommendedExecutorId;
 if(recommended&&eligible.includes(recommended)&&directory.executors[recommended]?.state==='AVAILABLE')executorId=recommended;
 const state=executorId?directory.executors[executorId]?.state||'UNAVAILABLE':'UNAVAILABLE';
 return{schema:'OMEGA_EXECUTOR_PLAN_R147',runId:run.id,domain,executorId,eligible,state,strategy:strategy||'AUTO',temporalPerformance,canonicalMutation:false,truthBoundary:'Selection binds an eligible executor to a durable run. R185 may reorder only eligible AVAILABLE executors after measured terminal history matures; selection itself is not invocation or execution proof.'};
}

async function runWorkersAI(runtime,run,input,env){
 if(!env?.AI?.run)return{ok:false,status:503,code:'R147_WORKERS_AI_UNAVAILABLE'};
 run=await ensureAvailable(runtime,run,'WORKERS_AI','Workers AI binding is present for this runtime request');const inv=await invoke(runtime,run,'WORKERS_AI');if(!inv.ok)return inv;
 try{
  const system=executionDomain(run)==='SAI'?'Operate as the OMEGA SAI synthesis executor. Preserve source/evidence uncertainty, capability boundaries, disagreements, and missing proof. Model output is not observation, native execution, solver validity, or CanonState.':'Operate as the OMEGA bounded AI execution adapter. Return the requested synthesis while preserving evidence authority, uncertainty, and execution truth. Model output is not observation or CanonState.';
  const response=await env.AI.run(MODEL,{messages:[{role:'system',content:system},{role:'user',content:txt(input.prompt||run.intent,12000)}],max_tokens:Math.max(128,Math.min(1600,Number(input.maxTokens)||900)),temperature:Math.max(0,Math.min(1,Number(input.temperature)??.2)),chat_template_kwargs:{enable_thinking:false}}),out=modelText(response),payload={provider:'CLOUDFLARE_WORKERS_AI',model:MODEL,text:txt(out,16000),executionTruth:'RETURNED_MODEL_OUTPUT_NOT_FACTUAL_VERIFICATION'};
  const saved=await persistResult(runtime,run.id,'WORKERS_AI',payload,'EXECUTION_RETURN_INTEGRITY_NOT_FACTUAL_TRUTH');await returned(runtime,run.id,'WORKERS_AI',saved.resultFingerprint,`Workers AI ${MODEL}`);const verified=await verifyNormal(runtime,run.id,'WORKERS_AI',saved.resultFingerprint,`Workers AI ${MODEL}`);return{ok:verified.ok,status:verified.status||200,run:verified.run||await readRunR146(runtime,run.id),result:saved};
 }catch(error){const current=await readRunR146(runtime,run.id);if(current?.state==='INVOKED')await transitionRunR146(runtime,run.id,{state:'FAILED',reason:'Workers AI invocation failed',evidence:{proofRef:'R147_WORKERS_AI_FAILURE',providerReceipt:txt(error instanceof Error?error.message:error,1000)}});return{ok:false,status:502,code:'R147_WORKERS_AI_FAILED',error:txt(error instanceof Error?error.message:error,1000),run:await readRunR146(runtime,run.id)}}
}

async function runLocalProof(runtime,run,input){
 run=await ensureAvailable(runtime,run,'LOCAL_PROOF','Deterministic R146 replay verifier is available inside the canonical runtime');const inv=await invoke(runtime,run,'LOCAL_PROOF');if(!inv.ok)return inv;const target=sid(input.targetRunId)||run.id,replay=await replayRunR146(runtime,target);if(!replay){await transitionRunR146(runtime,run.id,{state:'FAILED',reason:'Requested replay target was not found',evidence:{proofRef:'R147_LOCAL_PROOF_TARGET_MISSING'}});return{ok:false,status:404,code:'R147_PROOF_TARGET_NOT_FOUND'}}const saved=await persistResult(runtime,run.id,'LOCAL_PROOF',{targetRunId:target,replay},'HASH_CHAIN_REPLAY_INTEGRITY_ONLY');await returned(runtime,run.id,'LOCAL_PROOF',saved.resultFingerprint,'R146 deterministic replay');const verified=await verifyNormal(runtime,run.id,'LOCAL_PROOF',saved.resultFingerprint,'R146 deterministic replay');return{ok:verified.ok,status:verified.status||200,run:verified.run,result:saved};
}

async function runLocalRuntime(runtime,run,input){
 run=await ensureAvailable(runtime,run,'LOCAL_RUNTIME','Bounded canonical runtime inspection executor is present');const inv=await invoke(runtime,run,'LOCAL_RUNTIME');if(!inv.ok)return inv;const operation=txt(input.localOperation||'READ_RUN',40).toUpperCase();let payload;if(operation==='READ_RUN')payload={operation,run:await readRunR146(runtime,sid(input.targetRunId)||run.id)};else if(operation==='REPLAY')payload={operation,replay:await replayRunR146(runtime,sid(input.targetRunId)||run.id)};else payload={operation:'MANIFEST',revision:R147_REVISION,laws:R147_LAWS,executors:R147_EXECUTORS};const saved=await persistResult(runtime,run.id,'LOCAL_RUNTIME',payload,'DETERMINISTIC_RUNTIME_RETURN_ONLY');await returned(runtime,run.id,'LOCAL_RUNTIME',saved.resultFingerprint,'R147 bounded local runtime');const verified=await verifyNormal(runtime,run.id,'LOCAL_RUNTIME',saved.resultFingerprint,'R147 bounded local runtime');return{ok:verified.ok,status:verified.status||200,run:verified.run,result:saved};
}

async function runFederation(runtime,run,input,env){
 if(!env?.OMEGA_GENESIS_MACHINE?.fetch||!env?.OMEGA_OPTICAL_MACHINE?.fetch)return{ok:false,status:503,code:'R147_FEDERATION_BINDING_UNAVAILABLE'};
 run=await ensureAvailable(runtime,run,'FEDERATION_CHAIN','Genesis PROPOSE and Optical SCREEN service bindings are present');const inv=await invoke(runtime,run,'FEDERATION_CHAIN');if(!inv.ok)return inv;const intent=txt(input.prompt||run.intent,4000),ceremonyId=`r147_${run.id}`;
 try{
  const g=await env.OMEGA_GENESIS_MACHINE.fetch(new Request('https://omega-genesis-machine-r115.internal/api/federation/propose',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({schema:'OMEGA_FEDERATION_PROPOSE_REQUEST_R115',ceremony_id:ceremonyId,intent,canonical_authority:'omega-v6',worker_authority:'PROPOSE',expected_output:'OMEGA_PACKET_v1'})})),gb=await jsonBody(g),proposal=packetCandidate(gb);if(!g.ok||!validProposal(proposal))throw new Error(`Genesis PROPOSE did not return a valid OMEGA_PACKET_v1 (${g.status})`);
  const o=await env.OMEGA_OPTICAL_MACHINE.fetch(new Request('https://omega-optical-machine-r115.internal/api/federation/screen',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({schema:'OMEGA_FEDERATION_SCREEN_REQUEST_R115',ceremony_id:ceremonyId,proposal,worker_authority:'SCREEN',expected_output:['OMEGA_PACKET_v1','OMEGA_FULLWAVE_QUEUE_v1']})})),ob=await jsonBody(o),screen=packetCandidate(ob);if(!o.ok||!validScreen(screen))throw new Error(`Optical SCREEN did not return a valid OMEGA_PACKET_v1 (${o.status})`);
  const payload={ceremonyId,proposal,screen,tier2Job:ob?.tier2_job||ob?.queue_job||ob?.job||null,authority:'R115_PROPOSE_SCREEN_RETURN_NOT_CANON'};const saved=await persistResult(runtime,run.id,'FEDERATION_CHAIN',payload,'SERVICE_RETURN_SCHEMA_INTEGRITY_NOT_PHYSICAL_VALIDITY');await returned(runtime,run.id,'FEDERATION_CHAIN',saved.resultFingerprint,'R115 Genesis→Optical service-binding chain');const verified=await verifyNormal(runtime,run.id,'FEDERATION_CHAIN',saved.resultFingerprint,'R115 Genesis→Optical service-binding chain');return{ok:verified.ok,status:verified.status||200,run:verified.run,result:saved};
 }catch(error){const current=await readRunR146(runtime,run.id);if(current?.state==='INVOKED')await transitionRunR146(runtime,run.id,{state:'FAILED',reason:'R147 federation executor failed',evidence:{proofRef:'R147_FEDERATION_FAILURE',providerReceipt:txt(error instanceof Error?error.message:error,1000)}});return{ok:false,status:502,code:'R147_FEDERATION_FAILED',error:txt(error instanceof Error?error.message:error,1000),run:await readRunR146(runtime,run.id)}}
}

async function runSwarm(runtime,run,input,env){
 if(!env?.OMEGA_SWARM_AUTONOMIC)return{ok:false,status:503,code:'R147_SWARM_BINDING_UNAVAILABLE'};run=await ensureAvailable(runtime,run,'AUTONOMIC_SWARM','Autonomic swarm Durable Object binding is present');if(run.state!=='AVAILABLE')return{ok:false,status:409,code:'R147_RUN_NOT_AVAILABLE',run};
 const root=env.OMEGA_SWARM_AUTONOMIC.get(env.OMEGA_SWARM_AUTONOMIC.idFromName('omega-autonomic-root-r125')),payload={intent:txt(input.prompt||run.intent,12000),projection:txt(input.projection||run.contract.route,32),metrics:input.metrics||{},scope:input.scope||{type:'BODY'},mode:input.mode||'AUTO',allowFullAuto:input.allowFullAuto===true,providerBudget:Math.max(0,Math.min(12,Number(input.providerBudget)??4)),evidence:Array.isArray(input.evidence)?input.evidence:[]},response=await root.fetch(new Request('https://autonomic.internal/missions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})),body=await jsonBody(response),mission=body?.mission||body?.m||body;if(!response.ok||!mission?.id)return{ok:false,status:response.status||502,code:'R147_SWARM_MISSION_REJECTED',body};
 const inv=await invoke(runtime,run,'AUTONOMIC_SWARM');if(!inv.ok)return inv;const bind=await bindArtifact(runtime,run.id,'AUTONOMIC_SWARM','SWARM_MISSION',mission.id,{projection:mission.projection||payload.projection});return{ok:true,status:202,run:inv.run,binding:bind,mission,truthBoundary:'Swarm mission acceptance proves dispatch only. Execution quorum and reconvergence remain result fabric, not truth consensus or CanonState.'};
}

async function queueHybrid(runtime,run,input,callbacks){
 const directory=await executorDirectoryR147(runtime),hosts=directory.executors.HYBRID_HOST.devices||[];if(!hosts.length)return{ok:false,status:503,code:'R147_HYBRID_DEVICE_PROOF_REQUIRED'};run=await ensureAvailable(runtime,run,'HYBRID_HOST','At least one paired host has a current authenticated heartbeat');if(run.state!=='AVAILABLE')return{ok:false,status:409,code:'R147_RUN_NOT_AVAILABLE',run};if(input.confirmed!==true)return{ok:false,status:409,code:'R147_EXPLICIT_EXECUTION_CONFIRMATION_REQUIRED',run};if(typeof callbacks?.queueHybrid!=='function')return{ok:false,status:500,code:'R147_HYBRID_QUEUE_ADAPTER_MISSING'};
 const targetId=sid(input.targetDeviceId)||hosts[0].id,domain=executionDomain(run),defaultSteps=domain==='BUILD'?[{id:'S01',op:'INDEX',label:'Discover the approved project',path:txt(input.projectPath||'.',240)},{id:'S02',op:'HASH_TREE',label:'Fingerprint source before build',path:txt(input.projectPath||'.',240),maxResults:5000},{id:'S03',op:'BUILD',label:'Run declared project build',path:txt(input.projectPath||'.',240),profile:'AUTO_BUILD'},{id:'S04',op:'TEST',label:'Run declared project verification',path:txt(input.projectPath||'.',240),profile:'AUTO_BUILD'}]:[];
 const jobInput={schema:'OMEGA_R147_HYBRID_EXECUTION_JOB',action:domain==='BUILD'?'BUILD':'PLAN',profile:domain==='BUILD'?'AUTO_BUILD':txt(input.profile||'AUTO_BUILD',40),projectPath:txt(input.projectPath||'.',240),instructions:txt(input.instructions||run.intent,4000),allowedDomains:Array.isArray(input.allowedDomains)?input.allowedDomains:[],steps:Array.isArray(input.steps)&&input.steps.length?input.steps:defaultSteps,targetDeviceId:targetId,confirmed:true},queued=await callbacks.queueHybrid(jobInput);if(!queued?.ok||!queued?.job?.id)return{ok:false,status:queued?.status||502,code:queued?.code||'R147_HYBRID_QUEUE_REJECTED',body:queued};const bind=await bindArtifact(runtime,run.id,'HYBRID_HOST','HYBRID_JOB',queued.job.id,{targetDeviceId:targetId,inputFingerprint:queued.job.inputFingerprint||null});return{ok:true,status:202,run:await readRunR146(runtime,run.id),binding:bind,job:queued.job,truthBoundary:'QUEUED is not INVOKED. The durable run remains AVAILABLE until the authenticated PC agent actually claims the linked job.'};
}

export async function dispatchRunR147(runtime,id,input={},callbacks={}){
 let run=await readRunR146(runtime,id);if(!run)return{ok:false,status:404,code:'R147_RUN_NOT_FOUND'};if(!['AUTHORIZED','AVAILABLE'].includes(run.state))return{ok:false,status:409,code:'R147_DISPATCH_REQUIRES_AUTHORIZED_OR_AVAILABLE',run};const plan=await selectExecutorR147(runtime,run,input);if(!plan.executorId)return{ok:false,status:409,code:'R147_NO_ELIGIBLE_EXECUTOR',plan};if(plan.state==='UNAVAILABLE'||plan.state==='DEVICE_PROOF_REQUIRED')return{ok:false,status:503,code:'R147_EXECUTOR_UNAVAILABLE',plan,run};
 const started=Date.now();let out;
 if(plan.executorId==='WORKERS_AI')out=await runWorkersAI(runtime,run,input,runtime.env||{});
 else if(plan.executorId==='LOCAL_PROOF')out=await runLocalProof(runtime,run,input);
 else if(plan.executorId==='LOCAL_RUNTIME')out=await runLocalRuntime(runtime,run,input);
 else if(plan.executorId==='FEDERATION_CHAIN')out=await runFederation(runtime,run,input,runtime.env||{});
 else if(plan.executorId==='AUTONOMIC_SWARM')out=await runSwarm(runtime,run,input,runtime.env||{});
 else if(plan.executorId==='HYBRID_HOST')out=await queueHybrid(runtime,run,input,callbacks);
 else if(plan.executorId==='PLUGIN_CONNECTOR')out={ok:false,status:409,code:'R147_PLUGIN_CONCRETE_ADAPTER_REQUIRED',plan,run,truthBoundary:'A registered plugin/provider name is not execution. R147 refuses to invoke without a concrete provider transport adapter and returned provider receipt.'};
 else out={ok:false,status:409,code:'R147_EXECUTOR_NOT_IMPLEMENTED',plan,run};
 const terminal=out?.status!==202;let sample=null;try{sample=await recordTemporalPerformanceR185(runtime,{run:out?.run||run,executorId:plan.executorId,ok:terminal&&out?.ok===true,status:out?.status||0,latencyMs:Date.now()-started,phase:terminal?'RETURN_OR_TERMINAL':'DISPATCH_ACCEPTED',verified:terminal&&out?.run?.state==='VERIFIED',terminal,input})}catch{}
 return{...out,temporalPerformance:{plan:plan.temporalPerformance,sample}};
}

export async function syncHybridClaimR147(runtime,job){const link=job?.id?await artifactLink(runtime,'HYBRID_JOB',job.id):null;if(!link?.runId)return null;const run=await readRunR146(runtime,link.runId);if(!run)return null;if(run.state==='AVAILABLE'){const moved=await transitionRunR146(runtime,run.id,{state:'INVOKED',reason:`Authenticated Hybrid agent claimed linked job ${job.id}`,evidence:{proofRef:'R147_AUTHENTICATED_HYBRID_AGENT_CLAIM',resultFingerprint:job.inputFingerprint||null}});return moved.run||run}return run}
export async function syncHybridReturnR147(runtime,job,closure){
 const link=job?.id?await artifactLink(runtime,'HYBRID_JOB',job.id):null;if(!link?.runId)return null;let run=await readRunR146(runtime,link.runId);if(!run)return null;
 const bind=await binding(runtime,run.id),fingerprint=txt(job?.returnPacket?.resultFingerprint||job?.resultFingerprint,256)||await sha({jobId:job.id,status:job.status,returnPacket:job.returnPacket||null});const saved=await persistResult(runtime,run.id,'HYBRID_HOST',{jobId:job.id,status:job.status,returnPacket:job.returnPacket||null,closure:closure||null},'R141_EXACT_HOST_RETURN_REQUIRED');
 if(run.state==='AVAILABLE'){const inv=await transitionRunR146(runtime,run.id,{state:'INVOKED',reason:'Hybrid result arrived after an unobserved claim; host return proves the job was executed but not yet verified',evidence:{proofRef:'R147_HYBRID_RETURN_IMPLIES_PRIOR_INVOCATION'}});run=inv.run||run}
 if(job?.status==='FAILED'&&run.state==='INVOKED'){const failed=await transitionRunR146(runtime,run.id,{state:'FAILED',reason:`Hybrid host returned failed linked job ${job.id}`,evidence:{proofRef:'R147_HYBRID_FAILED_RETURN',resultFingerprint:fingerprint,providerReceipt:saved.resultFingerprint,r141Closure:closure||null}});run=failed.run||run;try{await recordTemporalPerformanceR185(runtime,{run,executorId:'HYBRID_HOST',ok:false,status:502,latencyMs:bind?.createdAt?Date.now()-Number(bind.createdAt):0,phase:'ASYNC_HOST_FAILED_RETURN',verified:false,terminal:true})}catch{}return run}
 if(run.state==='INVOKED'){const ret=await transitionRunR146(runtime,run.id,{state:'RETURNED',reason:`Hybrid host returned linked job ${job.id}`,evidence:{proofRef:'R147_HYBRID_RETURN',resultFingerprint:fingerprint,providerReceipt:saved.resultFingerprint}});run=ret.run||run}
 if(run.state==='RETURNED'&&closure?.state==='VERIFIED_EXECUTION_RETURN'&&closure?.fingerprint?.verified===true&&closure?.fingerprint?.digestMatch===true&&closure?.fingerprint?.semanticMatch===true){const ver=await transitionRunR146(runtime,run.id,{state:'VERIFIED',reason:'R141 exact payload digest and semantic closure verified the linked Hybrid return',evidence:{proofRef:'R141_EXACT_PAYLOAD_SHA_SEMANTIC_EQUALITY',resultFingerprint:fingerprint,r141Closure:closure,providerReceipt:saved.resultFingerprint}});run=ver.run||run}
 try{await recordTemporalPerformanceR185(runtime,{run,executorId:'HYBRID_HOST',ok:job?.status==='COMPLETE',status:200,latencyMs:bind?.createdAt?Date.now()-Number(bind.createdAt):0,phase:'ASYNC_HOST_RETURN',verified:run.state==='VERIFIED',terminal:true})}catch{}return run
}

export async function pollRunR147(runtime,id){let run=await readRunR146(runtime,id);if(!run)return{ok:false,status:404,code:'R147_RUN_NOT_FOUND'};const bind=await binding(runtime,id);if(!bind)return{ok:true,status:200,run,binding:null,result:await result(runtime,id),temporalHistory:await readTemporalPerformanceR185(runtime,run)};if(bind.kind==='SWARM_MISSION'&&run.state==='INVOKED'&&runtime.env?.OMEGA_SWARM_AUTONOMIC){const root=runtime.env.OMEGA_SWARM_AUTONOMIC.get(runtime.env.OMEGA_SWARM_AUTONOMIC.idFromName('omega-autonomic-root-r125')),response=await root.fetch(new Request(`https://autonomic.internal/missions/${encodeURIComponent(bind.artifactId)}`)),mission=await jsonBody(response);if(response.ok&&['COMPLETE','FAILED','CANCELLED'].includes(mission?.status)){if(mission.status==='COMPLETE'){const payload={mission,authority:'AUTONOMIC_RECEIPT_NOT_CANON'},saved=await persistResult(runtime,id,'AUTONOMIC_SWARM',payload,'SWARM_EXECUTION_RECEIPT_INTEGRITY_NOT_TRUTH_CONSENSUS'),fingerprint=mission?.checkpointSha256||mission?.receipt?.merkleRoot||saved.resultFingerprint;const ret=await returned(runtime,id,'AUTONOMIC_SWARM',fingerprint,saved.resultFingerprint);run=ret.run||run;if(run.state==='RETURNED'){const ver=await verifyNormal(runtime,id,'AUTONOMIC_SWARM',fingerprint,saved.resultFingerprint);run=ver.run||run}}else{const failed=await transitionRunR146(runtime,id,{state:'FAILED',reason:`Autonomic swarm mission ${mission.status}`,evidence:{proofRef:'R147_SWARM_TERMINAL_RETURN',providerReceipt:mission?.checkpointSha256||null}});run=failed.run||run}try{await recordTemporalPerformanceR185(runtime,{run,executorId:'AUTONOMIC_SWARM',ok:mission.status==='COMPLETE',status:response.status||200,latencyMs:bind?.createdAt?Date.now()-Number(bind.createdAt):0,phase:'ASYNC_SWARM_TERMINAL',verified:run.state==='VERIFIED',terminal:true})}catch{}}return{ok:true,status:200,run,binding:bind,mission,result:await result(runtime,id),temporalHistory:await readTemporalPerformanceR185(runtime,run)}}return{ok:true,status:200,run,binding:bind,result:await result(runtime,id),temporalHistory:await readTemporalPerformanceR185(runtime,run)}}
export async function readResultR147(runtime,id){const run=await readRunR146(runtime,id);if(!run)return null;return{schema:'OMEGA_EXECUTOR_RESULT_VIEW_R147',revision:R147_REVISION,runId:id,state:run.state,binding:await binding(runtime,id),result:await result(runtime,id),temporalHistory:await readTemporalPerformanceR185(runtime,run),runtimeStorageCompatibility:'R168',canonicalMutation:false,canonicalAdmissionAuthority:'R125'}}
export function manifestR147(){return{ok:true,schema:'OMEGA_UNIFIED_EXECUTOR_FABRIC_MANIFEST_R147',revision:R147_REVISION,executors:R147_EXECUTORS,laws:R147_LAWS,performance:manifestR185(),runtimeStorageCompatibility:'R168',upstream:{operationContract:'R143',lifecycle:'R142',hybridProof:'R141',durableRun:'R146',runtimeAttestation:'R144',worldScar:'R145',swarm:'R125',federation:'R115',temporalPerformance:'R185'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R147 unifies concrete execution transports around one R146 durable run. R168 keeps executor artifacts on the real Durable Object storage shape. R185 may optimize eligible executor priority from measured terminal history, but dispatch acceptance never counts as execution success. R147 still distinguishes selection, availability, dispatch, invocation, return, return-integrity verification, evidence/world-scar carry, and CanonState admission. No executor, model, plugin, swarm quorum, federation packet, host return, performance trend or deployment attestation automatically mutates CanonState.'}}
