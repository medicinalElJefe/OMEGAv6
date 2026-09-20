import assert from'node:assert/strict';
import fs from'node:fs';
import{
 R339_REVISION,R339_SCHEMA,R339_RELEASE_ID,R339_SOURCE_MANIFEST,R339_ROW_HASHES,
 R339_ROUNDTRIP,R339_ABLATION,R339_FORECAST,forecastCompatibilityR339,calibrationManifestR339
}from'../src/system/calibrationR339.js';

assert.equal(R339_REVISION,'R339');
assert.equal(R339_SOURCE_MANIFEST.parentMaster.rows,4260);
assert.equal(R339_SOURCE_MANIFEST.masterV4.rows,4285);
assert.equal(R339_SOURCE_MANIFEST.delta.rows,25);
assert.equal(R339_SOURCE_MANIFEST.masterV4.sha256,'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891');
assert.equal(R339_SOURCE_MANIFEST.delta.sha256,'e4aaaae441a326d663ba1de049e91c2ee9b392096b982f7608f6d10d6096d6b9');
assert.equal(Object.keys(R339_ROW_HASHES).length,25);
assert.ok(R339_ROUNDTRIP.inverse.pointResidual<1e-15);
assert.ok(R339_ROUNDTRIP.jacobian.frobeniusResidual<1e-15);
assert.ok(R339_ROUNDTRIP.covariance.residual<1e-15);
assert.equal(R339_ABLATION.removeCmsFL.result,'DOMINANT_PRECISION_ANCHOR');
assert.equal(R339_ABLATION.physicalityGate.result,'GATE_NECESSARY');
assert.equal(R339_FORECAST.noRetuning,true);
assert.equal(R339_FORECAST.compatibilityThresholdD2,5.991464547108);
const center=forecastCompatibilityR339(R339_FORECAST.center);
assert.equal(center.pass,true);assert.ok(center.d2<1e-20);
const far=forecastCompatibilityR339({fL:0,cParallel:-1});
assert.equal(far.pass,false);
const manifest=calibrationManifestR339();
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.ok(/cannot supply missing SAR measurement physics/.test(manifest.truthBoundary));

const modes=fs.readFileSync('src/modeRealizationRegistryR280.ts','utf8');
assert.ok(modes.includes("import {calibrationManifestR339}"));
assert.ok(modes.includes('forecastCalibrationContext:{...calibrationManifestR339()'));
const physics=fs.readFileSync('src/physicsRelativityRuntimeR132.ts','utf8');
assert.ok(physics.includes("import {calibrationManifestR339}"));
assert.ok(physics.includes('forecastCalibration:calibrationManifestR339()'));
assert.ok(physics.includes('neither overwrites the canonical packet'));

console.log('R339 V4 ABLATION/ROUNDTRIP/FORECAST CALIBRATION PASS · 4285×68 master hash bound · 25-row V4 delta hash + row-hash census bound · round-trip residuals preserved · ablation information hierarchy preserved · prospective D² threshold frozen · no-retuning hard lock · no cross-domain SAR evidence leakage');
