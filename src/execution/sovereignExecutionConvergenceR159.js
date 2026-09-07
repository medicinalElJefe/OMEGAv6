import {sha256R134} from '../world/canonicalWorldContinuityR134.js';

export const R159_REVISION='R159';
export const R159_SCHEMA='OMEGA_SOVEREIGN_EXECUTION_CONVERGENCE_R159';
export const R159_ADMISSION_SCHEMA='OMEGA_R125_ADMISSION_CANDIDATE_R159';
export const R159_LAWS=Object.freeze([
 'AUTHENTICATED_HEARTBEAT_PROVES_DEVICE_AVAILABILITY_NOT_JOB_SUCCESS',
 'QUEUED_IS_NOT_INVOKED',
 'RUNNING_IS_INVOKED_NOT_RETURNED',
 'RETURNED_IS_NOT_VERIFIED',
 'R141_EXACT_PAYLOAD_DIGEST_AND_SEMANTIC_EQUALITY_REQUIRED',
 'R141_VERIFIED_FAILED_RETURN_IS_VERIFIED_EVIDENCE_NOT_SUCCESS',
 'FAILED_EXECUTION_MAY_NOT_ADVANCE_TO_R125_READY_STATE',
 'R141_VERIFIED_RETURN_MUST_BIND_R134_SCAR_AND_R136_WORLD_FRAME',
 'DETERMINISTIC_REPLAY_REQUIRED_BEFORE_R125_ADMISSION_CANDIDATE_READY',
 'R147_DURABLE_EXECUTOR_STATE_REMAINS_SEPARATE_EXECUTION_HISTORY_AUTHORITY',
 'R140_WORLD_PROJECTION_REMAINS_NON_CANONICAL',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY',
 'NO_AUTONOMOUS_CANON_MUTATION_FROM_HOST_RETURN'
]);

const text=(v,n=240)=>String(v??'').trim().slice(0,n);
const safeId=(v,fallback='')=>{const s=text(v,180);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const stage=(id,state,proofRef=null)=>({id,state,proofRef});

function exactPayloadVerified(closure){return Boolean(
 ['VERIFIED_EXECUTION_RETURN','VERIFIED_FAILED_EXECUTION_RETURN'].includes(String(closure?.state||''))&&
 closure?.fingerprint?.verified===true&&
 closure?.fingerprint?.digestMatch===true&&
 closure?.fingerprint?.semanticMatch===true
)}
function successfulVerifiedReturn(closure){return Boolean(exactPayloadVerified(closure)&&closure?.state==='VERIFIED_EXECUTION_RETURN')}
function verifiedFailedReturn(closure){return Boolean(exactPayloadVerified(closure)&&closure?.state==='VERIFIED_FAILED_EXECUTION_RETURN')}
function replayVerified(replay){return Boolean(replay?.ok===true&&replay?.headMatch===true&&replay?.fingerprintMatch===true)}
function admissionState(closure,replay){
 if(!closure)return'HELD_NO_R141_CLOSURE';
 if(!exactPayloadVerified(closure))return'HELD_R141_RETURN_NOT_VERIFIED';
 if(verifiedFailedReturn(closure))return'HELD_EXECUTION_FAILED_WITH_VERIFIED_RETURN';
 if(!replayVerified(replay))return'HELD_DETERMINISTIC_REPLAY_REQUIRED';
 if(!closure?.finalHeadSha256||closure?.livingWorldFrame?.revision!=='R136')return'HELD_WORLD_EVIDENCE_INCOMPLETE';
 return'READY_FOR_R125_PROOF_GATE';
}

export async function compileSovereignExecutionConvergenceR159(runtime,job,closure,replayReceipt=null){
 const jobId=safeId(job?.id||closure?.jobId),payloadVerified=exactPayloadVerified(closure),verified=successfulVerifiedReturn(closure),failedVerified=verifiedFailedReturn(closure),replayOk=replayVerified(replayReceipt),candidateState=admissionState(closure,replayReceipt),deviceId=safeId(closure?.hybridProofAtClose?.deviceId||job?.targetDeviceId,'device-unknown');
 const core={
  schema:R159_SCHEMA,revision:R159_REVISION,jobId,compiledAt:Date.now(),
  authorityChain:{
   connector:'R127_ZERO_DRIFT_SHA256',executionPlane:'R132',operationBridge:'R140',proofClosure:'R141',lifecycle:'R142',operationChain:'R143',durableExecution:'R146',executorFabric:'R147',worldContinuity:'R134',livingWorldFrame:'R136',canonicalAdmission:'R125'
  },
  binding:{
   deviceId,
   targetCapabilityRevision:text(job?.targetCapabilityRevision||closure?.hybridProofAtClose?.capabilityRevision,40)||null,
   jobStatus:text(job?.status,32)||null,
   inputFingerprint:text(job?.inputFingerprint,160)||null,
   exactReturnFingerprint:closure?.fingerprint?.supplied||null,
   recomputedReturnFingerprint:closure?.fingerprint?.expected||null,
   finalWorldHeadSha256:closure?.finalHeadSha256||null,
   replayedWorldHeadSha256:replayReceipt?.replayedHeadSha256||null
  },
  stages:[
   stage('DEVICE_AVAILABILITY',closure?.hybridProofAtClose?.currentHeartbeatProved===true?'PROVED_AT_RETURN':'NOT_PROVED_AT_RETURN',deviceId),
   stage('INVOCATION',['COMPLETE','FAILED'].includes(text(job?.status,32))?'INVOKED':'UNPROVED',jobId),
   stage('RETURN',job?.returnPacket||job?.completedAt?'RETURNED':'UNPROVED',jobId),
   stage('EXACT_RETURN_PROOF',verified?'VERIFIED_SUCCESS_RETURN':failedVerified?'VERIFIED_FAILED_RETURN':'HELD',closure?.fingerprint?.supplied||null),
   stage('EXECUTION_OUTCOME',verified?'SUCCESS':failedVerified?'FAILED_WITH_VERIFIED_RETURN':text(job?.status,32)||'UNPROVED',jobId),
   stage('R134_SCAR',closure?.finalHeadSha256?'BOUND':'UNBOUND',closure?.finalHeadSha256||null),
   stage('R136_WORLD_FRAME',closure?.livingWorldFrame?.revision==='R136'?'BOUND':'UNBOUND',closure?.livingWorldFrame?.head?.headSha256||closure?.finalHeadSha256||null),
   stage('DETERMINISTIC_REPLAY',replayOk?'VERIFIED':'HELD',replayReceipt?.replayedHeadSha256||null),
   stage('R125_ADMISSION_CANDIDATE',candidateState,closure?.finalHeadSha256||null)
  ],
  admissionCandidate:{
   schema:R159_ADMISSION_SCHEMA,
   revision:R159_REVISION,
   state:candidateState,
   sourceJobId:jobId,
   sourceDeviceId:deviceId,
   evidenceRefs:[closure?.fingerprint?.supplied,closure?.finalHeadSha256,replayReceipt?.replayedHeadSha256].filter(Boolean),
   invariants:{exactR141PayloadVerified:payloadVerified,exactR141ReturnVerified:verified,executionSucceeded:verified,verifiedFailedReturn:failedVerified,deterministicReplayVerified:replayOk,r134ScarBound:Boolean(closure?.finalHeadSha256),r136WorldFrameBound:closure?.livingWorldFrame?.revision==='R136'},
   requestedAuthority:'R125',
   canonicalMutation:false,
   autonomousAdmission:false
  },
  executionTruth:{
   pcOnlineAtReturn:closure?.hybridProofAtClose?.currentHeartbeatProved===true,
   jobReturned:Boolean(job?.returnPacket||job?.completedAt),
   r141PayloadVerified:payloadVerified,
   r141Verified:verified,
   r141FailedReturnVerified:failedVerified,
   executionSucceeded:verified,
   replayVerified:replayOk,
   canonStateChanged:false
  },
  canonicalMutation:false,
  canonicalAdmissionAuthority:'R125',
  truthBoundary:'R159 converges authenticated host availability, job invocation/return, R141 exact-payload proof, execution outcome, R134 scar continuity, R136 living-world evidence, deterministic replay and an R125 admission candidate into one durable evidence object. A failed job may have a cryptographically verified return and replay without becoming a successful execution or an R125-ready candidate. CanonState is never mutated automatically.'
 };
 const convergenceSha256=await sha256R134(core),row={...core,convergenceSha256};
 await runtime.put('r159Convergence:'+jobId,row);
 const index=await runtime.get('r159ConvergenceIndex',[]);await runtime.put('r159ConvergenceIndex',[...index.filter(x=>x!==jobId),jobId].slice(-240));
 await runtime.event(candidateState==='READY_FOR_R125_PROOF_GATE'?'R159_ADMISSION_CANDIDATE_READY':'R159_CONVERGENCE_HELD',`Sovereign execution convergence ${jobId} ${candidateState}.`,{jobId,deviceId,convergenceSha256,candidateState,canonicalMutation:false});
 return row;
}

export async function readSovereignExecutionConvergenceR159(runtime,jobId){return runtime.get('r159Convergence:'+safeId(jobId),null)}
export function manifestR159(){return{ok:true,schema:R159_SCHEMA,revision:R159_REVISION,laws:R159_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R159 is a durable convergence/admission-candidate layer over existing proven authorities. It distinguishes verified failed execution returns from unverified returns, preserves failure as evidence, and does not replace R127, R132, R140, R141, R142, R143, R146, R147, R134, R136 or R125.'}}
