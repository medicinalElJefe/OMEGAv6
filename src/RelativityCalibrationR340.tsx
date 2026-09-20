import {ShieldCheck,LockKeyhole} from 'lucide-react';
import {R340_ABLATION,R340_FORECAST,R340_ROUNDTRIP} from './system/calibrationR340.js';

const n=(v:number,d=6)=>Number(v).toFixed(d);
export default function RelativityCalibrationR340(){
 const a=R340_ABLATION,f=R340_FORECAST,r=R340_ROUNDTRIP;
 return <section data-calibration-revision='R340' data-forecast-freeze={f.frozenAt}>
  <div className='rel36-field'>
   <article><span>R340</span><b>point round-trip</b><strong>{r.pointResidual.toExponential(3)}</strong></article>
   <article><span>R340</span><b>Jacobian round-trip</b><strong>{r.jacobianResidual.toExponential(3)}</strong></article>
   <article><span>R340</span><b>covariance round-trip</b><strong>{r.covarianceResidual.toExponential(3)}</strong></article>
   <article><span>ABLATE</span><b>CMS fL anchor</b><strong>+{n(a.removals.CMS_fL.summaryIncreasePercent,3)}%</strong></article>
   <article><span>ABLATE</span><b>ATLAS C21</b><strong>+{n(a.removals.ATLAS_C21.summaryIncreasePercent,3)}%</strong></article>
   <article><span>ABLATE</span><b>CMS C∥</b><strong>+{n(a.removals.CMS_CPAR.summaryIncreasePercent,3)}%</strong></article>
   <article><span>ABLATE</span><b>ATLAS C22</b><strong>+{n(a.removals.ATLAS_C22.summaryIncreasePercent,3)}%</strong></article>
   <article><span>GATE</span><b>physicality</b><strong>{a.physicalityGate.result}</strong></article>
   <article><span>FORECAST</span><b>fL center</b><strong>{n(f.commonState.center.fL,6)}</strong></article>
   <article><span>FORECAST</span><b>C∥ center</b><strong>{n(f.commonState.center.cParallel,6)}</strong></article>
   <article><span>FORECAST</span><b>D² 95% gate</b><strong>≤ {n(f.compatibility.threshold95,6)}</strong></article>
   <article><span>FORECAST</span><b>N median</b><strong>{n(f.negativity.median,6)}</strong></article>
  </div>
  <div className='boundary'><LockKeyhole/>Forecast frozen {f.frozenAt}. No parameter, transform, covariance rule, interval, or pass threshold may be changed after the target result is inspected.</div>
  <div className='boundary'><ShieldCheck/>R340 is a restricted-model ablation and prospective validation contract. It preserves the 4,105 source-exact rows, appends derived-no-overwrite evidence, and is not an official ATLAS/CMS combination or a new universal physical law.</div>
 </section>;
}
