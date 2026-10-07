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

const d02=rows.find(row=>row.id==='R388-D-02');
assert.ok(d02,'D-02 must exist in the convergence matrix');
assert.equal(d02.selfEditable,true,'D-02 has product-source targets');
assert.equal(d02.acceptanceContract,null,'D-02 currently has no explicit acceptance contract');

const currentEpoch=selectNextConvergenceItemR388({
 markdown,
 advancedItemIds:['R388-B-02','R388-B-03','R388-C-03'],
 heldItemIds:['R388-A-02','R388-A-03'],
 heldItemEvidence:[{itemId:'R388-B-04',acceptanceContractRevision:'R509',state:'SYNTHETIC_R508_ZERO_READY_FIXTURE'}],
});
assert.equal(currentEpoch.selected,null,'current contracted frontier must become quiescent when remaining contracted work is held/advanced');
assert.equal(currentEpoch.eligibleCount,0,'uncontracted rows must not inflate the mutation-ready count');
assert.equal(currentEpoch.potential.mutationBudget,0,'uncontracted rows must contribute zero autonomous mutation budget');
assert.ok(currentEpoch.needsAcceptanceContractCount>0,'the remaining matrix must report acceptance-contract debt');
assert.ok(currentEpoch.heldNeedsAcceptanceContract.includes('R388-D-02'),'D-02 must be contract debt, never an AI-generation target');
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
 'contractReady=selfEditable.filter(x=>Boolean(x.acceptanceContract))',
 'heldNeedsAcceptanceContract',
 'needsAcceptanceContractCount',
 "targetingRevision:'R508'",
])assert.ok(source.includes(token),`R508 scheduler source missing ${token}`);
assert.equal(source.includes('const eligible=selfEditable.filter'),false,'self-editability alone must never define autonomous eligibility again');

console.log('R508 CONTRACT-READY CONVERGENCE PASS · uncontracted objectives are contract debt · D-02 excluded before AI · truthful mutation budget reaches zero');
