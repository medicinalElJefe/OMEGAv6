import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifyRecoverySourcesR534} from './r534-recovery-source-preflight.mjs';
import {evaluateSuccessorCycleR535} from '../src/system/selfBuildSuccessorAdmissionR535.js';
/** Deterministic, source-exact capsule staging. No source mutation, PR creation,
 * production admission or automatic code execution. */
export function stageRecoveryCapsulesR535({root=process.cwd(),priorState,manifest,productionProof}={}){
 const capsules=Array.isArray(manifest?.capsules)?manifest.capsules:[];
 const sources=capsules.map(c=>({path:c.sourcePath,sha256:c.sourceSha256}));
 const preflight=verifyRecoverySourcesR534({root,sources});
 const proofs=preflight.results.map((p,i)=>({capsuleId:capsules[i].id,status:p.status,actualSha256:p.actualSha256,historicalParityClaimed:false}));
 const admission=evaluateSuccessorCycleR535({priorState,capsules,sourceProofs:proofs,deploymentProof:productionProof});
 const accepted=preflight.status==='SOURCE_VERIFIED'&&admission.status==='READY_FOR_SEPARATE_GOVERNED_REVIEW';
 const staged=accepted?capsules.map(c=>{
  const source=fs.readFileSync(path.resolve(root,c.sourcePath));
  return Object.freeze({id:c.id,sourcePath:c.sourcePath,target:c.target,sha256:createHash('sha256').update(source).digest('hex'),byteLength:source.length,sourceVerified:true,executionVerified:false,historicalParityVerified:false,productionAdmission:false});
 }):[];
 return Object.freeze({schema:'OMEGA_R535_RECOVERY_CAPSULE_STAGING',status:accepted?'STAGED_FOR_GOVERNED_REVIEW':'HELD',preflight,admission,staged:Object.freeze(staged),canonicalMutation:false,sourceMutation:false,executionClaimed:false});
}
if(process.argv[1]?.endsWith('r535-stage-recovery-capsules.mjs')){
 const manifestPath=process.argv[2];
 if(!manifestPath)throw new Error('Usage: node scripts/r535-stage-recovery-capsules.mjs <manifest.json> [production-proof.json]');
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const priorState=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
 const productionProof=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):null;
 const result=stageRecoveryCapsulesR535({priorState,manifest,productionProof});
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='STAGED_FOR_GOVERNED_REVIEW')process.exitCode=1;
}
