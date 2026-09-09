import {useEffect,useMemo,useState} from 'react';
import {BrainCircuit,GitBranch,ShieldCheck,TriangleAlert} from 'lucide-react';
import {getMandala20736Field,type Mandala20736Field} from './mandala20736Runtime';
import {compileCognitiveAuthorityFrameR241} from './cognitiveAuthorityR241';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import {latestReturnedHostProofR239,resourceEnvelopeR239} from './hybridResourceGovernorR239';
import {compileTransitionCompilerR245} from './transitionCompilerR245';
import './hybridTransitionCompilerR245.css';

const ACTIVE=new Set(['QUEUED','RUNNING']);
const clampAddress=(v:any)=>Math.max(0,Math.min(20735,Math.floor(Number(v)||0)));
const readAddress=()=>{try{return clampAddress(localStorage.getItem('omega.v6.address')||11498)}catch{return 11498}};
const f=(v:number,d=3)=>Number.isFinite(v)?v.toFixed(d):'—';

export default function HybridTransitionCompilerR245(){
 const{device,selectedDeviceJobs,epoch,stale,observedAt}=useHybridRuntimeSnapshotR238();
 const[field,setField]=useState<Mandala20736Field|null>(null),[address,setAddress]=useState(readAddress),[error,setError]=useState('');
 useEffect(()=>{let live=true;getMandala20736Field().then(x=>{if(live)setField(x)}).catch(e=>{if(live)setError(e instanceof Error?e.message:String(e))});const id=window.setInterval(()=>setAddress(readAddress()),850);return()=>{live=false;window.clearInterval(id)}},[]);
 const proof=useMemo(()=>latestReturnedHostProofR239(selectedDeviceJobs,String(device?.id||'')),[selectedDeviceJobs,device?.id]);
 const activeNativeWork=useMemo(()=>selectedDeviceJobs.some((job:any)=>ACTIVE.has(String(job?.status||'').toUpperCase())),[selectedDeviceJobs]);
 const envelope=useMemo(()=>resourceEnvelopeR239({profile:proof?.profile||null,snapshotCurrent:Boolean(epoch>0&&!stale),activeNativeWork}),[proof?.profile,epoch,stale,activeNativeWork]);
 const cognition=useMemo(()=>field?compileCognitiveAuthorityFrameR241(field,address):null,[field,address]);
 const compiled=useMemo(()=>field&&cognition?compileTransitionCompilerR245({field,address,resourceEnvelope:envelope,proposals:[{id:'R241_TYPED_ROUTE',targetAddress:cognition.routeCandidate,confidence:cognition.evidence,rationale:'R241 typed cognition route candidate',origin:'R241'}]}):null,[field,address,envelope,cognition]);
 const best=compiled?.best||null,state=best?.disposition||(field?'HOLD':'UNPROVED'),ready=Boolean(best?.authorizationEligible),host=String(device?.name||device?.id||'NO PROVED HOST');
 return <section className={`r245-transition ${ready?'ready':'hold'}`} data-r245-transition={state} data-r245-target={best?String(best.targetAddress+1):'NONE'} data-r245-resource-tier={compiled?.resourceTier||envelope.tier} data-r245-snapshot-epoch={epoch} data-r245-authority='PROPOSAL_ONLY_EXISTING_AUTHORIZATION_REQUIRED'>
  <header><div>{ready?<ShieldCheck/>:<TriangleAlert/>}<span><small>R245 · CONSTRAINED TRANSITION COMPILER</small><b>{state.replaceAll('_',' ')}</b></span></div><em>{host} · EPOCH {epoch||'—'}</em></header>
  {best?<>
   <div className='r245-transition-grid'>
    <article><GitBranch/><small>BEST LAWFUL PATH</small><b>S{compiled!.sourceStateId} → S{best.targetAddress+1}</b><span>{best.stateIds.length} states · rank {best.rank}/{compiled!.candidateCount}</span></article>
    <article><BrainCircuit/><small>OBJECTIVE</small><b>{f(best.objectiveCost,4)}</b><span>deterministic {f(best.deterministicCost,4)} · proposal credit {f(best.proposalCredit,4)}</span></article>
    <article><small>EVIDENCE / SCAR</small><b>{f(best.metrics.evidenceFloor)} / {f(best.metrics.scarCost)}</b><span>residual {f(best.metrics.finalResidual)} · improve {f(best.metrics.improvement)}</span></article>
    <article><small>CALIBRATION / GRADIENT</small><b>{f(best.metrics.calibrationConfidence)} / {f(best.metrics.gradientAlignment)}</b><span>RMSE {f(best.metrics.calibrationRmse)} · resource {compiled!.resourceTier}</span></article>
   </div>
   <div className='r245-transition-chain'>{best.stateIds.slice(0,12).map((id,i)=><span key={`${id}-${i}`}>S{id}</span>)}</div>
   {best.holds.length>0&&<div className='r245-transition-holds'><b>HOLDS</b>{best.holds.map(x=><span key={x}>{x.replaceAll('_',' ')}</span>)}</div>}
   <footer><ShieldCheck/>AI/R241 may propose or support a candidate, but cannot remove evidence/calibration/resource holds. R147 dispatch remains downstream of existing authorization; R141 proves the exact return; R146 keeps history; R125 alone admits CanonState.</footer>
  </>:<div className='r245-transition-empty'><TriangleAlert/><span><b>{error||'No lawful R185 transition candidate is currently compiled.'}</b><small>R245 does not synthesize a path when the bounded state search has no admissible candidate.</small></span></div>}
  <small className='r245-transition-truth'>Observed {observedAt?new Date(observedAt).toLocaleTimeString():'—'} · one R238 durable-state epoch · R185 Pareto · R186 Hessian/principal directions · R187 re-linearized calibration · R239 selected-host envelope · R241 cognition/proposal only.</small>
 </section>;
}
