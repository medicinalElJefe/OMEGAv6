import {Activity,Compass,Grid3X3,ShieldCheck} from 'lucide-react';
import type {DifferentialRelativityR186 as Differential} from './differentialRelativityR186';
import './differentialRelativityR186.css';

const f=(v:number,d=4)=>Number.isFinite(v)?v.toFixed(d):'—';
const sign=(v:number)=>v>0?'+':v<0?'−':'0';
export default function DifferentialRelativityR186({differential,onSelectAddress}:{differential:Differential;onSelectAddress:(address:number)=>void}){
 const principal=differential.principal[0];
 return <section className='diff-r186'>
  <header><div><span>DIFFERENTIAL RELATIVITY · R186</span><h4>{differential.topology}</h4><small>Discrete residual gradient / curvature over D/P/R/L actual-state neighbors.</small></div><div className='route'><Compass/><b>{differential.route.classification}</b><small>route alignment {f(differential.route.alignment)} · Δ residual {f(differential.route.residualDelta)}</small></div></header>
  <div className='diff-r186-summary'>
   <article><Activity/><span>Gradient magnitude</span><b>{f(differential.gradient.magnitude)}</b><small>current residual {f(differential.residual)}</small></article>
   <article><Compass/><span>Steepest local descent</span><b>{differential.steepestDescent.axis?`${differential.steepestDescent.axis}${differential.steepestDescent.sign>0?'+':'−'}`:'FLAT'}</b><small>{differential.steepestDescent.candidateState?`candidate S${differential.steepestDescent.candidateState}`:'no directional candidate'}</small></article>
   <article><Grid3X3/><span>Principal curvature</span><b>{principal?`${principal.kind} ${f(principal.eigenvalue)}`:'—'}</b><small>{principal?`D ${f(principal.vector.D,2)} · P ${f(principal.vector.P,2)} · R ${f(principal.vector.R,2)} · L ${f(principal.vector.L,2)}`:'unavailable'}</small></article>
  </div>
  <div className='diff-r186-axes'>{differential.axes.map(x=><article key={x.axis}><header><b>{x.axis}</b><span>∂R {f(x.gradient)}</span><small>∂²R {f(x.curvature)}</small></header><div><button onClick={()=>onSelectAddress(x.minus)}>{x.axis}−</button><i><em className={x.gradient<0?'left':'right'} style={{width:`${Math.min(100,Math.abs(x.gradient)*500)}%`}}/></i><button onClick={()=>onSelectAddress(x.plus)}>{x.axis}+</button></div><footer><span>CΩ {f(x.channelGradients.continuity,3)}</span><span>Λ {f(x.channelGradients.burden,3)}</span><span>q {f(x.channelGradients.contradiction,3)}</span><span>scar {f(x.channelGradients.scar,3)}</span><span>proof {f(x.channelGradients.evidence,3)}</span><span>motion {f(x.channelGradients.motion,3)}</span></footer></article>)}</div>
  <details><summary>Inspect mixed derivatives and Hessian</summary><div className='diff-r186-mixed'>{differential.mixed.map(x=><span key={x.axes}><b>{x.axes}</b><small>{sign(x.value)} {f(Math.abs(x.value))}</small></span>)}</div><div className='diff-r186-hessian'>{differential.hessian.map((row,i)=>row.map((v,j)=><code key={`${i}-${j}`}>{f(v,4)}</code>))}</div><div className='diff-r186-principal'>{differential.principal.map((p,i)=><article key={i}><span>λ{i+1}</span><b>{f(p.eigenvalue)}</b><small>{p.kind} · [{f(p.vector.D,2)}, {f(p.vector.P,2)}, {f(p.vector.R,2)}, {f(p.vector.L,2)}]</small></article>)}</div></details>
  <footer><ShieldCheck/><span>{differential.truthBoundary}</span></footer>
 </section>
}
