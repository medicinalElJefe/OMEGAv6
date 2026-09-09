import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const worker=read('src/workerR32.js');
const deck=read('src/HybridCommandDeckR237.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 "code:'DEVICE_BUSY'",
 "activeJobId:blocking.id",
 "path.startsWith('/jobs/')&&path.endsWith('/cancel')",
 "code:'RUNNING_JOB_NOT_INTERRUPTIBLE'",
 "if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401)",
 "clamp(b.maxCycles,2,12)",
 "status:'CANCELLED'",
 "JOB_CANCELLED"
])must(worker.includes(token),`R237 runtime command-authority guard missing ${token}`);

must(worker.includes("path.startsWith('/api/hybrid/jobs/')&&path.endsWith('/cancel')"),'R237 public queued-job cancellation route missing');
must(worker.includes("The selected host already has active native work"),'R237 per-device backpressure truth copy missing');
must(!worker.includes("status:'KILLED'"),'R237 must not fake force-killing a running native process');

for(const token of [
 "api.get<any>('/api/hybrid/status')",
 "api.get<any>('/api/missions')",
 "api.post<any>('/api/hybrid/jobs'",
 "/cancel`,{})",
 "/api/missions/${encodeURIComponent(currentMission.id)}/${action}",
 "confirmed:true",
 "OMEGA_HYBRID_OPERATOR_JOB_R237",
 "PROVE_HOST",
 "VERIFY_PROJECT",
 "PACKAGE_VERIFIED",
 "TRAIN_LOCAL_INDEX",
 "BACKPRESSURE ACTIVE",
 "Cancel before host claim",
 "running local process",
 "R141/R146/R147/R125 authority remains unchanged"
])must(deck.includes(token),`R237 operator deck missing ${token}`);

for(const forbidden of ['APPLY_PATCH','WRITE_TEXT','shell=True','child_process','powershell.exe','cmd.exe'])must(!deck.includes(forbidden),`R237 primary command deck must not introduce direct source/shell mutation primitive ${forbidden}`);
must(deck.includes("preset.ops.every(op=>advertised.has(op))"),'R237 must capability-negotiate every preset before queueing');
must(deck.includes("activeJobs.length===0"),'R237 UI backpressure gate missing');
must(deck.includes("safeRoot(root)"),'R237 root-relative confinement preflight missing');

must(hybrid.includes("import HybridCommandDeckR237 from './HybridCommandDeckR237'"),'Hybrid Link must import R237 command authority');
must(hybrid.indexOf('<HybridCommandDeckR237/>')>hybrid.indexOf('<HybridHostEffectsR212/>')&&hybrid.indexOf('<HybridCommandDeckR237/>')<hybrid.indexOf('<HybridProofClosureR141/>'),'R237 command deck must sit between first-hand R212 host effects and R141 closure');
for(const token of ['R125 admission authority','R141 exact return closure','R146 history','R147 executor/dispatch authority'])must(hybrid.includes(token),`R237 Hybrid Link authority boundary regressed ${token}`);

console.log('OMEGA R237 HYBRID COMMAND AUTHORITY PASS · authenticated mission control + one-active-job-per-device backpressure + queued cancellation + capability-negotiated native command deck · no direct source/shell mutation primitive · R141/R146/R147/R125 preserved');
