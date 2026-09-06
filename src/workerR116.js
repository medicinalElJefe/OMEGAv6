import r115,{OmegaRuntime as OmegaRuntimeR115} from './workerR115.js';
import {planIntentR103} from './federation/federationIntentRouterR103.js';

const REVISION='R116';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=v=>String(v??'').trim();
const approvedHosts=new Set([
 'omegav6.jeffdeweyeljefe.workers.dev',
 'omega-genesis-v1.jeffdeweyeljefe.workers.dev',
 'omega-living-light-etching-private-woven2.vercel.app',
 'omega-optical-cloud-woven2.vercel.app'
]);

function approvedOriginR116(request){
 const origin=text(request.headers.get('origin'));if(!origin)return null;
 try{const url=new URL(origin),host=url.hostname.toLowerCase();if(url.protocol!=='https:')return null;if(approvedHosts.has(host))return origin}catch{}
 return null;
}
function corsHeadersR116(request){
 const origin=approvedOriginR116(request);if(!origin)return null;
 return{
  'access-control-allow-origin':origin,
  'vary':'Origin',
  'access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers':'content-type,authorization,x-omega-federation-token,x-vercel-protection-bypass,x-omega-bridge-id,x-omega-bridge-secret,x-omega-session-id,cache-control',
  'access-control-expose-headers':'x-omega-runtime-successor,x-omega-agent-version,x-omega-agent-sha256,x-omega-canonical-origin,x-omega-rcwa-agent-sha256,x-omega-rcwa-worker-sha256',
  'access-control-max-age':'600'
 };
}
function withCorsR116(response,request){
 const headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);const cors=corsHeadersR116(request);if(cors)for(const[k,v]of Object.entries(cors))headers.set(k,v);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function preflightR116(request){const headers=corsHeadersR116(request);return headers?new Response(null,{status:204,headers:{...headers,'x-omega-runtime-successor':REVISION}}):new Response(null,{status:403,headers:{'x-omega-runtime-successor':REVISION}})}
async function readJsonResponse(response){return response.clone().json().catch(()=>null)}
async function inheritedStatusR116(request,env){
 const url=new URL('/api/federation/run/status',request.url),response=await r115.fetch(new Request(url,{method:'GET',headers:request.headers}),env),body=await readJsonResponse(response);return{response,body};
}
async function machineStatusR116(request,env){
 const url=new URL('/api/federation/machine/status',request.url),response=await r115.fetch(new Request(url,{method:'GET',headers:request.headers}),env),body=await readJsonResponse(response);return body&&typeof body==='object'?body:{ok:false,schema:'OMEGA_FEDERATION_MACHINE_STATUS_R115',nodes:{}};
}
function effectiveNodeR116(surface,machine,verb){
 const machineLive=machine?.state==='LIVE'&&machine?.jsonVerified!==false;
 return machineLive?{...(surface||{}),state:'LIVE',executionState:'MACHINE_LIVE',surfaceState:surface?.state||'UNKNOWN',service:machine?.service||null,serviceVersion:machine?.version||null,roleSource:`R115_MACHINE_${verb}`}:(surface||{});
}
function routingStatusR116(status,machine){
 const nodes=status?.nodes||{},services=machine?.nodes||{};
 return{...status,nodes:{...nodes,genesis:effectiveNodeR116(nodes.genesis,services.genesis,'PROPOSE'),optical:effectiveNodeR116(nodes.optical,services.optical,'SCREEN')}};
}
function enrichStatusR116(status,machine){
 const nodes=status?.nodes||{},services=machine?.nodes||{};
 return{...status,runtimeRevision:REVISION,machineServices:{schema:machine?.schema||'OMEGA_FEDERATION_MACHINE_STATUS_R115',canonicalAuthority:'omega-v6',genesis:services.genesis||null,optical:services.optical||null,truthBoundary:'Machine service readiness is execution transport truth for PROPOSE/SCREEN. Human surface reachability remains separately visible and does not become CanonState authority.'},executionReadiness:{genesis:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN',optical:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN',sovereign:nodes.sovereign?.state||'UNKNOWN',omegaV6:nodes.omegaV6?.state||'UNKNOWN'}};
}
async function convergenceR116(request,env){
 const [{body:status},machine,hybridResponse]=await Promise.all([
  inheritedStatusR116(request,env),
  machineStatusR116(request,env),
  r115.fetch(new Request(new URL('/api/hybrid/status',request.url),{method:'GET',headers:request.headers}),env)
 ]),hybrid=await readJsonResponse(hybridResponse),nodes=status?.nodes||{},services=machine?.nodes||{};
 const currentHeartbeat=Boolean(hybrid?.nativeExecutionClaimed===true&&Array.isArray(hybrid?.devices)&&hybrid.devices.some(d=>d?.online&&!d?.revoked));
 return{
  ok:Boolean(status&&machine),schema:'OMEGA_SYSTEM_CONVERGENCE_R116',runtimeRevision:REVISION,canonicalAuthority:'omega-v6',
  canonical:{state:nodes.omegaV6?.state||'UNKNOWN'},
  proposal:{surfaceState:nodes.genesis?.state||'UNKNOWN',machineState:services.genesis?.state||'UNKNOWN',effectiveState:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN'},
  optical:{surfaceState:nodes.optical?.state||'UNKNOWN',machineState:services.optical?.state||'UNKNOWN',effectiveScreenState:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN'},
  sovereign:{state:nodes.sovereign?.state||'UNKNOWN',rcwaState:nodes.sovereign?.rcwaState||status?.runtime?.rcwa?.state||'UNKNOWN',currentAuthenticatedHeartbeat:currentHeartbeat,nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true},
  connectorPolicy:{canonicalOrigin:'https://omegav6.jeffdeweyeljefe.workers.dev',currentRevision:'R116',retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',retiredLaunchersMustNotBeUsed:true,reason:'The retired preview host can return 401 and is not the canonical Hybrid authority.'},
  truthBoundary:'Surface availability, machine-service availability, browser pairing, current host heartbeat, solver freshness, and canonical admission are distinct states. R116 never promotes one into another.'
 };
}
async function fetchR116(request,env){
 const url=new URL(request.url),path=url.pathname,corsPath=path.startsWith('/api/hybrid/')||path.startsWith('/api/federation/')||path==='/api/system/convergence';
 if(request.method==='OPTIONS'&&corsPath)return preflightR116(request);
 if(path==='/api/federation/run/status'&&request.method==='GET'){
  const [{response,body},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]);if(!body||typeof body!=='object')return withCorsR116(response,request);return withCorsR116(json(enrichStatusR116(body,machine),response.status),request);
 }
 if(path==='/api/federation/route-intent'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),intent=text(body?.intent||body?.text).slice(0,4000),[{body:status},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]),plan=planIntentR103(intent,routingStatusR116(status||{},machine));
  return withCorsR116(json({...plan,runtimeRevision:REVISION,machineAwareRouting:true,machineServices:{genesis:machine?.nodes?.genesis?.state||'UNKNOWN',optical:machine?.nodes?.optical?.state||'UNKNOWN'},truthBoundary:`${plan.truthBoundary} R116 treats live R115 machine adapters as execution readiness for their existing PROPOSE/SCREEN roles while preserving protected human-surface state separately.`},plan.ok?200:400),request);
 }
 if(path==='/api/system/convergence'&&request.method==='GET')return withCorsR116(json(await convergenceR116(request,env)),request);
 const response=await r115.fetch(request,env);return corsPath?withCorsR116(response,request):withCorsR116(response,request);
}

export class OmegaRuntime extends OmegaRuntimeR115 {}
export default{async fetch(request,env){return fetchR116(request,env)}};
