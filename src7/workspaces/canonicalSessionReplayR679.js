/* OMEGA R679 — source-bound, tamper-evident execution session replay.
 * Recovered law: B053 / State_Traversal_Verified.zip /
 * backend/services/session_service.py, test_full_session_replay.py.
 *
 * This is an intentionally read-only browser session over existing canonical
 * source-model executors. It does NOT emulate the donor's native host, write
 * CanonState, or promote any external evidence.
 */
import {evaluateOperationalModesR671,R671_MODES} from './operationalModesR671.js';
import {collapseCanonicalFieldR676,applyOperatorR676,propagateOperatorR676} from './operatorGraphR676.js';
import {replayHistoricalDonorR678,verifyOriginalDonorReplayR678} from './historicalOperatorReplayR678.js';

export const R679_SCHEMA='OMEGA_CANONICAL_MODEL_SESSION_R679';
export const R679_SOURCE_KEYS=Object.freeze(['C','Phi','q','Lambda','scar','evidence','continuityGate','routeNext']);
export const R679_STORAGE_KEY='omega.r679.model.session.v1';
export const R679_GENESIS='0'.repeat(64);
export const R679_MAX_EVENTS=128;
export const R679_MAX_JSON_BYTES=512*1024;
export const R679_TRUTH_BOUNDARY='Local, read-only source-model execution history. The native B053 donor records frames and ticks; R679 reproduces its source-state binding and hash-chain principle, not native/device execution. Replay proves only determinism against the locally available canonical model. Git production and CanonState admission require their separate existing authorities.';

function ensureFinite(value,label){
 if(typeof value!=='number'||!Number.isFinite(value))throw Error('R679 non-finite '+label);
 return value;
}
function stable(value){
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(ArrayBuffer.isView(value))return stable(Array.from(value));
 if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
 const keys=Object.keys(value).sort();
 return '{'+keys.map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
}
function cryptoSubtle(){
 if(!globalThis.crypto?.subtle)throw Error('R679 SHA256 proof requires WebCrypto');
 return globalThis.crypto.subtle;
}
export async function sha256TextR679(value){
 const payload=new TextEncoder().encode(typeof value==='string'?value:stable(value));
 const digest=await cryptoSubtle().digest('SHA-256',payload);
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
}
export function validateActionR679(action){
 if(!action||typeof action!=='object'||Array.isArray(action))throw Error('R679 action required');
 const type=action.type;
 if(!['MODE_RUN','OPERATOR_RUN','DONOR_REPLAY'].includes(type))throw Error('R679 invalid execution family');
 if(type==='DONOR_REPLAY'){
  if(action.effectiveUpdates!==59)throw Error('R679 only source-matched donor 59-update replay is admitted');
  return Object.freeze({type,effectiveUpdates:59});
 }
 if(!Number.isInteger(action.address)||action.address<0||action.address>=20736)throw Error('R679 canonical address invalid');
 if(type==='MODE_RUN'){
  if(!R671_MODES.includes(action.mode)||!Number.isInteger(action.depth)||action.depth<4||action.depth>24)
   throw Error('R679 mode or route depth invalid');
  return Object.freeze({type,address:action.address,mode:action.mode,depth:action.depth});
 }
 if(!R679_SOURCE_KEYS.includes(action.channel)||action.channel==='routeNext'||action.channel==='continuityGate')
  throw Error('R679 source channel unsupported');
 if(!['P_plus_011','P_minus_01m1','P_rw','PROPAGATE'].includes(action.operation))throw Error('R679 operator not source-backed');
 if(!Number.isInteger(action.iterations)||action.iterations<1||action.iterations>60)throw Error('R679 iteration count invalid');
 return Object.freeze({type,address:action.address,channel:action.channel,operation:action.operation,iterations:action.iterations});
}
export async function sourceDigestR679(field){
 if(field?.count!==20736)throw Error('R679 requires canonical 20736-state model');
 const view=new DataView(new ArrayBuffer(20736*4*R679_SOURCE_KEYS.length));
 for(let k=0;k<R679_SOURCE_KEYS.length;k++){
  const key=R679_SOURCE_KEYS[k],v=field[key];
  if(!v||v.length!==20736)throw Error('R679 source channel missing '+key);
  for(let i=0;i<20736;i++){
   const num=ensureFinite(Number(v[i]),key+'['+i+']');
   if(key==='routeNext'&&(!Number.isInteger(num)||num<0||num>=20736))throw Error('R679 invalid routeNext['+i+']');
   view.setFloat32((k*20736+i)*4,num,true);
  }
 }
 const digest=await cryptoSubtle().digest('SHA-256',view.buffer);
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
}
async function floatVectorHash(values){
 const bytes=new ArrayBuffer(values.length*8),view=new DataView(bytes);
 for(let i=0;i<values.length;i++)view.setFloat64(i*8,ensureFinite(Number(values[i]),'vector'),true);
 const digest=await cryptoSubtle().digest('SHA-256',bytes);
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
}
export async function executeSourceActionR679(field,raw){
 const action=validateActionR679(raw);
 if(action.type==='MODE_RUN'){
  const receipt=evaluateOperationalModesR671(field,action.address,action.mode,action.depth);
  return Object.freeze({family:action.type,outputHash:await sha256TextR679(receipt),
   nodes:receipt.states.length,summary:'R651–R653 '+receipt.mode+'; '+receipt.states.length+' canonical route states; projection only',
   proofAuthority:'LOCAL_SOURCE_MODEL_R671'});
 }
 if(action.type==='DONOR_REPLAY'){
  const replay=replayHistoricalDonorR678(59);
  const parity=await verifyOriginalDonorReplayR678(replay.values);
  if(!parity.match)throw Error('R679 original donor 1728-state hash mismatch; no record admitted');
  return Object.freeze({family:action.type,outputHash:parity.sha256,nodes:1728,
   summary:'Original B053 donor 59 effective updates, source 1728-value SHA-256 matched',
   proofAuthority:'SOURCE_DONOR_PARITY_R678'});
 }
 if(field?.count!==20736)throw Error('R679 requires source field for operator execution');
 const values=collapseCanonicalFieldR676(field,action.channel);
 const output=action.operation==='PROPAGATE'
  ?propagateOperatorR676(values,{iterations:action.iterations}).values
  :applyOperatorR676(values,action.operation);
 return Object.freeze({family:action.type,outputHash:await floatVectorHash(output),nodes:1728,
  summary:'TRUE Operator '+action.operation+' over source '+action.channel+'; '+(action.operation==='PROPAGATE'?action.iterations:1)+' bounded step(s)',
  proofAuthority:'LOCAL_HISTORICAL_OPERATOR_R676'});
}
export async function createSourceSessionR679(field,{createdAt=new Date().toISOString()}={}){
 const sourceSha256=await sourceDigestR679(field);
 if(!Number.isFinite(Date.parse(createdAt)))throw Error('R679 invalid session time');
 return Object.freeze({schema:R679_SCHEMA,sourceSha256,createdAt,events:Object.freeze([]),head:R679_GENESIS,
  admission:'LOCAL_MODEL_ONLY',canonicalMutation:false,truthBoundary:R679_TRUTH_BOUNDARY});
}
function requireEnvelope(session){
 if(!session||session.schema!==R679_SCHEMA||typeof session.sourceSha256!=='string'||!/^[a-f0-9]{64}$/.test(session.sourceSha256)
  ||!Array.isArray(session.events)||session.events.length>R679_MAX_EVENTS
  ||typeof session.head!=='string'||!/^([0-9a-f]{64})$/.test(session.head)
  ||session.admission!=='LOCAL_MODEL_ONLY'||session.canonicalMutation!==false
  ||typeof session.createdAt!=='string'||!Number.isFinite(Date.parse(session.createdAt)))throw Error('R679 invalid or untrusted session envelope');
}
async function eventHash(previousHash,index,action,outputHash,sourceSha256,createdAt){
 return sha256TextR679({previousHash,index,action,outputHash,sourceSha256,createdAt});
}
export async function appendSourceExecutionR679(session,field,action){
 requireEnvelope(session);
 if(session.events.length>=R679_MAX_EVENTS)throw Error('R679 session event limit reached');
 const actualSource=await sourceDigestR679(field);
 if(actualSource!==session.sourceSha256)throw Error('R679 source changed; historical session must be held');
 // Reject mutation of earlier events before appending, not merely at manual replay.
 const replay=await verifySourceSessionR679(session,field);
 if(!replay.valid)throw Error('R679 existing session hash/replay failed: '+replay.failures.join(','));
 const operation=validateActionR679(action);
 const result=await executeSourceActionR679(field,operation);
 const index=session.events.length,previousHash=session.head;
 const recordHash=await eventHash(previousHash,index,operation,result.outputHash,session.sourceSha256,session.createdAt);
 const event=Object.freeze({index,previousHash,recordHash,action:operation,outputHash:result.outputHash,
  family:result.family,summary:result.summary,proofAuthority:result.proofAuthority,nodes:result.nodes});
 return Object.freeze({...session,head:recordHash,events:Object.freeze([...session.events,event])});
}
export async function verifySourceSessionR679(session,field){
 const failures=[];
 try{requireEnvelope(session)}catch(e){return Object.freeze({valid:false,failures:[String(e)],verifiedEvents:0,head:R679_GENESIS,canonicalMutation:false})}
 let currentDigest;
 try{currentDigest=await sourceDigestR679(field)}catch(e){return Object.freeze({valid:false,failures:[String(e)],verifiedEvents:0,head:R679_GENESIS,canonicalMutation:false})}
 if(currentDigest!==session.sourceSha256)failures.push('SOURCE_SHA_MISMATCH');
 let previous=R679_GENESIS,verifiedEvents=0;
 for(let i=0;i<session.events.length;i++){
  const entry=session.events[i];
  try{
   if(entry.index!==i||entry.previousHash!==previous)failures.push('CHAIN_LINK:'+i);
   const action=validateActionR679(entry.action);
   const computed=await executeSourceActionR679(field,action);
   if(computed.outputHash!==entry.outputHash)failures.push('REPLAY_OUTPUT:'+i);
   if(computed.family!==entry.family||computed.summary!==entry.summary||computed.proofAuthority!==entry.proofAuthority||computed.nodes!==entry.nodes)
    failures.push('REPLAY_METADATA:'+i);
   const expectedHash=await eventHash(previous,i,action,entry.outputHash,session.sourceSha256,session.createdAt);
   if(expectedHash!==entry.recordHash)failures.push('CHAIN_HASH:'+i);
   previous=entry.recordHash;
   verifiedEvents++;
  }catch(e){failures.push('REPLAY_ERROR:'+i+':'+String(e));break}
 }
 if(previous!==session.head)failures.push('HEAD_HASH_MISMATCH');
 return Object.freeze({schema:'OMEGA_SESSION_REPLAY_VERIFICATION_R679',valid:failures.length===0,
  failures:Object.freeze(failures),verifiedEvents,sourceSha256:currentDigest,head:previous,
  canonicalMutation:false,productionDeploymentProved:false,externalDeviceProved:false});
}
export function serializeSourceSessionR679(session){
 requireEnvelope(session);
 const text=JSON.stringify(session,null,2)+'\n';
 if(new TextEncoder().encode(text).length>R679_MAX_JSON_BYTES)throw Error('R679 export exceeds bounded size');
 return text;
}
export function parseSourceSessionR679(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>R679_MAX_JSON_BYTES)throw Error('R679 import too large');
 const session=JSON.parse(text);
 requireEnvelope(session);
 for(const e of session.events){if(typeof e?.recordHash!=='string'||!/^[a-f0-9]{64}$/.test(e.recordHash))throw Error('R679 imported record hash invalid')}
 return session; // Imported data is UNVERIFIED until verifySourceSessionR679 finishes.
}
