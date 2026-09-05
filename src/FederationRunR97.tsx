import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,ChevronRight,ExternalLink,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import {FEDERATION_NODE_ORDER_R102,FEDERATION_NODES_R102,federationFlowR102,federationNodeStateR102,federationToneR102,type FederationNodeKey} from './federation/federationExperienceR102';
import FederationLivingFieldR112 from './FederationLivingFieldR112';
import './federationRunR97.css';
import './federationRunR112.css';

type Props={onDownloadLauncher:()=>void;paired:boolean};
const age=(n:number|null|undefined)=>{if(!n)return'none recorded';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago`};
const stamp=(n:number|null|undefined)=>n?new Date(n).toLocaleString():'none recorded';
const nodeLabel=(id:string)=>id==='omega-genesis'?'Genesis':id==='omega-optical'?'Optical':id==='omega-sovereign'?'Sovereign':id==='omega-v6'?'OMEGAv6':id;
const plainGate=(gate:string,flow:any)=>{
 const g=String(gate||'').toUpperCase();
 if(g.includes('OPTICAL'))return{title:'Optical service is protected',copy:'OMEGA can reach the Optical surface, but server-to-server screening access is still locked. Ordinary tasks that do not need Optical can continue.'};
 if(g.includes('SOVEREIGN')||g.includes('FULL_WAVE'))return{title:'The PC is not currently proved online',copy:'Connect the Windows host when a task actually needs local execution or full-wave solving.'};
 if(g.includes('GENESIS'))return{title:'Proposal generation is unavailable',copy:'OMEGA can still use direct canonical tools; proposal-expansion tasks will wait for Genesis.'};
 if(g==='READY')return{title:'Fabric ready',copy:'OMEGA can choose the smallest lawful capability path for the requested outcome.'};
 return{title:String(flow?.summary||'Capability path is waiting on a dependency.'),copy:String(flow?.action||'OMEGA will expose the exact dependency when the task requires it.')};
};

export default function FederationRunR97({_onDownloadLauncher,onDownloadLauncher:legacyDownload,paired:_paired}:Props & {_onDownloadLauncher?:()=>void}){
 void legacyDownload;void _paired;
 const[data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const[intent,setIntent]=useState(''),[routePlan,setRoutePlan]=useState<any>(null),[routeBusy,setRouteBusy]=useState(false);
 const load=async()=>{setBusy(true);try{const r=await api.get<any>('/api/federation/run/status');setData(r.data);setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 const routeIntent=async()=>{const q=intent.trim();if(!q||routeBusy)return;setRouteBusy(true);try{const r=await api.post<any>('/api/federation/route-intent',{intent:q});setRoutePlan(r.data);setError('')}catch(e:any){setRoutePlan(null);setError(e?.message||String(e))}finally{setRouteBusy(false)}};
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),10000);return()=>window.clearInterval(id)},[]);
 const nodes=data?.nodes||{},runtime=data?.runtime||{},flow=useMemo(()=>federationFlowR102(nodes,runtime),[data]),gateCopy=plainGate(flow.gate,flow);
 const rows=useMemo(()=>FEDERATION_NODE_ORDER_R102.map((key:FederationNodeKey)=>{const spec=FEDERATION_NODES_R102[key],state=federationNodeStateR102(key,nodes),tone=federationToneR102(state);return{key,spec,state,tone}}),[data]);
 const receipts=[...(runtime?.rcwa?.lastJobs||[])].reverse().slice(0,5),counts=runtime?.rcwa?.counts||{},workers=runtime?.rcwa?.workers||[];
 const lastRcwaProof=workers.reduce((m:number,x:any)=>Math.max(m,Number(x?.lastSeen||0)),0)||null,lastHostProof=runtime?.pairing?.lastAuthenticatedProof||null;
 const plannedSteps=routePlan?.ok?(routePlan.steps||[]):[];
 return <section className='r97-federation r112-federation'>
  <header className='r112-fabric-head'><div><span>OMEGA CAPABILITY FABRIC · R112</span><h3>Tell OMEGA the outcome. The machinery stays underneath.</h3><p>Genesis explores, Optical screens, Sovereign computes, and OMEGAv6 admits proof. You should not need to understand that topology before using the system.</p></div><button className='r112-fabric-refresh' onClick={()=>void load()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Checking…':'Refresh status'}</button></header>
  {error&&<div className='r97-federation-error'><TriangleAlert/>{error}</div>}

  <section className='r112-intent' aria-label='Ask OMEGA for an outcome'>
   <div className='r112-intent-entry'><label htmlFor='r112-intent'>WHAT DO YOU WANT TO DO?</label><div><input id='r112-intent' value={intent} onChange={e=>setIntent(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void routeIntent()}} placeholder='Describe the result you want — build it, analyze it, compare it, validate it, visualize it…'/><button onClick={()=>void routeIntent()} disabled={!intent.trim()||routeBusy}>{routeBusy?'Resolving…':'Run capability plan'}<ChevronRight/></button></div><small>OMEGA resolves the minimum required path. Unneeded clouds and solvers stay idle.</small></div>
   <div className='r112-intent-result'>{routePlan?.ok?<><span>OMEGA WILL USE</span><b>{routePlan.path}</b><div>{plannedSteps.map((step:any)=><i key={`${step.node}-${step.verb}`} className={step.ready?'ready':'blocked'}>{step.verb} · {nodeLabel(step.node)}</i>)}</div><p>{routePlan.summary}</p><small>{routePlan.nextAction}</small></>:<><span>CURRENT FABRIC</span><b>{gateCopy.title}</b><p>{gateCopy.copy}</p><small>Ask for an outcome above and this becomes a concrete execution path instead of infrastructure status.</small></>}</div>
  </section>

  <FederationLivingFieldR112 nodes={nodes} runtime={runtime}/>

  <section className='r112-node-strip' aria-label='Federation node status'>{rows.map(row=><article key={row.key} className={row.tone}><div>{row.tone==='ready'?<CheckCircle2/>:<TriangleAlert/>}<span><b>{row.spec.label}</b><small>{row.spec.verb}</small></span></div><strong>{row.state.replaceAll('_',' ')}</strong></article>)}</section>

  <details className='r112-fabric-details'>
   <summary><span><b>Inspect technical fabric, proof history and queues</b><small>For debugging, solver work, cloud recovery and provenance. Not required for ordinary use.</small></span><ChevronRight/></summary>
   <div className='r102-flow' aria-label='Federation handoff sequence'>{['PROPOSE','SCREEN','SOLVE','ADMIT'].map((stage,index)=><div key={stage} className={flow.stage===stage?'active':''}><span>0{index+1}</span><b>{stage}</b></div>)}</div>
   <section className='r102-current-gate'><div><span>CURRENT HANDOFF / FABRIC GATE</span><strong>{flow.gate.replaceAll('_',' ')}</strong><p>{flow.summary}</p></div><div><span>NEXT USEFUL ACTION</span><p>{flow.action}</p></div></section>
   <div className='r97-federation-nodes r102-four-nodes'>{rows.map((row,index)=><article key={row.key} className={row.tone}><div className='r102-node-head'><span>0{index+1}</span><i>{row.spec.verb}</i>{row.tone==='ready'?<CheckCircle2/>:<TriangleAlert/>}</div><div className='r102-node-body'><div><b>{row.spec.label}</b><strong>{row.state.replaceAll('_',' ')}</strong></div><p>{row.spec.role}</p><small>{row.spec.value}</small></div><dl><div><dt>IN</dt><dd>{row.spec.input}</dd></div><div><dt>OUT</dt><dd>{row.spec.output}</dd></div></dl><footer><span>{row.spec.truth}</span>{row.spec.url&&<a href={row.spec.url} target='_blank' rel='noreferrer'>Open node<ExternalLink/></a>}</footer></article>)}</div>
   <section className='r102-proof-history'><div><span>LAST AUTHENTICATED PROOF</span><strong>{age(lastHostProof)}</strong><small>{stamp(lastHostProof)} · historical proof does not equal current PC ONLINE</small></div><div><span>LAST FULL-WAVE HEARTBEAT</span><strong>{age(lastRcwaProof)}</strong><small>{stamp(lastRcwaProof)} · solver online requires current freshness</small></div><div><span>BRIDGE CREATED</span><strong>{age(runtime?.pairing?.createdAt)}</strong><small>{stamp(runtime?.pairing?.createdAt)}</small></div></section>
   <div className='r97-federation-ledger r102-ledger'><section><b>Durable project continuity</b><strong>{runtime?.continuity?.state||'CHECKING'}</strong><small>{runtime?.continuity?.projectCount||0} project record(s) · {runtime?.continuity?.receiptSha256?`receipt ${runtime.continuity.receiptSha256.slice(0,18)}…`:'receipt pending'}</small></section><section><b>Full-wave execution</b><strong>{Number(counts.running||0)} RUNNING · {Number(counts.queued||0)} QUEUED</strong><small>{receipts.length?receipts.map((x:any)=>`${x.status}:${String(x.resultSha256||x.id).slice(0,10)}`).join(' · '):'No returned full-wave receipt yet.'}</small></section><section><b>Authority boundary</b><strong>ONE GLOBAL CANONSTATE</strong><small>Genesis may keep node-local working state; Optical and Sovereign return packets. OMEGAv6 remains global admission authority.</small></section></div>
  </details>

  <footer className='r102-federation-truth'><ShieldCheck/>R112 uses specialization without turning the interface into infrastructure. The living field is driven by current OMEGA calculus/address state and observed node truth; detailed machinery remains inspectable without becoming the ordinary workflow.</footer>
 </section>;
}
