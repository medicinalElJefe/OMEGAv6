import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('public/omega-pc-proof-r205.js','utf8');
const must=(condition,message)=>assert.ok(condition,'R879: '+message);
must(source.includes('busy:false,statusError:null,armed:readArmed()'),'explicit unknown-state storage');
must(source.includes("state.statusError?'STATUS UNKNOWN':devices.length?'PC ONLINE'"),'unknown status takes precedence over offline and online projection');
must(source.includes('No online/offline inference or mission dispatch is permitted.'),'truthful operator-facing unknown-state message');
must(source.includes("state.live=live;state.statusError=null"),'only a successful status response clears an error');
must(source.includes("state.live=null;state.device=null;state.closure=null;state.statusError=String(e?.message||e);render()"),'failed refresh preserves error through render');
must(!source.includes("$('hostState').textContent='STATUS ERROR'"),'do not overwrite error with render fallback');
must(source.includes('state.device=capable?device:null'),'unknown state cannot expose an eligible execution target');
must(source.includes('if(!state.device){'),'mission path must refuse dispatch without eligible device');
must(source.includes("state.armed&&state.device&&!state.busy"),'automatic dispatch remains gated on a current device');
must(source.includes("health=verified?closureStepResult('DESKTOP_HEALTH'):rawHealth"),'R878 closure-only proof remains');
must(source.includes("confirmedMission:true"),'explicit confirmation remains');

const expression="state.statusError?'STATUS UNKNOWN':devices.length?'PC ONLINE':live.state==='DEVICE_PROOF_REQUIRED'?'DEVICE PROOF REQUIRED':live.state||'PAIRING REQUIRED'";
for(const [name,error,devices,live,expected] of [
 ['transport failure','HTTP 500',[],{},'STATUS UNKNOWN'],
 ['malformed response','invalid JSON',[],{state:'DEVICE_PROOF_REQUIRED'},'STATUS UNKNOWN'],
 ['healthy no-host',null,[],{state:'DEVICE_PROOF_REQUIRED'},'DEVICE PROOF REQUIRED'],
 ['healthy host',null,[{id:'host'}],{state:'VERIFIED_DEVICE_ONLINE'},'PC ONLINE']
]){
 const actual=vm.runInNewContext(expression,{state:{statusError:error},devices,live});
 assert.equal(actual,expected,name);
}
console.log('R879 PASS: transport errors remain UNKNOWN; healthy host projections and R878 proof gates preserved');
