import {appendWorldEventR134,continuityOperationRefR134,sha256R134} from './world/canonicalWorldContinuityR134.js';
import {assembleLivingWorldFrameR136} from './world/livingWorldFrameR136.js';

export const R140_REVISION='R140';
export const R140_SCHEMA='OMEGA_HYBRID_PROOF_SCAR_REPLAY_R140';
export const R140_FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R140';
export const R140_LAWS=Object.freeze([
 'EXACT_AGENT_PAYLOAD_SHA_AND_SEMANTIC_EQUALITY_REQUIRED_BEFORE_PROOF',
 'LEGACY_AGENT_FINGERPRINT_IS_LINEAGE_NOT_R140_PROOF',
 'HOST_RETURN_IS_EVIDENCE_NOT_CANONSTATE',
 'CURRENT_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'EVERY_RETURN_CARRIES_SCAR_HISTORY',
 'REPLAY_MUST_REPRODUCE_THE_SAME_FINAL_CONTINUITY_HEAD',
 'R134_REMAINS_WORLD_SCAR_PROOF_CHAIN',
 'R136_REMAINS_LIVING_EVIDENCE_FRAME',
 'R139_UNIFIED_CAPABILITY_ENGINE_REMAINS_INDEPENDENT_AND_PRESERVED',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'
]);
const text=(v,n=240)=>String(v??'').trim().slice(0,n);
const safeId=(v,fallback='')=>{const s=text(v,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const MAX_FINGERPRINT_PAYLOAD_BYTES=512*1024;

export function agentPacketCoreR140(body={}){return{
 jobId:safeId(body.jobId),
 ok:body.ok!==false,
 stepProofs:Array.isArray(body.stepProofs)?body.stepProofs.slice(0,24):[],
 outputPaths:Array.isArray(body.outputPaths)?body.outputPaths.slice(0,40):[],
 log:String(body.log??'').slice(-12000),
 evaluation:body.evaluation??null,
 promotion:body.promotion??null,
 capabilityRevision:text(body.capabilityRevision,40)
}}
function fingerprintSourceR140(body={}){return{resultFingerprintSchema:text(body.resultFingerprintSchema,80),resultFingerprintR140Payload:typeof body.resultFingerprintR140Payload==='string'?body.resultFingerprintR140Payload:'',resultFingerprintR140:text(body.resultFingerprintR140,160),legacyResultFingerprint:text(body.resultFingerprint,160),proofClosureRevision:text(body.proofClosureRevision,40),baseAgentSha256:text(body.baseAgentSha256,160)}}
async function fingerprintEvidenceR140(source,core){
 const payload=source.resultFingerprintR140Payload||'',payloadBytes=new TextEncoder().encode(payload).byteLength,legacy=source.legacyResultFingerprint||null,coreSemanticDigest=await sha256R134(core);
 if(source.resultFingerprintSchema!==R140_FINGERPRINT_SCHEMA||!payload||!source.resultFingerprintR140||payloadBytes>MAX_FINGERPRINT_PAYLOAD_BYTES)return{schema:source.resultFingerprintSchema||null,state:'R140_FINGERPRINT_REQUIRED',supplied:source.resultFingerprintR140||null,expected:null,verified:false,digestMatch:false,semanticMatch:false,payloadBytes,coreSemanticDigest,legacy,legacyAuthority:'LINEAGE_ONLY_NOT_R140_PROOF'};
 const expected=await sha256R134(payload),digestMatch=source.resultFingerprintR140===expected;let parsed=null,parseOk=false;
 try{parsed=JSON.parse(payload);parseOk=Boolean(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))}catch{}
 const payloadSemanticDigest=parseOk?await sha256R134(parsed):null,semanticMatch=Boolean(parseOk&&payloadSemanticDigest===coreSemanticDigest),verified=digestMatch&&semanticMatch;
 return{schema:source.resultFingerprintSchema,state:verified?'R140_FINGERPRINT_VERIFIED':'FINGERPRINT_MISMATCH',supplied:source.resultFingerprintR140,expected,verified,digestMatch,semanticMatch,parseOk,payloadBytes,payloadSemanticDigest,coreSemanticDigest,legacy,legacyAuthority:'LINEAGE_ONLY_NOT_R140_PROOF'};
}
function evidenceMetrics(core,verified){const steps=core.stepProofs.length,passed=core.stepProofs.filter(x=>x?.ok===true).length,ratio=steps?passed/steps:(core.ok?1:0);return{continuity:verified?ratio:0,plasticity:core.ok&&verified?.35:.05,contradiction:verified&&core.ok?0:1,burden:clamp(steps/24,0,1),evidence:verified?1:0,uncertainty:verified?.05:1,scar:core.ok&&verified?.18:1}}
function closureInput({job,core,fingerprint,fingerprintSource,hybridSnapshot,eventTime,previousHead}){
 const deviceId=safeId(job?.targetDeviceId)||'device-unknown',proofIds=fingerprint.verified?[fingerprint.supplied]:[],metrics=evidenceMetrics(core,fingerprint.verified),jobId=safeId(job?.id),payloadDigest=fingerprint.expected||fingerprint.coreSemanticDigest;
 return{job:{id:jobId,targetDeviceId:deviceId,status:text(job?.status,24),projectPath:text(job?.projectPath,240),inputFingerprint:text(job?.inputFingerprint,160)},core,fingerprint,fingerprintSource,hybridSnapshot,eventTime,previousHead,addressAuthority:'UNBOUND_RUNTIME_EVIDENCE_FRAME_ADDRESS_0',metricAuthority:'NORMALIZED_EXECUTION_EVIDENCE_NOT_PHYSICAL_MEASUREMENT',frame:{eventTime,observerId:deviceId,projection:'HYBRID_EXECUTION',address:0,metrics,federation:{returned:true,node:'HYBRID_PC',sourceIds:[deviceId,text(core.capabilityRevision,40),fingerprintSource.baseAgentSha256].filter(Boolean),proofIds,scarIds:[jobId].filter(Boolean),payloadDigest},hybrid:{nativeExecutionClaimed:hybridSnapshot.currentHeartbeatProved,devices:hybridSnapshot.currentHeartbeatProved?[{id:deviceId,online:true,revoked:false}]:[],proofIds,resultFingerprint:fingerprint.verified?fingerprint.supplied:null},performance:{load:0,latencyPressure:0,evidence:fingerprint.verified?1:0}}};
}
async function compile(input){
 const living=await assembleLivingWorldFrameR136({...input.frame,previousHead:input.previousHead}),proofIds=input.fingerprint.verified?[input.fingerprint.supplied]:[],payloadDigest=input.fingerprint.expected||input.fingerprint.coreSemanticDigest;
 const finalHead=await appendWorldEventR134(living.head,{eventId:`${input.job.id}:scar`,kind:'SCAR',sequence:(living.events?.length||0)+1,eventTime:input.eventTime,observerId:input.job.targetDeviceId,projection:'HYBRID_EXECUTION',address:0,sourceIds:[input.job.targetDeviceId,input.core.capabilityRevision,input.fingerprintSource.baseAgentSha256].filter(Boolean),proofIds,scarIds:[input.job.id],payloadDigest,metrics:input.frame.metrics,claim:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}});
 return{living,finalHead,operationRef:continuityOperationRefR134(finalHead)};
}

export async function closeHybridReturnR140(runtime,job,body){
 const core=agentPacketCoreR140(body),source=fingerprintSourceR140(body),fingerprint=await fingerprintEvidenceR140(source,core),devices=await runtime.devices(),deviceId=safeId(job?.targetDeviceId),device=devices.find(x=>x?.id===deviceId),currentHeartbeatProved=Boolean(device&&device.online===true&&device.revoked!==true),eventTime=clamp(job?.returnPacket?.receivedAt||job?.completedAt||Date.now(),0,Number.MAX_SAFE_INTEGER),previousHead=await runtime.get('r140WorldHead',null);
 const input=closureInput({job,core,fingerprint,fingerprintSource:source,hybridSnapshot:{deviceId,currentHeartbeatProved,observedLastSeen:Number(device?.lastSeen||0),capabilityRevision:text(device?.capabilityRevision||core.capabilityRevision,40)},eventTime,previousHead}),compiled=await compile(input);
 const state=fingerprint.verified?(core.ok?'VERIFIED_EXECUTION_RETURN':'VERIFIED_FAILED_EXECUTION_RETURN'):fingerprint.state;
 const closure={ok:true,schema:R140_SCHEMA,revision:R140_REVISION,jobId:input.job.id,state,fingerprint,hybridProofAtClose:input.hybridSnapshot,previousHeadSha256:previousHead?.headSha256||null,livingWorldFrame:compiled.living,continuity:compiled.operationRef,finalHeadSha256:compiled.finalHead.headSha256,input,canonicalMutation:false,canonicalAdmissionAuthority:'R125',durability:'OMEGA_RUNTIME_DURABLE_OBJECT_EVIDENCE_STORE',r97ContinuityPromotion:'NOT_AUTO_PROMOTED',truthBoundary:'R140 closes a returned bounded Hybrid job into R134 continuity/scar evidence and an R136 living-world evidence frame only after the exact R140 payload SHA-256 matches and the parsed payload is semantically identical to the returned packet core. Legacy Python resultFingerprint remains lineage only. R139 unified capability routing remains independent. Durable evidence, replay success, heartbeat proof, build/test success, and host claims never mutate CanonState or replace R125 admission.'};
 await runtime.put('r140WorldHead',compiled.finalHead);await runtime.put('r140Closure:'+closure.jobId,closure);
 const index=await runtime.get('r140ClosureIndex',[]);await runtime.put('r140ClosureIndex',[...index.filter(x=>x!==closure.jobId),closure.jobId].slice(-120));
 const jobs=await runtime.get('jobs',[]);await runtime.put('jobs',jobs.map(x=>x.id===closure.jobId?({...x,proofClosure:{schema:R140_SCHEMA,state:closure.state,fingerprintVerified:closure.fingerprint.verified,finalHeadSha256:closure.finalHeadSha256,continuity:closure.continuity,canonicalMutation:false}}):x));
 await runtime.event('JOB_PROOF_CLOSED',`Job ${closure.jobId} return closed into deterministic R140 proof/scar evidence.`,{jobId:closure.jobId,state:closure.state,fingerprintVerified:closure.fingerprint.verified,finalHeadSha256:closure.finalHeadSha256});
 return closure;
}
export async function readHybridClosureR140(runtime,jobId){return runtime.get('r140Closure:'+safeId(jobId),null)}
export async function replayHybridClosureR140(runtime,jobId){
 const id=safeId(jobId),closure=await readHybridClosureR140(runtime,id);if(!closure)return null;
 const freshFingerprint=await fingerprintEvidenceR140(closure.input.fingerprintSource,closure.input.core),input={...closure.input,fingerprint:freshFingerprint},compiled=await compile(input),headMatch=compiled.finalHead.headSha256===closure.finalHeadSha256,fingerprintMatch=freshFingerprint.verified===closure.fingerprint.verified&&freshFingerprint.expected===closure.fingerprint.expected&&freshFingerprint.semanticMatch===closure.fingerprint.semanticMatch;
 const receipt={ok:headMatch&&fingerprintMatch,schema:'OMEGA_HYBRID_REPLAY_RECEIPT_R140',revision:R140_REVISION,jobId:id,replayedAt:Date.now(),fingerprintMatch,headMatch,expectedFingerprint:freshFingerprint.expected,originalHeadSha256:closure.finalHeadSha256,replayedHeadSha256:compiled.finalHead.headSha256,canonicalMutation:false,canonicalAdmissionAuthority:'R125',authority:'DETERMINISTIC_EXECUTION_EVIDENCE_REPLAY_NOT_CANONSTATE'};
 await runtime.put('r140Closure:'+id,{...closure,replayCount:Number(closure.replayCount||0)+1,lastReplayReceipt:receipt});await runtime.event(receipt.ok?'JOB_REPLAY_VERIFIED':'JOB_REPLAY_MISMATCH',`Job ${id} deterministic R140 proof replay ${receipt.ok?'verified':'mismatched'}.`,{jobId:id,headMatch:receipt.headMatch,fingerprintMatch:receipt.fingerprintMatch});return receipt;
}
export function manifestR140(){return{ok:true,schema:R140_SCHEMA,revision:R140_REVISION,fingerprintSchema:R140_FINGERPRINT_SCHEMA,laws:R140_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',preservesUnifiedCapabilityRevision:'R139',durability:'OMEGA_RUNTIME_DURABLE_OBJECT_EVIDENCE_STORE',r97ContinuityPromotion:'NOT_AUTO_PROMOTED',truthBoundary:'Manifest only. R140 adds exact-payload host-return closure/replay evidence inside the already-proven Hybrid Durable Object runtime while preserving the separate R139 unified capability engine. It does not itself claim a PC is online, a workload succeeded, or CanonState changed.'}}
