// R621: immutable signed completion evidence, transactionally coupled to completion.
// A receipt hash alone is not independently auditable after restart.
import {createHash} from 'node:crypto';
import type {SqliteLike} from './leaseStoreR610';
import type {KeyAuthority} from './independentProofR608';
import {completionMessage,verifyCompletionAttestation,type CompletionAttestation} from './completionAttestationR620';
export function initializeCompletionEvidence(db:SqliteLike):void{
 db.exec('CREATE TABLE IF NOT EXISTS genesis_completion_evidence (nonce TEXT PRIMARY KEY NOT NULL, proposal_id TEXT NOT NULL, worker_id TEXT NOT NULL, attestation_json TEXT NOT NULL, attestor_key_json TEXT NOT NULL, receipt_hash TEXT NOT NULL, recorded_at TEXT NOT NULL)');
}
export function recordCompletionWithEvidence(db:SqliteLike,a:CompletionAttestation,key:KeyAuthority,now:string):{recorded:boolean;reason:string}{
 const verified=verifyCompletionAttestation(a,key,now);
 if(!verified.valid)return {recorded:false,reason:verified.reasons.join('; ')};
 const receiptHash=createHash('sha256').update(completionMessage(a)).update(a.signatureBase64).digest('hex');
 db.exec('BEGIN IMMEDIATE');
 try{
  const row=db.prepare('SELECT proposal_id,worker_id,state FROM genesis_action_ledger WHERE nonce=?').get(a.nonce) as {proposal_id?:string;worker_id?:string;state?:string}|undefined;
  if(!row||row.proposal_id!==a.proposalId||row.worker_id!==a.workerId||row.state!=='DISPATCHED'){
   db.exec('ROLLBACK');return {recorded:false,reason:'ledger identity or state mismatch'};
  }
  const inserted=db.prepare('INSERT OR IGNORE INTO genesis_completion_evidence (nonce,proposal_id,worker_id,attestation_json,attestor_key_json,receipt_hash,recorded_at) VALUES (?,?,?,?,?,?,?)').run(a.nonce,a.proposalId,a.workerId,JSON.stringify(a),JSON.stringify(key),receiptHash,now);
  if(inserted.changes!==1){db.exec('ROLLBACK');return {recorded:false,reason:'completion evidence already recorded'};}
  const updated=db.prepare("UPDATE genesis_action_ledger SET state='COMPLETED',receipt_hash=?,updated_at=? WHERE nonce=? AND proposal_id=? AND worker_id=? AND state='DISPATCHED'").run(receiptHash,a.completedAt,a.nonce,a.proposalId,a.workerId);
  if(updated.changes!==1){db.exec('ROLLBACK');return {recorded:false,reason:'completion transition conflict'};}
  db.exec('COMMIT');return {recorded:true,reason:'signed completion and ledger committed'};
 }catch(e){try{db.exec('ROLLBACK')}catch{/* preserve error */}throw e;}
}
export function auditCompletionEvidence(db:SqliteLike,nonce:string,now:string):{valid:boolean;reasons:string[]}{
 const row=db.prepare('SELECT attestation_json,attestor_key_json,receipt_hash FROM genesis_completion_evidence WHERE nonce=?').get(nonce) as {attestation_json:string;attestor_key_json:string;receipt_hash:string}|undefined;
 if(!row)return {valid:false,reasons:['evidence absent']};
 try{
  const a=JSON.parse(row.attestation_json) as CompletionAttestation;
  const key=JSON.parse(row.attestor_key_json) as KeyAuthority;
  const proof=verifyCompletionAttestation(a,key,now);
  const digest=createHash('sha256').update(completionMessage(a)).update(a.signatureBase64).digest('hex');
  const ledger=db.prepare('SELECT proposal_id,worker_id,state,receipt_hash FROM genesis_action_ledger WHERE nonce=?').get(nonce) as {proposal_id?:string;worker_id?:string;state?:string;receipt_hash?:string}|undefined;
  const reasons=[...proof.reasons];
  if(digest!==row.receipt_hash||ledger?.receipt_hash!==digest)reasons.push('receipt digest mismatch');
  if(ledger?.state!=='COMPLETED'||ledger?.proposal_id!==a.proposalId||ledger?.worker_id!==a.workerId||a.nonce!==nonce)reasons.push('ledger identity mismatch');
  // Key snapshot permits historical signature validation, NOT proof of current trust/revocation.
  return {valid:reasons.length===0,reasons};
 }catch{return {valid:false,reasons:['invalid stored evidence']};}
}
