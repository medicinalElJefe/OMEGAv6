import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const exists = p => fs.existsSync(new URL(`../${p}`, import.meta.url));

const wrangler = read('wrangler.jsonc');
const manifest = JSON.parse(read('public/omega-active-federation-r165.json'));
const r1532 = read('services/opticalMachineR1532.js');
const workerR116 = read('src/workerR116.js');

assert.match(wrangler, /"main":\s*"src\/workerR116\.js"/);
assert.match(wrangler, /"binding":"OMEGA_OPTICAL_MACHINE","service":"omega-optical-machine-r1532"/);
assert.match(wrangler, /"OMEGA_ACTIVE_OPTICAL_MACHINE_GENERATION":\s*"R153\.2"/);
assert.match(wrangler, /"OMEGA_ACTIVE_OPTICAL_MACHINE_AUTHORITY":\s*"SCREEN_ONLY"/);

for (const durable of ['OMEGA_RUNTIME','OMEGA_SWARM_CELL','OMEGA_SWARM_COORDINATOR','OMEGA_SWARM_BRANCH','OMEGA_SWARM_ORGAN','OMEGA_SWARM_ORGANISM','OMEGA_SWARM_AUTONOMIC']) {
  assert.ok(wrangler.includes(`"name": "${durable}"`), `missing preserved Durable Object binding ${durable}`);
}

assert.ok(workerR116.includes('OmegaRuntime'), 'R116 Worker spine lost OmegaRuntime');
assert.ok(exists('services/opticalMachineR115.js'), 'R115 lineage source removed');
assert.ok(exists('services/opticalMachineR152.js'), 'R152 lineage source removed');
assert.ok(exists('services/opticalMachineR1531.js'), 'R153.1 lineage source removed');
assert.ok(exists('services/opticalMachineR1532.js'), 'R153.2 active source missing');
assert.ok(exists('tests/r115-machine-adapters-invariants.mjs'), 'R115 proof lineage removed');
assert.ok(exists('tests/r152-optical-operational-convergence-invariants.mjs'), 'R152 proof lineage removed');
assert.ok(exists('tests/r1531-external-ai-tool-push-invariants.mjs'), 'R153.1 proof lineage removed');
assert.ok(exists('tests/r1532-adaptive-external-search-invariants.mjs'), 'R153.2 proof missing');

for (const marker of ['R153.2','SCREEN_ONLY','adaptiveCycle','canonicalMutation']) {
  assert.ok(r1532.includes(marker), `R153.2 source missing ${marker}`);
}
assert.ok(r1532.includes('PREPARED_NOT_SOLVED') || read('services/opticalMachineR152.js').includes('PREPARED_NOT_SOLVED'), 'full-wave truth boundary missing');

assert.equal(manifest.schema, 'OMEGA_ACTIVE_FEDERATION_R165');
assert.equal(manifest.revision, 'R165');
assert.equal(manifest.canonicalRuntime.workerSpine, 'src/workerR116.js');
assert.equal(manifest.activePeers.optical.service, 'omega-optical-machine-r1532');
assert.equal(manifest.activePeers.optical.generation, 'R153.2');
assert.equal(manifest.activePeers.optical.authority, 'SCREEN_ONLY');
assert.equal(manifest.activePeers.optical.adaptiveCycle, true);
assert.equal(manifest.activePeers.optical.canonicalMutation, false);
assert.equal(manifest.activePeers.optical.fullwaveExecution, false);
assert.equal(manifest.activePeers.optical.fabricationValidation, false);
assert.equal(manifest.humanTargets.livingLightVercel.sameUrlPromotionAuthorized, false);
assert.deepEqual(manifest.handoffLaw, ['PROPOSE','SCREEN','SOLVE','ADMIT']);
assert.ok(manifest.lineage.retain.some(x => x.startsWith('R115')));
assert.ok(manifest.lineage.retain.some(x => x.startsWith('R152')));
assert.ok(manifest.lineage.retain.some(x => x.startsWith('R153.2')));
assert.match(manifest.dimensionalBoundary, /not literal physical dimensions/i);
assert.match(manifest.opticalBoundary, /RCWA\/FDTD\/FEM/);

console.log('R165 active Optical convergence invariants PASS');
