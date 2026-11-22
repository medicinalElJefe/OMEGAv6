// R894: bounded browser-side receipt journal for existing durable R121 cloud missions.
// RESTORE never dispatches a mission, performs inference, or admits results into CanonState.
import {AGENTS,SIZE} from './sphereAgentFabricR887.mjs';
import {R889_SCHEMA} from './sphereSwarmBridgeR889.mjs';
import {R890_SCHEMA} from './sphereCollectiveR890.mjs';
export const R894_SCHEMA='OMEGA_SPHERE_MISSION_JOURNAL_R894';
export const R894_STORAGE_KEY='omega.r894.sphere.missions.v1';
const MAX_JOURNAL=8192,ID=/^[A-Za-z0-9_.:-]{1,128}$/;
const STATUS=new Set(['RECEIVED','QUEUED','RUNNING','COMPLETE','PAUSED','CANCELLED','FAILED','TIMED_OUT','NOT_REPORTED']);
function statusOf(x){if(typeof x!=='string'||!STATUS.has(x))throw new Error('Untrusted cloud mission status');return x}
const index=(x,max)=>Number.isSafeInteger(x)&&x>=0&&x<max;
function singleReceipt(x){
 if(x===null)return null;
 if(!x||x.schema!==R889_SCHEMA||!ID.test(x.missionId||'')||!index(x.originAgent,AGENTS)||!index(x.originShell,12)||!index(x.originOuter,SIZE)||!index(x.originInner,SIZE)||x.originAgent!==x.originShell*SIZE+x.originOuter||x.localStateMutated!==false||x.truthClass!=='CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED')throw new Error('Untrusted individual mission receipt');
 return{schema:R889_SCHEMA,originAgent:x.originAgent,originShell:x.originShell,originOuter:x.originOuter,originInner:x.originInner,missionId:x.missionId,status:statusOf(x.status),truthClass:'CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED',externalProof:'NOT_ESTABLISHED_BY_JOURNAL',localStateMutated:false};
}
function collectiveReceipt(x){
 if(x===null)return null;
 if(!x||x.schema!==R890_SCHEMA||!ID.test(x.missionId||'')||!index(x.rootAgent,AGENTS)||!index(x.inner,SIZE)||!Array.isArray(x.members)||x.members.length<1||x.members.length>12||x.members[0]!==x.rootAgent||new Set(x.members).size!==x.members.length||!x.members.every(n=>index(n,AGENTS))||x.localMutation!==false||x.authority!=='SWARM_RESULT_NOT_CANON_ADMITTED')throw new Error('Untrusted collective mission receipt');
 return{schema:R890_SCHEMA,rootAgent:x.rootAgent,inner:x.inner,members:[...x.members],missionId:x.missionId,status:statusOf(x.status),authority:'SWARM_RESULT_NOT_CANON_ADMITTED',localMutation:false,returnedProof:'NOT_ESTABLISHED_BY_JOURNAL'};
}
export function serializeMissionJournalR894(single,collective){
 const journal={schema:R894_SCHEMA,single:singleReceipt(single),collective:collectiveReceipt(collective)};
 return JSON.stringify(journal);
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
