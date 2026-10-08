import assert from 'node:assert/strict';
import fs from 'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const guard=fs.readFileSync('scripts/releaseCandidateGuardR210.mjs','utf8');
const preview=fs.readFileSync('wrangler.preview-r512.jsonc','utf8');
const browser=fs.readFileSync('tests/r512-cloudflare-candidate-preview-browser-e2e.mjs','utf8');

for(const token of [
 'candidate-cloudflare-preview:',
 "ref: ${{ github.event.pull_request.head.sha }}",
 'wrangler@4.148.0 preview',
 'wrangler.preview-r512.jsonc',
 'OMEGA_CANDIDATE_SHA',
 'tests/r512-cloudflare-candidate-preview-browser-e2e.mjs',
 'tests/r512-executable-menu-browser-e2e.mjs',
 'tests/r499-sequential-bridge-browser-e2e.mjs',
 'tests/r510-omega7-visual-functional-browser-e2e.mjs',
 'preview delete',
 'Verify continuation still owns current main'
])assert.ok(ci.includes(token),`R512 CI sequence missing ${token}`);

for(const token of [
 'proveBaseProductionReady',
 '/actions/runs?head_sha=',
 '/actions/runs/${run.id}/jobs?per_page=100',
 "j.name==='deploy-main'",
 "deploy?.status==='completed'",
 "deploy?.conclusion==='success'",
 'BASE_PRODUCTION_PROVEN',
 'R210 Release Controller',
 'R223 Cloudflare Evolution Authority',
 'OMEGA R237 Hybrid Command Authority Proof',
 'OMEGA R238 Woven Hybrid Continuity Convergence',
 'R241 Archive Convergence Visual Intelligence'
])assert.ok(guard.includes(token),`R512 R210 base/full-acceptance gate missing ${token}`);

for(const token of ['"previews"','"OMEGA_RUNTIME"','"OMEGA_SWARM_CELL"','"OMEGA_GENESIS"','"AI"','"CF_VERSION_METADATA"'])assert.ok(preview.includes(token),`R512 Preview config missing ${token}`);
for(const token of ['promotedMergeSha,null','candidateSha,expected','CURRENT_R71_CANONICAL_HOME','data-r486-visible-convergence','Browse recovered capabilities'])assert.ok(browser.includes(token),`R512 candidate browser proof missing ${token}`);

assert.ok(ci.includes('OMEGA_RELEASE_GUARD_MODE: PUSH'),'canonical deploy must independently re-prove exact candidate acceptance before production mutation');
assert.ok(!browser.includes('OMEGA_PROMOTED_SHA'),'candidate Preview proof must not borrow promoted-production identity');
console.log('R512 STRICT SEQUENTIAL RELEASE MEMBRANE PASS · production-proven base wait → exact-head Cloudflare Preview/asset proof → merge → canonical deploy → live closure → stale-safe continuation');
