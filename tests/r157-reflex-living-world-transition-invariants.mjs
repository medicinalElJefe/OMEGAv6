import assert from 'node:assert/strict';
import {assembleReflexWorldTransitionR157,reflexWorldTransitionManifestR157,R157_LAWS} from '../src/world/reflexWorldTransitionR157.js';

const must=(v,m)=>assert.ok(v,`R157 ${m}`);
const manifest=reflexWorldTransitionManifestR157();
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
must(R157_LAWS.includes('HYBRID_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT'),'must preserve Hybrid device proof law');
must(R157_LAWS.includes('RENDER_RECEIPT_IS_NOT_COMPUTED_PHOTOREAL_REALITY_WITHOUT_DIRECT_VALIDATION'),'must preserve render truth law');

const transition=await assembleReflexWorldTransitionR157({
 source_family:'OPTICAL_OPERATION',canonical_address:1698,packet_id:'optical-return-1',returned_state:'RETURNED',
 residuals:[{id:'domain-gap',kind:'DOMAIN_MISMATCH',severity:'HIGH',summary:'reduced-order winner outside stronger full-wave domain',evidence_id:'rcwa-domain-check'}]
},{eventTime:99,observerId:'operator',projection:'woven',performance:{load:.9,latencyPressure:.8,evidence:.7},metrics:{continuity:.7,evidence:.7,uncertainty:.3},hybrid:{nativeExecutionClaimed:false,devices:[]},render:{receipt:true,proofIds:['render-receipt-only'],directPhotorealValidation:false}});

assert.equal(transition.ok,true);
assert.equal(transition.reflex.action,'TURN');
assert.deepEqual(transition.mission.targetFamilies.slice(0,2),['FULLWAVE_COMPUTATION','UNIVERSAL_EVIDENCE']);
assert.equal(transition.mission.state,'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF');
assert.equal(transition.world.worldId,'OMEGA_CANONICAL_WORLD');
assert.equal(transition.world.frame.performance.lod,'LOW');
assert.equal(transition.world.frame.performance.sampleBudget,144);
assert.equal(transition.world.visualState.truthBands.hybrid,'DEVICE_PROOF_REQUIRED');
assert.equal(transition.world.visualState.truthBands.render,'RENDER_RECEIPT_NOT_PHOTOREAL_PROOF');
assert.equal(transition.world.canonicalMutation,false);
assert.equal(transition.canonicalMutation,false);
assert.equal(transition.canonicalAdmissionAuthority,'R125');
must(transition.world.events.some(e=>e.kind==='MISSION'&&e.scarIds.includes(transition.reflex.scar.scar_id)),'R156 scar must enter R134/R136 world history');
must(transition.operationRef&&transition.operationRef.worldId==='OMEGA_CANONICAL_WORLD','must emit existing canonical-world continuity reference');

const bad=await assembleReflexWorldTransitionR157({source_family:'NOT_A_REAL_FAMILY'});
assert.equal(bad.ok,false);
assert.equal(bad.canonicalMutation,false);
console.log('R157 REFLEX LIVING WORLD TRANSITION PASS · reflex scar → intent mission → adaptive visual frame → canonical-world continuity · no execution/canon inflation');
