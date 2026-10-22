import fs from 'node:fs';
import assert from 'node:assert/strict';

const manifest=JSON.parse(fs.readFileSync('public/omega-r122-computed-reality-manifest.json','utf8'));
const page=fs.readFileSync('public/r122-computed-reality.html','utf8');
const docs=fs.readFileSync('docs/OMEGA_R122_COMPUTED_REALITY_CONVERGENCE.md','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');

assert.equal(manifest.schema,'omega.computed-reality.r122.v1');
assert.equal(manifest.addressSpace.cardinality,20736);
assert.equal(manifest.computedRealityPipeline.length,21);
assert.equal(manifest.hardInvariants.length,12);
assert.equal(manifest.truthBoundary.computedPhotorealSatelliteRendererOperational,false);

for(const id of ['omega-v6','omega-genesis','omega-sovereign','omega-optical']){
  assert.ok(manifest.surfaces.some(x=>x.id===id),`missing federation surface ${id}`);
}
for(const required of [
  'no-decorative-geometry',
  'time-before-meaning',
  'deterministic-replay',
  'no-hidden-generated-scene-substitution',
  'observer-changes-projection-not-canonical-existence'
]) assert.ok(manifest.hardInvariants.includes(required),`missing invariant ${required}`);

assert.match(page,/Computed Reality/);
assert.match(page,/NOT YET PROVEN END-TO-END/);
assert.match(page,/DEVICE PROOF REQUIRED/);
assert.match(page,/no generated-scene fallback/i);
assert.match(page,/\/api\/status/);
assert.match(page,/\/api\/hybrid\/status/);
assert.match(page,/\/api\/earth\/noaa\/catalog/);

assert.match(docs,/Generated concept art is not a computed frame/);
assert.match(docs,/20,736 atlas is a complete address space/);
assert.match(docs,/PC ONLINE is never claimed without authenticated heartbeat\/device proof/);
assert.match(docs,/Every visible primitive in a claimed computed frame must have source lineage/);

// Preserve current production authority and machine-service bindings.
assert.match(wrangler,/"name": "omegav6"/);
assert.match(wrangler,/"main": "src\/workerR116\.js"/);
assert.match(wrangler,/"binding":"OMEGA_GENESIS"/);
assert.match(wrangler,/"binding":"OMEGA_GENESIS_MACHINE"/);
assert.match(wrangler,/"binding":"OMEGA_OPTICAL_MACHINE"/);

console.log('R122 computed-reality invariants: PASS');
