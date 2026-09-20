import assert from'node:assert/strict';
import fs from'node:fs';
import{
 R339_REVISION,R339_RELEASE_ID,R339_SOURCE_MANIFEST,R339_CALIBRATION_CONSUMERS,R339_PROPAGATION_RECEIPT,
 calibrationAdvancementManifestR339
}from'../src/system/calibrationAdvancementR339.js';

const read=p=>fs.readFileSync(p,'utf8');

assert.equal(R339_REVISION,'R339');
assert.equal(R339_RELEASE_ID,'DEWEY_OMEGA_CERN_ABLATION_FORECAST_V4_2026-09-19');
assert.equal(R339_SOURCE_MANIFEST.length,2);
assert.equal(R339_PROPAGATION_RECEIPT.state,'PROPAGATION_CLOSED');
assert.equal(R339_PROPAGATION_RECEIPT.exactR334Prefix,true);
assert.equal(R339_PROPAGATION_RECEIPT.noRetuning,true);
assert.equal(R339_PROPAGATION_RECEIPT.canonicalMutation,false);
assert.equal(R339_PROPAGATION_RECEIPT.canonicalAdmission,false);
assert.equal(R339_PROPAGATION_RECEIPT.canonicalAdmissionAuthority,'R125');

const requiredConsumers=[
 'CAPABILITY_DATASET_REGISTRY','MODE_REALIZATION_REGISTRY','ALL_MODES_TRUTH_FUSION','UNIVERSAL_TRUTH_ENVELOPE',
 'RELATIVITY_RUNTIME','RELATIVITY_SURFACE','FORECAST_SURFACE','RELATIONAL_RUNTIME','WORKER_MANIFEST',
 'CONVERGENCE_MASTER','CONVERGENCE_AUDIT'
];
assert.deepEqual(R339_CALIBRATION_CONSUMERS.map(x=>x.id),requiredConsumers);
const manifest=calibrationAdvancementManifestR339();
assert.equal(manifest.consumers.length,requiredConsumers.length);
assert.equal(manifest.propagationReceipt.state,'PROPAGATION_CLOSED');
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmission,false);

const atlas=read('src/capabilityAtlasR43.ts');
for(const token of ["id:'CERN_MASTER_R339'","rows:4285,columns:68","id:'CERN_ADV_R339'","rows:25,columns:14"])assert.ok(atlas.includes(token),'R339 capability atlas missing '+token);

const modes=read('src/modeRealizationRegistryR280.ts');
for(const token of [
 "calibrationAdvancementManifestR339","'Forecast Mode':{","src/system/calibrationAdvancementR339.js",
 "tests/r339-calibration-ablation-forecast-invariants.mjs","no-retuning D² future-compatibility gate",
 "R280_CALIBRATION_ADVANCEMENT_R339"
])assert.ok(modes.includes(token),'R339 mode realization missing '+token);

const fusion=read('src/allModesTruthFusionR151.ts');
for(const token of [
 "calibrationAdvancementManifestR339","calibrationAdvancement:calibrationAdvancementManifestR339()",
 "R339_FROZEN_FORECAST_CONTEXT_IS_READ_ONLY_NO_RETUNING_AND_ZERO_EMPIRICAL_WEIGHT",
 "contribute zero independent empirical voting weight"
])assert.ok(fusion.includes(token),'R339 all-mode fusion missing '+token);

const envelope=read('src/universalTruthEnvelopeR152.ts');
for(const token of [
 "calibrationAdvancementManifestR339","calibrationAdvancement:calibrationAdvancementManifestR339()",
 "R339_PROSPECTIVE_FORECAST_IS_FROZEN_CONTEXT_NOT_OBSERVATION","no-retuning contract"
])assert.ok(envelope.includes(token),'R339 truth envelope missing '+token);

const physics=read('src/physicsRelativityRuntimeR132.ts');
assert.ok(physics.includes("import {calibratedRelativityR339}"));
assert.ok(physics.includes('calibrationAdvancement:calibratedRelativityR339()'));
assert.ok(physics.includes('R339 carries the hash-bound v4 ablation/round-trip/frozen forecast contract'));

const relational=read('src/system/proofGovernedRelationalRuntimeR334.js');
for(const token of [
 "calibratedRelativityR339","calibrationAdvancementManifestR339",
 "calibrationAdvancement:calibratedRelativityR339()","calibrationAdvancement:calibrationAdvancementManifestR339()",
 "R339 v4 ablation/forecast context is read-only and frozen against retuning"
])assert.ok(relational.includes(token),'R339 relational runtime missing '+token);

const worker=read('src/workerR116.js');
for(const token of [
 "calibrationAdvancementManifestR339","evaluateFrozenForecastR339",
 'calibrationAdvancement:calibrationAdvancementManifestR339()',
 "path==='/api/system/calibration/r339'","path==='/api/system/calibration/r339/evaluate'",
 "x-omega-forecast-contract","cannot retune the contract"
])assert.ok(worker.includes(token),'R339 worker/API integration missing '+token);

const relativityLab=read('src/RelativityLab.tsx'),forecast=read('src/ForecastSovereignPanel.tsx'),surface=read('src/RelativityForecastR339.tsx');
assert.ok(relativityLab.includes("import RelativityForecastR339")&&relativityLab.includes('<RelativityForecastR339/>'),'Relativity surface must expose R339');
assert.ok(forecast.includes("import RelativityForecastR339")&&forecast.includes('<RelativityForecastR339/>'),'Forecast surface must expose R339 separately from internal corridors');
for(const token of [
 "data-calibration-revision='R339'","data-future-observation='false'","Frozen future compatibility evaluator",
 "R339 future fL test input","R339 future covariance correlation","No parameter, transform, covariance rule, interval, or threshold may be changed"
])assert.ok(surface.includes(token),'R339 operator surface missing '+token);

const master=read('src/convergenceMasterR314.ts');
for(const token of [
 'R339_PROPAGATION_RECEIPT',
 'FROZEN_PROSPECTIVE_FORECASTS_MUST_NOT_BE_RETUNED_AFTER_TARGET_INSPECTION',
 'FUTURE_COMPATIBILITY_REQUIRES_INDEPENDENT_RESULT_COMMON_BASIS_COVARIANCE_AND_ASSUMPTION_CARRY',
 'FORECAST_COMPATIBILITY_IS_NOT_FUTURE_OBSERVATION_OR_EMPIRICAL_ADMISSION',
 'promotionReceipts:[R339_PROPAGATION_RECEIPT,R335_PROPAGATION_RECEIPT'
])assert.ok(master.includes(token),'R339 convergence master missing '+token);

const audit=read('scripts/r314-convergence-audit.mjs');
for(const token of [
 'Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv',
 'd4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410',
 '0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891',
 'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2',
 'a3677e2b5a22b37235948999ed0896defbf706d13531676e84448096231913f4',
 'R339 advancement dataset SHA mismatch','R339-CONVERGENCE-BINDING','calibratedCernAdvancement'
])assert.ok(audit.includes(token),'R339 convergence audit missing '+token);

const receipt=JSON.parse(read('public/canon/omega-cern-ablation-forecast-r339.json'));
assert.equal(receipt.revision,'R339');
assert.equal(receipt.datasets.advancedMasterV4.records,4285);
assert.equal(receipt.datasets.advancedMasterV4.inheritedPrefix.records,4260);
assert.equal(receipt.datasets.advancedMasterV4.inheritedPrefix.repositoryNormalizedSha256,'a3677e2b5a22b37235948999ed0896defbf706d13531676e84448096231913f4');
assert.equal(receipt.datasets.adv05Adv07V4.records,25);
assert.equal(receipt.forecast.noRetuning,true);
assert.equal(receipt.forecast.futureObservationUsed,false);
assert.equal(receipt.canonicalMutation,false);
assert.equal(receipt.canonicalAdmission,false);

const source=read('src/system/calibrationAdvancementR339.js');
for(const forbidden of ['canonicalMutation:true','canonicalAdmission:true','executionAuthority:true','authorizationAuthority:true'])assert.ok(!source.includes(forbidden),'R339 gained forbidden authority '+forbidden);

console.log('R339 FULL-SYSTEM PROPAGATION PASS · v4 exact prefix + 25-row advancement bound through atlas/modes/fusion/truth/relativity/forecast/relational/worker/convergence surfaces · frozen no-retuning future gate preserved · zero empirical promotion · R125 remains sole CanonState admission authority');
