import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCloudResidualStateR314,R314_CLOUD_RESIDUAL_ADAPTER_SCHEMA} from '../cloudflare/lib/r314-residual-adapter.mjs';
import {classifyRepairTargetR314,selectRepairTargetR314,R314_CLOUD_TARGET_REGISTRY_SCHEMA} from '../cloudflare/lib/r314-target-registry.mjs';
import {prepareAiRepairR314,proposeAiRepairR314,repairResponseFormatR314,R314_CLOUD_AI_REPAIR_SCHEMA} from '../cloudflare/lib/r314-ai-repair.mjs';
import {R314_AUTONOMOUS_REPAIR_SCHEMA,R314_AI_REPAIR_MODEL_DEFAULT,R314_AI_MAX_ATTEMPTS,R314_AI_MAX_OUTPUT_TOKENS,repairPathPolicyR314} from '../src/system/autonomousRepairPolicyR314.js';

assert.equal(R314_CLOUD_RESIDUAL_ADAPTER_SCHEMA,'OMEGA_CLOUD_R314_RESIDUAL_ADAPTER');
assert.equal(R314_CLOUD_TARGET_REGISTRY_SCHEMA,'OMEGA_CLOUD_R314_TARGET_REGISTRY');
assert.equal(R314_CLOUD_AI_REPAIR_SCHEMA,'OMEGA_CLOUD_R314_AI_REPAIR');

const healthyRuntime={
  coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},
  releaseEvidence:{source:{sha:'A'}},
  runtimeAttestation:{source:{sha:'A'}},
  hybrid:{nativeExecutionClaimed:true,devices:[{online:true,revoked:false}]},
};
const safeResidual={id:'R314-TEST-SAFE',kind:'UI_PRODUCT_DEFECT',severity:'LOW',mode:'AUTO_REPAIR',summary:'Synthetic bounded product defect',affected:['src/components/Example.jsx'],reproducible:true,confidence:.99,evidence:[{id:'proof-1',kind:'TEST',source:'synthetic',verified:true}]};
const state=buildCloudResidualStateR314({accuracyState:{accuracyPolicy:{autoRepairMinConfidence:.92},residuals:[safeResidual]},runtimeEvidence:healthyRuntime});
assert.equal(state.vector.residuals.some(row=>row.id==='R314-TEST-SAFE'),true,'R125 residual must enter the canonical R314 vector');
assert.match(state.vector.fingerprint,/^r314-[0-9a-f]{8}$/);
const target=selectRepairTargetR314(state);
assert.equal(target.targetable,true);
assert.deepEqual(target.paths,['src/components/Example.jsx']);

assert.equal(repairPathPolicyR314('src/components/Example.jsx').allowed,true);
assert.equal(repairPathPolicyR314('src/generated/selfbuild/index.ts').allowed,false,'generated projections remain outside the AI membrane');
assert.equal(repairPathPolicyR314('cloudflare/workerR223.js').allowed,false,'AI may not edit its own Cloudflare authority');
assert.equal(classifyRepairTargetR314({...safeResidual,severity:'HIGH'},state.accuracyPolicy).targetable,false,'HIGH residuals require review');
assert.equal(classifyRepairTargetR314({...safeResidual,reproducible:false},state.accuracyPolicy).targetable,false,'unreproducible residuals may not mutate source');
assert.equal(classifyRepairTargetR314({...safeResidual,confidence:.4},state.accuracyPolicy).targetable,false,'low-confidence residuals may not mutate source');
assert.equal(classifyRepairTargetR314({...safeResidual,affected:['src/generated/selfbuild/index.ts']},state.accuracyPolicy).targetable,false,'forbidden targets may not enter the model path');

const contextFiles=[{path:'src/components/Example.jsx',sha:'blob123',text:'export const value = 1;\n'}];
const proposal={schema:R314_AUTONOMOUS_REPAIR_SCHEMA,residualId:'R314-TEST-SAFE',files:[{path:'src/components/Example.jsx',preimageSha:'blob123',replacements:[{before:'export const value = 1;',after:'export const value = 2;'}]}],canonicalAdmission:false,directProductionMutation:false,expectedProofs:['R241 Archive Convergence Visual Intelligence']};
const prepared=prepareAiRepairR314({rawResponse:JSON.stringify(proposal),residual:safeResidual,contextFiles});
const objectPrepared=prepareAiRepairR314({rawResponse:proposal,residual:safeResidual,contextFiles});
assert.equal(objectPrepared.ok,true,'Workers AI JSON mode object responses must enter R314 directly without wrapper corruption');
assert.equal(prepared.ok,true);
assert.equal(prepared.patches.length,1);
assert.equal(prepared.patches[0].content,'export const value = 2;\n');
const wrongSha=structuredClone(proposal);wrongSha.files[0].preimageSha='wrong';
assert.equal(prepareAiRepairR314({rawResponse:JSON.stringify(wrongSha),residual:safeResidual,contextFiles}).ok,false,'preimage drift must reject the patch');
const declined={...proposal,files:[]};
assert.equal(prepareAiRepairR314({rawResponse:JSON.stringify(declined),residual:safeResidual,contextFiles}).state,'NO_SAFE_PATCH','model refusal must become no mutation');

assert.equal(R314_AI_REPAIR_MODEL_DEFAULT,'@cf/meta/llama-3.3-70b-instruct-fp8-fast','R414 must use the documented structured-output Workers AI model');
const structuredResidual={...safeResidual,expectedProofs:['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI']};
const responseFormat=repairResponseFormatR314({residual:structuredResidual,contextFiles});
assert.equal(responseFormat.type,'json_schema');
assert.equal(responseFormat.json_schema.type,'object');
assert.deepEqual(responseFormat.json_schema.required,['schema','residualId','files','canonicalAdmission','directProductionMutation','expectedProofs']);
assert.equal(responseFormat.json_schema.properties.files.type,'array');
assert.equal(responseFormat.json_schema.properties.files.items.properties.replacements.type,'array');
assert.deepEqual(responseFormat.json_schema.properties.files.items.properties.replacements.items.required,['before','after']);
const grammarText=JSON.stringify(responseFormat.json_schema);
for(const unsupported of ['"enum"','"additionalProperties"','"minItems"','"maxItems"','"uniqueItems"','"minLength"','"oneOf"','"anyOf"','"$ref"'])assert.ok(!grammarText.includes(unsupported),`R415 generation grammar must not use xgrammar-incompatible keyword ${unsupported}`);


const duplicateProposal={...proposal,files:[proposal.files[0],structuredClone(proposal.files[0])]};
const duplicatePrepared=prepareAiRepairR314({rawResponse:duplicateProposal,residual:safeResidual,contextFiles});
assert.equal(duplicatePrepared.ok,false);
assert.ok(duplicatePrepared.reasons.includes('FILE_2_DUPLICATE_PATH'),'duplicate source paths must fail closed before branch mutation');

const objectResponseAi={
 seen:null,
 async run(model,input){this.seen={model,input};return{response:proposal}}
};
const objectStructured=await proposeAiRepairR314({ai:objectResponseAi,residual:structuredResidual,stage:{id:'R414-OBJECT',baseSha:'A',paths:['src/components/Example.jsx']},contextFiles,maxAttempts:1});
assert.equal(objectStructured.ok,true,'object-form Workers AI structured response must unwrap directly into R314 validation');
assert.equal(objectResponseAi.seen.model,R314_AI_REPAIR_MODEL_DEFAULT);
assert.equal(objectResponseAi.seen.input.response_format.type,'json_schema');
assert.equal(objectResponseAi.seen.input.seed,314);


assert.equal(R314_AI_MAX_ATTEMPTS,2,'validator-driven reformulation budget must remain one initial proposal plus one correction');
assert.equal(R314_AI_MAX_OUTPUT_TOKENS,3500,'bounded repair output must remain compact enough for operational autonomous cycles');
const retryPrompts=[];
const rejectedOnce=structuredClone(proposal);rejectedOnce.files[0].preimageSha='wrong';
const ai={
 calls:0,
 requests:[],
 async run(_model,input){
  this.requests.push(input);
  this.calls++;
  retryPrompts.push(input.messages.at(-1).content);
  return{response:JSON.stringify(this.calls===1?rejectedOnce:proposal)};
 }
};
const retried=await proposeAiRepairR314({ai,residual:safeResidual,stage:{id:'R413-TEST',baseSha:'A',paths:['src/components/Example.jsx']},contextFiles});
assert.equal(retried.ok,true,'a validator-rejected proposal may be reformulated into a compliant patch');
assert.equal(retried.reformulated,true);
assert.equal(retried.attempts.length,2);
assert.equal(retried.rejectionHistory.length,1);
assert.equal(ai.requests.length,2);
assert.equal(ai.requests[0].response_format.type,'json_schema','every Workers AI attempt must request structured JSON');
assert.equal(ai.requests[1].response_format.type,'json_schema','validator-informed correction must remain schema-constrained');
assert.equal(ai.requests[0].seed,314,'structured proposal generation must stay reproducible within the bounded model path');
assert.ok(retried.rejectionHistory[0].reasons.includes('FILE_1_SHA_MISMATCH'),'exact validator rejection code must survive into the scar ledger');
assert.ok(retryPrompts[1].includes('FILE_1_SHA_MISMATCH'),'the next model attempt must receive the exact rejection evidence');
assert.ok(retryPrompts[1].includes('Copy the supplied exact source SHA for that file without modification.'),'validator code must carry deterministic correction guidance');
assert.ok(retryPrompts[1].includes('"preimageSha":"wrong"'),'correction prompt must expose the rejected proposal detail needed to repair it');

assert.ok(retryPrompts[1].includes('"sha":"blob123"'),'reformulation must retain the same exact source SHA');
assert.ok(retryPrompts[1].includes('"path":"src/components/Example.jsx"'),'reformulation must retain the same source membrane');

const alwaysRejectedAi={calls:0,async run(){this.calls++;return{response:JSON.stringify(rejectedOnce)}}};
const exhausted=await proposeAiRepairR314({ai:alwaysRejectedAi,residual:safeResidual,stage:{id:'R413-TEST',baseSha:'A',paths:['src/components/Example.jsx']},contextFiles});
assert.equal(exhausted.ok,false);
assert.equal(exhausted.state,'REJECTED_BY_R314_POLICY');
assert.equal(exhausted.attempts.length,R314_AI_MAX_ATTEMPTS,'reformulation may never exceed its bounded attempt budget');
assert.equal(alwaysRejectedAi.calls,R314_AI_MAX_ATTEMPTS);

const malformedAi={calls:0,async run(){this.calls++;return{response:this.calls===1?'not json':JSON.stringify(proposal)}}};
const recoveredMalformed=await proposeAiRepairR314({ai:malformedAi,residual:safeResidual,stage:{id:'R413-TEST',baseSha:'A',paths:['src/components/Example.jsx']},contextFiles});
assert.equal(recoveredMalformed.ok,true,'malformed model output may be corrected once without widening policy');
assert.match(recoveredMalformed.rejectionHistory[0].reasons[0],/^AI_RESPONSE_PARSE_ERROR:/);

const transientAi={calls:0,async run(_model,input){this.calls++;if(this.calls===1)throw new Error('JSON Mode could not be met');return{response:proposal}}};
const recoveredRunError=await proposeAiRepairR314({ai:transientAi,residual:structuredResidual,stage:{id:'R414-RUN-ERROR',baseSha:'A',paths:['src/components/Example.jsx']},contextFiles});
assert.equal(recoveredRunError.ok,true,'one structured-output generation failure may consume the bounded correction attempt');
assert.equal(recoveredRunError.reformulated,true);
assert.match(recoveredRunError.rejectionHistory[0].reasons[0],/^AI_RUN_ERROR:/);
assert.equal(transientAi.calls,2);


const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const worker=fs.readFileSync('cloudflare/workerR223.js','utf8');
const config=fs.readFileSync('wrangler.evolution-machine-r223.jsonc','utf8');
assert.match(machine,/buildCloudResidualStateR314/);
assert.match(machine,/selectRepairTargetR314/);
assert.match(machine,/proposeAiRepairR314/);
assert.match(machine,/getRepoTextFile\(token,repo,path,mainSha\)/,'AI source envelope must bind exact main SHA');
assert.match(machine,/R314_AI_BRANCH_AND_PR_CREATED/);
assert.match(machine,/repairAttemptLedger:repair\.attempts\|\|\[\]/,'accepted R314 candidates must retain the bounded attempt ledger');
assert.match(machine,/rejectionScars:repair\.rejectionHistory\|\|\[\]/,'accepted candidates must retain exact prior validator scars');
assert.match(machine,/attempts:proposal\.repair\.attempts\|\|\[\]/,'OBSERVE_ONLY must return exact validator attempt evidence instead of collapsing it');
assert.match(machine,/R241 Archive Convergence Visual Intelligence/,'AI candidates must inherit the full interface matrix before promotion');
assert.match(worker,/env\.AI\|\|null/,'Workers AI binding must be passed explicitly and remain optional/fail-closed');
assert.match(config,/"ai"\s*:\s*\{\s*"binding"\s*:\s*"AI"/s);
assert.match(config,/OMEGA_WORKERS_AI_MODEL/);
assert.match(config,/@cf\/meta\/llama-3\.3-70b-instruct-fp8-fast/,'CLOUD-01 config must bind the documented JSON-mode model');
assert.match(fs.readFileSync('cloudflare/lib/r314-ai-repair.mjs','utf8'),/response_format:repairResponseFormatR314/,'Workers AI call must use the R415 xgrammar-compatible structural JSON schema');
assert.match(fs.readFileSync('cloudflare/lib/r314-ai-repair.mjs','utf8'),/if\(result\?\.response!==undefined\)return result\.response/,'object-form Workers AI structured responses must be unwrapped before R314 validation');
assert.match(config,/@cf\/meta\/llama-3\.3-70b-instruct-fp8-fast/,'CLOUD-01 config must match the structured-output R314 model');
assert.doesNotMatch(machine,/wrangler\s+deploy|CLOUDFLARE_API_TOKEN/,'CLOUD-01 still may not deploy production directly');

console.log('R314 CLOUD AUTONOMOUS REPAIR PASS · R164/R125 residual adapter · bounded target registry · exact-SHA source envelope · Workers AI proposal · xgrammar-compatible Workers AI structural JSON schema · unchanged semantic R314 validation · object-response unwrap · exact validator feedback · bounded reformulation scar ledger · R314 policy validation · branch-only mutation · inherited R241 promotion gate');
