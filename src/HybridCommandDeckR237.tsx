import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Cpu,FileCheck2,FolderOutput,GraduationCap,PauseCircle,Play,RefreshCw,ShieldCheck,TerminalSquare,TriangleAlert,XCircle} from 'lucide-react';
import {api} from './platformAdapter';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import './hybridCommandDeckR237.css';

type Preset={id:string;label:string;detail:string;ops:string[];steps:(root:string)=>any[]};
const ACTIVE_JOB=new Set(['QUEUED','RUNNING']);
const ACTIVE_MISSION=new Set(['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']);
const PRESETS:Preset[]=[
 {id:'PROVE_HOST',label:'Prove host + tree',detail:'Run bounded desktop health, source-tree hashing and a forensic hash ledger. No source patch/write operation is included.',ops:['DESKTOP_HEALTH','HASH_TREE','FORENSIC_HASH_LEDGER'],steps:root=>[
  {id:'S01',op:'DESKTOP_HEALTH',label:'Prove canonical runtime and bounded desktop health from the authenticated host',path:root},
  {id:'S02',op:'HASH_TREE',label:'Fingerprint the selected project tree before any later action',path:root,maxResults:5000},
  {id:'S03',op:'FORENSIC_HASH_LEDGER',label:'Write a bounded forensic file-hash ledger and return its path',path:root}
 ]},
 {id:'VERIFY_PROJECT',label:'Build + test',detail:'Inventory and hash first, then run the declared build and tests. This preset does not patch or overwrite source.',ops:['INDEX','HASH_TREE','BUILD','TEST'],steps:root=>[
  {id:'S01',op:'INDEX',label:'Discover project manifests and working files inside the approved root',path:root},
  {id:'S02',op:'HASH_TREE',label:'Fingerprint the project tree before build',path:root,maxResults:5000},
  {id:'S03',op:'BUILD',label:'Run the declared project build',path:root,profile:'AUTO_BUILD'},
  {id:'S04',op:'TEST',label:'Run the declared project verification',path:root,profile:'AUTO_BUILD'}
 ]},
 {id:'PACKAGE_VERIFIED',label:'Build + test + package',detail:'Verify the project and package only the returned verified output. No source mutation operation is included.',ops:['INDEX','HASH_TREE','BUILD','TEST','PACKAGE'],steps:root=>[
  {id:'S01',op:'INDEX',label:'Discover project manifests and working files inside the approved root',path:root},
  {id:'S02',op:'HASH_TREE',label:'Fingerprint the project tree before build',path:root,maxResults:5000},
  {id:'S03',op:'BUILD',label:'Run the declared project build',path:root,profile:'AUTO_BUILD'},
  {id:'S04',op:'TEST',label:'Run the declared project verification',path:root,profile:'AUTO_BUILD'},
  {id:'S05',op:'PACKAGE',label:'Package the verified project output',path:root}
 ]},
 {id:'TRAIN_LOCAL_INDEX',label:'Rebuild local learning index',detail:'Run bounded TRAIN_LOCAL over the approved corpus and require a returned evaluation receipt; foundation weights are not silently changed.',ops:['TRAIN_LOCAL'],steps:root=>[
  {id:'S01',op:'TRAIN_LOCAL',label:'Rebuild the local retrieval/proof-prior index and return an evaluation receipt',path:root,maxResults:25000}
 ]}
];
const age=(n:any)=>{const t=Number(n)||0;if(!t)return'—';const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const safeRoot=(value:string)=>{const s=value.trim().replace(/\\/g,'/');return Boolean(s)&&(s==='.'||(!s.startsWith('/')&&!/^[A-Za-z]:/.test(s)&&!s.split('/').includes('..')&&!s.includes('\0')))};
const short=(v:any,n=24)=>{const s=String(v||'');return s.length>n?`${s.slice(0,n)}…`:s||'—'};

export default function HybridCommandDeckR237(){
 const[root,setRoot]=useState(()=>{try{return window.localStorage.getItem('omega:hybrid:projectRoot')||'.'}catch{return'.'}});
 const[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[actionError,setActionError]=useState('');
 const{hybrid:live,onlineDevices,device,selectedDeviceJobs,missionEntries,currentMission,currentMissionJob:missionJob,observedAt,epoch,stale,error:snapshotError,refresh,selectDevice,targetForMission}=useHybridRuntimeSnapshotR238();
 useEffect(()=>{if(!safeRoot(root))return;try{window.localStorage.setItem('omega:hybrid:projectRoot',root.trim())}catch{}},[root]);
 const activeJobs=useMemo(()=>selectedDeviceJobs.filter((job:any)=>ACTIVE_JOB.has(String(job?.status||'').toUpperCase())),[selectedDeviceJobs]);
 const activeJob=activeJobs[0]||null;
 const foreignActiveMissionCount=useMemo(()=>{if(!device)return 0;return missionEntries.filter(({mission,job})=>ACTIVE_MISSION.has(String(mission?.status||'').toUpperCase())&&targetForMission(mission,job)!==device.id).length},[missionEntries,device,targetForMission]);
 const advertised=useMemo(()=>new Set(Array.isArray(device?.capabilities)?device.capabilities:[]),[device]);
 const snapshotCurrent=epoch>0&&!stale;
 const nativeReady=Boolean(snapshotCurrent&&live?.nativeExecutionClaimed===true&&device?.online&&!device?.revoked);
 const rootValid=safeRoot(root);
 const queueClear=activeJobs.length===0;
 const missionTarget=currentMission?targetForMission(currentMission,missionJob):'';
 const correlationLocked=Boolean(snapshotCurrent&&device)&&(!activeJob||activeJob.targetDeviceId===device.id)&&(!currentMission||missionTarget===device.id);
 const canRun=(preset:Preset)=>nativeReady&&correlationLocked&&rootValid&&queueClear&&!busy&&preset.ops.every(op=>advertised.has(op));
 const chooseDevice=(id:string)=>{selectDevice(id);setMessage('');setActionError('')};
 const requireCurrentSnapshot=()=>{if(snapshotCurrent)return true;setActionError('The shared Hybrid/Mission snapshot is stale or has not completed an atomic observation epoch. Refresh it before any native or mission-control write.');return false};
 const queuePreset=async(preset:Preset)=>{
  if(!requireCurrentSnapshot())return;
  if(!device||!nativeReady){setActionError('A current authenticated non-revoked PC heartbeat is required before native work can queue.');return}
  if(!correlationLocked){setActionError('Host/job/mission/epoch correlation is not locked to one authenticated device. Refresh or select the intended host before queueing work.');return}
  if(!rootValid){setActionError('Project path must stay relative to the launcher-approved root. Use “.” for the approved root itself; do not enter J:\\ or another absolute path here.');return}
  if(activeJob){setActionError(`Device busy: ${activeJob.id} is ${activeJob.status}. R237 will not pile a second job onto the same host.`);return}
  const missing=preset.ops.filter(op=>!advertised.has(op));if(missing.length){setActionError(`Host capability proof is missing: ${missing.join(', ')}`);return}
  setBusy(preset.id);setMessage('');setActionError('');
  try{
   const steps=preset.steps(root.trim());
   const r=await api.post<any>('/api/hybrid/jobs',{schema:'OMEGA_HYBRID_OPERATOR_JOB_R237',action:preset.id,profile:'AUTO_BUILD',projectPath:root.trim(),instructions:preset.detail,allowedDomains:[],steps,targetDeviceId:device.id,confirmed:true,snapshotEpoch:epoch,snapshotObservedAt:observedAt});
   if(!r.data?.job?.id)throw new Error('Worker returned no durable job identity; nothing is treated as queued.');
   if(r.data.job.targetDeviceId&&r.data.job.targetDeviceId!==device.id)throw new Error('Worker returned a job for a different device; execution is held.');
   setMessage(`Queued ${preset.label}: ${r.data.job.id} on ${device.name||device.id}. The host must claim and return it before R212/R141 can show execution proof.`);
   await refresh();
  }catch(e:any){setActionError(e?.message||String(e))}finally{setBusy('')}
 };
 const cancelQueuedJob=async()=>{
  if(!requireCurrentSnapshot())return;
  if(!activeJob||activeJob.targetDeviceId!==device?.id||String(activeJob.status).toUpperCase()!=='QUEUED'||busy)return;
  setBusy('cancel-job');setActionError('');setMessage('');
  try{const r=await api.post<any>(`/api/hybrid/jobs/${encodeURIComponent(activeJob.id)}/cancel`,{});setMessage(`Queued job ${r.data?.job?.id||activeJob.id} cancelled before host claim.`);await refresh()}catch(e:any){setActionError(e?.message||String(e))}finally{setBusy('')}
 };
 const controlMission=async(action:'pause'|'resume'|'cancel')=>{
  if(!requireCurrentSnapshot())return;
  if(!currentMission?.id||!device||targetForMission(currentMission,missionJob)!==device.id||busy)return;
  setBusy('mission-'+action);setActionError('');setMessage('');
  try{const r=await api.post<any>(`/api/missions/${encodeURIComponent(currentMission.id)}/${action}`,{});if(r.data?.mission&&targetForMission(r.data.mission,r.data.mission.currentJob)!==device.id)throw new Error('Mission control response lost the selected host binding; execution state is held.');setMessage(action==='pause'?'Mission paused. A job already RUNNING on the host is not force-killed; later cycles remain held.':action==='resume'?'Mission resumed inside the same bounded authority envelope.':'Mission cancelled before its queued host job was claimed.');await refresh()}catch(e:any){setActionError(e?.message||String(e))}finally{setBusy('')}
 };
 const error=actionError||snapshotError;
 return <section className='r237-command-deck' aria-label='R237 Hybrid command authority' data-r237-command-authority='AUTHENTICATED_BOUNDED_NATIVE_CONTROL' data-r237-selected-device={device?.id||'NONE'} data-r237-correlation={correlationLocked?'LOCKED':'HELD'} data-r237-snapshot-epoch={epoch}>
  <header className='r237-head'><div><span>R237 + R238 · HYBRID COMMAND AUTHORITY · SHARED ATOMIC SNAPSHOT</span><h3>Use the PC as a governed compute node.</h3><p>R237 command admission and R212 host observation now consume one selected authenticated device and one atomic Hybrid/Mission snapshot epoch. Capability-negotiated native presets, backpressure, cancellation and mission control fail closed when that snapshot is stale. These presets intentionally contain no APPLY_PATCH or WRITE_TEXT.</p></div><button onClick={()=>void refresh()} disabled={!!busy}><RefreshCw/>Refresh shared snapshot</button></header>
  <div className='r237-state-grid'>
   <article className={nativeReady?'pass':'hold'}>{nativeReady?<CheckCircle2/>:<TriangleAlert/>}<span><small>HOST AUTHORITY</small><b>{nativeReady?'CURRENT HEARTBEAT PROVED':stale?'SNAPSHOT STALE':'DEVICE PROOF REQUIRED'}</b><em>{device?`${device.name||device.id} · ${age(device.lastSeen)} · epoch ${epoch}`:'no current authenticated device'}</em></span></article>
   <article className={correlationLocked?'pass':'hold'}>{correlationLocked?<ShieldCheck/>:<TriangleAlert/>}<span><small>CORRELATION LOCK</small><b>{correlationLocked?'HOST / JOB / MISSION / EPOCH LOCKED':'EXECUTION CONTEXT HELD'}</b><em>{device?`device ${short(device.id,34)} · observed ${age(observedAt)}${foreignActiveMissionCount?` · ${foreignActiveMissionCount} other active mission${foreignActiveMissionCount===1?'':'s'} isolated`:''}`:'select a current authenticated host'}</em></span></article>
   <article className={queueClear?'pass':'running'}><Cpu/><span><small>DEVICE QUEUE</small><b>{queueClear?'CLEAR':'BACKPRESSURE ACTIVE'}</b><em>{activeJob?`${short(activeJob.id)} · ${activeJob.status}`:'one new bounded job may be admitted'}</em></span></article>
   <article className={rootValid?'pass':'hold'}><TerminalSquare/><span><small>PROJECT PATH</small><b>{rootValid?'ROOT-CONFINED':'HELD'}</b><em>relative to {device?.rootLabel||'launcher-approved root'}</em></span></article>
  </div>
  {onlineDevices.length>0&&<div className='r237-root-row r237-device-row'><label><span>Authenticated compute host</span><select aria-label='Authenticated compute host' value={device?.id||''} onChange={e=>chooseDevice(e.target.value)}>{onlineDevices.map((row:any)=><option key={row.id} value={row.id}>{row.name||row.id} · {row.id}</option>)}</select><small>This selection is shared by R212 and R237. Every preset, queue gate, cancellation, return view and mission-control action is correlated to this exact device identity and snapshot plane.</small></label></div>}
  <div className='r237-root-row'><label><span>Project path inside approved root</span><input value={root} onChange={e=>setRoot(e.target.value)} aria-invalid={!rootValid}/><small>Use <code>.</code> for the approved root itself. Absolute Windows paths are deliberately rejected here.</small></label></div>
  {(message||error)&&<div className={'r237-message '+(error?'error':'pass')}>{error?<TriangleAlert/>:<CheckCircle2/>}<span>{error||message}</span></div>}
  <div className='r237-presets'>
   {PRESETS.map((preset,index)=>{const missing=preset.ops.filter(op=>!advertised.has(op));const icon=index===0?<ShieldCheck/>:index===1?<FileCheck2/>:index===2?<FolderOutput/>:<GraduationCap/>;return <article key={preset.id} className={canRun(preset)?'ready':'held'}>{icon}<div><span>{preset.id}</span><h4>{preset.label}</h4><p>{preset.detail}</p><div className='r237-oplist'>{preset.ops.map(op=><code key={op} className={advertised.has(op)?'ok':'missing'}>{op}</code>)}</div>{missing.length>0&&<small className='r237-missing'>missing host proof: {missing.join(', ')}</small>}</div><button onClick={()=>void queuePreset(preset)} disabled={!canRun(preset)}>{busy===preset.id?'Queuing…':queueClear?'Run on this PC':'Device busy'}</button></article>})}
  </div>
  {activeJob&&<section className='r237-active-job' data-r237-job-device={activeJob.targetDeviceId}><header><Cpu/><span><small>CURRENT NATIVE JOB · CORRELATED HOST</small><b>{activeJob.status} · {short(activeJob.id,40)}</b><em>{activeJob.steps?.length||0} approved step{activeJob.steps?.length===1?'':'s'} · target {device?.name||activeJob.targetDeviceId} · {short(activeJob.targetDeviceId,34)}</em></span></header><div className='r237-active-steps'>{(activeJob.steps||[]).map((s:any)=><code key={s.id||s.op}>{s.id||'—'} · {s.op}</code>)}</div>{String(activeJob.status).toUpperCase()==='QUEUED'?<button className='danger' onClick={()=>void cancelQueuedJob()} disabled={!!busy||!snapshotCurrent}><XCircle/>Cancel before host claim</button>:<p><ShieldCheck/>The host has already claimed this job. Cloud control cannot truthfully pretend to kill an executing local process; wait for its return while R212 shows the first-hand host result.</p>}</section>}
  {currentMission&&<section className='r237-mission-control' data-r237-mission-device={missionTarget}><header><ShieldCheck/><span><small>CURRENT GOVERNED MISSION · CORRELATED HOST</small><b>{currentMission.status} · {short(currentMission.id,42)}</b><em>cycle {Number(currentMission.cycle||0)}/{Number(currentMission.maxCycles||0)||'—'} · current job {missionJob?.status||'unknown'} · target {short(missionTarget,34)}</em></span></header><div className='r237-mission-actions'>{String(currentMission.status).toUpperCase()==='PAUSED'?<button onClick={()=>void controlMission('resume')} disabled={!!busy||!snapshotCurrent}><Play/>Resume</button>:<button onClick={()=>void controlMission('pause')} disabled={!!busy||!snapshotCurrent}><PauseCircle/>Pause after current boundary</button>}{String(missionJob?.status||'').toUpperCase()==='QUEUED'&&<button className='danger' onClick={()=>void controlMission('cancel')} disabled={!!busy||!snapshotCurrent}><XCircle/>Cancel queued mission</button>}</div>{String(missionJob?.status||'').toUpperCase()==='RUNNING'&&<p><TriangleAlert/>Mission pause does not force-kill a RUNNING native job. It holds later mission progression; the current host process must return its own proof packet.</p>}</section>}
  <footer><ShieldCheck/><span>R238 changes correlation and sampling, not execution or Canon authority. R237 remains the bounded operator surface over the established executor: one selected authenticated device, one current snapshot epoch, at most one QUEUED/RUNNING job, authenticated mission control, exact host-return closure through R212/R141, durable history through R146, dispatch authority through R147, and CanonState admission only through R125.</span></footer>
 </section>;
}
