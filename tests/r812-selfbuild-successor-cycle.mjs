import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {prepareSuccessorCycleR812,writeSuccessorProposalR812} from '../scripts/r812-selfbuild-successor-cycle.mjs';

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
 assert.equal(result.status,'READY_FOR_GOVERNED_CANDIDATE_PIPELINE',JSON.stringify(result.reasons));
 assert.deepEqual(result.cycle.roadmap.map(x=>x.id),['RG001']);
 assert.equal(result.cycle.generation,0);
 assert.equal(result.cycle.sourceMutationAuthorized,false);
 assert.equal(result.cycle.predecessor.generation,5);
 const output=path.join(root,'proposals','next.json');
 assert.equal(writeSuccessorProposalR812({priorState,manifest,root,output}).status,'READY_FOR_GOVERNED_CANDIDATE_PIPELINE');
 assert.equal(JSON.parse(fs.readFileSync(output,'utf8')).roadmap[0].sourceSha256,sha);
 assert.throws(()=>writeSuccessorProposalR812({priorState,manifest,root,output}),/overwrite/);
 fs.writeFileSync(file,'tampered');
 assert.equal(prepareSuccessorCycleR812({priorState,manifest,root}).status,'HELD');
 fs.writeFileSync(file,body);
 assert.equal(prepareSuccessorCycleR812({priorState,manifest:{...manifest,deploymentProof:null},root}).status,'HELD');
 assert.equal(prepareSuccessorCycleR812({priorState,manifest:{...manifest,capsules:[{...manifest.capsules[0],target:'../unsafe.ts'}]},root}).status,'HELD');
 assert.equal(prepareSuccessorCycleR812({priorState:{...priorState,currentCapsuleId:'SG005'},manifest,root}).status,'HELD');
}finally{fs.rmSync(root,{recursive:true,force:true})}
console.log('R812 successor cycle PASS · verified bytes · immutable predecessor · bounded proposal · tamper/refusal');
