import assert from 'node:assert/strict';
import fs from 'node:fs';

const r237=fs.readFileSync('.github/workflows/r237-hybrid-command-authority-proof.yml','utf8');
const r241=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
const runner=fs.readFileSync('scripts/run_r241_browser_proof.sh','utf8');

assert.ok(!r237.includes("waitUntil:'networkidle'"),'R237 browser proof must not wait for global network idle on a polling/live SPA');
assert.ok(r237.includes("waitUntil:'domcontentloaded'"),'R237 must use deterministic DOM readiness');
assert.ok(r237.includes('timeout --signal=TERM --kill-after=15s 180s'),'R237 command proof must be hard-bounded');
assert.ok(r237.includes('timeout --signal=TERM --kill-after=15s 150s'),'R243 motion proof must be hard-bounded');
assert.ok(r237.includes('timeout-minutes: 12'),'R237 local browser job needs a job-level fail-closed ceiling');

assert.ok(r241.includes('timeout-minutes: 40'),'R241 exhaustive sweep needs an explicit job ceiling');
assert.ok(r241.includes('Start one shared R241 preview server'),'R241 must start one shared preview for the sweep');
assert.ok(r241.includes("node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173"),'R241 shared preview must use the installed Vite binary directly');
assert.ok(r241.includes("echo 'OMEGA_E2E_URL=http://127.0.0.1:4173' >> \"$GITHUB_ENV\""),'R241 shared preview URL must propagate to later proof steps');
assert.ok(r241.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=480'),'R313 panel disclosure must have an explicit bounded budget');
assert.ok(r241.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=600'),'deep R286/R313 control sweeps must have an explicit bounded budget');
assert.ok(r241.includes('Stop shared R241 preview server')&&r241.includes('if: always()'),'R241 shared preview must always clean up');

assert.ok(runner.includes('reusing healthy shared preview'),'R241 runner must reuse the already healthy preview');
assert.ok(runner.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC:-300'),'R241 runner must default every child proof to a finite wall-clock budget');
assert.ok(runner.includes('timeout --signal=TERM --kill-after=15s'),'R241 runner must terminate hung children fail-closed');
assert.ok(runner.includes('R241 browser proof timeout'),'R241 timeout must produce an explicit diagnostic annotation');

console.log('R348 BROWSER PROOF RELIABILITY PASS · R237 networkidle removed · R237/R243 wall-clock bounded · R241 single shared preview · every child proof bounded · fail-closed diagnostics retained');
