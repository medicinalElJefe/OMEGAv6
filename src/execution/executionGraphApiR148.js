import {authorizeGraphR148,cancelGraphR148,confirmGraphNodeR148,createGraphR148,listGraphsR148,manifestR148,readGraphR148,replayGraphR148,resumeGraphNodeR148,tickGraphR148,R148_REVISION} from './durableOperationGraphR148.js';

const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-operation-graph':R148_REVISION}});
const safe=v=>{const s=String(v??'').trim().slice(0,180);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};

export function graphManifestR148(){return manifestR148()}
export async function publicGraphApiR148(request,proxy){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/execution/r148/manifest'&&request.method==='GET')return json(manifestR148());
 if(path==='/api/execution/graphs'&&(request.method==='GET'||request.method==='POST'))return proxy('/execution/graphs');
 const node=path.match(/^\/api\/execution\/graphs\/([A-Za-z0-9._:-]+)\/nodes\/([A-Za-z0-9._:-]+)\/(confirm|resume)$/);if(node&&request.method==='POST')return proxy(`/execution/graphs/${node[1]}/nodes/${node[2]}/${node[3]}`);
 const graph=path.match(/^\/api\/execution\/graphs\/([A-Za-z0-9._:-]+)(?:\/(authorize|tick|replay|cancel))?$/);if(graph){const a=graph[2]||'';if(!a&&request.method==='GET')return proxy(`/execution/graphs/${graph[1]}`);if(['authorize','tick','replay','cancel'].includes(a)&&request.method==='POST')return proxy(`/execution/graphs/${graph[1]}/${a}`)}
 return null;
}

export async function runtimeGraphApiR148(runtime,request,callbacks={}){
 const path=new URL(request.url).pathname;
 if(path==='/execution/graphs'&&request.method==='GET')return json({ok:true,schema:'OMEGA_OPERATION_GRAPH_LIST_R148',graphs:await listGraphsR148(runtime),canonicalMutation:false,canonicalAdmissionAuthority:'R125'});
 if(path==='/execution/graphs'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await createGraphR148(runtime,body);return json(result,result.status||200)}
 const node=path.match(/^\/execution\/graphs\/([A-Za-z0-9._:-]+)\/nodes\/([A-Za-z0-9._:-]+)\/(confirm|resume)$/);if(node&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=node[3]==='confirm'?await confirmGraphNodeR148(runtime,safe(node[1]),safe(node[2]),body):await resumeGraphNodeR148(runtime,safe(node[1]),safe(node[2]),body);return json(result,result.status||200)}
 const graph=path.match(/^\/execution\/graphs\/([A-Za-z0-9._:-]+)(?:\/(authorize|tick|replay|cancel))?$/);if(graph){const id=safe(graph[1]),a=graph[2]||'';if(!a&&request.method==='GET'){const found=await readGraphR148(runtime,id);return found?json({ok:true,graph:found}):json({ok:false,code:'R148_GRAPH_NOT_FOUND'},404)}if(a==='authorize'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await authorizeGraphR148(runtime,id,body);return json(result,result.status||200)}if(a==='tick'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await tickGraphR148(runtime,id,body,callbacks);return json(result,result.status||200)}if(a==='replay'&&request.method==='POST'){const replay=await replayGraphR148(runtime,id);return replay?json({ok:replay.ok,replay},replay.ok?200:409):json({ok:false,code:'R148_GRAPH_NOT_FOUND'},404)}if(a==='cancel'&&request.method==='POST'){const result=await cancelGraphR148(runtime,id);return json(result,result.status||200)}}
 return null;
}
