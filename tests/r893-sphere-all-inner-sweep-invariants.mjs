import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createFabric,agentId,getAgent,submitTask,stateValue,SIZE,serializeFabricR888} from '../src/sphereAgentFabricR887.mjs';
import {collectiveMembersR890} from '../src/sphereCollectiveR890.mjs';
import {autonomousSweepR893,sweepCoordinateR893,R893_SCHEMA,R893_MAX_BATCH} from '../src/sphereFullInnerSweepR893.mjs';
import {serializeSweepContinuationR893,restoreSweepContinuationR893,R893_CONTINUATION_SCHEMA} from '../src/sphereSweepContinuityR893.mjs';
const f=createFabric(),root=agentId(4,137),members=collectiveMembersR890(root,3);
assert.equal(R893_SCHEMA,'OMEGA_SPHERE_ALL_INNER_SWEEP_R893');assert.equal(R893_MAX_BATCH,64);
const visited=new Set();let step=0;
for(let i=0;i<20;i++){const result=autonomousSweepR893(f,members,step,48);assert.equal(result.mode,'LOCAL_DETERMINISTIC_FULL_INNER_SWEEP');assert.equal(result.receipts.length,48);assert.equal(result.visits.length,48);assert.equal(result.cloudCalls,0);assert.equal(result.canonicalWrites,0);for(const visit of result.visits)visited.add(visit.agent+':'+visit.inner);step=result.nextStepCursor}
assert.equal(step,960);assert.equal(visited.size,960);assert.ok(f.active.size<=3);
assert.equal(sweepCoordinateR893(members,0).inner,0);assert.equal(sweepCoordinateR893(members,2).memberIndex,2);assert.equal(sweepCoordinateR893(members,3).inner,1);
assert.equal(sweepCoordinateR893(members,3*SIZE-1).inner,SIZE-1);
assert.equal(sweepCoordinateR893(members,3*SIZE).inner,0);
assert.equal(sweepCoordinateR893(members,3*SIZE).completedCycles,1);
// R966: a singleton with a known inner gradient executes a conservative
// phase exchange through the existing scheduler, not a separate state store.
const phaseFabric=createFabric();
const phaseAgent=getAgent(phaseFabric,root);
for(let inner=0;inner<SIZE;inner++)phaseAgent.values.set(inner,0);
phaseAgent.values.set(0,1);
const phaseRun=autonomousSweepR893(phaseFabric,[root],0,1);
assert.equal(phaseRun.receipts[0].kind,'PHASE_EXCHANGE');
assert.equal(phaseRun.visits[0].inner,0);
assert.equal(phaseRun.nextStepCursor,1);
const phaseReceipt=phaseRun.receipts[0];
assert.ok(Math.abs(phaseReceipt.after+phaseReceipt.neighborAfter-1)<1e-12);
assert.equal(phaseReceipt.conservationResidual,0);
assert.equal(stateValue(phaseFabric,root,phaseReceipt.neighborInner),phaseReceipt.neighborAfter);
const boundary=createFabric();
let b=autonomousSweepR893(boundary,members,3*SIZE-2,4);
assert.deepEqual(b.visits.map(x=>x.inner),[20735,20735,0,0]);
const queue=createFabric();submitTask(queue,{agent:root,kind:'OBSERVE',inner:3});
const priority=autonomousSweepR893(queue,members,10,32);
assert.equal(priority.mode,'OPERATOR_QUEUE_FIRST');assert.equal(priority.nextStepCursor,10);assert.equal(priority.receipts[0].inner,3);
const cap=createFabric();for(let i=0;i<512;i++)getAgent(cap,i);
const pre=stateValue(cap,root,1),held=autonomousSweepR893(cap,members,3,64);
assert.equal(held.mode,'HELD_CAPACITY');assert.equal(held.nextStepCursor,3);assert.equal(held.visits.length,0);assert.equal(cap.tick,0);assert.equal(cap.queue.length,0);assert.equal(stateValue(cap,root,1),pre);
for(const bad of [-1,1.3,Number.MAX_SAFE_INTEGER+1,NaN])assert.throws(()=>sweepCoordinateR893(members,bad),RangeError);
for(const bad of [0,-1,65,1.5])assert.throws(()=>autonomousSweepR893(createFabric(),members,0,bad),RangeError);
const fabricCheckpoint=serializeFabricR888(f);
const savedContinuation=serializeSweepContinuationR893(fabricCheckpoint,{agent:root,memberCount:members.length,stepCursor:step,batch:48,mode:'ALL_20736',selectedInner:732});
const restoredContinuation=restoreSweepContinuationR893(fabricCheckpoint,savedContinuation);
assert.equal(JSON.parse(savedContinuation).schema,R893_CONTINUATION_SCHEMA);
assert.equal(restoredContinuation.agent,root);assert.equal(restoredContinuation.stepCursor,960);assert.equal(restoredContinuation.batch,48);
assert.throws(()=>restoreSweepContinuationR893(serializeFabricR888(createFabric()),savedContinuation),/not bound/);
assert.throws(()=>restoreSweepContinuationR893(fabricCheckpoint,savedContinuation.replace('"stepCursor":960','"stepCursor":-1')),/Invalid R893/);
assert.throws(()=>restoreSweepContinuationR893(fabricCheckpoint,'not-json'),/JSON invalid/);
const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');
for(const token of ['autonomousSweepR893','Autonomous inner-state schedule','Sweep all 20,736 inner states','Autonomous steps per cycle','data-r893-sweep-progress','fullSweepCursor','serializeSweepContinuationR893','restoreSweepContinuationR893','SWEEP_KEY'])assert.ok(ui.includes(token),'Missing R893 UI '+token);
// R893 EXHAUSTIVE 12x20736: prove every member/inner pair appears exactly once
// across a full logical cycle, including first/last and cursor wrap.
// Address-mapping proof only; this does not assert 248,832 executor ticks completed.
const twelve=collectiveMembersR890(root,12);
assert.equal(twelve.length,12,'full collective must contain twelve distinct agents');
const cycleLength=twelve.length*SIZE;
assert.equal(cycleLength,248832);
const pairCoverage=new Uint8Array(cycleLength);
for(let cursor=0;cursor<cycleLength;cursor++){
 const coordinate=sweepCoordinateR893(twelve,cursor);
 assert.equal(coordinate.cycleLength,cycleLength);
 assert.equal(coordinate.completedCycles,0);
 assert.equal(coordinate.cycleProgress,cursor);
 assert.equal(coordinate.member,twelve[cursor%12]);
 assert.equal(coordinate.inner,Math.floor(cursor/12));
 const flat=coordinate.inner*12+coordinate.memberIndex;
 assert.equal(pairCoverage[flat],0,'duplicate agent/inner address in complete cycle');
 pairCoverage[flat]=1;
}
assert.equal(pairCoverage.reduce((sum,v)=>sum+v,0),cycleLength);
const wrapped=sweepCoordinateR893(twelve,cycleLength);
assert.equal(wrapped.inner,0);
assert.equal(wrapped.member,twelve[0]);
assert.equal(wrapped.cycleProgress,0);
assert.equal(wrapped.completedCycles,1);
assert.equal(sweepCoordinateR893(twelve,cycleLength-1).inner,SIZE-1);
assert.equal(sweepCoordinateR893(twelve,cycleLength-1).member,twelve[11]);
console.log('R893 EXHAUSTIVE 12x20736 PASS: all 248,832 unique logical coordinates and exact cycle boundary (not executor ticks).');
console.log('R893 PASS: 960 independently addressed state operations, dimension wrap at 20,736, priority, capacity atomicity, bounded 1–64 batch and zero cloud calls.');

// R972: execute the entire 12-agent cycle, not merely the address mapping.
const executed=createFabric();let executionCursor=0,executionCount=0,exchangeCount=0,phaseCount=0;
const executionCoverage=new Uint8Array(cycleLength);
while(executionCursor<cycleLength){
 const batch=autonomousSweepR893(executed,twelve,executionCursor,Math.min(64,cycleLength-executionCursor));
 assert.equal(batch.mode,'LOCAL_DETERMINISTIC_FULL_INNER_SWEEP');
 assert.equal(batch.receipts.length,batch.visits.length);
 for(let i=0;i<batch.visits.length;i++){
  const visit=batch.visits[i],receipt=batch.receipts[i],expected=sweepCoordinateR893(twelve,executionCursor+i);
  assert.equal(visit.agent,expected.member);assert.equal(visit.inner,expected.inner);
  assert.equal(receipt.agent,visit.agent);assert.equal(receipt.inner,visit.inner);
  assert.equal(receipt.tick,++executionCount);assert.equal(visit.receiptTick,receipt.tick);
  const flat=visit.inner*12+expected.memberIndex;
  assert.equal(executionCoverage[flat],0);executionCoverage[flat]=1;
  assert.ok(Number.isFinite(receipt.after)&&receipt.after>=0&&receipt.after<=1);
  if(receipt.kind==='EXCHANGE'||receipt.kind==='PHASE_EXCHANGE'){
   const before=receipt.kind==='EXCHANGE'?receipt.peerBefore:receipt.neighborBefore;
   const after=receipt.kind==='EXCHANGE'?receipt.peerAfter:receipt.neighborAfter;
   assert.ok(Math.abs(receipt.after+after-receipt.before-before)<=1e-12);
   if(receipt.kind==='EXCHANGE')exchangeCount++;else phaseCount++;
  }
 }
 assert.equal(batch.nextStepCursor,executionCursor+batch.visits.length);
 executionCursor=batch.nextStepCursor;
}
assert.equal(executionCount,cycleLength);assert.equal(executed.tick,cycleLength);
assert.equal(executed.sequence,cycleLength);assert.equal(executed.queue.length,0);
assert.equal(executed.active.size,12);assert.ok(exchangeCount>0&&phaseCount>0);
assert.equal(executionCoverage.reduce((sum,v)=>sum+v,0),cycleLength);
assert.equal(executed.receipts.length,512);
console.log('R972 actual full-cycle execution PASS: '+executionCount+' operations; '+exchangeCount+' peer and '+phaseCount+' phase exchanges.');
