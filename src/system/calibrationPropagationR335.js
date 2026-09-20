import {calibrationManifestR334,R334_RELEASE_ID,R334_SOURCE_MANIFEST} from './calibrationR334.js';

export const R335_REVISION='R335';
export const R335_SCHEMA='OMEGA_CALIBRATION_FULL_SYSTEM_PROPAGATION_R335';

export const R335_CALIBRATION_CONSUMERS=Object.freeze([
 {id:'CAPABILITY_DATASET_REGISTRY',artifact:'src/capabilityAtlasR43.ts',role:'dataset census and operator-facing calibrated source inventory'},
 {id:'MODE_REALIZATION_REGISTRY',artifact:'src/modeRealizationRegistryR280.ts',role:'global mode/lens evidence context without converting calibration into independent mode execution'},
 {id:'ALL_MODES_TRUTH_FUSION',artifact:'src/allModesTruthFusionR151.ts',role:'read-only calibrated context across all-mode synthesis with zero independent empirical vote'},
 {id:'UNIVERSAL_TRUTH_ENVELOPE',artifact:'src/universalTruthEnvelopeR152.ts',role:'versioned calibration context without evidence-class promotion'},
 {id:'RELATIVITY_RUNTIME',artifact:'src/physicsRelativityRuntimeR132.ts',role:'calibrated relativity evidence context in observer/frame runtime'},
 {id:'RELATIVITY_SURFACE',artifact:'src/RelativityCalibrationR334.tsx',role:'operator-visible calibrated values, caveats and proof boundaries'},
 {id:'RELATIONAL_RUNTIME',artifact:'src/system/proofGovernedRelationalRuntimeR334.js',role:'proof-governed relation/continuity cycle calibration context'},
 {id:'WORKER_MANIFEST',artifact:'src/workerR116.js',role:'deployed system manifest calibration identity'},
 {id:'CONVERGENCE_MASTER',artifact:'src/convergenceMasterR314.ts',role:'promotion/progress receipt and dependency-graph continuity'},
 {id:'CONVERGENCE_AUDIT',artifact:'scripts/r314-convergence-audit.mjs',role:'source hash/census fail-closed calibration audit'},
 {id:'R170_AUTONOMY',artifact:'.github/workflows/r170-governed-selfbuild.yml',role:'calibrated canonical-state continuation through parse-safe governed proposal handoff'},
]);

export function calibrationPropagationManifestR335(){
 const calibration=calibrationManifestR334();
 return Object.freeze({
  schema:R335_SCHEMA,
  revision:R335_REVISION,
  calibrationRelease:R334_RELEASE_ID,
  sourceCount:R334_SOURCE_MANIFEST.length,
  sources:R334_SOURCE_MANIFEST,
  consumers:R335_CALIBRATION_CONSUMERS,
  propagationState:'FULL_RELEVANT_SYSTEM_BINDING',
  sourceExactPreserved:true,
  rawExperimentalOverwrite:false,
  canonicalMutation:false,
  canonicalAdmissionAuthority:'R125',
  truthBoundary:calibration.truthBoundary,
  propagationBoundary:'R335 propagates the already-proved R334 calibration identity/evidence context through relevant OMEGA runtime, all-mode synthesis, truth-envelope, mode, UI, manifest, convergence and autonomy surfaces. It does not make every mode a CERN executor, does not alter raw experiment evidence, does not resolve the still-open native ATLAS workspace gate, and creates no new execution or CanonState authority.'
 });
}

export const R335_PROPAGATION_RECEIPT=Object.freeze({
 revision:R335_REVISION,
 stage:'R314-B06',
 state:'PROPAGATION_CLOSED',
 calibrationRelease:R334_RELEASE_ID,
 sourceHashes:Object.freeze(Object.fromEntries(R334_SOURCE_MANIFEST.map(x=>[x.id,x.sha256]))),
 consumers:R335_CALIBRATION_CONSUMERS.map(x=>x.id),
 r170ProposalTransport:'RAW_STDOUT_CAPTURE_PLUS_LAST_VALID_TOP_LEVEL_JSON_EXTRACTION',
 canonicalMutation:false,
 canonicalAdmission:false,
 canonicalAdmissionAuthority:'R125'
});
