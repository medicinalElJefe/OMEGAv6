import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722,verifyMemoryRowsR722} from '../src/portableMemoryRecoveryR722.mjs';
import {traceVerifiedMemoryTrajectoryR726} from '../src/memoryTrajectoryR726.mjs';
import {exportTrajectoryCapsuleR730} from '../src/trajectoryCapsuleR730.mjs';
import {prepareCapsulePersistenceR731} from '../src/capsulePersistenceR731.mjs';
async function row(id,at,address){
 const core={address,stateId:address+1,note:'snapshot '+id,metrics:{score:address/100},decision:'STAY',routeNext:null,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const rows=[
 await row('r731-early-0001',1793347200000,100),
 await row('r731-mid---0002',1793347201000,102),
 await row('r731-late--0003',1793347202000,104)];
const packet=await traceVerifiedMemoryTrajectoryR726(rows,rows[0].id,rows[2].id);
const capsule=await exportTrajectoryCapsuleR730(rows,packet,rows[1].id,'score');
const first=await prepareCapsulePersistenceR731([],capsule);
assert.equal(first.added,3);
assert.equal(first.existing,0);
assert.equal(first.rows.length,3);
assert.equal(first.packetSha256,packet.packetSha256);
assert.equal(first.canonicalMutation,false);
assert.equal(first.authenticatedSource,false);
assert.equal(first.truthClass,'VERIFIED_OPT_IN_BROWSER_LOCAL_PERSISTENCE_ONLY');
await verifyMemoryRowsR722(first.rows);
const repeated=await prepareCapsulePersistenceR731(first.rows,capsule);
assert.equal(repeated.added,0);
assert.equal(repeated.existing,3);
const fourth=await row('r731-other-0004',1793347203000,106);
const combined=await prepareCapsulePersistenceR731([fourth],capsule);
assert.equal(combined.rows.length,4);
assert.equal(combined.added,3);
const conflicting=await row(rows[1].id,rows[1].at,103);
await assert.rejects(prepareCapsulePersistenceR731([conflicting],capsule),/conflicting memory identity refused/);
const changed=JSON.parse(capsule);changed.memory.rows[0].note='tampered';
await assert.rejects(prepareCapsulePersistenceR731([],JSON.stringify(changed)),/digest mismatch/);
await assert.rejects(prepareCapsulePersistenceR731([],JSON.stringify({...JSON.parse(capsule),sha256:'0'.repeat(64)})),/capsule digest mismatch/);
const ui=readFileSync(new URL('../src7/workspaces/MemoryTrajectoryR726.tsx',import.meta.url),'utf8');
for(const marker of ['data-r731-persist','data-r731-boundary','prepareCapsulePersistenceR731','localState.write(MEMORY_KEY_R722,result.rows)','omega-r722-memory-updated','localStorage.getItem(MEMORY_KEY_R722)!==originalRaw'])
 assert.ok(ui.includes(marker),'R731 UI persistence wiring missing '+marker);
console.log('R731 opt-in capsule persistence, verified replay, merge, deduplication, conflict and tamper refusal PASS');
