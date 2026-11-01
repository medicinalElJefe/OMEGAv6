// R745: explicit same-browser checkpoint for an R744 executable journey.
// A stored snapshot is never authority: recovery requires the live R734 source
// field and a complete fresh R744 recomputation before restoring any controls.
import {verifyConstrainedAtlasJourneyR744} from './constrainedAtlasJourneyR744.mjs';
export const LOCAL_ATLAS_JOURNEY_SCHEMA_R745='omega.r745.local-atlas-journey.v1';
export const LOCAL_ATLAS_JOURNEY_KEY_R745='omega.r745.local-atlas-journey.v1';
const MAX_BYTES=1048576;
export function sourceMetricFingerprintR745(field,channel){
 if(!field||field.count!==20736||!(field[channel] instanceof Float32Array)||field[channel].length!==20736)
  throw Error('R745 complete source channel required');
 const values=field[channel];
 const bytes=new Uint8Array(values.buffer,values.byteOffset,values.byteLength);
 let hash=2166136261;
 for(let i=0;i<bytes.length;i++)hash=Math.imul(hash^bytes[i],16777619)>>>0;
 return 'fnv1a32:'+hash.toString(16).padStart(8,'0');
}
export function createLocalAtlasCheckpointR745(route,field){
 if(!route||typeof route!=='object')throw Error('R745 route required');
 const verified=verifyConstrainedAtlasJourneyR744(JSON.stringify(route),field);
 return {schema:LOCAL_ATLAS_JOURNEY_SCHEMA_R745,
  scope:'same-browser-explicit-only',sourceFingerprint:sourceMetricFingerprintR745(field,verified.channel),
  journey:verified};
}
export function verifyLocalAtlasCheckpointR745(raw,field){
 if(typeof raw!=='string'||raw.length>MAX_BYTES)throw Error('R745 checkpoint size refused');
 let candidate;try{candidate=JSON.parse(raw)}catch{throw Error('R745 invalid checkpoint JSON')}
 if(!candidate||candidate.schema!==LOCAL_ATLAS_JOURNEY_SCHEMA_R745)throw Error('R745 checkpoint schema refused');
 const expected=createLocalAtlasCheckpointR745(candidate.journey,field);
 if(JSON.stringify(candidate)!==JSON.stringify(expected))throw Error('R745 checkpoint differs from fresh source execution');
 return expected.journey;
}
