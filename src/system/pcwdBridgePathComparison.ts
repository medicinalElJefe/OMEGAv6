import{
 executeInterDomainBridgeWithArtifactsV1,type InterDomainBridgeContractV1,
}from'./pcwdInterDomainBridge';
import{
 executeComposedInterDomainBridgeV1,resolutionLensToVector8BridgeV1,type CoefficientVector8V1,type BridgeCompositionReceiptV1,
}from'./pcwdBridgeComposition';
import type{DomainSemanticsProfileV1}from'./pcwdSemanticProfiles';
import type{Matrix2V1}from'./proofCarryingWovenSpecializations';
import{qubitToResolutionLensBridgeV1}from'./pcwdInterDomainBridge';

export const PCWD_PATH_COMPARISON_SCHEMA='OMEGA_PCWD_BRIDGE_PATH_COMPARISON_v1' as const;
export const PCWD_PATH_COMPARISON_BOUNDARY='R363 compares two explicitly typed bridge paths with the same source and target semantic profiles. Endpoint equivalence and zero source-domain round-trip difference do not erase path receipts or loss ledgers. A distinct semantic scar is path evidence, not a new physical observable or a claim that conventional event/history systems cannot retain provenance.' as const;

export type BridgePathComparisonReceiptV1={
 schema:typeof PCWD_PATH_COMPARISON_SCHEMA;
 sourceDomain:string;
 targetDomain:string;
 directBridgeId:string;
 indirectCompositionId:string;
 directReceiptDigest:string;
 indirectReceiptDigest:string;
 endpointMaxError:number;
 sourceRecoveryPathDifference:number;
 directRecoveryError:number;
 indirectRecoveryError:number;
 directLossKinds:string[];
 indirectLossKinds:string[];
 gates:{
  sameTypedEndpoints:boolean;
  directEligible:boolean;
  indirectEligible:boolean;
  endpointEquivalent:boolean;
  sourceRecoveryEquivalent:boolean;
  pathReceiptsDistinct:boolean;
  semanticScarDistinct:boolean;
 };
 pathEquivalent:boolean;
 numericallyFlatLoop:boolean;
 semanticScarRetained:boolean;
 physicalHolonomyClaimed:false;
 semanticEquivalenceClaimed:false;
 boundary:typeof PCWD_PATH_COMPARISON_BOUNDARY;
 receiptDigest:string;
};

const stable=(v:any):string=>{
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return'['+v.map(stable).join(',')+']';
 return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
};
async function sha256(v:any){
 if(!globalThis.crypto?.subtle)throw new Error('R363 path comparison requires Web Crypto SHA-256');
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(v)));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const flatten=(m:Matrix2V1)=>m.flatMap(z=>[z.re,z.im]);
const unflatten=(v:number[]):Matrix2V1=>[
 {re:v[0]??0,im:v[1]??0},{re:v[2]??0,im:v[3]??0},{re:v[4]??0,im:v[5]??0},{re:v[6]??0,im:v[7]??0},
];
const maxVectorError=(a:number[],b:number[])=>Math.max(0,...a.map((v,i)=>Math.abs(v-(b[i]??0))));
const matrixMaxError=(a:Matrix2V1,b:Matrix2V1)=>maxVectorError(flatten(a),flatten(b));
const traceParts=(m:Matrix2V1)=>({re:m[0].re+m[3].re,im:m[0].im+m[3].im});

export function directQubitToVector8BridgeV1(sourceProfile:DomainSemanticsProfileV1,targetProfile:DomainSemanticsProfileV1,tolerance=1e-12):InterDomainBridgeContractV1<Matrix2V1,CoefficientVector8V1,Matrix2V1>{
 return{
  id:'OMEGA_DIRECT_QUBIT_TO_VECTOR8_BRIDGE',version:'1',sourceProfile,targetProfile,
  translate:source=>({schema:'OMEGA_REAL_VECTOR8_PAYLOAD_v1',values:flatten(source),sourceLensTargetCount:4}),
  recover:payload=>unflatten(payload.values),
  recoveryError:matrixMaxError,recoveryTolerance:tolerance,
  invariants:(source,recovered)=>{
   const a=traceParts(source),b=traceParts(recovered);
   return[
    {id:'TRACE_REAL',meaning:'trace real component survives direct coefficient bridge',sourceValue:a.re,recoveredValue:b.re,error:Math.abs(a.re-b.re),tolerance,preserved:Math.abs(a.re-b.re)<=tolerance},
    {id:'TRACE_IMAG',meaning:'trace imaginary component survives direct coefficient bridge',sourceValue:a.im,recoveredValue:b.im,error:Math.abs(a.im-b.im),tolerance,preserved:Math.abs(a.im-b.im)<=tolerance},
   ];
  },
  losses:()=>[
   {kind:'SEMANTIC_NON_TRANSFER',declared:true,magnitude:null,detail:'eight real coefficients encode the matrix entries but do not independently inherit density-matrix semantics'},
   {kind:'AUTHORITY_NON_TRANSFER',declared:true,magnitude:null,detail:'no quantum, physical, experimental or Canon authority transfers to the coefficient payload'},
  ],
  sourceMeaning:'standard-QM 2×2 complex density-matrix coefficient representation',
  targetMeaning:'ordered eight-real coefficient payload',
  translationMeaning:'directly flatten four complex matrix coefficients into eight ordered real scalars',
  recoveryMeaning:'rebuild the four complex coefficients from the ordered real payload',
  semanticAuthorityTransferred:false,canonicalMutation:false,physicalLawClaimed:false,
 };
}

export async function compareDirectAndLensBridgePathsV1(
 source:Matrix2V1,
 sourceProfile:DomainSemanticsProfileV1,
 lensProfile:DomainSemanticsProfileV1,
 targetProfile:DomainSemanticsProfileV1,
 tolerance=1e-12,
):Promise<BridgePathComparisonReceiptV1>{
 const direct=directQubitToVector8BridgeV1(sourceProfile,targetProfile,tolerance);
 const first=qubitToResolutionLensBridgeV1(sourceProfile,lensProfile,tolerance);
 const second=resolutionLensToVector8BridgeV1(lensProfile,targetProfile,tolerance);

 const directExec=await executeInterDomainBridgeWithArtifactsV1(direct,source);
 const firstExec=await executeInterDomainBridgeWithArtifactsV1(first,source);
 const secondExec=await executeInterDomainBridgeWithArtifactsV1(second,firstExec.target);
 const indirectRecovered=await first.recover(secondExec.recovered);
 const indirectComposition:BridgeCompositionReceiptV1=await executeComposedInterDomainBridgeV1(first,second,source);

 const endpointMaxError=maxVectorError(directExec.target.values,secondExec.target.values);
 const sourceRecoveryPathDifference=matrixMaxError(directExec.recovered,indirectRecovered);
 const directLossKinds=directExec.receipt.lossLedger.map(x=>x.kind);
 const indirectLossKinds=indirectComposition.cumulativeLossLedger.map(x=>x.kind);
 const directLossSignature=directExec.receipt.lossLedger.map(x=>({kind:x.kind,detail:x.detail}));
 const indirectLossSignature=indirectComposition.cumulativeLossLedger.map(x=>({kind:x.kind,detail:x.detail,origin:x.originBridge}));
 const gates={
  sameTypedEndpoints:direct.sourceProfile.profileDigest===first.sourceProfile.profileDigest&&direct.targetProfile.profileDigest===second.targetProfile.profileDigest,
  directEligible:directExec.receipt.bridgeEligible,
  indirectEligible:indirectComposition.compositionEligible,
  endpointEquivalent:endpointMaxError<=tolerance,
  sourceRecoveryEquivalent:sourceRecoveryPathDifference<=tolerance,
  pathReceiptsDistinct:directExec.receipt.receiptDigest!==indirectComposition.receiptDigest,
  semanticScarDistinct:stable(directLossSignature)!==stable(indirectLossSignature),
 };
 const pathEquivalent=gates.sameTypedEndpoints&&gates.directEligible&&gates.indirectEligible&&gates.endpointEquivalent&&gates.sourceRecoveryEquivalent;
 const numericallyFlatLoop=pathEquivalent&&sourceRecoveryPathDifference<=tolerance;
 const semanticScarRetained=numericallyFlatLoop&&gates.pathReceiptsDistinct&&gates.semanticScarDistinct;
 const core={
  schema:PCWD_PATH_COMPARISON_SCHEMA,sourceDomain:sourceProfile.domain,targetDomain:targetProfile.domain,
  directBridgeId:direct.id,indirectCompositionId:indirectComposition.compositionId,
  directReceiptDigest:directExec.receipt.receiptDigest,indirectReceiptDigest:indirectComposition.receiptDigest,
  endpointMaxError,sourceRecoveryPathDifference,
  directRecoveryError:directExec.receipt.recoveryError,indirectRecoveryError:indirectComposition.endToEndRecoveryError,
  directLossKinds,indirectLossKinds,gates,pathEquivalent,numericallyFlatLoop,semanticScarRetained,
  physicalHolonomyClaimed:false as const,semanticEquivalenceClaimed:false as const,boundary:PCWD_PATH_COMPARISON_BOUNDARY,
 };
 return{...core,receiptDigest:await sha256(core)};
}

export async function verifyBridgePathComparisonReceiptV1(receipt:BridgePathComparisonReceiptV1){
 if(receipt?.schema!==PCWD_PATH_COMPARISON_SCHEMA||receipt?.boundary!==PCWD_PATH_COMPARISON_BOUNDARY)return false;
 const expectedPathEquivalent=receipt.gates.sameTypedEndpoints&&receipt.gates.directEligible&&receipt.gates.indirectEligible&&receipt.gates.endpointEquivalent&&receipt.gates.sourceRecoveryEquivalent;
 if(receipt.pathEquivalent!==expectedPathEquivalent)return false;
 if(receipt.numericallyFlatLoop!==(receipt.pathEquivalent&&receipt.sourceRecoveryPathDifference<=1e-12))return false;
 if(receipt.semanticScarRetained!==(receipt.numericallyFlatLoop&&receipt.gates.pathReceiptsDistinct&&receipt.gates.semanticScarDistinct))return false;
 if(receipt.physicalHolonomyClaimed!==false||receipt.semanticEquivalenceClaimed!==false)return false;
 const core={
  schema:receipt.schema,sourceDomain:receipt.sourceDomain,targetDomain:receipt.targetDomain,
  directBridgeId:receipt.directBridgeId,indirectCompositionId:receipt.indirectCompositionId,
  directReceiptDigest:receipt.directReceiptDigest,indirectReceiptDigest:receipt.indirectReceiptDigest,
  endpointMaxError:receipt.endpointMaxError,sourceRecoveryPathDifference:receipt.sourceRecoveryPathDifference,
  directRecoveryError:receipt.directRecoveryError,indirectRecoveryError:receipt.indirectRecoveryError,
  directLossKinds:receipt.directLossKinds,indirectLossKinds:receipt.indirectLossKinds,gates:receipt.gates,
  pathEquivalent:receipt.pathEquivalent,numericallyFlatLoop:receipt.numericallyFlatLoop,semanticScarRetained:receipt.semanticScarRetained,
  physicalHolonomyClaimed:receipt.physicalHolonomyClaimed,semanticEquivalenceClaimed:receipt.semanticEquivalenceClaimed,boundary:receipt.boundary,
 };
 return(await sha256(core))===receipt.receiptDigest;
}
