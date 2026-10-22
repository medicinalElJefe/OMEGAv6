export const CONTINUITY_MODES_R280_SCHEMA='OMEGA_CONTINUITY_MODES_R280' as const;
export const CONTINUITY_MODES_R280_LAWS=Object.freeze([
  'MODE_OUTPUT_IS_MODEL_DERIVED_UNLESS_BOUND_TO_TYPED_EVIDENCE',
  'PEF_SNAP_REQUIRES_NONZERO_STIFFNESS_AND_LOAD_HISTORY',
  'CTDE_ESCALATES_REPRESENTATION_RESOLUTION_ONLY_WHEN_DECLARED_CONSTRAINT_THRESHOLDS_REQUIRE_IT',
  'LPM_PRESERVES_CONTRADICTION_AND_MEASUREMENT_PROVENANCE',
  'TURN_ATLAS_PRESERVES_DECLARED_INVARIANTS_OR_RETURNS_HOLD',
  'CONTINUANCE_REQUIRES_EXPLICIT_PHASE_AND_BOUNDED_STATE_REQUIREMENTS',
  'NON_FLAT_PREDICTION_CARRIES_MEMORY_SCAR_INSTEAD_OF_RESETTING_HISTORY',
  'NO_MODE_IN_THIS_MODULE_ASSERTS_AN_EXTERNAL_LAW_OF_NATURE'
]);

export type ContinuityVectorR280={
  continuity:number;
  plasticity:number;
  contradiction:number;
  burden:number;
  scar:number;
};
export type EvidenceDatumR280={id:string;source:string;observedAt:string;verified:boolean};
export type DecisionR280='STAY'|'TURN'|'ESCALATE'|'HOLD';
export type GateThresholdsR280={low:number;high:number;continuityMin:number;plasticityMin:number;burdenMax:number;contradictionMax:number};

const EPS=1e-9;
const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const phase12=(x:any)=>Math.max(1,Math.min(12,Math.floor(Number(x)||1)));
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')};
const validEvidence=(e:EvidenceDatumR280[]|undefined)=>(e||[]).filter(x=>x?.id&&x?.source&&x?.verified&&Number.isFinite(Date.parse(x.observedAt)));

export function normalizeContinuityVectorR280(v:ContinuityVectorR280):ContinuityVectorR280{
  return{continuity:cl(v.continuity),plasticity:cl(v.plasticity),contradiction:cl(v.contradiction),burden:cl(v.burden),scar:cl(v.scar)};
}

export function continuityDecisionR280(v:ContinuityVectorR280,thresholds?:Partial<GateThresholdsR280>){
  const x=normalizeContinuityVectorR280(v);
  const low=cl(thresholds?.low??.34),high=Math.max(low+.01,cl(thresholds?.high??.67));
  const raw=(x.continuity*x.plasticity)/(x.contradiction+x.burden+x.scar+EPS);
  const score=raw/(1+Math.abs(raw));
  const decision:DecisionR280=score>=high?'STAY':score>low?'TURN':'ESCALATE';
  return{raw,score,decision,thresholds:{low,high}};
}

export type PefInputR280={
  phase:number;
  state:ContinuityVectorR280;
  stiffness:number;
  priorElasticDebt?:number;
  debtRetention?:number;
  snapThreshold?:number;
  loadHistory?:number[];
  evidence?:EvidenceDatumR280[];
};
export function phaseElasticityR280(input:PefInputR280){
  const state=normalizeContinuityVectorR280(input.state),phase=phase12(input.phase);
  const stiffness=Math.max(EPS,Number.isFinite(input.stiffness)?Math.abs(input.stiffness):0);
  const history=(input.loadHistory||[]).filter(Number.isFinite).map(cl);
  const strain=cl((state.burden+state.contradiction+state.scar)/3);
  const retainedDebt=cl((input.priorElasticDebt??0)*cl(input.debtRetention??.82));
  const elasticDebt=cl(retainedDebt+strain/(1+stiffness));
  const snapThreshold=cl(input.snapThreshold??.72);
  const hasLoadHistory=history.length>0;
  const snap=stiffness>EPS&&hasLoadHistory&&elasticDebt>=snapThreshold;
  const recoveryGradient=cl((state.continuity*state.plasticity)/(1+state.burden+state.contradiction));
  const evidence=validEvidence(input.evidence),auditReady=evidence.length>0;
  return{
    schema:'OMEGA_PHASE_ELASTICITY_FIELD_R280',mode:'Phase Elasticity Field',phase,state,
    primitives:{strain,stiffness,elasticDebt,snapThreshold,recoveryGradient},
    gates:{bounded:true,nonNullStiffness:stiffness>EPS,hasLoadHistory,auditable:auditReady,snap},
    evidence:{valid:evidence.length,packets:evidence},
    decision:!auditReady?'HOLD':snap?'TURN':continuityDecisionR280(state).decision,
    canonicalMutation:false,
    truthBoundary:'PEF R280 is a bounded model of deformation/history/recovery using the archived PEF axioms. Its quantities are normalized computational variables unless explicitly bound to measured domain variables; it is not an externally validated universal physical or biological law.'
  };
}

export type CtdeInputR280={state:ContinuityVectorR280;threshold144To1728?:number;threshold1728To20736?:number;evidence?:EvidenceDatumR280[]};
export function ctdeR280(input:CtdeInputR280){
  const state=normalizeContinuityVectorR280(input.state);
  const t1=cl(input.threshold144To1728??.34),t2=Math.max(t1+.01,cl(input.threshold1728To20736??.67));
  const constraintLoad=cl((state.burden+state.contradiction+(1-state.continuity))/3);
  const resolution=constraintLoad<t1?144:constraintLoad<t2?1728:20736;
  const evidence=validEvidence(input.evidence);
  return{
    schema:'OMEGA_CTDE_R280',mode:'CTDE',state,constraintLoad,resolution,
    transition:resolution===144?'STAY_144':resolution===1728?'ESCALATE_1728':'ESCALATE_20736',
    thresholds:{threshold144To1728:t1,threshold1728To20736:t2},evidenceCount:evidence.length,
    canonicalMutation:false,
    truthBoundary:'CTDE R280 selects representational/address resolution from declared normalized constraint load. 144, 1728 and 20736 are computation/address resolutions, not physical dimensions.'
  };
}

export type LpmMeasurementR280={id:string;phase:number;instrument:string;metric:string;value:number;unit:string;observedAt:string;source:string;verified:boolean};
export function ledgeredPhaseMetrologyR280(measurement:LpmMeasurementR280,state:ContinuityVectorR280){
  const normalized=normalizeContinuityVectorR280(state),phase=phase12(measurement.phase);
  const valid=Boolean(measurement.id&&measurement.instrument&&measurement.metric&&measurement.unit&&measurement.source&&measurement.verified&&Number.isFinite(measurement.value)&&Number.isFinite(Date.parse(measurement.observedAt)));
  const decision=valid?continuityDecisionR280(normalized).decision:'HOLD';
  const record={phase,instrument:measurement.instrument,metric:measurement.metric,value:measurement.value,unit:measurement.unit,observedAt:measurement.observedAt,source:measurement.source,verified:measurement.verified,contradiction:normalized.contradiction,scar:normalized.scar,decision};
  return{
    schema:'OMEGA_LEDGERED_PHASE_METROLOGY_R280',mode:'Ledgered Phase Metrology',valid,record,recordHash:hash(JSON.stringify(record)),
    contradictionPreserved:normalized.contradiction,decision,canonicalMutation:false,
    truthBoundary:'LPM R280 preserves phase, instrument, unit, source, contradiction and scar. Invalid measurements remain HOLD and are never repaired by synthetic values.'
  };
}

export type TurnAtlasInputR280={state:ContinuityVectorR280;phase:number;declaredInvariants:Record<string,string|number|boolean>;candidateInvariants?:Record<string,string|number|boolean>;evidence?:EvidenceDatumR280[]};
export function turnAtlasR280(input:TurnAtlasInputR280){
  const state=normalizeContinuityVectorR280(input.state),phase=phase12(input.phase),evidence=validEvidence(input.evidence);
  const keys=Object.keys(input.declaredInvariants||{});
  const invariantPreserved=keys.length>0&&keys.every(k=>input.candidateInvariants?.[k]===input.declaredInvariants[k]);
  const kernel=continuityDecisionR280(state);
  const decision:DecisionR280=evidence.length===0||!invariantPreserved?'HOLD':kernel.decision;
  const turnRequired=decision==='TURN'||decision==='ESCALATE';
  return{
    schema:'OMEGA_TURN_ATLAS_R280',mode:'Canonical Turn–Atlas Formalism',phase,state,
    invariant:{declared:input.declaredInvariants,candidate:input.candidateInvariants||null,preserved:invariantPreserved},
    evidenceCount:evidence.length,kernel,decision,turnRequired,
    closure:decision==='HOLD'?'NOT_ADMITTED':turnRequired?'TURN_REQUIRED':'CLOSED_STAY',canonicalMutation:false,
    truthBoundary:'Turn–Atlas R280 is an invariant-preserving state-transition controller. A missing evidence packet or broken declared invariant returns HOLD rather than a forced turn.'
  };
}

export type ContinuanceInputR280={state:ContinuityVectorR280;phase:number;thresholds?:Partial<GateThresholdsR280>;evidence?:EvidenceDatumR280[]};
export function continuanceShellR280(input:ContinuanceInputR280){
  const state=normalizeContinuityVectorR280(input.state),phase=phase12(input.phase),evidence=validEvidence(input.evidence);
  const req={continuityMin:cl(input.thresholds?.continuityMin??.45),plasticityMin:cl(input.thresholds?.plasticityMin??.30),burdenMax:cl(input.thresholds?.burdenMax??.75),contradictionMax:cl(input.thresholds?.contradictionMax??.65)};
  const checks={continuity:state.continuity>=req.continuityMin,plasticity:state.plasticity>=req.plasticityMin,burden:state.burden<=req.burdenMax,contradiction:state.contradiction<=req.contradictionMax};
  const admissible=evidence.length>0&&Object.values(checks).every(Boolean);
  const decision:DecisionR280=evidence.length===0?'HOLD':admissible?'STAY':'TURN';
  return{
    schema:'OMEGA_CONTINUANCE_SHELL_R280',mode:'Continuance Shell',phase,state,requirements:req,checks,evidenceCount:evidence.length,admissible,decision,
    canonicalMutation:false,
    truthBoundary:'Continuance Shell R280 evaluates explicit phase-specific state requirements. Failure is retained as a boundary result; it is not erased or reinterpreted as success.'
  };
}

export type NonFlatPredictionInputR280={state:ContinuityVectorR280;memory:number;alpha?:number;beta?:number;signal?:number;evidence?:EvidenceDatumR280[]};
export function nonFlatPredictionR280(input:NonFlatPredictionInputR280){
  const state=normalizeContinuityVectorR280(input.state),alpha=cl(input.alpha??.82),beta=cl(input.beta??.18);
  const signal=cl(input.signal??((state.continuity+state.plasticity+(1-state.contradiction)+(1-state.burden))/4));
  const priorMemory=cl(input.memory),memoryNext=cl(alpha*priorMemory+beta*signal);
  const baseline=continuityDecisionR280(state),historyAdjustedScore=cl(.7*baseline.score+.3*memoryNext);
  const evidence=validEvidence(input.evidence);
  const decision:DecisionR280=evidence.length===0?'HOLD':historyAdjustedScore>=baseline.thresholds.high?'STAY':historyAdjustedScore>baseline.thresholds.low?'TURN':'ESCALATE';
  return{
    schema:'OMEGA_NON_FLAT_PREDICTION_R280',mode:'Non-Flat Prediction Engine',state,memory:{prior:priorMemory,alpha,beta,signal,next:memoryNext},baselineScore:baseline.score,historyAdjustedScore,evidenceCount:evidence.length,decision,
    canonicalMutation:false,
    truthBoundary:'Non-Flat Prediction R280 implements the archived discrete scar-memory recurrence as a bounded model. It is a forecast/control score, not prophecy or independent empirical evidence.'
  };
}
