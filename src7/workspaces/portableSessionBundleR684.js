/**
 * R684 — portable, source-complete, replayable OMEGA model evidence.
 *
 * R679 only binds a receipt to canonical source hash; this module restores
 * the original 8 complete 20736-address source channels so its computation
 * can be independently replayed even after deployed model changes.
 *
 * Proof scope: same archived model and source-bound executors, not R125
 * CanonState admission, cloud replication, signed origin, physical observation
 * or the current production state.
 */
import {
 R679_SCHEMA,R679_SOURCE_KEYS,sourceDigestR679,verifySourceSessionR679,
 parseSourceSessionR679,sha256TextR679
} from './canonicalSessionReplayR679.js';

export const R684_SCHEMA='OMEGA_PORTABLE_SOURCE_SESSION_BUNDLE_R684';
export const R684_COUNT=20736;
export const R684_CHANNELS=8;
export const R684_SOURCE_BYTES=R684_COUNT*R684_CHANNELS*4;
export const R684_MAX_BUNDLE_BYTES=2*1024*1024;
export const R684_ENCODING='FLOAT32_LE_8_CHANNELS_BASE64_V1';
export const R684_BOUNDARY='Archived eight-channel executor-input replay, not the entire OMEGA canonical corpus or physical geometry. This bundle has a SHA256 integrity digest, NOT an owner signature, trusted cloud receipt, current CanonState authority, device execution proof, empirical observation, or physical dimensional evidence. A party controlling all bytes can rehash a forged bundle.';

function requireBytes(value){
 if(typeof value!=='string'||value.length!==R684_SOURCE_BYTES/3*4
  ||!(/^[A-Za-z0-9+/]+={0,2}$/).test(value))throw Error('R684 source bytes malformed or wrong length');
 const raw=atob(value);
 if(raw.length!==R684_SOURCE_BYTES)throw Error('R684 decoded source length mismatch');
 return raw;
}
function binary64(bytes){
 let chunks=[];
 for(let i=0;i<bytes.length;i+=8192)chunks.push(String.fromCharCode(...bytes.subarray(i,i+8192)));
 return btoa(chunks.join(''));
}
function serializedSnapshot(field){
 if(!field||field.count!==R684_COUNT)throw Error('R684 expected source 20736-state field');
 const bytes=new Uint8Array(R684_SOURCE_BYTES),view=new DataView(bytes.buffer);
 for(let keyIndex=0;keyIndex<R679_SOURCE_KEYS.length;keyIndex++){
  const name=R679_SOURCE_KEYS[keyIndex],values=field[name];
  if(!values||values.length!==R684_COUNT)throw Error('R684 missing original source channel '+name);
  for(let j=0;j<R684_COUNT;j++){
   const v=Number(values[j]);
   if(!Number.isFinite(v))throw Error('R684 nonfinite source '+name);
   if(name==='routeNext'&&(!Number.isInteger(v)||v<0||v>=R684_COUNT))throw Error('R684 invalid canonical route');
   view.setFloat32((keyIndex*R684_COUNT+j)*4,v,true);
  }
 }
 return bytes;
}
export function restoreSourceSnapshotR684(base64){
 const raw=requireBytes(base64),bytes=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 const view=new DataView(bytes.buffer),field={count:R684_COUNT};
 for(let keyIndex=0;keyIndex<R679_SOURCE_KEYS.length;keyIndex++){
  const name=R679_SOURCE_KEYS[keyIndex],values=name==='routeNext'?new Uint32Array(R684_COUNT):new Float32Array(R684_COUNT);
  for(let j=0;j<R684_COUNT;j++){
   const v=view.getFloat32((keyIndex*R684_COUNT+j)*4,true);
   if(!Number.isFinite(v))throw Error('R684 invalid archived model value '+name);
   if(name==='routeNext'&&(!Number.isInteger(v)||v<0||v>=R684_COUNT))throw Error('R684 invalid archived route');
   values[j]=v;
  }
  field[name]=values;
 }
 return field;
}
function sealedBody({session,sourceSha256,sourceBase64,createdAt}){
 return {schema:R684_SCHEMA,encoding:R684_ENCODING,sourceCount:R684_COUNT,
   sourceKeys:[...R679_SOURCE_KEYS],sourceSha256,sourceBase64,session,createdAt,
   authority:'LOCAL_ARCHIVED_MODEL_ONLY',canonicalMutation:false,
   truthBoundary:R684_BOUNDARY};
}
export async function exportPortableSessionBundleR684(session,field,{createdAt=new Date().toISOString()}={}){
 if(!Number.isFinite(Date.parse(createdAt)))throw Error('R684 invalid export time');
 // Run actual original session replay before an export is allowed.
 const result=await verifySourceSessionR679(session,field);
 if(!result.valid)throw Error('R684 refuses unverified session '+result.failures.join(','));
 if(session.schema!==R679_SCHEMA)throw Error('R684 non-R679 session');
 const sourceSha256=await sourceDigestR679(field);
 if(sourceSha256!==session.sourceSha256)throw Error('R684 source drift');
 const sourceBase64=binary64(serializedSnapshot(field));
 const body=sealedBody({session:parseSourceSessionR679(JSON.stringify(session)),sourceSha256,sourceBase64,createdAt});
 const sha256=await sha256TextR679(body);
 const bundle=Object.freeze({...body,sha256});
 if(new TextEncoder().encode(JSON.stringify(bundle)).length>R684_MAX_BUNDLE_BYTES)throw Error('R684 portable export exceeds size limit');
 return bundle;
}
export function parsePortableSessionBundleR684(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>R684_MAX_BUNDLE_BYTES)throw Error('R684 import size limit exceeded');
 const value=JSON.parse(text);
 if(!value||value.schema!==R684_SCHEMA||value.encoding!==R684_ENCODING
  ||value.sourceCount!==R684_COUNT||!Array.isArray(value.sourceKeys)
  ||value.sourceKeys.join('|')!==R679_SOURCE_KEYS.join('|')
  ||!(/^[0-9a-f]{64}$/).test(value.sha256||'')
  ||!(/^[0-9a-f]{64}$/).test(value.sourceSha256||'')
  ||value.authority!=='LOCAL_ARCHIVED_MODEL_ONLY'||value.canonicalMutation!==false
  ||typeof value.createdAt!=='string'||!Number.isFinite(Date.parse(value.createdAt))
  ||typeof value.truthBoundary!=='string'||value.truthBoundary!==R684_BOUNDARY)throw Error('R684 invalid portable proof envelope');
 requireBytes(value.sourceBase64);
 parseSourceSessionR679(JSON.stringify(value.session));
 return value; // Envelope parsing is NOT source proof; verify original bytes before use.
}
export async function verifyPortableSessionBundleR684(bundle,liveField=null){
 const failures=[];
 let verifiedEvents=0,sourceMatchesLive=null,sourceSha256='',result=null;
 try{
  const parsed=parsePortableSessionBundleR684(JSON.stringify(bundle));
  const {sha256,...body}=parsed;
  if(await sha256TextR679(body)!==sha256)failures.push('PORTABLE_ENVELOPE_DIGEST_MISMATCH');
  const snapshot=restoreSourceSnapshotR684(parsed.sourceBase64);
  sourceSha256=await sourceDigestR679(snapshot);
  if(sourceSha256!==parsed.sourceSha256||sourceSha256!==parsed.session.sourceSha256)
   failures.push('ARCHIVED_SOURCE_HASH_MISMATCH');
  result=await verifySourceSessionR679(parsed.session,snapshot);
  verifiedEvents=result.verifiedEvents;
  if(!result.valid)failures.push(...result.failures.map(x=>'ARCHIVED_REPLAY_'+x));
  if(liveField!==null){
   const live=await sourceDigestR679(liveField);
   sourceMatchesLive=live===sourceSha256;
   // Archived replay remains valid even if live source changed. Do not falsely
   // claim it is the current canonical source when it isn't.
  }
 }catch(error){failures.push('INVALID_OR_UNREPLAYABLE_BUNDLE:'+String(error))}
 return Object.freeze({
  schema:'OMEGA_PORTABLE_SESSION_BUNDLE_VERIFICATION_R684',
  valid:failures.length===0,failures:Object.freeze(failures),
  verifiedEvents,sourceSha256,sourceMatchesLive,
  archivedSourceReplayed:!!result?.valid,
  truthClass:failures.length?'HELD':sourceMatchesLive===true?'VERIFIED_LOCAL_REPLAY_AND_LIVE_SOURCE_MATCH':'VERIFIED_ARCHIVED_MODEL_REPLAY_ONLY',
  productionVerified:false,ownerAuthenticated:false,canonicalMutation:false,
  truthBoundary:R684_BOUNDARY
 });
}
export function serializePortableSessionBundleR684(bundle){
 const text=JSON.stringify(bundle,null,2)+'\n';
 if(new TextEncoder().encode(text).length>R684_MAX_BUNDLE_BYTES)throw Error('R684 export size limit exceeded');
 return text;
}
