import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722} from '../src/portableMemoryRecoveryR722.mjs';
import {traceVerifiedMemoryTrajectoryR726} from '../src/memoryTrajectoryR726.mjs';
import {buildVerifiedTrajectoryExplorerR727} from '../src/verifiedTrajectoryExplorerR727.mjs';
async function snapshot(id,at,address,metrics){
 const core={address,stateId:address+1,note:id,metrics,decision:'STAY',
  routeNext:null,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const rows=[
 await snapshot('r727-early-0001',1793347200000,10,{continuity:0.2}),
 await snapshot('r727-next--0002',1793347201000,12,{continuity:0.4}),
 await snapshot('r727-third-0003',1793347202000,15,{velocity:0.7}),
 await snapshot('r727-last--0004',1793347203000,18,{continuity:0.9})
];
const packet=await traceVerifiedMemoryTrajectoryR726(rows,rows[0].id,rows[3].id);
const address=buildVerifiedTrajectoryExplorerR727(packet);
assert.equal(address.schema,'OMEGA_VERIFIED_TRAJECTORY_EXPLORER_R727_V1');
assert.deepEqual(address.points.map(p=>p.value),[10,12,15,18]);
assert.equal(address.segments.length,3);
assert.equal(address.observedCount,4);
assert.equal(address.missingCount,0);
assert.equal(address.interpolated,false);
assert.equal(address.canonicalMutation,false);
assert.equal(address.physicalTimeMeasurement,false);
const continuity=buildVerifiedTrajectoryExplorerR727(packet,'continuity');
assert.deepEqual(continuity.points.map(p=>p.value),[0.2,0.4,null,null]);
assert.equal(continuity.observedCount,2);
assert.equal(continuity.missingCount,2);
assert.equal(continuity.segments.length,1);
assert.deepEqual(continuity.metricKeys,['address','continuity']);
assert.throws(()=>buildVerifiedTrajectoryExplorerR727(packet,'unobserved'),/metric not present/);
const forged=structuredClone(packet);
forged.edges[0].laterId='forged';
assert.throws(()=>buildVerifiedTrajectoryExplorerR727(forged),/edge\/source identity/);
const contradictory=structuredClone(packet);
contradictory.edges[1].metricDeltas=[{key:'continuity',earlier:0.9,later:0.5,delta:-0.4}];
assert.throws(()=>buildVerifiedTrajectoryExplorerR727(contradictory,'continuity'),/contradictory metric/);
const ui=readFileSync(new URL('../src7/workspaces/MemoryTrajectoryR726.tsx',import.meta.url),'utf8');
const browser=readFileSync(new URL('./r707-woven-topology-browser-e2e.mjs',import.meta.url),'utf8');
for(const token of ['data-r727-explorer','data-r727-chart','data-r727-metric',
 'data-r727-cursor','data-r727-selected','data-r727-replay','data-r727-coverage'])
 assert.ok(ui.includes(token),'R727 missing functional UI '+token);
assert.ok(browser.includes('R727 verified trajectory explorer'));
console.log('R727 source-bound discrete trajectory explorer, missing observations, UI and refusal PASS');
