// Genesis governed developmental kernel. Pure, deterministic, no side effects.
import {createHash} from 'node:crypto';
export type Truth='OBSERVED'|'INFERRED'|'HYPOTHESIS'|'VERIFIED'|'REJECTED';
export type Observation={id:string;source:string;timestamp:string;value:unknown;truth:Truth;consent:string;uncertainty:number};
export type Proposal={id:string;observationIds:string[];action:string;scope:string;benefit:string;risks:string[];alternatives:string[];reversible:boolean;humanDecision:'PENDING'|'APPROVED'|'DENIED';evidenceIds:string[]};
export type Authority={principal:string;scopes:string[];expiresAt:string;humanApprovedProposalIds:string[]};
export type Receipt={index:number;previousHash:string;kind:string;subject:string;payloadHash:string;hash:string};
const digest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function validateObservation(o:Observation):string[]{
 const failures:string[]=[];
 if(!o.id||!o.source||!o.consent)failures.push('missing provenance or consent');
 if(!Number.isFinite(Date.parse(o.timestamp)))failures.push('invalid timestamp');
 if(!Number.isFinite(o.uncertainty)||o.uncertainty<0||o.uncertainty>1)failures.push('invalid uncertainty');
 return failures;
}
export function evaluateProposal(p:Proposal,observations:Observation[],authority:Authority,now:string):{admitted:boolean;reasons:string[]}{
 const reasons:string[]=[];
 const index=new Map(observations.map(o=>[o.id,o]));
 if(!p.observationIds.length||p.observationIds.some(id=>!index.has(id)))reasons.push('missing source observation');
 for(const id of p.observationIds){const o=index.get(id);if(o&&validateObservation(o).length)reasons.push('invalid observation '+id);}
 if(!p.alternatives.length)reasons.push('human alternatives missing');
 if(!p.risks.length)reasons.push('risk disclosure missing');
 if(!p.reversible)reasons.push('irreversible action requires separate governance');
 if(p.humanDecision!=='APPROVED'||!authority.humanApprovedProposalIds.includes(p.id))reasons.push('human approval missing');
 if(!authority.scopes.includes(p.scope))reasons.push('scope denied');
 if(!Number.isFinite(Date.parse(now))||!Number.isFinite(Date.parse(authority.expiresAt))||Date.parse(now)>=Date.parse(authority.expiresAt))reasons.push('authorization expired');
 if(!p.evidenceIds.length)reasons.push('verification evidence missing');
 return {admitted:reasons.length===0,reasons};
}
export function appendReceipt(chain:readonly Receipt[],kind:string,subject:string,payload:unknown):Receipt{
 const previousHash=chain.length?chain[chain.length-1].hash:'GENESIS';
 const index=chain.length;const payloadHash=digest(payload);
 return {index,previousHash,kind,subject,payloadHash,hash:digest({index,previousHash,kind,subject,payloadHash})};
}
export function verifyChain(chain:readonly Receipt[]):boolean{
 return chain.every((r,i)=>r.index===i&&r.previousHash===(i?chain[i-1].hash:'GENESIS')&&r.hash===digest({index:r.index,previousHash:r.previousHash,kind:r.kind,subject:r.subject,payloadHash:r.payloadHash}));
}
export function developmentalStep(previous:{continuity:number;scar:number;contradictions:string[]},newContradictions:string[]){
 return {continuity:previous.continuity,scar:previous.scar,contradictions:[...new Set([...previous.contradictions,...newContradictions])]};
}
