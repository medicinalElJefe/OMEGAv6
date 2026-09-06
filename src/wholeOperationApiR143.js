import {compileWholeOperationWeaveR143,manifestR143} from './wholeOperationWeaveR143.js';
import {wholeOperationStoreManifestR143} from './wholeOperationStoreR143.js';
import {tickWholeOperationRunR143} from './wholeOperationExecutorR143.js';

const text=v=>String(v??'').trim();
const safeId=v=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const read=async r=>r.clone().json().catch(()=>null);
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-operation-weave':'R143'}});
const runtimeId=request=>safeId(request.headers.get('x-omega-bridge-id'))||safeId(request.headers.get('x-omega-session-id'));
function stubFor(request,env){const id=runtimeId(request);return id&&env?.OMEGA_RUNTIME?env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id)):null}
async function internal(stub,path,request,method='GET',body){const headers=new Headers(request.headers);headers.set('content-type','application/json');return stub.fetch(new Request('https://omega-runtime.internal'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}))}
async function serviceHealth(binding,url){if(!binding?.fetch)return{state:'BINDING_MISSING'};try{const r=await binding.fetch(new Request(url,{headers:{accept:'application/json','cache-control':'no-cache'}})),body=await r.json().catch(()=>null);return{state:r.ok&&body?.ok===true?'LIVE':'DEGRADED',httpStatus:r.status,service:body?.service||null,version:body?.version||null,jsonVerified:Boolean(body)}}catch(error){return{state:'UNREACHABLE',error:String(error)}}}

async function executionSnapshotR143(request,env,legacyFetch){
 const [genesis,optical,hybridResponse,federationResponse,rcwaResponse]=await Promise.all([
  serviceHealth(env?.OMEGA_GENESIS_MACHINE,'https://omega-genesis-machine-r115.internal/api/health'),
  serviceHealth(env?.OMEGA_OPTICAL_MACHINE,'https://omega-optical-machine-r115.internal/api/health'),
  legacyFetch(new Request(new URL('/api/hybrid/status',request.url),{method:'GET',headers:request.headers}),env),
  legacyFetch(new Request(new URL('/api/federation/run/status',request.url),{method:'GET',headers:request.headers}),env),
  legacyFetch(new Request(new URL('/api/federation/rcwa/status',request.url),{method:'GET',headers:request.headers}),env)
 ]),hybrid=await read(hybridResponse)||{},federation=await read(federationResponse)||{},rcwa=await read(rcwaResponse)||{};
 return{observedAt:new Date().toISOString(),machine:{schema:'OMEGA_R143_MACHINE_SNAPSHOT',nodes:{genesis,optical}},hybrid,federation:{...federation,runtime:{...(federation.runtime||{}),rcwa:{...(federation.runtime?.rcwa||{}),state:rcwa?.state||rcwa?.workerState||federation.runtime?.rcwa?.state||'UNKNOWN'}}},rcwaState:rcwa?.state||rcwa?.workerState||'UNKNOWN',swarmBinding:Boolean(env?.OMEGA_SWARM_COORDINATOR),truthBoundary:'Snapshot records current routing evidence only. Reachability does not prove task success, and stale or missing executor evidence remains unavailable.'};
}

export async function wholeOperationApiR143(request,env,legacyFetch){
 const url=new URL(request.url),path=url.pathname;if(!path.startsWith('/api/operation-weave/r143'))return null;
 if(path==='/api/operation-weave/r143/manifest'&&request.method==='GET')return json({...manifestR143(),store:wholeOperationStoreManifestR143()});
 if(path==='/api/operation-weave/r143/plan'&&request.method==='POST'){const body=await request.json().catch(()=>({})),snapshot=await executionSnapshotR143(request,env,legacyFetch),graph=compileWholeOperationWeaveR143({...body,snapshot});return json({ok:Boolean(graph.intent),graph,snapshot},graph.intent?200:400)}
 const stub=stubFor(request,env);if(!stub)return json({ok:false,code:'R143_RUNTIME_ID_REQUIRED',reply:'A paired/session runtime identity is required before a whole-operation graph can be persisted or executed.'},400);
 if(path==='/api/operation-weave/r143/runs'&&request.method==='GET')return internal(stub,'/operation-weave/runs',request);
 if(path==='/api/operation-weave/r143/runs'&&request.method==='POST'){
  const body=await request.json().catch(()=>({}));if(body.confirmedGraph!==true)return json({ok:false,code:'R143_EXPLICIT_GRAPH_CONFIRMATION_REQUIRED',reply:'Planning is non-executing. Persisting an executable whole-operation graph requires explicit confirmation.'},400);
  const snapshot=await executionSnapshotR143(request,env,legacyFetch),graph=compileWholeOperationWeaveR143({...body,snapshot});return internal(stub,'/operation-weave/runs',request,'POST',{...body,graph});
 }
 const m=path.match(/^\/api\/operation-weave\/r143\/runs\/([A-Za-z0-9._:-]+)(?:\/(tick|join))?$/);if(!m)return json({ok:false,code:'R143_ROUTE_NOT_FOUND'},404);const id=m[1],action=m[2];
 if(!action&&request.method==='GET')return internal(stub,`/operation-weave/runs/${encodeURIComponent(id)}`,request);
 if(action==='join'&&request.method==='POST')return internal(stub,`/operation-weave/runs/${encodeURIComponent(id)}/join`,request,'POST',{});
 if(action==='tick'&&request.method==='POST'){const get=await internal(stub,`/operation-weave/runs/${encodeURIComponent(id)}`,request),body=await read(get),run=body?.run;if(!get.ok||!run)return get;const result=await tickWholeOperationRunR143({request,env,run,stub,legacyFetch});return json({ok:!result?.error,...result},result?.error?409:200)}
 return json({ok:false,code:'R143_METHOD_NOT_ALLOWED'},405);
}
