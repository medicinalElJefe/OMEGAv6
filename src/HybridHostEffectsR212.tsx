import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Cpu,FileCheck2,FolderOutput,RefreshCw,ShieldCheck,TriangleAlert,Wrench} from 'lucide-react';
import {api} from './platformAdapter';
import './hybridHostEffectsR212.css';

const TERMINAL=new Set(['COMPLETE','DONE','FAILED','CANCELLED']);
const MUTATION_OPS=new Set(['APPLY_PATCH','WRITE_TEXT']);
const OUTPUT_OPS=new Set(['PACKAGE','SUPPORT_BUNDLE','TRAIN_LOCAL','SCREEN_CAPTURE','RECORD_MACRO','FORENSIC_HASH_LEDGER']);
const terminal=(v:any)=>TERMINAL.has(String(v||'').toUpperCase());
const short=(v:any,n=18)=>{const s=String(v||'');return s?s.length>n?`${s.slice(0,n)}…`:s:'—'};
const age=(n:any)=>{const t=Number(n)||0;if(!t)return'—';const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const uniq=(rows:any[])=>[...new Set(rows.filter(Boolean).map(x=>String(x)))];
const proofPath=(proof:any)=>proof?.result?.path||proof?.result?.ledgerPath||proof?.result?.macroPath||proof?.result?.backupPath||null;

export default function HybridHostEffectsR212(){
 const[hybrid,setHybrid]=useState<any>(null),[missions,setMissions]=useState<any[]>([]),[selectedId,setSelectedId]=useState(''),[error,setError]=useState(''),[observedAt,setObservedAt]=useState(0);
 const refresh=async()=>{try{const[h,m]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')]);setHybrid(h.data||{});setMissions(Array.isArray(m.data?.missions)?m.data.missions:[]);setObservedAt(Date.now());setError('')}catch(e:any){setError(e?.message||String(e))}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),3000);return()=>window.clearInterval(id)},[]);
 const jobs=useMemo(()=>Array.isArray(hybrid?.jobs)?[...hybrid.jobs]:[],[hybrid]);
 const currentMission=useMemo(()=>missions.find(m=>['ACTIVE','PAUSED'].includes(String(m?.status||'').toUpperCase()))||missions[0]||null,[missions]);
 const currentJob=useMemo(()=>currentMission?.currentJob||jobs.find(j=>j.id===currentMission?.currentJobId)||null,[currentMission,jobs]);
 const terminalJobs=useMemo(()=>jobs.filter(j=>terminal(j?.status)).sort((a,b)=>Number(b?.completedAt||b?.returnPacket?.receivedAt||b?.queuedAt||0)-Number(a?.completedAt||a?.returnPacket?.receivedAt||a?.queuedAt||0)).slice(0,8),[jobs]);
 useEffect(()=>{if(!selectedId&&terminalJobs[0]?.id)setSelectedId(terminalJobs[0].id);else if(selectedId&&!terminalJobs.some(j=>j.id===selectedId)&&terminalJobs[0]?.id)setSelectedId(terminalJobs[0].id)},[terminalJobs,selectedId]);
 const selectedJob=terminalJobs.find(j=>j.id===selectedId)||null;
 const packet=selectedJob?.returnPacket||null;
 const proofs=Array.isArray(packet?.stepProofs)?packet.stepProofs:[];
 const mutations=proofs.filter((p:any)=>p?.ok===true&&MUTATION_OPS.has(String(p?.op||'').toUpperCase()));
 const outputProofs=proofs.filter((p:any)=>p?.ok===true&&OUTPUT_OPS.has(String(p?.op||'').toUpperCase()));
 const outputs=uniq([...(Array.isArray(packet?.outputPaths)?packet.outputPaths:[]),...(Array.isArray(selectedJob?.outputPaths)?selectedJob.outputPaths:[]),...outputProofs.map((p:any)=>proofPath(p))]);
 const currentMissionState=String(currentMission?.status||'IDLE').toUpperCase(),currentJobState=String(currentJob?.status||'IDLE').toUpperCase();
 const missionRunning=Boolean(currentMission&&['ACTIVE','PAUSED'].includes(currentMissionState)&&!terminal(currentJobState));
 const currentDevices=Array.isArray(hybrid?.devices)?hybrid.devices.filter((d:any)=>d?.online&&!d?.revoked):[];
 const pcOnline=Boolean(hybrid?.nativeExecutionClaimed===true&&currentDevices.length);
 const mutationLabel=!selectedJob?'NO RETURN SELECTED':mutations.length?`${mutations.length} SOURCE MUTATION${mutations.length===1?'':'S'} PROVED`:'NO SOURCE MUTATION IN THIS RETURN';
 return <section className='r212-host-effects' aria-label='R212 live Hybrid host effects' data-r212-host-effects='FIRST_HAND_RETURN_ONLY'>
  <header><div><span>R212 · LIVE HOST EFFECTS · CURRENT MISSION ≠ HISTORICAL RETURN</span><h3>What actually happened on this PC?</h3><p>OMEGA now separates the job that is running now from older returned jobs and shows the exact host-returned steps, source mutations, generated output paths and failure text. COMPLETE means a bounded host job returned successfully; it does not mean source files changed unless APPLY_PATCH or WRITE_TEXT returned proof.</p></div><button onClick={()=>void refresh()}><RefreshCw/>Refresh</button></header>
  <div className='r212-live-strip'>
   <article className={pcOnline?'pass':'hold'}>{pcOnline?<CheckCircle2/>:<TriangleAlert/>}<span><small>PC HEARTBEAT</small><b>{pcOnline?'CURRENT / AUTHENTICATED':'NOT CURRENTLY PROVED'}</b><em>{currentDevices[0]?.name||'paired host'} · observed {age(observedAt)}</em></span></article>
   <article className={missionRunning?'running':currentMissionState==='COMPLETE'?'pass':'hold'}><Cpu/><span><small>CURRENT MISSION</small><b>{currentMissionState}</b><em>{currentMission?.stage||'no stage'} · cycle {Number(currentMission?.cycle||0)}/{Number(currentMission?.maxCycles||0)||'—'}</em></span></article>
   <article className={currentJobState==='RUNNING'?'running':terminal(currentJobState)?'pass':'hold'}><Wrench/><span><small>CURRENT HOST JOB</small><b>{currentJobState}</b><em>{short(currentJob?.id||currentMission?.currentJobId,24)}{currentJob?.projectPath?` · ${currentJob.projectPath}`:''}</em></span></article>
  </div>
  {missionRunning&&<div className='r212-current-warning'><TriangleAlert/><span><b>The current mission is still executing.</b><small>A COMPLETE card below can be an older returned cycle. Do not expect new source changes from the current cycle until this current job returns and its exact step proofs are visible here.</small></span></div>}
  {error&&<div className='r212-error'><TriangleAlert/>{error}</div>}
  <div className='r212-return-picker' aria-label='Recent terminal Hybrid returns'>{terminalJobs.map(j=><button key={j.id} className={selectedId===j.id?'active':''} onClick={()=>setSelectedId(j.id)}><span><b>{j.status}</b><small>{short(j.id,22)}</small></span><em>{age(j.completedAt||j.returnPacket?.receivedAt)}</em></button>)}{!terminalJobs.length&&<span className='empty'>No returned host job is available yet.</span>}</div>
  {selectedJob&&<div className='r212-effect-grid'>
   <section className={mutations.length?'mutated':'neutral'}><header><FileCheck2/><span><small>SELECTED RETURN · SOURCE EFFECT</small><b>{mutationLabel}</b></span></header>{mutations.length?<div className='r212-mutations'>{mutations.map((p:any,i:number)=>{const r=p?.result||{};return <article key={`${p.id||p.op}-${i}`}><b>{p.op} · {r.path||'returned path'}</b><code>before {short(r.beforeSha256,16)} → after {short(r.afterSha256,16)}</code><small>{r.created?'created new file':'preimage-bound replacement'} · atomic={String(r.atomic===true)}{r.backupPath?` · backup ${r.backupPath}`:''}</small></article>})}</div>:<p className='r212-neutral-copy'>This return did not prove APPLY_PATCH or WRITE_TEXT. Discovery, hashing, build, test and packaging can all complete without changing source. If a build already passes, R153 intentionally packages the verified project instead of inventing a repair.</p>}</section>
   <section><header><FolderOutput/><span><small>FILESYSTEM OUTPUTS</small><b>{outputs.length?`${outputs.length} RETURNED PATH${outputs.length===1?'':'S'}`:'NO EXPLICIT OUTPUT PATH'}</b></span></header>{outputs.length?<div className='r212-output-list'>{outputs.map(path=><code key={path}>{path}</code>)}</div>:<p>No package, support bundle, training index, screen capture, macro or forensic ledger path was returned by this selected job.</p>}</section>
  </div>}
  {selectedJob&&<section className='r212-steps'><header><ShieldCheck/><span><small>EXACT HOST-RETURNED STEP PROOFS</small><b>{proofs.length} step{proofs.length===1?'':'s'} · fingerprint {short(packet?.resultFingerprint,22)}</b></span></header><div>{proofs.map((p:any,i:number)=>{const r=p?.result||{};return <article key={`${p.id||i}-${p.op}`} className={p?.ok===true?'pass':'fail'}><code>{p.id||String(i+1).padStart(2,'0')}</code><span><b>{p.op||'UNKNOWN'}</b><small>{p?.ok===true?'RETURNED OK':`FAILED · ${String(p?.error||'unknown host error').slice(0,260)}`}</small></span><em>{r.path||r.ledgerPath||r.macroPath||r.command?.join?.(' ')||r.treeSha256?.slice?.(0,16)||r.sha256?.slice?.(0,16)||r.exitCode===0?'verified return':''}</em></article>})}</div>{packet?.log&&<pre>{String(packet.log).slice(-6000)}</pre>}</section>}
  <footer><ShieldCheck/><span>R212 is read-only observation of existing Hybrid/Mission truth. It does not queue a job, mutate the PC, infer a source edit from build success, install dependencies, expand the approved root, or alter R141/R146/R147/R125 authority. Source mutation is shown only from returned APPLY_PATCH/WRITE_TEXT proof.</span></footer>
 </section>;
}
