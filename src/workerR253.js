import r116,{OmegaRuntime as OmegaRuntimeR116,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator} from './workerR116.js';

export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator};

const REVISION='R253';
const SCHEMA='OMEGA_HYBRID_EXPERIENCE_LEDGER_R253';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION,'x-omega-hybrid-experience-ledger':REVISION};
const TERMINAL=new Set(['COMPLETE','COMPLETED','SUCCESS','SUCCEEDED','FAILED','ERROR','REJECTED','TIMEOUT','CANCELLED','CANCELED']);
const MUTATION_OPS=new Set(['APPLY_PATCH','WRITE_TEXT']);
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=v=>String(v??'').trim();
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const status=v=>text(v).toUpperCase()||'UNKNOWN';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const safeLimit=v=>Math.floor(clamp(v||120,1,500));
const quantile=(values,q)=>{const xs=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!xs.length)return null;const i=(xs.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?xs[lo]:Math.round(xs[lo]*(hi-i)+xs[hi]*(i-lo))};
async function sha256(value){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value??'')));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function pseudonym(value,prefix='node'){const s=text(value);return s?`${prefix}_${(await sha256(s)).slice(0,16)}`:null}
function forwarded(request,path){const u=new URL(path,request.url);return new Request(u,{method:'GET',headers:request.headers})}
async function readJson(response){return response.clone().json().catch(()=>null)}
function releaseSha(evidence){for(const v of [evidence?.canonicalMainSha,evidence?.production?.headSha,evidence?.production?.sha,evidence?.source?.sha,evidence?.git?.commitSha,evidence?.git?.sha,evidence?.commitSha,evidence?.sha]){const s=text(v);if(/^[0-9a-f]{40}$/i.test(s))return s}return null}
function duration(start,end){const a=num(start),b=num(end);return a!==null&&b!==null&&b>=a?Math.round(b-a):null}
function safeStepResult(step){const result=step?.result&&typeof step.result==='object'?step.result:{};
 const profile=result?.hostProfileR238&&typeof result.hostProfileR238==='object'?result.hostProfileR238:null;
 const memory=profile?.memory||{},storage=profile?.approvedRootStorage||profile?.storage||{},cpu=profile?.cpu||{},gpu=profile?.gpu||{},python=profile?.python||{};
 const resource=profile?{
  profileSha256:text(profile.profileSha256)||null,
  observedAt:num(profile.observedAt),
  cpu:{logicalProcessors:num(cpu.logicalProcessors),physicalCores:num(cpu.physicalCores)},
  memory:{totalBytes:num(memory.totalBytes),availableBytes:num(memory.availableBytes),loadPercent:num(memory.loadPercent)},
  storage:{freeBytes:num(storage.freeBytes),totalBytes:num(storage.totalBytes)},
  gpu:{count:Array.isArray(gpu)?gpu.length:num(gpu.count)},
  python:{version:text(python.version)||null,available:python.available===true||Boolean(text(python.version))}
 }:null;
 return{
  resource,
  changed:Boolean(result.changed||result.applied||result.written||result.mutated),
  matchCount:num(result.matchCount??result.matches?.length),
  fileCount:num(result.fileCount??result.files?.length),
  packageCount:num(result.packageCount),
  supportBundle:Boolean(result.supportBundle||result.bundleSha256),
  sha256:text(result.sha256||result.treeSha256||result.outputSha256)||null
 };
}
async function sanitizeStep(step,index){const op=status(step?.op),ok=step?.ok===true,statusValue=ok?'SUCCESS':step?.ok===false?'FAILED':status(step?.status);
 const failureRaw=!ok?text(step?.error||step?.code||step?.message||step?.result?.error||step?.result?.code):'';
 return{
  index,
  id:text(step?.id)||null,
  op,
  status:statusValue,
  ok:step?.ok===true,
  startedAt:num(step?.startedAt),
  completedAt:num(step?.completedAt),
  durationMs:num(step?.durationMs)??duration(step?.startedAt,step?.completedAt),
  mutation:MUTATION_OPS.has(op),
  evidence:safeStepResult(step),
  failureSignature:failureRaw?`fail_${(await sha256(`${op}|${failureRaw}`)).slice(0,20)}`:null
 };
}
async function sanitizeJob(job,missionByJob){const packet=job?.returnPacket||{},stepsRaw=Array.isArray(packet?.stepProofs)?packet.stepProofs:Array.isArray(job?.steps)?job.steps:[],steps=[];for(let i=0;i<stepsRaw.length;i++)steps.push(await sanitizeStep(stepsRaw[i],i));
 const targetDeviceId=text(job?.targetDeviceId),startedAt=num(job?.startedAt),completedAt=num(job?.completedAt??packet?.receivedAt),queuedAt=num(job?.queuedAt),jobStatus=status(job?.status),failureRaw=!TERMINAL.has(jobStatus)||['FAILED','ERROR','REJECTED','TIMEOUT'].includes(jobStatus)?text(job?.stallReason||packet?.reason||packet?.code||job?.error):'';
 const mission=missionByJob.get(text(job?.id))||null;
 return{
  jobId:text(job?.id)||null,
  missionId:text(mission?.id||job?.missionId)||null,
  deviceKey:await pseudonym(targetDeviceId,'device'),
  action:text(job?.action)||null,
  profile:text(job?.profile)||null,
  stage:text(mission?.stage||job?.stage)||null,
  status:jobStatus,
  queuedAt,
  startedAt,
  completedAt,
  queueLatencyMs:duration(queuedAt,startedAt),
  executionDurationMs:duration(startedAt,completedAt),
  totalDurationMs:duration(queuedAt,completedAt),
  lease:{lastProgressAt:num(job?.lastProgressAt),leaseUntil:num(job?.leaseUntil),recoveryOf:text(job?.recoveryOf)||null,recoveryRevision:text(job?.recoveryRevision)||null},
  progress:job?.progress&&typeof job.progress==='object'?{state:status(job.progress.state),stepOp:status(job.progress.stepOp),stepIndex:num(job.progress.stepIndex),totalSteps:num(job.progress.totalSteps),completedSteps:num(job.progress.completedSteps),elapsedMs:num(job.progress.elapsedMs),seq:num(job.progress.seq)}:null,
  proof:{resultFingerprint:text(packet?.resultFingerprint)||null,receivedAt:num(packet?.receivedAt),proofExtensions:Array.isArray(packet?.proofExtensions)?packet.proofExtensions.map(text).filter(Boolean):[],stepProofCount:steps.length,outputPathCount:Array.isArray(packet?.outputPaths)?packet.outputPaths.length:Array.isArray(job?.outputPaths)?job.outputPaths.length:0},
  mutationAttempted:steps.some(s=>s.mutation),
  mutationReturned:steps.some(s=>s.mutation&&s.ok&&s.evidence.changed),
  buildReturned:steps.some(s=>s.op==='BUILD'&&s.ok),
  testReturned:steps.some(s=>s.op==='TEST'&&s.ok),
  packageReturned:steps.some(s=>s.op==='PACKAGE'&&s.ok),
  steps,
  failureSignature:failureRaw?`jobfail_${(await sha256(`${jobStatus}|${failureRaw}`)).slice(0,20)}`:null
 };
}
function aggregate(rows){const byOp=new Map(),failures=new Map();for(const row of rows){if(row.failureSignature)failures.set(row.failureSignature,(failures.get(row.failureSignature)||0)+1);for(const step of row.steps||[]){const k=step.op,rowOp=byOp.get(k)||{op:k,count:0,success:0,failed:0,durations:[],mutations:0,changed:0};rowOp.count++;if(step.ok)rowOp.success++;else if(step.status==='FAILED')rowOp.failed++;if(Number.isFinite(step.durationMs))rowOp.durations.push(step.durationMs);if(step.mutation)rowOp.mutations++;if(step.evidence?.changed)rowOp.changed++;byOp.set(k,rowOp);if(step.failureSignature)failures.set(step.failureSignature,(failures.get(step.failureSignature)||0)+1)}}
 const operations=[...byOp.values()].map(x=>({op:x.op,count:x.count,success:x.success,failed:x.failed,successRate:x.count?Number((x.success/x.count).toFixed(4)):0,p50DurationMs:quantile(x.durations,.5),p95DurationMs:quantile(x.durations,.95),mutationAttempts:x.mutations,mutationReturns:x.changed})).sort((a,b)=>b.count-a.count||a.op.localeCompare(b.op));
 return{
  jobs:rows.length,
  terminalJobs:rows.filter(r=>TERMINAL.has(r.status)).length,
  successfulJobs:rows.filter(r=>['COMPLETE','COMPLETED','SUCCESS','SUCCEEDED'].includes(r.status)).length,
  failedJobs:rows.filter(r=>['FAILED','ERROR','REJECTED','TIMEOUT'].includes(r.status)).length,
  mutationJobs:rows.filter(r=>r.mutationAttempted).length,
  mutationReturnedJobs:rows.filter(r=>r.mutationReturned).length,
  operations,
  repeatedFailureSignatures:[...failures.entries()].filter(([,count])=>count>1).map(([signature,count])=>({signature,count})).sort((a,b)=>b.count-a.count)
 };
}
async function experienceLedgerR253(request,env){
 const bridge=text(request.headers.get('x-omega-bridge-id')),secret=text(request.headers.get('x-omega-bridge-secret'));
 if(!bridge||!secret)return json({ok:false,code:'R253_AUTHENTICATED_BRIDGE_REQUIRED',reply:'Hybrid experience-ledger export requires the current browser bridge credential. No execution authority is granted.'},401);
 const [statusResponse,missionsResponse,releaseResponse]=await Promise.all([
  r116.fetch(forwarded(request,'/api/hybrid/status'),env),
  r116.fetch(forwarded(request,'/api/missions'),env),
  r116.fetch(forwarded(request,'/api/release-evidence'),env)
 ]);
 if(!statusResponse.ok)return new Response(statusResponse.body,{status:statusResponse.status,statusText:statusResponse.statusText,headers:{...Object.fromEntries(statusResponse.headers),...JSON_HEADERS}});
 if(!missionsResponse.ok)return new Response(missionsResponse.body,{status:missionsResponse.status,statusText:missionsResponse.statusText,headers:{...Object.fromEntries(missionsResponse.headers),...JSON_HEADERS}});
 const hybrid=await readJson(statusResponse)||{},missionPayload=await readJson(missionsResponse)||{},release=releaseResponse.ok?await readJson(releaseResponse):null;
 const jobs=Array.isArray(hybrid.jobs)?hybrid.jobs:[],missions=Array.isArray(missionPayload.missions)?missionPayload.missions:[],missionByJob=new Map();for(const mission of missions){for(const id of [mission?.currentJobId,mission?.currentJob?.id])if(text(id))missionByJob.set(text(id),mission)}
 const url=new URL(request.url),limit=safeLimit(url.searchParams.get('limit')),selectedRaw=text(url.searchParams.get('device'));
 let selectedDeviceId=selectedRaw;if(selectedRaw.startsWith('device_'))selectedDeviceId='';
 let source=selectedDeviceId?jobs.filter(j=>text(j?.targetDeviceId)===selectedDeviceId):jobs;
 source=[...source].sort((a,b)=>Number(b?.completedAt||b?.returnPacket?.receivedAt||b?.startedAt||b?.queuedAt||0)-Number(a?.completedAt||a?.returnPacket?.receivedAt||a?.startedAt||a?.queuedAt||0)).slice(0,limit);
 const rows=[];for(const job of source)rows.push(await sanitizeJob(job,missionByJob));
 const devices=[];for(const device of Array.isArray(hybrid.devices)?hybrid.devices:[]){devices.push({deviceKey:await pseudonym(device?.id,'device'),online:device?.online===true&&!device?.revoked,lastSeen:num(device?.lastSeen),platform:text(device?.platform)||null,capabilityCount:Array.isArray(device?.capabilities)?device.capabilities.length:0})}
 return json({
  ok:true,schema:SCHEMA,revision:REVISION,generatedAt:Date.now(),cloudHeadSha:releaseSha(release),runtimeVersion:env?.CF_VERSION_METADATA?{id:text(env.CF_VERSION_METADATA.id)||null,tag:text(env.CF_VERSION_METADATA.tag)||null,timestamp:text(env.CF_VERSION_METADATA.timestamp)||null}:null,
  bridgeKey:await pseudonym(bridge,'bridge'),
  currentAuthenticatedHeartbeat:hybrid?.nativeExecutionClaimed===true&&Array.isArray(hybrid?.devices)&&hybrid.devices.some(d=>d?.online&&!d?.revoked),
  devices,
  limits:{requested:limit,returned:rows.length,max:500},
  aggregate:aggregate(rows),
  runs:rows,
  sanitation:{bridgeSecret:false,rawBridgeId:false,rawDeviceId:false,hostName:false,projectPath:false,localPath:false,stdout:false,logs:false,rawFailureText:false,outputPaths:false},
  authority:{readOnly:true,dispatch:false,mutation:false,promotion:false,productionDeploy:false,canonAdmission:false,sourceHistory:'existing OMEGA_RUNTIME job/mission state'},
  truthBoundary:'R253 is a sanitized longitudinal observation/export over already-returned Hybrid job and mission state. It cannot create, claim, replay, mutate, dispatch, merge, deploy, or admit CanonState. currentAuthenticatedHeartbeat is true only when inherited Hybrid status contains a current authenticated online non-revoked device.'
 });
}

async function fetchR253(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/api/hybrid/experience-ledger'&&request.method==='GET')return experienceLedgerR253(request,env);
 const response=await r116.fetch(request,env),headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export class OmegaRuntime extends OmegaRuntimeR116 {}
export default{fetch:fetchR253};
