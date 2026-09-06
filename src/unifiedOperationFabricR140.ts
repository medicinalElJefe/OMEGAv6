import type {CapabilityActionKindR139,CapabilityActionR139} from './unifiedCapabilityEngineR139';
import {compileAllModesTruthFusionR151} from './allModesTruthFusionR151';

export const R140_OPERATION_SCHEMA='OMEGA_UNIFIED_OPERATION_FABRIC_R140';
export const R140_OPERATION_LAWS=Object.freeze([
 'MODE_EXECUTION_STATE_INFORMS_PRIORITY_NOT_TRUTH_PROMOTION',
 'REGISTERED_CAPABILITY_ROUTE_PRECEDES_OPERATION',
 'HYBRID_EXECUTION_REQUIRES_CURRENT_DEVICE_PROOF',
 'EVIDENCE_CONTINUITY_AND_CONTRADICTION_PRESSURE_SHAPE_PRIORITY',
 'ALL_MODE_FUSION_INFORMS_PRIORITY_WITHOUT_TRUTH_PROMOTION',
 'PROJECTION_SELECTION_NEVER_EQUALS_CANONSTATE_ADMISSION',
 'R125_REMAINS_THE_CANONSTATE_ADMISSION_AUTHORITY'
]);
export type OperationReadinessR140='ROUTE_READY'|'DEVICE_PROOF_REQUIRED';
export type OperationActionR140=CapabilityActionR139&{score:number;readiness:OperationReadinessR140;signal:{route:number;continuity:number;plasticity:number;evidence:number;contradictionBound:number;burdenBound:number;modeCoverage:number;kind:number;modeTruth:number;modeAgreement:number}};
const n01=(v:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
const kindSignal=(kind:CapabilityActionKindR139,m:any)=>{
 const C=n01(m?.continuity),Phi=n01(m?.plasticity),q=n01(m?.contradiction),L=n01(m?.burden),e=n01(m?.evidence),u=n01(m?.uncertainty);
 if(kind==='PROVE')return n01(.50*e+.25*C+.15*(1-q)+.10*(1-u));
 if(kind==='BUILD')return n01(.38*Phi+.28*C+.18*(1-L)+.16*e);
 if(kind==='EXECUTE')return n01(.36*C+.24*e+.20*(1-q)+.20*(1-L));
 if(kind==='INTELLIGENCE')return n01(.30*C+.28*Phi+.22*e+.20*(1-q));
 if(kind==='GOVERN')return n01(.36*e+.24*C+.22*(1-q)+.18*(1-L));
 if(kind==='SYSTEM')return n01(.38*C+.24*e+.20*(1-L)+.18*(1-u));
 return n01(.30*C+.26*Phi+.20*e+.14*(1-q)+.10*(1-L));
};
export function rankUnifiedCapabilityActionsR140(runtime:any,record:any){
 const m=record?.metrics||{},modeCoverage=n01(Number(runtime?.modes?.executable||0)/Math.max(1,Number(runtime?.modes?.considered||1))),continuity=n01(m.continuity),plasticity=n01(m.plasticity),evidence=n01(m.evidence),contradictionBound=1-n01(m.contradiction),burdenBound=1-n01(m.burden),allModesFusion=compileAllModesTruthFusionR151(record),modeTruth=n01(allModesFusion.consensus.truthConfidence),modeAgreement=n01(allModesFusion.consensus.agreement);
 const actions:OperationActionR140[]=(runtime?.actions||[]).map((action:CapabilityActionR139)=>{
  const route=n01(action.priority),kind=kindSignal(action.kind,m),signal={route,continuity,plasticity,evidence,contradictionBound,burdenBound,modeCoverage,kind,modeTruth,modeAgreement};
  const baseScore=n01(.24*route+.16*continuity+.12*plasticity+.16*evidence+.12*contradictionBound+.08*burdenBound+.06*modeCoverage+.06*kind);
  const score=n01(.90*baseScore+.06*modeTruth+.04*modeAgreement);
  return{...action,score,readiness:action.kind==='EXECUTE'?'DEVICE_PROOF_REQUIRED':'ROUTE_READY',signal};
 }).sort((a,b)=>b.score-a.score||b.priority-a.priority||a.route.localeCompare(b.route));
 const executable=Number(runtime?.modes?.executable||0),considered=Number(runtime?.modes?.considered||0),gated=Number(runtime?.modes?.gated||0),catalogOnly=Number(runtime?.modes?.catalogLens||0);
 return{schema:R140_OPERATION_SCHEMA,laws:R140_OPERATION_LAWS,actions,modeCoverage,allModesFusion:{schema:allModesFusion.schema,channelCount:allModesFusion.channelCount,sourceModeCount:allModesFusion.sourceModeCount,canonAuthorityCount:allModesFusion.canonAuthorityCount,truthConfidence:allModesFusion.consensus.truthConfidence,agreement:allModesFusion.consensus.agreement,truthClass:allModesFusion.consensus.truthClass,canonicalOperator:allModesFusion.operator.canonical,advisoryOperator:allModesFusion.operator.advisory,operatorAgreement:allModesFusion.operator.agreement,fingerprint:allModesFusion.fingerprint,boundary:allModesFusion.truthBoundary},modeTruth:{considered,executable,gated,catalogOnly,boundary:'Only exact, source-packet and derived-runtime modes contribute to executable mode coverage. R151 additionally fuses all 179 source-mode evaluations plus 62 canon lenses with provenance weights; gated/catalog/lens channels never become executed truth.'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R140 ranks already-registered capability routes from current packet signals and R139 mode execution state. R151 cross-mode coherence can refine operating priority, but a high score or mode consensus is not empirical truth, host proof, canonical admission, or evidence that an external service executed.'};
}
