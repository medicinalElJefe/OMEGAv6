import assert from 'node:assert/strict';
import fs from 'node:fs';
import {manifestR147} from '../src/execution/unifiedExecutorFabricR147.js';

const worker=fs.readFileSync('src/workerR116.js','utf8');
const r147Source=fs.readFileSync('src/execution/unifiedExecutorFabricR147.js','utf8');
const r197Source=fs.readFileSync('src/execution/adaptivePartitionBackpressureR197.js','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const postDeploy=fs.readFileSync('scripts/verify_federation_live_r1681.mjs','utf8');
const probe=fs.readFileSync('scripts/verify_live_execution_control_r199.mjs','utf8');

assert.ok(worker.includes("path==='/api/execution/r147/manifest'&&request.method==='GET'"),'R199 requires the existing public read-only R147 manifest route');
assert.ok(worker.includes('json(manifestR147())'),'R199 public route must return the enacted R147 manifest rather than a parallel projection');
assert.ok(r147Source.includes('adaptivePartitionBackpressure:manifestR197()'),'R147 manifest must expose the enacted R197 controller');
assert.ok(r147Source.includes("adaptivePartitionBackpressure:'R197'"),'R147 upstream chain must identify R197');
assert.ok(r197Source.includes("type:'BOUNDED_AIMD'"),'R197 bounded AIMD controller identity missing');
assert.ok(r197Source.includes("states:['STAY','TURN']"),'R197 STAY/TURN dynamic states missing');
assert.ok(r197Source.includes("directions:['NONE','DOWN','UP','CLAMP']"),'R197 feedback directions missing');
assert.ok(r197Source.includes('selfEscalation:false'),'R197 must remain incapable of self-escalation');

const manifest=manifestR147();
assert.equal(manifest.schema,'OMEGA_UNIFIED_EXECUTOR_FABRIC_MANIFEST_R147');
assert.equal(manifest.revision,'R147');
assert.equal(manifest.performance.revision,'R185');
assert.equal(manifest.performance.multiAxis.revision,'R193');
assert.equal(manifest.contentReuse.revision,'R194');
assert.equal(manifest.differentialPartitionExecution.revision,'R195');
assert.equal(manifest.boundedPartitionParallelism.revision,'R196');
assert.equal(manifest.boundedPartitionParallelism.hardConcurrencyMax,12);
assert.equal(manifest.adaptivePartitionBackpressure.revision,'R197');
assert.equal(manifest.adaptivePartitionBackpressure.controller.type,'BOUNDED_AIMD');
assert.deepEqual(manifest.adaptivePartitionBackpressure.dynamicTurn.states,['STAY','TURN']);
assert.deepEqual(manifest.adaptivePartitionBackpressure.dynamicTurn.directions,['NONE','DOWN','UP','CLAMP']);
assert.equal(manifest.adaptivePartitionBackpressure.dynamicTurn.selfEscalation,false);
assert.equal(manifest.adaptivePartitionBackpressure.boundedScheduler.revision,'R196');
assert.equal(manifest.adaptivePartitionBackpressure.boundedScheduler.hardConcurrencyMax,12);
assert.equal(manifest.upstream.multiAxis,'R193');
assert.equal(manifest.upstream.verifiedContentReuse,'R194');
assert.equal(manifest.upstream.differentialPartitionExecution,'R195');
assert.equal(manifest.upstream.boundedPartitionParallelism,'R196');
assert.equal(manifest.upstream.adaptivePartitionBackpressure,'R197');
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');

assert.equal(fs.existsSync('.github/workflows/r199-live-execution-control-proof.yml'),false,'R199 must not create a second workflow authority or workflow_run fanout');
assert.ok(ci.includes('workflow_dispatch:'),'R240 explicit dispatch must remain inside canonical ci.yml rather than a second deploy workflow');
assert.ok(ci.includes("github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')"),'R199 proof must remain inside canonical main deployment authority for push or exact R240 dispatch');
assert.ok(ci.includes('Promoted main commit must be an exact two-parent merge commit'),'R199 must preserve exact governed merge lineage');
assert.ok(ci.includes('node scripts/verify_federation_live_r1681.mjs'),'canonical deploy job must retain the propagation-safe live verifier');
assert.ok(!ci.includes('workflow_run:'),'canonical CI must not reintroduce workflow_run fanout');
assert.ok(postDeploy.includes("process.env.OMEGA_PROMOTED_SHA"),'R199 must activate only inside an exact promoted deployment context');
assert.ok(postDeploy.includes("await import('./verify_live_execution_control_r199.mjs')"),'existing canonical post-deploy verifier must chain the R199 proof');
assert.ok(!postDeploy.includes('workflow_run'),'post-deploy chaining must not create recursive workflow authority');

for(const token of ['GITHUB_SHA','OMEGA_PROMOTED_SHA','/api/release-evidence','/api/runtime-attestation','/api/core-health','/api/execution/r147/manifest','OMEGA_RELEASE_EVIDENCE_V1','OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144','OMEGA_CANONICAL_CORE_HEALTH_R163','OMEGA_UNIFIED_EXECUTOR_FABRIC_MANIFEST_R147',"manifest.performance?.multiAxis?.revision!=='R193'","manifest.contentReuse?.revision!=='R194'","manifest.differentialPartitionExecution?.revision!=='R195'","manifest.boundedPartitionParallelism?.revision!=='R196'","r197?.revision!=='R197'","r197?.controller?.type!=='BOUNDED_AIMD'","['STAY','TURN']","['NONE','DOWN','UP','CLAMP']","manifest.canonicalAdmissionAuthority!=='R125'",'OMEGA R199 LIVE EXECUTION CONTROL PASS'])assert.ok(probe.includes(token),`R199 live probe missing ${token}`);
assert.ok(!probe.includes('/api/execution/runs'),'R199 live proof must not create, transition, dispatch, poll, or read private durable execution runs');
assert.ok(!probe.includes('/api/hybrid/pair'),'R199 live proof must not create or rotate Hybrid pairing credentials');
assert.ok(!probe.includes("method:'POST'"),'R199 live proof must remain GET-only/read-only');
assert.ok(!probe.includes('canonicalMutation:true'),'R199 proof may not claim or perform Canon mutation');

console.log('R199/R240 LIVE EXECUTION CONTROL PROOF PASS · canonical ci.yml remains sole deployment authority for push or exact explicit R240 dispatch · exact promoted SHA + Worker Version ID bind to GET-only R147 manifest · R185→R193→R194→R195→R196→R197 + max-12 AIMD proof · R125-only admission');
