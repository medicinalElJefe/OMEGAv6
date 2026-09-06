import r116,{OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator} from './workerR116.js';
import {withSwarmCorsR121} from './swarm/swarmApiR121.js';
import {cortexApiR130} from './swarm/swarmCortexApiR130.js';
import {CORTEX_RUNTIME,OmegaSwarmCortexR130} from './swarm/swarmCortexR130.js';

export {OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator,OmegaSwarmCortexR130};
export const R130_RUNTIME='OMEGA_R130_MAX_CAPACITY_ORGANISM';
const readJson=async response=>response.clone().json().catch(()=>null);
function replaceJson(response,data,extra={}){const headers=new Headers(response.headers);headers.set('content-type','application/json; charset=utf-8');headers.set('cache-control','no-store');headers.set('x-omega-cortex-runtime','R130');for(const[k,v]of Object.entries(extra))headers.set(k,String(v));return new Response(JSON.stringify(data,null,2),{status:response.status,headers})}
async function cortexStatus(request,env){const url=new URL('/api/swarm/cortex/status',request.url),response=await cortexApiR130(new Request(url,{method:'GET',headers:request.headers}),env,url),body=await readJson(response);return{response,body}}
async function enrichedSwarmManifest(request,env){const base=await r116.fetch(request,env),body=await readJson(base);if(!body||typeof body!=='object')return base;return withSwarmCorsR121(replaceJson(base,{...body,runtimeSuccessor:'R130',executionFabrics:{...(body.executionFabrics||{}),cortexR130:{root:'OMEGA_SWARM_CORTEX',purpose:'bounded-concurrent cell execution + whole-cell barrier + operational synaptic memory + branch cross-check + organ synthesis + inter-organ exchange + sealed proof return'}},bindings:{...(body.bindings||{}),cortex:'OMEGA_SWARM_CORTEX'},controls:[...new Set([...(body.controls||[]),'cortex dispatch width 1-48','whole-cell barrier','synaptic candidate reads','inter-organ exchange','R127 execution evidence adapter','R129 replay identity'])],truthBoundary:`${body.truthBoundary||''} R130 candidate memory, execution quorum, internal receipt verification and replay identity remain non-canonical and receive zero R128 external-validation credit.`}),request)}
async function enrichedConvergence(request,env){const [base,cortex]=await Promise.all([r116.fetch(request,env),cortexStatus(request,env)]),body=await readJson(base),c=cortex.body;if(!body||typeof body!=='object')return base;const available=Boolean(c?.ok&&c?.runtime===CORTEX_RUNTIME);return replaceJson(base,{...body,runtimeSuccessor:'R130',cortex:{state:available?'READY':'UNPROVEN',runtime:c?.runtime||CORTEX_RUNTIME,revision:c?.revision||'R130',missionCount:Array.isArray(c?.missions)?c.missions.length:0,activeMissions:Array.isArray(c?.missions)?c.missions.filter(m=>['QUEUED','RUNNING','PAUSED'].includes(m?.status)).length:0,hierarchy:c?.hierarchy||{seed:1,organs:12,branches:144,cells:1728,lanes:20736},authority:'CORTEX_EXECUTION_STATUS_NOT_CANON'},truthBoundary:`${body.truthBoundary||''} R130 adds organism execution state without changing canonical authority: cortex execution, replay identity and internal proof receipts remain distinct from empirical validation and CanonState.`},{'x-omega-runtime-successor':'R130'})}

export default{
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/swarm/cortex/'))return withSwarmCorsR121(await cortexApiR130(request,env,url),request);
  if(url.pathname==='/api/swarm/manifest'&&request.method==='GET')return enrichedSwarmManifest(request,env);
  if(url.pathname==='/api/system/convergence'&&request.method==='GET')return enrichedConvergence(request,env);
  return r116.fetch(request,env);
 }
};
