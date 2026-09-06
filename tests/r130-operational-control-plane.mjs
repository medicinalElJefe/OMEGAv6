import assert from 'node:assert/strict';
import worker,{manifestR130,R130_HIERARCHY,R130_LAWS} from '../src/workerR130.js';

const manifest=manifestR130();
assert.equal(manifest.ok,true);
assert.equal(manifest.revision,'R130');
assert.deepEqual(R130_HIERARCHY,{seed:1,organs:12,branches:144,cells:1728,lanes:20736});
assert.equal(manifest.entrypoint,'src/workerR130.js');
assert.equal(manifest.organization.canonicalAdmission,'R125');
assert.ok(manifest.modules.some(x=>x.revision==='R129'&&x.id==='EXPERIMENT_RUNTIME'));
assert.ok(manifest.modules.some(x=>x.revision==='R128'&&x.id==='EMPIRICAL_VALIDATION'));
assert.ok(manifest.modules.some(x=>x.revision==='R127'&&x.id==='PROOF_FABRIC'));
assert.ok(manifest.modules.some(x=>x.revision==='R126'&&x.id==='CAUSAL'));
assert.ok(manifest.modules.some(x=>x.revision==='R125'&&x.id==='AUTONOMIC'));
assert.ok(R130_LAWS.includes('REACHABILITY_IS_NOT_EXECUTION_PROOF'));
assert.ok(R130_LAWS.includes('EXECUTION_PROOF_IS_NOT_EMPIRICAL_VALIDATION'));
assert.ok(R130_LAWS.includes('R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'));
assert.match(manifest.truthBoundary,/does not prove native machine execution/i);

const response=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/system/manifest'),{});
assert.equal(response.status,200);
assert.equal(response.headers.get('x-omega-control-plane'),'R130');
const body=await response.json();
assert.equal(body.schema,'OMEGA_OPERATIONAL_CONTROL_PLANE_R130');
assert.equal(body.hierarchy.cells,1728);
assert.equal(body.hierarchy.lanes,20736);
assert.equal(body.modules.at(-1).id,'CONTROL_PLANE');

const cors=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/system/manifest',{method:'OPTIONS',headers:{origin:'https://omega-genesis-v1.jeffdeweyeljefe.workers.dev'}}),{});
assert.equal(cors.status,204);
assert.equal(cors.headers.get('access-control-allow-origin'),'https://omega-genesis-v1.jeffdeweyeljefe.workers.dev');

const rejected=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/system/manifest',{method:'OPTIONS',headers:{origin:'https://example.invalid'}}),{});
assert.equal(rejected.status,403);

console.log('R130 operational control plane: PASS');
