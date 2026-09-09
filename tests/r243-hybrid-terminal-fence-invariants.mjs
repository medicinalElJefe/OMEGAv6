import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {OmegaRuntime} from '../src/workerR102.js';

const must=(ok,msg)=>assert.ok(ok,`R243 terminal fence ${msg}`);
const source=fs.readFileSync('src/workerR102.js','utf8');
for(const token of [
 'R243_LEGACY_RUNNING_STALE_MS=90000','R243_TERMINAL_RESULT_FENCED','R243_RESULT_LEASE_EXPIRED',
 'R243_STALL_OPERATOR_REVIEW_REQUIRED','R243_MISSION_STALL_PAUSED',"status:'PAUSED'",'operatorReviewRequired:true',
 "status!=='RUNNING'","target?.leaseUntil||0"
])must(source.includes(token),`source contract missing ${token}`);

class MemoryStorage{
 constructor(){this.map=new Map()}
 async get(k){return this.map.get(k)}
 async put(k,v){this.map.set(k,structuredClone(v))}
}
const storage=new MemoryStorage(),runtime=new OmegaRuntime({storage},{}),secret='r243_terminal_fence_secret_abcdefghijklmnopqrstuvwxyz';
await storage.put('bridgeSecretHash',crypto.createHash('sha256').update(secret).digest('hex'));
await storage.put('devices',[{id:'pc-a',name:'PC A',lastSeen:Date.now(),revoked:false,online:true,capabilities:['INDEX','HASH_TREE','APPLY_PATCH']}]);
const headers={'content-type':'application/json','x-omega-bridge-secret':secret};
const postResult=body=>runtime.fetch(new Request('https://omega-runtime.internal/agent/result',{method:'POST',headers,body:JSON.stringify(body)}));

await storage.put('jobs',[{id:'job-live',status:'RUNNING',targetDeviceId:'pc-a',startedAt:Date.now()-1000,leaseUntil:Date.now()+15000,steps:[{id:'S01',op:'INDEX'}]}]);
await storage.put('missions',[]);
let response=await postResult({deviceId:'pc-a',jobId:'job-live',ok:true,capabilityRevision:'R132',proofExtensions:['R205','R243'],stepProofs:[],outputPaths:[],log:'returned'});
assert.equal(response.status,200,'live leased exact claim must preserve normal result path');
let jobs=await storage.get('jobs');assert.equal(jobs[0].status,'COMPLETE');

response=await postResult({deviceId:'pc-a',jobId:'job-live',ok:false,stepProofs:[],log:'late overwrite attempt'});
assert.equal(response.status,409,'terminal duplicate must be fenced');
let body=await response.json();assert.equal(body.code,'R243_TERMINAL_RESULT_FENCED');
jobs=await storage.get('jobs');assert.equal(jobs[0].status,'COMPLETE','late result must not replace terminal state');

response=await postResult({deviceId:'pc-b',jobId:'job-live',ok:true,stepProofs:[]});
assert.equal(response.status,404,'wrong-device return must remain JOB_NOT_FOUND');

await storage.put('jobs',[{id:'job-expired',status:'RUNNING',targetDeviceId:'pc-a',startedAt:Date.now()-30000,leaseUntil:Date.now()-1,steps:[{id:'S01',op:'INDEX'}]}]);
response=await postResult({deviceId:'pc-a',jobId:'job-expired',ok:true,stepProofs:[],log:'too late'});
assert.equal(response.status,409);body=await response.json();assert.equal(body.code,'R243_RESULT_LEASE_EXPIRED');
jobs=await storage.get('jobs');assert.equal(jobs[0].status,'RUNNING','result fence itself must not fabricate terminal execution state');

const staleAt=Date.now()-100000;
await storage.put('jobs',[{id:'job-mut',status:'RUNNING',targetDeviceId:'pc-a',startedAt:staleAt,steps:[{id:'P01',op:'APPLY_PATCH',path:'OMEGAv6/src/App.tsx',expectedSha256:'a'.repeat(64),replacements:[{find:'a',replace:'b'}]}]}]);
await storage.put('missions',[{id:'mission-mut',status:'ACTIVE',stage:'REPAIR_VERIFY',targetDeviceId:'pc-a',currentJobId:'job-mut',stallRecoveries:0}]);
await runtime.recoverStalledJobsR243('pc-a');
jobs=await storage.get('jobs');let missions=await storage.get('missions');
assert.equal(jobs.find(j=>j.id==='job-mut').status,'FAILED');
must(!jobs.some(j=>j.recoveryOf==='job-mut'),'unsafe mutation must never auto-replay');
assert.equal(missions[0].status,'PAUSED');assert.equal(missions[0].holdReason,'R243_STALL_OPERATOR_REVIEW_REQUIRED');assert.equal(missions[0].operatorReviewRequired,true);

await storage.put('jobs',[{id:'job-discovery',status:'RUNNING',targetDeviceId:'pc-a',startedAt:staleAt,steps:[{id:'S01',op:'INDEX',path:'.'},{id:'S02',op:'HASH_TREE',path:'.'}]}]);
await storage.put('missions',[{id:'mission-discovery',status:'ACTIVE',stage:'DISCOVERY',targetDeviceId:'pc-a',currentJobId:'job-discovery',stallRecoveries:0}]);
await runtime.recoverStalledJobsR243('pc-a');
jobs=await storage.get('jobs');missions=await storage.get('missions');const recovery=jobs.find(j=>j.recoveryOf==='job-discovery');
must(recovery&&recovery.status==='QUEUED','safe discovery should still recover automatically');assert.deepEqual(recovery.steps.map(s=>s.op),['INDEX']);
assert.equal(missions[0].status,'ACTIVE');assert.equal(missions[0].currentJobId,recovery.id);assert.notEqual(missions[0].holdReason,'R243_STALL_OPERATOR_REVIEW_REQUIRED');

console.log('OMEGA R243 TERMINAL FENCE PASS · exact leased RUNNING returns remain valid · duplicate/terminal/cross-device/expired-lease returns fail closed · unsafe stalled mutation pauses mission for operator review · bounded discovery recovery remains automatic · no late process can overwrite replacement or terminal proof state');
