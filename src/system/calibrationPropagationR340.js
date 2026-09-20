import {calibrationPropagationManifestR335} from './calibrationPropagationR335.js';
import {R340_RELEASE_ID,R340_SOURCE_MANIFEST,calibrationForecastManifestR340} from './calibrationForecastR340.js';

export const R340_PROPAGATION_SCHEMA='OMEGA_CALIBRATION_V4_FULL_SYSTEM_PROPAGATION_R340';

export const R340_CALIBRATION_CONSUMERS=Object.freeze([
 {id:'ALL_MODES_TRUTH_FUSION',artifact:'src/allModesTruthFusionR151.ts',role:'read-only v4 round-trip/ablation/forecast evidence context with no independent empirical vote'},
 {id:'UNIVERSAL_TRUTH_ENVELOPE',artifact:'src/universalTruthEnvelopeR152.ts',role:'versioned v4 prospective forecast lock and no-retuning boundary'},
 {id:'MODE_REALIZATION_REGISTRY',artifact:'src/modeRealizationRegistryR280.ts',role:'global mode evidence context without converting the forecast into independent mode execution'},
 {id:'RELATIVITY_RUNTIME',artifact:'src/physicsRelativityRuntimeR132.ts',role:'v4 round-trip, ablation and frozen forecast evidence alongside historical R334 closure'},
 {id:'RELATIVITY_SURFACE',artifact:'src/RelativityForecastR340.tsx',role:'operator-visible round-trip precision, ablation retention and prospective freeze'},
 {id:'RELATIONAL_RUNTIME',artifact:'src/system/proofGovernedRelationalRuntimeR334.js',role:'frozen forecast/no-retuning context for proof-governed FORECAST and LEDGER operators'},
 {id:'CAPABILITY_DATASET_REGISTRY',artifact:'src/capabilityAtlasR43.ts',role:'v4 source census and exact executable ADV05-ADV07 source inventory'},
 {id:'WORKER_MANIFEST',artifact:'src/workerR116.js',role:'deployed system manifest exposes v4 calibration/forecast identity'},
 {id:'CONVERGENCE_AUDIT',artifact:'scripts/r314-convergence-audit.mjs',role:'repository byte/census proof for exact v4 extension plus external full-master hash census'}
]);

export function calibrationPropagationManifestR340(){
 const inherited=calibrationPropagationManifestR335(),extension=calibrationForecastManifestR340();
 return Object.freeze({
  schema:R340_PROPAGATION_SCHEMA,
  revision:'R340',
  calibrationRelease:R340_RELEASE_ID,
  inherited,
  extension,
  sourceCount:R340_SOURCE_MANIFEST.length,
  sources:R340_SOURCE_MANIFEST,
  consumers:R340_CALIBRATION_CONSUMERS,
  propagationState:'V4_FORECAST_EXTENSION_BOUND',
  sourceExactPreserved:true,
  forecastFrozen:true,
  noRetuning:true,
  rawExperimentalOverwrite:false,
  canonicalMutation:false,
  canonicalAdmission:false,
  canonicalAdmissionAuthority:'R125',
  truthBoundary:extension.truthBoundary,
  propagationBoundary:'R340 carries the v4 numerical round-trip, ablation diagnostics, physicality retention, and frozen prospective forecast through relevant read-only OMEGA evidence surfaces. It preserves R334/R335 history, does not overwrite reported experiment evidence, does not convert forecast output into observation, does not retune after future inspection, and creates no execution or CanonState authority.'
 });
}


export const R340_PROPAGATION_RECEIPT=Object.freeze({
 revision:'R340',
 stage:'R314-B06',
 state:'V4_FORECAST_EXTENSION_BOUND',
 calibrationRelease:R340_RELEASE_ID,
 sourceHashes:Object.freeze(Object.fromEntries(R340_SOURCE_MANIFEST.map(x=>[x.id,x.sha256]))),
 forecastFrozen:true,
 noRetuning:true,
 externalEmpiricalValidation:'PENDING',
 canonicalMutation:false,
 canonicalAdmission:false,
 canonicalAdmissionAuthority:'R125'
});
