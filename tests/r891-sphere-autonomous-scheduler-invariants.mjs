import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {agentId,createFabric,getAgent,stateValue,submitTask} from '../src/sphereAgentFabricR887.mjs';
import {collectiveMembersR890} from '../src/sphereCollectiveR890.mjs';
import {autonomousTickR891,R891_SCHEMA} from '../src/sphereAutonomousR891.mjs';
const f=createFabric(),root=agentId(3,12345),inner=732,members=collectiveMembersR890(root,9);
const untouchedInnerBefore=members.map(id=>stateValue(f,id,inner+1));
let cursor=0,lastTick=0;
for(let i=0;i<36;i++){
 const r=autonomousTickR891(f,members,inner,cursor,1);
 assert.equal(r.schema,R891_SCHEMA);assert.equal(r.mode,'LOCAL_DETERMINISTIC_AUTONOMY');assert.equal(r.cloudCalls,0);assert.equal(r.canonicalWrites,0);assert.equal(r.receipts.length,1);
 assert.ok(r.nextCursor>cursor);cursor=r.nextCursor;
 assert.ok(r.receipts[0].tick>lastTick);lastTick=r.receipts[0].tick;
 assert.ok(f.active.size<=9);
}
assert.ok(new Set(f.receipts.map(r=>r.agent)).size>=5,'scheduler must distribute work across independent identities');
assert.deepEqual(members.map(id=>stateValue(f,id,inner+1)),untouchedInnerBefore,'autonomous work may not mutate unrelated inner coordinates');
const prior=f.tick;
submitTask(f,{agent:root,kind:'OBSERVE',inner});
const queued=autonomousTickR891(f,members,inner,cursor,1);
assert.equal(queued.mode,'OPERATOR_QUEUE_FIRST');assert.equal(queued.nextCursor,cursor);assert.equal(queued.receipts[0].kind,'OBSERVE');assert.equal(f.tick,prior+1);
const full=createFabric();for(let i=0;i<512;i++)getAgent(full,i);
const blockedMembers=collectiveMembersR890(agentId(4,1000),3);const priorValue=stateValue(full,blockedMembers[0],inner);
const held=autonomousTickR891(full,blockedMembers,inner,0,1);
assert.equal(held.mode,'HELD_CAPACITY');assert.equal(held.receipts.length,0);assert.equal(full.tick,0);assert.equal(full.queue.length,0);assert.equal(stateValue(full,blockedMembers[0],inner),priorValue);
assert.equal(full.active.size,512);
for(const args of [[f,[],inner,0,1],[f,[root,root],inner,0,1],[f,members,-1,0,1],[f,members,inner,-1,1],[f,members,inner,0,13]])assert.throws(()=>autonomousTickR891(...args),RangeError);
const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');for(const s of ['autonomousTickR891','Run local agent autonomy','Pause local agent autonomy','autonomousCursor','collectiveMembersR890(selected,collectiveCount)'])assert.ok(ui.includes(s),'UI missing '+s);
console.log('R891 PASS: bounded autonomous decisions, fair identities, operator priority, exact cap refusal and no cloud/canonical actions.');
