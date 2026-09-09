import {useMemo} from 'react';
import {GitBranch,History,RefreshCw,Route,ShieldCheck,TriangleAlert,Waypoints} from 'lucide-react';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import './hybridWovenContinuityR238.css';

export const WOVEN_CONTINUITY_OPERATOR_R238='partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition' as const;
export const WOVEN_CONTINUITY_BOUNDARY_R238='R238 applies Woven Continuity to software observation, execution correlation and proof lineage. Atlas resolution labels are representational/address levels, not literal physical dimensions.' as const;
const TERMINAL=new Set(['COMPLETE','DONE','FAILED','CANCELLED']);
const ACTIVE=new Set(['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']);
const short=(v:any,n=26)=>{const s=String(v||'');return s?s.length>n?`${s.slice(0,n)}…`:s:'—'};
const age=(n:any)=>{const t=Number(n)||0;if(!t)return'—';const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};

export default function HybridWovenContinuityR238(){
 const{hybrid,device,selectedDeviceId,selectedDeviceJobs,missionEntries,currentMission,currentMissionJob,observedAt,epoch,stale,error,refresh,targetForMission}=useHybridRuntimeSnapshotR238();
 const terminalReturns=useMemo(()=>selectedDeviceJobs.filter((job:any)=>TERMINAL.has(String(job?.status||'').toUpperCase())&&job?.returnPacket).sort((a:any,b:any)=>Number(b?.completedAt||b?.returnPacket?.receivedAt||0)-Number(a?.completedAt||a?.returnPacket?.receivedAt||0)),[selectedDeviceJobs]);
 const latestReturn=terminalReturns[0]||null;
 const activeJobs=useMemo(()=>selectedDeviceJobs.filter((job:any)=>['QUEUED','RUNNING'].includes(String(job?.status||'').toUpperCase())),[selectedDeviceJobs]);
 const foreignActiveCount=useMemo(()=>missionEntries.filter(({mission,job})=>ACTIVE.has(String(mission?.status||'').toUpperCase())&&targetForMission(mission,job)!==selectedDeviceId).length,[missionEntries,selectedDeviceId,targetForMission]);
 const heartbeat=Boolean(epoch>0&&!stale&&hybrid?.nativeExecutionClaimed===true&&device?.online&&!device?.revoked);
 const missionTarget=currentMission?targetForMission(currentMission,currentMissionJob):'';
 const continuityLocked=Boolean(heartbeat&&device&&(!currentMission||missionTarget===device.id)&&activeJobs.every((job:any)=>job.targetDeviceId===device.id));
 const state=stale?'HELD_STALE_EPOCH':continuityLocked?'WOVEN_CONTINUITY_LOCKED':device?'PARTIAL_HOST_FRAME':'DEVICE_PROOF_REQUIRED';
 const recoverablePath=[
  'R134_WOVEN_RELATIVITY',
  `R238_EPOCH_${epoch||0}`,
  `HOST_${selectedDeviceId||'NONE'}`,
  currentMission?.id?`MISSION_${currentMission.id}`:'MISSION_NONE',
  currentMissionJob?.id?`JOB_${currentMissionJob.id}`:'JOB_NONE',
  latestReturn?.returnPacket?.resultFingerprint?`RETURN_${latestReturn.returnPacket.resultFingerprint}`:'RETURN_NONE',
  'R141_EXACT_RETURN_CLOSURE','R146_HISTORY','R147_DISPATCH','R125_CANON_ADMISSION'
 ];
 return <section className='r238-woven-continuity' aria-label='R238 Woven Hybrid continuity' data-r238-woven-continuity={state} data-r238-woven-device={selectedDeviceId||'NONE'} data-r238-woven-epoch={epoch}>
  <header><div><span>R238 · WOVEN HYBRID CONTINUITY · FRAME-RELATIVE CARRY</span><h3>One host frame. One proof path. No continuity drift.</h3><p>{WOVEN_CONTINUITY_OPERATOR_R238}. The selected host is the current local frame; other hosts remain external context rather than implicit control targets. Observation, dispatch and return are different orientations over the same bounded structure, not separate synthetic worlds.</p></div><button onClick={()=>void refresh()}><RefreshCw/>Refresh shared frame</button></header>
  <div className='r238-woven-grid'>
   <article className={continuityLocked?'pass':'hold'}><Waypoints/><div><small>FRAME / PARTITION</small><b>{state}</b><span>whole: Hybrid operational frame · part: {device?.name||selectedDeviceId||'unproved host'} · epoch {epoch} · observed {age(observedAt)}</span></div></article>
   <article className={currentMission?'pass':'neutral'}><Route/><div><small>EXCHANGE / TRANSFORM</small><b>{currentMission?`${currentMission.status} · ${short(currentMission.id)}`:'NO ACTIVE SELECTED-HOST MISSION'}</b><span>{currentMissionJob?`job ${short(currentMissionJob.id)} · ${currentMissionJob.status}`:'no selected-host mission transform in flight'}</span></div></article>
   <article className={latestReturn?'pass':'neutral'}><History/><div><small>SCAR / HISTORY CARRY</small><b>{latestReturn?`${terminalReturns.length} SELECTED-HOST RETURN${terminalReturns.length===1?'':'S'}`:'NO RETURN CARRIED YET'}</b><span>{latestReturn?`latest fingerprint ${short(latestReturn.returnPacket?.resultFingerprint,34)}`:'history remains empty rather than fabricated'}</span></div></article>
   <article className='pass'><GitBranch/><div><small>ORIENTATION CHANNELS</small><b>+1 DISPATCH · 0 OBSERVE · -1 RETURN</b><span>structure is preserved while direction changes; orientation is not confused with truth or authority</span></div></article>
  </div>
  <div className='r238-woven-carry'>
   <section><ShieldCheck/><div><small>INVARIANT CARRY</small><b>device identity · snapshot epoch · capability proof · authority boundaries</b><span>R237 command admission, R141 exact return closure, R146 history, R147 executor/dispatch authority and R125 admission authority remain distinct and unchanged.</span></div></section>
   <section className={foreignActiveCount?'hold':'pass'}>{foreignActiveCount?<TriangleAlert/>:<ShieldCheck/>}<div><small>RE-CONTEXTUALIZE</small><b>{foreignActiveCount?`${foreignActiveCount} FOREIGN ACTIVE MISSION${foreignActiveCount===1?'':'S'} ISOLATED`:'NO FOREIGN ACTIVE MISSION LEAKAGE'}</b><span>changing host selection repartitions the view; it does not merge another host's job or mission into this frame.</span></div></section>
  </div>
  <div className='r238-woven-path'><small>RECOVERABLE PATH</small><code>{recoverablePath.join(' → ')}</code></div>
  <footer><ShieldCheck/><span>{WOVEN_CONTINUITY_BOUNDARY_R238} Woven continuity here is a software lineage/correlation law. It does not claim physical causality, solver validity, native execution without heartbeat proof, scientific truth, federation closure, or CanonState mutation.</span></footer>
  {error&&<div className='r238-woven-error'><TriangleAlert/>{error}</div>}
 </section>;
}
