export const BIO_EMPIRICAL_EVIDENCE_R281_SCHEMA='OMEGA_BIO_EMPIRICAL_EVIDENCE_REGISTRY_R281' as const;

export type EmpiricalEvidenceClassR281='HELD_OUT_EMPIRICAL'|'PUBLIC_BENCHMARK'|'CALIBRATION_HARNESS'|'STRUCTURAL_ATLAS';
export type EmpiricalEvidenceVerdictR281='SUPPORTS'|'NEUTRAL'|'DOES_NOT_SUPPORT'|'HARNESS_ONLY'|'STRUCTURAL_ONLY';

export type EmpiricalEvidenceReceiptR281={
 id:string;
 evidenceClass:EmpiricalEvidenceClassR281;
 title:string;
 sourceArtifact:string;
 scope:string;
 metric:string;
 sampleCount:number|null;
 trainCount:number|null;
 testCount:number|null;
 modelValue:number|null;
 baselineValue:number|null;
 improvement:number|null;
 verdict:EmpiricalEvidenceVerdictR281;
 recordedState:string;
 notes:string;
 calibrationAuthority:0;
 measurementAuthority:0;
};

/**
 * Immutable archive evidence receipts recovered from the existing OMEGA/Dewey
 * validation corpus. These values are historical evidence anchors, not live
 * measurements and not training rows. They must never be silently rewritten by
 * a later calibration cycle. A new result is appended as a new receipt.
 */
export const BIO_EMPIRICAL_EVIDENCE_RECEIPTS_R281=Object.freeze<readonly EmpiricalEvidenceReceiptR281[]>([
 {
  id:'PSC_MOTION_RELATIVITY_V2_HELDOUT',
  evidenceClass:'HELD_OUT_EMPIRICAL',
  title:'Motion relativity held-out validation v2',
  sourceArtifact:'motion_relativity_validation_metrics_v2.csv',
  scope:'motion-relativity predictive validation; dataset-specific',
  metric:'MAE / RMSE / R2',
  sampleCount:1200,trainCount:840,testCount:360,
  modelValue:0.0369671978304491,
  baselineValue:0.1082137061685185,
  improvement:0.6583871014187329,
  verdict:'SUPPORTS',
  recordedState:'EMPIRICALLY_SUPPORTED_ON_THIS_DATASET · R2=0.8784885480291631 · RMSE=0.0451236330439126',
  notes:'Strong held-out archive result. Preserve as a scoped empirical anchor; do not inflate it into universal or clinical proof.',
  calibrationAuthority:0,measurementAuthority:0
 },
 {
  id:'PARENT_PUBLIC_IRIS_V6',evidenceClass:'PUBLIC_BENCHMARK',title:'Parent operator · Iris plant morphology',sourceArtifact:'dewey_parent_operator_public_benchmark_v6.csv',scope:'Iris classification',metric:'accuracy',sampleCount:150,trainCount:null,testCount:null,modelValue:0.953333,baselineValue:0.953333,improvement:0,verdict:'NEUTRAL',recordedState:'Neutral · 1/5 fold wins',notes:'Public benchmark tie; retained as non-win evidence.',calibrationAuthority:0,measurementAuthority:0
 },
 {
  id:'PARENT_PUBLIC_WINE_V6',evidenceClass:'PUBLIC_BENCHMARK',title:'Parent operator · Wine chemistry',sourceArtifact:'dewey_parent_operator_public_benchmark_v6.csv',scope:'Wine chemistry classification',metric:'accuracy',sampleCount:178,trainCount:null,testCount:null,modelValue:0.988889,baselineValue:0.983333,improvement:0.005556,verdict:'SUPPORTS',recordedState:'Supports · 1/5 fold wins · +0.005556 accuracy',notes:'Small positive public-dataset result; keep effect size visible.',calibrationAuthority:0,measurementAuthority:0
 },
 {
  id:'PARENT_PUBLIC_BREAST_CANCER_V6',evidenceClass:'PUBLIC_BENCHMARK',title:'Parent operator · Breast cancer morphology',sourceArtifact:'dewey_parent_operator_public_benchmark_v6.csv',scope:'Breast cancer morphology classification',metric:'accuracy',sampleCount:569,trainCount:null,testCount:null,modelValue:0.970160,baselineValue:0.973669,improvement:-0.003509,verdict:'DOES_NOT_SUPPORT',recordedState:'Does not support · 1/5 fold wins',notes:'Negative biological benchmark retained as a domain residual/scar rather than hidden by global averages.',calibrationAuthority:0,measurementAuthority:0
 },
 {
  id:'PARENT_PUBLIC_DIABETES_V6',evidenceClass:'PUBLIC_BENCHMARK',title:'Parent operator · Diabetes clinical progression',sourceArtifact:'dewey_parent_operator_public_benchmark_v6.csv',scope:'Diabetes progression regression',metric:'R2',sampleCount:442,trainCount:null,testCount:null,modelValue:0.474067,baselineValue:0.479072,improvement:-0.005005,verdict:'DOES_NOT_SUPPORT',recordedState:'Does not support · 2/5 fold wins',notes:'Negative clinical-progression benchmark retained as a domain residual/scar.',calibrationAuthority:0,measurementAuthority:0
 },
 {
  id:'FOLD_SCALE_CALIBRATION_HARNESS_50',
  evidenceClass:'CALIBRATION_HARNESS',
  title:'Fold-scale relativity calibration harness',
  sourceArtifact:'fold_scale_relativity_calibration_test_harness.xlsx',
  scope:'calibration/benchmark harness',metric:'accuracy',sampleCount:50,trainCount:null,testCount:null,
  modelValue:1,baselineValue:0.32,improvement:0.68,verdict:'HARNESS_ONLY',
  recordedState:'BENCHMARK PASS CANDIDATE',
  notes:'The workbook itself instructs replacing CALIBRATION_INPUTS sample rows with measured observations. Preserve as a harness-performance receipt, not external empirical proof.',
  calibrationAuthority:0,measurementAuthority:0
 },
 {
  id:'HEAVY_BIO_35831808_ATLAS',
  evidenceClass:'STRUCTURAL_ATLAS',
  title:'Heavy Bio × Full Overall Canon exact address atlas',
  sourceArtifact:'heavy_bio_full_35831808D_canon_autoping.xlsx',
  scope:'12^7 Heavy Bio structural/address representation',metric:'exact addressability',sampleCount:35831808,trainCount:null,testCount:null,
  modelValue:null,baselineValue:null,improvement:null,verdict:'STRUCTURAL_ONLY',
  recordedState:'35,831,808 exact 7-axis addresses · DΦ=CΩ−αΛ−βq−γΛq+δΦ',
  notes:'Exact within the declared model; host variables still require measured bindings, units, uncertainty, provenance and failure tests.',
  calibrationAuthority:0,measurementAuthority:0
 }
]);

export function summarizeEmpiricalEvidenceRegistryR281(){
 const rows=[...BIO_EMPIRICAL_EVIDENCE_RECEIPTS_R281];
 return{
  schema:BIO_EMPIRICAL_EVIDENCE_R281_SCHEMA,
  receipts:rows,
  counts:{total:rows.length,supports:rows.filter(x=>x.verdict==='SUPPORTS').length,neutral:rows.filter(x=>x.verdict==='NEUTRAL').length,doesNotSupport:rows.filter(x=>x.verdict==='DOES_NOT_SUPPORT').length,harness:rows.filter(x=>x.evidenceClass==='CALIBRATION_HARNESS').length,heldOut:rows.filter(x=>x.evidenceClass==='HELD_OUT_EMPIRICAL').length},
  strongestHeldOut:rows.find(x=>x.id==='PSC_MOTION_RELATIVITY_V2_HELDOUT')||null,
  rule:'Historical receipts are append-only evidence anchors. New empirical cycles may supersede a model candidate, but they never rewrite prior benchmark outcomes.'
 };
}
