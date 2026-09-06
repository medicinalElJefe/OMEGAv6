import r116,{OmegaRuntime as OmegaRuntimeR116} from './workerR116.js';
import {createRunR146,listRunsR146,manifestR146,readRunR146,replayRunR146,transitionRunR146,R146_REVISION} from './execution/durableOperationExecutionR146.js';
export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator} from './workerR116.js';

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-durable-execution':R146_REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const safeId=v=>{const s=String(v??'').trim().slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const APPROVED=new Set(['omegav6.jeffdeweyeljefe.workers.dev','omega-genesis-v1.jeffdeweyeljefe.workers.dev','omega-living-light-etching-private-woven2.vercel.app','omega-optical-cloud-woven2.vercel.app']);
function cors(request){const origin=request.headers.get('origin');if(!origin)return{};try{const u=new URL(origin);if(u.protocol==='https:'&&APPROVED.has(u.hostname.toLowerCase()))return{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-omega-session-id,x-omega-bridge-id,x-omega-bridge-secret','access-control-expose-headers':'x-omega-durable-execution'}}catch{}return null}
function wrap(response,request){const c=cors(request);if(c===null)return json({ok:false,code:'R146_ORIGIN_REJECTED'},403);const h=new Headers(response.headers);h.set('x-omega-durable-execution',R146_REVISION);for(const[k,v]of Object.entries(c))h.set(k,v);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h})}
function runtimeId(request){return safeId(request.headers.get('x-omega-bridge-id'))||safeId(request.headers.get('x-omega-session-id'))}
async function proxy(request,env,path){const id=runtimeId(request);if(!id)return json({ok:false,code:'R146_RUNTIME_ID_REQUIRED'},400);if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'R146_RUNTIME_BINDING_UNAVAILABLE'},503);const stub=env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id)),headers=new Headers(request.headers),init={method:request.method,headers};if(!['GET','HEAD'].includes(request.method))init.body=await request.clone().text();return stub.fetch(new Request('https://omega-runtime.internal'+path,init))}

async function fetchR146(request,env){const url=new URL(request.url),path=url.pathname;if(request.method==='OPTIONS'&&path.startsWith('/api/execution/')){const c=cors(request);return c===null?new Response(null,{status:403}):new Response(null,{status:204,headers:{...c,'x-omega-durable-execution':R146_REVISION}})}
 if(path==='/api/execution/r146/manifest'&&request.method==='GET')return wrap(json(manifestR146()),request);
 if(path==='/api/execution/runs'&&(request.method==='GET'||request.method==='POST'))return wrap(await proxy(request,env,'/execution/runs'),request);
 const m=path.match(/^\/api\/execution\/runs\/([A-Za-z0-9._:-]+)(?:\/(transition|replay))?$/);if(m){const a=m[2]||'';if(!a&&request.method==='GET')return wrap(await proxy(request,env,`/execution/runs/${m[1]}`),request);if(a==='transition'&&request.method==='POST')return wrap(await proxy(request,env,`/execution/runs/${m[1]}/transition`),request);if(a==='replay'&&request.method==='POST')return wrap(await proxy(request,env,`/execution/runs/${m[1]}/replay`),request)}
 return r116.fetch(request,env)}

export class OmegaRuntime extends OmegaRuntimeR116{
 async fetch(request){const path=new URL(request.url).pathname;if(path.startsWith('/execution/')){if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED',reply:'Durable execution history requires the authenticated OMEGA runtime bridge.'},401);
  if(path==='/execution/runs'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await createRunR146(this,body);return json(result,result.status||200)}
  if(path==='/execution/runs'&&request.method==='GET'){const runs=await listRunsR146(this);return json({ok:true,schema:'OMEGA_EXECUTION_RUN_LIST_R146',runs,canonicalMutation:false,canonicalAdmissionAuthority:'R125'})}
  const m=path.match(/^\/execution\/runs\/([A-Za-z0-9._:-]+)(?:\/(transition|replay))?$/);if(m){const id=m[1],a=m[2]||'';if(!a&&request.method==='GET'){const run=await readRunR146(this,id);return run?json({ok:true,run}):json({ok:false,code:'R146_RUN_NOT_FOUND'},404)}if(a==='transition'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await transitionRunR146(this,id,body);return json(result,result.status||200)}if(a==='replay'&&request.method==='POST'){const receipt=await replayRunR146(this,id);return receipt?json({ok:receipt.ok,receipt},receipt.ok?200:409):json({ok:false,code:'R146_RUN_NOT_FOUND'},404)}}}
  return super.fetch(request)}
}

export default{async fetch(request,env){return fetchR146(request,env)}};
