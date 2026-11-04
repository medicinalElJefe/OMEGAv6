import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('src7/workspaces/ScienceWorkspaceR441.tsx','utf8');
for(const required of ["window.addEventListener('storage',sync)","window.addEventListener('omega7-address-changed',sync as EventListener)","document.addEventListener('visibilitychange',visibility)","document.removeEventListener('visibilitychange',visibility)","if(!document.hidden)poll=window.setInterval(sync,2500)","if(poll!==undefined)window.clearInterval(poll)","const visibility=()=>{sync();schedule();}"]){
 assert.ok(source.includes(required),'R784 sync lifecycle missing '+required);
}
assert.ok(!source.includes('window.setInterval(sync,850)'),'legacy high-frequency polling must not return');
assert.ok(source.includes("window.dispatchEvent(new CustomEvent('omega7-address-changed'"),'same-tab immediate address event must remain');
assert.ok(source.includes('const commit=(next:number)=>setAddress(writeAddress(next))'),'existing state selection callback must remain');
console.log('R784 SCIENCE ADDRESS SYNC PASS · immediate event delivery · visible fallback · hidden pause · resume reconciliation · cleanup');
