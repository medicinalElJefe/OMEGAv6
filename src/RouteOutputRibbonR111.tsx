import {ArrowRight,ShieldCheck} from 'lucide-react';
import {routeLayerOutputR111} from './capability/routeLayerOutputRegistryR111';
import {routeCanonTraceR120} from './capability/canonContinuityRuntimeR120';
import './routeOutputRibbonR111.css';

export default function RouteOutputRibbonR111({route}:{route:string}){
 const c=routeLayerOutputR111(route),canon=routeCanonTraceR120(route);
 return <section className='r111-output-ribbon' aria-label={`${route} input operation output proof and canon-continuity contract`}>
  <header><span>ACTIVE OUTPUT CONTRACT · R120 CANON CONTINUITY</span><b>{c.primary}</b><small>{c.evidenceClass}</small></header>
  <div className='r111-output-flow'>
   <div><i>INPUT</i><span>{c.input}</span></div><ArrowRight/>
   <div><i>OPERATION</i><span>{c.operation}</span></div><ArrowRight/>
   <div><i>OUTPUT</i><span>{c.output}</span></div><ArrowRight/>
   <div><i>PROOF</i><span>{c.proof}</span></div>
  </div>
  <div className='r120-canon-trace'>
   <i>FULL OVERALL CANON</i><b>{canon.activePhases.join(' → ')}</b><small>{canon.orientation} · σ ∈ {'{-1,0,+1}'} when signed frame applies</small>
   <span>RSC · {canon.rsc.join(' → ')}</span><em>Atlas resolution · {canon.atlasResolution.map(x=>x.toLocaleString()).join(' → ')}</em>
  </div>
  <footer><ShieldCheck/><span>{c.layers.join(' · ')}</span><small>{canon.truthBoundary}</small></footer>
 </section>;
}
