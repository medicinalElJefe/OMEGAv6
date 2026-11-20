import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {visibleCandidateR885} from '../scripts/r885-version-visibility.mjs';

const candidate='7704df6f-543f-4d45-b91d-64ba7429fa8d';
const previous='8b9e349e-6ce5-460d-8bd1-329dc782f77e';
assert.equal(visibleCandidateR885([{id:candidate}],candidate).ok,true);
assert.equal(visibleCandidateR885({versions:[{id:previous},{version_id:candidate}]},candidate).ok,true);
assert.equal(visibleCandidateR885({versions:[{id:previous}]},candidate).state,'EXACT_UPLOADED_VERSION_NOT_YET_VISIBLE');
assert.equal(visibleCandidateR885({versions:[{id:previous,message:'contains '+candidate}]},candidate).ok,false);
assert.equal(visibleCandidateR885({versions:[]},'not-a-uuid').state,'INVALID_UPLOADED_VERSION_ID_HELD');
assert.equal(visibleCandidateR885('bad',candidate).state,'CLOUDFLARE_VERSION_LIST_SCHEMA_HELD');
for(const envelope of [
 {success:false,result:[{id:candidate}]},
 {errors:[{code:100146,message:'version missing'}],result:[{id:candidate}]},
 {error:{code:10000,message:'unauthorized'},versions:[{id:candidate}]}
]) assert.equal(visibleCandidateR885(envelope,candidate).state,'CLOUDFLARE_VERSION_LIST_ERROR_HELD');

const shell=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const syntax=spawnSync('bash',['-n','scripts/staged-cloudflare-release.sh'],{encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
const begin=shell.indexOf('wait_uploaded_version_visible_r885(){');
const end=shell.indexOf('\nwait_uploaded_version_visible_r885\n',begin);
assert.ok(begin>0&&end>begin,'R885 stage visibility function must be callable');
const fn=shell.slice(begin,end);
assert.ok(shell.indexOf('wait_uploaded_version_visible_r885\n')<shell.indexOf('stage_candidate_with_visibility_retry; then'));
for(const token of ['assert_current_main_owner || return $?','wrangler versions list --name "$WORKER_NAME" --json',
 'r885-version-visibility.mjs','if [[ "$attempt" == "30" ]]','sleep 5','No silent 100% candidate promotion'])
 assert.ok(shell.includes(token),'R885 source boundary missing '+token);

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r885-'));
try {
 for(const [scenario,code,expectedCalls] of [
  ['immediate',0,1],['delayed',0,2],['persistent',1,30],
  ['unknown_error',1,1],['superseded',75,1]
 ]){
  const counter=path.join(dir,scenario);
  fs.writeFileSync(counter,'0');
  const commands=[
   'set -Eeuo pipefail',
   'WORKER_NAME=omegav6',
   'GITHUB_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
   'CANDIDATE_VERSION_ID=7704df6f-543f-4d45-b91d-64ba7429fa8d',
   'TMP_DIR="$(mktemp -d)"',
   'COUNTER_FILE='+JSON.stringify(counter),
   'trap \'rm -rf "$TMP_DIR"\' EXIT',
   'sleep(){ :; }',
   'assert_current_main_owner(){ if [[ "$TEST_SCENARIO" == "superseded" ]] && [[ "$(cat "$COUNTER_FILE")" == "1" ]]; then return 75; fi; return 0; }',
   'npx(){',
   '  local n',
   '  n="$(cat "$COUNTER_FILE")"',
   '  n=$((n+1))',
   '  printf "%s" "$n" > "$COUNTER_FILE"',
   '  if [[ "$TEST_SCENARIO" == "unknown_error" ]]; then echo "AUTHORIZATION_REVOKED [code: 10000]" >&2; return 1; fi',
   '  if [[ "$TEST_SCENARIO" == "persistent" ]] || [[ "$TEST_SCENARIO" == "delayed" && "$n" == "1" ]] || [[ "$TEST_SCENARIO" == "superseded" ]]; then',
   '    printf "%s\\n" \'[{"id":"8b9e349e-6ce5-460d-8bd1-329dc782f77e"}]\'',
   '  else',
   '    printf "%s\\n" \'[{"id":"7704df6f-543f-4d45-b91d-64ba7429fa8d"}]\'',
   '  fi',
   '  return 0',
   '}',
   fn,
   'wait_uploaded_version_visible_r885'
  ];
  const output=spawnSync('bash',['-c',commands.join('\n')],{
   encoding:'utf8',env:{...process.env,TEST_SCENARIO:scenario},timeout:30000
  });
  assert.equal(output.status,code,scenario+' '+output.stderr+'\n'+output.stdout);
  assert.equal(Number(fs.readFileSync(counter,'utf8')),expectedCalls,'unexpected probe count '+scenario);
  if(scenario==='persistent')assert.ok(output.stdout.includes('R885 VERSION NOT REGISTERED'));
  if(scenario==='unknown_error')assert.ok(output.stdout.includes('VERSION LIST HARD ERROR'));
 }
} finally {
 fs.rmSync(dir,{recursive:true,force:true});
}
console.log('R885 PASS: exact catalogue identity, bounded retries, unknown error refusal, stale-head refusal, no unproved traffic promotion');
