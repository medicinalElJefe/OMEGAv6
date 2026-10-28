// R616: single SQLite transaction for signed human decision nonce,
// signed issuer lease nonce, and action-ledger admission. No dispatch.
import type {Proposal} from './kernelR606';
import type {SqliteLike} from './leaseStoreR610';
import {initializeAtomicAdmission} from './atomicAdmissionR612';
import {consumeLeaseOnce} from './leaseStoreR610';
import {recordConsumed} from './actionLedgerR611';
import {verifyProposalApproval} from './executionBoundaryR609';
import {verifySignedExecutionLease} from './signedLeaseR613';
import type {ApprovalAndLease} from './dualAuthorityR615';
export function initializeDurableAuthority(db:SqliteLike):void{
 initializeAtomicAdmission(db);
 db.exec('CREATE TABLE IF NOT EXISTS genesis_consumed_decisions (nonce TEXT PRIMARY KEY NOT NULL, proposal_id TEXT NOT NULL, principal TEXT NOT NULL, consumed_at TEXT NOT NULL)');
}
export function admitDurablyAuthorized(db:SqliteLike,p:Proposal,proof:ApprovalAndLease,workerId:string,now:string):{admitted:boolean;reason:string}{
 const {decision,humanKey,lease,issuerKey}=proof;
 if(humanKey.keyId===issuerKey.keyId||humanKey.principal===issuerKey.principal)return {admitted:false,reason:'independent authorities required'};
 const human=verifyProposalApproval(p,decision,humanKey,now,new Set<string>());
 if(!human.allowed)return {admitted:false,reason:'human approval invalid: '+human.reasons.join('; ')};
 const issuer=verifySignedExecutionLease(p,lease,issuerKey,workerId,now);
 if(!issuer.valid)return {admitted:false,reason:'issuer lease invalid: '+issuer.reasons.join('; ')};
 if(decision.nonce===lease.nonce)return {admitted:false,reason:'decision and lease nonces must differ'};
 db.exec('BEGIN IMMEDIATE');
 try{
  const inserted=db.prepare('INSERT OR IGNORE INTO genesis_consumed_decisions (nonce,proposal_id,principal,consumed_at) VALUES (?,?,?,?)').run(decision.nonce,p.id,decision.principal,now);
  if(inserted.changes!==1){db.exec('ROLLBACK');return {admitted:false,reason:'human decision already consumed'};}
  const consumed=consumeLeaseOnce(db,lease,workerId,now,true);
  if(!consumed.consumed){db.exec('ROLLBACK');return {admitted:false,reason:consumed.reason};}
  if(!recordConsumed(db,lease.nonce,p.id,workerId,now)){db.exec('ROLLBACK');return {admitted:false,reason:'action ledger conflict'};}
  db.exec('COMMIT');
  return {admitted:true,reason:'human decision, lease and ledger committed atomically'};
 }catch(e){try{db.exec('ROLLBACK')}catch{/* original error */}throw e;}
}
