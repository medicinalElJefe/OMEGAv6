import assert from 'node:assert/strict';
import {provisionArchive,archiveRuntimeConfig} from '../src/archive/archiveProvisioning.js';
function scenario(managed,domains,providerCode=0){const calls=[];const fetcher=async(url,init={})=>{calls.push({url,method:init.method||'GET'});if(providerCode)return new Response(JSON.stringify({success:false,errors:[{code:providerCode}]}),{status:403});return new Response(JSON.stringify({success:true,result:url.endsWith('/domains/managed')?{enabled:managed}:url.endsWith('/domains/custom')?{domains}:{} }))};return {calls,promise:provisionArchive({token:'test-only-token',account:'test-only-account',fetcher})}}
let s=scenario(false,[]);assert.equal((await s.promise).state,'READY');assert.equal(s.calls.length,6);assert.ok(s.calls.every(x=>x.method==='GET'));
s=scenario(true,[]);await assert.rejects(s.promise,/public or unverified/);
s=scenario(false,[{enabled:true}]);await assert.rejects(s.promise,/public or unverified/);
s=scenario(undefined,[]);await assert.rejects(s.promise,/public or unverified/);
s=scenario(false,[],10000);await assert.rejects(s.promise,/HTTP 403/);assert.equal(s.calls.length,1);
s=scenario(false,[],10042);const held=await s.promise;assert.equal(held.state,'ACCOUNT_ACTIVATION_REQUIRED');assert.equal(s.calls.length,1);
const base={main:'src/workerR116.js',assets:{binding:'ASSETS',directory:'dist'},durable_objects:{bindings:[{name:'OMEGA_RUNTIME',class_name:'OmegaRuntime'}]},vars:{OMEGA_ARCHIVE_TOKEN_SHA256:'preserved'},r2_buckets:[{binding:'OMEGA_ARCHIVE',bucket_name:'primary'},{binding:'OMEGA_ARCHIVE_BACKUP',bucket_name:'backup'},{binding:'UNRELATED',bucket_name:'keep'}]};
const config=archiveRuntimeConfig(base,held);assert.deepEqual(config.r2_buckets,[{binding:'UNRELATED',bucket_name:'keep'}]);assert.deepEqual(config.durable_objects,base.durable_objects);assert.deepEqual(config.assets,base.assets);assert.equal(config.main,base.main);assert.equal(config.vars.OMEGA_ARCHIVE_TOKEN_SHA256,'preserved');assert.equal(config.vars.OMEGA_ARCHIVE_STATE,'ACCOUNT_ACTIVATION_REQUIRED');assert.equal(base.r2_buckets.length,3);
assert.deepEqual(archiveRuntimeConfig(base,{state:'READY'}).r2_buckets,base.r2_buckets);
console.log('PASS: private bucket checks; non-activation authorization errors remain blocking; exact 10042 holds only the archive; core bindings/state and ready-state archive bindings are preserved.');
