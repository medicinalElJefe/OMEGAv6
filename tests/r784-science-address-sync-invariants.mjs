import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('src7/workspaces/ScienceWorkspaceR441.tsx','utf8');
const marker='useEffect(()=>{\n  // R784: event-first synchronization';
const start=source.indexOf(marker);
assert.ok(start>=0,'R784 effect start missing');
const bodyStart=start+'useEffect(()=>{'.length;
const end=source.indexOf('\n },[]);',bodyStart);
assert.ok(end>bodyStart,'R784 effect end missing');
const effect=source.slice(bodyStart,end).replace('let poll:number|undefined;','let poll;').replace('sync as EventListener','sync');
const setup=new Function('window','document','setAddress','readAddress',effect);
const listeners={window:new Map(),document:new Map()},intervals=new Map();
let nextTimer=1,hidden=false,stored=11498,current=11498,updates=0;
function target(kind){
 return {
  addEventListener(name,fn){const set=listeners[kind].get(name)||new Set();set.add(fn);listeners[kind].set(name,set)},
  removeEventListener(name,fn){listeners[kind].get(name)?.delete(fn)},
  dispatchEvent(event){for(const fn of listeners[kind].get(event.type)||[])fn(event)}
 };
}
const win={...target('window'),setInterval(fn,ms){assert.equal(ms,2500);const id=nextTimer++;intervals.set(id,fn);return id},clearInterval(id){intervals.delete(id)}};
const doc={...target('document'),get hidden(){return hidden}};
const setAddress=fn=>{const next=fn(current);if(next!==current)updates++;current=next};
const cleanup=setup(win,doc,setAddress,()=>stored);
assert.equal(typeof cleanup,'function');
assert.equal(intervals.size,1,'visible tab starts one fallback timer');
assert.equal(listeners.window.get('storage').size,1);
assert.equal(listeners.window.get('omega7-address-changed').size,1);
stored=200;win.dispatchEvent({type:'omega7-address-changed'});
assert.equal(current,200,'same-tab event updates immediately');
stored=201;win.dispatchEvent({type:'storage'});
assert.equal(current,201,'cross-tab event updates immediately');
stored=202;for(const tick of [...intervals.values()])tick();
assert.equal(current,202,'legacy silent writer converges via fallback');
hidden=true;doc.dispatchEvent({type:'visibilitychange'});
assert.equal(intervals.size,0,'hidden tab suspends polling');
stored=203;assert.equal(current,202,'no hidden polling occurs');
hidden=false;doc.dispatchEvent({type:'visibilitychange'});
assert.equal(current,203,'visibility restoration synchronizes immediately');
assert.equal(intervals.size,1,'visible fallback resumes once');
doc.dispatchEvent({type:'visibilitychange'});
assert.equal(intervals.size,1,'repeat visibility does not leak timers');
cleanup();
assert.equal(intervals.size,0,'unmount clears timer');
for(const map of Object.values(listeners))for(const set of map.values())assert.equal(set.size,0,'unmount removes listeners');
stored=204;win.dispatchEvent({type:'storage'});win.dispatchEvent({type:'omega7-address-changed'});
assert.equal(current,203,'unmounted effect must not receive events');
assert.ok(updates>=4);
assert.ok(!source.includes('window.setInterval(sync,850)'),'legacy high-frequency polling must not return');
assert.ok(source.includes("window.dispatchEvent(new CustomEvent('omega7-address-changed'")),'same-tab address event must remain');
assert.ok(source.includes('const commit=(next:number)=>setAddress(writeAddress(next))'),'state selection must remain');
console.log('R784 SCIENCE ADDRESS SYNC PASS · executed events, fallback, hidden pause, resume and cleanup');
