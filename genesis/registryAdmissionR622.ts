// R622: resolve both signers from trusted SQLite authority in the same admission transaction.
import type {Proposal} from './kernelR606';
import type {SqliteLike} from './leaseStoreR610';
import {initializeDurableAuthority} from './durableAuthorityR616';
import {consumeLeaseOnce} from './leaseStoreR610';
import {recordConsumed} from './actionLedgerR611';
import {verifyProposalApproval} from './executionBoundaryR609';
import {verifySignedExecutionLease,type SignedExecutionLease} from './signedLeaseR613';
import type {SignedDecision} from './independentProofR608';
import {initializeAuthorityRegistry,resolveTrustedAuthority} from './authorityRegistryR622';
export function initializeRegistryAdmission(db:SqliteLike):void{initializeDurableAuthority(db);initializeAuthorityRegistry(db);}
export function admitFromTrustedRegistry(db:SqliteLike,p:Proposal,decision:SignedDecision,lease:SignedExecutionLease,workerId:string,now:string):{admitted:boolean;reason:string}{
 db.exec('BEGIN IMMEDIATE');
 try{
  const human=resolveTrustedAuthority(db,decision.keyId,'HUMAN_APPROVER');
  const issuer=resolveTrustedAuthority(db,lease.issuerKeyId,'LEASE_ISSUER');
  if(!human||!issuer||human.keyId===issuer.keyId||human.principal===issuer.principal){db.exec('ROLLBACK');return {admitted:false,reason:'missing, revoked or non-independent trusted authorities'};}
  const approval=verifyProposalApproval(p,decision,human,now,new Set<string>());
  const leaseProof=verifySignedExecutionLease(p,lease,issuer,workerId,now);
  if(!approval.allowed||!leaseProof.valid||decision.nonce===lease.nonce){db.exec('ROLLBACK');return {admitted:false,reason:'signed decision or issuer lease invalid'};}
  const decisionWrite=db.prepare('INSERT OR IGNORE INTO genesis_consumed_decisions (nonce,proposal_id,principal,consumed_at) VALUES (?,?,?,?)').run(decision.nonce,p.id,decision.principal,now);
  if(decisionWrite.changes!==1){db.exec('ROLLBACK');return {admitted:false,reason:'decision replay'};}
  const consumed=consumeLeaseOnce(db,lease,workerId,now,true);
  if(!consumed.consumed||!recordConsumed(db,lease.nonce,p.id,workerId,now)){db.exec('ROLLBACK');return {admitted:false,reason:'lease replay or ledger conflict'};}
  db.exec('COMMIT');return {admitted:true,reason:'trusted registry dual authority and ledger committed'};
 }catch(e){try{db.exec('ROLLBACK')}catch{/* preserve error */}throw e;}
}
