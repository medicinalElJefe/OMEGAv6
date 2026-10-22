const JSON_HEADERS=Object.freeze({
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store, max-age=0',
  'referrer-policy':'no-referrer',
  'x-robots-tag':'noindex, nofollow, noarchive',
  'x-content-type-options':'nosniff'
});
const PUBLIC_JSON_HEADERS=Object.freeze({
  ...JSON_HEADERS,
  'access-control-allow-origin':'*',
  'cross-origin-resource-policy':'cross-origin'
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

export const PRIVATE_SAI_REVISION_R261='R261';
export const PRIVATE_SAI_SCHEMA_R261='OMEGA_SAI_INTEROP_GATEWAY_R261';
export const PRIVATE_SAI_FORBIDDEN_AUTHORITIES_R261=Object.freeze([
  'HYBRID_SECRET','PC_PAIRING','R147_EXECUTION_DISPATCH','GITHUB_WRITE',
  'PRODUCTION_DEPLOYMENT','CLOUDFLARE_AUTHORITY','R125_CANONSTATE_ADMISSION',
  'ADMIN_LEDGER_READ','DIRECT_TRAINING_ADMISSION'
]);
const enc=new TextEncoder(),dec=new TextDecoder();
const txt=v=>String(v??'').trim();
const safeId=v=>txt(v).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,96);
const safeSlug=v=>txt(v).toLowerCase().replace(/[^a-z0-9._-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,96);
const bounded=(v,n=8000)=>txt(v).slice(0,Math.max(1,Math.min(24000,Number(n)||8000)));
const nowIso=()=>new Date().toISOString();
const hex=bytes=>[...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');
async function sha256(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(String(value))))}
function randomToken(bytes=32){const a=new Uint8Array(bytes);crypto.getRandomValues(a);let s='';for(const b of a)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function authority(){return{
  peerExecutionAuthority:false,hybridAuthority:false,pcAuthority:false,githubWriteAuthority:false,
  deploymentAuthority:false,canonAdmissionAuthority:false,adminLedgerAuthority:false,trainingAdmissionAuthority:false,
  forbidden:PRIVATE_SAI_FORBIDDEN_AUTHORITIES_R261,
  rule:'This gateway authorizes collaboration, bounded analysis/tasks, session reads, and training proposals only. It never grants PC, Hybrid, repository, deployment, CanonState, admin-ledger, or direct-training authority.'
}}
function json(body,status=200,extra={},publicRead=false){
  return new Response(JSON.stringify(body,null,2),{status,headers:{...(publicRead?PUBLIC_JSON_HEADERS:JSON_HEADERS),'x-omega-doorway-revision':PRIVATE_SAI_REVISION_R261,...extra}})
}
function rpc(id,result,error=null,extra={}){
  return json(error?{jsonrpc:'2.0',id:id??null,error}:{jsonrpc:'2.0',id:id??null,result},error?400:200,extra)
}
class BodyTooLarge extends Error{}
async function readTextBounded(request,limit=50000){
  const declared=Number(request.headers.get('content-length')||0);
  if(Number.isFinite(declared)&&declared>limit)throw new BodyTooLarge('declared body too large');
  if(!request.body)return'';
  const reader=request.body.getReader(),parts=[];let total=0;
  try{
    while(true){
      const {done,value}=await reader.read();if(done)break;
      total+=value?.byteLength||0;if(total>limit){await reader.cancel();throw new BodyTooLarge('stream body too large')}
      if(value)parts.push(value);
    }
  }finally{try{reader.releaseLock()}catch{}}
  const out=new Uint8Array(total);let at=0;for(const p of parts){out.set(p,at);at+=p.byteLength}
  return dec.decode(out);
}
async function readJsonBounded(request,limit=50000){
  const raw=await readTextBounded(request,limit);if(!raw)return{};
  try{return JSON.parse(raw)}catch{return null}
}
function parseInvites(env){try{const v=JSON.parse(env?.OMEGA_SAI_INVITES_JSON||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function expired(inv){const t=Date.parse(inv?.expiresAt||'');return Number.isFinite(t)&&Date.now()>t}
function inviteSlug(inv){return safeSlug(inv?.publicSlug||inv?.id||'')}
function scope(inv,s){return Array.isArray(inv?.scopes)&&inv.scopes.includes(s)}
function activeInvite(inv){return Boolean(inv&&inv.active!==false&&!expired(inv))}
export async function validateSaiInviteR261(token,env,expectedId=null){
  const raw=txt(token);if(!/^[A-Za-z0-9_-]{32,256}$/.test(raw))return null;
  const digest=await sha256(raw);
  return parseInvites(env).find(inv=>activeInvite(inv)&&(!expectedId||String(inv.id)===String(expectedId))&&String(inv?.tokenSha256||'').toLowerCase()===digest)||null
}
export function findSaiInviteBySlugR261(slug,env){
  const key=safeSlug(slug);return parseInvites(env).find(inv=>activeInvite(inv)&&inviteSlug(inv)===key)||null
}
function cookieValue(request,name){
  const raw=request.headers.get('cookie')||'';
  for(const item of raw.split(';')){const [k,...rest]=item.trim().split('=');if(k===name)return decodeURIComponent(rest.join('='))}
  return''
}
function bearer(request){return String(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim()}
function sessionCookieName(invite){return `omega_sai_${safeId(invite.id).replace(/[^A-Za-z0-9_]/g,'_')}`.slice(0,64)}
async function issueSession(env,invite){
  const accessToken=randomToken(32),digest=await sha256(accessToken);
  const ttl=Math.max(300,Math.min(86400,Number(invite.sessionTtlSeconds)||3600));
  const record={schema:'OMEGA_SAI_PEER_SESSION_R261',revision:'R261',inviteId:invite.id,publicSlug:inviteSlug(invite),createdAt:nowIso(),expiresAt:new Date(Date.now()+ttl*1000).toISOString(),scopes:invite.scopes||[]};
  if(!env?.OMEGA_SAI_PEER_LEDGER?.sessionPut)throw new Error('R261_SESSION_STORE_UNAVAILABLE');
  await env.OMEGA_SAI_PEER_LEDGER.sessionPut(digest,JSON.stringify(record),ttl);
  return{accessToken,ttl,record}
}
async function validateSession(request,env,invite){
  const raw=bearer(request)||cookieValue(request,sessionCookieName(invite));if(!raw)return null;
  const direct=await validateSaiInviteR261(raw,env,invite.id);
  if(direct)return{invite:direct,bootstrapCredential:true,session:null};
  const digest=await sha256(raw),stored=await env?.OMEGA_SAI_PEER_LEDGER?.sessionGet?.(digest);
  if(!stored)return null;
  let record;try{record=typeof stored==='string'?JSON.parse(stored):stored}catch{return null}
  if(record?.inviteId!==invite.id)return null;
  const exp=Date.parse(record?.expiresAt||'');if(Number.isFinite(exp)&&Date.now()>exp)return null;
  return{invite,bootstrapCredential:false,session:record}
}
function publicBase(request,invite){return `${new URL(request.url).origin}/connect/${inviteSlug(invite)}`}
function publicDiscovery(request,invite){
  const b=publicBase(request,invite);
  return{
    ok:true,schema:PRIVATE_SAI_SCHEMA_R261,revision:'R261',
    purpose:'Authorized OMEGA SAI collaboration gateway',
    publicDiscovery:true,credentialInUrl:false,searchIndexing:false,
    invitation:{id:invite.id,label:invite.label||'OMEGA SAI collaborator',expiresAt:invite.expiresAt||null},
    endpoints:{
      human:b,agentCard:`${b}/agent-card.json`,openapi:`${b}/openapi.json`,
      authorize:`${b}/authorize`,a2a:`${b}/a2a`,mcp:`${b}/mcp`,
      message:`${b}/message`,training:`${b}/training`,session:`${b}/session`
    },
    protocols:{
      a2a:{versions:['1.0','0.3'],preferred:'1.0',binding:'JSON-RPC 2.0'},
      mcp:{version:'2026-07-28',transport:'stateless Streamable HTTP JSON-RPC'},
      openapi:'3.1.0',httpJson:true
    },
    connection:{
      step1:'Read discovery/Agent Card/OpenAPI without credentials.',
      step2:'POST the separately supplied invitation key to /authorize or send it as a Bearer bootstrap credential.',
      step3:'Use the returned short-lived accessToken as Authorization: Bearer <token> for protected calls.',
      recommendedForAI:'MCP tools/list -> tools/call sai_collaborate, or A2A 1.0 SendMessage.',
      taskBoundary:'A2A tasks are collaboration/analysis tasks. They never mean native PC, Hybrid, GitHub, deployment, or Canon execution.'
    },
    authority:authority()
  }
}
function agentCard(request,invite){
  const b=publicBase(request,invite);
  return{
    name:'OMEGA V6 · SAI Collaboration Gateway',
    description:'Invitation-scoped AI-to-AI collaboration with OMEGA SAI. Read-only discovery is public to the invitation URL; protected interaction requires an authorized peer credential.',
    version:'R261',protocolVersion:'1.0',
    supportedInterfaces:[
      {url:`${b}/a2a`,protocolBinding:'JSONRPC',protocolVersion:'1.0'},
      {url:`${b}/a2a`,protocolBinding:'JSONRPC',protocolVersion:'0.3'}
    ],
    preferredTransport:'JSONRPC',
    capabilities:{streaming:false,pushNotifications:false,stateTransitionHistory:true},
    securitySchemes:{peerSession:{type:'http',scheme:'bearer',bearerFormat:'OMEGA-PEER-SESSION',description:`Obtain a short-lived peer session from ${b}/authorize using the separately supplied invitation key.`}},
    security:[{peerSession:[]}],
    defaultInputModes:['text/plain','application/json'],defaultOutputModes:['text/plain','application/json'],
    skills:[
      {id:'sai.collaborate',name:'SAI Collaborate',description:'Bounded analysis, comparison, development, and proposal work with SAI. No native execution authority.',tags:['collaboration','analysis','development']},
      {id:'sai.training.propose',name:'Training Proposal',description:'Submit evaluation/training material for later admin review; never directly trains or mutates SAI.',tags:['evaluation','training-proposal']}
    ],
    metadata:{omega:{revision:'R261',publicDiscovery:true,credentialInUrl:false,authorize:`${b}/authorize`,mcp:`${b}/mcp`,openapi:`${b}/openapi.json`,authority:authority()}}
  }
}
function operation(summary,responses,extra={}){return{summary,responses,...extra}}
function openapi(request,invite){
  const b=publicBase(request,invite),p=new URL(b).pathname;
  const ok={description:'Successful response'},bad={description:'Invalid request'},unauth={description:'Authorized peer credential required'};
  return{
    openapi:'3.1.0',
    info:{title:'OMEGA V6 SAI Collaboration Gateway',version:'R261',description:'Invitation-scoped AI-to-AI collaboration. Discovery is credential-free; interaction uses short-lived bearer sessions.'},
    servers:[{url:new URL(request.url).origin}],
    components:{securitySchemes:{peerSession:{type:'http',scheme:'bearer',bearerFormat:'OMEGA-PEER-SESSION'}}},
    paths:{
      [p]:{get:operation('Read collaboration gateway discovery',{'200':ok})},
      [`${p}/agent-card.json`]:{get:operation('Read A2A Agent Card',{'200':ok})},
      [`${p}/openapi.json`]:{get:operation('Read this OpenAPI document',{'200':ok})},
      [`${p}/authorize`]:{post:operation('Exchange a separately supplied invitation key for a short-lived peer session',{'200':ok,'400':bad,'401':unauth},{requestBody:{required:false,content:{'application/json':{schema:{type:'object',properties:{inviteKey:{type:'string',minLength:32,maxLength:256}}}}}}})},
      [`${p}/message`]:{post:operation('Send a bounded collaboration message',{'200':ok,'400':bad,'401':unauth},{security:[{peerSession:[]}],requestBody:{required:true,content:{'application/json':{schema:{type:'object',required:['prompt'],properties:{prompt:{type:'string',maxLength:invite.maxPromptChars||12000},stateContext:{type:'object'}}}}}}})},
      [`${p}/a2a`]:{post:operation('A2A JSON-RPC 1.0 / 0.3 compatibility endpoint',{'200':ok,'400':bad,'401':unauth},{security:[{peerSession:[]}]})},
      [`${p}/mcp`]:{get:operation('Read MCP capabilities',{'200':ok}),post:operation('MCP 2026-07-28 stateless endpoint',{'200':ok,'400':bad,'401':unauth},{security:[{peerSession:[]}]})},
      [`${p}/training`]:{post:operation('Submit a training/evaluation proposal for admin review only',{'202':{description:'Proposal accepted for admin review'},'400':bad,'401':unauth},{security:[{peerSession:[]}]})},
      [`${p}/session`]:{get:operation('Read this invite-isolated peer session projection',{'200':ok,'401':unauth},{security:[{peerSession:[]}]})}
    },
    'x-omega-revision':'R261','x-omega-authority':authority()
  }
}
function sanitizeExternalContext(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return{};
  const out={};
  for(const k of ['topic','objective','peerNote']){
    if(typeof value[k]==='string')out[k]=bounded(value[k],1200);
  }
  if(Array.isArray(value.constraints))out.constraints=value.constraints.filter(x=>typeof x==='string').slice(0,12).map(x=>bounded(x,500));
  if(Array.isArray(value.references))out.references=value.references.filter(x=>typeof x==='string'&&/^https:\/\//i.test(x)).slice(0,12).map(x=>bounded(x,1200));
  return out
}
async function appendLedger(env,record){
  if(env?.OMEGA_SAI_PEER_LEDGER?.put){
    const id=`${Date.now()}:${crypto.randomUUID()}`;await env.OMEGA_SAI_PEER_LEDGER.put(id,JSON.stringify(record));return{persisted:true,recordId:id}
  }
  return{persisted:false,recordId:null}
}
async function enforceRate(env,invite,action){
  const store=env?.OMEGA_SAI_PEER_LEDGER;if(!store?.rate)return null;
  const policy=action==='training'?{limit:30,windowMs:3600000}:{limit:120,windowMs:3600000};
  const r=await store.rate(invite.id,action,policy.limit,policy.windowMs);
  return r?.allowed===false?r:null
}
function peerHeaders(invite){
  return new Headers({'content-type':'application/json','x-omega-session-id':`r261:peer:${safeId(invite.id)}`,'x-omega-private-peer-id':safeId(invite.id)})
}
async function delegateJson(delegate,url,request,env,body,method='POST',headers){
  const r=await delegate(new Request(new URL(url,request.url),{method,headers:headers||{},body:body===undefined?undefined:JSON.stringify(body)}),env);
  const data=await r.clone().json().catch(()=>null);return{response:r,data}
}
async function sendMessage(request,env,invite,delegate,body){
  if(!scope(invite,'COLLABORATE'))return json({ok:false,code:'R261_SCOPE_DENIED',required:'COLLABORATE'},403);
  const limited=await enforceRate(env,invite,'collaboration');if(limited)return json({ok:false,code:'R256_RATE_LIMITED',retryAfterMs:limited.retryAfterMs||60000},429);
  const prompt=bounded(body?.prompt,invite.maxPromptChars||12000);if(!prompt)return json({ok:false,code:'R261_PROMPT_REQUIRED'},400);
  const externalContext=sanitizeExternalContext(body?.stateContext);
  const payload={prompt,stateContext:{externalContext,privatePeer:{revision:'R261',inviteId:invite.id,taskClass:'COLLABORATION_ONLY',trainingAdmissionAuthority:false,canonAdmissionAuthority:false,executionAuthority:false}}};
  const {response,data}=await delegateJson(delegate,'/api/orchestrator/turn',request,env,payload,'POST',peerHeaders(invite));
  if(!data||typeof data!=='object')return json({ok:false,code:'R261_UPSTREAM_NON_JSON',upstreamStatus:response.status},502);
  const assistant=txt(data?.turn?.assistantMessage||data?.assistantMessage);
  const event={schema:'OMEGA_SAI_PEER_EVENT_R261',kind:'COLLABORATION',at:nowIso(),inviteId:invite.id,promptHash:await sha256(prompt),turnId:data?.turn?.id||null,upstreamStatus:response.status,nativeExecutionPerformed:false};
  if(invite.retainConversation!==false){event.prompt=prompt;event.assistant=bounded(assistant,16000)}
  const ledger=await appendLedger(env,event);
  return json({ok:response.ok,schema:'OMEGA_SAI_PEER_MESSAGE_R261',revision:'R261',peerId:invite.id,assistant,turnId:data?.turn?.id||null,ledger,nativeExecutionPerformed:false,authority:authority()},response.ok?200:response.status)
}
async function submitTraining(request,env,invite,body){
  if(!scope(invite,'TRAINING_PROPOSE'))return json({ok:false,code:'R261_SCOPE_DENIED',required:'TRAINING_PROPOSE'},403);
  const limited=await enforceRate(env,invite,'training');if(limited)return json({ok:false,code:'R256_RATE_LIMITED',retryAfterMs:limited.retryAfterMs||60000},429);
  const kind=safeId(body?.kind||'evaluation'),material=bounded(body?.material||body?.content,invite.maxTrainingChars||20000);
  if(!material)return json({ok:false,code:'R261_TRAINING_MATERIAL_REQUIRED'},400);
  const record={schema:'OMEGA_SAI_TRAINING_PROPOSAL_R261',revision:'R261',kind,at:nowIso(),inviteId:invite.id,material,materialSha256:await sha256(material),metadata:body?.metadata&&typeof body.metadata==='object'?sanitizeExternalContext(body.metadata):{},status:'PENDING_ADMIN_REVIEW',directTrainingApplied:false,canonAdmissionApplied:false};
  const ledger=await appendLedger(env,record);
  return json({ok:true,schema:'OMEGA_SAI_TRAINING_RECEIPT_R261',revision:'R261',peerId:invite.id,status:'PENDING_ADMIN_REVIEW',ledger,directTrainingApplied:false,canonAdmissionApplied:false,authority:authority()},202)
}
async function sessionProjection(request,env,invite,delegate){
  if(!scope(invite,'SESSION_READ'))return json({ok:false,code:'R261_SCOPE_DENIED',required:'SESSION_READ'},403);
  const {response,data}=await delegateJson(delegate,'/api/status',request,env,undefined,'GET',peerHeaders(invite));
  const safe=data&&typeof data==='object'?{
    ok:data.ok??null,schema:data.schema||null,revision:data.revision||null,state:data.state||null,
    hybridLink:data.hybridLink?{state:data.hybridLink.state||null,nativeExecutionClaimed:Boolean(data.hybridLink.nativeExecutionClaimed)}:undefined
  }:null;
  return json({ok:response.ok,schema:'OMEGA_SAI_PEER_SESSION_R261',revision:'R261',peerId:invite.id,status:safe,isolated:true,authority:authority()},response.status)
}
function extractA2aText(message){
  return(Array.isArray(message?.parts)?message.parts:[]).map(p=>typeof p?.text==='string'?txt(p.text):typeof p?.root?.text==='string'?txt(p.root.text):'').filter(Boolean).join('\n').trim()
}
function a2aRole(role){return String(role||'').toUpperCase().includes('AGENT')?'ROLE_AGENT':'ROLE_USER'}
function a2aMessage(role,text,contextId,taskId=null){
  return{messageId:crypto.randomUUID(),contextId,taskId:taskId||undefined,role:a2aRole(role),parts:[{text:String(text||'')}]}
}
async function persistTask(env,invite,task){
  if(env?.OMEGA_SAI_PEER_LEDGER?.taskPut)await env.OMEGA_SAI_PEER_LEDGER.taskPut(invite.id,task.id,JSON.stringify(task))
}
async function readTask(env,invite,id){
  const raw=await env?.OMEGA_SAI_PEER_LEDGER?.taskGet?.(invite.id,safeId(id));if(!raw)return null;
  try{return typeof raw==='string'?JSON.parse(raw):raw}catch{return null}
}
async function listTasks(env,invite,limit=50){
  const rows=await env?.OMEGA_SAI_PEER_LEDGER?.taskList?.(invite.id,Math.max(1,Math.min(100,Number(limit)||50)))||[];
  return rows.map(raw=>{try{return typeof raw==='string'?JSON.parse(raw):raw}catch{return null}}).filter(Boolean).sort((a,b)=>String(b?.status?.timestamp||'').localeCompare(String(a?.status?.timestamp||'')))
}
async function a2aSend(request,env,invite,delegate,message,legacy=false){
  const prompt=extractA2aText(message);if(!prompt)return{error:{code:-32602,message:'A2A message requires at least one text part.'}};
  const r=await sendMessage(request,env,invite,delegate,{prompt,stateContext:{topic:'A2A collaboration'}});
  const data=await r.clone().json().catch(()=>({}));if(!r.ok)return{error:{code:-32000,message:data?.code||'OMEGA SAI collaboration failed',data}};
  const contextId=safeId(message?.contextId)||`r261:${safeId(invite.id)}`;
  if(legacy){
    return{result:{kind:'message',messageId:crypto.randomUUID(),contextId,role:'agent',parts:[{kind:'text',text:data.assistant||''}],metadata:{omegaRevision:'R261',turnId:data.turnId||null,nativeExecutionPerformed:false}}}
  }
  const taskId=safeId(message?.taskId)||crypto.randomUUID(),statusMessage=a2aMessage('agent',data.assistant||'',contextId,taskId);
  const task={id:taskId,contextId,status:{state:'TASK_STATE_COMPLETED',message:statusMessage,timestamp:nowIso()},history:[{...a2aMessage('user',prompt,contextId,taskId),messageId:message?.messageId||crypto.randomUUID()},statusMessage],metadata:{omegaRevision:'R261',taskClass:'COLLABORATION_ONLY',nativeExecutionPerformed:false,turnId:data.turnId||null}};
  await persistTask(env,invite,task);return{result:{task}}
}
async function a2aRpc(request,env,invite,delegate,body){
  const id=body?.id??null;if(body?.jsonrpc!=='2.0')return rpc(id,null,{code:-32600,message:'Invalid JSON-RPC request'});
  const requested=txt(request.headers.get('a2a-version')||'0.3'),method=txt(body.method);
  if(requested!=='1.0'&&requested!=='0.3')return rpc(id,null,{code:-32005,message:'A2A version not supported',data:{supportedVersions:['1.0','0.3']}});
  if(method==='message/send')return (({result,error})=>rpc(id,result,error))(await a2aSend(request,env,invite,delegate,body?.params?.message,true));
  if(method==='SendMessage')return (({result,error})=>rpc(id,result,error))(await a2aSend(request,env,invite,delegate,body?.params?.message,false));
  if(method==='GetTask'||method==='tasks/get'){
    const task=await readTask(env,invite,body?.params?.id);return task?rpc(id,method==='GetTask'?{task}:task):rpc(id,null,{code:-32001,message:'Task not found'})
  }
  if(method==='ListTasks'){
    const tasks=await listTasks(env,invite,body?.params?.pageSize);return rpc(id,{tasks,nextPageToken:'',pageSize:Math.max(1,Math.min(100,Number(body?.params?.pageSize)||50)),totalSize:tasks.length})
  }
  if(method==='CancelTask'||method==='tasks/cancel'){
    const task=await readTask(env,invite,body?.params?.id);if(!task)return rpc(id,null,{code:-32001,message:'Task not found'});
    if(String(task?.status?.state||'').startsWith('TASK_STATE_COMPLETE'))return rpc(id,null,{code:-32002,message:'Task is already terminal and cannot be canceled'});
    task.status={state:'TASK_STATE_CANCELED',timestamp:nowIso()};await persistTask(env,invite,task);return rpc(id,method==='CancelTask'?{task}:task)
  }
  return rpc(id,null,{code:-32601,message:'Method not found',data:{supported:['SendMessage','GetTask','ListTasks','CancelTask','message/send','tasks/get','tasks/cancel']}})
}
function mcpToolList(){return[
  {name:'sai_collaborate',description:'Collaborate with OMEGA SAI. Analysis/proposal only; no PC, Hybrid, repository, deployment, or Canon execution.',inputSchema:{type:'object',properties:{prompt:{type:'string'},stateContext:{type:'object'}},required:['prompt']}},
  {name:'sai_training_propose',description:'Submit evaluation/training material for private admin review. Does not directly train SAI.',inputSchema:{type:'object',properties:{kind:{type:'string'},material:{type:'string'},metadata:{type:'object'}},required:['material']}},
  {name:'sai_session',description:'Read the invite-isolated OMEGA session projection.',inputSchema:{type:'object',properties:{}}}
]}
function mcpHeadersOk(request,body){
  const version=txt(request.headers.get('mcp-protocol-version')),method=txt(request.headers.get('mcp-method')),name=txt(request.headers.get('mcp-name'));
  if(version!=='2026-07-28')return{ok:false,message:'MCP-Protocol-Version 2026-07-28 is required'};
  if(method!==txt(body?.method))return{ok:false,message:'Mcp-Method header must match JSON-RPC method'};
  if(body?.method==='tools/call'&&name!==txt(body?.params?.name))return{ok:false,message:'Mcp-Name header must match params.name'};
  return{ok:true}
}
async function mcp(request,env,invite,delegate,body){
  const id=body?.id??null;if(body?.jsonrpc!=='2.0')return rpc(id,null,{code:-32600,message:'Invalid JSON-RPC request'},{'mcp-protocol-version':'2026-07-28'});
  const hdr=mcpHeadersOk(request,body);if(!hdr.ok)return rpc(id,null,{code:-32020,message:'HeaderMismatch',data:{detail:hdr.message}},{'mcp-protocol-version':'2026-07-28'});
  const method=txt(body.method),args=body?.params?.arguments&&typeof body.params.arguments==='object'?body.params.arguments:{};
  if(method==='server/discover')return rpc(id,{protocolVersion:'2026-07-28',serverInfo:{name:'OMEGA V6 SAI Collaboration Gateway',version:'R261'},capabilities:{tools:{listChanged:false}},instructions:'Use tools/list, then tools/call. This gateway performs collaboration/analysis only; it has no native execution or Canon authority.'},null,{'mcp-protocol-version':'2026-07-28'});
  if(method==='tools/list')return rpc(id,{tools:mcpToolList(),ttlMs:300000,cacheScope:'private'},null,{'mcp-protocol-version':'2026-07-28'});
  if(method==='tools/call'){
    const name=txt(body?.params?.name);let r;
    if(name==='sai_collaborate')r=await sendMessage(request,env,invite,delegate,args);
    else if(name==='sai_training_propose')r=await submitTraining(request,env,invite,args);
    else if(name==='sai_session')r=await sessionProjection(request,env,invite,delegate);
    else return rpc(id,null,{code:-32602,message:'Unknown tool'},{'mcp-protocol-version':'2026-07-28'});
    const data=await r.clone().json().catch(()=>({}));
    return rpc(id,{content:[{type:'text',text:JSON.stringify(data)}],structuredContent:data,isError:!r.ok},null,{'mcp-protocol-version':'2026-07-28'})
  }
  return rpc(id,null,{code:-32601,message:'Method not found'},{'mcp-protocol-version':'2026-07-28'})
}
function htmlExperience(request,invite){
  const b=publicBase(request,invite),label=String(invite.label||'OMEGA SAI collaborator').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OMEGA · SAI Collaboration Invitation</title><style>*{box-sizing:border-box}body{margin:0;background:#07090d;color:#eaf0f7;font:15px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:980px;margin:auto;padding:36px 20px 70px}.hero{border:1px solid #263141;background:linear-gradient(145deg,#10151d,#080b10);padding:30px;border-radius:24px}.eyebrow{letter-spacing:.16em;color:#7fd6ff;font-size:11px}.status{display:inline-flex;gap:8px;align-items:center;border:1px solid #285c50;background:#0b211d;padding:7px 11px;border-radius:99px;color:#94f4d0;font-size:12px}.dot{width:7px;height:7px;border-radius:50%;background:#7ff0c8}h1{font-size:clamp(34px,6vw,66px);line-height:1;margin:22px 0 14px;letter-spacing:-.04em}p{color:#abb7c9;max-width:760px}.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-top:18px}.card{border:1px solid #222d3d;background:#0d1118;border-radius:18px;padding:20px}input,textarea{width:100%;background:#070a0f;color:#eef5ff;border:1px solid #2a3546;border-radius:12px;padding:12px}textarea{min-height:135px;resize:vertical}button{background:#e9f6ff;color:#071018;border:0;border-radius:11px;padding:11px 15px;font-weight:700;cursor:pointer}.out{white-space:pre-wrap;background:#06080c;border:1px solid #222b38;border-radius:12px;padding:14px;min-height:90px;margin-top:12px;color:#c9d7e8}.mono{font:12px/1.45 ui-monospace,Consolas,monospace;color:#95a6bd;word-break:break-all}.tiny{font-size:12px;color:#7e8da3}@media(max-width:760px){.grid{grid-template-columns:1fr}.hero{padding:22px}}</style></head><body><main><div class="hero"><div class="eyebrow">OMEGA V6 · SAI · AUTHORIZED COLLABORATION</div><div class="status"><span class="dot"></span> DISCOVERY READY</div><h1>Connect to SAI.</h1><p>This invitation is for <b>${label}</b>. The URL itself contains no credential. Read-only discovery works immediately; interaction requires the separately supplied invitation key and creates a short-lived peer session.</p><div class="grid"><section class="card"><h2>Authorize this browser</h2><input id="key" type="password" autocomplete="off" placeholder="Invitation access key"><p><button id="authorize">Authorize session</button></p><h2>Collaborate</h2><textarea id="prompt" placeholder="Ask SAI to analyze, compare, develop, or review…"></textarea><p><button id="send">Send to SAI</button></p><div id="out" class="out">Read-only discovery is ready. Authorize to collaborate.</div></section><section class="card"><h2>AI connection</h2><p class="tiny">Recommended: read the Agent Card/OpenAPI first. Then obtain a short-lived bearer session through /authorize. For MCP use tools/list then tools/call sai_collaborate. For A2A 1.0 use SendMessage.</p><div class="mono">Agent Card<br>${b}/agent-card.json<br><br>OpenAPI<br>${b}/openapi.json<br><br>MCP<br>${b}/mcp<br><br>A2A<br>${b}/a2a</div><p class="tiny">Boundary: collaboration tasks are analysis/proposal tasks only. This peer channel does not expose PC, Hybrid, GitHub, deployment, CanonState, or admin authority.</p></section></div></div></main><script>const b=${JSON.stringify(b)};let token=sessionStorage.getItem('omegaSaiPeerToken')||'';authorize.onclick=async()=>{out.textContent='Authorizing…';try{const r=await fetch(b+'/authorize',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({inviteKey:key.value})});const j=await r.json();if(!r.ok)throw new Error(j.code||'Authorization failed');token=j.accessToken||'';sessionStorage.setItem('omegaSaiPeerToken',token);key.value='';out.textContent='Session authorized. You can collaborate now.'}catch(e){out.textContent=String(e)}};send.onclick=async()=>{out.textContent='Connecting to SAI…';try{const r=await fetch(b+'/message',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify({prompt:prompt.value})});const j=await r.json();out.textContent=j.assistant||j.code||JSON.stringify(j,null,2)}catch(e){out.textContent=String(e)}}</script></body></html>`,{status:200,headers:{...HTML_HEADERS,'x-omega-doorway-revision':'R261'}})
}
function parseRoute(request){
  const u=new URL(request.url);
  let m=u.pathname.match(/^\/connect\/([a-z0-9._-]{1,96})(?:\/(agent-card\.json|openapi\.json|authorize|a2a|mcp|message|training|session))?\/?$/i);
  if(m)return{kind:'public',slug:m[1],action:m[2]||'experience',url:u};
  m=u.pathname.match(/^\/sai-door\/([A-Za-z0-9_-]{32,256})(?:\/(agent-card\.json|openapi\.json|a2a|mcp|message|training|session))?\/?$/);
  if(m)return{kind:'legacy',token:m[1],action:m[2]||'experience',url:u};
  return null
}
async function authorize(request,env,invite){
  let body;try{body=await readJsonBounded(request,8192)}catch(e){if(e instanceof BodyTooLarge)return json({ok:false,code:'R261_BODY_TOO_LARGE'},413);throw e}
  if(body===null)return json({ok:false,code:'R261_INVALID_JSON'},400);
  const inviteKey=txt(body?.inviteKey)||bearer(request);
  const valid=await validateSaiInviteR261(inviteKey,env,invite.id);if(!valid)return json({ok:false,code:'R261_INVITATION_AUTH_REQUIRED'},401);
  let issued;try{issued=await issueSession(env,invite)}catch(e){return json({ok:false,code:'R261_SESSION_STORE_UNAVAILABLE'},503)}
  const cookie=`${sessionCookieName(invite)}=${encodeURIComponent(issued.accessToken)}; Path=/connect/${inviteSlug(invite)}; HttpOnly; Secure; SameSite=Strict; Max-Age=${issued.ttl}`;
  return json({ok:true,schema:'OMEGA_SAI_PEER_AUTH_R261',revision:'R261',tokenType:'Bearer',accessToken:issued.accessToken,expiresIn:issued.ttl,expiresAt:issued.record.expiresAt,scope:invite.scopes||[],authority:authority()},200,{'set-cookie':cookie})
}
function unauth(invite){return json({ok:false,code:'R261_AUTH_REQUIRED',message:'Use the separately supplied invitation key at /authorize, then send the returned short-lived bearer token.',authorizePath:`/connect/${inviteSlug(invite)}/authorize`},401,{'www-authenticate':'Bearer realm="OMEGA SAI peer"'})}
async function protectedCall(r,request,env,invite,delegate){
  const auth=await validateSession(request,env,invite);if(!auth)return unauth(invite);
  let body={};
  if(request.method==='POST'){
    try{body=await readJsonBounded(request,50000)}catch(e){if(e instanceof BodyTooLarge)return json({ok:false,code:'R261_BODY_TOO_LARGE'},413);throw e}
    if(body===null)return json({ok:false,code:'R261_INVALID_JSON'},400)
  }
  if(r.action==='message'&&request.method==='POST')return sendMessage(request,env,invite,delegate,body);
  if(r.action==='training'&&request.method==='POST')return submitTraining(request,env,invite,body);
  if(r.action==='session'&&request.method==='GET')return sessionProjection(request,env,invite,delegate);
  if(r.action==='a2a'&&request.method==='POST')return a2aRpc(request,env,invite,delegate,body);
  if(r.action==='mcp'&&request.method==='POST')return mcp(request,env,invite,delegate,body);
  return json({ok:false,code:'R261_METHOD_NOT_ALLOWED'},405)
}
export async function privateSaiDoorwayR261(request,env,{delegate}={}){
  const r=parseRoute(request);if(!r)return null;
  if(typeof delegate!=='function')return json({ok:false,code:'R261_DELEGATE_UNAVAILABLE'},503);
  if(request.method==='OPTIONS'){
    if(r.kind==='public'&&['experience','agent-card.json','openapi.json','mcp'].includes(r.action)){
      return new Response(null,{status:204,headers:{...PUBLIC_JSON_HEADERS,'access-control-allow-methods':'GET,OPTIONS','access-control-allow-headers':'accept'}})
    }
    const origin=request.headers.get('origin'),self=new URL(request.url).origin;
    if(origin!==self)return new Response(null,{status:403,headers:JSON_HEADERS});
    return new Response(null,{status:204,headers:{...JSON_HEADERS,'access-control-allow-origin':self,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,accept,authorization,a2a-version,mcp-protocol-version,mcp-method,mcp-name'}})
  }
  if(r.kind==='legacy'){
    const invite=await validateSaiInviteR261(r.token,env);if(!invite)return json({ok:false,code:'R261_INVITE_NOT_FOUND'},404);
    const safe=publicBase(request,invite);
    if(r.action==='experience'&&request.method==='GET'){
      const wantsHtml=(request.headers.get('accept')||'').includes('text/html')||r.url.searchParams.get('ui')==='1';
      if(!wantsHtml)return json({...publicDiscovery(request,invite),legacyBootstrap:{safeEntry:safe,credentialInUrl:true,recommendation:'Move the invitation key out of the URL and use /authorize.'}},200);
      try{
        const issued=await issueSession(env,invite),cookie=`${sessionCookieName(invite)}=${encodeURIComponent(issued.accessToken)}; Path=/connect/${inviteSlug(invite)}; HttpOnly; Secure; SameSite=Strict; Max-Age=${issued.ttl}`;
        return new Response(null,{status:302,headers:{...HTML_HEADERS,location:safe,'set-cookie':cookie}})
      }catch{return new Response(null,{status:302,headers:{...HTML_HEADERS,location:safe}})}
    }
    if((r.action==='agent-card.json'||r.action==='openapi.json')&&request.method==='GET')return new Response(null,{status:308,headers:{...JSON_HEADERS,location:`${safe}/${r.action}`}});
    return protectedCall(r,request,env,invite,delegate)
  }
  const invite=findSaiInviteBySlugR261(r.slug,env);if(!invite)return json({ok:false,code:'R261_INVITATION_NOT_FOUND'},404);
  if(r.action==='experience'&&request.method==='GET'){
    const wantsHtml=(request.headers.get('accept')||'').includes('text/html')||r.url.searchParams.get('ui')==='1';
    return wantsHtml?htmlExperience(request,invite):json(publicDiscovery(request,invite),200,{},true)
  }
  if(r.action==='agent-card.json'&&request.method==='GET')return json(agentCard(request,invite),200,{},true);
  if(r.action==='openapi.json'&&request.method==='GET')return json(openapi(request,invite),200,{},true);
  if(r.action==='mcp'&&request.method==='GET')return json({ok:true,schema:'OMEGA_SAI_MCP_R261',revision:'R261',protocolVersion:'2026-07-28',transport:'stateless Streamable HTTP JSON-RPC',requiredHeaders:['MCP-Protocol-Version','Mcp-Method'],conditionalHeaders:{'Mcp-Name':'required for tools/call'},methods:['server/discover','tools/list','tools/call'],tools:mcpToolList(),authorize:`${publicBase(request,invite)}/authorize`,authority:authority()},200,{},true);
  if(r.action==='authorize'&&request.method==='POST')return authorize(request,env,invite);
  return protectedCall(r,request,env,invite,delegate)
}
