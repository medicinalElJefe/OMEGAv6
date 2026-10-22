import opticalR152,{addressCandidateR152,screenCandidateR152,R152_ATLAS_SIZE,R152_AUTHORITY,R152_SERVICE,R152_TRUTH_BOUNDARY} from './opticalMachineR152.js';
import {createOpticalExternalToolR1531,R1531_TOOL_NAME,R1531_TOOL_VERSION} from './opticalExternalToolR1531.js';

export const R1531_MACHINE_VERSION='R153.1';
export const R1531_MACHINE_SERVICE=R152_SERVICE;
export const R1531_MACHINE_AUTHORITY=R152_AUTHORITY;

const tool=createOpticalExternalToolR1531({
 addressCandidate:addressCandidateR152,
 screenCandidate:async proposal=>{
  const normalized={...proposal,source_node:proposal?.source_node==='omega-external-tool'?'omega-optical-ui':proposal?.source_node,lineage:[...(proposal?.lineage||[]),'omega-external-tool:r153.1-source-normalized-for-r152-screen']};
  return screenCandidateR152(normalized);
 },
 atlasSize:R152_ATLAS_SIZE,
 truthBoundary:R152_TRUTH_BOUNDARY,
 service:R152_SERVICE
});

const corsHeaders={
 'cache-control':'no-store',
 'access-control-allow-origin':'*',
 'access-control-allow-methods':'GET,POST,OPTIONS',
 'access-control-allow-headers':'content-type,cache-control,x-omega-project-id,x-omega-packet-id,x-omega-tool-caller',
 'access-control-expose-headers':'x-omega-machine-adapter,x-omega-truth-boundary,x-omega-tool-version',
 'content-type':'application/json; charset=utf-8',
 'x-content-type-options':'nosniff',
 'referrer-policy':'no-referrer',
 'x-omega-machine-adapter':'OPTICAL_R153_1',
 'x-omega-truth-boundary':'SCREEN_ONLY',
 'x-omega-tool-version':R1531_TOOL_VERSION
};
const json=(body,status=200)=>new Response(JSON.stringify(body,null,2),{status,headers:corsHeaders});
const originOf=request=>new URL(request.url).origin;

async function augmentJsonResponse(response,patch){
 const body=await response.json();
 const headers=new Headers(response.headers);
 headers.set('x-omega-tool-version',R1531_TOOL_VERSION);
 headers.set('cache-control','no-store');
 return new Response(JSON.stringify({...body,...patch},null,2),{status:response.status,headers});
}

async function route(request){
 const url=new URL(request.url),origin=url.origin;
 if(request.method==='OPTIONS'&&url.pathname.startsWith('/api/tool/'))return new Response(null,{status:204,headers:corsHeaders});
 if(request.method==='GET'&&url.pathname==='/api/tool/descriptor')return json(tool.descriptor(origin));
 if(request.method==='GET'&&url.pathname==='/api/tool/probe')return json(tool.probe(origin));
 if(request.method==='GET'&&url.pathname==='/openapi.json')return json(tool.openapi(origin));
 if(request.method==='POST'&&url.pathname==='/api/tool/invoke'){
  const call=await request.json().catch(()=>null);
  const result=await tool.invoke(call);
  return json(result.body,result.status);
 }
 if(request.method==='GET'&&url.pathname==='/api/health'){
  const original=await opticalR152.fetch(request);
  return augmentJsonResponse(original,{machineVersion:R1531_MACHINE_VERSION,externalTool:{name:R1531_TOOL_NAME,version:R1531_TOOL_VERSION,ready:true,descriptor:'/api/tool/descriptor',probe:'/api/tool/probe',invoke:'/api/tool/invoke',openapi:'/openapi.json',canonicalMutation:false}});
 }
 if(request.method==='GET'&&url.pathname==='/api/optical/manifest'){
  const original=await opticalR152.fetch(request);
  const body=await original.json();
  const capabilities=[...new Set([...(body.capabilities||[]),'external-ai-tool-contract','hashed-tool-receipts','bounded-ai-push-ranking','ai-decision-support-residuals'])];
  const headers=new Headers(original.headers);headers.set('x-omega-tool-version',R1531_TOOL_VERSION);headers.set('cache-control','no-store');
  return new Response(JSON.stringify({...body,machineVersion:R1531_MACHINE_VERSION,capabilities,externalTool:tool.descriptor(origin)},null,2),{status:original.status,headers});
 }
 const response=await opticalR152.fetch(request);
 const headers=new Headers(response.headers);headers.set('x-omega-tool-version',R1531_TOOL_VERSION);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default{fetch:route};
