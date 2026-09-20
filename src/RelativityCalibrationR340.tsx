import {useMemo,useState} from 'react';
import {ShieldCheck,LockKeyhole} from 'lucide-react';
import {R340_ABLATION,R340_FORECAST,R340_ROUNDTRIP,futureCompatibilityR340} from './system/calibrationR340.js';

const n=(v:number,d=6)=>Number(v).toFixed(d);
const finite=(v:string)=>v.trim()!==''&&Number.isFinite(Number(v));
export default function RelativityCalibrationR340(){
 const a=R340_ABLATION,f=R340_FORECAST,r=R340_ROUNDTRIP;
 const[fL,setFL]=useState(''),[cPar,setCPar]=useState(''),[sfL,setSfL]=useState(''),[sCPar,setSCPar]=useState(''),[rho,setRho]=useState('');
 const evaluation=useMemo(()=>{
  if(![fL,cPar,sfL,sCPar,rho].every(finite))return null;
  const x=Number(fL),c=Number(cPar),sx=Number(sfL),sc=Number(sCPar),rr=Number(rho);
  if(!(sx>0&&sc>0&&Math.abs(rr)<=1))return null;
  return futureCompatibilityR340({fL:x,cParallel:c},[[sx*sx,rr*sx*sc],[rr*sx*sc,sc*sc]]);
 },[fL,cPar,sfL,sCPar,rho]);
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
  <div className='controller-grid' data-r340-future-evaluator='OPERATOR_SUPPLIED_NOT_EMPIRICAL'>
   <article>
    <div className='controller-head'><div><span>ADV-06 · FROZEN VALIDATION</span><h3>Evaluate a future independent common-state measurement</h3></div><b>{evaluation?.state==='EVALUATED'?(evaluation.pass?'PASS':'OUTSIDE 95%'):'UNBOUND'}</b></div>
    <div className='rel36-observer'>
     <label><span>future fL</span><input aria-label='R340 future fL' type='number' step='any' value={fL} onChange={e=>setFL(e.target.value)}/></label>
     <label><span>future C∥</span><input aria-label='R340 future C parallel' type='number' step='any' value={cPar} onChange={e=>setCPar(e.target.value)}/></label>
     <label><span>σ fL</span><input aria-label='R340 future fL uncertainty' type='number' min='0' step='any' value={sfL} onChange={e=>setSfL(e.target.value)}/></label>
     <label><span>σ C∥</span><input aria-label='R340 future C parallel uncertainty' type='number' min='0' step='any' value={sCPar} onChange={e=>setSCPar(e.target.value)}/></label>
     <label><span>ρ</span><input aria-label='R340 future correlation' type='number' min='-1' max='1' step='any' value={rho} onChange={e=>setRho(e.target.value)}/></label>
    </div>
    <code>{f.compatibility.formula}</code>
    <p>{evaluation?.state==='EVALUATED'?`D²=${n(Number(evaluation.d2),6)} · threshold ${n(evaluation.threshold,6)} · ${evaluation.pass?'PASS':'OUTSIDE FROZEN 95% GATE'}`:'Enter the future result and its 2×2 covariance terms through σfL, σC∥ and ρ. Invalid or singular covariance remains unbound.'}</p>
    <p>This calculator accepts operator-supplied values for prospective comparison only. It does not mark them as measured evidence or alter the frozen forecast.</p>
   </article>
  </div>
  <div className='boundary'><LockKeyhole/>Forecast frozen {f.frozenAt}. No parameter, transform, covariance rule, interval, or pass threshold may be changed after the target result is inspected.</div>
  <div className='boundary'><ShieldCheck/>R340 is a restricted-model ablation and prospective validation contract. It preserves the 4,105 source-exact rows, appends derived-no-overwrite evidence, and is not an official ATLAS/CMS combination or a new universal physical law.</div>
 </section>;
}
