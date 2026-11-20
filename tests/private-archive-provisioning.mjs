import assert from 'node:assert/strict';
import {provisionArchive,archiveRuntimeConfig} from '../src/archive/archiveProvisioning.js';
function scenario(managed,domains,providerCode=0){const calls=[];const fetcher=async(url,init={})=>{calls.push({url,method:init.method||'GET'});if(providerCode)return new Response(JSON.stringify({success:false,errors:[{code:providerCode}]}),{status:403});return new Response(JSON.stringify({success:true,result:url.endsWith('/domains/managed')?{enabled:managed}:url.endsWith('/domains/custom')?{domains}:{} }))};return {calls,promise:provisionArchive({token:'test-only-token',account:'test-only-account',fetcher})}}
let s=scenario(false,[]);assert.equal((await s.promise).state,'READY');assert.equal(s.calls.length,6);assert.ok(s.calls.every(x=>x.method==='GET'));
s=scenario(true,[]);await assert.rejects(s.promise,/public or unverified/);
s=scenario(false,[{enabled:true}]);await assert.rejects(s.promise,/public or unverified/);
s=scenario(undefined,[]);await assert.rejects(s.promise,/public or unverified/);
s=scenario(false,[],10000);await assert.rejects(s.promise,/HTTP 403/);assert.equal(s.calls.length,1);
s=scenario(false,[],10042);const held=await s.promise;assert.equal(held.state,'ACCOUNT_ACTIVATION_REQUIRED');assert.equal(s.calls.length,1);
// R886: Cloudflare's actual HTTP 500 / provider 10001 must not turn an optional
// archive outage into a false READY claim or prevent core OMEGA deployment.
const internalError=()=>new Response(JSON.stringify({success:false,errors:[{code:10001}]}),{status:500});
let attempts=0;
const unavailable=await provisionArchive({token:'test',account:'account',retryDelayMs:0,
 fetcher:async()=>{attempts++;return internalError()}});
assert.equal(unavailable.state,'PROVIDER_UNAVAILABLE_HELD');
assert.equal(unavailable.privateBuckets,0);
assert.equal(unavailable.privateDomainEvidence,'NOT_VERIFIED');
assert.equal(attempts,3,'at most three idempotent provider GET attempts');

attempts=0;
const recovered=await provisionArchive({token:'test',account:'account',retryDelayMs:0,
 fetcher:async url=>{
  attempts++;
  if(attempts<=2)return internalError();
  return new Response(JSON.stringify({success:true,result:url.endsWith('/domains/managed')?{enabled:false}:url.endsWith('/domains/custom')?{domains:[]}:{}}));
 }});
assert.equal(recovered.state,'READY','recovered GET must still prove two private domains');
assert.equal(attempts,8);

attempts=0;
const postUnavailable=await provisionArchive({token:'test',account:'account',retryDelayMs:0,
 fetcher:async(_url,init={})=>{
  attempts++;
  return (init.method||'GET')==='GET'
   ? new Response(JSON.stringify({success:false,errors:[{code:10000}]}),{status:404})
   : internalError();
 }});
assert.equal(postUnavailable.state,'PROVIDER_UNAVAILABLE_HELD','ambiguous POST cannot mark READY');
assert.equal(attempts,2,'never blindly replay an R2 bucket-creation POST');

attempts=0;
await assert.rejects(provisionArchive({token:'test',account:'account',retryDelayMs:0,
 fetcher:async()=>{attempts++;return new Response(JSON.stringify({success:false,errors:[{code:10002}]}),{status:500})}
}),/provider code 10002/);
assert.equal(attempts,1,'unknown provider error must be immediate hard failure');

const base={main:'src/workerR116.js',assets:{binding:'ASSETS',directory:'dist'},durable_objects:{bindings:[{name:'OMEGA_RUNTIME',class_name:'OmegaRuntime'}]},vars:{OMEGA_ARCHIVE_TOKEN_SHA256:'preserved'},r2_buckets:[{binding:'OMEGA_ARCHIVE',bucket_name:'primary'},{binding:'OMEGA_ARCHIVE_BACKUP',bucket_name:'backup'},{binding:'UNRELATED',bucket_name:'keep'}]};
const config=archiveRuntimeConfig(base,held);assert.deepEqual(config.r2_buckets,[{binding:'UNRELATED',bucket_name:'keep'}]);assert.deepEqual(config.durable_objects,base.durable_objects);assert.deepEqual(config.assets,base.assets);assert.equal(config.main,base.main);assert.equal(config.vars.OMEGA_ARCHIVE_TOKEN_SHA256,'preserved');assert.equal(config.vars.OMEGA_ARCHIVE_STATE,'ACCOUNT_ACTIVATION_REQUIRED');assert.equal(base.r2_buckets.length,3);
assert.deepEqual(archiveRuntimeConfig(base,{state:'READY'}).r2_buckets,base.r2_buckets);
const unavailableConfig=archiveRuntimeConfig(base,unavailable);
assert.equal(unavailableConfig.vars.OMEGA_ARCHIVE_STATE,'PROVIDER_UNAVAILABLE_HELD');
assert.deepEqual(unavailableConfig.r2_buckets,[{binding:'UNRELATED',bucket_name:'keep'}]);
assert.equal(unavailableConfig.main,base.main);
assert.deepEqual(unavailableConfig.durable_objects,base.durable_objects);

console.log('PASS: private bucket checks; non-activation authorization errors remain blocking; exact 10042 holds only the archive; core bindings/state and ready-state archive bindings are preserved.');
