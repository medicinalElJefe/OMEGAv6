#!/usr/bin/env node
import{spawn}from'node:child_process';
import fs from'node:fs';
import path from'node:path';
import{estimateProofShardsR408,recordProofShardObservationR408,normalizeProofWorkloadScarR408}from'../src/system/r408ProofWorkloadEstimator.js';

const proofClass=String(process.env.R408_PROOF_CLASS||'').trim();
const shardCount=Number(process.env.R408_SHARD_COUNT||0);
const maxParallel=Number(process.env.R408_MAX_PARALLEL||0);
const childTimeoutSec=Number(process.env.R408_CHILD_TIMEOUT_SEC||0);
const childCommand=String(process.env.R408_CHILD_COMMAND||'').trim();
const countEnv=String(process.env.R408_COUNT_ENV||'').trim();
const indexEnv=String(process.env.R408_INDEX_ENV||'').trim();
const logPrefix=String(process.env.R408_LOG_PREFIX||'omega-r408-shard');
const scarPath=String(process.env.R408_SCAR_PATH||'.omega/proof-workload/r408-scar.json');

if(!Number.isInteger(shardCount)||shardCount<1||shardCount>16)throw new Error('R408_SHARD_COUNT must be integer 1..16');
if(!Number.isInteger(maxParallel)||maxParallel<1||maxParallel>shardCount)throw new Error('R408_MAX_PARALLEL must be integer 1..R408_SHARD_COUNT');
if(!Number.isInteger(childTimeoutSec)||childTimeoutSec<1)throw new Error('R408_CHILD_TIMEOUT_SEC must be positive integer');
if(!childCommand||!countEnv||!indexEnv)throw new Error('R408 child command and shard env names are required');

const navigation=fs.readFileSync('src/navigationRegistry.ts','utf8');
const block=navigation.slice(navigation.indexOf('export const OMEGA_NAVIGATION=['),navigation.indexOf('export const OMEGA_NAV_GROUPS'));
const surfaces=[...block.matchAll(/name:'([^']+)'/g)].map(m=>m[1]);
if(surfaces.length!==44||new Set(surfaces).size!==44)throw new Error('R408 expected 44 unique canonical surfaces');

let scar={};
try{scar=JSON.parse(fs.readFileSync(scarPath,'utf8'))}catch{}
scar=normalizeProofWorkloadScarR408(scar);
const queue=estimateProofShardsR408({surfaces,shardCount,proofClass,scar});
const predictedByIndex=new Map(queue.map(x=>[x.index,x.predictedMs]));
const running=new Map();
const results=[];
let next=0,failed=false;

fs.mkdirSync(path.dirname(scarPath),{recursive:true});

function launch(spec){
 const log=path.join('/tmp',`${logPrefix}-${spec.index}.log`);
 const stream=fs.createWriteStream(log,{flags:'w'});
 const started=Date.now();
 const env={...process.env,[countEnv]:String(shardCount),[indexEnv]:String(spec.index)};
 const child=spawn('timeout',['--signal=TERM','--kill-after=15s',`${childTimeoutSec}s`,'bash','-lc',childCommand],{env,stdio:['ignore','pipe','pipe']});
 child.stdout.pipe(stream,{end:false});child.stderr.pipe(stream,{end:false});
 console.log(`R408 ${proofClass} shard ${spec.index+1}/${shardCount} started pid=${child.pid} predicted=${Math.round(spec.predictedMs)}ms active=${running.size+1}/${maxParallel}`);
 const done=new Promise(resolve=>{
  child.on('error',error=>resolve({spec,log,started,ended:Date.now(),code:1,signal:null,error:String(error)}));
  child.on('close',(code,signal)=>resolve({spec,log,started,ended:Date.now(),code:code??1,signal,error:null}));
 });
 running.set(spec.index,done);
}

async function settleOne(){
 const result=await Promise.race([...running.values()]);
 running.delete(result.spec.index);
 const observedMs=Math.max(1,result.ended-result.started);
 let logText='';try{logText=fs.readFileSync(result.log,'utf8')}catch{}
 if(result.code===0)process.stdout.write(logText);
 else{
  failed=true;
  console.error(`::error title=R408 ${proofClass} shard ${result.spec.index+1}/${shardCount} failed::Exit ${result.code}${result.signal?` signal ${result.signal}`:''}; exact shard log follows.`);
  process.stderr.write(logText);
 }
 scar=recordProofShardObservationR408({
  scar,proofClass,shardCount,shardIndex:result.spec.index,
  predictedMs:predictedByIndex.get(result.spec.index),observedMs,
  runId:process.env.GITHUB_RUN_ID||null,sha:process.env.GITHUB_SHA||null,
 });
 fs.writeFileSync(scarPath,JSON.stringify(scar,null,2));
 results.push({...result,observedMs});
 console.log(`R408 ${proofClass} shard ${result.spec.index+1}/${shardCount} completed rc=${result.code} observed=${observedMs}ms remaining=${queue.length-next} active=${running.size}`);
}

while(next<queue.length||running.size){
 while(next<queue.length&&running.size<maxParallel)launch(queue[next++]);
 if(running.size)await settleOne();
}

const unique=new Set(results.map(x=>x.spec.index));
if(results.length!==shardCount||unique.size!==shardCount)throw new Error(`R408 incomplete shard recombination ${results.length}/${shardCount} unique=${unique.size}`);
if(failed)process.exit(1);

const totalObserved=results.reduce((s,x)=>s+x.observedMs,0),maxObserved=Math.max(...results.map(x=>x.observedMs));
console.log(`R408 WORK-CONSERVING ${proofClass.toUpperCase()} PASS · ${shardCount} deterministic shards · maxParallel=${maxParallel} · no wave barrier · every shard assigned exactly once · total child runtime=${totalObserved}ms · slowest child=${maxObserved}ms · scar ledger updated at ${scarPath}`);
