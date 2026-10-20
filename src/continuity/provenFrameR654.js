// R654: deterministic provenance and replay verification for canonical continuity frames.
import {createHash} from 'node:crypto';
import {runContinuityFrameR653} from './frameRuntimeR653.js';
const canonical=value=>{
 if(value===null||typeof value==='boolean'||typeof value==='string')return JSON.stringify(value);
 if(typeof value==='number'){if(!Number.isFinite(value))throw Error('non-finite proof value');return JSON.stringify(value)}
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 throw Error('unsupported proof value');
};
export const sha256R654=value=>createHash('sha256').update(canonical(value)).digest('hex');
export function executeProvenFrameR654(input){
 const result=runContinuityFrameR653(input);
 const record={schema:'OMEGA_PROVEN_FRAME_R654',truthClass:'LOCAL_REPLAY_VERIFIED_ONLY',input,output:result,proof:{algorithm:'sha256-canonical-json-v1',inputSha256:sha256R654(input),stateSha256:sha256R654(result.canonicalState),outputSha256:sha256R654(result)}};
 return structuredClone(record);
}
export function verifyProvenFrameR654(record){
 if(!record||record.schema!=='OMEGA_PROVEN_FRAME_R654'||record.proof?.algorithm!=='sha256-canonical-json-v1')return {valid:false,reason:'invalid record schema'};
 try{
  if(sha256R654(record.input)!==record.proof.inputSha256)return {valid:false,reason:'input fingerprint mismatch'};
  if(sha256R654(record.output?.canonicalState)!==record.proof.stateSha256)return {valid:false,reason:'canonical state fingerprint mismatch'};
  if(sha256R654(record.output)!==record.proof.outputSha256)return {valid:false,reason:'output fingerprint mismatch'};
  const replay=runContinuityFrameR653(record.input);
  if(sha256R654(replay)!==record.proof.outputSha256)return {valid:false,reason:'deterministic replay mismatch'};
  return {valid:true,truthClass:'LOCAL_DETERMINISTIC_REPLAY',stateSha256:record.proof.stateSha256};
 }catch(e){return {valid:false,reason:String(e.message)}}
}
