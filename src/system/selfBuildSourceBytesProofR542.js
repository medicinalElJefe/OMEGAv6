import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

/** Verify actual candidate bytes, not a self-asserted digest or a symlinked source. */
export function verifySuccessorSourcesR542(manifest,{root=process.cwd()}={}){
 const reasons=[],checked=[];
 const capsules=Array.isArray(manifest?.capsules)?manifest.capsules:[];
 const proofs=Array.isArray(manifest?.sourceProofs)?manifest.sourceProofs:[];
 const ids=new Set(),proofIds=new Set();
 const trustedRoot=path.resolve(root);
 for(const proof of proofs){
  const id=String(proof?.capsuleId||'');
  if(!id||proofIds.has(id))reasons.push('DUPLICATE_OR_INVALID_PROOF:'+id);
  proofIds.add(id);
 }
 for(const c of capsules){
  const id=String(c?.id||''),target=String(c?.target||'');
  if(!id||ids.has(id)){reasons.push('DUPLICATE_OR_INVALID_CAPSULE:'+id);continue}
  ids.add(id);
  const proof=proofs.find(p=>p?.capsuleId===id);
  if(!/^src\\/generated\\/selfbuildR535\\/[A-Za-z0-9_-]+\\.(ts|js)$/.test(target)){
   reasons.push('UNSAFE_TARGET:'+id);continue;
  }
  const absolute=path.resolve(trustedRoot,target);
  if(!absolute.startsWith(trustedRoot+path.sep)){
   reasons.push('UNSAFE_TARGET:'+id);continue;
  }
  let sha;
  try{
   let current=absolute;
   while(current!==trustedRoot){
    const stat=fs.lstatSync(current);
    if(stat.isSymbolicLink())throw Error('symlink');
    if(current===absolute&&!stat.isFile())throw Error('not regular file');
    if(current!==absolute&&!stat.isDirectory())throw Error('not directory');
    current=path.dirname(current);
   }
   sha=createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
  }catch{reasons.push('SOURCE_UNAVAILABLE:'+id);continue}
  if(proof?.status!=='SOURCE_HASH_VERIFIED'||proof.actualSha256!==sha){
   reasons.push('SOURCE_HASH_MISMATCH:'+id);continue;
  }
  checked.push({capsuleId:id,target,actualSha256:sha});
 }
 for(const id of proofIds)if(!ids.has(id))reasons.push('ORPHAN_SOURCE_PROOF:'+id);
 return{schema:'OMEGA_R542_SOURCE_BYTES_PROOF',valid:reasons.length===0&&capsules.length>0,reasons,checked,canonicalAdmission:false};
}
