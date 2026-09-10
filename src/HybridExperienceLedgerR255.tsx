import {useEffect,useMemo,useState} from 'react';
import {Activity,Download,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import './hybridExperienceLedgerR255.css';

type Ledger={ok:boolean;schema:string;revision:string;generatedAt:number;cloudHeadSha?:string|null;currentAuthenticatedHeartbeat?:boolean;aggregate?:any;runs?:any[];devices?:any[];truthBoundary?:string};
const ACTIVE=new Set(['QUEUED','RUNNING','ACTIVE','PENDING','PAUSED']);
const age=(n:any)=>{const t=Number(n)||0;if(!t)return'—';const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?`${s}s`:s<3600?`${Math.floor(s/60)}m`:`${Math.floor(s/3600)}h`};
const ms=(n:any)=>{const v=Number(n);if(!Number.isFinite(v))return'—';return v<1000?`${Math.round(v)} ms`:v<60000?`${(v/1000).toFixed(1)} s`:`${(v/60000).toFixed(1)} m`};

export default function HybridExperienceLedgerR255(){
 const[data,setData]=useState<Ledger|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const refresh=async()=>{if(busy)return;setBusy(true);try{const r=await api.get<Ledger>('/api/hybrid/experience-ledger?limit=250');setData(r.data);setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>{if(document.visibilityState==='visible')void refresh()},5000);return()=>window.clearInterval(id)},[]);
 const runs=Array.isArray(data?.runs)?data!.runs:[],aggregate=data?.aggregate||{};
 const active=useMemo(()=>runs.filter((r:any)=>ACTIVE.has(String(r?.status||'').toUpperCase())),[runs]);
 const recent=useMemo(()=>runs.slice(0,12),[runs]);
 const operations=Array.isArray(aggregate.operations)?aggregate.operations.slice(0,10):[];
 const exportJson=()=>{if(!data)return;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`omega-r255-hybrid-ledger-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)};
 return <section className='r255-ledger' data-r255-heartbeat={data?.currentAuthenticatedHeartbeat?'CURRENT':'UNPROVED'}>
  <header><div><span>R255 · AUTHENTICATED HYBRID EXPERIENCE LEDGER</span><h3>Turn repeated PC runs into longitudinal execution evidence.</h3><p>Read-only, sanitized telemetry over already-returned Hybrid job/mission history. It tracks operation outcomes, timing, repeated failure signatures and mutation/build/test/package evidence without exposing bridge secrets, raw device IDs, paths or logs.</p></div><div className={data?.currentAuthenticatedHeartbeat?'r255-live pass':'r255-live hold'}><Activity/><span><b>{data?.currentAuthenticatedHeartbeat?'CURRENT AUTHENTICATED HEARTBEAT':'HEARTBEAT NOT PROVED IN THIS EXPORT'}</b><small>{data?.cloudHeadSha?`head ${data.cloudHeadSha.slice(0,12)}…`:'source SHA not exposed by release evidence'}</small></span></div></header>
  {error&&<div className='r255-error'><TriangleAlert/><span>{error}</span></div>}
  <div className='r255-summary'>
   <article><small>RUNS</small><b>{aggregate.jobs??0}</b><em>{aggregate.terminalJobs??0} terminal</em></article>
   <article><small>SUCCESS</small><b>{aggregate.successfulJobs??0}</b><em>{aggregate.failedJobs??0} failed</em></article>
   <article><small>MUTATION RETURNS</small><b>{aggregate.mutationReturnedJobs??0}</b><em>{aggregate.mutationJobs??0} mutation jobs</em></article>
   <article><small>ACTIVE NOW</small><b>{active.length}</b><em>{data?.generatedAt?`sample ${age(data.generatedAt)} old`:'not sampled'}</em></article>
  </div>
  <div className='r255-columns'>
   <div><h4>Operation calibration</h4><div className='r255-table'><div className='head'><span>OP</span><span>N</span><span>PASS</span><span>P50</span><span>P95</span></div>{operations.map((op:any)=><div key={op.op}><span>{op.op}</span><span>{op.count}</span><span>{Math.round((Number(op.successRate)||0)*100)}%</span><span>{ms(op.p50DurationMs)}</span><span>{ms(op.p95DurationMs)}</span></div>)}</div></div>
   <div><h4>Latest returned / active jobs</h4><div className='r255-runs'>{recent.map((run:any,index:number)=><article key={run.jobId||index} className={ACTIVE.has(String(run.status).toUpperCase())?'active':''}><span><b>{run.status}</b><small>{run.action||run.stage||'Hybrid job'}</small></span><span><em>{run.steps?.map((s:any)=>s.op).filter(Boolean).join(' → ')||'no step proof yet'}</em><small>{run.executionDurationMs!=null?ms(run.executionDurationMs):run.startedAt?`started ${age(run.startedAt)} ago`:'queued'} · {run.deviceKey||'device withheld'}</small></span></article>)}</div></div>
  </div>
  {(aggregate.repeatedFailureSignatures||[]).length>0&&<div className='r255-repeat'><TriangleAlert/><span><b>Repeated failure fingerprints detected</b><small>{aggregate.repeatedFailureSignatures.slice(0,6).map((x:any)=>`${x.signature} ×${x.count}`).join(' · ')}</small></span></div>}
  <div className='r255-actions'><button onClick={()=>void refresh()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Refreshing':'Refresh ledger'}</button><button onClick={exportJson} disabled={!data}><Download/>Export sanitized JSON</button></div>
  <footer><ShieldCheck/><span>{data?.truthBoundary||'R255 has observation/export authority only. It cannot dispatch, mutate, merge, deploy, replay execution or admit CanonState.'}</span></footer>
 </section>;
}
