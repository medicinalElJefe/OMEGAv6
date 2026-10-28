// R627: independently gated capability import; no elevation of source truth.
import {createHash} from 'node:crypto';
import {bridgeCapabilityRecords,type CapabilityRecord,type CapabilityBridge} from './capabilityBridgeR626';
export type CapabilityEvidence={capabilityId:string;sourceDigest:string;proofDigest:string;deploymentVerified:boolean;canonicalSourceVerified:boolean};
export type GovernedImport={bridge:CapabilityBridge;admitted:string[];held:{id:string;reasons:string[]}[]};
const sha=/^[a-f0-9]{64}$/;
export function importGovernedCapabilities(cycleId:string,records:readonly CapabilityRecord[],proofs:readonly CapabilityEvidence[],at:string,source:string,consent:string):GovernedImport{
 const evidenceById=new Map<string,CapabilityEvidence[]>();
 for(const proof of proofs)evidenceById.set(proof.capabilityId,[...(evidenceById.get(proof.capabilityId)||[]),proof]);
 const index=new Map(records.map(r=>[r.id,r]));
 const visiting=new Set<string>(),visited=new Set<string>(),cyclic=new Set<string>();
 function visit(id:string,path:string[]):void{
  if(visiting.has(id)){for(const x of path.slice(path.indexOf(id)))cyclic.add(x);cyclic.add(id);return;}
  if(visited.has(id))return;
  visiting.add(id);
  for(const dep of index.get(id)?.dependencies||[])if(index.has(dep))visit(dep,[...path,dep]);
  visiting.delete(id);visited.add(id);
 }
 for(const r of records)visit(r.id,[r.id]);
 const held:{id:string;reasons:string[]}[]=[],eligible:CapabilityRecord[]=[];
 for(const r of records){
  const reasons:string[]=[];
  const p=evidenceById.get(r.id)||[];
  if(cyclic.has(r.id))reasons.push('cyclic dependency');
  if(r.dependencies.some(d=>cyclic.has(d)))reasons.push('depends on cyclic capability');
  if(r.truthClass==='VERIFIED'){
   if(p.length!==1||p[0].sourceDigest!==r.sourceDigest||!sha.test(p[0].proofDigest)||!p[0].deploymentVerified||!p[0].canonicalSourceVerified)reasons.push('verified truth requires independent canonical and deployment evidence');
  }
  if(r.supersedes.some(id=>!index.has(id)))reasons.push('unresolved supersession');
  if(reasons.length)held.push({id:r.id,reasons});else eligible.push(r);
 }
 const bridge=bridgeCapabilityRecords(cycleId,eligible,at,source,consent);
 return {bridge,admitted:bridge.accepted,held:[...held,...bridge.held]};
}
export const GOVERNED_IMPORT_BOUNDARY='PROOF_GATED_READ_ONLY_NO_PRODUCTION_PROMOTION' as const;
