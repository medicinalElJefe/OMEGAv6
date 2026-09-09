import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,CheckCircle2,Cpu,Loader2,Play,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import {latestReturnedHostProofR239,resourceEnvelopeR239} from './hybridResourceGovernorR239';
import {defaultCommandPlan,validateCommandPlan} from './hybridCommandRuntime';
import {buildFullSystemMissionObjectiveR153,fullSystemStateContextR153} from './fullSystemCompletionR153.js';
import {compileOperationalCalculusR248,operationalMissionObjectiveR248} from './operationalCalculusR248';
import './hybridActionRuntimeR247.css';

const ACTIVE_JOB=new Set(['QUEUED','RUNNING']);
const ACTIVE_MISSION=new Set(['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']);
const R153_ALLOWED=['INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'];
const AUTO_RETRY_MS=45_000;
const safeRoot=(value:string)=>{const s=value.trim().replace(/\\/g,'/');return Boolean(s)&&(s==='.'||(!s.startsWith('/')&&!/^[A-Za-z]:/.test(s)&&!s.split('/').includes('..')&&!s.includes('\0')))};
const age=(n:any)=>{const t=Number(n)||0;if(!t)return'never';const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};

export default function HybridActionRuntimeR247(){
 const[root,setRoot]=useState(()=>{try{return window.localStorage.getItem('omega:hybrid:projectRoot')||'.'}catch{return'.'}});
 const[busy,setBusy]=useState('');
 const[message,setMessage]=useState('');
 const[error,setError]=useState('');
 const autoAttempt=useRef<Record<string,number>>({});
 const{hybrid,device,selectedDeviceJobs,currentMission,currentMissionJob,epoch,observedAt,stale,refresh,targetForMission}=useHybridRuntimeSnapshotR238();
 const activeJob=useMemo(()=>selectedDeviceJobs.find((job:any)=>ACTIVE_JOB.has(String(job?.status||'').toUpperCase()))||null,[selectedDeviceJobs]);
 const hostProof=useMemo(()=>latestReturnedHostProofR239(selectedDeviceJobs,String(device?.id||'')),[selectedDeviceJobs,device?.id]);
 const snapshotCurrent=epoch>0&&!stale;
 const nativeReady=Boolean(snapshotCurrent&&hybrid?.nativeExecutionClaimed===true&&device?.online&&!device?.revoked);
 const advertised=useMemo(()=>new Set(Array.isArray(device?.capabilities)?device.capabilities.map((x:any)=>String(x).toUpperCase()):[]),[device]);
 const rootValid=safeRoot(root);
 const missionTarget=currentMission?targetForMission(currentMission,currentMissionJob):'';
 const missionActive=Boolean(currentMission&&ACTIVE_MISSION.has(String(currentMission?.status||'').toUpperCase()));
 const selectedMissionActive=Boolean(missionActive&&device&&missionTarget===device.id);
 const foreignMissionActive=Boolean(missionActive&&device&&missionTarget&&missionTarget!==device.id);
 const envelope=useMemo(()=>resourceEnvelopeR239({profile:hostProof?.profile||null,snapshotCurrent,activeNativeWork:Boolean(activeJob)}),[hostProof?.profile,snapshotCurrent,activeJob]);
 const hostProofFresh=Boolean(hostProof&&envelope.profileFresh);
 const operational=useMemo(()=>compileOperationalCalculusR248({
  snapshotCurrent,
  nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true,
  deviceOnline:Boolean(device?.online),
  deviceRevoked:Boolean(device?.revoked),
  hostProofFresh,
  resourceTier:String(envelope.tier||'HOLD'),
  effectiveCpuWorkers:Number(envelope.effectiveCpuWorkers)||0,
  sourceProfileSha256:hostProof?.profile?.profileSha256||null,
  activeJob:Boolean(activeJob),
  missionActive,
  foreignMissionActive,
  jobs:selectedDeviceJobs
 }),[snapshotCurrent,hybrid?.nativeExecutionClaimed,device?.online,device?.revoked,hostProofFresh,envelope.tier,envelope.effectiveCpuWorkers,hostProof?.profile?.profileSha256,activeJob,missionActive,foreignMissionActive,selectedDeviceJobs]);
 const fullReady=Boolean(nativeReady&&rootValid&&hostProofFresh&&!activeJob&&!selectedMissionActive&&!foreignMissionActive&&envelope.tier!=='HOLD');

 useEffect(()=>{if(!rootValid)return;try{window.localStorage.setItem('omega:hybrid:projectRoot',root.trim())}catch{}},[root,rootValid]);

 const bootstrapHost=async(source:'AUTO'|'MANUAL')=>{
  if(!device||!nativeReady||!snapshotCurrent||activeJob||missionActive||!rootValid)return;
  if(!advertised.has('DESKTOP_HEALTH')){if(source==='MANUAL')setError('Connected agent does not advertise DESKTOP_HEALTH. Update/restart the canonical Hybrid agent first.');return}
  const now=Date.now(),key=String(device.id),last=autoAttempt.current[key]||0;
  if(source==='AUTO'&&now-last<AUTO_RETRY_MS)return;
  autoAttempt.current[key]=now;
  setBusy('bootstrap');setError('');setMessage(source==='AUTO'?'Connected host detected. Automatically requesting first-hand desktop health proof…':'Requesting fresh first-hand desktop health proof…');
  try{
   const steps=[{id:'R247-HOST-01',op:'DESKTOP_HEALTH',label:'R247 automatic connected-host resource bootstrap',path:root.trim()}];
   const r=await api.post<any>('/api/hybrid/jobs',{schema:'OMEGA_HYBRID_OPERATOR_JOB_R237',action:'R247_CONNECTED_HOST_BOOTSTRAP',profile:'AUTO_BUILD',projectPath:root.trim(),instructions:'Return first-hand DESKTOP_HEALTH for the selected authenticated host so R238/R239 can immediately admit real work. Read-only host bootstrap; no source mutation.',allowedDomains:[],steps,targetDeviceId:device.id,confirmed:true,snapshotEpoch:epoch,snapshotObservedAt:observedAt});
   if(!r.data?.job?.id)throw new Error('Hybrid runtime returned no durable host-bootstrap job identity.');
   if(r.data.job.targetDeviceId&&r.data.job.targetDeviceId!==device.id)throw new Error('Host bootstrap returned a different device identity; action held.');
   setMessage(`Host bootstrap queued automatically on ${device.name||device.id}: ${r.data.job.id}. The connected agent should claim it without another browser action.`);
   await refresh();
  }catch(e:any){setError(e?.message||String(e))}finally{setBusy('')}
 };

 useEffect(()=>{
  if(!nativeReady||hostProofFresh||activeJob||missionActive||!rootValid||busy)return;
  void bootstrapHost('AUTO');
 },[nativeReady,hostProofFresh,activeJob?.id,missionActive,rootValid,device?.id,epoch]);

 const runFull=async()=>{
  if(busy)return;
  if(!device||!nativeReady){setError('A current authenticated selected-device heartbeat is required.');return}
  if(!rootValid){setError('Project path must remain relative to the launcher-approved root. Use “.” for the approved root.');return}
  if(!hostProofFresh){setError('Fresh returned DESKTOP_HEALTH is required. R247 will bootstrap it automatically; use Refresh/Retry if the agent has just reconnected.');return}
  if(activeJob){setError(`Selected host is busy with ${activeJob.id}. Wait for its returned proof before starting the full mission.`);return}
  if(missionActive){setError(`An active mission is already bound to ${missionTarget||'another host'}. R247 will not create competing mutation streams.`);return}
  if(envelope.tier==='HOLD'){setError(`R239 reports unsafe current resource pressure: ${envelope.reasons.join(' · ')}`);return}
  setBusy('full');setError('');setMessage('');
  try{
   const initial=defaultCommandPlan('BUILD','AUTO_BUILD',root.trim());
   const validation=validateCommandPlan(initial,root.trim(),[]);
   if(!validation.passed)throw new Error(validation.errors.join(' ')||'Initial bounded full-system plan did not validate.');
   const baseObjective=buildFullSystemMissionObjectiveR153(root.trim());
   const objective=operationalMissionObjectiveR248(baseObjective,operational);
   const stateContext=JSON.stringify({...fullSystemStateContextR153(),surface:'HybridActionRuntimeR247',connectedActionRuntime:'R247',adaptiveMissionEngine:'R153',operationalCalculusR248:operational,device:{id:device.id,name:device.name||null,platform:device.platform||null},approvedRoot:root.trim(),selectedSnapshotEpoch:epoch,resourceEnvelopeR239:{tier:envelope.tier,effectiveCpuWorkers:envelope.effectiveCpuWorkers,sourceProfileSha256:hostProof?.profile?.profileSha256||null}});
   const r=await api.post<any>('/api/missions',{objective,threadId:'',stateContext,draft:{schema:'OMEGA_SOVEREIGN_FULL_BUILD_R151',action:'BUILD',profile:'AUTO_BUILD',projectPath:root.trim(),instructions:objective,allowedDomains:[],steps:validation.steps},targetDeviceId:device.id,allowedOps:R153_ALLOWED,maxCycles:operational.policy.maxCycles,confirmedMission:true,snapshotEpoch:epoch,snapshotObservedAt:observedAt});
   if(!r.data?.mission?.id)throw new Error('No durable R153 mission identity returned; nothing is treated as started.');
   setMessage(`Full R247→R153 mission ${r.data.mission.id} started on ${device.name||device.id} under R248 ${operational.decision} calculus with ${operational.policy.maxCycles} bounded cycles. It may inspect, repair with preimage-bound APPLY_PATCH/WRITE_TEXT, build, test, package and return proof on this approved root.`);
   await refresh();
  }catch(e:any){setError(e?.message||String(e))}finally{setBusy('')}
 };

 return <section className='r247-action-runtime' data-r247-host={device?.id||'NONE'} data-r247-ready={fullReady?'YES':'NO'} data-r248-operational-decision={operational.decision}>
  <header><div><span>R247 · CONNECTED HOST ACTION RUNTIME · R248 OPERATIONAL CALCULUS</span><h3>Connection now advances into evidence-weighted work.</h3><p>A current authenticated heartbeat triggers host-health proof. R248 then derives a software-operational continuity/plasticity/contradiction/burden/evidence/uncertainty/scar packet from the returned state and uses the established STAY/TURN/ESCALATE calculus to govern the existing R153 mission objective and recursion budget.</p></div><div className={nativeReady?'r247-badge pass':'r247-badge hold'}>{nativeReady?<CheckCircle2/>:<TriangleAlert/>}<span><b>{nativeReady?'CONNECTED + ACTION-ELIGIBLE':'CURRENT HOST REQUIRED'}</b><small>{device?`${device.name||device.id} · ${age(device.lastSeen)}`:'no authenticated selected host'}</small></span></div></header>
  <div className='r247-grid'>
   <article className={hostProofFresh?'pass':'hold'}><ShieldCheck/><span><small>HOST BOOTSTRAP</small><b>{hostProofFresh?'RETURNED + FRESH':busy==='bootstrap'?'QUEUING / CLAIM PENDING':'AUTO-BOOTSTRAP ARMED'}</b><em>{hostProofFresh?`profile ${String(hostProof?.profile?.profileSha256||'').slice(0,16)}…`:activeJob?`${activeJob.status} · ${activeJob.id}`:'DESKTOP_HEALTH will queue after connection'}</em></span></article>
   <article className={envelope.tier==='READY'||envelope.tier==='HIGH_CAPACITY'||envelope.tier==='CONSTRAINED'?'pass':'hold'}><Cpu/><span><small>RESOURCE ENVELOPE</small><b>{envelope.tier}</b><em>{envelope.effectiveCpuWorkers} worker advisory · {envelope.reasons.join(' · ')}</em></span></article>
   <article className={operational.decision==='STAY'?'pass':'hold'}><Activity/><span><small>R248 OPERATIONAL CALCULUS</small><b>{operational.decision} · {operational.policy.strategy.replaceAll('_',' ')}</b><em>CΩ {operational.metrics.continuity.toFixed(2)} · Φ {operational.metrics.plasticity.toFixed(2)} · q {operational.metrics.contradiction.toFixed(2)} · Λ {operational.metrics.burden.toFixed(2)} · scar {operational.metrics.scar.toFixed(2)} · cycles {operational.policy.maxCycles}/12</em></span></article>
   <article className={fullReady?'pass':'hold'}><Play/><span><small>FULL ACTION</small><b>{fullReady?'READY':'HELD UNTIL CURRENT PROOF'}</b><em>inspect + bounded repair + build + test + package · governed by current R248 packet</em></span></article>
  </div>
  <div className='r247-root'><label><span>Approved-root relative project path</span><input value={root} onChange={e=>setRoot(e.target.value)} aria-invalid={!rootValid}/><small>Use <code>.</code> for the launcher-approved root. R247 removes passive UX gating; R248 changes mission policy, not root or execution authority.</small></label></div>
  {(message||error)&&<div className={'r247-message '+(error?'error':'pass')}>{error?<TriangleAlert/>:<CheckCircle2/>}<span>{error||message}</span></div>}
  <div className='r247-actions'>
   <button onClick={()=>void bootstrapHost('MANUAL')} disabled={!!busy||!nativeReady||Boolean(activeJob)||missionActive||!rootValid}>{busy==='bootstrap'?<Loader2 className='spin'/>:<RefreshCw/>}{hostProofFresh?'Refresh host proof':'Prove host now'}</button>
   <button className='primary' onClick={()=>void runFull()} disabled={!fullReady||!!busy}>{busy==='full'?<Loader2 className='spin'/>:<Play/>}RUN FULL REPAIR + BUILD + TEST + PACKAGE</button>
   <button onClick={()=>void refresh()} disabled={!!busy}><RefreshCw/>Refresh shared state</button>
  </div>
  <footer><ShieldCheck/><span>R248 applies the established living operational calculus to the real R247→R153 mission launch. The packet is derived only from current returned software/Hybrid/resource/job evidence; it is not empirical physics or Canon truth. R153 preimage-bound mutation, R147 dispatch, R141 return proof, R146 durable history, R240 source promotion and R125 CanonState admission remain separate authorities.</span></footer>
 </section>;
}
