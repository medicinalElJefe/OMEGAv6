import {PRIVATE_AGENT_INVITES_R245,PRIVATE_AGENT_PROTOCOL_R245,PRIVATE_AGENT_REVISION_R245,R245_FORBIDDEN_AUTHORITIES} from './privateAgentInvitesR245.js';

const JSON_HEADERS=Object.freeze({
 'content-type':'application/json; charset=utf-8',
 'cache-control':'no-store, max-age=0',
 'referrer-policy':'no-referrer',
 'x-robots-tag':'noindex, nofollow, noarchive',
 'access-control-allow-origin':'*',
 'access-control-allow-methods':'GET,POST,OPTIONS',
 'access-control-allow-headers':'content-type,accept',
 'access-control-expose-headers':'x-omega-private-agent-revision,x-omega-private-agent-id'
});
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...JSON_HEADERS,'x-omega-private-agent-revision':PRIVATE_AGENT_REVISION_R245,...extra}});
const text=v=>String(v??'').trim();
const safeInviteId=v=>text(v).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,80);
const safePrompt=(v,max=6000)=>text(v).slice(0,Math.max(1,Math.min(12000,Number(max)||6000)));
const cleanHeaders=invite=>new Headers({'content-type':'application/json','x-omega-session-id':`r245:${safeInviteId(invite.id)}`});
async function sha256Hex(value){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value)));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function isExpired(invite){if(!invite?.expiresAt)return false;const t=Date.parse(invite.expiresAt);return Number.isFinite(t)&&Date.now()>t}
function hasScope(invite,scope){return Array.isArray(invite?.scopes)&&invite.scopes.includes(scope)}
export async function validatePrivateAgentInviteR245(token,invites=PRIVATE_AGENT_INVITES_R245){
 const raw=text(token);if(!/^[A-Za-z0-9_-]{32,128}$/.test(raw))return null;const digest=await sha256Hex(raw);
 const invite=invites.find(row=>row?.active!==false&&!isExpired(row)&&String(row?.tokenSha256||'').toLowerCase()===digest);return invite||null;
}
function routeParts(request){const u=new URL(request.url),m=u.pathname.match(/^\/private-agent\/([A-Za-z0-9_-]{32,128})(?:\/(openapi\.json|tools|message|tool))?\/?$/);return m?{token:m[1],action:m[2]||'card',url:u}:null}
function authorityBoundary(){return{executionAuthority:false,hybridAuthority:false,pcAuthority:false,githubWriteAuthority:false,deploymentAuthority:false,dispatchAuthority:false,canonAdmissionAuthority:false,forbidden:R245_FORBIDDEN_AUTHORITIES,truthBoundary:'R245 private-agent access is an invitation-scoped communication surface only. It cannot inherit Jeffrey\'s Hybrid bridge secret, pair a PC, dispatch R147 execution, write GitHub, deploy Cloudflare, or admit CanonState through R125.'}}
function endpointBase(request,token){const u=new URL(request.url);return `${u.origin}/private-agent/${token}`}
function card(request,token,invite){const base=endpointBase(request,token);return{
 ok:true,schema:'OMEGA_PRIVATE_AGENT_CARD_R245',revision:PRIVATE_AGENT_REVISION_R245,protocol:PRIVATE_AGENT_PROTOCOL_R245,private:true,publicDirectory:false,invite:{id:invite.id,label:invite.label,scopes:invite.scopes,expiresAt:invite.expiresAt||null},
 interaction:{message:`${base}/message`,tools:`${base}/tools`,tool:`${base}/tool`,openapi:`${base}/openapi.json`},
 usage:{message:{method:'POST',json:{prompt:'Ask OMEGA something'}},tool:{method:'POST',json:{name:'omega.status',arguments:{}}}},
 supportedNow:['OMEGA_AGENT_HTTP_R245','OPENAPI_DISCOVERY'],plannedLater:['A2A_NATIVE','REMOTE_MCP','MULTI_AGENT_ROOMS'],authority:authorityBoundary()
}}
function openapi(request,token,invite){const base=endpointBase(request,token),path=new URL(base).pathname;return{
 openapi:'3.1.0',info:{title:'OMEGA Private Agent Gateway',version:'R245',description:'Invite-only machine interaction with OMEGA. Capability URL is the credential.'},servers:[{url:new URL(request.url).origin}],
 paths:{
  [path]:{get:{summary:'Private OMEGA agent card'}},
  [`${path}/message`]:{post:{summary:'Send one bounded message to OMEGA',requestBody:{required:true,content:{'application/json':{schema:{type:'object',required:['prompt'],properties:{prompt:{type:'string',maxLength:invite.maxPromptChars||6000},stateContext:{type:'object'}}}}}},responses:{'200':{description:'OMEGA reply'}}}},
  [`${path}/tools`]:{get:{summary:'List tools allowed by this invite'}},
  [`${path}/tool`]:{post:{summary:'Call one invite-scoped read/analysis tool',requestBody:{required:true,content:{'application/json':{schema:{type:'object',required:['name'],properties:{name:{type:'string',enum:['omega.ask','omega.status']},arguments:{type:'object'}}}}}}}}
 },
 'x-omega-private':true,'x-omega-invite-id':invite.id,'x-omega-authority':authorityBoundary()
}}
function toolList(invite){return{ok:true,schema:'OMEGA_PRIVATE_AGENT_TOOLS_R245',revision:'R245',inviteId:invite.id,tools:[
 {name:'omega.ask',description:'Ask OMEGA for bounded synthesis. Returns analysis/proposal only; never queues execution.',input:{prompt:'string',stateContext:'object?'}},
 {name:'omega.status',description:'Read the invite-isolated public OMEGA status projection. No private Hybrid credential is attached.',input:{}}
 ],authority:authorityBoundary()}}
async function askOmega(request,env,invite,delegate,prompt,stateContext={}){
 if(!hasScope(invite,'MESSAGE'))return json({ok:false,code:'R245_SCOPE_DENIED',required:'MESSAGE'},403,{'x-omega-private-agent-id':invite.id});
 const bounded=safePrompt(prompt,invite.maxPromptChars);if(!bounded)return json({ok:false,code:'R245_PROMPT_REQUIRED'},400,{'x-omega-private-agent-id':invite.id});
 const headers=cleanHeaders(invite),body={prompt:bounded,stateContext:{...(stateContext&&typeof stateContext==='object'?stateContext:{}),privateAgent:{revision:'R245',inviteId:invite.id,executionAuthority:false,canonAdmissionAuthority:false}}};
 const response=await delegate(new Request(new URL('/api/orchestrator/turn',request.url),{method:'POST',headers,body:JSON.stringify(body)}),env),data=await response.clone().json().catch(()=>null);
 if(!data||typeof data!=='object')return json({ok:false,code:'R245_UPSTREAM_NON_JSON',upstreamStatus:response.status},502,{'x-omega-private-agent-id':invite.id});
 return json({ok:response.ok,schema:'OMEGA_PRIVATE_AGENT_MESSAGE_R245',revision:'R245',inviteId:invite.id,conversationId:`r245:${invite.id}`,assistant:text(data?.turn?.assistantMessage||data?.assistantMessage),turnId:data?.turn?.id||null,proposal:data?.draft?{state:'PROPOSAL_ONLY_NOT_EXECUTABLE',present:true}:null,upstreamStatus:response.status,authority:authorityBoundary()},response.ok?200:response.status,{'x-omega-private-agent-id':invite.id});
}
async function readStatus(request,env,invite,delegate){
 if(!hasScope(invite,'TOOLS_READ'))return json({ok:false,code:'R245_SCOPE_DENIED',required:'TOOLS_READ'},403,{'x-omega-private-agent-id':invite.id});
 const response=await delegate(new Request(new URL('/api/status',request.url),{method:'GET',headers:cleanHeaders(invite)}),env),data=await response.clone().json().catch(()=>null);
 if(!data||typeof data!=='object')return json({ok:false,code:'R245_STATUS_NON_JSON',upstreamStatus:response.status},502,{'x-omega-private-agent-id':invite.id});
 return json({ok:response.ok,schema:'OMEGA_PRIVATE_AGENT_STATUS_R245',revision:'R245',inviteId:invite.id,status:data,authority:authorityBoundary()},response.status,{'x-omega-private-agent-id':invite.id});
}
export async function privateAgentGatewayR245(request,env,{delegate,invites=PRIVATE_AGENT_INVITES_R245}={}){
 const route=routeParts(request);if(!route)return null;if(typeof delegate!=='function')return json({ok:false,code:'R245_DELEGATE_UNAVAILABLE'},503);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...JSON_HEADERS,'x-omega-private-agent-revision':'R245'}});
 const invite=await validatePrivateAgentInviteR245(route.token,invites);if(!invite)return json({ok:false,code:'R245_PRIVATE_INVITE_NOT_FOUND'},404);
 const h={'x-omega-private-agent-id':invite.id};
 if(route.action==='card'&&request.method==='GET')return json(card(request,route.token,invite),200,h);
 if(route.action==='openapi.json'&&request.method==='GET')return json(openapi(request,route.token,invite),200,h);
 if(route.action==='tools'&&request.method==='GET')return json(toolList(invite),200,h);
 if(route.action==='message'&&request.method==='POST'){
  const declared=Number(request.headers.get('content-length')||0);if(declared>20000)return json({ok:false,code:'R245_BODY_TOO_LARGE'},413,h);const b=await request.json().catch(()=>({}));return askOmega(request,env,invite,delegate,b?.prompt,b?.stateContext);
 }
 if(route.action==='tool'&&request.method==='POST'){
  const declared=Number(request.headers.get('content-length')||0);if(declared>20000)return json({ok:false,code:'R245_BODY_TOO_LARGE'},413,h);const b=await request.json().catch(()=>({})),name=text(b?.name),args=b?.arguments&&typeof b.arguments==='object'?b.arguments:{};
  if(name==='omega.ask')return askOmega(request,env,invite,delegate,args.prompt,args.stateContext);
  if(name==='omega.status')return readStatus(request,env,invite,delegate);
  return json({ok:false,code:'R245_TOOL_NOT_ALLOWED',allowed:['omega.ask','omega.status']},403,h);
 }
 return json({ok:false,code:'R245_METHOD_NOT_ALLOWED'},405,h);
}
