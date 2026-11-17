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
