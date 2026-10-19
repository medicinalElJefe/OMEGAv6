// R639: offline integrity and identity checks for actual runner-produced artifacts.
// Authenticity of the CI runner must still be independently established via GitHub run metadata.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const path=process.argv[2];
if(!path)throw Error('R639 artifact file required');
const a=JSON.parse(readFileSync(resolve(path),'utf8'));
const expected=process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'';
const repository=process.env.GITHUB_REPOSITORY||'';
const reasons=[];
if(a.schema!=='OMEGA_BROWSER_EXECUTION_R636_V1')reasons.push('schema');
if(!/^[a-f0-9]{40}$/.test(expected)||a.expectedSha!==expected||a.receiptSourceSha!==expected||a.receiptPromotedSha!==expected)reasons.push('exact SHA');
if(a.receiptSnapshot?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||a.receiptSnapshot?.sourceSha!==expected||a.receiptSnapshot?.promotedMergeSha!==expected)reasons.push('receipt snapshot');
if(a.workflowSha!==expected)reasons.push('workflow SHA');
if(!repository||a.workflowRepository!==repository)reasons.push('repository');
if(a.workflowRef!=='refs/heads/main')reasons.push('production branch');
if(!/^[0-9]+$/.test(String(a.workflowRunId||'')))reasons.push('workflow run id');
if(a.targetId!=='historical-rh-traversal'||a.script!=='tests/r622-historical-rh-graph-browser-e2e.mjs')reasons.push('executor identity');
if(a.environment!=='production'||a.exitCode!==0||a.signal)reasons.push('browser exit');
if(!/^https:\/\//.test(a.receiptUrl||''))reasons.push('receipt origin');
if(!/^[a-f0-9]{64}$/.test(a.receiptDigest||''))reasons.push('receipt digest');
if(typeof a.receiptRaw!=='string'||createHash('sha256').update(a.receiptRaw).digest('hex')!==a.receiptDigest)reasons.push('receipt bytes');
try{
 const live=JSON.parse(a.receiptRaw);
 if(live?.schema!==a.receiptSnapshot?.schema||live?.source?.sha!==expected||live?.promotion?.promotedMergeSha!==expected)reasons.push('receipt content');
}catch{reasons.push('receipt JSON');}
try{if(a.receiptUrl!==new URL('/omega-build-receipt.json',a.receiptUrl).href)reasons.push('receipt path');}catch{reasons.push('receipt URL');}
if(createHash('sha256').update(String(a.output||'')).digest('hex')!==a.outputDigest)reasons.push('output digest');
if(!Number.isFinite(Date.parse(a.startedAt))||!Number.isFinite(Date.parse(a.finishedAt))||Date.parse(a.finishedAt)<Date.parse(a.startedAt))reasons.push('time');
if(reasons.length){console.error('R639 evidence veto: '+reasons.join(', '));process.exit(1);}
console.log('R639 evidence artifact integrity and exact main SHA: PASS (runner authenticity externally required)');
