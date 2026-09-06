import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,ChevronRight,ExternalLink,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import {FEDERATION_NODE_ORDER_R102,FEDERATION_NODES_R102,federationFlowR102,federationNodeStateR102,federationToneR102,type FederationNodeKey} from './federation/federationExperienceR102';
import FederationLivingFieldR112 from './FederationLivingFieldR112';
import FederationCeremonyR114 from './FederationCeremonyR114';
import './federationRunR97.css';
import './federationRunR112.css';

type Props={onDownloadLauncher:()=>void;paired:boolean};
const age=(n:number|null|undefined)=>{if(!n)return'none recorded';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago`};
const stamp=(n:number|null|undefined)=>n?new Date(n).toLocaleString():'none recorded';
const nodeLabel=(id:string)=>id==='omega-genesis'?'Genesis':id==='omega-optical'?'Optical':id==='omega-sovereign'?'Sovereign':id==='omega-v6'?'OMEGAv6':id;
const plainGate=(gate:string,flow:any,machine:any)=>{
 const g=String(gate||'').toUpperCase(),opticalMachine=String(machine?.optical?.state||'').toUpperCase()==='LIVE',genesisMachine=String(machine?.genesis?.state||'').toUpperCase()==='LIVE';
 if(g.includes('OPTICAL')&&opticalMachine)return{title:'Optical machine SCREEN is live',copy:'The protected human Optical surface remains access-gated, but OMEGA has a separate bounded machine SCREEN service for federation work.'};
 if(g.includes('OPTICAL'))return{title:'Optical screening is unavailable',copy:'The human Optical surface is protected and no live machine SCREEN service is currently proved.'};
 if(g.includes('SOVEREIGN')||g.includes('FULL_WAVE'))return{title:'The PC is not currently proved online',copy:'Genesis/Optical cloud work can continue, but native SOLVE and full-wave execution remain held until a fresh authenticated Windows heartbeat returns.'};
 if(g.includes('GENESIS')&&genesisMachine)return{title:'Genesis machine PROPOSE is live',copy:'The machine proposal service is available even if a separate human surface is degraded.'};
 if(g.includes('GENESIS'))return{title:'Proposal generation is unavailable',copy:'OMEGA can still use direct canonical tools; proposal-expansion tasks will wait for Genesis.'};
 if(g==='READY')return{title:'Fabric ready',copy:'OMEGA can choose the smallest lawful capability path for the requested outcome.'};
 return{title:String(flow?.summary||'Capability path is waiting on a dependency.'),copy:String(flow?.action||'OMEGA will expose the exact dependency when the task requires it.')};
};

export default function FederationRunR97({onDownloadLauncher:legacyDownload,paired:_paired}:Props){
 void _paired;
 const[data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const[intent,setIntent]=useState(''),[routePlan,setRoutePlan]=useState<any>(null),[routeBusy,setRouteBusy]=useState(false);
 const load=async()=>{setBusy(true);try{const r=await api.get<any>('/api/federation/run/status');setData(r.data);setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 const routeIntent=async()=>{const q=intent.trim();if(!q||routeBusy)return;setRouteBusy(true);try{const r=await api.post<any>('/api/federation/route-intent',{intent:q});setRoutePlan(r.data);setError('')}catch(e:any){setRoutePlan(null);setError(e?.message||String(e))}finally{setRouteBusy(false)}};
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),10000);return()=>window.clearInterval(id)},[]);
 const nodes=data?.nodes||{},runtime=data?.runtime||{},machine=data?.machineServices||{};
 const flowNodes=useMemo(()=>({...nodes,
  genesis:String(machine?.genesis?.state||'').toUpperCase()==='LIVE'?{...(nodes.genesis||{}),state:'LIVE',surfaceState:nodes.genesis?.state||'UNKNOWN'}:nodes.genesis,
  optical:String(machine?.optical?.state||'').toUpperCase()==='LIVE'?{...(nodes.optical||{}),state:'LIVE',surfaceState:nodes.optical?.state||'UNKNOWN'}:nodes.optical
 }),[nodes,machine]);
 const flow=useMemo(()=>federationFlowR102(flowNodes,runtime),[flowNodes,runtime]),gateCopy=plainGate(flow.gate,flow,machine);
 const rows=useMemo(()=>FEDERATION_NODE_ORDER_R102.map((key:FederationNodeKey)=>{const spec=FEDERATION_NODES_R102[key],state=federationNodeStateR102(key,nodes),tone=federationToneR102(state),serviceState=key==='genesis'?machine?.genesis?.state:key==='optical'?machine?.optical?.state:null;return{key,spec,state,tone,serviceState}}),[nodes,machine]);
 const receipts=[...(runtime?.rcwa?.lastJobs||[])].reverse().slice(0,5),counts=runtime?.rcwa?.counts||{},workers=runtime?.rcwa?.workers||[];
 const lastRcwaProof=workers.reduce((m:number,x:any)=>Math.max(m,Number(x?.lastSeen||0)),0)||null,lastHostProof=runtime?.pairing?.lastAuthenticatedProof||null;
 const plannedSteps=routePlan?.ok?(routePlan.steps||[]):[];
 return <section className='r97-federation r112-federation'>
  <header className='r112-fabric-head'><div><span>OMEGA CAPABILITY FABRIC · R116</span><h3>Tell OMEGA the outcome. The machinery stays underneath.</h3><p>R116 keeps the four authority roles intact while separating human-surface reachability from the R115 machine services that actually perform bounded PROPOSE and SCREEN work. Sovereign native execution still requires current device proof; OMEGAv6 remains the only global ADMIT authority.</p></div><button className='r112-fabric-refresh' onClick={()=>void load()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Checking…':'Refresh status'}</button></header>
  {error&&<div className='r97-federation-error'><TriangleAlert/>{error}</div>}

  <section className='r112-intent' aria-label='Ask OMEGA for an outcome'>
   <div className='r112-intent-entry'><label htmlFor='r112-intent'>WHAT DO YOU WANT TO DO?</label><div><input id='r112-intent' value={intent} onChange={e=>setIntent(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void routeIntent()}} placeholder='Describe the result you want — build it, analyze it, compare it, validate it, visualize it…'/><button onClick={()=>void routeIntent()} disabled={!intent.trim()||routeBusy}>{routeBusy?'Resolving…':'Run capability plan'}<ChevronRight/></button></div><small>OMEGA resolves the minimum required path from current machine-service and authority truth. Unneeded clouds and solvers stay idle.</small></div>
   <div className='r112-intent-result'>{routePlan?.ok?<><span>OMEGA WILL USE</span><b>{routePlan.path}</b><div>{plannedSteps.map((step:any)=><i key={`${step.node}-${step.verb}`} className={step.ready?'ready':'blocked'}>{step.verb} · {nodeLabel(step.node)}</i>)}</div><p>{routePlan.summary}</p><small>{routePlan.nextAction}</small></>:<><span>CURRENT FABRIC</span><b>{gateCopy.title}</b><p>{gateCopy.copy}</p><small>Ask for an outcome above and this becomes a concrete execution path instead of infrastructure status.</small></>}</div>
  </section>

  <section className='r112-node-strip' aria-label='R116 machine service status'>
   <article className={String(machine?.genesis?.state||'').toUpperCase()==='LIVE'?'ready':'blocked'}><div>{String(machine?.genesis?.state||'').toUpperCase()==='LIVE'?<CheckCircle2/>:<TriangleAlert/>}<span><b>Genesis machine</b><small>PROPOSE service · human surface remains separately reported</small></span></div><strong>{String(machine?.genesis?.state||'UNKNOWN').replaceAll('_',' ')}</strong></article>
   <article className={String(machine?.optical?.state||'').toUpperCase()==='LIVE'?'ready':'blocked'}><div>{String(machine?.optical?.state||'').toUpperCase()==='LIVE'?<CheckCircle2/>:<TriangleAlert/>}<span><b>Optical machine</b><small>SCREEN service · protected human surface is not the execution gate</small></span></div><strong>{String(machine?.optical?.state||'UNKNOWN').replaceAll('_',' ')}</strong></article>
  </section>

  <FederationLivingFieldR112 nodes={nodes} runtime={runtime}/>
  <FederationCeremonyR114 intent={intent} onDownloadLauncher={legacyDownload}/>

  <section className='r112-node-strip' aria-label='Federation node status'>{rows.map(row=><article key={row.key} className={row.tone}><div>{row.tone==='ready'?<CheckCircle2/>:<TriangleAlert/>}<span><b>{row.spec.label}</b><small>{row.spec.verb}{row.serviceState?` · machine ${String(row.serviceState).replaceAll('_',' ')}`:''}</small></span></div><strong>{row.state.replaceAll('_',' ')}</strong></article>)}</section>

  <details className='r112-fabric-details'>
   <summary><span><b>Inspect technical fabric, proof history and queues</b><small>For debugging, solver work, cloud recovery and provenance. Not required for ordinary use.</small></span><ChevronRight/></summary>
   <div className='r102-flow' aria-label='Federation handoff sequence'>{['PROPOSE','SCREEN','SOLVE','ADMIT'].map((stage,index)=><div key={stage} className={flow.stage===stage?'active':''}><span>0{index+1}</span><b>{stage}</b></div>)}</div>
   <section className='r102-current-gate'><div><span>CURRENT HANDOFF / FABRIC GATE</span><strong>{flow.gate.replaceAll('_',' ')}</strong><p>{flow.summary}</p></div><div><span>NEXT USEFUL ACTION</span><p>{flow.action}</p></div></section>
   <div className='r97-federation-nodes r102-four-nodes'>{rows.map((row,index)=><article key={row.key} className={row.tone}><div className='r102-node-head'><span>0{index+1}</span><i>{row.spec.verb}</i>{row.tone==='ready'?<CheckCircle2/>:<TriangleAlert/>}</div><div className='r102-node-body'><div><b>{row.spec.label}</b><strong>{row.state.replaceAll('_',' ')}</strong></div><p>{row.spec.role}</p><small>{row.spec.value}</small></div><dl><div><dt>IN</dt><dd>{row.spec.input}</dd></div><div><dt>OUT</dt><dd>{row.spec.output}</dd></div></dl><footer><span>{row.spec.truth}</span>{row.spec.url&&<a href={row.spec.url} target='_blank' rel='noreferrer'>Open node<ExternalLink/></a>}</footer></article>)}</div>
   <section className='r102-proof-history'><div><span>LAST AUTHENTICATED PROOF</span><strong>{age(lastHostProof)}</strong><small>{stamp(lastHostProof)} · historical proof does not equal current PC ONLINE</small></div><div><span>LAST FULL-WAVE HEARTBEAT</span><strong>{age(lastRcwaProof)}</strong><small>{stamp(lastRcwaProof)} · solver online requires current freshness</small></div><div><span>BRIDGE CREATED</span><strong>{age(runtime?.pairing?.createdAt)}</strong><small>{stamp(runtime?.pairing?.createdAt)}</small></div></section>
   <div className='r97-federation-ledger r102-ledger'><section><b>Durable project continuity</b><strong>{runtime?.continuity?.state||'CHECKING'}</strong><small>{runtime?.continuity?.projectCount||0} project record(s) · {runtime?.continuity?.receiptSha256?`receipt ${runtime.continuity.receiptSha256.slice(0,18)}…`:'receipt pending'}</small></section><section><b>Full-wave execution</b><strong>{Number(counts.running||0)} RUNNING · {Number(counts.queued||0)} QUEUED</strong><small>{receipts.length?receipts.map((x:any)=>`${x.status}:${String(x.resultSha256||x.id).slice(0,10)}`).join(' · '):'No returned full-wave receipt yet.'}</small></section><section><b>Authority boundary</b><strong>ONE GLOBAL CANONSTATE</strong><small>Genesis and Optical machine services return bounded packets for their existing roles; Sovereign returns native solver results; OMEGAv6 remains global admission authority.</small></section></div>
  </details>

  <footer className='r102-federation-truth'><ShieldCheck/>R116 preserves the R114 durable closure ceremony and R115 machine adapters while separating human-surface access, machine transport, browser pairing, fresh host heartbeat, solver freshness and canonical admission. No historical, simulated or merely reachable state can masquerade as completed federation proof.</footer>
 </section>;
}
