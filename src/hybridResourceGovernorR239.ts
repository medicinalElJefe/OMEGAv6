export type R239Tier='UNPROVED'|'HOLD'|'CONSTRAINED'|'READY'|'HIGH_CAPACITY';
export type R239Preset='PROVE_HOST'|'VERIFY_PROJECT'|'PACKAGE_VERIFIED'|'TRAIN_LOCAL_INDEX';

export type HostProofR239={
 job:any;
 step:any;
 profile:any;
 macros:any;
 returnedAt:number;
};

export type ResourceEnvelopeR239={
 schema:'OMEGA_HYBRID_RESOURCE_ENVELOPE_R239';
 revision:'R239';
 tier:R239Tier;
 profileProved:boolean;
 profileFresh:boolean;
 profileObservedAt:number|null;
 profileAgeMs:number|null;
 maxProfileAgeMs:number;
 snapshotCurrent:boolean;
 activeNativeWork:boolean;
 memoryLoadPercent:number|null;
 availableMemoryBytes:number|null;
 freeStorageBytes:number|null;
 recommendedCpuWorkers:number;
 effectiveCpuWorkers:number;
 hashMaxResults:number;
 trainMaxResults:number;
 admission:Record<R239Preset,boolean>;
 reasons:string[];
 truthBoundary:string;
};

const GiB=1024**3;
export const R239_MAX_PROFILE_AGE_MS=5*60_000;
export const R239_MAX_PROFILE_CLOCK_LEAD_MS=2*60_000;
const n=(v:any):number|null=>{const x=Number(v);return Number.isFinite(x)?x:null};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

export function latestReturnedHostProofR239(jobs:any[],deviceId:string):HostProofR239|null{
 if(!deviceId)return null;
 const rows=[...(Array.isArray(jobs)?jobs:[])].filter((j:any)=>j?.targetDeviceId===deviceId&&j?.returnPacket).sort((a:any,b:any)=>Number(b?.completedAt||b?.returnPacket?.receivedAt||0)-Number(a?.completedAt||a?.returnPacket?.receivedAt||0));
 for(const job of rows){
  const steps=Array.isArray(job?.returnPacket?.stepProofs)?job.returnPacket.stepProofs:[];
  const step=steps.find((s:any)=>String(s?.op||'').toUpperCase()==='DESKTOP_HEALTH'&&s?.ok===true&&s?.result?.hostProfileR238);
  if(step)return{job,step,profile:step.result.hostProfileR238,macros:step.result.macroInventoryR238||null,returnedAt:Number(job?.completedAt||job?.returnPacket?.receivedAt||step?.result?.hostProfileR238?.observedAt||0)};
 }
 return null;
}

export function resourceEnvelopeR239(input:{profile:any; snapshotCurrent:boolean; activeNativeWork:boolean; nowMs?:number}):ResourceEnvelopeR239{
 const profile=input.profile||null;
 const profileProved=Boolean(profile?.schema==='OMEGA_HYBRID_HOST_PROFILE_R238'&&profile?.profileSha256);
 const now=Number.isFinite(Number(input.nowMs))?Number(input.nowMs):Date.now();
 const profileObservedAt=n(profile?.observedAt);
 const profileAgeMs=profileObservedAt===null?null:now-profileObservedAt;
 const profileFresh=Boolean(profileProved&&profileObservedAt!==null&&profileAgeMs!==null&&profileAgeMs>=-R239_MAX_PROFILE_CLOCK_LEAD_MS&&profileAgeMs<=R239_MAX_PROFILE_AGE_MS);
 const load=n(profile?.memory?.loadPercent);
 const available=n(profile?.memory?.availableBytes);
 const free=n(profile?.storage?.freeBytes);
 const advisory=Math.max(1,Math.floor(n(profile?.schedulerAdvisory?.recommendedCpuWorkers)||1));
 const reasons:string[]=[];
 let tier:R239Tier='UNPROVED';
 let effective=1;
 if(!input.snapshotCurrent){tier='HOLD';reasons.push('SHARED_SNAPSHOT_STALE_OR_UNPROVED')}
 else if(!profileProved){tier='UNPROVED';reasons.push('RETURNED_DESKTOP_HEALTH_PROFILE_REQUIRED')}
 else if(!profileFresh){tier='HOLD';reasons.push('RETURNED_RESOURCE_PROFILE_STALE_OR_CLOCK_INVALID')}
 else if(input.activeNativeWork){tier='HOLD';reasons.push('ONE_ACTIVE_NATIVE_JOB_PER_DEVICE')}
 else {
  const memLoad=load??100;
  const avail=available??0;
  const disk=free??0;
  if(memLoad>=92||avail<1*GiB||disk<2*GiB){tier='HOLD';reasons.push('RESOURCE_PRESSURE_CRITICAL')}
  else if(memLoad>=82||avail<2*GiB||disk<5*GiB){tier='CONSTRAINED';reasons.push('RESOURCE_PRESSURE_ELEVATED')}
  else if(memLoad<=60&&avail>=8*GiB&&disk>=20*GiB&&advisory>=6){tier='HIGH_CAPACITY';reasons.push('RESOURCE_HEADROOM_HIGH')}
  else {tier='READY';reasons.push('RESOURCE_HEADROOM_ACCEPTABLE')}
 }
 if(profileProved&&profileFresh){
  const pressureFactor=load===null?0.5:load>=90?0.15:load>=80?0.35:load>=70?0.55:load>=60?0.75:1;
  effective=clamp(Math.floor(advisory*pressureFactor),1,12);
 }
 const proveHost=input.snapshotCurrent&&!input.activeNativeWork;
 const verify=profileProved&&profileFresh&&input.snapshotCurrent&&!input.activeNativeWork&&tier!=='HOLD';
 const pkg=verify&&(free??0)>=5*GiB&&(load??100)<88;
 const train=verify&&(available??0)>=4*GiB&&(free??0)>=10*GiB&&(load??100)<78;
 const hashMaxResults=tier==='HIGH_CAPACITY'?5000:tier==='READY'?3500:tier==='CONSTRAINED'?1500:750;
 const trainMaxResults=tier==='HIGH_CAPACITY'?25000:tier==='READY'?16000:tier==='CONSTRAINED'?6000:2500;
 return{
  schema:'OMEGA_HYBRID_RESOURCE_ENVELOPE_R239',revision:'R239',tier,profileProved,profileFresh,profileObservedAt,profileAgeMs,maxProfileAgeMs:R239_MAX_PROFILE_AGE_MS,snapshotCurrent:input.snapshotCurrent,activeNativeWork:input.activeNativeWork,
  memoryLoadPercent:load,availableMemoryBytes:available,freeStorageBytes:free,recommendedCpuWorkers:advisory,effectiveCpuWorkers:effective,hashMaxResults,trainMaxResults,
  admission:{PROVE_HOST:proveHost,VERIFY_PROJECT:verify,PACKAGE_VERIFIED:pkg,TRAIN_LOCAL_INDEX:train},reasons,
  truthBoundary:'R239 is a deterministic admission/sizing envelope over a fresh returned R238 selected-host sample and the shared snapshot. A current snapshot does not refresh old resource evidence: stale or clock-invalid host samples fail closed while PROVE_HOST remains available. R239 does not infer CUDA/RCWA validity, install dependencies, create a new executor, bypass R237 backpressure, mutate CanonState, or convert advisory resource evidence into scientific proof.'
 };
}

export function applyEnvelopeToPresetR239(presetId:R239Preset,steps:any[],envelope:ResourceEnvelopeR239){
 return steps.map((step:any)=>{
  const op=String(step?.op||'').toUpperCase();
  if(op==='HASH_TREE')return{...step,maxResults:Math.min(Number(step?.maxResults||envelope.hashMaxResults),envelope.hashMaxResults),resourceEnvelopeR239:{tier:envelope.tier,effectiveCpuWorkers:envelope.effectiveCpuWorkers}};
  if(op==='TRAIN_LOCAL')return{...step,maxResults:Math.min(Number(step?.maxResults||envelope.trainMaxResults),envelope.trainMaxResults),resourceEnvelopeR239:{tier:envelope.tier,effectiveCpuWorkers:envelope.effectiveCpuWorkers}};
  if(['BUILD','TEST','PACKAGE'].includes(op))return{...step,resourceEnvelopeR239:{tier:envelope.tier,effectiveCpuWorkers:envelope.effectiveCpuWorkers}};
  return step;
 });
}
