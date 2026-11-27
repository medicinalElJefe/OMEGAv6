// R894: bounded browser-side receipt journal for existing durable R121 cloud missions.
// RESTORE never dispatches a mission, performs inference, or admits results into CanonState.
import {AGENTS,SIZE} from './sphereAgentFabricR887.mjs';
import {R889_SCHEMA} from './sphereSwarmBridgeR889.mjs';
import {R890_SCHEMA} from './sphereCollectiveR890.mjs';
import {validateCellReturnsR1008} from './sphereCellReturnsR1008.mjs';
export const R894_SCHEMA='OMEGA_SPHERE_MISSION_JOURNAL_R894';
export const R894_STORAGE_KEY='omega.r894.sphere.missions.v1';
const MAX_JOURNAL=131072,ID=/^[A-Za-z0-9_.:-]{1,128}$/;
const STATUS=new Set(['RECEIVED','QUEUED','RUNNING','COMPLETE','PAUSED','CANCELLED','FAILED','TIMED_OUT','NOT_REPORTED']);
function statusOf(x){if(typeof x!=='string'||!STATUS.has(x))throw new Error('Untrusted cloud mission status');return x}
const index=(x,max)=>Number.isSafeInteger(x)&&x>=0&&x<max;
// R1006: persist only a bounded client-supplied projection actually attached
// to an accepted mission. A digest does not authenticate a server or donor.
const SHA_R1006=/^[a-f0-9]{64}$/;
const SAI_AUTHORITY_R1006='OPERATOR_SUPPLIED_PROJECTED_MODEL_OUTPUT_NOT_SERVER_VERIFIED';
export function verifySaiMissionBindingR1006(receipt,context){
 const ids=receipt?.schema===R889_SCHEMA?[receipt.originAgent]:receipt?.schema===R890_SCHEMA?receipt.members:null;
 if(!Array.isArray(ids)||ids.length<1||ids.length>12||!ids.every(id=>index(id,AGENTS))||
    !context||context.schema!=='OMEGA_SAI_CLOUD_CONTEXT_R1005'||context.authority!==SAI_AUTHORITY_R1006||
    context.canonicalMutation!==false||!SHA_R1006.test(context.fieldSha256||'')||
    !Number.isFinite(context.weight)||context.weight<0||context.weight>1||
    !Number.isSafeInteger(context.steps)||context.steps<0||context.steps>32||
    !Array.isArray(context.rows)||context.rows.length!==ids.length)throw new Error('Untrusted SAI mission binding');
 const rows=context.rows.map((row,i)=>{
  if(!row||row.agent!==ids[i]||row.outer!==ids[i]%SIZE||!Number.isFinite(row.prediction)||
     !SHA_R1006.test(row.sourceSha256||'')||!SHA_R1006.test(row.modelSha256||''))
    throw new Error('Untrusted SAI mission member binding');
  return Object.freeze({agent:row.agent,outer:row.outer,prediction:row.prediction,sourceSha256:row.sourceSha256,modelSha256:row.modelSha256});
 });
 return Object.freeze({schema:'OMEGA_SAI_CLOUD_CONTEXT_R1005',fieldSha256:context.fieldSha256,
  weight:context.weight,steps:context.steps,rows:Object.freeze(rows),authority:SAI_AUTHORITY_R1006,canonicalMutation:false});
}
export function bindSaiMissionR1006(receipt,context){
 if(context===undefined)return receipt;
 return Object.freeze({...receipt,saiContext:verifySaiMissionBindingR1006(receipt,context)});
}
export function exportSaiMissionCsvR1006(receipt){
 if(!receipt?.saiContext||!ID.test(receipt.missionId||''))throw new Error('No bounded SAI submission evidence');
 const context=verifySaiMissionBindingR1006(receipt,receipt.saiContext);
 return ['mission_id,agent,outer,prediction,field_sha256,source_sha256,model_sha256,weight,steps,authority',
  ...context.rows.map(row=>[receipt.missionId,row.agent,row.outer,row.prediction,context.fieldSha256,
   row.sourceSha256,row.modelSha256,context.weight,context.steps,context.authority].join(','))].join('\n')+'\n';
}
// R1007: preserve bounded returned status fields, never promote them to evidence.
function returnedFieldsR1007(x,collective){
 const out={};
 for(const key of ['completed','failed']){
  if(Object.prototype.hasOwnProperty.call(x,key)){
   if(!Number.isSafeInteger(x[key])||x[key]<0)throw new Error('Untrusted returned work count');
   out[key]=x[key];
  }
 }
 const key=collective?'summary':'reportedSynthesis';
 if(Object.prototype.hasOwnProperty.call(x,key)){
  if(typeof x[key]!=='string'||x[key].length>1200)throw new Error('Untrusted returned synthesis');
  out[key]=x[key];
 }
 return out;
}
export function exportMissionReturnR1007(receipt){
 const collective=receipt?.schema===R890_SCHEMA;
 const clean=collective?collectiveReceipt(receipt):singleReceipt(receipt);
 if(!clean||(!Object.prototype.hasOwnProperty.call(clean,'completed')&&!Object.prototype.hasOwnProperty.call(clean,'failed')&&!Object.prototype.hasOwnProperty.call(clean,collective?'summary':'reportedSynthesis')))throw new Error('No returned mission data');
 return JSON.stringify({schema:'OMEGA_MISSION_RETURN_R1007',authority:'REPORTED_CLOUD_OUTPUT_NOT_INDEPENDENTLY_VERIFIED',canonicalMutation:false,receipt:clean},null,2);
}
function singleReceipt(x){
 if(x===null)return null;
 if(!x||x.schema!==R889_SCHEMA||!ID.test(x.missionId||'')||!index(x.originAgent,AGENTS)||!index(x.originShell,12)||!index(x.originOuter,SIZE)||!index(x.originInner,SIZE)||x.originAgent!==x.originShell*SIZE+x.originOuter||x.localStateMutated!==false||x.truthClass!=='CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED')throw new Error('Untrusted individual mission receipt');
 return{schema:R889_SCHEMA,originAgent:x.originAgent,originShell:x.originShell,originOuter:x.originOuter,originInner:x.originInner,missionId:x.missionId,status:statusOf(x.status),truthClass:'CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED',externalProof:'NOT_ESTABLISHED_BY_JOURNAL',localStateMutated:false,...returnedFieldsR1007(x,false),...(x.cellReturns===undefined?{}:{cellReturns:validateCellReturnsR1008(x.cellReturns,x.missionId,1)}),...(Object.prototype.hasOwnProperty.call(x,'saiContext')?{saiContext:verifySaiMissionBindingR1006(x,x.saiContext)}:{})};
}
function collectiveReceipt(x){
 if(x===null)return null;
 if(!x||x.schema!==R890_SCHEMA||!ID.test(x.missionId||'')||!index(x.rootAgent,AGENTS)||!index(x.inner,SIZE)||!Array.isArray(x.members)||x.members.length<1||x.members.length>12||x.members[0]!==x.rootAgent||new Set(x.members).size!==x.members.length||!x.members.every(n=>index(n,AGENTS))||x.localMutation!==false||x.authority!=='SWARM_RESULT_NOT_CANON_ADMITTED')throw new Error('Untrusted collective mission receipt');
 return{schema:R890_SCHEMA,rootAgent:x.rootAgent,inner:x.inner,members:[...x.members],missionId:x.missionId,status:statusOf(x.status),authority:'SWARM_RESULT_NOT_CANON_ADMITTED',localMutation:false,returnedProof:'NOT_ESTABLISHED_BY_JOURNAL',...returnedFieldsR1007(x,true),...(x.cellReturns===undefined?{}:{cellReturns:validateCellReturnsR1008(x.cellReturns,x.missionId,x.members.length)}),...(Object.prototype.hasOwnProperty.call(x,'saiContext')?{saiContext:verifySaiMissionBindingR1006(x,x.saiContext)}:{})};
}
export function serializeMissionJournalR894(single,collective){
 const journal={schema:R894_SCHEMA,single:singleReceipt(single),collective:collectiveReceipt(collective)};
 const serialized=JSON.stringify(journal);
 if(serialized.length>MAX_JOURNAL)throw new Error('Invalid or oversized mission journal');
 return serialized;
}
export function restoreMissionJournalR894(serialized){
 if(serialized===null||serialized===undefined)return Object.freeze({single:null,collective:null});
 if(typeof serialized!=='string'||serialized.length>MAX_JOURNAL)throw new Error('Invalid or oversized mission journal');
 let v;try{v=JSON.parse(serialized)}catch{throw new Error('Malformed mission journal JSON')}
 if(!v||v.schema!==R894_SCHEMA||!Object.prototype.hasOwnProperty.call(v,'single')||!Object.prototype.hasOwnProperty.call(v,'collective'))throw new Error('Invalid mission journal schema');
 return Object.freeze({single:singleReceipt(v.single),collective:collectiveReceipt(v.collective)});
}
export function shouldWatchMissionR894(receipt){
 if(!receipt)return false;
 return ['QUEUED','RUNNING','RECEIVED'].includes(receipt.status);
}
