import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {verifyRecoverySourcesR534} from './r534-recovery-source-preflight.mjs';
import {evaluateSuccessorCycleR535} from '../src/system/selfBuildSuccessorAdmissionR535.js';

const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const targetValid=target=>typeof target==='string'&&/^src\/generated\/selfbuildR535\/[A-Za-z0-9._/-]+$/.test(target)&&target.split('/').every(x=>x!=='.'&&x!=='..'&&x!=='');
/** Stage verified donor bytes outside the repository for human/governed review.
 * No generated source installation, execution, canonical mutation, or PR authority. */
export function stageRecoveryCapsulesR535({root=process.cwd(),priorState,manifest,productionProof,stagingRoot}={}){
 const capsules=Array.isArray(manifest?.capsules)?manifest.capsules:[];
 const preflight=verifyRecoverySourcesR534({root,sources:capsules.map(c=>({path:c?.sourcePath,sha256:c?.sourceSha256}))});
 const proofs=preflight.results.map((p,i)=>({capsuleId:capsules[i]?.id,status:p.status,actualSha256:p.actualSha256,historicalParityClaimed:false}));
 const admission=evaluateSuccessorCycleR535({priorState,capsules,sourceProofs:proofs,deploymentProof:productionProof});
 const targets=capsules.map(c=>c?.target);
 const reasons=[];
 if(preflight.status!=='SOURCE_VERIFIED')reasons.push('SOURCE_PREFLIGHT_HELD');
 if(admission.status!=='READY_FOR_SEPARATE_GOVERNED_REVIEW')reasons.push('SUCCESSOR_ADMISSION_HELD');
 if(targets.some(x=>!targetValid(x)))reasons.push('UNSAFE_GENERATED_TARGET');
 if(new Set(targets).size!==targets.length)reasons.push('DUPLICATE_GENERATED_TARGET');
 const base={schema:'OMEGA_R535_RECOVERY_CAPSULE_STAGING_V2',preflight,admission,canonicalMutation:false,sourceMutation:false,executionClaimed:false,productionAdmission:false,priorProductionProofIndependentlyVerified:false};
 const held=(extra)=>Object.freeze({...base,status:'HELD',reasons:Object.freeze([...reasons,...extra]),staged:Object.freeze([]),stagingDirectory:null,materialized:false});
 if(reasons.length)return held([]);
 if(!stagingRoot)return Object.freeze({...base,status:'READY_FOR_EXPLICIT_STAGING',reasons:Object.freeze([]),staged:Object.freeze([]),stagingDirectory:null,materialized:false});
 let stagingDirectory=null;
 try{
  const rootReal=fs.realpathSync(root),requested=path.resolve(stagingRoot);
  if(fs.lstatSync(requested).isSymbolicLink())return held(['STAGING_ROOT_SYMLINK_REFUSED']);
  const destinationRoot=fs.realpathSync(requested);
  if(!fs.statSync(destinationRoot).isDirectory()||destinationRoot===rootReal||destinationRoot.startsWith(rootReal+path.sep))return held(['STAGING_ROOT_MUST_BE_OUTSIDE_SOURCE_REPOSITORY']);
  stagingDirectory=fs.mkdtempSync(path.join(destinationRoot,'omega-r535-'));
  const staged=[];
  for(const [index,id] of admission.executionOrder.entries()){
   const capsule=capsules.find(c=>c.id===id);
   const source=path.resolve(rootReal,capsule.sourcePath);
   // Re-run path/symlink checks immediately before opening, then hash the opened bytes.
   const recheck=verifyRecoverySourcesR534({root:rootReal,sources:[{path:capsule.sourcePath,sha256:capsule.sourceSha256}]});
   if(recheck.status!=='SOURCE_VERIFIED')throw new Error('SOURCE_CHANGED_AFTER_PREFLIGHT:'+id);
   const fd=fs.openSync(source,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW||0));
   let bytes;
   try{if(!fs.fstatSync(fd).isFile())throw new Error('SOURCE_NOT_REGULAR_FILE:'+id);bytes=fs.readFileSync(fd)}finally{fs.closeSync(fd)}
   const digest=sha256(bytes);
   if(digest!==capsule.sourceSha256.toLowerCase())throw new Error('SOURCE_CHANGED_DURING_STAGING:'+id);
   const stagedName=String(index).padStart(2,'0')+'-'+digest.slice(0,16)+'.source';
   const destination=path.join(stagingDirectory,stagedName);
   fs.writeFileSync(destination,bytes,{flag:'wx',mode:0o600});
   if(sha256(fs.readFileSync(destination))!==digest)throw new Error('STAGED_BYTES_MISMATCH:'+id);
   staged.push(Object.freeze({id,sourcePath:capsule.sourcePath,target:capsule.target,stagedName,sha256:digest,byteLength:bytes.length,sourceVerified:true,stagedBytesVerified:true,executionVerified:false,historicalParityVerified:false,productionAdmission:false}));
  }
  fs.writeFileSync(path.join(stagingDirectory,'manifest.json'),JSON.stringify({schema:base.schema,executionOrder:admission.executionOrder,staged,canonicalMutation:false,executionClaimed:false,productionAdmission:false},null,2)+'\n',{flag:'wx',mode:0o600});
  return Object.freeze({...base,status:'STAGED_FOR_GOVERNED_REVIEW',reasons:Object.freeze([]),staged:Object.freeze(staged),stagingDirectory,materialized:true});
 }catch(error){
  if(stagingDirectory)fs.rmSync(stagingDirectory,{recursive:true,force:true});
  return held(['STAGING_FAILED:'+(error instanceof Error?error.message:String(error))]);
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [manifestPath,proofPath,stagingRoot]=process.argv.slice(2);
 if(!manifestPath||!proofPath||!stagingRoot)throw new Error('Usage: node scripts/r535-stage-recovery-capsules.mjs <manifest.json> <prior-production-proof.json> <existing-staging-directory>');
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const priorState=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
 const productionProof=JSON.parse(fs.readFileSync(proofPath,'utf8'));
 const result=stageRecoveryCapsulesR535({priorState,manifest,productionProof,stagingRoot});
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='STAGED_FOR_GOVERNED_REVIEW')process.exitCode=1;
}
