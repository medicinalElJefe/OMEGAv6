// R628: independently resolved proof receipts; caller flags cannot grant verified truth.
// Resolver is a trusted host integration boundary, not a user/worker-supplied callback.
import {bridgeCapabilityRecords,type CapabilityRecord,type CapabilityBridge} from './capabilityBridgeR626';
import type {CapabilityEvidence} from './governedCapabilityImportR627';
export type ProofReceipt={capabilityId:string;sourceDigest:string;proofDigest:string;canonicalRegistryId:string;canonicalRevision:string;deploymentId:string;deployedSha:string;productionCheckId:string;status:'VERIFIED'|'FAILED'|'PENDING';};
export type TrustedProofResolver={readonly authority:'TRUSTED_HOST_ONLY';resolve(capabilityId:string,sourceDigest:string):Readonly<ProofReceipt>|null};
export type ResolvedCapabilityImport={bridge:CapabilityBridge;admitted:string[];held:{id:string;reasons:string[]}[];receiptReferences:Record<string,string>};
const sha=/^[a-f0-9]{40,64}$/;
export function importResolvedCapabilities(cycleId:string,records:readonly CapabilityRecord[],resolver:TrustedProofResolver,at:string,source:string,consent:string):ResolvedCapabilityImport{
 if(resolver.authority!=='TRUSTED_HOST_ONLY')throw Error('trusted host resolver required');
 const held:{id:string;reasons:string[]}[]=[],accepted:CapabilityRecord[]=[],receiptReferences:Record<string,string>={};
 const ids=new Set(records.map(r=>r.id));
 for(const r of records){
  const reasons:string[]=[];
  if(r.dependencies.some(d=>!ids.has(d)))reasons.push('unresolved dependency');
  if(r.supersedes.some(d=>!ids.has(d)))reasons.push('unresolved supersession');
  if(r.truthClass==='VERIFIED'){
   let proof:Readonly<ProofReceipt>|null=null;
   try{proof=resolver.resolve(r.id,r.sourceDigest);}catch{reasons.push('trusted resolver unavailable');}
   if(!proof||proof.capabilityId!==r.id||proof.sourceDigest!==r.sourceDigest||proof.status!=='VERIFIED'||!sha.test(proof.proofDigest)||!sha.test(proof.deployedSha)||!proof.canonicalRegistryId||!proof.canonicalRevision||!proof.deploymentId||!proof.productionCheckId)reasons.push('missing authoritative canonical/deployment receipt');
   if(!reasons.length&&proof)receiptReferences[r.id]=proof.proofDigest;
  }
  if(reasons.length)held.push({id:r.id,reasons});else accepted.push(r);
 }
 // Preserve dependency validity after filtering: no capability may refer to a held parent.
 let stable=accepted;
 while(true){
  const current=new Set(stable.map(r=>r.id));
  const next=stable.filter(r=>{
   if(r.dependencies.some(d=>!current.has(d))){held.push({id:r.id,reasons:['dependency held by proof gate']});delete receiptReferences[r.id];return false;}
   return true;
  });
  if(next.length===stable.length)break;
  stable=next;
 }
 const bridge=bridgeCapabilityRecords(cycleId,stable,at,source,consent);
 return {bridge,admitted:bridge.accepted,held:[...held,...bridge.held],receiptReferences};
}
export const RESOLVED_PROOF_BOUNDARY='HOST_RESOLVER_REQUIRED_NOT_PRODUCTION_DEPLOYMENT' as const;
