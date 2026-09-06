import r115,{OmegaRuntime as OmegaRuntimeR115} from './workerR115.js';
import {WORKERS_AI_MODEL} from './worker.js';
import {planIntentR103} from './federation/federationIntentRouterR103.js';
import {swarmApiR121,withSwarmCorsR121} from './swarm/swarmApiR121.js';
import {OmegaSwarmCell} from './swarm/swarmCellR121.js';
import {OmegaSwarmCoordinator} from './swarm/swarmCoordinatorR121.js';
import {OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator} from './swarm/swarmOrganismR123.js';
import {OmegaSwarmAutonomicCoordinator} from './swarm/swarmAutonomicR125.js';
import {manifestR130,operationalR130,R130_REVISION} from './system/operationalControlPlaneR130.js';
import {R135_REVISION,R135_LAWS,nextRepairPhaseR135,evidenceStepsR135,repairContextR135,validateRepairCandidateR135,verificationStepsR135} from './hybridRepairLoopR135.js';

export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator};

const REVISION='R116';
const CONNECTOR_REVISION='R117';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-runtime-successor':REVISION,'x-omega-connector-revision':CONNECTOR_REVISION};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,...headers}});
const text=v=>String(v??'').trim();
const safeId=(v,fallback='')=>{const s=text(v).slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const now=()=>Date.now();
const randomToken=(bytes=4)=>{const a=new Uint8Array(bytes);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')};
const approvedHosts=new Set([
 'omegav6.jeffdeweyeljefe.workers.dev',
 'omega-genesis-v1.jeffdeweyeljefe.workers.dev',
 'omega-living-light-etching-private-woven2.vercel.app',
 'omega-optical-cloud-woven2.vercel.app'
]);

function modelText(result){if(!result)return'';if(typeof result==='string')return result;if(typeof result.response==='string')return result.response;if(typeof result.result?.response==='string')return result.result.response;const c=result.choices?.[0]?.message?.content;if(typeof c==='string')return c;if(Array.isArray(c))return c.map(x=>typeof x==='string'?x:(x?.text||'')).join('\n').trim();return''}
function parseJsonObject(raw){const s=String(raw||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<=a)return null;try{return JSON.parse(s.slice(a,b+1))}catch{return null}}
function allowedByMissionR135(mission,steps,device){const missionOps=new Set(Array.isArray(mission?.allowedOps)?mission.allowedOps:[]),caps=new Set(Array.isArray(device?.capabilities)?device.capabilities:[]);const missingMission=[...new Set(steps.map(x=>x.op).filter(x=>!missionOps.has(x)))],missingHost=[...new Set(steps.map(x=>x.op).filter(x=>!caps.has(x)))];return{ok:!missingMission.length&&!missingHost.length,missingMission,missingHost}}
async function synthesizePatchR135(env,context){if(!env?.AI||!context)return null;const system=`You are the bounded OMEGA R135 repair proposer. Return ONE JSON object only: {"path":"...","expectedSha256":"...","replacements":[{"find":"exact existing text","replace":"replacement text","occurrences":1}]}. Use only the supplied file and preimage hash. Do not invent another path, shell command, dependency install, credential, binary edit, or broad rewrite. Prefer the smallest exact textual delta that directly addresses the supplied failure. One to twelve replacements maximum.`;try{const result=await env.AI.run(WORKERS_AI_MODEL,{messages:[{role:'system',content:system},{role:'user',content:`PATH\n${context.path}\nSHA256\n${context.expectedSha256}\nFAILURE\n${context.failure}\nSOURCE\n${context.source}`}],max_tokens:1800,temperature:.08,chat_template_kwargs:{enable_thinking:false}});return parseJsonObject(modelText(result))}catch{return null}}
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
  'access-control-expose-headers':'x-omega-runtime-successor,x-omega-connector-revision,x-omega-control-plane,x-omega-agent-version,x-omega-agent-sha256,x-omega-canonical-origin,x-omega-rcwa-agent-sha256,x-omega-rcwa-worker-sha256',
  'access-control-max-age':'600'
 };
}
function withCorsR116(response,request){
 const headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);headers.set('x-omega-connector-revision',CONNECTOR_REVISION);const cors=corsHeadersR116(request);if(cors)for(const[k,v]of Object.entries(cors))headers.set(k,v);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function preflightR116(request){const headers=corsHeadersR116(request);return headers?new Response(null,{status:204,headers:{...headers,'x-omega-runtime-successor':REVISION,'x-omega-connector-revision':CONNECTOR_REVISION}}):new Response(null,{status:403,headers:{'x-omega-runtime-successor':REVISION,'x-omega-connector-revision':CONNECTOR_REVISION}})}
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
 return{...status,runtimeRevision:REVISION,connectorRevision:CONNECTOR_REVISION,machineServices:{schema:machine?.schema||'OMEGA_FEDERATION_MACHINE_STATUS_R115',canonicalAuthority:'omega-v6',genesis:services.genesis||null,optical:services.optical||null,truthBoundary:'Machine service readiness is execution transport truth for PROPOSE/SCREEN. Human surface reachability remains separately visible and does not become CanonState authority.'},executionReadiness:{genesis:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN',optical:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN',sovereign:nodes.sovereign?.state||'UNKNOWN',omegaV6:nodes.omegaV6?.state||'UNKNOWN'}};
}
async function convergenceR116(request,env){
 const [{body:status},machine,hybridResponse]=await Promise.all([
  inheritedStatusR116(request,env),
  machineStatusR116(request,env),
  r115.fetch(new Request(new URL('/api/hybrid/status',request.url),{method:'GET',headers:request.headers}),env)
 ]),hybrid=await readJsonResponse(hybridResponse),nodes=status?.nodes||{},services=machine?.nodes||{};
 const currentHeartbeat=Boolean(hybrid?.nativeExecutionClaimed===true&&Array.isArray(hybrid?.devices)&&hybrid.devices.some(d=>d?.online&&!d?.revoked));
 return{
  ok:Boolean(status&&machine),schema:'OMEGA_SYSTEM_CONVERGENCE_R116',runtimeRevision:REVISION,connectorRevision:CONNECTOR_REVISION,canonicalAuthority:'omega-v6',
  canonical:{state:nodes.omegaV6?.state||'UNKNOWN'},
  proposal:{surfaceState:nodes.genesis?.state||'UNKNOWN',machineState:services.genesis?.state||'UNKNOWN',effectiveState:services.genesis?.state==='LIVE'?'LIVE':nodes.genesis?.state||'UNKNOWN'},
  optical:{surfaceState:nodes.optical?.state||'UNKNOWN',machineState:services.optical?.state||'UNKNOWN',effectiveScreenState:services.optical?.state==='LIVE'?'LIVE':nodes.optical?.state||'UNKNOWN'},
  sovereign:{state:nodes.sovereign?.state||'UNKNOWN',rcwaState:nodes.sovereign?.rcwaState||status?.runtime?.rcwa?.state||'UNKNOWN',currentAuthenticatedHeartbeat:currentHeartbeat,nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true},
  connectorPolicy:{canonicalOrigin:'https://omegav6.jeffdeweyeljefe.workers.dev',currentRevision:CONNECTOR_REVISION,runtimeRevision:REVISION,retiredOrigin:'omega-sovereign-convergence.foundasound.chatgpt.site',retiredLaunchersMustNotBeUsed:true,reason:'The retired preview host can return 401 and is not the canonical Hybrid authority.'},
  truthBoundary:'Surface availability, machine-service availability, browser pairing, current host heartbeat, solver freshness, and canonical admission are distinct states. R116 with the R117 connector repair never promotes one into another.'
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
 const url=new URL(request.url),path=url.pathname,corsPath=path.startsWith('/api/hybrid/')||path.startsWith('/api/federation/')||path==='/api/system/convergence'||path==='/api/system/manifest'||path==='/api/system/operational';
 if(path.startsWith('/api/swarm/'))return withSwarmCorsR121(await swarmApiR121(request,env,url),request);
 if(request.method==='OPTIONS'&&corsPath)return preflightR116(request);
 if(path==='/api/hybrid/bootstrap'&&request.method==='POST')return withCorsR116(await durablePairR117(request,env),request);
 if(path==='/api/hybrid/repair-controller'&&request.method==='GET')return withCorsR116(json({ok:true,schema:'OMEGA_HYBRID_REPAIR_CONTROLLER_R135',revision:R135_REVISION,laws:R135_LAWS,mode:'PROOF_DRIVEN_BOUNDED_AUTOREPAIR',truthBoundary:'R135 may continue an explicitly approved mission only from returned host evidence. It cannot escape the mission envelope, exceed the cycle cap, bypass preimage hashes, or convert AI proposals into canonical truth.'}),request);
 if(path==='/api/federation/run/status'&&request.method==='GET'){
  const [{response,body},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]);if(!body||typeof body!=='object')return withCorsR116(response,request);return withCorsR116(json(enrichStatusR116(body,machine),response.status),request);
 }
 if(path==='/api/federation/route-intent'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),intent=text(body?.intent||body?.text).slice(0,4000),[{body:status},machine]=await Promise.all([inheritedStatusR116(request,env),machineStatusR116(request,env)]),plan=planIntentR103(intent,routingStatusR116(status||{},machine));
  return withCorsR116(json({...plan,runtimeRevision:REVISION,connectorRevision:CONNECTOR_REVISION,machineAwareRouting:true,machineServices:{genesis:machine?.nodes?.genesis?.state||'UNKNOWN',optical:machine?.nodes?.optical?.state||'UNKNOWN'},truthBoundary:`${plan.truthBoundary} R116 treats live R115 machine adapters as execution readiness for their existing PROPOSE/SCREEN roles while preserving protected human-surface state separately.`},plan.ok?200:400),request);
 }
 if(path==='/api/system/convergence'&&request.method==='GET')return withCorsR116(json(await convergenceR116(request,env)),request);
 if(path==='/api/system/manifest'&&request.method==='GET')return withCorsR116(json(manifestR130(),200,{'x-omega-control-plane':R130_REVISION}),request);
 if(path==='/api/system/operational'&&request.method==='GET')return withCorsR116(json(await operationalR130(request,env,probeFetchR130),200,{'x-omega-control-plane':R130_REVISION}),request);
 const response=await r115.fetch(request,env);return corsPath?withCorsR116(response,request):withCorsR116(response,request);
}

export class OmegaRuntime extends OmegaRuntimeR115{
 async fetch(request){const url=new URL(request.url);if(url.pathname==='/agent/result'&&request.method==='POST'){const copy=request.clone(),body=await copy.json().catch(()=>({})),response=await super.fetch(request);if(response.ok){const data=await response.clone().json().catch(()=>null);try{await this.advanceMissionR135(body,data?.job)}catch(e){try{await this.event('R135_REPAIR_CONTROLLER_ERROR','R135 could not advance the bounded repair controller.',{jobId:body?.jobId,error:String(e).slice(0,1200)})}catch{}}}return response}return super.fetch(request)}
 async holdMissionR135(mission,reason,data={}){let missions=await this.ctx.storage.get('missions')||[];const held={...mission,status:'HELD',holdReason:reason,updatedAt:now(),repairController:R135_REVISION};missions=missions.map(x=>x.id===mission.id?held:x);await this.ctx.storage.put('missions',missions.slice(-40));await this.event('R135_MISSION_HELD',`Mission ${mission.id} held by bounded repair controller.`,{missionId:mission.id,reason,...data});return held}
 async completeMissionR135(mission,job){let missions=await this.ctx.storage.get('missions')||[];const done={...mission,status:'COMPLETE',completedAt:now(),updatedAt:now(),lastProofFingerprint:job?.returnPacket?.resultFingerprint||null,repairController:R135_REVISION};missions=missions.map(x=>x.id===mission.id?done:x);await this.ctx.storage.put('missions',missions.slice(-40));await this.event('R135_MISSION_COMPLETE',`Mission ${mission.id} completed with returned host proof.`,{missionId:mission.id,jobId:job?.id,resultFingerprint:done.lastProofFingerprint});return done}
 async advanceMissionR135(body,returnedJob){if(!returnedJob?.id)return;let missions=await this.ctx.storage.get('missions')||[],jobs=await this.ctx.storage.get('jobs')||[],mission=missions.find(x=>x?.status==='ACTIVE'&&x?.currentJobId===returnedJob.id);if(!mission)return;if(returnedJob.status==='COMPLETE'){await this.completeMissionR135(mission,returnedJob);return}if(returnedJob.status!=='FAILED')return;const cycle=Number(mission.cycle||1),maxCycles=Math.max(2,Math.min(8,Number(mission.maxCycles||4)));if(cycle>=maxCycles){await this.holdMissionR135(mission,'MAX_CYCLES_REACHED',{cycle,maxCycles});return}const devices=await this.devices(),device=devices.find(x=>x.id===mission.targetDeviceId&&x.online&&!x.revoked);if(!device){await this.holdMissionR135(mission,'HOST_NOT_CURRENTLY_PROVING_ONLINE');return}let steps=evidenceStepsR135(returnedJob),phase=nextRepairPhaseR135(returnedJob);if(phase.kind==='PROPOSE_PATCH'){const context=repairContextR135(returnedJob);if(!context){await this.holdMissionR135(mission,'READ_PROOF_INSUFFICIENT_FOR_HASH_BOUND_PATCH');return}const candidate=await synthesizePatchR135(this.env,context),validated=validateRepairCandidateR135(candidate,context);if(!validated.ok){await this.holdMissionR135(mission,'NO_SAFE_EXACT_REPLACEMENT_PROPOSED',{validation:validated.error});return}steps=[validated.step,...verificationStepsR135(returnedJob.projectPath||mission.currentJob?.projectPath||'.',returnedJob.profile||mission.currentJob?.profile||'AUTO_BUILD')]}if(!steps.length){await this.holdMissionR135(mission,phase.reason||'NO_BOUNDED_NEXT_REPAIR_PHASE');return}const allowed=allowedByMissionR135(mission,steps,device);if(!allowed.ok){await this.holdMissionR135(mission,'MISSION_OR_HOST_CAPABILITY_ENVELOPE_REJECTED',allowed);return}const nextJob={id:'job_'+now().toString(36)+'_'+randomToken(4),schema:'OMEGA_HYBRID_REPAIR_JOB_R135',action:'MISSION_REPAIR_CYCLE',profile:returnedJob.profile||mission.currentJob?.profile||'AUTO_BUILD',projectPath:returnedJob.projectPath||mission.currentJob?.projectPath||'.',instructions:`R135 bounded repair continuation for ${mission.id}`,allowedDomains:returnedJob.allowedDomains||mission.currentJob?.allowedDomains||[],steps,targetDeviceId:mission.targetDeviceId,targetCapabilityRevision:device.capabilityRevision||'LEGACY',status:'QUEUED',confirmed:true,queuedAt:now(),previousJobId:returnedJob.id,repairPhase:phase.kind,repairController:R135_REVISION};jobs.push(nextJob);const lineage=[...(mission.repairLineage||[]),{cycle,jobId:returnedJob.id,status:returnedJob.status,resultFingerprint:returnedJob?.returnPacket?.resultFingerprint||null,nextPhase:phase.kind,nextJobId:nextJob.id}].slice(-16),nextMission={...mission,cycle:cycle+1,currentJobId:nextJob.id,currentJob:nextJob,updatedAt:now(),repairController:R135_REVISION,repairLineage:lineage};missions=missions.map(x=>x.id===mission.id?nextMission:x);await Promise.all([this.ctx.storage.put('jobs',jobs.slice(-120)),this.ctx.storage.put('missions',missions.slice(-40))]);await this.event('R135_REPAIR_CYCLE_QUEUED',`Mission ${mission.id} advanced from returned host failure into ${phase.kind}.`,{missionId:mission.id,previousJobId:returnedJob.id,nextJobId:nextJob.id,cycle:cycle+1,maxCycles,phase:phase.kind,capabilityRevision:device.capabilityRevision||'LEGACY'})}
}
export default{async fetch(request,env){return fetchR116(request,env)}};
