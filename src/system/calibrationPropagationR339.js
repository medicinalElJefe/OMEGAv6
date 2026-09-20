import {calibrationPropagationManifestR335,R335_CALIBRATION_CONSUMERS} from './calibrationPropagationR335.js';
import {calibrationManifestR339,R339_RELEASE_ID,R339_SOURCE_MANIFEST} from './ablationForecastR339.js';

export const R339_PROPAGATION_REVISION='R339';
export const R339_PROPAGATION_SCHEMA='OMEGA_CALIBRATION_FULL_SYSTEM_PROPAGATION_R339';

export const R339_CALIBRATION_CONSUMERS=Object.freeze([
 ...R335_CALIBRATION_CONSUMERS,
 {id:'ABLATION_FORECAST_RUNTIME',artifact:'src/system/ablationForecastR339.js',role:'frozen v4 ablation/round-trip/forecast/governance runtime'},
 {id:'ABLATION_FORECAST_RECEIPT',artifact:'public/canon/omega-cern-ablation-forecast-r339.json',role:'operator-readable hash/census/freeze receipt'},
 {id:'ABLATION_FORECAST_ROWS',artifact:'public/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv',role:'repository-materialized 25-row executable evidence payload'},
 {id:'R339_PROOF',artifact:'tests/r339-ablation-forecast-calibration-invariants.mjs',role:'hash/census/round-trip/ablation/forecast/no-retuning proof gate'}
]);

export function calibrationPropagationManifestR339(){
 const calibration=calibrationManifestR339(),inherited=calibrationPropagationManifestR335();
 return Object.freeze({
  schema:R339_PROPAGATION_SCHEMA,
  revision:R339_PROPAGATION_REVISION,
  calibrationRelease:R339_RELEASE_ID,
  inheritedPropagation:inherited,
  sourceCount:R339_SOURCE_MANIFEST.length,
  sources:R339_SOURCE_MANIFEST,
  consumers:R339_CALIBRATION_CONSUMERS,
  propagationState:'FULL_RELEVANT_SYSTEM_BINDING_WITH_FROZEN_FORECAST',
  sourceExactPreserved:true,
  rawExperimentalOverwrite:false,
  forecastRetuningAllowed:false,
  r170ProposalTransport:'ENGINE_WRITTEN_DEDICATED_JSON_ARTIFACT_PLUS_RAW_STDOUT_DIAGNOSTIC',
  canonicalMutation:false,
  canonicalAdmissionAuthority:'R125',
  truthBoundary:calibration.truthBoundary,
  propagationBoundary:'R339 propagates the uploaded v4 ablation/forecast evidence as a successor evidence context while retaining R334/R335 source-class and authority boundaries. Forecast evaluation is frozen before future target inspection, has zero authority to retune itself, and remains separate from empirical observation, execution authority, and R125 CanonState admission.'
 });
}

export const R339_PROPAGATION_RECEIPT=Object.freeze({
 revision:R339_PROPAGATION_REVISION,
 state:'PROPAGATION_ACTIVE',
 calibrationRelease:R339_RELEASE_ID,
 sourceHashes:Object.freeze(Object.fromEntries(R339_SOURCE_MANIFEST.map(x=>[x.id,x.sha256]))),
 consumers:R339_CALIBRATION_CONSUMERS.map(x=>x.id),
 forecastRetuningAllowed:false,
 r170ProposalTransport:'ENGINE_WRITTEN_DEDICATED_JSON_ARTIFACT_PLUS_RAW_STDOUT_DIAGNOSTIC',
 canonicalMutation:false,
 canonicalAdmission:false,
 canonicalAdmissionAuthority:'R125'
});
