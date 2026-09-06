import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRunR146,transitionRunR146,replayRunR146,manifestR146,R146_LAWS} from '../src/execution/durableOperationExecutionR146.js';
const must=(v,m)=>assert.ok(v,'R146 '+m);
class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
class Runtime{constructor(){this.state={storage:new Storage()}}}
const contract={schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route:hybrid-link',route:'Hybrid Link',workspaceId:'ws',capabilityId:'capability:hybrid-link',executionDomain:'HYBRID',state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'};
const runtime=new Runtime();let result=await createRunR146(runtime,{intent:'run Hybrid',contract});assert.equal(result.ok,true);const id=result.run.id;assert.equal(result.run.state,'DISCOVERED');assert.equal(result.run.canonicalMutation,false);
for(const state of ['AUTHORIZED','AVAILABLE','INVOKED','RETURNED']){result=await transitionRunR146(runtime,id,{state,reason:`advance ${state}`});assert.equal(result.ok,true)}
let held=await transitionRunR146(runtime,id,{state:'VERIFIED',evidence:{proofRef:'weak',resultFingerprint:'abc'}});assert.equal(held.ok,false);assert.equal(held.code,'R146_R141_PROOF_REQUIRED');
const closure={state:'VERIFIED_EXECUTION_RETURN',fingerprint:{verified:true,digestMatch:true,semanticMatch:true},finalHeadSha256:'a'.repeat(64)};result=await transitionRunR146(runtime,id,{state:'VERIFIED',evidence:{proofRef:'R141',resultFingerprint:'b'.repeat(64),r141Closure:closure}});assert.equal(result.ok,true);assert.equal(result.run.state,'VERIFIED');
const replay=await replayRunR146(runtime,id);assert.equal(replay.ok,true);assert.equal(replay.headMatch,true);
const invalid=await createRunR146(new Runtime(),{contract:{route:'Hybrid Link'}});assert.equal(invalid.code,'R146_R143_CONTRACT_REQUIRED');
const routeContract={...contract,routeId:'route:modes',route:'Modes',capabilityId:'capability:modes',executionDomain:'AI'};const rr=new Runtime(),created=await createRunR146(rr,{contract:routeContract});held=await transitionRunR146(rr,created.run.id,{state:'INVOKED'});assert.equal(held.code,'R146_ILLEGAL_TRANSITION');
for(const law of ['R143_ROUTE_CONTRACT_PRECEDES_DURABLE_EXECUTION_RUN','AUTHENTICATED_UI_SELECTION_CREATES_INTENT_NOT_EXECUTION_PROOF','EVERY_EXECUTION_TRANSITION_IS_HASH_CHAINED_AND_REPLAYABLE','RETURNED_DOES_NOT_EQUAL_VERIFIED','R144_ATTESTATION_AND_R145_WORLD_SCAR_ARE_EVIDENCE_NOT_AUTO_ADMISSION','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])must(R146_LAWS.includes(law),'missing law '+law);
const manifest=manifestR146();assert.equal(manifest.upstream.routeContract,'R143');assert.equal(manifest.upstream.executionLifecycle,'R142');assert.equal(manifest.upstream.hybridProof,'R141');assert.equal(manifest.upstream.runtimeAttestation,'R144');assert.equal(manifest.upstream.worldScar,'R145');
const worker=fs.readFileSync('src/workerR146.js','utf8'),wrangler=fs.readFileSync('wrangler.jsonc','utf8'),field=fs.readFileSync('src/OmegaCapabilityFieldR138.tsx','utf8'),client=fs.readFileSync('src/durableExecutionClientR146.ts','utf8');
for(const token of ['/api/execution/r146/manifest','/api/execution/runs','PAIR_AUTH_FAILED','class OmegaRuntime extends OmegaRuntimeR116','return super.fetch(request)'])must(worker.includes(token),'worker missing '+token);
must(wrangler.includes('"main": "src/workerR146.js"'),'Wrangler must deploy R146 successor');
for(const token of ["data-execution-lifecycle='R142'","data-ui-operation-chain='R143'","data-durable-execution='R146'",'R144 attestation and R145 world scar remain evidence only','R125 canonical admission remains a separate proof-gated operation'])must(field.includes(token),'field preservation/binding missing '+token);
for(const token of ['createAuthorizedOperationRunR146',"state:'AUTHORIZED'",'R146_AUTHENTICATED_OPERATOR_SELECTION'])must(client.includes(token),'client missing '+token);
console.log('R146 DURABLE OPERATION EXECUTION PASS · R143 contracts persisted · R142 lifecycle preserved · R141 Hybrid proof required · R144/R145 evidence separated · hash replay verified · R125 admission unchanged');
