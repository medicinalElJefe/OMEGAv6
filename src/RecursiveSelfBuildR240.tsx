import {useEffect,useMemo,useState} from 'react';
import {Boxes,GitBranch,Network,ShieldCheck,Sparkles,TriangleAlert} from 'lucide-react';
import {R240_CONTINUITY_OPERATOR,R240_ORGANS,R240_RESOLUTION} from './system/recursiveSelfBuildR240';
import {activeProofEvolutionSnapshotR293} from './proof/proofEvolutionRuntimeR293.js';
import './recursiveSelfBuildR240.css';

type RoadmapCell={id:string;title:string;objective:string;target:string;risk:string;prerequisites:string[];expectedGain:number;complexity:number;contradictionRisk:number};
type BuildState={generation:number;maxAutonomousGenerations:number;currentCapsuleId:string|null;admittedSourceCapsules:string[];roadmap:RoadmapCell[]};
type PromotionPolicy={state?:string;selfPromotion?:{enabled?:boolean};truthBoundary?:string};
const riskFactor=(risk:string)=>risk==='LOW'?1:risk==='MEDIUM'?.7:risk==='HIGH'?.35:.1;
const score=(row:RoadmapCell)=>Number(row.expectedGain||0)/Math.max(.01,Number(row.complexity||0)+Number(row.contradictionRisk||0))*riskFactor(row.risk);

export default function RecursiveSelfBuildR240(){
 const[state,setState]=useState<BuildState|null>(null),[policy,setPolicy]=useState<PromotionPolicy|null>(null),[error,setError]=useState(''),[proofEpoch,setProofEpoch]=useState(0);
 useEffect(()=>{let mounted=true;Promise.all([fetch('/omega-r170-selfbuild-state.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`self-build state ${r.status}`);return r.json()}),fetch('/omega-r240-recursive-exact-self-promotion.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`R240 policy ${r.status}`);return r.json()})]).then(([s,p])=>{if(mounted){setState(s);setPolicy(p);setError('')}}).catch(e=>{if(mounted)setError(e?.message||String(e))});return()=>{mounted=false}},[]);
 useEffect(()=>{const refresh=()=>setProofEpoch(x=>x+1);window.addEventListener('omega-r292-proof-carry-changed',refresh);return()=>window.removeEventListener('omega-r292-proof-carry-changed',refresh)},[]);
 const admitted=useMemo(()=>new Set(state?.admittedSourceCapsules||[]),[state]);
 const frontier=useMemo(()=>[...(state?.roadmap||[])].filter(row=>!admitted.has(row.id)&&(row.prerequisites||[]).every(id=>admitted.has(id))).sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id)).slice(0,12),[state,admitted]);
 const proofEvolution=useMemo(()=>activeProofEvolutionSnapshotR293(),[proofEpoch]);
 const promotionEnabled=policy?.selfPromotion?.enabled===true;
 return <section className='r240-selfbuild' aria-label='R240 recursive exact self-promotion fabric' data-r240-recursive-selfbuild='EVIDENCE_BOUND_SPARSE_PLAN_EXACT_PROMOTION'>
  <header><div><span>R240 · FULL OVERALL CANON · RECURSIVE SELF-BUILD + EXACT PROMOTION · R293 PROOF-DIRECTED EVOLUTION</span><h3>Build, prove, carry scars, turn gaps into work — without collapsing the gates.</h3><p>R293 extends R240/R292 by compiling unresolved proof obligations into deterministic sparse research work cells. Proof work can influence planning and ALL MODES coherence, but it cannot create evidence, overwrite the governed source roadmap, promote a theorem, deploy production, or mutate CanonState.</p></div><Sparkles/></header>
  <div className='r240-resolution-grid'>
   <article><Boxes/><span><small>ORGANS</small><b>{R240_RESOLUTION.organs}</b><em>major development domains</em></span></article>
   <article><GitBranch/><span><small>BRANCHES</small><b>{R240_RESOLUTION.branches}</b><em>logical build surfaces</em></span></article>
   <article><Network/><span><small>CELLS</small><b>{R240_RESOLUTION.cells.toLocaleString()}</b><em>sparse addressable work cells</em></span></article>
   <article><ShieldCheck/><span><small>LANES</small><b>{R240_RESOLUTION.lanes.toLocaleString()}</b><em>planning lanes, not physical dimensions</em></span></article>
  </div>
  <div className='r240-law'><ShieldCheck/><span><b>{R240_CONTINUITY_OPERATOR}</b><small>GENERATED ≠ PROVED ≠ SOURCE-PROMOTED ≠ DEPLOYED ≠ LIVE-VERIFIED ≠ CANON-ADMITTED</small></span></div>
  <div className='r240-organs'>{R240_ORGANS.map((organ,index)=><span key={organ}><small>{String(index+1).padStart(2,'0')}</small>{organ.replaceAll('_',' ')}</span>)}</div>
  <div className='r240-status-grid'>
   <article className={promotionEnabled?'pass':'hold'}><ShieldCheck/><span><small>EXACT SELF-PROMOTION</small><b>{promotionEnabled?'ENABLED · FAIL-CLOSED':'NOT ADMITTED'}</b><em>{policy?.state||'policy not loaded'}</em></span></article>
   <article className='pass'><ShieldCheck/><span><small>INHERITED PC GOVERNOR</small><b>R239 PRESERVED</b><em>selected-host resource envelope remains separate from source evolution</em></span></article>
   <article className={proofEvolution.bound?'hold':'pass'}><ShieldCheck/><span><small>R293 PROOF-DIRECTED EVOLUTION</small><b>{proofEvolution.bound?`${proofEvolution.unresolvedCount} LIVE WORK CELLS`:'NEUTRAL · NO PROOF BOUND'}</b><em>{proofEvolution.bound?`${proofEvolution.claimStatus} · ${(proofEvolution.supportScore*100).toFixed(1)}% certificate support`:'pre-R293 scheduling preserved'}</em></span></article>
  </div>
  {proofEvolution.bound&&<section className='r240-frontier r293-proof-frontier'>
   <header><div><small>R293 PROOF-DIRECTED FRONTIER · RESEARCH PLANNING ONLY</small><b>{proofEvolution.frontier.length} highest-priority carried scar{proofEvolution.frontier.length===1?'':'s'} · {proofEvolution.claimLabel}</b></div></header>
   <div className='r240-cell-list'>{proofEvolution.frontier.map((row:any,index:number)=><article key={row.id}><span className='rank'>{index+1}</span><div><b>{row.id} · {row.operation.replaceAll('_',' ')}</b><p>{row.objective}</p><small>{row.address.organ.replaceAll('_',' ')} · address {row.address.address} · lanes {row.address.laneStart}–{row.address.laneEnd} · priority {row.priority.toFixed(3)} · scar {row.kind}/{row.status}</small></div></article>)}</div>
  </section>}
  <section className='r240-frontier'>
   <header><div><small>CURRENT CONCRETE R170 ROADMAP · R240 SPARSE SOURCE FRONTIER</small><b>{state?`${frontier.length} dependency-ready concrete cell${frontier.length===1?'':'s'} · generation ${state.generation}/${state.maxAutonomousGenerations}`:'loading governed state'}</b></div></header>
   {error&&<div className='r240-error'><TriangleAlert/>{error}</div>}
   <div className='r240-cell-list'>{frontier.map((row,index)=><article key={row.id}><span className='rank'>{index+1}</span><div><b>{row.id} · {row.title}</b><p>{row.objective}</p><small>{row.target} · risk {row.risk} · structural score {score(row).toFixed(3)} · deps {(row.prerequisites||[]).join(', ')||'none'}</small></div></article>)}{state&&!frontier.length&&<p className='empty'>No dependency-ready concrete capsule exists. R240 remains OBSERVE_ONLY instead of inventing source work.</p>}</div>
  </section>
  <footer><ShieldCheck/><span>R293 proof work is a deterministic investigation frontier, not a shadow source-mutation queue. The concrete R170 roadmap remains separately governed. R239 governs Hybrid host resource pressure; R147 remains dispatch authority, R141 exact Hybrid return authority, R146 durable history authority, R240/R245 govern source promotion, ci.yml is the sole canonical production writer, and R125 sole CanonState admission authority.</span></footer>
 </section>;
}
