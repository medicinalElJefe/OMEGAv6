import assert from 'node:assert/strict';
import {
 candidateGainR314,
 canAttemptRepairR314,
 decideCandidateAdmissionR314,
 recordRepairAttemptR314,
 residualVectorR314,
} from '../src/system/autonomousConvergenceR314.js';

const low={state:'TURN',residuals:[{id:'A',severity:'LOW',mode:'OBSERVE_ONLY',summary:'minor'}]};
const high={state:'HOLD',residuals:[
 {id:'A',severity:'LOW',mode:'OBSERVE_ONLY',summary:'minor'},
 {id:'B',severity:'CRITICAL',mode:'BLOCK',summary:'blocking'},
]};
const clean={state:'STAY',residuals:[]};

const highVector=residualVectorR314(high);
assert.equal(highVector.blocking.includes('B'),true,'critical/block residual must be blocking');
assert.ok(highVector.pressure>residualVectorR314(low).pressure,'higher residual burden must increase pressure');
assert.equal(highVector.fingerprint,residualVectorR314(high).fingerprint,'same residual evidence must hash identically');

const gain=candidateGainR314({before:high,after:low,risk:0,complexity:0,changedPaths:1});
assert.ok(gain.rawGain>0,'removing a blocking residual must create raw gain');
assert.equal(gain.improved,true,'positive low-risk residual reduction must improve');
assert.equal(candidateGainR314({before:low,after:low}).improved,false,'no residual change must not count as progress');

let history=[];
history=recordRepairAttemptR314(history,{fingerprint:highVector.fingerprint,repairId:'repair-A',outcome:'NO_GAIN',gain:0,recordedAt:'2026-09-13T00:00:00Z'});
let retry=canAttemptRepairR314({history,fingerprint:highVector.fingerprint,repairId:'repair-A'});
assert.equal(retry.allow,true,'one failed attempt remains within the bounded retry budget');
history=recordRepairAttemptR314(history,{fingerprint:highVector.fingerprint,repairId:'repair-A',outcome:'FAILED',recordedAt:'2026-09-13T00:01:00Z'});
retry=canAttemptRepairR314({history,fingerprint:highVector.fingerprint,repairId:'repair-A'});
assert.equal(retry.allow,false,'same residual + same repair must stop after bounded failed attempts');
assert.equal(canAttemptRepairR314({history,fingerprint:highVector.fingerprint,repairId:'repair-B'}).allow,true,'changed repair hypothesis must receive its own bounded attempt budget');

const accepted=decideCandidateAdmissionR314({before:high,after:low,testsGreen:true,exactBase:true,allowlisted:true,changedPaths:1,history:[],repairId:'remove-B'});
assert.equal(accepted.allow,true,'measurable low-risk exact-base allowlisted tested reduction must be admissible as a source candidate');
assert.equal(accepted.canonicalAdmission,false,'source candidate admission must never imply CanonState admission');
assert.equal(accepted.directProductionMutation,false,'autonomous candidate must never mutate production directly');

for(const [field,value,reason] of [
 ['testsGreen',false,'TESTS_NOT_GREEN'],
 ['exactBase',false,'BASE_NOT_EXACT'],
 ['allowlisted',false,'DIFF_NOT_ALLOWLISTED'],
]){
 const args={before:high,after:low,testsGreen:true,exactBase:true,allowlisted:true,changedPaths:1,history:[],repairId:'remove-B',[field]:value};
 const result=decideCandidateAdmissionR314(args);
 assert.equal(result.allow,false,`${field}=false must block candidate`);
 assert.ok(result.reasons.includes(reason),`${field}=false must report ${reason}`);
}

const noGain=decideCandidateAdmissionR314({before:low,after:low,testsGreen:true,exactBase:true,allowlisted:true,changedPaths:1,history:[],repairId:'noop'});
assert.equal(noGain.allow,false,'no-gain candidate must be blocked');
assert.ok(noGain.reasons.includes('NO_MEASURABLE_RESIDUAL_REDUCTION'));

const newBlock=decideCandidateAdmissionR314({before:low,after:high,testsGreen:true,exactBase:true,allowlisted:true,changedPaths:1,history:[],repairId:'regression'});
assert.equal(newBlock.allow,false,'candidate that introduces blocking residual must be blocked');
assert.ok(newBlock.reasons.includes('NEW_BLOCKING_RESIDUAL'));

const perfect=decideCandidateAdmissionR314({before:high,after:clean,testsGreen:true,exactBase:true,allowlisted:true,changedPaths:1,history:[],repairId:'clear'});
assert.equal(perfect.allow,true);
assert.ok(perfect.gain.gain>accepted.gain.gain,'clearing all debt should yield more gain than partial repair when penalties are equal');

console.log('R314 AUTONOMOUS CONVERGENCE PASS · bounded retries · measurable gain · exact base · allowlist · no direct Canon/production mutation');
