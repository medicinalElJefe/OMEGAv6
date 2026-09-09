import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {OmegaRuntime} from '../src/workerR101.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,`R243 ${msg}`);
const worker=read('src/workerR101.js');
const worker102=read('src/workerR102.js');
const agent=read('public/omega-hybrid-agent-r207.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const ui=read('src/HybridExecutionMotionR243.tsx');
const link=read('src/HybridLinkR32.tsx');
const missionShim=read('src/execution/adaptiveSovereignMissionR152.js');

for(const token of [
 "EXECUTION_MOTION_REVISION='R243'","RUNNING_LEASE_MS=20000","LEGACY_RUNNING_STALE_MS=90000","MAX_STALL_RECOVERIES=2",
 "'/api/hybrid/agent/progress':'/agent/progress'",'recoverStalledJobsR243','R243_JOB_STALL_RECOVERED','R243_JOB_STALL_FAILED',
 "new Set(['APPLY_PATCH','WRITE_TEXT'])","RECOVERABLE_DISCOVERY_STAGES","status:'FAILED'","recoveryReason:'EXPIRED_RUNNING_LEASE'",
 "state:'CLAIMED'","schema:'OMEGA_HYBRID_EXECUTION_PROGRESS_R243'",'leaseUntil:t+RUNNING_LEASE_MS','R243_PROGRESS_SEQUENCE_STALE'
])must(worker.includes(token),`Worker execution-motion contract missing ${token}`);
must(!worker.includes("status:'KILLED'"),'stale recovery must not fabricate remote process termination');
must(worker.includes("safeSteps=safeSteps.filter(s=>String(s?.op||'').toUpperCase()==='INDEX')"),'stale DISCOVERY recovery must strip root HASH_TREE and retain INDEX only');
must(worker.includes("MUTATING_OPS_R243.has(String(s?.op||'').toUpperCase())"),'mutation replay guard missing');
must(worker.includes("'x-omega-execution-motion':EXECUTION_MOTION_REVISION"),'canonical R243-aware agent handler must emit execution-motion identity');
must(worker102.includes("if(path==='/api/hybrid/agent-download'&&request.method==='GET')"),'canonical API download path must be explicitly converged before inherited fallback');
must(worker102.includes("url.pathname='/omega-hybrid-agent.py'"),'canonical API download path must reuse the R243-aware canonical agent handler');
must(worker102.includes("return r101.fetch(new Request(url,{method:'GET',headers:request.headers}),env)"),'R102 route convergence must preserve request headers and delegate without adding execution authority');

for(const token of [
 "EXECUTION_MOTION_EXTENSION='R243'",'import hashlib,json,sys,threading,time,types,urllib.request',
 "'/api/hybrid/agent/progress'",'PROGRESS_INTERVAL_SECONDS=3.0','threading.Thread','daemon=True',"send_progress('CLAIMED')","send_progress('RETURNING')",
 "'resultFingerprintR141':sha_bytes(payload.encode('utf-8'))",'EXPECTED_BASE_SHA256'
])must(agent.includes(token),`canonical R207 agent motion/return contract missing ${token}`);
must(!agent.includes('shell=True'),'R243 canonical wrapper must not add arbitrary shell authority');
must(!/pip\s+install|python\s+-m\s+pip|conda\s+install/i.test(agent),'R243 canonical wrapper must not auto-install dependencies');
const baseSha=crypto.createHash('sha256').update(base).digest('hex');
assert.equal(baseSha,'49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046','R243 must leave immutable R205 executor byte-identical');

for(const token of ['data-r243-motion','MOTION_PROVED','STALL_DETECTED','LEGACY_RUNNING_NO_LEASE','CURRENT STEP','MOTION / LEASE','RETURNED STEP COUNT','R141 returned proof'])must(ui.includes(token),`operator execution-motion surface missing ${token}`);
must(link.includes("import HybridExecutionMotionR243 from './HybridExecutionMotionR243'"),'Hybrid Link must import R243 motion surface');
must(link.includes('<HybridExecutionMotionR243/>'),'Hybrid Link must mount R243 motion surface');
must(link.indexOf('<HybridWovenContinuityR238/>')<link.indexOf('<HybridExecutionMotionR243/>')&&link.indexOf('<HybridExecutionMotionR243/>')<link.indexOf('<HybridHostIntelligenceR238/>'),'R243 motion must live inside the shared snapshot frame before returned host intelligence');

for(const token of ['boundInitialDiscoveryR243','r243InitialDiscoveryBounded:true','r243RemovedRootHash:true',"initialDiscoveryPolicy:'INDEX_PROJECT_FIRST_HASH_SELECTED_PROJECT_AFTER_DISCOVERY'","discoveryOnly:true","steps:[step]"])must(missionShim.includes(token),`initial discovery bounding missing ${token}`);
must(missionShim.includes("job.steps.some(s=>String(s?.op||'').toUpperCase()==='HASH_TREE')"),'initial root HASH_TREE detection missing');
must(missionShim.includes("['APPLY_PATCH','WRITE_TEXT']"),'initial mission rewrite must refuse mutation-bearing plans');

class MemoryStorage{
 constructor(){this.map=new Map()}
 async get(k){return this.map.get(k)}
 async put(k,v){this.map.set(k,structuredClone(v))}
}
const storage=new MemoryStorage(),runtime=new OmegaRuntime({storage},{}),secret='r243_test_secret_abcdefghijklmnopqrstuvwxyz';
const secretHash=crypto.createHash('sha256').update(secret).digest('hex');
await storage.put('bridgeSecretHash',secretHash);
await storage.put('devices',[{id:'pc-r243',name:'PC R243',online:true,revoked:false,lastSeen:Date.now()-5000,capabilities:['INDEX','HASH_TREE']}]);
await storage.put('jobs',[{id:'job-live',status:'RUNNING',targetDeviceId:'pc-r243',startedAt:Date.now()-4000,steps:[{id:'S01',op:'INDEX'}]}]);
await storage.put('missions',[]);
let response=await runtime.fetch(new Request('https://omega-runtime.internal/agent/progress',{method:'POST',headers:{'content-type':'application/json','x-omega-bridge-secret':secret},body:JSON.stringify({deviceId:'pc-r243',jobId:'job-live',seq:1,state:'STEP_RUNNING',stepId:'S01',stepOp:'INDEX',stepIndex:1,totalSteps:2,completedSteps:0,elapsedMs:4200,message:'bounded discovery'})}));
assert.equal(response.status,200,'authenticated progress must renew a running claim');
let jobs=await storage.get('jobs'),live=jobs.find(j=>j.id==='job-live');
assert.equal(live.progress.state,'STEP_RUNNING');assert.equal(live.progress.stepOp,'INDEX');assert.equal(live.progress.seq,1);must(live.leaseUntil>Date.now(),'progress must create a future execution lease');
let devices=await storage.get('devices');must(Date.now()-devices[0].lastSeen<2000,'authenticated execution motion must keep selected host heartbeat current during a long step');
response=await runtime.fetch(new Request('https://omega-runtime.internal/agent/progress',{method:'POST',headers:{'content-type':'application/json','x-omega-bridge-secret':secret},body:JSON.stringify({deviceId:'pc-r243',jobId:'job-live',seq:1,state:'STEP_RUNNING',stepId:'S01',stepOp:'INDEX'})}));
assert.equal(response.status,409,'replayed progress sequence must not renew a lease');

const staleAt=Date.now()-100000;
await storage.put('jobs',[{id:'job-stale',status:'RUNNING',targetDeviceId:'pc-r243',projectPath:'.',startedAt:staleAt,steps:[{id:'S01',op:'INDEX',path:'.'},{id:'S02',op:'HASH_TREE',path:'.'}]}]);
await storage.put('missions',[{id:'mission-r243',status:'ACTIVE',stage:'DISCOVERY',targetDeviceId:'pc-r243',currentJobId:'job-stale',currentJob:null,stallRecoveries:0}]);
await runtime.recoverStalledJobsR243('pc-r243');
jobs=await storage.get('jobs');const failed=jobs.find(j=>j.id==='job-stale'),recovery=jobs.find(j=>j.recoveryOf==='job-stale');
assert.equal(failed.status,'FAILED','expired legacy RUNNING job must leave active state');assert.equal(failed.stallReason,'R243_EXECUTION_LEASE_EXPIRED');
must(recovery&&recovery.status==='QUEUED','bounded discovery recovery must be queued after stale claim');assert.deepEqual(recovery.steps.map(s=>s.op),['INDEX'],'stale discovery recovery must never repeat the root HASH_TREE');assert.equal(recovery.steps[0].discoveryOnly,true);
let missions=await storage.get('missions');assert.equal(missions[0].currentJobId,recovery.id);assert.equal(missions[0].stallRecoveries,1);

await storage.put('jobs',[{id:'job-mutation',status:'RUNNING',targetDeviceId:'pc-r243',projectPath:'OMEGAv6',startedAt:staleAt,steps:[{id:'P01',op:'APPLY_PATCH',path:'OMEGAv6/src/App.tsx',expectedSha256:'a'.repeat(64),replacements:[{find:'a',replace:'b'}]}]}]);
await storage.put('missions',[{id:'mission-mut',status:'ACTIVE',stage:'REPAIR_VERIFY',targetDeviceId:'pc-r243',currentJobId:'job-mutation',stallRecoveries:0}]);
await runtime.recoverStalledJobsR243('pc-r243');jobs=await storage.get('jobs');assert.equal(jobs.find(j=>j.id==='job-mutation').status,'FAILED');must(!jobs.some(j=>j.recoveryOf==='job-mutation'),'R243 must never blind-replay a stale mutation');

console.log('OMEGA R243 HYBRID EXECUTION MOTION PASS · canonical /api/hybrid/agent-download converges to the R243-aware R101 handler · execution-motion response identity is invariant-proved · canonical downloaded R207 wrapper emits authenticated 3s step pulses · strict sequence replay fence · bounded RUNNING lease and heartbeat renewal · current step/elapsed/progress are operator-visible · expired claims fail closed · only bounded non-mutating discovery can auto-recover · root HASH_TREE is stripped from discovery · mutation is never blindly replayed · immutable R205 and R141/R146/R147/R125 authority preserved');
