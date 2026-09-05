import {planIntentR103} from './federationIntentRouterR103.js';

const text=v=>String(v??'').trim();
const upper=v=>text(v).toUpperCase();
const finite=v=>Number.isFinite(Number(v))?Number(v):null;
const authorityOrder=['omega-genesis','omega-optical','omega-sovereign','omega-v6'];
const roleById={
 'omega-genesis':{verb:'PROPOSE',role:'proposal / exploration worker',globalAuthority:false},
 'omega-optical':{verb:'SCREEN',role:'optical compile / screening worker',globalAuthority:false},
 'omega-sovereign':{verb:'SOLVE',role:'authenticated high-compute worker family',globalAuthority:false},
 'omega-v6':{verb:'ADMIT',role:'global CanonState / proof admission authority',globalAuthority:true}
};

function nodeReady(id,state){const s=upper(state);return id==='omega-sovereign'?s==='PC_ONLINE'||s==='LIVE':s==='LIVE'}
function truthClass(id,state){const s=upper(state);if(id==='omega-sovereign')return s==='PC_ONLINE'?'CURRENT_AUTHENTICATED_HEARTBEAT':'CURRENT_TRANSPORT_OBSERVATION';if(s==='LIVE')return'CURRENT_SERVICE_PROBE';if(s==='ACCESS_GATED')return'CURRENT_ACCESS_GATE';return'CURRENT_SERVICE_OBSERVATION'}
function sourceNode(status,id){const n=status?.nodes||{};if(id==='omega-genesis')return n.genesis||{};if(id==='omega-optical')return n.optical||{};if(id==='omega-sovereign')return n.sovereign||{};return n.omegaV6||{} }

export function authorityNodesR111(status={}){
 return authorityOrder.map((id,index)=>{const raw=sourceNode(status,id),role=roleById[id],state=text(raw?.state||'UNKNOWN')||'UNKNOWN';return{
  order:index+1,id,verb:role.verb,role:role.role,globalAuthority:role.globalAuthority,state,ready:nodeReady(id,state),truthClass:truthClass(id,state),
  latencyMs:finite(raw?.latencyMs),httpStatus:finite(raw?.httpStatus),resolvedUrl:text(raw?.resolvedUrl||raw?.url)||null,
  rcwaState:id==='omega-sovereign'?text(raw?.rcwaState||status?.runtime?.rcwa?.state)||null:null
 }})
}

export function serviceCapabilitiesR111({status={},hybrid={},env={}}={}){
 const sovereign=sourceNode(status,'omega-sovereign'),rcwa=text(sovereign?.rcwaState||status?.runtime?.rcwa?.state||'UNKNOWN')||'UNKNOWN';
 const hybridState=text(hybrid?.state||sovereign?.state||'DEVICE_PROOF_REQUIRED')||'DEVICE_PROOF_REQUIRED';
 const hybridOnline=upper(hybridState)==='VERIFIED_DEVICE_ONLINE'||upper(sovereign?.state)==='PC_ONLINE';
 return[
  {id:'hybrid-transport',family:'transport',state:hybridOnline?'LIVE':'DEVICE_PROOF_REQUIRED',ready:hybridOnline,truthClass:hybridOnline?'CURRENT_AUTHENTICATED_HEARTBEAT':'CURRENT_TRANSPORT_OBSERVATION',detail:hybridOnline?'Authenticated native host heartbeat is current.':'Browser/cloud transport is available; native execution remains held until a fresh authenticated heartbeat.'},
  {id:'rcwa',family:'solver',state:rcwa,ready:upper(rcwa)==='RCWA_ONLINE'||upper(rcwa)==='LIVE',truthClass:'CURRENT_SOLVER_OBSERVATION',detail:'RCWA is a Sovereign Compute worker, not a fifth federation authority.'},
  {id:'workers-ai',family:'intelligence',state:env?.AI?'BOUND':'NOT_BOUND',ready:Boolean(env?.AI),truthClass:'BINDING_PRESENT_NOT_EXECUTION',detail:'A binding reports configured access only. LIVE synthesis still requires an executed request receipt.'},
  {id:'earth-evidence',family:'observation',state:'ENDPOINT_AVAILABLE',ready:true,truthClass:'CAPABILITY_CONTRACT_NOT_EXTERNAL_SOURCE_HEALTH',detail:'Earth evidence endpoints remain available; each external source keeps its own returned/unavailable truth state.'},
  {id:'route-deferred-specialists',family:'presentation',state:'R110_ADAPTIVE',ready:true,truthClass:'MODULE_BYTE_POLICY',detail:'Specialist code is route-deferred and runtime-aware. Module readiness is not capability execution.'}
 ]
}

function firstBlocked(nodes){return nodes.find(n=>!n.ready)||null}
export function fabricSummaryR111(status={},hybrid={},env={}){
 const authorityNodes=authorityNodesR111(status),services=serviceCapabilitiesR111({status,hybrid,env}),blocked=firstBlocked(authorityNodes);
 return{
  schema:'OMEGA_FEDERATED_CAPABILITY_MESH_R111',revision:'R111',generatedAt:new Date().toISOString(),
  authorityModel:'FOUR_AUTHORITIES_ONE_GLOBAL_CANONSTATE',globalCanonicalAuthority:'omega-v6',authorityOrder,
  authorityNodes,serviceCapabilities:services,
  readyAuthorityCount:authorityNodes.filter(x=>x.ready).length,totalAuthorityCount:authorityNodes.length,
  gate:blocked?.id||'READY',nextUsefulAction:blocked?blocked.id==='omega-optical'?'Authorize server-side machine access to Optical or recover its protected health interface; never expose the credential in browser code.':blocked.id==='omega-sovereign'?'Connect the Sovereign PC and prove a fresh authenticated heartbeat; historical pairing is not current ONLINE.':blocked.id==='omega-genesis'?'Recover Genesis health before proposal generation.':'Recover OMEGAv6 canonical runtime health.':'All authority nodes required by the full federation are available; execute only the minimum path required by the operator intent.',
  truthBoundary:'The mesh separates federation authorities from service capabilities. Four authority nodes remain fixed by governance; auxiliary clouds, solvers, observers, caches and sentinels may scale independently without becoming competing CanonState owners.'
 };
}

export function fabricIntentR111(intent,status={},hybrid={},env={}){
 const plan=planIntentR103(intent,status),fabric=fabricSummaryR111(status,hybrid,env),required=new Set(plan.requiredNodes||[]),requiredState=fabric.authorityNodes.filter(n=>required.has(n.id));
 const blocked=requiredState.find(n=>!n.ready)||null;
 return{
  schema:'OMEGA_FABRIC_INTENT_PLAN_R111',ok:plan.ok,generatedAt:new Date().toISOString(),intent:text(intent),
  plan:{...plan,gate:blocked?.id||plan.gate||'READY',nextAction:blocked?fabric.nextUsefulAction:plan.nextAction},
  minimumAuthorityPath:requiredState.map(n=>({id:n.id,verb:n.verb,state:n.state,ready:n.ready,truthClass:n.truthClass})),
  fabric:{revision:fabric.revision,gate:fabric.gate,readyAuthorityCount:fabric.readyAuthorityCount,totalAuthorityCount:fabric.totalAuthorityCount},
  truthBoundary:'Intent routing selects the minimum lawful authority path. Mesh availability does not cause optional nodes, solvers, clouds or observers to execute merely because they exist.'
 };
}

export const FABRIC_MESH_LAW_R111={
 schema:'OMEGA_FEDERATED_CAPABILITY_MESH_LAW_R111',
 authorityNodes:authorityOrder,
 globalCanonicalAuthority:'omega-v6',
 laws:[
  'ADD_SERVICE_CAPACITY_WITHOUT_ADDING_CANONSTATE_AUTHORITY',
  'CURRENT_HEARTBEAT_REQUIRED_FOR_NATIVE_ONLINE',
  'ACCESS_GATED_IS_NOT_OFFLINE_AND_NOT_LIVE',
  'SERVICE_BINDING_IS_NOT_EXECUTION',
  'MINIMUM_LAWFUL_PATH_BEFORE_OPTIONAL_CAPACITY',
  'FAILED_SOLVER_RESULTS_RETURN_AS_SCARRED_EVIDENCE_NOT_SILENT_STATE_MUTATION',
  'SUCCESSFUL_WORKER_RESULTS_RETURN_AS_EVIDENCE_FOR_OMEGAV6_ADMISSION'
 ]
};
