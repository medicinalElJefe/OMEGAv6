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
assert.throws(()=>restoreMissionJournalR894('x'.repeat(262145)),/oversized/);
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

const {validateSwarmStatusR889}=await import('../src/sphereSwarmBridgeR889.mjs');
const {collectiveStatusR890}=await import('../src/sphereCollectiveR890.mjs');
const {reconcileMissionReturnR1008}=await import('../src/sphereCellReturnsR1008.mjs');
const {capabilityProfile}=await import('../src/swarm/swarmCoreR121.js');
const row1008=(index,ok=true)=>{const p=capabilityProfile(index);return{cellId:p.cellId,index,organ:p.domainRole,phase:p.phaseRole,executor:'DETERMINISTIC',ok,status:ok?200:500,summary:'actual coordinator preview '+index,receiptSha:ok?'a'.repeat(64):null}};
const response1008=(receipt,rows,total)=>({mission:{schema:'OMEGA_SWARM_MISSION_R121',id:receipt.missionId,status:'COMPLETE',total,completed:rows.filter(x=>x.ok).length,failed:rows.filter(x=>!x.ok).length,recent:rows,canonicalMutation:false}});
const solo1008=validateSwarmStatusR889(response1008(boundSingle1006,[row1008(17)],1),boundSingle1006);
const flock1008=collectiveStatusR890(response1008(boundCollective1006,[row1008(33),row1008(17),row1008(0,false)],3),boundCollective1006);
const recovered1008=restoreMissionJournalR894(serializeMissionJournalR894(solo1008,flock1008));
assert.deepEqual(recovered1008.single.cellReturns,solo1008.cellReturns);
assert.deepEqual(recovered1008.collective.cellReturns,flock1008.cellReturns);
assert.deepEqual(JSON.parse(exportMissionReturnR1007(recovered1008.collective)).receipt.cellReturns,flock1008.cellReturns);
assert.equal(recovered1008.collective.cellReturns.canonicalMutation,false);
for(const rows of [[row1008(17),row1008(17)],[{...row1008(17),index:18}],[{...row1008(17),organ:'PHYSICS'}],[{...row1008(17),receiptSha:'fake'}],[{...row1008(17),summary:'x'.repeat(1201)}],[{...row1008(17),status:500}]]){
 assert.throws(()=>collectiveStatusR890(response1008(boundCollective1006,rows,3),boundCollective1006),/Untrusted/);
}
assert.throws(()=>serializeMissionJournalR894({...solo1008,cellReturns:{...solo1008.cellReturns,missionId:'other'}},null),/Untrusted/);
assert.equal(reconcileMissionReturnR1008(solo1008,{...solo1008,status:'RUNNING',completed:0}),solo1008);
assert.equal(reconcileMissionReturnR1008(solo1008,{...solo1008,missionId:'other'}),solo1008);
assert.equal(reconcileMissionReturnR1008(single,solo1008),solo1008);
assert.match(ui,/data-r1008-cell-returns/);
console.log('R1008 PASS: coordinator cell previews persist and export with distinct identities and monotonic response guard.');

const {captureAcceptedPlanR1009}=await import('../src/sphereCellReturnsR1008.mjs');
const {planMissionR121,compactPlanR121}=await import('../src/swarm/swarmCoreR121.js');
const p1009=compactPlanR121(planMissionR121({intent:'Bounded plan provenance regression',mode:'FLOCK',requestedCells:3,providerBudget:0}));
const m1009={schema:'OMEGA_SWARM_MISSION_R121',id:boundCollective1006.missionId,total:p1009.sampleCells.length,canonicalMutation:false};
const receipt1009={...boundCollective1006,...captureAcceptedPlanR1009({mission:m1009,plan:p1009},3)};
const rows1009=p1009.sampleCells.map(x=>row1008(x.index));
const result1009=collectiveStatusR890(response1008(receipt1009,rows1009,rows1009.length),receipt1009);
assert.deepEqual(restoreMissionJournalR894(serializeMissionJournalR894(null,result1009)).collective.acceptedPlan,receipt1009.acceptedPlan);
const outsider1009=Array.from({length:1728},(_,i)=>i).find(i=>!p1009.sampleCells.some(x=>x.index===i));
assert.throws(()=>collectiveStatusR890(response1008(receipt1009,[row1008(outsider1009)],rows1009.length),receipt1009),/outside accepted/);
assert.throws(()=>serializeMissionJournalR894(null,{...result1009,completed:0}),/Untrusted restored cell counts/);
assert.throws(()=>captureAcceptedPlanR1009({mission:m1009,plan:{...p1009,sampleCells:[...p1009.sampleCells.slice(1),{...p1009.sampleCells[0],lane:-1}]}},3),/Untrusted planned/);
assert.match(ui,/data-r1009-accepted-plan/);
console.log('R1009 PASS: accepted coordinator plan identities, lanes, restored counts and returned membership enforced.');

// R1010 must run in the active convergence suite, not only the historical R121 suite.
await import('./r1010-swarm-durable-recovery-invariants.mjs');

const {resultDigestR1012,verifyDeterministicReturnR1012}=await import('../src/sphereResultBytesR1012.mjs');
const payload1012=JSON.stringify({kind:'DETERMINISTIC_CELL_ANALYSIS',summary:'actual bounded result',metrics:{wordCount:4}});
const row1012={...row1008(17),resultJson:payload1012,receiptSha:await resultDigestR1012(payload1012)};
const status1012=validateSwarmStatusR889(response1008(boundSingle1006,[row1012],1),boundSingle1006);
const restored1012=restoreMissionJournalR894(serializeMissionJournalR894(status1012,null)).single;
assert.equal(await verifyDeterministicReturnR1012(restored1012.cellReturns.rows[0]),true);
assert.equal(await verifyDeterministicReturnR1012({...row1012,receiptSha:'b'.repeat(64)}),false);
assert.equal(JSON.parse(exportMissionReturnR1007(restored1012)).receipt.cellReturns.rows[0].resultJson,payload1012);
assert.throws(()=>validateSwarmStatusR889(response1008(boundSingle1006,[{...row1012,resultJson:'invalid'}],1),boundSingle1006),/Untrusted/);
assert.match(ui,/Verify returned payload SHA-256/);
console.log('R1012 browser contract PASS: payload survives journal and export; byte consistency is explicitly checkable.');
