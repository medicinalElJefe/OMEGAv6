import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Download,ExternalLink,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import {FEDERATION_NODE_ORDER_R102,FEDERATION_NODES_R102,federationFlowR102,federationNodeStateR102,federationToneR102,type FederationNodeKey} from './federation/federationExperienceR102';
import './federationRunR97.css';

type Props={onDownloadLauncher:()=>void;paired:boolean};
const age=(n:number|null|undefined)=>{if(!n)return'none recorded';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago`};

export default function FederationRunR97({onDownloadLauncher,paired}:Props){
 const[data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{setBusy(true);try{const r=await api.get<any>('/api/federation/run/status');setData(r.data);setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),10000);return()=>window.clearInterval(id)},[]);
 const nodes=data?.nodes||{},runtime=data?.runtime||{},flow=useMemo(()=>federationFlowR102(nodes,runtime),[data]);
 const rows=useMemo(()=>FEDERATION_NODE_ORDER_R102.map((key:FederationNodeKey)=>{
  const spec=FEDERATION_NODES_R102[key],state=federationNodeStateR102(key,nodes),tone=federationToneR102(state);
  const detail=key==='sovereign'
   ?`${state.replaceAll('_',' ')} · ${String(nodes?.sovereign?.rcwaState||'RCWA CHECKING').replaceAll('_',' ')} · ${runtime?.pairing?.lastAuthenticatedProof?`last host proof ${age(runtime.pairing.lastAuthenticatedProof)}`:'no current host proof'}`
   :key==='genesis'&&nodes?.genesis?.jsonVerified?`${state.replaceAll('_',' ')} · machine-readable health verified`
   :key==='optical'&&nodes?.optical?.resolvedUrl?`${state.replaceAll('_',' ')} · ${nodes.optical.resolvedUrl}`
   :state.replaceAll('_',' ');
  return{key,spec,state,tone,detail};
 }),[data]);
 const receipts=[...(runtime?.rcwa?.lastJobs||[])].reverse().slice(0,5),counts=runtime?.rcwa?.counts||{};
 return <section className='r97-federation r102-federation-instrument'>
  <header><div><span>FEDERATION INSTRUMENT · R102 CAPABILITY FABRIC</span><h3>One OMEGA experience · four specialized runtimes</h3><p>The user works with one project, one packet lineage and one proof language. Genesis proposes, Optical screens, Sovereign computes, and OMEGAv6 admits. The sites remain independently evolvable, but their roles no longer compete for authority.</p></div><div><button onClick={()=>void load()} disabled={busy}><RefreshCw/>{busy?'Checking…':'Refresh fabric'}</button><button className='primary-action' onClick={onDownloadLauncher} disabled={!paired}><Download/>Sovereign launcher</button></div></header>
  {error&&<div className='r97-federation-error'><TriangleAlert/>{error}</div>}

  <div className='r102-flow' aria-label='Federation handoff sequence'>{['PROPOSE','SCREEN','SOLVE','ADMIT'].map((stage,index)=><div key={stage} className={flow.stage===stage?'active':''}><span>0{index+1}</span><b>{stage}</b></div>)}</div>

  <section className='r102-current-gate'><div><span>CURRENT HANDOFF</span><strong>{flow.gate.replaceAll('_',' ')}</strong><p>{flow.summary}</p></div><div><span>NEXT USEFUL ACTION</span><p>{flow.action}</p></div></section>

  <div className='r97-federation-nodes r102-four-nodes'>{rows.map((row,index)=><article key={row.key} className={row.tone}>
   <div className='r102-node-head'><span>0{index+1}</span><i>{row.spec.verb}</i>{row.tone==='ready'?<CheckCircle2/>:<TriangleAlert/>}</div>
   <div className='r102-node-body'><div><b>{row.spec.label}</b><strong>{row.detail}</strong></div><p>{row.spec.role}</p><small>{row.spec.value}</small></div>
   <dl><div><dt>IN</dt><dd>{row.spec.input}</dd></div><div><dt>OUT</dt><dd>{row.spec.output}</dd></div></dl>
   <footer><span>{row.spec.truth}</span>{row.spec.url&&<a href={row.spec.url} target='_blank' rel='noreferrer'>Open node<ExternalLink/></a>}</footer>
  </article>)}</div>

  <div className='r97-federation-ledger r102-ledger'><section><b>Durable project continuity</b><strong>{runtime?.continuity?.state||'CHECKING'}</strong><small>{runtime?.continuity?.projectCount||0} project record(s) · {runtime?.continuity?.receiptSha256?`receipt ${runtime.continuity.receiptSha256.slice(0,18)}…`:'receipt pending'}</small></section><section><b>Full-wave execution</b><strong>{Number(counts.running||0)} RUNNING · {Number(counts.queued||0)} QUEUED</strong><small>{receipts.length?receipts.map((x:any)=>`${x.status}:${String(x.resultSha256||x.id).slice(0,10)}`).join(' · '):'No returned full-wave receipt yet. A result becomes admissible evidence only after solver identity, convergence and lineage return.'}</small></section><section><b>Authority boundary</b><strong>ONE GLOBAL CANONSTATE</strong><small>Genesis may keep node-local working state; Optical and Sovereign return packets. Only OMEGAv6 admits a federation result into global CanonState unless a governed migration explicitly changes that authority.</small></section></div>

  <footer className='r102-federation-truth'><ShieldCheck/>Advanced behavior comes from correlated specialization, not from making four sites imitate one another. Every handoff must preserve project, packet, atlas address, evidence class, scar/history, solver identity and proof lineage.</footer>
 </section>
}
