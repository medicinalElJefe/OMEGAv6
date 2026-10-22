import assert from 'node:assert/strict';
import {evaluateLocalModeProposalR673} from '../src7/workspaces/modelGovernanceR673.ts';
const sourceTrace=[
 {continuity:.30,plasticity:.55,contradiction:.25,burden:.24,scar:.18},
 {continuity:.40,plasticity:.62,contradiction:.20,burden:.20,scar:.15}
];
const after=[
 {continuity:.65,plasticity:.65,contradiction:.17,burden:.15,scar:.14},
 {continuity:.70,plasticity:.72,contradiction:.14,burden:.12,scar:.13}
];
const input={schema:'OMEGA7_CANONICAL_MODE_EXECUTION_R671',address:42,mode:'HEIGHTENED',sourceTrace,frame:{canonicalState:after}};
const a=evaluateLocalModeProposalR673(input),b=evaluateLocalModeProposalR673(input);
assert.equal(a.status,'HELD');
assert.equal(a.promotionAllowed,false,'local output must not claim release authority');
assert.equal(a.canonicalMutation,false);
assert.equal(a.sourceAuthority,'R125_REQUIRED');
assert.equal(a.decision,'ESCALATE','authority veto means escalation even if model score improves');
assert.ok(a.dewey.candidateScore>a.dewey.parentScore,'the growth kernel must actually run');
assert.ok(a.growth.continuity>0,'computed model changes must affect R457 growth');
assert.ok(a.hardVetoes.includes('SOURCE_HEAD_NOT_EXACT_GIT_SHA'));
assert.ok(a.hardVetoes.includes('AUTHORITY_NOT_CLOSED'));
assert.ok(a.hardVetoes.some(x=>x.startsWith('AUTHORITATIVE_PROOF_SET_INCOMPLETE')));
assert.ok(a.hardVetoes.some(x=>x.startsWith('METRIC_EVIDENCE_INCOMPLETE')));
assert.deepEqual(a,b,'mode governance must replay deterministically');
assert.deepEqual(input.sourceTrace,sourceTrace,'evaluation must preserve source');
assert.throws(()=>evaluateLocalModeProposalR673({schema:'WRONG'}),/requires executed local/);
console.log('R673 PASS: real R457 developmental growth computed, local source execution correctly held by explicit production/evidence proof vetoes');
