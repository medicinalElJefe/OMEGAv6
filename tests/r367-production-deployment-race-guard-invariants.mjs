import assert from'node:assert/strict';
import fs from'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');

assert.ok(ci.includes('group: omega-canonical-production-deploy'),'R367 canonical deploy job must use one shared production concurrency group');
assert.ok(ci.includes('cancel-in-progress: false'),'R367 must serialize rather than asynchronously cancel a production mutation already in flight');
assert.ok(ci.includes('Verify this run still owns current main'),'R367 must reject a queued deployment if main has advanced');
assert.ok(ci.includes("git ls-remote origin refs/heads/main | awk 'NR==1{print $1}'"),'R367 current-main guard must use first-hand remote branch state without shallowing local merge ancestry');
assert.ok(!ci.includes('git fetch origin main --depth=1'),'R367 current-main proof must not shallow the checked-out merge before two-parent lineage binding');
assert.ok(ci.includes('SUPERSEDED RELEASE'),'R367 must visibly distinguish superseded release from product failure');

assert.ok(staged.includes('assert_current_main_owner(){'),'R367 staged release must independently verify main ownership');
assert.ok((staged.match(/assert_current_main_owner/g)||[]).length>=4,'R367 staged release must verify ownership before mutation and again before promotion');
const upload=staged.indexOf('npx wrangler versions upload');
const firstGuard=staged.indexOf('assert_current_main_owner',staged.indexOf('trap cleanup EXIT'));
const proof=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');
const promoteGuard=staged.indexOf('assert_current_main_owner',proof);
const promote=staged.indexOf('npx wrangler versions deploy "\${CANDIDATE_VERSION_ID}@100%"',proof);
assert.ok(firstGuard>=0&&firstGuard<upload,'R367 must prove current-main ownership before candidate upload');
assert.ok(promoteGuard>proof&&promoteGuard<promote,'R367 must re-prove current-main ownership after candidate proof and before 100% promotion');

assert.ok(staged.includes('release_owns_current_deployment(){'),'R367 ERR trap must verify Worker ownership before restoring a baseline');
assert.ok(staged.includes('if release_owns_current_deployment; then'),'R367 fail-closed restore must require deployment ownership');
assert.ok(staged.includes('ROLLBACK OWNERSHIP LOST'),'R367 must refuse a rollback when a foreign/newer Worker owns production');

assert.ok(ci.includes('ROLLBACK OWNERSHIP LOST: candidate='),'R367 post-promotion rollback must also verify exact candidate ownership');
assert.ok(ci.includes("serving.length!==1||serving[0].id!==candidate||serving[0].pct<99.999"),'R367 rollback authority requires the exact candidate at 100%');
assert.ok(ci.includes('Production deployment concurrency: serialized · no in-progress cancellation'),'R367 deployment receipt must report the serialization boundary');

assert.ok(ci.includes('needs: deploy-main'),'governed continuation must remain downstream of successful deployment');
assert.ok(!ci.includes('cancel-in-progress: true\n    environment: production'),'canonical production deployment must never cancel an in-flight mutation');

console.log('R367 PRODUCTION RACE GUARD PASS · canonical deploy serialized · superseded main rejected · ownership rechecked before promotion · stale/foreign rollback refused · exact candidate must own 100% before post-proof rollback');
