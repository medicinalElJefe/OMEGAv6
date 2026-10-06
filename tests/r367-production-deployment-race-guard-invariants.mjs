import assert from'node:assert/strict';
import fs from'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');

assert.ok(ci.includes('group: omega-canonical-production-deploy'),'R367 canonical deploy job must use one shared production concurrency group');
assert.ok(ci.includes('cancel-in-progress: false'),'R367 must serialize rather than asynchronously cancel a production mutation already in flight');
assert.ok(ci.includes('Verify this run still owns current main'),'R367 must reject a queued deployment if main has advanced');
assert.ok(ci.includes('git fetch origin main\n')&&ci.includes('current_main="$(git rev-parse origin/main)"'),'R367 current-main guard must use first-hand remote branch state without re-shallowing ancestry');
assert.ok(!ci.includes('git fetch origin main --depth=1'),'R367 current-main ownership refresh must preserve full merge ancestry for downstream lineage binding');
assert.ok(ci.includes('SUPERSEDED RELEASE'),'R367 must visibly distinguish superseded release from product failure');

assert.ok(staged.includes('assert_current_main_owner(){'),'R367 staged release must independently verify main ownership');
assert.ok((staged.match(/assert_current_main_owner/g)||[]).length>=4,'R367 staged release must verify ownership before mutation and again before promotion');
const upload=staged.indexOf('npx wrangler versions upload');
const firstGuard=staged.indexOf('assert_current_main_owner',staged.indexOf('trap cleanup EXIT'));
const localProof=staged.indexOf('node tests/r496-local-omega7-candidate-browser-e2e.mjs');
const semantic=staged.indexOf('node scripts/verify_staged_release.mjs');
const promoteGuard=staged.indexOf('assert_current_main_owner',semantic);
const normalPromote=staged.indexOf('OMEGA exact proved promotion $GITHUB_SHA',semantic);
assert.ok(firstGuard>=0&&firstGuard<localProof&&localProof<upload,'R367 must prove current-main ownership before exact packaged proof/upload mutation');
assert.ok(promoteGuard>semantic&&normalPromote>promoteGuard,'R367 normal path must re-prove current-main ownership after staged Worker proof and before 100% promotion');

assert.ok(staged.includes('release_owns_current_deployment(){'),'R367 ERR trap must verify Worker ownership before restoring a baseline');
assert.ok(staged.includes('if release_owns_current_deployment; then'),'R367 fail-closed restore must require deployment ownership');
assert.ok(staged.includes('ROLLBACK OWNERSHIP LOST'),'R367 must refuse a rollback when a foreign/newer Worker owns production');

assert.ok(ci.includes('ROLLBACK OWNERSHIP LOST: candidate='),'R367 post-promotion rollback must also verify exact candidate ownership');
assert.ok(ci.includes("serving.length!==1||serving[0].id!==candidate||serving[0].pct<99.999"),'R367 rollback authority requires the exact candidate at 100%');
assert.ok(ci.includes('Production deployment concurrency: serialized · no in-progress cancellation'),'R367 deployment receipt must report the serialization boundary');

assert.ok(ci.includes('needs: deploy-main'),'governed continuation must remain downstream of successful deployment');
assert.ok(!ci.includes('cancel-in-progress: true\n    environment: production'),'canonical production deployment must never cancel an in-flight mutation');

console.log('R367/R496 PRODUCTION RACE GUARD PASS · canonical deploy serialized · superseded main rejected · ownership proved before packaged/upload mutation and rechecked after Worker proof before normal promotion · stale/foreign rollback refused · exact candidate must own 100% before post-proof rollback');
