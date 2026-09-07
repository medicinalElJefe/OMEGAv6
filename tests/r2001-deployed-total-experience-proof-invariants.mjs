import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const ci=read('.github/workflows/ci.yml');
const browser=read('tests/r200-current-browser-proof-e2e.mjs');
const residual=JSON.parse(read('public/omega-r164-development-residual-graph.json'));

assert.ok(ci.includes('Verify deployed R200 total-experience browser on exact promoted SHA'),'R200.1 deployed browser proof step missing');
assert.ok(ci.includes('OMEGA_E2E_URL="$OMEGA_PUBLIC_URL" OMEGA_EXPECTED_SHA="$OMEGA_PROMOTED_SHA" node tests/r200-current-browser-proof-e2e.mjs'),'R200.1 deployed browser proof is not bound to the canonical public URL and exact promoted SHA');
assert.ok(ci.indexOf('Verify deployed R200 total-experience browser on exact promoted SHA')>ci.indexOf('Verify live route-before-generation and AI synthesis'),'R200.1 browser proof must run only after inherited live runtime/AI verification');
assert.ok(ci.indexOf('Verify deployed R200 total-experience browser on exact promoted SHA')<ci.indexOf('Record deployment receipt'),'R200.1 browser proof must complete before the deployment receipt is recorded');
for(const token of ['omega-build-receipt.json','promotion.promotedMergeSha','GITHUB_MERGE_PARENTS','20,736 actual states scanned','matrixCells!==144'])assert.ok(browser.includes(token),`R200.1 inherited exact-build browser truth token missing: ${token}`);
assert.equal(residual.canonicalAdmissionAuthority,'R125');
assert.equal(residual.returnProofAuthority,'R141');
assert.equal(residual.canonicalMutation,false);
assert.equal(residual.autonomousMutationAuthority,false);
assert.ok(String(residual.truthBoundary).includes('does not claim a current PC heartbeat'));
assert.ok(String(residual.truthBoundary).includes('solver validity'));
console.log('R200.1 DEPLOYED TOTAL-EXPERIENCE PROOF INVARIANTS PASS · exact promoted SHA + public browser proof · no new runtime/PC/solver/Canon authority');
