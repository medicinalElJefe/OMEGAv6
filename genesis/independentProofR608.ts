// R608: independent proof envelopes. This module does NOT execute an approved action.
import {createHash,createPublicKey,verify as cryptoVerify} from 'node:crypto';
export type SignedDecision={proposalId:string;decision:'APPROVED'|'DENIED';principal:string;scope:string;issuedAt:string;expiresAt:string;nonce:string;signatureBase64:string;keyId:string};
export type KeyAuthority={keyId:string;principal:string;publicKeyPem:string;allowedScopes:string[];revoked:boolean};
export type VerificationResult={valid:boolean;reasons:string[]};
export function decisionMessage(d:SignedDecision):string{
 // Canonical field order; never sign arbitrary user-supplied JSON.
 return JSON.stringify([d.proposalId,d.decision,d.principal,d.scope,d.issuedAt,d.expiresAt,d.nonce,d.keyId]);
}
export function verifySignedDecision(d:SignedDecision,key:KeyAuthority,now:string,usedNonces:ReadonlySet<string>):VerificationResult{
 const reasons:string[]=[];
 if(d.keyId!==key.keyId||d.principal!==key.principal||key.revoked)reasons.push('untrusted principal or revoked key');
 if(!key.allowedScopes.includes(d.scope))reasons.push('scope not authorized');
 const t=Date.parse(now),issued=Date.parse(d.issuedAt),expiry=Date.parse(d.expiresAt);
 if(!Number.isFinite(t)||!Number.isFinite(issued)||!Number.isFinite(expiry)||issued>t||expiry<=t||expiry<=issued)reasons.push('invalid decision time window');
 if(!d.proposalId||!d.nonce||!d.keyId)reasons.push('missing signed fields');
 if(usedNonces.has(d.nonce))reasons.push('replayed decision');
 try{
  const signature=Buffer.from(d.signatureBase64,'base64');
  if(!signature.length||!cryptoVerify(null,Buffer.from(decisionMessage(d)),createPublicKey(key.publicKeyPem),signature))reasons.push('invalid signature');
 }catch{reasons.push('invalid signature or key');}
 return {valid:reasons.length===0,reasons};
}
export type EvidenceEnvelope={subject:string;sourceId:string;payloadHash:string;previousHash:string;sequence:number;recordedAt:string};
export function evidenceHash(e:EvidenceEnvelope):string{
 return createHash('sha256').update(JSON.stringify([e.subject,e.sourceId,e.payloadHash,e.previousHash,e.sequence,e.recordedAt])).digest('hex');
}
export function verifyEvidenceLink(e:EvidenceEnvelope,expectedPreviousHash:string,expectedSequence:number):VerificationResult{
 const reasons:string[]=[];
 if(e.previousHash!==expectedPreviousHash||e.sequence!==expectedSequence)reasons.push('chain discontinuity');
 if(!e.subject||!e.sourceId||!/^[a-f0-9]{64}$/.test(e.payloadHash))reasons.push('invalid provenance');
 if(!Number.isFinite(Date.parse(e.recordedAt)))reasons.push('invalid record time');
 return {valid:reasons.length===0,reasons};
}
