import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

// Execute the actual R300 verifier in isolated Node processes. No live network
// access: the fixture serves exact checked-in R205 bytes and deliberately fails
// any staged Durable Object request.
const script=`
import fs from 'node:fs';
const mode=process.env.R817_FIXTURE_MODE;
const files={
 '/omega-pc-proof-r205.html':'public/omega-pc-proof-r205.html',
 '/omega-pc-proof-r205.js':'public/omega-pc-proof-r205.js',
 '/omega-r205-pc-proof-contract.json':'public/omega-r205-pc-proof-contract.json'
};
let statusCalls=0;
globalThis.fetch=async input=>{
 const path=new URL(input).pathname;
 if(path==='/api/hybrid/status'){
  statusCalls++;
  if(mode==='staged')throw Error('STAGED_DURABLE_OBJECT_MUST_NOT_BE_QUERIED');
  if(mode==='live-fail')return new Response(JSON.stringify({code:'HYBRID_STATUS_RUNTIME_UNREACHABLE',state:'RUNTIME_STATUS_UNKNOWN'}),{status:503,headers:{'content-type':'application/json'}});
  return new Response(JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[]}),{status:200});
 }
 if(!(path in files))throw Error('UNEXPECTED_ROUTE:'+path);
 return new Response(fs.readFileSync(files[path],'utf8'),{status:200});
};
try{
 await import('./scripts/verify_live_r300_at09_at10_handoff.mjs');
 if(mode==='live-fail')throw Error('LIVE_FAILURE_WAS_WRONGLY_ACCEPTED');
 if(mode==='staged'&&statusCalls!==0)throw Error('STAGED_STATUS_REQUEST_OCCURRED');
 if(mode==='live-pass'&&statusCalls!==1)throw Error('LIVE_STATUS_REQUEST_MISSING');
 console.log('R817_FIXTURE_PASS:'+mode+':statusCalls='+statusCalls);
}catch(error){
 if(mode==='live-fail'&&String(error).includes('HTTP 503')&&statusCalls===1){
  console.log('R817_FIXTURE_PASS:live-fail:fail-closed');process.exit(0);
 }
 console.error(error);process.exit(1);
}
`;
for(const mode of ['staged','live-pass','live-fail']){
 const result=spawnSync(process.execPath,['--input-type=module','-e',script],{
  cwd:process.cwd(),encoding:'utf8',timeout:15000,
  env:{...process.env,R817_FIXTURE_MODE:mode,OMEGA_STAGED_READ_ONLY:mode==='staged'?'1':'0',OMEGA_PUBLIC_URL:'https://fixture.invalid'}
 });
 assert.equal(result.status,0,`R817 ${mode} execution failed: ${result.stderr} ${result.stdout}`);
 assert.match(result.stdout,/R817_FIXTURE_PASS:/);
}
console.log('R817 PASS: staged avoids DO status, promoted-live checks real status, 503 fails closed');
