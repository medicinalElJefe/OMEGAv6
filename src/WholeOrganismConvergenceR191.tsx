import {Activity,BrainCircuit,Database,Gauge,Network,ShieldCheck,RadioTower,FlaskConical} from 'lucide-react';
import type {R191WholeOrganismContext} from './wholeOrganismConvergenceR191';
import {sourceFabricManifestR192} from './sourceFabricR192';
import {benchmarkManifestR192} from './empiricalBenchmarkR192';
import './wholeOrganismConvergenceR191.css';

const pct=(v:number)=>`${Math.round(Math.max(0,Math.min(1,v))*100)}%`;
export default function WholeOrganismConvergenceR191({context,runId}:{context:R191WholeOrganismContext;runId?:string|null}){const e=context.epistemic,p=context.performance,a=context.analysis,sourceFabric=sourceFabricManifestR192(),benchmark=benchmarkManifestR192(),publicCount=Number(sourceFabric.planeCounts?.PUBLIC_OBSERVATION||0),corpusCount=Number(sourceFabric.planeCounts?.DRIVE_REFERENCE_CORPUS||0)+Number(sourceFabric.planeCounts?.CHATGPT_LIBRARY_CORPUS||0);return <section className='organism-r191'>
 <header><div><span>WHOLE ORGANISM · R191/R192 · EVIDENCE × COMPUTE × CORPUS × FALSIFICATION</span><b>Evidence attention × runtime headroom × reusable analysis × typed source fabric</b><small>R181 decides where uncertainty deserves attention. R185 informs how much compute is sensible. R189 reuses exact state truth. R192 keeps cloud/corpus/public evidence typed and adds an external benchmark gate. R147/R146/R125 authorities do not move.</small></div><ShieldCheck/></header>
 <div className='organism-r191-grid'>
  <article><BrainCircuit/><span>Epistemic pressure</span><b>{pct(e.pressure)}</b><strong>{e.attention}</strong><small>{e.focusMetrics.length?e.focusMetrics.slice(0,3).join(' · '):'no admitted weak-metric ranking'}</small></article>
  <article><Gauge/><span>Compute headroom</span><b>{pct(p.headroom)}</b><strong>{p.terminalSamples} terminal samples</strong><small>{p.source}{runId?` · run ${runId}`:''}</small></article>
  <article><Activity/><span>Change pressure</span><b>{pct(p.predictedChangePressure)}</b><strong>{a.recommendedWorkingSet.toLocaleString()} working-set target</strong><small>R185 change signal · performance only</small></article>
  <article><Database/><span>Shared cache</span><b>{Number(context.cache.cachedStates||0).toLocaleString()} states</b><strong>{Number(context.cache.cachedNeighborhoods||0).toLocaleString()} neighborhoods</strong><small>R189 memoization only</small></article>
  <article><RadioTower/><span>Source fabric</span><b>{publicCount} public adapters</b><strong>{corpusCount} connected-corpus anchors</strong><small>Drive/Library are reference corpus; runtime reads require explicit connector admission.</small></article>
  <article><FlaskConical/><span>External proof gate</span><b>{benchmark.revision} HARNESS READY</b><strong>{benchmark.metrics.length} scored outputs</strong><small>Held-out / prospective benchmark required before predictive-superiority claims.</small></article>
 </div>
 <div className='organism-r191-policy'><Network/><div><span>ACTIVE ANALYSIS ENVELOPE</span><b>R184 {a.localSteps} steps · R185 beam {a.beamWidth} × depth {a.pathDepth} · R188 chunks {a.globalChunkSize}</b><small>Prewarm radius {a.prewarmRadius} · full-field {a.fullFieldRecommended?'recommended when operator requests':'not currently recommended'} · automatic full-field remains disabled.</small></div></div>
 <div className='organism-r191-policy'><ShieldCheck/><div><span>R192 SOURCE / PROOF BOUNDARY</span><b>{Object.keys(sourceFabric.planeCounts||{}).length} typed source planes · canonical runtime OMEGAv6 · benchmark state READY/NO RESULT ADMITTED</b><small>Registration is not observation. Corpus presence is not Worker authority. Benchmark fit is not prospective prediction unless precommitted proof precedes outcomes. R125 remains the only CanonState admission authority.</small></div></div>
 <footer><ShieldCheck/><span>{context.truthBoundary}</span></footer>
 </section>}
