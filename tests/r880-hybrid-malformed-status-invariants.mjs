import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('public/omega-pc-proof-r205.js','utf8');
const guard="!live||typeof live!=='object'||Array.isArray(live)||!Array.isArray(live.devices)||typeof live.state!=='string'";
assert.ok(source.includes(guard),'R880 malformed status must be rejected before assigning live state');
const guardAt=source.indexOf(guard), assignmentAt=source.indexOf('state.live=live;state.statusError=null;');
assert.ok(guardAt>=0&&guardAt<assignmentAt,'Malformed response must never clear the R879 error');
assert.ok(source.includes("state.live=null;state.device=null;state.closure=null;state.statusError=String(e?.message||e);render()"),'R879 UNKNOWN fail-closed catch remains');
assert.ok(source.includes("state.statusError?'STATUS UNKNOWN'"),'R879 UNKNOWN label remains');
assert.ok(source.includes("health=verified?closureStepResult('DESKTOP_HEALTH'):rawHealth"),'R878 closure-only proof remains');
assert.ok(source.includes('confirmedMission:true'),'Explicit R300 mission confirmation remains');

for(const [name,live,valid] of [
 ['null',null,false],['array',[],false],['string','offline',false],
 ['empty object',{},false],['no devices',{state:'DEVICE_PROOF_REQUIRED'},false],
 ['no state',{devices:[]},false],['wrong devices',{devices:{},state:'DEVICE_PROOF_REQUIRED'},false],
 ['healthy no-host',{devices:[],state:'DEVICE_PROOF_REQUIRED'},true],
 ['healthy host',{devices:[{id:'host',online:true}],state:'VERIFIED_DEVICE_ONLINE'},true]
]){
 const invalid=vm.runInNewContext(guard,{live});
 assert.equal(!invalid,valid,name);
}
console.log('R880 PASS: malformed status never clears UNKNOWN or admits a host; R878/R879/R300 boundaries conserved');


// Execute the actual browser controller with a stubbed DOM and HTTP transport.
// Unlike the predicate-only checks above, this exercises refresh -> catch -> render.
async function browserCase(name, payload, expectedLabel, expectedError) {
 const elements=new Map(), requests=[];
 const element=id=>{
  if(!elements.has(id))elements.set(id,{
   textContent:'',disabled:false,onclick:null,
   classList:{add(){},remove(){}},setAttribute(){}
  });
  return elements.get(id);
 };
 const store=new Map();
 const context={
  document:{getElementById:element},
  localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)},
  crypto:{randomUUID:()=> 'r880-test-session'},
  fetch:async (path,options)=>{
   requests.push({path,method:options?.method||'GET'});
   return {ok:true,status:200,text:async()=>JSON.stringify(payload)};
  },
  setInterval:()=>0,queueMicrotask:fn=>Promise.resolve().then(fn),
  console
 };
 vm.runInNewContext(source,context,{filename:'omega-pc-proof-r205.js'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(element('hostState').textContent,expectedLabel,name+' host state');
 assert.equal(element('hostDetail').textContent.includes('Hybrid status unavailable:'),expectedError,name+' error visibility');
 assert.equal(requests.filter(r=>r.method==='POST').length,0,name+' must not dispatch');
 assert.equal(element('at09State').textContent.startsWith('PASS'),false,name+' AT09 refusal');
 assert.equal(element('at10State').textContent.startsWith('PASS'),false,name+' AT10 refusal');
}
for(const [name,payload] of [
 ['null',null],['array',[]],['scalar','offline'],['missing devices',{state:'DEVICE_PROOF_REQUIRED'}],
 ['missing state',{devices:[]}],['wrong devices',{state:'DEVICE_PROOF_REQUIRED',devices:{}}]
])await browserCase(name,payload,'STATUS UNKNOWN',true);
await browserCase('valid no-host',{state:'DEVICE_PROOF_REQUIRED',devices:[]},'DEVICE PROOF REQUIRED',false);
await browserCase('valid heartbeat',{state:'VERIFIED_DEVICE_ONLINE',devices:[{id:'host',online:true}]},'PC ONLINE',false);
console.log('R880 browser controller PASS: malformed responses visibly UNKNOWN, no dispatch or false AT09/AT10 proof');
