import assert from'node:assert/strict';
import fs from'node:fs';
import crypto from'node:crypto';
import{
 R340_REVISION,R340_SCHEMA,R340_RELEASE_ID,R340_SOURCE_MANIFEST,R340_TRANSPORT_NORMALIZATION,
 R340_ROUNDTRIP_PROOF,R340_ABLATION,R340_FORECAST,physicalityGateR340,forecastCompatibilityR340,calibrationForecastManifestR340
}from'../src/system/calibrationForecastR340.js';
import{calibrationPropagationManifestR340,R340_PROPAGATION_RECEIPT}from'../src/system/calibrationPropagationR340.js';

const read=p=>fs.readFileSync(p,'utf8');
const norm=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n').replace(/\n$/,'');
const sha=s=>crypto.createHash('sha256').update(Buffer.from(s,'utf8')).digest('hex');
const exactPath='public/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv';
const exact=norm(read(exactPath));

assert.equal(R340_REVISION,'R340');
assert.equal(R340_SCHEMA,'OMEGA_CALIBRATION_V4_ABLATION_FORECAST_R340');
assert.equal(R340_RELEASE_ID,'DEWEY_OMEGA_CERN_ABLATION_ROUNDTRIP_FORECAST_V4_2026-09-19');
assert.equal(R340_TRANSPORT_NORMALIZATION,'UTF8_BOM_REMOVED_CRLF_TO_LF_FINAL_EOL_REMOVED_VALUES_UNCHANGED');
assert.equal(R340_SOURCE_MANIFEST.length,2);
const sources=Object.fromEntries(R340_SOURCE_MANIFEST.map(x=>[x.id,x]));
assert.deepEqual([sources.MASTER_V4.rows,sources.MASTER_V4.columns,sources.MASTER_V4.bytes],[4285,68,7938333]);
assert.equal(sources.MASTER_V4.sha256,'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891');
assert.equal(sources.MASTER_V4.repositoryNormalizedSha256,'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2');
assert.equal(sources.MASTER_V4.runtimePayload,'MANIFEST_ONLY');
assert.match(sources.MASTER_V4.composition,/3,743 OMEGA source-exact.*25 ablation\/round-trip\/forecast.*23 relativity closure/i);
assert.match(sources.MASTER_V4.extensionLayerIdentity,/25\/25 origin_record_id rows match/i);
assert.equal(sources.ADV05_ADV07_V4.rows,25);
assert.equal(sources.ADV05_ADV07_V4.columns,14);
assert.equal(sha(exact),'d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410');
assert.equal(exact.split('\n').length-1,25);
assert.equal(Buffer.byteLength(exact),10282);

assert.ok(R340_ROUNDTRIP_PROOF.inversePointResidual<1e-15);
assert.ok(R340_ROUNDTRIP_PROOF.jacobianResidual<1e-15);
assert.ok(R340_ROUNDTRIP_PROOF.covarianceResidual<1e-15);
assert.equal(R340_ROUNDTRIP_PROOF.result,'ROUNDTRIP_MACHINE_PRECISION_PASS');

const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
near(R340_ABLATION.joint.areaProxy,0.01971004271690502,1e-15);
near(R340_ABLATION.variants.REMOVE_ATLAS_C21.areaIncreaseVsJointPct,46.14767592465658,1e-12);
near(R340_ABLATION.variants.REMOVE_ATLAS_C22.areaIncreaseVsJointPct,2.229207888473428,1e-12);
near(R340_ABLATION.variants.REMOVE_CMS_FL.areaIncreaseVsJointPct,382.7099629277001,1e-12);
near(R340_ABLATION.variants.REMOVE_CMS_CPAR.areaIncreaseVsJointPct,37.27517008480727,1e-12);
near(R340_ABLATION.variants.CMS_ONLY.jointReductionPctVsVariant,33.19651503024619,1e-12);
near(R340_ABLATION.variants.REMOVE_ATLAS_C21.jointReductionPctVsVariant,31.57605869042151,1e-12);
near(R340_ABLATION.variants.REMOVE_ATLAS_C22.jointReductionPctVsVariant,2.180597829639229,1e-12);
near(R340_ABLATION.variants.REMOVE_CMS_FL.jointReductionPctVsVariant,79.28362626006583,1e-12);
near(R340_ABLATION.variants.REMOVE_CMS_CPAR.jointReductionPctVsVariant,27.15361420552532,1e-12);
assert.equal(R340_ABLATION.summaries.cmsFL,'DOMINANT_PRECISION_ANCHOR');
assert.equal(R340_ABLATION.summaries.atlasC22,'LOWER_INCREMENTAL_INFORMATION_NOT_PHYSICALLY_DISPENSABLE');
assert.equal(R340_ABLATION.physicalityGate.state,'GATE_NECESSARY');
assert.equal(R340_ABLATION.variants.ATLAS_ONLY_UNCONSTRAINED.physical,false);
assert.ok(!physicalityGateR340(0.946665284,1.489527994).admitted);
assert.ok(physicalityGateR340(R340_FORECAST.state.fL,R340_FORECAST.state.cParallel).admitted);

near(R340_FORECAST.state.fL,0.551411180209,1e-15);
near(R340_FORECAST.state.cParallel,0.451340588867,1e-15);
assert.deepEqual(R340_FORECAST.state.fL95,[0.427006153,0.675118533]);
assert.deepEqual(R340_FORECAST.state.cParallel95,[-0.165071802,0.927786963]);
assert.deepEqual(R340_FORECAST.atlasProjection.c21_95,[-0.969909731,0.173402373]);
assert.deepEqual(R340_FORECAST.atlasProjection.c22_95,[0.487322201,0.859490771]);
near(R340_FORECAST.modelInvariant.negativityMedian,0.528866981067,1e-15);
assert.equal(R340_FORECAST.modelInvariant.pNegativityPositiveApprox,1);
near(R340_FORECAST.compatibility.threshold,5.991464547108,1e-15);
assert.equal(R340_FORECAST.governance.noRetuning,true);
assert.equal(R340_FORECAST.governance.violationEffect,'DEMOTE_PREDICTIVE_RESULT_TO_DESCRIPTIVE');
assert.equal(R340_FORECAST.nextParent,'V4_FROZEN_STATE_PLUS_FORECAST_CONTRACT');

const centered=forecastCompatibilityR340({fL:R340_FORECAST.state.fL,cParallel:R340_FORECAST.state.cParallel,covariance:[[0,0],[0,0]]});
assert.equal(centered.state,'EVALUATED_FROZEN_RULE');near(centered.d2,0,1e-15);assert.equal(centered.pass,true);assert.equal(centered.retuned,false);
const manifest=calibrationForecastManifestR340(),prop=calibrationPropagationManifestR340();
assert.equal(manifest.canonicalMutation,false);assert.equal(manifest.canonicalAdmission,false);
assert.equal(manifest.externalEmpiricalStatus,'FUTURE_VALIDATION_PENDING');
assert.match(manifest.truthBoundary,/not an official ATLAS\/CMS combination/i);
assert.equal(prop.forecastFrozen,true);assert.equal(prop.noRetuning,true);assert.equal(prop.canonicalMutation,false);
assert.equal(R340_PROPAGATION_RECEIPT.forecastFrozen,true);assert.equal(R340_PROPAGATION_RECEIPT.noRetuning,true);

const files={
 lab:read('src/RelativityLab.tsx'),
 physics:read('src/physicsRelativityRuntimeR132.ts'),
 relation:read('src/system/proofGovernedRelationalRuntimeR334.js'),
 modes:read('src/modeRealizationRegistryR280.ts'),
 worker:read('src/workerR116.js'),
 fusion:read('src/allModesTruthFusionR151.ts'),
 envelope:read('src/universalTruthEnvelopeR152.ts'),
 atlas:read('src/capabilityAtlasR43.ts'),
 master:read('src/convergenceMasterR314.ts'),
 audit:read('scripts/r314-convergence-audit.mjs')
};
assert.ok(files.lab.includes('RelativityForecastR340')&&files.lab.includes('<RelativityForecastR340/>'));
for(const source of [files.physics,files.relation,files.modes,files.worker,files.fusion,files.envelope])assert.ok(source.includes('R340')||source.includes('calibrationForecast'), 'R340 propagation missing from a runtime surface');
for(const token of ['CERN_MASTER_V4_R340','CERN_ADV05_ADV07_R340'])assert.ok(files.atlas.includes(token));
assert.ok(files.master.includes('R340_PROPAGATION_RECEIPT,R335_PROPAGATION_RECEIPT,R334_B06_PROGRESS_RECEIPT'));
for(const token of ['Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv','d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410','0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891','e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2','R340_PROPAGATION_RECEIPT'])assert.ok(files.audit.includes(token),`R340 convergence audit missing ${token}`);
for(const source of [read('src/system/calibrationForecastR340.js'),read('src/system/calibrationPropagationR340.js')])assert.ok(!source.includes('canonicalAdmission:true'),'R340 modules may not create CanonState admission authority');

console.log('R340 V4 ABLATION + ROUND-TRIP + FORECAST PASS · exact 25-row extension bytes normalized and hashed · full 4,285-row master externally hash/census bound · machine-precision round trip · ablation retention quantified · physicality gate retained · prospective D² rule and no-retuning lock frozen · propagated read-only across OMEGA · R125 CanonState authority preserved');
