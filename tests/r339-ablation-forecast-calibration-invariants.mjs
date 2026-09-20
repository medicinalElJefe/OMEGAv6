import assert from'node:assert/strict';
import fs from'node:fs';
import crypto from'node:crypto';
import {
 R339_SOURCE_MANIFEST,R339_MASTER_CENSUS,R339_MASTER_SUFFIX_PROOF,R339_ROUNDTRIP,R339_ABLATION,R339_FORECAST,R339_GOVERNANCE,
 futureMahalanobisD2R339,evaluateFrozenForecastR339,calibrationManifestR339,calibratedForecastR339
} from'../src/system/ablationForecastR339.js';

const read=p=>fs.readFileSync(p,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').replace(/\n$/,'');

assert.equal(R339_SOURCE_MANIFEST.length,2);
const sources=Object.fromEntries(R339_SOURCE_MANIFEST.map(x=>[x.id,x]));
assert.equal(sources.MASTER_V4.rows,4285);
assert.equal(sources.MASTER_V4.columns,68);
assert.equal(sources.MASTER_V4.sha256,'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891');
assert.equal(sources.MASTER_V4.repositoryNormalizedSha256,'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2');
assert.match(sources.MASTER_V4.composition,/prefix byte identity is not asserted/i);

const p='public/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv';
const csv=read(p),lines=normalize(csv).split('\n');
assert.equal(lines.length-1,25);
assert.equal(lines[0].split(',').length,14);
assert.equal(sha(normalize(csv)),'d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410');
assert.deepEqual(sources.ADV05_ADV07_V4.stageCounts,{'ADV-05':18,'ADV-06':5,'ADV-07':2});
for(const token of ['V4-0002','V4-0012','V4-0023','V4-0043','V4-0044','V4-0051'])assert.ok(csv.includes(token),`missing R339 evidence row ${token}`);

assert.equal(R339_MASTER_CENSUS.rows,4285);
assert.equal(R339_MASTER_CENSUS.columns,68);
assert.equal(R339_MASTER_CENSUS.globalRowIdsUnique,true);
assert.equal(R339_MASTER_CENSUS.globalSequenceContiguous,true);
assert.equal(R339_MASTER_CENSUS.sourceExactPreservedRows,4105);
assert.equal(R339_MASTER_CENSUS.derivedNoOverwriteRows,180);

assert.equal(R339_MASTER_SUFFIX_PROOF.masterSuffixRows,25);
assert.equal(R339_MASTER_SUFFIX_PROOF.masterSuffixStartSequence,4261);
assert.equal(R339_MASTER_SUFFIX_PROOF.masterSuffixEndSequence,4285);
assert.equal(R339_MASTER_SUFFIX_PROOF.sourceRowOrderMatches,true);
assert.equal(R339_MASTER_SUFFIX_PROOF.classificationMatchesResult,true);
assert.equal(R339_MASTER_SUFFIX_PROOF.evidenceStatusMatchesEvidenceClass,true);
assert.match(R339_MASTER_SUFFIX_PROOF.boundary,/does not prove byte identity of the first 4,260 rows/i);

assert.ok(R339_ROUNDTRIP.inversePointResidual<1e-15);
assert.ok(R339_ROUNDTRIP.jacobianRoundTripResidual<1e-15);
assert.ok(R339_ROUNDTRIP.covarianceRoundTripResidual<1e-15);
assert.equal(R339_ABLATION.physicalityGate,'HARD_PRE_INTERPRETATION_GATE');
assert.ok(R339_ABLATION.retained.includes('CMS_fL'));
assert.ok(R339_ABLATION.pruned.includes('EARLY_SCALAR_COMPRESSION'));
assert.equal(R339_FORECAST.noRetuning,true);
assert.equal(R339_GOVERNANCE.forecastRetuningAllowed,false);
assert.equal(R339_GOVERNANCE.canonicalMutation,false);

const cov=[[0.004,0],[0,0.04]];
const d0=futureMahalanobisD2R339(R339_FORECAST.commonStateCenter,cov,R339_FORECAST.commonStateCenter,cov);
assert.ok(Math.abs(d0)<1e-14);
assert.equal(evaluateFrozenForecastR339(R339_FORECAST.commonStateCenter,cov,cov).state,'PASS');
assert.equal(evaluateFrozenForecastR339({fL:99,cParallel:99},cov,cov).state,'FAIL');

const manifest=calibrationManifestR339(),cal=calibratedForecastR339();
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(cal.forecast.noRetuning,true);
assert.match(manifest.truthBoundary,/not a guaranteed future measurement/i);
assert.match(manifest.truthBoundary,/without demoting the evaluation from predictive to descriptive/i);

const atlas=read('src/capabilityAtlasR43.ts');
for(const token of ["id:'CERN_MASTER_R339'","id:'CERN_ADV_R339'"])assert.ok(atlas.includes(token),`R43 missing ${token}`);
const fusion=read('src/allModesTruthFusionR151.ts');
for(const token of ['calibrationPropagationManifestR339','advancedCalibrationContext','R339_FROZEN_FORECAST_CONTEXT_IS_READ_ONLY_ZERO_WEIGHT_AND_NO_RETUNING'])assert.ok(fusion.includes(token),`all-modes truth fusion missing ${token}`);
const envelope=read('src/universalTruthEnvelopeR152.ts');
for(const token of ['calibrationPropagationManifestR339','advancedCalibrationContext','R339_FROZEN_FORECAST_IS_PROSPECTIVE_CONTEXT_NOT_OBSERVATION_AND_CANNOT_BE_RETUNED'])assert.ok(envelope.includes(token),`universal truth envelope missing ${token}`);

const modes=read('src/modeRealizationRegistryR280.ts');
for(const token of ['calibrationManifestR339','advancedCalibrationContext','ABLATION_FORECAST_EVIDENCE_CONTEXT_ONLY'])assert.ok(modes.includes(token),`mode propagation missing ${token}`);
const physics=read('src/physicsRelativityRuntimeR132.ts');
for(const token of ['calibratedForecastR339','advancedCalibration:calibratedForecastR339()'])assert.ok(physics.includes(token),`relativity runtime missing ${token}`);

const ui=read('src/RelativityCalibrationR334.tsx');
for(const token of ['calibratedForecastR339','Forecast fL*','D² gate','Retuning'])assert.ok(ui.includes(token),`relativity surface missing ${token}`);
const convergence=read('src/convergenceMasterR314.ts');
for(const token of ['R339_PROPAGATION_RECEIPT','FROZEN_FORECAST_PARAMETERS_AND_THRESHOLD_MUST_NOT_BE_RETUNED_AFTER_TARGET_INSPECTION'])assert.ok(convergence.includes(token),`convergence master missing ${token}`);
const audit=read('scripts/r314-convergence-audit.mjs');
for(const token of ['r339AdvancementRecords','calibratedAblationForecast','R339-CONVERGENCE-BINDING','d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410'])assert.ok(audit.includes(token),`convergence audit missing ${token}`);

const propagation=read('src/system/calibrationPropagationR339.js');
for(const token of ['OMEGA_CALIBRATION_FULL_SYSTEM_PROPAGATION_R339','FULL_RELEVANT_SYSTEM_BINDING_WITH_FROZEN_FORECAST','ENGINE_WRITTEN_DEDICATED_JSON_ARTIFACT_PLUS_RAW_STDOUT_DIAGNOSTIC','forecastRetuningAllowed:false'])assert.ok(propagation.includes(token),`R339 propagation missing ${token}`);
const worker=read('src/workerR116.js');
for(const token of ['calibrationManifestR339','calibrationPropagationManifestR339','advancedCalibration:calibrationManifestR339()','advancedCalibrationPropagation:calibrationPropagationManifestR339()'])assert.ok(worker.includes(token),`deployed system manifest missing ${token}`);

const relational=read('src/system/proofGovernedRelationalRuntimeR334.js');
for(const token of ['calibratedForecastR339','calibrationManifestR339','advancedCalibration'])assert.ok(relational.includes(token),`proof-governed relational runtime missing ${token}`);
const receipt=JSON.parse(read('public/canon/omega-cern-ablation-forecast-r339.json'));
assert.equal(receipt.revision,'R339');
assert.equal(receipt.datasets.advancedMasterV4.records,4285);
assert.equal(receipt.datasets.adv05Adv07V4.records,25);
assert.equal(receipt.canonicalAdmission,false);

console.log('R339 ABLATION + FROZEN FORECAST PASS · 4285x68 v4 master fingerprint bound · exact 25x14 ADV05-ADV07 evidence materialized · round-trip residuals machine-small · physicality gate retained · ablation importance explicit · forecast/no-retuning contract frozen · UI/modes/atlas propagated · CanonState mutation false');
