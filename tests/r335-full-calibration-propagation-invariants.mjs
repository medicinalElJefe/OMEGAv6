import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calibrationContextR335,R335_BINDINGS,R335_B07_PROGRESS_RECEIPT,R335_REVISION} from '../src/system/calibrationPropagationR335.js';

const context=calibrationContextR335();
assert.equal(R335_REVISION,'R335');
assert.equal(context.revision,'R335');
assert.equal(context.releaseId,'DEWEY_OMEGA_CERN_RELATIVITY_CLOSURE_2026-09-19');
assert.equal(context.canonicalMutation,false);
assert.equal(context.canonicalAdmissionAuthority,'R125');
assert.equal(context.sourceExactPreserved,true);
assert.equal(context.derivedEvidenceSeparated,true);
assert.equal(context.propagation,'READ_ONLY_CONTEXT');
assert.deepEqual(context.sourceManifest.map(x=>x.rows),[4260,4237,23,36]);
assert.deepEqual(context.sourceManifest.map(x=>x.sha256),[
 'c2a5966b0a4aa3aa2de2acd18491e2333653290eaa312058fd1dfe0f1446a18d',
 '2cfab8182563c598e86c30a18de418331c2319839f1900a03f6687c2fe01a3d2',
 '98a0ac1c820e10aef307364e1efc996e3e3167d9192bca96352cda75f57b02fb',
 '6eb08be1ba49e1dd234c1ea621ce86ddf976add16fba1fb4dbfa58b0bc317f34'
]);
assert.equal(context.sourceExact.sourceExactRows,4105);
assert.equal(context.informationFrame.distributionPreservingCorrection,'REQUIRED');
assert.equal(context.advancement.nativeAtlasReplication,'BLOCKED_EXTERNAL_NUMERICAL_INPUTS');
assert.equal(context.advancement.deweyRelativityClosure,'RESOLVED');
assert.ok(context.commonState.physicalityResidual<0);
assert.match(context.truthBoundary,/read-only evidence context/i);
assert.match(context.truthBoundary,/does not claim an official ATLAS\+CMS combination/i);

for(const required of [
 'R151_ALL_MODES_TRUTH_FUSION',
 'R152_UNIVERSAL_TRUTH_ENVELOPE',
 'R280_MODE_REALIZATION_REGISTRY',
 'R116_PUBLIC_SYSTEM_MANIFEST',
 'R314_CONVERGENCE_MASTER'
])assert.ok(R335_BINDINGS.includes(required),`missing R335 binding ${required}`);

const fusion=fs.readFileSync('src/allModesTruthFusionR151.ts','utf8');
const truth=fs.readFileSync('src/universalTruthEnvelopeR152.ts','utf8');
const modes=fs.readFileSync('src/modeRealizationRegistryR280.ts','utf8');
const worker=fs.readFileSync('src/workerR116.js','utf8');
const master=fs.readFileSync('src/convergenceMasterR314.ts','utf8');
const pkg=fs.readFileSync('package.json','utf8');
const workflow=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');

for(const [name,source] of [['R151',fusion],['R152',truth],['R280',modes]])
 assert.ok(source.includes("calibrationContextR335")&&source.includes("calibration:"),`${name} missing R335 calibration propagation`);
assert.ok(worker.includes("calibrationPropagation:calibrationContextR335()"),'R116 public system manifest missing R335 calibration propagation');
assert.ok(master.includes('R335_B07_PROGRESS_RECEIPT')&&master.includes('CALIBRATED_EXTERNAL_CONTEXT_PROPAGATES_READ_ONLY_ACROSS_SYSTEM_SYNTHESIS'),'R314 convergence master missing R335 receipt/law');
assert.ok(pkg.includes('"test:r335"'),'package missing R335 proof script');
assert.ok(workflow.includes('Prove R335 full-system calibrated data propagation'),'R241 workflow missing explicit R335 proof');
assert.equal(R335_B07_PROGRESS_RECEIPT.masterRows,4260);
assert.equal(R335_B07_PROGRESS_RECEIPT.quantitativeBridgeRows,4237);
assert.equal(R335_B07_PROGRESS_RECEIPT.closureRows,23);
assert.equal(R335_B07_PROGRESS_RECEIPT.advBridgeRows,36);
assert.equal(R335_B07_PROGRESS_RECEIPT.canonicalMutation,false);

console.log('R335 FULL-SYSTEM CALIBRATION PROPAGATION PASS · exact four-file SHA/census identity inherited from R334 · read-only calibrated context bound to R151/R152/R280/R116/R314 · source-exact vs derived evidence remains separated · native ATLAS likelihood replication gate remains open · R125 remains sole CanonState admission authority');
