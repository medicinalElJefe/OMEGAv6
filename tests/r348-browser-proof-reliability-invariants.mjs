import assert from 'node:assert/strict';
import fs from 'node:fs';

const r237=fs.readFileSync('.github/workflows/r237-hybrid-command-authority-proof.yml','utf8');
const r241=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
const runner=fs.readFileSync('scripts/run_r241_browser_proof.sh','utf8');
const r286ShardRunner=fs.readFileSync('scripts/run_r286_control_shards.sh','utf8');
const r313ShardRunner=fs.readFileSync('scripts/run_r313_control_shards.sh','utf8');
const r313DisclosureRunner=fs.readFileSync('scripts/run_r313_disclosure_shards.sh','utf8');
const r408Scheduler=fs.readFileSync('scripts/run_work_conserving_shards_r408.mjs','utf8');
const r408Estimator=fs.readFileSync('src/system/r408ProofWorkloadEstimator.js','utf8');
const r313Disclosure=fs.readFileSync('tests/r313-panel-disclosure-browser-e2e.mjs','utf8');
const r286Browser=fs.readFileSync('tests/r286-all-surface-no-dead-controls-browser-e2e.mjs','utf8');
const r313Browser=fs.readFileSync('tests/r313-full-control-interaction-browser-e2e.mjs','utf8');
const interactionJob=(r241.match(/  prove-r241-interactions:\n([\s\S]*?)(?=\n  prove-r241:\n)/)||[])[1]||'';

assert.ok(!r237.includes("waitUntil:'networkidle'"),'R237 browser proof must not wait for global network idle on a polling/live SPA');
assert.ok(r237.includes("waitUntil:'domcontentloaded'"),'R237 must use deterministic DOM readiness');
assert.ok(r237.includes('timeout --signal=TERM --kill-after=15s 180s'),'R237 command proof must be hard-bounded');
assert.ok(r237.includes('timeout --signal=TERM --kill-after=15s 150s'),'R243 motion proof must be hard-bounded');
assert.ok(r237.includes('timeout-minutes: 12'),'R237 local browser job needs a job-level fail-closed ceiling');

assert.ok(r241.includes('timeout-minutes: 50'),'R241 exhaustive sweep needs the evidence-calibrated 50-minute job ceiling');
assert.ok(r241.includes('Start one shared R241 preview server'),'R241 must start one shared preview for the sweep');
assert.ok(r241.includes("node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173"),'R241 shared preview must use the installed Vite binary directly');
assert.ok(r241.includes("echo 'OMEGA_E2E_URL=http://127.0.0.1:4173' >> \"$GITHUB_ENV\""),'R241 shared preview URL must propagate to later proof steps');
assert.ok(r241.includes("OMEGA_BROWSER_PROOF_TIMEOUT_SEC=1320 bash scripts/run_r241_browser_proof.sh 'R313_DISCLOSURE_SHARDS=16 R313_DISCLOSURE_MAX_PARALLEL=4 R313_DISCLOSURE_SHARD_TIMEOUT_SEC=360 bash scripts/run_r313_disclosure_shards.sh && node tests/r318-viewport-ownership-browser-e2e.mjs'"),'R313 panel disclosure must retain its proven 1320s/360s bounded partitioned 16-shard proof followed by one R318 viewport/reload proof');
assert.ok(r241.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=780'),'deep R286 control sweep must have an evidence-calibrated explicit bounded budget');
assert.ok(interactionJob,'R313 isolated blocking job must be structurally parseable');
assert.ok(interactionJob.includes('timeout-minutes: 50'),'R313 isolated interaction job must retain the evidence-calibrated 50-minute fail-closed ceiling');
assert.ok(interactionJob.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=1500'),'R313 isolated interaction parent must retain the bounded 1500s work-conserving envelope');
assert.ok(interactionJob.includes('R313_PROOF_SHARDS=16 R313_SHARD_MAX_PARALLEL=4 R313_SHARD_TIMEOUT_SEC=480'),'R313 isolated interaction job must retain 16 measured-workload shards with evidence-calibrated 480s child ceilings');
assert.ok(interactionJob.includes('Build exact candidate for interaction proof')&&interactionJob.includes('npm run build'),'isolated R313 job must build the exact candidate before browser interaction proof');
assert.ok(r241.includes('Stop shared R241 preview server')&&r241.includes('if: always()'),'R241 shared preview must always clean up');

assert.ok(r241.includes('R286_PROOF_SHARDS=8 R286_SHARD_MAX_PARALLEL=4 R286_SHARD_TIMEOUT_SEC=360'),'R286 exhaustive browser audit must retain eight deterministic shards with bounded four-worker concurrency');
assert.ok(r241.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=1500'),'R313 parent proof must retain a bounded 25-minute envelope');
assert.ok(r241.includes('R313_PROOF_SHARDS=16 R313_SHARD_MAX_PARALLEL=4 R313_SHARD_TIMEOUT_SEC=480'),'R313 safe-control sweep must retain sixteen deterministic shards and four-worker bounded concurrency');
for(const [label,wrapper,proofClass] of[
 ['R286',r286ShardRunner,'no_dead_control'],
 ['R313',r313ShardRunner,'interaction'],
 ['R313 disclosure',r313DisclosureRunner,'disclosure'],
]){
 assert.ok(wrapper.includes('run_work_conserving_shards_r408.mjs'),label+' must use the shared R408 work-conserving scheduler');
 assert.ok(wrapper.includes('R408_PROOF_CLASS='+proofClass),label+' must bind its separate workload-estimator namespace');
 assert.ok(!wrapper.includes('wave_start='),label+' must not regress to fixed wave barriers');
}
assert.ok(r408Scheduler.includes('while(next<queue.length||running.size)'),'R408 scheduler must continue until queued and active shards are both exhausted');
assert.ok(r408Scheduler.includes('running.size<maxParallel')&&r408Scheduler.includes('launch(queue[next++])'),'R408 scheduler must immediately refill available bounded capacity');
assert.ok(r408Scheduler.includes('Promise.race([...running.values()])'),'R408 scheduler must advance on the first completed child rather than wait for a whole wave');
assert.ok(r408Scheduler.includes("spawn('timeout'")&&r408Scheduler.includes("'--kill-after=15s'"),'R408 child proofs must remain hard-bounded');
assert.ok(r408Scheduler.includes('recordProofShardObservationR408'),'R408 scheduler must write observed runtimes into the scar estimator');
assert.ok(r408Scheduler.includes('results.length!==shardCount||unique.size!==shardCount'),'R408 recombination must fail closed on missing or duplicate shard identity');
assert.ok(r408Scheduler.includes('if(failed)process.exit(1)'),'R408 recombination must remain fail closed on any child failure');
assert.ok(r408Estimator.includes("['disclosure','interaction','no_dead_control']"),'R408 estimator must keep separate disclosure/interaction/no-dead-control namespaces');
assert.ok(r408Estimator.includes('history=[...(cls.history||[]),record]'),'R408 estimator must append observations instead of erasing scar/history');
assert.ok(r408Estimator.includes('R408_EWMA_ALPHA=0.35'),'R408 estimator must retain explicit bounded scar weighting');
assert.ok(r241.includes('Restore R408 interaction workload scar')&&r241.includes('Restore R408 main proof workload scar'),'R241 must restore proof-runtime scar state independently per job');
assert.ok(r241.includes('Retain R408 interaction workload scar')&&r241.includes('Retain R408 main browser workload scar'),'R241 must retain updated proof-runtime scar evidence after execution');

assert.ok(r313Disclosure.includes('partitionInteractionCasesR355')&&r313Disclosure.includes('assignedCases'),'R313 disclosure must reuse the measured 88-case workload partition rather than sequentially scanning the whole field in one browser process');
assert.ok(r313Disclosure.includes('testDetails(page,viewportName,route)')&&r313Disclosure.includes('testAriaExpanded(page,viewportName,route)'),'R313 disclosure shards must retain both strict disclosure and aria-expanded child contracts');
assert.ok(r313Browser.includes('partitionInteractionCasesR355')&&r313Browser.includes('interactionPartition[shardIndex].cases'),'R313 partition law must use deterministic measured-workload balancing over the complete profile × route address space');
assert.ok(!r313Browser.includes('profileIndex*surfaces.length+surfaceIndex)%shardCount'),'R313 must not regress to blind modulo workload partitioning');

assert.ok(runner.includes('reusing healthy shared preview'),'R241 runner must reuse the already healthy preview');
assert.ok(runner.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC:-300'),'R241 runner must default every child proof to a finite wall-clock budget');
assert.ok(runner.includes('timeout --signal=TERM --kill-after=15s'),'R241 runner must terminate hung children fail-closed');
assert.ok(runner.includes('R241 browser proof timeout'),'R241 timeout must produce an explicit diagnostic annotation');

console.log('R348 BROWSER PROOF RELIABILITY PASS · R237 networkidle removed · R237/R243 wall-clock bounded · R241 single shared preview · R286/R313 complete deterministic partitions retained · R408 work-conserving bounded scheduler refills capacity on first child completion · disclosure, interaction and no-dead-control workload scar namespaces remain separate · observations append without erasing prior history · child/parent ceilings remain fail closed · R318 still runs once after disclosure recombination · diagnostics retained');
