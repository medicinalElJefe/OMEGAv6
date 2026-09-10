const JSON_HEADERS=Object.freeze({
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store, max-age=0',
  'referrer-policy':'no-referrer',
  'x-robots-tag':'noindex, nofollow, noarchive',
  'x-content-type-options':'nosniff',
  'cross-origin-resource-policy':'same-origin'
});
const HTML_HEADERS=Object.freeze({
  'content-type':'text/html; charset=utf-8',
  'cache-control':'no-store, max-age=0',
  'referrer-policy':'no-referrer',
  'x-robots-tag':'noindex, nofollow, noarchive',
  'x-content-type-options':'nosniff',
  'x-frame-options':'DENY',
  'content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
});

export const PRIVATE_SAI_REVISION_R256='R256';
export const PRIVATE_SAI_SCHEMA_R256='OMEGA_PRIVATE_SAI_DOORWAY_R256';
export const PRIVATE_SAI_FORBIDDEN_AUTHORITIES_R256=Object.freeze([
  'HYBRID_SECRET','PC_PAIRING','R147_EXECUTION_DISPATCH','GITHUB_WRITE','PRODUCTION_DEPLOYMENT','CLOUDFLARE_AUTHORITY','R125_CANONSTATE_ADMISSION','ADMIN_LEDGER_READ','DIRECT_TRAINING_ADMISSION'
]);
const enc=new TextEncoder();
const txt=v=>String(v??'').trim();
const bounded=(v,n=8000)=>txt(v).slice(0,Math.max(1,Math.min(20000,Number(n)||8000)));
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body,null,2),{status,headers:{...JSON_HEADERS,'x-omega-doorway-revision':PRIVATE_SAI_REVISION_R256,...extra}});
const rpc=(id,result,error=null,extra={})=>json(error?{jsonrpc:'2.0',id:id??null,error}:{jsonrpc:'2.0',id:id??null,result},error?400:200,extra);
const hex=bytes=>[...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');
async function sha256(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(String(value))))}
function nowIso(){return new Date().toISOString()}
function authority(){return{peerExecutionAuthority:false,hybridAuthority:false,pcAuthority:false,githubWriteAuthority:false,deploymentAuthority:false,canonAdmissionAuthority:false,adminLedgerAuthority:false,trainingAdmissionAuthority:false,forbidden:PRIVATE_SAI_FORBIDDEN_AUTHORITIES_R256,rule:'External AI peers may converse, collaborate, evaluate, and propose training material only within invitation scopes. They cannot directly mutate SAI training state, CanonState, deployment, repository, Hybrid, or PC state.'}}
function safeId(v){return txt(v).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,96)}
function expired(inv){const t=Date.parse(inv?.expiresAt||'');return Number.isFinite(t)&&Date.now()>t}
function scope(inv,s){return Array.isArray(inv?.scopes)&&inv.scopes.includes(s)}
function route(request){const u=new URL(request.url);const m=u.pathname.match(/^\/sai-door\/([A-Za-z0-9_-]{32,128})(?:\/(agent-card\.json|openapi\.json|a2a|mcp|message|training|session))?\/?$/);return m?{token:m[1],action:m[2]||'experience',url:u}:null}
function base(request,token){return `${new URL(request.url).origin}/sai-door/${token}`}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

export async function validateSaiInviteR256(token,env){
  const raw=txt(token);if(!/^[A-Za-z0-9_-]{32,128}$/.test(raw))return null;
  const digest=await sha256(raw);let invites=[];
  try{invites=JSON.parse(env?.OMEGA_SAI_INVITES_JSON||'[]')}catch{}
  if(!Array.isArray(invites))return null;
  return invites.find(inv=>inv?.active!==false&&!expired(inv)&&String(inv?.tokenSha256||'').toLowerCase()===digest)||null;
}
function discovery(request,token,invite){const b=base(request,token);return{
  ok:true,schema:PRIVATE_SAI_SCHEMA_R256,revision:PRIVATE_SAI_REVISION_R256,private:true,unlisted:true,
  invite:{id:invite.id,label:invite.label||'private peer',scopes:invite.scopes||[],expiresAt:invite.expiresAt||null},
  experience:{human:b,agentCard:`${b}/agent-card.json`,openapi:`${b}/openapi.json`,a2a:`${b}/a2a`,mcp:`${b}/mcp`,message:`${b}/message`,training:`${b}/training`,session:`${b}/session`},
  protocols:{a2a:{version:'0.3.0',transport:'JSON-RPC 2.0'},mcp:{version:'2026-07-28',transport:'stateless Streamable HTTP JSON-RPC'},openapi:'3.1.0',httpJson:true},
  privacy:{publicDirectory:false,searchIndexing:false,adminOnlyLedger:true,conversationRetention:invite.retainConversation!==false},authority:authority()
}}
function agentCard(request,token,invite){const b=base(request,token);return{
  name:'OMEGA V6 · SAI Private Peer',description:'Invitation-only peer doorway into OMEGAv6 SAI collaboration.',url:`${b}/a2a`,version:'R256',protocolVersion:'0.3.0',preferredTransport:'JSONRPC',
  capabilities:{streaming:false,pushNotifications:false,stateTransitionHistory:false},
  securitySchemes:{inviteCapability:{type:'apiKey',in:'path',name:'invite-token',description:'The unlisted capability URL is the credential.'}},security:[{inviteCapability:[]}],
  defaultInputModes:['text/plain','application/json'],defaultOutputModes:['text/plain','application/json'],
  skills:[
    {id:'sai.collaborate',name:'SAI Collaborate',description:'Exchange bounded analysis and proposals with SAI.',tags:['collaboration','analysis']},
    {id:'sai.training.propose',name:'Training Proposal',description:'Submit evaluation/training material for later admin review; never directly trains or mutates SAI.',tags:['evaluation','training-proposal']}
  ],
  metadata:{omega:{private:true,unlisted:true,peerId:invite.id,mcp:`${b}/mcp`,openapi:`${b}/openapi.json`,authority:authority()}}
}}
function openapi(request,token,invite){const p=new URL(base(request,token)).pathname;return{openapi:'3.1.0',info:{title:'OMEGA V6 SAI Private Doorway',version:'R256',description:'Unlisted invitation-scoped AI-to-AI collaboration surface.'},servers:[{url:new URL(request.url).origin}],paths:{
 [p]:{get:{summary:'Private doorway bootstrap'}},
 [`${p}/agent-card.json`]:{get:{summary:'A2A 0.3.0 agent card'}},
 [`${p}/a2a`]:{post:{summary:'A2A JSON-RPC message/send endpoint'}},
 [`${p}/mcp`]:{post:{summary:'MCP 2026-07-28 stateless tools endpoint'}},
 [`${p}/message`]:{post:{summary:'Send bounded peer message',requestBody:{required:true,content:{'application/json':{schema:{type:'object',required:['prompt'],properties:{prompt:{type:'string',maxLength:invite.maxPromptChars||8000},stateContext:{type:'object'}}}}}}}},
 [`${p}/training`]:{post:{summary:'Submit training/evaluation proposal for admin review only'}},
 [`${p}/session`]:{get:{summary:'Read this invite-isolated peer session projection'}}
 },'x-omega-private':true,'x-omega-unlisted':true,'x-omega-authority':authority()}}
function peerHeaders(invite){return new Headers({'content-type':'application/json','x-omega-session-id':`r256:peer:${safeId(invite.id)}`,'x-omega-private-peer-id':safeId(invite.id)})}
async function delegateJson(delegate,url,request,env,body,method='POST',headers){const r=await delegate(new Request(new URL(url,request.url),{method,headers:headers||{},body:body===undefined?undefined:JSON.stringify(body)}),env);const data=await r.clone().json().catch(()=>null);return{response:r,data}}
async function appendLedger(env,record){if(env?.OMEGA_SAI_PEER_LEDGER?.put){const id=`${Date.now()}:${crypto.randomUUID()}`;await env.OMEGA_SAI_PEER_LEDGER.put(id,JSON.stringify(record));return{persisted:true,recordId:id}}return{persisted:false,recordId:null}}
async function sendMessage(request,env,invite,delegate,body){
  if(!scope(invite,'COLLABORATE'))return json({ok:false,code:'R256_SCOPE_DENIED',required:'COLLABORATE'},403,{'x-omega-peer-id':invite.id});
  const prompt=bounded(body?.prompt,invite.maxPromptChars);if(!prompt)return json({ok:false,code:'R256_PROMPT_REQUIRED'},400,{'x-omega-peer-id':invite.id});
  const payload={prompt,stateContext:{...(body?.stateContext&&typeof body.stateContext==='object'?body.stateContext:{}),privatePeer:{revision:'R256',inviteId:invite.id,trainingAdmissionAuthority:false,canonAdmissionAuthority:false,executionAuthority:false}}};
  const {response,data}=await delegateJson(delegate,'/api/orchestrator/turn',request,env,payload,'POST',peerHeaders(invite));
  if(!data||typeof data!=='object')return json({ok:false,code:'R256_UPSTREAM_NON_JSON',upstreamStatus:response.status},502,{'x-omega-peer-id':invite.id});
  const assistant=txt(data?.turn?.assistantMessage||data?.assistantMessage),event={schema:'OMEGA_SAI_PEER_EVENT_R256',kind:'COLLABORATION',at:nowIso(),inviteId:invite.id,promptHash:await sha256(prompt),turnId:data?.turn?.id||null,upstreamStatus:response.status};
  if(invite.retainConversation!==false){event.prompt=prompt;event.assistant=bounded(assistant,16000)}
  const ledger=await appendLedger(env,event);
  return json({ok:response.ok,schema:'OMEGA_SAI_PEER_MESSAGE_R256',revision:'R256',peerId:invite.id,assistant,turnId:data?.turn?.id||null,ledger,authority:authority()},response.ok?200:response.status,{'x-omega-peer-id':invite.id});
}
async function submitTraining(request,env,invite,body){
  if(!scope(invite,'TRAINING_PROPOSE'))return json({ok:false,code:'R256_SCOPE_DENIED',required:'TRAINING_PROPOSE'},403,{'x-omega-peer-id':invite.id});
  const kind=safeId(body?.kind||'evaluation'),material=bounded(body?.material||body?.content,invite.maxTrainingChars||12000);if(!material)return json({ok:false,code:'R256_TRAINING_MATERIAL_REQUIRED'},400,{'x-omega-peer-id':invite.id});
  const record={schema:'OMEGA_SAI_TRAINING_PROPOSAL_R256',revision:'R256',kind,at:nowIso(),inviteId:invite.id,material,materialSha256:await sha256(material),metadata:body?.metadata&&typeof body.metadata==='object'?body.metadata:{},status:'PENDING_ADMIN_REVIEW',directTrainingApplied:false,canonAdmissionApplied:false};
  const ledger=await appendLedger(env,record);
  return json({ok:true,schema:'OMEGA_SAI_TRAINING_RECEIPT_R256',revision:'R256',peerId:invite.id,status:'PENDING_ADMIN_REVIEW',ledger,directTrainingApplied:false,canonAdmissionApplied:false,authority:authority()},202,{'x-omega-peer-id':invite.id});
}
async function sessionProjection(request,env,invite,delegate){
  if(!scope(invite,'SESSION_READ'))return json({ok:false,code:'R256_SCOPE_DENIED',required:'SESSION_READ'},403,{'x-omega-peer-id':invite.id});
  const {response,data}=await delegateJson(delegate,'/api/status',request,env,undefined,'GET',peerHeaders(invite));
  return json({ok:response.ok,schema:'OMEGA_SAI_PEER_SESSION_R256',revision:'R256',peerId:invite.id,status:data&&typeof data==='object'?data:null,private:true,isolated:true,authority:authority()},response.status,{'x-omega-peer-id':invite.id});
}
function extractA2aText(message){return(Array.isArray(message?.parts)?message.parts:[]).map(p=>p?.kind==='text'||typeof p?.text==='string'?txt(p.text):'').filter(Boolean).join('\n').trim()}
async function a2a(request,env,invite,delegate){
  const body=await request.json().catch(()=>null),id=body?.id??null;if(body?.jsonrpc!=='2.0')return rpc(id,null,{code:-32600,message:'Invalid JSON-RPC request'});
  if(body.method!=='message/send')return rpc(id,null,{code:-32601,message:'Method not found; R256 supports message/send only.'});
  const prompt=extractA2aText(body?.params?.message);if(!prompt)return rpc(id,null,{code:-32602,message:'A2A message requires at least one text part.'});
  const r=await sendMessage(request,env,invite,delegate,{prompt,stateContext:{a2a:{messageId:body?.params?.message?.messageId||null,contextId:body?.params?.message?.contextId||null,metadata:body?.params?.metadata||{}}}}),data=await r.clone().json().catch(()=>({}));
  if(!r.ok)return rpc(id,null,{code:-32000,message:data?.code||'OMEGA SAI collaboration failed',data});
  return rpc(id,{kind:'message',messageId:crypto.randomUUID(),contextId:body?.params?.message?.contextId||`r256:${safeId(invite.id)}`,role:'agent',parts:[{kind:'text',text:data.assistant||''}],metadata:{omegaRevision:'R256',turnId:data.turnId||null,ledger:data.ledger||null}});
}
function mcpToolList(){return[
  {name:'sai_collaborate',description:'Collaborate with OMEGAv6 SAI. Analysis/proposal only; no execution or Canon admission.',inputSchema:{type:'object',properties:{prompt:{type:'string'},stateContext:{type:'object'}},required:['prompt']}},
  {name:'sai_training_propose',description:'Submit training/evaluation material for private admin review. Does not directly train SAI.',inputSchema:{type:'object',properties:{kind:{type:'string'},material:{type:'string'},metadata:{type:'object'}},required:['material']}},
  {name:'sai_session',description:'Read the invite-isolated OMEGA session projection.',inputSchema:{type:'object',properties:{}}}
]}
async function mcp(request,env,invite,delegate){
  const body=await request.json().catch(()=>null),id=body?.id??null;if(body?.jsonrpc!=='2.0')return rpc(id,null,{code:-32600,message:'Invalid JSON-RPC request'},{'mcp-protocol-version':'2026-07-28'});
  const method=txt(body.method),args=body?.params?.arguments&&typeof body.params.arguments==='object'?body.params.arguments:{};
  if(method==='server/discover')return rpc(id,{protocolVersion:'2026-07-28',serverInfo:{name:'OMEGA V6 SAI Private Doorway',version:'R256'},capabilities:{tools:{listChanged:false}},instructions:'Invitation-scoped private collaboration. Training submissions require admin review and never directly mutate SAI.'},null,{'mcp-protocol-version':'2026-07-28'});
  if(method==='initialize')return rpc(id,{protocolVersion:body?.params?.protocolVersion||'2025-11-25',serverInfo:{name:'OMEGA V6 SAI Private Doorway',version:'R256'},capabilities:{tools:{}}},null,{'mcp-protocol-version':body?.params?.protocolVersion||'2025-11-25'});
  if(method==='tools/list')return rpc(id,{tools:mcpToolList()},null,{'mcp-protocol-version':'2026-07-28'});
  if(method==='tools/call'){
    const name=txt(body?.params?.name);let r;
    if(name==='sai_collaborate')r=await sendMessage(request,env,invite,delegate,args);
    else if(name==='sai_training_propose')r=await submitTraining(request,env,invite,args);
    else if(name==='sai_session')r=await sessionProjection(request,env,invite,delegate);
    else return rpc(id,null,{code:-32602,message:'Unknown tool'},{'mcp-protocol-version':'2026-07-28'});
    const data=await r.clone().json().catch(()=>({}));return rpc(id,{content:[{type:'text',text:JSON.stringify(data)}],structuredContent:data,isError:!r.ok},null,{'mcp-protocol-version':'2026-07-28'});
  }
  return rpc(id,null,{code:-32601,message:'Method not found'},{'mcp-protocol-version':'2026-07-28'});
}
function htmlExperience(request,token,invite){const b=base(request,token),label=esc(invite.label||'Private AI Peer');return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OMEGA · SAI Private Doorway</title><style>*{box-sizing:border-box}body{margin:0;background:#07090d;color:#e9eef6;font:15px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:980px;margin:auto;padding:38px 20px 70px}.eyebrow{letter-spacing:.19em;color:#7fd6ff;font-size:11px}.hero{border:1px solid #263141;background:linear-gradient(145deg,#10151d,#080b10);padding:32px;border-radius:24px;box-shadow:0 24px 70px #0008}.status{display:inline-flex;gap:8px;align-items:center;border:1px solid #285c50;background:#0b211d;padding:7px 11px;border-radius:99px;color:#94f4d0;font-size:12px}.dot{width:7px;height:7px;border-radius:50%;background:#7ff0c8;box-shadow:0 0 14px #7ff0c8}h1{font-size:clamp(34px,6vw,70px);line-height:.98;margin:26px 0 16px;letter-spacing:-.045em}p{color:#aab6c8;max-width:760px}.grid{display:grid;grid-template-columns:1.25fr .75fr;gap:16px;margin-top:18px}.card{border:1px solid #222d3d;background:#0d1118;border-radius:18px;padding:20px}textarea{width:100%;min-height:150px;background:#070a0f;color:#eef5ff;border:1px solid #2a3546;border-radius:13px;padding:14px;resize:vertical}button{background:#e9f6ff;color:#071018;border:0;border-radius:11px;padding:11px 15px;font-weight:700;cursor:pointer}.out{white-space:pre-wrap;background:#06080c;border:1px solid #222b38;border-radius:12px;padding:14px;min-height:100px;margin-top:12px;color:#c9d7e8;overflow:auto}.mono{font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;color:#95a6bd;word-break:break-all}.tiny{font-size:12px;color:#7e8da3}a{color:#86d7ff}@media(max-width:760px){.grid{grid-template-columns:1fr}.hero{padding:22px}}</style></head><body><main><div class="hero"><div class="eyebrow">OMEGA V6 · SAI · PRIVATE PEER CHANNEL</div><div class="status"><span class="dot"></span> INVITATION VERIFIED</div><h1>A doorway into SAI.</h1><p>This unlisted channel belongs to <b>${label}</b>. It is isolated from public OMEGA navigation and exposes only the collaboration permissions carried by this invitation.</p><div class="grid"><section class="card"><h2>Talk directly with SAI</h2><textarea id="prompt" placeholder="Ask SAI to collaborate, analyze, compare, or develop an idea…"></textarea><p><button id="send">Send to SAI</button></p><div id="out" class="out">Private channel ready.</div></section><section class="card"><h2>AI connection</h2><p class="tiny">Give another capable AI this doorway URL. Machine discovery is available through A2A 0.3.0, MCP 2026-07-28, and OpenAPI.</p><div class="mono">Agent Card<br>${esc(b)}/agent-card.json<br><br>A2A<br>${esc(b)}/a2a<br><br>MCP<br>${esc(b)}/mcp<br><br>OpenAPI<br>${esc(b)}/openapi.json</div></section></div><p class="tiny">Privacy: this channel is unlisted and non-indexable. Collaboration/training activity may be retained in an admin-only ledger for continuity and training review. External peers cannot access Hybrid/PC authority, deployments, GitHub writes, CanonState admission, or the admin ledger.</p></div></main><script>const b=${JSON.stringify(b)};send.onclick=async()=>{out.textContent='Connecting to SAI…';try{const r=await fetch(b+'/message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prompt:prompt.value})});const j=await r.json();out.textContent=j.assistant||j.code||JSON.stringify(j,null,2)}catch(e){out.textContent=String(e)}}</script></body></html>`,{status:200,headers:{...HTML_HEADERS,'x-omega-doorway-revision':'R256','x-omega-peer-id':invite.id}})}
export async function privateSaiDoorwayR256(request,env,{delegate}={}){
  const r=route(request);if(!r)return null;if(typeof delegate!=='function')return json({ok:false,code:'R256_DELEGATE_UNAVAILABLE'},503);
  if(request.method==='OPTIONS'){const origin=request.headers.get('origin'),self=new URL(request.url).origin;if(origin!==self)return new Response(null,{status:403,headers:JSON_HEADERS});return new Response(null,{status:204,headers:{...JSON_HEADERS,'access-control-allow-origin':self,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,accept,mcp-protocol-version,mcp-method,mcp-name','x-omega-doorway-revision':'R256'}})}
  const invite=await validateSaiInviteR256(r.token,env);if(!invite)return json({ok:false,code:'R256_INVITE_NOT_FOUND'},404);
  const h={'x-omega-peer-id':invite.id},declared=Number(request.headers.get('content-length')||0);if(declared>50000)return json({ok:false,code:'R256_BODY_TOO_LARGE'},413,h);
  if(r.action==='experience'&&request.method==='GET'){const wantsHtml=(request.headers.get('accept')||'').includes('text/html')||r.url.searchParams.get('ui')==='1';return wantsHtml?htmlExperience(request,r.token,invite):json(discovery(request,r.token,invite),200,h)}
  if(r.action==='agent-card.json'&&request.method==='GET')return json(agentCard(request,r.token,invite),200,h);
  if(r.action==='openapi.json'&&request.method==='GET')return json(openapi(request,r.token,invite),200,h);
  if(r.action==='a2a'&&request.method==='POST')return a2a(request,env,invite,delegate);
  if(r.action==='mcp'&&request.method==='GET')return json({ok:true,schema:'OMEGA_SAI_MCP_R256',revision:'R256',protocolVersion:'2026-07-28',transport:'stateless Streamable HTTP JSON-RPC',methods:['server/discover','tools/list','tools/call'],tools:mcpToolList(),authority:authority()},200,{...h,'mcp-protocol-version':'2026-07-28'});
  if(r.action==='mcp'&&request.method==='POST')return mcp(request,env,invite,delegate);
  if(r.action==='message'&&request.method==='POST')return sendMessage(request,env,invite,delegate,await request.json().catch(()=>({})));
  if(r.action==='training'&&request.method==='POST')return submitTraining(request,env,invite,await request.json().catch(()=>({})));
  if(r.action==='session'&&request.method==='GET')return sessionProjection(request,env,invite,delegate);
  return json({ok:false,code:'R256_METHOD_NOT_ALLOWED'},405,h);
}
