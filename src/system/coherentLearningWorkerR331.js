import {
 R331_INTELLIGENCE_REVISION,R331_MEMORY_LIMIT,
 buildCommunicationContextR331,compileConversationMemoryR331,compileLearningMemoryR331,
 compileTrainingBatchR331,intelligenceManifestR331
} from './coherentLearningR331.js';

const cleanR331=v=>String(v??'').trim();
const jsonR331=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-intelligence-revision':R331_INTELLIGENCE_REVISION}});
const sessionR331=request=>{const id=cleanR331(request.headers.get('x-omega-session-id')).slice(0,160);return /^[A-Za-z0-9._:-]{8,160}$/.test(id)?id:''};

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
  await write([...rows,user,assistant]);
  try{await runtime.event('R331_CONVERSATION_MEMORY','R331 stored a bounded conversation turn.',{userMemoryId:user.memoryId,assistantMemoryId:assistant.memoryId,provider:body.provider||null,canonicalAdmission:false})}catch{}
  return jsonR331({ok:true,stored:[user.memoryId,assistant.memoryId],canonicalAdmission:false});
 }
 if(path==='/intelligence/r331/feedback'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),rows=await read();let memory;
  try{memory=compileLearningMemoryR331(body)}catch(error){return jsonR331({ok:false,code:'R331_FEEDBACK_REJECTED',message:error instanceof Error?error.message:String(error)},400)}
  await write([...rows,memory]);
  try{await runtime.event('R331_LEARNING_MEMORY','R331 stored explicit typed learning feedback.',{memoryId:memory.memoryId,memoryClass:memory.memoryClass,state:memory.state,canonicalAdmission:false})}catch{}
  return jsonR331({ok:true,memory,trainingEligible:memory.trainingApproved===true&&String(memory.state).startsWith('ADMITTED'),canonicalAdmission:false});
 }
 if(path==='/intelligence/r331/training-batch'&&request.method==='GET'){
  const rows=await read(),batch=compileTrainingBatchR331(rows);return jsonR331({ok:true,...batch});
 }
 return jsonR331({ok:false,code:'R331_INTERNAL_ROUTE_NOT_FOUND'},404);
}
