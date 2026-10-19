import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const ci=readFileSync('.github/workflows/ci.yml','utf8');
assert(ci.includes('R639 validate Genesis browser evidence before retention'));
assert(ci.indexOf('R639 validate Genesis browser evidence before retention')<ci.indexOf('R637 retain Genesis production browser execution artifact'));
const dir=mkdtempSync(join(tmpdir(),'genesis-r639-'));const file=join(dir,'artifact.json'),sha='a'.repeat(40),output='proof output';
const a={targetId:'historical-rh-traversal',script:'tests/r622-historical-rh-graph-browser-e2e.mjs',workflowRunId:'12345',schema:'OMEGA_BROWSER_EXECUTION_R636_V1',expectedSha:sha,receiptSourceSha:sha,receiptPromotedSha:sha,receiptSnapshot:{schema:'OMEGA_GOVERNED_BUILD_RECEIPT_V1',sourceSha:sha,promotedMergeSha:sha},workflowSha:sha,workflowRepository:'medicinalElJefe/OMEGAv6',workflowRef:'refs/heads/main',environment:'production',exitCode:0,signal:null,receiptUrl:'https://example.org/omega-build-receipt.json',receiptDigest:'b'.repeat(64),output,outputDigest:createHash('sha256').update(output).digest('hex'),startedAt:'2026-10-18T12:00:00Z',finishedAt:'2026-10-18T12:01:00Z'};
const run=(v:typeof a)=>{writeFileSync(file,JSON.stringify(v));return spawnSync(process.execPath,['scripts/verify-genesis-browser-artifact-r639.mjs',file],{env:{...process.env,OMEGA_EXPECTED_SHA:sha,GITHUB_REPOSITORY:'medicinalElJefe/OMEGAv6'},encoding:'utf8'}).status};
try{assert.equal(run(a),0);assert.notEqual(run({...a,workflowSha:'c'.repeat(40)}),0);assert.notEqual(run({...a,output:'tampered'}),0);assert.notEqual(run({...a,workflowRef:'refs/heads/feature'}),0);assert.notEqual(run({...a,exitCode:1}),0);assert.notEqual(run({...a,workflowRunId:null as unknown as string}),0);assert.notEqual(run({...a,targetId:'untrusted'}),0);}finally{rmSync(dir,{recursive:true,force:true});}
console.log('Genesis R639 artifact verification and production wiring: PASS');
