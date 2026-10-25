import test from 'node:test';
import assert from 'node:assert/strict';
import {compileArchiveCapabilityIntake,mayPromoteArchiveIntake} from '../tools/archive-capability-intake.mjs';
const H='a'.repeat(64);
const file=(id='libfile_abc')=>({source:{library_file_id:id,name:'calculus.csv'},sha256:H,bytes:3});
const valid=()=>({originalFiles:1,originalBytes:3,proofs:[{status:'DRIVE_FULL_READBACK_VERIFIED',zipSHA256:H,originalFiles:1,files:[file()]}]});
test('indexes only verified originals and is deterministic',()=>{
 const a=compileArchiveCapabilityIntake(valid(),[{library_file_id:'libfile_abc',name:'calculus.csv'},{library_file_id:'libfile_def',name:'legacy.zip'}],[{source:{library_file_id:'libfile_def'}}]);
 const b=compileArchiveCapabilityIntake(valid(),[{library_file_id:'libfile_abc',name:'calculus.csv'},{library_file_id:'libfile_def',name:'legacy.zip'}],[{source:{library_file_id:'libfile_def'}}]);
 assert.equal(a.fingerprint,b.fingerprint);assert.equal(a.verifiedCount,1);assert.equal(a.pendingCount,1);assert.equal(a.exceptionCount,1);assert.equal(a.problems.length,0);assert.equal(a.admission,'DENY_EXECUTION_AND_RELEASE');assert.equal(mayPromoteArchiveIntake(a),false);
});
test('unverified proofs cannot inflate verified count',()=>{
 const i=valid();i.proofs[0].status='LOCAL_VERIFIED_AWAITING_CLOUD_READBACK';
 const r=compileArchiveCapabilityIntake(i);assert.equal(r.verifiedCount,0);assert(r.problems.some(x=>x.kind==='UNADMITTED_PROOF'));assert(r.problems.some(x=>x.kind==='CUMULATIVE_TOTAL_MISMATCH'));
});
test('duplicate original identity is rejected',()=>{
 const i=valid();i.proofs[0].files.push(file());i.proofs[0].originalFiles=2;i.originalFiles=2;i.originalBytes=6;
 const r=compileArchiveCapabilityIntake(i);assert.equal(r.verifiedCount,1);assert(r.problems.some(x=>x.kind==='DUPLICATE_SOURCE_ID'));assert.equal(mayPromoteArchiveIntake(r),false);
});
test('exception cannot silently coexist with verified identity',()=>{
 const r=compileArchiveCapabilityIntake(valid(),[],[{source:{library_file_id:'libfile_abc'}}]);
 assert(r.problems.some(x=>x.kind==='EXCEPTION_ALREADY_VERIFIED'));
});
test('invalid member hash is rejected and reported',()=>{
 const i=valid();i.proofs[0].files[0].sha256='not-a-hash';
 const r=compileArchiveCapabilityIntake(i);assert(r.problems.some(x=>x.kind==='INVALID_FILE_PROOF'));assert.equal(r.verifiedCount,0);
});

test('recovered manifest with cloud readback remains backup indexed, never execution admitted',()=>{
 const i=valid();i.proofs[0].status='DRIVE_RECOVERED_MANIFEST_FULL_READBACK_VERIFIED';
 const r=compileArchiveCapabilityIntake(i);assert.equal(r.verifiedCount,1);
 assert.equal(r.problems.length,0);assert.equal(mayPromoteArchiveIntake(r),false);
});
