import assert from'node:assert/strict';
import fs from'node:fs';
import {createHash} from'node:crypto';
import {
 R340_REVISION,R340_SCHEMA,R340_RELEASE_ID,R340_SOURCE_MANIFEST,R340_SOURCE_EXACT_SUMMARY,
 R340_ROUNDTRIP,R340_ABLATION,R340_FORECAST,R340_FORECAST_REFERENCE_COVARIANCE,
 mahalanobis2R340,futureCompatibilityR340,calibrationManifestR340
}from'../src/system/calibrationR340.js';
import {R340_PROPAGATION_RECEIPT,calibrationPropagationManifestR340}from'../src/system/calibrationPropagationR340.js';

const read=p=>fs.readFileSync(p,'utf8');
const bytes=p=>fs.readFileSync(p);
const sha=b=>createHash('sha256').update(b).digest('hex');

assert.equal(R340_REVISION,'R340');
assert.equal(R340_SCHEMA,'OMEGA_ABLATION_FORECAST_CALIBRATION_R340');
assert.equal(R340_RELEASE_ID,'DEWEY_OMEGA_CERN_ABLATION_FORECAST_V4_2026-09-19');
assert.equal(R340_SOURCE_MANIFEST.length,2);
const master=R340_SOURCE_MANIFEST.find(x=>x.id==='MASTER_V4'),advance=R340_SOURCE_MANIFEST.find(x=>x.id==='ADV05_ADV07_V4');
assert.deepEqual([master.rows,master.columns,master.bytes,master.sha256],[4285,68,7938333,'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891']);
assert.deepEqual([master.repositoryNormalizedBytes,master.repositoryNormalizedSha256],[7934043,'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2']);
assert.deepEqual([advance.rows,advance.columns,advance.bytes,advance.sha256],[25,14,10312,'e4aaaae441a326d663ba1de049e91c2ee9b392096b982f7608f6d10d6096d6b9']);
assert.equal(advance.repositoryNormalizedSha256,'d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410');

const publicPath='public/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv';
const publicBytes=bytes(publicPath);
assert.equal(publicBytes.length,10282);
assert.equal(sha(publicBytes),advance.repositoryNormalizedSha256);
assert.equal(read(publicPath).trimEnd().split(/\r?\n/).length-1,25);

assert.equal(R340_SOURCE_EXACT_SUMMARY.sourceExactRows,4105);
assert.equal(R340_SOURCE_EXACT_SUMMARY.derivedNoOverwriteRows,180);
assert.equal(R340_SOURCE_EXACT_SUMMARY.postV3ProofAdvancementRows,25);
assert.deepEqual(R340_SOURCE_EXACT_SUMMARY.advancementStageCounts,{'ADV-05':18,'ADV-06':5,'ADV-07':2});

assert.ok(R340_ROUNDTRIP.pointResidual<1e-15);
assert.ok(R340_ROUNDTRIP.jacobianResidual<1e-15);
assert.ok(R340_ROUNDTRIP.covarianceResidual<1e-15);
assert.equal(R340_ABLATION.physicalityGate.result,'GATE_NECESSARY');
assert.equal(R340_ABLATION.removals.CMS_fL.result,'DOMINANT_PRECISION_ANCHOR');
assert.equal(R340_ABLATION.removals.ATLAS_C21.retain,true);
assert.equal(R340_ABLATION.removals.ATLAS_C22.retain,true);
assert.equal(R340_ABLATION.removals.CMS_CPAR.retain,true);
assert.deepEqual(R340_ABLATION.pruned,['EARLY_SCALAR_COMPRESSION']);

assert.deepEqual(R340_FORECAST.commonState.center,{fL:0.551411180209,cParallel:0.451340588867});
assert.deepEqual(R340_FORECAST.commonState.physicalTruncatedMc95.fL,[0.427006153,0.675118533]);
assert.deepEqual(R340_FORECAST.atlasProjection.center,{c21:-0.476181648882,c22:0.672883229686});
assert.equal(R340_FORECAST.negativity.median,0.528866981067);
assert.equal(R340_FORECAST.compatibility.threshold95,5.991464547108);
assert.equal(R340_FORECAST.noRetuning,true);

const center=futureCompatibilityR340(R340_FORECAST.commonState.center,[[0,0],[0,0]]);
assert.equal(center.state,'EVALUATED');assert.ok(Math.abs(center.d2)<1e-18);assert.equal(center.pass,true);
const far=futureCompatibilityR340({fL:.9,cParallel:-.9},[[0,0],[0,0]]);
assert.equal(far.state,'EVALUATED');assert.equal(far.pass,false);
const singular=mahalanobis2R340([1,1],[[1,1],[1,1]]);
assert.equal(singular.state,'HELD_INVALID_COVARIANCE');assert.equal(singular.d2,null);
assert.ok(R340_FORECAST_REFERENCE_COVARIANCE[0][0]>0&&R340_FORECAST_REFERENCE_COVARIANCE[1][1]>0);

const manifest=calibrationManifestR340(),prop=calibrationPropagationManifestR340();
assert.equal(manifest.canonicalMutation,false);assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(prop.sourceExactPreserved,true);assert.equal(prop.rawExperimentalOverwrite,false);assert.equal(prop.noRetuning,true);
assert.equal(prop.canonicalMutation,false);assert.equal(prop.canonicalAdmissionAuthority,'R125');
assert.equal(R340_PROPAGATION_RECEIPT.state,'PROPAGATION_CLOSED');
assert.equal(R340_PROPAGATION_RECEIPT.canonicalAdmission,false);
assert.match(manifest.truthBoundary,/not official experiment|not official/i);
assert.match(manifest.truthBoundary,/no-retuning/i);
assert.match(prop.propagationBoundary,/zero independent empirical voting weight/i);

const atlas=read('src/capabilityAtlasR43.ts');
for(const token of ["id:'CERN_MASTER_R340'","id:'CERN_ADV_R340'"])assert.ok(atlas.includes(token),'R43 missing '+token);
const modes=read('src/modeRealizationRegistryR280.ts');
for(const token of ['calibrationManifestR340',"calibrationAdvance:{...calibrationManifestR340(),propagationRevision:'R340'"])assert.ok(modes.includes(token),'mode registry missing '+token);
const fusion=read('src/allModesTruthFusionR151.ts');
assert.ok(fusion.includes('calibrationPropagationManifestR340'));assert.ok(fusion.includes('calibrationAdvance:calibrationPropagationManifestR340()'));assert.ok(fusion.includes('zero independent empirical voting weight'));
const truth=read('src/universalTruthEnvelopeR152.ts');
assert.ok(truth.includes('calibrationAdvance:calibrationPropagationManifestR340()'));assert.ok(truth.includes('unchanged no-retuning rule'));
const physics=read('src/physicsRelativityRuntimeR132.ts');
assert.ok(physics.includes('calibrationAdvance:calibrationManifestR340()'));
const lab=read('src/RelativityLab.tsx');
assert.ok(lab.includes('RelativityCalibrationR340')&&lab.includes('<RelativityCalibrationR340/>'));
const ui=read('src/RelativityCalibrationR340.tsx');
for(const token of ['point round-trip','CMS fL anchor','D² 95% gate','No parameter, transform, covariance rule, interval, or pass threshold may be changed'])assert.ok(ui.includes(token),'R340 UI missing '+token);
const worker=read('src/workerR116.js');
for(const token of ['calibrationAdvance:calibrationManifestR340()','calibrationAdvancePropagation:calibrationPropagationManifestR340()'])assert.ok(worker.includes(token),'worker manifest missing '+token);
const convergence=read('src/convergenceMasterR314.ts');
assert.ok(convergence.includes('R340_PROPAGATION_RECEIPT'));assert.ok(convergence.includes('promotionReceipts:[R340_PROPAGATION_RECEIPT,R335_PROPAGATION_RECEIPT'));
const audit=read('scripts/r314-convergence-audit.mjs');
for(const token of ['Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv','R340 advancement dataset SHA mismatch','r340AdvancementRecords','calibratedAblationForecast'])assert.ok(audit.includes(token),'R340 audit missing '+token);

for(const source of [read('src/system/calibrationR340.js'),read('src/system/calibrationPropagationR340.js')])
 for(const forbidden of ['canonicalMutation:true','canonicalAdmission:true','executionAuthority:true','authorizationAuthority:true'])assert.ok(!source.includes(forbidden),'R340 gained forbidden authority '+forbidden);

console.log('R340 ABLATION + FROZEN FORECAST PASS · v4 4,285×68 master hash/census bound · exact 25×14 ADV-05→ADV-07 bytes verified · 4,105 source-exact rows preserved · round-trip/covariance closure proven · ablation retains physicality and informative coordinates · prospective D²/no-retuning contract executable · all-mode/truth/relativity/UI/worker/convergence propagation bound · R125 preserved');
