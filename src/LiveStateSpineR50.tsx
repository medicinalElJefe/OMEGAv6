import {useEffect,useMemo,useState} from 'react';
import {Activity,CheckCircle2,CloudCog,Download,RefreshCw,ShieldAlert,ShieldCheck} from 'lucide-react';
import {api} from './platformAdapter';
import {compileLiveStateSpine,spineSummary,type LiveStateArtifact} from './liveStateSpineR50';
import './liveStateSpineR50.css';

function dl(data:any){const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='OMEGA_R50_LIVE_STATE_SPINE.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),700)}
export default function LiveStateSpineR50({record,frameHash,projectionView,operatorLedgerCount=0}:{record:any;frameHash?:string;projectionView?:string;operatorLedgerCount?:number}){
 const[status,setStatus]=useState<any>({}),[restore,setRestore]=useState<any>({}),[busy,setBusy]=useState(false),[last,setLast]=useState<number>(0);
 const refresh=async()=>{setBusy(true);try{const[s,r]=await Promise.all([api.get<any>('/api/status'),api.get<any>('/api/restoration')]);setStatus(s.data||{});setRestore(r.data||{});setLast(Date.now())}finally{setBusy(false)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),30000);return()=>window.clearInterval(id)},[]);
 const rows=useMemo(()=>compileLiveStateSpine(record,status,restore,{frameHash,projectionView,operatorLedgerCount}),[record,status,restore,frameHash,projectionView,operatorLedgerCount]);
 const summary=useMemo(()=>spineSummary(rows),[rows]);
 const healthy=summary.complete&&rows.every(x=>x.reality!=='UNAVAILABLE');
 return <section className='r50-spine'>
  <header><div><span>B015 REQUIRED LIVE-STATE CONTRACT · R50 CURRENT SUCCESSOR</span><h2>Live State Spine</h2><p>One reconciled view of canonical packet, cloud proof, provider state, projection state, execution boundary and self-monitor status.</p></div><div className='r50-spine-actions'><button onClick={()=>void refresh()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Refreshing':'Refresh'}</button><button onClick={()=>dl({schema:'OMEGA_R50_LIVE_STATE_SPINE',generatedAt:new Date().toISOString(),summary,rows})}><Download/>Receipt</button></div></header>
  <div className='r50-spine-kpis'><article><b>{summary.present}/{summary.required}</b><span>required states mapped</span></article><article><b>{summary.counts.CLOUD_LIVE||0}</b><span>cloud live</span></article><article><b>{summary.counts.SOURCE_LIVE||0}</b><span>source live</span></article><article><b>{summary.counts.BROWSER_LIVE||0}</b><span>browser live</span></article><article><b>{summary.counts.DEVICE_PROOF_REQUIRED||0}</b><span>device gated</span></article><article className={healthy?'pass':'hold'}><b>{healthy?'COHERENT':'BOUNDED'}</b><span>spine state</span></article></div>
  <div className='r50-spine-grid'>{rows.map((r:LiveStateArtifact)=><article key={r.file} data-reality={r.reality}><header>{r.reality==='DEVICE_PROOF_REQUIRED'||r.reality==='EXTERNAL_DEGRADED'||r.reality==='UNAVAILABLE'?<ShieldAlert/>:<CheckCircle2/>}<div><code>{r.file}</code><b>{r.label}</b></div><strong>{r.reality}</strong></header><p>{r.value}</p><small>{r.proof}</small><footer><CloudCog/><span>{r.authority}</span></footer></article>)}</div>
  <footer className='r50-spine-boundary'><ShieldCheck/><span>{summary.boundary}</span><em>{last?`Last reconciled ${new Date(last).toLocaleTimeString()}`:'Awaiting first cloud reconciliation'}</em></footer>
 </section>
}
