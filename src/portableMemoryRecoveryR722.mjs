// R722: portable recovery for existing R28 browser-local packet snapshots.
// SHA-256 detects accidental mutation, not an authenticated signer or CanonState proof.
export const MEMORY_KEY_R722='omega.v6.memory.r28';
export const MEMORY_SCHEMA_R722='OMEGA_PORTABLE_MEMORY_R722_V1';
export const MEMORY_LIMIT_R722=256;
const MAX_BYTES=524288;
const ROW_KEYS=['address','at','authority','decision','id','metrics','note','routeNext','sha256','stateId'];
const BUNDLE_KEYS=['rows','schema','sha256'];
const HEX=/^[a-f0-9]{64}$/i;
const exact=(object,keys)=>object&&typeof object==='object'&&!Array.isArray(object)&&
 Object.keys(object).sort().join('|')===keys.join('|');
const address=n=>Number.isSafeInteger(n)&&n>=0&&n<20736;
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const boundedText=(v,max)=>typeof v==='string'&&v.length<=max;
const jsonBytes=v=>new TextEncoder().encode(JSON.stringify(v)).length;
export async function digestMemoryR722(value){
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function verifyMemoryRowsR722(rows){
 if(!Array.isArray(rows)||rows.length>MEMORY_LIMIT_R722)throw Error('R722 bounded memory row count refused');
 if(jsonBytes(rows)>MAX_BYTES)throw Error('R722 memory bytes exceed portable limit');
 const seen=new Set();
 for(const row of rows){
  if(!exact(row,ROW_KEYS))throw Error('R722 memory row schema refused');
  if(!boundedText(row.id,100)||row.id.length<8||seen.has(row.id))throw Error('R722 duplicate or invalid memory identity');
  seen.add(row.id);
  if(!Number.isSafeInteger(row.at)||row.at<0||row.at>4102444800000||
   !address(row.address)||!Number.isSafeInteger(row.stateId)||row.stateId<0||
   !boundedText(row.note,2048)||!boundedText(row.decision,120)||
   !(row.routeNext===null||address(row.routeNext))||
   row.authority!=='BROWSER_LOCAL_PACKET_SNAPSHOT'||!HEX.test(row.sha256))
   throw Error('R722 memory fields or authority refused');
  if(!plain(row.metrics)||jsonBytes(row.metrics)>12000||
    Object.keys(row.metrics).some(k=>k==='__proto__'||k==='constructor'||k==='prototype'))
   throw Error('R722 memory metrics refused');
  // Recreate the exact R28 insertion order; R28 hashes only these fields.
  const core={address:row.address,stateId:row.stateId,note:row.note,metrics:row.metrics,
   decision:row.decision,routeNext:row.routeNext,authority:row.authority};
  if(await digestMemoryR722(JSON.stringify(core))!==row.sha256.toLowerCase())
   throw Error('R722 source packet snapshot digest mismatch');
 }
 return {count:rows.length,truthClass:'VERIFIED_BROWSER_LOCAL_DIGEST_ONLY'};
}
export async function exportMemoryBundleR722(rows){
 await verifyMemoryRowsR722(rows);
 const payload={schema:MEMORY_SCHEMA_R722,rows};
 if(jsonBytes(payload)>MAX_BYTES)throw Error('R722 export exceeds portable byte limit');
 return {...payload,sha256:await digestMemoryR722(JSON.stringify(payload))};
}
export async function verifyMemoryBundleR722(input){
 if(typeof input!=='string'||new TextEncoder().encode(input).length>MAX_BYTES)
  throw Error('R722 portable JSON size refused');
 let bundle;
 try{bundle=JSON.parse(input)}catch{throw Error('R722 invalid portable JSON')}
 if(!exact(bundle,BUNDLE_KEYS)||bundle.schema!==MEMORY_SCHEMA_R722||
    typeof bundle.sha256!=='string'||!HEX.test(bundle.sha256))
  throw Error('R722 portable envelope schema refused');
 await verifyMemoryRowsR722(bundle.rows);
 const digest=await digestMemoryR722(JSON.stringify({schema:bundle.schema,rows:bundle.rows}));
 if(digest!==bundle.sha256.toLowerCase())throw Error('R722 portable envelope digest mismatch');
 return bundle;
}
export async function mergeMemoryBundleR722(current,input){
 await verifyMemoryRowsR722(current);
 const bundle=await verifyMemoryBundleR722(input);
 const rows=[...current],byId=new Map(rows.map(row=>[row.id,row]));
 let added=0,existing=0;
 for(const row of bundle.rows){
  const old=byId.get(row.id);
  if(old){
   if(JSON.stringify(old)!==JSON.stringify(row))throw Error('R722 conflicting memory identity refused');
   existing++;
  }else{
   rows.push(row);byId.set(row.id,row);added++;
  }
 }
 await verifyMemoryRowsR722(rows);
 return {rows,added,existing,truthClass:'BROWSER_LOCAL_PORTABLE_RECOVERY_ONLY'};
}
