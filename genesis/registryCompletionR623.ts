// R623: resolve completion attestor from persistent trusted registry inside transaction.
// Signed evidence is retained for historical audit; current trust is checked at admission.
import type {SqliteLike} from './leaseStoreR610';
import type {CompletionAttestation} from './completionAttestationR620';
import {completionMessage,verifyCompletionAttestation} from './completionAttestationR620';
import {resolveTrustedAuthority} from './authorityRegistryR622';
import {createHash} from 'node:crypto';
import {initializeCompletionEvidence} from './completionEvidenceR621';
export function recordRegistryAttestedCompletion(db:SqliteLike,a:CompletionAttestation,now:string):{recorded:boolean;reason:string}{
 db.exec('BEGIN IMMEDIATE');
 try{
  const key=resolveTrustedAuthority(db,a.keyId,'COMPLETION_ATTESTOR');
  if(!key){db.exec('ROLLBACK');return {recorded:false,reason:'attestor absent, revoked or wrong role'};}
  const proof=verifyCompletionAttestation(a,key,now);
  if(!proof.valid){db.exec('ROLLBACK');return {recorded:false,reason:proof.reasons.join('; ')};}
  const row=db.prepare('SELECT proposal_id,worker_id,state FROM genesis_action_ledger WHERE nonce=?').get(a.nonce) as {proposal_id?:string;worker_id?:string;state?:string}|undefined;
  if(!row||row.proposal_id!==a.proposalId||row.worker_id!==a.workerId||row.state!=='DISPATCHED'){db.exec('ROLLBACK');return {recorded:false,reason:'ledger identity or state mismatch'};}
  const digest=createHash('sha256').update(completionMessage(a)).update(a.signatureBase64).digest('hex');
  const stored=db.prepare('INSERT OR IGNORE INTO genesis_completion_evidence (nonce,proposal_id,worker_id,attestation_json,attestor_key_json,receipt_hash,recorded_at) VALUES (?,?,?,?,?,?,?)').run(a.nonce,a.proposalId,a.workerId,JSON.stringify(a),JSON.stringify(key),digest,now);
  if(stored.changes!==1){db.exec('ROLLBACK');return {recorded:false,reason:'completion evidence already exists'};}
  const updated=db.prepare("UPDATE genesis_action_ledger SET state='COMPLETED',receipt_hash=?,updated_at=? WHERE nonce=? AND proposal_id=? AND worker_id=? AND state='DISPATCHED'").run(digest,a.completedAt,a.nonce,a.proposalId,a.workerId);
  if(updated.changes!==1){db.exec('ROLLBACK');return {recorded:false,reason:'completion state conflict'};}
  db.exec('COMMIT');return {recorded:true,reason:'registry-attested completion committed'};
 }catch(e){try{db.exec('ROLLBACK')}catch{/* preserve error */}throw e;}
}
export function initializeRegistryCompletion(db:SqliteLike):void{initializeCompletionEvidence(db);}
