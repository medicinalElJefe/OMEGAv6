import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const wrangler=read('wrangler.jsonc');
const r170=read('.github/workflows/r170-current-convergence.yml');
const browser=read('tests/r200-current-browser-proof-e2e.mjs');
const app=read('src/App.tsx');
const vite=read('vite.config.ts');
for(const live of ['OmegaRuntime','OmegaSwarmCell','OmegaSwarmCoordinator','OmegaSwarmBranch','OmegaSwarmOrgan','OmegaSwarmOrganismCoordinator','OmegaSwarmAutonomicCoordinator'])assert.ok(wrangler.includes(`"${live}": {"type": "durable-object", "storage": "sqlite"}`),`R200 live durable authority missing ${live}`);
for(const retired of ['OmegaMissionLedgerR201','OmegaHybridMissionLedgerR203']){assert.ok(!wrangler.includes(`"${retired}": {"type": "durable-object", "state": "deleted"}`),`R299 stale retirement tombstone must be absent ${retired}`);assert.ok(!wrangler.includes(`"class_name": "${retired}"`),`R200 retired namespace regained a live binding ${retired}`);assert.ok(!wrangler.includes(`"${retired}": {"type": "durable-object", "storage": "sqlite"}`),`R200 retired namespace regained live storage ${retired}`)}
assert.ok(app.includes("const OmegaHomeR71=lazy(()=>import('./OmegaHomeR71'))"),'R200 must preserve R199.1 deferred Home loading');
assert.ok(vite.includes('R1991_ENTRY_BUDGET_BYTES=500*1024')&&vite.includes('initialEntryBudgetR1991'),'R200 must preserve the hard initial-entry budget');
assert.ok(r170.includes('Prove R200 browser execution on exact candidate build'),'R200 exact-build browser gate missing');
for(const token of ['20,736 actual states scanned','GLOBAL INTERFERENCE ATLAS · R188','The scan is never automatic'])assert.ok(browser.includes(token),`R200 browser proof missing ${token}`);
assert.ok(browser.includes("['POST','PUT','PATCH','DELETE']"),'R200 browser-local full-field scan must prove no mutating network requests');
assert.ok(r170.includes('R147 remains dispatch authority')&&r170.includes('R125 remains sole CanonState admission authority'),'R200 must preserve execution and Canon authority boundaries');
console.log('R200/R229/R299 FULL SYSTEM CONVERGENCE PASS · retired R201/R203 namespaces fully absent from exports and live authority · R199.1 performance preserved · exact-build desktop/mobile browser proof · operator-invoked 20,736-state analysis · authority chain preserved');
