import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {agentId} from '../src/sphereAgentFabricR887.mjs';
import {R889_SCHEMA} from '../src/sphereSwarmBridgeR889.mjs';
import {R890_SCHEMA} from '../src/sphereCollectiveR890.mjs';
import {R894_SCHEMA,R894_STORAGE_KEY,serializeMissionJournalR894,restoreMissionJournalR894,shouldWatchMissionR894,bindSaiMissionR1006,exportSaiMissionCsvR1006,exportMissionReturnR1007} from '../src/sphereMissionJournalR894.mjs';
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
assert.throws(()=>restoreMissionJournalR894('x'.repeat(32769)),/oversized/);
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

// R1006 accepted R121 SOLO/FLOCK missions preserve a bounded, inspectable,
// client-supplied SAI context with explicit non-authentication semantics.
const digest1006='a'.repeat(64),source1006='b'.repeat(64),model1006='c'.repeat(64);
const row1006=agent=>({agent,outer:agent%20736,prediction:agent/248832,sourceSha256:source1006,modelSha256:model1006});
const sai1006=ids=>({schema:'OMEGA_SAI_CLOUD_CONTEXT_R1005',fieldSha256:digest1006,weight:0.125,
 steps:4,rows:ids.map(row1006),authority:'OPERATOR_SUPPLIED_PROJECTED_MODEL_OUTPUT_NOT_SERVER_VERIFIED',canonicalMutation:false});
const boundSingle1006=bindSaiMissionR1006(single,sai1006([id]));
const boundCollective1006=bindSaiMissionR1006(collective,sai1006(collective.members));
const journal1006=serializeMissionJournalR894(boundSingle1006,boundCollective1006);
const recovered1006=restoreMissionJournalR894(journal1006);
assert.deepEqual(recovered1006.single.saiContext,boundSingle1006.saiContext);
assert.deepEqual(recovered1006.collective.saiContext,boundCollective1006.saiContext);
assert.equal(serializeMissionJournalR894(recovered1006.single,recovered1006.collective),journal1006);
assert.equal(exportSaiMissionCsvR1006(recovered1006.collective).trim().split('\n').length,4);
assert.match(exportSaiMissionCsvR1006(recovered1006.single),/OPERATOR_SUPPLIED_PROJECTED_MODEL_OUTPUT_NOT_SERVER_VERIFIED/);
assert.equal(bindSaiMissionR1006(single,undefined),single);
assert.throws(()=>exportSaiMissionCsvR1006(single),/No bounded/);
for(const altered of [
 {...sai1006([id]),fieldSha256:'not-a-digest'},
 {...sai1006([id]),canonicalMutation:true},
 {...sai1006([id]),authority:'SERVER_VERIFIED'},
 {...sai1006([id]),rows:[row1006(id+1)]},
 {...sai1006([id]),rows:[{...row1006(id),prediction:Infinity}]},
 {...sai1006([id]),rows:[{...row1006(id),sourceSha256:'invalid'}]},
])assert.throws(()=>bindSaiMissionR1006(single,altered),/Untrusted/);
assert.throws(()=>restoreMissionJournalR894(JSON.stringify({schema:R894_SCHEMA,single:{...single,saiContext:sai1006([id+1])},collective:null})),/Untrusted/);
assert.match(ui,/data-r1006-sai-context/);
assert.match(ui,/Download submitted SAI context CSV/);
assert.match(ui,/bindSaiMissionR1006\(validateSwarmReturnR889/);
assert.match(ui,/bindSaiMissionR1006\(collectiveReceiptR890/);
console.log('R1006 PASS: accepted SOLO/FLOCK context visible, downloadable, durable and fail-closed; no claim of independent cloud verification.');

const returnedSolo1007={...boundSingle1006,status:'COMPLETE',completed:1,failed:0,reportedSynthesis:'Returned solo output'};
const returnedFlock1007={...boundCollective1006,status:'COMPLETE',completed:3,failed:0,summary:'Returned flock output'};
const restored1007=restoreMissionJournalR894(serializeMissionJournalR894(returnedSolo1007,returnedFlock1007));
assert.equal(restored1007.single.reportedSynthesis,'Returned solo output');
assert.equal(restored1007.collective.summary,'Returned flock output');
assert.equal(restored1007.collective.completed,3);
assert.equal(restored1007.single.failed,0);
assert.deepEqual(restored1007.single.saiContext,boundSingle1006.saiContext);
assert.equal(JSON.parse(exportMissionReturnR1007(restored1007.single)).authority,'REPORTED_CLOUD_OUTPUT_NOT_INDEPENDENTLY_VERIFIED');
assert.equal(JSON.parse(exportMissionReturnR1007(restored1007.collective)).receipt.summary,'Returned flock output');
assert.throws(()=>exportMissionReturnR1007(single),/No returned/);
for(const bad of [{completed:-1},{failed:1.5},{reportedSynthesis:'x'.repeat(1201)}])assert.throws(()=>serializeMissionJournalR894({...single,...bad},null),/Untrusted/);
assert.match(ui,/Download returned mission JSON/);
console.log('R1007 PASS: bounded cloud returns persist and export without authority promotion.');
