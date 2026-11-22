import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const choices=process.platform==='win32'
 ? [['py','-3'],['python']]
 : [['python3'],['python']];
let result=null,executable=null;
for(const [bin,...prefix] of choices){
 const candidate=spawnSync(bin,[...prefix,'tests/r895-windows-host-preflight-invariants.py'],{
  cwd:process.cwd(),encoding:'utf8',timeout:90000,maxBuffer:1024*1024,
  shell:false
 });
 if(candidate.error?.code==='ENOENT')continue;
 result=candidate;executable=bin;break;
}
assert.ok(result,'R895 Windows host-proof regression requires Python 3');
assert.ifError(result.error);
if(result.status!==0)throw new Error('R895 native host-proof regression failed under '+executable+
  ':\n'+String(result.stdout||'')+'\n'+String(result.stderr||''));
assert.match(result.stdout,/R895 NATIVE PREFLIGHT PASS/);
console.log('R895 HOST REGRESSION PASS: actual Python source and held-only receipt validated.');
