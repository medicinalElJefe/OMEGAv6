import {ShieldCheck} from 'lucide-react';
import {calibratedRelativityR334} from './system/calibrationR334.js';
import {calibratedForecastR339} from './system/ablationForecastR339.js';

const n=(v:number,d=4)=>Number(v).toFixed(d);
export default function RelativityCalibrationR334(){
 const c=calibratedRelativityR334(),r339=calibratedForecastR339(),s=c.commonState,i=c.informationFrame,x=c.crossRepresentation,f=r339.forecast,a=r339.ablation;
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
  <div className='rel36-field' data-calibration-revision='R339'>
   <article><span>R339</span><b>Forecast fL*</b><strong>{n(f.commonStateCenter.fL,4)}</strong></article>
   <article><span>R339</span><b>Forecast C∥*</b><strong>{n(f.commonStateCenter.cParallel,4)}</strong></article>
   <article><span>95%</span><b>fL interval</b><strong>{n(f.commonState95.fL[0],3)} → {n(f.commonState95.fL[1],3)}</strong></article>
   <article><span>95%</span><b>C∥ interval</b><strong>{n(f.commonState95.cParallel[0],3)} → {n(f.commonState95.cParallel[1],3)}</strong></article>
   <article><span>R339</span><b>D² gate</b><strong>≤ {n(f.compatibilityThresholdD2,4)}</strong></article>
   <article><span>LOCK</span><b>Retuning</b><strong>{f.noRetuning?'FORBIDDEN':'OPEN'}</strong></article>
   <article><span>ABLATE</span><b>CMS fL anchor</b><strong>+{n(a.removeCmsFL.reportedRemovalIncreasePct,1)}%</strong></article>
   <article><span>ABLATE</span><b>ATLAS C22 incr.</b><strong>+{n(a.removeAtlasC22.reportedRemovalIncreasePct,1)}%</strong></article>
  </div>
  <div className='boundary'><ShieldCheck/>R334 calibration release {c.releaseId}. The common state is a constrained, Gaussianized ATLAS/CMS cross-representation with explicit covariance/approximation burden. R339 adds a frozen ablation/forecast contract over that state: future compatibility is evaluated without retuning, and the forecast remains a restricted-model prospective test rather than a guaranteed measurement or official experiment combination. Neither layer mutates CanonState.</div>
 </section>;
}
