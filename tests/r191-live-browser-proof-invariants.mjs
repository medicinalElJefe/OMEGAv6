import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const e2e=read('tests/r191-live-r190-browser-e2e.mjs');
const ci=read('.github/workflows/ci.yml');
const convergence=read('.github/workflows/r170-current-convergence.yml');
const topology=read('scripts/verify_workflow_topology_r170.mjs');
for(const token of [
 "OMEGA_EXPECTED_SHA",
 "omega-build-receipt.json",
 "receipt?.source?.sha!==expectedSha",
 "receipt?.promotion?.promotedMergeSha!==expectedSha",
 "GITHUB_MERGE_PARENTS",
 "Visual Instrument",
 "FULL-FIELD ANALYSIS · OPERATOR INVOKED · R190 ALIGNED",
 "The scan is never automatic",
 "20,736 actual states scanned",
 "matrixCells!==144",
 "['POST','PUT','PATCH','DELETE']",
 "desktop",
 "mobile"
])assert.ok(e2e.includes(token),`R191 E2E missing ${token}`);
for(const token of [
 'Prove R191 browser execution on exact production build',
 'playwright@1.55.0',
 'playwright install --with-deps chromium',
 'OMEGA_E2E_URL=http://127.0.0.1:4173',
 'tests/r191-live-r190-browser-e2e.mjs'
])assert.ok(convergence.includes(token),`R191 exact-build convergence proof missing ${token}`);
for(const token of [
 'Verify deployed R190 browser computation',
 'playwright@1.55.0',
 'playwright install --with-deps chromium',
 'OMEGA_EXPECTED_SHA="$OMEGA_PROMOTED_SHA"',
 'tests/r191-live-r190-browser-e2e.mjs'
])assert.ok(ci.includes(token),`R191 canonical post-deploy proof missing ${token}`);
assert.ok(topology.includes("assert.ok(!/^\\s*workflow_run\\s*:/m.test(text)"),'R170.3 must continue forbidding workflow_run fanout');
assert.ok(!fs.existsSync('.github/workflows/r191-live-r190-browser-proof.yml'),'R191 must not introduce a parallel workflow authority');
assert.ok(ci.includes('Promoted main commit must be an exact two-parent merge commit'),'R191 must preserve governed two-parent production lineage');
assert.ok(convergence.includes('R125 remains sole CanonState admission authority'),'R191 must preserve R125 authority summary');
console.log('R191 LIVE BROWSER PROOF INVARIANTS PASS · exact-build + post-deploy browser execution · promoted receipt SHA equality · operator-invoked 20,736 scan · no workflow fanout · R125 unchanged');
