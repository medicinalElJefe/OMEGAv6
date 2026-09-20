import {useMemo,useState} from 'react';
import {ShieldCheck} from 'lucide-react';
import {
 R339_RELEASE_ID,R339_FORECAST_CONTRACT,R339_FORECAST_CONTRACT_SHA256,R339_ABLATION,R339_PHYSICALITY_NEGATIVE_CONTROL,R339_SM_BASELINE,
 evaluateFrozenForecastR339
} from './system/calibrationAdvancementR339.js';

const n=(v:number,d=6)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';
const num=(v:string)=>Number(v);
export default function RelativityForecastR339(){
 const[fL,setFL]=useState(String(R339_FORECAST_CONTRACT.stateCenter.fL));
 const[cParallel,setCParallel]=useState(String(R339_FORECAST_CONTRACT.stateCenter.cParallel));
 const[sigmaFL,setSigmaFL]=useState('0.063410799260');
 const[sigmaCParallel,setSigmaCParallel]=useState('0.311324424948');
 const[rho,setRho]=useState('0.056278541826');
 const evaluation=useMemo(()=>{
  const sf=num(sigmaFL),sc=num(sigmaCParallel),r=num(rho),cov=[[sf*sf,r*sf*sc],[r*sf*sc,sc*sc]];
  return evaluateFrozenForecastR339({
   contractId:R339_FORECAST_CONTRACT.id,contractSha256:R339_FORECAST_CONTRACT_SHA256,basis:R339_FORECAST_CONTRACT.basis,assumptionsPreserved:true,
   fL:num(fL),cParallel:num(cParallel),covariance:cov
  });
 },[fL,cParallel,sigmaFL,sigmaCParallel,rho]);
 const variants=R339_ABLATION.variants;
 const resultText=Number.isFinite(evaluation.d2)?'D² '+n(evaluation.d2,6)+' / '+n(evaluation.threshold,6):evaluation.reason;
 return <section data-calibration-revision='R339' data-calibration-release={R339_RELEASE_ID} data-future-observation='false'>
  <div className='rel36-field'>
   <article><span>R339 FROZEN</span><b>fL forecast center</b><strong>{n(R339_FORECAST_CONTRACT.stateCenter.fL,6)}</strong></article>
   <article><span>R339 FROZEN</span><b>C∥ forecast center</b><strong>{n(R339_FORECAST_CONTRACT.stateCenter.cParallel,6)}</strong></article>
   <article><span>95% MODEL</span><b>fL interval</b><strong>{n(R339_FORECAST_CONTRACT.state95.fL[0],3)} → {n(R339_FORECAST_CONTRACT.state95.fL[1],3)}</strong></article>
   <article><span>95% MODEL</span><b>C∥ interval</b><strong>{n(R339_FORECAST_CONTRACT.state95.cParallel[0],3)} → {n(R339_FORECAST_CONTRACT.state95.cParallel[1],3)}</strong></article>
   <article><span>FORECAST GATE</span><b>D² threshold</b><strong>≤ {n(R339_FORECAST_CONTRACT.compatibilityThresholdD2,6)}</strong></article>
   <article><span>CONTRACT HASH</span><b>SHA-256</b><strong>{R339_FORECAST_CONTRACT_SHA256.slice(0,12)}…</strong></article>
   <article><span>NEGATIVITY</span><b>median approx</b><strong>{n(R339_FORECAST_CONTRACT.negativity.medianApprox,6)}</strong></article>
   <article><span>ABLATION</span><b>CMS fL removal</b><strong>+{n(variants.REMOVE_CMS_FL.areaInflationVsJointPct,3)}% area</strong></article>
   <article><span>ABLATION</span><b>ATLAS C21 removal</b><strong>+{n(variants.REMOVE_ATLAS_C21.areaInflationVsJointPct,3)}% area</strong></article>
   <article><span>ABLATION</span><b>CMS C∥ removal</b><strong>+{n(variants.REMOVE_CMS_CPAR.areaInflationVsJointPct,3)}% area</strong></article>
   <article><span>ABLATION</span><b>ATLAS C22 removal</b><strong>+{n(variants.REMOVE_ATLAS_C22.areaInflationVsJointPct,3)}% area</strong></article>
   <article><span>PHYSICALITY</span><b>gate</b><strong>{R339_PHYSICALITY_NEGATIVE_CONTROL.result}</strong></article>
   <article><span>SM BASELINE</span><b>CMS Δχ²</b><strong>{n(R339_SM_BASELINE.cmsDeltaChi2,6)}</strong></article>
  </div>
  <details className='fr36-advanced'>
   <summary>Frozen future compatibility evaluator</summary>
   <p className='muted'>Reference input starts at the frozen center and is not a future observation. Replace it only with a genuinely future independent result already transformed into the same restricted basis with its covariance and assumptions preserved.</p>
   <div className='gate-grid'>
    <label><span>fL new</span><input aria-label='R339 future fL test input' value={fL} onChange={e=>setFL(e.target.value)}/></label>
    <label><span>C∥ new</span><input aria-label='R339 future C parallel test input' value={cParallel} onChange={e=>setCParallel(e.target.value)}/></label>
    <label><span>σ fL</span><input aria-label='R339 future fL uncertainty' value={sigmaFL} onChange={e=>setSigmaFL(e.target.value)}/></label>
    <label><span>σ C∥</span><input aria-label='R339 future C parallel uncertainty' value={sigmaCParallel} onChange={e=>setSigmaCParallel(e.target.value)}/></label>
    <label><span>ρ</span><input aria-label='R339 future covariance correlation' value={rho} onChange={e=>setRho(e.target.value)}/></label>
    <div><span>Frozen result</span><b>{evaluation.state}</b><small>{resultText}</small></div>
   </div>
  </details>
  <div className='boundary'><ShieldCheck size={15}/>R339 is a hash-bound post-freeze ablation and prospective forecast contract. No parameter, transform, covariance rule, interval, or threshold may be changed after the target future result is inspected. A PASS/FAIL is compatibility with this restricted frozen model, not independent establishment or refutation of physics and not an official ATLAS/CMS combination.</div>
 </section>;
}
