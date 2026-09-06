import r116,{OmegaRuntime as OmegaRuntimeR116} from './workerR116.js';
import {createExecutionRunR143,listExecutionRunsR143,manifestR143,readExecutionRunR143,transitionExecutionRunR143,verifyExecutionReplayR143,R143_REVISION} from './execution/durableExecutionRuntimeR143.js';
export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator} from './workerR116.js';

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-execution-runtime':R143_REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const safeId=v=>{const s=String(v??'').trim().slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const APPROVED=new Set(['omegav6.jeffdeweyeljefe.workers.dev','omega-genesis-v1.jeffdeweyeljefe.workers.dev','omega-living-light-etching-private-woven2.vercel.app','omega-optical-cloud-woven2.vercel.app']);
function cors(request){const origin=request.headers.get('origin');if(!origin)return{};try{const u=new URL(origin);if(u.protocol==='https:'&&APPROVED.has(u.hostname.toLowerCase()))return{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-omega-session-id,x-omega-bridge-id,x-omega-bridge-secret','access-control-expose-headers':'x-omega-execution-runtime'}}catch{}return null}
function wrap(response,request){const c=cors(request);if(c===null)return json({ok:false,code:'R143_ORIGIN_REJECTED'},403);const h=new Headers(response.headers);h.set('x-omega-execution-runtime',R143_REVISION);for(const[k,v]of Object.entries(c))h.set(k,v);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h})}
function runtimeId(request){return safeId(request.headers.get('x-omega-bridge-id'))||safeId(request.headers.get('x-omega-session-id'))}
async function proxy(request,env,internalPath){const id=runtimeId(request);if(!id)return json({ok:false,code:'R143_RUNTIME_ID_REQUIRED',reply:'A runtime session or paired Hybrid bridge is required.'},400);if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'R143_RUNTIME_BINDING_UNAVAILABLE'},503);const stub=env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id)),headers=new Headers(request.headers),init={method:request.method,headers};if(!['GET','HEAD'].includes(request.method))init.body=await request.clone().text();return stub.fetch(new Request('https://omega-runtime.internal'+internalPath,init))}

async function fetchR143(request,env){const url=new URL(request.url),path=url.pathname;if(request.method==='OPTIONS'&&path.startsWith('/api/execution/')){const c=cors(request);return c===null?new Response(null,{status:403}):new Response(null,{status:204,headers:{...c,'x-omega-execution-runtime':R143_REVISION}})}
 if(path==='/api/execution/r143/manifest'&&request.method==='GET')return wrap(json(manifestR143()),request);
 if(path==='/api/execution/runs'&&(request.method==='GET'||request.method==='POST'))return wrap(await proxy(request,env,'/execution/runs'),request);
 const run=path.match(/^\/api\/execution\/runs\/([A-Za-z0-9._:-]+)(?:\/(transition|replay))?$/);if(run){const action=run[2]||'';if(!action&&request.method==='GET')return wrap(await proxy(request,env,`/execution/runs/${run[1]}`),request);if(action==='transition'&&request.method==='POST')return wrap(await proxy(request,env,`/execution/runs/${run[1]}/transition`),request);if(action==='replay'&&request.method==='POST')return wrap(await proxy(request,env,`/execution/runs/${run[1]}/replay`),request)}
 return r116.fetch(request,env)}

export class OmegaRuntime extends OmegaRuntimeR116{
 async fetch(request){const url=new URL(request.url),path=url.pathname;if(path.startsWith('/execution/')){if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED',reply:'Durable execution mutation/read requires the authenticated runtime bridge.'},401);
   if(path==='/execution/runs'&&request.method==='POST'){const body=await request.json().catch(()=>({})),run=await createExecutionRunR143(this,body);return json({ok:true,run},201)}
   if(path==='/execution/runs'&&request.method==='GET'){const runs=await listExecutionRunsR143(this);return json({ok:true,schema:'OMEGA_EXECUTION_RUN_LIST_R143',runs,canonicalMutation:false,canonicalAdmissionAuthority:'R125'})}
   const match=path.match(/^\/execution\/runs\/([A-Za-z0-9._:-]+)(?:\/(transition|replay))?$/);if(match){const id=match[1],action=match[2]||'';if(!action&&request.method==='GET'){const run=await readExecutionRunR143(this,id);return run?json({ok:true,run}):json({ok:false,code:'R143_RUN_NOT_FOUND'},404)}if(action==='transition'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await transitionExecutionRunR143(this,id,body);return json(result,result.status||200)}if(action==='replay'&&request.method==='POST'){const receipt=await verifyExecutionReplayR143(this,id);return receipt?json({ok:receipt.ok,receipt},receipt.ok?200:409):json({ok:false,code:'R143_RUN_NOT_FOUND'},404)}}}
  return super.fetch(request)}
}

export default{async fetch(request,env){return fetchR143(request,env)}};
