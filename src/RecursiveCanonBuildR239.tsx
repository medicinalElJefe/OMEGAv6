import {useEffect,useMemo,useState} from 'react';
import {Boxes,GitBranch,Network,ShieldCheck,Sparkles,TriangleAlert} from 'lucide-react';
import {R239_CONTINUITY_OPERATOR,R239_ORGANS,R239_RESOLUTION} from './system/recursiveCanonBuildR239';
import './recursiveCanonBuildR239.css';

type RoadmapCell={id:string;title:string;objective:string;target:string;risk:string;prerequisites:string[];expectedGain:number;complexity:number;contradictionRisk:number};
type BuildState={generation:number;maxAutonomousGenerations:number;currentCapsuleId:string|null;admittedSourceCapsules:string[];roadmap:RoadmapCell[]};
const riskFactor=(risk:string)=>risk==='LOW'?1:risk==='MEDIUM'?.7:risk==='HIGH'?.35:.1;
const score=(row:RoadmapCell)=>Number(row.expectedGain||0)/Math.max(.01,Number(row.complexity||0)+Number(row.contradictionRisk||0))*riskFactor(row.risk);

export default function RecursiveCanonBuildR239(){
 const[state,setState]=useState<BuildState|null>(null),[error,setError]=useState('');
 useEffect(()=>{let mounted=true;fetch('/omega-r170-selfbuild-state.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`self-build state ${r.status}`);return r.json()}).then(x=>{if(mounted){setState(x);setError('')}}).catch(e=>{if(mounted)setError(e?.message||String(e))});return()=>{mounted=false}},[]);
 const admitted=useMemo(()=>new Set(state?.admittedSourceCapsules||[]),[state]);
 const frontier=useMemo(()=>[...(state?.roadmap||[])].filter(row=>!admitted.has(row.id)&&(row.prerequisites||[]).every(id=>admitted.has(id))).sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id)).slice(0,12),[state,admitted]);
 return <section className='r239-build-fabric' aria-label='R239 recursive Canon build fabric' data-r239-recursive-build='SPARSE_PARALLEL_PLAN_STRICT_ADMISSION'>
  <header><div><span>R239 · FULL OVERALL CANON · RECURSIVE BUILD FABRIC</span><h3>Build OMEGA with the same continuity law OMEGA uses.</h3><p>Partition the current Canon into bounded work cells, rank the dependency-ready frontier from returned residual evidence plus dependency topology, carry declared invariants through each transform, collect scars, then re-contextualize and repartition. Planning may fan out rapidly; source materialization, Hybrid dispatch, proof closure and Canon admission remain governed by their established authorities.</p></div><Sparkles/></header>
  <div className='r239-resolution-grid'>
   <article><Boxes/><span><small>ORGANS</small><b>{R239_RESOLUTION.organs}</b><em>major system domains</em></span></article>
   <article><GitBranch/><span><small>BRANCHES</small><b>{R239_RESOLUTION.branches}</b><em>bounded work surfaces</em></span></article>
   <article><Network/><span><small>CELLS</small><b>{R239_RESOLUTION.cells.toLocaleString()}</b><em>sparse addressable work units</em></span></article>
   <article><ShieldCheck/><span><small>LANES</small><b>{R239_RESOLUTION.lanes.toLocaleString()}</b><em>logical scheduling lanes, not physical dimensions</em></span></article>
  </div>
  <div className='r239-law'><ShieldCheck/><span><b>{R239_CONTINUITY_OPERATOR}</b><small>MAXIMUM INTERNAL EVOLUTION + STRICT EXTERNAL ADMISSION</small></span></div>
  <div className='r239-organs'>{R239_ORGANS.map((organ,index)=><span key={organ}><small>{String(index+1).padStart(2,'0')}</small>{organ.replaceAll('_',' ')}</span>)}</div>
  <section className='r239-frontier'>
   <header><div><small>CURRENT R170 SOURCE ROADMAP · R239 SPARSE PLANNING FRONTIER</small><b>{state?`${frontier.length} dependency-ready cell${frontier.length===1?'':'s'} · generation ${state.generation}/${state.maxAutonomousGenerations}`:'loading governed state'}</b></div></header>
   {error&&<div className='r239-error'><TriangleAlert/>{error}</div>}
   <div className='r239-cell-list'>{frontier.map((row,index)=><article key={row.id}><span className='rank'>{index+1}</span><div><b>{row.id} · {row.title}</b><p>{row.objective}</p><small>{row.target} · risk {row.risk} · structural score {score(row).toFixed(3)} · deps {(row.prerequisites||[]).join(', ')||'none'}</small></div></article>)}{state&&!frontier.length&&<p className='empty'>No dependency-ready source capsule is currently available. The planner remains OBSERVE_ONLY rather than inventing work.</p>}</div>
  </section>
  <footer><ShieldCheck/><span>R239 is a scheduling/proof fabric, not a second source writer. R170 may inspect the whole sparse frontier but still materializes one strongest bounded capsule per pulse. R164 supplies returned residual evidence; no user-value deficit is invented. R147 remains dispatch authority, R141 exact Hybrid return authority, R146 durable history authority, and R125 sole CanonState admission authority. R238 Woven Hybrid correlation remains inherited below this layer.</span></footer>
 </section>;
}
