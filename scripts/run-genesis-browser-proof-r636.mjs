// R636: execute an existing browser test and write a reproducible evidence artifact.
// The wrapper does not grant trust: CI run identity and artifact digest must be verified externally.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const permitted=new Map([
 ['historical-rh-traversal','tests/r622-historical-rh-graph-browser-e2e.mjs'],
 ['hybrid-resource-governor','scripts/verify_live_hybrid_resource_governor_r239.mjs']
]);
const id=process.argv[2],script=permitted.get(id);
if(!script)throw Error('R636 unknown browser executor');
const expected=process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'';
if(!/^[a-f0-9]{40}$/.test(expected))throw Error('R636 exact 40-character promoted SHA required');
const base=process.env.OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL||'';
if(!/^https:\/\//.test(base))throw Error('R636 production HTTPS origin required');
// R638: independently fetch the public build receipt before launching Playwright.
const receiptUrl=new URL('/omega-build-receipt.json',base);
receiptUrl.searchParams.set('genesis_r638',String(Date.now()));
const receiptResponse=await fetch(receiptUrl,{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(15000)});
if(!receiptResponse.ok)throw Error('R638 production receipt HTTP '+receiptResponse.status);
const receiptText=await receiptResponse.text();
let receipt;try{receipt=JSON.parse(receiptText)}catch{throw Error('R638 production receipt is not JSON')}
if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)
 throw Error('R638 live production source/promotion SHA mismatch');
const receiptDigest=createHash('sha256').update(receiptText).digest('hex');
// R639: retain a verifiable receipt snapshot and provenance, not only a digest.
const receiptSnapshot={schema:receipt.schema,sourceSha:receipt.source.sha,promotedMergeSha:receipt.promotion.promotedMergeSha};
const startedAt=new Date().toISOString();
const run=spawnSync(process.execPath,[script],{encoding:'utf8',timeout:240000,maxBuffer:2*1024*1024,env:{...process.env,OMEGA_E2E_URL:base,OMEGA_PUBLIC_URL:base,OMEGA_EXPECTED_SHA:expected,OMEGA_PROMOTED_SHA:expected}});
const finishedAt=new Date().toISOString();
const output=(run.stdout||'')+'\n'+(run.stderr||'');
const outputDigest=createHash('sha256').update(output).digest('hex');
const artifact={schema:'OMEGA_BROWSER_EXECUTION_R636_V1',targetId:id,script,environment:'production',expectedSha:expected,exitCode:run.status??1,signal:run.signal||null,startedAt,finishedAt,outputDigest,receiptDigest,receiptRaw:receiptText,receiptSnapshot,receiptUrl:receiptUrl.origin+receiptUrl.pathname,receiptSourceSha:receipt.source.sha,receiptPromotedSha:receipt.promotion.promotedMergeSha,workflowRunId:process.env.GITHUB_RUN_ID||null,workflowSha:process.env.GITHUB_SHA||null,workflowRepository:process.env.GITHUB_REPOSITORY||null,workflowRef:process.env.GITHUB_REF||null,runnerTrust:'UNVERIFIED_EXTERNAL_ATTESTATION_REQUIRED',output};
const dir=resolve('artifacts','genesis-browser');mkdirSync(dir,{recursive:true});
const path=resolve(dir,id+'.json');writeFileSync(path,JSON.stringify(artifact,null,2)+'\n');
const stored=readFileSync(path);console.log('R636 evidence artifact: '+path+' sha256='+createHash('sha256').update(stored).digest('hex'));
if(run.error)console.error(run.error);
if(artifact.exitCode!==0)process.exitCode=1;
