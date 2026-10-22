import {
 R331_INTELLIGENCE_REVISION,R331_MEMORY_LIMIT,
 buildCommunicationContextR331,compileConversationMemoryR331,compileLearningMemoryR331,
 compileTrainingBatchR331,intelligenceManifestR331
} from './coherentLearningR331.js';

const cleanR331=v=>String(v??'').trim();
const jsonR331=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-intelligence-revision':R331_INTELLIGENCE_REVISION}});
const sessionR331=request=>{const id=cleanR331(request.headers.get('x-omega-session-id')).slice(0,160);return /^[A-Za-z0-9._:-]{8,160}$/.test(id)?id:''};
async function sha256R331(value){const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value));const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function appendLedgerR331(runtime,type,payload){
 const rows=await runtime.get('intelligenceLedgerR331',[]),prior=Array.isArray(rows)?rows:[],previousHash=prior.at(-1)?.eventHash||null;
 const core={schema:'OMEGA_INTELLIGENCE_LEDGER_EVENT_R331',type,at:new Date().toISOString(),payload,previousHash,canonicalAdmission:false};
 const event={...core,eventHash:await sha256R331(core)};const next=[...prior,event].slice(-512);await runtime.put('intelligenceLedgerR331',next);return{event,count:next.length};
}

function runtimeStubR331(env,id){return env?.OMEGA_RUNTIME?.get?.(env.OMEGA_RUNTIME.idFromName(id))}
async function runtimeRequestR331(env,id,path,method='GET',body){
 const stub=runtimeStubR331(env,id);if(!stub)return null;
 const headers=new Headers({'content-type':'application/json','x-omega-session-id':id});
 const init={method,headers};if(body!==undefined&&method!=='GET')init.body=JSON.stringify(body);
 return stub.fetch(new Request('https://omega-runtime.internal'+path,init));
}
function withRevisionR331(response){
 const headers=new Headers(response.headers);headers.set('x-omega-intelligence-revision',R331_INTELLIGENCE_REVISION);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function cloneJsonRequestR331(request,body){
 const headers=new Headers(request.headers);headers.set('content-type','application/json');
 return new Request(request.url,{method:request.method,headers,body:JSON.stringify(body)});
}

export async function publicLearningR331(request,env,delegate){
 const path=new URL(request.url).pathname;
 if(path==='/api/intelligence/r331/manifest'&&request.method==='GET')return jsonR331({ok:true,...intelligenceManifestR331()});

 if(path==='/api/chat'&&request.method==='POST'){
  const sessionId=sessionR331(request);
  if(!sessionId||!env?.OMEGA_RUNTIME)return withRevisionR331(await delegate(request,env));
  const body=await request.clone().json().catch(()=>({})),prompt=cleanR331(body.text||body.message).slice(0,16384);
  if(!prompt)return withRevisionR331(await delegate(request,env));
  let memoryContext=null;
  try{
   const contextResponse=await runtimeRequestR331(env,sessionId,'/intelligence/r331/context','POST',{prompt,runtimeContext:body.context||{}});
   if(contextResponse?.ok)memoryContext=await contextResponse.json();
  }catch{}
  const nextBody={...body,context:{...(body.context&&typeof body.context==='object'?body.context:{}),coherentLearningR331:memoryContext?.context||null}};
  const response=await delegate(cloneJsonRequestR331(request,nextBody),env),data=await response.clone().json().catch(()=>null);
  if(response.ok&&data&&typeof data==='object'&&cleanR331(data.reply)){
   try{
    await runtimeRequestR331(env,sessionId,'/intelligence/r331/turn','POST',{
     prompt,reply:cleanR331(data.reply).slice(0,12000),provider:cleanR331(data.provider).slice(0,160),
     evidenceStatus:cleanR331(data.evidenceStatus).slice(0,160),runtimeContext:body.context||{},
     coherence:memoryContext?.context?.coherence||null
    });
   }catch{}
  }
  return withRevisionR331(response);
 }

 if(!path.startsWith('/api/intelligence/r331/'))return null;
 const sessionId=sessionR331(request);
 if(!sessionId)return jsonR331({ok:false,code:'R331_SESSION_REQUIRED',boundary:'Durable learning is session-scoped and requires x-omega-session-id.'},400);
 if(!env?.OMEGA_RUNTIME)return jsonR331({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);

 if(path==='/api/intelligence/r331/memory'&&request.method==='GET'){
  const response=await runtimeRequestR331(env,sessionId,'/intelligence/r331/memory','GET');return response?withRevisionR331(response):jsonR331({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 if(path==='/api/intelligence/r331/context'&&request.method==='POST'){
  const body=await request.json().catch(()=>({}));
  const response=await runtimeRequestR331(env,sessionId,'/intelligence/r331/context','POST',{prompt:cleanR331(body.prompt||body.text).slice(0,16384),runtimeContext:body.runtimeContext||body.context||{}});
  return response?withRevisionR331(response):jsonR331({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 if(path==='/api/intelligence/r331/feedback'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),response=await runtimeRequestR331(env,sessionId,'/intelligence/r331/feedback','POST',body);
  return response?withRevisionR331(response):jsonR331({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 if(path==='/api/intelligence/r331/state'&&request.method==='GET'){
  const response=await runtimeRequestR331(env,sessionId,'/intelligence/r331/state','GET');return response?withRevisionR331(response):jsonR331({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 if(path==='/api/intelligence/r331/training-batch'&&request.method==='GET'){
  const response=await runtimeRequestR331(env,sessionId,'/intelligence/r331/training-batch','GET');return response?withRevisionR331(response):jsonR331({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 return jsonR331({ok:false,code:'R331_ROUTE_NOT_FOUND'},404);
}

export async function runtimeLearningR331(runtime,request){
 const path=new URL(request.url).pathname;
 if(!path.startsWith('/intelligence/r331/'))return null;

 const read=async()=>{const rows=await runtime.get('intelligenceMemoryR331',[]);return Array.isArray(rows)?rows:[]};
 const write=async rows=>runtime.put('intelligenceMemoryR331',rows.slice(-R331_MEMORY_LIMIT));

 if(path==='/intelligence/r331/memory'&&request.method==='GET'){
  const rows=await read();return jsonR331({ok:true,schema:'OMEGA_INTELLIGENCE_MEMORY_R331',revision:R331_INTELLIGENCE_REVISION,count:rows.length,rows,canonicalAdmission:false});
 }
 if(path==='/intelligence/r331/context'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),rows=await read(),context=buildCommunicationContextR331(rows,cleanR331(body.prompt).slice(0,16384),body.runtimeContext||{});
  return jsonR331({ok:true,context,memoryCount:rows.length,canonicalAdmission:false});
 }
 if(path==='/intelligence/r331/turn'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),rows=await read();
  const user=compileConversationMemoryR331({role:'USER',text:body.prompt,at:new Date().toISOString()});
  const assistant=compileConversationMemoryR331({role:'ASSISTANT',text:body.reply,provider:body.provider,evidenceStatus:body.evidenceStatus,at:new Date().toISOString()});
  await write([...rows,user,assistant]);const ledger=await appendLedgerR331(runtime,'TURN',{userMemoryId:user.memoryId,assistantMemoryId:assistant.memoryId,provider:body.provider||null,evidenceStatus:body.evidenceStatus||null});
  try{await runtime.event('R331_CONVERSATION_MEMORY','R331 stored a bounded conversation turn.',{userMemoryId:user.memoryId,assistantMemoryId:assistant.memoryId,provider:body.provider||null,canonicalAdmission:false})}catch{}
  return jsonR331({ok:true,stored:[user.memoryId,assistant.memoryId],ledgerCount:ledger.count,lastEventHash:ledger.event.eventHash,canonicalAdmission:false});
 }
 if(path==='/intelligence/r331/feedback'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),rows=await read(),kind=cleanR331(body?.kind).toUpperCase();
  if(kind==='REVOKE'){
   const memoryId=cleanR331(body?.memoryId).slice(0,220),target=rows.find(x=>x?.memoryId===memoryId);
   if(!memoryId||!target)return jsonR331({ok:false,code:'R331_MEMORY_NOT_FOUND',canonicalAdmission:false},404);
   const revokedAt=new Date().toISOString(),reason=cleanR331(body?.reason).slice(0,500)||'Explicit user memory revocation';
   const next=rows.map(x=>x?.memoryId===memoryId?{...x,state:'REVOKED',revokedAt,revocationReason:reason,canonicalAdmission:false}:x);
   await write(next);const ledger=await appendLedgerR331(runtime,'MEMORY_REVOKED',{memoryId,priorState:target.state,reason});
   try{await runtime.event('R331_MEMORY_REVOKED','R331 revoked a persistent memory without deleting history.',{memoryId,priorState:target.state,canonicalAdmission:false})}catch{}
   return jsonR331({ok:true,memoryId,state:'REVOKED',ledgerCount:ledger.count,lastEventHash:ledger.event.eventHash,historyPreserved:true,canonicalAdmission:false});
  }
  let memory;
  try{memory=compileLearningMemoryR331(body)}catch(error){return jsonR331({ok:false,code:'R331_FEEDBACK_REJECTED',message:error instanceof Error?error.message:String(error)},400)}
  const supersedes=Array.isArray(memory.supersedes)?memory.supersedes:[],superseded=[];
  const next=rows.map(x=>{
   if(!supersedes.includes(x?.memoryId)||String(x?.state||'').startsWith('REVOKED'))return x;
   superseded.push(x.memoryId);return{...x,state:'SUPERSEDED',supersededBy:memory.memoryId,supersededAt:memory.createdAt,canonicalAdmission:false};
  });
  await write([...next,memory]);const ledger=await appendLedgerR331(runtime,'FEEDBACK',{memoryId:memory.memoryId,memoryClass:memory.memoryClass,state:memory.state,trainingApproved:memory.trainingApproved===true,superseded});
  try{await runtime.event('R331_LEARNING_MEMORY','R331 stored explicit typed learning feedback.',{memoryId:memory.memoryId,memoryClass:memory.memoryClass,state:memory.state,superseded,canonicalAdmission:false})}catch{}
  return jsonR331({ok:true,memory,superseded,trainingEligible:memory.trainingApproved===true&&String(memory.state).startsWith('ADMITTED'),ledgerCount:ledger.count,lastEventHash:ledger.event.eventHash,historyPreserved:true,canonicalAdmission:false});
 }
 if(path==='/intelligence/r331/state'&&request.method==='GET'){
  const rows=await read(),ledger=await runtime.get('intelligenceLedgerR331',[]),context=buildCommunicationContextR331(rows,'',{});
  const counts={episodic:rows.filter(x=>x.memoryClass==='EPISODIC').length,preferences:rows.filter(x=>x.memoryClass==='COMMUNICATION_PREFERENCE').length,semantic:rows.filter(x=>x.memoryClass==='SEMANTIC_LESSON').length,procedural:rows.filter(x=>x.memoryClass==='PROCEDURAL_LESSON').length,scars:rows.filter(x=>x.memoryClass==='SCAR').length,active:rows.filter(x=>String(x?.state||'').startsWith('ADMITTED')||x?.state==='RECORDED').length,superseded:rows.filter(x=>x?.state==='SUPERSEDED').length,revoked:rows.filter(x=>x?.state==='REVOKED').length};
  return jsonR331({ok:true,schema:'OMEGA_INTELLIGENCE_STATE_R331',revision:R331_INTELLIGENCE_REVISION,memoryCount:rows.length,counts,ledgerCount:Array.isArray(ledger)?ledger.length:0,lastEventHash:Array.isArray(ledger)?ledger.at(-1)?.eventHash||null:null,coherence:context.coherence,foundationWeightsChanged:false,canonicalAdmission:false});
 }
 if(path==='/intelligence/r331/training-batch'&&request.method==='GET'){
  const rows=await read(),batch=compileTrainingBatchR331(rows);return jsonR331({ok:true,...batch});
 }
 return jsonR331({ok:false,code:'R331_INTERNAL_ROUTE_NOT_FOUND'},404);
}
