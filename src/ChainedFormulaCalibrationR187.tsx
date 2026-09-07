import {Activity,GitCompareArrows,ShieldCheck} from 'lucide-react';
import type {ChainedFormulaCalibrationR187 as Calibration} from './chainedFormulaCalibrationR187';
import './chainedFormulaCalibrationR187.css';

const f=(v:number,d=4)=>Number.isFinite(v)?v.toFixed(d):'—';
const pct=(v:number)=>`${Math.round(Math.max(0,Math.min(1,v))*100)}%`;
export default function ChainedFormulaCalibrationR187({calibration}:{calibration:Calibration}){
 return <section className='chain-r187'>
  <header><div><span>CHAINED FORMULA CALIBRATION · R187</span><h4>{calibration.calibration.state}</h4><small>{calibration.pathSource} · {calibration.edges.length} stepwise re-linearizations.</small></div><div className='status'><ShieldCheck/><b>fit {pct(calibration.metrics.meanFit)}</b><small>RMSE {f(calibration.metrics.rmse)} · bias {f(calibration.metrics.systematicBias)}</small></div></header>
  <div className='chain-r187-summary'><article><Activity/><span>Actual total ΔR</span><b>{f(calibration.metrics.actualTotalDelta)}</b><small>observed across selected actual-state chain</small></article><article><GitCompareArrows/><span>Predicted total ΔR</span><b>{f(calibration.metrics.predictedTotalDelta)}</b><small>stepwise gradient + Hessian model</small></article><article><ShieldCheck/><span>Mean confidence</span><b>{pct(calibration.metrics.meanConfidence)}</b><small>max error {f(calibration.metrics.maxError)}</small></article></div>
  <div className='chain-r187-path'>{calibration.states.map((s,i)=><span key={`${s}-${i}`}><b>S{s}</b><small>{i===0?'source':i===calibration.states.length-1?'result':`relinearize ${i}`}</small></span>)}</div>
  <details><summary>Inspect formula prediction error and axis attribution</summary><div className='chain-r187-edges'>{calibration.edges.map((e,i)=><article key={`${e.fromState}-${e.toState}-${i}`}><header><span>S{e.fromState} → S{e.toState}</span><b>actual {f(e.actualDelta)}</b><strong>predicted {f(e.predictedDelta)}</strong><em>error {f(e.error)}</em></header><div className='chain-r187-bars'><span>fit <i><em style={{width:pct(e.fit)}}/></i><b>{pct(e.fit)}</b></span><span>locality <i><em style={{width:pct(e.locality)}}/></i><b>{pct(e.locality)}</b></span><span>confidence <i><em style={{width:pct(e.confidence)}}/></i><b>{pct(e.confidence)}</b></span></div><div className='chain-r187-attribution'>{Object.entries(e.axisContributions).map(([axis,v])=><span key={axis}><b>{axis}</b><small>{f(v)}</small></span>)}<span><b>mixed</b><small>{f(e.mixedContribution)}</small></span></div><footer>{e.topology} · route alignment {f(e.routeAlignment)} · displacement [{e.displacement.D},{e.displacement.P},{e.displacement.R},{e.displacement.L}]</footer></article>)}</div></details>
  <div className='chain-r187-rec'><b>{calibration.calibration.recommendation}</b><small>Formula miss is retained as calibration evidence; no automatic coefficient rewrite occurs.</small></div>
  <footer><ShieldCheck/><span>{calibration.truthBoundary}</span></footer>
 </section>
}
