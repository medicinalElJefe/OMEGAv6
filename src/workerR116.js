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
import {appendLearningEventR331,communicationContextR331,createMemoryR331,R331_B12_PROGRESS_RECEIPT,R331_COGNITIVE_LEARNING_REVISION} from './cognitiveLearningR331.js';

export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator};

const REVISION='R116';
const CONNECTOR_REVISION='R117';
const CORE_HEALTH_REVISION='R163';
const CORE_HEALTH_SCHEMA='OMEGA_CANONICAL_CORE_HEALTH_R163';
const CANONICAL_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION,'x-omega-connector-revision':CONNECTOR_REVISION,'x-omega-proof-closure':R141_REVISION,'x-omega-durable-execution':R146_REVISION,'x-omega-executor-fabric':R147_REVISION,'x-omega-sovereign-mission':R152_REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=v=>String(v??'').trim();
const safeId=(v,fallback='')=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
function coreHealthR163(request,env){
 const requiredBindings={assets:Boolean(env?.ASSETS?.fetch),durableRuntime:Boolean(env?.OMEGA_RUNTIME)},ready=requiredBindings.assets&&requiredBindings.durableRuntime,metadata=env?.CF_VERSION_METADATA||null,host=new URL(request.url).hostname.toLowerCase(),canonicalRequest=host==='omegav6.jeffdeweyeljefe.workers.dev';
 const payload={
  ok:ready,schema:CORE_HEALTH_SCHEMA,revision:CORE_HEALTH_REVISION,state:ready?'LIVE':'DEGRADED_REQUIRED_CORE_BINDING_MISSING',checkedAt:new Date().toISOString(),canonicalOrigin:CANONICAL_ORIGIN,canonicalRequest,
  runtimeVersion:metadata?{id:String(metadata.id||''),tag:metadata.tag?String(metadata.tag):null,timestamp:metadata.timestamp?String(metadata.timestamp):null}:null,
  requiredBindings,
  optionalCapabilities:{workersAI:Boolean(env?.AI),genesisService:Boolean(env?.OMEGA_GENESIS?.fetch),genesisMachine:Boolean(env?.OMEGA_GENESIS_MACHINE?.fetch),opticalMachine:Boolean(env?.OMEGA_OPTICAL_MACHINE?.fetch),versionMetadata:Boolean(metadata)},
  executionPlanes:{sovereignGateway:{requiredForCoreHealth:false,state:'SEPARATE_PROOF_GATED_EXECUTION_PLANE'},hybrid:{authority:'CURRENT_AUTHENTICATED_HEARTBEAT_ONLY',proofClosure:'R141',executionConvergence:'R159'},canonicalAdmission:{authority:'R125'}},
  evidence:{releaseEvidence:'/api/release-evidence',runtimeAttestation:'/api/runtime-attestation',systemOperational:'/api/system/operational'},
  preserves:{runtimeSpine:'R116',connector:'R117',proofClosure:'R141',durableExecution:'R146',executorFabric:'R147',sovereignMission:'R152',executionConvergence:'R159',canonicalAdmission:'R125'},
  truthBoundary:'R163 core health is first-hand liveness for the canonical Cloudflare Worker substrate only. Optional model, federation, Hybrid/Sovereign, RCWA and external gateway readiness remain separate evidence states. A missing optional execution plane cannot erase core Worker liveness, and core liveness cannot be promoted into PC-online, solver-valid, returned-execution, federation-closure or CanonState proof.'
 };
 return json(payload,ready?200:503,{'x-omega-core-health':'R163-FIRST-HAND','x-omega-canonical-origin':CANONICAL_ORIGIN,'x-omega-core-health-state':payload.state});
}
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
  'access-control-expose-headers':'x-omega-runtime-successor,x-omega-connector-revision,x-omega-proof-closure,x-omega-durable-execution,x-omega-executor-fabric,x-omega-sovereign-mission,x-omega-control-plane,x-omega-agent-version,x-omega-agent-sha256,x-omega-canonical-origin,x-omega-core-health,x-omega-core-health-state,x-omega-rcwa-agent-sha256,x-omega-rcwa-worker-sha256',
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
  connectorPolicy:{canonicalOrigin:CANONICAL_ORIGIN,currentRevision:CONNECTOR_REVISION,runtimeRevision:REVISION,proofClosureRevision:R141_REVISION,retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',retiredLaunchersMustNotBeUsed:true,reason:'The retired preview host can return 401 and is not the canonical Hybrid authority.'},
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
 const pairHeaders=new Headers({'content-type':'application/json','x-omega-session-id':sid});
 const currentSecret=text(request.headers.get('x-omega-bridge-secret'));
 if(currentSecret)pairHeaders.set('x-omega-bridge-secret',currentSecret);
 const pairResponse=await stub.fetch(new Request('https://omega-runtime.internal/pair',{method:'POST',headers:pairHeaders,body:JSON.stringify({rotate:true})}));
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
  canonicalOrigin:CANONICAL_ORIGIN,
  retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',
  agentPath:'/api/hybrid/agent-download?r117=1',
  rcwaAgentPath:'/api/federation/rcwa/agent-download?r117=1',
  agentRestartRequired:true,
  nativeExecutionClaimed:false,
  truthBoundary:'This endpoint mints the first bridge credential for an unpaired canonical browser session or rotates an existing credential only when that session proves its current bridge secret. Cross-session or stale credentials cannot seize pairing authority. PC ONLINE remains false until a real authenticated host heartbeat arrives.'
 });
}

async function serveProofAgentR141(request,env){
 if(!env?.ASSETS?.fetch)return json({ok:false,code:'R141_PROOF_AGENT_ASSET_BINDING_UNAVAILABLE'},503);
 const asset=await env.ASSETS.fetch(new Request(new URL('/omega-hybrid-agent-r141.py',request.url),{headers:{'cache-control':'no-cache'}}));if(!asset.ok)return json({ok:false,code:'R141_PROOF_AGENT_ASSET_NOT_FOUND',status:asset.status},503);
 const source=await asset.text(),valid=source.length>1000&&source.startsWith('#!/usr/bin/env python3')&&source.includes("PROOF_CLOSURE_REVISION='R141'")&&source.includes("FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'")&&source.includes("BASE_PATH='/omega-hybrid-agent.py'")&&source.includes('OMEGA R34 local Hybrid Link agent')&&source.includes('Pairing is explicit.');if(!valid)return json({ok:false,code:'R141_PROOF_AGENT_ASSET_INVALID'},503);
 const digest=await sha256TextR141(source);return new Response(source,{status:200,headers:{'content-type':'text/x-python; charset=utf-8','content-disposition':'attachment; filename="omega-hybrid-agent-r141.py"','cache-control':'no-store, max-age=0','x-omega-agent-version':'R141-wrapper','x-omega-agent-sha256':digest,'x-omega-proof-closure':R141_REVISION,'x-omega-canonical-origin':CANONICAL_ORIGIN}});
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
 if(path==='/api/health'||path==='/api/core-health')return coreHealthR163(request,env);
 if(path.startsWith('/api/swarm/'))return withSwarmCorsR121(await swarmApiR121(request,env,url),request);
 if(path==='/api/system/convergence')return json(await convergenceR116(request,env));
 if(path==='/api/federation/run/status'){
  const [{response,body},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]);if(!body||typeof body!=='object')return response;return json(enrichStatusR116(body,machine),response.status);
 }
 return r115.fetch(request,env);
}


function cognitionSessionIdR331(request){return safeId(request.headers.get('x-omega-session-id'),'')}
function cognitionStubR331(env,sessionId){return env.OMEGA_RUNTIME.get(env.OMEGA_RUNTIME.idFromName(sessionId))}
async function cognitionInternalR331(env,sessionId,path,body,method='POST'){
 if(!env?.OMEGA_RUNTIME||!sessionId)return null;
 const headers=new Headers({'content-type':'application/json','x-omega-internal-cognition':'R331'});
 return cognitionStubR331(env,sessionId).fetch(new Request('https://omega-runtime.internal'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}));
}
async function cognitiveChatR331(request,env){
 const body=await request.clone().json().catch(()=>({})),sessionId=cognitionSessionIdR331(request),userText=text(body?.text||body?.message).slice(0,16384);
 if(!sessionId||!env?.OMEGA_RUNTIME)return r115.fetch(request,env);
 const contextResponse=await cognitionInternalR331(env,sessionId,'/cognition/context',{query:userText,runtimeContext:body?.context||{}}),memoryContext=contextResponse?await contextResponse.clone().json().catch(()=>null):null;
 const enrichedContext={...(body?.context&&typeof body.context==='object'?body.context:{}),cognitiveLearningR331:memoryContext?.context||null};
 const headers=new Headers(request.headers);headers.set('content-type','application/json');
 const inherited=await r115.fetch(new Request(request.url,{method:'POST',headers,body:JSON.stringify({...body,text:userText,context:enrichedContext})}),env),data=await inherited.clone().json().catch(()=>null);
 if(!data||typeof data!=='object')return inherited;
 const recordResponse=await cognitionInternalR331(env,sessionId,'/cognition/record',{userText,assistantReply:text(data.reply).slice(0,12000),provider:text(data.provider),evidenceStatus:text(data.evidenceStatus),routing:data.routing||null,runtimeContext:body?.context||{}}),receipt=recordResponse?await recordResponse.clone().json().catch(()=>null):null;
 return json({...data,learning:{revision:R331_COGNITIVE_LEARNING_REVISION,persisted:Boolean(receipt?.ok),memoryCount:receipt?.memoryCount??memoryContext?.summary?.memoryCount??0,eventCount:receipt?.eventCount??memoryContext?.summary?.eventCount??0,coherence:receipt?.coherence??memoryContext?.context?.coherence??null,foundationWeightsChanged:false,canonicalAdmission:false}},inherited.status);
}

async function fetchR116(request,env){
 const url=new URL(request.url),path=url.pathname,corsPath=path.startsWith('/api/hybrid/')||path.startsWith('/api/federation/')||path.startsWith('/api/execution/')||path==='/api/health'||path==='/api/core-health'||path==='/api/system/convergence'||path==='/api/system/manifest'||path==='/api/system/operational';
 if(request.method==='OPTIONS'&&corsPath)return preflightR116(request);
 if(path==='/api/chat'&&request.method==='POST')return withCorsR116(await cognitiveChatR331(request,env),request);
 if(path==='/api/cognition/state'&&request.method==='GET'){
  const sessionId=cognitionSessionIdR331(request);if(!sessionId)return withCorsR116(json({ok:false,code:'R331_SESSION_REQUIRED'},400),request);const response=await cognitionInternalR331(env,sessionId,'/cognition/state',undefined,'GET');return withCorsR116(response||json({ok:false,code:'R331_RUNTIME_UNAVAILABLE'},503),request);
 }
 if(path==='/api/cognition/feedback'&&request.method==='POST'){
  const sessionId=cognitionSessionIdR331(request);if(!sessionId)return withCorsR116(json({ok:false,code:'R331_SESSION_REQUIRED'},400),request);const body=await request.clone().json().catch(()=>({})),response=await cognitionInternalR331(env,sessionId,'/cognition/feedback',body);return withCorsR116(response||json({ok:false,code:'R331_RUNTIME_UNAVAILABLE'},503),request);
 }
 if((path==='/api/health'||path==='/api/core-health')&&request.method==='GET')return withCorsR116(coreHealthR163(request,env),request);
 if((path==='/api/health'||path==='/api/core-health')&&request.method!=='GET')return withCorsR116(json({ok:false,schema:CORE_HEALTH_SCHEMA,revision:CORE_HEALTH_REVISION,state:'METHOD_NOT_ALLOWED',method:request.method,canonicalMutation:false,truthBoundary:'R163 canonical core-health endpoints are read-only.'},405,{allow:'GET','x-omega-core-health':'R163-FIRST-HAND'}),request);
 if(path.startsWith('/api/swarm/'))return withSwarmCorsR121(await swarmApiR121(request,env,url),request);
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
 if(path==='/api/system/manifest'&&request.method==='GET')return withCorsR116(json({...manifestR130(),proofClosure:manifestR141(),durableExecution:manifestR146(),executorFabric:manifestR147(),adaptiveSovereignMission:manifestR152(),coreHealth:{revision:CORE_HEALTH_REVISION,schema:CORE_HEALTH_SCHEMA,path:'/api/core-health'}},200,{'x-omega-control-plane':R130_REVISION}),request);
 if(path==='/api/system/operational'&&request.method==='GET')return withCorsR116(json(await operationalR130(request,env,probeFetchR130),200,{'x-omega-control-plane':R130_REVISION}),request);
 const response=await r115.fetch(request,env);return withCorsR116(response,request);
}

export class OmegaRuntime extends OmegaRuntimeR115 {
 async fetch(request){
  const url=new URL(request.url),path=url.pathname;
  if(path.startsWith('/cognition/')){
   if(request.headers.get('x-omega-internal-cognition')!=='R331')return json({ok:false,code:'R331_INTERNAL_ONLY'},403);
   if(path==='/cognition/context'&&request.method==='POST'){
    const body=await request.json().catch(()=>({})),memories=await this.get('cognitionMemoriesR331',[]),ledger=await this.get('cognitionLedgerR331',[]),context=communicationContextR331({memories,ledger,query:text(body?.query).slice(0,16384),runtimeContext:body?.runtimeContext||{}});
    return json({ok:true,revision:R331_COGNITIVE_LEARNING_REVISION,context,summary:{memoryCount:memories.length,eventCount:ledger.length,lastEventHash:ledger.at(-1)?.eventHash||null},canonicalAdmission:false});
   }
   if(path==='/cognition/record'&&request.method==='POST'){
    const body=await request.json().catch(()=>({})),timestamp=Date.now();let memories=await this.get('cognitionMemoriesR331',[]),ledger=await this.get('cognitionLedgerR331',[]);
    const episode=await createMemoryR331({kind:'EPISODIC',content:`User: ${text(body?.userText).slice(0,1800)}\nOMEGA: ${text(body?.assistantReply).slice(0,2200)}`,source:text(body?.provider)||'MODEL_SYNTHESIS',writer:'OMEGA_CHAT_R331',scope:'SESSION',confidence:body?.evidenceStatus==='VERIFIED_RUNTIME'?.78:.52,evidenceClass:body?.evidenceStatus==='VERIFIED_RUNTIME'?'SOURCE_BOUND':'MODEL_SYNTHESIS',stateVersion:text(body?.runtimeContext?.stateVersion||body?.runtimeContext?.stateId)||null,timestamp});
    memories=[...memories,episode].slice(-256);
    ledger=await appendLearningEventR331(ledger,{type:'TURN',timestamp,payload:{userText:text(body?.userText).slice(0,4000),assistantReply:text(body?.assistantReply).slice(0,6000),provider:text(body?.provider),evidenceStatus:text(body?.evidenceStatus),routing:body?.routing||null,memoryId:episode.id}});
    await this.put('cognitionMemoriesR331',memories);await this.put('cognitionLedgerR331',ledger);const context=communicationContextR331({memories,ledger,query:text(body?.userText),runtimeContext:body?.runtimeContext||{}});
    return json({ok:true,revision:R331_COGNITIVE_LEARNING_REVISION,memoryId:episode.id,memoryCount:memories.length,eventCount:ledger.length,lastEventHash:ledger.at(-1)?.eventHash||null,coherence:context.coherence,foundationWeightsChanged:false,canonicalAdmission:false});
   }
   if(path==='/cognition/feedback'&&request.method==='POST'){
    const body=await request.json().catch(()=>({})),signal=['HELPFUL','CORRECTED','REJECTED'].includes(text(body?.signal).toUpperCase())?text(body.signal).toUpperCase():'HELPFUL',correction=text(body?.correction).slice(0,4000),kind=text(body?.kind).toUpperCase()==='PROCEDURAL'?'PROCEDURAL':'SEMANTIC';let memories=await this.get('cognitionMemoriesR331',[]),ledger=await this.get('cognitionLedgerR331',[]),promoted=null;
    if(signal==='CORRECTED'&&correction){promoted=await createMemoryR331({kind,content:correction,source:'USER_FEEDBACK',writer:'USER_CONFIRMED_R331',scope:'SESSION',confidence:.98,evidenceClass:'USER_CONFIRMED',stateVersion:text(body?.stateVersion)||null,supersedes:text(body?.supersedes)||null});memories=[...memories,promoted].slice(-256);await this.put('cognitionMemoriesR331',memories)}
    ledger=await appendLearningEventR331(ledger,{type:'FEEDBACK',payload:{signal,correction:correction||null,promotedMemoryId:promoted?.id||null,kind:promoted?.kind||null}});await this.put('cognitionLedgerR331',ledger);
    return json({ok:true,revision:R331_COGNITIVE_LEARNING_REVISION,signal,promotedMemory:promoted?{id:promoted.id,kind:promoted.kind,evidenceClass:promoted.evidenceClass}:null,memoryCount:memories.length,eventCount:ledger.length,foundationWeightsChanged:false,canonicalAdmission:false});
   }
   if(path==='/cognition/state'&&request.method==='GET'){
    const memories=await this.get('cognitionMemoriesR331',[]),ledger=await this.get('cognitionLedgerR331',[]),counts=Object.fromEntries(['WORKING','EPISODIC','SEMANTIC','PROCEDURAL'].map(kind=>[kind,memories.filter(x=>x?.kind===kind&&x?.status==='ACTIVE').length]));
    return json({ok:true,revision:R331_COGNITIVE_LEARNING_REVISION,receipt:R331_B12_PROGRESS_RECEIPT,memoryCount:memories.length,eventCount:ledger.length,counts,lastEventHash:ledger.at(-1)?.eventHash||null,foundationWeightsChanged:false,canonicalAdmission:false});
   }
   return json({ok:false,code:'R331_COGNITION_ROUTE_NOT_FOUND'},404);
  }
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