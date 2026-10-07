import assert from 'node:assert/strict';
import fs from 'node:fs';
import {repairBudgetR507,finiteConvergencePotentialR507,R507_MAX_REPAIR_HYPOTHESIS_ATTEMPTS} from '../src/system/finiteConvergenceGovernorR507.js';
import {recordRepairAttemptR314,canAttemptRepairR314} from '../src/system/autonomousConvergenceR314.js';
import {selectNextConvergenceItemR388,parseConvergenceBacklogR388,evaluateCurrentConvergenceSourceR507,validateConvergenceRepairR450} from '../src/system/convergenceBacklogR388.js';

let history=[];
const repairId='R314-AI:R-LOOP:src/sample.ts';
history=recordRepairAttemptR314(history,{fingerprint:'fp-1',repairId,outcome:'PROPOSED'});
assert.equal(canAttemptRepairR314({history,fingerprint:'fp-1',repairId}).allow,true);
history=recordRepairAttemptR314(history,{fingerprint:'fp-1',repairId,outcome:'PROPOSED'});
assert.equal(canAttemptRepairR314({history,fingerprint:'fp-1',repairId}).allow,false);

let churn=[];
for(let i=0;i<R507_MAX_REPAIR_HYPOTHESIS_ATTEMPTS;i++) churn=recordRepairAttemptR314(churn,{fingerprint:'fp-'+i,repairId,outcome:'PROPOSED'});
assert.equal(repairBudgetR507({history:churn,fingerprint:'fp-new',repairId}).allow,false);

const markdown=['## A. Surface','- [ ] first repairable item','- [ ] second repairable item','- [ ] third repairable item'].join('\n');
const ids=parseConvergenceBacklogR388(markdown).filter(x=>x.selfEditable).map(x=>x.id);
const held=selectNextConvergenceItemR388({markdown,heldItemIds:ids});
assert.equal(held.selected,null);
assert.equal(held.candidates.length,0);
assert.equal(held.potential.state,'HELD_UNTIL_NEW_EVIDENCE');

const terminal=finiteConvergencePotentialR507({selfBuildState:{maxAutonomousGenerations:5,admittedSourceCapsules:['1','2','3','4','5']},retry:{allow:false,remaining:0},backlog:held,openAutonomousCandidates:0});
assert.equal(terminal.terminalForCurrentEvidence,true);
assert.equal(terminal.mutationBudget,0);

const realMarkdown=fs.readFileSync('docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md','utf8');
const c03=parseConvergenceBacklogR388(realMarkdown).find(row=>row.id==='R388-C-03');
assert.ok(c03?.acceptanceContract?.currentSourceProof,'C-03 must define exact current-source satisfaction proof');
const exactSources=[
 {path:'src/EarthObservatoryR8.tsx',sha:'a'.repeat(40),text:fs.readFileSync('src/EarthObservatoryR8.tsx','utf8')},
 {path:'src/EarthGroundTraversalR9.tsx',sha:'b'.repeat(40),text:fs.readFileSync('src/EarthGroundTraversalR9.tsx','utf8')},
];
const sourceProof=evaluateCurrentConvergenceSourceR507({item:c03,sourceFiles:exactSources});
assert.equal(sourceProof.satisfied,true,sourceProof.reasons.join(','));
assert.equal(sourceProof.state,'CURRENT_SOURCE_SATISFIES_OBJECTIVE_PENDING_INDEPENDENT_PROOF');
assert.equal(sourceProof.sourceRefs.length,2);

const regressed=evaluateCurrentConvergenceSourceR507({
 item:c03,
 sourceFiles:exactSources.map(row=>row.path.endsWith('EarthGroundTraversalR9.tsx')?{...row,text:row.text.replace('/api/earth/ground/evidence','/api/earth/ground/removed')}:row),
});
assert.equal(regressed.satisfied,false,'missing traversal transport must invalidate source-satisfaction proof');

const cosmetic=validateConvergenceRepairR450({
 item:c03,
 proposal:{files:[{path:'src/EarthObservatoryR8.tsx',replacements:[{before:"['G19-FD','G18-FD']",after:"['G19-FD','G18-FD','G15-FD']"}]}]},
});
assert.equal(cosmetic.valid,false,'a tiny satellite-list edit must never advance the broad C-03 traversal objective');

const backlogSource=fs.readFileSync('src/system/convergenceBacklogR388.js','utf8');
assert.equal(backlogSource.includes('eligible.length?eligible:selfEditable'),false);
const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
for(const token of ['finiteConvergencePotentialR507','R507_ZERO_MUTATION_BUDGET','r507:finiteConvergence','R507_SOURCE_PROOF_BRANCH_AND_PR_CREATED','R507_CURRENT_SOURCE_PROOF']) assert.ok(machine.includes(token),token);

console.log('R507 FINITE CONVERGENCE PASS · bounded repair budget · held-item quiescence · current-source proof without fake mutation · cosmetic C-03 advancement rejected');
