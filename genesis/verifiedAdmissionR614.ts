// R614: verified admission boundary. Does not execute worker actions.
// The caller must load KeyAuthority from an independent, trusted registry.
import type {Proposal} from './kernelR606';
import type {KeyAuthority} from './independentProofR608';
import {verifySignedExecutionLease,type SignedExecutionLease} from './signedLeaseR613';
import {admitLeaseAtomically,type AtomicAdmission} from './atomicAdmissionR612';
import type {SqliteLike} from './leaseStoreR610';
export function admitSignedLease(db:SqliteLike,proposal:Proposal,lease:SignedExecutionLease,issuer:KeyAuthority,workerId:string,now:string):AtomicAdmission{
 const verification=verifySignedExecutionLease(proposal,lease,issuer,workerId,now);
 if(!verification.valid)return {admitted:false,reason:'signed lease denied: '+verification.reasons.join('; ')};
 return admitLeaseAtomically(db,lease,workerId,now,true);
}
