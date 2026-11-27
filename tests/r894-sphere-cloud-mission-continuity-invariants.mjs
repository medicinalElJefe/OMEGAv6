import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {agentId} from '../src/sphereAgentFabricR887.mjs';
import {R889_SCHEMA} from '../src/sphereSwarmBridgeR889.mjs';
import {R890_SCHEMA} from '../src/sphereCollectiveR890.mjs';
import {R894_SCHEMA,R894_STORAGE_KEY,serializeMissionJournalR894,restoreMissionJournalR894,shouldWatchMissionR894} from '../src/sphereMissionJournalR894.mjs';
const id=agentId(3,17),single={schema:R889_SCHEMA,originAgent:id,originShell:3,originOuter:17,originInner:139,missionId:'mission_R889-7',status:'QUEUED',truthClass:'CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED',localStateMutated:false};
const collective={schema:R890_SCHEMA,rootAgent:id,inner:139,members:[id,id+1,id+2],missionId:'mission_R890-8',status:'RECEIVED',authority:'SWARM_RESULT_NOT_CANON_ADMITTED',localMutation:false};
const saved=serializeMissionJournalR894(single,collective);
const result=restoreMissionJournalR894(saved);
assert.equal(JSON.parse(saved).schema,R894_SCHEMA);
assert.equal(result.single.missionId,single.missionId);
assert.equal(result.single.originAgent,id);
assert.equal(result.single.externalProof,'NOT_ESTABLISHED_BY_JOURNAL');
assert.deepEqual(result.collective.members,[id,id+1,id+2]);
assert.equal(result.collective.localMutation,false);
assert.equal(serializeMissionJournalR894(result.single,result.collective),saved);
assert.deepEqual(restoreMissionJournalR894(null),{single:null,collective:null});
assert.equal(shouldWatchMissionR894(result.single),true);
assert.equal(shouldWatchMissionR894(result.collective),true);
for(const s of ['COMPLETE','FAILED','CANCELLED','TIMED_OUT','PAUSED'])assert.equal(shouldWatchMissionR894({...result.single,status:s}),false);
assert.throws(()=>restoreMissionJournalR894('not-json'),/Malformed/);
assert.throws(()=>restoreMissionJournalR894('x'.repeat(8193)),/oversized/);
assert.throws(()=>serializeMissionJournalR894({...single,originAgent:-1},null),/Untrusted/);
assert.throws(()=>serializeMissionJournalR894({...single,originOuter:18},null),/Untrusted/);
assert.throws(()=>serializeMissionJournalR894({...single,missionId:'../bad'},null),/Untrusted/);
assert.throws(()=>serializeMissionJournalR894({...single,localStateMutated:true},null),/Untrusted/);
assert.throws(()=>serializeMissionJournalR894(null,{...collective,members:[id,id]}),/Untrusted/);
assert.throws(()=>serializeMissionJournalR894(null,{...collective,authority:'CANON_APPROVED'}),/Untrusted/);
for(const badStatus of ['COMPLETE_BUT_NOT_REAL','',42,null,'RUNNING\\nCANON_APPROVED']){
 assert.throws(()=>restoreMissionJournalR894(JSON.stringify({schema:R894_SCHEMA,single:{...single,status:badStatus},collective:null})),/Untrusted cloud mission status/);
 assert.throws(()=>restoreMissionJournalR894(JSON.stringify({schema:R894_SCHEMA,single:null,collective:{...collective,status:badStatus}})),/Untrusted cloud mission status/);
}
// R894 STRICT IDENTITY: the restored journal must fail closed when any address,
// root membership, or mission identifier is altered independently of its status.
for(const candidate of [
  {...single,originShell:4},
  {...single,originInner:20736},
  {...single,originOuter:20736},
  {...single,originAgent:id+1},
  {...single,missionId:'x'.repeat(129)},
  {...single,truthClass:'CANON_ADMITTED'}
])assert.throws(()=>restoreMissionJournalR894(JSON.stringify({schema:R894_SCHEMA,single:candidate,collective:null})),/Untrusted/);
for(const candidate of [
  {...collective,members:[id+1,id+2]},
  {...collective,members:[id,-1]},
  {...collective,members:Array.from({length:13},(_,i)=>id+i)},
  {...collective,rootAgent:-1},
  {...collective,inner:20736},
  {...collective,missionId:'../forged'},
  {...collective,localMutation:true}
])assert.throws(()=>restoreMissionJournalR894(JSON.stringify({schema:R894_SCHEMA,single:null,collective:candidate})),/Untrusted/);
assert.throws(()=>restoreMissionJournalR894(JSON.stringify({schema:R894_SCHEMA})),/Invalid/);
const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');
for(const token of ['R894_STORAGE_KEY','serializeMissionJournalR894','restoreMissionJournalR894','shouldWatchMissionR894','Watch individual cloud mission read-only','Watch collective cloud mission read-only','5000','api.get<any>','window.localStorage.setItem(R894_STORAGE_KEY'])assert.ok(ui.includes(token),'R894 UI contract missing '+token);
const watchers=ui.split(" useEffect(()=>{if(!watchCloud")[1]?.split(" const choose=")[0]||'';
assert.ok(!watchers.includes('api.post<'),'R894 status watch must never dispatch a cloud mission');
console.log('R894 PASS: bounded persistent cloud mission identity, read-only watch, schema and authority preservation, malicious journal rejection, no ambient POST.');
