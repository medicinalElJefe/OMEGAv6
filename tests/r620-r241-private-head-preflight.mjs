import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workflow = readFileSync('.github/workflows/r241-archive-convergence.yml', 'utf8');
const preflight = workflow.split('  stale-head-preflight:')[1]?.split('  inherit-r241-proof:')[0];
assert.ok(preflight, 'R241 stale-head preflight must exist');
assert.match(workflow, /permissions:\\s*\\n  contents: read\\s*\\n  actions: read\\s*\\n  pull-requests: read/, 'private PR head lookup requires explicit read permission');
assert.match(preflight, /GH_TOKEN: \\$\\{\\{ github\\.token \\}\\}/, 'authenticated head lookup requires workflow token');
assert.ok(preflight.includes('gh api "repos/\${GITHUB_REPOSITORY}/pulls/\${PR_NUMBER}" --jq'), 'current PR head must be resolved through authenticated GitHub API');
assert.ok(!preflight.includes('git ls-remote'), 'private PR head preflight must not use anonymous git transport');
assert.ok(preflight.includes('if [ "$observed" = "$EVENT_HEAD_SHA" ]'), 'must still reject stale candidate heads');
console.log('R620 R241 authenticated private PR current-head preflight PASS');
