import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/workerR116.js';

const source=fs.readFileSync('src/workerR116.js','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
const must=(ok,msg)=>assert.ok(ok,'R163 '+msg);

must(wrangler.includes('"main": "src/workerR116.js"'),'must preserve the proven R116 Wrangler entrypoint');
for(const token of ["CORE_HEALTH_REVISION='R163'","CORE_HEALTH_SCHEMA='OMEGA_CANONICAL_CORE_HEALTH_R163'","x-omega-core-health':'R163-FIRST-HAND'","path==='/api/health'||path==='/api/core-health'","requiredForCoreHealth:false","executionConvergence:'R159'","canonicalAdmission:{authority:'R125'}"])must(source.includes(token),'core health source missing '+token);
must(source.indexOf("if((path==='/api/health'||path==='/api/core-health')&&request.method==='GET')")<source.indexOf("const response=await r115.fetch(request,env);return withCorsR116(response,request);"),'core health must be answered before inherited service dispatch');
must(source.includes("if(path==='/api/health'||path==='/api/core-health')return coreHealthR163(request,env);"),'R130 operational probes must use the same first-hand health authority');

const env={ASSETS:{fetch:async()=>new Response('asset')},OMEGA_RUNTIME:{},CF_VERSION_METADATA:{id:'r163-test-version',tag:'test'}};
let response=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/health'),env),body=await response.json();
assert.equal(response.status,200);assert.equal(response.headers.get('x-omega-core-health'),'R163-FIRST-HAND');assert.equal(body.schema,'OMEGA_CANONICAL_CORE_HEALTH_R163');assert.equal(body.revision,'R163');assert.equal(body.state,'LIVE');assert.equal(body.canonicalRequest,true);assert.equal(body.requiredBindings.assets,true);assert.equal(body.requiredBindings.durableRuntime,true);assert.equal(body.executionPlanes.sovereignGateway.requiredForCoreHealth,false);assert.equal(body.executionPlanes.canonicalAdmission.authority,'R125');assert.equal(body.runtimeVersion.id,'r163-test-version');

response=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/core-health'),env);body=await response.json();assert.equal(response.status,200);assert.equal(body.schema,'OMEGA_CANONICAL_CORE_HEALTH_R163');

response=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/health'),{ASSETS:{fetch:async()=>new Response('asset')}});body=await response.json();assert.equal(response.status,503);assert.equal(body.state,'DEGRADED_REQUIRED_CORE_BINDING_MISSING');assert.equal(body.requiredBindings.durableRuntime,false);

response=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/health',{method:'POST'}),env);body=await response.json();assert.equal(response.status,405);assert.equal(response.headers.get('allow'),'GET');assert.equal(body.state,'METHOD_NOT_ALLOWED');

console.log('R163 CANONICAL CORE HEALTH TRUTH PASS · R116 answers first-hand before inherited gateways · required core bindings fail closed · optional Sovereign/AI/federation planes remain separate · R159/R141/R125 authorities preserved');