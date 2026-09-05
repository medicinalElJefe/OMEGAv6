import r102,{OmegaRuntime as OmegaRuntimeR102} from './workerR102.js';
import {fabricIntentR111,fabricSummaryR111,FABRIC_MESH_LAW_R111} from './federation/fabricMeshR111.js';

const text=v=>String(v??'').trim();
const FABRIC_OBSERVER_SESSION_R111='r111_fabric_observer';
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-fabric-revision':'R111.1',...headers}});
function requestAt(request,path,method='GET',body){
 const url=new URL(path,request.url),headers=new Headers(request.headers);
 // R34 federation status is namespaced by bridge/session identity. Generic health observers
 // do not have a browser credential, so give read-only status calls a stable neutral namespace
 // rather than allowing BRIDGE_ID_REQUIRED to erase Genesis/OMEGAv6/Sovereign truth.
 if(!text(headers.get('x-omega-bridge-id'))&&!text(headers.get('x-omega-session-id')))headers.set('x-omega-session-id',FABRIC_OBSERVER_SESSION_R111);
 const init={method,headers};if(body!==undefined){headers.set('content-type','application/json');init.body=JSON.stringify(body)}return new Request(url,init)
}
async function asJson(response){return response.clone().json().catch(()=>({}))}
function sourceIdentityScopeR111(request){return text(request.headers.get('x-omega-bridge-id'))||text(request.headers.get('x-omega-session-id'))?'CALLER_BRIDGE_OR_SESSION_CONTEXT':'NEUTRAL_READ_ONLY_OBSERVER_NAMESPACE'}

async function currentInputsR111(request,env){
 const [statusResponse,hybridResponse]=await Promise.all([
  r102.fetch(requestAt(request,'/api/federation/run/status'),env),
  r102.fetch(requestAt(request,'/api/hybrid/status'),env)
 ]);
 return{status:await asJson(statusResponse),hybrid:await asJson(hybridResponse),http:{federation:statusResponse.status,hybrid:hybridResponse.status},identityScope:sourceIdentityScopeR111(request)};
}

function connectHintR111(request,hybrid){
 const hasBridge=Boolean(text(request.headers.get('x-omega-bridge-id'))),hasSecret=Boolean(text(request.headers.get('x-omega-bridge-secret'))),state=text(hybrid?.state||'DEVICE_PROOF_REQUIRED');
 const online=state==='VERIFIED_DEVICE_ONLINE'||hybrid?.nativeExecutionClaimed===true;
 if(online)return{state:'CONNECTED',action:'NONE',label:'PC connected',detail:'A current authenticated native heartbeat is present.'};
 if(hasBridge&&hasSecret)return{state:'CREDENTIAL_PRESENT_DEVICE_PROOF_REQUIRED',action:'START_OR_RESTART_FEDERATION_LAUNCHER',label:'Reconnect PC',detail:'The browser has a persisted bridge credential. Start or restart the federation launcher and wait for a fresh authenticated heartbeat.'};
 return{state:'BROWSER_PAIRING_REQUIRED',action:'CREATE_PAIRING_THEN_RUN_LAUNCHER',label:'Connect PC',detail:'Create a browser pairing credential, download the federation launcher, run it from the approved root, then wait for heartbeat proof.'};
}

async function fabricStatusR111(request,env){
 const inputs=await currentInputsR111(request,env),mesh=fabricSummaryR111(inputs.status,inputs.hybrid,env);
 return json({...mesh,revision:'R111.1',connectHint:connectHintR111(request,inputs.hybrid),sourceStatus:{federationHttpStatus:inputs.http.federation,hybridHttpStatus:inputs.http.hybrid,identityScope:inputs.identityScope,observerSession:inputs.identityScope==='NEUTRAL_READ_ONLY_OBSERVER_NAMESPACE'?FABRIC_OBSERVER_SESSION_R111:null},law:FABRIC_MESH_LAW_R111});
}

async function fabricIntentRouteR111(request,env){
 const body=await request.json().catch(()=>({})),intent=text(body?.intent||body?.text).slice(0,4000),inputs=await currentInputsR111(request,env),plan=fabricIntentR111(intent,inputs.status,inputs.hybrid,env);
 return json({...plan,fabricRuntimeRevision:'R111.1',sourceIdentityScope:inputs.identityScope},plan.ok?200:400,{'x-omega-intent-router-revision':'R103','x-omega-fabric-router-revision':'R111.1'});
}

async function fetchR111(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/api/fabric/status'&&request.method==='GET')return fabricStatusR111(request,env);
 if(path==='/api/fabric/route'&&request.method==='POST')return fabricIntentRouteR111(request,env);
 if(path==='/api/fabric/law'&&request.method==='GET')return json({...FABRIC_MESH_LAW_R111,runtimeRevision:'R111.1'});
 const response=await r102.fetch(request,env),headers=new Headers(response.headers);headers.set('x-omega-runtime-successor','R111.1');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export class OmegaRuntime extends OmegaRuntimeR102 {}
export default{fetch:fetchR111};
