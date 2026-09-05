import {useEffect,useMemo,useState} from 'react';
import {Activity,BrainCircuit,Cloud,Database,Route,ShieldCheck,Waypoints} from 'lucide-react';
import {api} from './platformAdapter';
import {compileUltimateCapabilityPlanR108} from './ultimateCapabilityRuntimeR108';
import type {WorkflowIntentR85} from './omegaWorkflowRuntimeR85';
import './ultimateCapabilityMembraneR108.css';

type Props={intent:WorkflowIntentR85;goal:string;surface:string;record:any;federationStatus?:any;compact?:boolean};
const short=(x:string,n=58)=>x.length>n?x.slice(0,n-1)+'…':x;
const pct=(x:any)=>`${Math.round(Math.max(0,Math.min(1,Number(x)||0))*100)}%`;
const node=(id:string)=>id==='omega-genesis'?'GENESIS':id==='omega-optical'?'OPTICAL':id==='omega-sovereign'?'SOVEREIGN':id==='omega-v6'?'OMEGAV6':id.toUpperCase();

export default function UltimateCapabilityMembraneR108({intent,goal,surface,record,federationStatus,compact=false}:Props){
 const[status,setStatus]=useState<any>(federationStatus||null),[statusError,setStatusError]=useState('');
 useEffect(()=>{if(federationStatus){setStatus(federationStatus);return}let live=true;const load=async()=>{try{const r=await api.get<any>('/api/federation/run/status');if(live){setStatus(r.data||null);setStatusError('')}}catch(e:any){if(live)setStatusError(e?.message||'federation status unavailable')}};void load();const id=window.setInterval(load,15000);return()=>{live=false;window.clearInterval(id)}},[federationStatus]);
 const plan=useMemo(()=>compileUltimateCapabilityPlanR108({intent,goal,surface,record,federationStatus:status}),[intent,goal,surface,record?.address,record?.stateId,status]);
 const sourceActive=plan.sources.filter(x=>x.state==='ACTIVE'),caps=plan.requiredCapabilities,modeFamilies=plan.mode.activeFamilies;
 return <details className={'r108-capability-membrane '+(compact?'compact':'')} open={!compact}>
  <summary><BrainCircuit/><span><b>ULTIMATE CAPABILITY MEMBRANE · R108</b><small>{plan.capabilityCounts.required} required / {plan.capabilityCounts.total} recovered capabilities · {plan.mode.catalog} source modes · {plan.mode.canonLenses} canon/calculus lenses · {sourceActive.length} active source authorities</small></span><strong>{plan.mode.primaryLayer}</strong></summary>
  <div className='r108-body'>
   <section className='r108-flow'><header><Waypoints/><div><b>One correlated machine</b><small>Intent chooses the minimum required path; the complete lawful fabric remains available.</small></div></header><div>{plan.correlationOrder.map((x:string,i:number)=><span key={x} className={i===0||i===plan.correlationOrder.length-1?'edge':''}>{x}</span>)}</div></section>

   <section className='r108-sources'><header><Database/><div><b>Drive + source authority</b><small>stable source contracts · no private Drive locator in public runtime</small></div></header><div>{plan.sources.map(x=><article key={x.id} className={x.state.toLowerCase()}><i>{x.state==='ACTIVE'?<Database/>:<ShieldCheck/>}</i><span><b>{short(x.title,74)}</b><small>{x.authority}</small></span><strong>{x.state}</strong></article>)}</div></section>

   <section className='r108-mode'><header><Activity/><div><b>Calculus + all-mode composition</b><small>{plan.mode.applicable} applicable · {plan.mode.contributing} contributing · {plan.mode.gated} missing-input gates remain closed</small></div></header><div className='r108-layers'>{(['STATE','INTELLIGENCE','MEMORY','RELATION','COMPUTATION','ACTION','OBSERVATION','PROOF'] as const).map(x=><span key={x} className={plan.mode.layers.includes(x)?'active':''}>{x}</span>)}</div><div className='r108-mode-bars'>{modeFamilies.map((x:any)=><article key={x.family}><span>{x.family}</span><i><em style={{transform:`scaleX(${Math.max(.002,x.value)})`}}/></i><b>{pct(x.value)}</b></article>)}</div></section>

   <section className='r108-caps'><header><BrainCircuit/><div><b>Capability graph</b><small>{plan.capabilityCounts.required} required · {plan.capabilityCounts.supporting} supporting · {plan.capabilityCounts.available} available without forced invocation</small></div></header><div>{caps.map(x=><article key={x.id}><code>{x.id}</code><span><b>{x.name}</b><small>{x.reason} · {x.proofGate}</small></span><strong>{x.route}</strong></article>)}</div>{plan.supportingCapabilities.length>0&&<details><summary>{plan.supportingCapabilities.length} supporting capabilities</summary><div>{plan.supportingCapabilities.map(x=><p key={x.id}><code>{x.id}</code><b>{x.name}</b><span>{x.reason}</span><em>{x.route}</em></p>)}</div></details>}</section>

   <section className='r108-federation'><header><Cloud/><div><b>Cloud / native capability path</b><small>extends the R103 task router; no second federation authority</small></div></header>{plan.federation?.ok?<><strong>{plan.federation.path}</strong><div>{(plan.federation.steps||[]).map((x:any)=><span key={x.node} className={x.ready?'ready':'blocked'}>{x.verb} · {node(x.node)}</span>)}</div><p>{plan.federation.summary}</p><small>{plan.federation.nextAction}</small></>:<p>Canonical-only intent. No specialist cloud stage is forced.</p>}{statusError&&<em>{statusError}</em>}</section>

   <section className='r108-proof'><header><ShieldCheck/><div><b>Proof / admission membrane</b><small>{plan.proof.empiricalValidationRequired?'independent empirical validation required for the requested claim':'formal/runtime proof path; empirical bridge available if the claim expands'}</small></div></header><div><article><span>SCALE</span><b>{plan.scale.effective.toLocaleString()}</b><small>{plan.scale.expanded?'248,832 representational expansion selected':'20,736 resident lattice sufficient'} · never relabeled as physical dimensionality</small></article><article><span>FEDERATION GATE</span><b>{String(plan.next.federationGate).replaceAll('_',' ')}</b><small>{plan.next.firstRoute}</small></article><article><span>PROOF GATES</span><b>{plan.proof.proofGates.length}</b><small>{plan.proof.proofGates.join(' · ')||'surface truth gate only'}</small></article><article><span>MODE GATES</span><b>{plan.proof.sourceGates.length}</b><small>missing authoritative inputs stay non-executable</small></article></div></section>

   <section className='r108-route'><header><Route/><div><b>Operator route</b><small>reachable application surfaces resolved from the required capability graph</small></div></header><div>{plan.routes.map((x:string,i:number)=><span key={x}><code>{String(i+1).padStart(2,'0')}</code>{x}</span>)}</div></section>

   <footer><ShieldCheck/><span>{plan.boundary}</span></footer>
  </div>
 </details>;
}
