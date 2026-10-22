import{
 PCWD_SEMANTIC_BOUNDARY,verifyDomainSemanticsProfileV1,type DomainSemanticsProfileV1,
}from'./pcwdSemanticProfiles';
import{compileResolutionLensV1,recoverResolutionLensV1,type Matrix2V1,type ResolutionLensV1}from'./proofCarryingWovenSpecializations';

export const PCWD_BRIDGE_SCHEMA='OMEGA_PCWD_TYPED_INTERDOMAIN_BRIDGE_v1' as const;
export const PCWD_BRIDGE_BOUNDARY='A PCWD bridge proves only the declared translation, recovery, invariant, loss-ledger and authority-boundary contract between two typed semantic profiles. A successful bridge does not make the target representation semantically identical to the source domain and does not transfer physical, observational, CanonState, dispatch or production authority.' as const;

export type BridgeLossKindV1='NUMERIC_RESIDUAL'|'SEMANTIC_NON_TRANSFER'|'AUTHORITY_NON_TRANSFER'|'INVARIANT_RESIDUAL'|'UNMODELED_LOSS';
export type BridgeLossEntryV1={
 kind:BridgeLossKindV1;
 declared:boolean;
 magnitude:number|null;
 detail:string;
};
export type BridgeInvariantReceiptV1={
 id:string;
 meaning:string;
 sourceValue:number;
 recoveredValue:number;
 error:number;
 tolerance:number;
 preserved:boolean;
};
export type InterDomainBridgeContractV1<S,T,R>={
 id:string;
 version:string;
 sourceProfile:DomainSemanticsProfileV1;
 targetProfile:DomainSemanticsProfileV1;
 translate:(source:S)=>Promise<T>|T;
 recover:(target:T)=>Promise<R>|R;
 recoveryError:(source:S,recovered:R)=>number;
 recoveryTolerance:number;
 invariants:(source:S,recovered:R)=>BridgeInvariantReceiptV1[];
 losses:(source:S,target:T,recovered:R)=>BridgeLossEntryV1[];
 sourceMeaning:string;
 targetMeaning:string;
 translationMeaning:string;
 recoveryMeaning:string;
 semanticAuthorityTransferred:false;
 canonicalMutation:false;
 physicalLawClaimed:false;
};
export type InterDomainBridgeExecutionV1<T,R>={target:T;recovered:R;receipt:InterDomainBridgeReceiptV1};
export type InterDomainBridgeReceiptV1={
 schema:typeof PCWD_BRIDGE_SCHEMA;
 bridgeId:string;
 bridgeVersion:string;
 sourceDomain:string;
 targetDomain:string;
 sourceProfileDigest:string;
 targetProfileDigest:string;
 sourceDigest:string;
 targetDigest:string;
 recoveredDigest:string;
 recoveryError:number;
 recoveryTolerance:number;
 invariants:BridgeInvariantReceiptV1[];
 lossLedger:BridgeLossEntryV1[];
 gates:{
  profilesValid:boolean;
  sourceTargetDistinct:boolean;
  recoveryBounded:boolean;
  invariantsPreserved:boolean;
  allLossDeclared:boolean;
  noUnmodeledLoss:boolean;
  semanticAuthorityNotTransferred:boolean;
  canonicalMutationAbsent:boolean;
  physicalLawNotClaimed:boolean;
 };
 bridgeEligible:boolean;
 semanticEquivalenceClaimed:false;
 semanticAuthorityTransferred:false;
 canonicalMutation:false;
 physicalLawClaimed:false;
 sourceMeaning:string;
 targetMeaning:string;
 translationMeaning:string;
 recoveryMeaning:string;
 semanticProfileBoundary:typeof PCWD_SEMANTIC_BOUNDARY;
 boundary:typeof PCWD_BRIDGE_BOUNDARY;
 receiptDigest:string;
};

const stable=(v:any):string=>{
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return'['+v.map(stable).join(',')+']';
 return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
};
async function sha256(v:any){
 if(!globalThis.crypto?.subtle)throw new Error('R361 bridge requires Web Crypto SHA-256');
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(v)));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const finiteNonnegative=(n:unknown)=>Number.isFinite(Number(n))?Math.max(0,Number(n)):Number.POSITIVE_INFINITY;

export async function executeInterDomainBridgeWithArtifactsV1<S,T,R>(contract:InterDomainBridgeContractV1<S,T,R>,source:S):Promise<InterDomainBridgeExecutionV1<T,R>>{
 const[sourceProfileValid,targetProfileValid]=await Promise.all([
  verifyDomainSemanticsProfileV1(contract.sourceProfile),
  verifyDomainSemanticsProfileV1(contract.targetProfile),
 ]);
 const target=await contract.translate(source);
 const recovered=await contract.recover(target);
 const recoveryError=finiteNonnegative(contract.recoveryError(source,recovered));
 const invariants=contract.invariants(source,recovered).map(x=>({
  ...x,error:finiteNonnegative(x.error),tolerance:finiteNonnegative(x.tolerance),
  preserved:finiteNonnegative(x.error)<=finiteNonnegative(x.tolerance),
 }));
 const lossLedger=contract.losses(source,target,recovered).map(x=>({...x,magnitude:x.magnitude===null?null:finiteNonnegative(x.magnitude)}));
 const gates={
  profilesValid:sourceProfileValid&&targetProfileValid,
  sourceTargetDistinct:contract.sourceProfile.profileDigest!==contract.targetProfile.profileDigest,
  recoveryBounded:recoveryError<=finiteNonnegative(contract.recoveryTolerance),
  invariantsPreserved:invariants.every(x=>x.preserved),
  allLossDeclared:lossLedger.length>0&&lossLedger.every(x=>x.declared===true),
  noUnmodeledLoss:!lossLedger.some(x=>x.kind==='UNMODELED_LOSS'),
  semanticAuthorityNotTransferred:contract.semanticAuthorityTransferred===false,
  canonicalMutationAbsent:contract.canonicalMutation===false,
  physicalLawNotClaimed:contract.physicalLawClaimed===false,
 };
 const bridgeEligible=Object.values(gates).every(Boolean);
 const core={
  schema:PCWD_BRIDGE_SCHEMA,bridgeId:contract.id,bridgeVersion:contract.version,
  sourceDomain:contract.sourceProfile.domain,targetDomain:contract.targetProfile.domain,
  sourceProfileDigest:contract.sourceProfile.profileDigest,targetProfileDigest:contract.targetProfile.profileDigest,
  sourceDigest:await sha256(source),targetDigest:await sha256(target),recoveredDigest:await sha256(recovered),
  recoveryError,recoveryTolerance:finiteNonnegative(contract.recoveryTolerance),invariants,lossLedger,gates,bridgeEligible,
  semanticEquivalenceClaimed:false as const,semanticAuthorityTransferred:false as const,canonicalMutation:false as const,physicalLawClaimed:false as const,
  sourceMeaning:contract.sourceMeaning,targetMeaning:contract.targetMeaning,translationMeaning:contract.translationMeaning,recoveryMeaning:contract.recoveryMeaning,
  semanticProfileBoundary:PCWD_SEMANTIC_BOUNDARY,boundary:PCWD_BRIDGE_BOUNDARY,
 };
 const receipt={...core,receiptDigest:await sha256(core)};
 return{target,recovered,receipt};
}

export async function executeInterDomainBridgeV1<S,T,R>(contract:InterDomainBridgeContractV1<S,T,R>,source:S):Promise<InterDomainBridgeReceiptV1>{
 return(await executeInterDomainBridgeWithArtifactsV1(contract,source)).receipt;
}

export async function verifyInterDomainBridgeReceiptV1(receipt:InterDomainBridgeReceiptV1){
 if(receipt?.schema!==PCWD_BRIDGE_SCHEMA||receipt?.boundary!==PCWD_BRIDGE_BOUNDARY||receipt?.semanticProfileBoundary!==PCWD_SEMANTIC_BOUNDARY)return false;
 const expectedGates={
  profilesValid:receipt.gates.profilesValid,
  sourceTargetDistinct:receipt.sourceProfileDigest!==receipt.targetProfileDigest,
  recoveryBounded:receipt.recoveryError<=receipt.recoveryTolerance,
  invariantsPreserved:receipt.invariants.every(x=>x.error<=x.tolerance&&x.preserved===true),
  allLossDeclared:receipt.lossLedger.length>0&&receipt.lossLedger.every(x=>x.declared===true),
  noUnmodeledLoss:!receipt.lossLedger.some(x=>x.kind==='UNMODELED_LOSS'),
  semanticAuthorityNotTransferred:receipt.semanticAuthorityTransferred===false,
  canonicalMutationAbsent:receipt.canonicalMutation===false,
  physicalLawNotClaimed:receipt.physicalLawClaimed===false,
 };
 if(stable(expectedGates)!==stable(receipt.gates))return false;
 if(receipt.bridgeEligible!==Object.values(receipt.gates).every(Boolean))return false;
 if(receipt.semanticEquivalenceClaimed!==false||receipt.semanticAuthorityTransferred!==false||receipt.canonicalMutation!==false||receipt.physicalLawClaimed!==false)return false;
 const core={
  schema:receipt.schema,bridgeId:receipt.bridgeId,bridgeVersion:receipt.bridgeVersion,
  sourceDomain:receipt.sourceDomain,targetDomain:receipt.targetDomain,
  sourceProfileDigest:receipt.sourceProfileDigest,targetProfileDigest:receipt.targetProfileDigest,
  sourceDigest:receipt.sourceDigest,targetDigest:receipt.targetDigest,recoveredDigest:receipt.recoveredDigest,
  recoveryError:receipt.recoveryError,recoveryTolerance:receipt.recoveryTolerance,invariants:receipt.invariants,lossLedger:receipt.lossLedger,gates:receipt.gates,bridgeEligible:receipt.bridgeEligible,
  semanticEquivalenceClaimed:receipt.semanticEquivalenceClaimed,semanticAuthorityTransferred:receipt.semanticAuthorityTransferred,canonicalMutation:receipt.canonicalMutation,physicalLawClaimed:receipt.physicalLawClaimed,
  sourceMeaning:receipt.sourceMeaning,targetMeaning:receipt.targetMeaning,translationMeaning:receipt.translationMeaning,recoveryMeaning:receipt.recoveryMeaning,
  semanticProfileBoundary:receipt.semanticProfileBoundary,boundary:receipt.boundary,
 };
 return(await sha256(core))===receipt.receiptDigest;
}

const flattenMatrix2=(m:Matrix2V1)=>m.flatMap(z=>[z.re,z.im]);
const unflattenMatrix2=(v:number[]):Matrix2V1=>[
 {re:v[0]??0,im:v[1]??0},{re:v[2]??0,im:v[3]??0},{re:v[4]??0,im:v[5]??0},{re:v[6]??0,im:v[7]??0},
];
const matrixMaxError=(a:Matrix2V1,b:Matrix2V1)=>Math.max(...a.flatMap((z,i)=>[Math.abs(z.re-b[i].re),Math.abs(z.im-b[i].im)]));
const traceParts=(m:Matrix2V1)=>({re:m[0].re+m[3].re,im:m[0].im+m[3].im});

export function qubitToResolutionLensBridgeV1(sourceProfile:DomainSemanticsProfileV1,targetProfile:DomainSemanticsProfileV1,tolerance=1e-12):InterDomainBridgeContractV1<Matrix2V1,ResolutionLensV1,Matrix2V1>{
 return{
  id:'OMEGA_QUBIT_TO_RESOLUTION_LENS_BRIDGE',version:'1',sourceProfile,targetProfile,
  translate:source=>compileResolutionLensV1(flattenMatrix2(source),4),
  recover:target=>unflattenMatrix2(recoverResolutionLensV1(target)),
  recoveryError:matrixMaxError,recoveryTolerance:tolerance,
  invariants:(source,recovered)=>{
   const a=traceParts(source),b=traceParts(recovered);
   return[
    {id:'TRACE_REAL',meaning:'density-matrix trace real component survives representation bridge',sourceValue:a.re,recoveredValue:b.re,error:Math.abs(a.re-b.re),tolerance,preserved:Math.abs(a.re-b.re)<=tolerance},
    {id:'TRACE_IMAG',meaning:'density-matrix trace imaginary component survives representation bridge',sourceValue:a.im,recoveredValue:b.im,error:Math.abs(a.im-b.im),tolerance,preserved:Math.abs(a.im-b.im)<=tolerance},
   ];
  },
  losses:(_source,target)=>[
   {kind:'NUMERIC_RESIDUAL',declared:true,magnitude:target.recoveryError,detail:'coarse representation alone is lossy; explicit residual sidecar is retained for exact recovery'},
   {kind:'SEMANTIC_NON_TRANSFER',declared:true,magnitude:null,detail:'resolution-lens coefficients are a representation of matrix coefficients and are not independently a quantum state claim'},
   {kind:'AUTHORITY_NON_TRANSFER',declared:true,magnitude:null,detail:'quantum/physical/experimental authority is not transferred into the generic vector-lens domain'},
  ],
  sourceMeaning:'standard-QM 2×2 complex density-matrix coefficient representation',
  targetMeaning:'generic real-valued recoverable resolution-lens representation',
  translationMeaning:'flatten complex coefficients into eight real scalars, then retain coarse bins plus explicit residual sidecar',
  recoveryMeaning:'reconstruct eight real scalars from coarse+residual and rebuild the 2×2 complex matrix',
  semanticAuthorityTransferred:false,canonicalMutation:false,physicalLawClaimed:false,
 };
}


export function qubitToLossyResolutionLensBridgeV1(sourceProfile:DomainSemanticsProfileV1,targetProfile:DomainSemanticsProfileV1,tolerance=1e-12):InterDomainBridgeContractV1<Matrix2V1,ResolutionLensV1,Matrix2V1>{
 const base=qubitToResolutionLensBridgeV1(sourceProfile,targetProfile,tolerance);
 return{
  ...base,
  id:'OMEGA_QUBIT_TO_LOSSY_LENS_NEGATIVE_CONTROL',
  translate:source=>{
   const lens=compileResolutionLensV1(flattenMatrix2(source),4);
   return{...lens,residual:lens.residual.map(()=>0),exactRecovery:false,recoveryError:1};
  },
  losses:()=>[
   {kind:'UNMODELED_LOSS',declared:false,magnitude:.5,detail:'negative control intentionally deletes the residual sidecar'},
  ],
  translationMeaning:'negative control: flatten complex coefficients, coarse-grain, then intentionally delete the residual sidecar',
 };
}
