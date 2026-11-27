// R895: atomic IndexedDB exact-float64 state persistence for a bounded complete 12-agent × 20,736 inner-state sweep.
// No silent truncation, no automatic cloud work, and no second CanonState writer.
import {AGENTS,SIZE,neighbors,phaseNeighborR919,MAX_PERSISTABLE_VALUES_R974,validateRecursiveStoreR991} from './sphereAgentFabricR887.mjs';
export const R895_SCHEMA='OMEGA_SPHERE_DURABLE_CHECKPOINT_R895';
export const R895_MAX_VALUES=MAX_PERSISTABLE_VALUES_R974;
const DB='omega-sphere-durable-r895',STORE='checkpoints',KEY='latest';
const idx=(x,max)=>Number.isSafeInteger(x)&&x>=0&&x<max;
const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
const unit=(x)=>finite(x)&&x>=0&&x<=1;
function receipt(r,sequence,tick){
 return Boolean(r&&typeof r==='object'&&Number.isSafeInteger(r.taskId)&&r.taskId>=1&&r.taskId<=sequence&&idx(r.agent,AGENTS)&&idx(r.inner,SIZE)&&['OBSERVE','RELAX','EXCHANGE','PHASE_EXCHANGE'].includes(r.kind)&&Number.isSafeInteger(r.tick)&&r.tick>=1&&r.tick<=tick&&unit(r.before)&&unit(r.after)&&
  (r.kind!=='EXCHANGE'||(idx(r.peer,AGENTS)&&neighbors(r.agent).includes(r.peer)&&unit(r.peerBefore)&&unit(r.peerAfter)&&finite(r.conservationResidual)&&Math.abs(r.conservationResidual)<=1e-9&&Math.abs((r.after+r.peerAfter)-(r.before+r.peerBefore)-r.conservationResidual)<=1e-9))&&
  (r.kind!=='PHASE_EXCHANGE'||(idx(r.phase,12)&&Math.floor(r.phase/4)!==1&&idx(r.neighborInner,SIZE)&&r.neighborInner===phaseNeighborR919(r.inner,r.phase)&&unit(r.neighborBefore)&&unit(r.neighborAfter)&&finite(r.conservationResidual)&&Math.abs(r.conservationResidual)<=1e-9&&Math.abs((r.after+r.neighborAfter)-(r.before+r.neighborBefore)-r.conservationResidual)<=1e-9)));
}
// Receipt windows are chronological suffixes. A receipt cannot be attributed
// to another agent, replayed inside a window, or overlap a pending task.
function receiptWindowR973(rows,sequence,tick,owner=null){
 let previousTick=0,previousTask=0;
 for(const r of rows){
  if(!receipt(r,sequence,tick)||(owner!==null&&r.agent!==owner)||r.tick<=previousTick||r.taskId<=previousTask)return false;
  previousTick=r.tick;previousTask=r.taskId;
 }
 return true;
}
export function validateDurableR895(fabric,session){
 if(!fabric||!(fabric.active instanceof Map)||!Array.isArray(fabric.queue)||!Array.isArray(fabric.receipts)||fabric.active.size>512||fabric.queue.length>1024||fabric.receipts.length>512||!Number.isSafeInteger(fabric.tick)||fabric.tick<0||!Number.isSafeInteger(fabric.sequence)||fabric.sequence<fabric.tick)throw new Error('Invalid or over-budget fabric');
 if(!session||!idx(session.agent,AGENTS)||!Number.isSafeInteger(session.memberCount)||session.memberCount<1||session.memberCount>12||!Number.isSafeInteger(session.stepCursor)||session.stepCursor<0||!Number.isSafeInteger(session.batch)||session.batch<1||session.batch>64||!['SELECTED_INNER','ALL_20736'].includes(session.mode)||!idx(session.selectedInner,SIZE))throw new Error('Invalid autonomous checkpoint session');
 validateRecursiveStoreR991(fabric);
 const ids=new Set();let values=0;
 for(const [id,a] of fabric.active){
  if(!idx(id,AGENTS)||ids.has(id)||!a||a.id!==id||a.mode!=='IDLE'||!Number.isSafeInteger(a.epoch)||a.epoch<0||!(a.values instanceof Map)||a.values.size>SIZE||!Array.isArray(a.memory)||a.memory.length>32||!Array.isArray(a.inbox)||a.inbox.length>32)throw new Error('Invalid durable agent');
  ids.add(id);values+=a.values.size;if(values>R895_MAX_VALUES)throw new Error('Durable state budget exceeded; no values discarded');
  for(const [inner,value] of a.values){if(!idx(inner,SIZE)||!unit(value))throw new Error('Invalid durable inner-state float64')}
  if(!receiptWindowR973(a.memory,fabric.sequence,fabric.tick,id))throw new Error('Invalid durable memory receipt');
  for(const m of a.inbox)if(!m||!idx(m.from,AGENTS)||m.to!==id||!idx(m.inner,SIZE)||!finite(m.delta)||!Number.isSafeInteger(m.epoch)||m.epoch<0||m.epoch>fabric.tick)throw new Error('Invalid durable peer inbox');
 }
 const tasks=new Set();let priorTask=0;
 const lastCompleted=fabric.receipts.at(-1)?.taskId??0;
 for(const t of fabric.queue){
  if(!t||!Number.isSafeInteger(t.id)||t.id<1||t.id>fabric.sequence||tasks.has(t.id)||t.id<=Math.max(priorTask,lastCompleted)||!idx(t.agent,AGENTS)||!idx(t.inner,SIZE)||!['OBSERVE','RELAX','EXCHANGE','PHASE_EXCHANGE'].includes(t.kind)||!unit(t.weight)||(t.kind==='EXCHANGE'&&(!idx(t.target,AGENTS)||!neighbors(t.agent).includes(t.target)))||(t.kind==='PHASE_EXCHANGE'&&(!idx(t.phase,12)||Math.floor(t.phase/4)===1||t.target!==null)))throw new Error('Invalid durable pending task');
  tasks.add(t.id);priorTask=t.id;
 }
 if(!receiptWindowR973(fabric.receipts,fabric.sequence,fabric.tick))throw new Error('Invalid durable ledger receipt');
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
// Portable on-device transfer: map-preserving JSON with bounded size and the same
// SHA-256 corruption check as IndexedDB. This is not signed/authenticated provenance.
export const R895_PORTABLE_MAX_BYTES=40*1024*1024;
const portableMap=(key,value)=>value instanceof Map?{__omega_r895_map__:[...value.entries()]}:value;
const unportableMap=(key,value)=>{
 if(value&&typeof value==='object'&&!Array.isArray(value)&&Object.prototype.hasOwnProperty.call(value,'__omega_r895_map__')){
  const rows=value.__omega_r895_map__;
  if(Object.keys(value).length!==1||!Array.isArray(rows)||rows.length>SIZE)throw new Error('Invalid portable map envelope');
  const result=new Map();
  for(const row of rows){
   if(!Array.isArray(row)||row.length!==2||!Number.isSafeInteger(row[0])||row[0]<0||result.has(row[0]))throw new Error('Invalid or duplicate portable map key');
   result.set(row[0],row[1]);
  }
  return result;
 }
 return value;
};
// R987: the same portable codec is shared by file transfer and deterministic
// replay acceptance; it never depends on a browser database to verify bytes.
export async function encodeDurablePortableR987(fabric,session){
 const saved=validateDurableR895(structuredClone(fabric),session);
 const record={...saved,integrity:await integrityDigestR895(saved)};
 const data=JSON.stringify(record,portableMap);
 if(new TextEncoder().encode(data).length>R895_PORTABLE_MAX_BYTES)throw new Error('Portable checkpoint exceeds 40 MiB limit');
 return data;
}
export async function exportDurablePortableR895(){
 const saved=await restoreDurableR895();
 return encodeDurablePortableR987(saved.fabric,saved.session);
}
export async function decodeDurablePortableR987(data){
 if(typeof data!=='string'||data.length>R895_PORTABLE_MAX_BYTES||data.length<20||new TextEncoder().encode(data).length>R895_PORTABLE_MAX_BYTES)throw new Error('Portable checkpoint absent or oversized');
 let candidate;try{candidate=JSON.parse(data,unportableMap)}catch(e){throw new Error('Portable checkpoint JSON invalid: '+(e instanceof Error?e.message:String(e)))}
 if(!candidate||candidate.schema!==R895_SCHEMA)throw new Error('Portable checkpoint schema mismatch');
 const record=validateDurableR895(candidate.fabric,candidate.session);
 if(candidate.activeAgents!==record.activeAgents||candidate.modifiedValues!==record.modifiedValues)throw new Error('Portable checkpoint census mismatch');
 if(typeof candidate.integrity!=='string'||!/^[a-f0-9]{64}$/.test(candidate.integrity)||candidate.integrity!==await integrityDigestR895(record))
  throw new Error('Portable checkpoint integrity mismatch; import refused');
 return record;
}
export async function importDurablePortableR895(data){
 const record=await decodeDurablePortableR987(data);
 // Save validates a fresh structured clone and only replaces the stored record in
 // one IndexedDB transaction after all import checks succeed.
 return saveDurableR895(record.fabric,record.session);
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
