import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Cpu,FileCheck2,FolderOutput,GraduationCap,PauseCircle,Play,RefreshCw,ShieldCheck,TerminalSquare,TriangleAlert,XCircle} from 'lucide-react';
import {api} from './platformAdapter';
import './hybridCommandDeckR237.css';

type Preset={id:string;label:string;detail:string;ops:string[];steps:(root:string)=>any[]};
const ACTIVE_JOB=new Set(['QUEUED','RUNNING']);
const ACTIVE_MISSION=new Set(['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']);
const TERMINAL_JOB=new Set(['COMPLETE','DONE','FAILED','CANCELLED']);
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
 const[live,setLive]=useState<any>(null),[missions,setMissions]=useState<any[]>([]),[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState('');
 const refresh=async()=>{try{const[h,m]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')]);setLive(h.data||{});setMissions(Array.isArray(m.data?.missions)?m.data.missions:[]);setError('')}catch(e:any){setError(e?.message||String(e))}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),2500);return()=>window.clearInterval(id)},[]);
 useEffect(()=>{if(!safeRoot(root))return;try{window.localStorage.setItem('omega:hybrid:projectRoot',root.trim())}catch{}},[root]);
 const devices=Array.isArray(live?.devices)?live.devices:[];
 const onlineDevices=useMemo(()=>devices.filter((d:any)=>d?.online&&!d?.revoked),[devices]);
 const device=onlineDevices[0]||null;
 const jobs=Array.isArray(live?.jobs)?live.jobs:[];
 const activeJobs=useMemo(()=>jobs.filter((j:any)=>device&&j?.targetDeviceId===device.id&&ACTIVE_JOB.has(String(j?.status||'').toUpperCase())),[jobs,device]);
 const activeJob=activeJobs[0]||null;
 const currentMission=useMemo(()=>missions.find((m:any)=>ACTIVE_MISSION.has(String(m?.status||'').toUpperCase()))||null,[missions]);
 const missionJob=useMemo(()=>{if(!currentMission)return null;return jobs.find((j:any)=>j.id===currentMission.currentJobId)||currentMission.currentJob||null},[currentMission,jobs]);
 const advertised=new Set(Array.isArray(device?.capabilities)?device.capabilities:[]);
 const nativeReady=Boolean(live?.nativeExecutionClaimed===true&&device);
 const rootValid=safeRoot(root);
 const queueClear=activeJobs.length===0;
 const canRun=(preset:Preset)=>nativeReady&&rootValid&&queueClear&&!busy&&preset.ops.every(op=>advertised.has(op));
 const queuePreset=async(preset:Preset)=>{
  if(!device||!nativeReady){setError('A current authenticated non-revoked PC heartbeat is required before native work can queue.');return}
  if(!rootValid){setError('Project path must stay relative to the launcher-approved root. Use “.” for the approved root itself; do not enter J:\\ or another absolute path here.');return}
  if(activeJob){setError(`Device busy: ${activeJob.id} is ${activeJob.status}. R237 will not pile a second job onto the same host.`);return}
  const missing=preset.ops.filter(op=>!advertised.has(op));if(missing.length){setError(`Host capability proof is missing: ${missing.join(', ')}`);return}
  setBusy(preset.id);setMessage('');setError('');
  try{
   const steps=preset.steps(root.trim());
   const r=await api.post<any>('/api/hybrid/jobs',{schema:'OMEGA_HYBRID_OPERATOR_JOB_R237',action:preset.id,profile:'AUTO_BUILD',projectPath:root.trim(),instructions:preset.detail,allowedDomains:[],steps,targetDeviceId:device.id,confirmed:true});
   if(!r.data?.job?.id)throw new Error('Worker returned no durable job identity; nothing is treated as queued.');
   setMessage(`Queued ${preset.label}: ${r.data.job.id}. The host must claim and return it before R212/R141 can show execution proof.`);
   await refresh();
  }catch(e:any){setError(e?.message||String(e))}finally{setBusy('')}
 };
 const cancelQueuedJob=async()=>{
  if(!activeJob||String(activeJob.status).toUpperCase()!=='QUEUED'||busy)return;
  setBusy('cancel-job');setError('');setMessage('');
  try{const r=await api.post<any>(`/api/hybrid/jobs/${encodeURIComponent(activeJob.id)}/cancel`,{});setMessage(`Queued job ${r.data?.job?.id||activeJob.id} cancelled before host claim.`);await refresh()}catch(e:any){setError(e?.message||String(e))}finally{setBusy('')}
 };
 const controlMission=async(action:'pause'|'resume'|'cancel')=>{
  if(!currentMission?.id||busy)return;
  setBusy('mission-'+action);setError('');setMessage('');
  try{const r=await api.post<any>(`/api/missions/${encodeURIComponent(currentMission.id)}/${action}`,{});setMessage(action==='pause'?'Mission paused. A job already RUNNING on the host is not force-killed; later cycles remain held.':action==='resume'?'Mission resumed inside the same bounded authority envelope.':'Mission cancelled before its queued host job was claimed.');if(r.data?.mission)setMissions(rows=>rows.map(x=>x.id===r.data.mission.id?r.data.mission:x));await refresh()}catch(e:any){setError(e?.message||String(e))}finally{setBusy('')}
 };
 return <section className='r237-command-deck' aria-label='R237 Hybrid command authority' data-r237-command-authority='AUTHENTICATED_BOUNDED_NATIVE_CONTROL'>
  <header className='r237-head'><div><span>R237 · HYBRID COMMAND AUTHORITY · AUTHENTICATED + BACKPRESSURED</span><h3>Use the PC as a governed compute node.</h3><p>R237 moves Hybrid Link from connection/proof visibility into an operator command deck: capability-negotiated native presets, one-active-job-per-device backpressure, authenticated mission control, queued-job cancellation, and exact handoff into the existing R212 host-effects and R141 proof closure. These presets intentionally contain no APPLY_PATCH or WRITE_TEXT.</p></div><button onClick={()=>void refresh()} disabled={!!busy}><RefreshCw/>Refresh</button></header>
  <div className='r237-state-grid'>
   <article className={nativeReady?'pass':'hold'}>{nativeReady?<CheckCircle2/>:<TriangleAlert/>}<span><small>HOST AUTHORITY</small><b>{nativeReady?'CURRENT HEARTBEAT PROVED':'DEVICE PROOF REQUIRED'}</b><em>{device?`${device.name||device.id} · ${age(device.lastSeen)}`:'no current authenticated device'}</em></span></article>
   <article className={queueClear?'pass':'running'}><Cpu/><span><small>DEVICE QUEUE</small><b>{queueClear?'CLEAR':'BACKPRESSURE ACTIVE'}</b><em>{activeJob?`${short(activeJob.id)} · ${activeJob.status}`:'one new bounded job may be admitted'}</em></span></article>
   <article className={rootValid?'pass':'hold'}><TerminalSquare/><span><small>PROJECT PATH</small><b>{rootValid?'ROOT-CONFINED':'HELD'}</b><em>relative to {device?.rootLabel||'launcher-approved root'}</em></span></article>
  </div>
  <div className='r237-root-row'><label><span>Project path inside approved root</span><input value={root} onChange={e=>setRoot(e.target.value)} aria-invalid={!rootValid}/><small>Use <code>.</code> for the approved root itself. Absolute Windows paths are deliberately rejected here.</small></label></div>
  {(message||error)&&<div className={'r237-message '+(error?'error':'pass')}>{error?<TriangleAlert/>:<CheckCircle2/>}<span>{error||message}</span></div>}
  <div className='r237-presets'>
   {PRESETS.map((preset,index)=>{const missing=preset.ops.filter(op=>!advertised.has(op));const icon=index===0?<ShieldCheck/>:index===1?<FileCheck2/>:index===2?<FolderOutput/>:<GraduationCap/>;return <article key={preset.id} className={canRun(preset)?'ready':'held'}>{icon}<div><span>{preset.id}</span><h4>{preset.label}</h4><p>{preset.detail}</p><div className='r237-oplist'>{preset.ops.map(op=><code key={op} className={advertised.has(op)?'ok':'missing'}>{op}</code>)}</div>{missing.length>0&&<small className='r237-missing'>missing host proof: {missing.join(', ')}</small>}</div><button onClick={()=>void queuePreset(preset)} disabled={!canRun(preset)}>{busy===preset.id?'Queuing…':queueClear?'Run on this PC':'Device busy'}</button></article>})}
  </div>
  {activeJob&&<section className='r237-active-job'><header><Cpu/><span><small>CURRENT NATIVE JOB</small><b>{activeJob.status} · {short(activeJob.id,40)}</b><em>{activeJob.steps?.length||0} approved step{activeJob.steps?.length===1?'':'s'} · target {device?.name||activeJob.targetDeviceId}</em></span></header><div className='r237-active-steps'>{(activeJob.steps||[]).map((s:any)=><code key={s.id||s.op}>{s.id||'—'} · {s.op}</code>)}</div>{String(activeJob.status).toUpperCase()==='QUEUED'?<button className='danger' onClick={()=>void cancelQueuedJob()} disabled={!!busy}><XCircle/>Cancel before host claim</button>:<p><ShieldCheck/>The host has already claimed this job. Cloud control cannot truthfully pretend to kill an executing local process; wait for its return while R212 shows the first-hand host result.</p>}</section>}
  {currentMission&&<section className='r237-mission-control'><header><ShieldCheck/><span><small>CURRENT GOVERNED MISSION</small><b>{currentMission.status} · {short(currentMission.id,42)}</b><em>cycle {Number(currentMission.cycle||0)}/{Number(currentMission.maxCycles||0)||'—'} · current job {missionJob?.status||'unknown'}</em></span></header><div className='r237-mission-actions'>{String(currentMission.status).toUpperCase()==='PAUSED'?<button onClick={()=>void controlMission('resume')} disabled={!!busy}><Play/>Resume</button>:<button onClick={()=>void controlMission('pause')} disabled={!!busy}><PauseCircle/>Pause after current boundary</button>}{String(missionJob?.status||'').toUpperCase()==='QUEUED'&&<button className='danger' onClick={()=>void controlMission('cancel')} disabled={!!busy}><XCircle/>Cancel queued mission</button>}</div>{String(missionJob?.status||'').toUpperCase()==='RUNNING'&&<p><TriangleAlert/>Mission pause does not force-kill a RUNNING native job. It holds later mission progression; the current host process must return its own proof packet.</p>}</section>}
  <footer><ShieldCheck/><span>R237 adds operator access and runtime admission hardening, not a second executor. One device gets at most one QUEUED/RUNNING job, mission-control writes require the bridge secret, queued jobs can be cancelled before host claim, and running local work is never falsely reported as remotely killed. R141/R146/R147/R125 authority remains unchanged.</span></footer>
 </section>;
}
