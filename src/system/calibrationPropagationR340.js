import {calibrationPropagationManifestR335,R335_PROPAGATION_RECEIPT} from './calibrationPropagationR335.js';
import {calibrationManifestR340,R340_RELEASE_ID,R340_SOURCE_MANIFEST} from './calibrationR340.js';

export const R340_PROPAGATION_SCHEMA='OMEGA_ABLATION_FORECAST_FULL_SYSTEM_PROPAGATION_R340';
export const R340_CALIBRATION_CONSUMERS=Object.freeze([
 {id:'CAPABILITY_DATASET_REGISTRY',artifact:'src/capabilityAtlasR43.ts',role:'v4 master census + exact ADV-05→ADV-07 runtime source inventory'},
 {id:'MODE_REALIZATION_REGISTRY',artifact:'src/modeRealizationRegistryR280.ts',role:'read-only ablation/forecast context for Overall Canon, Dimensional Relativity, Heavy Prune, Forecast and proof lenses'},
 {id:'ALL_MODES_TRUTH_FUSION',artifact:'src/allModesTruthFusionR151.ts',role:'successor calibration context with zero independent empirical voting weight'},
 {id:'UNIVERSAL_TRUTH_ENVELOPE',artifact:'src/universalTruthEnvelopeR152.ts',role:'frozen forecast/no-retuning context without evidence-class promotion'},
 {id:'RELATIVITY_RUNTIME',artifact:'src/physicsRelativityRuntimeR132.ts',role:'round-trip, ablation and future-compatibility context beside preserved R334 common state'},
 {id:'RELATIVITY_SURFACE',artifact:'src/RelativityCalibrationR340.tsx',role:'operator-visible ablation and prospective forecast contract'},
 {id:'WORKER_MANIFEST',artifact:'src/workerR116.js',role:'deployed manifest identity for v4 successor calibration'},
 {id:'CONVERGENCE_MASTER',artifact:'src/convergenceMasterR314.ts',role:'R314-B06 successor calibration receipt'}
]);

export function calibrationPropagationManifestR340(){
 const base=calibrationPropagationManifestR335(),advance=calibrationManifestR340();
 return Object.freeze({
  schema:R340_PROPAGATION_SCHEMA,revision:'R340',calibrationRelease:R340_RELEASE_ID,
  inherits:Object.freeze({revision:base.revision,release:base.calibrationRelease,receipt:R335_PROPAGATION_RECEIPT.state}),
  sourceCount:R340_SOURCE_MANIFEST.length,sources:R340_SOURCE_MANIFEST,consumers:R340_CALIBRATION_CONSUMERS,
  propagationState:'FULL_RELEVANT_SYSTEM_BINDING',sourceExactPreserved:true,rawExperimentalOverwrite:false,
  frozenProspectiveContract:true,noRetuning:advance.forecast.noRetuning===true,
  canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:advance.truthBoundary,
  propagationBoundary:'R340 adds the exact 25-row ADV-05→ADV-07 derived proof layer and v4 master census beside, not over, the R334/R335 source-exact calibration. It contributes zero independent empirical voting weight; future compatibility becomes empirical only when a genuinely future independent measurement is supplied with its own covariance and unchanged frozen rules.'
 });
}

export const R340_PROPAGATION_RECEIPT=Object.freeze({
 revision:'R340',stage:'R314-B06',state:'PROPAGATION_CLOSED',calibrationRelease:R340_RELEASE_ID,
 sourceHashes:Object.freeze(Object.fromEntries(R340_SOURCE_MANIFEST.map(x=>[x.id,x.sha256]))),
 consumers:R340_CALIBRATION_CONSUMERS.map(x=>x.id),sourceExactPreserved:true,noRetuning:true,
 canonicalMutation:false,canonicalAdmission:false,canonicalAdmissionAuthority:'R125'
});
