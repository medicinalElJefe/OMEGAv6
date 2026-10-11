import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';
import {verifySuccessorSourcesR542} from '../src/system/selfBuildSourceBytesProofR542.js';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r542-'));
try{
 const target='src/generated/selfbuildR535/candidate.ts',full=path.join(root,target);
 fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,'export const candidate=1;\n');
 const sha=createHash('sha256').update(fs.readFileSync(full)).digest('hex');
 const manifest={capsules:[{id:'S1',target}],sourceProofs:[{capsuleId:'S1',status:'SOURCE_HASH_VERIFIED',actualSha256:sha}]};
 assert.equal(verifySuccessorSourcesR542(manifest,{root}).valid,true);
 fs.writeFileSync(full,'export const candidate=2;\n');
 assert.deepEqual(verifySuccessorSourcesR542(manifest,{root}).reasons,['SOURCE_HASH_MISMATCH:S1']);
 fs.unlinkSync(full);
 assert.deepEqual(verifySuccessorSourcesR542(manifest,{root}).reasons,['SOURCE_UNAVAILABLE:S1']);
 assert.equal(verifySuccessorSourcesR542({...manifest,capsules:[{id:'S1',target:'../outside.ts'}]},{root}).valid,false);
 assert.equal(verifySuccessorSourcesR542({capsules:[],sourceProofs:[]},{root}).valid,false);
 console.log('R542 successor real source-byte proof PASS');
}finally{fs.rmSync(root,{recursive:true,force:true})}
