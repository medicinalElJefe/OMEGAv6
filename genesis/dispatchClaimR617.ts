// R617: durable dispatch claim. State transition only; never launches a process.
// CONSUMED -> DISPATCHED is an atomic compare-and-swap and must precede host execution.
import type {SqliteLike} from './leaseStoreR610';
export function claimDispatch(db:SqliteLike,nonce:string,workerId:string,now:string):{claimed:boolean;reason:string}{
 if(!nonce||!workerId||!Number.isFinite(Date.parse(now)))return {claimed:false,reason:'invalid claim'};
 const result=db.prepare("UPDATE genesis_action_ledger SET state='DISPATCHED',updated_at=? WHERE nonce=? AND worker_id=? AND state='CONSUMED'").run(now,nonce,workerId);
 return result.changes===1?{claimed:true,reason:'dispatch claim recorded'}:{claimed:false,reason:'not admitted, wrong worker or already claimed'};
}
export function markDispatchFailed(db:SqliteLike,nonce:string,workerId:string,now:string):boolean{
 if(!nonce||!workerId||!Number.isFinite(Date.parse(now)))return false;
 return db.prepare("UPDATE genesis_action_ledger SET state='FAILED',updated_at=? WHERE nonce=? AND worker_id=? AND state='DISPATCHED'").run(now,nonce,workerId).changes===1;
}
export const DISPATCH_POLICY='NO_HOST_EXECUTION_WITHOUT_EXTERNAL_WORKER_FENCE' as const;
