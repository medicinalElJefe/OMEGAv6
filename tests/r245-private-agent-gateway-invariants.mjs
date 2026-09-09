import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {PRIVATE_AGENT_INVITES_R245,R245_FORBIDDEN_AUTHORITIES} from '../src/privateAgentInvitesR245.js';
import {privateAgentGatewayR245,validatePrivateAgentInviteR245} from '../src/privateAgentGatewayR245.js';

const read=p=>fs.readFileSync(p,'utf8');
const worker=read('src/workerR102.js'),wrangler=read('wrangler.jsonc'),ci=read('.github/workflows/ci.yml');
const must=(ok,msg)=>assert.ok(ok,`R245 ${msg}`);

must(worker.includes("import {privateAgentGatewayR245} from './privateAgentGatewayR245.js'"),'gateway must mount additively inside the existing R102 wrapper');
must(worker.includes("path.startsWith('/private-agent/')"),'private capability route missing from enacted Worker chain');
must(wrangler.includes('"main": "src/workerR116.js"'),'R245 must not replace the proven R116 production spine');
must(!ci.includes('private-agent')&&!ci.includes('R245'),'R245 must not create a second production writer or special deployment path');

assert.equal(PRIVATE_AGENT_INVITES_R245.length,3,'initial private invite slot count drifted');
for(const invite of PRIVATE_AGENT_INVITES_R245){
 must(/^[0-9a-f]{64}$/.test(invite.tokenSha256),`${invite.id} must store only a SHA-256 capability digest`);
 must(invite.active===true,`${invite.id} unexpectedly disabled in initial foundation`);
 must(invite.scopes.includes('DISCOVER')&&invite.scopes.includes('MESSAGE')&&invite.scopes.includes('TOOLS_READ'),`${invite.id} missing bounded private scopes`);
 for(const forbidden of R245_FORBIDDEN_AUTHORITIES)must(!invite.scopes.includes(forbidden),`${invite.id} acquired forbidden authority ${forbidden}`);
}

const token='synthetic_R245_private_agent_token_0123456789ABCDEF';
const tokenSha256=crypto.createHash('sha256').update(token).digest('hex');
const synthetic=[{id:'synthetic-friend',label:'Synthetic Friend',tokenSha256,active:true,scopes:['DISCOVER','MESSAGE','TOOLS_READ'],maxPromptChars:256,expiresAt:null}];
assert.equal((await validatePrivateAgentInviteR245(token,synthetic))?.id,'synthetic-friend');
assert.equal(await validatePrivateAgentInviteR245('wrong_private_agent_token_0123456789ABCDEF',synthetic),null);

const calls=[];
const delegate=async request=>{
 const url=new URL(request.url),headers=Object.fromEntries(request.headers.entries());calls.push({path:url.pathname,method:request.method,headers,body:request.method==='POST'?await request.clone().json().catch(()=>null):null});
 if(url.pathname==='/api/orchestrator/turn')return new Response(JSON.stringify({turn:{id:'turn-r245-test',assistantMessage:'OMEGA private reply'},draft:{schema:'OMEGA_GOVERNED_ACTION_DRAFT_R32',steps:[{op:'APPLY_PATCH'}]}}),{status:200,headers:{'content-type':'application/json'}});
 if(url.pathname==='/api/status')return new Response(JSON.stringify({ok:true,status:'OK',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false},enactedRuntime:{state:'LIVE_DURABLE'}}),{status:200,headers:{'content-type':'application/json'}});
 return new Response(JSON.stringify({ok:false}),{status:404,headers:{'content-type':'application/json'}});
};
const base=`https://omega.test/private-agent/${token}`;

let response=await privateAgentGatewayR245(new Request(base),{}, {delegate,invites:synthetic});
assert.equal(response.status,200);let body=await response.json();
assert.equal(body.schema,'OMEGA_PRIVATE_AGENT_CARD_R245');assert.equal(body.private,true);assert.equal(body.publicDirectory,false);
assert.equal(body.invite.id,'synthetic-friend');assert.equal(body.authority.executionAuthority,false);assert.equal(body.authority.canonAdmissionAuthority,false);
assert.equal(response.headers.get('referrer-policy'),'no-referrer');must((response.headers.get('x-robots-tag')||'').includes('noindex'),'private link must be excluded from indexing');
must(body.interaction.message.endsWith('/message')&&body.interaction.openapi.endsWith('/openapi.json'),'machine discovery endpoints missing');

response=await privateAgentGatewayR245(new Request(base+'/openapi.json'),{}, {delegate,invites:synthetic});
assert.equal(response.status,200);body=await response.json();assert.equal(body.openapi,'3.1.0');assert.equal(body['x-omega-private'],true);

response=await privateAgentGatewayR245(new Request(base+'/tools'),{}, {delegate,invites:synthetic});
assert.equal(response.status,200);body=await response.json();assert.deepEqual(body.tools.map(x=>x.name),['omega.ask','omega.status']);

response=await privateAgentGatewayR245(new Request(base+'/message',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer SHOULD_NOT_FORWARD','x-omega-bridge-secret':'SHOULD_NOT_FORWARD','cookie':'SHOULD_NOT_FORWARD'},body:JSON.stringify({prompt:'Explain current OMEGA status',stateContext:{source:'friend-ai'}})}),{}, {delegate,invites:synthetic});
assert.equal(response.status,200);body=await response.json();assert.equal(body.assistant,'OMEGA private reply');assert.equal(body.proposal.state,'PROPOSAL_ONLY_NOT_EXECUTABLE');assert.equal(body.authority.pcAuthority,false);assert.equal(body.authority.dispatchAuthority,false);
const turn=calls.find(x=>x.path==='/api/orchestrator/turn');must(turn,'message did not reach bounded orchestrator turn');
assert.equal(turn.headers['x-omega-session-id'],'r245:synthetic-friend');assert.equal(turn.headers.authorization,undefined);assert.equal(turn.headers['x-omega-bridge-secret'],undefined);assert.equal(turn.headers.cookie,undefined);
assert.equal(turn.body.stateContext.privateAgent.executionAuthority,false);assert.equal(turn.body.stateContext.privateAgent.canonAdmissionAuthority,false);
must(!JSON.stringify(body).includes('APPLY_PATCH'),'R245 response must not expose executable action steps from an internal draft');

response=await privateAgentGatewayR245(new Request(base+'/tool',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'omega.status',arguments:{}})}),{}, {delegate,invites:synthetic});
assert.equal(response.status,200);body=await response.json();assert.equal(body.schema,'OMEGA_PRIVATE_AGENT_STATUS_R245');assert.equal(body.status.hybridLink.nativeExecutionClaimed,false);
const statusCall=calls.find(x=>x.path==='/api/status');assert.equal(statusCall.headers['x-omega-session-id'],'r245:synthetic-friend');assert.equal(statusCall.headers['x-omega-bridge-secret'],undefined);

response=await privateAgentGatewayR245(new Request(base+'/tool',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'omega.execute',arguments:{}})}),{}, {delegate,invites:synthetic});
assert.equal(response.status,403);body=await response.json();assert.equal(body.code,'R245_TOOL_NOT_ALLOWED');

response=await privateAgentGatewayR245(new Request('https://omega.test/private-agent/wrong_private_agent_token_0123456789ABCDEF'),{}, {delegate,invites:synthetic});
assert.equal(response.status,404);body=await response.json();assert.equal(body.code,'R245_PRIVATE_INVITE_NOT_FOUND');

response=await privateAgentGatewayR245(new Request(base,{method:'OPTIONS'}),{}, {delegate,invites:synthetic});assert.equal(response.status,204);

console.log('OMEGA R245 PRIVATE AGENT GATEWAY PASS · three hashed revocable invite slots · capability URL machine discovery + OpenAPI · bounded omega.ask + omega.status · invite-isolated durable session · incoming bridge/auth credentials stripped · execution/GitHub/deploy/R147/R125 authority absent · R116 production spine and ci.yml single writer preserved');
