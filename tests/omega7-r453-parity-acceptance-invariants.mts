import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';
import {OMEGA7_ACCEPTED_PARITY_EVIDENCE,OMEGA7_ACCEPTED_PARITY_SUMMARY,R453_ACCEPTED_RECEIPTS,acceptedParityForRoute} from '../src7/parityLedgerR453.ts';
import {OMEGA7_ACCEPTED_INHERITANCE_LEDGER,OMEGA7_ACCEPTED_INHERITANCE_SUMMARY,mayRetireOmega6SurfaceR453} from '../src7/inheritanceLedgerR453.ts';

assert.equal(OMEGA7_CAPABILITIES.length,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_EVIDENCE.length,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.total,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.functionalDesktopMobile,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.familyFailureIsolation,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.routeSpecificFailureRecovery,3,'R453 must preserve the exact distinction between family-boundary isolation and route-specific provider/device failure tests');
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.performance,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.rollback,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.fullProductParity,44);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.legacyRetired,0);
assert.equal(OMEGA7_ACCEPTED_PARITY_SUMMARY.canonicalMutation,false);

for(const row of OMEGA7_ACCEPTED_PARITY_EVIDENCE){
 assert.equal(row.functionalDesktopMobileProved,true);
 assert.equal(row.familyFailureIsolationProved,true);
 assert.equal(row.fullRoutePerformanceProved,true);
 assert.equal(row.rollbackEnvelopeProved,true);
 assert.equal(row.parityLevel,'FULL_PRODUCT_PARITY');
 assert.equal(row.legacyRetired,false);
 assert.equal(row.canonicalMutation,false);
 assert.ok(row.family);
}
for(const route of ['Workspace','Earth Now','Hybrid Link'])assert.equal(acceptedParityForRoute(route)?.routeSpecificFailureRecoveryProved,true,route+' must retain exact R447 route-specific failure evidence');
for(const route of ['Command Center','Traversal','Relativity','Forecast','Atlas','Evidence & Proof'])assert.equal(acceptedParityForRoute(route)?.routeSpecificFailureRecoveryProved,false,route+' must not inherit route-specific failure proof it never received');

assert.equal(R453_ACCEPTED_RECEIPTS.candidateHead,'e9084f885b7fd3b76273a54111e1d8d0e5e182fd');
assert.equal(R453_ACCEPTED_RECEIPTS.mergeCommit,'e2ed41ae1712a6f279cfc9862383357360a146ec');
assert.equal(R453_ACCEPTED_RECEIPTS.cloudBridgeRun,37179533741);
assert.equal(R453_ACCEPTED_RECEIPTS.cloudBridgeParityJob,111369323993);
assert.equal(R453_ACCEPTED_RECEIPTS.archiveConvergenceRun,37179533744);
assert.equal(R453_ACCEPTED_RECEIPTS.measuredP95Ms,415);
assert.equal(R453_ACCEPTED_RECEIPTS.measuredMaxRouteMs,475);
assert.ok(R453_ACCEPTED_RECEIPTS.measuredP95Ms<R453_ACCEPTED_RECEIPTS.p95BudgetMs);
assert.ok(R453_ACCEPTED_RECEIPTS.measuredMaxRouteMs<R453_ACCEPTED_RECEIPTS.routeBudgetMs);
assert.equal(R453_ACCEPTED_RECEIPTS.canonicalMutation,false);

assert.equal(OMEGA7_ACCEPTED_INHERITANCE_LEDGER.length,44);
assert.equal(OMEGA7_ACCEPTED_INHERITANCE_SUMMARY.parityProved,44);
assert.equal(OMEGA7_ACCEPTED_INHERITANCE_SUMMARY.rollbackAvailable,44);
assert.equal(OMEGA7_ACCEPTED_INHERITANCE_SUMMARY.legacyRetired,0);
assert.equal(OMEGA7_ACCEPTED_INHERITANCE_SUMMARY.eligibleForDefaultCutover,true);
assert.equal(OMEGA7_ACCEPTED_INHERITANCE_SUMMARY.canonicalMutation,false);
for(const row of OMEGA7_ACCEPTED_INHERITANCE_LEDGER){
 assert.equal(row.migration,'PARITY_PROVED');
 assert.equal(row.functionalParity,true);
 assert.equal(row.desktopProved,true);
 assert.equal(row.mobileProved,true);
 assert.equal(row.familyFailureIsolationProved,true);
 assert.equal(row.performanceProved,true);
 assert.equal(row.rollbackAvailable,true);
 assert.equal(row.legacyRetired,false);
 assert.equal(mayRetireOmega6SurfaceR453(row),false);
}

const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));
for(const token of ['OMEGA7_ACCEPTED_PARITY_SUMMARY','acceptedParityForRoute','data-r453-parity','Failure/recovery proved','family isolation','Rollback proved','OMEGA7_PARITY_SUMMARY','parityEvidenceForRoute','data-r451-parity'])assert.ok(root.includes(token),'R453 status UI must expose accepted parity and retain historical audit token '+token);
assert.equal(lock.sourceMainSha,'e472d2f23f4e3d214662d096e7d57697e9da8d15','R451 historical source identity must remain immutable');
assert.equal(lock.sourceMilestone,'R450_WITH_R449_ROLLBACK');
assert.equal(lock.parityEvidencePhase,'R451_PARITY_EVIDENCE_MATERIALIZATION');
assert.equal(lock.parityCounts.failureRecovery,3);
assert.equal(lock.parityCounts.performance,8);
assert.equal(lock.parityExpansionPhase,'R452_FULL_FAMILY_PARITY_CANDIDATE');
assert.equal(lock.parityExpansionNextWork,'R452_BROWSER_EXECUTION_MUST_PASS_BEFORE_MATERIALIZING_FULL_FAMILY_PARITY');
assert.equal(lock.acceptedParitySourceMainSha,'e2ed41ae1712a6f279cfc9862383357360a146ec');
assert.equal(lock.acceptedParitySourceMilestone,'R452_MERGED_FULL_FAMILY_PARITY');
assert.equal(lock.acceptedParityPhase,'R453_ACCEPTED_FULL_FAMILY_PARITY_RECEIPTS');
assert.equal(lock.acceptedParityCounts.functionalDesktopMobile,44);
assert.equal(lock.acceptedParityCounts.familyFailureIsolation,44);
assert.equal(lock.acceptedParityCounts.routeSpecificFailureRecovery,3);
assert.equal(lock.acceptedParityCounts.performance,44);
assert.equal(lock.acceptedParityCounts.rollback,44);
assert.equal(lock.acceptedParityCounts.fullProductParity,44);
assert.equal(lock.acceptedParityCounts.legacyRetired,0);
assert.equal(lock.acceptedParityReceipt.fullGovernedMatrix,'PASS');
assert.equal(lock.defaultProduct,'OMEGAV6_UNTIL_R454_DEFAULT_CUTOVER_PROVES_REVERSIBLE_STARTUP');
assert.equal(lock.acceptedParityNextWork,'CUT_OVER_OMEGA7_AS_DEFAULT_WITH_OMEGA6_ROLLBACK_PRESERVED_AND_PROVE_DEFAULT_STARTUP');

console.log('OMEGA7 R453 PASS · accepted R452 receipts materialized · 44/44 full product parity · family-vs-route failure evidence kept exact · 44 rollback envelopes · zero legacy retirement · default cutover eligible');
