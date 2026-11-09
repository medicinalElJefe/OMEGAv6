import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {executeSourceBackedLemmaWorkersR816,verifyExecutedLemmaReceiptsR816,
 deriveSourceBackedLemmasR816} from '../scripts/r816-executed-lemma-workers.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r816-'));
try{
 const relative='src/generated/selfbuildR535/R816Candidate.ts';
 const absolute=path.join(root,relative);
 fs.mkdirSync(path.dirname(absolute),{recursive:true});
 const body='export const r816Fixture = 20736;\n';
 fs.writeFileSync(absolute,body);
 const sourceProof={capsuleId:'R816Candidate',status:'SOURCE_HASH_VERIFIED',
   actualSha256:hash(body),historicalParityClaimed:false};
 const manifest={capsules:[{id:'R816Candidate',title:'Source-based worker audit',
   target:relative,prerequisites:['old']}],sourceProofs:[sourceProof],
   deploymentProof:{exactPromotedSha:'a'.repeat(40),
    liveRuntimeSha:'a'.repeat(40),productionBrowserVerified:true}};
 const priorState={schema:'R170',generation:1,maxAutonomousGenerations:1,
  currentCapsuleId:null,admittedSourceCapsules:['old'],
  roadmap:[{id:'old'}]};
 const derived=deriveSourceBackedLemmasR816({root,manifest,priorState});
 assert.equal(derived.evidence.SOURCE.status,'PASS');
 assert.equal(derived.evidence.CONTINUITY.status,'PASS');
 assert.equal(derived.evidence.DEPENDENCY.status,'PASS');
 assert.equal(derived.evidence.BROWSER,undefined);
 const execution=await executeSourceBackedLemmaWorkersR816({root,manifest,priorState,parallelism:4});
 assert.equal(execution.schema,'OMEGA_R816_EXECUTED_LEMMA_WORKERS');
 assert.equal(execution.actualNodeWorkerThreads,4);
 assert.equal(execution.actualCloudWorkersDispatched,0);
 assert.equal(execution.receipts.length,144);
 assert.equal(execution.audit.valid,true);
 assert.equal(execution.executedCellCount,20736);
 assert.equal(execution.decision,'HELD');
 assert.equal(execution.atlas.stages.find(x=>x.lemma==='WORKER').status,'UNKNOWN');
 assert.equal(execution.atlas.stages.find(x=>x.lemma==='SOURCE').status,'PASS');
 assert.equal(execution.receipts[0].evaluatedCells,144);
 assert.equal(execution.receipts.at(-1).end,20735);
 const broken=structuredClone(execution.receipts);
 broken[0].cellChainRoot='0'.repeat(64);
 assert.equal(verifyExecutedLemmaReceiptsR816({atlas:execution.atlas,receipts:broken}).valid,false);
 assert.equal(verifyExecutedLemmaReceiptsR816({atlas:execution.atlas,receipts:broken.slice(1)}).valid,false);
 fs.writeFileSync(absolute,'export const r816Fixture = 0;\n');
 const drift=deriveSourceBackedLemmasR816({root,manifest,priorState});
 assert.equal(drift.evidence.SOURCE.status,'FAIL');
 await assert.rejects(executeSourceBackedLemmaWorkersR816({root,manifest,priorState,parallelism:0}),/INVALID_PARALLELISM/);
 console.log('R816 PASS: 4 real Node worker threads, 144 independently checked receipts, 20,736 evaluated addresses, source drift refusal');
}finally{fs.rmSync(root,{recursive:true,force:true})}
