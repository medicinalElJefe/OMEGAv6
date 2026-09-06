import r115,{OmegaRuntime as OmegaRuntimeR115} from './workerR115.js';
import {planIntentR103} from './federation/federationIntentRouterR103.js';
import {swarmApiR121,withSwarmCorsR121} from './swarm/swarmApiR121.js';
import {OmegaSwarmCell} from './swarm/swarmCellR121.js';
import {OmegaSwarmCoordinator} from './swarm/swarmCoordinatorR121.js';
import {OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator} from './swarm/swarmOrganismR123.js';
import {OmegaSwarmAutonomicCoordinator} from './swarm/swarmAutonomicR125.js';

export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator};

const REVISION='R116';
// Accepted-production lineage marker retained for R117 regression evidence.
const CONNECTOR_REVISION='R117';
const ACTIVE_CONNECTOR_REVISION='R129';
const HYBRID_PROTOCOL_R129='OMEGA_HYBRID_PROTOCOL_R129';
const HEARTBEAT_TTL_R129=30000;
const POLL_INTERVAL_R129=4000;
const CANONICAL_ORIGIN_R129='https://omegav6.jeffdeweyeljefe.workers.dev';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION,'x-omega-connector-revision':ACTIVE_CONNECTOR_REVISION,'x-omega-hybrid-protocol':HYBRID_PROTOCOL_R129};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=v=>String(v??'').trim();
const safeId=(v,fallback='')=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const hex64=v=>/^[a-f0-9]{64}$/i.test(text(v));
const approvedHosts=new Set([
 'omegav6.jeffdeweyeljefe.workers.dev',
 'omega-genesis-v1.jeffdeweyeljefe.workers.dev',
 'omega-living-light-etching-private-woven2.vercel.app',
 'omega-optical-cloud-woven2.vercel.app'
]);
const HYBRID_OPS_R129=Object.freeze(['TRAIN_LOCAL','INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','SAFE_IMPORT','WORKBOOK_AUDIT','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','OPEN_URL','WAIT','CLICK','KEY','TYPE_TEXT','SCROLL','ASSERT_WINDOW','READ_VISIBLE_TEXT','RECORD_MACRO','REPLAY_MACRO']);

async function sha256TextR129(source){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function canonicalHybridAgentR129(env){
 if(!env?.ASSETS?.fetch)return{ok:false,code:'HYBRID_AGENT_ASSET_BINDING_UNAVAILABLE'};
 const asset=await env.ASSETS.fetch(new Request(new URL('/omega-hybrid-agent.py',CANONICAL_ORIGIN_R129),{headers:{'cache-control':'no-cache'}}));
 if(!asset.ok)return{ok:false,code:'HYBRID_AGENT_ASSET_NOT_FOUND',status:asset.status};
 const source=await asset.text();
 const valid=source.length>1000&&source.startsWith('#!/usr/bin/env python3')&&source.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'")&&source.includes('OMEGA R34 local Hybrid Link agent')&&source.includes(`HYBRID_PROTOCOL='${HYBRID_PROTOCOL_R129}'`);
 if(!valid)return{ok:false,code:'HYBRID_AGENT_ASSET_INVALID'};
 const version=(source.match(/VERSION='([^']+)'/)||[])[1]||'UNKNOWN',sha256=await sha256TextR129(source);
 return{ok:true,source,version,sha256,protocol:HYBRID_PROTOCOL_R129,bytes:new TextEncoder().encode(source).byteLength};
}

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
  'access-control-allow-headers':'content-type,authorization,x-omega-federation-token,x-vercel-protection-bypass,x-omega-bridge-id,x-omega-bridge-secret,x-omega-session-id,cache-control,x-omega-hybrid-protocol,x-omega-expected-agent-sha256',
  'access-control-expose-headers':'x-omega-runtime-successor,x-omega-connector-revision,x-omega-hybrid-protocol,x-omega-agent-version,x-omega-agent-sha256,x-omega-canonical-origin,x-omega-rcwa-agent-sha256,x-omega-rcwa-worker-sha256',
  'access-control-max-age':'600'
 };
}
function withCorsR116(response,request){
 const headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);headers.set('x-omega-connector-revision',ACTIVE_CONNECTOR_REVISION);headers.set('x-omega-hybrid-protocol',HYBRID_PROTOCOL_R129);const cors=corsHeadersR116(request);if(cors)for(const[k,v]of Object.entries(cors))headers.set(k,v);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function preflightR116(request){const headers=corsHeadersR116(request);return headers?new Response(null,{status:204,headers:{...headers,'x-omega-runtime-successor':REVISION,'x-omega-connector-revision':ACTIVE_CONNECTOR_REVISION,'x-omega-hybrid-protocol':HYBRID_PROTOCOL_R129}}):new Response(null,{status:403,headers:{'x-omega-runtime-successor':REVISION,'x-omega-connector-revision':ACTIVE_CONNECTOR_REVISION,'x-omega-hybrid-protocol':HYBRID_PROTOCOL_R129}})}
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
 return{...status,runtimeRevision:REVISION,connectorRevision:ACTIVE_CONNECTOR_REVISION,hybridProtocol:HYBRID_PROTOCOL_R129,machineServices:{schema:machine?.schema||'OMEGA_FEDERATION_MACHINE_STATUS_R115',canonicalAuthority:'omega-v6',genesis:services.genesis||null,optical:services.optical||null,truthBoundary:'Machine service readiness is execution transport truth for PROPOSE/SCREEN. Human surface reachability remains separately visible and does not become CanonState authority.'},executionReadiness:{genesis:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN',optical:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN',sovereign:nodes.sovereign?.state||'UNKNOWN',omegaV6:nodes.omegaV6?.state||'UNKNOWN'}};
}
async function convergenceR116(request,env){
 const [{body:status},machine,hybridResponse]=await Promise.all([
  inheritedStatusR116(request,env),
  machineStatusR116(request,env),
  r115.fetch(new Request(new URL('/api/hybrid/status',request.url),{method:'GET',headers:request.headers}),env)
 ]),hybrid=await readJsonResponse(hybridResponse),nodes=status?.nodes||{},services=machine?.nodes||{};
 const currentHeartbeat=Boolean(hybrid?.nativeExecutionClaimed===true&&Array.isArray(hybrid?.devices)&&hybrid.devices.some(d=>d?.online&&!d?.revoked));
 const sealedHeartbeat=Boolean(hybrid?.sealedNativeExecutionClaimed===true);
 return{
  ok:Boolean(status&&machine),schema:'OMEGA_SYSTEM_CONVERGENCE_R116',runtimeRevision:REVISION,connectorRevision:ACTIVE_CONNECTOR_REVISION,hybridProtocol:HYBRID_PROTOCOL_R129,canonicalAuthority:'omega-v6',
  canonical:{state:nodes.omegaV6?.state||'UNKNOWN'},
  proposal:{surfaceState:nodes.genesis?.state||'UNKNOWN',machineState:services.genesis?.state||'UNKNOWN',effectiveState:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN'},
  optical:{surfaceState:nodes.optical?.state||'UNKNOWN',machineState:services.optical?.state||'UNKNOWN',effectiveScreenState:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN'},
  sovereign:{state:nodes.sovereign?.state||'UNKNOWN',rcwaState:nodes.sovereign?.rcwaState||status?.runtime?.rcwa?.state||'UNKNOWN',currentAuthenticatedHeartbeat:currentHeartbeat,sealedAuthenticatedHeartbeat:sealedHeartbeat,nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true},
  connectorPolicy:{canonicalOrigin:CANONICAL_ORIGIN_R129,currentRevision:ACTIVE_CONNECTOR_REVISION,runtimeRevision:REVISION,hybridProtocol:HYBRID_PROTOCOL_R129,retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',retiredLaunchersMustNotBeUsed:true,silentPairRotationForbidden:true,agentHashPinRequired:true,rootIdentityPinned:true,bootSessionBound:true,heartbeatReplayRejected:true,reason:'R129 reuses a valid pairing, pins the exact canonical agent bytes and approved-root identity, and separates registration from heartbeat proof.'},
  truthBoundary:'Surface availability, machine-service availability, browser pairing, device registration, current host heartbeat, exact agent integrity, approved-root identity, solver freshness, and canonical admission are distinct states. R129 never promotes registration or credential issuance into PC ONLINE.'
 };
}

function bootstrapOriginAllowedR117(request){
 const origin=text(request.headers.get('origin'));if(!origin)return true;
 try{const u=new URL(origin);return u.protocol==='https:'&&u.hostname.toLowerCase()==='omegav6.jeffdeweyeljefe.workers.dev'}catch{return false}
}
async function durablePairR117(request,env){
 if(!bootstrapOriginAllowedR117(request))return json({ok:false,code:'BOOTSTRAP_ORIGIN_REJECTED',reply:'Fresh Sovereign pairing can only be minted by the canonical OMEGAv6 surface.'},403);
 const sid=safeId(request.headers.get('x-omega-session-id'),'');
 if(!sid)return json({ok:false,code:'SESSION_ID_REQUIRED',reply:'A browser runtime session is required before a fresh PC connector can be issued.'},400);
 if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);
 // Validate the exact agent before mutating pairing state. A broken/missing asset never rotates a working bridge.
 const agent=await canonicalHybridAgentR129(env);
 if(!agent.ok)return json({ok:false,code:agent.code||'HYBRID_AGENT_UNAVAILABLE',reply:'The canonical Hybrid agent failed integrity validation, so pairing state was left unchanged.'},503);
 const stub=env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(sid));
 const cleanHeaders=new Headers({'content-type':'application/json','x-omega-session-id':sid});
 const pairResponse=await stub.fetch(new Request('https://omega-runtime.internal/pair',{method:'POST',headers:cleanHeaders,body:JSON.stringify({rotate:true})}));
 const pair=await pairResponse.clone().json().catch(()=>({}));
 if(!pairResponse.ok||!pair?.secret)return json({ok:false,code:pair?.code||'PAIR_BOOTSTRAP_FAILED',reply:pair?.reply||'OMEGA could not mint a fresh server-backed Hybrid credential.'},pairResponse.status||503);
 const bridgeId=safeId(pair.bridgeId||sid,sid),secret=text(pair.secret),pairingCode=`${bridgeId}.${secret}`;
 return json({
  ok:true,
  schema:'OMEGA_SOVEREIGN_BOOTSTRAP_R117',
  runtimeRevision:REVISION,
  connectorRevision:ACTIVE_CONNECTOR_REVISION,
  hybridProtocol:HYBRID_PROTOCOL_R129,
  bridgeId,
  secret,
  pairingCode,
  createdAt:Date.now(),
  connectorFilename:'START_OMEGA_PC_LINK_R129_SEALED.cmd',
  canonicalOrigin:CANONICAL_ORIGIN_R129,
  retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',
  agentPath:'/api/hybrid/agent-download?r117=1&r120=1&r129=1',
  rcwaAgentPath:'/api/federation/rcwa/agent-download?r117=1&r120=1&r129=1',
  agent:{version:agent.version,sha256:agent.sha256,bytes:agent.bytes,protocol:agent.protocol},
  agentRestartRequired:true,
  nativeExecutionClaimed:false,
  truthBoundary:'This endpoint rotates a fresh bridge credential only after the canonical agent itself passes integrity validation. Registration is not PC ONLINE; a real authenticated R129 heartbeat is still required.'
 });
}

function deviceIntegrityR129(device){
 if(device?.protocol!==HYBRID_PROTOCOL_R129)return'LEGACY_UNSEALED';
 if(device?.integrityState!=='CURRENT_AGENT')return'UNVERIFIED_AGENT';
 if(!hex64(device?.agentSha256)||!hex64(device?.rootIdentity)||!safeId(device?.bootId))return'INCOMPLETE_IDENTITY';
 return'CURRENT_AGENT';
}

export class OmegaRuntime extends OmegaRuntimeR115 {
 async state(){
  const base=await super.state(),devices=Array.isArray(base?.devices)?base.devices.map(d=>({...d,integrityState:deviceIntegrityR129(d)})):[],sealedOnline=devices.filter(d=>d?.online&&!d?.revoked&&deviceIntegrityR129(d)==='CURRENT_AGENT'),protocolMode=await this.get('hybridProtocolMode','LEGACY_COMPATIBLE');
  return{...base,schema:'OMEGA_HYBRID_RUNTIME_R129',hybridProtocol:HYBRID_PROTOCOL_R129,hybridProtocolMode:protocolMode,heartbeatTtlMs:HEARTBEAT_TTL_R129,pollIntervalMs:POLL_INTERVAL_R129,devices,sealedOnlineDevices:sealedOnline.length,sealedNativeExecutionClaimed:sealedOnline.length>0,truthBoundary:'R129 registration records identity but does not set lastSeen. Only a monotonic authenticated heartbeat can make a sealed device online. After sealed takeover, stale legacy connectors cannot claim new work.'};
 }
 async fetch(request){
  const u=new URL(request.url),path=u.pathname;
  if(path.startsWith('/agent/')&&request.method==='POST'){
   const legacyProbe=request.clone(),legacyBody=await legacyProbe.json().catch(()=>({})),protocolMode=await this.get('hybridProtocolMode','LEGACY_COMPATIBLE');
   if(protocolMode===HYBRID_PROTOCOL_R129&&legacyBody?.protocol!==HYBRID_PROTOCOL_R129){
    if(path==='/agent/heartbeat')return json({ok:true,deprecated:true,code:'R129_SEALED_TAKEOVER',nativeExecutionClaimed:false,reply:'A sealed R129 session owns this bridge; legacy heartbeat was acknowledged without refreshing online proof.'});
    if(path==='/agent/poll')return json({ok:true,deprecated:true,code:'R129_SEALED_TAKEOVER',job:null,reply:'A sealed R129 session owns this bridge; no new work is exposed to the legacy connector.'});
    if(path==='/agent/result')return super.fetch(request);
    return json({ok:false,code:'CONNECTOR_UPGRADE_REQUIRED',reply:'This bridge has been sealed by R129. Close stale connector windows and use the current SHA-256-pinned connector.'},426);
   }
  }
  if(path==='/agent/register'&&request.method==='POST'){
   const replay=request.clone(),b=await request.json().catch(()=>({}));
   if(b?.protocol!==HYBRID_PROTOCOL_R129)return super.fetch(replay);
   if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401);
   const headerBridge=safeId(request.headers.get('x-omega-bridge-id'),''),bodyBridge=safeId(b.bridgeId,''),id=safeId(b.deviceId,''),bootId=safeId(b.bootId,''),rootIdentity=text(b.rootIdentity).toLowerCase(),agentSha256=text(b.agentSha256).toLowerCase(),expectedAgentSha256=text(request.headers.get('x-omega-expected-agent-sha256')).toLowerCase();
   if(!headerBridge||headerBridge!==bodyBridge)return json({ok:false,code:'BRIDGE_IDENTITY_MISMATCH'},400);
   if(!id||!bootId)return json({ok:false,code:'DEVICE_IDENTITY_REQUIRED'},400);
   if(!hex64(rootIdentity))return json({ok:false,code:'ROOT_IDENTITY_REQUIRED'},400);
   if(!hex64(agentSha256)||!hex64(expectedAgentSha256)||agentSha256!==expectedAgentSha256)return json({ok:false,code:'AGENT_INTEGRITY_MISMATCH',expectedAgentSha256:hex64(expectedAgentSha256)?expectedAgentSha256:null},409);
   let rows=await this.get('devices',[]);const existing=rows.find(x=>x.id===id);
   if(existing?.rootIdentity&&existing.rootIdentity!==rootIdentity)return json({ok:false,code:'DEVICE_ROOT_IDENTITY_MISMATCH',reply:'This device identity is already bound to a different approved root. No silent root mutation was accepted.'},409);
   const row={id,name:text(b.name||'OMEGA PC').slice(0,120),platform:text(b.platform||'unknown').slice(0,160),version:text(b.version||'R129-agent').slice(0,80),protocol:HYBRID_PROTOCOL_R129,capabilities:Array.isArray(b.capabilities)?b.capabilities.filter(x=>HYBRID_OPS_R129.includes(x)).slice(0,40):[],rootLabel:text(b.rootLabel||'approved root').slice(0,160),rootIdentity,agentSha256,integrityState:'CURRENT_AGENT',bootId,heartbeatSeq:0,registeredAt:Date.now(),lastHeartbeatAt:0,lastSeen:0,revoked:false};
   rows=[...rows.filter(x=>x.id!==id),row].slice(-20);await this.put('devices',rows);await this.put('hybridProtocolMode',HYBRID_PROTOCOL_R129);await this.event('DEVICE_REGISTERED_R129',`${row.name} registered sealed identity; heartbeat proof is still required.`,{deviceId:id,protocol:HYBRID_PROTOCOL_R129,agentSha256,rootIdentity});
   return json({ok:true,device:{...row,online:false},protocol:HYBRID_PROTOCOL_R129,heartbeatTtlMs:HEARTBEAT_TTL_R129,pollIntervalMs:POLL_INTERVAL_R129,nativeExecutionClaimed:false});
  }
  if(['/agent/heartbeat','/agent/poll','/agent/result'].includes(path)&&request.method==='POST'){
   const replay=request.clone(),b=await request.json().catch(()=>({}));
   if(b?.protocol!==HYBRID_PROTOCOL_R129)return super.fetch(replay);
   if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401);
   const id=safeId(b.deviceId,''),bootId=safeId(b.bootId,'');let rows=await this.get('devices',[]),row=rows.find(x=>x.id===id&&!x.revoked);
   if(!row)return json({ok:false,code:'DEVICE_NOT_REGISTERED'},404);
   if(row.protocol!==HYBRID_PROTOCOL_R129||row.bootId!==bootId)return json({ok:false,code:'DEVICE_SESSION_SUPERSEDED',reply:'A different sealed agent session owns this device identity. Stop stale connector windows and keep only the newest one.'},409);
   if(deviceIntegrityR129(row)!=='CURRENT_AGENT')return json({ok:false,code:'AGENT_INTEGRITY_REQUIRED'},409);
   if(path==='/agent/heartbeat'){
    const seq=Math.max(0,Math.trunc(Number(b.heartbeatSeq)||0));if(seq<=Number(row.heartbeatSeq||0))return json({ok:false,code:'HEARTBEAT_REPLAY',expectedGreaterThan:Number(row.heartbeatSeq||0)},409);
    const at=Date.now();rows=rows.map(x=>x.id===id?({...x,lastSeen:at,lastHeartbeatAt:at,heartbeatSeq:seq,version:text(b.version||x.version).slice(0,80)}):x);await this.put('devices',rows);return json({ok:true,at,protocol:HYBRID_PROTOCOL_R129,heartbeatSeq:seq,heartbeatTtlMs:HEARTBEAT_TTL_R129,pollIntervalMs:POLL_INTERVAL_R129,nativeExecutionClaimed:true});
   }
   const online=Date.now()-Number(row.lastSeen||0)<HEARTBEAT_TTL_R129;if(!online)return json({ok:false,code:'HEARTBEAT_STALE',reply:'A current sealed heartbeat is required before polling or returning native work.'},409);
   return super.fetch(replay);
  }
  return super.fetch(request);
 }
}

async function fetchR116(request,env){
 const url=new URL(request.url),path=url.pathname,corsPath=path.startsWith('/api/hybrid/')||path.startsWith('/api/federation/')||path==='/api/system/convergence';
 if(path.startsWith('/api/swarm/'))return withSwarmCorsR121(await swarmApiR121(request,env,url),request);
 if(request.method==='OPTIONS'&&corsPath)return preflightR116(request);
 if(path==='/api/hybrid/agent-manifest'&&request.method==='GET'){
  const agent=await canonicalHybridAgentR129(env);if(!agent.ok)return withCorsR116(json({ok:false,code:agent.code},503),request);
  return withCorsR116(json({ok:true,schema:'OMEGA_HYBRID_AGENT_MANIFEST_R129',connectorRevision:ACTIVE_CONNECTOR_REVISION,protocol:agent.protocol,version:agent.version,sha256:agent.sha256,bytes:agent.bytes,filename:'omega-hybrid-agent.py',canonicalOrigin:CANONICAL_ORIGIN_R129,downloadPath:'/api/hybrid/agent-download?r117=1&r120=1&r129=1',heartbeatTtlMs:HEARTBEAT_TTL_R129,pollIntervalMs:POLL_INTERVAL_R129,truthBoundary:'The launcher must pin these exact bytes. A hash mismatch is a hard stop, not a fallback or mutation.'}),request);
 }
 if(path==='/api/hybrid/bootstrap'&&request.method==='POST')return withCorsR116(await durablePairR117(request,env),request);
 if(path==='/api/hybrid/agent/register'&&request.method==='POST'){
  const agent=await canonicalHybridAgentR129(env);if(!agent.ok)return withCorsR116(json({ok:false,code:agent.code},503),request);
  const headers=new Headers(request.headers);headers.set('x-omega-expected-agent-sha256',agent.sha256);headers.set('x-omega-hybrid-protocol',HYBRID_PROTOCOL_R129);return withCorsR116(await r115.fetch(new Request(request,{headers}),env),request);
 }
 if(path==='/api/federation/run/status'&&request.method==='GET'){
  const [{response,body},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]);if(!body||typeof body!=='object')return withCorsR116(response,request);return withCorsR116(json(enrichStatusR116(body,machine),response.status),request);
 }
 if(path==='/api/federation/route-intent'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),intent=text(body?.intent||body?.text).slice(0,4000),[{body:status},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]),plan=planIntentR103(intent,routingStatusR116(status||{},machine));
  return withCorsR116(json({...plan,runtimeRevision:REVISION,connectorRevision:ACTIVE_CONNECTOR_REVISION,hybridProtocol:HYBRID_PROTOCOL_R129,machineAwareRouting:true,machineServices:{genesis:machine?.nodes?.genesis?.state||'UNKNOWN',optical:machine?.nodes?.optical?.state||'UNKNOWN'},truthBoundary:`${plan.truthBoundary} R116 treats live R115 machine adapters as execution readiness for their existing PROPOSE/SCREEN roles while preserving protected human-surface state separately.`},plan.ok?200:400),request);
 }
 if(path==='/api/system/convergence'&&request.method==='GET')return withCorsR116(json(await convergenceR116(request,env)),request);
 const response=await r115.fetch(request,env);
 if(path==='/api/hybrid/agent-download'&&request.method==='GET'&&response.ok){const headers=new Headers(response.headers);headers.set('x-omega-hybrid-protocol',HYBRID_PROTOCOL_R129);headers.set('x-omega-connector-revision',ACTIVE_CONNECTOR_REVISION);return withCorsR116(new Response(response.body,{status:response.status,statusText:response.statusText,headers}),request)}
 return corsPath?withCorsR116(response,request):withCorsR116(response,request);
}

export default{async fetch(request,env){return fetchR116(request,env)}};
