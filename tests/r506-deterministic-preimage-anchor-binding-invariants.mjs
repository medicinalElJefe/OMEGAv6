import assert from 'node:assert/strict';
import {
 R314_AUTONOMOUS_REPAIR_SCHEMA,
 bindDeterministicPreimageAnchorsR506,
 deterministicPreimageAnchorsR506,
} from '../src/system/autonomousRepairPolicyR314.js';
import {proposeAiRepairR314} from '../cloudflare/lib/r314-ai-repair.mjs';

const contextFiles=[{
 path:'src/OmegaExample.tsx',
 sha:'current-r506-sha',
 text:"export const requestedGibsSpan=4;\nexport const otherValue=1;\n",
}];

const first={
 schema:R314_AUTONOMOUS_REPAIR_SCHEMA,
 residualId:'R388-C-03',
 files:[{
  path:'src/OmegaExample.tsx',
  preimageSha:'current-r506-sha',
  replacements:[{before:'const requestedGibsSpan = 4;',after:'const requestedGibsSpan = 6;'}],
 }],
 canonicalAdmission:false,
 directProductionMutation:false,
 expectedProofs:['R202 Operational Source Authority'],
};

const rejection={
 state:'REJECTED_BY_R314_POLICY',
 reasons:['FILE_1_REPLACEMENT_1_PREIMAGE_OCCURRENCES_0'],
 proposal:first,
};
const recovery=deterministicPreimageAnchorsR506({rejection,contextFiles});
assert.equal(recovery.active,true);
assert.equal(recovery.anchors.length>=1,true);
const anchor=recovery.anchors.find(x=>x.path==='src/OmegaExample.tsx'&&x.exact.includes('requestedGibsSpan'));
assert.ok(anchor,'R506 must derive an exact current-source anchor around the rejected semantic token');
assert.equal(anchor.currentSha,'current-r506-sha');
assert.equal(contextFiles[0].text.split(anchor.exact).length-1,1,'R506 anchor must occur exactly once');

const second={
 ...first,
 files:[{
  path:'src/OmegaExample.tsx',
  preimageSha:'current-r506-sha',
  replacements:[{anchorId:anchor.id,after:'export const requestedGibsSpan=6;'}],
 }],
};
const bound=bindDeterministicPreimageAnchorsR506(second,{rejection,contextFiles});
assert.equal(bound.valid,true,bound.reasons.join(','));
assert.equal(bound.boundCount,1);
assert.equal(bound.proposal.files[0].replacements[0].before,'export const requestedGibsSpan=4;');
assert.equal('anchorId' in bound.proposal.files[0].replacements[0],false);

let calls=0;
const ai={
 async run(_model,{messages}){
  calls++;
  if(calls===1)return{response:JSON.stringify(first)};
  const prompt=String(messages?.[1]?.content||'');
  assert.ok(prompt.includes('OMEGA_R506_DETERMINISTIC_PREIMAGE_ANCHORS'));
  assert.ok(prompt.includes(anchor.id));
  assert.ok(prompt.includes('EVERY replacement must use {anchorId,after}'));
  return{response:JSON.stringify(second)};
 }
};
const result=await proposeAiRepairR314({
 ai,
 model:'R506_TEST_MODEL',
 residual:{id:'R388-C-03',summary:'Bound the current exact source before changing the requested GIBS span.'},
 stage:{id:'R506_TEST'},
 contextFiles,
 maxAttempts:2,
});
assert.equal(result.ok,true,result.reasons?.join(','));
assert.equal(calls,2);
assert.equal(result.attempts[0].state,'REJECTED_BY_R314_POLICY');
assert.equal(result.attempts[1].state,'VALIDATED_BOUNDED_PATCH');
assert.equal(result.attempts[1].preimageBinding.active,true);
assert.equal(result.attempts[1].preimageBinding.boundCount,1);
assert.match(result.patches[0].content,/requestedGibsSpan=6/);
assert.equal(result.patches[0].preimageSha,'current-r506-sha');
assert.equal(result.proposal.canonicalAdmission,false);
assert.equal(result.proposal.directProductionMutation,false);

const unknown=structuredClone(second);
unknown.files[0].replacements[0].anchorId='R506-UNKNOWN';
const denied=bindDeterministicPreimageAnchorsR506(unknown,{rejection,contextFiles});
assert.equal(denied.valid,false);
assert.ok(denied.reasons.some(x=>x.includes('ANCHOR_ID_UNKNOWN')));

console.log('R506 DETERMINISTIC PREIMAGE ANCHOR PASS · zero-occurrence retry selects an anchor ID while runtime binds exact unique current-source bytes before unchanged R314 validation');
