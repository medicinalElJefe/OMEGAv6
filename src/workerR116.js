import r115,{OmegaRuntime as OmegaRuntimeR115} from './workerR115.js';
import {planIntentR103} from './federation/federationIntentRouterR103.js';
import {swarmApiR121,withSwarmCorsR121} from './swarm/swarmApiR121.js';
import {OmegaSwarmCell} from './swarm/swarmCellR121.js';
import {OmegaSwarmCoordinator} from './swarm/swarmCoordinatorR121.js';
import {OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator} from './swarm/swarmOrganismR123.js';
import {OmegaSwarmAutonomicCoordinator} from './swarm/swarmAutonomicR125.js';
import {manifestR130,operationalR130,R130_REVISION} from './system/operationalControlPlaneR130.js';
import {closeHybridReturnR141,readHybridClosureR141,replayHybridClosureR141,manifestR141,R141_REVISION} from './hybridProofClosureR141.js';
import {createRunR146,listRunsR146,manifestR146,readRunR146,replayRunR146,transitionRunR146,R146_REVISION} from './execution/durableOperationExecutionR146.js';
import {dispatchRunR147,executorDirectoryR147,manifestR147,pollRunR147,readResultR147,syncHybridClaimR147,syncHybridReturnR147,R147_REVISION} from './execution/unifiedExecutorFabricR147.js';
import {advanceSovereignMissionR152,hydrateSovereignMissionsR152,manifestR152,resumeSovereignMissionR152,tagSovereignMissionR152,R152_MISSION_SCHEMA,R152_REVISION,R152_SOURCE_SCHEMA} from './execution/adaptiveSovereignMissionR152.js';

export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator};

const REVISION='R116';
const CONNECTOR_REVISION='R117';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION,'x-omega-connector-revision':CONNECTOR_REVISION,'x-omega-proof-closure':R141_REVISION,'x-omega-durable-execution':R146_REVISION,'x-omega-executor-fabric':R147_REVISION,'x-omega-sovereign-mission':R152_REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=v=>String(v??'').trim();
const safeId=(v,fallback='')=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
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
  'access-control-expose-headers':'x-omega-runtime-successor,x-omega-connector-revision,x-omega-proof-closure,x-omega-durable-execution,x-omega-executor-fabric,x-omega-sovereign-mission,x-omega-control-plane,x-omega-agent-version,x-omega-agent-sha256,x-omega-canonical-origin,x-omega-rcwa-agent-sha256,x-omega-rcwa-worker-sha256',
  'access-control-max-age':'600'
 };
}
function withCorsR116(response,request){
 const headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);headers.set('x-omega-connector-revision',CONNECTOR_REVISION);headers.set('x-omega-proof-closure',R141_REVISION);headers.set('x-omega-durable-execution',R146_REVISION);headers.set('x-omega-executor-fabric',R147_REVISION);headers.set('x-omega-sovereign-mission',R152_REVISION);const cors=corsHeadersR116(request);if(cors)for(const[k,v]of Object.entries(cors))headers.set(k,v);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function preflightR116(request){const headers=corsHeadersR116(request);return headers?new Response(null,{status:204,headers:{...headers,'x-omega-runtime-successor':REVISION,'x-omega-connector-revision':CONNECTOR_REVISION,'x-omega-proof-closure':R141_REVISION,'x-omega-durable-execution':R146_REVISION,'x-omega-executor-fabric':R147_REVISION,'x-omega-sovereign-mission':R152_REVISION}}):new Response(null,{status:403,headers:{'x-omega-runtime-successor':REVISION,'x-omega-connector-revision':CONNECTOR_REVISION,'x-omega-proof-closure':R141_REVISION,'x-omega-durable-execution':R146_REVISION,'x-omega-executor-fabric':R147_REVISION,'x-omega-sovereign-mission':R152_REVISION}})}
async function readJsonResponse(response){return response.clone().json().catch(()=>null)}
async function sha256TextR141(source){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
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
 return{...status,runtimeRevision:REVISION,connectorRevision:CONNECTOR_REVISION,proofClosureRevision:R141_REVISION,durableExecutionRevision:R146_REVISION,executorFabricRevision:R147_REVISION,sovereignMissionRevision:R152_REVISION,machineServices:{schema:machine?.schema||'OMEGA_FEDERATION_MACHINE_STATUS_R115',canonicalAuthority:'omega-v6',genesis:services.genesis||null,optical:services.optical||null,truthBoundary:'Machine service readiness is execution transport truth for PROPOSE/SCREEN. Human surface reachability remains separately visible and does not become CanonState authority.'},executionReadiness:{genesis:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN',optical:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN',sovereign:nodes.sovereign?.state||'UNKNOWN',omegaV6:nodes.omegaV6?.state||'UNKNOWN'}};
}
async function convergenceR116(request,env){
 const [{body:status},machine,hybridResponse]=await Promise.all([
  inheritedStatusR116(request,env),
  machineStatusR116(request,env),
  r115.fetch(new Request(new URL('/api/hybrid/status',request.url),{method:'GET',headers:request.headers}),env)
 ]),hybrid=await readJsonResponse(hybridResponse),nodes=status?.nodes||{},services=machine?.nodes||{};
 const currentHeartbeat=Boolean(hybrid?.nativeExecutionClaimed===true&&Array.isArray(hybrid?.devices)&&hybrid.devices.some(d=>d?.online&&!d?.revoked));
 return{
  ok:Boolean(status&&machine),schema:'OMEGA_SYSTEM_CONVERGENCE_R116',runtimeRevision:REVISION,connectorRevision:CONNECTOR_REVISION,proofClosureRevision:R141_REVISION,durableExecutionRevision:R146_REVISION,executorFabricRevision:R147_REVISION,sovereignMissionRevision:R152_REVISION,canonicalAuthority:'omega-v6',
  canonical:{state:nodes.omegaV6?.state||'UNKNOWN'},
  proposal:{surfaceState:nodes.genesis?.state||'UNKNOWN',machineState:services.genesis?.state||'UNKNOWN',effectiveState:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN'},
  optical:{surfaceState:nodes.optical?.state||'UNKNOWN',machineState:services.optical?.state||'UNKNOWN',effectiveScreenState:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN'},
  sovereign:{state:nodes.sovereign?.state||'UNKNOWN',rcwaState:nodes.sovereign?.rcwaState||status?.runtime?.rcwa?.state||'UNKNOWN',currentAuthenticatedHeartbeat:currentHeartbeat,nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true},
  connectorPolicy:{canonicalOrigin:'https://omegav6.jeffdeweyeljefe.workers.dev',currentRevision:CONNECTOR_REVISION,runtimeRevision:REVISION,proofClosureRevision:R141_REVISION,retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',retiredLaunchersMustNotBeUsed:true,reason:'The retired preview host can return 401 and is not the canonical Hybrid authority.'},
  truthBoundary:'Surface availability, R139 unified capability routing, R140 browser operation-world projection, machine-service availability, browser pairing, current host heartbeat, R146 durable operation history, R147 executor binding/dispatch, R152 adaptive mission continuation, returned execution proof, deterministic replay, solver freshness, and canonical admission are distinct states. R116/R117/R141/R146/R147/R152 never promotes one into another.'
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
  connectorRevision:CONNECTOR_REVISION,
  proofClosureRevision:R141_REVISION,
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
  truthBoundary:'This endpoint rotates a fresh bridge credential directly in durable runtime state using only the canonical browser session. Stale browser bridge headers are ignored. PC ONLINE remains false until a real authenticated host heartbeat arrives.'
 });
}

async function serveProofAgentR141(request,env){
 if(!env?.ASSETS?.fetch)return json({ok:false,code:'R141_PROOF_AGENT_ASSET_BINDING_UNAVAILABLE'},503);
 const asset=await env.ASSETS.fetch(new Request(new URL('/omega-hybrid-agent-r141.py',request.url),{headers:{'cache-control':'no-cache'}}));if(!asset.ok)return json({ok:false,code:'R141_PROOF_AGENT_ASSET_NOT_FOUND',status:asset.status},503);
 const source=await asset.text(),valid=source.length>1000&&source.startsWith('#!/usr/bin/env python3')&&source.includes("PROOF_CLOSURE_REVISION='R141'")&&source.includes("FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'")&&source.includes("BASE_PATH='/omega-hybrid-agent.py'")&&source.includes('OMEGA R34 local Hybrid Link agent')&&source.includes('Pairing is explicit.');if(!valid)return json({ok:false,code:'R141_PROOF_AGENT_ASSET_INVALID'},503);
 const digest=await sha256TextR141(source);return new Response(source,{status:200,headers:{'content-type':'text/x-python; charset=utf-8','content-disposition':'attachment; filename="omega-hybrid-agent-r141.py"','cache-control':'no-store, max-age=0','x-omega-agent-version':'R141-wrapper','x-omega-agent-sha256':digest,'x-omega-proof-closure':R141_REVISION,'x-omega-canonical-origin':'https://omegav6.jeffdeweyeljefe.workers.dev'}});
}
function hybridRuntimeIdR141(request){return safeId(request.headers.get('x-omega-bridge-id'))||safeId(request.headers.get('x-omega-session-id'))}
async function hybridRuntimeProxyR141(request,env,internalPath){
 const id=hybridRuntimeIdR141(request);if(!id)return json({ok:false,code:'HYBRID_RUNTIME_ID_REQUIRED',reply:'Pair this browser to a Hybrid runtime before reading execution proof closure.'},400);if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'RUNTIME_STATE_BINDING_UNAVAILABLE'},503);
 const stub=env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id)),headers=new Headers(request.headers),init={method:request.method,headers};if(request.method!=='GET'&&request.method!=='HEAD')init.body=await request.clone().text();return stub.fetch(new Request('https://omega-runtime.internal'+internalPath,init));
}
async function executionRuntimeProxyR146(request,env,internalPath){
 const id=hybridRuntimeIdR141(request);if(!id)return json({ok:false,code:'R146_RUNTIME_ID_REQUIRED',reply:'A runtime session or paired bridge is required for durable execution history.'},400);if(!env?.OMEGA_RUNTIME)return json({ok:false,code:'R146_RUNTIME_BINDING_UNAVAILABLE'},503);
 const stub=env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(id)),headers=new Headers(request.headers),init={method:request.method,headers};if(request.method!=='GET'&&request.method!=='HEAD')init.body=await request.clone().text();return stub.fetch(new Request('https://omega-runtime.internal'+internalPath,init));
}

async function probeFetchR130(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path.startsWith('/api/swarm/'))return withSwarmCorsR121(await swarmApiR121(request,env,url),request);
 if(path==='/api/system/convergence')return json(await convergenceR116(request,env));
 if(path==='/api/federation/run/status'){
  const [{response,body},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]);if(!body||typeof body!=='object')return response;return json(enrichStatusR116(body,machine),response.status);
 }
 return r115.fetch(request,env);
}

async function fetchR116(request,env){
 const url=new URL(request.url),path=url.pathname,corsPath=path.startsWith('/api/hybrid/')||path.startsWith('/api/federation/')||path.startsWith('/api/execution/')||path==='/api/system/convergence'||path==='/api/system/manifest'||path==='/api/system/operational';
 if(path.startsWith('/api/swarm/'))return withSwarmCorsR121(await swarmApiR121(request,env,url),request);
 if(request.method==='OPTIONS'&&corsPath)return preflightR116(request);
 if(path==='/api/hybrid/agent-download'&&request.method==='GET'&&url.searchParams.get('r117')==='1')return withCorsR116(await serveProofAgentR141(request,env),request);
 if(path==='/api/hybrid/bootstrap'&&request.method==='POST')return withCorsR116(await durablePairR117(request,env),request);
 if(path==='/api/hybrid/reconnect'&&request.method==='POST'){
  const response=await r115.fetch(request,env),data=await readJsonResponse(response);if(!response.ok||!data||typeof data!=='object')return withCorsR116(response,request);return withCorsR116(json({...data,agentPath:'/api/hybrid/agent-download?r117=1',proofClosureRevision:R141_REVISION,connectorProtocol:'R141_EXACT_PAYLOAD_SHA_SEMANTIC_EQUALITY'}),request);
 }
 if(path==='/api/hybrid/proof-closure/r141'&&request.method==='GET')return withCorsR116(json(manifestR141()),request);
 const closureRoute=path.match(/^\/api\/hybrid\/jobs\/([A-Za-z0-9._:-]+)\/(closure|replay)$/);
 if(closureRoute&&((closureRoute[2]==='closure'&&request.method==='GET')||(closureRoute[2]==='replay'&&request.method==='POST')))return withCorsR116(await hybridRuntimeProxyR141(request,env,`/jobs/${closureRoute[1]}/${closureRoute[2]}`),request);
 if(path==='/api/execution/r146/manifest'&&request.method==='GET')return withCorsR116(json(manifestR146()),request);
 if(path==='/api/execution/r147/manifest'&&request.method==='GET')return withCorsR116(json(manifestR147()),request);
 if(path==='/api/execution/executors'&&request.method==='GET')return withCorsR116(await executionRuntimeProxyR146(request,env,'/execution/executors'),request);
 if(path==='/api/execution/runs'&&(request.method==='GET'||request.method==='POST'))return withCorsR116(await executionRuntimeProxyR146(request,env,'/execution/runs'),request);
 const executionRoute=path.match(/^\/api\/execution\/runs\/([A-Za-z0-9._:-]+)(?:\/(transition|replay|dispatch|poll|result))?$/);
 if(executionRoute){const id=executionRoute[1],action=executionRoute[2]||'';if(!action&&request.method==='GET')return withCorsR116(await executionRuntimeProxyR146(request,env,`/execution/runs/${id}`),request);if(action==='transition'&&request.method==='POST')return withCorsR116(await executionRuntimeProxyR146(request,env,`/execution/runs/${id}/transition`),request);if(action==='replay'&&request.method==='POST')return withCorsR116(await executionRuntimeProxyR146(request,env,`/execution/runs/${id}/replay`),request);if(action==='dispatch'&&request.method==='POST')return withCorsR116(await executionRuntimeProxyR146(request,env,`/execution/runs/${id}/dispatch`),request);if(action==='poll'&&request.method==='POST')return withCorsR116(await executionRuntimeProxyR146(request,env,`/execution/runs/${id}/poll`),request);if(action==='result'&&request.method==='GET')return withCorsR116(await executionRuntimeProxyR146(request,env,`/execution/runs/${id}/result`),request)}
 if(path==='/api/federation/run/status'&&request.method==='GET'){
  const [{response,body},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]);if(!body||typeof body!=='object')return withCorsR116(response,request);return withCorsR116(json(enrichStatusR116(body,machine),response.status),request);
 }
 if(path==='/api/federation/route-intent'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),intent=text(body?.intent||body?.text).slice(0,4000),[{body:status},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]),plan=planIntentR103(intent,routingStatusR116(status||{},machine));
  return withCorsR116(json({...plan,runtimeRevision:REVISION,connectorRevision:CONNECTOR_REVISION,proofClosureRevision:R141_REVISION,durableExecutionRevision:R146_REVISION,executorFabricRevision:R147_REVISION,sovereignMissionRevision:R152_REVISION,machineAwareRouting:true,machineServices:{genesis:machine?.nodes?.genesis?.state||'UNKNOWN',optical:machine?.nodes?.optical?.state||'UNKNOWN'},truthBoundary:`${plan.truthBoundary} R116 treats live R115 machine adapters as execution readiness for their existing PROPOSE/SCREEN roles while preserving protected human-surface state separately.`},plan.ok?200:400),request);
 }
 if(path==='/api/system/convergence'&&request.method==='GET')return withCorsR116(json(await convergenceR116(request,env)),request);
 if(path==='/api/system/manifest'&&request.method==='GET')return withCorsR116(json({...manifestR130(),proofClosure:manifestR141(),durableExecution:manifestR146(),executorFabric:manifestR147(),adaptiveSovereignMission:manifestR152()},200,{'x-omega-control-plane':R130_REVISION}),request);
 if(path==='/api/system/operational'&&request.method==='GET')return withCorsR116(json(await operationalR130(request,env,probeFetchR130),200,{'x-omega-control-plane':R130_REVISION}),request);
 const response=await r115.fetch(request,env);return withCorsR116(response,request);
}

export class OmegaRuntime extends OmegaRuntimeR115 {
 async fetch(request){
  const url=new URL(request.url),path=url.pathname;
  if(path==='/missions'&&request.method==='POST'){
   const body=await request.clone().json().catch(()=>({})),response=await super.fetch(request);if(!response.ok||body?.draft?.schema!==R152_SOURCE_SCHEMA)return response;const data=await response.clone().json().catch(()=>({})),mission=await tagSovereignMissionR152(this,body,data?.mission);return json({...data,mission,adaptiveRevision:R152_REVISION,adaptiveSchema:R152_MISSION_SCHEMA},response.status);
  }
  if(path==='/missions'&&request.method==='GET'){
   const response=await super.fetch(request);if(!response.ok)return response;const data=await response.clone().json().catch(()=>({}));return json(await hydrateSovereignMissionsR152(this,data),response.status);
  }
  const missionControl=path.match(/^\/missions\/([A-Za-z0-9._:-]+)\/(pause|resume)$/);
  if(missionControl&&request.method==='POST'){
   const response=await super.fetch(request);if(!response.ok)return response;const data=await response.clone().json().catch(()=>({}));let mission=data?.mission;if(missionControl[2]==='resume'&&mission?.schema===R152_MISSION_SCHEMA)mission=await resumeSovereignMissionR152(this,mission);return json({...data,mission,adaptiveRevision:R152_REVISION},response.status);
  }
  if(path==='/agent/poll'&&request.method==='POST'){
   const response=await super.fetch(request);if(!response.ok)return response;const data=await response.clone().json().catch(()=>({})),job=data?.job;if(!job?.id)return response;let executionRun=null;try{executionRun=await syncHybridClaimR147(this,job)}catch{}return executionRun?json({...data,executionRun:{id:executionRun.id,state:executionRun.state,canonicalMutation:false}},response.status):response;
  }
  if(path==='/agent/result'&&request.method==='POST'){
   const body=await request.clone().json().catch(()=>({})),response=await super.fetch(request);if(!response.ok)return response;const data=await response.clone().json().catch(()=>({})),job=data?.job;if(!job?.returnPacket||!safeId(job.id))return response;
   const closure=await closeHybridReturnR141(this,job,body),proofClosure={schema:closure.schema,state:closure.state,fingerprintVerified:closure.fingerprint.verified,finalHeadSha256:closure.finalHeadSha256,continuity:closure.continuity,canonicalMutation:false};let executionRun=null;try{executionRun=await syncHybridReturnR147(this,job,closure)}catch{}let adaptiveMission=null;try{adaptiveMission=await advanceSovereignMissionR152(this,job)}catch(error){await this.event('R152_MISSION_ADVANCE_ERROR','Adaptive sovereign mission continuation failed closed.',{jobId:job.id,error:error instanceof Error?error.message:String(error)})}return json({...data,job:{...job,proofClosure},proofClosure:closure,executionRun:executionRun?{id:executionRun.id,state:executionRun.state,headSha256:executionRun.headSha256,canonicalMutation:false}:null,adaptiveMission:adaptiveMission?{id:adaptiveMission.id,status:adaptiveMission.status,stage:adaptiveMission.stage,cycle:adaptiveMission.cycle,currentJobId:adaptiveMission.currentJobId,projectPath:adaptiveMission.projectPath||'.',canonicalMutation:false}:null},response.status);
  }
  const closureRoute=path.match(/^\/jobs\/([A-Za-z0-9._:-]+)\/(closure|replay)$/);
  if(closureRoute){if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401);const id=closureRoute[1];if(closureRoute[2]==='closure'&&request.method==='GET'){const closure=await readHybridClosureR141(this,id);return closure?json({ok:true,closure}):json({ok:false,code:'R141_CLOSURE_NOT_FOUND'},404)}if(closureRoute[2]==='replay'&&request.method==='POST'){const receipt=await replayHybridClosureR141(this,id);return receipt?json({ok:receipt.ok,receipt},receipt.ok?200:409):json({ok:false,code:'R141_CLOSURE_NOT_FOUND'},404)}}
  if(path.startsWith('/execution/')){if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED',reply:'Durable execution history requires the authenticated OMEGA runtime bridge.'},401);
   if(path==='/execution/executors'&&request.method==='GET')return json({ok:true,...await executorDirectoryR147(this)});
   if(path==='/execution/runs'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await createRunR146(this,body);return json(result,result.status||200)}
   if(path==='/execution/runs'&&request.method==='GET'){const runs=await listRunsR146(this);return json({ok:true,schema:'OMEGA_EXECUTION_RUN_LIST_R146',runs,canonicalMutation:false,canonicalAdmissionAuthority:'R125'})}
   const executionRoute=path.match(/^\/execution\/runs\/([A-Za-z0-9._:-]+)(?:\/(transition|replay|dispatch|poll|result))?$/);if(executionRoute){const id=executionRoute[1],action=executionRoute[2]||'';if(!action&&request.method==='GET'){const run=await readRunR146(this,id);return run?json({ok:true,run}):json({ok:false,code:'R146_RUN_NOT_FOUND'},404)}if(action==='transition'&&request.method==='POST'){const body=await request.json().catch(()=>({})),result=await transitionRunR146(this,id,body);return json(result,result.status||200)}if(action==='replay'&&request.method==='POST'){const receipt=await replayRunR146(this,id);return receipt?json({ok:receipt.ok,receipt},receipt.ok?200:409):json({ok:false,code:'R146_RUN_NOT_FOUND'},404)}if(action==='dispatch'&&request.method==='POST'){const body=await request.json().catch(()=>({})),defaults={temperature:Number.isFinite(Number(body.temperature))?Number(body.temperature):.2,providerBudget:Number.isFinite(Number(body.providerBudget))?Number(body.providerBudget):4,...body},queueHybrid=async jobInput=>{const headers=new Headers(request.headers);headers.set('content-type','application/json');const response=await super.fetch(new Request('https://omega-runtime.internal/jobs',{method:'POST',headers,body:JSON.stringify(jobInput)})),data=await response.clone().json().catch(()=>({}));return{...data,ok:response.ok,status:response.status}};const result=await dispatchRunR147(this,id,defaults,{queueHybrid});return json(result,result.status||200)}if(action==='poll'&&request.method==='POST'){const result=await pollRunR147(this,id);return json(result,result.status||200)}if(action==='result'&&request.method==='GET'){const result=await readResultR147(this,id);return result?json({ok:true,...result}):json({ok:false,code:'R147_RUN_NOT_FOUND'},404)}}
  }
  return super.fetch(request);
 }
}
export default{async fetch(request,env){return fetchR116(request,env)}};