import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {prepareSuccessorCycleR812,writeSuccessorProposalR812,verifyAndPrepareSuccessorCycleR812} from '../scripts/r812-selfbuild-successor-cycle.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r812-'));
try{
 const relative='src/generated/selfbuildR535/verified.ts';
 const file=path.join(root,relative);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 const body='export const successorCandidate = 37;\n';
 fs.writeFileSync(file,body);
 const sha=createHash('sha256').update(body).digest('hex');
 const priorState={schema:'OMEGA_GOVERNED_SELFBUILD_STATE_R170',generation:5,maxAutonomousGenerations:5,admittedSourceCapsules:['SG001','SG002','SG003','SG004','SG005'],roadmap:['SG001','SG002','SG003','SG004','SG005'].map(id=>({id})),currentCapsuleId:null};
 const deploymentProof={exactPromotedSha:'a'.repeat(40),liveRuntimeSha:'a'.repeat(40),productionBrowserVerified:true};
 const manifest={capsules:[{id:'RG001',title:'Verified successor',target:relative,prerequisites:['SG005']}],sourceProofs:[{capsuleId:'RG001',status:'SOURCE_HASH_VERIFIED',actualSha256:sha,historicalParityClaimed:false}],deploymentProof};
 const result=prepareSuccessorCycleR812({priorState,manifest,root});
 assert.equal(result.status,'SOURCE_VERIFIED_AWAITING_INDEPENDENT_PRODUCTION_PROOF',JSON.stringify(result.reasons));
 assert.equal(result.cycle,null);
 assert.ok(result.reasons.includes('INDEPENDENT_PRODUCTION_PROOF_REQUIRED'));
 const output=path.join(root,'proposals','next.json');
 assert.equal(writeSuccessorProposalR812({priorState,manifest,root,output}).status,'SOURCE_VERIFIED_AWAITING_INDEPENDENT_PRODUCTION_PROOF');
 assert.equal(fs.existsSync(output),false,'Unverified production evidence must not create a runnable successor cycle');
 const expected='a'.repeat(40);
 const verified=await verifyAndPrepareSuccessorCycleR812({priorState,manifest,root,verifyProduction:async({expectedSha})=>{
  assert.equal(expectedSha,expected);
  return{verified:true,source:'GITHUB_CI_AND_LIVE_WORKER',exactPromotedSha:expected,liveRuntimeSha:expected,productionBrowserVerified:true,githubRunConclusion:'success',githubRunId:12345};
 }});
 assert.equal(verified.status,'VERIFIED_FOR_SEPARATE_GOVERNED_REVIEW');
 assert.equal(verified.cycle.active,false);
 assert.equal(verified.cycle.sourceMutationAuthorized,false);
 assert.equal(verified.cycle.roadmap[0].sourceSha256,sha);
 assert.equal((await verifyAndPrepareSuccessorCycleR812({priorState,manifest,root,verifyProduction:async()=>({verified:true,source:'MANIFEST',exactPromotedSha:expected,liveRuntimeSha:expected,productionBrowserVerified:true,githubRunConclusion:'success',githubRunId:12345})})).status,'HELD');
 assert.equal((await verifyAndPrepareSuccessorCycleR812({priorState,manifest,root,verifyProduction:async()=>{throw Error('offline')}})).status,'HELD');
 fs.writeFileSync(file,'tampered');
 assert.equal(prepareSuccessorCycleR812({priorState,manifest,root}).status,'HELD');
 fs.writeFileSync(file,body);
 assert.equal(prepareSuccessorCycleR812({priorState,manifest:{...manifest,deploymentProof:null},root}).status,'HELD');
 assert.equal(prepareSuccessorCycleR812({priorState,manifest:{...manifest,capsules:[{...manifest.capsules[0],target:'../unsafe.ts'}]},root}).status,'HELD');
 assert.equal(prepareSuccessorCycleR812({priorState:{...priorState,currentCapsuleId:'SG005'},manifest,root}).status,'HELD');
}finally{fs.rmSync(root,{recursive:true,force:true})}
console.log('R812 successor cycle PASS · verified bytes · immutable predecessor · bounded proposal · tamper/refusal');
