import {evaluateObserverReceiptR485,type ObserverReceiptR485} from './observerCoverageProofR485';
export const R486_SCHEMA='OMEGA_EVIDENCE_RESOLUTION_MEMBRANE_R486' as const;
export type ResolutionStateR486='RESOLVED_PRESENT'|'RESOLVED_ABSENT'|'UNRESOLVED'|'CONTRADICTED'|'STALE'|'UNAVAILABLE';
export type EvidenceChannelR486={id:string;observer:ObserverReceiptR485;authority:'EMPIRICAL'|'SIGNED_SOURCE'|'RUNTIME_RECEIPT'|'MODEL'|'REGISTRY';targetIdentity:string;observedAt:string;maxAgeMs:number;available:boolean;supports?:boolean;contradicts?:boolean;};
const authorityRank={EMPIRICAL:5,SIGNED_SOURCE:4,RUNTIME_RECEIPT:3,REGISTRY:2,MODEL:1} as const;
export const R486_LAWS=Object.freeze([
 'OBSERVER_COVERAGE_PRECEDES_ABSENCE',
 'IDENTITY_MUST_BIND_BEFORE_EVIDENCE_FUSION',
 'STALE_EVIDENCE_CANNOT_RESOLVE_CURRENT_STATE',
 'CONTRADICTION_IS_RETAINED_NOT_AVERAGED_AWAY',
 'MODEL_COHERENCE_CANNOT_OVERRULE_VERIFIED_EXTERNAL_EVIDENCE',
 'RESOLUTION_IS_NOT_CANONICAL_ADMISSION',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
] as const);
export function resolveEvidenceR486(input:{targetIdentity:string;now:string;channels:readonly EvidenceChannelR486[]}){
 const now=Date.parse(input.now); if(!Number.isFinite(now))throw new Error('R486_NOW_INVALID');
 const rows=input.channels.map(channel=>{
  const observation=evaluateObserverReceiptR485(channel.observer);
  const time=Date.parse(channel.observedAt),fresh=Number.isFinite(time)&&now>=time&&(now-time)<=channel.maxAgeMs;
  const identityBound=channel.targetIdentity===input.targetIdentity;
  const usable=channel.available&&fresh&&identityBound&&observation.claim!=='UNKNOWN';
  return Object.freeze({channel,observation,fresh,identityBound,usable,rank:authorityRank[channel.authority]});
 });
 const usable=rows.filter(x=>x.usable);
 const positive=usable.filter(x=>x.observation.claim==='PRESENT'&&x.channel.contradicts!==true);
 const negative=usable.filter(x=>x.observation.claim==='ABSENT'||x.channel.contradicts===true);
 const contradiction=positive.length>0&&negative.length>0;
 const unavailable=rows.length>0&&rows.every(x=>!x.channel.available);
 const stale=rows.some(x=>x.channel.available&&!x.fresh)&&usable.length===0;
 let state:ResolutionStateR486='UNRESOLVED';
 if(unavailable)state='UNAVAILABLE'; else if(stale)state='STALE'; else if(contradiction)state='CONTRADICTED';
 else if(positive.length)state='RESOLVED_PRESENT';
 else if(negative.length&&negative.every(x=>x.observation.claim==='ABSENT'))state='RESOLVED_ABSENT';
 const strongest=usable.slice().sort((a,b)=>b.rank-a.rank)[0]??null;
 return Object.freeze({schema:R486_SCHEMA,targetIdentity:input.targetIdentity,state,contradiction,strongestAuthority:strongest?.channel.authority??null,
  channels:Object.freeze(rows),canonicalMutation:false as const,canonicalAdmission:false as const,admissionAuthority:'R125' as const,
  truthBoundary:'R486 resolves evidence state only after observer coverage, exact target identity, availability and freshness are carried together. Contradictions remain unresolved evidence scars. Resolution never mutates CanonState and never substitutes model coherence for verified external evidence.'});
}
