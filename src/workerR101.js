import r34,{OmegaRuntime as OmegaRuntimeR34} from './workerR34.js';

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:JSON_HEADERS});
const text=v=>String(v??'').trim();
const safeId=(v,fallback='')=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const sessionId=request=>safeId(request.headers.get('x-omega-session-id'),'anon');
const bridgeId=(request,body={})=>safeId(request.headers.get('x-omega-bridge-id')||body?.bridgeId||sessionId(request),'anon');
const runtimeStub=(env,id)=>env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id));
async function runtimeFetch(env,id,path,request,method='GET',body){
 const headers=new Headers(request.headers);headers.set('content-type','application/json');
 const init={method,headers};if(body!==undefined&&method!=='GET')init.body=JSON.stringify(body);
 return runtimeStub(env,id).fetch(new Request('https://omega-runtime.internal'+path,init));
}
async function sha256(source){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}

async function hybridStatusR101(request,env,id){
 const response=await runtimeFetch(env,id,'/status',request,'GET');
 const data=await response.clone().json().catch(()=>({}));
 const devices=Array.isArray(data.devices)?data.devices:[],online=devices.filter(x=>x?.online&&!x?.revoked);
 const pairingState=data.state||'PAIRING_REQUIRED';
 return json({...data,
  state:online.length?'VERIFIED_DEVICE_ONLINE':'DEVICE_PROOF_REQUIRED',
  pairingState,
  bridgeId:id,
  nativeExecutionClaimed:online.length>0,
  truthBoundary:'HYBRID_BRIDGE_ID_TRUTH_R101'
 },response.status);
}

async function reconnectHybridR101(request,env){
 const body=await request.json().catch(()=>({})),sid=sessionId(request),requested=bridgeId(request,body),secret=text(request.headers.get('x-omega-bridge-secret'));
 if(requested&&secret){
  const auth=await runtimeFetch(env,requested,'/continuity',request,'GET');
  if(auth.ok){
   const statusResponse=await hybridStatusR101(request,env,requested),status=await statusResponse.json();
   return json({...status,ok:true,reconnected:true,credentialState:'VALID',agentRestartRequired:false});
  }
 }
 if(!body.repair){
  return json({ok:false,code:'PAIR_AUTH_FAILED',recoverable:true,credentialState:requested&&secret?'REJECTED':'MISSING',reply:'The browser pairing credential no longer authenticates this bridge. Repair can issue a fresh pairing without claiming the PC is online.'},401);
 }
 const pairResponse=await runtimeFetch(env,sid,'/pair',request,'POST',{rotate:true}),pair=await pairResponse.json().catch(()=>({}));
 if(!pairResponse.ok||!pair.secret)return json({ok:false,code:pair.code||'PAIR_REPAIR_FAILED',reply:pair.reply||'OMEGA could not issue a fresh Hybrid pairing credential.'},pairResponse.status||503);
 return json({...pair,ok:true,repaired:true,bridgeId:sid,pairingCode:`${sid}.${pair.secret}`,credentialState:'REISSUED',agentRestartRequired:true,agentPath:'/api/hybrid/agent-download',truthBoundary:'NEW_PAIR_REQUIRES_NEW_AUTHENTICATED_HEARTBEAT_R101'});
}

async function serveCanonicalHybridAgentR101(request,env){
 if(!env?.ASSETS?.fetch)return json({ok:false,code:'HYBRID_AGENT_ASSET_BINDING_UNAVAILABLE'},503);
 const asset=await env.ASSETS.fetch(new Request(new URL('/omega-hybrid-agent.py',request.url),{headers:{'cache-control':'no-cache'}}));
 if(!asset.ok)return json({ok:false,code:'HYBRID_AGENT_ASSET_NOT_FOUND',status:asset.status},503);
 const source=await asset.text();
 const valid=source.length>1000&&source.startsWith('#!/usr/bin/env python3')&&source.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'")&&source.includes('OMEGA R34 local Hybrid Link agent');
 if(!valid)return json({ok:false,code:'HYBRID_AGENT_ASSET_INVALID'},503);
 const version=(source.match(/VERSION='([^']+)'/)||[])[1]||'UNKNOWN',digest=await sha256(source);
 return new Response(source,{status:200,headers:{
  'content-type':'text/x-python; charset=utf-8',
  'content-disposition':'attachment; filename="omega-hybrid-agent.py"',
  'cache-control':'no-store, max-age=0',
  'x-omega-agent-version':version,
  'x-omega-agent-sha256':digest,
  'x-omega-canonical-origin':'https://omegav6.jeffdeweyeljefe.workers.dev',
  'x-omega-compat-route':'R101_DIRECT_AND_API_AGENT_DOWNLOAD'
 }});
}

async function fetchR101(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/omega-hybrid-agent.py'&&request.method==='GET')return serveCanonicalHybridAgentR101(request,env);
 if(path==='/api/hybrid/status'&&request.method==='GET'){
  if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);
  return hybridStatusR101(request,env,bridgeId(request));
 }
 if(path==='/api/hybrid/reconnect'&&request.method==='POST'){
  if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);
  return reconnectHybridR101(request,env);
 }
 return r34.fetch(request,env);
}

export class OmegaRuntime extends OmegaRuntimeR34 {}
export default{fetch:fetchR101};
