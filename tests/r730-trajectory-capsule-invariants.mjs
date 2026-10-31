import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722} from '../src/portableMemoryRecoveryR722.mjs';
import {traceVerifiedMemoryTrajectoryR726} from '../src/memoryTrajectoryR726.mjs';
import {exportTrajectoryCapsuleR730,importTrajectoryCapsuleR730,TRAJECTORY_CAPSULE_SCHEMA_R730} from '../src/trajectoryCapsuleR730.mjs';
async function row(id,at,address,score){
 const core={address,stateId:address+1,note:'private note '+id,metrics:{score},decision:'STAY',routeNext:null,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const rows=[
 await row('r730-early-0001',1793347200000,100,0.2),
 await row('r730-mid---0002',1793347201000,102,0.4),
 await row('r730-late--0003',1793347202000,104,0.7),
 await row('r730-other-0004',1793347203000,105,0.9)];
const packet=await traceVerifiedMemoryTrajectoryR726(rows,rows[0].id,rows[2].id);
const serialized=await exportTrajectoryCapsuleR730(rows,packet,rows[1].id,'score');
const capsule=JSON.parse(serialized);
assert.equal(capsule.schema,TRAJECTORY_CAPSULE_SCHEMA_R730);
assert.equal(capsule.memory.rows.length,3);
assert.equal(capsule.memory.rows[1].note,rows[1].note);
const restored=await importTrajectoryCapsuleR730(serialized);
assert.equal(restored.packet.packetSha256,packet.packetSha256);
assert.equal(restored.cursor,1);
assert.equal(restored.metricKey,'score');
assert.equal(restored.rows.length,3);
assert.equal(restored.persisted,false);
assert.equal(restored.canonicalMutation,false);
assert.equal(restored.authenticatedSource,false);
assert.equal(restored.truthClass,'REVERIFIED_PORTABLE_UNAUTHENTICATED_CAPSULE_ONLY');
const changed=structuredClone(capsule);changed.memory.rows[1].note='altered';
await assert.rejects(importTrajectoryCapsuleR730(JSON.stringify(changed)),/capsule digest mismatch/);
const changedMemory=structuredClone(capsule);changedMemory.memory.rows[1].note='altered';
changedMemory.sha256=await digestMemoryR722(JSON.stringify({schema:changedMemory.schema,memory:changedMemory.memory,checkpoint:changedMemory.checkpoint}));
await assert.rejects(importTrajectoryCapsuleR730(JSON.stringify(changedMemory)),/snapshot digest mismatch/);
const changedCheckpoint=structuredClone(capsule);changedCheckpoint.checkpoint=changedCheckpoint.checkpoint.replace('score','address');
changedCheckpoint.sha256=await digestMemoryR722(JSON.stringify({schema:changedCheckpoint.schema,memory:changedCheckpoint.memory,checkpoint:changedCheckpoint.checkpoint}));
await assert.rejects(importTrajectoryCapsuleR730(JSON.stringify(changedCheckpoint)),/checkpoint digest mismatch/);
await assert.rejects(importTrajectoryCapsuleR730(JSON.stringify({...capsule,extra:true})),/schema refused/);
await assert.rejects(importTrajectoryCapsuleR730('not json'),/JSON refused/);
await assert.rejects(importTrajectoryCapsuleR730('x'.repeat(524289)),/size refused/);
await assert.rejects(exportTrajectoryCapsuleR730(rows,packet,'missing-source','score'),/cursor source identity refused/);
const tampered=structuredClone(rows);tampered[1].note='altered';
await assert.rejects(exportTrajectoryCapsuleR730(tampered,packet,rows[1].id,'score'),/snapshot digest mismatch/);
const ui=readFileSync(new URL('../src7/workspaces/MemoryTrajectoryR726.tsx',import.meta.url),'utf8');
for(const token of ['data-r730-exchange','data-r730-export','data-r730-import','data-r730-json','data-r730-boundary','importTrajectoryCapsuleR730','exportTrajectoryCapsuleR730','setPortableRows(restored.rows)','currentRows()'])
 assert.ok(ui.includes(token),'R730 OMEGA7 UI integration missing '+token);
console.log('R730 portable source-bound trajectory capsule, read-only cross-browser recovery and tamper refusal PASS');
