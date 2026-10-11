import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {stageRecoveryCapsulesR535} from '../scripts/r535-stage-recovery-capsules.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r535-'));
try{
 const bytes='export const sourceRecovered=true;\n',sourcePath='donor.ts';
 fs.writeFileSync(path.join(root,sourcePath),bytes);
 const sourceSha256=createHash('sha256').update(bytes).digest('hex');
 const priorState={maxAutonomousGenerations:1,admittedSourceCapsules:['SG001'],roadmap:[{id:'SG001'}],currentCapsuleId:null};
 const manifest={capsules:[{id:'RG001',target:'src/generated/selfbuildR535/donor.ts',sourcePath,sourceSha256,prerequisites:['SG001']}]};
 const productionProof={exactPromotedSha:'a'.repeat(40),liveRuntimeSha:'a'.repeat(40),productionBrowserVerified:true};
 const input={root,priorState,manifest,productionProof};
 const good=stageRecoveryCapsulesR535(input);
 assert.equal(good.status,'STAGED_FOR_GOVERNED_REVIEW');
 assert.equal(good.staged[0].sha256,sourceSha256);
 assert.equal(good.sourceMutation,false);
 assert.equal(good.executionClaimed,false);
 assert.equal(stageRecoveryCapsulesR535({...input,productionProof:null}).status,'HELD');
 assert.equal(stageRecoveryCapsulesR535({...input,manifest:{capsules:[]}}).status,'HELD');
 fs.writeFileSync(path.join(root,sourcePath),'tampered');
 assert.equal(stageRecoveryCapsulesR535(input).status,'HELD');
}finally{fs.rmSync(root,{recursive:true,force:true})}
console.log('R535 source capsule staging proof PASS');
