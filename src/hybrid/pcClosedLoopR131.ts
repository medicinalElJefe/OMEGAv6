export const PC_CLOSED_LOOP_SCHEMA_R131='OMEGA_PC_CLOSED_LOOP_PROOF_JOB_R131';
export const PC_CLOSED_LOOP_RECEIPT_R131='OMEGA_PC_CLOSED_LOOP_RECEIPT_R131';
export const PC_CLOSED_LOOP_AUTHORITY_R131='RETURNED_HOST_EVIDENCE_NOT_CANON';
export const PC_CLOSED_LOOP_ADMISSION_R131='R125_ACCURACY_FIRST';

export function buildPcClosedLoopJobR131(targetDeviceId:string){
  return {
    schema:PC_CLOSED_LOOP_SCHEMA_R131,
    action:'PROOF_ONLY',
    profile:'AUTO_BUILD',
    projectPath:'.',
    instructions:'R131 read-only closed-loop host proof. Execute one bounded WAIT step. Do not read, write, patch, build, browse, click, type, or mutate files or CanonState.',
    allowedDomains:[],
    confirmed:true,
    targetDeviceId,
    steps:[{
      id:'R131-P01',
      op:'WAIT',
      label:'Execute a bounded no-mutation host round trip',
      path:'.',
      milliseconds:250
    }]
  } as const;
}

export function compilePcClosedLoopReceiptR131(job:any){
  const packet=job?.returnPacket||null;
  if(!job?.id||!packet?.resultFingerprint)return null;
  const proofs=Array.isArray(packet.stepProofs)?packet.stepProofs:[];
  return {
    schema:PC_CLOSED_LOOP_RECEIPT_R131,
    jobId:String(job.id),
    deviceId:String(job.targetDeviceId||packet.deviceId||''),
    status:String(job.status||'UNKNOWN'),
    queuedAt:Number(job.queuedAt||0)||null,
    startedAt:Number(job.startedAt||0)||null,
    completedAt:Number(job.completedAt||0)||null,
    inputFingerprint:String(job.inputFingerprint||''),
    resultFingerprint:String(packet.resultFingerprint||''),
    proofCount:proofs.length,
    authority:PC_CLOSED_LOOP_AUTHORITY_R131,
    canonicalMutation:false,
    admissionAuthority:PC_CLOSED_LOOP_ADMISSION_R131,
    interpretation:'Authenticated host execution returned a durable result fingerprint. This proves a bounded PC round trip only; it does not by itself validate scientific claims or mutate canonical state.'
  } as const;
}

export function pcClosedLoopStageR131(job:any){
  const status=String(job?.status||'').toUpperCase();
  if(status==='COMPLETE')return 'RETURNED';
  if(status==='FAILED')return 'RETURNED_FAILED';
  if(status==='RUNNING')return 'CLAIMED';
  if(status==='QUEUED')return 'QUEUED';
  return 'IDLE';
}
