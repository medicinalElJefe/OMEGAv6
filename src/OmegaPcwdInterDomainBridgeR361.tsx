import{useState}from'react';
import{ArrowRightLeft,Play}from'lucide-react';
import{PCWD_PROFILE_BUILDERS}from'./system/pcwdSemanticProfiles';
import{QUBIT,type Matrix2V1}from'./system/proofCarryingWovenSpecializations';
import{executeInterDomainBridgeV1,qubitToLossyResolutionLensBridgeV1,qubitToResolutionLensBridgeV1,type InterDomainBridgeReceiptV1}from'./system/pcwdInterDomainBridge';
import'./pcwdInterDomainBridgeR361.css';

type View={valid:InterDomainBridgeReceiptV1;negative:InterDomainBridgeReceiptV1};

export default function OmegaPcwdInterDomainBridgeR361(){
 const[state,setState]=useState<'idle'|'running'|'done'|'error'>('idle');
 const[view,setView]=useState<View|null>(null);
 const[error,setError]=useState('');
 const evaluate=async()=>{
  if(state==='running')return;setState('running');setError('');
  try{
   const[pQubit,pLens]=await Promise.all([PCWD_PROFILE_BUILDERS.qubit(),PCWD_PROFILE_BUILDERS.lens()]);
   const rho:Matrix2V1=[QUBIT.c(.5),QUBIT.c(0,-.5),QUBIT.c(0,.5),QUBIT.c(.5)];
   const[valid,negative]=await Promise.all([
    executeInterDomainBridgeV1(qubitToResolutionLensBridgeV1(pQubit,pLens),rho),
    executeInterDomainBridgeV1(qubitToLossyResolutionLensBridgeV1(pQubit,pLens),rho),
   ]);
   setView({valid,negative});setState('done');
  }catch(e){setError(e instanceof Error?e.message:String(e));setState('error')}
 };
 return <section className='r361-bridge' data-r361-bridge='OMEGA_PCWD_TYPED_INTERDOMAIN_BRIDGE_v1'>
  <header><div><span>R361 · TYPED INTER-DOMAIN BRIDGE</span><h3>Translation is not semantic equivalence</h3><p>Move a standard-QM 2×2 matrix through a generic recoverable real-vector lens while retaining invariant, loss, recovery, and authority receipts.</p></div><ArrowRightLeft/></header>
  <button type='button' onClick={evaluate} disabled={state==='running'}><Play/>{state==='running'?'Evaluating typed bridge…':'Evaluate typed bridge'}</button>
  {error&&<p className='r361-error'>{error}</p>}
  {view&&<div className='r361-body'>
   <div className='r361-summary'>
    <article><small>RECOVERABLE BRIDGE</small><b>{view.valid.bridgeEligible?'ELIGIBLE':'HOLD'}</b><span>recovery {view.valid.recoveryError.toExponential(2)}</span></article>
    <article><small>DELETED RESIDUAL</small><b>{view.negative.bridgeEligible?'UNEXPECTED PASS':'HOLD'}</b><span>recovery {view.negative.recoveryError.toExponential(2)}</span></article>
    <article><small>SEMANTIC EQUIVALENCE</small><b>{view.valid.semanticEquivalenceClaimed?'CLAIMED':'NOT CLAIMED'}</b><span>authority transferred: {String(view.valid.semanticAuthorityTransferred)}</span></article>
   </div>
   <div className='r361-grid'>
    <article><b>Invariant map</b>{view.valid.invariants.map(x=><span key={x.id}>{x.id} · error {x.error.toExponential(2)} · {x.preserved?'preserved':'failed'}</span>)}</article>
    <article><b>Loss ledger</b>{view.valid.lossLedger.map((x,i)=><span key={i}>{x.kind} · {x.declared?'declared':'undeclared'} · {x.detail}</span>)}</article>
    <article><b>Fail-closed negative control</b>{Object.entries(view.negative.gates).map(([k,v])=><span key={k}>{k} · {v?'pass':'fail'}</span>)}</article>
   </div>
   <footer>The lens is a representation carrier only. Exact coefficient recovery does not turn the lens into a quantum state, measurement, or physical-law claim.</footer>
  </div>}
 </section>;
}
