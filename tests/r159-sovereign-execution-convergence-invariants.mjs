import assert from 'node:assert/strict';
import fs from 'node:fs';
import {agentPacketCoreR141,closeHybridReturnR141} from '../src/hybridProofClosureR141.js';
import {manifestR159,R159_LAWS,R159_SCHEMA} from '../src/execution/sovereignExecutionConvergenceR159.js';
import {sha256R134} from '../src/world/canonicalWorldContinuityR134.js';

const must=(v,m)=>assert.ok(v,'R159 '+m);
class RuntimeMock{
 constructor(devices=[]){this.store=new Map();this.deviceRows=devices;this.events=[]}
 async get(k,f){return this.store.has(k)?this.store.get(k):f}
 async put(k,v){this.store.set(k,structuredClone(v))}
 async devices(){return this.deviceRows}
 async event(type,message,data={}){const row={type,message,data};this.events.push(row);return row}
}

const device={id:'device_r159_pc',online:true,revoked:false,lastSeen:1788749000000,capabilityRevision:'R132'};
const job={id:'job_r159_real_001',status:'COMPLETE',targetDeviceId:device.id,targetCapabilityRevision:'R132',projectPath:'J:/OMEGA',inputFingerprint:'1'.repeat(64),completedAt:1788749000000,returnPacket:{receivedAt:1788749000000}};
const body={jobId:job.id,ok:true,stepProofs:[{id:'S01',op:'HASH_TREE',ok:true,result:{treeSha256:'abc'}},{id:'S02',op:'TEST',ok:true,result:{exitCode:0}}],outputPaths:['dist'],log:'PASS',evaluation:{status:'PASS'},promotion:null,capabilityRevision:'R132'};
const core=agentPacketCoreR141(body),payload=JSON.stringify(core);Object.assign(body,{resultFingerprintSchema:'OMEGA_AGENT_RETURN_FINGERPRINT_R141',resultFingerprintR141Payload:payload,resultFingerprintR141:await sha256R134(payload),resultFingerprint:'legacy-only',proofClosureRevision:'R141',baseAgentSha256:'a'.repeat(64)});
const runtime=new RuntimeMock([device]);runtime.store.set('jobs',[structuredClone(job)]);
const closure=await closeHybridReturnR141(runtime,job,body),c=closure.sovereignConvergence;
must(c?.schema===R159_SCHEMA&&c.revision==='R159','R159 convergence must be attached to accepted R141 closure');
must(c.executionTruth.pcOnlineAtReturn===true,'heartbeat proof at return must remain explicit');
must(c.executionTruth.jobReturned===true&&c.executionTruth.r141Verified===true,'return and exact R141 verification must be explicit');
must(c.executionTruth.replayVerified===true,'deterministic replay must auto-close before admission candidate readiness');
must(c.executionTruth.canonStateChanged===false&&c.canonicalMutation===false,'host return must never auto-mutate CanonState');
must(c.admissionCandidate.state==='READY_FOR_R125_PROOF_GATE','verified return + deterministic replay must produce an R125 candidate, not canon');
must(c.admissionCandidate.requestedAuthority==='R125'&&c.admissionCandidate.autonomousAdmission===false,'R125 must remain sole admission authority');
must(/^[a-f0-9]{64}$/.test(c.convergenceSha256),'convergence SHA-256 missing');
must(runtime.store.get('r159Convergence:'+job.id)?.convergenceSha256===c.convergenceSha256,'convergence must persist under stable job identity');
must(runtime.store.get('r159ConvergenceIndex')?.includes(job.id),'convergence index missing job');
const persisted=runtime.store.get('jobs')[0];must(persisted.proofClosure.deterministicReplayVerified===true,'compact job proof must carry replay truth');must(persisted.proofClosure.sovereignConvergenceSha256===c.convergenceSha256,'job must carry convergence digest');must(persisted.proofClosure.admissionCandidateState==='READY_FOR_R125_PROOF_GATE','job must carry admission-candidate state');
for(const id of ['DEVICE_AVAILABILITY','INVOCATION','RETURN','EXACT_RETURN_PROOF','R134_SCAR','R136_WORLD_FRAME','DETERMINISTIC_REPLAY','R125_ADMISSION_CANDIDATE'])must(c.stages.some(x=>x.id===id),'stage missing '+id);

const heldRuntime=new RuntimeMock([device]);heldRuntime.store.set('jobs',[structuredClone(job)]);const bad=await closeHybridReturnR141(heldRuntime,job,{...body,resultFingerprintR141:'0'.repeat(64)}),held=bad.sovereignConvergence;must(held.executionTruth.r141Verified===false,'tampered payload may not verify');must(held.admissionCandidate.state==='HELD_R141_RETURN_NOT_VERIFIED','tampered payload must hold R125 candidate');must(held.canonicalMutation===false,'held evidence must remain non-canonical');

for(const law of ['AUTHENTICATED_HEARTBEAT_PROVES_DEVICE_AVAILABILITY_NOT_JOB_SUCCESS','RUNNING_IS_INVOKED_NOT_RETURNED','RETURNED_IS_NOT_VERIFIED','R141_EXACT_PAYLOAD_DIGEST_AND_SEMANTIC_EQUALITY_REQUIRED','DETERMINISTIC_REPLAY_REQUIRED_BEFORE_R125_ADMISSION_CANDIDATE_READY','R147_DURABLE_EXECUTOR_STATE_REMAINS_SEPARATE_EXECUTION_HISTORY_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY','NO_AUTONOMOUS_CANON_MUTATION_FROM_HOST_RETURN'])must(R159_LAWS.includes(law),'law missing '+law);
const manifest=manifestR159();must(manifest.canonicalAdmissionAuthority==='R125'&&manifest.canonicalMutation===false,'manifest admission boundary regressed');
const r141=fs.readFileSync('src/hybridProofClosureR141.js','utf8');for(const token of ["from './execution/sovereignExecutionConvergenceR159.js'",'compileSovereignExecutionConvergenceR159(runtime,job,replayedClosure,replayReceipt)','sovereignConvergenceSha256','admissionCandidateState','successorConvergenceRevision:R159_REVISION'])must(r141.includes(token),'R141 integration missing '+token);
const live=fs.readFileSync('src/liveHybridExecutionTruthR158.ts','utf8');must(live.includes("const running=status==='RUNNING'"),'R158 RUNNING truth separation must remain');must(live.includes("closure?.state==='VERIFIED_EXECUTION_RETURN'"),'R158 must still require R141 closure for VERIFIED');
console.log('R159 SOVEREIGN EXECUTION CONVERGENCE PASS · real heartbeat→invocation→return→R141 exact proof→R134 scar→R136 frame→deterministic replay→R125 admission candidate · CanonState never auto-mutated');
