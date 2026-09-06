import {appendWorldEventR134,continuityOperationRefR134,sha256R134} from './world/canonicalWorldContinuityR134.js';
import {assembleLivingWorldFrameR136} from './world/livingWorldFrameR136.js';

export const R139_REVISION='R139';
export const R139_SCHEMA='OMEGA_HYBRID_PROOF_SCAR_REPLAY_R139';
export const R139_LAWS=Object.freeze([
 'AGENT_FINGERPRINT_MUST_RECOMPUTE_BEFORE_PROOF',
 'HOST_RETURN_IS_EVIDENCE_NOT_CANONSTATE',
 'CURRENT_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'EVERY_RETURN_CARRIES_SCAR_HISTORY',
 'REPLAY_MUST_REPRODUCE_THE_SAME_FINAL_CONTINUITY_HEAD',
 'R134_REMAINS_WORLD_SCAR_PROOF_CHAIN',
 'R136_REMAINS_LIVING_EVIDENCE_FRAME',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'
]);
const text=(v,n=240)=>String(v??'').trim().slice(0,n);
const safeId=(v,fallback='')=>{const s=text(v,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));

export function agentPacketCoreR139(body={}){return{
 jobId:safeId(body.jobId),
 ok:body.ok!==false,
 stepProofs:Array.isArray(body.stepProofs)?body.stepProofs.slice(0,24):[],
 outputPaths:Array.isArray(body.outputPaths)?body.outputPaths.slice(0,40):[],
 log:String(body.log??'').slice(-12000),
 evaluation:body.evaluation??null,
 promotion:body.promotion??null,
 capabilityRevision:text(body.capabilityRevision,40)
}}
function evidenceMetrics(core,verified){const steps=core.stepProofs.length,passed=core.stepProofs.filter(x=>x?.ok===true).length,ratio=steps?passed/steps:(core.ok?1:0);return{continuity:verified?ratio:0,plasticity:core.ok&&verified?.35:.05,contradiction:verified&&core.ok?0:1,burden:clamp(steps/24,0,1),evidence:verified?1:0,uncertainty:verified?.05:1,scar:core.ok&&verified?.18:1}}
function closureInput({job,core,expectedFingerprint,suppliedFingerprint,fingerprintVerified,hybridSnapshot,eventTime,previousHead}){
 const deviceId=safeId(job?.targetDeviceId)||'device-unknown',proofIds=fingerprintVerified?[suppliedFingerprint]:[],metrics=evidenceMetrics(core,fingerprintVerified),jobId=safeId(job?.id);
 return{job:{id:jobId,targetDeviceId:deviceId,status:text(job?.status,24),projectPath:text(job?.projectPath,240),inputFingerprint:text(job?.inputFingerprint,160)},core,expectedFingerprint,suppliedFingerprint,fingerprintVerified,hybridSnapshot,eventTime,previousHead,frame:{eventTime,observerId:deviceId,projection:'HYBRID_EXECUTION',address:0,metrics,federation:{returned:true,node:'HYBRID_PC',sourceIds:[deviceId,text(core.capabilityRevision,40)].filter(Boolean),proofIds,scarIds:[jobId].filter(Boolean),payloadDigest:fingerprintVerified?suppliedFingerprint:expectedFingerprint},hybrid:{nativeExecutionClaimed:hybridSnapshot.currentHeartbeatProved,devices:hybridSnapshot.currentHeartbeatProved?[{id:deviceId,online:true,revoked:false}]:[],proofIds,resultFingerprint:fingerprintVerified?suppliedFingerprint:null},performance:{load:0,latencyPressure:0,evidence:fingerprintVerified?1:0}}};
}
async function compile(input){
 const living=await assembleLivingWorldFrameR136({...input.frame,previousHead:input.previousHead}),proofIds=input.fingerprintVerified?[input.suppliedFingerprint]:[];
 const finalHead=await appendWorldEventR134(living.head,{eventId:`${input.job.id}:scar`,kind:'SCAR',sequence:(living.events?.length||0)+1,eventTime:input.eventTime,observerId:input.job.targetDeviceId,projection:'HYBRID_EXECUTION',address:0,sourceIds:[input.job.targetDeviceId,input.core.capabilityRevision].filter(Boolean),proofIds,scarIds:[input.job.id],payloadDigest:input.fingerprintVerified?input.suppliedFingerprint:input.expectedFingerprint,metrics:input.frame.metrics,claim:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}});
 return{living,finalHead,operationRef:continuityOperationRefR134(finalHead)};
}

export async function closeHybridReturnR139(runtime,job,body){
 const core=agentPacketCoreR139(body),expectedFingerprint=await sha256R134(core),suppliedFingerprint=text(body.resultFingerprint,160),fingerprintVerified=Boolean(suppliedFingerprint&&suppliedFingerprint===expectedFingerprint),devices=await runtime.devices(),deviceId=safeId(job?.targetDeviceId),device=devices.find(x=>x?.id===deviceId),currentHeartbeatProved=Boolean(device&&device.online===true&&device.revoked!==true),eventTime=clamp(job?.returnPacket?.receivedAt||job?.completedAt||Date.now(),0,Number.MAX_SAFE_INTEGER),previousHead=await runtime.get('r139WorldHead',null);
 const input=closureInput({job,core,expectedFingerprint,suppliedFingerprint,fingerprintVerified,hybridSnapshot:{deviceId,currentHeartbeatProved,observedLastSeen:Number(device?.lastSeen||0),capabilityRevision:text(device?.capabilityRevision||core.capabilityRevision,40)},eventTime,previousHead}),compiled=await compile(input);
 const closure={ok:true,schema:R139_SCHEMA,revision:R139_REVISION,jobId:input.job.id,state:fingerprintVerified?(core.ok?'VERIFIED_EXECUTION_RETURN':'VERIFIED_FAILED_EXECUTION_RETURN'):'FINGERPRINT_MISMATCH',fingerprint:{supplied:suppliedFingerprint||null,expected:expectedFingerprint,verified:fingerprintVerified},hybridProofAtClose:input.hybridSnapshot,previousHeadSha256:previousHead?.headSha256||null,livingWorldFrame:compiled.living,continuity:compiled.operationRef,finalHeadSha256:compiled.finalHead.headSha256,input,canonicalMutation:false,canonicalAdmissionAuthority:'R125',durability:'OMEGA_RUNTIME_DURABLE_OBJECT_EVIDENCE_STORE',r97ContinuityPromotion:'NOT_AUTO_PROMOTED',truthBoundary:'R139 deterministically closes a returned bounded Hybrid job into R134 continuity/scar evidence and an R136 living-world evidence frame. The agent fingerprint must recompute before the return is treated as proof. Durable runtime evidence, replay success, current heartbeat proof, and build/test success never mutate CanonState or replace R125 admission.'};
 await runtime.put('r139WorldHead',compiled.finalHead);await runtime.put('r139Closure:'+closure.jobId,closure);
 const index=await runtime.get('r139ClosureIndex',[]);await runtime.put('r139ClosureIndex',[...index.filter(x=>x!==closure.jobId),closure.jobId].slice(-120));
 const jobs=await runtime.get('jobs',[]);await runtime.put('jobs',jobs.map(x=>x.id===closure.jobId?({...x,proofClosure:{schema:R139_SCHEMA,state:closure.state,fingerprintVerified:closure.fingerprint.verified,finalHeadSha256:closure.finalHeadSha256,continuity:closure.continuity,canonicalMutation:false}}):x));
 await runtime.event('JOB_PROOF_CLOSED',`Job ${closure.jobId} return closed into deterministic proof/scar evidence.`,{jobId:closure.jobId,state:closure.state,fingerprintVerified:closure.fingerprint.verified,finalHeadSha256:closure.finalHeadSha256});
 return closure;
}
export async function readHybridClosureR139(runtime,jobId){return runtime.get('r139Closure:'+safeId(jobId),null)}
export async function replayHybridClosureR139(runtime,jobId){
 const id=safeId(jobId),closure=await readHybridClosureR139(runtime,id);if(!closure)return null;
 const expected=await sha256R134(closure.input.core),fingerprintVerified=Boolean(closure.input.suppliedFingerprint&&closure.input.suppliedFingerprint===expected),input={...closure.input,expectedFingerprint:expected,fingerprintVerified},compiled=await compile(input),headMatch=compiled.finalHead.headSha256===closure.finalHeadSha256,fingerprintMatch=expected===closure.fingerprint.expected&&fingerprintVerified===closure.fingerprint.verified;
 const receipt={ok:headMatch&&fingerprintMatch,schema:'OMEGA_HYBRID_REPLAY_RECEIPT_R139',revision:R139_REVISION,jobId:id,replayedAt:Date.now(),fingerprintMatch,headMatch,expectedFingerprint:expected,originalHeadSha256:closure.finalHeadSha256,replayedHeadSha256:compiled.finalHead.headSha256,canonicalMutation:false,canonicalAdmissionAuthority:'R125',authority:'DETERMINISTIC_EXECUTION_EVIDENCE_REPLAY_NOT_CANONSTATE'};
 await runtime.put('r139Closure:'+id,{...closure,replayCount:Number(closure.replayCount||0)+1,lastReplayReceipt:receipt});await runtime.event(receipt.ok?'JOB_REPLAY_VERIFIED':'JOB_REPLAY_MISMATCH',`Job ${id} deterministic proof replay ${receipt.ok?'verified':'mismatched'}.`,{jobId:id,headMatch:receipt.headMatch,fingerprintMatch:receipt.fingerprintMatch});return receipt;
}
export function manifestR139(){return{ok:true,schema:R139_SCHEMA,revision:R139_REVISION,laws:R139_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',durability:'OMEGA_RUNTIME_DURABLE_OBJECT_EVIDENCE_STORE',r97ContinuityPromotion:'NOT_AUTO_PROMOTED',truthBoundary:'Manifest only. R139 adds deterministic host-return closure/replay evidence inside the already-proven Hybrid durable runtime. It does not itself claim a PC is online, a workload succeeded, or CanonState changed.'}}
