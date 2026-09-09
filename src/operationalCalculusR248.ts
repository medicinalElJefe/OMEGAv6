import {normalizeMetrics,omegaDecision,type LivingMetricPacket,type OmegaDecision} from './livingOmegaRuntimeR123';

export const R248_OPERATIONAL_CALCULUS_SCHEMA='OMEGA_OPERATIONAL_CALCULUS_GOVERNOR_R248' as const;
export const R248_OPERATIONAL_CALCULUS_BOUNDARY='Software-operational calculus derived only from returned runtime/Hybrid/resource/job evidence. It is not a physical measurement, empirical world model, native-execution receipt, or CanonState admission.' as const;

type ResourceTier='HIGH_CAPACITY'|'READY'|'CONSTRAINED'|'HOLD'|string;
type JobLike={status?:string;completedAt?:number;updatedAt?:number;createdAt?:number};
export type OperationalCalculusInputR248={
 snapshotCurrent:boolean;
 nativeExecutionClaimed:boolean;
 deviceOnline:boolean;
 deviceRevoked:boolean;
 hostProofFresh:boolean;
 resourceTier:ResourceTier;
 effectiveCpuWorkers:number;
 sourceProfileSha256?:string|null;
 activeJob:boolean;
 missionActive:boolean;
 foreignMissionActive:boolean;
 jobs?:JobLike[];
};
export type OperationalCalculusPacketR248={
 schema:typeof R248_OPERATIONAL_CALCULUS_SCHEMA;
 metrics:LivingMetricPacket;
 decision:OmegaDecision;
 commonKernel:number;
 invariantCarry:number;
 residualPressure:number;
 cycleCapacity:number;
 evidenceFacts:{snapshotCurrent:boolean;authenticatedDeviceCurrent:boolean;hostProofFresh:boolean;resourceTier:string;effectiveCpuWorkers:number;profileBound:boolean;recentTerminalJobs:number;recentFailedJobs:number};
 policy:{strategy:'CONSTRUCT_AND_VERIFY'|'PRUNE_CAUSE_THEN_CONSTRUCT'|'EVIDENCE_FIRST_ESCALATION';maxCycles:number;mutationAuthority:'R153_PREIMAGE_BOUND_ONLY';dispatchAuthority:'R147';returnProof:'R141';historyAuthority:'R146';canonAdmission:'R125';};
 boundary:typeof R248_OPERATIONAL_CALCULUS_BOUNDARY;
};

const clamp01=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const mean=(...xs:number[])=>xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length);
const tierFlex=(tier:ResourceTier)=>tier==='HIGH_CAPACITY'?1:tier==='READY'?.88:tier==='CONSTRAINED'?.52:tier==='HOLD'?0:.25;
const tierBurden=(tier:ResourceTier)=>tier==='HIGH_CAPACITY'?.08:tier==='READY'?.18:tier==='CONSTRAINED'?.58:tier==='HOLD'?1:.72;
const terminalStatus=(s:string)=>['COMPLETE','COMPLETED','RETURNED','VERIFIED','FAILED','ERROR','REJECTED','TIMEOUT','CANCELLED'].includes(s);
const failedStatus=(s:string)=>['FAILED','ERROR','REJECTED','TIMEOUT'].includes(s);

function recentScar(jobs:JobLike[]=[]){
 const terminal=jobs.filter(job=>terminalStatus(String(job?.status||'').toUpperCase())).sort((a,b)=>Number(b.completedAt||b.updatedAt||b.createdAt||0)-Number(a.completedAt||a.updatedAt||a.createdAt||0)).slice(0,12);
 const failed=terminal.filter(job=>failedStatus(String(job?.status||'').toUpperCase()));
 return{scar:terminal.length?failed.length/terminal.length:0,terminal:terminal.length,failed:failed.length};
}

export function compileOperationalCalculusR248(input:OperationalCalculusInputR248):OperationalCalculusPacketR248{
 const authenticatedDeviceCurrent=input.snapshotCurrent&&input.nativeExecutionClaimed&&input.deviceOnline&&!input.deviceRevoked;
 const profileBound=Boolean(input.sourceProfileSha256&&/^[0-9a-f]{64}$/i.test(String(input.sourceProfileSha256)));
 const resourceFlex=tierFlex(input.resourceTier),resourceBurden=tierBurden(input.resourceTier),scarState=recentScar(input.jobs||[]);
 const contradictionSignals=[
  input.nativeExecutionClaimed&&!input.snapshotCurrent?1:0,
  input.nativeExecutionClaimed&&(!input.deviceOnline||input.deviceRevoked)?1:0,
  input.hostProofFresh?0:.65,
  input.resourceTier==='HOLD'?1:input.resourceTier==='CONSTRAINED'?.35:0,
  input.foreignMissionActive?1:0
 ];
 const evidence=mean(input.snapshotCurrent?1:0,authenticatedDeviceCurrent?1:0,input.hostProofFresh?1:0,profileBound?1:0);
 const raw={
  continuity:mean(input.snapshotCurrent?1:0,authenticatedDeviceCurrent?1:0,input.hostProofFresh?1:0,input.foreignMissionActive?0:1,input.resourceTier==='HOLD'?0:1),
  plasticity:mean(resourceFlex,input.activeJob?.35:1,input.missionActive?.5:1),
  contradiction:mean(...contradictionSignals),
  burden:mean(input.activeJob?1:0,input.missionActive?.85:0,resourceBurden),
  evidence,
  uncertainty:1-evidence,
  scar:scarState.scar
 };
 const metrics=normalizeMetrics(raw),decision=omegaDecision(metrics);
 const commonKernel=(metrics.continuity*metrics.plasticity)/(metrics.contradiction+metrics.burden+1e-12);
 const invariantCarry=clamp01(mean(metrics.continuity,metrics.evidence,1-metrics.contradiction));
 const residualPressure=clamp01(mean(metrics.contradiction,metrics.burden,metrics.scar,metrics.uncertainty));
 const cycleCapacity=clamp01(mean(metrics.continuity,metrics.plasticity,metrics.evidence,1-metrics.burden,1-metrics.contradiction));
 const maxCycles=Math.max(4,Math.min(12,Math.round(4+8*cycleCapacity)));
 const strategy=decision==='STAY'?'CONSTRUCT_AND_VERIFY':decision==='TURN'?'PRUNE_CAUSE_THEN_CONSTRUCT':'EVIDENCE_FIRST_ESCALATION';
 return{
  schema:R248_OPERATIONAL_CALCULUS_SCHEMA,metrics,decision,commonKernel,invariantCarry,residualPressure,cycleCapacity,
  evidenceFacts:{snapshotCurrent:input.snapshotCurrent,authenticatedDeviceCurrent,hostProofFresh:input.hostProofFresh,resourceTier:String(input.resourceTier||'UNKNOWN'),effectiveCpuWorkers:Math.max(0,Math.floor(Number(input.effectiveCpuWorkers)||0)),profileBound,recentTerminalJobs:scarState.terminal,recentFailedJobs:scarState.failed},
  policy:{strategy,maxCycles,mutationAuthority:'R153_PREIMAGE_BOUND_ONLY',dispatchAuthority:'R147',returnProof:'R141',historyAuthority:'R146',canonAdmission:'R125'},
  boundary:R248_OPERATIONAL_CALCULUS_BOUNDARY
 };
}

export function operationalMissionObjectiveR248(baseObjective:string,packet:OperationalCalculusPacketR248){
 const directive=packet.decision==='STAY'
  ?'R248 operational calculus = STAY. Preserve coherent working paths. Prefer the smallest evidence-backed constructive repair and spend remaining capacity on inherited verification rather than broad churn.'
  :packet.decision==='TURN'
   ?'R248 operational calculus = TURN. Identify the dominant contradiction/burden seam, inspect and prune or repair the smallest causal source first, re-observe the affected proof, then continue construction only from the returned state.'
   :'R248 operational calculus = ESCALATE. Do not perform broad speculative mutation. First obtain and compare exact evidence for the dominant contradiction/scar/residual, then repair only a proof-bound cause; if evidence cannot close, return an explicit HOLD instead of manufacturing progress.';
 return `${directive} Operational cycle budget ${packet.policy.maxCycles}/12; this budget limits mission recursion but does not grant execution, dispatch, return-proof, production, or Canon authority. ${baseObjective}`;
}
