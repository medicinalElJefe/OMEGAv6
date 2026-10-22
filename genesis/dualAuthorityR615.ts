// R615: two independent cryptographic authorizations before atomic admission.
// No host action or canonical-state mutation occurs here.
import type {Proposal} from './kernelR606';
import type {KeyAuthority,SignedDecision} from './independentProofR608';
import {verifyProposalApproval} from './executionBoundaryR609';
import type {SignedExecutionLease} from './signedLeaseR613';
import {admitSignedLease} from './verifiedAdmissionR614';
import type {SqliteLike} from './leaseStoreR610';
import type {AtomicAdmission} from './atomicAdmissionR612';
export type ApprovalAndLease={decision:SignedDecision;humanKey:KeyAuthority;lease:SignedExecutionLease;issuerKey:KeyAuthority};
export function admitWithHumanApproval(db:SqliteLike,proposal:Proposal,proof:ApprovalAndLease,workerId:string,now:string,usedDecisionNonces:ReadonlySet<string>):AtomicAdmission{
 // Human and issuer keys must be separately governed, not the same identity.
 if(proof.humanKey.keyId===proof.issuerKey.keyId||proof.humanKey.principal===proof.issuerKey.principal)
  return {admitted:false,reason:'independent human and issuer authorities required'};
 const approval=verifyProposalApproval(proposal,proof.decision,proof.humanKey,now,usedDecisionNonces);
 if(!approval.allowed)return {admitted:false,reason:'human approval denied: '+approval.reasons.join('; ')};
 // This function is a bounded admission proof. It does not persist decision nonce,
 // resolve external key registries, or prove any worker execution.
 return admitSignedLease(db,proposal,proof.lease,proof.issuerKey,workerId,now);
}
