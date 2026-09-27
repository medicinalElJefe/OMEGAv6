import{
 executeInterDomainBridgeWithArtifactsV1,verifyInterDomainBridgeReceiptV1,
 type BridgeInvariantReceiptV1,type BridgeLossEntryV1,type InterDomainBridgeContractV1,type InterDomainBridgeReceiptV1,
 PCWD_BRIDGE_BOUNDARY,
}from'./pcwdInterDomainBridge';
import{compileResolutionLensV1,recoverResolutionLensV1,type ResolutionLensV1}from'./proofCarryingWovenSpecializations';
import type{DomainSemanticsProfileV1}from'./pcwdSemanticProfiles';

export const PCWD_BRIDGE_COMPOSITION_SCHEMA='OMEGA_PCWD_BRIDGE_COMPOSITION_v1' as const;
export const PCWD_BRIDGE_COMPOSITION_BOUNDARY='Bridge composition preserves each component receipt and loss ledger. Recovery errors from different semantic spaces are never numerically added unless a separate typed amplification law is declared. The end-to-end gate is measured back in the original source domain; component gates remain authoritative in their own domains.' as const;

export type CoefficientVector8V1={schema:'OMEGA_REAL_VECTOR8_PAYLOAD_v1';values:number[];sourceLensTargetCount:number};

export type ComposedLossEntryV1=BridgeLossEntryV1&{originBridge:string;originReceiptDigest:string};
export type BridgeCompositionReceiptV1={
 schema:typeof PCWD_BRIDGE_COMPOSITION_SCHEMA;
 compositionId:string;
 sourceDomain:string;
 intermediateDomain:string;
 targetDomain:string;
 firstReceipt:InterDomainBridgeReceiptV1;
 secondReceipt:InterDomainBridgeReceiptV1;
 endToEndRecoveryError:number;
 endToEndRecoveryTolerance:number;
 endToEndInvariants:BridgeInvariantReceiptV1[];
 cumulativeLossLedger:ComposedLossEntryV1[];
 gates:{
  componentReceiptsValid:boolean;
  componentBridgesEligible:boolean;
  profileChainCompatible:boolean;
  endToEndRecoveryBounded:boolean;
  endToEndInvariantsPreserved:boolean;
  lossLedgerMonotone:boolean;
  noUnmodeledLoss:boolean;
  semanticAuthorityNotTransferred:boolean;
 };
 compositionEligible:boolean;
 errorAggregation:'SOURCE_DOMAIN_END_TO_END_MEASUREMENT';
 crossDomainErrorAdditionPerformed:false;
 semanticEquivalenceClaimed:false;
 semanticAuthorityTransferred:false;
 boundary:typeof PCWD_BRIDGE_COMPOSITION_BOUNDARY;
 bridgeBoundary:typeof PCWD_BRIDGE_BOUNDARY;
 receiptDigest:string;
};

const stable=(v:any):string=>{
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return'['+v.map(stable).join(',')+']';
 return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
};
async function sha256(v:any){
 if(!globalThis.crypto?.subtle)throw new Error('R362 bridge composition requires Web Crypto SHA-256');
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(v)));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const finiteNonnegative=(n:unknown)=>Number.isFinite(Number(n))?Math.max(0,Number(n)):Number.POSITIVE_INFINITY;

const lossCore=(x:BridgeLossEntryV1)=>({kind:x.kind,declared:x.declared,magnitude:x.magnitude,detail:x.detail});
const sameLoss=(a:BridgeLossEntryV1,b:BridgeLossEntryV1)=>stable(lossCore(a))===stable(lossCore(b));

export async function executeComposedInterDomainBridgeV1<A,B,C,AR>(
 first:InterDomainBridgeContractV1<A,B,AR>,
 second:InterDomainBridgeContractV1<B,C,B>,
 source:A,
):Promise<BridgeCompositionReceiptV1>{
 const profileChainCompatible=first.targetProfile.profileDigest===second.sourceProfile.profileDigest;
 if(!profileChainCompatible)throw new Error('R362 bridge composition rejected incompatible intermediate semantic profiles');
 const firstExec=await executeInterDomainBridgeWithArtifactsV1(first,source);
 const secondExec=await executeInterDomainBridgeWithArtifactsV1(second,firstExec.target);
 const recoveredSource=await first.recover(secondExec.recovered);
 const endToEndRecoveryError=finiteNonnegative(first.recoveryError(source,recoveredSource));
 const endToEndInvariants=first.invariants(source,recoveredSource).map(x=>({
  ...x,error:finiteNonnegative(x.error),tolerance:finiteNonnegative(x.tolerance),
  preserved:finiteNonnegative(x.error)<=finiteNonnegative(x.tolerance),
 }));
 const cumulativeLossLedger:ComposedLossEntryV1[]=[
  ...firstExec.receipt.lossLedger.map(x=>({...x,originBridge:first.id,originReceiptDigest:firstExec.receipt.receiptDigest})),
  ...secondExec.receipt.lossLedger.map(x=>({...x,originBridge:second.id,originReceiptDigest:secondExec.receipt.receiptDigest})),
 ];
 const[firstReceiptValid,secondReceiptValid]=await Promise.all([
  verifyInterDomainBridgeReceiptV1(firstExec.receipt),
  verifyInterDomainBridgeReceiptV1(secondExec.receipt),
 ]);
 const firstLossesPreserved=firstExec.receipt.lossLedger.every(x=>cumulativeLossLedger.some(y=>y.originBridge===first.id&&y.originReceiptDigest===firstExec.receipt.receiptDigest&&sameLoss(x,y)));
 const secondLossesPreserved=secondExec.receipt.lossLedger.every(x=>cumulativeLossLedger.some(y=>y.originBridge===second.id&&y.originReceiptDigest===secondExec.receipt.receiptDigest&&sameLoss(x,y)));
 const gates={
  componentReceiptsValid:firstReceiptValid&&secondReceiptValid,
  componentBridgesEligible:firstExec.receipt.bridgeEligible&&secondExec.receipt.bridgeEligible,
  profileChainCompatible,
  endToEndRecoveryBounded:endToEndRecoveryError<=finiteNonnegative(first.recoveryTolerance),
  endToEndInvariantsPreserved:endToEndInvariants.every(x=>x.preserved),
  lossLedgerMonotone:firstLossesPreserved&&secondLossesPreserved&&cumulativeLossLedger.length===firstExec.receipt.lossLedger.length+secondExec.receipt.lossLedger.length,
  noUnmodeledLoss:!cumulativeLossLedger.some(x=>x.kind==='UNMODELED_LOSS'),
  semanticAuthorityNotTransferred:firstExec.receipt.semanticAuthorityTransferred===false&&secondExec.receipt.semanticAuthorityTransferred===false,
 };
 const compositionEligible=Object.values(gates).every(Boolean);
 const core={
  schema:PCWD_BRIDGE_COMPOSITION_SCHEMA,
  compositionId:`${second.id}∘${first.id}`,
  sourceDomain:first.sourceProfile.domain,intermediateDomain:first.targetProfile.domain,targetDomain:second.targetProfile.domain,
  firstReceipt:firstExec.receipt,secondReceipt:secondExec.receipt,
  endToEndRecoveryError,endToEndRecoveryTolerance:finiteNonnegative(first.recoveryTolerance),endToEndInvariants,cumulativeLossLedger,gates,compositionEligible,
  errorAggregation:'SOURCE_DOMAIN_END_TO_END_MEASUREMENT' as const,crossDomainErrorAdditionPerformed:false as const,
  semanticEquivalenceClaimed:false as const,semanticAuthorityTransferred:false as const,
  boundary:PCWD_BRIDGE_COMPOSITION_BOUNDARY,bridgeBoundary:PCWD_BRIDGE_BOUNDARY,
 };
 return{...core,receiptDigest:await sha256(core)};
}

export async function verifyBridgeCompositionReceiptV1(receipt:BridgeCompositionReceiptV1){
 if(receipt?.schema!==PCWD_BRIDGE_COMPOSITION_SCHEMA||receipt?.boundary!==PCWD_BRIDGE_COMPOSITION_BOUNDARY||receipt?.bridgeBoundary!==PCWD_BRIDGE_BOUNDARY)return false;
 const[firstValid,secondValid]=await Promise.all([
  verifyInterDomainBridgeReceiptV1(receipt.firstReceipt),
  verifyInterDomainBridgeReceiptV1(receipt.secondReceipt),
 ]);
 const firstLosses=receipt.firstReceipt.lossLedger.every(x=>receipt.cumulativeLossLedger.some(y=>y.originBridge===receipt.firstReceipt.bridgeId&&y.originReceiptDigest===receipt.firstReceipt.receiptDigest&&sameLoss(x,y)));
 const secondLosses=receipt.secondReceipt.lossLedger.every(x=>receipt.cumulativeLossLedger.some(y=>y.originBridge===receipt.secondReceipt.bridgeId&&y.originReceiptDigest===receipt.secondReceipt.receiptDigest&&sameLoss(x,y)));
 const expectedGates={
  componentReceiptsValid:firstValid&&secondValid,
  componentBridgesEligible:receipt.firstReceipt.bridgeEligible&&receipt.secondReceipt.bridgeEligible,
  profileChainCompatible:receipt.firstReceipt.targetProfileDigest===receipt.secondReceipt.sourceProfileDigest,
  endToEndRecoveryBounded:receipt.endToEndRecoveryError<=receipt.endToEndRecoveryTolerance,
  endToEndInvariantsPreserved:receipt.endToEndInvariants.every(x=>x.error<=x.tolerance&&x.preserved===true),
  lossLedgerMonotone:firstLosses&&secondLosses&&receipt.cumulativeLossLedger.length===receipt.firstReceipt.lossLedger.length+receipt.secondReceipt.lossLedger.length,
  noUnmodeledLoss:!receipt.cumulativeLossLedger.some(x=>x.kind==='UNMODELED_LOSS'),
  semanticAuthorityNotTransferred:receipt.firstReceipt.semanticAuthorityTransferred===false&&receipt.secondReceipt.semanticAuthorityTransferred===false,
 };
 if(stable(expectedGates)!==stable(receipt.gates))return false;
 if(receipt.compositionEligible!==Object.values(receipt.gates).every(Boolean))return false;
 if(receipt.crossDomainErrorAdditionPerformed!==false||receipt.errorAggregation!=='SOURCE_DOMAIN_END_TO_END_MEASUREMENT'||receipt.semanticEquivalenceClaimed!==false||receipt.semanticAuthorityTransferred!==false)return false;
 const core={
  schema:receipt.schema,compositionId:receipt.compositionId,sourceDomain:receipt.sourceDomain,intermediateDomain:receipt.intermediateDomain,targetDomain:receipt.targetDomain,
  firstReceipt:receipt.firstReceipt,secondReceipt:receipt.secondReceipt,endToEndRecoveryError:receipt.endToEndRecoveryError,endToEndRecoveryTolerance:receipt.endToEndRecoveryTolerance,
  endToEndInvariants:receipt.endToEndInvariants,cumulativeLossLedger:receipt.cumulativeLossLedger,gates:receipt.gates,compositionEligible:receipt.compositionEligible,
  errorAggregation:receipt.errorAggregation,crossDomainErrorAdditionPerformed:receipt.crossDomainErrorAdditionPerformed,
  semanticEquivalenceClaimed:receipt.semanticEquivalenceClaimed,semanticAuthorityTransferred:receipt.semanticAuthorityTransferred,
  boundary:receipt.boundary,bridgeBoundary:receipt.bridgeBoundary,
 };
 return(await sha256(core))===receipt.receiptDigest;
}

const maxDiff=(a:number[],b:number[])=>Math.max(...a.map((v,i)=>Math.abs(v-(b[i]??0))),0);
const lensVector=(lens:ResolutionLensV1)=>recoverResolutionLensV1(lens);

export function resolutionLensToVector8BridgeV1(sourceProfile:DomainSemanticsProfileV1,targetProfile:DomainSemanticsProfileV1,tolerance=1e-12):InterDomainBridgeContractV1<ResolutionLensV1,CoefficientVector8V1,ResolutionLensV1>{
 return{
  id:'OMEGA_RESOLUTION_LENS_TO_VECTOR8_BRIDGE',version:'1',sourceProfile,targetProfile,
  translate:lens=>{
   const values=lensVector(lens);
   if(values.length!==8)throw new Error(`R362 vector8 bridge requires exactly 8 recovered coefficients; received ${values.length}`);
   return{schema:'OMEGA_REAL_VECTOR8_PAYLOAD_v1',values,sourceLensTargetCount:lens.targetCount};
  },
  recover:payload=>compileResolutionLensV1(payload.values,payload.sourceLensTargetCount),
  recoveryError:(source,recovered)=>Math.max(
   maxDiff(source.coarse,recovered.coarse),
   maxDiff(source.residual,recovered.residual),
   Math.abs(source.recoveryError-recovered.recoveryError),
  ),
  recoveryTolerance:tolerance,
  invariants:(source,recovered)=>[
   {id:'VECTOR_SUM',meaning:'recovered coefficient sum survives lens→vector→lens bridge',sourceValue:lensVector(source).reduce((s,v)=>s+v,0),recoveredValue:lensVector(recovered).reduce((s,v)=>s+v,0),error:Math.abs(lensVector(source).reduce((s,v)=>s+v,0)-lensVector(recovered).reduce((s,v)=>s+v,0)),tolerance,preserved:true},
   {id:'RESIDUAL_L2',meaning:'explicit residual energy survives bridge reconstruction',sourceValue:Math.sqrt(source.residual.reduce((s,v)=>s+v*v,0)),recoveredValue:Math.sqrt(recovered.residual.reduce((s,v)=>s+v*v,0)),error:Math.abs(Math.sqrt(source.residual.reduce((s,v)=>s+v*v,0))-Math.sqrt(recovered.residual.reduce((s,v)=>s+v*v,0))),tolerance,preserved:true},
  ],
  losses:()=>[
   {kind:'SEMANTIC_NON_TRANSFER',declared:true,magnitude:null,detail:'ordered vector coefficients do not inherit the resolution-lens semantic role merely by carrying the same recovered numbers'},
   {kind:'AUTHORITY_NON_TRANSFER',declared:true,magnitude:null,detail:'representation authority does not transfer beyond the declared coefficient payload'},
  ],
  sourceMeaning:'recoverable resolution lens containing coarse representatives plus explicit residual',
  targetMeaning:'ordered eight-real coefficient payload plus target-count reconstruction metadata',
  translationMeaning:'recover the eight coefficients and retain only the target-count metadata required to deterministically rebuild the lens',
  recoveryMeaning:'recompile the resolution lens from the eight recovered coefficients and preserved target-count metadata',
  semanticAuthorityTransferred:false,canonicalMutation:false,physicalLawClaimed:false,
 };
}
