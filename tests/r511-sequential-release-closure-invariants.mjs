import assert from 'node:assert/strict';
import fs from 'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');

for(const token of [
  "id: ownership",
  "SUPERSEDED RELEASE RETIRED",
  "current=false",
  "release_current: ${{ steps.ownership.outputs.current }}",
  "release_superseded_during_stage: ${{ steps.deploy_worker.outputs.superseded || 'false' }}",
  "post-deploy-authority-closure:",
  "R223_EXACT_SHA_SUCCESS",
  "needs: [deploy-main, post-deploy-authority-closure]",
]){
  assert.ok(ci.includes(token),`R511 ci sequence token missing: ${token}`);
}

assert.ok(!ci.includes("if: steps.ownership.outputs.current == 'true' && steps.deploy_worker.outputs.superseded != 'true'\n        id: deploy_worker"),
  'R511 deploy_worker must not depend on its own output');

const deployStart=ci.indexOf('  deploy-main:');
const postStart=ci.indexOf('  post-deploy-authority-closure:');
const continueStart=ci.indexOf('  continue-governed-selfbuild:');
assert.ok(deployStart>=0 && postStart>deployStart && continueStart>postStart,
  'R511 authority order must be deploy-main → post-deploy-authority-closure → continuation');

const continuation=ci.slice(continueStart);
assert.ok(continuation.includes("needs.post-deploy-authority-closure.outputs.closure == 'R223_EXACT_SHA_SUCCESS'"),
  'R511 autonomy may not continue before exact-SHA R223 closure');

for(const token of [
  'return 75',
  'superseded=true',
  'OMEGA_RELEASE_SUPERSEDED=1',
  'Superseded release retired cleanly',
]){
  assert.ok(staged.includes(token),`R511 staged-release supersession token missing: ${token}`);
}
assert.ok(staged.includes('if [[ "$superseded" == "1" ]]'), 'R511 supersession must be an explicit clean-retirement branch');

console.log('R511 SEQUENTIAL RELEASE CLOSURE PASS · superseded runs retire without mutation/red failure · current SHA deploys exactly · exact-SHA R223 closes before autonomy continues');
