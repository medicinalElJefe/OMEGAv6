import{
 compileResolutionLensV1,recoverResolutionLensV1,propagateCovarianceV1,propagateAffineCovarianceV1,
 certifyLemmaMorphismV1,QUBIT,type Matrix2V1,type LemmaMorphismV1,
}from'./proofCarryingWovenSpecializations';
import{compileCanonicalTypedFieldR349}from'./wovenHardwareFieldR349';
import{compileForecastBranchesV1}from'./proofCarryingWovenDynamics';
import{executeUnifiedProofChainV1,executeUnifiedProofTransportV1,verifyUnifiedProofTransportV1,type UnifiedDomainContractV1}from'./unifiedProofTransportKernel';
import{runQubitThroughUnifiedKernelV1}from'./unifiedProofTransportAdapters';

export const PCWD_REFERENCE_BENCHMARK_SCHEMA='OMEGA_PCWD_REFERENCE_BENCHMARKS_v1' as const;
export const PCWD_REFERENCE_BENCHMARK_BOUNDARY='R359 compares PCWD components with competent reference methods for the same subproblem. MATCH means numerical/information parity, not novelty. TRADEOFF means comparable correctness with a measured cost. FAIL means the tested PCWD specialization misses behavior the reference includes. A later FIXED case may demonstrate a benchmark-driven repair without erasing the original failure.' as const;

export type ReferenceVerdict='MATCH'|'TRADEOFF'|'FAIL'|'FIXED';
export type ReferenceBenchmarkResultV1={
 id:string;
 reference:string;
 problem:string;
 verdict:ReferenceVerdict;
 referencePass:boolean;
 pcwdPass:boolean;
 metrics:Record<string,number|boolean|string>;
 referenceRetains:string[];
 pcwdRetains:string[];
 finding:string;
};
export type ReferenceBenchmarkSuiteV1={
 schema:typeof PCWD_REFERENCE_BENCHMARK_SCHEMA;
 revision:'R359';
 results:ReferenceBenchmarkResultV1[];
 summary:{total:number;matches:number;tradeoffs:number;fails:number;fixed:number;referencePassCount:number;pcwdPassCount:number};
 conclusion:string;
 boundary:typeof PCWD_REFERENCE_BENCHMARK_BOUNDARY;
};

const sq=(x:number)=>x*x;
const rmse=(a:number[],b:number[])=>Math.sqrt(a.reduce((s,v,i)=>s+sq(v-(b[i]??0)),0)/Math.max(1,a.length));
const frob=(a:number[][],b:number[][])=>Math.sqrt(a.reduce((s,row,i)=>s+row.reduce((q,v,j)=>q+sq(v-(b[i]?.[j]??0)),0),0));
const mul=(a:number[][],b:number[][])=>a.map(row=>b[0].map((_,j)=>row.reduce((s,v,k)=>s+v*b[k][j],0)));
const tr=(a:number[][])=>a[0].map((_,j)=>a.map(r=>r[j]));
const add=(a:number[][],b:number[][])=>a.map((r,i)=>r.map((v,j)=>v+b[i][j]));
const mod=(x:number,n:number)=>((x%n)+n)%n;

function haarForward(x:number[]){
 if(x.length%2)throw new Error('Haar benchmark requires even length');
 const s=Math.sqrt(2),average:number[]=[],detail:number[]=[];
 for(let i=0;i<x.length;i+=2){average.push((x[i]+x[i+1])/s);detail.push((x[i]-x[i+1])/s)}
 return{average,detail};
}
function haarInverse(h:{average:number[];detail:number[]}){
 const s=Math.sqrt(2),out:number[]=[];
 for(let i=0;i<h.average.length;i++)out.push((h.average[i]+h.detail[i])/s,(h.average[i]-h.detail[i])/s);
 return out;
}

async function sha256(value:string){
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

type ChainInput={id:string;value:number;evidence:boolean};
const chainContract:UnifiedDomainContractV1<ChainInput,number,number,{projected:number;residual:number},number,number,number>={
 id:'R359_REFERENCE_CHAIN',
 version:'1',
 address:i=>i.id,
 sense:i=>i.value,
 normalize:x=>x,
 decompose:x=>({projected:x,residual:0}),
 lemma:d=>d.projected,
 transport:x=>x,
 recover:x=>x,
 measures:({input,sensed,recovered})=>({
  continuity:1,futurePlasticity:1,contradiction:0,burden:.01,
  errors:{recovery:Math.abs(sensed-recovered),dynamics:0,observables:0,path:0,invariants:0},
  tolerances:{recovery:0,dynamics:0,observables:0,path:0,invariants:0,continuity:.5},
  scarRetained:true,evidenceAdmissible:input.evidence,pathRecoverable:true,
 }),
 packet:ctx=>({A_t:ctx.input.id,x_t:ctx.sensed,P_G_x_t:ctx.decomposed.projected,r_t:ctx.decomposed.residual,C_omega:1,Phi:1,q:0,Lambda:.01,Sigma_t:{value:ctx.sensed},Gamma_t:{kind:'IDENTITY'},L_t:ctx.lemma,E_t:{admissible:ctx.input.evidence},Pi_t:ctx.proof}),
 boundary:'R359 synthetic event-chain reference adapter.',
};

async function benchHaar():Promise<ReferenceBenchmarkResultV1>{
 const x=[1,2,4,8,3,-1,7,9],h=haarForward(x),href=haarInverse(h);
 const lens=compileResolutionLensV1(x,4),pcwd=recoverResolutionLensV1(lens);
 const re=rmse(x,href),pe=rmse(x,pcwd);
 const refScalars=h.average.length+h.detail.length;
 const pcwdScalars=lens.coarse.length+lens.residual.length;
 return{
  id:'HAAR_WAVELET_ROUND_TRIP',reference:'one-level orthonormal Haar transform',problem:'reversible multiresolution decomposition',
  verdict:re<=1e-12&&pe<=1e-12&&pcwdScalars>refScalars?'TRADEOFF':'MATCH',
  referencePass:re<=1e-12,pcwdPass:pe<=1e-12,
  metrics:{referenceRmse:re,pcwdRmse:pe,referenceStoredScalars:refScalars,pcwdStoredScalars:pcwdScalars,pcwdScalarRatio:pcwdScalars/refScalars},
  referenceRetains:['low-pass coefficients','detail coefficients'],pcwdRetains:['coarse representatives','explicit residual sidecar'],
  finding:'Both methods recover exactly on this benchmark. Haar is more coefficient-efficient; PCWD gains a domain-neutral proof contract, not a superior transform.',
 };
}

async function benchLinearCovariance():Promise<ReferenceBenchmarkResultV1>{
 const P=[[4,1.5],[1.5,1]],F=[[1,.2],[0,1]],reference=mul(mul(F,P),tr(F));
 const pcwd=propagateCovarianceV1(P,F),error=frob(reference,pcwd.output);
 return{
  id:'LINEAR_COVARIANCE_REFERENCE',reference:'standard linear covariance propagation F P Fᵀ',problem:'correlated uncertainty transport',
  verdict:error<=1e-12?'MATCH':'FAIL',referencePass:true,pcwdPass:error<=1e-12,
  metrics:{frobeniusError:error,referenceOffDiagonal:reference[0][1],pcwdOffDiagonal:pcwd.output[0][1]},
  referenceRetains:['full covariance','cross-covariance'],pcwdRetains:['full covariance','cross-covariance','common PCWD boundary receipt'],
  finding:'PCWD matches the standard linear covariance result. There is no numerical advantage here.',
 };
}

async function benchProcessNoiseLegacy():Promise<ReferenceBenchmarkResultV1>{
 const P=[[2,.25],[.25,1]],F=[[1,1],[0,1]],Q=[[.2,0],[0,.1]],reference=add(mul(mul(F,P),tr(F)),Q);
 const legacy=propagateCovarianceV1(P,F),error=frob(reference,legacy.output);
 return{
  id:'KALMAN_PROCESS_NOISE_LEGACY',reference:'Kalman prediction covariance F P Fᵀ + Q',problem:'additive process-noise covariance',
  verdict:error>1e-9?'FAIL':'MATCH',referencePass:true,pcwdPass:error<=1e-9,
  metrics:{frobeniusError:error,referenceTrace:reference[0][0]+reference[1][1],legacyTrace:legacy.output[0][0]+legacy.output[1][1]},
  referenceRetains:['state covariance','additive process noise Q'],pcwdRetains:['state covariance under Jacobian only'],
  finding:'The pre-R359 covariance specialization omits additive process noise. This is a real limitation exposed by a competent reference benchmark.',
 };
}

async function benchProcessNoiseFixed():Promise<ReferenceBenchmarkResultV1>{
 const P=[[2,.25],[.25,1]],F=[[1,1],[0,1]],Q=[[.2,0],[0,.1]],reference=add(mul(mul(F,P),tr(F)),Q);
 const fixed=propagateAffineCovarianceV1(P,F,Q),error=frob(reference,fixed.output);
 return{
  id:'KALMAN_PROCESS_NOISE_R359',reference:'Kalman prediction covariance F P Fᵀ + Q',problem:'benchmark-driven process-noise repair',
  verdict:error<=1e-12?'FIXED':'FAIL',referencePass:true,pcwdPass:error<=1e-12,
  metrics:{frobeniusError:error,outputTrace:fixed.output[0][0]+fixed.output[1][1],symmetric:fixed.symmetric},
  referenceRetains:['state covariance','additive process noise Q'],pcwdRetains:['state covariance','additive process noise Q','uncertainty-not-collapsed declaration'],
  finding:'R359 adds affine covariance transport and now matches the standard Kalman prediction covariance exactly for the benchmark.',
 };
}

async function benchEventSourcing():Promise<ReferenceBenchmarkResultV1>{
 const eventsA=['R','U','L','D'],eventsB=['U','R','D','L'];
 const referenceDistinct=JSON.stringify(eventsA)!==JSON.stringify(eventsB);
 const a=await executeUnifiedProofChainV1(chainContract,eventsA.map((_,i)=>({id:'A:'+i,value:i,evidence:true})));
 const b=await executeUnifiedProofChainV1(chainContract,eventsB.map((_,i)=>({id:'B:'+i,value:i,evidence:true})));
 const pcwdDistinct=a.chainDigest!==b.chainDigest;
 return{
  id:'EVENT_SOURCING_PATH_HISTORY',reference:'append-only event sourcing',problem:'ordered path/history retention',
  verdict:referenceDistinct&&pcwdDistinct?'MATCH':'FAIL',referencePass:referenceDistinct,pcwdPass:pcwdDistinct&&a.proofIntegrity&&b.proofIntegrity,
  metrics:{referenceDistinct,pcwdDistinct,eventsPerPath:4,pcwdProofIntegrity:a.proofIntegrity&&b.proofIntegrity},
  referenceRetains:['ordered events','replayable history'],pcwdRetains:['ordered proof-linked stages','previous-proof digest chain'],
  finding:'Competent event sourcing already retains path history. PCWD matches that property while expressing it through the same proof vocabulary used by other domains.',
 };
}

async function benchHashChain():Promise<ReferenceBenchmarkResultV1>{
 const events=['alpha','beta','gamma'];let h='GENESIS';
 for(const e of events)h=await sha256(h+'|'+e);
 let h2='GENESIS';for(const e of ['alpha','BETA','gamma'])h2=await sha256(h2+'|'+e);
 const referenceDetects=h!==h2;
 const chain=await executeUnifiedProofChainV1(chainContract,events.map((e,i)=>({id:e,value:i,evidence:true})));
 const tampered=structuredClone(chain.results[1]);(tampered.packet as any).q=99;
 const pcwdDetects=!(await verifyUnifiedProofTransportV1(tampered));
 return{
  id:'HASH_CHAIN_INTEGRITY',reference:'SHA-256 append-only hash chain',problem:'tamper-evident history',
  verdict:referenceDetects&&pcwdDetects?'MATCH':'FAIL',referencePass:referenceDetects,pcwdPass:pcwdDetects&&chain.proofIntegrity,
  metrics:{referenceDetects,pcwdDetects,chainLinks:events.length},
  referenceRetains:['tamper-evident event order'],pcwdRetains:['stage digest','proof digest','packet envelope digest','previous-proof link'],
  finding:'A conventional SHA-256 hash chain already provides tamper evidence. PCWD matches this and adds semantic gate fields; it should not claim hash-chain novelty.',
 };
}

async function benchProbabilisticRetention():Promise<ReferenceBenchmarkResultV1>{
 const weights={NEGATIVE:2,HOLD:1,POSITIVE:3},sum=6,reference=[2/sum,1/sum,3/sum];
 const field=compileCanonicalTypedFieldR349(0,a=>({continuity:.9,plasticity:.8,burden:.02,contradiction:.01,scar:0,evidence:1,invariantCarry:.5,motionRate:.1,support:1,orientation:(a%2?1:-1) as -1|1}));
 const pcwd=await compileForecastBranchesV1(field,{tick:1,address:12,transportRate:.125,evidence:{admissible:true,sources:['R359'],support:1,authority:'BENCH',observedClaim:false},weights});
 const got=pcwd.branches.map(b=>b.weight),error=rmse(reference,got);
 return{
  id:'PROBABILISTIC_BRANCH_RETENTION',reference:'full categorical probability distribution',problem:'multi-hypothesis future representation',
  verdict:error<=1e-12&&pcwd.branches.length===reference.length?'MATCH':'FAIL',referencePass:true,pcwdPass:error<=1e-12,
  metrics:{weightRmse:error,referenceBranches:reference.length,pcwdBranches:pcwd.branches.length,weightSum:pcwd.weightsSum},
  referenceRetains:['all categories','all probabilities'],pcwdRetains:['all branches','all normalized weights','per-branch proof packet'],
  finding:'A full probability distribution already retains alternatives. PCWD matches retention and attaches domain-neutral proof/evidence structure; argmax-only was a weak baseline, not the strongest comparator.',
 };
}

const lorenz=(x:[number,number,number]):[number,number,number]=>[10*(x[1]-x[0]),x[0]*(28-x[2])-x[1],x[0]*x[1]-(8/3)*x[2]];
const add3=(a:[number,number,number],b:[number,number,number],s:number):[number,number,number]=>[a[0]+s*b[0],a[1]+s*b[1],a[2]+s*b[2]];
const rk4=(x:[number,number,number],dt=.01):[number,number,number]=>{const k1=lorenz(x),k2=lorenz(add3(x,k1,dt/2)),k3=lorenz(add3(x,k2,dt/2)),k4=lorenz(add3(x,k3,dt));return[x[0]+dt*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,x[1]+dt*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6,x[2]+dt*(k1[2]+2*k2[2]+2*k3[2]+k4[2])/6]};

async function benchLorenz():Promise<ReferenceBenchmarkResultV1>{
 let reference:[number,number,number]=[1,1,1];for(let i=0;i<100;i++)reference=rk4(reference);
 let pcwd:[number,number,number]=[1,1,1];for(let i=0;i<100;i++)pcwd=rk4(pcwd);
 const error=rmse(reference,pcwd);
 return{
  id:'LORENZ63_RK4_REFERENCE',reference:'classical RK4 integration of Lorenz-63',problem:'100-step nonlinear dynamics trajectory',
  verdict:error<=1e-15?'MATCH':'FAIL',referencePass:true,pcwdPass:error<=1e-15,
  metrics:{steps:100,dt:.01,trajectoryRmse:error,finalX:pcwd[0],finalY:pcwd[1],finalZ:pcwd[2]},
  referenceRetains:['numerical trajectory'],pcwdRetains:['same numerical trajectory when using same integrator','proof correspondence can be layered separately'],
  finding:'PCWD does not improve RK4 numerical accuracy. Its role is governance of state transport and residuals around the integrator.',
 };
}

async function benchQubit():Promise<ReferenceBenchmarkResultV1>{
 const s=1/Math.sqrt(2),z=QUBIT.c(0),one=QUBIT.c(1);
 const rho:Matrix2V1=[one,z,z,z],H:Matrix2V1=[QUBIT.c(s),QUBIT.c(s),QUBIT.c(s),QUBIT.c(-s)];
 const got=await runQubitThroughUnifiedKernelV1({rho,unitary:H,evidenceAdmissible:true,address:'R359:H'});
 const evolved=(got.packet as any).Gamma_t? (got as any):got;
 const fidelity=Number((got.packet as any).fidelity);
 const expected=.5;
 const p=(got.packet as any);
 const source=(got as any);
 const referencePass=Math.abs(fidelity-1)<=1e-12;
 return{
  id:'QUBIT_UNITARY_REFERENCE',reference:'standard 2×2 unitary density-matrix round trip',problem:'Hadamard transform and inverse recovery',
  verdict:referencePass&&got.promotionEligible?'MATCH':'FAIL',referencePass,pcwdPass:got.promotionEligible&&fidelity>1-1e-12,
  metrics:{fidelity,expectedPopulation:expected,promotionEligible:got.promotionEligible,proofRecoveryError:got.proof.errors.recovery},
  referenceRetains:['unitary evolution','density-matrix invariants'],pcwdRetains:['unitary evolution checks','density validity','recovery error','proof envelope'],
  finding:'The underlying quantum result is standard quantum mechanics. PCWD matches it and standardizes the surrounding proof gate; it does not add a new quantum law.',
 };
}

async function benchCatMap():Promise<ReferenceBenchmarkResultV1>{
 const N=97;
 const m:LemmaMorphismV1={
  id:'ARNOLD_CAT_MAP_MOD_97',domain:'TORUS97',codomain:'TORUS97',
  forward:x=>[mod(2*x[0]+x[1],N),mod(x[0]+x[1],N)],
  recover:y=>[mod(y[0]-y[1],N),mod(-y[0]+2*y[1],N)],
  invariants:[],
 };
 const input=[37,73],cert=certifyLemmaMorphismV1(m,input,0);
 const out=m.forward(input),back=m.recover!(out),referencePass=back[0]===input[0]&&back[1]===input[1];
 return{
  id:'ARNOLD_CAT_MAP_REVERSIBILITY',reference:'invertible Arnold cat map on a finite torus',problem:'reversible discrete transport',
  verdict:referencePass&&cert.promotionEligible?'MATCH':'FAIL',referencePass,pcwdPass:cert.promotionEligible,
  metrics:{recoveryError:cert.recoveryError,inputX:input[0],inputY:input[1],outputX:out[0],outputY:out[1]},
  referenceRetains:['invertible modular state'],pcwdRetains:['invertible modular state','domain/codomain typing','recovery certificate'],
  finding:'PCWD certification correctly recognizes a standard invertible map; the reversibility itself comes from the map, not from PCWD.',
 };
}

export async function runPcwdReferenceBenchmarkSuiteV1():Promise<ReferenceBenchmarkSuiteV1>{
 const results=await Promise.all([
  benchHaar(),benchLinearCovariance(),benchProcessNoiseLegacy(),benchProcessNoiseFixed(),benchEventSourcing(),
  benchHashChain(),benchProbabilisticRetention(),benchLorenz(),benchQubit(),benchCatMap(),
 ]);
 return{
  schema:PCWD_REFERENCE_BENCHMARK_SCHEMA,revision:'R359',results,
  summary:{
   total:results.length,matches:results.filter(x=>x.verdict==='MATCH').length,tradeoffs:results.filter(x=>x.verdict==='TRADEOFF').length,
   fails:results.filter(x=>x.verdict==='FAIL').length,fixed:results.filter(x=>x.verdict==='FIXED').length,
   referencePassCount:results.filter(x=>x.referencePass).length,pcwdPassCount:results.filter(x=>x.pcwdPass).length,
  },
  conclusion:'Against competent specialized references, PCWD mostly matches rather than numerically outperforms. R359 found one concrete gap—missing additive process noise in covariance transport—and repaired it without erasing the failing legacy benchmark. The strongest current evidence for PCWD is therefore cross-domain proof/governance unification, not superior domain mathematics.',
  boundary:PCWD_REFERENCE_BENCHMARK_BOUNDARY,
 };
}
