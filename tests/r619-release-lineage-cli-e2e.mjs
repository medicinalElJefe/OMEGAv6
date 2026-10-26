import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {delimiter,join,resolve} from 'node:path';

const promoted='891c48166ef495d3d39284261715754b9b31f107';
const previous='5792769b99e69800de198fc112af815df50b8ec6';
const candidate='fb6a48e046439aa39aeaad06a91f7c764084c0f3';
const tree='1d89ccbdbf28182cb3a6c7e3fa2f7b307dfde3d3';
const dir=mkdtempSync(join(tmpdir(),'omega-r619-cli-'));
const output=join(dir,'github-env');
const git=[
  '#!/bin/sh',
  'case "$1:$2" in',
  '  rev-parse:--is-shallow-repository) [ "$MOCK_SHALLOW" = "1" ] && echo true || echo false ;;',
  '  rev-parse:HEAD) [ "$MOCK_DRIFT" = "1" ] && echo "'+candidate+'" || echo "'+promoted+'" ;;',
  '  rev-parse:HEAD\^\{tree\}) echo "'+tree+'" ;;',
  '  show:-s) [ "$MOCK_TOPOLOGY" = "merge" ] && echo "'+previous+' '+candidate+'" || echo "'+previous+'" ;;',
  '  *) echo unexpected-git >&2; exit 9 ;;',
  'esac',
].join('\n')+'\n';
const gh=[
  '#!/bin/sh',
  'case "$2" in',
  '  */pulls) printf "%s\\n" "$MOCK_PR_JSON" ;;',
  '  */git/commits/*) printf "%s\\n" "$MOCK_COMMIT_JSON" ;;',
  '  *) echo unexpected-gh >&2; exit 9 ;;',
  'esac',
].join('\n')+'\n';
writeFileSync(join(dir,'git'),git,{mode:0o755});
writeFileSync(join(dir,'gh'),gh,{mode:0o755});
const pr={number:1145,state:'closed',merged_at:'2026-10-26T06:23:52Z',merge_commit_sha:promoted,base:{ref:'main',sha:previous},head:{sha:candidate}};
function run(overrides={}) {
  writeFileSync(output,'');
  const env={...process.env,GITHUB_SHA:promoted,GITHUB_REPOSITORY:'medicinalElJefe/OMEGAv6',GITHUB_ENV:output,
    MOCK_PR_JSON:JSON.stringify([pr]),MOCK_COMMIT_JSON:JSON.stringify({tree:{sha:tree}}),
    PATH:dir+delimiter+process.env.PATH,...overrides};
  const result=spawnSync(process.execPath,[resolve('scripts/r619-release-lineage.mjs')],{encoding:'utf8',env});
  return {...result,receipt:readFileSync(output,'utf8')};
}
try {
  const squash=run();
  assert.equal(squash.status,0,squash.stderr);
  assert.match(squash.receipt,/OMEGA_RELEASE_LINEAGE_MODE=EXACT_SQUASH_PR_AND_TREE/);
  assert.match(squash.receipt,new RegExp('OMEGA_CANDIDATE_SHA='+candidate));
  assert.match(squash.receipt,new RegExp('OMEGA_ROLLBACK_SHA='+previous));
  const merge=run({MOCK_TOPOLOGY:'merge',MOCK_PR_JSON:'not-json'});
  assert.equal(merge.status,0,merge.stderr);
  assert.match(merge.receipt,/OMEGA_RELEASE_LINEAGE_MODE=EXACT_TWO_PARENT_MERGE/);
  for(const overrides of [{MOCK_SHALLOW:'1'},{MOCK_DRIFT:'1'},{MOCK_PR_JSON:'[]'},{MOCK_COMMIT_JSON:JSON.stringify({tree:{sha:candidate}})}]){
    const rejected=run(overrides);
    assert.equal(rejected.status,1,'unsafe release lineage must be refused');
    assert.equal(rejected.receipt,'','no lineage environment may be emitted after refusal');
  }
  console.log('R619 CLI exact merge/squash GitHub API binding and fail-closed pre-deploy refusal PASS');
}finally{rmSync(dir,{recursive:true,force:true})}
