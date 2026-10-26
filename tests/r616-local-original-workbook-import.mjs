import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const script='scripts/verify_original_workbook_r616.mjs';
const noArgs=spawnSync(process.execPath,[script],{encoding:'utf8'});
assert.equal(noArgs.status,2);
assert.match(noArgs.stderr,/Usage:/);
const dir=mkdtempSync(join(tmpdir(),'omega-r616-'));
try{
 const p=join(dir,'fake.xlsx');writeFileSync(p,new Uint8Array(149433));
 const rejected=spawnSync(process.execPath,[script,p],{encoding:'utf8'});
 assert.equal(rejected.status,1,'same-length forged workbook must be rejected');
 assert.match(rejected.stderr,/original workbook SHA256 mismatch/);
 assert.doesNotMatch(rejected.stdout,/sourceBytes|engineeringRecords/,'rejected input must not print raw source');
}finally{rmSync(dir,{recursive:true,force:true})}
console.log('R616 local original workbook proof: missing and forged source veto PASS');
