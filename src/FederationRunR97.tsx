import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Download,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import './federationRunR97.css';

type Props={onDownloadLauncher:()=>void;paired:boolean};
const age=(n:number|null|undefined)=>{if(!n)return'none recorded';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago`};
const tone=(state:string)=>state==='LIVE'||state==='PC_ONLINE'||state==='RCWA_ONLINE'?'pass':state.includes('PREVIOUSLY')||state.includes('PAIRED')?'history':'hold';

export default function FederationRunR97({onDownloadLauncher,paired}:Props){
 const[data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{setBusy(true);try{const r=await api.get<any>('/api/federation/run/status');setData(r.data);setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),10000);return()=>window.clearInterval(id)},[]);
 const nodes=data?.nodes||{},runtime=data?.runtime||{},steps=useMemo(()=>[
  {label:'OMEGAv6',state:nodes.omegaV6?.state||'CHECKING',detail:'Canonical control, queue and durable proof authority'},
  {label:'Genesis',state:nodes.genesis?.state||'CHECKING',detail:nodes.genesis?.jsonVerified?'Machine-readable discovery health verified':'Discovery health not yet verified'},
  {label:'Optical',state:nodes.optical?.state||'CHECKING',detail:nodes.optical?.state==='ACCESS_GATED'?'Protected endpoint still needs a server-held service token':'Scalar screening / ranking health'},
  {label:'Sovereign PC',state:nodes.sovereign?.state||'CHECKING',detail:runtime?.pairing?.lastAuthenticatedProof?`Last authenticated proof ${age(runtime.pairing.lastAuthenticatedProof)}`:'No authenticated host proof in this bridge'},
  {label:'RCWA worker',state:nodes.sovereign?.rcwaState||'CHECKING',detail:(runtime?.rcwa?.workers||[]).length?`${runtime.rcwa.workers.length} registered worker record(s)`:'NumPy + grcwa process not yet registered'}
 ],[data]);
 const receipts=[...(runtime?.rcwa?.lastJobs||[])].reverse().slice(0,5);
 return <section className='r97-federation'>
  <header><div><span>FEDERATION RUN · ONE CLOSED PROOF LOOP</span><h3>Genesis → Optical → Sovereign RCWA → OMEGAv6 admission</h3><p>Every node reports current reachability separately from durable historical proof. An offline PC no longer erases the fact that it paired successfully.</p></div><div><button onClick={()=>void load()} disabled={busy}><RefreshCw/>{busy?'Checking…':'Refresh all'}</button><button className='primary-action' onClick={onDownloadLauncher} disabled={!paired}><Download/>Download federation launcher</button></div></header>
  {error&&<div className='r97-federation-error'><TriangleAlert/>{error}</div>}
  <div className='r97-federation-nodes'>{steps.map((step,index)=><article key={step.label} className={tone(step.state)}><span>0{index+1}</span>{tone(step.state)==='pass'?<CheckCircle2/>:<TriangleAlert/>}<div><b>{step.label}</b><strong>{step.state.replaceAll('_',' ')}</strong><small>{step.detail}</small></div></article>)}</div>
  <div className='r97-federation-ledger'><section><b>Durable continuity</b><strong>{runtime?.continuity?.state||'CHECKING'}</strong><small>{runtime?.continuity?.projectCount||0} project record(s) · {runtime?.continuity?.receiptSha256?`receipt ${runtime.continuity.receiptSha256.slice(0,18)}…`:'receipt pending'}</small></section><section><b>Full-wave receipts</b><strong>{receipts.length?`${receipts.length} RECENT`:'NONE YET'}</strong><small>{receipts.length?receipts.map((x:any)=>`${x.status}:${String(x.resultSha256||x.id).slice(0,10)}`).join(' · '):'A receipt appears only after an authenticated RCWA handoff returns.'}</small></section><section><b>Remaining gate</b><strong>{nodes.optical?.state==='ACCESS_GATED'?'OPTICAL SERVICE ACCESS':'RUN THE LOOP'}</strong><small>{nodes.optical?.state==='ACCESS_GATED'?'Bind a server-only Optical health/screen token in OMEGAv6; never expose it to the browser.':'Queue one proof-admissible candidate when both Optical and RCWA are live.'}</small></section></div>
  <footer><ShieldCheck/>A federation run is complete only when the source packet, screening decision, RCWA result hash and admission/HOLD decision share one lineage.</footer>
 </section>
}
