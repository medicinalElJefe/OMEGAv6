import {ArrowRight,ChevronDown,Eye,ShieldCheck} from 'lucide-react';
import {routeLayerOutputR111} from './capability/routeLayerOutputRegistryR111';
import {routeCanonTraceR120} from './capability/canonContinuityRuntimeR120';
import {VISUAL_SPACE_LABEL_R157,VISUAL_TRUTH_KIND_LABEL_R157,visualTruthForSurfaceR157} from './visualTruthR157';
import './routeOutputRibbonR111.css';

export default function RouteOutputRibbonR111({route}:{route:string}){
 const c=routeLayerOutputR111(route),canon=routeCanonTraceR120(route),visual=visualTruthForSurfaceR157(route);
 return <details className='r111-output-ribbon r122-output-contract' data-r159-visual-kind={visual?.kind||'NON_VISUAL'} data-r159-canon-effect={visual?.canonEffect||'ROUTE_CONTRACT_ONLY'}>
  <summary aria-label={`${route} output contract summary`}><span>ACTIVE CONTRACT</span><b>{route}</b><small>{c.primary} · {c.evidenceClass}{visual?` · ${VISUAL_TRUTH_KIND_LABEL_R157[visual.kind]}`:''}</small><ChevronDown/></summary>
  <section className='r111-output-ribbon-body' aria-label={`${route} input operation output proof and canon-continuity contract`}>
   <header><span>INPUT → OPERATION → OUTPUT → PROOF</span><b>R159 TOTAL INSTRUMENT · R120 CANON CONTINUITY</b></header>
   <div className='r111-output-flow'>
    <div><i>INPUT</i><span>{c.input}</span></div><ArrowRight/>
    <div><i>OPERATION</i><span>{c.operation}</span></div><ArrowRight/>
    <div><i>OUTPUT</i><span>{c.output}</span></div><ArrowRight/>
    <div><i>PROOF</i><span>{c.proof}</span></div>
   </div>
   {visual&&<div className='r159-visual-output-contract' aria-label={`${route} visual truth contract`}>
    <Eye/><span><i>VISUAL TRUTH</i><b>{VISUAL_TRUTH_KIND_LABEL_R157[visual.kind]}</b><small>{VISUAL_SPACE_LABEL_R157[visual.space]}</small></span>
    <span><i>SOURCE AUTHORITY</i><b>{visual.sourceAuthority}</b></span>
    <span><i>RENDER AUTHORITY</i><b>{visual.renderAuthority}</b></span>
    <span><i>INTERACTION / CANON</i><b>{visual.interactionAuthority}</b><small>{visual.canonEffect==='ADDRESS_COMMIT_ONLY'?'Explicit address commit only':'No visual-control CanonState mutation'}</small></span>
    <span className='r159-visual-boundary'><i>ABSENCE + FORBIDDEN CLAIM</i><b>{visual.absenceLaw}</b><small>{visual.forbiddenClaim}</small></span>
   </div>}
   <div className='r120-canon-trace'>
    <i>FULL OVERALL CANON</i><b>{canon.activePhases.join(' → ')}</b><small>{canon.orientation} · σ ∈ {'{-1,0,+1}'} when signed frame applies</small>
    <span>RSC · {canon.rsc.join(' → ')}</span><em>Atlas resolution · {canon.atlasResolution.map(x=>x.toLocaleString()).join(' → ')}</em>
   </div>
   <footer><ShieldCheck/><span>{c.layers.join(' · ')}</span><small>{canon.truthBoundary}</small></footer>
  </section>
 </details>;
}
