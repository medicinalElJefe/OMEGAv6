// R895: atomic IndexedDB exact-float64 state persistence for a bounded complete 12-agent × 20,736 inner-state sweep.
// No silent truncation, no automatic cloud work, and no second CanonState writer.
import {AGENTS,SIZE,neighbors} from './sphereAgentFabricR887.mjs';
export const R895_SCHEMA='OMEGA_SPHERE_DURABLE_CHECKPOINT_R895';
export const R895_MAX_VALUES=12*SIZE;
const DB='omega-sphere-durable-r895',STORE='checkpoints',KEY='latest';
const idx=(x,max)=>Number.isSafeInteger(x)&&x>=0&&x<max;
const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
const unit=(x)=>finite(x)&&x>=0&&x<=1;
function receipt(r,sequence,tick){
 return Boolean(r&&typeof r==='object'&&Number.isSafeInteger(r.taskId)&&r.taskId>=1&&r.taskId<=sequence&&idx(r.agent,AGENTS)&&idx(r.inner,SIZE)&&['OBSERVE','RELAX','EXCHANGE'].includes(r.kind)&&Number.isSafeInteger(r.tick)&&r.tick>=1&&r.tick<=tick&&unit(r.before)&&unit(r.after)&&
  (r.kind!=='EXCHANGE'||(idx(r.peer,AGENTS)&&neighbors(r.agent).includes(r.peer)&&unit(r.peerBefore)&&unit(r.peerAfter)&&finite(r.conservationResidual)&&Math.abs(r.conservationResidual)<=1e-9)));
}
export function validateDurableR895(fabric,session){
 if(!fabric||!(fabric.active instanceof Map)||!Array.isArray(fabric.queue)||!Array.isArray(fabric.receipts)||fabric.active.size>512||fabric.queue.length>1024||fabric.receipts.length>512||!Number.isSafeInteger(fabric.tick)||fabric.tick<0||!Number.isSafeInteger(fabric.sequence)||fabric.sequence<fabric.tick)throw new Error('Invalid or over-budget fabric');
 if(!session||!idx(session.agent,AGENTS)||!Number.isSafeInteger(session.memberCount)||session.memberCount<1||session.memberCount>12||!Number.isSafeInteger(session.stepCursor)||session.stepCursor<0||!Number.isSafeInteger(session.batch)||session.batch<1||session.batch>64||!['SELECTED_INNER','ALL_20736'].includes(session.mode)||!idx(session.selectedInner,SIZE))throw new Error('Invalid autonomous checkpoint session');
 const ids=new Set();let values=0;
 for(const [id,a] of fabric.active){
  if(!idx(id,AGENTS)||ids.has(id)||!a||a.id!==id||a.mode!=='IDLE'||!Number.isSafeInteger(a.epoch)||a.epoch<0||!(a.values instanceof Map)||a.values.size>SIZE||!Array.isArray(a.memory)||a.memory.length>32||!Array.isArray(a.inbox)||a.inbox.length>32)throw new Error('Invalid durable agent');
  ids.add(id);values+=a.values.size;if(values>R895_MAX_VALUES)throw new Error('Durable state budget exceeded; no values discarded');
  for(const [inner,value] of a.values){if(!idx(inner,SIZE)||!unit(value))throw new Error('Invalid durable inner-state float64')}
  if(!a.memory.every(r=>receipt(r,fabric.sequence,fabric.tick)))throw new Error('Invalid durable memory receipt');
  for(const m of a.inbox)if(!m||!idx(m.from,AGENTS)||m.to!==id||!idx(m.inner,SIZE)||!finite(m.delta)||!Number.isSafeInteger(m.epoch)||m.epoch<0||m.epoch>fabric.tick)throw new Error('Invalid durable peer inbox');
 }
 const tasks=new Set();
 for(const t of fabric.queue){
  if(!t||!Number.isSafeInteger(t.id)||t.id<1||t.id>fabric.sequence||tasks.has(t.id)||!idx(t.agent,AGENTS)||!idx(t.inner,SIZE)||!['OBSERVE','RELAX','EXCHANGE'].includes(t.kind)||!unit(t.weight)||(t.kind==='EXCHANGE'&&(!idx(t.target,AGENTS)||!neighbors(t.agent).includes(t.target))))throw new Error('Invalid durable pending task');
  tasks.add(t.id);
 }
 if(!fabric.receipts.every(r=>receipt(r,fabric.sequence,fabric.tick)))throw new Error('Invalid durable ledger receipt');
 return{schema:R895_SCHEMA,fabric,session:{agent:session.agent,memberCount:session.memberCount,stepCursor:session.stepCursor,batch:session.batch,mode:session.mode,selectedInner:session.selectedInner},activeAgents:fabric.active.size,modifiedValues:values};
}
// Corruption detection only. This digest is not an authentication signature.
async function integrityDigestR895(record){
 if(!globalThis.crypto?.subtle)throw new Error('Secure SHA-256 digest unavailable: durable persistence refused');
 const payload=JSON.stringify(record,(_key,value)=>value instanceof Map
  ? {__r895Map:[...value.entries()].sort((a,b)=>a[0]-b[0])}
  : value);
 const bytes=new TextEncoder().encode(payload);
 const hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
}
function openDatabase(){
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined')return reject(new Error('IndexedDB is unavailable on this device'));
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('IndexedDB open failed'));
  request.onblocked=()=>reject(new Error('IndexedDB version upgrade blocked'));
 });
}
export async function saveDurableR895(fabric,session){
 // Structured clone snapshots all maps, receipts and float64 values before asynchronous storage begins.
 const record=validateDurableR895(structuredClone(fabric),session);
 record.integrity=await integrityDigestR895(record);
 const db=await openDatabase();
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');
  tx.objectStore(STORE).put(record,KEY);
  tx.oncomplete=()=>resolve({schema:R895_SCHEMA,activeAgents:record.activeAgents,modifiedValues:record.modifiedValues});
  tx.onabort=()=>reject(tx.error||new Error('Atomic durable checkpoint aborted'));
  tx.onerror=()=>{}; // onabort owns the error
 })}finally{db.close()}
}
export async function restoreDurableR895(){
 const db=await openDatabase();
 try{return await new Promise((resolve,reject)=>{
  let record=null;const tx=db.transaction(STORE,'readonly');const request=tx.objectStore(STORE).get(KEY);
  request.onsuccess=()=>{record=request.result};
  request.onerror=()=>{};
  tx.oncomplete=()=>{void (async()=>{try{if(!record||record.schema!==R895_SCHEMA)throw new Error('No valid durable checkpoint');const verified=validateDurableR895(record.fabric,record.session);if(typeof record.integrity!=='string'||!/^[a-f0-9]{64}$/.test(record.integrity)||record.integrity!==await integrityDigestR895(verified))throw new Error('Durable checkpoint integrity mismatch; restore refused');resolve(verified)}catch(e){reject(e)}})()};
  tx.onabort=()=>reject(tx.error||new Error('Durable checkpoint read failed'));
 })}finally{db.close()}
}
