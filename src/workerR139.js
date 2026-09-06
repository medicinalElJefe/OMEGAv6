import r117,{OmegaRuntime as OmegaRuntimeR117} from './workerR117.js';
import {appendWorldEventR134,continuityOperationRefR134,sha256R134} from './world/canonicalWorldContinuityR134.js';
import {assembleLivingWorldFrameR136} from './world/livingWorldFrameR136.js';

const REVISION='R139';
const SCHEMA='OMEGA_HYBRID_PROOF_SCAR_REPLAY_R139';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=(v,n=240)=>String(v??'').trim().slice(0,n);
const safeId=(v,fallback='')=>{const s=text(v,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const CLOSURE_LAWS=Object.freeze([
 'AGENT_FINGERPRINT_MUST_RECOMPUTE_BEFORE_PROOF',
 'HOST_RETURN_IS_EVIDENCE_NOT_CANONSTATE',
 'CURRENT_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'EVERY_RETURN_CARRIES_SCAR_HISTORY',
 'REPLAY_MUST_REPRODUCE_THE_SAME_FINAL_CONTINUITY_HEAD',
 'R134_REMAINS_WORLD_SCAR_PROOF_CHAIN',
 'R136_REMAINS_LIVING_EVIDENCE_FRAME',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'
]);

function runtimeId(request){return safeId(request.headers.get('x-omega-bridge-id'))||safeId(request.headers.get('x-omega-session-id'))}
async function proxyRuntimeR139(request,env,internalPath){
 const id=runtimeId(request);
 if(!id)return json({ok:false,code:'HYBRID_RUNTIME_ID_REQUIRED',reply:'Pair this browser to a Hybrid runtime before reading execution proof closure.'},400);
 if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);
 const stub=env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id)),headers=new Headers(request.headers),method=request.method;
 const init={method,headers};
 if(method!=='GET'&&method!=='HEAD')init.body=await request.clone().text();
 return stub.fetch(new Request('https://omega-runtime.internal'+internalPath,init));
}
function packetCoreR139(body={}){return{
 jobId:safeId(body.jobId),
 ok:body.ok!==false,
 stepProofs:Array.isArray(body.stepProofs)?body.stepProofs.slice(0,24):[],
 outputPaths:Array.isArray(body.outputPaths)?body.outputPaths.slice(0,40):[],
 log:text(body.log,12000),
 evaluation:body.evaluation??null,
 promotion:body.promotion??null,
 capabilityRevision:text(body.capabilityRevision,40)
}}
function closureMetricsR139(core,verified){
 const steps=core.stepProofs.length,passed=core.stepProofs.filter(x=>x?.ok===true).length,ratio=steps?passed/steps:(core.ok?1:0);
 return{continuity:verified?ratio:0,plasticity:core.ok&&verified?.35:.05,contradiction:verified&&core.ok?0:1,burden:clamp(steps/24,0,1),evidence:verified?1:0,uncertainty:verified?.05:1,scar:core.ok&&verified?.18:1};
}
function closureInputR139({job,core,expectedFingerprint,suppliedFingerprint,fingerprintVerified,hybridSnapshot,eventTime,previousHead}){
 const deviceId=safeId(job?.targetDeviceId)||'device-unknown',proofIds=fingerprintVerified?[suppliedFingerprint]:[],metrics=closureMetricsR139(core,fingerprintVerified);
 return{
  job:{id:safeId(job?.id),targetDeviceId:deviceId,status:text(job?.status,24),projectPath:text(job?.projectPath,240),inputFingerprint:text(job?.inputFingerprint,160)},
  core,expectedFingerprint,suppliedFingerprint,fingerprintVerified,hybridSnapshot,eventTime,previousHead,
  frame:{eventTime,observerId:deviceId,projection:'HYBRID_EXECUTION',address:0,metrics,
   federation:{returned:true,node:'HYBRID_PC',sourceIds:[deviceId,text(core.capabilityRevision,40)].filter(Boolean),proofIds,scarIds:[safeId(job?.id)].filter(Boolean),payloadDigest:fingerprintVerified?suppliedFingerprint:expectedFingerprint},
   hybrid:{nativeExecutionClaimed:hybridSnapshot.currentHeartbeatProved,devices:hybridSnapshot.currentHeartbeatProved?[{id:deviceId,online:true,revoked:false}]:[],proofIds,resultFingerprint:fingerprintVerified?suppliedFingerprint:null},
   performance:{load:0,latencyPressure:0,evidence:fingerprintVerified?1:0}
  }
 };
}
async function compileClosureR139(input){
 const living=await assembleLivingWorldFrameR136({...input.frame,previousHead:input.previousHead});
 const proofIds=input.fingerprintVerified?[input.suppliedFingerprint]:[];
 const scarHead=await appendWorldEventR134(living.head,{
  eventId:`${input.job.id}:scar`,kind:'SCAR',sequence:living.events.length+1,eventTime:input.eventTime,observerId:input.job.targetDeviceId,projection:'HYBRID_EXECUTION',address:0,
  sourceIds:[input.job.targetDeviceId,input.core.capabilityRevision].filter(Boolean),proofIds,scarIds:[input.job.id],payloadDigest:input.fingerprintVerified?input.suppliedFingerprint:input.expectedFingerprint,metrics:input.frame.metrics,
  claim:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}
 });
 const operationRef=continuityOperationRefR134(scarHead);
 return{living,scarHead,operationRef,finalHeadSha256:scarHead.headSha256};
}
async function buildClosureR139(job,body,devices,previousHead){
 const core=packetCoreR139(body),expectedFingerprint=await sha256R134(core),suppliedFingerprint=text(body.resultFingerprint,160),fingerprintVerified=Boolean(suppliedFingerprint&&suppliedFingerprint===expectedFingerprint),deviceId=safeId(job?.targetDeviceId),device=devices.find(x=>x?.id===deviceId),currentHeartbeatProved=Boolean(device&&device.online===true&&device.revoked!==true),eventTime=clamp(job?.returnPacket?.receivedAt||job?.completedAt||Date.now(),0,Number.MAX_SAFE_INTEGER);
 const input=closureInputR139({job,core,expectedFingerprint,suppliedFingerprint,fingerprintVerified,hybridSnapshot:{deviceId,currentHeartbeatProved,observedLastSeen:Number(device?.lastSeen||0),capabilityRevision:text(device?.capabilityRevision||core.capabilityRevision,40)},eventTime,previousHead});
 const compiled=await compileClosureR139(input);
 return{ok:true,schema:SCHEMA,revision:REVISION,jobId:input.job.id,state:fingerprintVerified?(core.ok?'VERIFIED_EXECUTION_RETURN':'VERIFIED_FAILED_EXECUTION_RETURN'):'FINGERPRINT_MISMATCH',fingerprint:{supplied:suppliedFingerprint||null,expected:expectedFingerprint,verified:fingerprintVerified},hybridProofAtClose:input.hybridSnapshot,previousHeadSha256:previousHead?.headSha256||null,livingWorldFrame:compiled.living,continuity:compiled.operationRef,finalHeadSha256:compiled.finalHeadSha256,input,canonicalMutation:false,canonicalAdmissionAuthority:'R125',durability:'OMEGA_RUNTIME_DURABLE_OBJECT_EVIDENCE_STORE',r97ContinuityPromotion:'NOT_AUTO_PROMOTED',truthBoundary:'R139 deterministically closes a returned bounded Hybrid job into R134 continuity/scar evidence and an R136 living-world evidence frame. The agent fingerprint must recompute before the return is treated as proof. Durable runtime evidence, replay success, current heartbeat proof, and build/test success never mutate CanonState or replace R125 admission.'};
}
async function replayClosureR139(closure){
 const expected=await sha256R134(closure.input.core),fingerprintVerified=Boolean(closure.input.suppliedFingerprint&&closure.input.suppliedFingerprint===expected),reinput={...closure.input,expectedFingerprint:expected,fingerprintVerified};
 const compiled=await compileClosureR139(reinput),headMatch=compiled.finalHeadSha256===closure.finalHeadSha256,fingerprintMatch=expected===closure.fingerprint.expected&&fingerprintVerified===closure.fingerprint.verified;
 return{ok:headMatch&&fingerprintMatch,schema:'OMEGA_HYBRID_REPLAY_RECEIPT_R139',revision:REVISION,jobId:closure.jobId,replayedAt:Date.now(),fingerprintMatch,headMatch,expectedFingerprint:expected,originalHeadSha256:closure.finalHeadSha256,replayedHeadSha256:compiled.finalHeadSha256,canonicalMutation:false,canonicalAdmissionAuthority:'R125',authority:'DETERMINISTIC_EXECUTION_EVIDENCE_REPLAY_NOT_CANONSTATE'};
}

export class OmegaRuntime extends OmegaRuntimeR117 {
 async fetch(request){
  const u=new URL(request.url),path=u.pathname;
  if(path==='/agent/result'&&request.method==='POST'){
   const body=await request.clone().json().catch(()=>({})),response=await super.fetch(request);
   if(!response.ok)return response;
   const data=await response.clone().json().catch(()=>({})),job=data?.job;
   if(!job?.returnPacket||!safeId(job.id))return response;
   const previousHead=await this.get('r139WorldHead',null),devices=await this.devices(),closure=await buildClosureR139(job,body,devices,previousHead);
   await this.put('r139WorldHead',closure.livingWorldFrame?.head&&closure.finalHeadSha256?closure.livingWorldFrame.head:previousHead);
   // The final scar head is the continuity authority for the next closure; keep the minimal R134 head snapshot, not CanonState.
   const finalHead=closure.livingWorldFrame?.head?await appendWorldEventR134(closure.livingWorldFrame.head,{eventId:`${closure.jobId}:scar`,kind:'SCAR',sequence:(closure.livingWorldFrame.events?.length||0)+1,eventTime:closure.input.eventTime,observerId:closure.input.job.targetDeviceId,projection:'HYBRID_EXECUTION',address:0,sourceIds:[closure.input.job.targetDeviceId,closure.input.core.capabilityRevision].filter(Boolean),proofIds:closure.fingerprint.verified?[closure.fingerprint.supplied]:[],scarIds:[closure.jobId],payloadDigest:closure.fingerprint.verified?closure.fingerprint.supplied:closure.fingerprint.expected,metrics:closure.input.frame.metrics,claim:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}}):previousHead;
   if(finalHead)await this.put('r139WorldHead',finalHead);
   await this.put('r139Closure:'+closure.jobId,closure);
   const index=await this.get('r139ClosureIndex',[]);await this.put('r139ClosureIndex',[...index.filter(x=>x!==closure.jobId),closure.jobId].slice(-120));
   const jobs=await this.get('jobs',[]);await this.put('jobs',jobs.map(x=>x.id===closure.jobId?({...x,proofClosure:{schema:SCHEMA,state:closure.state,fingerprintVerified:closure.fingerprint.verified,finalHeadSha256:closure.finalHeadSha256,continuity:closure.continuity,canonicalMutation:false}}):x));
   await this.event('JOB_PROOF_CLOSED',`Job ${closure.jobId} return closed into deterministic proof/scar evidence.`,{jobId:closure.jobId,state:closure.state,fingerprintVerified:closure.fingerprint.verified,finalHeadSha256:closure.finalHeadSha256});
   return json({...data,proofClosure:{schema:SCHEMA,state:closure.state,fingerprint:closure.fingerprint,continuity:closure.continuity,finalHeadSha256:closure.finalHeadSha256,canonicalMutation:false,canonicalAdmissionAuthority:'R125'}});
  }
  const closureMatch=path.match(/^\/jobs\/([A-Za-z0-9._:-]+)\/closure$/);
  if(closureMatch&&request.method==='GET'){
   if(!await this.authorized(request))return json({ok:false,code:'DEVICE_PROOF_REQUIRED'},401);
   const id=safeId(closureMatch[1]),closure=await this.get('r139Closure:'+id,null);return closure?json({ok:true,closure}):json({ok:false,code:'PROOF_CLOSURE_NOT_FOUND'},404);
  }
  const replayMatch=path.match(/^\/jobs\/([A-Za-z0-9._:-]+)\/replay$/);
  if(replayMatch&&request.method==='POST'){
   if(!await this.authorized(request))return json({ok:false,code:'DEVICE_PROOF_REQUIRED'},401);
   const id=safeId(replayMatch[1]),closure=await this.get('r139Closure:'+id,null);if(!closure)return json({ok:false,code:'PROOF_CLOSURE_NOT_FOUND'},404);
   const receipt=await replayClosureR139(closure),updated={...closure,replayCount:Number(closure.replayCount||0)+1,lastReplayReceipt:receipt};await this.put('r139Closure:'+id,updated);await this.event(receipt.ok?'JOB_REPLAY_VERIFIED':'JOB_REPLAY_MISMATCH',`Job ${id} deterministic proof replay ${receipt.ok?'verified':'mismatched'}.`,{jobId:id,headMatch:receipt.headMatch,fingerprintMatch:receipt.fingerprintMatch});return json({ok:receipt.ok,receipt},receipt.ok?200:409);
  }
  return super.fetch(request);
 }
}

async function fetchR139(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/hybrid/proof-closure/r139'&&request.method==='GET')return json({ok:true,schema:SCHEMA,revision:REVISION,laws:CLOSURE_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'Manifest only; no job or PC execution claim is made by this endpoint.'});
 const m=path.match(/^\/api\/hybrid\/jobs\/([A-Za-z0-9._:-]+)\/(closure|replay)$/);
 if(m&&((m[2]==='closure'&&request.method==='GET')||(m[2]==='replay'&&request.method==='POST')))return proxyRuntimeR139(request,env,`/jobs/${m[1]}/${m[2]}`);
 const response=await r117.fetch(request,env),headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default{fetch:fetchR139};
