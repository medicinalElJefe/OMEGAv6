import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const script='scripts/r885-version-proof.mjs';
const version='7704df6f-543f-4d45-b91d-64ba7429fa8d';
const other='8b9e349e-6ce5-460d-8bd1-329dc782f77e';
const dir=mkdtempSync(join(tmpdir(),'r885-provider-proof-'));
const fn=join(dir,'view.json');
function evaluateView(value,requested=version){
 writeFileSync(fn,JSON.stringify(value));
 return spawnSync(process.execPath,[script,requested,fn],{encoding:'utf8'});
}
try{
 assert.equal(evaluateView({id:version,created_on:'2026-11-20T02:51:16Z'}).status,0);
 assert.equal(evaluateView({version:{version_id:version},metadata:{message:'R885'}}).status,0);
 assert.notEqual(evaluateView({id:other,message:'Uploaded version '+version}).status,0,'must reject ID only quoted in message');
 assert.notEqual(evaluateView({versions:[{id:other}]}).status,0,'must reject a different visible Worker version');
 assert.notEqual(evaluateView({result:[{id:other}]}).status,0,'must not accept success without exact ID');
 assert.notEqual(evaluateView({id:'not-a-uuid'}).status,0);
 assert.notEqual(evaluateView({id:version},'bad').status,0);
 const bash=readFileSync('scripts/staged-cloudflare-release.sh','utf8');
 for(const part of [
  'wrangler versions upload --name "$WORKER_NAME" --config "$ARCHIVE_RUNTIME_CONFIG"',
  'wrangler versions view "$CANDIDATE_VERSION_ID" --name "$WORKER_NAME"',
  '--config "$ARCHIVE_RUNTIME_CONFIG" --json > "$SPLIT_PROVIDER_VIEW"',
  'node scripts/r885-version-proof.mjs "$CANDIDATE_VERSION_ID" "$SPLIT_PROVIDER_VIEW"',
  'for attempt in $(seq 1 18)',
  'is_exact_visibility_pending "$SPLIT_LOG"',
  'assert_current_main_owner || return $?',
  'SPLIT_RC=$?',
  'if [[ "$BASELINE_PROBE_RC" == "42" ]]',
  'STAGING_MODE="ZERO_PERCENT_OVERRIDE"'
 ])assert.ok(bash.includes(part),'R885 fail-closed source invariant missing: '+part);
 console.log('R885 EXACT-VERSION PROVIDER ID, NO-PROMOTION, CONFIG BINDING AND BOUNDED RETRY TEST PASS');
}finally{rmSync(dir,{recursive:true,force:true})}
