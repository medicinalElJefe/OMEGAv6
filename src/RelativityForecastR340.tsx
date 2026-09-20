import {useMemo,useState} from 'react';
import {ShieldCheck,LockKeyhole,GitCompareArrows,Scissors} from 'lucide-react';
import {calibrationForecastManifestR340,forecastCompatibilityR340} from './system/calibrationForecastR340.js';

const n=(v:number,d=6)=>Number(v).toFixed(d);
const pct=(v:number)=>Number(v).toFixed(3)+'%';
const finite=(v:string)=>v.trim()!==''&&Number.isFinite(Number(v));
export default function RelativityForecastR340(){
 const m=calibrationForecastManifestR340(),a=m.ablation,f=m.forecast,r=m.roundTrip;
 const[fL,setFL]=useState(''),[cPar,setCPar]=useState(''),[sfL,setSfL]=useState(''),[sCPar,setSCPar]=useState(''),[rho,setRho]=useState('');
 const evaluation=useMemo(()=>{
  if(![fL,cPar,sfL,sCPar,rho].every(finite))return null;
  const x=Number(fL),cp=Number(cPar),sx=Number(sfL),sc=Number(sCPar),rr=Number(rho);
  if(!(sx>0&&sc>0&&Math.abs(rr)<=1))return null;
  return forecastCompatibilityR340({fL:x,cParallel:cp,covariance:[[sx*sx,rr*sx*sc],[rr*sx*sc,sc*sc]]});
 },[fL,cPar,sfL,sCPar,rho]);
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
  <div className='controller-grid' data-r340-future-evaluator='OPERATOR_SUPPLIED_NOT_EMPIRICAL'>
   <article>
    <div className='controller-head'><div><span>ADV-06 · FROZEN VALIDATION</span><h3>Evaluate a future independent common-state measurement</h3></div><b>{evaluation?(evaluation.pass?'PASS':evaluation.physicality?.admitted?'OUTSIDE 95%':'PHYSICALITY HOLD'):'UNBOUND'}</b></div>
    <div className='rel36-observer'>
     <label><span>future fL</span><input aria-label='R340 future fL' type='number' step='any' value={fL} onChange={e=>setFL(e.target.value)}/></label>
     <label><span>future C∥</span><input aria-label='R340 future C parallel' type='number' step='any' value={cPar} onChange={e=>setCPar(e.target.value)}/></label>
     <label><span>σ fL</span><input aria-label='R340 future fL uncertainty' type='number' min='0' step='any' value={sfL} onChange={e=>setSfL(e.target.value)}/></label>
     <label><span>σ C∥</span><input aria-label='R340 future C parallel uncertainty' type='number' min='0' step='any' value={sCPar} onChange={e=>setSCPar(e.target.value)}/></label>
     <label><span>ρ</span><input aria-label='R340 future correlation' type='number' min='-1' max='1' step='any' value={rho} onChange={e=>setRho(e.target.value)}/></label>
    </div>
    <code>{f.compatibility.metric}</code>
    <p>{evaluation?`D²=${n(Number(evaluation.d2),6)} · threshold ${n(evaluation.threshold,6)} · ${evaluation.physicality?.admitted?(evaluation.pass?'PASS':'OUTSIDE FROZEN 95% GATE'):'OUTSIDE RESTRICTED PHYSICAL DOMAIN'}`:'Enter a future result plus σfL, σC∥ and ρ. Invalid or singular covariance remains unbound.'}</p>
    <p>Operator-supplied values remain prospective comparison inputs only. They are not promoted to measured evidence and cannot alter the frozen center, covariance rule, interval, threshold, or no-retuning contract.</p>
   </article>
  </div>
  <div className='boundary'><GitCompareArrows/>R340 round-trip proof preserves the restricted common-state transform to machine precision; that is numerical self-consistency, not new external physics evidence.</div>
  <div className='boundary'><Scissors/>Ablation is local-Gaussian. CMS fL is the dominant precision anchor in this approximate fit; ATLAS C22 has low incremental area effect but remains physically retained rather than being declared dispensable.</div>
  <div className='boundary'><LockKeyhole/>Forecast frozen {f.frozenAt}: x* = ({n(f.state.fL,6)}, {n(f.state.cParallel,6)}), D² ≤ {n(f.compatibility.threshold,6)}. No parameter, transform, covariance rule, interval, or threshold may be retuned after the future target result is inspected.</div>
  <div className='boundary'><ShieldCheck/>{m.truthBoundary}</div>
 </section>;
}
