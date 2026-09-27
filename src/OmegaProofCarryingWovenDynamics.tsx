import{useEffect,useState}from'react';
import{Activity,GitBranch,ShieldCheck,Workflow}from'lucide-react';
import{initCorpusPack}from'./corpusRuntime';
import{compileCanonicalTypedFieldR349}from'./system/wovenHardwareFieldR349';
import{executeProofCarryingWovenStepV1,type WovenStatePacketV1}from'./system/proofCarryingWovenDynamics';
import{applyUnitaryQubitLemmaV1,compileRscLoopReceiptV1,QUBIT,type Matrix2V1}from'./system/proofCarryingWovenSpecializations';
import'./proofCarryingWovenDynamics.css';

type Props={address:number;compact?:boolean};
type ViewState={packet:WovenStatePacketV1;rsc:ReturnType<typeof compileRscLoopReceiptV1>;quantum:Awaited<ReturnType<typeof applyUnitaryQubitLemmaV1>>};

const fmt=(n:number)=>Number.isFinite(n)?(Math.abs(n)<1e-3?n.toExponential(2):n.toFixed(6)):'—';

export default function OmegaProofCarryingWovenDynamics({address,compact=false}:Props){
 const[state,setState]=useState<ViewState|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  let disposed=false;
  (async()=>{
   try{
    setError('');
    await initCorpusPack();
    const field=compileCanonicalTypedFieldR349(0);
    const step=await executeProofCarryingWovenStepV1(field,{
     tick:0,address,orientation:1,transportRate:.125,
     evidence:{admissible:true,sources:['R349_CANONICAL_TYPED_FIELD','PCWD_DECLARED_SOFTWARE_OPERATOR'],support:1,authority:'SOFTWARE_MODEL_STATE_ONLY',observedClaim:false},
    });
    const rsc=compileRscLoopReceiptV1(step.packet);
    const s=1/Math.sqrt(2),z=QUBIT.c(0),one=QUBIT.c(1);
    const rho:Matrix2V1=[one,z,z,z],H:Matrix2V1=[QUBIT.c(s),QUBIT.c(s),QUBIT.c(s),QUBIT.c(-s)],Z:Matrix2V1=[one,z,z,QUBIT.c(-1)];
    const quantum=await applyUnitaryQubitLemmaV1(rho,H,[Z],1e-9);
    if(!disposed)setState({packet:step.packet,rsc,quantum});
   }catch(e){if(!disposed)setError(e instanceof Error?e.message:String(e))}
  })();
  return()=>{disposed=true};
 },[address]);
 const p=state?.packet;
 const gates=p?Object.entries(p.Pi_t.gates):[];
 if(compact)return <section className='pcwd pcwd-compact' data-pcwd='OMEGA_PROOF_CARRYING_WOVEN_DYNAMICS_v1'>
  <header><Workflow/><div><span>PCWD · PROOF-CARRYING WOVEN DYNAMICS</span><b>{p?(p.Pi_t.decision+' · '+gates.filter(([,v])=>v).length+'/8 gates'):'compiling state packet'}</b><small>{p?('Kₜ address '+p.A_t.address+' · proof '+p.Pi_t.proofDigest.slice(0,16)+'…'):'Sense → Normalize → Decompose → Lemma → Transport → Recover → Prove'}</small></div></header>
  {error&&<p className='pcwd-error'>{error}</p>}
 </section>;
 return <section className='pcwd' data-pcwd='OMEGA_PROOF_CARRYING_WOVEN_DYNAMICS_v1'>
  <header className='pcwd-head'><div><span>PROOF-CARRYING WOVEN DYNAMICS · Kₜ</span><h3>Equivalence → transport → residual → recovery → proof</h3><p>One software/model state-transport formalism. Compression cannot erase the residual needed for recovery, and no score can override a failed proof gate.</p></div><ShieldCheck/></header>
  {!p&&!error&&<div className='pcwd-loading'>Compiling canonical state packet…</div>}
  {error&&<div className='pcwd-error'>{error}</div>}
  {p&&<div className='pcwd-body'>
   <div className='pcwd-summary'>
    <article><span>DECISION</span><b>{p.Pi_t.decision}</b><small>S* {fmt(p.Pi_t.decisionScore)}</small></article>
    <article><span>ADDRESS</span><b>{p.A_t.digits.join('·')}</b><small>{p.A_t.address}/20,735 · base 12</small></article>
    <article><span>LEMMA</span><b>Z₂ quotient + residual</b><small>partner {p.L_t.partnerAddress}</small></article>
    <article><span>PROOF</span><b>{p.Pi_t.promotionEligible?'PROMOTION ELIGIBLE':'HELD'}</b><small>{p.Pi_t.proofDigest.slice(0,20)}…</small></article>
   </div>
   <div className='pcwd-pipeline' aria-label='PCWD transport pipeline'>{p.stages.map(s=><article key={s.stage} data-state={s.status}><b>{s.stage}</b><span>{s.status}</span><small>{s.detail}</small></article>)}</div>
   <div className='pcwd-columns'>
    <section><header><ShieldCheck/><b>Eight promotion gates</b></header><div className='pcwd-gates'>{gates.map(([k,v])=><span key={k} data-pass={v?'true':'false'}><i/>{k.replace(/([A-Z])/g,' $1')}</span>)}</div></section>
    <section><header><Activity/><b>Error / path receipt</b></header><dl>
     <div><dt>recovery ε</dt><dd>{fmt(p.Pi_t.errors.recovery)}</dd></div>
     <div><dt>dynamics ε</dt><dd>{fmt(p.Pi_t.errors.dynamics)}</dd></div>
     <div><dt>observable ε</dt><dd>{fmt(p.Pi_t.errors.observables)}</dd></div>
     <div><dt>loop / holonomy residual</dt><dd>{fmt(p.Pi_t.errors.holonomy)}</dd></div>
     <div><dt>scar Δ</dt><dd>{fmt(p.Sigma_t.scarDelta)}</dd></div>
    </dl></section>
   </div>
   <section className='pcwd-rsc'><header><GitBranch/><div><b>Relational Skin Calculus receipt</b><small>same proof digest carried through the eight-phase loop</small></div></header><div>{state!.rsc.phases.map(x=><span key={x.phase}><b>{x.index}</b><em>{x.phase}</em></span>)}</div></section>
   <details className='pcwd-details'><summary>Mathematical specialization proof</summary><div className='pcwd-quantum'><b>2×2 unitary density-matrix adapter</b><span>{state!.quantum.promotionEligible?'PASS':'HOLD'} · recovery {fmt(state!.quantum.recoveryError)} · observable {fmt(state!.quantum.observableError)} · fidelity {fmt(state!.quantum.fidelity)}</span><small>Standard quantum mechanics specialization only; this is a software/mathematical self-test and is not a claim of new physics.</small></div></details>
  </div>}
  <footer><b>Truth boundary</b><span>{p?.boundary||'PCWD adds no physical primitive and cannot mutate CanonState or production authority.'}</span></footer>
 </section>;
}
