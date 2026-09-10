import {useMemo,useState} from 'react';
import {Boxes,Braces,CheckCircle2,Cpu,Network,ShieldCheck,TriangleAlert} from 'lucide-react';
import {compileSystemGenomeR268,genomeByIdR268,SYSTEM_GENOMES_R268} from './systemFoundryR268';
import './systemFoundryR268.css';

type Props={deviceHeartbeat?:boolean;externalBindings?:boolean};
export default function SystemFoundryR268({deviceHeartbeat=false,externalBindings=false}:Props){
 const[genomeId,setGenomeId]=useState('omega.self');
 const genome=genomeByIdR268(genomeId);
 const plan=useMemo(()=>compileSystemGenomeR268(genome,{authenticatedDeviceHeartbeat:deviceHeartbeat,externalBindings}),[genome,deviceHeartbeat,externalBindings]);
 const active=plan.activeFrontier.filter(x=>x.status==='ACTIVE'),blocked=plan.activeFrontier.filter(x=>x.status==='BLOCKED');
 return <section className='foundry-r268' aria-label='R268 System Foundry'>
  <header><div><span>R268 · SYSTEM-CONSTRUCTION SUBSTRATE</span><h3>OMEGA System Foundry</h3><p>Compile a declarative system genome into an active capability frontier, shared operator DAG, executor placements, lenses and proof obligations. This surface plans; it does not create a second executor or production writer.</p></div><div className='foundry-proof'><ShieldCheck/><b>FAIL-CLOSED</b><small>{plan.fingerprint}</small></div></header>
  <div className='foundry-picker'>{SYSTEM_GENOMES_R268.map(g=><button key={g.id} className={g.id===genome.id?'active':''} onClick={()=>setGenomeId(g.id)}><Braces/><span><b>{g.label}</b><small>{g.purpose}</small></span></button>)}</div>
  <div className='foundry-kpis'><article><Boxes/><b>{active.length}</b><span>ACTIVE FRONTIER</span></article><article><TriangleAlert/><b>{blocked.length}</b><span>TRUTH GATED</span></article><article><Network/><b>{plan.operatorDag.length}</b><span>UNIQUE OPERATORS</span></article><article><Cpu/><b>{plan.dormantCapabilities}</b><span>DORMANT / LAZY</span></article></div>
  <div className='foundry-grid'>
   <section><header><span>COMPILED CAPABILITY FRONTIER</span><b>{genome.label}</b></header><div className='foundry-list'>{plan.activeFrontier.map(c=><article key={c.id} data-state={c.status}><div><b>{c.label}</b><code>{c.id}</code></div><small>{c.layer} · {c.executor||c.blockers.join(' · ')}</small><em>{c.status}</em></article>)}</div></section>
   <section><header><span>OPERATOR DAG</span><b>Shared work executes once</b></header><div className='foundry-list'>{plan.operatorDag.map(o=><article key={o.operator}><div><b>{o.operator}</b><code>{o.consumers.join(' · ')}</code></div><small>{o.reuse?`${o.reuse} duplicate execution${o.reuse===1?'':'s'} eliminated`:'single consumer'}</small></article>)}</div></section>
  </div>
  <div className='foundry-grid'>
   <section><header><span>INTERFACE LENSES</span><b>Representation does not redefine state</b></header><div className='foundry-lenses'>{plan.lenses.map(l=><article key={l.id}><b>{l.label}</b><small>{l.purpose}</small><code>{l.reads.join(' · ')}</code></article>)}</div></section>
   <section><header><span>AUTHORITY + PROOF</span><b>No generated system bypasses inherited governance</b></header><div className='foundry-proof-list'>{plan.proofObligations.map(x=><p key={x}><CheckCircle2/><span>{x}</span></p>)}</div></section>
  </div>
  <footer><div><b>Active-frontier execution</b><span>Estimated abstract cost {plan.estimatedCost} · latency {plan.estimatedLatency} · {plan.dormantCapabilities} registry capabilities remain addressable without materialization.</span></div><div><b>Device truth</b><span>{deviceHeartbeat?'Current authenticated heartbeat supplied to this planner.':'DEVICE_PROOF_REQUIRED — browser/CI state is not treated as private-PC proof.'}</span></div></footer>
 </section>
}
