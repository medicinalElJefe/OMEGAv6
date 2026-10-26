#!/usr/bin/env node
// R619: bind production release lineage to GitHub's actual merge topology.
// Two-parent merges retain first-parent rollback / second-parent candidate.
// One-parent squash requires exact merged PR provenance and identical Git trees.
import {execFileSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SHA = /^[0-9a-f]{40}$/;
function requireSha(value, label) {
  if (typeof value !== 'string' || !SHA.test(value)) throw Error(label + ': exact 40-character lowercase Git SHA required');
  return value;
}

export function bindReleaseLineageR619({promotedSha, parents, associatedPulls = [], candidateTreeSha, promotedTreeSha} = {}) {
  const promoted = requireSha(promotedSha, 'promoted SHA');
  if (!Array.isArray(parents) || ![1, 2].includes(parents.length)) {
    throw Error('release lineage: exactly one squash parent or two merge parents required');
  }
  const verifiedParents = parents.map((p, i) => requireSha(p, 'parent ' + (i + 1)));
  if (verifiedParents.includes(promoted) || new Set(verifiedParents).size !== verifiedParents.length) {
    throw Error('release lineage: invalid or repeated parent');
  }
  if (verifiedParents.length === 2) {
    return Object.freeze({
      promotedSha: promoted, rollbackSha: verifiedParents[0], candidateSha: verifiedParents[1],
      lineageMode: 'EXACT_TWO_PARENT_MERGE',
    });
  }
  const rollbackSha = verifiedParents[0];
  if (!Array.isArray(associatedPulls)) throw Error('squash lineage: associated PR evidence required');
  const matching = associatedPulls.filter(pr =>
    pr && pr.state === 'closed' && typeof pr.merged_at === 'string' && pr.merged_at.length > 0 &&
    pr.merge_commit_sha === promoted && pr.base?.ref === 'main' && pr.base?.sha === rollbackSha &&
    typeof pr.head?.sha === 'string' && SHA.test(pr.head.sha));
  if (matching.length !== 1) throw Error('squash lineage: exactly one matching merged main PR required');
  const candidateSha = requireSha(matching[0].head.sha, 'squash candidate SHA');
  if (candidateSha === promoted || candidateSha === rollbackSha) {
    throw Error('squash lineage: candidate must be distinct from promoted and rollback');
  }
  if (requireSha(candidateTreeSha, 'candidate tree SHA') !== requireSha(promotedTreeSha, 'promoted tree SHA')) {
    throw Error('squash lineage: promoted tree differs from approved candidate tree');
  }
  return Object.freeze({
    promotedSha: promoted, rollbackSha, candidateSha,
    lineageMode: 'EXACT_SQUASH_PR_AND_TREE',
    pullRequest: matching[0].number,
  });
}

function command(program, args) {
  return execFileSync(program, args, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
}

function main() {
  const sha = requireSha(process.env.GITHUB_SHA, 'workflow SHA');
  const repository = process.env.GITHUB_REPOSITORY;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository || '')) throw Error('repository identity required');
  if (!process.env.GITHUB_ENV) throw Error('GitHub environment output required');
  if (command('git', ['rev-parse', '--is-shallow-repository']) !== 'false') throw Error('shallow lineage unsafe');
  if (command('git', ['rev-parse', 'HEAD']) !== sha) throw Error('checkout SHA drift');
  const parents = command('git', ['show', '-s', '--format=%P', sha]).split(/\s+/).filter(Boolean);
  let associatedPulls = [], candidateTreeSha, promotedTreeSha;
  if (parents.length === 1) {
    associatedPulls = JSON.parse(command('gh', ['api', 'repos/' + repository + '/commits/' + sha + '/pulls']));
    if (!Array.isArray(associatedPulls)) throw Error('squash lineage: GitHub PR API did not return an array');
    const matching = associatedPulls.filter(pr => pr?.merge_commit_sha === sha && pr?.base?.ref === 'main' && pr?.base?.sha === parents[0] && pr?.merged_at);
    if (matching.length !== 1) throw Error('squash lineage: unique PR provenance unavailable');
    const candidate = requireSha(matching[0].head?.sha, 'candidate SHA');
    const commit = JSON.parse(command('gh', ['api', 'repos/' + repository + '/git/commits/' + candidate]));
    candidateTreeSha = commit?.tree?.sha;
    promotedTreeSha = command('git', ['rev-parse', 'HEAD^{tree}']);
  }
  const bound = bindReleaseLineageR619({promotedSha: sha, parents, associatedPulls, candidateTreeSha, promotedTreeSha});
  appendFileSync(process.env.GITHUB_ENV,
    'OMEGA_ROLLBACK_SHA=' + bound.rollbackSha + '\n' +
    'OMEGA_CANDIDATE_SHA=' + bound.candidateSha + '\n' +
    'OMEGA_PROMOTED_SHA=' + bound.promotedSha + '\n' +
    'OMEGA_RELEASE_LINEAGE_MODE=' + bound.lineageMode + '\n');
  process.stdout.write('R619 release lineage bound: ' + bound.lineageMode + '; promoted ' + bound.promotedSha +
    '; candidate ' + bound.candidateSha + '; rollback ' + bound.rollbackSha + '.\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try { main(); } catch (error) {
    console.error('R619 RELEASE LINEAGE REFUSED:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
