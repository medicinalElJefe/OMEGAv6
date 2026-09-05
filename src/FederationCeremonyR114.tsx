import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Cpu,Link2,Play,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api,OmegaApiError} from './platformAdapter';
import './federationCeremonyR114.css';

type Props={intent:string;onDownloadLauncher:()=>void};
const fmt=(n:any)=>Number(n)?new Date(Number(n)).toLocaleString():'—';
const short=(v:any)=>String(v||'').slice(0,14)+(String(v||'').length>14?'…':'');
const tone=(state:string)=>/PROVED|ADMITTED|RETURNED|COMPLETE|SERVICE_OBSERVED/.test(state)?'ready':/HELD|FAILED|GATED|REQUIRED|WAITING/.test(state)?'hold':/QUEUED|RUNNING|OPEN/.test(state)?'working':'idle';
function stageState(run:any,stage:string){
 if(!run)return'NOT STARTED';
 if(stage==='PROPOSE'){if(run.proposal?.state)return run.proposal.state;if(run.block?.stage==='PROPOSE')return run.block.code||'WAITING';return'WAITING'}
 if(stage==='SCREEN'){if(run.screen?.state)return run.screen.state;if(run.block?.stage==='SCREEN')return run.block.code||'WAITING';return run.proposal?'WAITING':'PENDING'}
 if(stage==='SOLVE'){if(run.solve?.state)return run.solve.state;if(run.queue?.state)return run.queue.state;if(run.block?.stage==='SOLVE')return run.block.code||'WAITING';return run.screen?'WAITING':'PENDING'}
 return run.admission?.state||run.closure||'PENDING';
}
function receiptFor(run:any,stage:string){return stage==='PROPOSE'?run?.proposal?.receiptSha256:stage==='SCREEN'?run?.screen?.receiptSha256:stage==='SOLVE'?(run?.solve?.receiptSha256||run?.queue?.receiptSha256):run?.admission?.receiptSha256}

export default function FederationCeremonyR114({intent,onDownloadLauncher}:Props){
 const[data,setData]=useState<any>(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[errorCode,setErrorCode]=useState('');
 const load=async()=>{try{const r=await api.get<any>('/api/federation/ceremony/status');setData(r.data);setError('');setErrorCode('')}catch(e:any){setError(e?.message||String(e));setErrorCode(e?.code||'')}};
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),6000);return()=>window.clearInterval(id)},[]);
 const act=async(kind:'strict'|'host'|'reconcile')=>{if(busy)return;setBusy(kind);setError('');setErrorCode('');try{const r=kind==='strict'?await api.post<any>('/api/federation/ceremony/start',{intent:intent.trim()}):kind==='host'?await api.post<any>('/api/federation/ceremony/host-proof',{}):await api.post<any>('/api/federation/ceremony/reconcile',{});setData(r.data?.schema?.includes('STATUS')?r.data:(await api.get<any>('/api/federation/ceremony/status')).data)}catch(e:any){const oe=e as OmegaApiError;setError(oe.message);setErrorCode(oe.code||'');try{const r=await api.get<any>('/api/federation/ceremony/status');setData(r.data)}catch{}}finally{setBusy('')}};
 const run=data?.active||data?.runs?.[0]||null,stages=useMemo(()=>['PROPOSE','SCREEN','SOLVE','ADMIT'].map((stage,index)=>({stage,index,state:stageState(run,stage),receipt:receiptFor(run,stage)})),[run]);
 const full=run?.closure==='FULL_FEDERATION_PROVED',host=run?.closure==='HOST_EXECUTION_PROVED_ONLY',needsPc=errorCode==='CURRENT_RCWA_WORKER_REQUIRED'||run?.block?.code==='CURRENT_RCWA_WORKER_REQUIRED';
 return <section className='r114-ceremony' aria-label='R114 federation closure ceremony'>
  <header><div><span>R114 · RECEIPT-BEARING FEDERATION RUN</span><h4>Prove the handoffs, not just the topology.</h4><p>A strict run accepts closure only after service-observed Genesis and Optical receipts, a current authenticated Sovereign result return, and a chained OMEGAv6 admission receipt.</p></div><div className='r114-actions'><button onClick={()=>void act('strict')} disabled={!intent.trim()||Boolean(busy)}><Play/>{busy==='strict'?'Running…':'Run strict federation'}</button><button onClick={()=>void act('host')} disabled={Boolean(busy)}><Cpu/>{busy==='host'?'Queueing…':'Prove current PC with RCWA'}</button><button className='quiet' onClick={()=>void act('reconcile')} disabled={Boolean(busy)}><RefreshCw className={busy==='reconcile'?'spin':''}/>Reconcile</button></div></header>
  {error&&<div className='r114-error'><TriangleAlert/><div><b>{errorCode||'DEPENDENCY'}</b><span>{error}</span></div>{needsPc&&<button onClick={onDownloadLauncher}>Get Federation launcher</button>}</div>}
  <div className='r114-stage-grid'>{stages.map(x=><article key={x.stage} className={tone(x.state)}><div><span>0{x.index+1}</span>{tone(x.state)==='ready'?<CheckCircle2/>:tone(x.state)==='hold'?<TriangleAlert/>:<Link2/>}</div><b>{x.stage}</b><strong>{String(x.state).replaceAll('_',' ')}</strong><small>{x.receipt?`receipt ${short(x.receipt)}`:'receipt not established'}</small></article>)}</div>
  <div className='r114-run-state'><section><span>CEREMONY</span><b>{run?.ceremonyId||'No durable run yet'}</b><small>{run?`${run.kind} · opened ${fmt(run.createdAt)}`:'Enter an intent above, then start a strict federation run.'}</small></section><section><span>CLOSURE</span><b className={full||host?'good':''}>{String(run?.closure||'OPEN').replaceAll('_',' ')}</b><small>{full?'Full PROPOSE → SCREEN → SOLVE → ADMIT proof chain is closed.':host?'Current authenticated Sovereign execution is proved; Genesis/Optical were intentionally not claimed.':'OMEGA will stop at the first unproved dependency rather than synthesizing a receipt.'}</small></section><section><span>LAST BLOCK</span><b>{String(run?.block?.code||'NONE').replaceAll('_',' ')}</b><small>{run?.block?.observation?.httpStatus?`HTTP ${run.block.observation.httpStatus} · `:''}{run?.block?.observation?.url||'No unresolved dependency recorded.'}</small></section></div>
  <details><summary>Inspect receipt chain and durable replay</summary><div className='r114-ledger'><code>{run?.intentReceipt?.receiptSha256?`INTENT ${run.intentReceipt.receiptSha256}`:'INTENT —'}</code><code>{run?.proposal?.receiptSha256?`PROPOSE ${run.proposal.receiptSha256} · ${run.proposal.trust}`:'PROPOSE —'}</code><code>{run?.screen?.receiptSha256?`SCREEN ${run.screen.receiptSha256} · ${run.screen.trust}`:'SCREEN —'}</code><code>{run?.queue?.receiptSha256?`QUEUE ${run.queue.receiptSha256} · ${run.queue.jobId}`:'QUEUE —'}</code><code>{run?.solve?.receiptSha256?`SOLVE ${run.solve.receiptSha256} · ${run.solve.resultSha256||''}`:'SOLVE —'}</code><code>{run?.admission?.receiptSha256?`ADMIT ${run.admission.receiptSha256}`:'ADMIT —'}</code></div></details>
  <footer><ShieldCheck/><span><b>Truth boundary:</b> the bounded host-proof fixture may establish current PC/RCWA execution, but it cannot stand in for Genesis or Optical. Manual packets may be queued for debugging, but only service-observed upstream receipts can close the strict federation proof.</span></footer>
 </section>;
}
