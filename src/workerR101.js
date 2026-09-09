import r34,{OmegaRuntime as OmegaRuntimeR34} from './workerR34.js';

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const AGENT_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev';
const CANONICAL_AGENT_ASSET='/omega-hybrid-agent-r207.py';
const IMMUTABLE_BASE_AGENT_ASSET='/omega-hybrid-agent-base-r205.py';
const HEARTBEAT_FRESH_MS=30000;
const EXECUTION_MOTION_REVISION='R242';
const RUNNING_LEASE_MS=20000;
const LEGACY_RUNNING_STALE_MS=90000;
const MAX_STALL_RECOVERIES=2;
const RECOVERABLE_DISCOVERY_STAGES=new Set(['DISCOVERY','PROJECT_DISCOVERY','SIGNATURE_DISCOVERY']);
const MUTATING_OPS_R242=new Set(['APPLY_PATCH','WRITE_TEXT']);
const DIRECT_AGENT_PATHS_R2074=Object.freeze({
 '/api/hybrid/agent/register':'/agent/register',
 '/api/hybrid/agent/heartbeat':'/agent/heartbeat',
 '/api/hybrid/agent/poll':'/agent/poll',
 '/api/hybrid/agent/progress':'/agent/progress',
 '/api/hybrid/agent/result':'/agent/result'
});
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:JSON_HEADERS});
const text=v=>String(v??'').trim();
const safeId=(v,fallback='')=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const sessionId=request=>safeId(request.headers.get('x-omega-session-id'),'anon');
const bridgeId=(request,body={})=>safeId(request.headers.get('x-omega-bridge-id')||body?.bridgeId||sessionId(request),'anon');
const runtimeStub=(env,id)=>env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id));
const randomIdR242=(prefix='job')=>{const a=new Uint8Array(4);crypto.getRandomValues(a);return `${prefix}_${Date.now().toString(36)}_${[...a].map(x=>x.toString(16).padStart(2,'0')).join('')}`};
async function runtimeFetch(env,id,path,request,method='GET',body){
 const headers=new Headers(request.headers);headers.set('content-type','application/json');
 const init={method,headers};if(body!==undefined&&method!=='GET')init.body=JSON.stringify(body);
 return runtimeStub(env,id).fetch(new Request('https://omega-runtime.internal'+path,init));
}
async function directHybridAgentRelayR2074(request,env,path){
 const internalPath=DIRECT_AGENT_PATHS_R2074[path];
 if(!internalPath)return null;
 if(request.method!=='POST')return json({ok:false,code:'R2074_AGENT_RELAY_METHOD_NOT_ALLOWED',allow:'POST'},405);
 if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE',boundary:'Hybrid agent transport requires the canonical OMEGA_RUNTIME Durable Object binding.'},503);
 const body=await request.clone().json().catch(()=>({})),id=bridgeId(request,body);
 if(!id||id==='anon')return json({ok:false,code:'HYBRID_RUNTIME_ID_REQUIRED',boundary:'Register, heartbeat, poll, progress and result require an explicit bridge/session runtime identity.'},400);
 const response=await runtimeFetch(env,id,internalPath,request,'POST',body),headers=new Headers(response.headers);
 headers.set('x-omega-hybrid-agent-relay','R207.4-DIRECT-DURABLE');
 headers.set('x-omega-canonical-origin',AGENT_ORIGIN);
 headers.set('x-omega-hybrid-protocol','R127_ZERO_DRIFT_SHA256');
 headers.set('x-omega-hybrid-runtime','OMEGA_RUNTIME_DURABLE_OBJECT');
 headers.set('x-omega-execution-motion',EXECUTION_MOTION_REVISION);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
async function sha256(source){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}

async function hybridStatusR101(request,env,id){
 const response=await runtimeFetch(env,id,'/status',request,'GET');
 const data=await response.clone().json().catch(()=>({}));
 const devices=Array.isArray(data.devices)?data.devices:[],online=devices.filter(x=>x?.online&&!x?.revoked),proved=devices.filter(x=>Number(x?.lastSeen)>0&&!x?.revoked);
 const pairingState=data.state||'PAIRING_REQUIRED',lastAuthenticatedHeartbeat=proved.length?Math.max(...proved.map(x=>Number(x.lastSeen)||0)):null;
 return json({...data,
  state:online.length?'VERIFIED_DEVICE_ONLINE':'DEVICE_PROOF_REQUIRED',
  pairingState,
  bridgeId:id,
  nativeExecutionClaimed:online.length>0,
  currentDeviceCount:online.length,
  lastAuthenticatedHeartbeat,
  heartbeatFreshnessWindowMs:HEARTBEAT_FRESH_MS,
  executionMotionRevision:EXECUTION_MOTION_REVISION,
  runningLeaseMs:RUNNING_LEASE_MS,
  canonicalControlOrigin:AGENT_ORIGIN,
  connectorProtocol:'R127_ZERO_DRIFT_SHA256',
  canonicalAgentRevision:'R207',
  canonicalAgentProofClosure:'R141',
  connectorPolicy:{singleCanonicalControlHost:true,controlHostFallback:false,systemDriveRuntimeFallback:false,agentDigestRequired:true,partialDownloadExecution:false,staleAgentSubstitution:false},
  truthBoundary:'HYBRID_BRIDGE_ID_TRUTH_R127_CURRENT_HEARTBEAT_ONLY'
 },response.status);
}

async function reconnectHybridR101(request,env){
 const body=await request.json().catch(()=>({})),sid=sessionId(request),requested=bridgeId(request,body),secret=text(request.headers.get('x-omega-bridge-secret'));
 if(requested&&secret){
  const auth=await runtimeFetch(env,requested,'/continuity',request,'GET');
  if(auth.ok){const statusResponse=await hybridStatusR101(request,env,requested),status=await statusResponse.json();return json({...status,ok:true,reconnected:true,credentialState:'VALID',agentRestartRequired:false})}
 }
 if(!body.repair)return json({ok:false,code:'PAIR_AUTH_FAILED',recoverable:true,credentialState:requested&&secret?'REJECTED':'MISSING',reply:'The browser pairing credential no longer authenticates this bridge. Repair can issue a fresh pairing without claiming the PC is online.'},401);
 const pairResponse=await runtimeFetch(env,sid,'/pair',request,'POST',{rotate:true}),pair=await pairResponse.json().catch(()=>({}));
 if(!pairResponse.ok||!pair.secret)return json({ok:false,code:pair.code||'PAIR_REPAIR_FAILED',reply:pair.reply||'OMEGA could not issue a fresh Hybrid pairing credential.'},pairResponse.status||503);
 return json({...pair,ok:true,repaired:true,bridgeId:sid,pairingCode:`${sid}.${pair.secret}`,credentialState:'REISSUED',agentRestartRequired:true,agentPath:'/api/hybrid/agent-download',canonicalAgentRevision:'R207',proofClosureRevision:'R141',connectorProtocol:'R127_ZERO_DRIFT_SHA256',truthBoundary:'NEW_PAIR_REQUIRES_NEW_AUTHENTICATED_HEARTBEAT_R127'});
}

async function canonicalAgentSource(request,env){
 if(!env?.ASSETS?.fetch)return{ok:false,response:json({ok:false,code:'HYBRID_AGENT_ASSET_BINDING_UNAVAILABLE'},503)};
 const asset=await env.ASSETS.fetch(new Request(new URL(CANONICAL_AGENT_ASSET,request.url),{headers:{'cache-control':'no-cache'}}));
 if(!asset.ok)return{ok:false,response:json({ok:false,code:'HYBRID_AGENT_ASSET_NOT_FOUND',status:asset.status},503)};
 const source=await asset.text();
 const valid=source.length>1000&&source.startsWith('#!/usr/bin/env python3')&&source.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'")&&source.includes("VERSION='R207'")&&source.includes("BASE_PATH='/omega-hybrid-agent-base-r205.py'")&&source.includes("FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'")&&source.includes('OMEGA R207 canonical Hybrid Link proof wrapper')&&source.includes('Pairing is explicit.');
 if(!valid)return{ok:false,response:json({ok:false,code:'HYBRID_AGENT_ASSET_INVALID'},503)};
 const version=(source.match(/VERSION='([^']+)'/)||[])[1]||'UNKNOWN',digest=await sha256(source);
 return{ok:true,source,version,digest,bytes:new TextEncoder().encode(source).byteLength};
}

async function connectorManifestR127(request,env){
 const a=await canonicalAgentSource(request,env);if(!a.ok)return a.response;
 return json({ok:true,schema:'OMEGA_HYBRID_CONNECTOR_MANIFEST_R127',canonicalControlOrigin:AGENT_ORIGIN,agent:{path:'/api/hybrid/agent-download',version:a.version,sha256:a.digest,bytes:a.bytes,identity:'OMEGA R207 canonical Hybrid Link proof wrapper',proofClosureRevision:'R141',immutableBaseAsset:IMMUTABLE_BASE_AGENT_ASSET,baseTransportVersion:'R34.1',baseCapabilityRevision:'R132',baseProofExtension:'R205'},heartbeatFreshnessWindowMs:HEARTBEAT_FRESH_MS,executionMotion:{revision:EXECUTION_MOTION_REVISION,progressPath:'/api/hybrid/agent/progress',runningLeaseMs:RUNNING_LEASE_MS,legacyStaleMs:LEGACY_RUNNING_STALE_MS},rootPolicy:{defaultApprovedRoot:'J:\\',systemDriveRuntimeFallback:false,explicitAlternateNonSystemRootAllowed:true},transportPolicy:{singleCanonicalControlHost:true,controlHostFallback:false,downloadQuarantineRequired:true,serverDeclaredSha256Required:true,pythonParsePreflightRequired:true,blindRestart:false,transientReachabilityRetry:'BOUNDED',immutableBaseRollback:true,exactR141SemanticFingerprint:true,directDurableAgentRelay:'R207.4'},truthBoundary:'MANIFEST DESCRIBES CONNECTOR BYTES, DIRECT DURABLE AGENT TRANSPORT, EXECUTION-MOTION LEASE POLICY, AND ROOT POLICY; IT IS NOT PC ONLINE PROOF, EXECUTION SUCCESS, SOLVER VALIDITY, OR CANONSTATE'});
}

async function serveCanonicalHybridAgentR101(request,env){
 const a=await canonicalAgentSource(request,env);if(!a.ok)return a.response;
 return new Response(a.source,{status:200,headers:{'content-type':'text/x-python; charset=utf-8','content-disposition':'attachment; filename="omega-hybrid-agent.py"','cache-control':'no-store, max-age=0','x-omega-agent-version':a.version,'x-omega-agent-sha256':a.digest,'x-omega-agent-bytes':String(a.bytes),'x-omega-agent-proof-closure':'R141','x-omega-agent-base-revision':'R205','x-omega-canonical-origin':AGENT_ORIGIN,'x-omega-hybrid-protocol':'R127_ZERO_DRIFT_SHA256','x-omega-execution-motion':EXECUTION_MOTION_REVISION,'x-omega-compat-route':'R101_DIRECT_AND_API_AGENT_DOWNLOAD'}});
}

async function fetchR101(request,env){
 const path=new URL(request.url).pathname;
 if(DIRECT_AGENT_PATHS_R2074[path])return directHybridAgentRelayR2074(request,env,path);
 if(path==='/omega-hybrid-agent.py'&&request.method==='GET')return serveCanonicalHybridAgentR101(request,env);
 if(path==='/api/hybrid/connector-manifest'&&request.method==='GET')return connectorManifestR127(request,env);
 if(path==='/api/hybrid/status'&&request.method==='GET'){if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);return hybridStatusR101(request,env,bridgeId(request))}
 if(path==='/api/hybrid/reconnect'&&request.method==='POST'){if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);return reconnectHybridR101(request,env)}
 return r34.fetch(request,env);
}

export class OmegaRuntime extends OmegaRuntimeR34 {
 async recoverStalledJobsR242(deviceId){
  if(!deviceId)return;
  const t=Date.now(),jobs=await this.get('jobs',[]),missions=await this.get('missions',[]);let changed=false;
  for(const job of [...jobs]){
   if(job?.targetDeviceId!==deviceId||String(job?.status||'').toUpperCase()!=='RUNNING')continue;
   const leaseUntil=Number(job?.leaseUntil||0),last=Number(job?.lastProgressAt||job?.startedAt||0),expired=leaseUntil>0?leaseUntil<t:Boolean(last&&t-last>LEGACY_RUNNING_STALE_MS);
   if(!expired)continue;
   changed=true;
   const failureCore={schema:'OMEGA_HYBRID_STALL_RETURN_R242',jobId:job.id,deviceId,failedAt:t,reason:leaseUntil?'EXECUTION_LEASE_EXPIRED':'LEGACY_RUNNING_WITHOUT_LEASE',lastProgressAt:Number(job?.lastProgressAt||0)||null,startedAt:Number(job?.startedAt||0)||null};
   const resultFingerprint=await sha256(JSON.stringify(failureCore));
   Object.assign(job,{status:'FAILED',completedAt:t,stallReason:'R242_EXECUTION_LEASE_EXPIRED',leaseUntil:null,returnPacket:{...failureCore,receivedAt:t,stepProofs:[],outputPaths:[],log:'R242 execution-motion lease expired before a returned host result. No execution success is inferred.',resultFingerprint,proofExtensions:[EXECUTION_MOTION_REVISION],truthBoundary:'A missing execution-motion lease proves only that the Worker can no longer prove continued ownership of this RUNNING claim. It does not prove whether a local subprocess finished, failed, or was externally terminated.'}});
   const mission=missions.find(m=>m?.currentJobId===job.id&&m?.targetDeviceId===deviceId),stage=String(mission?.stage||''),steps=Array.isArray(job?.steps)?job.steps:[],mutation=steps.some(s=>MUTATING_OPS_R242.has(String(s?.op||'').toUpperCase())),recoveries=Number(mission?.stallRecoveries||0);
   if(mission&&RECOVERABLE_DISCOVERY_STAGES.has(stage)&&!mutation&&recoveries<MAX_STALL_RECOVERIES){
    let safeSteps=steps.filter(s=>!MUTATING_OPS_R242.has(String(s?.op||'').toUpperCase()));
    if(stage==='DISCOVERY')safeSteps=safeSteps.filter(s=>String(s?.op||'').toUpperCase()==='INDEX').slice(0,1).map(s=>({...s,maxResults:4000,discoveryOnly:true,label:'R242 bounded project discovery after expired execution lease'}));
    else if(stage==='PROJECT_DISCOVERY')safeSteps=safeSteps.filter(s=>String(s?.op||'').toUpperCase()==='INDEX').slice(0,8).map(s=>({...s,maxResults:4000,discoveryOnly:true}));
    else if(stage==='SIGNATURE_DISCOVERY')safeSteps=safeSteps.filter(s=>String(s?.op||'').toUpperCase()==='SEARCH_TEXT').slice(0,1).map(s=>({...s,maxResults:120}));
    if(safeSteps.length){const recovery={...job,id:randomIdR242('job'),status:'QUEUED',queuedAt:t,startedAt:null,completedAt:null,leaseUntil:null,lastProgressAt:null,progress:null,returnPacket:null,log:null,outputPaths:[],steps:safeSteps,recoveryOf:job.id,recoveryRevision:EXECUTION_MOTION_REVISION,recoveryReason:'EXPIRED_RUNNING_LEASE',inputFingerprint:await sha256(JSON.stringify({missionId:mission.id,recoveryOf:job.id,stage,steps:safeSteps,targetDeviceId:deviceId}))};jobs.push(recovery);Object.assign(mission,{status:'ACTIVE',currentJobId:recovery.id,currentJob:recovery,stallRecoveries:recoveries+1,stallRecoveryOf:job.id,holdReason:null,updatedAt:t});await this.event('R242_JOB_STALL_RECOVERED',`Expired non-mutating discovery job ${job.id} was replaced by bounded recovery ${recovery.id}.`,{deviceId,jobId:job.id,recoveryJobId:recovery.id,missionId:mission.id,stage});continue}
   }
   await this.event('R242_JOB_STALL_FAILED',`Expired running job ${job.id} was failed closed; no blind replay was issued.`,{deviceId,jobId:job.id,missionId:mission?.id||null,stage:stage||null,mutation});
  }
  if(changed){await this.put('jobs',jobs.slice(-120));await this.put('missions',missions.slice(-60))}
 }
 async fetch(request){
  const path=new URL(request.url).pathname;
  if(path==='/agent/progress'&&request.method==='POST'){
   if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401);
   const b=await request.json().catch(()=>({})),deviceId=safeId(b.deviceId,''),jobId=safeId(b.jobId,'');if(!deviceId||!jobId)return json({ok:false,code:'R242_PROGRESS_ID_REQUIRED'},400);
   const t=Date.now(),jobs=await this.get('jobs',[]),target=jobs.find(j=>j?.id===jobId&&j?.targetDeviceId===deviceId&&String(j?.status||'').toUpperCase()==='RUNNING');if(!target)return json({ok:false,code:'R242_JOB_NOT_RUNNING'},409);
   const seq=Math.max(0,Math.floor(Number(b.seq)||0)),priorSeq=Math.max(-1,Math.floor(Number(target?.progress?.seq)||-1));if(seq<priorSeq)return json({ok:false,code:'R242_PROGRESS_SEQUENCE_STALE',expectedAtLeast:priorSeq},409);
   const state=['CLAIMED','STEP_RUNNING','STEP_COMPLETE','RETURNING'].includes(String(b.state||''))?String(b.state):'STEP_RUNNING',progress={schema:'OMEGA_HYBRID_EXECUTION_PROGRESS_R242',revision:EXECUTION_MOTION_REVISION,at:t,seq,state,stepId:safeId(b.stepId,''),stepOp:text(b.stepOp).slice(0,64),stepIndex:Math.max(0,Math.floor(Number(b.stepIndex)||0)),totalSteps:Math.max(0,Math.floor(Number(b.totalSteps)||0)),completedSteps:Math.max(0,Math.floor(Number(b.completedSteps)||0)),elapsedMs:Math.max(0,Math.floor(Number(b.elapsedMs)||0)),message:text(b.message).slice(0,240)};
   const priorKey=`${target?.progress?.state||''}:${target?.progress?.stepId||''}:${target?.progress?.completedSteps||0}`,nextKey=`${progress.state}:${progress.stepId}:${progress.completedSteps}`,updated={...target,lastProgressAt:t,leaseUntil:t+RUNNING_LEASE_MS,progress};
   await this.put('jobs',jobs.map(j=>j.id===jobId?updated:j));const devices=await this.get('devices',[]);await this.put('devices',devices.map(d=>d.id===deviceId?{...d,lastSeen:t}:d));if(priorKey!==nextKey)await this.event('R242_JOB_PROGRESS',`Job ${jobId} motion ${progress.state}${progress.stepOp?` · ${progress.stepOp}`:''}.`,{deviceId,jobId,progress});return json({ok:true,jobId,deviceId,leaseUntil:updated.leaseUntil,progress});
  }
  if(path==='/agent/poll'&&request.method==='POST'){
   const b=await request.clone().json().catch(()=>({})),deviceId=safeId(b.deviceId,'');if(deviceId)await this.recoverStalledJobsR242(deviceId);
   const response=await super.fetch(request);if(!response.ok)return response;const data=await response.clone().json().catch(()=>({})),job=data?.job;if(!job?.id||String(job.status||'').toUpperCase()!=='RUNNING')return response;
   const t=Date.now(),jobs=await this.get('jobs',[]),updated={...job,lastProgressAt:t,leaseUntil:t+RUNNING_LEASE_MS,progress:{schema:'OMEGA_HYBRID_EXECUTION_PROGRESS_R242',revision:EXECUTION_MOTION_REVISION,at:t,seq:0,state:'CLAIMED',stepId:'',stepOp:'',stepIndex:0,totalSteps:Array.isArray(job.steps)?job.steps.length:0,completedSteps:0,elapsedMs:0,message:'Authenticated host claimed the job; waiting for first step motion pulse.'}};
   await this.put('jobs',jobs.map(j=>j.id===job.id?updated:j));return json({...data,job:updated},response.status);
  }
  return super.fetch(request);
 }
}
export default{fetch:fetchR101};
