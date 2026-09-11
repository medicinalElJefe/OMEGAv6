import {compileBioInstrumentFrameR281,type BioInstrumentSampleR281,type CalibratedBioSampleR281} from './bioInstrumentRuntimeR281';
import {compileBioAllModesFabricR281} from './bioAllModesFabricR281';
import {compileBioEmpiricalConvergenceR281,type BioEmpiricalCaseR281} from './bioEmpiricalConvergenceR281';

export const BIO_MEDICAL_PRODUCTION_R282_SCHEMA='OMEGA_BIO_MEDICAL_PRODUCTION_BASELINE_R282' as const;
export const BIO_MEDICAL_PRODUCTION_R282_LAWS=Object.freeze([
  'RAW_OBSERVATIONS_ARE_IMMUTABLE_AND_OUTRANK_ALL_MODEL_OUTPUTS',
  'A_MEASURAND_MUST_HAVE_AN_EXPLICIT_DEFINITION_UNIT_CONTRACT_ANALYTICAL_RANGE_AND_CALIBRATION_REQUIREMENT',
  'UNIT_CONVERSION_IS_ALLOWED_ONLY_WHEN_DECLARED_BY_THE_MEASUREMENT_DEFINITION',
  'UNPROVEN_MODES_MAY_RUN_AS_RESEARCH_HYPOTHESES_BUT_HAVE_ZERO_CLINICAL_AUTHORITY',
  'CLINICAL_WEIGHT_REQUIRES_INTENDED_USE_MATCHED_VALIDATION_AND_EXPLICIT_RELEASE_AUTHORITY',
  'FIT_MAY_PROPOSE_A_CHANGE_HOLDOUT_MUST_VALIDATE_IT_AND_PROSPECTIVE_DATA_MUST_MONITOR_IT',
  'SUBJECT_ACQUISITION_OR_CASE_LEAKAGE_ACROSS_VALIDATION_PARTITIONS_BLOCKS_PROMOTION',
  'HIGH_RESIDUAL_RISK_OR_OPEN_CRITICAL_HAZARDS_BLOCK_CLINICAL_RELEASE',
  'MODEL_UPDATES_NEVER_SELF_PROMOTE_OUTSIDE_A_DECLARED_CONTROLLED_CHANGE_PLAN',
  'EVERY_RELEASE_AND_MEASUREMENT_EVENT_IS_ELIGIBLE_FOR_APPEND_ONLY_CRYPTOGRAPHIC_AUDIT_CHAINING',
  'PRODUCTION_VALIDATION_READY_IS_NOT_THE_SAME_AS_REGULATORY_AUTHORIZATION',
  'AUTHORIZED_CLINICAL_RELEASE_REQUIRES_REAL_AUTHORIZATION_EVIDENCE_NOT_A_SOFTWARE_FLAG_ALONE'
]);

export type BioRegulatoryStageR282='RESEARCH_ONLY'|'ANALYTICAL_VALIDATION'|'CLINICAL_VALIDATION'|'AUTHORIZED_CLINICAL';
export type BioSoftwareDocumentationLevelR282='BASIC'|'ENHANCED';
export type BioDecisionRoleR282='MEASUREMENT_ONLY'|'INFORMATIONAL'|'CLINICAL_DECISION_SUPPORT'|'AUTONOMOUS_ACTION';
export type BioGateR282='PASS'|'FAIL'|'HOLD';
export type BioMedicalReleaseStateR282='ENGINEERING_INCOMPLETE'|'PRODUCTION_VALIDATION_READY'|'CLINICAL_RELEASE_BLOCKED'|'AUTHORIZED_CLINICAL_RELEASE_READY';

export type BioIntendedUseR282={
  id:string;
  purpose:string;
  intendedUser:string;
  intendedPopulation:string;
  useEnvironment:string;
  inputs:string[];
  outputs:string[];
  decisionRole:BioDecisionRoleR282;
  contraindications?:string[];
  limitations?:string[];
  locked:boolean;
};

export type UnitTransformR282={scale:number;offset:number};
export type BioMeasurementDefinitionR282={
  id:string;
  variable:string;
  canonicalUnit:string;
  acceptedUnits:Record<string,UnitTransformR282>;
  analyticalRange:{min:number;max:number};
  maxRelativeExpandedUncertainty?:number;
  calibrationTraceabilityRequired:boolean;
  referenceMethod?:string;
  criticality:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
  intendedUseId:string;
  version:string;
};

export type BioHazardControlR282={
  id:string;
  hazard:string;
  foreseeableSequence:string;
  harm:string;
  severity:1|2|3|4|5;
  probability:1|2|3|4|5;
  controls:string[];
  verification:string[];
  residualSeverity:1|2|3|4|5;
  residualProbability:1|2|3|4|5;
  residualAcceptable:boolean;
  status:'OPEN'|'CONTROLLED'|'ACCEPTED';
};

export type BioClinicalReleaseManifestR282={
  releaseId:string;
  softwareVersion:string;
  intendedUse:BioIntendedUseR282;
  regulatoryStage:BioRegulatoryStageR282;
  jurisdiction:string;
  authorizationId?:string;
  authorizationScope?:string;
  softwareDocumentationLevel:BioSoftwareDocumentationLevelR282;
  qmsReleaseRecord?:string;
  riskManagementApproved:boolean;
  analyticalValidationApproved:boolean;
  clinicalValidationApproved:boolean;
  humanFactorsApproved:boolean;
  cybersecurityApproved:boolean;
  interoperabilityApproved:boolean;
  postmarketPlanApproved:boolean;
  configurationLocked:boolean;
  sbomRecorded:boolean;
  unresolvedAnomaliesReviewed:boolean;
  pccpId?:string;
  pccpAuthorized?:boolean;
};

export type BioClinicalModeEvidenceR282={
  channelKey:string;
  intendedUseId:string;
  state:'UNVALIDATED'|'ANALYTICALLY_VALIDATED'|'CLINICALLY_VALIDATED'|'REJECTED';
  metric:string;
  holdoutN:number;
  prospectiveN:number;
  modelValue:number|null;
  baselineValue:number|null;
  lowerConfidenceBound?:number|null;
  threshold?:number|null;
  recordedAt:string;
  evidenceRef:string;
};

export type BioClinicalEmpiricalCaseR282=BioEmpiricalCaseR281&{
  subjectKey?:string;
  acquisitionId?:string;
};

export type BioPccpChangeR282={
  id:string;
  intendedUseId:string;
  description:string;
  boundedScope:string;
  intendedUseUnchanged:boolean;
  verificationPlan:string;
  validationPlan:string;
  impactAssessment:string;
  rollbackCriteria:string;
  authorizedPlanId?:string;
};

export type BioAuditEventR282={
  sequence:number;
  type:string;
  timestamp:string;
  actor:string;
  previousHash:string;
  payloadHash:string;
  eventHash:string;
};

const EPS=1e-12;
const finite=(x:any)=>Number.isFinite(Number(x));
const clamp01=(x:any)=>Math.max(0,Math.min(1,finite(x)?Number(x):0));

function stableValue(x:any):any{
  if(Array.isArray(x))return x.map(stableValue);
  if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,stableValue(x[k])]));
  if(typeof x==='number'&&!Number.isFinite(x))return String(x);
  return x;
}
export function canonicalJsonR282(value:any){return JSON.stringify(stableValue(value));}
export async function sha256HexR282(value:string){
  const bytes=new TextEncoder().encode(value);
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function appendBioAuditEventR282(chain:BioAuditEventR282[],type:string,payload:any,actor='OMEGA',timestamp=new Date().toISOString()){
  const previousHash=chain.length?chain[chain.length-1].eventHash:'GENESIS';
  const payloadHash=await sha256HexR282(canonicalJsonR282(payload));
  const unsigned={sequence:chain.length+1,type,timestamp,actor,previousHash,payloadHash};
  const eventHash=await sha256HexR282(canonicalJsonR282(unsigned));
  return[...chain,{...unsigned,eventHash}];
}

export async function verifyBioAuditChainR282(chain:BioAuditEventR282[]){
  const errors:string[]=[];
  for(let i=0;i<chain.length;i++){
    const event=chain[i],expectedPrev=i?chain[i-1].eventHash:'GENESIS';
    if(event.sequence!==i+1)errors.push(`SEQUENCE_${i+1}`);
    if(event.previousHash!==expectedPrev)errors.push(`PREVIOUS_HASH_${i+1}`);
    const expected=await sha256HexR282(canonicalJsonR282({sequence:event.sequence,type:event.type,timestamp:event.timestamp,actor:event.actor,previousHash:event.previousHash,payloadHash:event.payloadHash}));
    if(expected!==event.eventHash)errors.push(`EVENT_HASH_${i+1}`);
  }
  return{ok:errors.length===0,errors,count:chain.length,head:chain.length?chain[chain.length-1].eventHash:'GENESIS'};
}

export function intendedUseCompleteR282(x:BioIntendedUseR282){
  return Boolean(x?.id&&x?.purpose&&x?.intendedUser&&x?.intendedPopulation&&x?.useEnvironment&&x?.inputs?.length&&x?.outputs?.length&&x?.decisionRole&&x.locked);
}

export function evaluateDefinedMeasurementR282(sample:CalibratedBioSampleR281,definition?:BioMeasurementDefinitionR282){
  const errors:string[]=[],warnings:string[]=[];
  if(!definition){errors.push('MEASURAND_DEFINITION_MISSING');return{eligible:false,canonicalValue:null,canonicalUncertainty:null,definition:null,errors,warnings};}
  if(sample.variable!==definition.variable)errors.push('VARIABLE_DEFINITION_MISMATCH');
  const transform=definition.acceptedUnits[sample.unit];
  if(!transform)errors.push('UNIT_NOT_DECLARED_FOR_MEASURAND');
  if(!(finite(definition.analyticalRange?.min)&&finite(definition.analyticalRange?.max)&&definition.analyticalRange.min<definition.analyticalRange.max))errors.push('INVALID_ANALYTICAL_RANGE');
  const canonicalValue=transform?transform.scale*sample.correctedValue+transform.offset:null;
  const canonicalUncertainty=transform?Math.abs(transform.scale)*sample.expandedUncertainty:null;
  if(canonicalValue!=null&&(canonicalValue<definition.analyticalRange.min||canonicalValue>definition.analyticalRange.max))errors.push('OUTSIDE_ANALYTICAL_MEASUREMENT_RANGE');
  const relative=canonicalValue!=null&&Math.abs(canonicalValue)>EPS&&canonicalUncertainty!=null?Math.abs(canonicalUncertainty/canonicalValue):null;
  if(definition.maxRelativeExpandedUncertainty!=null&&relative!=null&&relative>definition.maxRelativeExpandedUncertainty)errors.push('UNCERTAINTY_EXCEEDS_DECLARED_LIMIT');
  if(definition.calibrationTraceabilityRequired&&!sample.calibration?.traceability)errors.push('TRACEABILITY_REQUIRED');
  if(sample.quality!=='INSTRUMENT_READY')errors.push(`R281_${sample.quality}`);
  if(!definition.referenceMethod)warnings.push('REFERENCE_METHOD_NOT_DECLARED');
  return{eligible:errors.length===0,canonicalValue,canonicalUncertainty,relativeExpandedUncertainty:relative,definition,errors,warnings};
}

export function compileMedicalMeasurementFrameR282(record:any,samples:BioInstrumentSampleR281[],definitions:BioMeasurementDefinitionR282[],intendedUse:BioIntendedUseR282,nowMs=Date.now()){
  const r281=compileBioInstrumentFrameR281(record,samples,nowMs);
  const byVariable=new Map(definitions.filter(x=>x.intendedUseId===intendedUse.id).map(x=>[x.variable,x]));
  const rows=r281.measurement.samples.map((sample:any)=>({sample,...evaluateDefinedMeasurementR282(sample,byVariable.get(sample.variable))}));
  const eligible=rows.filter(x=>x.eligible),rejected=rows.filter(x=>!x.eligible);
  const gate:BioGateR282=!intendedUseCompleteR282(intendedUse)?'FAIL':rows.length===0?'HOLD':rejected.length?'FAIL':'PASS';
  return{
    schema:'OMEGA_BIO_MEDICAL_MEASUREMENT_FRAME_R282',
    intendedUseId:intendedUse.id,
    gate,
    counts:{supplied:rows.length,eligible:eligible.length,rejected:rejected.length,definitions:definitions.filter(x=>x.intendedUseId===intendedUse.id).length},
    rows,
    inherited:r281,
    measurementAuthority:1,
    modelAuthority:0,
    truthBoundary:'Only instrument observations that pass R281 calibration/provenance checks and an intended-use-specific R282 measurand definition may enter the medical measurement frame. No model or mode creates measurements.'
  };
}

export function validatePartitionIsolationR282(cases:BioClinicalEmpiricalCaseR282[]){
  const errors:string[]=[];
  const seenId=new Map<string,string>(),seenSubject=new Map<string,string>(),seenAcquisition=new Map<string,string>();
  for(const row of cases){
    const p=String(row.partition);
    const priorId=seenId.get(row.id);if(priorId&&priorId!==p)errors.push(`CASE_LEAK:${row.id}:${priorId}->${p}`);else seenId.set(row.id,p);
    if(row.subjectKey){const prior=seenSubject.get(row.subjectKey);if(prior&&prior!==p)errors.push(`SUBJECT_LEAK:${row.subjectKey}:${prior}->${p}`);else seenSubject.set(row.subjectKey,p)}
    if(row.acquisitionId){const prior=seenAcquisition.get(row.acquisitionId);if(prior&&prior!==p)errors.push(`ACQUISITION_LEAK:${row.acquisitionId}:${prior}->${p}`);else seenAcquisition.set(row.acquisitionId,p)}
  }
  return{gate:errors.length?'FAIL' as const:'PASS' as const,errors};
}

export function compileClinicalModeFabricR282(record:any,evidence:BioClinicalModeEvidenceR282[],manifest:BioClinicalReleaseManifestR282){
  const base=compileBioAllModesFabricR281(record),byKey=new Map(evidence.map(x=>[x.channelKey,x]));
  const clinicallyAuthorized=manifest.regulatoryStage==='AUTHORIZED_CLINICAL'&&Boolean(manifest.authorizationId)&&manifest.configurationLocked;
  const channels=base.channels.map((channel:any)=>{
    const receipt=byKey.get(channel.key);
    const scopeMatch=receipt?.intendedUseId===manifest.intendedUse.id;
    const validated=receipt?.state==='CLINICALLY_VALIDATED'&&receipt.holdoutN>0&&scopeMatch;
    const thresholdPass=receipt?.threshold==null||receipt?.lowerConfidenceBound==null?true:receipt.lowerConfidenceBound>=receipt.threshold;
    const researchEvidenceWeight=receipt?.state==='REJECTED'?0:receipt?.state==='CLINICALLY_VALIDATED'?1:receipt?.state==='ANALYTICALLY_VALIDATED'?.72:receipt?.state==='UNVALIDATED'?.15:.05;
    const researchWeight=clamp01(channel.activation*researchEvidenceWeight);
    const clinicalWeight=clinicallyAuthorized&&validated&&thresholdPass?researchWeight:0;
    return{...channel,evidence:receipt||null,researchWeight,clinicalWeight,clinicalAuthority:clinicalWeight>0?1:0,measurementAuthority:0,scopeMatch:Boolean(scopeMatch),thresholdPass};
  });
  return{
    schema:'OMEGA_BIO_CLINICAL_MODE_FABRIC_R282',
    total:channels.length,
    researchActive:channels.filter((x:any)=>x.researchWeight>0).length,
    clinicalActive:channels.filter((x:any)=>x.clinicalWeight>0).length,
    measurementAuthority:0,
    channels,
    truthBoundary:'All 241 mode channels remain available for research analysis. Clinical influence is zero unless a channel has intended-use-matched clinical validation evidence and the release itself has explicit clinical authorization. Measurement authority is always zero.'
  };
}

export const DEFAULT_BIO_HAZARDS_R282:readonly BioHazardControlR282[]=Object.freeze([
  {id:'HB-001',hazard:'Unit or measurand mismatch',foreseeableSequence:'Incoming device value is interpreted using an undeclared unit or variable definition.',harm:'Incorrect physiological interpretation',severity:5,probability:3,controls:['Per-variable unit contract','No implicit conversion'],verification:['R282 unit mismatch invariant'],residualSeverity:5,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'},
  {id:'HB-002',hazard:'Stale or uncalibrated measurement',foreseeableSequence:'Expired calibration or stale acquisition is accepted.',harm:'Incorrect measured state',severity:5,probability:3,controls:['Calibration expiry gate','Staleness gate','Traceability required'],verification:['R281 calibration invariants','R282 medical frame'],residualSeverity:5,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'},
  {id:'HB-003',hazard:'Model output substituted for measurement',foreseeableSequence:'A derived Heavy Bio or all-mode output overwrites an instrument value.',harm:'Fabricated clinical evidence',severity:5,probability:2,controls:['measurementAuthority=0 for all 241 modes','Immutable observation contract'],verification:['R281/R282 all-mode invariants'],residualSeverity:5,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'},
  {id:'HB-004',hazard:'Validation leakage',foreseeableSequence:'Same subject/acquisition appears in fit and holdout/prospective partitions.',harm:'Inflated performance estimate',severity:4,probability:3,controls:['Partition isolation gate'],verification:['R282 leakage invariants'],residualSeverity:4,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'},
  {id:'HB-005',hazard:'Domain regression hidden by global improvement',foreseeableSequence:'Aggregate metric improves while a biological domain degrades.',harm:'Subpopulation or domain-specific performance loss',severity:4,probability:3,controls:['12-domain and 12-layer residual slices','Regression blocks promotion'],verification:['R281 convergence invariants'],residualSeverity:4,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'},
  {id:'HB-006',hazard:'Unauthorized self-modification',foreseeableSequence:'A model update bypasses holdout/PCCP/change control.',harm:'Unvalidated behavior change',severity:5,probability:2,controls:['FIT/HOLDOUT/PROSPECTIVE separation','PCCP bounded-change gate','Configuration lock'],verification:['R282 controlled update invariants'],residualSeverity:5,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'},
  {id:'HB-007',hazard:'Audit evidence tampering',foreseeableSequence:'Historical validation or release events are altered without detection.',harm:'Loss of traceability and invalid release evidence',severity:4,probability:2,controls:['SHA-256 append-only audit chain'],verification:['R282 audit-chain tamper invariant'],residualSeverity:4,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'},
  {id:'HB-008',hazard:'Cybersecurity compromise',foreseeableSequence:'Unauthorized actor changes data, model, configuration or execution.',harm:'Incorrect output or unavailable function',severity:5,probability:3,controls:['Existing OMEGA authenticated authority boundaries','Release cybersecurity gate'],verification:['R237/R238 authority proofs','FDA 2026 cybersecurity target'],residualSeverity:5,residualProbability:2,residualAcceptable:false,status:'OPEN'}
]);

export function assessBioRiskR282(hazards:readonly BioHazardControlR282[]){
  const open=hazards.filter(x=>x.status==='OPEN'||!x.residualAcceptable),critical=open.filter(x=>x.severity>=4||x.residualSeverity>=4);
  return{gate:(critical.length?'FAIL':open.length?'HOLD':'PASS') as BioGateR282,total:hazards.length,open:open.length,critical:critical.length,risks:hazards.map(x=>({...x,initialRisk:x.severity*x.probability,residualRisk:x.residualSeverity*x.residualProbability}))};
}

export function assessControlledBioUpdateR282(input:{cases:BioClinicalEmpiricalCaseR282[];change:BioPccpChangeR282;manifest:BioClinicalReleaseManifestR282;hazards:readonly BioHazardControlR282[]}){
  const isolation=validatePartitionIsolationR282(input.cases),convergence=compileBioEmpiricalConvergenceR281(input.cases),risk=assessBioRiskR282(input.hazards);
  const noDomainRegression=convergence.atlas.regressions.length===0;
  const planComplete=Boolean(input.change.id&&input.change.intendedUseId===input.manifest.intendedUse.id&&input.change.boundedScope&&input.change.verificationPlan&&input.change.validationPlan&&input.change.impactAssessment&&input.change.rollbackCriteria&&input.change.intendedUseUnchanged);
  const dataGate=isolation.gate==='PASS'&&convergence.candidate.promotable&&noDomainRegression;
  const controlledReleaseEligible=planComplete&&dataGate&&risk.gate==='PASS'&&input.manifest.configurationLocked;
  const authorizedChangeEligible=controlledReleaseEligible&&input.manifest.regulatoryStage==='AUTHORIZED_CLINICAL'&&Boolean(input.manifest.authorizationId)&&Boolean(input.manifest.pccpAuthorized)&&Boolean(input.change.authorizedPlanId)&&input.change.authorizedPlanId===input.manifest.pccpId;
  return{
    schema:'OMEGA_BIO_CONTROLLED_CHANGE_R282',
    state:authorizedChangeEligible?'AUTHORIZED_CHANGE_ELIGIBLE':controlledReleaseEligible?'VALIDATION_CHANGE_ELIGIBLE':'BLOCKED',
    planComplete,dataGate,noDomainRegression,isolation,convergence,risk,authorizedChangeEligible,
    truthBoundary:'A data-driven improvement may become a controlled validation candidate after clean holdout performance, no domain regression, risk closure and rollback planning. Clinical self-update remains blocked unless the actual authorized change-control scope also matches.'
  };
}

export function assessMedicalReleaseR282(input:{record:any;samples:BioInstrumentSampleR281[];definitions:BioMeasurementDefinitionR282[];manifest:BioClinicalReleaseManifestR282;hazards?:readonly BioHazardControlR282[];clinicalModeEvidence?:BioClinicalModeEvidenceR282[];empiricalCases?:BioClinicalEmpiricalCaseR282[];nowMs?:number}){
  const hazards=input.hazards||DEFAULT_BIO_HAZARDS_R282;
  const medicalFrame=compileMedicalMeasurementFrameR282(input.record,input.samples,input.definitions,input.manifest.intendedUse,input.nowMs);
  const risk=assessBioRiskR282(hazards);
  const isolation=validatePartitionIsolationR282(input.empiricalCases||[]);
  const empirical=input.empiricalCases?.length?compileBioEmpiricalConvergenceR281(input.empiricalCases):null;
  const modes=compileClinicalModeFabricR282(input.record,input.clinicalModeEvidence||[],input.manifest);
  const intendedUseGate=intendedUseCompleteR282(input.manifest.intendedUse)?'PASS':'FAIL';
  const lifecycleGate=input.manifest.configurationLocked&&input.manifest.sbomRecorded&&input.manifest.unresolvedAnomaliesReviewed?'PASS':'FAIL';
  const qmsGate=input.manifest.qmsReleaseRecord?'PASS':'HOLD';
  const validationGate=input.manifest.analyticalValidationApproved?'PASS':'HOLD';
  const cyberGate=input.manifest.cybersecurityApproved?'PASS':'HOLD';
  const productionValidationReady=[intendedUseGate,lifecycleGate,qmsGate,validationGate,cyberGate,risk.gate,isolation.gate].every(x=>x==='PASS');
  const clinicalEvidenceReady=productionValidationReady&&input.manifest.clinicalValidationApproved&&input.manifest.humanFactorsApproved&&input.manifest.interoperabilityApproved&&input.manifest.postmarketPlanApproved;
  const authorized=clinicalEvidenceReady&&input.manifest.regulatoryStage==='AUTHORIZED_CLINICAL'&&Boolean(input.manifest.authorizationId)&&Boolean(input.manifest.authorizationScope);
  let releaseState:BioMedicalReleaseStateR282='ENGINEERING_INCOMPLETE';
  if(productionValidationReady)releaseState='PRODUCTION_VALIDATION_READY';
  if(productionValidationReady&&!authorized)releaseState='CLINICAL_RELEASE_BLOCKED';
  if(authorized)releaseState='AUTHORIZED_CLINICAL_RELEASE_READY';
  return{
    schema:BIO_MEDICAL_PRODUCTION_R282_SCHEMA,laws:BIO_MEDICAL_PRODUCTION_R282_LAWS,
    releaseState,
    gates:{intendedUse:intendedUseGate,measurement:medicalFrame.gate,lifecycle:lifecycleGate,qms:qmsGate,analyticalValidation:validationGate,clinicalValidation:input.manifest.clinicalValidationApproved?'PASS':'HOLD',humanFactors:input.manifest.humanFactorsApproved?'PASS':'HOLD',cybersecurity:cyberGate,interoperability:input.manifest.interoperabilityApproved?'PASS':'HOLD',postmarket:input.manifest.postmarketPlanApproved?'PASS':'HOLD',risk:risk.gate,partitionIsolation:isolation.gate,regulatoryAuthorization:authorized?'PASS':'HOLD'},
    medicalFrame,risk,isolation,empirical,modes,manifest:input.manifest,
    claims:{instrumentProcessing:medicalFrame.gate==='PASS',researchAnalysis:true,clinicalDecisionSupport:authorized&&input.manifest.intendedUse.decisionRole==='CLINICAL_DECISION_SUPPORT',autonomousClinicalAction:authorized&&input.manifest.intendedUse.decisionRole==='AUTONOMOUS_ACTION'},
    standardsTargets:{qms:'FDA QMSR / ISO 13485:2016',softwareLifecycle:'IEC 62304:2006+A1:2015',risk:'ISO 14971:2019',softwareSubmission:'FDA Content of Premarket Submissions for Device Software Functions (2023)',cybersecurity:'FDA Cybersecurity in Medical Devices (Feb 2026)',aiChangeControl:'FDA AI-enabled Device Software PCCP Guidance (Aug 2025)',gmlp:'IMDRF/FDA Good Machine Learning Practice',clinicalDecisionSupport:'FDA Clinical Decision Support Software Guidance (Jan 2026)'},
    truthBoundary:'R282 is a medical-production engineering baseline and validation control plane. It may process calibrated instrument data in production-validation mode, but it does not manufacture regulatory authorization, clinical validation, diagnosis, treatment authority, or medical-device clearance. Clinical authority remains blocked until intended-use-specific evidence and actual authorization are present.'
  };
}
