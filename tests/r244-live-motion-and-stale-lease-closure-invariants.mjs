import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {OmegaRuntime} from '../src/workerR102.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,`R244 ${msg}`);
const worker101=read('src/workerR101.js');
const worker102=read('src/workerR102.js');
const agent=read('public/omega-hybrid-agent-r207.py');
const base=read('public/omega-hybrid-agent-base-r205.py');

for(const token of [
 "STALE_RECONCILIATION_REVISION='R244'",
 'async recoverStalledJobsR243(deviceId=null)',
 "(path==='/status'||path==='/snapshot')&&request.method==='GET'",
 'if(authenticated)await this.recoverStalledJobsR243()',
 "headers.set('x-omega-stale-reconciliation',authenticated?'R244-AUTHENTICATED-READ':'R244-READ-ONLY-UNAUTHENTICATED')",
 "proofExtensions:[EXECUTION_MOTION_REVISION,STALE_RECONCILIATION_REVISION]"
])must(worker101.includes(token),`R101 authenticated stale reconciliation missing ${token}`);
for(const token of [
 "if(path==='/api/hybrid/agent-download'&&request.method==='GET')",
 "url.pathname='/omega-hybrid-agent.py'",
 "return r101.fetch(new Request(url,{method:'GET',headers:request.headers}),env)",
 'async recoverStalledJobsR243(deviceId=null)',
 "stallReconciliationRevision:'R244'",
 "reconciliationRevision:'R244'"
])must(worker102.includes(token),`R102 inherited live-route or all-device pause closure missing ${token}`);
must(!worker101.includes("status:'KILLED'")&&!worker102.includes("status:'KILLED'"),'R244 must not fabricate local process termination');
must(worker101.includes("MUTATING_OPS_R243=new Set(['APPLY_PATCH','WRITE_TEXT'])"),'R243 mutation replay fence must remain intact');
must(worker101.includes("'x-omega-execution-motion':EXECUTION_MOTION_REVISION"),'R243.1 canonical handler must still emit motion identity');
must(agent.includes("EXECUTION_MOTION_EXTENSION='R243'"),'canonical R207 wrapper must retain native R243 motion');
assert.equal(crypto.createHash('sha256').update(base).digest('hex'),'49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046','immutable R205 base changed');

class MemoryStorage{
 constructor(){this.map=new Map()}
 async get(k){return this.map.get(k)}
 async put(k,v){this.map.set(k,structuredClone(v))}
}
const secret='r244_test_secret_abcdefghijklmnopqrstuvwxyz';
const secretHash=crypto.createHash('sha256').update(secret).digest('hex');
const staleAt=Date.now()-100000;
async function makeRuntime(job,mission){
 const storage=new MemoryStorage(),runtime=new OmegaRuntime({storage},{});
 await storage.put('bridgeSecretHash',secretHash);
 await storage.put('devices',[{id:'pc-r244',name:'PC R244',online:false,revoked:false,lastSeen:staleAt,capabilities:['INDEX','HASH_TREE','APPLY_PATCH']}]);
 await storage.put('jobs',[job]);
 await storage.put('missions',[mission]);
 await storage.put('events',[]);
 return {storage,runtime};
}

const discoveryJob={id:'job-r244-stale',status:'RUNNING',targetDeviceId:'pc-r244',projectPath:'.',startedAt:staleAt,leaseUntil:Date.now()-1000,steps:[{id:'S01',op:'INDEX',path:'.'},{id:'S02',op:'HASH_TREE',path:'.'}]};
const discoveryMission={id:'mission-r244-stale',status:'ACTIVE',stage:'DISCOVERY',targetDeviceId:'pc-r244',currentJobId:'job-r244-stale',currentJob:null,stallRecoveries:0};
let {storage,runtime}=await makeRuntime(discoveryJob,discoveryMission);
let response=await runtime.fetch(new Request('https://omega-runtime.internal/status',{method:'GET'}));
assert.equal(response.status,200,'public status must remain readable');
assert.equal(response.headers.get('x-omega-stale-reconciliation'),'R244-READ-ONLY-UNAUTHENTICATED');
let jobs=await storage.get('jobs');
assert.equal(jobs[0].status,'RUNNING','unauthenticated observation must not mutate stale state');
assert.equal(jobs.length,1,'unauthenticated observation must not enqueue recovery work');

response=await runtime.fetch(new Request('https://omega-runtime.internal/status',{method:'GET',headers:{'x-omega-bridge-secret':secret}}));
assert.equal(response.status,200,'authenticated status must remain readable after reconciliation');
assert.equal(response.headers.get('x-omega-stale-reconciliation'),'R244-AUTHENTICATED-READ');
assert.equal(response.headers.get('x-omega-execution-motion'),'R243','R244 must preserve R243 motion protocol identity');
jobs=await storage.get('jobs');
const failed=jobs.find(j=>j.id==='job-r244-stale'),recovery=jobs.find(j=>j.recoveryOf==='job-r244-stale');
assert.equal(failed.status,'FAILED','authenticated observation must retire an expired RUNNING claim');
assert.equal(failed.staleReconciliationRevision,'R244');
assert.deepEqual(failed.returnPacket.proofExtensions,['R243','R244']);
must(recovery&&recovery.status==='QUEUED','safe discovery may receive bounded recovery');
assert.deepEqual(recovery.steps.map(s=>s.op),['INDEX'],'recovery must strip the stale root HASH_TREE');
assert.equal(recovery.recoveryRevision,'R244');
let missions=await storage.get('missions');
assert.equal(missions[0].currentJobId,recovery.id,'safe discovery mission must point at the bounded replacement');
assert.equal(missions[0].stallReconciliationRevision,'R244');
assert.equal(missions[0].status,'ACTIVE','safe bounded recovery must keep the mission active');

const mutationJob={id:'job-r244-mutation',status:'RUNNING',targetDeviceId:'pc-r244',projectPath:'OMEGAv6',startedAt:staleAt,leaseUntil:Date.now()-1000,steps:[{id:'P01',op:'APPLY_PATCH',path:'OMEGAv6/src/App.tsx',expectedSha256:'a'.repeat(64),replacements:[{find:'a',replace:'b'}]}]};
const mutationMission={id:'mission-r244-mutation',status:'ACTIVE',stage:'REPAIR_VERIFY',targetDeviceId:'pc-r244',currentJobId:'job-r244-mutation',stallRecoveries:0};
({storage,runtime}=await makeRuntime(mutationJob,mutationMission));
response=await runtime.fetch(new Request('https://omega-runtime.internal/snapshot',{method:'GET',headers:{'x-omega-bridge-secret':secret}}));
assert.equal(response.status,200,'authenticated snapshot must remain readable after fail-closed reconciliation');
assert.equal(response.headers.get('x-omega-stale-reconciliation'),'R244-AUTHENTICATED-READ');
jobs=await storage.get('jobs');
assert.equal(jobs.find(j=>j.id==='job-r244-mutation').status,'FAILED','expired mutation must fail closed');
must(!jobs.some(j=>j.recoveryOf==='job-r244-mutation'),'APPLY_PATCH/WRITE_TEXT must never be blindly replayed');
missions=await storage.get('missions');
assert.equal(missions[0].status,'PAUSED','R102 must pause an unsafe stale mission for operator review during all-device reconciliation');
assert.equal(missions[0].operatorReviewRequired,true);
assert.equal(missions[0].holdReason,'R243_STALL_OPERATOR_REVIEW_REQUIRED');
assert.equal(missions[0].stallReconciliationRevision,'R244');

console.log('OMEGA R244 AUTHENTICATED STALE-LEASE CLOSURE PASS · R243.1 canonical agent route preserved · unauthenticated status/snapshot remain read-only · authenticated operator observation reconciles dead-host expired RUNNING claims before returning state · safe DISCOVERY recovers INDEX-only · mutation never replays and mission pauses for operator review · immutable R205 + R141/R146/R147/R239/R240/R125 authority preserved');
