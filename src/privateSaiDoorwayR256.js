const JSON_HEADERS=Object.freeze({
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store, max-age=0',
  'referrer-policy':'no-referrer',
  'x-robots-tag':'noindex, nofollow, noarchive',
  'cross-origin-resource-policy':'cross-origin',
  'access-control-allow-origin':'*',
  'access-control-allow-methods':'GET,POST,OPTIONS',
  'access-control-allow-headers':'authorization,content-type,accept,x-omega-peer-proof',
  'access-control-expose-headers':'x-omega-doorway-revision,x-omega-peer-id'
});

export const PRIVATE_SAI_REVISION_R256='R256';
export const PRIVATE_SAI_SCHEMA_R256='OMEGA_PRIVATE_SAI_DOORWAY_R256';
export const PRIVATE_SAI_FORBIDDEN_AUTHORITIES_R256=Object.freeze([
  'HYBRID_SECRET','PC_PAIRING','R147_EXECUTION_DISPATCH','GITHUB_WRITE','PRODUCTION_DEPLOYMENT','CLOUDFLARE_AUTHORITY','R125_CANONSTATE_ADMISSION','ADMIN_LEDGER_READ'
]);
const enc=new TextEncoder();
const txt=v=>String(v??'').trim();
const bounded=(v,n=8000)=>txt(v).slice(0,Math.max(1,Math.min(16000,Number(n)||8000)));
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body,null,2),{status,headers:{...JSON_HEADERS,'x-omega-doorway-revision':PRIVATE_SAI_REVISION_R256,...extra}});
const hex=bytes=>[...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');
async function sha256(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(String(value))))}
function nowIso(){return new Date().toISOString()}
function authority(){return{peerExecutionAuthority:false,hybridAuthority:false,pcAuthority:false,githubWriteAuthority:false,deploymentAuthority:false,canonAdmissionAuthority:false,adminLedgerAuthority:false,trainingAdmissionAuthority:false,forbidden:PRIVATE_SAI_FORBIDDEN_AUTHORITIES_R256,rule:'External AI peers may converse, collaborate, evaluate, and propose training material only within invitation scopes. They cannot directly mutate SAI training state, CanonState, deployment, repository, Hybrid, or PC state.'}}
function safeId(v){return txt(v).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,96)}
function expired(inv){const t=Date.parse(inv?.expiresAt||'');return Number.isFinite(t)&&Date.now()>t}
function scope(inv,s){return Array.isArray(inv?.scopes)&&inv.scopes.includes(s)}
function route(request){const u=new URL(request.url);const m=u.pathname.match(/^\/sai-door\/([A-Za-z0-9_-]{32,128})(?:\/(agent-card\.json|openapi\.json|mcp|message|training|session))?\/?$/);return m?{token:m[1],action:m[2]||'experience',url:u}:null}
function base(request,token){return `${new URL(request.url).origin}/sai-door/${token}`}

export async function validateSaiInviteR256(token,env){
  const raw=txt(token); if(!/^[A-Za-z0-9_-]{32,128}$/.test(raw)) return null;
  const digest=await sha256(raw);
  let invites=[];
  try{invites=JSON.parse(env?.OMEGA_SAI_INVITES_JSON||'[]')}catch{}
  if(!Array.isArray(invites))return null;
  return invites.find(inv=>inv?.active!==false&&!expired(inv)&&String(inv?.tokenSha256||'').toLowerCase()===digest)||null;
}
function discovery(request,token,invite){const b=base(request,token);return{
  ok:true,schema:PRIVATE_SAI_SCHEMA_R256,revision:PRIVATE_SAI_REVISION_R256,private:true,unlisted:true,invite:{id:invite.id,label:invite.label||'private peer',scopes:invite.scopes||[],expiresAt:invite.expiresAt||null},
  experience:{human:b,agentCard:`${b}/agent-card.json`,openapi:`${b}/openapi.json`,message:`${b}/message`,training:`${b}/training`,session:`${b}/session`,mcp:`${b}/mcp`},
  protocols:{a2aCard:true,openapi:'3.1.0',remoteMcpBridge:'R256 compatibility surface',httpJson:true},
  authority:authority()
}}
function agentCard(request,token,invite){const b=base(request,token);return{
  name:'OMEGA V6 · SAI Private Peer',description:'Invitation-only peer doorway into OMEGAv6 SAI collaboration.',url:b,version:'R256',protocolVersion:'0.3.0',preferredTransport:'JSONRPC',
  capabilities:{streaming:false,pushNotifications:false,stateTransitionHistory:true},authentication:{schemes:['invite-capability-url']},
  skills:[
    {id:'sai.collaborate',name:'SAI Collaborate',description:'Exchange bounded analysis and proposals with SAI.',tags:['collaboration','analysis']},
    {id:'sai.training.propose',name:'Training Proposal',description:'Submit evaluation/training material for later admin review; never directly trains or mutates SAI.',tags:['evaluation','training-proposal']}
  ],
  endpoints:{message:`${b}/message`,training:`${b}/training`,session:`${b}/session`,openapi:`${b}/openapi.json`},
  authority:authority(),invite:{id:invite.id,scopes:invite.scopes||[]}
}}
function openapi(request,token,invite){const p=new URL(base(request,token)).pathname;return{openapi:'3.1.0',info:{title:'OMEGA V6 SAI Private Doorway',version:'R256',description:'Unlisted invitation-scoped AI-to-AI collaboration surface.'},servers:[{url:new URL(request.url).origin}],paths:{
 [p]:{get:{summary:'Human-readable/private doorway bootstrap'}},
 [`${p}/agent-card.json`]:{get:{summary:'A2A-style SAI peer capability card'}},
 [`${p}/message`]:{post:{summary:'Send bounded peer message',requestBody:{required:true,content:{'application/json':{schema:{type:'object',required:['prompt'],properties:{prompt:{type:'string',maxLength:invite.maxPromptChars||8000},stateContext:{type:'object'}}}}}}}},
 [`${p}/training`]:{post:{summary:'Submit training/evaluation proposal for admin review only'}},
 [`${p}/session`]:{get:{summary:'Read this invite-isolated peer session projection'}}
 },'x-omega-private':true,'x-omega-unlisted':true,'x-omega-authority':authority()}}
function peerHeaders(invite){return new Headers({'content-type':'application/json','x-omega-session-id':`r256:peer:${safeId(invite.id)}`,'x-omega-private-peer-id':safeId(invite.id)})}
async function delegateJson(delegate,url,request,env,body,method='POST',headers){const r=await delegate(new Request(new URL(url,request.url),{method,headers:headers||{},body:body===undefined?undefined:JSON.stringify(body)}),env);const data=await r.clone().json().catch(()=>null);return{response:r,data}}
async function appendLedger(env,record){
  // Optional durable sink. Absence must never create false persistence claims.
  if(env?.OMEGA_SAI_PEER_LEDGER?.put){const id=`${Date.now()}:${crypto.randomUUID()}`;await env.OMEGA_SAI_PEER_LEDGER.put(id,JSON.stringify(record));return{persisted:true,recordId:id}}
  return{persisted:false,recordId:null}
}
async function sendMessage(request,env,invite,delegate,body){
  if(!scope(invite,'COLLABORATE'))return json({ok:false,code:'R256_SCOPE_DENIED',required:'COLLABORATE'},403,{'x-omega-peer-id':invite.id});
  const prompt=bounded(body?.prompt,invite.maxPromptChars);if(!prompt)return json({ok:false,code:'R256_PROMPT_REQUIRED'},400,{'x-omega-peer-id':invite.id});
  const payload={prompt,stateContext:{...(body?.stateContext&&typeof body.stateContext==='object'?body.stateContext:{}),privatePeer:{revision:'R256',inviteId:invite.id,trainingAdmissionAuthority:false,canonAdmissionAuthority:false,executionAuthority:false}}};
  const {response,data}=await delegateJson(delegate,'/api/orchestrator/turn',request,env,payload,'POST',peerHeaders(invite));
  if(!data||typeof data!=='object')return json({ok:false,code:'R256_UPSTREAM_NON_JSON',upstreamStatus:response.status},502,{'x-omega-peer-id':invite.id});
  const event={schema:'OMEGA_SAI_PEER_EVENT_R256',kind:'COLLABORATION',at:nowIso(),inviteId:invite.id,promptHash:await sha256(prompt),turnId:data?.turn?.id||null,upstreamStatus:response.status};
  const ledger=await appendLedger(env,event);
  return json({ok:response.ok,schema:'OMEGA_SAI_PEER_MESSAGE_R256',revision:'R256',peerId:invite.id,assistant:txt(data?.turn?.assistantMessage||data?.assistantMessage),turnId:data?.turn?.id||null,ledger,authority:authority()},response.ok?200:response.status,{'x-omega-peer-id':invite.id});
}
async function submitTraining(request,env,invite,body){
  if(!scope(invite,'TRAINING_PROPOSE'))return json({ok:false,code:'R256_SCOPE_DENIED',required:'TRAINING_PROPOSE'},403,{'x-omega-peer-id':invite.id});
  const kind=safeId(body?.kind||'evaluation');const material=bounded(body?.material||body?.content,invite.maxTrainingChars||12000);if(!material)return json({ok:false,code:'R256_TRAINING_MATERIAL_REQUIRED'},400,{'x-omega-peer-id':invite.id});
  const record={schema:'OMEGA_SAI_TRAINING_PROPOSAL_R256',revision:'R256',kind,at:nowIso(),inviteId:invite.id,material,materialSha256:await sha256(material),metadata:body?.metadata&&typeof body.metadata==='object'?body.metadata:{},status:'PENDING_ADMIN_REVIEW',directTrainingApplied:false,canonAdmissionApplied:false};
  const ledger=await appendLedger(env,record);
  return json({ok:true,schema:'OMEGA_SAI_TRAINING_RECEIPT_R256',revision:'R256',peerId:invite.id,status:'PENDING_ADMIN_REVIEW',ledger,directTrainingApplied:false,authority:authority()},202,{'x-omega-peer-id':invite.id});
}
async function sessionProjection(request,env,invite,delegate){
  if(!scope(invite,'SESSION_READ'))return json({ok:false,code:'R256_SCOPE_DENIED',required:'SESSION_READ'},403,{'x-omega-peer-id':invite.id});
  const {response,data}=await delegateJson(delegate,'/api/status',request,env,undefined,'GET',peerHeaders(invite));
  return json({ok:response.ok,schema:'OMEGA_SAI_PEER_SESSION_R256',revision:'R256',peerId:invite.id,status:data&&typeof data==='object'?data:null,private:true,isolated:true,authority:authority()},response.status,{'x-omega-peer-id':invite.id});
}
export async function privateSaiDoorwayR256(request,env,{delegate}={}){
  const r=route(request);if(!r)return null;if(typeof delegate!=='function')return json({ok:false,code:'R256_DELEGATE_UNAVAILABLE'},503);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...JSON_HEADERS,'x-omega-doorway-revision':'R256'}});
  const invite=await validateSaiInviteR256(r.token,env);if(!invite)return json({ok:false,code:'R256_INVITE_NOT_FOUND'},404);
  const h={'x-omega-peer-id':invite.id};
  if(r.action==='experience'&&request.method==='GET')return json(discovery(request,r.token,invite),200,h);
  if(r.action==='agent-card.json'&&request.method==='GET')return json(agentCard(request,r.token,invite),200,h);
  if(r.action==='openapi.json'&&request.method==='GET')return json(openapi(request,r.token,invite),200,h);
  if(r.action==='mcp'&&request.method==='GET')return json({ok:true,schema:'OMEGA_SAI_MCP_BRIDGE_R256',revision:'R256',peerId:invite.id,transport:'HTTP compatibility bootstrap',tools:[{name:'sai.collaborate',endpoint:`${base(request,r.token)}/message`},{name:'sai.training.propose',endpoint:`${base(request,r.token)}/training`}],authority:authority()},200,h);
  const declared=Number(request.headers.get('content-length')||0);if(declared>30000)return json({ok:false,code:'R256_BODY_TOO_LARGE'},413,h);
  if(r.action==='message'&&request.method==='POST')return sendMessage(request,env,invite,delegate,await request.json().catch(()=>({})));
  if(r.action==='training'&&request.method==='POST')return submitTraining(request,env,invite,await request.json().catch(()=>({})));
  if(r.action==='session'&&request.method==='GET')return sessionProjection(request,env,invite,delegate);
  return json({ok:false,code:'R256_METHOD_NOT_ALLOWED'},405,h);
}
