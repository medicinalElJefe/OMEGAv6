import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';
import {OMEGA7_PARITY_EVIDENCE,OMEGA7_PARITY_SUMMARY,parityEvidenceForRoute} from '../src7/parityLedgerR451.ts';

assert.equal(OMEGA7_CAPABILITIES.length,44);
assert.equal(OMEGA7_PARITY_EVIDENCE.length,44);
assert.equal(OMEGA7_PARITY_SUMMARY.total,44);
assert.equal(OMEGA7_PARITY_SUMMARY.functionalDesktopMobile,44,'R446 proves all 44 routes on desktop/mobile built product');
assert.equal(OMEGA7_PARITY_SUMMARY.failureRecovery,3,'R447 failure/recovery evidence must remain scoped to the exact exercised routes');
assert.equal(OMEGA7_PARITY_SUMMARY.performance,8,'R447 performance evidence must remain scoped to the exact representative routes');
assert.equal(OMEGA7_PARITY_SUMMARY.fullParityEvidence,3,'only routes with interaction + failure/recovery + performance + rollback evidence may report full route evidence');
assert.equal(OMEGA7_PARITY_SUMMARY.legacyRetired,0);
assert.equal(OMEGA7_PARITY_SUMMARY.canonicalMutation,false);

for(const row of OMEGA7_PARITY_EVIDENCE){
 assert.equal(row.functionalProved,true);
 assert.equal(row.desktopProved,true);
 assert.equal(row.mobileTouchProved,true);
 assert.equal(row.rollbackEnvelopeProved,true);
 assert.equal(row.canonicalMutation,false);
 if(!row.failureRecoveryProved)assert.ok(row.remaining.includes('FAILURE_RECOVERY'));
 if(!row.performanceProved)assert.ok(row.remaining.includes('PERFORMANCE'));
}

for(const route of ['Workspace','Earth Now','Hybrid Link']){
 const row=parityEvidenceForRoute(route);
 assert.ok(row);
 assert.equal(row?.failureRecoveryProved,true,route+' must retain exact R447 failure/recovery evidence');
 assert.equal(row?.performanceProved,true,route+' is also in the R447 representative performance set');
 assert.equal(row?.parityLevel,'FULL_PARITY_EVIDENCE');
}
for(const route of ['Command Center','Traversal','Relativity','Forecast','Evidence & Proof']){
 const row=parityEvidenceForRoute(route);
 assert.equal(row?.performanceProved,true,route+' must retain R447 representative performance evidence');
 assert.equal(row?.failureRecoveryProved,false,route+' must not inherit failure proof that was never exercised');
}
assert.equal(parityEvidenceForRoute('Atlas')?.parityLevel,'INTERACTION_PROVED');

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false,'materialized parity evidence still must not silently retire OMEGAv6');

const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));
for(const token of ['OMEGA7_PARITY_SUMMARY','parityEvidenceForRoute','data-r451-parity','Routes browser-proved','Failure/recovery proved','Performance proved','Legacy retired'])assert.ok(root.includes(token),'R451 user-visible migration diagnostics missing '+token);
assert.equal(lock.sourceMainSha,'e472d2f23f4e3d214662d096e7d57697e9da8d15');
assert.equal(lock.parityPhase,'R449_ROLLBACK_REVERSIBILITY_CANDIDATE');
assert.equal(lock.parityEvidencePhase,'R451_PARITY_EVIDENCE_MATERIALIZATION');
assert.equal(lock.parityCounts.functionalDesktopMobile,44);
assert.equal(lock.parityCounts.failureRecovery,3);
assert.equal(lock.parityCounts.performance,8);
assert.equal(lock.parityCounts.legacyRetired,0);
assert.equal(lock.nextParityWork,'EXPAND_FAILURE_RECOVERY_AND_PERFORMANCE_PROOF_TO_REMAINING_ROUTES_BEFORE_ANY_LEGACY_RETIREMENT');

console.log('OMEGA7 R451 PASS · 44/44 interaction parity materialized · exact scoped failure/performance receipts · rollback envelope preserved · zero false proof inheritance · zero legacy retirement');
