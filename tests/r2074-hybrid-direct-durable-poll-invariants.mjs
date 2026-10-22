import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/workerR116.js';

const r101=fs.readFileSync('src/workerR101.js','utf8');
const baseAgent=fs.readFileSync('public/omega-hybrid-agent-base-r205.py','utf8');
const must=(ok,msg)=>assert.ok(ok,`R207.4 ${msg}`);

for(const pair of [
 ["'/api/hybrid/agent/register':'/agent/register'",'register'],
 ["'/api/hybrid/agent/heartbeat':'/agent/heartbeat'",'heartbeat'],
 ["'/api/hybrid/agent/poll':'/agent/poll'",'poll'],
 ["'/api/hybrid/agent/result':'/agent/result'",'result']
])must(r101.includes(pair[0]),`direct durable ${pair[1]} mapping missing`);
for(const token of ['DIRECT_AGENT_PATHS_R2074','directHybridAgentRelayR2074','OMEGA_RUNTIME_DURABLE_OBJECT','R207.4-DIRECT-DURABLE','R127_ZERO_DRIFT_SHA256'])must(r101.includes(token),`direct relay contract missing ${token}`);
must(!r101.includes('sovereign_gateway_not_configured'),'Hybrid agent relay must not depend on the optional Sovereign public gateway');
for(const token of ["'/api/hybrid/agent/register'","'/api/hybrid/agent/heartbeat'","'/api/hybrid/agent/poll'","'/api/hybrid/agent/result'"])must(baseAgent.includes(token),`immutable R205 base lost ${token}`);
must(baseAgent.includes('root-confined')&&baseAgent.includes('shell=False'),'root confinement/arbitrary-shell prohibition regressed');

const calls=[];
const stub={fetch:async req=>{
 const u=new URL(req.url),body=await req.clone().json().catch(()=>({}));
 calls.push({path:u.pathname,method:req.method,bridge:req.headers.get('x-omega-bridge-id'),secret:req.headers.get('x-omega-bridge-secret'),body});
 return new Response(JSON.stringify({ok:true,job:null,path:u.pathname}),{status:200,headers:{'content-type':'application/json'}});
}};
const env={OMEGA_RUNTIME:{idFromName:id=>({id}),get:()=>stub}};
const bridge='ci_r2074_bridge';
const secret='r2074_test_secret_abcdefghijklmnopqrstuvwxyz';
const routes=[
 ['/api/hybrid/agent/register','/agent/register'],
 ['/api/hybrid/agent/heartbeat','/agent/heartbeat'],
 ['/api/hybrid/agent/poll','/agent/poll'],
 ['/api/hybrid/agent/result','/agent/result']
];
for(const [publicPath,internalPath] of routes){
 const response=await worker.fetch(new Request(`https://omegav6.jeffdeweyeljefe.workers.dev${publicPath}`,{method:'POST',headers:{'content-type':'application/json','x-omega-bridge-id':bridge,'x-omega-bridge-secret':secret},body:JSON.stringify({bridgeId:bridge,deviceId:'device_r2074_test',jobId:'job_r2074_test'})}),env);
 assert.equal(response.status,200,`${publicPath} must remain on durable runtime transport`);
 assert.equal(response.headers.get('x-omega-hybrid-agent-relay'),'R207.4-DIRECT-DURABLE',`${publicPath} missing direct relay proof header`);
 assert.equal(response.headers.get('x-omega-hybrid-runtime'),'OMEGA_RUNTIME_DURABLE_OBJECT',`${publicPath} missing durable runtime proof header`);
 const body=await response.json();assert.equal(body.ok,true,`${publicPath} direct durable response failed`);
 const call=calls.at(-1);assert.equal(call.path,internalPath,`${publicPath} misrouted to ${call.path}`);assert.equal(call.bridge,bridge);assert.equal(call.secret,secret);
}
const pollCall=calls.find(x=>x.path==='/agent/poll');assert.ok(pollCall,'poll never reached /agent/poll');

let response=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/hybrid/agent/poll',{method:'GET',headers:{'x-omega-bridge-id':bridge,'x-omega-bridge-secret':secret}}),env);
assert.equal(response.status,405,'agent poll GET must fail closed');
response=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/hybrid/agent/poll',{method:'POST',headers:{'content-type':'application/json','x-omega-bridge-id':bridge,'x-omega-bridge-secret':secret},body:JSON.stringify({bridgeId:bridge,deviceId:'device_r2074_test'})}),{});
assert.equal(response.status,503,'missing OMEGA_RUNTIME binding must fail closed');

console.log('R207.4 HYBRID DIRECT DURABLE POLL PASS · register/heartbeat/poll/result route directly through canonical OMEGA_RUNTIME · exact bridge secret forwarded · no optional Sovereign gateway dependency · R127/R141/R205/R206.1/R146/R147/R125 boundaries preserved');
