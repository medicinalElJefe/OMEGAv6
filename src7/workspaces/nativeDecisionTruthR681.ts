/**
 * R681 native decision evidence, independently calculated from the original B053
 * `Dimensional_Relativity_Stabilized/atlas_runtime.db` (immutable SQLite).
 *
 * This is historical source evidence, not a live streaming metric, training label,
 * physical state, operational dispatch score, or admission to CanonState.
 */
export const R681_SOURCE_SHA = 'be3dc2f5a7e80f672d9a6820d780d7821195005f5d8760a05c9f116135b5b13c';
export const R681_DECISION_AUDIT = Object.freeze({
 schema:'OMEGA_NATIVE_B053_DECISION_SOURCE_AUDIT_R681',
 snapshotSha256:R681_SOURCE_SHA,
 nativeOriginal:'State_Traversal_Verified.zip/Dimensional_Relativity_Stabilized/atlas_runtime.db',
 originalObservedAt:'2026-04-16T18:29:06.584208Z',
 rows:20736,
 stored:Object.freeze({STAY:0,TURN:29,ESCALATE:20707}),
 recomputed:Object.freeze({STAY:24,TURN:66,ESCALATE:20646}),
 savedVsRecoveredKernel:Object.freeze({TURN_to_STAY:23,ESCALATE_to_TURN:60,ESCALATE_to_STAY:1}),
 archivedStabilityRatioResidualRows:20736,
 archivedTurnPressureResidualRows:0,
 maxStabilityRatioAbsoluteResidual:0.5407253377101279,
 recoveredKernelSource:'backend/truth_spine/decision.py',
 recoveredKernelDefaults:Object.freeze({gamma:0.25,epsilon:1e-9,thetaStay:1.05,thetaEscalate:0.78,tauTurn:0.33}),
 empiricalOutcomeLabels:0,
 originalGeneratorVersionProven:false,
 physicalCalibrationProven:false,
 productionNativePolicyCertified:false,
 localAuditSha256:'0c373c862dfd713022ac69d8deb40c5ba56f895c36861fcfe0642769ddd3f294'
});
type Label='STAY'|'TURN'|'ESCALATE';
type Counts=Record<Label,number>;
export type R681TruthReport={
 snapshotSha256:string;rows:number;stored:Counts;recomputed:Counts;
 savedVsRecoveredKernel:{TURN_to_STAY:number;ESCALATE_to_TURN:number;ESCALATE_to_STAY:number};
 archivedStabilityRatioResidualRows:number;archivedTurnPressureResidualRows:number;
 empiricalOutcomeLabels:number;originalGeneratorVersionProven:boolean;physicalCalibrationProven:boolean;
 productionNativePolicyCertified:boolean;
};
const finite=(n:number)=>Number.isFinite(n)&&Number.isInteger(n)&&n>=0;
const total=(r:Counts)=>r.STAY+r.TURN+r.ESCALATE;
export function reviewNativeDecisionTruthR681(raw:R681TruthReport){
 const issues:string[]=[];
 if(raw?.snapshotSha256!==R681_SOURCE_SHA)issues.push('ARCHIVE_SOURCE_HASH_NOT_VERIFIED');
 if(raw?.rows!==20736)issues.push('CANONICAL_ADDRESS_COVERAGE_NOT_20736');
 const a=raw?.stored,b=raw?.recomputed,x=raw?.savedVsRecoveredKernel;
 if(!a||!b||!x||![a.STAY,a.TURN,a.ESCALATE,b.STAY,b.TURN,b.ESCALATE,x.TURN_to_STAY,x.ESCALATE_to_TURN,x.ESCALATE_to_STAY].every(finite)){
  issues.push('INVALID_NATIVE_DECISION_COUNTS');
 }else{
  if(total(a)!==raw.rows||total(b)!==raw.rows)issues.push('INCOMPLETE_NATIVE_DECISION_CENSUS');
  if(x.TURN_to_STAY+x.ESCALATE_to_TURN+x.ESCALATE_to_STAY>raw.rows)issues.push('INVALID_CONTRADICTION_CARDINALITY');
  if(b.STAY!==a.STAY+x.TURN_to_STAY+x.ESCALATE_to_STAY||
   b.TURN!==a.TURN-x.TURN_to_STAY+x.ESCALATE_to_TURN||
   b.ESCALATE!==a.ESCALATE-x.ESCALATE_to_TURN-x.ESCALATE_to_STAY)
    issues.push('CONTRADICTION_LEDGER_NOT_CONSERVED');
  if(a.STAY===0||b.STAY===0)issues.push('STAY_CLASS_NOT_DISCRIMINATED');
  const majority=Math.max(a.STAY,a.TURN,a.ESCALATE)/Math.max(1,total(a));
  if(majority>.95)issues.push('SAVED_DECISION_CLASS_CONCENTRATION_OVER_95_PERCENT');
  if(x.TURN_to_STAY+x.ESCALATE_to_TURN+x.ESCALATE_to_STAY>0)
   issues.push('ORIGINAL_DECISIONS_DISAGREE_WITH_RECOVERED_KERNEL');
 }
 if(!finite(raw?.archivedStabilityRatioResidualRows)||!finite(raw?.archivedTurnPressureResidualRows)||
    raw.archivedStabilityRatioResidualRows>raw.rows||raw.archivedTurnPressureResidualRows>raw.rows)
  issues.push('INVALID_ARCHIVED_DIAGNOSTIC_RESIDUALS');
 else if(raw.archivedStabilityRatioResidualRows||raw.archivedTurnPressureResidualRows)
  issues.push('ORIGINAL_SAVED_DIAGNOSTICS_DISAGREE_WITH_RECOVERED_KERNEL');
 if(!finite(raw?.empiricalOutcomeLabels)||raw.empiricalOutcomeLabels===0)
  issues.push('INDEPENDENT_EMPIRICAL_OUTCOME_CALIBRATION_MISSING');
 if(raw?.originalGeneratorVersionProven!==true)
  issues.push('ORIGINAL_DECISION_GENERATOR_VERSION_UNPROVEN');
 if(raw?.physicalCalibrationProven!==true)
  issues.push('PHYSICAL_VALIDATION_NOT_ESTABLISHED');
 if(raw?.productionNativePolicyCertified!==true)
  issues.push('NATIVE_PRODUCTION_EXECUTOR_NOT_CERTIFIED');
 // External R125 and independent deployment proof are prerequisites even if
 // local evidence appears flawless. This diagnostic never has that authority.
 issues.push('R125_EXTERNAL_ADMISSION_PROOF_REQUIRED');
 const dominant=a&&total(a)>0?Math.max(a.STAY,a.TURN,a.ESCALATE)/total(a):null;
 const entropy=a&&total(a)>0?(['STAY','TURN','ESCALATE'] as Label[]).reduce((acc,k)=>{
  const p=a[k]/total(a);return p>0?acc-p*Math.log2(p):acc;
 },0):null;
 return Object.freeze({
  schema:'OMEGA_NATIVE_DECISION_PROOF_GATE_R681',
  truth:'HISTORICAL_SOURCE_RECOMPUTED_NOT_LIVE',
  snapshotVerified:raw?.snapshotSha256===R681_SOURCE_SHA,
  dominantFraction:dominant,entropyBits:entropy,
  disagreements:x?x.TURN_to_STAY+x.ESCALATE_to_TURN+x.ESCALATE_to_STAY:null,
  vetoes:Object.freeze([...new Set(issues)]),
  canonicalStateMutation:false,
  useAsAutonomousNativePolicy:false,
  admission:'HELD' as const
 });
}
