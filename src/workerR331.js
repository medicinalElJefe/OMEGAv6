import r116,{OmegaRuntime as OmegaRuntimeR116} from './workerR116.js';
import {
 R331_INTELLIGENCE_REVISION,R331_MEMORY_LIMIT,
 buildCommunicationContextR331,compileConversationMemoryR331,compileLearningMemoryR331,
 compileTrainingBatchR331,intelligenceManifestR331
} from './system/coherentLearningR331.js';

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-intelligence-revision':R331_INTELLIGENCE_REVISION};
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:JSON_HEADERS});
const clean=v=>String(v??'').trim();
const safeSession=request=>{const id=clean(request.headers.get('x-omega-session-id')).slice(0,160);return /^[A-Za-z0-9._:-]{8,160}$/.test(id)?id:''};
const runtimeStub=(env,id)=>env?.OMEGA_RUNTIME?.get?.(env.OMEGA_RUNTIME.idFromName(id));
async function internalR331(env,id,path,method='GET',body){
 const stub=runtimeStub(env,id);if(!stub)return null;
 const headers=new Headers({'content-type':'application/json','x-omega-session-id':id});
 const init={method,headers};if(body!==undefined&&method!=='GET')init.body=JSON.stringify(body);
 return stub.fetch(new Request('https://omega-runtime.internal'+path,init));
}
function withRevision(response){
 const headers=new Headers(response.headers);headers.set('x-omega-intelligence-revision',R331_INTELLIGENCE_REVISION);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
function cloneJsonRequest(request,body){
 const headers=new Headers(request.headers);headers.set('content-type','application/json');
 return new Request(request.url,{method:request.method,headers,body:JSON.stringify(body)});
}

async function publicIntelligenceR331(request,env,path){
 const sessionId=safeSession(request);
 if(path==='/api/intelligence/r331/manifest'&&request.method==='GET')return json({ok:true,...intelligenceManifestR331()});
 if(!sessionId)return json({ok:false,code:'R331_SESSION_REQUIRED',boundary:'Durable learning is session-scoped and requires x-omega-session-id.'},400);
 if(path==='/api/intelligence/r331/memory'&&request.method==='GET'){
  const response=await internalR331(env,sessionId,'/intelligence/r331/memory','GET');
  return response?withRevision(response):json({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 if(path==='/api/intelligence/r331/context'&&request.method==='POST'){
  const body=await request.json().catch(()=>({}));
  const response=await internalR331(env,sessionId,'/intelligence/r331/context','POST',{prompt:clean(body.prompt||body.text).slice(0,16384),runtimeContext:body.runtimeContext||body.context||{}});
  return response?withRevision(response):json({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 if(path==='/api/intelligence/r331/feedback'&&request.method==='POST'){
  const body=await request.json().catch(()=>({}));
  const response=await internalR331(env,sessionId,'/intelligence/r331/feedback','POST',body);
  return response?withRevision(response):json({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 if(path==='/api/intelligence/r331/training-batch'&&request.method==='GET'){
  const response=await internalR331(env,sessionId,'/intelligence/r331/training-batch','GET');
  return response?withRevision(response):json({ok:false,code:'R331_DURABLE_RUNTIME_UNAVAILABLE'},503);
 }
 return null;
}

async function chatWithLearningR331(request,env){
 const sessionId=safeSession(request);
 if(!sessionId||!env?.OMEGA_RUNTIME)return withRevision(await r116.fetch(request,env));
 const body=await request.clone().json().catch(()=>({})),prompt=clean(body.text||body.message).slice(0,16384);
 if(!prompt)return withRevision(await r116.fetch(request,env));
 let memoryContext=null;
 try{
  const contextResponse=await internalR331(env,sessionId,'/intelligence/r331/context','POST',{prompt,runtimeContext:body.context||{}});
  if(contextResponse?.ok)memoryContext=await contextResponse.json();
 }catch{}
 const nextBody={...body,context:{...(body.context&&typeof body.context==='object'?body.context:{}),coherentLearningR331:memoryContext?.context||null}};
 const response=await r116.fetch(cloneJsonRequest(request,nextBody),env),data=await response.clone().json().catch(()=>null);
 if(response.ok&&data&&typeof data==='object'&&clean(data.reply)){
  try{
   await internalR331(env,sessionId,'/intelligence/r331/turn','POST',{
    prompt,reply:clean(data.reply).slice(0,12000),provider:clean(data.provider).slice(0,160),evidenceStatus:clean(data.evidenceStatus).slice(0,160),
    runtimeContext:body.context||{},coherence:memoryContext?.context?.coherence||null
   });
  }catch{}
 }
 return withRevision(response);
}

async function fetchR331(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/intelligence/r331/')){
  const handled=await publicIntelligenceR331(request,env,path);if(handled)return handled;
 }
 if(path==='/api/chat'&&request.method==='POST')return chatWithLearningR331(request,env);
 return withRevision(await r116.fetch(request,env));
}

export class OmegaRuntime extends OmegaRuntimeR116 {
 async readMemoryR331(){const rows=await this.get('intelligenceMemoryR331',[]);return Array.isArray(rows)?rows:[]}
 async writeMemoryR331(rows){await this.put('intelligenceMemoryR331',rows.slice(-R331_MEMORY_LIMIT))}
 async fetch(request){
  const path=new URL(request.url).pathname;
  if(path==='/intelligence/r331/memory'&&request.method==='GET'){
   const rows=await this.readMemoryR331();
   return json({ok:true,schema:'OMEGA_INTELLIGENCE_MEMORY_R331',revision:R331_INTELLIGENCE_REVISION,count:rows.length,rows,canonicalAdmission:false});
  }
  if(path==='/intelligence/r331/context'&&request.method==='POST'){
   const body=await request.json().catch(()=>({})),rows=await this.readMemoryR331();
   const context=buildCommunicationContextR331(rows,clean(body.prompt).slice(0,16384),body.runtimeContext||{});
   return json({ok:true,context,memoryCount:rows.length,canonicalAdmission:false});
  }
  if(path==='/intelligence/r331/turn'&&request.method==='POST'){
   const body=await request.json().catch(()=>({})),rows=await this.readMemoryR331();
   const user=compileConversationMemoryR331({role:'USER',text:body.prompt,at:new Date().toISOString()});
   const assistant=compileConversationMemoryR331({role:'ASSISTANT',text:body.reply,provider:body.provider,evidenceStatus:body.evidenceStatus,at:new Date().toISOString()});
   await this.writeMemoryR331([...rows,user,assistant]);
   try{await this.event('R331_CONVERSATION_MEMORY','R331 stored a bounded conversation turn.',{userMemoryId:user.memoryId,assistantMemoryId:assistant.memoryId,provider:body.provider||null,canonicalAdmission:false})}catch{}
   return json({ok:true,stored:[user.memoryId,assistant.memoryId],canonicalAdmission:false});
  }
  if(path==='/intelligence/r331/feedback'&&request.method==='POST'){
   const body=await request.json().catch(()=>({})),rows=await this.readMemoryR331();
   let memory;try{memory=compileLearningMemoryR331(body)}catch(error){return json({ok:false,code:'R331_FEEDBACK_REJECTED',message:error instanceof Error?error.message:String(error)},400)}
   await this.writeMemoryR331([...rows,memory]);
   try{await this.event('R331_LEARNING_MEMORY','R331 stored explicit typed learning feedback.',{memoryId:memory.memoryId,memoryClass:memory.memoryClass,state:memory.state,canonicalAdmission:false})}catch{}
   return json({ok:true,memory,trainingEligible:memory.trainingApproved===true&&String(memory.state).startsWith('ADMITTED'),canonicalAdmission:false});
  }
  if(path==='/intelligence/r331/training-batch'&&request.method==='GET'){
   const rows=await this.readMemoryR331(),batch=compileTrainingBatchR331(rows);
   return json({ok:true,...batch});
  }
  return super.fetch(request);
 }
}

export default{fetch:fetchR331};
