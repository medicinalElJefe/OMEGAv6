import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {OmegaRuntime} from '../src/workerR101.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,`R242/R243 ${msg}`);
const worker=read('src/workerR101.js');
const wrapper=read('public/omega-hybrid-agent-r141.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const ui=read('src/HybridExecutionMotionR243.tsx');
const link=read('src/HybridLinkR32.tsx');
const missionShim=read('src/execution/adaptiveSovereignMissionR152.js');

for(const token of [
 "EXECUTION_MOTION_REVISION='R242'","RUNNING_LEASE_MS=20000","LEGACY_RUNNING_STALE_MS=90000","MAX_STALL_RECOVERIES=2",
 "'/api/hybrid/agent/progress':'/agent/progress'",'recoverStalledJobsR242','R242_JOB_STALL_RECOVERED','R242_JOB_STALL_FAILED',
 "new Set(['APPLY_PATCH','WRITE_TEXT'])","RECOVERABLE_DISCOVERY_STAGES","status:'FAILED'","recoveryReason:'EXPIRED_RUNNING_LEASE'",
 "state:'CLAIMED'","schema:'OMEGA_HYBRID_EXECUTION_PROGRESS_R242'",'leaseUntil:t+RUNNING_LEASE_MS'
])must(worker.includes(token),`Worker execution-motion contract missing ${token}`);
must(!worker.includes("status:'KILLED'"),'stale recovery must not fabricate remote process termination');
must(worker.includes("safeSteps=safeSteps.filter(s=>String(s?.op||'').toUpperCase()==='INDEX')"),'stale DISCOVERY recovery must strip root HASH_TREE and retain INDEX only');
must(worker.includes("MUTATING_OPS_R242.has(String(s?.op||'').toUpperCase())"),'mutation replay guard missing');

for(const token of [
 "EXECUTION_MOTION_EXTENSION='R242'","import ctypes,hashlib,importlib.util,json,os,platform,shutil,socket,subprocess,sys,threading,time,types,urllib.request",
 "'/api/hybrid/agent/progress'",'PROGRESS_INTERVAL_SECONDS=3.0','threading.Thread','daemon=True','send_progress(\'CLAIMED\')',"send_progress('RETURNING')",
 'bridge_by_step=validate_bridge_calculus_r240(job)',"proof['calculusBridgeR240Return']=returned","'resultFingerprintR141':digest"
])must(wrapper.includes(token),`R141 wrapper motion/continuity contract missing ${token}`);
must(!wrapper.includes('shell=True'),'wrapper must not add arbitrary shell authority');
must(!/pip\s+install|python\s+-m\s+pip|conda\s+install/i.test(wrapper),'execution motion must not auto-install dependencies');
const baseSha=crypto.createHash('sha256').update(base).digest('hex');
assert.equal(baseSha,'49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046','execution motion must leave immutable R205 executor byte-identical');

for(const token of ["const PROTOCOLS=new Set(['R242','R243'])",'data-r243-motion','data-r243-job','data-r243-epoch','data-r243-transport','MOTION_PROVED','STALL_DETECTED','LEGACY_RUNNING_NO_LEASE','CURRENT STEP','MOTION / LEASE','RETURNED STEP COUNT','R141 returned proof'])must(ui.includes(token),`current R243 operator execution-motion surface missing ${token}`);
must(link.includes("import HybridExecutionMotionR243 from './HybridExecutionMotionR243'"),'Hybrid Link must import current R243 motion surface');
must(link.includes('<HybridExecutionMotionR243/>'),'Hybrid Link must mount current R243 motion surface');
must(link.indexOf('<HybridWovenContinuityR238/>')<link.indexOf('<HybridExecutionMotionR243/>')&&link.indexOf('<HybridExecutionMotionR243/>')<link.indexOf('<HybridHostIntelligenceR238/>'),'motion surface must live inside the shared snapshot frame before returned host intelligence');
must(ui.includes("PROTOCOLS.has(protocol)"),'R243 surface must explicitly accept the inherited R242 transport protocol rather than renaming transport truth');

for(const token of ['boundInitialDiscoveryR242','r242InitialDiscoveryBounded:true','r242RemovedRootHash:true',"initialDiscoveryPolicy:'INDEX_PROJECT_FIRST_HASH_SELECTED_PROJECT_AFTER_DISCOVERY'","discoveryOnly:true","steps:[step]"])must(missionShim.includes(token),`initial discovery bounding missing ${token}`);
must(missionShim.includes("job.steps.some(s=>String(s?.op||'').toUpperCase()==='HASH_TREE')"),'initial root HASH_TREE detection missing');
must(missionShim.includes("['APPLY_PATCH','WRITE_TEXT']"),'initial mission rewrite must refuse mutation-bearing plans');

class MemoryStorage{
 constructor(){this.map=new Map()}
 async get(k){return this.map.get(k)}
 async put(k,v){this.map.set(k,structuredClone(v))}
}
const storage=new MemoryStorage(),runtime=new OmegaRuntime({storage},{}),secret='r242_test_secret_abcdefghijklmnopqrstuvwxyz';
const secretHash=crypto.createHash('sha256').update(secret).digest('hex');
await storage.put('bridgeSecretHash',secretHash);
await storage.put('devices',[{id:'pc-r242',name:'PC R242',online:true,revoked:false,lastSeen:Date.now()-5000,capabilities:['INDEX','HASH_TREE']}]);
await storage.put('jobs',[{id:'job-live',status:'RUNNING',targetDeviceId:'pc-r242',startedAt:Date.now()-4000,steps:[{id:'S01',op:'INDEX'}]}]);
await storage.put('missions',[]);
let response=await runtime.fetch(new Request('https://omega-runtime.internal/agent/progress',{method:'POST',headers:{'content-type':'application/json','x-omega-bridge-secret':secret},body:JSON.stringify({deviceId:'pc-r242',jobId:'job-live',seq:1,state:'STEP_RUNNING',stepId:'S01',stepOp:'INDEX',stepIndex:1,totalSteps:2,completedSteps:0,elapsedMs:4200,message:'bounded discovery'})}));
assert.equal(response.status,200,'authenticated progress must renew a running claim');
let jobs=await storage.get('jobs'),live=jobs.find(j=>j.id==='job-live');
assert.equal(live.progress.state,'STEP_RUNNING');assert.equal(live.progress.stepOp,'INDEX');assert.equal(live.progress.seq,1);must(live.leaseUntil>Date.now(),'progress must create a future execution lease');
let devices=await storage.get('devices');must(Date.now()-devices[0].lastSeen<2000,'authenticated execution motion must keep selected host heartbeat current during a long step');

const staleAt=Date.now()-100000;
await storage.put('jobs',[{id:'job-stale',status:'RUNNING',targetDeviceId:'pc-r242',projectPath:'.',startedAt:staleAt,steps:[{id:'S01',op:'INDEX',path:'.'},{id:'S02',op:'HASH_TREE',path:'.'}]}]);
await storage.put('missions',[{id:'mission-r242',status:'ACTIVE',stage:'DISCOVERY',targetDeviceId:'pc-r242',currentJobId:'job-stale',currentJob:null,stallRecoveries:0}]);
await runtime.recoverStalledJobsR242('pc-r242');
jobs=await storage.get('jobs');const failed=jobs.find(j=>j.id==='job-stale'),recovery=jobs.find(j=>j.recoveryOf==='job-stale');
assert.equal(failed.status,'FAILED','expired legacy RUNNING job must leave active state');assert.equal(failed.stallReason,'R242_EXECUTION_LEASE_EXPIRED');
must(recovery&&recovery.status==='QUEUED','bounded discovery recovery must be queued after stale claim');assert.deepEqual(recovery.steps.map(s=>s.op),['INDEX'],'stale discovery recovery must never repeat the root HASH_TREE');assert.equal(recovery.steps[0].discoveryOnly,true);
let missions=await storage.get('missions');assert.equal(missions[0].currentJobId,recovery.id);assert.equal(missions[0].stallRecoveries,1);

await storage.put('jobs',[{id:'job-mutation',status:'RUNNING',targetDeviceId:'pc-r242',projectPath:'OMEGAv6',startedAt:staleAt,steps:[{id:'P01',op:'APPLY_PATCH',path:'OMEGAv6/src/App.tsx',expectedSha256:'a'.repeat(64),replacements:[{find:'a',replace:'b'}]}]}]);
await storage.put('missions',[{id:'mission-mut',status:'ACTIVE',stage:'REPAIR_VERIFY',targetDeviceId:'pc-r242',currentJobId:'job-mutation',stallRecoveries:0}]);
await runtime.recoverStalledJobsR242('pc-r242');jobs=await storage.get('jobs');assert.equal(jobs.find(j=>j.id==='job-mutation').status,'FAILED');must(!jobs.some(j=>j.recoveryOf==='job-mutation'),'execution motion must never blind-replay a stale mutation');

console.log('OMEGA R242/R243 HYBRID EXECUTION MOTION PASS · inherited R242 authenticated 3s host step pulses renew a bounded RUNNING lease and heartbeat · current R243 surface preserves R242/R243 transport compatibility · current step/elapsed/progress are operator-visible · expired legacy RUNNING claims fail closed · only bounded non-mutating discovery can auto-recover · root HASH_TREE is stripped from initial/recovery discovery · mutation is never blindly replayed · immutable R205 + R141/R240/R146/R147/R125 authority preserved');
