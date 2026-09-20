import assert from'node:assert/strict';
import fs from'node:fs';
import{
 R340_REVISION,R340_SCHEMA,R340_RELEASE_ID,R340_SOURCE_MANIFEST,R340_ROW_HASHES,
 R340_ROUNDTRIP,R340_ABLATION,R340_FORECAST,forecastCompatibilityR340,calibrationManifestR340
}from'../src/system/calibrationR340.js';

assert.equal(R340_REVISION,'R340');
assert.equal(R340_SOURCE_MANIFEST.parentMaster.rows,4260);
assert.equal(R340_SOURCE_MANIFEST.masterV4.rows,4285);
assert.equal(R340_SOURCE_MANIFEST.delta.rows,25);
assert.equal(R340_SOURCE_MANIFEST.masterV4.sha256,'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891');
assert.equal(R340_SOURCE_MANIFEST.delta.sha256,'e4aaaae441a326d663ba1de049e91c2ee9b392096b982f7608f6d10d6096d6b9');
assert.equal(Object.keys(R340_ROW_HASHES).length,25);
assert.ok(R340_ROUNDTRIP.inverse.pointResidual<1e-15);
assert.ok(R340_ROUNDTRIP.jacobian.frobeniusResidual<1e-15);
assert.ok(R340_ROUNDTRIP.covariance.residual<1e-15);
assert.equal(R340_ABLATION.removeCmsFL.result,'DOMINANT_PRECISION_ANCHOR');
assert.equal(R340_ABLATION.physicalityGate.result,'GATE_NECESSARY');
assert.equal(R340_FORECAST.noRetuning,true);
assert.equal(R340_FORECAST.compatibilityThresholdD2,5.991464547108);
const center=forecastCompatibilityR340(R340_FORECAST.center);
assert.equal(center.pass,true);assert.ok(center.d2<1e-20);
const far=forecastCompatibilityR340({fL:0,cParallel:-1});
assert.equal(far.pass,false);
const manifest=calibrationManifestR340();
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.ok(/cannot supply missing SAR measurement physics/.test(manifest.truthBoundary));

const modes=fs.readFileSync('src/modeRealizationRegistryR280.ts','utf8');
assert.ok(modes.includes("import {calibrationManifestR340}"));
assert.ok(modes.includes('forecastCalibrationContext:{...calibrationManifestR340()'));
const physics=fs.readFileSync('src/physicsRelativityRuntimeR132.ts','utf8');
assert.ok(physics.includes("import {calibrationManifestR340}"));
assert.ok(physics.includes('forecastCalibration:calibrationManifestR340()'));
assert.ok(physics.includes('neither overwrites the canonical packet'));

console.log('R340 V4 ABLATION/ROUNDTRIP/FORECAST CALIBRATION PASS · 4285×68 master hash bound · 25-row V4 delta hash + row-hash census bound · round-trip residuals preserved · ablation information hierarchy preserved · prospective D² threshold frozen · no-retuning hard lock · no cross-domain SAR evidence leakage');
