import {ArrowRight,GitBranch,RotateCcw,ShieldCheck,Waypoints} from 'lucide-react';
import type {InterferenceResolutionR184 as Resolution} from './interferenceResolutionR184';
import './interferenceResolutionR184.css';

const f=(v:number,d=4)=>Number.isFinite(v)?v.toFixed(d):'—';
const pct=(v:number)=>`${Math.round(Math.max(0,Math.min(1,v))*100)}%`;
const componentRows=(x:Resolution['baseline'])=>[
  ['Λ burden',x.components.burden,'PRESSURE'],['q contradiction',x.components.contradiction,'PRESSURE'],['scar carry',x.components.scar,'PRESSURE'],['ΔΦ phase',x.components.phase,'PRESSURE'],['acceleration',x.components.acceleration,'PRESSURE'],['CΩ protection',x.components.continuityProtection,'PROTECT'],['proof protection',x.components.evidenceProtection,'PROTECT']
] as const;

export default function InterferenceResolutionR184({resolution,onSelectAddress}:{resolution:Resolution;onSelectAddress:(address:number)=>void}){
 const chain=[resolution.baseline,...resolution.steps.map(x=>x.accepted).filter(Boolean) as NonNullable<Resolution['steps'][number]['accepted']>[]];
 return <section className='interference-r184'>
  <header className='ir184-head'><div><span>INTERFERENCE / RESIDUAL CHAIN · R184</span><h4>S{resolution.baseline.stateId} → S{resolution.final.stateId}</h4><small>Actual states only · bounded improvement gate · no synthetic correction values.</small></div><div className={resolution.resolved?'resolved':'held'}><ShieldCheck/><b>{resolution.resolved?'RESIDUAL REDUCED':'HELD / NO LAWFUL IMPROVEMENT'}</b><small>{f(resolution.baseline.score)} → {f(resolution.final.score)} · Δ −{f(resolution.improvement)}</small></div></header>
  <div className='ir184-overview'>
   <article><span>BASELINE INTERFERENCE</span><b>{pct(resolution.baseline.score)}</b><small>S{resolution.baseline.stateId} · {resolution.baseline.decision}</small></article>
   <article><span>FINAL INTERFERENCE</span><b>{pct(resolution.final.score)}</b><small>S{resolution.final.stateId} · {resolution.final.decision}</small></article>
   <article><span>ACCEPTED STEPS</span><b>{resolution.steps.filter(x=>x.accepted).length}</b><small>{resolution.termination}</small></article>
   <article><span>REVERSE TRACE</span><b>{resolution.reverseTrace.direction}</b><small>{resolution.reverseTrace.previousState?`S${resolution.reverseTrace.previousState} ${f(resolution.reverseTrace.previousScore)} → ${f(resolution.reverseTrace.currentScore)}`:'previous unavailable'}</small></article>
  </div>
  <div className='ir184-workspace'>
   <section className='ir184-chain'><div className='ir184-title'><Waypoints/><span><b>Accepted residual descent</b><small>Each arrow is an actual address transition selected only after scoring all local candidates.</small></span></div><div className='ir184-chain-strip'>{chain.map((x,i)=><button key={`${x.address}-${i}`} onClick={()=>onSelectAddress(x.address)} className={i===0?'source':i===chain.length-1?'final':''}><span>{i===0?'SOURCE':`STEP ${i}`}</span><b>S{x.stateId}</b><small>{f(x.score)} · {x.decision}</small></button>).reduce<React.ReactNode[]>((acc,node,i)=>{if(i)acc.push(<ArrowRight key={`a-${i}`}/>);acc.push(node);return acc},[])}</div></section>
   <aside className='ir184-components'><div className='ir184-title'><GitBranch/><span><b>Baseline interference decomposition</b><small>Pressure and protection remain separate instead of collapsing into an unexplained score.</small></span></div>{componentRows(resolution.baseline).map(([label,value,type])=><div key={label} className={type.toLowerCase()}><span>{label}</span><b>{f(value)}</b><i><em style={{width:pct(Math.min(1,value))}}/></i></div>)}</aside>
  </div>
  <section className='ir184-step-ledger'>
   <div className='ir184-title'><RotateCcw/><span><b>Resolution ledger</b><small>Rejected candidates are retained so deduction is reversible and auditable.</small></span></div>
   {resolution.steps.map(step=><article key={step.step} className={step.accepted?'accepted':'stopped'}>
    <header><span>STEP {step.step}</span><b>S{step.from.stateId} · {f(step.from.score)}</b><ArrowRight/><strong>{step.accepted?`S${step.accepted.stateId} · ${f(step.accepted.score)}`:'NO ACCEPTED STATE'}</strong><small>{step.reason}</small></header>
    <div className='ir184-candidates'>{step.candidates.map(c=><button key={`${step.step}-${c.address}`} onClick={()=>onSelectAddress(c.address)} className={c.accepted?'accepted':c.improvement>0?'improves':'reject'}><span>{c.relation}</span><b>S{c.stateId}</b><small>residual {f(c.score)}</small><em>{c.improvement>=0?'+':'−'}{f(Math.abs(c.improvement))} improvement</em></button>)}</div>
    <footer><code>{step.scarReceipt.kind} · before {f(step.scarReceipt.before)} · after {step.scarReceipt.after==null?'HELD':f(step.scarReceipt.after)} · canonicalMutation=false</code></footer>
   </article>)}
  </section>
  <footer className='ir184-boundary'><ShieldCheck/><div><b>Calibration / truth boundary</b><span>Burden {resolution.calibration.burdenPressure} · continuity {resolution.calibration.continuityProtective} · q {resolution.calibration.contradictionPressure} · scar {resolution.calibration.scarPressure} · phase {resolution.calibration.phasePressure} · acceleration {resolution.calibration.accelerationPressure}</span><small>{resolution.calibration.provenance} {resolution.truthBoundary}</small></div></footer>
 </section>
}
