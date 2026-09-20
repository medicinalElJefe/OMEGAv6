import {ShieldCheck,LockKeyhole,GitCompareArrows,Scissors} from 'lucide-react';
import {calibrationForecastManifestR340} from './system/calibrationForecastR340.js';

const n=(v:number,d=6)=>Number(v).toFixed(d);
const pct=(v:number)=>Number(v).toFixed(3)+'%';
export default function RelativityForecastR340(){
 const m=calibrationForecastManifestR340(),a=m.ablation,f=m.forecast,r=m.roundTrip;
 return <section className='rel36-r340' data-calibration-revision='R340' data-calibration-release={m.releaseId} data-r340-forecast-frozen='true'>
  <div className='rel36-field'>
   <article><span>ROUND TRIP</span><b>point residual</b><strong>{r.inversePointResidual.toExponential(3)}</strong></article>
   <article><span>ROUND TRIP</span><b>Jacobian residual</b><strong>{r.jacobianResidual.toExponential(3)}</strong></article>
   <article><span>ROUND TRIP</span><b>covariance residual</b><strong>{r.covarianceResidual.toExponential(3)}</strong></article>
   <article><span>ABLATION</span><b>joint area proxy</b><strong>{n(a.joint.areaProxy,8)}</strong></article>
   <article><span>RETAIN</span><b>CMS fL</b><strong>+{pct(a.variants.REMOVE_CMS_FL.areaIncreaseVsJointPct)}</strong></article>
   <article><span>RETAIN</span><b>ATLAS C21</b><strong>+{pct(a.variants.REMOVE_ATLAS_C21.areaIncreaseVsJointPct)}</strong></article>
   <article><span>RETAIN</span><b>CMS C∥</b><strong>+{pct(a.variants.REMOVE_CMS_CPAR.areaIncreaseVsJointPct)}</strong></article>
   <article><span>REDUNDANCY</span><b>ATLAS C22</b><strong>+{pct(a.variants.REMOVE_ATLAS_C22.areaIncreaseVsJointPct)}</strong></article>
   <article><span>FORECAST</span><b>fL center</b><strong>{n(f.state.fL,6)}</strong></article>
   <article><span>FORECAST</span><b>C∥ center</b><strong>{n(f.state.cParallel,6)}</strong></article>
   <article><span>FORECAST</span><b>N median</b><strong>{n(f.modelInvariant.negativityMedian,6)}</strong></article>
   <article><span>FROZEN GATE</span><b>D² threshold</b><strong>{n(f.compatibility.threshold,6)}</strong></article>
  </div>
  <div className='boundary'><GitCompareArrows/>R340 round-trip proof preserves the restricted common-state transform to machine precision; that is numerical self-consistency, not new external physics evidence.</div>
  <div className='boundary'><Scissors/>Ablation is local-Gaussian. CMS fL is the dominant precision anchor in this approximate fit; ATLAS C22 has low incremental area effect but remains physically retained rather than being declared dispensable.</div>
  <div className='boundary'><LockKeyhole/>Forecast frozen {f.frozenAt}: x* = ({n(f.state.fL,6)}, {n(f.state.cParallel,6)}), D² ≤ {n(f.compatibility.threshold,6)}. No parameter, transform, covariance rule, interval, or threshold may be retuned after the future target result is inspected.</div>
  <div className='boundary'><ShieldCheck/>{m.truthBoundary}</div>
 </section>;
}
