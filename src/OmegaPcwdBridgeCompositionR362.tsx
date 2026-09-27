import{useState}from'react';
import{GitMerge,Play}from'lucide-react';
import{PCWD_PROFILE_BUILDERS}from'./system/pcwdSemanticProfiles';
import{QUBIT,type Matrix2V1}from'./system/proofCarryingWovenSpecializations';
import{qubitToLossyResolutionLensBridgeV1,qubitToResolutionLensBridgeV1}from'./system/pcwdInterDomainBridge';
import{executeComposedInterDomainBridgeV1,resolutionLensToVector8BridgeV1,type BridgeCompositionReceiptV1}from'./system/pcwdBridgeComposition';
import'./pcwdBridgeCompositionR362.css';

type View={valid:BridgeCompositionReceiptV1;negative:BridgeCompositionReceiptV1};

export default function OmegaPcwdBridgeCompositionR362(){
 const[state,setState]=useState<'idle'|'running'|'done'|'error'>('idle');
 const[view,setView]=useState<View|null>(null);
 const[error,setError]=useState('');
 const evaluate=async()=>{
  if(state==='running')return;setState('running');setError('');
  try{
   const[pQubit,pLens,pVector]=await Promise.all([PCWD_PROFILE_BUILDERS.qubit(),PCWD_PROFILE_BUILDERS.lens(),PCWD_PROFILE_BUILDERS.vector8()]);
   const rho:Matrix2V1=[QUBIT.c(.5),QUBIT.c(0,-.5),QUBIT.c(0,.5),QUBIT.c(.5)];
   const second=resolutionLensToVector8BridgeV1(pLens,pVector);
   const[valid,negative]=await Promise.all([
    executeComposedInterDomainBridgeV1(qubitToResolutionLensBridgeV1(pQubit,pLens),second,rho),
    executeComposedInterDomainBridgeV1(qubitToLossyResolutionLensBridgeV1(pQubit,pLens),second,rho),
   ]);
   setView({valid,negative});setState('done');
  }catch(e){setError(e instanceof Error?e.message:String(e));setState('error')}
 };
 return <section className='r362-compose' data-r362-composition='OMEGA_PCWD_BRIDGE_COMPOSITION_v1'>
  <header><div><span>R362 · BRIDGE COMPOSITION</span><h3>Compose translations without erasing loss</h3><p>Two typed bridges carry their own receipts. The composed path measures recovery back in the original source domain and unions every declared loss instead of adding unlike error units.</p></div><GitMerge/></header>
  <button type='button' onClick={evaluate} disabled={state==='running'}><Play/>{state==='running'?'Evaluating composition…':'Evaluate bridge composition'}</button>
  {error&&<p className='r362-error'>{error}</p>}
  {view&&<div className='r362-body'>
   <div className='r362-summary'>
    <article><small>VALID COMPOSITION</small><b>{view.valid.compositionEligible?'ELIGIBLE':'HOLD'}</b><span>end-to-end error {view.valid.endToEndRecoveryError.toExponential(2)}</span></article>
    <article><small>CUMULATIVE LOSSES</small><b>{view.valid.cumulativeLossLedger.length}</b><span>component entries retained with origin receipt</span></article>
    <article><small>LOSSY COMPONENT</small><b>{view.negative.compositionEligible?'UNEXPECTED PASS':'HOLD'}</b><span>{view.negative.cumulativeLossLedger.map(x=>x.kind).join(' · ')}</span></article>
   </div>
   <div className='r362-grid'>
    <article><b>Composition gates</b>{Object.entries(view.valid.gates).map(([k,v])=><span key={k}>{k} · {v?'pass':'fail'}</span>)}</article>
    <article><b>Monotone loss ledger</b>{view.valid.cumulativeLossLedger.map((x,i)=><span key={i}>{x.originBridge} · {x.kind} · {x.declared?'declared':'undeclared'}</span>)}</article>
    <article><b>Error semantics</b><span>{view.valid.errorAggregation}</span><span>cross-domain numeric addition · {String(view.valid.crossDomainErrorAdditionPerformed)}</span><span>semantic equivalence · {String(view.valid.semanticEquivalenceClaimed)}</span></article>
   </div>
   <footer>Composition preserves component failures. A held bridge cannot be made admissible merely by placing a valid bridge after it.</footer>
  </div>}
 </section>;
}
