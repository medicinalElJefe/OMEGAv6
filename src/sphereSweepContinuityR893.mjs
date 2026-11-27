// R893 explicitly saved browser-only sweep continuation.
// Binds UI scheduler position to the exact R888 fabric checkpoint checksum.
// Detects accidental corruption; not cryptographic authentication.
import {AGENTS,SIZE} from './sphereAgentFabricR887.mjs';
import {R893_MAX_BATCH} from './sphereFullInnerSweepR893.mjs';
export const R893_CONTINUATION_SCHEMA='OMEGA_SPHERE_SWEEP_CONTINUATION_R893';
const R888_SCHEMA='OMEGA_SPHERE_AGENT_CHECKPOINT_R888';
function envelope(checkpoint){
 if(typeof checkpoint!=='string'||checkpoint.length<2)throw new Error('Missing fabric checkpoint');
 let v;try{v=JSON.parse(checkpoint)}catch{throw new Error('Invalid fabric checkpoint JSON')}
 if(v?.schema!==R888_SCHEMA||typeof v.checksum!=='string'||!/^[a-f0-9]{8}$/.test(v.checksum))throw new Error('Invalid R888 checkpoint envelope');
 return v;
}
export function serializeSweepContinuationR893(fabricCheckpoint,meta){
 const {checksum}=envelope(fabricCheckpoint);
 if(!meta||!Number.isSafeInteger(meta.agent)||meta.agent<0||meta.agent>=AGENTS||!Number.isSafeInteger(meta.memberCount)||meta.memberCount<1||meta.memberCount>12||!Number.isSafeInteger(meta.stepCursor)||meta.stepCursor<0||!Number.isSafeInteger(meta.batch)||meta.batch<1||meta.batch>R893_MAX_BATCH||!['SELECTED_INNER','ALL_20736'].includes(meta.mode)||!Number.isSafeInteger(meta.selectedInner)||meta.selectedInner<0||meta.selectedInner>=SIZE)throw new RangeError('Invalid R893 scheduler continuation');
 return JSON.stringify({schema:R893_CONTINUATION_SCHEMA,fabricChecksum:checksum,...{agent:meta.agent,memberCount:meta.memberCount,stepCursor:meta.stepCursor,batch:meta.batch,mode:meta.mode,selectedInner:meta.selectedInner}});
}
export function restoreSweepContinuationR893(fabricCheckpoint,serialized){
 const {checksum}=envelope(fabricCheckpoint);
 if(typeof serialized!=='string'||serialized.length>2048)throw new Error('Sweep continuation absent or oversized');
 let meta;try{meta=JSON.parse(serialized)}catch{throw new Error('Sweep continuation JSON invalid')}
 if(meta?.schema!==R893_CONTINUATION_SCHEMA||meta.fabricChecksum!==checksum)throw new Error('Sweep continuation is not bound to this exact fabric checkpoint');
 const canonical=serializeSweepContinuationR893(fabricCheckpoint,meta);
 if(canonical!==JSON.stringify(meta))throw new Error('Sweep continuation has unexpected or reordered fields');
 return Object.freeze({agent:meta.agent,memberCount:meta.memberCount,stepCursor:meta.stepCursor,batch:meta.batch,mode:meta.mode,selectedInner:meta.selectedInner});
}
