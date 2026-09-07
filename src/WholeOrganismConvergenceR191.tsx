import {Activity,BrainCircuit,Database,Gauge,Network,ShieldCheck} from 'lucide-react';
import type {R191WholeOrganismContext} from './wholeOrganismConvergenceR191';
import './wholeOrganismConvergenceR191.css';

const pct=(v:number)=>`${Math.round(Math.max(0,Math.min(1,v))*100)}%`;
export default function WholeOrganismConvergenceR191({context,runId}:{context:R191WholeOrganismContext;runId?:string|null}){const e=context.epistemic,p=context.performance,a=context.analysis;return <section className='organism-r191'>
 <header><div><span>WHOLE ORGANISM · R191 · THREE-LOOP COUPLING</span><b>Evidence attention × runtime headroom × reusable analysis</b><small>R181 decides where uncertainty deserves attention. R185 informs how much compute is sensible. R189 reuses exact state truth. R147/R146/R125 authorities do not move.</small></div><ShieldCheck/></header>
 <div className='organism-r191-grid'>
  <article><BrainCircuit/><span>Epistemic pressure</span><b>{pct(e.pressure)}</b><strong>{e.attention}</strong><small>{e.focusMetrics.length?e.focusMetrics.slice(0,3).join(' · '):'no admitted weak-metric ranking'}</small></article>
  <article><Gauge/><span>Compute headroom</span><b>{pct(p.headroom)}</b><strong>{p.terminalSamples} terminal samples</strong><small>{p.source}{runId?` · run ${runId}`:''}</small></article>
  <article><Activity/><span>Change pressure</span><b>{pct(p.predictedChangePressure)}</b><strong>{a.recommendedWorkingSet.toLocaleString()} working-set target</strong><small>R185 change signal · performance only</small></article>
  <article><Database/><span>Shared cache</span><b>{Number(context.cache.cachedStates||0).toLocaleString()} states</b><strong>{Number(context.cache.cachedNeighborhoods||0).toLocaleString()} neighborhoods</strong><small>R189 memoization only</small></article>
 </div>
 <div className='organism-r191-policy'><Network/><div><span>ACTIVE ANALYSIS ENVELOPE</span><b>R184 {a.localSteps} steps · R185 beam {a.beamWidth} × depth {a.pathDepth} · R188 chunks {a.globalChunkSize}</b><small>Prewarm radius {a.prewarmRadius} · full-field {a.fullFieldRecommended?'recommended when operator requests':'not currently recommended'} · automatic full-field remains disabled.</small></div></div>
 <footer><ShieldCheck/><span>{context.truthBoundary}</span></footer>
 </section>}
