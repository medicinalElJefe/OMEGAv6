import assert from 'node:assert/strict';
import fs from 'node:fs';
import {manifestR147} from '../src/execution/unifiedExecutorFabricR147.js';

const worker=fs.readFileSync('src/workerR116.js','utf8');
const r147Source=fs.readFileSync('src/execution/unifiedExecutorFabricR147.js','utf8');
const r197Source=fs.readFileSync('src/execution/adaptivePartitionBackpressureR197.js','utf8');
const workflow=fs.readFileSync('.github/workflows/r199-live-execution-control-proof.yml','utf8');

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

for(const token of [
  'workflow_run:',
  'OMEGA Cloud Bridge CI',
  "github.event.workflow_run.conclusion == 'success'",
  "github.event.workflow_run.event == 'push'",
  "github.event.workflow_run.head_branch == 'main'",
  'EXPECTED_PROMOTED_SHA',
  'github.event.workflow_run.head_sha',
  '/api/release-evidence',
  '/api/runtime-attestation',
  '/api/core-health',
  '/api/execution/r147/manifest',
  'OMEGA_RELEASE_EVIDENCE_V1',
  'OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144',
  'OMEGA_CANONICAL_CORE_HEALTH_R163',
  'OMEGA_UNIFIED_EXECUTOR_FABRIC_MANIFEST_R147',
  "manifest.performance?.multiAxis?.revision!=='R193'",
  "manifest.contentReuse?.revision!=='R194'",
  "manifest.differentialPartitionExecution?.revision!=='R195'",
  "manifest.boundedPartitionParallelism?.revision!=='R196'",
  "r197?.revision!=='R197'",
  "r197?.controller?.type!=='BOUNDED_AIMD'",
  "['STAY','TURN']",
  "['NONE','DOWN','UP','CLAMP']",
  "manifest.canonicalAdmissionAuthority!=='R125'",
  'OMEGA R199 LIVE EXECUTION CONTROL PASS'
]) assert.ok(workflow.includes(token),`R199 live workflow missing ${token}`);

assert.ok(!workflow.includes('/api/execution/runs'),'R199 live proof must not create, transition, dispatch, poll, or read private durable execution runs');
assert.ok(!workflow.includes('/api/hybrid/pair'),'R199 live proof must not create or rotate Hybrid pairing credentials');
assert.ok(!workflow.includes("method:'POST'"),'R199 live proof must remain GET-only/read-only');
assert.ok(!workflow.includes('canonicalMutation:true'),'R199 proof may not claim or perform Canon mutation');

console.log('R199 LIVE EXECUTION CONTROL PROOF PASS · exact promoted release evidence gates a read-only first-hand R147 manifest check proving deployed R185→R193→R194→R195→R196→R197 composition, max-12 bounded scheduling, AIMD feedback states, and R125-only admission without dispatching work or pairing a device');
