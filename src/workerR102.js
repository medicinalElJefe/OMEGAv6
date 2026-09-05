import r101,{OmegaRuntime as OmegaRuntimeR101} from './workerR101.js';
import {planIntentR103} from './federation/federationIntentRouterR103.js';

const OPTICAL_PRIMARY_R102='https://omega-living-light-etching-private-woven2.vercel.app';
const OPTICAL_LEGACY_R102='https://omega-optical-cloud-woven2.vercel.app';
const text=v=>String(v??'').trim();
const now=()=>Date.now();
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});

function federationOriginR102(request){
 const origin=text(request.headers.get('origin'));if(!origin)return null;
 try{
  const u=new URL(origin),h=u.hostname.toLowerCase();if(u.protocol!=='https:')return null;
  if(h==='omegav6.jeffdeweyeljefe.workers.dev'||h==='omega-genesis-v1.jeffdeweyeljefe.workers.dev'||h==='omega-optical-cloud-woven2.vercel.app'||h==='omega-living-light-etching-private-woven2.vercel.app'||(/^omega-(?:optical-cloud|living-light-etching-private)-[a-z0-9-]+-woven2\.vercel\.app$/).test(h))return origin;
 }catch{}
 return null;
}
function withCorsR102(response,request){
 const origin=federationOriginR102(request),headers=new Headers(response.headers);headers.set('x-omega-federation-revision','R102');
 if(origin){headers.set('access-control-allow-origin',origin);headers.set('vary','Origin');headers.set('access-control-allow-methods','GET,POST,PUT,OPTIONS');headers.set('access-control-allow-headers','content-type,authorization,x-omega-federation-token,x-vercel-protection-bypass,x-omega-bridge-id,x-omega-bridge-secret,x-omega-session-id');headers.set('access-control-max-age','600')}
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function preflightR102(request){
 const origin=federationOriginR102(request);if(!origin)return new Response(null,{status:403,headers:{'x-omega-federation-revision':'R102'}});
 return new Response(null,{status:204,headers:{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,PUT,OPTIONS','access-control-allow-headers':'content-type,authorization,x-omega-federation-token,x-vercel-protection-bypass,x-omega-bridge-id,x-omega-bridge-secret,x-omega-session-id','access-control-max-age':'600','x-omega-federation-revision':'R102'}});
}
async function probeJsonServiceR102(url,headers={}){
 const started=now();try{
  const response=await fetch(url,{headers:{accept:'application/json','cache-control':'no-cache',...headers},cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(10000)}),contentType=response.headers.get('content-type')||'',redirected=response.status>=300&&response.status<400,html=contentType.includes('text/html'),authGate=response.status===401||response.status===403;
  if(redirected||html||authGate)return{state:'ACCESS_GATED',httpStatus:response.status,contentType,latencyMs:now()-started,jsonVerified:false,resolvedUrl:url};
  const body=await response.json().catch(()=>null);return{state:response.ok&&body&&(body.ok!==false||body.status==='OK')?'LIVE':'DEGRADED',httpStatus:response.status,contentType,latencyMs:now()-started,jsonVerified:Boolean(body&&typeof body==='object'),service:text(body?.service||body?.runtime||body?.name).slice(0,120)||null,version:text(body?.version||body?.build?.version).slice(0,80)||null,resolvedUrl:url};
 }catch(error){return{state:'UNREACHABLE',httpStatus:0,latencyMs:now()-started,jsonVerified:false,error:text(error instanceof Error?error.message:error).slice(0,180),resolvedUrl:url}}
}
async function probeOpticalR102(env){
 const headers={};if(env.OMEGA_OPTICAL_SERVICE_TOKEN){headers.authorization=`Bearer ${env.OMEGA_OPTICAL_SERVICE_TOKEN}`;headers['x-omega-federation-token']=env.OMEGA_OPTICAL_SERVICE_TOKEN}if(env.OMEGA_OPTICAL_BYPASS_TOKEN)headers['x-vercel-protection-bypass']=env.OMEGA_OPTICAL_BYPASS_TOKEN;
 const configured=text(env.OMEGA_OPTICAL_HEALTH_URL),primary=configured||`${OPTICAL_PRIMARY_R102}/api/health`,first=await probeJsonServiceR102(primary,headers);
 if(first.state==='LIVE')return{...first,preferredOrigin:OPTICAL_PRIMARY_R102,legacyOrigin:OPTICAL_LEGACY_R102};
 const legacy=`${OPTICAL_LEGACY_R102}/api/health`;
 if(primary===legacy)return{...first,preferredOrigin:OPTICAL_PRIMARY_R102,legacyOrigin:OPTICAL_LEGACY_R102};
 const fallback=await probeJsonServiceR102(legacy,headers);
 if(fallback.state==='LIVE')return{...fallback,preferredOrigin:OPTICAL_PRIMARY_R102,legacyOrigin:OPTICAL_LEGACY_R102,recoveredFromPreferred:true,preferredState:first.state};
 return{...first,preferredOrigin:OPTICAL_PRIMARY_R102,legacyOrigin:OPTICAL_LEGACY_R102,fallbackState:fallback.state,fallbackHttpStatus:fallback.httpStatus};
}
function experienceR102(data){
 const n=data?.nodes||{},r=data?.runtime||{},genesis=n.genesis?.state==='LIVE',optical=n.optical?.state==='LIVE',host=n.sovereign?.state==='PC_ONLINE',solver=n.sovereign?.rcwaState==='RCWA_ONLINE';
 let stage='ADMIT',gate='READY';
 if(!genesis){stage='PROPOSE';gate='GENESIS'}else if(!optical){stage='SCREEN';gate='OPTICAL'}else if(!host){stage='SOLVE';gate:'SOVEREIGN_LINK'}else if(!solver){stage='SOLVE';gate='FULL_WAVE'}else if(Number(r?.rcwa?.counts?.running||0)>0){stage='SOLVE';gate='RUNNING'}else if(Number(r?.rcwa?.counts?.queued||0)>0){stage='SOLVE';gate='QUEUED'}
 return{revision:'R102',stage,gate,nodeOrder:['omega-genesis','omega-optical','omega-sovereign','omega-v6'],verbs:['PROPOSE','SCREEN','SOLVE','ADMIT'],authorityModel:{globalCanonical:'omega-v6',genesis:'node-local proposal state only',optical:'worker packet return',sovereign:'worker result return'},userModel:'one project + one packet lineage + four specialized runtimes',intentRouterRevision:'R103'};
}

async function fetchR102(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/federation/')&&request.method==='OPTIONS')return preflightR102(request);
 if(path==='/api/federation/run/status'&&request.method==='GET'){
  const [base,optical]=await Promise.all([r101.fetch(request,env),probeOpticalR102(env)]),data=await base.clone().json().catch(()=>null);
  if(!data||typeof data!=='object')return withCorsR102(base,request);
  // Keep the stable R97 status schema for existing clients and release probes; R102 is an additive experience revision.
  const next={...data,schema:'OMEGA_FEDERATION_RUN_STATUS_R97',nodes:{...(data.nodes||{}),optical},federationRevision:'R102',preferredOpticalOrigin:OPTICAL_PRIMARY_R102,experience:null};next.experience=experienceR102(next);
  return withCorsR102(json(next,base.status),request);
 }
 if(path==='/api/federation/route-intent'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),intent=text(body?.intent||body?.text).slice(0,2000);
  const statusUrl=new URL('/api/federation/run/status',request.url),statusRequest=new Request(statusUrl,{method:'GET',headers:request.headers}),statusResponse=await fetchR102(statusRequest,env),status=await statusResponse.clone().json().catch(()=>({}));
  const plan=planIntentR103(intent,status||{});
  return withCorsR102(json({...plan,federationRevision:'R102',intentRouterRevision:'R103',generatedAt:new Date().toISOString()},plan.ok?200:400,{'x-omega-intent-router-revision':'R103'}),request);
 }
 const response=await r101.fetch(request,env);
 return path.startsWith('/api/federation/')?withCorsR102(response,request):response;
}

export class OmegaRuntime extends OmegaRuntimeR101 {}
export default{fetch:fetchR102};
