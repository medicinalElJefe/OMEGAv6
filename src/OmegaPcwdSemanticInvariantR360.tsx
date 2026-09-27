import{useState}from'react';
import{GitCompareArrows,Play}from'lucide-react';
import{compileCanonicalTypedFieldR349}from'./system/wovenHardwareFieldR349';
import{executeProofCarryingWovenStepV1}from'./system/proofCarryingWovenDynamics';
import{QUBIT,type Matrix2V1}from'./system/proofCarryingWovenSpecializations';
import{runQubitThroughUnifiedKernelV1,runR349PacketThroughUnifiedKernelV1,runResolutionLensThroughUnifiedKernelV1}from'./system/unifiedProofTransportAdapters';
import{PCWD_PROFILE_BUILDERS,compileCrossDomainInvariantProjectionV1,compareCrossDomainInvariantShapeV1,metricCompatibilityV1}from'./system/pcwdSemanticProfiles';
import'./pcwdSemanticInvariantR360.css';

type Result={
 domains:string[];
 structuralEqual:boolean;
 rawMetricComparisonAttempted:false;
 continuityComparisons:string[];
 common:string[];
 excluded:string[];
};

export default function OmegaPcwdSemanticInvariantR360(){
 const[state,setState]=useState<'idle'|'running'|'done'|'error'>('idle');
 const[result,setResult]=useState<Result|null>(null);
 const[error,setError]=useState('');
 const run=async()=>{
  if(state==='running')return;setState('running');setError('');
  try{
   const field=compileCanonicalTypedFieldR349(0,a=>({continuity:.91,plasticity:.82,burden:.04,contradiction:.02,scar:(a%5)/100,evidence:.98,invariantCarry:.55,motionRate:.12,support:.96,orientation:(a%2?1:-1) as -1|1}));
   const base=await executeProofCarryingWovenStepV1(field,{tick:3,address:20736,orientation:1,transportRate:.125,evidence:{admissible:true,sources:['R360_UI'],support:1,authority:'UI_SELF_TEST',observedClaim:false}});
   const r349=await runR349PacketThroughUnifiedKernelV1(base.packet);
   const lens=await runResolutionLensThroughUnifiedKernelV1({values:[1,1,2,4,8,8,7,3,5,9,2,6],targetCount:3,evidenceAdmissible:true,address:'R360:UI:LENS'});
   const s=1/Math.sqrt(2),z=QUBIT.c(0),one=QUBIT.c(1);
   const rho:Matrix2V1=[one,z,z,z],H:Matrix2V1=[QUBIT.c(s),QUBIT.c(s),QUBIT.c(s),QUBIT.c(-s)];
   const qubit=await runQubitThroughUnifiedKernelV1({rho,unitary:H,evidenceAdmissible:true,address:'R360:UI:QUBIT'});
   const[p1,p2,p3]=await Promise.all([PCWD_PROFILE_BUILDERS.r349(),PCWD_PROFILE_BUILDERS.lens(),PCWD_PROFILE_BUILDERS.qubit()]);
   const[x1,x2,x3]=await Promise.all([compileCrossDomainInvariantProjectionV1(r349,p1),compileCrossDomainInvariantProjectionV1(lens,p2),compileCrossDomainInvariantProjectionV1(qubit,p3)]);
   const a=compareCrossDomainInvariantShapeV1(x1,x2),b=compareCrossDomainInvariantShapeV1(x2,x3);
   const c1=metricCompatibilityV1(p1.governanceMetrics.continuity,p2.governanceMetrics.continuity);
   const c2=metricCompatibilityV1(p2.governanceMetrics.continuity,p3.governanceMetrics.continuity);
   setResult({
    domains:[x1.domain,x2.domain,x3.domain],
    structuralEqual:a.structuralContractEqual&&b.structuralContractEqual,
    rawMetricComparisonAttempted:false,
    continuityComparisons:[c1.reason,c2.reason],
    common:a.comparableFields,
    excluded:a.intentionallyIncomparableFields,
   });
   setState('done');
  }catch(e){setError(e instanceof Error?e.message:String(e));setState('error')}
 };
 return <section className='r360-semantic' data-r360-semantic-layer='OMEGA_PCWD_DOMAIN_SEMANTICS_PROFILE_v1'>
  <header><div><span>R360 · SEMANTIC SEPARATION</span><h3>Common proof topology without false numerical equivalence</h3><p>Structural invariants may cross domains. Raw state, continuity, burden, error, evidence, scar, path and observable values stay domain-local unless their semantic profiles explicitly match.</p></div><GitCompareArrows/></header>
  <button type='button' onClick={run} disabled={state==='running'}><Play/>{state==='running'?'Running structural proof…':'Run cross-domain semantic proof'}</button>
  {error&&<p className='r360-error'>{error}</p>}
  {result&&<div className='r360-body'>
   <div className='r360-summary'>
    <article><small>DOMAINS</small><b>{result.domains.length}</b><span>R349 · lens · qubit</span></article>
    <article><small>STRUCTURAL CONTRACT</small><b>{result.structuralEqual?'MATCH':'HOLD'}</b><span>7 stages · 8 gates · integrity linkage</span></article>
    <article><small>RAW METRIC COMPARISON</small><b>{result.rawMetricComparisonAttempted?'ATTEMPTED':'BLOCKED'}</b><span>{result.continuityComparisons.join(' · ')}</span></article>
   </div>
   <div className='r360-columns'><article><b>Cross-domain structural fields</b>{result.common.map(x=><span key={x}>{x}</span>)}</article><article><b>Intentionally domain-local</b>{result.excluded.map(x=><span key={x}>{x}</span>)}</article></div>
   <footer>Same slot name ≠ same quantity. A semantic bridge must declare translation, units, invariants, loss and recovery before values can cross domains.</footer>
  </div>}
 </section>;
}
