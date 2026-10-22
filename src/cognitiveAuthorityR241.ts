import type {Mandala20736Field} from './mandala20736Runtime';

export type CognitiveStageStatusR241='SOURCE_BOUND'|'DERIVED'|'PROPOSED'|'GATED'|'UNPROVED';
export type CognitiveStageR241={id:'OBSERVATION'|'INTERPRETATION'|'HYPOTHESIS'|'PROPOSAL'|'AUTHORIZATION'|'EXECUTION'|'RETURN'|'CANON';label:string;status:CognitiveStageStatusR241;detail:string;authority:string};
export type CognitiveAuthorityFrameR241={schema:'OMEGA_COGNITIVE_AUTHORITY_FRAME_R241';address:number;sourceStateId:number;routeCandidate:number;evidence:number;stages:CognitiveStageR241[];invariants:readonly string[];boundary:string};

export const COGNITIVE_AUTHORITY_INVARIANTS_R241=[
 'Observation != Interpretation',
 'Interpretation != Hypothesis',
 'Hypothesis != Truth',
 'Reasoning != CanonicalState',
 'Proposal != Permission',
 'Permission != Execution',
 'Execution != SuccessfulOutcome',
 'Returned result != CanonState admission'
] as const;
export const COGNITIVE_AUTHORITY_BOUNDARY_R241='R241 cognitive authority is a read-only typed projection over the active packet. It may describe observation, derived interpretation, hypothesis and a route candidate, but it cannot authorize action, claim execution, fabricate a returned result, or admit CanonState. Existing authorities remain unchanged: R147 dispatch, R146 durable history, R141 exact Hybrid return proof, and R125 sole CanonState admission authority.';
export const ARCHIVE_COGNITION_DONOR_R241='AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS';
const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));

export function compileCognitiveAuthorityFrameR241(field:Mandala20736Field,address:number):CognitiveAuthorityFrameR241{
 const a=Math.max(0,Math.min(field.count-1,Math.floor(address))),routeCandidate=Math.max(0,Math.min(field.count-1,Number(field.routeNext[a]))),evidence=clamp(field.evidence[a]);
 const source=evidence>=.045?'SOURCE_BOUND':'UNPROVED';
 const stages:CognitiveStageR241[]=[
  {id:'OBSERVATION',label:'Observation',status:source,detail:source==='SOURCE_BOUND'?`Packet S${a+1} evidence ${evidence.toFixed(3)} with preserved source fields.`:`Packet S${a+1} evidence is below the R241 display threshold; observation remains unproved.`,authority:'20,736 packet / evidence provenance'},
  {id:'INTERPRETATION',label:'Interpretation',status:'DERIVED',detail:`Derived continuity ${clamp(field.C[a]).toFixed(3)}, plasticity ${clamp(field.Phi[a]).toFixed(3)}, contradiction ${clamp(field.q[a]).toFixed(3)}, burden ${clamp(field.Lambda[a]).toFixed(3)}.`,authority:'Read-only calculus projection'},
  {id:'HYPOTHESIS',label:'Hypothesis',status:'DERIVED',detail:`Route and topology may suggest S${routeCandidate+1}; suggestion is not truth or authorization.`,authority:'Reasoning / simulation plane only'},
  {id:'PROPOSAL',label:'Proposal',status:'PROPOSED',detail:`Candidate transition S${a+1} → S${routeCandidate+1} remains a proposal until existing governance admits action.`,authority:'Proposal plane; no mutation'},
  {id:'AUTHORIZATION',label:'Authorization',status:'GATED',detail:'This visual/cognition layer has no permission-granting capability and cannot self-authorize.',authority:'Existing governed authorization + R147 dispatch'},
  {id:'EXECUTION',label:'Execution',status:'UNPROVED',detail:'No execution is inferred from a proposed route, UI state, hardware presence, or provider availability.',authority:'Executor-specific invocation proof required'},
  {id:'RETURN',label:'Exact return',status:'UNPROVED',detail:'A returned effect must be observed and fingerprint-bound before it can be represented as returned proof.',authority:'R141 exact Hybrid return proof + R146 history'},
  {id:'CANON',label:'Canon admission',status:'GATED',detail:'Returned data is still not CanonState. Admission remains outside this layer.',authority:'R125 sole CanonState admission authority'}
 ];
 return{schema:'OMEGA_COGNITIVE_AUTHORITY_FRAME_R241',address:a,sourceStateId:a+1,routeCandidate,evidence,stages,invariants:COGNITIVE_AUTHORITY_INVARIANTS_R241,boundary:COGNITIVE_AUTHORITY_BOUNDARY_R241};
}
