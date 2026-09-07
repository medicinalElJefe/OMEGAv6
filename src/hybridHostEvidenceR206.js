export const R206_REVISION='R206';
export const R206_SCHEMA='OMEGA_DURABLE_HOST_EVIDENCE_PROJECTION_R206';
export const R206_LAWS=Object.freeze([
 'R141_EXACT_RETURN_VERIFICATION_REQUIRED_BEFORE_HOST_EVIDENCE_PASS',
 'R141_DURABLE_CLOSURE_IS_THE_HOST_EVIDENCE_STORE_NO_DUPLICATE_LEDGER',
 'HISTORICAL_VERIFIED_HOST_EVIDENCE_IS_NOT_CURRENT_PC_ONLINE',
 'CURRENT_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_NON_REVOKED_HEARTBEAT',
 'AT09_HEALTH_PASS_REQUIRES_R205_SCHEMA_PASS_AND_SHA256',
 'AT10_FORENSIC_PASS_REQUIRES_COMPLETE_R205_LEDGER_AND_SHA256_CHAIN',
 'R134_R136_SCAR_CONTINUITY_REMAINS_THE_DURABLE_WORLD_PROOF_CHAIN',
 'R146_R147_EXECUTION_HISTORY_AND_EXECUTOR_AUTHORITY_REMAIN_SEPARATE',
 'R204_REMAINS_A_READ_ONLY_MISSION_CONTINUITY_PROJECTION',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);
const hex64=v=>/^[0-9a-f]{64}$/i.test(String(v||''));
const stepResult=(closure,op)=>closure?.input?.core?.stepProofs?.find(x=>x?.op===op&&x?.ok===true)?.result||null;
const currentDevices=hybrid=>(Array.isArray(hybrid?.devices)?hybrid.devices:[]).filter(d=>d?.online&&!d?.revoked);
function at09Projection(closure,verified){
 const r=stepResult(closure,'DESKTOP_HEALTH'),pass=Boolean(verified&&r?.schema==='OMEGA_DESKTOP_HEALTH_R205'&&r?.state==='PASS'&&hex64(r?.healthSha256));
 return{state:pass?'PASS':r?verified?String(r.state||'HOLD'):'R141_VERIFICATION_REQUIRED':'HOST_RETURN_REQUIRED',pass,healthSha256:pass?r.healthSha256:null,smokeSha256:pass&&hex64(r?.smokeSha256)?r.smokeSha256:null,checkedAt:Number.isFinite(Number(r?.checkedAt))?Number(r.checkedAt):null,checks:pass?{windowsHost:r?.checks?.windowsHost===true,approvedRootExists:r?.checks?.approvedRootExists===true,approvedRootDirectory:r?.checks?.approvedRootDirectory===true,approvedRootReadable:r?.checks?.approvedRootReadable===true,approvedRootWriteSmoke:r?.checks?.approvedRootWriteSmoke===true,nonSystemRoot:r?.checks?.nonSystemRoot===true,canonicalHealthReachable:r?.checks?.canonicalHealthReachable===true,agentProcessAlive:r?.checks?.agentProcessAlive===true}:null};
}
function at10Projection(closure,verified){
 const r=stepResult(closure,'FORENSIC_HASH_LEDGER'),pass=Boolean(verified&&r?.schema==='OMEGA_FORENSIC_HASH_LEDGER_RECEIPT_R205'&&r?.state==='PASS'&&r?.complete===true&&hex64(r?.ledgerSha256)&&hex64(r?.treeSha256)&&String(r?.ledgerPath||'').startsWith('.omega_hybrid/forensics/'));
 return{state:pass?'PASS':r?verified?String(r.state||'HOLD'):'R141_VERIFICATION_REQUIRED':'HOST_RETURN_REQUIRED',pass,complete:pass,ledgerSha256:pass?r.ledgerSha256:null,treeSha256:pass?r.treeSha256:null,ledgerPath:pass?String(r.ledgerPath):null,files:pass&&Number.isFinite(Number(r?.files))?Number(r.files):null,totalBytes:pass&&Number.isFinite(Number(r?.totalBytes))?Number(r.totalBytes):null,scopePolicy:pass?String(r?.scopePolicy||''):null};
}
export function projectHostEvidenceR206({jobId=null,missionId=null,closure=null,hybrid=null}={}){
 const verified=Boolean(closure?.schema==='OMEGA_HYBRID_PROOF_SCAR_REPLAY_R141'&&closure?.revision==='R141'&&closure?.fingerprint?.verified===true&&hex64(closure?.fingerprint?.supplied)&&hex64(closure?.finalHeadSha256));
 const devices=currentDevices(hybrid),currentPcOnline=Boolean(hybrid?.state==='VERIFIED_DEVICE_ONLINE'&&hybrid?.nativeExecutionClaimed===true&&devices.length>0);
 const at09=at09Projection(closure,verified),at10=at10Projection(closure,verified),complete=verified&&at09.pass&&at10.pass;
 const state=!verified?'R141_VERIFICATION_REQUIRED':complete?'VERIFIED_COMPLETE':at09.pass||at10.pass?'VERIFIED_PARTIAL':'VERIFIED_RETURN_HELD';
 return{
  ok:true,schema:R206_SCHEMA,revision:R206_REVISION,state,jobId:jobId||closure?.jobId||null,missionId:missionId||null,
  durableSource:{schema:closure?.schema||null,revision:closure?.revision||null,durability:closure?.durability||null,r141State:closure?.state||null,r141Fingerprint:verified?closure.fingerprint.supplied:null,r141ExpectedFingerprint:verified&&hex64(closure?.fingerprint?.expected)?closure.fingerprint.expected:null,finalHeadSha256:verified?closure.finalHeadSha256:null,continuity:verified?closure?.continuity||null:null,deterministicReplayVerified:verified&&closure?.lastReplayReceipt?.ok===true,sovereignConvergenceSha256:verified&&hex64(closure?.sovereignConvergence?.convergenceSha256)?closure.sovereignConvergence.convergenceSha256:null,admissionCandidateState:verified?closure?.sovereignConvergence?.admissionCandidate?.state||null:null},
  historicalHostEvidence:{state:verified?'R141_VERIFIED_DURABLE_HISTORY':'UNVERIFIED_RETURN_NOT_PROMOTED',verifiedAtClose:verified,currentPcOnlineClaim:false},
  currentPc:{state:currentPcOnline?'VERIFIED_DEVICE_ONLINE':'DEVICE_PROOF_REQUIRED',currentHeartbeatProved:currentPcOnline,currentDeviceCount:currentPcOnline?devices.length:0},
  at09,at10,
  authorityChain:['R205_HOST_OPERATIONS','R141_EXACT_RETURN_FINGERPRINT','R134_R136_SCAR_CONTINUITY','R146_DURABLE_EXECUTION_HISTORY','R147_EXECUTOR_AUTHORITY','R204_READ_ONLY_MISSION_CARRY','R125_SEPARATE_CANON_ADMISSION'],
  laws:R206_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R206 is a compact read-only projection over the already-durable R141 closure. A verified historical AT09/AT10 receipt may remain available after the PC goes offline, but only a current authenticated non-revoked heartbeat may establish PC ONLINE now. R206 creates no execution, heartbeat, solver-validity, federation-closure, deployment, scientific-truth, CanonState, or new persistence authority.'
 };
}
export function manifestR206(){return{ok:true,schema:R206_SCHEMA,revision:R206_REVISION,laws:R206_LAWS,durableAuthority:'R141/R134/R136 existing OMEGA_RUNTIME evidence store',readOnly:true,newDurableObject:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};}
