import {useMemo} from 'react';
import {Activity,BrainCircuit,ShieldCheck,Waypoints} from 'lucide-react';
import {surfaceModeFabricR107} from './modeExecutionFabricR107';
import {unifiedFromRecord} from './unifiedCalculus';
import {calculusVisualLaw} from './calculusVisualLawR37';
import './fullCalculusFabricR107.css';

const f=(x:any,d=3)=>Number.isFinite(Number(x))?Number(x).toFixed(d):'—';
const pct=(x:any)=>`${Math.round(Math.max(0,Math.min(1,Number(x)||0))*100)}%`;
const CHANNELS=['COHERENCE','FORECAST','PRUNE','RELATIVITY','FLOW','MEMORY','PROOF','TOPOLOGY','COMPRESSION','TRAVERSAL','RECURSION','GOVERNANCE','SCALE','LIGHT'] as const;

export default function FullCalculusFabricR107({surface,record}:{surface:string;record:any}){
 const fabric=useMemo(()=>surfaceModeFabricR107(surface,record),[surface,record?.address,record?.stateId]),u=useMemo(()=>unifiedFromRecord(record),[record?.address,record?.stateId]),law=useMemo(()=>calculusVisualLaw(record),[record?.address,record?.stateId]);
 const activeChannels=CHANNELS.map(id=>({id,value:Number((fabric.channels as any)[id]||0)})).sort((a,b)=>b.value-a.value);
 return <details className='r107-calculus-fabric' data-surface={surface}>
  <summary><BrainCircuit/><span><b>FULL CALCULUS FABRIC</b><small>{fabric.availability.sourceCatalog} source modes available · {fabric.availability.canonLenses} canon/calculus lenses · {fabric.contributingCount} lawful contributors for {surface}</small></span><strong>{fabric.layer.primary}</strong></summary>
  <div className='r107-calculus-body'>
   <section className='r107-calculus-kernel'><header><Waypoints/><div><b>Canonical kernel → woven continuity → surface expression</b><small>one CanonState · contextual mode composition · no duplicate execution authority</small></div></header><div><article><span>CΩ</span><b>{f(u.C)}</b><small>continuity</small></article><article><span>Φ</span><b>{f(u.Phi)}</b><small>future plasticity</small></article><article><span>q</span><b>{f(u.q)}</b><small>contradiction</small></article><article><span>Λ</span><b>{f(u.Lambda)}</b><small>burden</small></article><article><span>σ</span><b>{u.orientation>0?'+1':u.orientation<0?'−1':'0'}</b><small>orientation</small></article><article><span>U</span><b>{f(u.unifiedCoherence)}</b><small>unified coherence</small></article><article><span>ROUTE</span><b>{f(law.routeStrength)}</b><small>mode + calculus route field</small></article><article><span>PROOF</span><b>{f(law.proofGlow)}</b><small>evidence-weighted visual proof channel</small></article></div></section>
   <section className='r107-calculus-layers'><header><Activity/><div><b>Functional layer binding</b><small>{fabric.layer.interaction}</small></div></header><div>{(['STATE','INTELLIGENCE','MEMORY','RELATION','COMPUTATION','ACTION','OBSERVATION','PROOF'] as const).map(layer=><span key={layer} className={fabric.layer.layers.includes(layer)?'active':''}>{layer}</span>)}</div><p>{fabric.layer.correctness}</p></section>
   <section className='r107-mode-channels'><header><BrainCircuit/><div><b>All-mode family influence</b><small>visual/computational influence only from executable or bounded derived channels</small></div></header><div>{activeChannels.map(x=><article key={x.id}><span>{x.id}</span><i><em style={{transform:`scaleX(${Math.max(.002,x.value)})`}}/></i><b>{pct(x.value)}</b></article>)}</div></section>
   <section className='r107-mode-contributors'><header><ShieldCheck/><div><b>Highest lawful contributors for this surface</b><small>{fabric.applicableCount} applicable contracts · {fabric.gatedCount} gated · catalog-only metadata never executes</small></div></header><div>{fabric.topContributors.map((x:any)=><article key={x.ref}><code>{x.ref}</code><span><b>{x.name}</b><small>{x.family} · {x.state}</small></span><strong>{pct(x.weight)}</strong></article>)}</div>{fabric.gatedCount>0&&<details><summary>{fabric.gatedCount} applicable formulas remain gated for missing authoritative inputs</summary><div>{fabric.gated.map((x:any)=><p key={x.ref}><code>{x.ref}</code><b>{x.name}</b><span>{x.basis}</span></p>)}</div></details>}</section>
   <footer><ShieldCheck/><span>{fabric.boundary} {law.sourceModeInfluence.boundary}</span></footer>
  </div>
 </details>;
}
