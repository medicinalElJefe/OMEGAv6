import {Activity,Clock3,LoaderCircle,ShieldCheck,TriangleAlert} from 'lucide-react';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import './hybridExecutionMotionR243.css';

const ACTIVE=new Set(['QUEUED','RUNNING']);
const fmtMs=(v:number)=>{const s=Math.max(0,Math.floor(v/1000));if(s<60)return`${s}s`;const m=Math.floor(s/60),r=s%60;return`${m}m ${String(r).padStart(2,'0')}s`};
const age=(t:any)=>{const n=Number(t)||0;return n?fmtMs(Date.now()-n):'—'};

export default function HybridExecutionMotionR243(){
 const{selectedDeviceJobs,currentMission,currentMissionJob,epoch}=useHybridRuntimeSnapshotR238();
 const active=[...selectedDeviceJobs].reverse().find((j:any)=>ACTIVE.has(String(j?.status||'').toUpperCase()))||currentMissionJob||null;
 const status=String(active?.status||'IDLE').toUpperCase();
 const p=active?.progress||null,leaseUntil=Number(active?.leaseUntil||0),now=Date.now();
 const leaseLive=status==='RUNNING'&&leaseUntil>now&&p?.revision==='R243';
 const leaseExpired=status==='RUNNING'&&leaseUntil>0&&leaseUntil<=now;
 const legacyRunning=status==='RUNNING'&&!leaseUntil;
 const total=Math.max(0,Number(p?.totalSteps||active?.steps?.length||0)),completed=Math.max(0,Number(p?.completedSteps||0));
 const pct=total?Math.max(0,Math.min(100,Math.round(completed/total*100))):0;
 const state=leaseLive?'MOTION_PROVED':leaseExpired?'STALL_DETECTED':legacyRunning?'LEGACY_RUNNING_NO_LEASE':status==='QUEUED'?'QUEUED':status==='RUNNING'?'CLAIMED_STARTING':'IDLE';
 const missionStage=String(currentMission?.stage||'');
 return <section className='r243-motion' aria-label='R243 Hybrid execution motion' data-r243-motion={state} data-r243-job={active?.id||'NONE'} data-r243-epoch={epoch}>
  <header><div><span>R243 · HYBRID EXECUTION MOTION · AUTHENTICATED LEASE + STEP PROGRESS</span><h3>See what the selected PC is doing while it is doing it.</h3><p>A RUNNING label alone is no longer enough. R243 requires renewable host motion for new jobs and exposes the exact current allow-listed step, elapsed time and returned-step count. A lease proves only continued ownership/liveness of the running claim; final success still requires the normal R141 returned proof.</p></div><Activity/></header>
  <div className='r243-motion-grid'>
   <article className={leaseLive?'pass':status==='RUNNING'?'hold':'neutral'}>{leaseLive?<ShieldCheck/>:status==='RUNNING'?<LoaderCircle className='spin'/>:<Activity/>}<div><small>EXECUTION STATE</small><b>{state.replaceAll('_',' ')}</b><span>{active?.id||'No selected-host active job'}{missionStage?` · ${missionStage}`:''}</span></div></article>
   <article className={p?.stepOp?'pass':'neutral'}><Activity/><div><small>CURRENT STEP</small><b>{p?.stepOp||status}</b><span>{p?.stepId?`${p.stepId} · step ${Number(p.stepIndex||0)}/${total||'—'}`:'Waiting for the first authenticated step pulse'}</span></div></article>
   <article className={leaseLive?'pass':leaseExpired?'hold':'neutral'}><Clock3/><div><small>MOTION / LEASE</small><b>{p?`${fmtMs(Number(p.elapsedMs||0))} elapsed`:'No R243 pulse yet'}</b><span>{leaseLive?`last pulse ${age(p.at)} ago · lease ${fmtMs(leaseUntil-now)} remaining`:leaseExpired?`lease expired ${age(leaseUntil)} ago`:legacyRunning?'This job predates R243 motion; restart the current PC connector to recover it safely.':'No running lease required'}</span></div></article>
   <article className={total&&completed>=total?'pass':'neutral'}><ShieldCheck/><div><small>RETURNED STEP COUNT</small><b>{completed} / {total||'—'}</b><span>{total?`${pct}% of steps have crossed their local execution boundary`:'No active step plan'}</span></div></article>
  </div>
  {total>0&&<div className='r243-progress' role='progressbar' aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}><i style={{width:`${pct}%`}}/></div>}
  {(leaseExpired||legacyRunning)&&<div className='r243-motion-warning'><TriangleAlert/><span>{leaseExpired?'The Worker can no longer prove continued ownership of this RUNNING claim. R243 fails the stale claim closed and only auto-retries bounded non-mutating discovery after the authenticated agent polls again.':'RUNNING exists, but this legacy claim has no execution lease/progress protocol. Once the current connector is restarted, an old expired discovery claim can be replaced by bounded discovery rather than remaining permanently INVOKED.'}</span></div>}
  <footer><ShieldCheck/>R243 motion is observational control-plane evidence, not execution success. It does not kill a native process remotely, replay mutations, alter R141 exact-return closure, R146 history, R147 dispatch authority, R242 read-only navigation calculus, or R125 CanonState admission.</footer>
 </section>;
}
