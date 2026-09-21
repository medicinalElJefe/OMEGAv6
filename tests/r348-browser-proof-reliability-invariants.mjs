import assert from 'node:assert/strict';
import fs from 'node:fs';

const r237=fs.readFileSync('.github/workflows/r237-hybrid-command-authority-proof.yml','utf8');
const r241=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
const runner=fs.readFileSync('scripts/run_r241_browser_proof.sh','utf8');
const r286ShardRunner=fs.readFileSync('scripts/run_r286_control_shards.sh','utf8');
const r313ShardRunner=fs.readFileSync('scripts/run_r313_control_shards.sh','utf8');
const r286Browser=fs.readFileSync('tests/r286-all-surface-no-dead-controls-browser-e2e.mjs','utf8');
const r313Browser=fs.readFileSync('tests/r313-full-control-interaction-browser-e2e.mjs','utf8');

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

assert.ok(r241.includes('R286_PROOF_SHARDS=8 R286_SHARD_MAX_PARALLEL=4 R286_SHARD_TIMEOUT_SEC=270'),'R286 exhaustive browser audit must run as eight deterministic shards in bounded four-way waves');
assert.ok(r241.includes('R313_PROOF_SHARDS=8 R313_SHARD_MAX_PARALLEL=4 R313_SHARD_TIMEOUT_SEC=270'),'R313 safe-control sweep must run as eight deterministic shards in bounded four-way waves');
assert.ok(r286ShardRunner.includes('R286_SHARD_COUNT="$shards" R286_SHARD_INDEX="$i"'),'R286 shard runner must bind every child to an explicit partition identity');
assert.ok(r286ShardRunner.includes('for ((wave_start=0; wave_start<shards; wave_start+=max_parallel))'),'R286 shard runner must cover the complete shard set in bounded waves');
assert.ok(r286ShardRunner.includes('wait "${pids[$i]}"'),'R286 shard runner must recombine only after every child returns');
assert.ok(r313ShardRunner.includes('R313_SHARD_COUNT="$shards" R313_SHARD_INDEX="$i"'),'R313 shard runner must bind every child to an explicit partition identity');
assert.ok(r313ShardRunner.includes('for ((wave_start=0; wave_start<shards; wave_start+=max_parallel))'),'R313 shard runner must cover the complete shard set in bounded waves');
assert.ok(r313ShardRunner.includes('wait "${pids[$i]}"'),'R313 shard runner must recombine only after every child returns');
assert.ok(r286Browser.includes('profileIndex*expected.length+routeIndex'),'R286 partition law must deterministically cover profile × route address space');
assert.ok(r313Browser.includes('profileIndex*surfaces.length+surfaceIndex'),'R313 partition law must deterministically cover profile × route address space');

assert.ok(runner.includes('reusing healthy shared preview'),'R241 runner must reuse the already healthy preview');
assert.ok(runner.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC:-300'),'R241 runner must default every child proof to a finite wall-clock budget');
assert.ok(runner.includes('timeout --signal=TERM --kill-after=15s'),'R241 runner must terminate hung children fail-closed');
assert.ok(runner.includes('R241 browser proof timeout'),'R241 timeout must produce an explicit diagnostic annotation');

console.log('R348 BROWSER PROOF RELIABILITY PASS · R237 networkidle removed · R237/R243 wall-clock bounded · R241 single shared preview · R286/R313 exhaustive 88-case contracts partitioned and recombined across eight bounded shards in two four-way waves · every child proof bounded · fail-closed diagnostics retained');
