import{compileCanonicalTypedFieldR349}from'./wovenHardwareFieldR349';
import{compileForecastBranchesV1}from'./proofCarryingWovenDynamics';
import{
  QUBIT,compileResolutionLensV1,recoverResolutionLensV1,propagateCovarianceV1,
  type Matrix2V1,
}from'./proofCarryingWovenSpecializations';
import{
  compileCompactProofIndexV1,executeUnifiedProofTransportV1,verifyCompactProofIndexV1,verifyUnifiedProofTransportV1,
  type UnifiedDomainContractV1,
}from'./unifiedProofTransportKernel';
import{runQubitThroughUnifiedKernelV1}from'./unifiedProofTransportAdapters';

export const PCWD_BENCHMARK_SCHEMA='OMEGA_PCWD_BENCHMARK_SUITE_v1' as const;
export const PCWD_BENCHMARK_BOUNDARY='This suite compares PCWD against explicit minimal baselines defined in this file. It does not claim that those baselines represent every conventional method, does not establish scientific novelty, and does not turn internal benchmark success into external validation.' as const;

export type BenchmarkVerdict='WIN'|'TIE'|'COST'|'EXPECTED_HOLD'|'LIMIT';
export type BenchmarkResultV1={
  id:string;
  problem:string;
  baseline:string;
  verdict:BenchmarkVerdict;
  pcwdPass:boolean;
  baselinePass:boolean;
  metrics:Record<string,number|boolean|string|null>;
  retainedByPCWD:string[];
  discardedByBaseline:string[];
  interpretation:string;
};
export type BenchmarkSuiteV1={
  schema:typeof PCWD_BENCHMARK_SCHEMA;
  revision:'R358';
  results:BenchmarkResultV1[];
  summary:{
    total:number;
    wins:number;
    ties:number;
    costs:number;
    expectedHolds:number;
    limits:number;
    pcwdPassCount:number;
    baselinePassCount:number;
    additionalInformationCategories:string[];
  };
  boundary:typeof PCWD_BENCHMARK_BOUNDARY;
};

const abs=(n:number)=>Math.abs(Number(n)||0);
const sq=(n:number)=>n*n;
const rmse=(a:number[],b:number[])=>Math.sqrt(a.reduce((s,v,i)=>s+sq(v-(b[i]??0)),0)/Math.max(1,a.length));
const l2=(a:number[])=>Math.sqrt(a.reduce((s,v)=>s+v*v,0));
const bytes=(v:unknown)=>new TextEncoder().encode(JSON.stringify(v)).byteLength;
const maxAbs=(a:number[])=>a.reduce((m,v)=>Math.max(m,abs(v)),0);
const frobenius=(a:number[][],b:number[][])=>Math.sqrt(a.reduce((s,row,i)=>s+row.reduce((q,v,j)=>q+sq(v-(b[i]?.[j]??0)),0),0));
const mul=(a:number[][],b:number[][])=>a.map(row=>b[0].map((_,j)=>row.reduce((s,v,k)=>s+v*b[k][j],0)));
const transpose=(a:number[][])=>a[0].map((_,j)=>a.map(r=>r[j]));
const unique=<T>(xs:T[])=>[...new Set(xs)];

function expandCoarseOnly(coarse:number[],binSize:number){
  return coarse.flatMap(v=>Array(binSize).fill(v));
}

async function benchmarkResolutionRecovery():Promise<BenchmarkResultV1>{
  const signals=[
    [1,1,1,1,2,3,4,5,10,10,10,10],
    [0,0,0,12,0,0,0,0,0,0,0,0],
    [1,-1,1,-1,1,-1,1,-1,1,-1,1,-1],
    [0,1,2,3,4,5,6,7,8,9,10,11],
  ];
  let baselineRmse=0,pcwdRmse=0,residualEnergy=0,baselineBytes=0,pcwdBytes=0;
  for(const values of signals){
    const lens=compileResolutionLensV1(values,3);
    const recovered=recoverResolutionLensV1(lens);
    const baseline=expandCoarseOnly(lens.coarse,lens.binSize);
    baselineRmse+=rmse(values,baseline);
    pcwdRmse+=rmse(values,recovered);
    residualEnergy+=l2(lens.residual);
    baselineBytes+=bytes({coarse:lens.coarse,binSize:lens.binSize});
    pcwdBytes+=bytes({coarse:lens.coarse,residual:lens.residual,binSize:lens.binSize});
  }
  baselineRmse/=signals.length;pcwdRmse/=signals.length;residualEnergy/=signals.length;
  return{
    id:'RECOVERABLE_RESOLUTION_LENS',
    problem:'Lossy coarse-graining / round-trip reconstruction',
    baseline:'COARSE_ONLY_BLOCK_MEAN',
    verdict:pcwdRmse<=1e-12&&baselineRmse>1e-6?'WIN':'TIE',
    pcwdPass:pcwdRmse<=1e-12,
    baselinePass:baselineRmse<=1e-12,
    metrics:{
      signalCount:signals.length,baselineMeanRmse:baselineRmse,pcwdMeanRmse:pcwdRmse,
      retainedResidualL2:residualEnergy,baselineBytes,pcwdBytes,storageOverheadRatio:pcwdBytes/Math.max(1,baselineBytes),
    },
    retainedByPCWD:['coarse representative','explicit residual sidecar','exact round-trip reconstruction'],
    discardedByBaseline:['within-bin residual','high-frequency/impulse detail'],
    interpretation:'PCWD does not make lossy reduction lossless by magic; exact recovery comes from explicitly retaining the discarded residual. The measurable cost is additional storage.',
  };
}

type PathInput={start:[number,number];steps:Array<'R'|'L'|'U'|'D'>;evidence:boolean;id:string};
type PathTrace={start:[number,number];steps:PathInput['steps'];end:[number,number];visited:Array<[number,number]>};
const pathContract:UnifiedDomainContractV1<PathInput,[number,number],[number,number],{projected:[number,number];residual:[number,number]},{start:[number,number] },PathTrace,[number,number]>={
  id:'PCWD_CLOSED_PATH_HISTORY_BENCH',
  version:'1',
  address:i=>i.id,
  sense:i=>i.start,
  normalize:x=>x,
  decompose:x=>({projected:x,residual:[0,0]}),
  lemma:d=>({start:d.projected}),
  transport:(l,i)=>{
    let p:[number,number]=[...l.start] as [number,number];
    const visited:Array<[number,number]>=[[...p] as [number,number]];
    for(const s of i.steps){
      p=s==='R'?[p[0]+1,p[1]]:s==='L'?[p[0]-1,p[1]]:s==='U'?[p[0],p[1]+1]:[p[0],p[1]-1];
      visited.push([...p] as [number,number]);
    }
    return{start:l.start,steps:[...i.steps],end:p,visited};
  },
  recover:t=>t.start,
  measures:({input,sensed,transported,recovered})=>{
    const recovery=maxAbs([sensed[0]-recovered[0],sensed[1]-recovered[1]]);
    const closed=maxAbs([transported.end[0]-sensed[0],transported.end[1]-sensed[1]]);
    return{
      continuity:1,futurePlasticity:1,contradiction:0,burden:.01,
      errors:{recovery,dynamics:0,observables:closed,path:recovery,invariants:closed},
      tolerances:{recovery:0,dynamics:0,observables:0,path:0,invariants:0,continuity:.5},
      scarRetained:transported.visited.length===input.steps.length+1,
      evidenceAdmissible:input.evidence,
      pathRecoverable:true,
    };
  },
  packet:ctx=>({A_t:ctx.input.id,x_t:ctx.sensed,P_G_x_t:ctx.decomposed.projected,r_t:ctx.decomposed.residual,C_omega:1,Phi:1,q:0,Lambda:.01,Sigma_t:{visited:ctx.transported.visited},Gamma_t:{steps:ctx.transported.steps},L_t:ctx.lemma,E_t:{admissible:ctx.input.evidence},Pi_t:ctx.proof}),
  boundary:'Synthetic closed-path benchmark. Path receipts are software history only.',
};

async function benchmarkPathHistory():Promise<BenchmarkResultV1>{
  const a=await executeUnifiedProofTransportV1(pathContract,{start:[0,0],steps:['R','U','L','D'],evidence:true,id:'CW'});
  const b=await executeUnifiedProofTransportV1(pathContract,{start:[0,0],steps:['U','R','D','L'],evidence:true,id:'CCW'});
  const endA=(a.packet as any).Sigma_t.visited.at(-1) as [number,number],endB=(b.packet as any).Sigma_t.visited.at(-1) as [number,number];
  const baselineCollision=endA[0]===endB[0]&&endA[1]===endB[1];
  const pcwdDistinct=a.proof.stageChainDigest!==b.proof.stageChainDigest&&a.seal.packetDigest!==b.seal.packetDigest;
  return{
    id:'CLOSED_PATH_HISTORY',
    problem:'Path dependence when endpoint state collides',
    baseline:'FINAL_STATE_ONLY',
    verdict:baselineCollision&&pcwdDistinct?'WIN':'TIE',
    pcwdPass:await verifyUnifiedProofTransportV1(a)&&await verifyUnifiedProofTransportV1(b)&&pcwdDistinct,
    baselinePass:!baselineCollision,
    metrics:{sameEndpoint:baselineCollision,pcwdPathDistinct:pcwdDistinct,pathALength:4,pathBLength:4},
    retainedByPCWD:['ordered transport path','visited-state scar','stage-chain identity'],
    discardedByBaseline:['route/order history'],
    interpretation:'The endpoint alone cannot distinguish two closed traversals. PCWD carries path identity and history without changing the shared endpoint.',
  };
}

async function benchmarkTamperDetection():Promise<BenchmarkResultV1>{
  const valid=await executeUnifiedProofTransportV1(pathContract,{start:[2,3],steps:['R','L'],evidence:true,id:'TAMPER'});
  const mutated=structuredClone(valid);
  (mutated.packet as any).q=999;
  const validAccepted=await verifyUnifiedProofTransportV1(valid);
  const mutationAccepted=await verifyUnifiedProofTransportV1(mutated);
  return{
    id:'PACKET_TAMPER',
    problem:'Integrity detection after packet mutation',
    baseline:'UNSEALED_OBJECT_ACCEPTANCE',
    verdict:validAccepted&&!mutationAccepted?'WIN':'TIE',
    pcwdPass:validAccepted&&!mutationAccepted,
    baselinePass:true,
    metrics:{validAccepted,mutatedAcceptedByPCWD:mutationAccepted,baselineDetectsMutation:false},
    retainedByPCWD:['stage-chain digest','proof digest','complete packet envelope digest'],
    discardedByBaseline:['mutation evidence'],
    interpretation:'This is tamper-evident integrity, not secret-key authentication. An unsealed object baseline has no corresponding mutation check.',
  };
}

async function benchmarkEvidenceGate():Promise<BenchmarkResultV1>{
  const good=await executeUnifiedProofTransportV1(pathContract,{start:[0,0],steps:[],evidence:true,id:'EVIDENCE_GOOD'});
  const missing=await executeUnifiedProofTransportV1(pathContract,{start:[0,0],steps:[],evidence:false,id:'EVIDENCE_MISSING'});
  const numericallySame=JSON.stringify((good.packet as any).x_t)===JSON.stringify((missing.packet as any).x_t);
  return{
    id:'EVIDENCE_ADMISSIBILITY',
    problem:'Numerically valid state with missing admissible evidence',
    baseline:'NUMERIC_ONLY_ACCEPTANCE',
    verdict:good.promotionEligible&&!missing.promotionEligible&&numericallySame?'WIN':'TIE',
    pcwdPass:good.promotionEligible&&!missing.promotionEligible,
    baselinePass:true,
    metrics:{numericStateEqual:numericallySame,goodDecision:good.decision,missingEvidenceDecision:missing.decision,missingEvidenceBlocked:!missing.promotionEligible},
    retainedByPCWD:['evidence admissibility as a promotion gate'],
    discardedByBaseline:['evidence provenance/admissibility'],
    interpretation:'PCWD deliberately refuses to equate numerical consistency with evidentiary admissibility.',
  };
}

async function benchmarkQuantumValidity():Promise<BenchmarkResultV1>{
  const s=1/Math.sqrt(2),z=QUBIT.c(0),one=QUBIT.c(1);
  const rho:Matrix2V1=[one,z,z,z];
  const H:Matrix2V1=[QUBIT.c(s),QUBIT.c(s),QUBIT.c(s),QUBIT.c(-s)];
  const Z:Matrix2V1=[one,z,z,QUBIT.c(-1)];
  const bad:Matrix2V1=[QUBIT.c(2),z,z,one];
  const valid=await runQubitThroughUnifiedKernelV1({rho,unitary:H,observables:[Z],evidenceAdmissible:true,address:'Q:H'});
  const invalid=await runQubitThroughUnifiedKernelV1({rho,unitary:bad,observables:[Z],evidenceAdmissible:true,address:'Q:BAD'});
  return{
    id:'QUBIT_UNITARY_VALIDITY',
    problem:'Standard 2×2 density-matrix unitary validity / round trip',
    baseline:'UNCHECKED_MATRIX_TRANSFORM',
    verdict:valid.promotionEligible&&!invalid.promotionEligible?'WIN':'TIE',
    pcwdPass:valid.promotionEligible&&!invalid.promotionEligible,
    baselinePass:true,
    metrics:{
      validPromotion:valid.promotionEligible,invalidPromotion:invalid.promotionEligible,
      validRecoveryError:valid.proof.errors.recovery,invalidInvariantGate:invalid.proof.gates.invariantsPreserved,
      validFidelity:Number((valid.packet as any).fidelity),
    },
    retainedByPCWD:['unitary validity','density validity','recovery error','observable preservation','fidelity','proof envelope'],
    discardedByBaseline:['validity proof for the supplied transform'],
    interpretation:'The comparison baseline is intentionally unchecked matrix arithmetic, not all quantum software. PCWD adds explicit validity and recovery gates around standard quantum mechanics.',
  };
}

async function benchmarkCovarianceCarry():Promise<BenchmarkResultV1>{
  const covariance=[[4,1.5],[1.5,1]],s=1/Math.sqrt(2),J=[[s,-s],[s,s]];
  const full=propagateCovarianceV1(covariance,J);
  const diagonalOnly=[[covariance[0][0],0],[0,covariance[1][1]]];
  const baseline=mul(mul(J,diagonalOnly),transpose(J));
  const error=frobenius(full.output,baseline);
  return{
    id:'COVARIANCE_CARRY',
    problem:'Linear covariance propagation with correlated inputs',
    baseline:'DIAGONAL_VARIANCE_ONLY',
    verdict:full.symmetric&&full.finite&&error>1e-9?'WIN':'TIE',
    pcwdPass:full.symmetric&&full.finite,
    baselinePass:error<=1e-9,
    metrics:{baselineFrobeniusError:error,inputCorrelation:covariance[0][1],outputOffDiagonal:full.output[0][1],uncertaintyCollapsed:full.uncertaintyCollapsed},
    retainedByPCWD:['off-diagonal covariance','correlation under frame transform'],
    discardedByBaseline:['input correlation/cross-covariance'],
    interpretation:'When correlation exists, diagonal-only uncertainty propagation loses information. The PCWD covariance specialization carries the full declared covariance.',
  };
}

async function benchmarkForecastRetention():Promise<BenchmarkResultV1>{
  const field=compileCanonicalTypedFieldR349(0,a=>({
    continuity:.9,plasticity:.8,burden:.04,contradiction:.02,scar:(a%7)/100,evidence:.95,
    invariantCarry:.5+(a%3)/100,motionRate:.1,support:.95,orientation:(a%2?1:-1) as -1|1,
  }));
  const forecast=await compileForecastBranchesV1(field,{
    tick:1,address:144,transportRate:.125,
    evidence:{admissible:true,sources:['R358_BENCH_FIXTURE'],support:1,authority:'BENCHMARK',observedClaim:false},
    weights:{NEGATIVE:2,HOLD:1,POSITIVE:3},
  });
  const sorted=[...forecast.branches].sort((a,b)=>b.weight-a.weight);
  const baselineRetained=sorted.slice(0,1),discardedMass=1-baselineRetained.reduce((s,b)=>s+b.weight,0);
  return{
    id:'FORECAST_BRANCH_RETENTION',
    problem:'Multi-hypothesis future retention before evidence pruning',
    baseline:'ARGMAX_SINGLE_BRANCH',
    verdict:forecast.allBranchesRetained&&forecast.branches.length===3&&discardedMass>0?'WIN':'TIE',
    pcwdPass:forecast.allBranchesRetained&&forecast.branches.length===3,
    baselinePass:baselineRetained.length===forecast.branches.length,
    metrics:{pcwdRetainedBranches:forecast.branches.length,baselineRetainedBranches:baselineRetained.length,baselineDiscardedWeight:discardedMass,weightsSum:forecast.weightsSum},
    retainedByPCWD:['negative branch','hold branch','positive branch','per-branch proof packet'],
    discardedByBaseline:['non-argmax admissible futures','discarded branch weight'],
    interpretation:'PCWD retains explicit alternatives until an admissibility rule prunes them. The argmax baseline is cheaper but irreversibly discards alternatives.',
  };
}


type LorenzInput={state:[number,number,number];candidate:[number,number,number];expected:[number,number,number];evidence:boolean;id:string};
const lorenz63=(x:[number,number,number],[sigma,rho,beta]=[10,28,8/3] as [number,number,number]):[number,number,number]=>[
 sigma*(x[1]-x[0]),
 x[0]*(rho-x[2])-x[1],
 x[0]*x[1]-beta*x[2],
];
const add3=(a:[number,number,number],b:[number,number,number],scale=1):[number,number,number]=>[a[0]+scale*b[0],a[1]+scale*b[1],a[2]+scale*b[2]];
const lorenzRk4=(x:[number,number,number],dt=.01):[number,number,number]=>{
 const k1=lorenz63(x),k2=lorenz63(add3(x,k1,dt/2)),k3=lorenz63(add3(x,k2,dt/2)),k4=lorenz63(add3(x,k3,dt));
 return[
  x[0]+dt*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,
  x[1]+dt*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6,
  x[2]+dt*(k1[2]+2*k2[2]+2*k3[2]+k4[2])/6,
 ];
};
const lorenzContract:UnifiedDomainContractV1<LorenzInput,[number,number,number],[number,number,number],{projected:[number,number,number];residual:[number,number,number]},{state:[number,number,number]},[number,number,number],[number,number,number]>={
 id:'PCWD_LORENZ63_DYNAMICS_BENCH',
 version:'1',
 address:i=>i.id,
 sense:i=>i.state,
 normalize:x=>x,
 decompose:x=>({projected:x,residual:[0,0,0]}),
 lemma:d=>({state:d.projected}),
 transport:(_l,i)=>i.candidate,
 recover:t=>t,
 measures:({input,transported,recovered})=>{
  const dyn=rmse(transported,input.expected);
  const representation=rmse(transported,recovered);
  return{
   continuity:1,futurePlasticity:1,contradiction:0,burden:.01,
   errors:{recovery:representation,dynamics:dyn,observables:0,path:representation,invariants:0},
   tolerances:{recovery:1e-12,dynamics:1e-8,observables:0,path:1e-12,invariants:0,continuity:.5},
   scarRetained:true,evidenceAdmissible:input.evidence,pathRecoverable:true,
  };
 },
 packet:ctx=>({A_t:ctx.input.id,x_t:ctx.sensed,P_G_x_t:ctx.decomposed.projected,r_t:ctx.decomposed.residual,C_omega:1,Phi:1,q:0,Lambda:.01,Sigma_t:{dynamicsResidual:ctx.proof.errors.dynamics},Gamma_t:{kind:'LORENZ63_ONE_STEP'},L_t:ctx.lemma,E_t:{admissible:ctx.input.evidence},Pi_t:ctx.proof,candidate:ctx.transported,expected:ctx.input.expected}),
 boundary:'Classical Lorenz-63 one-step correspondence benchmark. PCWD checks a declared numerical reference; it does not improve the integrator or predict the physical atmosphere.',
};

async function benchmarkLorenzDynamics():Promise<BenchmarkResultV1>{
 const state:[number,number,number]=[1,1,1],expected=lorenzRk4(state,.01);
 const correct=await executeUnifiedProofTransportV1(lorenzContract,{state,candidate:expected,expected,evidence:true,id:'L63:CORRECT'});
 const perturbed:[number,number,number]=[expected[0]+.05,expected[1]-.025,expected[2]+.01];
 const wrong=await executeUnifiedProofTransportV1(lorenzContract,{state,candidate:perturbed,expected,evidence:true,id:'L63:PERTURBED'});
 return{
  id:'LORENZ63_DYNAMICS_CORRESPONDENCE',
  problem:'Lorenz-63 one-step numerical dynamics correspondence',
  baseline:'UNCHECKED_NEXT_STATE_ACCEPTANCE',
  verdict:correct.promotionEligible&&!wrong.promotionEligible?'WIN':'TIE',
  pcwdPass:correct.promotionEligible&&!wrong.promotionEligible&&wrong.decision==='TURN',
  baselinePass:true,
  metrics:{correctDynamicsError:correct.proof.errors.dynamics,perturbedDynamicsError:wrong.proof.errors.dynamics,correctDecision:correct.decision,perturbedDecision:wrong.decision},
  retainedByPCWD:['declared dynamics residual','dynamics tolerance','promotion consequence'],
  discardedByBaseline:['model-correspondence error'],
  interpretation:'PCWD does not solve Lorenz-63 better than RK4; it makes correspondence to the declared reference a promotion gate and exposes the residual when a candidate deviates.',
 };
}

type LossyInput={values:number[];evidence:boolean};
const lossyContract:UnifiedDomainContractV1<LossyInput,number[],number[],{projected:number[];residual:number[]},{coarse:number[]},number[],number[]>={
  id:'PCWD_LOSS_WITHOUT_RESIDUAL_BENCH',
  version:'1',
  address:()=> 'LOSSY:NO_RESIDUAL',
  sense:i=>i.values,
  normalize:x=>x,
  decompose:x=>({projected:x,residual:x.map(()=>0)}),
  lemma:d=>({coarse:[(d.projected[0]+d.projected[1])/2,(d.projected[2]+d.projected[3])/2]}),
  transport:l=>l.coarse,
  recover:t=>[t[0],t[0],t[1],t[1]],
  measures:({input,sensed,recovered})=>{
    const e=rmse(sensed,recovered);
    return{
      continuity:1,futurePlasticity:1,contradiction:0,burden:.01,
      errors:{recovery:e,dynamics:0,observables:e,path:0,invariants:0},
      tolerances:{recovery:1e-12,dynamics:0,observables:1e-12,path:0,invariants:0,continuity:.5},
      scarRetained:false,evidenceAdmissible:input.evidence,pathRecoverable:true,
    };
  },
  packet:ctx=>({A_t:'LOSSY',x_t:ctx.sensed,P_G_x_t:ctx.decomposed.projected,r_t:[],C_omega:1,Phi:1,q:0,Lambda:.01,Sigma_t:null,Gamma_t:{kind:'IDENTITY'},L_t:ctx.lemma,E_t:{admissible:ctx.input.evidence},Pi_t:ctx.proof}),
  boundary:'Negative-control benchmark: the adapter intentionally discards the residual and must not be promoted.',
};

async function benchmarkNoResidualLimit():Promise<BenchmarkResultV1>{
  const r=await executeUnifiedProofTransportV1(lossyContract,{values:[0,2,10,14],evidence:true});
  return{
    id:'NO_RESIDUAL_NEGATIVE_CONTROL',
    problem:'Attempted recovery after genuinely discarded information',
    baseline:'LOSSY_BLOCK_MEAN_WITHOUT_SIDECAR',
    verdict:!r.promotionEligible?'LIMIT':'TIE',
    pcwdPass:!r.promotionEligible,
    baselinePass:false,
    metrics:{recoveryError:r.proof.errors.recovery,scarRetained:r.proof.gates.scarRetained,recoveryBounded:r.proof.gates.recoveryBounded,decision:r.decision},
    retainedByPCWD:['explicit proof that recovery/scar requirements failed'],
    discardedByBaseline:['within-block information'],
    interpretation:'PCWD cannot reconstruct information that an adapter truly discarded. Its useful behavior here is fail-closed detection, not recovery.',
  };
}

async function benchmarkProofOverhead():Promise<BenchmarkResultV1>{
  const r=await executeUnifiedProofTransportV1(pathContract,{start:[0,0],steps:[],evidence:true,id:'OVERHEAD'});
  const baseline={state:[0,0]};
  const compact=compileCompactProofIndexV1(r);
  const compactVerified=await verifyCompactProofIndexV1(compact,r);
  const baselineBytes=bytes(baseline),pcwdBytes=bytes(r),compactIndexBytes=bytes(compact);
  return{
    id:'PROOF_OVERHEAD',
    problem:'Representation and integrity overhead on a trivial identity state',
    baseline:'STATE_ONLY',
    verdict:'COST',
    pcwdPass:await verifyUnifiedProofTransportV1(r),
    baselinePass:true,
    metrics:{baselineBytes,pcwdBytes,compactIndexBytes,byteOverhead:pcwdBytes-baselineBytes,overheadRatio:pcwdBytes/Math.max(1,baselineBytes),compactVsFullRatio:compactIndexBytes/Math.max(1,pcwdBytes),compactIndexVerified},
    retainedByPCWD:['stage receipts','proof gates','history/evidence fields','packet seal','compact content-addressed proof index'],
    discardedByBaseline:[],
    interpretation:'For trivial state transport, the full PCWD envelope is materially heavier. R358 therefore also measures a compact content-addressed proof index; the index reduces wire/index size but still requires the full envelope for semantic verification. The state-only baseline remains cheaper.',
  };
}

export async function runPcwdBenchmarkSuiteV1():Promise<BenchmarkSuiteV1>{
  const results=await Promise.all([
    benchmarkResolutionRecovery(),
    benchmarkPathHistory(),
    benchmarkTamperDetection(),
    benchmarkEvidenceGate(),
    benchmarkQuantumValidity(),
    benchmarkCovarianceCarry(),
    benchmarkForecastRetention(),
    benchmarkLorenzDynamics(),
    benchmarkNoResidualLimit(),
    benchmarkProofOverhead(),
  ]);
  const additionalInformationCategories=unique(results.flatMap(r=>r.discardedByBaseline));
  return{
    schema:PCWD_BENCHMARK_SCHEMA,
    revision:'R358',
    results,
    summary:{
      total:results.length,
      wins:results.filter(r=>r.verdict==='WIN').length,
      ties:results.filter(r=>r.verdict==='TIE').length,
      costs:results.filter(r=>r.verdict==='COST').length,
      expectedHolds:results.filter(r=>r.verdict==='EXPECTED_HOLD').length,
      limits:results.filter(r=>r.verdict==='LIMIT').length,
      pcwdPassCount:results.filter(r=>r.pcwdPass).length,
      baselinePassCount:results.filter(r=>r.baselinePass).length,
      additionalInformationCategories,
    },
    boundary:PCWD_BENCHMARK_BOUNDARY,
  };
}
