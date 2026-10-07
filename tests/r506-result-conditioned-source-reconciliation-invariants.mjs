import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 buildResultConditionedAnchorSurfaceR506,
 bindResultConditionedCorrectionR506,
 requiresResultConditionedReanchorR506,
 R506_RESULT_CONDITIONED_SOURCE_RECONCILIATION,
} from '../src/system/resultConditionedCorrectionR506.js';
import {
 autonomousRepairCorrectionPromptR314,
 validateAiRepairProposalR314,
 applyAiRepairProposalR314,
} from '../src/system/autonomousRepairPolicyR314.js';

const contextFiles=[{
 path:'src/EarthGroundTraversalR9.jsx',
 sha:'a'.repeat(40),
 text:[
  "export function EarthGroundTraversalR9(){",
  "  const requestedGibsSpan = 4;",
  "  const groundMode = 'OBSERVED';",
  "  return requestedGibsSpan;",
  "}",
 ].join('\n'),
}];
const residual={
 id:'R388-C-03',
 summary:'Earth traversal remains bounded by requestedGibsSpan and needs one source-local improvement.',
 evidenceId:'R387_CONVERGENCE_MATRIX:R388-C-03',
};
const stage={id:'CLOUD-01-R388-CONVERGENCE-BUILD',baseSha:'b'.repeat(40),itemId:'R388-C-03',paths:['src/EarthGroundTraversalR9.jsx']};
const rejectedProposal={
 schema:'OMEGA_AUTONOMOUS_REPAIR_POLICY_R314',
 residualId:'R388-C-03',
 files:[{path:'src/EarthGroundTraversalR9.jsx',preimageSha:contextFiles[0].sha,replacements:[{
  before:'  const requestedGibsSpan = 5;',
  after:'  const requestedGibsSpan = 6;',
 }]}],
 canonicalAdmission:false,
 directProductionMutation:false,
 expectedProofs:['R241 Archive Convergence Visual Intelligence'],
};
const rejection={state:'REJECTED_BY_R314_POLICY',reasons:['FILE_1_REPLACEMENT_1_PREIMAGE_OCCURRENCES_0'],proposal:rejectedProposal};

assert.equal(requiresResultConditionedReanchorR506(rejection),true);
const surface=buildResultConditionedAnchorSurfaceR506({residual,stage,contextFiles,rejection});
assert.equal(surface.schema,R506_RESULT_CONDITIONED_SOURCE_RECONCILIATION);
const fileSurface=surface.files.find(row=>row.path===contextFiles[0].path);
assert.ok(fileSurface);
const spanAnchor=fileSurface.anchors.find(row=>row.exact.includes('requestedGibsSpan'));
assert.ok(spanAnchor,'current source anchor for requestedGibsSpan must exist');
assert.equal(contextFiles[0].text.split(spanAnchor.exact).length-1,1);

const correction={
 ...rejectedProposal,
 files:[{path:contextFiles[0].path,preimageSha:'stale-model-sha',replacements:[{
  anchorId:spanAnchor.id,
  before:'stale text is not authoritative',
  after:'  const requestedGibsSpan = 6;',
 }]}],
};
const bound=bindResultConditionedCorrectionR506(correction,{residual,stage,contextFiles,rejection});
assert.equal(bound.activated,true);
assert.equal(bound.valid,true,bound.reasons.join(','));
assert.equal(bound.proposal.files[0].preimageSha,contextFiles[0].sha,'current SHA must be machine-bound');
assert.equal(bound.proposal.files[0].replacements[0].before,spanAnchor.exact,'before must be exact current-source anchor');
assert.equal(bound.bindings[0].selection,'EXPLICIT_ANCHOR_ID');
const checked=validateAiRepairProposalR314(bound.proposal,{contextFiles,residualId:'R388-C-03'});
assert.equal(checked.valid,true,checked.reasons.join(','));
const patches=applyAiRepairProposalR314(bound.proposal,{contextFiles,residualId:'R388-C-03'});
assert.equal(patches.length,1);
assert.ok(patches[0].content.includes('requestedGibsSpan = 6'));
assert.ok(!patches[0].content.includes('requestedGibsSpan = 4'));

const noAnchorId={
 ...rejectedProposal,
 files:[{path:contextFiles[0].path,preimageSha:'wrong',replacements:[{
  before:'  const requestedGibsSpan = 5;',
  after:'  const requestedGibsSpan = 6;',
 }]}],
};
const auto=bindResultConditionedCorrectionR506(noAnchorId,{residual,stage,contextFiles,rejection});
assert.equal(auto.valid,true,auto.reasons.join(','));
assert.equal(auto.bindings[0].selection,'UNIQUE_TOKEN_SCORE');
assert.equal(validateAiRepairProposalR314(auto.proposal,{contextFiles,residualId:'R388-C-03'}).valid,true);

const bad={
 ...rejectedProposal,
 files:[{path:contextFiles[0].path,preimageSha:contextFiles[0].sha,replacements:[{
  anchorId:'F1A999',
  after:'  const requestedGibsSpan = 6;',
 }]}],
};
const badBound=bindResultConditionedCorrectionR506(bad,{residual,stage,contextFiles,rejection});
assert.equal(badBound.valid,false);
assert.ok(badBound.reasons.some(reason=>reason.includes('INVALID_EXPLICIT_ANCHOR_ID')));

const unrelated=bindResultConditionedCorrectionR506(rejectedProposal,{residual,stage,contextFiles,rejection:{state:'REJECTED_BY_R314_POLICY',reasons:['PATCH_SIZE_OUT_OF_BOUNDS'],proposal:rejectedProposal}});
assert.equal(unrelated.activated,false);
assert.equal(unrelated.proposal,rejectedProposal);

const prompt=autonomousRepairCorrectionPromptR314({residual,stage,contextFiles,rejection,attempt:2});
for(const needle of ['R506 RESULT CHANNEL','resultConditionedAnchorsR506','anchorId','runtime will replace before and preimageSha'])assert.ok(prompt.includes(needle),needle);

const cloud=fs.readFileSync('cloudflare/lib/r314-ai-repair.mjs','utf8');
for(const needle of ['bindResultConditionedCorrectionR506','BLOCKED_BY_R506_RESULT_RECONCILIATION','attempt>1&&rejection'])assert.ok(cloud.includes(needle),needle);

console.log('R506 RESULT-CONDITIONED SOURCE RECONCILIATION PASS · zero-occurrence rejection becomes exact-current-source anchor binding before unchanged R314/R503/R504/R505 admission');
