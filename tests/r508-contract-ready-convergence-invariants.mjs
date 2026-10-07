import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 parseConvergenceBacklogR388,
 selectNextConvergenceItemR388,
} from '../src/system/convergenceBacklogR388.js';
import {finiteConvergencePotentialR507} from '../src/system/finiteConvergenceGovernorR507.js';

const simple=[
 '## A. Surface',
 '- [ ] first uncontracted item',
 '- [ ] second contracted item',
 '- [ ] third contracted item',
].join('\n');

const simpleSelection=selectNextConvergenceItemR388({markdown:simple});
assert.equal(simpleSelection.selected?.id,'R388-A-02','R508 must skip earlier uncontracted A-01 and select the first contract-ready item');
assert.ok(simpleSelection.heldNeedsAcceptanceContract.includes('R388-A-01'),'R508 must expose skipped uncontracted work as contract debt');
assert.equal(simpleSelection.contractReadyCount,2);
assert.equal(simpleSelection.eligibleCount,2);
assert.equal(simpleSelection.potential.mutationBudget,2);
assert.ok(simpleSelection.potential.blockers.includes('ACCEPTANCE_CONTRACT_REQUIRED'));

const markdown=fs.readFileSync('docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md','utf8');
const rows=parseConvergenceBacklogR388(markdown);
assert.equal(rows.length,155,'R508 proof must evaluate the full R388 matrix');

const e01=rows.find(row=>row.id==='R388-E-01');
assert.ok(e01,'E-01 must exist in the convergence matrix');
assert.equal(e01.selfEditable,true,'E-01 has product-source targets');
assert.equal(e01.acceptanceContract,null,'R508 invariant requires a still-uncontracted real backlog item');

const currentEpoch=selectNextConvergenceItemR388({
 markdown,
 advancedItemIds:['R388-B-02','R388-B-03','R388-B-04','R388-C-03','R388-D-05','R388-D-06'],
 heldItemIds:['R388-A-02','R388-A-03'],
});
assert.equal(currentEpoch.selected,null,'current contracted frontier must become quiescent when remaining contracted work is held/advanced');
assert.equal(currentEpoch.eligibleCount,0,'uncontracted rows must not inflate the mutation-ready count');
assert.equal(currentEpoch.potential.mutationBudget,0,'uncontracted rows must contribute zero autonomous mutation budget');
assert.ok(currentEpoch.needsAcceptanceContractCount>0,'the remaining matrix must report acceptance-contract debt');
assert.ok(currentEpoch.heldNeedsAcceptanceContract.includes('R388-E-01'),'E-01 must remain contract debt and never enter AI before qualification');
assert.ok(currentEpoch.potential.blockers.includes('ACCEPTANCE_CONTRACT_REQUIRED'));
assert.ok(currentEpoch.potential.blockers.includes('RETURNED_DECLINE_EVIDENCE'));

const finite=finiteConvergencePotentialR507({
 selfBuildState:{maxAutonomousGenerations:5,admittedSourceCapsules:['SG001','SG002','SG003','SG004','SG005']},
 retry:{allow:false,remaining:0},
 backlog:currentEpoch,
 openAutonomousCandidates:0,
});
assert.equal(finite.r388Remaining,0,'R508 contract debt must not leak into the R507 mutation potential');
assert.equal(finite.mutationBudget,0,'fixed evidence epoch must have zero mutation budget when no contract-ready work is eligible');
assert.equal(finite.terminalForCurrentEvidence,true,'zero truthful mutation budget must terminate the current autonomous epoch');

const source=fs.readFileSync('src/system/convergenceBacklogR388.js','utf8');
for(const token of [
 'contracted=selfEditable.filter(x=>Boolean(x.acceptanceContract))',
 'heldNeedsAcceptanceContract',
 'needsAcceptanceContractCount',
 "targetingRevision:'R509'",
])assert.ok(source.includes(token),`R508 scheduler source missing ${token}`);
assert.equal(source.includes('const eligible=selfEditable.filter'),false,'self-editability alone must never define autonomous eligibility again');

console.log('R508 CONTRACT-READY CONVERGENCE PASS · uncontracted objectives remain contract debt under R509 · mutation budget stays truthful');
