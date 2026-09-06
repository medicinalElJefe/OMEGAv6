import assert from 'node:assert/strict';
import fs from 'node:fs';
import {agentPacketCoreR139,closeHybridReturnR139,replayHybridClosureR139,manifestR139,R139_FINGERPRINT_SCHEMA} from '../src/hybridProofClosureR139.js';
import {sha256R134,stableStringifyR134} from '../src/world/canonicalWorldContinuityR134.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R139 '+msg);
const worker=read('src/workerR116.js'),agent=read('public/omega-hybrid-agent.py'),proofAgent=read('public/omega-hybrid-agent-r139.py'),css=read('src/capabilityFirstR138.css'),r138=read('tests/r138-capability-first-visual-runtime.mjs'),ui=read('src/HybridProofClosureR139.tsx'),hybrid=read('src/HybridLinkR32.tsx'),wrangler=read('wrangler.jsonc'),r134=read('src/world/canonicalWorldContinuityR134.js'),r136=read('src/world/livingWorldFrameR136.js');

class RuntimeMock{
 constructor(devices=[]){this.store=new Map();this.deviceRows=devices;this.events=[]}
 async get(k,f){return this.store.has(k)?this.store.get(k):f}
 async put(k,v){this.store.set(k,v)}
 async devices(){return this.deviceRows}
 async event(type,message,data={}){const row={type,message,data};this.events.push(row);return row}
}

const job={id:'job_r139_proof_001',status:'COMPLETE',targetDeviceId:'device_r139_pc',targetCapabilityRevision:'R132',projectPath:'OMEGA',inputFingerprint:'input_abc',completedAt:1788731700000,returnPacket:{receivedAt:1788731700000}};
const body={jobId:job.id,ok:true,stepProofs:[{id:'S01',op:'HASH_TREE',startedAt:1,ok:true,result:{treeSha256:'abc123',files:4},completedAt:2},{id:'S02',op:'TEST',startedAt:3,ok:true,result:{command:['npm','run','check'],exitCode:0,stdout:'PASS ✓',stderr:''},completedAt:4}],outputPaths:['dist/output.zip'],log:'bounded unicode proof ✓',evaluation:null,promotion:null,capabilityRevision:'R132'};
const core=agentPacketCoreR139(body),payload=stableStringifyR134(core);
body.resultFingerprint='legacy_lineage_only';
body.resultFingerprintSchema=R139_FINGERPRINT_SCHEMA;
body.resultFingerprintR139Payload=payload;
body.resultFingerprintR139=await sha256R134(payload);
body.proofClosureRevision='R139';
body.baseAgentSha256='a'.repeat(64);

const runtime=new RuntimeMock([{id:'device_r139_pc',online:true,revoked:false,lastSeen:1788731700000,capabilityRevision:'R132'}]);
runtime.store.set('jobs',[structuredClone(job)]);
const closure=await closeHybridReturnR139(runtime,job,body);
must(closure.fingerprint.verified===true&&closure.fingerprint.digestMatch===true&&closure.fingerprint.semanticMatch===true,'exact payload digest and parsed semantic packet must both verify');
must(closure.fingerprint.legacy==='legacy_lineage_only'&&closure.fingerprint.legacyAuthority==='LINEAGE_ONLY_NOT_R139_PROOF','legacy Python fingerprint must be retained only as lineage');
must(closure.state==='VERIFIED_EXECUTION_RETURN','verified successful return state missing');
must(closure.hybridProofAtClose.currentHeartbeatProved===true,'current non-revoked heartbeat must remain separately observed at close');
must(Boolean(closure.finalHeadSha256)&&closure.finalHeadSha256===closure.continuity.headSha256,'final R134 continuity head must be carried by closure');
must(closure.livingWorldFrame?.revision==='R136','R136 living-world evidence frame must wrap the host return');
must(closure.input.addressAuthority==='UNBOUND_RUNTIME_EVIDENCE_FRAME_ADDRESS_0'&&closure.input.metricAuthority==='NORMALIZED_EXECUTION_EVIDENCE_NOT_PHYSICAL_MEASUREMENT','runtime evidence address/metric semantics must not masquerade as physical measurement');
must(closure.canonicalMutation===false&&closure.canonicalAdmissionAuthority==='R125','host execution proof must never auto-promote CanonState');
must(runtime.store.get('r139WorldHead')?.headSha256===closure.finalHeadSha256,'final R134 head must persist in the existing durable runtime evidence store');
must(runtime.store.get('r139Closure:'+job.id)?.finalHeadSha256===closure.finalHeadSha256,'job closure must persist under stable job identity');
const persistedJob=runtime.store.get('jobs').find(x=>x.id===job.id);
must(persistedJob?.proofClosure?.fingerprintVerified===true&&persistedJob?.proofClosure?.finalHeadSha256===closure.finalHeadSha256,'existing job record must receive compact proof closure reference');
const replay=await replayHybridClosureR139(runtime,job.id);
must(replay?.ok===true&&replay.headMatch===true&&replay.fingerprintMatch===true,'deterministic replay must reproduce both exact fingerprint state and final continuity head');
must(replay.canonicalMutation===false&&replay.canonicalAdmissionAuthority==='R125','replay verification must remain evidence only');

const digestMismatchRuntime=new RuntimeMock([{id:'device_r139_pc',online:true,revoked:false,lastSeen:1788731700000,capabilityRevision:'R132'}]);digestMismatchRuntime.store.set('jobs',[structuredClone(job)]);
const badDigest={...body,resultFingerprintR139:'0'.repeat(64)};
const digestMismatch=await closeHybridReturnR139(digestMismatchRuntime,job,badDigest);
must(digestMismatch.state==='FINGERPRINT_MISMATCH'&&!digestMismatch.fingerprint.verified&&!digestMismatch.fingerprint.digestMatch,'tampered exact payload digest must be held');
must(digestMismatch.input.frame.federation.proofIds.length===0,'digest mismatch must not enter the return as a proof id');

const semanticMismatchRuntime=new RuntimeMock([{id:'device_r139_pc',online:true,revoked:false,lastSeen:1788731700000,capabilityRevision:'R132'}]);semanticMismatchRuntime.store.set('jobs',[structuredClone(job)]);
const badSemantic={...body,log:'body changed after payload was hashed'};
const semanticMismatch=await closeHybridReturnR139(semanticMismatchRuntime,job,badSemantic);
must(semanticMismatch.state==='FINGERPRINT_MISMATCH'&&semanticMismatch.fingerprint.digestMatch===true&&semanticMismatch.fingerprint.semanticMatch===false,'matching payload digest with semantically changed body must still be rejected');

const legacyRuntime=new RuntimeMock([{id:'device_r139_pc',online:true,revoked:false,lastSeen:1788731700000,capabilityRevision:'R132'}]);legacyRuntime.store.set('jobs',[structuredClone(job)]);
const legacyOnly={...core,resultFingerprint:'f'.repeat(64)};
const legacyClosure=await closeHybridReturnR139(legacyRuntime,job,legacyOnly);
must(legacyClosure.state==='R139_FINGERPRINT_REQUIRED'&&legacyClosure.fingerprint.verified===false,'legacy fingerprint alone may close as scar/history evidence but cannot satisfy R139 execution-return proof');

const manifest=manifestR139();
for(const law of ['EXACT_AGENT_PAYLOAD_SHA_AND_SEMANTIC_EQUALITY_REQUIRED_BEFORE_PROOF','LEGACY_AGENT_FINGERPRINT_IS_LINEAGE_NOT_R139_PROOF','HOST_RETURN_IS_EVIDENCE_NOT_CANONSTATE','EVERY_RETURN_CARRIES_SCAR_HISTORY','REPLAY_MUST_REPRODUCE_THE_SAME_FINAL_CONTINUITY_HEAD','R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'])must(manifest.laws.includes(law),'manifest missing law '+law);
must(manifest.fingerprintSchema===R139_FINGERPRINT_SCHEMA,'manifest must publish exact R139 agent fingerprint schema');
must(manifest.r97ContinuityPromotion==='NOT_AUTO_PROMOTED','R139 must not auto-promote host evidence into R97/CanonState authority');

must(wrangler.includes('"main": "src/workerR116.js"'),'proven R116 Worker entrypoint must remain the deployed spine');
must(worker.includes("from './hybridProofClosureR139.js'")&&worker.includes('closeHybridReturnR139(this,job,body)'),'R139 closure must mount inside the existing OmegaRuntime Durable Object, not a shadow runtime');
must(worker.includes("path==='/api/hybrid/proof-closure/r139'")&&worker.includes('/(closure|replay)$/'),'public closure manifest and job replay routes must be mounted');
must(worker.includes("path==='/agent/result'")&&worker.includes('const body=await request.clone().json()')&&worker.includes('response=await super.fetch(request)'),'R139 must close only after the inherited R32/R115 result handler accepts the returned job');
must(worker.includes("path==='/api/hybrid/agent-download'&&request.method==='GET'&&url.searchParams.get('r117')==='1'")&&worker.includes("'/omega-hybrid-agent-r139.py'"),'clean R117 connector path must serve the R139 proof wrapper');
must(worker.includes("path==='/api/hybrid/reconnect'")&&worker.includes("agentPath:'/api/hybrid/agent-download?r117=1'"),'credential repair must return the current clean proof-wrapper path');
must(worker.includes("return super.fetch(request)"),'all non-R139 durable runtime operations must remain inherited');
must(!fs.existsSync('src/workerR139.js'),'R139 must not create a parallel Worker entrypoint or second Durable Object authority');

for(const route of ['/api/hybrid/agent/register','/api/hybrid/agent/heartbeat','/api/hybrid/agent/poll','/api/hybrid/agent/result'])must(agent.includes(route),'existing authenticated base-agent transport missing '+route);
must(agent.includes('root-confined')&&agent.includes('shell=False'),'base local execution must remain root-confined without arbitrary shell execution');
must(agent.includes("packet['resultFingerprint']=sha_json(packet)"),'legacy base agent fingerprint must remain byte-identical lineage/rollback evidence');
for(const token of ["BASE_PATH='/omega-hybrid-agent.py'","PROOF_CLOSURE_REVISION='R139'","FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R139'","ensure_ascii=False","resultFingerprintR139Payload","resultFingerprintR139","base.execute_job=execute_job_r139"])must(proofAgent.includes(token),'R139 proof wrapper missing '+token);
must(proofAgent.includes("'root-confined'")&&proofAgent.includes("'shell=False'"),'wrapper must verify the downloaded base still carries root/shell safety contracts before executing it');
must(r134.includes('APPEND_ONLY_SCAR_AND_PROOF_CHAIN')&&r134.includes('canonicalMutation:false'),'R134 scar/proof chain truth boundary must remain intact');
must(r136.includes('ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS')&&r136.includes("canonicalAdmissionAuthority:'R125'"),'R136 living evidence frame and R125 authority must remain intact');

must(!css.includes('.r93-truth-plot.r93-transition{display:none'),'R139 must repair the accidentally merged R138 transition-proof hiding rule');
must(css.includes('.r93-packet,.r93-transition,.r95-canonical-manifold,.r95-transition-manifold,.r95-state-mandala{display:block}'),'canonical packet and transition visuals must be protected');
must(r138.includes('canonical transition proof visual must never be retired'),'R138 forward invariant must lock exact transition visibility');
for(const token of ['PC WORKLOAD → PROOF → SCAR → REPLAY','/api/hybrid/status','/closure','/replay','DETERMINISTIC REPLAY VERIFIED','HOST EVIDENCE · NOT CANONSTATE'])must(ui.includes(token),'Hybrid proof UI missing '+token);
must(hybrid.includes('<HybridProofClosureR139/>')&&hybrid.includes('R139 PROOF CLOSURE'),'ordinary Hybrid route must expose current proof closure/replay without opening donor diagnostics');

console.log('R139 HYBRID PROOF→SCAR→REPLAY PASS · exact payload SHA + semantic equality verified · digest/semantic tamper held · legacy fingerprint demoted to lineage · R134 scar head durable · R136 evidence frame bound · deterministic replay reproduces head · R138 transition regression repaired · R116/R117 execution spine + R125 admission authority preserved');
