import opticalR152,{addressCandidateR152,screenCandidateR152,R152_ATLAS_SIZE,R152_AUTHORITY,R152_SERVICE,R152_VERSION,R152_TRUTH_BOUNDARY} from './opticalMachineR152.js';
import {createOpticalExternalToolR1532,R1532_TOOL_NAME,R1532_TOOL_VERSION,R1532_TOOL_SCHEMA} from './opticalExternalToolR1532.js';

export const R1532_MACHINE_VERSION='R153.2';
export const R1532_MACHINE_SERVICE='omega-optical-machine-r1532';
export const R1532_MACHINE_AUTHORITY=R152_AUTHORITY;
export const R1532_BASE_SCREENING_SERVICE=R152_SERVICE;
export const R1532_BASE_SCREENING_VERSION=R152_VERSION;

const normalizedScreen=async proposal=>screenCandidateR152({...proposal,source_node:'omega-optical-ui',lineage:[...(proposal?.lineage||[]),'omega-external-tool:r153.2-source-normalized-for-r152-screen']});
const tool=createOpticalExternalToolR1532({addressCandidate:addressCandidateR152,screenCandidate:normalizedScreen,atlasSize:R152_ATLAS_SIZE,truthBoundary:R152_TRUTH_BOUNDARY,service:R1532_MACHINE_SERVICE});

const corsHeaders={
 'cache-control':'no-store',
 'access-control-allow-origin':'*',
 'access-control-allow-methods':'GET,POST,OPTIONS',
 'access-control-allow-headers':'content-type,cache-control,x-omega-project-id,x-omega-packet-id,x-omega-tool-caller',
 'access-control-expose-headers':'x-omega-machine-adapter,x-omega-machine-service,x-omega-machine-version,x-omega-truth-boundary,x-omega-tool-version',
 'content-type':'application/json; charset=utf-8',
 'x-content-type-options':'nosniff',
 'referrer-policy':'no-referrer',
 'x-omega-machine-adapter':'OPTICAL_R153_2',
 'x-omega-machine-service':R1532_MACHINE_SERVICE,
 'x-omega-machine-version':R1532_MACHINE_VERSION,
 'x-omega-truth-boundary':'SCREEN_ONLY',
 'x-omega-tool-version':R1532_TOOL_VERSION
};
const json=(body,status=200)=>new Response(JSON.stringify(body,null,2),{status,headers:corsHeaders});
async function augment(response,patch){const body=await response.json();const headers=new Headers(response.headers);headers.set('x-omega-tool-version',R1532_TOOL_VERSION);headers.set('x-omega-machine-service',R1532_MACHINE_SERVICE);headers.set('x-omega-machine-version',R1532_MACHINE_VERSION);headers.set('cache-control','no-store');return new Response(JSON.stringify({...body,...patch},null,2),{status:response.status,headers})}
const boundedInt=(u,key,a,b,f)=>{const n=Math.floor(Number(u.searchParams.get(key)));return Number.isFinite(n)?Math.max(a,Math.min(b,n)):f};
const queryCall=(u,operation)=>({schema:R1532_TOOL_SCHEMA,caller:{id:'omega-http-insight',kind:'human-tool'},request_id:`http_${operation}_${Date.now()}`,goal:'Run one bounded external optical reasoning step and return proof-governed decision support.',operation,payload:{seed_address:boundedInt(u,'seed_address',0,R152_ATLAS_SIZE-1,1698),wavelength_nm:boundedInt(u,'wavelength_nm',380,780,532),radius:boundedInt(u,'radius',1,3,1),budget:boundedInt(u,'budget',8,256,128),rounds:boundedInt(u,'rounds',1,6,4),beam_width:boundedInt(u,'beam_width',1,8,4),max_evaluations:boundedInt(u,'max_evaluations',32,384,256)}});

async function route(request){
 const u=new URL(request.url),origin=u.origin;
 if(request.method==='OPTIONS'&&u.pathname.startsWith('/api/tool/'))return new Response(null,{status:204,headers:corsHeaders});
 if(request.method==='GET'&&u.pathname==='/api/tool/descriptor')return json(tool.descriptor(origin));
 if(request.method==='GET'&&u.pathname==='/api/tool/probe')return json(tool.probe(origin));
 if(request.method==='GET'&&u.pathname==='/openapi.json')return json(tool.openapi(origin));
 if(request.method==='POST'&&u.pathname==='/api/tool/invoke'){
  const call=await request.json().catch(()=>null),result=await tool.invoke(call);return json(result.body,result.status);
 }
 if(request.method==='GET'&&u.pathname==='/api/tool/insight'){
  const result=await tool.invoke(queryCall(u,'adaptive_refine'));return json(result.body,result.status);
 }
 if(request.method==='GET'&&u.pathname==='/api/tool/cycle'){
  const result=await tool.invoke(queryCall(u,'adaptive_cycle'));return json(result.body,result.status);
 }
 if(request.method==='GET'&&u.pathname==='/api/health'){
  const original=await opticalR152.fetch(request);
  return augment(original,{service:R1532_MACHINE_SERVICE,version:R1532_MACHINE_VERSION,machineVersion:R1532_MACHINE_VERSION,baseScreening:{service:R1532_BASE_SCREENING_SERVICE,version:R1532_BASE_SCREENING_VERSION,engine:'R152_BOUNDED_OPTICAL_ATLAS_SCREEN'},externalTool:{name:R1532_TOOL_NAME,version:R1532_TOOL_VERSION,ready:true,descriptor:'/api/tool/descriptor',probe:'/api/tool/probe',invoke:'/api/tool/invoke',insight:'/api/tool/insight',cycle:'/api/tool/cycle',openapi:'/openapi.json',adaptiveRefine:true,adaptiveCycle:true,maxAdaptiveRounds:6,maxAdaptiveEvaluations:384,canonicalMutation:false}});
 }
 if(request.method==='GET'&&u.pathname==='/api/optical/manifest'){
  const original=await opticalR152.fetch(request),body=await original.json(),headers=new Headers(original.headers);
  headers.set('x-omega-tool-version',R1532_TOOL_VERSION);headers.set('x-omega-machine-service',R1532_MACHINE_SERVICE);headers.set('x-omega-machine-version',R1532_MACHINE_VERSION);headers.set('cache-control','no-store');
  const capabilities=[...new Set([...(body.capabilities||[]),'external-ai-tool-contract','hashed-tool-receipts','bounded-ai-push-ranking','ai-decision-support-residuals','adaptive-address-refinement','constraint-preserving-boundary-escape','proof-guided-geometry-beam-search','closed-loop-ai-coprocessor-cycle'])];
  return new Response(JSON.stringify({...body,service:R1532_MACHINE_SERVICE,version:R1532_MACHINE_VERSION,machineVersion:R1532_MACHINE_VERSION,baseScreening:{service:R1532_BASE_SCREENING_SERVICE,version:R1532_BASE_SCREENING_VERSION},capabilities,externalTool:tool.descriptor(origin)},null,2),{status:original.status,headers});
 }
 const response=await opticalR152.fetch(request),headers=new Headers(response.headers);headers.set('x-omega-tool-version',R1532_TOOL_VERSION);headers.set('x-omega-machine-service',R1532_MACHINE_SERVICE);headers.set('x-omega-machine-version',R1532_MACHINE_VERSION);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default{fetch:route};
