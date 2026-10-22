import {normalizeCapabilityExecutionReceiptR142,type CapabilityExecutionReceiptR142} from './capabilityExecutionReceiptsR142';

export const R158_LIVE_HYBRID_SCHEMA='OMEGA_LIVE_HYBRID_EXECUTION_TRUTH_R158' as const;
export const R158_LIVE_HYBRID_LAWS=Object.freeze([
 'QUEUED_IS_NOT_INVOKED',
 'RUNNING_IS_INVOKED_NOT_RETURNED',
 'RETURNED_IS_NOT_VERIFIED',
 'VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_CLOSURE',
 'CURRENT_HEARTBEAT_PROVES_DEVICE_AVAILABILITY_NOT_JOB_SUCCESS',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

const text=(x:any)=>typeof x==='string'?x.trim():'';
const isoFromMs=(x:any)=>Number.isFinite(Number(x))&&Number(x)>0?new Date(Number(x)).toISOString():null;

export function hybridLiveJobReceiptR158(job:any):CapabilityExecutionReceiptR142{
 const status=text(job?.status).toUpperCase();
 const queued=status==='QUEUED';
 const running=status==='RUNNING';
 const complete=status==='COMPLETE';
 const failed=status==='FAILED';
 const returned=complete&&Boolean(job?.returnPacket?.resultFingerprint||job?.returnPacket?.receivedAt);
 const closure=job?.proofClosure;
 const verified=Boolean(
  complete&&
  closure?.state==='VERIFIED_EXECUTION_RETURN'&&
  closure?.fingerprintVerified===true
 );
 return normalizeCapabilityExecutionReceiptR142({
  receiptId:job?.id?`hybrid-live:${job.id}`:'hybrid-live:unbound',
  capabilityId:'hybrid-host-execution',domain:'HYBRID',route:'Hybrid Link',
  authorized:Boolean(job?.id),
  available:Boolean(job?.id),
  invoked:running||complete||failed,
  returned,
  verified,
  startedAt:isoFromMs(job?.startedAt||job?.claimedAt||job?.queuedAt),
  finishedAt:isoFromMs(job?.completedAt||job?.returnPacket?.receivedAt),
  requestHash:text(job?.requestFingerprint)||text(job?.planFingerprint)||null,
  responseHash:text(job?.returnPacket?.resultFingerprint)||null,
  proofRef:text(closure?.finalHeadSha256)||null,
  source:verified?'R141_EXACT_PAYLOAD_PROOF_CLOSURE':'R32_HYBRID_LIVE_JOB_STATUS',
  failureReason:failed?text(job?.error||job?.failureReason)||'HYBRID_JOB_FAILED':null,
  lineage:['R32_HYBRID_EXECUTION_STATUS','R132_HYBRID_EXECUTION_PLANE','R141_EXACT_PAYLOAD_CLOSURE','R142_EXECUTION_RECEIPT','R158_LIVE_EXECUTION_VIEW']
 });
}

export function summarizeLiveHybridExecutionR158(status:any){
 const jobs=Array.isArray(status?.jobs)?status.jobs:[];
 const rows=jobs.map((job:any)=>({job,receipt:hybridLiveJobReceiptR158(job)}));
 const active=rows.filter((x:any)=>['QUEUED','RUNNING'].includes(text(x.job?.status).toUpperCase()));
 return{
  schema:R158_LIVE_HYBRID_SCHEMA,laws:R158_LIVE_HYBRID_LAWS,
  active,total:rows.length,
  currentHeartbeatProved:Boolean(status?.nativeExecutionClaimed===true&&Array.isArray(status?.devices)&&status.devices.some((d:any)=>d?.online===true&&d?.revoked!==true)),
  canonicalMutation:false,admissionAuthority:'R125' as const,
  truthBoundary:'A current authenticated heartbeat proves device availability only. QUEUED is not invoked, RUNNING is invoked but not returned, RETURNED is not VERIFIED, and VERIFIED still requires the exact R141 payload closure.'
 };
}
