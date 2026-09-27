import assert from'node:assert/strict';
import fs from'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');

assert.ok(ci.includes('group: omega-canonical-production-deploy'),'R365 canonical deploy job must use one shared production concurrency group');
assert.ok(ci.includes('cancel-in-progress: false'),'R365 must serialize rather than asynchronously cancel a production mutation already in flight');
assert.ok(ci.includes('Verify this run still owns current main'),'R365 must reject a queued deployment if main has advanced');
assert.ok(ci.includes('git fetch origin main --depth=1')&&ci.includes('current_main="$(git rev-parse origin/main)"'),'R365 current-main guard must use first-hand remote branch state');
assert.ok(ci.includes('SUPERSEDED RELEASE'),'R365 must visibly distinguish superseded release from product failure');

assert.ok(staged.includes('assert_current_main_owner(){'),'R365 staged release must independently verify main ownership');
assert.ok((staged.match(/assert_current_main_owner/g)||[]).length>=4,'R365 staged release must verify ownership before mutation and again before promotion');
const upload=staged.indexOf('npx wrangler versions upload');
const firstGuard=staged.indexOf('assert_current_main_owner',staged.indexOf('trap cleanup EXIT'));
const proof=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');
const promoteGuard=staged.indexOf('assert_current_main_owner',proof);
const promote=staged.indexOf('npx wrangler versions deploy "\${CANDIDATE_VERSION_ID}@100%"',proof);
assert.ok(firstGuard>=0&&firstGuard<upload,'R365 must prove current-main ownership before candidate upload');
assert.ok(promoteGuard>proof&&promoteGuard<promote,'R365 must re-prove current-main ownership after candidate proof and before 100% promotion');

assert.ok(staged.includes('release_owns_current_deployment(){'),'R365 ERR trap must verify Worker ownership before restoring a baseline');
assert.ok(staged.includes('if release_owns_current_deployment; then'),'R365 fail-closed restore must require deployment ownership');
assert.ok(staged.includes('ROLLBACK OWNERSHIP LOST'),'R365 must refuse a rollback when a foreign/newer Worker owns production');

assert.ok(ci.includes('ROLLBACK OWNERSHIP LOST: candidate='),'R365 post-promotion rollback must also verify exact candidate ownership');
assert.ok(ci.includes("serving.length!==1||serving[0].id!==candidate||serving[0].pct<99.999"),'R365 rollback authority requires the exact candidate at 100%');
assert.ok(ci.includes('Production deployment concurrency: serialized · no in-progress cancellation'),'R365 deployment receipt must report the serialization boundary');

assert.ok(ci.includes('needs: deploy-main'),'governed continuation must remain downstream of successful deployment');
assert.ok(!ci.includes('cancel-in-progress: true\n    environment: production'),'canonical production deployment must never cancel an in-flight mutation');

console.log('R365 PRODUCTION RACE GUARD PASS · canonical deploy serialized · superseded main rejected · ownership rechecked before promotion · stale/foreign rollback refused · exact candidate must own 100% before post-proof rollback');
