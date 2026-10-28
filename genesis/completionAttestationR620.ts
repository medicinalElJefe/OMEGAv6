// R620: independently signed completion attestation. Does not prove external effects by itself.
import {createHash,createPublicKey,verify as cryptoVerify} from 'node:crypto';
import type {KeyAuthority} from './independentProofR608';
import type {SqliteLike} from './leaseStoreR610';
export type CompletionAttestation={nonce:string;proposalId:string;workerId:string;resultHash:string;completedAt:string;keyId:string;principal:string;signatureBase64:string};
export function completionMessage(a:CompletionAttestation):string{
 return JSON.stringify(['OMEGA_GENESIS_COMPLETION_R620',a.nonce,a.proposalId,a.workerId,a.resultHash,a.completedAt,a.keyId,a.principal]);
}
export function verifyCompletionAttestation(a:CompletionAttestation,key:KeyAuthority,now:string):{valid:boolean;reasons:string[]}{
 const reasons:string[]=[];
 if(a.keyId!==key.keyId||a.principal!==key.principal||key.revoked)reasons.push('untrusted attestor');
 if(!key.allowedScopes.includes('genesis:attest'))reasons.push('attestation scope denied');
 if(!a.nonce||!a.proposalId||!a.workerId||!/^[a-f0-9]{64}$/.test(a.resultHash))reasons.push('invalid attestation fields');
 const t=Date.parse(now),completed=Date.parse(a.completedAt);
 if(!Number.isFinite(t)||!Number.isFinite(completed)||completed>t)reasons.push('invalid completion time');
 try{
  const sig=Buffer.from(a.signatureBase64,'base64');
  if(sig.length!==64||!cryptoVerify(null,Buffer.from(completionMessage(a)),createPublicKey(key.publicKeyPem),sig))reasons.push('invalid attestation signature');
 }catch{reasons.push('invalid attestation signature');}
 return {valid:reasons.length===0,reasons};
}
export function recordAttestedCompletion(db:SqliteLike,a:CompletionAttestation,key:KeyAuthority,now:string):{recorded:boolean;reason:string}{
 const proof=verifyCompletionAttestation(a,key,now);
 if(!proof.valid)return {recorded:false,reason:proof.reasons.join('; ')};
 const row=db.prepare('SELECT proposal_id,worker_id,state FROM genesis_action_ledger WHERE nonce=?').get(a.nonce) as {proposal_id?:string;worker_id?:string;state?:string}|undefined;
 if(!row||row.proposal_id!==a.proposalId||row.worker_id!==a.workerId||row.state!=='DISPATCHED')return {recorded:false,reason:'ledger identity or dispatch state mismatch'};
 const receiptHash=createHash('sha256').update(completionMessage(a)).update(a.signatureBase64).digest('hex');
 const result=db.prepare("UPDATE genesis_action_ledger SET state='COMPLETED',receipt_hash=?,updated_at=? WHERE nonce=? AND proposal_id=? AND worker_id=? AND state='DISPATCHED'").run(receiptHash,a.completedAt,a.nonce,a.proposalId,a.workerId);
 return result.changes===1?{recorded:true,reason:'attested completion recorded'}:{recorded:false,reason:'completion already claimed'};
}
