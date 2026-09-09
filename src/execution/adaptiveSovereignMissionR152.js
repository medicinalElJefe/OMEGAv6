import {
 advanceSovereignMissionR153,
 hydrateSovereignMissionsR153,
 manifestR153,
 resumeSovereignMissionR153,
 tagSovereignMissionR153,
 R153_MISSION_SCHEMA,
 R153_REVISION,
 R153_SOURCE_SCHEMA
} from './adaptiveSovereignMissionR153.js';

// Compatibility/source-law markers retained for the established R153 invariant suite:
// advanceSovereignMissionR153 as advanceSovereignMissionR152
// R153_REVISION as R152_REVISION
// from './adaptiveSovereignMissionR153.js'

export const advanceSovereignMissionR152=advanceSovereignMissionR153;
export const hydrateSovereignMissionsR152=hydrateSovereignMissionsR153;
export const manifestR152=manifestR153;
export const resumeSovereignMissionR152=resumeSovereignMissionR153;
export const R152_MISSION_SCHEMA=R153_MISSION_SCHEMA;
export const R152_REVISION=R153_REVISION;
export const R152_SOURCE_SCHEMA=R153_SOURCE_SCHEMA;

async function sha256R242(value){
 const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value));
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

async function boundInitialDiscoveryR242(runtime,mission){
 if(mission?.stage!=='DISCOVERY'||mission?.projectPath!=='.'||!mission?.currentJobId)return mission;
 let jobs=await runtime.get('jobs',[]),job=jobs.find(j=>j?.id===mission.currentJobId);
 if(!job||String(job.status||'').toUpperCase()!=='QUEUED'||job.projectPath!=='.'||!Array.isArray(job.steps))return mission;
 const mutation=job.steps.some(s=>['APPLY_PATCH','WRITE_TEXT'].includes(String(s?.op||'').toUpperCase()));
 const index=job.steps.find(s=>String(s?.op||'').toUpperCase()==='INDEX');
 const rootHash=job.steps.some(s=>String(s?.op||'').toUpperCase()==='HASH_TREE');
 if(mutation||!index||!rootHash)return mission;
 const step={...index,id:'S01',path:'.',maxResults:4000,discoveryOnly:true,label:'R242 bounded project discovery before any project tree hash'};
 const rewritten={...job,steps:[step],r242InitialDiscoveryBounded:true,r242RemovedRootHash:true};
 rewritten.inputFingerprint=await sha256R242({steps:rewritten.steps,targetDeviceId:rewritten.targetDeviceId,projectPath:rewritten.projectPath||'.'});
 jobs=jobs.map(j=>j.id===rewritten.id?rewritten:j);await runtime.put('jobs',jobs);
 const next={...mission,currentJob:rewritten,executionMotionRevision:'R242',initialDiscoveryPolicy:'INDEX_PROJECT_FIRST_HASH_SELECTED_PROJECT_AFTER_DISCOVERY',updatedAt:Date.now()};
 let missions=await runtime.get('missions',[]);missions=missions.map(m=>m.id===next.id?next:m);await runtime.put('missions',missions);
 await runtime.event('R242_INITIAL_DISCOVERY_BOUNDED',`Mission ${next.id} will discover the project before hashing its tree.`,{missionId:next.id,jobId:rewritten.id,targetDeviceId:rewritten.targetDeviceId,removedRootHash:true});
 return next;
}

export async function tagSovereignMissionR152(runtime,requestBody,mission){
 const tagged=await tagSovereignMissionR153(runtime,requestBody,mission);
 return boundInitialDiscoveryR242(runtime,tagged);
}
