import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722} from '../src/portableMemoryRecoveryR722.mjs';
import {queryVerifiedMemoryR723,inspectVerifiedMemoryR723,MEMORY_RECALL_SCHEMA_R723} from '../src/verifiedMemoryRecallR723.mjs';
async function row(id,address,note,decision='STAY',at=1793347200000){
 const core={address,stateId:address+1,note,metrics:{continuity:0.42,plasticity:0.13},decision,
  routeNext:address+1,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const first=await row('r723-source-0001',42,'Sonoran continuity woven motion');
const second=await row('r723-source-0002',43,'Sonoran motion across frame','TURN',1793347200100);
const third=await row('r723-source-0003',44,'different memory','STAY',1793347200200);
const rows=[first,second,third];
const result=await queryVerifiedMemoryR723(rows,'sonoran motion');
assert.equal(result.schema,MEMORY_RECALL_SCHEMA_R723);
assert.equal(result.total,2);assert.equal(result.verifiedCount,3);
assert.deepEqual(result.results.map(x=>x.id),[second.id,first.id]);
assert.deepEqual(result.results[0].matchedFields,['note']);
assert.equal(result.results[0].sha256,second.sha256);
assert.equal((await queryVerifiedMemoryR723(rows,'43')).results[0].id,second.id);
assert.equal((await queryVerifiedMemoryR723(rows,'stay')).total,2);
assert.equal((await queryVerifiedMemoryR723(rows,'sonoran missing')).total,0);
assert.deepEqual((await inspectVerifiedMemoryR723(rows,first.id,first.sha256)),first);
await assert.rejects(inspectVerifiedMemoryR723(rows,first.id,second.sha256),/source changed/);
const changedTimestamp=structuredClone(rows);changedTimestamp[0].at+=1;
await assert.rejects(inspectVerifiedMemoryR723(changedTimestamp,first.id,first.sha256,first.at),/source changed/);
await assert.rejects(queryVerifiedMemoryR723(rows,' '),/terms refused/);
await assert.rejects(queryVerifiedMemoryR723(rows,'a'.repeat(161)),/length refused/);
await assert.rejects(queryVerifiedMemoryR723(rows,'one two three four five six seven eight nine ten eleven twelve thirteen'),/terms refused/);
await assert.rejects(queryVerifiedMemoryR723(rows,'memory',26),/limit refused/);
const tampered=structuredClone(rows);tampered[2].note='tampered';
await assert.rejects(queryVerifiedMemoryR723(tampered,'sonoran'),/digest mismatch/);
await assert.rejects(inspectVerifiedMemoryR723(tampered,first.id,first.sha256),/digest mismatch/);
const ui=readFileSync(new URL('../src7/workspaces/MemoryRecallR723.tsx',import.meta.url),'utf8');
const host=readFileSync(new URL('../src7/workspaces/WorkCreateWorkspaceR443.tsx',import.meta.url),'utf8');
const browser=readFileSync(new URL('./r707-woven-topology-browser-e2e.mjs',import.meta.url),'utf8');
for(const token of ['data-r723-query','data-r723-search','data-r723-result','data-r723-select','data-r723-replay','data-r723-error','data-r723-boundary'])
 assert.ok(ui.includes(token),'R723 missing functional UI '+token);
assert.ok(host.includes('<MemoryRecallR723 onAddress={commit}/>'),'R723 Memory workspace integration missing');
assert.ok(browser.includes('R723 verified recall'),'R723 browser proof missing');
console.log('R723 verified source recall, ranking, inspection, refusal and OMEGA7 UI contract PASS');
