import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCloudResidualStateR314,R314_CLOUD_RESIDUAL_ADAPTER_SCHEMA} from '../cloudflare/lib/r314-residual-adapter.mjs';
import {classifyRepairTargetR314,selectRepairTargetR314,R314_CLOUD_TARGET_REGISTRY_SCHEMA} from '../cloudflare/lib/r314-target-registry.mjs';
import {prepareAiRepairR314,proposeAiRepairR314,R314_CLOUD_AI_REPAIR_SCHEMA} from '../cloudflare/lib/r314-ai-repair.mjs';
import {R314_AUTONOMOUS_REPAIR_SCHEMA,R314_AI_MAX_ATTEMPTS,repairPathPolicyR314} from '../src/system/autonomousRepairPolicyR314.js';

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
assert.equal(prepared.ok,true);
assert.equal(prepared.patches.length,1);
assert.equal(prepared.patches[0].content,'export const value = 2;\n');
const wrongSha=structuredClone(proposal);wrongSha.files[0].preimageSha='wrong';
assert.equal(prepareAiRepairR314({rawResponse:JSON.stringify(wrongSha),residual:safeResidual,contextFiles}).ok,false,'preimage drift must reject the patch');
const declined={...proposal,files:[]};
assert.equal(prepareAiRepairR314({rawResponse:JSON.stringify(declined),residual:safeResidual,contextFiles}).state,'NO_SAFE_PATCH','model refusal must become no mutation');

assert.equal(R314_AI_MAX_ATTEMPTS,3,'validator-driven reformulation budget must remain hard bounded');
const retryPrompts=[];
const rejectedOnce=structuredClone(proposal);rejectedOnce.files[0].preimageSha='wrong';
const ai={
 calls:0,
 async run(_model,input){
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
assert.doesNotMatch(machine,/wrangler\s+deploy|CLOUDFLARE_API_TOKEN/,'CLOUD-01 still may not deploy production directly');

console.log('R314 CLOUD AUTONOMOUS REPAIR PASS · R164/R125 residual adapter · bounded target registry · exact-SHA source envelope · Workers AI proposal · exact validator feedback · bounded reformulation scar ledger · R314 policy validation · branch-only mutation · inherited R241 promotion gate');
