import {
  evaluateDevelopmentalTransitionR457,
  type HeightenedDevelopmentalEvidenceR457,
  type HeightenedDevelopmentalMetricsR457,
  type HeightenedDevelopmentalVectorR457
} from './heightenedModeR457';

export const R467_SCHEMA='OMEGA7_CANONICAL_DEVELOPMENTAL_LEDGER_R467' as const;
export const R467_REVISION='R467' as const;
export const R467_GENESIS_HASH='0'.repeat(64);

export type R467Decision='STAY'|'TURN'|'ESCALATE';

export type R467DevelopmentalState={
  stateRef:string;
  sourceHead:string;
  metrics:HeightenedDevelopmentalMetricsR457;
  evidence:HeightenedDevelopmentalEvidenceR457;
  branchRefs:readonly string[];
  proofRefs:readonly string[];
  scars:readonly string[];
  contradictions:readonly string[];
  recoverable:boolean;
  canonicalMutation:false;
};

export type R467DevelopmentalRecord={
  schema:typeof R467_SCHEMA;
  revision:typeof R467_REVISION;
  index:number;
  previousHash:string;
  recordHash:string;
  timestamp:string;
  state:{
    S_t:R467DevelopmentalState;
    delta:HeightenedDevelopmentalVectorR457;
    growth:HeightenedDevelopmentalVectorR457;
    acceleration:HeightenedDevelopmentalVectorR457;
    jerk:HeightenedDevelopmentalVectorR457;
    curvature:number;
    scar:{
      carried:readonly string[];
      contradiction:number;
      pressure:number;
      retained:true;
    };
    q:number;
    C_omega:number;
    Phi:number;
    Lambda:number;
    branches:readonly string[];
    proofs:readonly string[];
    S_t1:R467DevelopmentalState;
  };
  continuityCone:{
    reachable:boolean;
    futureTopologyRetention:number;
    recoverability:number;
    rollbackAvailable:boolean;
    authorityClosed:boolean;
    proofSurvives:boolean;
    dependencyOrderPreserved:boolean;
  };
  viability:number;
  decision:R467Decision;
  promotionAllowed:boolean;
  hardVetoes:readonly string[];
  canonicalAdmissionAuthority:'R125';
  canonicalMutation:false;
  truthBoundary:string;
};

export type R467AppendInput={
  parent:R467DevelopmentalState;
  candidate:R467DevelopmentalState;
  previousGrowth?:Partial<HeightenedDevelopmentalVectorR457>;
  previousAcceleration?:Partial<HeightenedDevelopmentalVectorR457>;
  authorityClosed:boolean;
  proofSurvives:boolean;
  rollbackAvailable:boolean;
  dependencyOrderPreserved:boolean;
  prior?:R467DevelopmentalRecord|null;
  timestamp?:string;
};

const stable=(value:unknown):string=>{
  const normalize=(v:any):any=>{
    if(v===null||typeof v!=='object')return Number.isNaN(v)?'NaN':v;
    if(Array.isArray(v))return v.map(normalize);
    return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));
  };
  return JSON.stringify(normalize(value));
};

async function sha256(value:unknown){
  const bytes=new TextEncoder().encode(stable(value));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

const clamp01=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));

function normalizeState(input:R467DevelopmentalState):R467DevelopmentalState{
  return Object.freeze({
    ...input,
    stateRef:String(input.stateRef||'').trim(),
    sourceHead:String(input.sourceHead||'').trim(),
    branchRefs:Object.freeze([...(input.branchRefs||[])].map(String)),
    proofRefs:Object.freeze([...(input.proofRefs||[])].map(String)),
    scars:Object.freeze([...(input.scars||[])].map(String)),
    contradictions:Object.freeze([...(input.contradictions||[])].map(String)),
    recoverable:Boolean(input.recoverable),
    canonicalMutation:false
  });
}

export async function appendCanonicalDevelopmentR467(input:R467AppendInput):Promise<R467DevelopmentalRecord>{
  const parent=normalizeState(input.parent);
  const candidate=normalizeState(input.candidate);
  if(candidate.evidence.sourceHead!==candidate.sourceHead)throw new Error('R467 candidate evidence/source head mismatch');
  if(parent.evidence.parentStateRef&&parent.evidence.parentStateRef===candidate.stateRef)throw new Error('R467 parent evidence aliases candidate state');

  const transition=evaluateDevelopmentalTransitionR457({
    parent:parent.metrics,
    candidate:candidate.metrics,
    previousGrowth:input.previousGrowth,
    previousAcceleration:input.previousAcceleration,
    authorityClosed:input.authorityClosed,
    proofSurvives:input.proofSurvives,
    rollbackAvailable:input.rollbackAvailable,
    dependencyOrderPreserved:input.dependencyOrderPreserved,
    canonicalMutation:false,
    evidence:{
      ...candidate.evidence,
      parentStateRef:parent.stateRef,
      candidateStateRef:candidate.stateRef,
      sourceHead:candidate.sourceHead,
      proofRefs:candidate.proofRefs
    }
  });

  const prior=input.prior||null;
  if(prior&&prior.state.S_t1.stateRef!==parent.stateRef)throw new Error('R467 lineage discontinuity: prior S_t1 != parent S_t');
  const previousHash=prior?.recordHash||R467_GENESIS_HASH;
  const index=(prior?.index??-1)+1;
  const mergedScars=Object.freeze([...new Set([
    ...parent.scars,
    ...candidate.scars,
    ...transition.hardVetoes.map(x=>'VETO:'+x)
  ])]);
  const viability=(
    clamp01(candidate.metrics.continuity)*
    clamp01(candidate.metrics.futurePlasticity)*
    clamp01(candidate.metrics.recoverability)*
    clamp01(candidate.metrics.futureTopologyRetention)
  )/(clamp01(candidate.metrics.contradiction)+clamp01(candidate.metrics.burden)+clamp01(candidate.metrics.scarPressure)+1e-9);

  const body={
    schema:R467_SCHEMA,
    revision:R467_REVISION,
    index,
    previousHash,
    timestamp:input.timestamp||new Date().toISOString(),
    state:{
      S_t:parent,
      delta:transition.normalizedRelationalDifference,
      growth:transition.growthVector,
      acceleration:transition.developmentalAcceleration,
      jerk:transition.developmentalJerk,
      curvature:transition.developmentalCurvature,
      scar:{
        carried:mergedScars,
        contradiction:transition.developmentalScar.contradiction,
        pressure:transition.developmentalScar.pressure,
        retained:true as const
      },
      q:transition.dewey.contradiction,
      C_omega:transition.dewey.continuity,
      Phi:transition.dewey.futurePlasticity,
      Lambda:transition.dewey.burden,
      branches:candidate.branchRefs,
      proofs:candidate.proofRefs,
      S_t1:candidate
    },
    continuityCone:transition.continuityCone,
    viability,
    decision:transition.decision,
    promotionAllowed:transition.promotionAllowed,
    hardVetoes:transition.hardVetoes,
    canonicalAdmissionAuthority:'R125' as const,
    canonicalMutation:false as const,
    truthBoundary:'R467 is a derived, hash-linked developmental history over R457 telemetry. It preserves state, lineage, branch references, proof references, contradictions, scars, future topology and recoverability. It cannot admit CanonState, authenticate external evidence, mutate production, or create a physical law; R125 and the existing exact-head proof authorities remain external gates.'
  };
  const recordHash=await sha256(body);
  return Object.freeze({...body,recordHash});
}

export async function verifyCanonicalDevelopmentR467(records:readonly R467DevelopmentalRecord[]){
  let previousHash=R467_GENESIS_HASH;
  let previousState:string|null=null;
  const failures:string[]=[];
  for(let i=0;i<records.length;i++){
    const row=records[i];
    if(row.index!==i)failures.push('INDEX:'+i);
    if(row.previousHash!==previousHash)failures.push('PREVIOUS_HASH:'+i);
    if(previousState!==null&&row.state.S_t.stateRef!==previousState)failures.push('STATE_LINEAGE:'+i);
    if(row.canonicalMutation!==false||row.canonicalAdmissionAuthority!=='R125')failures.push('AUTHORITY:'+i);
    const {recordHash,...body}=row;
    const expected=await sha256(body);
    if(recordHash!==expected)failures.push('HASH:'+i);
    previousHash=row.recordHash;
    previousState=row.state.S_t1.stateRef;
  }
  return Object.freeze({
    schema:'OMEGA7_CANONICAL_DEVELOPMENTAL_LEDGER_VERIFY_R467',
    valid:failures.length===0,
    records:records.length,
    headHash:previousHash,
    headState:previousState,
    failures:Object.freeze(failures),
    canonicalMutation:false
  });
}
