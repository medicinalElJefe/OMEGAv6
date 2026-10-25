// Archive capability intake is advisory, never a canonical-state writer.
// R288/R289: source presence != execution, scientific validity or release proof.
import { createHash } from 'node:crypto';

const HASH = /^[a-f0-9]{64}$/i;
const ALLOWED = new Set(['DRIVE_FULL_READBACK_VERIFIED','DRIVE_SEGMENTED_FULL_READBACK_VERIFIED']);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function compileArchiveCapabilityIntake(index, inventory = [], exceptions = []) {
  if (!index || !Array.isArray(index.proofs) || !Number.isSafeInteger(index.originalFiles)) throw Error('Invalid recovery index');
  if (!Array.isArray(inventory) || !Array.isArray(exceptions)) throw Error('Inventory/exceptions must be arrays');
  const byId = new Map();
  const problems = [];
  let totalBytes = 0;
  for (let pi=0; pi<index.proofs.length; pi++) {
    const proof=index.proofs[pi];
    if (!ALLOWED.has(proof.status)) { problems.push({kind:'UNADMITTED_PROOF',proof:pi}); continue; }
    if (!Array.isArray(proof.files) || proof.originalFiles!==proof.files.length) {problems.push({kind:'PROOF_COUNT_MISMATCH',proof:pi});continue;}
    if (!HASH.test(String(proof.sha256 ?? proof.zipSHA256 ?? ''))) problems.push({kind:'MISSING_ARCHIVE_HASH',proof:pi});
    for (const file of proof.files) {
      const id=file?.source?.library_file_id;
      const hash=file?.sha256;
      const bytes=file?.bytes;
      if (typeof id!=='string' || !/^libfile_[a-z0-9]+$/i.test(id) || !HASH.test(String(hash)) || !Number.isSafeInteger(bytes) || bytes<0) {
        problems.push({kind:'INVALID_FILE_PROOF',proof:pi,id:id??null});continue;
      }
      if(byId.has(id)) {problems.push({kind:'DUPLICATE_SOURCE_ID',proof:pi,id});continue;}
      byId.set(id,{id,name:String(file.source.name??''),bytes,sha256:hash.toLowerCase(),archive:String(proof.bundle??proof.cloudFileId??''),evidence:'DRIVE_READBACK_INDEXED',execution:'NOT_EVALUATED'});
      totalBytes+=bytes;
    }
  }
  if(byId.size!==index.originalFiles || totalBytes!==index.originalBytes) problems.push({kind:'CUMULATIVE_TOTAL_MISMATCH',expected:index.originalFiles,observed:byId.size,expectedBytes:index.originalBytes,observedBytes:totalBytes});
  const exceptionIds=new Set();
  for(const e of exceptions) {
    const id=e?.source?.library_file_id??e?.library_file_id;
    if(typeof id!=='string') {problems.push({kind:'INVALID_EXCEPTION'});continue;}
    exceptionIds.add(id);
    if(byId.has(id)) problems.push({kind:'EXCEPTION_ALREADY_VERIFIED',id});
  }
  const pending=[];
  const seen=new Set();
  for(const source of inventory) {
    const id=source?.library_file_id??source?.source?.library_file_id;
    if(typeof id!=='string') {problems.push({kind:'INVENTORY_MISSING_ID'});continue;}
    if(seen.has(id)) {problems.push({kind:'DUPLICATE_INVENTORY_ID',id});continue;}
    seen.add(id);
    if(!byId.has(id)) pending.push({id,name:String(source.name??''),bytes:Number.isSafeInteger(source.size_bytes)?source.size_bytes:null,status:exceptionIds.has(id)?'SOURCE_EXCEPTION':'BACKUP_PENDING'});
  }
  pending.sort((a,b)=>a.id.localeCompare(b.id));
  const rows=[...byId.values()].sort((a,b)=>a.id.localeCompare(b.id));
  const fingerprint=sha256(Buffer.from(JSON.stringify({rows,pending,problems})));
  return {schema:'omega.archive.intake.v1',fingerprint,verifiedCount:byId.size,verifiedBytes:totalBytes,inventoryCount:seen.size,pendingCount:pending.length,exceptionCount:pending.filter(p=>p.status==='SOURCE_EXCEPTION').length,admission:'DENY_EXECUTION_AND_RELEASE',problems,rows,pending};
}
export function mayPromoteArchiveIntake(report) {
  // Deliberate fail-closed gate: no source backup can ever grant code execution or release authority.
  return false;
}
