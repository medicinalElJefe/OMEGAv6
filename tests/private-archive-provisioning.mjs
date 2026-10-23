import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile('scripts/provision-private-archive.mjs','utf8');
const run=new (Object.getPrototypeOf(async function(){}).constructor)('fetch','process','console',source);
async function scenario(managed,domains,denied=false){const calls=[];const fetch=async(url,init={})=>{calls.push({url,method:init.method||'GET'});if(denied)return new Response(JSON.stringify({success:false,errors:[{code:10000}]}),{status:403});return new Response(JSON.stringify({success:true,result:url.endsWith('/domains/managed')?{enabled:managed}:url.endsWith('/domains/custom')?{domains}:{} }))};const promise=run(fetch,{env:{CLOUDFLARE_API_TOKEN:'test-only-token',CLOUDFLARE_ACCOUNT_ID:'test-only-account'}},{log(){}});return {promise,calls}}
let s=await scenario(false,[]);await s.promise;assert.equal(s.calls.length,6);assert.ok(s.calls.every(x=>x.method==='GET'));
s=await scenario(true,[]);await assert.rejects(s.promise,/public or unverified/);
s=await scenario(false,[{enabled:true}]);await assert.rejects(s.promise,/public or unverified/);
s=await scenario(undefined,[]);await assert.rejects(s.promise,/public or unverified/);
s=await scenario(false,[],true);await assert.rejects(s.promise,/HTTP 403/);assert.equal(s.calls.length,1);
console.log('PASS: provisioning accepts private buckets, rejects enabled/unverified public domains, and fails closed on denied provider authorization.');
