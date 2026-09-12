import {useEffect,useMemo,useState} from 'react';
import {Boxes,GitBranch,Network,ShieldCheck,Sparkles,TriangleAlert} from 'lucide-react';
import {R240_CONTINUITY_OPERATOR,R240_ORGANS,R240_RESOLUTION} from './system/recursiveSelfBuildR240';
import {activeProofEvolutionSnapshotR293} from './proof/proofEvolutionRuntimeR293.js';
import {activeProofReturnSnapshotR294} from './proof/proofReturnRuntimeR294.js';
import {activeProofAdmissionSnapshotR295} from './proof/proofAdmissionRuntimeR295.js';
import './recursiveSelfBuildR240.css';

type RoadmapCell={id:string;title:string;objective:string;target:string;risk:string;prerequisites:string[];expectedGain:number;complexity:number;contradictionRisk:number};
type BuildState={generation:number;maxAutonomousGenerations:number;currentCapsuleId:string|null;admittedSourceCapsules:string[];roadmap:RoadmapCell[]};
type PromotionPolicy={state?:string;selfPromotion?:{enabled?:boolean};truthBoundary?:string};
const riskFactor=(risk:string)=>risk==='LOW'?1:risk==='MEDIUM'?.7:risk==='HIGH'?.35:.1;
const score=(row:RoadmapCell)=>Number(row.expectedGain||0)/Math.max(.01,Number(row.complexity||0)+Number(row.contradictionRisk||0))*riskFactor(row.risk);

export default function RecursiveSelfBuildR240(){
 const[state,setState]=useState<BuildState|null>(null),[policy,setPolicy]=useState<PromotionPolicy|null>(null),[error,setError]=useState(''),[proofEpoch,setProofEpoch]=useState(0);
 useEffect(()=>{let mounted=true;Promise.all([fetch('/omega-r170-selfbuild-state.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`self-build state ${r.status}`);return r.json()}),fetch('/omega-r240-recursive-exact-self-promotion.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`R240 policy ${r.status}`);return r.json()})]).then(([s,p])=>{if(mounted){setState(s);setPolicy(p);setError('')}}).catch(e=>{if(mounted)setError(e?.message||String(e))});return()=>{mounted=false}},[]);
 useEffect(()=>{const refresh=()=>setProofEpoch(x=>x+1);window.addEventListener('omega-r292-proof-carry-changed',refresh);window.addEventListener('omega-r294-proof-return-changed',refresh);return()=>{window.removeEventListener('omega-r292-proof-carry-changed',refresh);window.removeEventListener('omega-r294-proof-return-changed',refresh)}},[]);
 const admitted=useMemo(()=>new Set(state?.admittedSourceCapsules||[]),[state]);
 const frontier=useMemo(()=>[...(state?.roadmap||[])].filter(row=>!admitted.has(row.id)&&(row.prerequisites||[]).every(id=>admitted.has(id))).sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id)).slice(0,12),[state,admitted]);
 const proofEvolution=useMemo(()=>activeProofEvolutionSnapshotR293(),[proofEpoch]);
 const proofReturn=useMemo(()=>activeProofReturnSnapshotR294(),[proofEpoch]);
 const proofAdmission=useMemo(()=>activeProofAdmissionSnapshotR295(),[proofEpoch]);
 const promotionEnabled=policy?.selfPromotion?.enabled===true;
 return <section className='r240-selfbuild' aria-label='R240 recursive exact self-promotion fabric' data-r240-recursive-selfbuild='EVIDENCE_BOUND_SPARSE_PLAN_EXACT_PROMOTION'>
  <header><div><span>R240 · FULL OVERALL CANON · RECURSIVE SELF-BUILD + EXACT PROMOTION · R293/R294/R295 PROOF EVOLUTION</span><h3>Build, prove, carry scars, return evidence, compile admission — without collapsing the gates.</h3><p>R293 turns unresolved proof obligations into deterministic research work. R294 binds returned artifacts to exact domain/proof/evolution/scar identity. R295 compiles accepted returns into review-only source-admission proposals against a registered domain adapter. It still does not edit proof source, close theorem truth, or overwrite the governed R170 source roadmap.</p></div><Sparkles/></header>
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
   <article className={proofReturn.returnedPendingAdmission||proofReturn.unverifiedCount||proofReturn.staleCount||proofReturn.rejectedCount?'hold':'pass'}><ShieldCheck/><span><small>R294 RETURN RECONCILIATION</small><b>{proofReturn.bound?`${proofReturn.readyCount} READY · ${proofReturn.waitingCount} WAITING`:'NEUTRAL · NO PROOF BOUND'}</b><em>{proofReturn.bound?`${proofReturn.returnedPendingAdmission} returned pending source admission · truth closures ${proofReturn.truthClosureCount}`:'no returned-work ledger applied'}</em></span></article>
   <article className={proofAdmission.proposalCount?'hold':'pass'}><ShieldCheck/><span><small>R295 PROOF SOURCE ADMISSION</small><b>{proofAdmission.bound?`${proofAdmission.proposalCount} PROPOSALS · ${proofAdmission.reviewReadyCount} REVIEW-READY`:'NEUTRAL · NO PROOF BOUND'}</b><em>{proofAdmission.proposalCount&&!proofAdmission.baseBound?'browser view · exact base SHA required for review-ready state':proofAdmission.adapterRegistered?'registered domain adapter':'adapter not registered'}</em></span></article>
  </div>
  {proofEvolution.bound&&<section className='r240-frontier r293-proof-frontier'>
   <header><div><small>R293 PROOF-DIRECTED FRONTIER · R294 RETURN-AWARE · RESEARCH PLANNING ONLY</small><b>{proofReturn.readyFrontier.length} ready carried scar{proofReturn.readyFrontier.length===1?'':'s'} · {proofEvolution.claimLabel}</b></div></header>
   <div className='r240-cell-list'>{proofReturn.readyFrontier.map((row:any,index:number)=><article key={row.id}><span className='rank'>{index+1}</span><div><b>{row.id} · {row.operation.replaceAll('_',' ')}</b><p>{row.objective}</p><small>{row.address.organ.replaceAll('_',' ')} · address {row.address.address} · lanes {row.address.laneStart}–{row.address.laneEnd} · priority {row.priority.toFixed(3)} · scar {row.kind}/{row.status}</small></div></article>)}{!proofReturn.readyFrontier.length&&proofReturn.waitingCount>0&&<p className='empty'>All current proof-work cells have matched returned artifacts pending domain-adapter admission. The underlying proof scars remain unresolved until the proof source is updated and recompiled.</p>}</div>
  </section>}
  {proofReturn.bound&&proofReturn.waitingCount>0&&<section className='r240-frontier r294-return-frontier'>
   <header><div><small>R294 RETURNED EVIDENCE · PENDING SOURCE-LEVEL ADMISSION</small><b>{proofReturn.waitingCount} work cell{proofReturn.waitingCount===1?'':'s'} paused from duplicate scheduling · 0 theorem gates auto-closed</b></div></header>
   <div className='r240-cell-list'>{proofReturn.pendingAdmission.slice(0,12).map((row:any,index:number)=><article key={row.receipt.receiptId}><span className='rank'>{index+1}</span><div><b>{row.cell.id} · {row.receipt.evidenceClass.replaceAll('_',' ')}</b><p>{row.reason}</p><small>{row.receipt.verifierState.replaceAll('_',' ')} · {row.receipt.evidenceDigest} · outcome {row.receipt.outcome.replaceAll('_',' ')}</small></div></article>)}</div>
  </section>}
  {proofAdmission.bound&&proofAdmission.proposalCount>0&&<section className='r240-frontier r295-admission-frontier'>
   <header><div><small>R295 PROOF SOURCE ADMISSION · REVIEW PROPOSALS ONLY</small><b>{proofAdmission.actionableCount} actionable · {proofAdmission.reviewReadyCount} review-ready · {proofAdmission.blockedCount} blocked · truth closures {proofAdmission.truthClosureCount}</b></div></header>
   <div className='r240-cell-list'>{proofAdmission.proposals.slice(0,12).map((row:any,index:number)=><article key={row.proposalFingerprint}><span className='rank'>{index+1}</span><div><b>{row.status.replaceAll('_',' ')} · {row.mutationScope.replaceAll('_',' ')}</b><p>{row.adapterRegistered?`Registered adapter ${row.adapterPath}`:'No registered proof-domain adapter; admission fails closed.'}</p><small>{row.workCellId} · {row.evidenceClass.replaceAll('_',' ')} · base {row.baseSha||'NOT BOUND'} · review {row.reviewReady?'READY':'HOLD'} · source mutation authority remains false</small></div></article>)}</div>
  </section>}
  <section className='r240-frontier'>
   <header><div><small>CURRENT CONCRETE R170 ROADMAP · R240 SPARSE SOURCE FRONTIER</small><b>{state?`${frontier.length} dependency-ready concrete cell${frontier.length===1?'':'s'} · generation ${state.generation}/${state.maxAutonomousGenerations}`:'loading governed state'}</b></div></header>
   {error&&<div className='r240-error'><TriangleAlert/>{error}</div>}
   <div className='r240-cell-list'>{frontier.map((row,index)=><article key={row.id}><span className='rank'>{index+1}</span><div><b>{row.id} · {row.title}</b><p>{row.objective}</p><small>{row.target} · risk {row.risk} · structural score {score(row).toFixed(3)} · deps {(row.prerequisites||[]).join(', ')||'none'}</small></div></article>)}{state&&!frontier.length&&<p className='empty'>No dependency-ready concrete capsule exists. R240 remains OBSERVE_ONLY instead of inventing source work.</p>}</div>
  </section>
  <footer><ShieldCheck/><span>R293 proof work is a deterministic investigation frontier, not a shadow source-mutation queue. R294 may mark an exact returned artifact as pending admission without changing R292 proof support. R295 may compile that return into a registered-adapter review proposal, but source mutation authority remains false and the domain proof adapter must still be changed through the governed source path and fully re-tested before any scar can disappear. The concrete R170 roadmap remains separately governed. R239 governs Hybrid host resource pressure; R147 remains dispatch authority, R141 exact Hybrid return authority, R146 durable history authority, R240/R245 govern source promotion, ci.yml is the sole canonical production writer, and R125 sole CanonState admission authority.</span></footer>
 </section>;
}
