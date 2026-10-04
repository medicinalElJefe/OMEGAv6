import assert from 'node:assert/strict';
import fs from 'node:fs';

const boundary=fs.readFileSync('src7/Omega7Boundary.tsx','utf8');
const failure=fs.readFileSync('tests/omega7-r447-failure-recovery-e2e.mjs','utf8');
const perf=fs.readFileSync('tests/omega7-r447-performance-e2e.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
const vite=fs.readFileSync('vite.config.ts','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

for(const token of ['Your OMEGA state was not discarded.','Retry','data-omega7-failure'])assert.ok(boundary.includes(token),'R447 failure boundary missing '+token);
for(const token of ['assets/*.js','abort','Workspace','Earth Now','PC ONLINE','DEVICE_PROOF_REQUIRED','o7-app'])assert.ok(failure.includes(token),'R447 failure/recovery proof missing '+token);
for(const token of ['ROUTE_BUDGET_MS=8000','SHELL_BUDGET_MS=4000','P95_BUDGET_MS=6000','Command Center','Earth Now','Traversal','Relativity','Forecast','Workspace','Hybrid Link','Evidence & Proof'])assert.ok(perf.includes(token),'R447 performance proof missing '+token);
assert.ok(vite.includes('R1991_ENTRY_BUDGET_BYTES=500*1024'),'R447 must preserve the 500 KiB initial-entry build budget');
assert.ok(workflow.startsWith('name: OMEGA Cloud Bridge CI')&&workflow.includes('omega7-user-parity:')&&workflow.includes('playwright@1.63.0'),'R447 must reuse the governed Cloud Bridge browser-proof job');
assert.ok(workflow.includes('omega7-r447-failure-recovery-e2e.mjs')&&workflow.includes('omega7-r447-performance-e2e.mjs'));
assert.equal(lock.parityPhase,'R447_FAILURE_RECOVERY_PERFORMANCE_CANDIDATE');
assert.equal(lock.performanceBudgets.initialEntryBytes,512000);
assert.equal(lock.performanceBudgets.shellReadyMs,4000);
assert.equal(lock.performanceBudgets.representativeRouteMs,8000);
assert.equal(lock.performanceBudgets.representativeP95Ms,6000);

console.log('OMEGA7 R447 STATIC PASS · capability failure isolation + API fail-closed recovery + shell/route performance budgets + existing 500KiB entry budget retained');
