import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
export function verifySuccessorSourcesR542(manifest,{root=process.cwd()}={}){
 const reasons=[],checked=[],capsules=Array.isArray(manifest?.capsules)?manifest.capsules:[],proofs=Array.isArray(manifest?.sourceProofs)?manifest.sourceProofs:[];
 for(const c of capsules){
 const id=String(c?.id||''),target=String(c?.target||''),proof=proofs.find(p=>p?.capsuleId===id);
 if(!/^src\/generated\/selfbuildR535\/[A-Za-z0-9_-]+\.(ts|js)$/.test(target)){reasons.push('UNSAFE_TARGET:'+id);continue}
 const absolute=path.resolve(root,target);
 let sha;
 try{if(fs.lstatSync(absolute).isSymbolicLink())throw Error('symlink');sha=createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}catch{reasons.push('SOURCE_UNAVAILABLE:'+id);continue}
 if(proof?.status!=='SOURCE_HASH_VERIFIED'||proof.actualSha256!==sha){reasons.push('SOURCE_HASH_MISMATCH:'+id);continue}
 checked.push({capsuleId:id,target,actualSha256:sha});
 }
 return{schema:'OMEGA_R542_SOURCE_BYTES_PROOF',valid:reasons.length===0&&capsules.length>0,reasons,checked,canonicalAdmission:false};
}
