import r102,{OmegaRuntime as OmegaRuntimeR102} from './workerR102.js';
import {planIntentR103} from './federation/federationIntentRouterR103.js';

const text=v=>String(v??'').trim();
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
function allowedOrigin(request){
 const origin=text(request.headers.get('origin'));if(!origin)return null;
 try{const u=new URL(origin),h=u.hostname.toLowerCase();if(u.protocol!=='https:')return null;if(h==='omegav6.jeffdeweyeljefe.workers.dev'||h==='omega-genesis-v1.jeffdeweyeljefe.workers.dev'||h==='omega-optical-cloud-woven2.vercel.app'||h==='omega-living-light-etching-private-woven2.vercel.app'||(/^omega-(?:optical-cloud|living-light-etching-private)-[a-z0-9-]+-woven2\.vercel\.app$/).test(h))return origin}catch{}
 return null;
}
function cors(response,request){
 const headers=new Headers(response.headers),origin=allowedOrigin(request);headers.set('x-omega-federation-revision','R103');
 if(origin){headers.set('access-control-allow-origin',origin);headers.set('vary','Origin');headers.set('access-control-allow-methods','GET,POST,PUT,OPTIONS');headers.set('access-control-allow-headers','content-type,authorization,x-omega-federation-token,x-vercel-protection-bypass,x-omega-bridge-id,x-omega-bridge-secret,x-omega-session-id');headers.set('access-control-max-age','600')}
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function preflight(request){const origin=allowedOrigin(request);if(!origin)return new Response(null,{status:403,headers:{'x-omega-federation-revision':'R103'}});return new Response(null,{status:204,headers:{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,PUT,OPTIONS','access-control-allow-headers':'content-type,authorization,x-omega-federation-token,x-vercel-protection-bypass,x-omega-bridge-id,x-omega-bridge-secret,x-omega-session-id','access-control-max-age':'600','x-omega-federation-revision':'R103'}})}
async function federationStatus(request,env){
 const u=new URL('/api/federation/run/status',request.url),probe=new Request(u,{method:'GET',headers:request.headers});
 const base=await r102.fetch(probe,env),data=await base.clone().json().catch(()=>null);if(!data||typeof data!=='object')return{response:base,data:null};
 const next={...data,federationRevision:'R103',experience:{...(data.experience||{}),revision:'R103',intentRouter:'/api/federation/route-intent',routingLaw:'intent → minimal capability graph → visible gate → one proof lineage'}};
 return{response:json(next,base.status),data:next};
}

async function fetchR103(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/federation/')&&request.method==='OPTIONS')return preflight(request);
 if(path==='/api/federation/run/status'&&request.method==='GET'){
  const {response}=await federationStatus(request,env);return cors(response,request);
 }
 if(path==='/api/federation/route-intent'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),intent=text(body?.intent||body?.text).slice(0,2000);
  const {data}=await federationStatus(request,env);const plan=planIntentR103(intent,data||{});
  return cors(json({...plan,federationRevision:'R103',generatedAt:new Date().toISOString()} ,plan.ok?200:400),request);
 }
 const response=await r102.fetch(request,env);
 return path.startsWith('/api/federation/')?cors(response,request):response;
}

export class OmegaRuntime extends OmegaRuntimeR102 {}
export default{fetch:fetchR103};
