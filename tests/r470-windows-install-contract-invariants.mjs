import assert from 'node:assert/strict';
import fs from 'node:fs';

const governance = fs.readFileSync('src/buildGovernance.ts','utf8');
const r386 = fs.readFileSync('docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md','utf8');

assert.match(governance,/clean Windows installer/);
assert.match(governance,/NOT RUN \/ TARGET GATE/);
assert.match(governance,/Native Windows\/OpenGL\/CUDA\/production gates remain unclaimed until executed and archived on the paired target machine/);
assert.match(r386,/Native packaging\/launcher and local renderer path converge with cloud continuity rather than forming a separate product/);

const contract = JSON.parse(fs.readFileSync('install/windows-install-contract.json','utf8'));
assert.equal(contract.platform,'windows');
assert.equal(contract.authority,'TARGET_MACHINE_PROOF_REQUIRED');
assert.equal(contract.canonicalMutation,false);
assert.deepEqual(contract.requiredSequence,[
  'PACKAGE_EXACT_CANONICAL_SHA',
  'CLEAN_INSTALL',
  'FIRST_LAUNCH',
  'RUNTIME_HEALTH',
  'STATE_PRESERVING_UPGRADE',
  'RELAUNCH',
  'UNINSTALL',
  'CLEAN_REINSTALL',
  'EXACT_VERSION_SHA_VERIFY'
]);
assert.ok(contract.receipts.every(x=>typeof x==='string' && x.length>0));
assert.equal(contract.cloudCiMayClaimInstalled,false);
console.log('R470 Windows install contract invariants: PASS');
