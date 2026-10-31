import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722} from '../src/portableMemoryRecoveryR722.mjs';
import {traceVerifiedMemoryTrajectoryR726} from '../src/memoryTrajectoryR726.mjs';
import {saveTrajectoryCheckpointR729,restoreTrajectoryCheckpointR729,TRAJECTORY_CHECKPOINT_SCHEMA_R729} from '../src/trajectoryCheckpointR729.mjs';
async function row(id,at,address,score){
 const core={address,stateId:address+1,note:'record '+id,metrics:{score},decision:'STAY',routeNext:null,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const rows=[await row('r729-early-0001',1793347200000,100,0.2),await row('r729-mid---0002',1793347201000,102,0.4),await row('r729-late--0003',1793347202000,104,0.7)];
const packet=await traceVerifiedMemoryTrajectoryR726(rows,rows[0].id,rows[2].id);
const raw=await saveTrajectoryCheckpointR729(rows,packet,rows[1].id,'score');
assert.equal(JSON.parse(raw).schema,TRAJECTORY_CHECKPOINT_SCHEMA_R729);
const restored=await restoreTrajectoryCheckpointR729(rows,raw);
assert.equal(restored.packet.packetSha256,packet.packetSha256);
assert.equal(restored.cursor,1);
assert.equal(restored.metricKey,'score');
assert.equal(restored.truthClass,'REVERIFIED_BROWSER_LOCAL_CHECKPOINT_ONLY');
await assert.rejects(saveTrajectoryCheckpointR729(rows,packet,'not-a-source','score'),/cursor source identity refused/);
await assert.rejects(saveTrajectoryCheckpointR729(rows,packet,rows[1].id,'missing-metric'),/metric not present/);
const altered=structuredClone(rows);altered[1].note='tampered';
await assert.rejects(restoreTrajectoryCheckpointR729(altered,raw),/digest mismatch/);
const changed=[rows[0],await row(rows[1].id,rows[1].at,103,0.4),rows[2]];
await assert.rejects(restoreTrajectoryCheckpointR729(changed,raw),/chronology changed/);
await assert.rejects(restoreTrajectoryCheckpointR729(rows.slice(0,2),raw),/unavailable/);
const modified=JSON.parse(raw);modified.metricKey='address';
await assert.rejects(restoreTrajectoryCheckpointR729(rows,JSON.stringify(modified)),/digest mismatch/);
await assert.rejects(restoreTrajectoryCheckpointR729(rows,JSON.stringify({...JSON.parse(raw),admin:true})),/schema refused/);
await assert.rejects(restoreTrajectoryCheckpointR729(rows,'{broken'),/JSON refused/);
await assert.rejects(restoreTrajectoryCheckpointR729(rows,'x'.repeat(5000)),/size refused/);
const extra=await row('r729-other-0004',1793347203000,106,0.8);
assert.equal((await restoreTrajectoryCheckpointR729([...rows,extra],raw)).cursor,1);
const ui=readFileSync(new URL('../src7/workspaces/MemoryTrajectoryR726.tsx',import.meta.url),'utf8');
for(const token of ['data-r729-checkpoint','data-r729-save','data-r729-restore','data-r729-clear','data-r729-boundary','restoreTrajectoryCheckpointR729'])
 assert.ok(ui.includes(token),'R729 UI integration missing '+token);
console.log('R729 browser-local trajectory checkpoint, recomputation, metric/cursor recovery and tamper refusal PASS');
