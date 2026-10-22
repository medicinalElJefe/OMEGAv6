import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateSaiDoorwayR261} from '../src/privateSaiDoorwayR261.js';

const inviteKey='r261_TEST_INVITATION_KEY_abcdefghijklmnopqrstuvwxyz_1234567890';
const hash=v=>createHash('sha256').update(v).digest('hex');
const records=new Map(),sessions=new Map(),tasks=new Map();
const ledger={
 async put(k,v){records.set(k,v)},
 async get(k){return records.get(k)??null},
 async list(){return{keys:[...records.keys()].map(name=>({name})),cursor:null,list_complete:true}},
 async rate(){return{allowed:true,remaining:99}},
 async sessionPut(digest,value){sessions.set(digest,value)},
 async sessionGet(digest){return sessions.get(digest)??null},
 async taskPut(peer,id,value){tasks.set(`${peer}:${id}`,value)},
 async taskGet(peer,id){return tasks.get(`${peer}:${id}`)??null},
 async taskList(peer){return[...tasks.entries()].filter(([k])=>k.startsWith(`${peer}:`)).map(([,v])=>v)}
};
const env={
 OMEGA_SAI_INVITES_JSON:JSON.stringify([{
  id:'test-peer',publicSlug:'omega-test-peer',label:'Test AI Peer',
  tokenSha256:hash(inviteKey),active:true,expiresAt:'2099-01-01T00:00:00Z',
  scopes:['COLLABORATE','TRAINING_PROPOSE','SESSION_READ'],retainConversation:true,
  maxPromptChars:12000,maxTrainingChars:20000,sessionTtlSeconds:3600
 }]),
 OMEGA_SAI_PEER_LEDGER:ledger
};
let lastDelegateBody=null;
const delegate=async req=>{
 const u=new URL(req.url);
 if(u.pathname==='/api/orchestrator/turn'){
  lastDelegateBody=await req.json();
  return Response.json({turn:{id:'turn-r261-test',assistantMessage:`SAI:${lastDelegateBody.prompt}`}})
 }
 if(u.pathname==='/api/status')return Response.json({ok:true,schema:'OMEGA_STATUS_TEST',state:'LIVE',secretThing:'MUST_NOT_LEAK',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[{id:'secret'}]}});
 return Response.json({ok:false},{status:404});
};
const origin='https://door.example';
const base=`${origin}/connect/omega-test-peer`;
const call=(path='',init={})=>privateSaiDoorwayR261(new Request(base+path,init),env,{delegate});

let r=await call('',{headers:{accept:'application/json'}});
assert.equal(r.status,200);let j=await r.json();
assert.equal(j.credentialInUrl,false);assert.equal(j.protocols.a2a.preferred,'1.0');
assert.match(j.endpoints.authorize,/\/authorize$/);assert.ok(!JSON.stringify(j).includes(inviteKey));

r=await call('/agent-card.json');assert.equal(r.status,200);j=await r.json();
assert.equal(j.protocolVersion,'1.0');assert.equal(j.securitySchemes.peerSession.scheme,'bearer');
assert.ok(j.supportedInterfaces.some(x=>x.protocolVersion==='0.3'));

r=await call('/openapi.json');assert.equal(r.status,200);j=await r.json();
assert.equal(j.openapi,'3.1.0');
for(const item of Object.values(j.paths))for(const op of Object.values(item))assert.ok(op.responses&&Object.keys(op.responses).length>0,'every OpenAPI operation requires responses');

r=await call('/message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prompt:'hello'})});
assert.equal(r.status,401);

r=await call('/authorize',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({inviteKey})});
assert.equal(r.status,200);j=await r.json();assert.equal(j.tokenType,'Bearer');assert.ok(j.accessToken.length>=40);const access=j.accessToken;
assert.ok(r.headers.get('set-cookie')?.includes('HttpOnly'));

r=await call('/message',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${access}`},body:JSON.stringify({prompt:'hello message',stateContext:{topic:'allowed',objective:'test',proof:true,admin:{secret:'x'},constraints:['c1'],references:['https://example.com','file:///bad']}})});
assert.equal(r.status,200);j=await r.json();assert.equal(j.assistant,'SAI:hello message');assert.equal(j.nativeExecutionPerformed,false);
assert.equal(lastDelegateBody.stateContext.externalContext.topic,'allowed');assert.equal(lastDelegateBody.stateContext.externalContext.objective,'test');
assert.equal(lastDelegateBody.stateContext.externalContext.proof,undefined);assert.equal(lastDelegateBody.stateContext.externalContext.admin,undefined);
assert.deepEqual(lastDelegateBody.stateContext.externalContext.references,['https://example.com']);
assert.equal(lastDelegateBody.stateContext.privatePeer.executionAuthority,false);

r=await call('/a2a',{method:'POST',headers:{'content-type':'application/json','a2a-version':'1.0',authorization:`Bearer ${access}`},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'SendMessage',params:{message:{messageId:'m1',role:'ROLE_USER',parts:[{text:'hello a2a task'}]}}})});
assert.equal(r.status,200);j=await r.json();assert.equal(j.id,1);assert.equal(j.result.task.status.state,'TASK_STATE_COMPLETED');const taskId=j.result.task.id;
assert.equal(j.result.task.metadata.nativeExecutionPerformed,false);

r=await call('/a2a',{method:'POST',headers:{'content-type':'application/json','a2a-version':'1.0',authorization:`Bearer ${access}`},body:JSON.stringify({jsonrpc:'2.0',id:2,method:'GetTask',params:{id:taskId}})});
assert.equal(r.status,200);j=await r.json();assert.equal(j.result.task.id,taskId);

r=await call('/a2a',{method:'POST',headers:{'content-type':'application/json','a2a-version':'1.0',authorization:`Bearer ${access}`},body:JSON.stringify({jsonrpc:'2.0',id:3,method:'ListTasks',params:{pageSize:10}})});
assert.equal(r.status,200);j=await r.json();assert.ok(j.result.tasks.some(t=>t.id===taskId));assert.equal(j.result.nextPageToken,'');

r=await call('/a2a',{method:'POST',headers:{'content-type':'application/json','a2a-version':'0.3',authorization:`Bearer ${access}`},body:JSON.stringify({jsonrpc:'2.0',id:4,method:'message/send',params:{message:{kind:'message',messageId:'m2',role:'user',parts:[{kind:'text',text:'hello legacy'}]}}})});
assert.equal(r.status,200);j=await r.json();assert.equal(j.result.role,'agent');assert.match(j.result.parts[0].text,/hello legacy/);

r=await call('/mcp',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${access}`},body:JSON.stringify({jsonrpc:'2.0',id:5,method:'tools/list',params:{_meta:{'io.modelcontextprotocol/clientInfo':{name:'test',version:'1'}}}})});
assert.equal(r.status,400);j=await r.json();assert.equal(j.error.code,-32020);

r=await call('/mcp',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${access}`,'mcp-protocol-version':'2026-07-28','mcp-method':'tools/list'},body:JSON.stringify({jsonrpc:'2.0',id:6,method:'tools/list',params:{_meta:{'io.modelcontextprotocol/clientInfo':{name:'test',version:'1'}}}})});
assert.equal(r.status,200);j=await r.json();assert.equal(j.result.tools.length,3);assert.equal(j.result.ttlMs,300000);assert.equal(j.result.cacheScope,'private');

r=await call('/mcp',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${access}`,'mcp-protocol-version':'2026-07-28','mcp-method':'tools/call','mcp-name':'wrong'},body:JSON.stringify({jsonrpc:'2.0',id:7,method:'tools/call',params:{name:'sai_collaborate',arguments:{prompt:'hello mcp'}}})});
assert.equal(r.status,400);j=await r.json();assert.equal(j.error.code,-32020);

r=await call('/mcp',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${access}`,'mcp-protocol-version':'2026-07-28','mcp-method':'tools/call','mcp-name':'sai_collaborate'},body:JSON.stringify({jsonrpc:'2.0',id:8,method:'tools/call',params:{name:'sai_collaborate',arguments:{prompt:'hello mcp'},_meta:{'io.modelcontextprotocol/clientInfo':{name:'test',version:'1'}}}})});
assert.equal(r.status,200);j=await r.json();assert.equal(j.result.isError,false);assert.match(j.result.structuredContent.assistant,/hello mcp/);

r=await call('/training',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${access}`},body:JSON.stringify({kind:'evaluation',material:'Prefer source-grounded answers.'})});
assert.equal(r.status,202);j=await r.json();assert.equal(j.status,'PENDING_ADMIN_REVIEW');assert.equal(j.directTrainingApplied,false);assert.equal(j.canonAdmissionApplied,false);

r=await call('/session',{headers:{authorization:`Bearer ${access}`}});assert.equal(r.status,200);j=await r.json();
assert.equal(j.status.secretThing,undefined);assert.equal(j.status.hybridLink.devices,undefined);assert.equal(j.authority.pcAuthority,false);

const huge='x'.repeat(60000);
r=await call('/message',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${access}`},body:JSON.stringify({prompt:huge})});
assert.equal(r.status,413);

const legacyBase=`${origin}/sai-door/${inviteKey}`;
r=await privateSaiDoorwayR261(new Request(legacyBase,{headers:{accept:'text/html'}}),env,{delegate});
assert.equal(r.status,302);assert.equal(r.headers.get('location'),base);assert.ok(r.headers.get('set-cookie')?.includes('HttpOnly'));

r=await privateSaiDoorwayR261(new Request(`${origin}/connect/not-a-real-invite`,{headers:{accept:'application/json'}}),env,{delegate});
assert.equal(r.status,404);assert.match(r.headers.get('x-robots-tag'),/noindex/);

assert.ok([...records.values()].some(v=>JSON.parse(v).schema==='OMEGA_SAI_PEER_EVENT_R261'));
assert.ok([...records.values()].some(v=>JSON.parse(v).schema==='OMEGA_SAI_TRAINING_PROPOSAL_R261'));
console.log('R261 external AI invitation + A2A/MCP/OpenAPI interoperability E2E PASS');
