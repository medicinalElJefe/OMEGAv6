/**
 * R816 — execute the R815 atlas in bounded real Node worker_threads.
 * This is a local computational audit, NOT 20,736 deployed Cloudflare workers,
 * independent CI attestation, or authorization to mutate Canon/source.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {compileLemmaAtlasR815,atlasAddress} from './r815-lemma-chain-atlas.mjs';
import {verifySuccessorSourcesR542} from '../src/system/selfBuildSourceBytesProofR542.js';
import {evaluateSuccessorCycleR535} from '../src/system/selfBuildSuccessorAdmissionR535.js';

const sha=x=>createHash('sha256').update(x).digest('hex');
const digest=x=>sha(JSON.stringify(x));
const WORKERS=144,CELLS_PER_WORKER=144,CELLS=20736;
function computePartition(partition,stage){
 let previous=sha('R816_CELL_GENESIS:'+partition.worker);
 const first=partition.start;
 for(let index=first;index<=partition.end;index++){
  const address=atlasAddress(index);
  const row=JSON.stringify({index,address,lemma:stage.lemma,status:stage.status,proofSha256:stage.proofSha256});
  previous=sha(previous+sha(row));
 }
 return{
  worker:partition.worker,start:partition.start,end:partition.end,lemma:stage.lemma,
  stageStatus:stage.status,stageProofSha256:stage.proofSha256,
  evaluatedCells:CELLS_PER_WORKER,cellChainRoot:previous,
  receiptSha256:digest({worker:partition.worker,start:partition.start,end:partition.end,
   lemma:stage.lemma,stageStatus:stage.status,stageProofSha256:stage.proofSha256,
   evaluatedCells:CELLS_PER_WORKER,cellChainRoot:previous})
 };
}
if(!isMainThread){
 try{
  const receipts=workerData.assignments.map(({partition,stage})=>computePartition(partition,stage));
  parentPort.postMessage({ok:true,receipts});
 }catch(error){parentPort.postMessage({ok:false,error:String(error?.message||error)})}
}
export function deriveSourceBackedLemmasR816({root=process.cwd(),manifest,priorState,independentProductionProof=null}={}){
 const evidence={},observations={};
 if(manifest&&priorState){
  const source=verifySuccessorSourcesR542(manifest,{root});
  observations.source=source;
  evidence.SOURCE={status:source.valid?'PASS':'FAIL',proofSha256:digest({
   valid:source.valid,reasons:source.reasons,checked:source.checked
  })};
  const expected=Number(priorState.maxAutonomousGenerations);
  const admitted=Array.isArray(priorState.admittedSourceCapsules)?priorState.admittedSourceCapsules:[];
  const roadmap=Array.isArray(priorState.roadmap)?priorState.roadmap:[];
  const continuity=Number.isSafeInteger(expected)&&expected>0&&admitted.length===expected&&
   new Set(admitted).size===expected&&roadmap.every(row=>admitted.includes(row.id))&&
   !priorState.currentCapsuleId;
  evidence.CONTINUITY={status:continuity?'PASS':'FAIL',
   proofSha256:digest({expected,admitted,roadmapIds:roadmap.map(row=>row.id),
    pending:priorState.currentCapsuleId||null})};
  const admission=evaluateSuccessorCycleR535({priorState,
   capsules:manifest.capsules,sourceProofs:manifest.sourceProofs,
   deploymentProof:manifest.deploymentProof});
  observations.admission=admission;
  const dependencyFailures=admission.reasons.filter(reason=>reason.startsWith('UNPROVEN_DEPENDENCY:')||
   reason.startsWith('SUCCESSOR_DEPENDENCY_CYCLE:')||
   reason.startsWith('DUPLICATE_OR_REUSED_CAPSULE:')||
   reason.startsWith('DUPLICATE_SOURCE_PROOF:')||
   reason==='NO_NEW_CAPSULES'||reason==='SUCCESSOR_BATCH_LIMIT_5');
  evidence.DEPENDENCY={status:dependencyFailures.length?'FAIL':'PASS',
   proofSha256:digest({capsuleIds:(manifest.capsules||[]).map(c=>c.id),
    dependencyFailures,executionOrder:admission.executionOrder})};
 }
 const proof=independentProductionProof;
 const productionValid=proof?.source==='GITHUB_CI_AND_LIVE_WORKER'&&
  /^[a-f0-9]{40}$/.test(String(proof.exactPromotedSha||''))&&
  proof.exactPromotedSha===proof.liveRuntimeSha&&proof.productionBrowserVerified===true&&
  proof.githubRunConclusion==='success'&&Number.isSafeInteger(proof.githubRunId)&&proof.githubRunId>0&&
  proof.exactPromotedSha===manifest?.deploymentProof?.exactPromotedSha;
 if(productionValid){
  const p=digest({source:proof.source,sha:proof.exactPromotedSha,
   run:proof.githubRunId,browser:proof.productionBrowserVerified});
  evidence.IDENTITY={status:'PASS',proofSha256:p};
  evidence.BROWSER={status:'PASS',proofSha256:p};
  evidence.RELEASE={status:'PASS',proofSha256:p};
 }
 // R503 Worker, R164 residual, provenance, conservation and return proof remain
 // UNKNOWN until their independent inherited proof interfaces are executed.
 return{evidence,observations};
}
export function verifyExecutedLemmaReceiptsR816({atlas,receipts}={}){
 const reasons=[];
 if(atlas?.cellCount!==CELLS||atlas?.logicalWorkerCount!==WORKERS||
  !Array.isArray(atlas?.partitions)||atlas.partitions.length!==WORKERS)reasons.push('ATLAS_SHAPE_INVALID');
 if(!Array.isArray(receipts)||receipts.length!==WORKERS)reasons.push('PARTITION_RECEIPT_COUNT_INVALID');
 if(reasons.length)return{valid:false,reasons,verifiedCells:0};
 const seen=new Set();
 let verifiedCells=0;
 for(const receipt of receipts){
  const id=receipt?.worker;
  if(!Number.isInteger(id)||id<0||id>=WORKERS||seen.has(id)){
   reasons.push('DUPLICATE_OR_INVALID_PARTITION');continue;
  }
  seen.add(id);
  const plan=atlas.partitions[id],stage=atlas.stages[id%12];
  const expected=computePartition(plan,stage);
  if(JSON.stringify(receipt)!==JSON.stringify(expected)){
   reasons.push('PARTITION_RECEIPT_MISMATCH:'+id);continue;
  }
  verifiedCells+=expected.evaluatedCells;
 }
 if(verifiedCells!==CELLS)reasons.push('INCOMPLETE_CELL_EXECUTION');
 return{valid:reasons.length===0,reasons,verifiedCells};
}
export async function executeSourceBackedLemmaWorkersR816({
 root=process.cwd(),manifest,priorState,independentProductionProof=null,
 parallelism=12,workerTimeoutMs=60000
}={}){
 if(!isMainThread)throw Error('R816_CONTROLLER_MUST_RUN_ON_MAIN_THREAD');
 if(!Number.isInteger(parallelism)||parallelism<1||parallelism>12)throw Error('INVALID_PARALLELISM');
 if(!Number.isInteger(workerTimeoutMs)||workerTimeoutMs<1000||workerTimeoutMs>120000)throw Error('INVALID_WORKER_TIMEOUT');
 const {evidence,observations}=deriveSourceBackedLemmasR816({root,manifest,priorState,independentProductionProof});
 const atlas=compileLemmaAtlasR815({evidence});
 const groups=Array.from({length:parallelism},()=>[]);
 for(const p of atlas.partitions){
  groups[p.worker%parallelism].push({partition:p,stage:atlas.stages[p.worker%12]});
 }
 const threads=groups.map(assignments=>new Promise((resolve,reject)=>{
  const worker=new Worker(new URL(import.meta.url),{workerData:{assignments}});
  const timeout=setTimeout(()=>{worker.terminate();reject(Error('R816_WORKER_TIMEOUT'))},workerTimeoutMs);
  let settled=false;
  const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timeout);
   worker.terminate();if(error)reject(error);else resolve(value)};
  worker.once('message',msg=>msg?.ok?finish(null,msg.receipts):finish(Error('R816_WORKER_FAILED:'+msg?.error)));
  worker.once('error',error=>finish(error));
  worker.once('exit',code=>{if(code!==0)finish(Error('R816_WORKER_EXIT:'+code))});
 }));
 const receipts=(await Promise.all(threads)).flat().sort((a,b)=>a.worker-b.worker);
 const audit=verifyExecutedLemmaReceiptsR816({atlas,receipts});
 const passed=audit.valid;
 return{
  schema:'OMEGA_R816_EXECUTED_LEMMA_WORKERS',atlas,receipts,audit,
  actualNodeWorkerThreads:parallelism,actualCloudWorkersDispatched:0,
  executedCellCount:passed?audit.verifiedCells:0,
  decision:passed?atlas.decision:'HELD',
  sourceMutationAuthorized:false,productionAdmissionAuthorized:false,
  observationalSummary:{
   sourceValid:observations.source?.valid??null,
   sourceReasons:observations.source?.reasons??[],
   admissionStatus:observations.admission?.status??null,
   admissionReasons:observations.admission?.reasons??[]
  }
 };
}
