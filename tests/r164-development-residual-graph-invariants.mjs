import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDevelopmentResidualGraphR164,manifestR164,R164_AUTHORITY_NODES,R164_LAWS,R164_REVISION,R164_SCHEMA} from '../src/system/developmentResidualGraphR164.js';

assert.equal(R164_REVISION,'R164');
assert.equal(R164_SCHEMA,'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164');
for(const law of [
 'OBSERVATION_IS_NOT_MUTATION',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'R163_FIRST_HAND_CORE_HEALTH_REMAINS_RUNTIME_LIVENESS_AUTHORITY',
 'R144_REMAINS_DEPLOYMENT_ATTESTATION_AUTHORITY',
 'R141_RETURN_PROOF_REMAINS_STRONGER_THAN_ROUTE_OR_SELECTION_STATE',
 'PC_OFFLINE_DOES_NOT_MEAN_CANONICAL_WORKER_OFFLINE',
 'WORKER_LIVE_DOES_NOT_MEAN_PC_ONLINE',
 'HIGH_OR_CRITICAL_TRUTH_GAPS_NEVER_AUTO_REPAIR'
])assert.ok(R164_LAWS.includes(law),`missing R164 law ${law}`);

for(const node of R164_AUTHORITY_NODES)assert.equal(fs.existsSync(node.source),true,`R164 authority source missing: ${node.revision} ${node.source}`);
for(const revision of ['R163','R162','R161','R160','R159','R156','R147','R146','R144','R143','R142','R141','R125','R124'])assert.ok(R164_AUTHORITY_NODES.some(n=>n.revision===revision),`R164 missing authority ${revision}`);

const healthy=buildDevelopmentResidualGraphR164({runtimeEvidence:{coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},releaseEvidence:{source:{sha:'abc'}},runtimeAttestation:{source:{sha:'abc'}},hybrid:{nativeExecutionClaimed:true,devices:[{online:true,revoked:false}]}}});
assert.equal(healthy.ok,true);
assert.equal(healthy.state,'HEALTHY');
assert.equal(healthy.summary.total,0);
assert.equal(healthy.policies.canonicalMutation,false);
assert.equal(healthy.policies.autonomousMutationAuthority,false);
assert.equal(healthy.policies.canonicalAdmissionAuthority,'R125');

const pcOffline=buildDevelopmentResidualGraphR164({runtimeEvidence:{coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},hybrid:{nativeExecutionClaimed:false,devices:[]}}});
assert.equal(pcOffline.ok,true,'PC offline must not erase canonical Worker liveness');
assert.equal(pcOffline.state,'RESIDUALS_PRESENT');
const deviceGap=pcOffline.residuals.find(r=>r.id==='R164-HYBRID-DEVICE-PROOF-REQUIRED');
assert.ok(deviceGap);
assert.equal(deviceGap.severity,'MEDIUM');
assert.equal(deviceGap.mode,'OBSERVE_ONLY');
assert.equal(deviceGap.canonicalMutation,false);

const deploymentMismatch=buildDevelopmentResidualGraphR164({runtimeEvidence:{coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},releaseEvidence:{source:{sha:'aaa'}},runtimeAttestation:{source:{sha:'bbb'}}}});
const lineageGap=deploymentMismatch.residuals.find(r=>r.id==='R164-DEPLOYMENT-SOURCE-MISMATCH');
assert.ok(lineageGap);
assert.equal(lineageGap.severity,'HIGH');
assert.equal(lineageGap.mode,'QUEUE_FOR_REVIEW');

const coreDead=buildDevelopmentResidualGraphR164({runtimeEvidence:{coreHealth:{ok:false,state:'DEGRADED_REQUIRED_CORE_BINDING_MISSING',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'}}});
assert.equal(coreDead.ok,false);
assert.equal(coreDead.state,'BLOCKED');
const coreGap=coreDead.residuals.find(r=>r.id==='R164-CORE-HEALTH-GAP');
assert.equal(coreGap.severity,'CRITICAL');
assert.equal(coreGap.mode,'BLOCK');

const inherited=buildDevelopmentResidualGraphR164({accuracyState:{residuals:[{id:'R125-HIGH',kind:'TRUTH_BOUNDARY_RISK',severity:'HIGH',mode:'OBSERVE_ONLY',summary:'requires review',affected:['truth'],evidence:[]}]}});
assert.equal(inherited.residuals[0].mode,'QUEUE_FOR_REVIEW','R164 must never downgrade a HIGH truth gap to autonomous/observation-only mutation semantics');
assert.equal(inherited.residuals[0].canonicalAdmissionAuthority,'R125');

const failedWorkflow=buildDevelopmentResidualGraphR164({workflowEvidence:[{databaseId:164,status:'completed',conclusion:'failure',workflowName:'OMEGA R163 Canonical Core Health and Live Truth',headSha:'deadbeef',url:'https://github.com/medicinalElJefe/OMEGAv6/actions/runs/164'}]});
assert.equal(failedWorkflow.residuals[0].severity,'HIGH');
assert.equal(failedWorkflow.residuals[0].mode,'QUEUE_FOR_REVIEW');

const manifest=manifestR164();
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.autonomousMutationAuthority,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.match(manifest.truthBoundary,/observational only/);

const publicManifest=JSON.parse(fs.readFileSync('public/omega-r164-development-residual-graph.json','utf8'));
assert.equal(publicManifest.schema,R164_SCHEMA);
assert.equal(publicManifest.revision,R164_REVISION);
assert.equal(publicManifest.canonicalMutation,false);
assert.equal(publicManifest.autonomousMutationAuthority,false);
assert.equal(publicManifest.canonicalAdmissionAuthority,'R125');
assert.deepEqual(publicManifest.evidenceSources,{accuracy:'/omega-r125-accuracy-state.json',coreHealth:'/api/core-health',releaseEvidence:'/api/release-evidence',runtimeAttestation:'/api/runtime-attestation',hybrid:'/api/hybrid/status',federation:'/api/federation/run/status'});

const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
assert.match(wrangler,/"main"\s*:\s*"src\/workerR116\.js"/,'R164 must not replace the proven R116 Worker entrypoint');

console.log('R164 development residual graph PASS · whole-system evidence is unified without expanding mutation, PC-online, execution-proof, deployment or CanonState authority');
