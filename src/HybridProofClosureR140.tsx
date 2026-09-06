import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,History,RefreshCw,RotateCcw,ShieldAlert,ShieldCheck} from 'lucide-react';
import {api} from './platformAdapter';
import './hybridProofR140.css';

type Job={id:string;status:string;queuedAt?:number;completedAt?:number;targetDeviceId?:string;targetCapabilityRevision?:string;projectPath?:string;returnPacket?:{receivedAt?:number;resultFingerprint?:string};proofClosure?:{schema?:string;state?:string;fingerprintVerified?:boolean;finalHeadSha256?:string;continuity?:{headSha256?:string;count?:number;scarCount?:number;proofCount?:number};canonicalMutation?:boolean}};
type Replay={ok:boolean;headMatch:boolean;fingerprintMatch:boolean;originalHeadSha256:string;replayedHeadSha256:string;replayedAt:number;canonicalMutation:false;canonicalAdmissionAuthority:'R125'};
type Closure={schema:string;revision?:string;state:string;jobId:string;fingerprint:{supplied?:string|null;expected?:string|null;verified:boolean;digestMatch?:boolean;semanticMatch?:boolean;legacyAuthority?:string};finalHeadSha256:string;previousHeadSha256?:string|null;continuity?:{headSha256?:string;count?:number;scarCount?:number;proofCount?:number};hybridProofAtClose?:{currentHeartbeatProved?:boolean;deviceId?:string;capabilityRevision?:string};canonicalMutation:false;canonicalAdmissionAuthority:'R125';lastReplayReceipt?:Replay;replayCount?:number;truthBoundary?:string};
const fmt=(n?:number)=>n?new Date(n).toLocaleTimeString():'';
const short=(s?:string|null,n=12)=>s?`${s.slice(0,n)}…`:'—';

export default function HybridProofClosureR140(){
 const[status,setStatus]=useState<any>(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[selected,setSelected]=useState(''),[closure,setClosure]=useState<Closure|null>(null),[replay,setReplay]=useState<Replay|null>(null);
 const refresh=async()=>{setBusy(x=>x||'refresh');try{const r=await api.get<any>('/api/hybrid/status');setStatus(r.data);setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(x=>x==='refresh'?'':x)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),5000);return()=>window.clearInterval(id)},[]);
 const jobs=useMemo<Job[]>(()=>Array.isArray(status?.jobs)?[...status.jobs].filter((j:Job)=>['COMPLETE','FAILED'].includes(j.status)).sort((a:Job,b:Job)=>Number(b.completedAt||b.queuedAt||0)-Number(a.completedAt||a.queuedAt||0)).slice(0,8):[],[status]);
 useEffect(()=>{if(!selected&&jobs[0]?.id)setSelected(jobs[0].id)},[jobs,selected]);
 const inspect=async(id:string)=>{setSelected(id);setBusy('inspect:'+id);setReplay(null);try{const r=await api.get<any>(`/api/hybrid/jobs/${encodeURIComponent(id)}/closure`);setClosure(r.data?.closure||null);setError('')}catch(e:any){setClosure(null);setError(e?.message||String(e))}finally{setBusy('')}};
 const verifyReplay=async(id:string)=>{setSelected(id);setBusy('replay:'+id);try{const r=await api.post<any>(`/api/hybrid/jobs/${encodeURIComponent(id)}/replay`,{});setReplay(r.data?.receipt||null);setError('');await inspect(id)}catch(e:any){setError(e?.message||String(e));setReplay((e?.payload as any)?.receipt||null);setBusy('')}};
 const online=Boolean(status?.nativeExecutionClaimed===true&&Array.isArray(status?.devices)&&status.devices.some((d:any)=>d?.online===true&&d?.revoked!==true));
 return <section className='r140-proof-ledger' aria-label='Hybrid execution proof closure and replay'>
  <header><div><span>R140 · PC WORKLOAD → PROOF → SCAR → REPLAY</span><h3>Execution proof closure</h3><p>Returned bounded PC work is exact-payload fingerprint-verified, appended as R134 evidence/scar continuity, framed by R136, and replay-checked without replacing R139 capability routing or promoting CanonState.</p></div><button onClick={()=>void refresh()} disabled={busy==='refresh'}><RefreshCw className={busy==='refresh'?'spin':''}/>Refresh</button></header>
  <div className='r140-proof-summary'>
   <div className={online?'proved':'held'}>{online?<CheckCircle2/>:<ShieldAlert/>}<span><small>CURRENT PC HEARTBEAT</small><b>{online?'PROVED NOW':'NOT CURRENTLY PROVED'}</b><em>{status?.executionPlane||'execution plane unknown'}</em></span></div>
   <div><ShieldCheck/><span><small>RETURN AUTHORITY</small><b>HOST EVIDENCE · NOT CANONSTATE</b><em>R125 remains admission authority</em></span></div>
   <div><History/><span><small>RETURNED WORKLOADS</small><b>{jobs.length} RECENT COMPLETE / FAILED</b><em>{jobs.filter(j=>j.proofClosure?.fingerprintVerified===true).length} fingerprint-verified closure{jobs.filter(j=>j.proofClosure?.fingerprintVerified===true).length===1?'':'s'}</em></span></div>
  </div>
  {error&&<div className='r140-proof-error'><ShieldAlert/>{error}</div>}
  {jobs.length===0?<div className='r140-proof-empty'><History/><div><b>No returned bounded workload is available yet.</b><span>Connection proof and execution proof are separate. Queue a confirmed Hybrid job only when there is actual machine work to perform; R140 will close its returned packet automatically.</span></div></div>:
  <div className='r140-proof-grid'>{jobs.map(job=>{const p=job.proofClosure,active=selected===job.id;return <article key={job.id} className={active?'active':''}>
   <header><code>{job.id}</code><b>{job.status}</b></header>
   <dl><div><dt>fingerprint</dt><dd className={p?.fingerprintVerified?'ok':'hold'}>{p?.fingerprintVerified===true?'VERIFIED':p?'MISMATCH / HELD':'CLOSURE PENDING'}</dd></div><div><dt>continuity head</dt><dd>{short(p?.finalHeadSha256)}</dd></div><div><dt>device</dt><dd>{job.targetDeviceId||'—'}</dd></div><div><dt>returned</dt><dd>{fmt(job.completedAt||job.returnPacket?.receivedAt)}</dd></div></dl>
   <footer><button onClick={()=>void inspect(job.id)} disabled={Boolean(busy)}><ShieldCheck/>Inspect receipt</button><button onClick={()=>void verifyReplay(job.id)} disabled={Boolean(busy)||!p}><RotateCcw className={busy==='replay:'+job.id?'spin':''}/>Verify replay</button></footer>
  </article>})}</div>}
  {closure&&selected===closure.jobId&&<section className='r140-receipt'>
   <header><b>Closure receipt · {closure.jobId}</b><span className={closure.fingerprint.verified?'ok':'hold'}>{closure.state}</span></header>
   <div><span><small>supplied R140 fingerprint</small><code>{closure.fingerprint.supplied||'none'}</code></span><span><small>recomputed payload fingerprint</small><code>{closure.fingerprint.expected||'unavailable'}</code></span><span><small>semantic equality</small><code>{closure.fingerprint.semanticMatch?'MATCH':'NOT VERIFIED'} · digest {closure.fingerprint.digestMatch?'MATCH':'NOT VERIFIED'}</code></span><span><small>final R134 head</small><code>{closure.finalHeadSha256}</code></span><span><small>continuity counts</small><code>{closure.continuity?.count??0} events · {closure.continuity?.proofCount??0} proof · {closure.continuity?.scarCount??0} scar</code></span><span><small>legacy fingerprint authority</small><code>{closure.fingerprint.legacyAuthority||'LINEAGE ONLY'}</code></span></div>
   <footer><ShieldCheck/>canonicalMutation = false · admission authority = {closure.canonicalAdmissionAuthority} · current heartbeat at close = {closure.hybridProofAtClose?.currentHeartbeatProved?'proved':'not proved'}</footer>
  </section>}
  {replay&&<div className={replay.ok?'r140-replay ok':'r140-replay hold'}><RotateCcw/><span><b>{replay.ok?'DETERMINISTIC REPLAY VERIFIED':'REPLAY MISMATCH'}</b><small>fingerprint {replay.fingerprintMatch?'match':'mismatch'} · continuity head {replay.headMatch?'match':'mismatch'} · CanonState unchanged</small></span></div>}
 </section>
}
