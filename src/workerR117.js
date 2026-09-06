import r116,{OmegaRuntime as OmegaRuntimeR116} from './workerR116.js';

const REVISION='R117';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=v=>String(v??'').trim();
const safeId=(v,fallback='')=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};

function sessionId(request){return safeId(request.headers.get('x-omega-session-id'),'')}
async function durablePairR117(request,env){
 const sid=sessionId(request);
 if(!sid)return json({ok:false,code:'SESSION_ID_REQUIRED',reply:'A browser runtime session is required before a fresh PC connector can be issued.'},400);
 if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);
 const stub=env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(sid));
 const headers=new Headers({'content-type':'application/json','x-omega-session-id':sid});
 const pairResponse=await stub.fetch(new Request('https://omega-runtime.internal/pair',{method:'POST',headers,body:JSON.stringify({rotate:true})}));
 const pair=await pairResponse.clone().json().catch(()=>({}));
 if(!pairResponse.ok||!pair?.secret)return json({ok:false,code:pair?.code||'PAIR_BOOTSTRAP_FAILED',reply:pair?.reply||'OMEGA could not mint a fresh server-backed Hybrid credential.'},pairResponse.status||503);
 const bridgeId=safeId(pair.bridgeId||sid,sid),secret=text(pair.secret),pairingCode=`${bridgeId}.${secret}`;
 return json({
  ok:true,
  schema:'OMEGA_SOVEREIGN_BOOTSTRAP_R117',
  runtimeRevision:REVISION,
  bridgeId,
  secret,
  pairingCode,
  createdAt:Date.now(),
  connectorFilename:'START_OMEGA_PC_LINK_R117_CLEAN.cmd',
  canonicalOrigin:'https://omegav6.jeffdeweyeljefe.workers.dev',
  retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',
  agentPath:'/api/hybrid/agent-download?r117=1',
  rcwaAgentPath:'/api/federation/rcwa/agent-download?r117=1',
  agentRestartRequired:true,
  nativeExecutionClaimed:false,
  truthBoundary:'This endpoint rotates a fresh bridge credential directly in durable runtime state and returns it only to the same-origin browser caller. PC ONLINE remains false until a real authenticated host heartbeat arrives.'
 });
}

async function fetchR117(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/hybrid/bootstrap'&&request.method==='POST')return durablePairR117(request,env);
 const response=await r116.fetch(request,env);
 const headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export class OmegaRuntime extends OmegaRuntimeR116 {}
export default{fetch:fetchR117};
