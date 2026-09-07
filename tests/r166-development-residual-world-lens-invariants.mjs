import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assembleDevelopmentResidualWorldLensR166,manifestR166,R166_LAWS,R166_REVISION,R166_SCHEMA} from '../src/world/developmentResidualWorldLensR166.js';

const must=(ok,msg)=>assert.ok(ok,`R166 ${msg}`);
assert.equal(R166_REVISION,'R166');
assert.equal(R166_SCHEMA,'OMEGA_DEVELOPMENT_RESIDUAL_WORLD_LENS_R166');
for(const law of ['RESIDUAL_VISUALIZATION_IS_NOT_REPAIR_AUTHORIZATION','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY','PC_ONLINE_SOLVER_VALIDITY_AND_PHOTOREAL_REALITY_REQUIRE_DIRECT_PROOF'])must(R166_LAWS.includes(law),`missing law ${law}`);
for(const path of ['src/system/developmentResidualGraphR164.js','src/world/livingWorldFrameR136.js','src/world/canonicalWorldContinuityR134.js','src/accuracyResidualEngineR125.ts'])must(fs.existsSync(path),`preserved authority source missing ${path}`);

const result=await assembleDevelopmentResidualWorldLensR166({
 accuracyState:{residuals:[{id:'test-gap',kind:'FEDERATION_RETURN_GAP',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Federation return lacks verified closure evidence.',affected:['federation'],evidence:[{kind:'TEST',source:'receipt:test',claim:'closure',verified:true,value:false}]}]},
 runtimeEvidence:{
  coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},
  releaseEvidence:{source:{sha:'same'}},runtimeAttestation:{source:{sha:'same'}},
  hybrid:{nativeExecutionClaimed:false,devices:[]}
 },
 context:{eventTime:42,observerId:'operator',projection:'woven',address:1728,performance:{load:.2,latencyPressure:.3,evidence:.8},metrics:{continuity:.9,evidence:.8}}
});
assert.equal(result.schema,R166_SCHEMA);
assert.equal(result.worldId,'OMEGA_CANONICAL_WORLD');
assert.equal(result.canonicalMutation,false);
assert.equal(result.autonomousMutationAuthority,false);
assert.equal(result.canonicalAdmissionAuthority,'R125');
assert.equal(result.routingIntent.dispatchAuthorized,false);
assert.equal(result.routingIntent.federationClosed,false);
assert.equal(result.claims.publicDeploymentProved,false);
assert.equal(result.claims.pcOnlineProved,false);
assert.equal(result.claims.solverValidityProved,false);
assert.equal(result.claims.computedPhotorealRealityProved,false);
assert.ok(result.visualOverlay.residuals.some(r=>r.id==='test-gap'));
assert.ok(result.visualOverlay.targetFamilies.includes('FEDERATION_EVIDENCE'));
assert.ok(result.visualOverlay.residuals.some(r=>r.kind==='HYBRID_DEVICE_PROOF_REQUIRED'));
assert.equal(result.frame.visualState.truthBands.mission,'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF');
assert.equal(result.frame.frame.performance.lod,'HIGH');
assert.ok(result.frame.operationRef,'living-world continuity operation ref must be emitted');

const blocked=await assembleDevelopmentResidualWorldLensR166({runtimeEvidence:{coreHealth:{ok:false,state:'DEGRADED',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'}},context:{eventTime:43}});
assert.equal(blocked.ok,false);
assert.equal(blocked.visualOverlay.action,'BLOCK_AND_REVIEW');
assert.equal(blocked.routingIntent.dispatchAuthorized,false);

const manifest=manifestR166();
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.sourceResidualAuthority,'R164');
assert.equal(manifest.visualWorldAuthority,'R136/R134');
console.log('OMEGA R166 development residual world lens invariants: PASS');
