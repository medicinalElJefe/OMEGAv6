const OMEGA='https://omegav6.jeffdeweyeljefe.workers.dev';
const GENESIS='https://omega-genesis-v1.jeffdeweyeljefe.workers.dev';
const OPTICAL='https://omega-living-light-etching-private-woven2.vercel.app';
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-sentinel-revision':'R111'}});
const now=()=>Date.now();
async function probe(name,url,expectJson=true){const started=now();try{const r=await fetch(url,{headers:{accept:expectJson?'application/json':'*/*','cache-control':'no-cache'},redirect:'manual',signal:AbortSignal.timeout(8000)}),ct=r.headers.get('content-type')||'',gated=r.status===401||r.status===403||(r.status>=300&&r.status<400)||ct.includes('text/html');let body=null;if(expectJson&&!gated)body=await r.json().catch(()=>null);return{name,url,state:gated?'ACCESS_GATED':r.ok?'LIVE':'DEGRADED',httpStatus:r.status,latencyMs:now()-started,jsonVerified:Boolean(body&&typeof body==='object'),body}}catch(error){return{name,url,state:'UNREACHABLE',httpStatus:0,latencyMs:now()-started,jsonVerified:false,error:String(error instanceof Error?error.message:error).slice(0,180)}}}
async function fabric(){
 const [omegaHealth,omegaFabric,genesis,optical]=await Promise.all([
  probe('omega-v6',`${OMEGA}/api/health`),
  probe('omega-fabric',`${OMEGA}/api/fabric/status`),
  probe('omega-genesis',`${GENESIS}/api/health`),
  probe('omega-optical',`${OPTICAL}/api/health`)
 ]);
 const mesh=omegaFabric.body||{},authorities=Array.isArray(mesh.authorityNodes)?mesh.authorityNodes.map(n=>({id:n.id,verb:n.verb,state:n.state,ready:n.ready,truthClass:n.truthClass})):[];
 return{schema:'OMEGA_FABRIC_SENTINEL_R111',generatedAt:new Date().toISOString(),authority:'ADVISORY_CURRENT_PROBE_ONLY',canonicalAuthority:'omega-v6',probes:{omegaHealth:{...omegaHealth,body:undefined},genesis:{...genesis,body:undefined},optical:{...optical,body:undefined},omegaFabric:{...omegaFabric,body:undefined}},authorities,gate:mesh.gate||'OMEGA_FABRIC_UNAVAILABLE',nextUsefulAction:mesh.nextUsefulAction||'Recover OMEGAv6 fabric status before relying on federation readiness.',truthBoundary:'The sentinel is an independent observer only. It never owns CanonState, never admits results, never executes native actions, never stores browser/PC secrets and never converts historical proof into LIVE state.'};
}
export default{async fetch(request){const path=new URL(request.url).pathname;if(path==='/'||path==='/health')return json({ok:true,service:'omega-fabric-sentinel',revision:'R111',authority:'ADVISORY_ONLY',canonicalAuthority:'omega-v6'});if(path==='/fabric')return json(await fabric());return json({ok:false,code:'NOT_FOUND',paths:['/health','/fabric']},404)}};
