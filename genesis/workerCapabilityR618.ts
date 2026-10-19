// R618: exact capability allowlist for a non-executing worker handoff.
// This verifier NEVER executes host commands, URLs, scripts or dynamic code.
import type {Proposal} from './kernelR606';
import {commitProposal} from './executionBoundaryR609';
export type WorkerCapability={workerId:string;proposalId:string;proposalHash:string;scope:string;operation:string;resourceId:string;expiresAt:string};
export type WorkerPolicy={workerId:string;allowedOperations:ReadonlyArray<string>;allowedResourceIds:ReadonlyArray<string>;allowedScopes:ReadonlyArray<string>};
export function verifyWorkerCapability(p:Proposal,c:WorkerCapability,policy:WorkerPolicy,now:string):{allowed:boolean;reasons:string[]}{
 const reasons:string[]=[];
 const commitment=commitProposal(p);
 if(c.workerId!==policy.workerId||!c.workerId)reasons.push('worker identity mismatch');
 if(c.proposalId!==p.id||c.proposalHash!==commitment.contentHash)reasons.push('proposal commitment mismatch');
 if(c.scope!==p.scope||!policy.allowedScopes.includes(c.scope))reasons.push('scope denied');
 if(!c.operation||!policy.allowedOperations.includes(c.operation))reasons.push('operation not allowlisted');
 if(!c.resourceId||!policy.allowedResourceIds.includes(c.resourceId))reasons.push('resource not allowlisted');
 const t=Date.parse(now),end=Date.parse(c.expiresAt);
 if(!Number.isFinite(t)||!Number.isFinite(end)||t>=end)reasons.push('capability expired');
 // Reject shell or executable semantics regardless of policy content.
 if(/(?:shell|exec|spawn|eval|script|command|terminal|powershell|bash|cmd)(?:$|[.:/\\_-])/i.test(c.operation))reasons.push('host execution prohibited');
 return {allowed:reasons.length===0,reasons};
}
export const WORKER_HANDOFF='VERIFICATION_ONLY_NO_DISPATCH' as const;
