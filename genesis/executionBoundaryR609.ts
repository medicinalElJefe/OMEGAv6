// R609: bind signed human approval to exact proposal content and separately issued execution leases.
// Pure verifier only; the host must enforce process isolation, key registry, nonce persistence, and execution fencing.
import {createHash} from 'node:crypto';
import {decisionMessage,verifySignedDecision,type KeyAuthority,type SignedDecision} from './independentProofR608';
import type {Proposal} from './kernelR606';
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export type ProposalCommitment={proposalId:string;contentHash:string;scope:string;action:string};
export function commitProposal(p:Proposal):ProposalCommitment{
 return {proposalId:p.id,contentHash:hash([p.id,p.observationIds,p.action,p.scope,p.benefit,p.risks,p.alternatives,p.reversible,p.evidenceIds]),scope:p.scope,action:p.action};
}
export type ExecutionLease={proposalId:string;proposalHash:string;principal:string;scope:string;workerId:string;issuedAt:string;expiresAt:string;nonce:string;maxUses:number};
export type LeaseCheck={allowed:boolean;reasons:string[]};
export function verifyProposalApproval(p:Proposal,d:SignedDecision,key:KeyAuthority,now:string,usedNonces:ReadonlySet<string>):LeaseCheck{
 const commitment=commitProposal(p);
 // R608 signs a string proposalId; R609 requires a content-bound identifier without changing R608's signature contract.
 const expectedId=commitment.proposalId+':'+commitment.contentHash;
 const proof=verifySignedDecision(d,key,now,usedNonces);
 const reasons=[...proof.reasons];
 if(d.proposalId!==expectedId)reasons.push('approval not bound to exact proposal content');
 if(d.decision!=='APPROVED')reasons.push('not an approval');
 if(d.scope!==p.scope)reasons.push('approval scope mismatch');
 return {allowed:reasons.length===0,reasons};
}
export function verifyExecutionLease(p:Proposal,lease:ExecutionLease,workerId:string,now:string,usedCount:number):LeaseCheck{
 const c=commitProposal(p);const reasons:string[]=[];
 if(lease.proposalId!==p.id||lease.proposalHash!==c.contentHash)reasons.push('proposal content mismatch');
 if(lease.scope!==p.scope||lease.workerId!==workerId)reasons.push('execution target mismatch');
 const t=Date.parse(now),start=Date.parse(lease.issuedAt),end=Date.parse(lease.expiresAt);
 if(!Number.isFinite(t)||!Number.isFinite(start)||!Number.isFinite(end)||t<start||t>=end||start>=end)reasons.push('lease expired or not yet active');
 if(!Number.isSafeInteger(lease.maxUses)||lease.maxUses!==1||usedCount!==0)reasons.push('lease already used or unbounded');
 if(!lease.principal||!lease.nonce)reasons.push('missing lease provenance');
 // Deliberately NOT sufficient to execute: lease requires a separately authenticated issuer and atomic durable consume.
 return {allowed:reasons.length===0,reasons};
}
export const EXECUTION_GATE='HOLD_UNTIL_EXTERNAL_ISSUER_AND_ATOMIC_CONSUME' as const;
