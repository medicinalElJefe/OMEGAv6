import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createExecutionRunR143,transitionExecutionRunR143,verifyExecutionReplayR143,manifestR143,R143_LAWS} from '../src/execution/durableExecutionRuntimeR143.js';
const must=(v,m)=>assert.ok(v,'R143 '+m);
class Store{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
class Runtime{constructor(){this.state={storage:new Store()}}}
const runtime=new Runtime(),created=await createExecutionRunR143(runtime,{intent:'operate Hybrid Link',executor:{kind:'HYBRID',route:'Hybrid Link',deviceId:'pc'}});
assert.equal(created.state,'DISCOVERED');assert.equal(created.events.length,1);assert.equal(created.canonicalMutation,false);assert.equal(created.canonicalAdmissionAuthority,'R125');
let x=await transitionExecutionRunR143(runtime,created.id,{state:'AUTHORIZED',reason:'operator authorization'});assert.equal(x.ok,true);x=await transitionExecutionRunR143(runtime,created.id,{state:'AVAILABLE',reason:'current device proof available'});assert.equal(x.ok,true);x=await transitionExecutionRunR143(runtime,created.id,{state:'INVOKED',reason:'bounded job invoked'});assert.equal(x.ok,true);x=await transitionExecutionRunR143(runtime,created.id,{state:'RETURNED',reason:'bounded result returned'});assert.equal(x.ok,true);
let held=await transitionExecutionRunR143(runtime,created.id,{state:'VERIFIED',reason:'attempt without exact proof',evidence:{proofRef:'weak',resultFingerprint:'abc'}});assert.equal(held.ok,false);assert.equal(held.code,'R143_R141_PROOF_REQUIRED');
const closure={state:'VERIFIED_EXECUTION_RETURN',fingerprint:{verified:true,digestMatch:true,semanticMatch:true},finalHeadSha256:'a'.repeat(64)};x=await transitionExecutionRunR143(runtime,created.id,{state:'VERIFIED',reason:'R141 exact proof accepted',evidence:{r141Closure:closure,proofRef:'r141',resultFingerprint:'b'.repeat(64)}});assert.equal(x.ok,true);assert.equal(x.run.state,'VERIFIED');
const replay=await verifyExecutionReplayR143(runtime,created.id);assert.equal(replay.ok,true);assert.equal(replay.headMatch,true);
const routeRuntime=new Runtime(),route=await createExecutionRunR143(routeRuntime,{intent:'open Modes',executor:{kind:'ROUTE',route:'Modes'}});held=await transitionExecutionRunR143(routeRuntime,route.id,{state:'INVOKED'});assert.equal(held.code,'R143_ILLEGAL_TRANSITION');
for(const law of ['INTENT_CREATES_A_DURABLE_RUN_NOT_AN_EXECUTION_CLAIM','EVERY_STATE_CHANGE_IS_HASH_CHAINED_AND_REPLAYABLE','RETURNED_DOES_NOT_EQUAL_VERIFIED','HYBRID_VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_PROOF','EXECUTION_RUNS_NEVER_MUTATE_CANONSTATE','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])must(R143_LAWS.includes(law),'law missing '+law);
const manifest=manifestR143();assert.equal(manifest.revision,'R143');assert.equal(manifest.canonicalAdmissionAuthority,'R125');
const worker=fs.readFileSync('src/workerR143.js','utf8'),wrangler=fs.readFileSync('wrangler.jsonc','utf8'),field=fs.readFileSync('src/OmegaCapabilityFieldR138.tsx','utf8');
for(const token of ['/api/execution/r143/manifest','/api/execution/runs','/transition','/replay','PAIR_AUTH_FAILED','class OmegaRuntime extends OmegaRuntimeR116','return super.fetch(request)'])must(worker.includes(token),'worker mount missing '+token);
must(wrangler.includes('"main": "src/workerR143.js"'),'wrangler must deploy the R143 successor entrypoint');
for(const token of ["api.post<any>('/api/execution/runs'",'R143_AUTHENTICATED_OPERATOR_SELECTION','hash-chained execution runs','R125 canonical admission remains a separate proof-gated operation'])must(field.includes(token),'capability field durable binding missing '+token);
console.log('R143 DURABLE EXECUTION RUNTIME PASS · authenticated intent persisted · transition graph enforced · return/verification separated · R141 Hybrid proof required · replay hash chain verified · R125 admission unchanged');
