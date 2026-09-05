import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Download,ExternalLink,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import {FEDERATION_NODE_ORDER_R102,FEDERATION_NODES_R102,federationFlowR102,federationNodeStateR102,federationToneR102,type FederationNodeKey} from './federation/federationExperienceR102';
import './federationRunR97.css';

type Props={onDownloadLauncher:()=>void;paired:boolean};
const age=(n:number|null|undefined)=>{if(!n)return'none recorded';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago`};
const stamp=(n:number|null|undefined)=>n?new Date(n).toLocaleString():'none recorded';
const nodeLabel=(id:string)=>id==='omega-genesis'?'Genesis':id==='omega-optical'?'Optical':id==='omega-sovereign'?'Sovereign':id==='omega-v6'?'OMEGAv6':id;

export default function FederationRunR97({onDownloadLauncher,paired}:Props){
 const[data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const[intent,setIntent]=useState(''),[routePlan,setRoutePlan]=useState<any>(null),[routeBusy,setRouteBusy]=useState(false);
 const load=async()=>{setBusy(true);try{const r=await api.get<any>('/api/federation/run/status');setData(r.data);setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 const routeIntent=async()=>{const q=intent.trim();if(!q||routeBusy)return;setRouteBusy(true);try{const r=await api.post<any>('/api/federation/route-intent',{intent:q});setRoutePlan(r.data);setError('')}catch(e:any){setRoutePlan(null);setError(e?.message||String(e))}finally{setRouteBusy(false)}};
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
 const receipts=[...(runtime?.rcwa?.lastJobs||[])].reverse().slice(0,5),counts=runtime?.rcwa?.counts||{},workers=runtime?.rcwa?.workers||[];
 const lastRcwaProof=workers.reduce((m:number,x:any)=>Math.max(m,Number(x?.lastSeen||0)),0)||null;
 const lastHostProof=runtime?.pairing?.lastAuthenticatedProof||null;
 return <section className='r97-federation r102-federation-instrument r103-task-first'>
  <header><div><span>FEDERATION INSTRUMENT · R103 TASK-FIRST CAPABILITY FABRIC</span><h3>Ask for an outcome · OMEGA chooses the machinery</h3><p>One project, one packet lineage, one proof language. Infrastructure remains inspectable, but ordinary use starts with intent rather than asking you to choose a cloud, solver or worker first.</p></div><div><button onClick={()=>void load()} disabled={busy}><RefreshCw/>{busy?'Checking…':'Refresh fabric'}</button><button className='primary-action' onClick={onDownloadLauncher} disabled={!paired}><Download/>Sovereign launcher</button></div></header>
  {error&&<div className='r97-federation-error'><TriangleAlert/>{error}</div>}

  <section className='r103-intent-router' aria-label='Task-first capability router'>
   <div className='r103-intent-entry'><span>WHAT DO YOU WANT OMEGA TO DO?</span><div><input value={intent} onChange={e=>setIntent(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void routeIntent()}} placeholder='e.g. generate better etched-light candidates and validate the strongest design'/><button className='primary-action' onClick={()=>void routeIntent()} disabled={!intent.trim()||routeBusy}>{routeBusy?'Routing…':'Resolve capability path'}</button></div><small>OMEGA invokes only the required specialist stages. Optional nodes remain optional.</small></div>
   <div className='r103-intent-result'><span>MINIMAL USEFUL PATH</span>{routePlan?.ok?<><strong>{routePlan.path}</strong><div className='r103-route-steps'>{(routePlan.steps||[]).map((step:any)=><i key={step.node} className={step.ready?'ready':'blocked'}>{step.verb} · {nodeLabel(step.node)}</i>)}</div><p>{routePlan.summary}</p><small>{routePlan.nextAction}</small></>:<><strong>INTENT → CAPABILITY ROUTING</strong><p>Describe the outcome. OMEGA will resolve the smallest required graph and expose the first real gate.</p></>}</div>
  </section>

  <div className='r102-flow' aria-label='Federation handoff sequence'>{['PROPOSE','SCREEN','SOLVE','ADMIT'].map((stage,index)=><div key={stage} className={flow.stage===stage?'active':''}><span>0{index+1}</span><b>{stage}</b></div>)}</div>
  <div className='r102-handoff-caption'><span>FULL FEDERATION CAPABILITY</span><b>Genesis → Optical → Sovereign Compute → OMEGAv6 admission</b><small>That full path is available when needed; R103 does not force unused stages into every task.</small></div>

  <section className='r102-current-gate'><div><span>CURRENT FABRIC GATE</span><strong>{flow.gate.replaceAll('_',' ')}</strong><p>{flow.summary}</p></div><div><span>NEXT USEFUL ACTION</span><p>{flow.action}</p></div></section>

  <div className='r97-federation-nodes r102-four-nodes'>{rows.map((row,index)=><article key={row.key} className={row.tone}>
   <div className='r102-node-head'><span>0{index+1}</span><i>{row.spec.verb}</i>{row.tone==='ready'?<CheckCircle2/>:<TriangleAlert/>}</div>
   <div className='r102-node-body'><div><b>{row.spec.label}</b><strong>{row.detail}</strong></div><p>{row.spec.role}</p><small>{row.spec.value}</small></div>
   <dl><div><dt>IN</dt><dd>{row.spec.input}</dd></div><div><dt>OUT</dt><dd>{row.spec.output}</dd></div></dl>
   <footer><span>{row.spec.truth}</span>{row.spec.url&&<a href={row.spec.url} target='_blank' rel='noreferrer'>Open node<ExternalLink/></a>}</footer>
  </article>)}</div>

  <section className='r102-proof-history' aria-label='Federation proof history'><div><span>LAST AUTHENTICATED PROOF</span><strong>{age(lastHostProof)}</strong><small>{stamp(lastHostProof)} · {runtime?.pairing?.historicalProofPresent?'historical proof retained':'no historical host proof retained'}</small></div><div><span>LAST FULL-WAVE HEARTBEAT</span><strong>{age(lastRcwaProof)}</strong><small>{stamp(lastRcwaProof)} · current ONLINE state still requires freshness, not history alone</small></div><div><span>BRIDGE CREATED</span><strong>{age(runtime?.pairing?.createdAt)}</strong><small>{stamp(runtime?.pairing?.createdAt)} · pairing history never substitutes for PC ONLINE</small></div></section>

  <div className='r97-federation-ledger r102-ledger'><section><b>Durable project continuity</b><strong>{runtime?.continuity?.state||'CHECKING'}</strong><small>{runtime?.continuity?.projectCount||0} project record(s) · {runtime?.continuity?.receiptSha256?`receipt ${runtime.continuity.receiptSha256.slice(0,18)}…`:'receipt pending'}</small></section><section><b>Full-wave execution</b><strong>{Number(counts.running||0)} RUNNING · {Number(counts.queued||0)} QUEUED</strong><small>{receipts.length?receipts.map((x:any)=>`${x.status}:${String(x.resultSha256||x.id).slice(0,10)}`).join(' · '):'No returned full-wave receipt yet. A result becomes admissible evidence only after solver identity, convergence and lineage return.'}</small></section><section><b>Authority boundary</b><strong>ONE GLOBAL CANONSTATE</strong><small>Genesis may keep node-local working state; Optical and Sovereign return packets. Only OMEGAv6 admits a federation result into global CanonState unless a governed migration explicitly changes that authority.</small></section></div>

  <footer className='r102-federation-truth'><ShieldCheck/>R103 hides infrastructure from ordinary operation without hiding truth. Every invoked handoff remains inspectable and must preserve project, packet, atlas address, evidence class, scar/history, solver identity and proof lineage.</footer>
 </section>
}
