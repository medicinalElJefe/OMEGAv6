function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value}
function hex(bytes){return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function sha256(value){const bytes=new TextEncoder().encode(JSON.stringify(canonical(value))),digest=await crypto.subtle.digest('SHA-256',bytes);return hex(digest)}
const HASH=/^[a-f0-9]{64}$/i;
function hashOk(v){return HASH.test(String(v||''))}
export async function verifyProofChainR54(input){
 const body=input&&typeof input==='object'?input:{},segment=Array.isArray(body.segment)?body.segment:[];
 if(segment.length<1)return{ok:false,status:400,code:'CHAIN_SEGMENT_REQUIRED',message:'At least one proof-chain receipt is required.'};
 if(segment.length>188)return{ok:false,status:413,code:'CHAIN_SEGMENT_TOO_LARGE',message:'R54 verifies at most 188 receipts per submitted segment.'};
 const raw=JSON.stringify(segment);if(raw.length>262144)return{ok:false,status:413,code:'CHAIN_INPUT_TOO_LARGE',message:'R54 proof-chain verification is bounded to 256 KiB.'};
 const errors=[],duplicates=[],recomputed=[],seen=new Set();let previousCheckpoint=body.expectedParentCheckpointHash??null,previousCurrentHash=body.expectedParentCurrentHash??null;
 if(previousCheckpoint!=null&&!hashOk(previousCheckpoint))return{ok:false,status:422,code:'EXPECTED_PARENT_CHECKPOINT_INVALID',message:'expectedParentCheckpointHash must be null or 64-hex SHA-256.'};
 if(previousCurrentHash!=null&&!hashOk(previousCurrentHash))return{ok:false,status:422,code:'EXPECTED_PARENT_CURRENT_INVALID',message:'expectedParentCurrentHash must be null or 64-hex SHA-256.'};
 for(let i=0;i<segment.length;i++){
  const r=segment[i]||{},label=`segment[${i}]`;
  for(const key of ['currentHash','checkpointHash'])if(!hashOk(r[key]))errors.push(`${label}.${key} must be 64-hex SHA-256`);
  if(r.baseHash!=null&&!hashOk(r.baseHash))errors.push(`${label}.baseHash must be null or 64-hex SHA-256`);
  if(r.deltaHash!=null&&!hashOk(r.deltaHash))errors.push(`${label}.deltaHash must be null or 64-hex SHA-256`);
  if(r.snapshotHash!=null&&!hashOk(r.snapshotHash))errors.push(`${label}.snapshotHash must be null or 64-hex SHA-256`);
  if(!['FULL_SNAPSHOT','DELTA'].includes(String(r.mode)))errors.push(`${label}.mode must be FULL_SNAPSHOT or DELTA`);
  if(seen.has(String(r.checkpointHash)))duplicates.push(i);else seen.add(String(r.checkpointHash));
  let expectedCheckpoint=null;
  if(r.mode==='FULL_SNAPSHOT'){
   if(r.baseHash!==null&&r.baseHash!==undefined)errors.push(`${label} full snapshot must not claim baseHash`);
   if(r.deltaHash!==null&&r.deltaHash!==undefined)errors.push(`${label} full snapshot must not claim deltaHash`);
   if(!hashOk(r.snapshotHash))errors.push(`${label} full snapshot requires snapshotHash`);
   if(i>0&&!r.resynced)errors.push(`${label} full snapshot inside an active chain must be marked resynced`);
   expectedCheckpoint=await sha256({previousCheckpointHash:null,snapshotHash:r.snapshotHash,currentPacketHash:r.currentHash});
   previousCheckpoint=null;previousCurrentHash=null;
  }else if(r.mode==='DELTA'){
   if(!hashOk(r.baseHash))errors.push(`${label} delta requires baseHash`);
   if(!hashOk(r.deltaHash))errors.push(`${label} delta requires deltaHash`);
   if(previousCurrentHash!=null&&String(r.baseHash)!==String(previousCurrentHash))errors.push(`${label}.baseHash does not match prior currentHash`);
   expectedCheckpoint=await sha256({previousCheckpointHash:previousCheckpoint||null,deltaHash:r.deltaHash,currentPacketHash:r.currentHash});
  }
  if(expectedCheckpoint&&hashOk(r.checkpointHash)&&expectedCheckpoint!==String(r.checkpointHash))errors.push(`${label}.checkpointHash failed deterministic recomputation`);
  recomputed.push({index:i,expectedCheckpointHash:expectedCheckpoint,providedCheckpointHash:r.checkpointHash,match:expectedCheckpoint===String(r.checkpointHash)});
  previousCheckpoint=String(r.checkpointHash||'');previousCurrentHash=String(r.currentHash||'');
 }
 if(duplicates.length)errors.push(`duplicate checkpointHash at indexes ${duplicates.join(',')}`);
 const normalized=segment.map(r=>({mode:r.mode,baseHash:r.baseHash??null,currentHash:r.currentHash,deltaHash:r.deltaHash??null,snapshotHash:r.snapshotHash??null,checkpointHash:r.checkpointHash,changedComponents:Array.isArray(r.changedComponents)?r.changedComponents:[],patchCount:Number(r.patchCount||0),resynced:r.resynced===true}));
 const segmentHash=await sha256(normalized),head=normalized[normalized.length-1],health=errors.length===0?'COHERENT':'REGRESSION_DETECTED';
 return{ok:errors.length===0,status:errors.length?422:200,schema:'OMEGA_SUPERVISED_PROOF_CHAIN_R54',health,segmentHash,receiptCount:segment.length,headCheckpointHash:head?.checkpointHash||null,recomputed,errors,duplicates,proof:{algorithm:'SHA-256',authority:'NON_AUTHORITATIVE_CHAIN_VERIFIER',receivedNotObserved:true,supervision:'B012-compatible submitted event-chain verification',checkpointRecomputation:true},boundary:'R54 recomputes structural continuity from submitted R53 receipts. It does not persist the journal, own canonical state, repair history silently, claim a native watchdog, or prove external/device facts.'};
}
