import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileReflexIngressCandidateR159,processReturnedOperationR159,manifestR159,R159_LAWS} from '../src/world/reflexOperationIngressR159.ts';

const base={schema:'OMEGA_OPERATION_EVENT_R86',id:'return-1',at:Date.now(),type:'ANALYSIS_COMPLETED',surface:'Matter Traversal',status:'PASS',detail:'returned specialist result',sha256:'a'.repeat(64),truthBoundary:'test'};
const returned={...base,payload:{source_family:'OPTICAL_OPERATION',returned_state:'RETURNED',residuals:[{id:'domain',kind:'DOMAIN_MISMATCH',severity:'HIGH',summary:'reduced order requires stronger full-wave domain',evidence_id:'evidence-1'}],runtimeLoad:.8,latencyPressure:.7}};
const candidate=compileReflexIngressCandidateR159(returned);
assert.equal(candidate.eligible,true);
assert.equal(candidate.sourceFamily,'OPTICAL_OPERATION');
assert.equal(candidate.returnedState,'RETURNED');
assert.equal(candidate.residualCount,1);
assert.equal(candidate.canonicalMutation,false);

assert.equal(compileReflexIngressCandidateR159({...base,payload:{source_family:'OPTICAL_OPERATION',residuals:[]}}).eligible,false,'missing explicit return state must not enter reflex ingress');
assert.equal(compileReflexIngressCandidateR159({...base,payload:{returned_state:'RETURNED',residuals:[]}}).eligible,false,'missing source family must not enter reflex ingress');
assert.equal(compileReflexIngressCandidateR159({...base,payload:{source_family:'OPTICAL_OPERATION',returned_state:'RETURNED',residuals:[],r159ReflexDerived:true}}).eligible,false,'derived R159 mission must not recurse');

const processed=await processReturnedOperationR159(returned,null);
assert.equal(processed.ok,true);
assert.equal(processed.state,'REFLEX_MISSION_ASSEMBLED');
assert.equal(processed.transition.reflex.action,'TURN');
assert.deepEqual(processed.transition.mission.targetFamilies.slice(0,2),['FULLWAVE_COMPUTATION','UNIVERSAL_EVIDENCE']);
assert.equal(processed.transition.mission.state,'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF');
assert.equal(processed.operation.type,'REFLEX_MISSION_ASSEMBLED');
assert.equal(processed.operation.status,'INFO');
assert.equal(processed.operation.payload.r159ReflexDerived,true);
assert.equal(processed.operation.payload.nativeExecutionClaimed,false);
assert.equal(processed.operation.payload.renderReceipt,false);
assert.equal(processed.operation.payload.reflexMission.requiresExecutionReceipts,true);
assert.equal(processed.operation.payload.reflexMission.requiresReturnVerification,true);
assert.equal(processed.canonicalMutation,false);
assert.equal(processed.canonicalAdmissionAuthority,'R125');

const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const r86=fs.readFileSync(new URL('../src/omegaOperationBusR86.ts',import.meta.url),'utf8');
const ingress=fs.readFileSync(new URL('../src/world/reflexOperationIngressR159.ts',import.meta.url),'utf8');
assert.match(r86,/REFLEX_MISSION_ASSEMBLED/,'R86 must register the additive reflex mission event type');
assert.match(app,/installLivingWorldOperationBridgeR140\(\);installRuntimeAttestationWorldScarR145\(\);installDurableWorldHeadContinuityR149\(\);installReflexOperationIngressR159\(\)/,'R159 must install after existing world and durable continuity layers');
assert.match(ingress,/omega-r86-operation/);
assert.match(ingress,/omega-r140-world-frame/);
assert.match(ingress,/r159ReflexDerived!==true/);
assert.match(ingress,/status:'INFO'/,'derived reflex mission must remain non-executing information state');
for(const law of ['RETURNED_REMAINS_DISTINCT_FROM_VERIFIED_AND_CANONSTATE_ADMISSION','R140_REMAINS_THE_ONLY_BROWSER_OPERATION_TO_WORLD_HEAD_BRIDGE','R149_REMAINS_THE_EXISTING_DURABLE_WORLD_HEAD_ADAPTER','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R159_LAWS.includes(law));
const manifest=manifestR159();
assert.equal(manifest.canonicalAdmissionAuthority,undefined);
assert.match(manifest.truthBoundary,/never upgrades RETURNED to VERIFIED/);
console.log('R159 REFLEX OPERATION INGRESS PASS · explicit returned-result admission · non-recursive reflex mission · R140/R149 continuity preserved · R125 authority preserved');
