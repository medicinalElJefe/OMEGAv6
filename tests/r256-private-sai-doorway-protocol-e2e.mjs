import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {privateSaiDoorwayR256} from '../src/privateSaiDoorwayR256.js';
import {privateSaiAdminR256} from '../src/privateSaiAdminR256.js';

const token='r256_TEST_PRIVATE_INVITE_abcdefghijklmnopqrstuvwxyz_1234567890';
const admin='r256_TEST_ADMIN_abcdefghijklmnopqrstuvwxyz_1234567890';
const hash=v=>createHash('sha256').update(v).digest('hex');
const records=new Map();
const ledger={
 async put(k,v){records.set(k,v)},
 async get(k){return records.get(k)??null},
 async list(){return{keys:[...records.keys()].map(name=>({name})),cursor:null,list_complete:true}}
};
const env={OMEGA_SAI_INVITES_JSON:JSON.stringify([{id:'test-peer',label:'Test AI Peer',tokenSha256:hash(token),active:true,expiresAt:'2099-01-01T00:00:00Z',scopes:['COLLABORATE','TRAINING_PROPOSE','SESSION_READ'],retainConversation:true}]),OMEGA_SAI_ADMIN_TOKEN_SHA256:hash(admin),OMEGA_SAI_PEER_LEDGER:ledger};
const delegate=async req=>{
 const u=new URL(req.url);
 if(u.pathname==='/api/orchestrator/turn'){const b=await req.json();return Response.json({turn:{id:'turn-r256-test',assistantMessage:`SAI:${b.prompt}`}})}
 if(u.pathname==='/api/status')return Response.json({ok:true,schema:'OMEGA_STATUS_TEST',privatePeer:true});
 return Response.json({ok:false}, {status:404});
};
const base=`https://door.example/sai-door/${token}`;
const call=(path='',init={})=>privateSaiDoorwayR256(new Request(base+path,init),env,{delegate});

let r=await call('',{headers:{accept:'application/json'}});assert.equal(r.status,200);let j=await r.json();assert.equal(j.private,true);assert.equal(j.unlisted,true);assert.equal(j.protocols.a2a.version,'0.3.0');assert.equal(j.protocols.mcp.version,'2026-07-28');assert.match(j.experience.a2a,/\/a2a$/);assert.match(j.experience.mcp,/\/mcp$/);
r=await call('',{headers:{accept:'text/html'}});assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(await r.text(),/A doorway into SAI/);
r=await privateSaiDoorwayR256(new Request('https://door.example/sai-door/'+'x'.repeat(64)),env,{delegate});assert.equal(r.status,404);

r=await call('/a2a',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'message/send',params:{message:{kind:'message',messageId:'m1',role:'user',parts:[{kind:'text',text:'hello a2a'}]}}})});assert.equal(r.status,200);j=await r.json();assert.equal(j.jsonrpc,'2.0');assert.equal(j.id,1);assert.equal(j.result.kind,'message');assert.equal(j.result.role,'agent');assert.equal(j.result.parts[0].text,'SAI:hello a2a');

r=await call('/mcp',{method:'POST',headers:{'content-type':'application/json','mcp-protocol-version':'2026-07-28','mcp-method':'tools/list'},body:JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/list',params:{_meta:{'io.modelcontextprotocol/clientInfo':{name:'test',version:'1'}}}})});assert.equal(r.status,200);j=await r.json();assert.equal(j.result.tools.length,3);assert.equal(r.headers.get('mcp-protocol-version'),'2026-07-28');
r=await call('/mcp',{method:'POST',headers:{'content-type':'application/json','mcp-protocol-version':'2026-07-28','mcp-method':'tools/call','mcp-name':'sai_collaborate'},body:JSON.stringify({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'sai_collaborate',arguments:{prompt:'hello mcp'},_meta:{'io.modelcontextprotocol/clientInfo':{name:'test',version:'1'}}}})});assert.equal(r.status,200);j=await r.json();assert.equal(j.result.isError,false);assert.match(j.result.structuredContent.assistant,/hello mcp/);

r=await call('/training',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind:'evaluation',material:'Prefer source-grounded answers.',metadata:{source:'test'}})});assert.equal(r.status,202);j=await r.json();assert.equal(j.status,'PENDING_ADMIN_REVIEW');assert.equal(j.directTrainingApplied,false);assert.equal(j.canonAdmissionApplied,false);assert.equal(j.ledger.persisted,true);
assert.ok([...records.values()].some(v=>JSON.parse(v).schema==='OMEGA_SAI_TRAINING_PROPOSAL_R256'));
assert.ok([...records.values()].some(v=>JSON.parse(v).schema==='OMEGA_SAI_PEER_EVENT_R256'));

r=await privateSaiAdminR256(new Request('https://door.example/api/admin/sai-peers'),env);assert.equal(r.status,404);
r=await privateSaiAdminR256(new Request('https://door.example/api/admin/sai-peers',{headers:{authorization:`Bearer ${admin}`}}),env);assert.equal(r.status,200);j=await r.json();assert.equal(j.adminOnly,true);assert.equal(j.persistent,true);assert.ok(j.records.length>=3);

const wrangler=fs.readFileSync('wrangler.sai-door-r256.jsonc','utf8'),canonical=fs.readFileSync('wrangler.jsonc','utf8'),worker=fs.readFileSync('src/privateSaiDoorwayWorkerR256.js','utf8');
assert.match(wrangler,/"name": "omega-sai-door-r256"/);assert.match(wrangler,/"service":"omegav6"/);assert.match(wrangler,/OMEGA_SAI_PEER_LEDGER_DO/);assert.match(wrangler,/new_sqlite_classes/);assert.match(worker,/OMEGA_CANONICAL/);assert.match(worker,/OmegaSaiPeerLedgerR256/);assert.match(worker,/R256_RATE_LIMITED/);assert.match(canonical,/"main": "src\/workerR116\.js"/,'canonical OMEGA entrypoint must remain R116');
console.log('R256 private SAI doorway protocol + privacy + ledger E2E PASS');
