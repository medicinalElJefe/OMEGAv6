// R612: atomic lease consumption AND action-ledger admission.
// Only trusted authority-side code may call this after independent issuer verification.
// No host execution is performed.
import type {ExecutionLease} from './executionBoundaryR609';
import {consumeLeaseOnce,initializeLeaseStore,type SqliteLike} from './leaseStoreR610';
import {initActionLedger,recordConsumed} from './actionLedgerR611';
export type AtomicAdmission={admitted:boolean;reason:string};
export function admitLeaseAtomically(db:SqliteLike,lease:ExecutionLease,workerId:string,now:string,independentlyValidated:boolean):AtomicAdmission{
 if(!independentlyValidated)return {admitted:false,reason:'independent validation required'};
 // BEGIN IMMEDIATE obtains a writer reservation; both records commit or neither does.
 db.exec('BEGIN IMMEDIATE');
 try{
  const consumed=consumeLeaseOnce(db,lease,workerId,now,true);
  if(!consumed.consumed){db.exec('ROLLBACK');return {admitted:false,reason:consumed.reason};}
  if(!recordConsumed(db,lease.nonce,lease.proposalId,workerId,now)){
   db.exec('ROLLBACK');return {admitted:false,reason:'action ledger admission conflict'};
  }
  db.exec('COMMIT');
  return {admitted:true,reason:'atomic admission recorded'};
 }catch(error){
  try{db.exec('ROLLBACK');}catch{/* preserve original error */}
  throw error;
 }
}
export function initializeAtomicAdmission(db:SqliteLike):void{
 initializeLeaseStore(db);initActionLedger(db);
}
