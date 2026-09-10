import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,FileCheck2,Loader2,PackageCheck,Play,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import {latestReturnedHostProofR239,resourceEnvelopeR239} from './hybridResourceGovernorR239';
import {defaultCommandPlan,validateCommandPlan} from './hybridCommandRuntime';
import {buildFullSystemMissionObjectiveR153,fullSystemStateContextR153} from './fullSystemCompletionR153.js';
import {compileOperationalCalculusR248,operationalMissionObjectiveR248} from './operationalCalculusR248';
import {compileOperationalConvergenceR249,sequenceGovernedStepsR249} from './system/operationalConvergenceR249.js';
import './hybridActionRuntimeR247.css';

const ACTIVE_JOB=new Set(['QUEUED','RUNNING']);
const ACTIVE_MISSION=new Set(['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']);
const R254_ALLOWED=['INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'];
const safeRoot=(value:string)=>{const s=value.trim().replace(/\\/g,'/');return Boolean(s)&&(s==='.'||(!s.startsWith('/')&&!/^[A-Za-z]:/.test(s)&&!s.split('/').includes('..')&&!s.includes('\0')))};
const material=(job:any)=>{const proofs=Array.isArray(job?.returnPacket?.stepProofs)?job.returnPacket.stepProofs:[];const paths=Array.isArray(job?.returnPacket?.outputPaths)?job.returnPacket.outputPaths:[];return paths.length>0||proofs.some((p:any)=>p?.ok===true&&['APPLY_PATCH','WRITE_TEXT','PACKAGE','SUPPORT_BUNDLE'].includes(String(p?.op||'').toUpperCase()))};

export default function HybridOutcomeClosureR254(){
 const[root,setRoot]=useState(()=>{try{return window.localStorage.getItem('omega:hybrid:projectRoot')||'.'}catch{return'.'}});
 const[outcome,setOutcome]=useState(()=>{try{return window.localStorage.getItem('omega:hybrid:outcomeR254')||'Advance the current OMEGA project to the next production-ready phase, repair proven defects, verify inherited behavior, and return an explicit packaged artifact path.'}catch{return'Advance the current OMEGA project to the next production-ready phase, repair proven defects, verify inherited behavior, and return an explicit packaged artifact path.'}});
 const[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const{hybrid,device,selectedDeviceJobs,currentMission,currentMissionJob,epoch,observedAt,stale,refresh,targetForMission}=useHybridRuntimeSnapshotR238();
 const activeJob=useMemo(()=>selectedDeviceJobs.find((j:any)=>ACTIVE_JOB.has(String(j?.status||'').toUpperCase()))||null,[selectedDeviceJobs]);
 const hostProof=useMemo(()=>latestReturnedHostProofR239(selectedDeviceJobs,String(device?.id||'')),[selectedDeviceJobs,device?.id]);
 const snapshotCurrent=epoch>0&&!stale,nativeReady=Boolean(snapshotCurrent&&hybrid?.nativeExecutionClaimed===true&&device?.online&&!device?.revoked);
 const missionTarget=currentMission?targetForMission(currentMission,currentMissionJob):'';
 const missionActive=Boolean(currentMission&&ACTIVE_MISSION.has(String(currentMission?.status||'').toUpperCase()));
 const selectedMissionActive=Boolean(missionActive&&device&&missionTarget===device.id),foreignMissionActive=Boolean(missionActive&&device&&missionTarget&&missionTarget!==device.id);
 const envelope=useMemo(()=>resourceEnvelopeR239({profile:hostProof?.profile||null,snapshotCurrent,activeNativeWork:Boolean(activeJob)}),[hostProof?.profile,snapshotCurrent,activeJob]);
 const hostProofFresh=Boolean(hostProof&&envelope.profileFresh);
 const operational=useMemo(()=>compileOperationalCalculusR248({snapshotCurrent,nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true,deviceOnline:Boolean(device?.online),deviceRevoked:Boolean(device?.revoked),hostProofFresh,resourceTier:String(envelope.tier||'HOLD'),effectiveCpuWorkers:Number(envelope.effectiveCpuWorkers)||0,sourceProfileSha256:hostProof?.profile?.profileSha256||null,activeJob:Boolean(activeJob),missionActive,foreignMissionActive,jobs:selectedDeviceJobs}),[snapshotCurrent,hybrid?.nativeExecutionClaimed,device?.online,device?.revoked,hostProofFresh,envelope.tier,envelope.effectiveCpuWorkers,hostProof?.profile?.profileSha256,activeJob,missionActive,foreignMissionActive,selectedDeviceJobs]);
 const convergence=useMemo(()=>compileOperationalConvergenceR249({metrics:operational.metrics,configuredParallel:12,effectiveCpuWorkers:Number(envelope.effectiveCpuWorkers)||0,executionRequested:true}),[operational.metrics,envelope.effectiveCpuWorkers]);
 const rootValid=safeRoot(root),requestedOutcome=outcome.trim().slice(0,1600);
 const ready=Boolean(nativeReady&&hostProofFresh&&rootValid&&requestedOutcome&&!activeJob&&!selectedMissionActive&&!foreignMissionActive&&envelope.tier!=='HOLD');
 const latestMaterial=useMemo(()=>selectedDeviceJobs.filter((j:any)=>['COMPLETE','DONE'].includes(String(j?.status||'').toUpperCase())&&material(j)).sort((a:any,b:any)=>Number(b?.completedAt||b?.returnPacket?.receivedAt||0)-Number(a?.completedAt||a?.returnPacket?.receivedAt||0))[0]||null,[selectedDeviceJobs]);
 const materialPaths=Array.isArray(latestMaterial?.returnPacket?.outputPaths)?latestMaterial.returnPacket.outputPaths:[];
 useEffect(()=>{if(rootValid)try{window.localStorage.setItem('omega:hybrid:projectRoot',root.trim())}catch{}},[root,rootValid]);
 useEffect(()=>{try{window.localStorage.setItem('omega:hybrid:outcomeR254',requestedOutcome)}catch{}},[requestedOutcome]);

 const run=async()=>{
  if(!ready||!device||busy)return;setBusy(true);setError('');setMessage('');
  try{
   const initial=defaultCommandPlan('BUILD','AUTO_BUILD',root.trim()),validation=validateCommandPlan(initial,root.trim(),[]);
   if(!validation.passed)throw new Error(validation.errors.join(' ')||'Initial outcome plan failed validation.');
   const sequence=sequenceGovernedStepsR249(validation.steps,convergence);if(!sequence.steps.length)throw new Error('R249 returned no lawful first-cycle steps.');
   const base=buildFullSystemMissionObjectiveR153(root.trim());
   const closure=['R254 OPERATOR OUTCOME: '+requestedOutcome,'Do not stop merely because the current build passes. Determine whether the requested outcome is already satisfied from returned filesystem/source proof. If not satisfied, use only proven evidence to make the smallest lawful preimage-bound APPLY_PATCH/WRITE_TEXT changes, then rebuild and retest. Before COMPLETE, run PACKAGE or SUPPORT_BUNDLE and return at least one explicit output path whenever the selected project can be packaged. A successful DESKTOP_HEALTH, INDEX, HASH_TREE, BUILD or TEST result by itself is not outcome closure. If no mutation is warranted, say so explicitly and still return the verified package path. If packaging cannot lawfully run, HOLD with the exact reason instead of claiming completion.',base].join(' ');
   const objective=operationalMissionObjectiveR248(closure,operational),missionCycles=Math.max(6,Math.min(12,Math.max(operational.policy.maxCycles,convergence.policy.maxMissionCycles)));
   const stateContext=JSON.stringify({...fullSystemStateContextR153(),surface:'HybridOutcomeClosureR254',outcomeClosureR254:{schema:'OMEGA_OUTCOME_CLOSURE_R254',requestedOutcome,completionRequires:['returned proof for requested outcome','BUILD/TEST proof when declared','explicit PACKAGE/SUPPORT_BUNDLE output path or exact HOLD','APPLY_PATCH/WRITE_TEXT proof for any claimed source mutation'],nonClosure:['DESKTOP_HEALTH alone','INDEX/HASH_TREE alone','BUILD success alone','intent text alone']},operationalCalculusR248:operational,operationalConvergenceR249:convergence,device:{id:device.id,name:device.name||null},approvedRoot:root.trim(),snapshotEpoch:epoch});
   const r=await api.post<any>('/api/missions',{objective,threadId:'',stateContext,draft:{schema:'OMEGA_OUTCOME_CLOSURE_R254',action:'BUILD',profile:'AUTO_BUILD',projectPath:root.trim(),instructions:objective,allowedDomains:[],steps:sequence.steps},targetDeviceId:device.id,allowedOps:R254_ALLOWED,maxCycles:missionCycles,confirmedMission:true,snapshotEpoch:epoch,snapshotObservedAt:observedAt});
   if(!r.data?.mission?.id)throw new Error('No durable R254 mission identity returned.');
   setMessage(`R254 outcome mission ${r.data.mission.id} started on ${device.name||device.id}. Completion now requires material returned proof, not a heartbeat or build-only success.`);await refresh();
  }catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}
 };

 return <section className='r247-action-runtime' data-r254-outcome-closure={ready?'READY':'HELD'}>
  <header><div><span>R254 · OUTCOME CLOSURE · MATERIAL RETURN CONTRACT</span><h3>Ask for the result, not just a build pass.</h3><p>R254 carries one concrete operator outcome through R248/R249/R153 and refuses to equate heartbeat, discovery, hashing or a passing build with completion. A material return must prove the requested result and normally return an explicit package/support path.</p></div><div className={ready?'r247-badge pass':'r247-badge hold'}>{ready?<CheckCircle2/>:<TriangleAlert/>}<span><b>{ready?'OUTCOME EXECUTION READY':'CURRENT PROOF / RESOURCE HOLD'}</b><small>{device?.name||'no selected authenticated host'}</small></span></div></header>
  <div className='r247-root'><label><span>Outcome to complete</span><input value={outcome} onChange={e=>setOutcome(e.target.value)} maxLength={1600}/><small>Describe the concrete result you want. R254 preserves the approved root and existing mutation/dispatch/proof authorities.</small></label><label><span>Approved-root relative project path</span><input value={root} onChange={e=>setRoot(e.target.value)} aria-invalid={!rootValid}/><small>Use <code>.</code> for the launcher-approved project root.</small></label></div>
  <div className='r247-grid'><article className={hostProofFresh?'pass':'hold'}><ShieldCheck/><span><small>HOST TRUTH</small><b>{hostProofFresh?'FRESH RETURNED HOST PROOF':'FRESH HOST PROOF REQUIRED'}</b><em>R238/R239 selected-host evidence</em></span></article><article className={latestMaterial?'pass':'hold'}><FileCheck2/><span><small>LATEST MATERIAL RETURN</small><b>{latestMaterial?latestMaterial.id:'NONE YET'}</b><em>{latestMaterial?`${materialPaths.length} explicit returned path${materialPaths.length===1?'':'s'}`:'bootstrap/health returns are not material completion'}</em></span></article><article className={materialPaths.length?'pass':'hold'}><PackageCheck/><span><small>RETURNED ARTIFACT PATH</small><b>{materialPaths[0]||'PENDING NEXT MATERIAL RETURN'}</b><em>{materialPaths.length>1?`+${materialPaths.length-1} more returned paths`:'PACKAGE/SUPPORT_BUNDLE path is part of R254 closure'}</em></span></article></div>
  {(message||error)&&<div className={'r247-message '+(error?'error':'pass')}>{error?<TriangleAlert/>:<CheckCircle2/>}<span>{error||message}</span></div>}
  <div className='r247-actions'><button className='primary' onClick={()=>void run()} disabled={!ready||busy}>{busy?<Loader2 className='spin'/>:<Play/>}RUN OUTCOME → REPAIR → VERIFY → PACKAGE</button><button onClick={()=>void refresh()} disabled={busy}>Refresh returned state</button></div>
  <footer><ShieldCheck/><span>R254 is an execution-completion contract, not new authority. R153 still governs adaptive mutation, R147 dispatches, R141 closes exact returned proof, R240 promotes exact source, ci.yml deploys production, and R125 alone admits CanonState.</span></footer>
 </section>;
}
