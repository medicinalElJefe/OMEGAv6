// R619: capability-checked dispatch claim, still no host execution.
// Worker policy MUST come from trusted host configuration, never from worker input.
import type {Proposal} from './kernelR606';
import type {SqliteLike} from './leaseStoreR610';
import {verifyWorkerCapability,type WorkerCapability,type WorkerPolicy} from './workerCapabilityR618';
import {claimDispatch} from './dispatchClaimR617';
export function claimAuthorizedDispatch(db:SqliteLike,proposal:Proposal,capability:WorkerCapability,policy:WorkerPolicy,leaseNonce:string,now:string):{claimed:boolean;reason:string}{
 const check=verifyWorkerCapability(proposal,capability,policy,now);
 if(!check.allowed)return {claimed:false,reason:'worker capability denied: '+check.reasons.join('; ')};
 if(!leaseNonce)return {claimed:false,reason:'missing lease nonce'};
 const row=db.prepare('SELECT proposal_id,worker_id,state FROM genesis_action_ledger WHERE nonce=?').get(leaseNonce) as {proposal_id?:string;worker_id?:string;state?:string}|undefined;
 if(!row||row.proposal_id!==proposal.id||row.worker_id!==capability.workerId||row.state!=='CONSUMED')return {claimed:false,reason:'ledger identity or state mismatch'};
 return claimDispatch(db,leaseNonce,capability.workerId,now);
}
export const AUTHORIZED_DISPATCH_BOUNDARY='STATE_CLAIM_ONLY_NO_EXECUTOR' as const;
