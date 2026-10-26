import assert from 'node:assert/strict';
import {bindReleaseLineageR619 as bind} from '../scripts/r619-release-lineage.mjs';

const previous = '5792769b99e69800de198fc112af815df50b8ec6';
const promoted = '891c48166ef495d3d39284261715754b9b31f107';
const candidate = 'fb6a48e046439aa39aeaad06a91f7c764084c0f3';
const tree = '1d89ccbdbf28182cb3a6c7e3fa2f7b307dfde3d3';
const pr = {
  number: 1145, state: 'closed', merged_at: '2026-10-26T06:23:52Z',
  merge_commit_sha: promoted,
  base: {ref: 'main', sha: previous}, head: {sha: candidate},
};
const squash = {promotedSha: promoted, parents: [previous], associatedPulls: [pr], candidateTreeSha: tree, promotedTreeSha: tree};
const accepted = bind(squash);
assert.equal(accepted.lineageMode, 'EXACT_SQUASH_PR_AND_TREE');
assert.equal(accepted.rollbackSha, previous);
assert.equal(accepted.candidateSha, candidate);
assert.equal(accepted.pullRequest, 1145);
assert.equal(bind({promotedSha: promoted, parents: [previous, candidate]}).lineageMode, 'EXACT_TWO_PARENT_MERGE');
assert.throws(() => bind({...squash, associatedPulls: []}), /matching merged main PR/);
assert.throws(() => bind({...squash, associatedPulls: [pr, pr]}), /matching merged main PR/);
assert.throws(() => bind({...squash, associatedPulls: [{...pr, merged_at: null}]}), /matching merged main PR/);
assert.throws(() => bind({...squash, associatedPulls: [{...pr, state: 'open'}]}), /matching merged main PR/);
assert.throws(() => bind({...squash, associatedPulls: [{...pr, merge_commit_sha: candidate}]}), /matching merged main PR/);
assert.throws(() => bind({...squash, associatedPulls: [{...pr, base: {ref: 'other', sha: previous}}]}), /matching merged main PR/);
assert.throws(() => bind({...squash, associatedPulls: [{...pr, base: {ref: 'main', sha: candidate}}]}), /matching merged main PR/);
assert.throws(() => bind({...squash, associatedPulls: [{...pr, head: {sha: previous}}]}), /distinct/);
assert.throws(() => bind({...squash, candidateTreeSha: candidate}), /tree differs/);
assert.throws(() => bind({...squash, promotedTreeSha: undefined}), /exact 40-character/);
assert.throws(() => bind({...squash, parents: []}), /exactly one squash parent/);
assert.throws(() => bind({...squash, parents: [previous, candidate, promoted]}), /exactly one squash parent/);
assert.throws(() => bind({...squash, parents: [previous, previous]}), /repeated parent/);
assert.throws(() => bind({...squash, promotedSha: 'bad'}), /exact 40-character/);
assert.throws(() => bind({...squash, associatedPulls: null}), /associated PR evidence/);
// Production GitHub token must be authorized to read the commit-associated PR API.
// Job-level permissions override workflow-level grants; keep both read and action scopes.
const {readFileSync} = await import('node:fs');
const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const deployJob = workflow.split(/\n  deploy-main:\s*\n/)[1]?.split(/\n  post-deploy-authority-closure:\s*\n/)[0];
assert.ok(deployJob, 'canonical production deploy job must exist');
assert.match(deployJob, /\n    permissions:\s*\n      contents: read\s*\n      actions: write\s*\n      pull-requests: read/, 'squash provenance requires read-only pull request access');
assert.match(deployJob, /GH_TOKEN: \$\{\{ github\.token \}\}/, 'lineage binder must receive workflow token');
console.log('R619 two-parent and exact-squash release lineage, PR provenance, tree equality, fail-closed negatives PASS');
