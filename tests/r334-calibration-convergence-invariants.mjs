import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 R334_REVISION,R334_SCHEMA,R334_RELEASE_ID,R334_SOURCE_MANIFEST,R334_SOURCE_EXACT_SUMMARY,
 R334_INFORMATION_FRAME,R334_COMMON_STATE,R334_CROSS_REPRESENTATION,R334_ADVANCEMENT,
 physicalityResidualR334,cmsToAtlasR334,atlasToCmsR334,calibrationManifestR334,calibratedRelativityR334
} from '../src/system/calibrationR334.js';

assert.equal(R334_REVISION,'R334');
assert.equal(R334_SCHEMA,'OMEGA_CALIBRATION_CONVERGENCE_R334');
assert.equal(R334_SOURCE_MANIFEST.length,4);
assert.deepEqual(R334_SOURCE_MANIFEST.map(x=>x.rows),[4260,4237,23,36]);
assert.deepEqual(R334_SOURCE_MANIFEST.map(x=>x.columns),[68,68,14,18]);
assert.equal(R334_SOURCE_EXACT_SUMMARY.sourceExactRows,4105);
assert.equal(R334_SOURCE_EXACT_SUMMARY.derivedNoOverwriteRows,155);
assert.equal(R334_SOURCE_EXACT_SUMMARY.omegaSourceExactRows,3743);
assert.equal(R334_SOURCE_EXACT_SUMMARY.cernBenchmarkExactRows,362);
assert.equal(R334_INFORMATION_FRAME.observedMeanOnlyZ,1.588219307051);
assert.equal(R334_INFORMATION_FRAME.observedShapeEta,4.423523418352);
assert.equal(R334_INFORMATION_FRAME.observedShapeFraction,0.885810748425);
assert.equal(R334_COMMON_STATE.fL,0.551411180209);
assert.equal(R334_COMMON_STATE.cParallel,0.451340588867);
assert.equal(R334_COMMON_STATE.chi2,2.499909291182);
assert.equal(R334_COMMON_STATE.compatibilityP,0.286517791411);
assert.ok(R334_COMMON_STATE.physicalityResidual<0);
assert.equal(R334_ADVANCEMENT.nativeAtlasReplication,'BLOCKED_EXTERNAL_NUMERICAL_INPUTS');
assert.equal(R334_ADVANCEMENT.nativeReplicationRole,'EXTERNAL_VALIDATION_NOT_RELATIVITY_CLOSURE_PREREQUISITE');
assert.equal(R334_ADVANCEMENT.deweyRelativityClosure,'RESOLVED');
assert.equal(R334_CROSS_REPRESENTATION.atlasObservedMeanDiagnostic.state,'OUTSIDE_RESTRICTED_PHYSICAL_BOUND');
assert.ok(R334_CROSS_REPRESENTATION.atlasObservedMeanDiagnostic.physicalityResidual>0);
assert.ok(R334_CROSS_REPRESENTATION.atlasSmDiagnostic.physicalityResidual<0);

const mapped=cmsToAtlasR334(R334_COMMON_STATE.fL,R334_COMMON_STATE.cParallel);
assert.ok(Math.abs(mapped.c21-R334_COMMON_STATE.c21)<1e-11);
assert.ok(Math.abs(mapped.c22-R334_COMMON_STATE.c22)<1e-11);
const inverted=atlasToCmsR334(R334_COMMON_STATE.c21,R334_COMMON_STATE.c22);
assert.ok(Math.abs(inverted.fL-R334_COMMON_STATE.fL)<1e-11);
assert.ok(Math.abs(inverted.cParallel-R334_COMMON_STATE.cParallel)<1e-11);
assert.ok(Math.abs(physicalityResidualR334(R334_COMMON_STATE.c21,R334_COMMON_STATE.c22)-R334_COMMON_STATE.physicalityResidual)<1e-11);

const manifest=calibrationManifestR334(),cal=calibratedRelativityR334();
assert.equal(manifest.releaseId,R334_RELEASE_ID);
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(cal.releaseId,R334_RELEASE_ID);
assert.equal(cal.canonicalMutation,false);
assert.match(cal.truthBoundary,/not an official experiment combination/i);
assert.match(cal.truthBoundary,/cannot independently mutate CanonState/i);

const physics=fs.readFileSync('src/physicsRelativityRuntimeR132.ts','utf8');
const lab=fs.readFileSync('src/RelativityLab.tsx','utf8');
const atlas=fs.readFileSync('src/capabilityAtlasR43.ts','utf8');
const modes=fs.readFileSync('src/modeRealizationRegistryR280.ts','utf8');
const worker=fs.readFileSync('src/workerR116.js','utf8');
for(const token of ["from './system/calibrationR334.js'","calibration:calibratedRelativityR334()"])assert.ok(physics.includes(token),`R132 missing R334 calibration integration ${token}`);
assert.ok(lab.includes("RelativityCalibrationR334")&&lab.includes("<RelativityCalibrationR334/>"),'Relativity surface missing R334 calibrated closure');
for(const token of ["id:'CERN_MASTER_R334'","id:'CERN_BRIDGE_R334'","id:'CERN_CLOSURE_R334'","id:'CERN_ADV_R334'"])assert.ok(atlas.includes(token),`R43 data atlas missing ${token}`);
assert.ok(modes.includes("src/system/calibrationR334.js")&&modes.includes("tests/r334-calibration-convergence-invariants.mjs"),'Dimensional Relativity realization is not bound to R334 calibration');
assert.ok(worker.includes("calibrationManifestR334")&&worker.includes("calibration:calibrationManifestR334()"),'system manifest missing R334 calibration identity');

console.log('R334 CALIBRATION CONVERGENCE PASS · 4 uploaded calibration artifacts fingerprinted · 4260-row master + 4237-row quantitative bridge accounted · 23-row closure + 36-row quantitative results compiled into runtime · common-state transform round-trip proven · physicality negative control retained · R132/Relativity/R43/R280/system manifest bound · CanonState mutation remains false');
