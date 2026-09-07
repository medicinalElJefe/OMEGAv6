import opticalR152,{addressCandidateR152,screenCandidateR152,R152_ATLAS_SIZE,R152_SERVICE,R152_TRUTH_BOUNDARY} from './opticalMachineR152.js';
import {createOpticalExternalToolR1533,R1533_TOOL_NAME,R1533_TOOL_VERSION,R1533_TOOL_SCHEMA,R1533_TOOL_AUTHORITY} from './opticalExternalToolR1533.js';

export const R1533_MACHINE_VERSION='R153.3';
export const R1533_MACHINE_SERVICE=R152_SERVICE;
export const R1533_MACHINE_AUTHORITY=R1533_TOOL_AUTHORITY;

const normalizedScreen=async proposal=>screenCandidateR152({...proposal,source_node:'omega-optical-ui',lineage:[...(proposal?.lineage||[]),'omega-external-tool:r153.3-source-normalized-for-r152-screen']});
const tool=createOpticalExternalToolR1533({addressCandidate:addressCandidateR152,screenCandidate:normalizedScreen,atlasSize:R152_ATLAS_SIZE,truthBoundary:R152_TRUTH_BOUNDARY,service:R152_SERVICE});
const headers={'cache-control':'no-store','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,cache-control,x-omega-project-id,x-omega-packet-id,x-omega-tool-caller','access-control-expose-headers':'x-omega-machine-adapter,x-omega-truth-boundary,x-omega-tool-version','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-omega-machine-adapter':'OPTICAL_R153_3','x-omega-truth-boundary':'SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE','x-omega-tool-version':R1533_TOOL_VERSION};
const json=(body,status=200)=>new Response(JSON.stringify(body,null,2),{status,headers});
async function augment(response,patch){const body=await response.json();const h=new Headers(response.headers);h.set('x-omega-tool-version',R1533_TOOL_VERSION);h.set('x-omega-truth-boundary','SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE');h.set('cache-control','no-store');return new Response(JSON.stringify({...body,...patch},null,2),{status:response.status,headers:h})}
const makeCall=(operation,payload,caller='omega-http-r1533')=>({schema:R1533_TOOL_SCHEMA,caller:{id:caller,kind:'human-tool'},request_id:`http_${operation}_${Date.now()}`,goal:'Apply the R41/R43 full-wave geometry authority gate before robust RCWA promotion.',operation,payload});
const fullwaveGeometryGate={schema:'OMEGA_FULLWAVE_GEOMETRY_GATE_R1533',version:R1533_TOOL_VERSION,authority:'R41_R43_RCWA_MANIFOLD',rule:'hypot(width_nm,length_nm) <= 0.95 * pitch_nm AND width_nm < length_nm',cell_ratio:0.95,robust_bridge:'sovereign/omega_fullwave_manifold_r1533.py',truth:'This gate mirrors the inherited R41/R43 RCWA unit-cell admissibility filter. It is a numerical geometry-domain rule for this solver stack, not fabrication validation or a universal physical constant.'};

async function route(request){
 const u=new URL(request.url),origin=u.origin;
 if(request.method==='OPTIONS'&&u.pathname.startsWith('/api/tool/'))return new Response(null,{status:204,headers});
 if(request.method==='GET'&&u.pathname==='/api/tool/descriptor')return json(tool.descriptor(origin));
 if(request.method==='GET'&&u.pathname==='/api/tool/probe')return json(tool.probe(origin));
 if(request.method==='GET'&&u.pathname==='/openapi.json')return json(tool.openapi(origin));
 if(request.method==='POST'&&u.pathname==='/api/tool/invoke'){
  const call=await request.json().catch(()=>null),result=await tool.invoke(call);return json(result.body,result.status);
 }
 if(request.method==='POST'&&u.pathname==='/api/tool/admissibility'){
  const payload=await request.json().catch(()=>null);if(!payload)return json({ok:false,code:'JSON_BODY_REQUIRED'},400);
  const result=await tool.invoke(makeCall('fullwave_admissibility',payload));return json(result.body,result.status);
 }
 if(request.method==='POST'&&u.pathname==='/api/tool/robust-queue'){
  const payload=await request.json().catch(()=>null);if(!payload)return json({ok:false,code:'JSON_BODY_REQUIRED'},400);
  const result=await tool.invoke(makeCall('prepare_robust_fullwave',payload));return json(result.body,result.status);
 }
 if(request.method==='GET'&&u.pathname==='/api/health'){
  const original=await opticalR152.fetch(request);
  return augment(original,{machineVersion:R1533_MACHINE_VERSION,authority:R1533_MACHINE_AUTHORITY,externalTool:{name:R1533_TOOL_NAME,version:R1533_TOOL_VERSION,ready:true,descriptor:'/api/tool/descriptor',probe:'/api/tool/probe',invoke:'/api/tool/invoke',admissibility:'/api/tool/admissibility',robustQueue:'/api/tool/robust-queue',openapi:'/openapi.json',adaptiveCycle:true,fullwaveAdmissibility:true,fullwaveExecution:false,canonicalMutation:false},fullwaveGeometryGate});
 }
 if(request.method==='GET'&&u.pathname==='/api/optical/manifest'){
  const original=await opticalR152.fetch(request),body=await original.json(),h=new Headers(original.headers);h.set('x-omega-tool-version',R1533_TOOL_VERSION);h.set('cache-control','no-store');
  const capabilities=[...new Set([...(body.capabilities||[]),'external-ai-tool-contract','adaptive-address-refinement','proof-guided-geometry-beam-search','r41-r43-fullwave-manifold-gate','admissible-projection-family','robust-grcwa-queue-preparation'])];
  return new Response(JSON.stringify({...body,machineVersion:R1533_MACHINE_VERSION,authority:R1533_MACHINE_AUTHORITY,capabilities,externalTool:tool.descriptor(origin),fullwaveGeometryGate},null,2),{status:original.status,headers:h});
 }
 const response=await opticalR152.fetch(request),h=new Headers(response.headers);h.set('x-omega-tool-version',R1533_TOOL_VERSION);h.set('x-omega-truth-boundary','SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE');return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}

export default{fetch:route};
