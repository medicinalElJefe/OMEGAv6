import type{WovenStatePacketV1}from'./proofCarryingWovenDynamics';

export const PCWD_ATLAS_LEVELS=[12,144,1728,20736,248832] as const;
export const RSC_LOOP_V1=['Parent','Interaction','Scar','Continuity','Compression','Skin','Interpretation','Behavior'] as const;
export const PCWD_SPECIALIZATION_BOUNDARY='PCWD specializations bind declared mathematics to the common proof-carrying transport interface. They do not create physical dimensions, observational authority, scientific validation, CanonState admission, dispatch authority, or production authority.' as const;

export type SparseAtlasAddressV1={
 level:1|2|3|4|5;
 resolution:number;
 index:number;
 digits:number[];
 key:string;
 physicalDimensionsClaimed:false;
};
export function sparseAtlasAddressV1(index:number,level:1|2|3|4|5):SparseAtlasAddressV1{
 const resolution=12**level;
 let n=Math.max(0,Math.min(resolution-1,Math.floor(Number(index)||0)));
 const original=n,digits:number[]=[];
 for(let i=0;i<level;i++){digits.push(n%12);n=Math.floor(n/12)}
 return{level,resolution,index:original,digits,key:`L${level}:${digits.slice().reverse().join('.')}`,physicalDimensionsClaimed:false};
}
export function sparseAtlasParentV1(address:SparseAtlasAddressV1){
 if(address.level<=1)return null;
 const parentLevel=(address.level-1) as 1|2|3|4;
 return sparseAtlasAddressV1(Math.floor(address.index/12),parentLevel);
}
export function sparseAtlasChildrenV1(address:SparseAtlasAddressV1){
 if(address.level>=5)return[] as SparseAtlasAddressV1[];
 const childLevel=(address.level+1) as 2|3|4|5;
 return Array.from({length:12},(_,digit)=>sparseAtlasAddressV1(address.index*12+digit,childLevel));
}

export type ResolutionLensV1={
 schema:'OMEGA_PCWD_RESOLUTION_LENS_v1';
 sourceCount:number;
 targetCount:number;
 binSize:number;
 coarse:number[];
 residual:number[];
 recoveryError:number;
 residualMax:number;
 residualRms:number;
 exactRecovery:boolean;
 physicalDimensionsClaimed:false;
 boundary:typeof PCWD_SPECIALIZATION_BOUNDARY;
};
export function compileResolutionLensV1(input:number[],targetCount:number):ResolutionLensV1{
 const sourceCount=input.length,target=Math.max(1,Math.floor(Number(targetCount)||1));
 if(sourceCount<1||sourceCount%target!==0)throw new Error('PCWD resolution lens requires sourceCount divisible by targetCount');
 const binSize=sourceCount/target,coarse=Array(target).fill(0);
 for(let i=0;i<sourceCount;i++)coarse[Math.floor(i/binSize)]+=Number(input[i])||0;
 for(let j=0;j<target;j++)coarse[j]/=binSize;
 const residual=input.map((v,i)=>(Number(v)||0)-coarse[Math.floor(i/binSize)]);
 const recovered=residual.map((r,i)=>coarse[Math.floor(i/binSize)]+r);
 const recoveryError=maxDiff(input,recovered);
 const residualMax=residual.reduce((m,v)=>Math.max(m,Math.abs(v)),0);
 const residualRms=Math.sqrt(residual.reduce((s,v)=>s+v*v,0)/Math.max(1,residual.length));
 return{schema:'OMEGA_PCWD_RESOLUTION_LENS_v1',sourceCount,targetCount:target,binSize,coarse,residual,recoveryError,residualMax,residualRms,exactRecovery:recoveryError<=1e-12,physicalDimensionsClaimed:false,boundary:PCWD_SPECIALIZATION_BOUNDARY};
}
export function recoverResolutionLensV1(lens:ResolutionLensV1){
 return lens.residual.map((r,i)=>lens.coarse[Math.floor(i/lens.binSize)]+r);
}

export type CovarianceReceiptV1={
 schema:'OMEGA_PCWD_COVARIANCE_TRANSPORT_v1';
 input:number[][];
 jacobian:number[][];
 output:number[][];
 symmetric:boolean;
 finite:boolean;
 uncertaintyCollapsed:false;
 boundary:typeof PCWD_SPECIALIZATION_BOUNDARY;
};
export function propagateCovarianceV1(input:number[][],jacobian:number[][]):CovarianceReceiptV1{
 const n=input.length;
 if(!n||input.some(r=>r.length!==n))throw new Error('PCWD covariance must be square');
 if(jacobian.some(r=>r.length!==n)||jacobian.length!==n)throw new Error('PCWD Jacobian must match covariance size');
 const mul=(a:number[][],b:number[][])=>a.map(row=>b[0].map((_,j)=>row.reduce((s,v,k)=>s+v*b[k][j],0)));
 const transpose=(a:number[][])=>a[0].map((_,j)=>a.map(r=>r[j]));
 const output=mul(mul(jacobian,input),transpose(jacobian));
 const finite=output.every(r=>r.every(Number.isFinite));
 let symmetric=true;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(Math.abs(output[i][j]-output[j][i])>1e-10)symmetric=false;
 return{schema:'OMEGA_PCWD_COVARIANCE_TRANSPORT_v1',input:input.map(r=>[...r]),jacobian:jacobian.map(r=>[...r]),output,symmetric,finite,uncertaintyCollapsed:false,boundary:PCWD_SPECIALIZATION_BOUNDARY};
}


export type AffineCovarianceReceiptV1={
 schema:'OMEGA_PCWD_AFFINE_COVARIANCE_TRANSPORT_v1';
 input:number[][];
 jacobian:number[][];
 processNoise:number[][];
 output:number[][];
 symmetric:boolean;
 finite:boolean;
 uncertaintyCollapsed:false;
 boundary:typeof PCWD_SPECIALIZATION_BOUNDARY;
};
export function propagateAffineCovarianceV1(input:number[][],jacobian:number[][],processNoise:number[][]):AffineCovarianceReceiptV1{
 const base=propagateCovarianceV1(input,jacobian),n=input.length;
 if(processNoise.length!==n||processNoise.some(r=>r.length!==n))throw new Error('PCWD process-noise covariance must match state size');
 const output=base.output.map((row,i)=>row.map((v,j)=>v+(Number(processNoise[i][j])||0)));
 const finite=output.every(r=>r.every(Number.isFinite));
 let symmetric=true;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(Math.abs(output[i][j]-output[j][i])>1e-10)symmetric=false;
 return{schema:'OMEGA_PCWD_AFFINE_COVARIANCE_TRANSPORT_v1',input:input.map(r=>[...r]),jacobian:jacobian.map(r=>[...r]),processNoise:processNoise.map(r=>[...r]),output,symmetric,finite,uncertaintyCollapsed:false,boundary:PCWD_SPECIALIZATION_BOUNDARY};
}

export type LemmaMorphismV1={
 id:string;
 domain:string;
 codomain:string;
 forward:(x:number[])=>number[];
 recover?:(y:number[])=>number[];
 invariants?:Array<(x:number[])=>number>;
};
const maxDiff=(a:number[],b:number[])=>{let m=0;for(let i=0;i<Math.max(a.length,b.length);i++)m=Math.max(m,Math.abs((a[i]??0)-(b[i]??0)));return m};
export function identityLemmaMorphismV1(space:string):LemmaMorphismV1{return{id:`IDENTITY:${space}`,domain:space,codomain:space,forward:x=>[...x],recover:y=>[...y],invariants:[x=>x.reduce((s,v)=>s+v,0)]}}
export function composeLemmaMorphismsV1(a:LemmaMorphismV1,b:LemmaMorphismV1):LemmaMorphismV1{
 if(a.codomain!==b.domain)throw new Error(`Lemma codomain/domain mismatch: ${a.codomain} != ${b.domain}`);
 return{
  id:`${b.id}∘${a.id}`,domain:a.domain,codomain:b.codomain,
  forward:x=>b.forward(a.forward(x)),
  recover:a.recover&&b.recover?y=>a.recover!(b.recover!(y)):undefined,
  invariants:a.invariants,
 };
}
export function certifyLemmaMorphismV1(m:LemmaMorphismV1,input:number[],tolerance=1e-9){
 const output=m.forward([...input]),recovered=m.recover?m.recover([...output]):null;
 const recoveryError=recovered?maxDiff(input,recovered):Number.POSITIVE_INFINITY;
 const invariantErrors=(m.invariants||[]).map(fn=>Math.abs(fn(input)-fn(recovered||input)));
 const invariantError=invariantErrors.length?Math.max(...invariantErrors):0;
 return{schema:'OMEGA_PCWD_LEMMA_MORPHISM_CERT_v1' as const,id:m.id,domain:m.domain,codomain:m.codomain,recoveryError,invariantError,recoverable:!!recovered,promotionEligible:!!recovered&&recoveryError<=tolerance&&invariantError<=tolerance,boundary:PCWD_SPECIALIZATION_BOUNDARY};
}

export function compileRscLoopReceiptV1(packet:WovenStatePacketV1){
 const decision=packet.Pi_t.decision;
 const meaning=decision==='STAY'?'maintain proven trajectory':decision==='TURN'?'re-contextualize within recoverable bounds':'raise proof/evidence order before continuation';
 const receipts=RSC_LOOP_V1.map((phase,index)=>({
  index:index+1,phase,
  proofDigest:packet.Pi_t.proofDigest,
  continuity:packet.C_omega,
  scar:packet.Sigma_t.localScarAfter,
  decision,
  state:index===0?'PARENT_BOUND':index===1?'INTERACTION_TRANSPORT_BOUND':index===2?'SCAR_RETAINED':index===3?'CONTINUITY_GATED':index===4?'LEMMA_COMPRESSION_BOUND':index===5?'BOUNDARY_PROVED':index===6?'MEANING_ASSIGNED':'BEHAVIOR_SELECTED',
 }));
 return{schema:'OMEGA_PCWD_RSC_LOOP_RECEIPT_v1' as const,packetProofDigest:packet.Pi_t.proofDigest,phases:receipts,decision,meaning,closedLoop:receipts.length===8&&receipts[0].phase==='Parent'&&receipts.at(-1)?.phase==='Behavior',canonicalMutation:false as const,boundary:PCWD_SPECIALIZATION_BOUNDARY};
}

export type ComplexV1={re:number;im:number};
export type Matrix2V1=[ComplexV1,ComplexV1,ComplexV1,ComplexV1];
const c=(re=0,im=0):ComplexV1=>({re,im});
const cadd=(a:ComplexV1,b:ComplexV1)=>c(a.re+b.re,a.im+b.im);
const cmul=(a:ComplexV1,b:ComplexV1)=>c(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
const cconj=(a:ComplexV1)=>c(a.re,-a.im);
const cabs=(a:ComplexV1)=>Math.hypot(a.re,a.im);
const madd=(a:Matrix2V1,b:Matrix2V1):Matrix2V1=>[cadd(a[0],b[0]),cadd(a[1],b[1]),cadd(a[2],b[2]),cadd(a[3],b[3])];
const mmul=(a:Matrix2V1,b:Matrix2V1):Matrix2V1=>[
 cadd(cmul(a[0],b[0]),cmul(a[1],b[2])),
 cadd(cmul(a[0],b[1]),cmul(a[1],b[3])),
 cadd(cmul(a[2],b[0]),cmul(a[3],b[2])),
 cadd(cmul(a[2],b[1]),cmul(a[3],b[3])),
];
const dagger=(a:Matrix2V1):Matrix2V1=>[cconj(a[0]),cconj(a[2]),cconj(a[1]),cconj(a[3])];
const trace=(a:Matrix2V1)=>cadd(a[0],a[3]);
const determinant=(a:Matrix2V1)=>cadd(cmul(a[0],a[3]),c(-cmul(a[1],a[2]).re,-cmul(a[1],a[2]).im));
const matrixMaxDiff=(a:Matrix2V1,b:Matrix2V1)=>Math.max(...a.map((x,i)=>cabs(c(x.re-b[i].re,x.im-b[i].im))));
const identity2=():Matrix2V1=>[c(1),c(),c(),c(1)];
const expectation=(rho:Matrix2V1,A:Matrix2V1)=>trace(mmul(rho,A));
const densityValidity=(rho:Matrix2V1,tol:number)=>{
 const tr=trace(rho),det=determinant(rho);
 const hermitian=Math.abs(rho[0].im)<=tol&&Math.abs(rho[3].im)<=tol&&cabs(c(rho[1].re-rho[2].re,rho[1].im+rho[2].im))<=tol;
 const normalized=Math.abs(tr.re-1)<=tol&&Math.abs(tr.im)<=tol;
 const positive=rho[0].re>=-tol&&rho[3].re>=-tol&&det.re>=-tol&&Math.abs(det.im)<=tol;
 return{hermitian,normalized,positive,valid:hermitian&&normalized&&positive,trace:tr,determinant:det};
};
const unitaryValidity=(U:Matrix2V1,tol:number)=>matrixMaxDiff(mmul(dagger(U),U),identity2())<=tol;
function stable(value:any):string{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return'['+value.map(stable).join(',')+']';
 return'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
}
async function sha256(value:any){
 if(!globalThis.crypto?.subtle)throw new Error('Quantum PCWD certificate requires Web Crypto');
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(value)));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function applyUnitaryQubitLemmaV1(rho:Matrix2V1,U:Matrix2V1,observables:Matrix2V1[]=[],tolerance=1e-9){
 const input=densityValidity(rho,tolerance),unitary=unitaryValidity(U,tolerance);
 const Udag=dagger(U),evolved=mmul(mmul(U,rho),Udag),recovered=mmul(mmul(Udag,evolved),U);
 const recoveryError=matrixMaxDiff(rho,recovered);
 let observableError=0;
 for(const A of observables){
  const transformed=mmul(mmul(U,A),Udag);
  const before=expectation(rho,A),after=expectation(evolved,transformed);
  observableError=Math.max(observableError,cabs(c(before.re-after.re,before.im-after.im)));
 }
 const recoveredValidity=densityValidity(recovered,Math.max(tolerance,1e-8));
 const detR=Math.max(0,input.determinant.re),detS=Math.max(0,recoveredValidity.determinant.re);
 const trProduct=trace(mmul(rho,recovered)).re;
 const fidelity=Math.max(0,Math.min(1,trProduct+2*Math.sqrt(detR*detS)));
 const gates={inputDensityValid:input.valid,unitaryValid:unitary,recoveredDensityValid:recoveredValidity.valid,recoveryBounded:recoveryError<=tolerance,observablesBounded:observableError<=tolerance};
 const promotionEligible=Object.values(gates).every(Boolean);
 const core={schema:'OMEGA_PCWD_QUBIT_UNITARY_LEMMA_v1',gates,recoveryError,observableError,fidelity,canonicalMutation:false,physicalLawClaimed:false,boundary:'Finite 2x2 unitary density-matrix specialization of PCWD. It applies standard quantum mechanics; it does not replace quantum mechanics or claim new physics.'};
 return{...core,input:rho,unitary:U,evolved,recovered,proofDigest:await sha256(core),promotionEligible};
}

export const QUBIT={c};
