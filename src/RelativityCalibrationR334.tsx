import {ShieldCheck} from 'lucide-react';
import {calibratedRelativityR334} from './system/calibrationR334.js';

const n=(v:number,d=4)=>Number(v).toFixed(d);
export default function RelativityCalibrationR334(){
 const c=calibratedRelativityR334(),s=c.commonState,i=c.informationFrame,x=c.crossRepresentation;
 return <section data-calibration-revision='R334' data-calibration-release={c.releaseId}>
  <div className='rel36-field'>
   <article><span>R334</span><b>fL*</b><strong>{n(s.fL,4)} ± {n(s.fLUncertainty,4)}</strong></article>
   <article><span>R334</span><b>C∥*</b><strong>{n(s.cParallel,4)} ± {n(s.cParallelUncertainty,4)}</strong></article>
   <article><span>R334</span><b>C21*</b><strong>{n(s.c21,4)} ± {n(s.c21Uncertainty,4)}</strong></article>
   <article><span>R334</span><b>C22*</b><strong>{n(s.c22,4)} ± {n(s.c22Uncertainty,4)}</strong></article>
   <article><span>R334</span><b>χ²*</b><strong>{n(s.chi2,4)}</strong></article>
   <article><span>R334</span><b>p compat</b><strong>{n(s.compatibilityP,4)}</strong></article>
   <article><span>R334</span><b>R phys</b><strong>{n(s.physicalityResidual,4)}</strong></article>
   <article><span>R334</span><b>Negativity</b><strong>{n(s.negativity,4)}</strong></article>
   <article><span>INFO</span><b>η shape obs</b><strong>{n(i.observedShapeEta,4)}</strong></article>
   <article><span>INFO</span><b>shape fraction</b><strong>{n(i.observedShapeFraction,4)}</strong></article>
   <article><span>CHECK</span><b>CMS→ATLAS χ²</b><strong>{n(x.atlasCmsObservedCompatibility.chi2,4)}</strong></article>
   <article><span>CHECK</span><b>CMS→ATLAS p</b><strong>{n(x.atlasCmsObservedCompatibility.p,4)}</strong></article>
  </div>
  <div className='boundary'><ShieldCheck/>R334 calibration release {c.releaseId}. The common state is a constrained, Gaussianized ATLAS/CMS cross-representation with explicit covariance/approximation burden. It is not an official experiment combination, does not reconstruct unpublished ATLAS likelihood inputs, and does not mutate CanonState.</div>
 </section>;
}
