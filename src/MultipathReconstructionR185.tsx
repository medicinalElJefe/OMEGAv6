import {GitCompareArrows,Route,ShieldCheck,Waypoints} from 'lucide-react';
import type {MultiPathReconstructionR185 as Reconstruction,ReconstructionPathR185} from './multipathReconstructionR185';
import './multipathReconstructionR185.css';

const f=(v:number,d=4)=>Number.isFinite(v)?v.toFixed(d):'—';
const pct=(v:number)=>`${Math.round(Math.max(0,Math.min(1,v))*100)}%`;
function PathRow({path,index,onSelectAddress}:{path:ReconstructionPathR185;index:number;onSelectAddress:(address:number)=>void}){return <article className='mpr185-path'><header><span>PATH {index+1}</span><b>{path.pareto?'PARETO':'SURVIVOR'}</b><strong>cost {f(path.cost)}</strong><small>{path.termination}</small></header><div className='mpr185-chain'>{path.states.map((s,i)=><button key={`${path.id}-${i}`} className={i===0?'source':i===path.states.length-1?'final':''} onClick={()=>onSelectAddress(s.address)}><span>S{s.stateId}</span><b>{f(s.residual)}</b><small>{s.decision}</small></button>)}</div><div className='mpr185-metrics'><span>final <b>{f(path.finalResidual)}</b></span><span>improvement <b>+{f(path.improvement)}</b></span><span>scar <b>{f(path.scarCost)}</b></span><span>evidence floor <b>{f(path.evidenceFloor)}</b></span><span>reverse <b>{f(path.reverseConsistency)}</b></span><span>motion consistency <b>{f(path.motionConsistency)}</b></span><span>temporary worsening <b>{f(path.temporaryWorsening)}</b></span></div></article>}

export default function MultipathReconstructionR185({reconstruction,onSelectAddress}:{reconstruction:Reconstruction;onSelectAddress:(address:number)=>void}){
 const best=reconstruction.best,greedy=reconstruction.localGreedyComparator;
 return <section className='multipath-r185'>
  <header className='mpr185-head'><div><span>DEEP RECONSTRUCTION · R185</span><h4>Competing lawful explanations</h4><small>Beam {reconstruction.beamWidth} · depth {reconstruction.maxDepth} · {reconstruction.expandedPaths.toLocaleString()} actual-state path expansions.</small></div><div className={best?'ready':'held'}><ShieldCheck/><b>{best?'PARETO FRONTIER READY':'NO IMPROVING FRONTIER'}</b><small>{best?`S${reconstruction.source.stateId} → S${best.states.at(-1)?.stateId} · ${f(reconstruction.source.residual)} → ${f(best.finalResidual)}`:'No surviving path improves baseline under current gates.'}</small></div></header>
  <div className='mpr185-summary'>
   <article><Waypoints/><span>Source residual</span><b>{pct(reconstruction.source.residual)}</b><small>S{reconstruction.source.stateId}</small></article>
   <article><Route/><span>Pareto paths</span><b>{reconstruction.paretoFrontier.length}</b><small>{reconstruction.survivors.length} total survivors</small></article>
   <article><GitCompareArrows/><span>Best deep path</span><b>{best?pct(best.finalResidual):'—'}</b><small>{best?`+${f(best.improvement)} residual improvement`:'held'}</small></article>
   <article><ShieldCheck/><span>Greedy comparator</span><b>{greedy.available?pct(greedy.finalResidual):'HELD'}</b><small>{greedy.available?`S${greedy.finalState} · +${f(greedy.improvement)}`:'no local descent'}</small></article>
  </div>
  {best&&<section className='mpr185-best'><header><b>Best current reconstruction</b><small>The best path is not automatically Canon or empirical truth; it is the strongest bounded internal reconstruction under current scoring.</small></header><div className='mpr185-best-chain'>{best.states.map((s,i)=><button key={`best-${s.address}-${i}`} onClick={()=>onSelectAddress(s.address)}><span>{i===0?'SOURCE':i===best.states.length-1?'RESULT':`STEP ${i}`}</span><b>S{s.stateId}</b><small>residual {f(s.residual)}</small></button>)}</div><div className='mpr185-best-metrics'><span>cost <b>{f(best.cost)}</b></span><span>scar <b>{f(best.scarCost)}</b></span><span>evidence <b>{f(best.evidenceFloor)}</b></span><span>reverse <b>{f(best.reverseConsistency)}</b></span><span>motion <b>{f(best.motionConsistency)}</b></span><span>excursion <b>{f(best.temporaryWorsening)}</b></span></div></section>}
  <details className='mpr185-details'><summary>Inspect competing paths, rejected tradeoffs and Pareto frontier</summary><div className='mpr185-frontier'>{reconstruction.paretoFrontier.length?reconstruction.paretoFrontier.map((p,i)=><PathRow key={p.id} path={p} index={i} onSelectAddress={onSelectAddress}/>):<p>No improving Pareto path survived the current bounds.</p>}</div></details>
  <footer><ShieldCheck/><span>{reconstruction.truthBoundary}</span></footer>
 </section>
}
