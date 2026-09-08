import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileRenderAttemptContinuityR214,manifestR214,persistRenderAttemptContinuityR214,readRenderAttemptContinuityR214,R214_EVENT,R214_SNAPSHOT_KEY} from '../src/world/renderAttemptContinuityR214.js';

const attempt={state:'ADAPTIVE_RENDER_ATTEMPT_READY',renderAttemptPlanned:true,attemptSha256:'a'.repeat(64),parentLineageSha256:'b'.repeat(64),missionId:'mission-r214',worldBindingOperationSha256:'c'.repeat(64),previousWorldHeadSha256:'d'.repeat(64),earthHash:'e'.repeat(64),groundHash:'f'.repeat(64),profile:'FULL_FIELD',budget:{lod:'HIGH',sampleScale:1,temporalCarry:true}};
const a=await compileRenderAttemptContinuityR214({attempt,projectId:'project-1'});
const b=await compileRenderAttemptContinuityR214({attempt,projectId:'project-1'});
assert.equal(a.state,'RENDER_ATTEMPT_CONTINUITY_READY');
assert.match(a.anchorSha256,/^[a-f0-9]{64}$/);
assert.equal(a.anchorSha256,b.anchorSha256,'same R213 attempt/project context must produce the same continuity anchor');
assert.equal(a.parentAttemptSha256,attempt.attemptSha256);
assert.equal(a.parentLineageSha256,attempt.parentLineageSha256);
assert.equal(a.worldBindingOperationSha256,attempt.worldBindingOperationSha256);
assert.deepEqual(a.continuityPath,['R214 browser snapshot','R86 operation receipt','R87 active-project operation reference','R97 authenticated continuity sync when paired']);
const changed=await compileRenderAttemptContinuityR214({attempt:{...attempt,profile:'CONSERVATIVE'},projectId:'project-1'});
assert.notEqual(changed.anchorSha256,a.anchorSha256,'adaptive render-plan changes must change the continuity anchor');
const held=await compileRenderAttemptContinuityR214({attempt:{...attempt,state:'HELD_FOR_R211_LINEAGE'},projectId:'project-1'});
assert.equal(held.state,'HELD_FOR_R213_ATTEMPT');

const store=new Map();let dispatched=null;
globalThis.localStorage={getItem:key=>store.has(key)?store.get(key):null,setItem:(key,value)=>store.set(key,String(value))};
globalThis.window={dispatchEvent:event=>{dispatched=event;return true}};
globalThis.CustomEvent=class{constructor(type,init){this.type=type;this.detail=init?.detail}};
assert.equal(persistRenderAttemptContinuityR214(a),true);
assert.equal(store.has(R214_SNAPSHOT_KEY),true);
assert.equal(dispatched.type,R214_EVENT);
assert.equal(dispatched.detail.anchorSha256,a.anchorSha256);
assert.equal(readRenderAttemptContinuityR214().anchorSha256,a.anchorSha256);
assert.equal(persistRenderAttemptContinuityR214(held),false,'held attempts must not overwrite the recoverable anchor');

for(const receipt of [a,held]){assert.equal(receipt.newPersistenceAuthority,false);assert.equal(receipt.renderAttemptExecuted,false);assert.equal(receipt.renderedFrame,false);assert.equal(receipt.renderReceipt,false);assert.equal(receipt.computedPhotorealRealityProved,false);assert.equal(receipt.solverValidityProved,false);assert.equal(receipt.nativeExecutionClaimed,false);assert.equal(receipt.federationClosureProved,false);assert.equal(receipt.canonicalMutation,false);assert.equal(receipt.canonicalAdmissionAuthority,'R125');assert.equal(receipt.rendererAuthority,'R122_EXISTING_COMPUTED_REALITY')}
const manifest=manifestR214();assert.equal(manifest.authority.newRenderer,false);assert.equal(manifest.authority.newExecutor,false);assert.equal(manifest.authority.newPersistenceAuthority,false);assert.equal(manifest.authority.newFederationAuthority,false);assert.equal(manifest.authority.newCanonAuthority,false);assert.equal(manifest.authority.operationLedger,'R86');assert.equal(manifest.authority.projectContinuity,'R87');assert.equal(manifest.authority.authenticatedContinuity,'R97');assert.equal(manifest.authority.canonicalAdmission,'R125');

const component=fs.readFileSync('src/MissionWorldContinuityR206.tsx','utf8');
for(const token of ['compileRenderAttemptContinuityR214','persistRenderAttemptContinuityR214','RENDER_ATTEMPT_CONTINUITY_ANCHORED','recordProjectOperationR87','R204 → R206 → R208 → R211 → R213 → R214','FRAME NOT RENDERED','COMPUTED PHOTOREAL REALITY UNPROVEN'])assert.ok(component.includes(token),`R214 projection missing ${token}`);
const bus=fs.readFileSync('src/omegaOperationBusR86.ts','utf8');assert.ok(bus.includes("|'RENDER_ATTEMPT_CONTINUITY_ANCHORED'"),'R86 must recognize the additive R214 continuity receipt');
const source=fs.readFileSync('src/world/renderAttemptContinuityR214.js','utf8');for(const forbidden of ['renderAttemptExecuted:true','renderedFrame:true','renderReceipt:true','computedPhotorealRealityProved:true','solverValidityProved:true','nativeExecutionClaimed:true','federationClosureProved:true','canonicalMutation:true','fetch(','/api/'])assert.ok(!source.includes(forbidden),`R214 must not overclaim or create network authority: ${forbidden}`);
console.log('R214 RENDER ATTEMPT CONTINUITY PASS · R213 identity is recoverable through existing R86/R87/R97 continuity without renderer/frame/PC/federation/solver/photoreal/Canon overclaim');
