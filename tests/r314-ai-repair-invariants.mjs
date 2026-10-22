import assert from 'node:assert/strict';
import {R314_AUTONOMOUS_REPAIR_SCHEMA,applyAiRepairProposalR314,autonomousRepairPromptR314,parseAiJsonR314,repairPathPolicyR314,validateAiRepairProposalR314} from '../src/system/autonomousRepairPolicyR314.js';

const context=[{path:'src/OmegaExample.tsx',sha:'abc123',text:"export const label='old';\nexport const count=1;\n"}];
const good={schema:R314_AUTONOMOUS_REPAIR_SCHEMA,residualId:'RES-1',objective:'repair visible label',files:[{path:'src/OmegaExample.tsx',preimageSha:'abc123',replacements:[{before:"label='old'",after:"label='new'"}]}],expectedProofs:['R241 browser','npm check'],canonicalAdmission:false,directProductionMutation:false};
const checked=validateAiRepairProposalR314(good,{contextFiles:context,residualId:'RES-1'});
assert.equal(checked.valid,true,checked.reasons.join(','));
const applied=applyAiRepairProposalR314(good,{contextFiles:context,residualId:'RES-1'});
assert.equal(applied.length,1);assert.match(applied[0].content,/label='new'/);assert.equal(applied[0].preimageSha,'abc123');

for(const path of ['.github/workflows/ci.yml','tests/foo.mjs','scripts/r170-selfbuild-engine.mjs','public/state.json','cloudflare/workerR223.js','src/worker.js','src/workerR32.js','src/system/governedSelfBuildContractR245.js','src/system/autonomousRepairPolicyR314.js','src/generated/selfbuildR170/a.ts'])assert.equal(repairPathPolicyR314(path).allowed,false,`${path} must be forbidden`);
assert.equal(repairPathPolicyR314('src/OmegaExample.tsx').allowed,true);

const wrongSha=structuredClone(good);wrongSha.files[0].preimageSha='wrong';assert.equal(validateAiRepairProposalR314(wrongSha,{contextFiles:context,residualId:'RES-1'}).valid,false);
const testEdit=structuredClone(good);testEdit.files[0].path='tests/foo.mjs';assert.equal(validateAiRepairProposalR314(testEdit,{contextFiles:[{...context[0],path:'tests/foo.mjs'}],residualId:'RES-1'}).valid,false);
const canonLeak=structuredClone(good);canonLeak.canonicalAdmission=true;assert.ok(validateAiRepairProposalR314(canonLeak,{contextFiles:context,residualId:'RES-1'}).reasons.includes('CANON_ADMISSION_MUST_BE_FALSE'));
const tokenInject=structuredClone(good);tokenInject.files[0].replacements[0].after="const token=process.env.GITHUB_TOKEN";assert.equal(validateAiRepairProposalR314(tokenInject,{contextFiles:context,residualId:'RES-1'}).valid,false);
const ambiguous=structuredClone(good);ambiguous.files[0].replacements[0]={before:'export const',after:'export let'};assert.ok(validateAiRepairProposalR314(ambiguous,{contextFiles:context,residualId:'RES-1'}).reasons.some(x=>x.includes('PREIMAGE_OCCURRENCES_2')));
const noSafe=structuredClone(good);noSafe.files=[];assert.equal(validateAiRepairProposalR314(noSafe,{contextFiles:context,residualId:'RES-1'}).valid,false);

assert.deepEqual(parseAiJsonR314('```json\n{"ok":true}\n```'),{ok:true});
const prompt=autonomousRepairPromptR314({residual:{id:'RES-1'},stage:{id:'R314-B17'},contextFiles:context});
for(const needle of ['Return JSON only','Do not edit tests','preimage SHA','canonicalAdmission','No safe patch'])assert.match(prompt,new RegExp(needle,'i'));

console.log('R314 AI REPAIR POLICY PASS · exact SHA · unique replacements · product-source membrane · governance/tests/deploy/secrets immutable · branch/proof-only');
