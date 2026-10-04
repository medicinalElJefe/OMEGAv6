import assert from'node:assert/strict';
import fs from'node:fs';
import{autonomousRepairCorrectionPromptR314,R314_AI_MAX_ATTEMPTS}from'../src/system/autonomousRepairPolicyR314.js';

assert.equal(R314_AI_MAX_ATTEMPTS,2,'R463 must not widen the two-attempt repair budget');
const contextFiles=[{
 path:'src/OmegaSideNavigatorR88.tsx',
 sha:'blob-current-r463',
 text:`export function renderCapabilityBinding(route){\n  const capability=resolveCapability(route);\n  return capability?.presentation ?? null;\n}\n\nexport const stableNavigatorIdentity='R88';\n`,
}];
const residual={id:'R388-B-02',objective:'Strengthen renderCapabilityBinding functional inheritance in OmegaSideNavigatorR88'};
const stage={id:'B-02',target:'renderCapabilityBinding'};
const rejection={state:'NO_SAFE_PATCH',reasons:['MODEL_DECLINED_BOUNDED_PATCH'],proposal:{schema:'OMEGA_AUTONOMOUS_REPAIR_POLICY_R314',residualId:'R388-B-02',files:[],canonicalAdmission:false,directProductionMutation:false,expectedProofs:['R241 Archive Convergence Visual Intelligence']}};
const prompt=autonomousRepairCorrectionPromptR314({residual,stage,contextFiles,rejection,attempt:2});
assert.match(prompt,/OMEGA_R463_CURRENT_SOURCE_ANCHORS/);
assert.match(prompt,/blob-current-r463/);
assert.match(prompt,/renderCapabilityBinding/);
assert.match(prompt,/machine-derived re-entry surface/);
assert.match(prompt,/copy its exact text verbatim as before/);
assert.match(prompt,/Do not reconstruct before from memory/);
const src=fs.readFileSync('src/system/autonomousRepairPolicyR314.js','utf8');
assert.match(src,/currentSourceAnchorsR463/);
assert.match(src,/occurrences===1/,'R463 anchors must be exact unique fragments from current source');
assert.match(src,/AI_DECLINED_FIRST_ATTEMPT_MUST_RECEIVE_MACHINE_DERIVED_CURRENT_SOURCE_ANCHORS_BEFORE_FINAL_REFORMULATION/);
console.log('R463 CURRENT-SOURCE ANCHOR RECOVERY PASS · first-attempt decline receives exact unique current-blob anchors before final bounded reformulation · two-attempt cap and R314 validation unchanged');
