import assert from'node:assert/strict';
import fs from'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const live=fs.readFileSync('scripts/verify_live_execution_control_r199.mjs','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const vite=fs.readFileSync('vite.config.ts','utf8');

assert.ok(ci.includes("ref: ${{ github.sha }}"),'R366 deploy-main checkout must pin the exact workflow SHA instead of resolving the latest branch head');
assert.ok(ci.includes('Verify exact deployment checkout'),'R366 exact deployment checkout proof step missing');
assert.ok(ci.includes('checked_out_sha="$(git rev-parse HEAD)"'),'R366 must inspect the actual checked-out commit');
assert.ok(ci.includes('if [ "$checked_out_sha" != "$GITHUB_SHA" ]'),'R366 must fail closed when deployment checkout drifts from the triggering workflow SHA');
assert.ok(ci.includes('OMEGA_PROMOTED_SHA=$GITHUB_SHA'),'R366 governed release lineage must bind promoted SHA to the exact triggering merge');
assert.ok(ci.includes('Promoted main commit must be an exact two-parent merge commit'),'R366 two-parent promotion lineage boundary regressed');

assert.ok(live.includes("process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA"),'R366 live execution proof must prefer the explicitly bound promoted SHA over ambient workflow SHA');
assert.ok(!live.includes("process.env.GITHUB_SHA||process.env.OMEGA_PROMOTED_SHA"),'R366 must not let ambient GITHUB_SHA override explicit promoted-lineage authority');

assert.ok(staged.includes('OMEGA staged candidate $GITHUB_SHA'),'staged upload remains labeled by the exact workflow SHA after pinned checkout');
assert.ok(vite.includes("sha:String(process.env.GITHUB_SHA||'UNAVAILABLE')"),'packaged source receipt must remain bound to exact checked-out workflow SHA');
assert.ok(vite.includes("promotedMergeSha=String(process.env.OMEGA_PROMOTED_SHA||'').trim()||null"),'packaged receipt must retain independently bound promoted merge lineage');

console.log('R366 EXACT DEPLOY SHA PASS · deploy-main checkout pinned to github.sha · checkout drift fails closed · explicit OMEGA_PROMOTED_SHA outranks ambient workflow SHA in first-hand live proof · build receipt source/promotion lineage remain distinct');
