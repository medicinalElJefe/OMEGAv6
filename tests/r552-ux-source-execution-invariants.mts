import assert from 'node:assert/strict';
import fs from 'node:fs';
import {traceSourceInstrumentR533,inspectSourceInstrumentR533} from '../src7/sourceInstrumentR533.ts';
import {executeAccumulatedCapabilityR534,R534_EXECUTABLE_BINDING_IDS} from '../src/accumulativeCapabilityExecutionR534.ts';
const surface=fs.readFileSync('src/CapabilitySurfaceR478.tsx','utf8');
assert.match(surface,/executeAccumulatedCapabilityR534\(cap\.id,runAddress\)/);
assert.match(surface,/data-r552-execution-result/);
assert.match(surface,/Source-model execution address/);
assert.match(surface,/runReceipt\.status/);
assert.match(surface,/runReceipt\.executionClaimed/);
assert.ok(R534_EXECUTABLE_BINDING_IDS.includes('ATLAS'));
const executed=executeAccumulatedCapabilityR534('ATLAS',0);
assert.equal(executed.status,'SOURCE_MODEL_EXECUTED');
assert.equal(executed.executionClaimed,true);
assert.equal(executed.canonicalMutation,false);
assert.equal(executed.productionAdmissionClaimed,false);
const blocked=executeAccumulatedCapabilityR534('HYBRID',0);
assert.equal(blocked.status,'EXTERNAL_HOST_PROOF_REQUIRED');
assert.equal(blocked.executionClaimed,false);
const unknown=executeAccumulatedCapabilityR534('UNKNOWN_R552',0);
assert.equal(unknown.status,'HELD');
assert.equal(unknown.executionClaimed,false);
const invalid=executeAccumulatedCapabilityR534('ATLAS',20736);
assert.equal(invalid.status,'HELD');
assert.equal(invalid.executionClaimed,false);
// R627: the actual model must produce a bounded, reproducible address sequence.
for(const mode of ['TRAVERSAL','FORECAST'] as const){
 const trace=traceSourceInstrumentR533(mode,0,4);
 assert.equal(trace.status,'SOURCE_MODEL_EXECUTED');
 assert.equal(trace.executionClaimed,true);
 assert.equal(trace.canonicalMutation,false);
 assert.equal(trace.productionAdmissionClaimed,false);
 assert.equal(trace.historicalCapabilityRestored,false);
 assert.ok(trace.frames.length>=1&&trace.frames.length<=4);
 for(const frame of trace.frames){
  const direct=inspectSourceInstrumentR533(mode,frame.address);
  assert.equal(direct.status,'SOURCE_MODEL_EXECUTED');
  const next='nextAddress' in direct?direct.nextAddress:'modelNextAddress' in direct?direct.modelNextAddress:NaN;
  assert.equal(frame.nextAddress,next);
  assert.equal(frame.stateId,frame.address+1);
  assert.equal(Object.isFrozen(frame),true);
 }
 assert.equal(Object.isFrozen(trace.frames),true);
}
for(const bad of [0,13,1.5,NaN,Infinity]){
 const receipt=traceSourceInstrumentR533('TRAVERSAL',0,bad);
 assert.equal(receipt.status,'HELD');
 assert.equal(receipt.executionClaimed,false);
}
assert.equal(traceSourceInstrumentR533('SAI_HYBRID',0,3).status,'HELD');
assert.equal(traceSourceInstrumentR533('TRAVERSAL',20736,3).status,'HELD');
const workspace=fs.readFileSync('src7/SourceExecutionWorkspaceR531.tsx','utf8');
for(const marker of ['traceSourceInstrumentR533(executor,address,traceSteps)','data-r627-trace-run','data-r627-trace-json','setTraceReceipt(null)'])assert.ok(workspace.includes(marker),marker);
console.log('R627 bounded source trajectory and fail-closed UI integration PASS');

console.log('R552 source execution action, typed holds and authority boundaries PASS');
