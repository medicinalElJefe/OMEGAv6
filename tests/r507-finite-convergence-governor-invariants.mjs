import assert from 'node:assert/strict';
import fs from 'node:fs';
import {repairBudgetR507,finiteConvergencePotentialR507,R507_MAX_REPAIR_HYPOTHESIS_ATTEMPTS} from '../src/system/finiteConvergenceGovernorR507.js';
import {recordRepairAttemptR314,canAttemptRepairR314} from '../src/system/autonomousConvergenceR314.js';
import {selectNextConvergenceItemR388,parseConvergenceBacklogR388} from '../src/system/convergenceBacklogR388.js';

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

const backlogSource=fs.readFileSync('src/system/convergenceBacklogR388.js','utf8');
assert.equal(backlogSource.includes('eligible.length?eligible:selfEditable'),false);
const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
for(const token of ['finiteConvergencePotentialR507','R507_ZERO_MUTATION_BUDGET','r507:finiteConvergence']) assert.ok(machine.includes(token),token);

console.log('R507 FINITE CONVERGENCE PASS');
