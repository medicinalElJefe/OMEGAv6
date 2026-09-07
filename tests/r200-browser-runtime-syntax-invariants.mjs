import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

for(const file of ['public/omega-operational-lifecycle-r200-core.js','public/omega-operational-lifecycle-r200.js','scripts/verify_live_operational_lifecycle_r200.mjs'])execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
const propagation=fs.readFileSync('scripts/verify_federation_live_r1681.mjs','utf8');
const live=fs.readFileSync('scripts/verify_live_operational_lifecycle_r200.mjs','utf8');
assert.ok(propagation.includes("await import('./verify_live_execution_control_r199.mjs')"),'R199 exact-promoted proof must remain in canonical post-deploy chain');
assert.ok(propagation.includes("await import('./verify_live_operational_lifecycle_r200.mjs')"),'R200 exact-promoted proof must run in canonical post-deploy chain');
assert.ok(propagation.indexOf("verify_live_execution_control_r199.mjs")<propagation.indexOf("verify_live_operational_lifecycle_r200.mjs"),'R200 live console proof must follow the R199 deployed execution-control proof');
for(const token of ['OMEGA_PROMOTED_SHA','/omega-build-receipt.json','/omega-operational-lifecycle-r200.html','/omega-operational-lifecycle-r200.js','/omega-operational-lifecycle-r200-core.js','/omega-operational-lifecycle-r200.css','/api/core-health','/api/system/operational','/api/hybrid/status','/api/execution/r147/manifest','/api/relative-capacity-r154','PRIVATE_PROOF_REQUIRED','OMEGA R200 LIVE OPERATIONAL LIFECYCLE PASS'])assert.ok(live.includes(token),`R200 live promotion proof missing ${token}`);
assert.ok(!live.includes("method:'POST'"),'R200 production acceptance probe must remain GET-only');
assert.ok(!live.includes('/api/execution/runs'),'R200 production acceptance probe must not fabricate a private session or synthetic durable run');
console.log('R200 BROWSER + PROMOTION CHAIN PASS · browser/runtime scripts parse and exact-promoted live proof is chained after R199 without a new workflow authority or synthetic private execution');
