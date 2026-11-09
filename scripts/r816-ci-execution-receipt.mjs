/**
 * Read-only CI execution receipt for the entire R815 address space.
 * No candidate manifest or verified promotion is implied by this audit.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {executeSourceBackedLemmaWorkersR816} from './r816-executed-lemma-workers.mjs';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const output=path.join(root,'artifacts/r816-ci-cell-execution-receipt.json');
if(fs.existsSync(output))throw Error('R816_RECEIPT_OVERWRITE_REFUSED');
const priorState=JSON.parse(fs.readFileSync(path.join(root,'public/omega-r170-selfbuild-state.json'),'utf8'));
const execution=await executeSourceBackedLemmaWorkersR816({root,priorState,parallelism:12});
if(!execution.audit.valid||execution.executedCellCount!==20736||execution.actualCloudWorkersDispatched!==0||
 execution.decision!=='HELD')throw Error('R816_CI_PROOF_BOUNDARY_FAILED');
const receipt={
 schema:'OMEGA_R816_CI_EXECUTION_RECEIPT_V1',
 provenance:'CI_EXECUTED_ADDRESS_COVERAGE_ONLY',
 workflowRunId:process.env.GITHUB_RUN_ID||null,
 workflowHeadSha:process.env.GITHUB_SHA||null,
 sourceBytesProven:false,
 productionProven:false,
 r503WorkerProven:false,
 ...execution
};
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log('R816 CI CELL EXECUTION VERIFIED: '+receipt.executedCellCount+
 ' addresses; '+receipt.receipts.length+' recomputable partition receipts; '+
 receipt.actualNodeWorkerThreads+' real local threads; production/source UNKNOWN; decision HELD');
