import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_R452_PARITY,OMEGA7_R452_SUMMARY,r452ParityForRoute} from '../src7/parityLedgerR452.ts';
import {OMEGA7_PARITY_SUMMARY} from '../src7/parityLedgerR451.ts';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';

assert.equal(OMEGA7_CAPABILITIES.length,44);
assert.equal(OMEGA7_R452_PARITY.length,44);
assert.equal(OMEGA7_R452_SUMMARY.total,44);
assert.equal(OMEGA7_R452_SUMMARY.recoveryFamilies,8,'R452 must prove all eight native lazy-family boundaries');
assert.equal(OMEGA7_R452_SUMMARY.familyFailureRecovery,44,'every route must inherit only its actually shared family-boundary recovery proof');
assert.equal(OMEGA7_R452_SUMMARY.performance,44,'R452 must measure all 44 routes under the existing performance budgets');
assert.equal(OMEGA7_R452_SUMMARY.fullParityEvidence,44);
assert.equal(OMEGA7_R452_SUMMARY.legacyRetired,0,'full evidence does not itself retire OMEGAv6');
assert.equal(OMEGA7_R452_SUMMARY.canonicalMutation,false);

for(const row of OMEGA7_R452_PARITY){
 assert.equal(row.interactionProved,true);
 assert.equal(row.desktopProved,true);
 assert.equal(row.mobileTouchProved,true);
 assert.equal(row.familyChunkFailureRecoveryProved,true);
 assert.equal(row.allRoutePerformanceProved,true);
 assert.equal(row.rollbackEnvelopeProved,true);
 assert.equal(row.fullParityEvidence,true);
 assert.equal(row.legacyRetired,false);
 assert.equal(row.canonicalMutation,false);
}
for(const route of ['Command Center','Earth Now','Traversal','Relativity','Forecast','Workspace','Hybrid Link','Evidence & Proof']){
 assert.ok(r452ParityForRoute(route)?.recoveryFamily);
}
assert.equal(new Set(OMEGA7_R452_PARITY.map(x=>x.legacyRoute)).size,44);
assert.equal(new Set(OMEGA7_R452_PARITY.map(x=>x.recoveryFamily)).size,8);

assert.equal(OMEGA7_PARITY_SUMMARY.failureRecovery,3,'R451 historical evidence scope must not be rewritten');
assert.equal(OMEGA7_PARITY_SUMMARY.performance,8,'R451 historical performance scope must not be rewritten');

const appState=fs.readFileSync('src7/appState.tsx','utf8');
const boundary=fs.readFileSync('src7/Omega7Boundary.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
const failure=fs.readFileSync('tests/omega7-r452-family-failure-recovery-e2e.mjs','utf8');
const perf=fs.readFileSync('tests/omega7-r452-all-route-performance-e2e.mjs','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

for(const token of ['omega7.session.v1','sessionStorage.setItem','selectedRoute'])assert.ok(appState.includes(token),'R452 recovery state persistence missing '+token);
for(const token of ['isChunkFailure','window.location.reload()','Recover'])assert.ok(boundary.includes(token),'R452 deterministic chunk recovery missing '+token);
for(const token of ['data-r452-full-parity','OMEGA7_R452_SUMMARY','Full parity evidence','Selected route recovery family'])assert.ok(root.includes(token),'R452 diagnostics missing '+token);

for(const route of ['Command Center','Earth Now','Traversal','Relativity','Forecast','Workspace','Hybrid Link','Evidence & Proof'])assert.ok(failure.includes(route),'R452 family recovery harness missing '+route);
for(const token of ['Recover','page.unroute','waitForLoadState','data-native-route'])assert.ok(failure.includes(token),'R452 one-click exact-route recovery proof missing '+token);
for(const token of ['ROUTE_BUDGET_MS=8000','SHELL_BUDGET_MS=4000','P95_BUDGET_MS=6000'])assert.ok(perf.includes(token),'R452 must preserve accepted performance budget '+token);
for(const route of OMEGA7_CAPABILITIES.map(x=>x.legacyRoute))assert.ok(perf.includes(`'${route}'`),'R452 all-route performance list missing '+route);

assert.ok(workflow.includes('omega7-r452-family-failure-recovery-e2e.mjs'));
assert.ok(workflow.includes('omega7-r452-all-route-performance-e2e.mjs'));
assert.ok(workflow.startsWith('name: OMEGA Cloud Bridge CI'),'R452 must reuse the existing governed browser-proof workflow');
assert.equal(lock.sourceMainSha,'4058ee07002dc78bba952711969afb33951a8b01');
assert.equal(lock.sourceMilestone,'R451');
assert.equal(lock.fullParityPhase,'R452_FULL_ROUTE_RESILIENCE_PERFORMANCE');
assert.equal(lock.parityPhase,'R449_ROLLBACK_REVERSIBILITY_CANDIDATE','R452 must preserve historical rollback identity');
assert.equal(lock.parityEvidencePhase,'R451_PARITY_EVIDENCE_MATERIALIZATION','R452 must preserve historical evidence-materialization identity');
assert.equal(lock.parityCounts.fullRouteEvidence,44);
assert.equal(lock.parityCounts.failureRecovery,44);
assert.equal(lock.parityCounts.performance,44);
assert.equal(lock.parityCounts.legacyRetired,0);
assert.equal(lock.nextParityWork,'BURN_IN_USER_EXPERIENCE_STABILITY_AND_REAL_PROVIDER_OBSERVATION_BEFORE_ANY_LEGACY_RETIREMENT');

console.log('OMEGA7 R452 PASS · 44/44 interaction + family recovery + route performance + rollback evidence · historical R451/R449 preserved · one-click chunk recovery · zero legacy retirement');
