import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722} from '../src/portableMemoryRecoveryR722.mjs';
import {compareVerifiedMemoryContinuityR725,revalidateMemoryContinuityR725,MEMORY_CONTINUITY_SCHEMA_R725} from '../src/memoryContinuityR725.mjs';

async function snapshot(id,at,address,decision,note,metrics){
 const core={address,stateId:address+1,note,metrics,decision,routeNext:address+1,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const first=await snapshot('r725-earlier-0001',1793347200000,42,'STAY','Continuity observed',{continuity:0.25,scar:0.5,label:'old'});
const later=await snapshot('r725-later-00002',1793347205000,44,'TURN','Continuity shifted',{continuity:0.75,scar:0.3,label:'new',newMetric:8});
const unrelated=await snapshot('r725-unrelated03',1793347208000,46,'STAY','Unrelated',{other:2});
const rows=[first,later,unrelated];
const packet=await compareVerifiedMemoryContinuityR725(rows,first.id,later.id);
assert.equal(packet.schema,MEMORY_CONTINUITY_SCHEMA_R725);
assert.equal(packet.elapsedRecordedMs,5000);
assert.equal(packet.transition.addressDelta,2);
assert.equal(packet.transition.stateIdDelta,2);
assert.equal(packet.transition.decisionChanged,true);
assert.equal(packet.transition.noteChanged,true);
assert.deepEqual(packet.metricDeltas,[
 {key:'continuity',earlier:0.25,later:0.75,delta:0.5},
 {key:'scar',earlier:0.5,later:0.3,delta:0.3-0.5}
]);
assert.equal(packet.metricCoverage.sharedNumeric,2);
assert.equal(packet.causalInference,false);
assert.equal(packet.physicalTimeMeasurement,false);
assert.equal(packet.authenticatedSource,false);
assert.equal((await revalidateMemoryContinuityR725(rows,packet)).packetSha256,packet.packetSha256);
await assert.rejects(compareVerifiedMemoryContinuityR725(rows,later.id,first.id),/increasing recorded timestamps/);
await assert.rejects(compareVerifiedMemoryContinuityR725(rows,first.id,first.id),/distinct source/);
await assert.rejects(compareVerifiedMemoryContinuityR725(rows,first.id,'missing-id'),/unavailable/);
const tampered=structuredClone(rows);tampered[2].note='forged';
await assert.rejects(compareVerifiedMemoryContinuityR725(tampered,first.id,later.id),/digest mismatch/);
await assert.rejects(revalidateMemoryContinuityR725(tampered,packet),/digest mismatch/);
const changed=[...rows,await snapshot('r725-extra-00004',1793347210000,48,'TURN','Extra',{scar:0.9})];
assert.equal((await revalidateMemoryContinuityR725(changed,packet)).packetSha256,packet.packetSha256);
const replaced=structuredClone(rows);replaced[1]=await snapshot(later.id,later.at,later.address,'STAY','Different valid observation',{continuity:0.8,scar:0.3});
await assert.rejects(revalidateMemoryContinuityR725(replaced,packet),/source changed/);
await assert.rejects(revalidateMemoryContinuityR725(rows,{...packet,packetSha256:'0'.repeat(64)}),/packet digest mismatch/);
await assert.rejects(revalidateMemoryContinuityR725(rows,{...packet,metricDeltas:[]}),/packet digest mismatch/);
const ui=readFileSync(new URL('../src7/workspaces/MemoryContinuityR725.tsx',import.meta.url),'utf8');
const fabric=readFileSync(new URL('../src/IntelligenceFabricPanel.tsx',import.meta.url),'utf8');
const browser=readFileSync(new URL('./r707-woven-topology-browser-e2e.mjs',import.meta.url),'utf8');
for(const token of ['data-r725-earlier','data-r725-later','data-r725-compare','data-r725-metric','data-r725-export','data-r725-json','data-r725-error','data-r725-boundary'])
 assert.ok(ui.includes(token),'R725 functional UI missing '+token);
assert.ok(fabric.includes('<MemoryContinuityR725 onAddress={onAddress}/>'));
assert.ok(browser.includes('R725 verified memory continuity'));
console.log('R725 verified chronological memory continuity, numeric deltas, source refusal, revalidation and UI integration PASS');
