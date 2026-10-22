// R613: Ed25519-signed, proposal-bound execution leases.
// Verification is read-only. Only a trusted authority service may invoke atomic admission.
import {createPublicKey,verify as cryptoVerify} from 'node:crypto';
import {commitProposal,type ExecutionLease} from './executionBoundaryR609';
import type {Proposal} from './kernelR606';
import type {KeyAuthority} from './independentProofR608';
export type SignedExecutionLease=ExecutionLease&{issuerKeyId:string;signatureBase64:string};
export function executionLeaseMessage(l:SignedExecutionLease):string{
 return JSON.stringify(['OMEGA_GENESIS_EXECUTION_LEASE_R613',l.proposalId,l.proposalHash,l.principal,l.scope,l.workerId,l.issuedAt,l.expiresAt,l.nonce,l.maxUses,l.issuerKeyId]);
}
export function verifySignedExecutionLease(p:Proposal,l:SignedExecutionLease,key:KeyAuthority,workerId:string,now:string):{valid:boolean;reasons:string[]}{
 const reasons:string[]=[];const commitment=commitProposal(p);
 if(l.proposalId!==p.id||l.proposalHash!==commitment.contentHash)reasons.push('proposal hash mismatch');
 if(l.scope!==p.scope||l.workerId!==workerId)reasons.push('worker or scope mismatch');
 if(l.issuerKeyId!==key.keyId||l.principal!==key.principal||key.revoked)reasons.push('untrusted issuer');
 if(!key.allowedScopes.includes(l.scope))reasons.push('issuer scope denied');
 if(l.maxUses!==1||!l.nonce)reasons.push('invalid single-use lease');
 const t=Date.parse(now),start=Date.parse(l.issuedAt),end=Date.parse(l.expiresAt);
 if(!Number.isFinite(t)||!Number.isFinite(start)||!Number.isFinite(end)||t<start||t>=end||start>=end)reasons.push('lease time invalid');
 try{
  const signature=Buffer.from(l.signatureBase64,'base64');
  if(signature.length!==64||!cryptoVerify(null,Buffer.from(executionLeaseMessage(l)),createPublicKey(key.publicKeyPem),signature))reasons.push('invalid issuer signature');
 }catch{reasons.push('invalid issuer signature');}
 return {valid:reasons.length===0,reasons};
}
// Deliberately no executor. A caller must additionally enforce human decision,
// issuer trust source, nonce consumption, sandbox capabilities and dispatch receipts.
