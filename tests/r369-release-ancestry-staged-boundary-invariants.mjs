import assert from'node:assert/strict';
import fs from'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const stagedVerifier=fs.readFileSync('scripts/verify_staged_release.mjs','utf8');
const r1681=fs.readFileSync('scripts/verify_federation_live_r1681.mjs','utf8');

const checkout=ci.indexOf('ref: ${{ github.sha }}');
const ownership=ci.indexOf('Verify this run still owns current main');
const lineage=ci.indexOf('Bind promoted merge lineage');
assert.ok(checkout>=0&&ownership>checkout&&lineage>ownership,'R369 deploy order must remain exact checkout → current-main ownership → merge-lineage binding');

const ownershipBlock=ci.slice(ownership,lineage);
assert.ok(ownershipBlock.includes("git ls-remote origin refs/heads/main | awk 'NR==1{print $1}'"),'R369 current-main ownership must query the remote without mutating local ancestry');
assert.ok(!ownershipBlock.includes('git fetch'),'R369 ownership proof must not shallow or rewrite the checked-out merge graph before parent binding');
assert.ok(!ownershipBlock.includes('git rev-parse origin/main'),'R369 must not depend on a locally mutated origin/main tracking ref');
assert.ok(ci.includes('parents="$(git show -s --format=%P "$GITHUB_SHA")"'),'R369 must retain exact merge-parent inspection');
assert.ok(ci.includes('if [ "$#" -ne 2 ]'),'R369 must fail closed unless the promoted main commit has exactly two parents');

assert.ok(staged.includes("git ls-remote origin refs/heads/main | awk 'NR==1{print $1}'"),'R369 staged release must retain non-mutating current-main ownership checks');
assert.ok(!staged.includes('git fetch origin main --depth=1'),'R369 staged release must not shallow merge ancestry');

const federationChild="env:{...childEnv,OMEGA_PROMOTED_SHA:'',OMEGA_STAGED_READ_ONLY:'1'}";
assert.ok(stagedVerifier.includes(federationChild),'R369 staged federation child must explicitly clear promoted-only SHA authority');
assert.ok((stagedVerifier.match(/OMEGA_PROMOTED_SHA:''/g)||[]).length>=2,'R369 both staged child proof paths must clear promoted-only SHA authority');
assert.ok(r1681.includes("const stagedReadOnly=String(process.env.OMEGA_STAGED_READ_ONLY||'').trim()==='1'"),'R369 R168.1 must retain explicit staged-read-only detection');
assert.ok(r1681.includes("String(process.env.OMEGA_PROMOTED_SHA||'').trim()&&!stagedReadOnly"),'R369 R199 execution-control proof must remain promoted-live only');

console.log('R369 RELEASE ANCESTRY + STAGED BOUNDARY PASS · current-main proof is non-mutating · two-parent merge ancestry remains inspectable · 0%-traffic child proofs cannot inherit promoted-only SHA authority');
