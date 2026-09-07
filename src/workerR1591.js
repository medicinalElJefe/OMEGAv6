import r116,{OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator} from './workerR116.js';

export {OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator};

export const R1591_REVISION='R159.1';
export const R1591_SCHEMA='OMEGA_CANONICAL_CORE_HEALTH_R159_1';
const CANONICAL_URL='https://omegav6.jeffdeweyeljefe.workers.dev';
const HEADERS={
 'content-type':'application/json; charset=utf-8',
 'cache-control':'no-store',
 'x-content-type-options':'nosniff',
 'x-omega-core-health':'R159.1-FIRST-HAND',
 'x-omega-runtime-successor':'R159.1'
};
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:HEADERS});

async function buildReceiptR1591(request,env){
 if(!env?.ASSETS?.fetch)return{state:'UNAVAILABLE',source:null,receiptSha256:null};
 try{
  const response=await env.ASSETS.fetch(new Request(new URL('/omega-build-receipt.json',request.url),{headers:{'cache-control':'no-cache'}}));
  if(!response.ok)return{state:'UNAVAILABLE',source:null,receiptSha256:null,httpStatus:response.status};
  const receipt=await response.json().catch(()=>null);
  return receipt&&typeof receipt==='object'?{state:'RETURNED',source:receipt.source||null,receiptSha256:receipt.receiptSha256||null,promotion:receipt.promotion||null}:{state:'INVALID',source:null,receiptSha256:null};
 }catch(error){return{state:'UNAVAILABLE',source:null,receiptSha256:null,error:error instanceof Error?error.message:String(error)}}
}

export async function canonicalCoreHealthR1591(request,env){
 const assets=Boolean(env?.ASSETS?.fetch),durableRuntime=Boolean(env?.OMEGA_RUNTIME),metadata=env?.CF_VERSION_METADATA||null,receipt=await buildReceiptR1591(request,env),coreReady=assets&&durableRuntime;
 return json({
  ok:coreReady,
  schema:R1591_SCHEMA,
  revision:R1591_REVISION,
  canonicalUrl:CANONICAL_URL,
  checkedAt:new Date().toISOString(),
  core:{
   state:coreReady?'LIVE':'DEGRADED',
   workerRequestHandling:'RETURNED_FIRST_HAND',
   assetsBinding:assets?'BOUND':'MISSING',
   durableRuntimeBinding:durableRuntime?'BOUND':'MISSING',
   workersAiBinding:env?.AI?'BOUND_OPTIONAL':'UNBOUND_OPTIONAL',
   versionMetadata:metadata?'RETURNED':'UNAVAILABLE'
  },
  runtimeVersion:metadata?{id:String(metadata.id||''),tag:metadata.tag?String(metadata.tag):null,timestamp:metadata.timestamp?String(metadata.timestamp):null}:null,
  buildReceipt:receipt,
  executionAuthority:{
   sovereignExecution:'R127/R132 authenticated Hybrid heartbeat + returned host proof',
   exactReturnProof:'R141',
   sovereignConvergence:'R159',
   canonicalAdmission:'R125',
   canonicalMutation:false
  },
  sovereignGateway:{
   state:'SEPARATE_OPTIONAL_BOUNDARY',
   requiredForCanonicalCoreHealth:false,
   authority:'NONE_OVER_CORE_HEALTH',
   truthBoundary:'A private or external sovereign gateway may expose additional services when independently configured, but its absence cannot replace or falsify the first-hand liveness of the canonical Cloudflare Worker. Gateway readiness must be reported by its own evidence surface.'
  },
  truthBoundary:'R159.1 is first-hand canonical Worker health only. It proves that this Worker invocation returned and whether required Cloudflare core bindings are present. It does not prove a PC heartbeat, job success, RCWA availability, external gateway readiness, federation closure, model correctness, physical validity, or R125 CanonState admission.'
 },coreReady?200:503);
}

export default{
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='GET'&&(url.pathname==='/api/health'||url.pathname==='/api/core-health'))return canonicalCoreHealthR1591(request,env);
  return r116.fetch(request,env);
 }
};
