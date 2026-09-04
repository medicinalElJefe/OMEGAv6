import type {OmegaOperationR86} from './omegaOperationBusR86';
import type {WorkflowSessionR85} from './omegaWorkflowRuntimeR85';
import {api,getHybridBridge} from './platformAdapter';

export type ProjectOperationRefR87={id:string;at:number;type:string;sha256:string;stateId?:number;address?:number;status:string};
export type ProjectWorkflowRefR87={id:string;intent:string;goal:string;startedAt:number;updatedAt:number;status:string};
export type ContinuityProjectR87={
 id:string;
 name:string;
 created:number;
 updated:number;
 address:number;
 stateId:number;
 status:'ACTIVE_LOCAL'|'ARCHIVED_LOCAL';
 note:string;
 memoryRefs:string[];
 evidenceRefs:string[];
 sha256:string;
 workflowRefs?:ProjectWorkflowRefR87[];
 operationRefs?:ProjectOperationRefR87[];
 continuityHash?:string;
 lastIntent?:string;
 lastWorkflowStatus?:string;
 authority?:string;
};

const PROJECT_KEY='omega.v6.projects.r29';
const ACTIVE_KEY='omega.r87.activeProject';
const DURABLE_META_KEY='omega.r97.continuity.savedAt';
const enc=new TextEncoder();
let syncTimer=0,syncing:Promise<any>|null=null,applyingRemote=false;

async function sha(v:any){const d=await crypto.subtle.digest('SHA-256',enc.encode(JSON.stringify(v)));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function loadRaw():ContinuityProjectR87[]{try{const x=JSON.parse(localStorage.getItem(PROJECT_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function markLocalChange(){try{localStorage.setItem(DURABLE_META_KEY,String(Date.now()))}catch{}if(applyingRemote||typeof window==='undefined')return;window.clearTimeout(syncTimer);syncTimer=window.setTimeout(()=>void syncProjectContinuityR97(),600)}
function saveRaw(rows:ContinuityProjectR87[]){try{localStorage.setItem(PROJECT_KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('omega-r87-projects-changed',{detail:rows}));markLocalChange()}catch{}return rows}
function projectCore(p:ContinuityProjectR87){return{id:p.id,name:p.name,created:p.created,updated:p.updated,address:p.address,stateId:p.stateId,status:p.status,note:p.note,memoryRefs:p.memoryRefs,evidenceRefs:p.evidenceRefs,workflowRefs:p.workflowRefs||[],operationRefs:p.operationRefs||[],lastIntent:p.lastIntent||null,lastWorkflowStatus:p.lastWorkflowStatus||null,authority:p.authority||'BROWSER_LOCAL_PROJECT_CONTINUITY_R87'}}

export function readProjectsR87(){return loadRaw()}
export function activeProjectIdR87(){try{return localStorage.getItem(ACTIVE_KEY)||''}catch{return''}}
export function setActiveProjectR87(id:string){try{if(id)localStorage.setItem(ACTIVE_KEY,id);else localStorage.removeItem(ACTIVE_KEY);window.dispatchEvent(new CustomEvent('omega-r87-active-project',{detail:id}));markLocalChange()}catch{}return id}
export function getProjectR87(id:string|undefined|null){return id?loadRaw().find(x=>x.id===id)||null:null}

export function syncProjectContinuityR97(){
 if(syncing)return syncing;
 syncing=(async()=>{if(!getHybridBridge())return{ok:false,state:'PAIRING_REQUIRED'};const localSavedAt=Number(localStorage.getItem(DURABLE_META_KEY)||0),remote=await api.get<any>('/api/federation/continuity'),snapshot=remote.data?.snapshot;if(snapshot&&Number(snapshot.savedAt)>localSavedAt){applyingRemote=true;try{localStorage.setItem(PROJECT_KEY,JSON.stringify(snapshot.projects||[]));if(snapshot.activeProjectId)localStorage.setItem(ACTIVE_KEY,snapshot.activeProjectId);else localStorage.removeItem(ACTIVE_KEY);localStorage.setItem(DURABLE_META_KEY,String(snapshot.savedAt));window.dispatchEvent(new CustomEvent('omega-r87-projects-changed',{detail:snapshot.projects||[]}));window.dispatchEvent(new CustomEvent('omega-r87-active-project',{detail:snapshot.activeProjectId||''}))}finally{applyingRemote=false}return{ok:true,state:'RESTORED',snapshot}}const saved=await api.put<any>('/api/federation/continuity',{projects:loadRaw(),activeProjectId:activeProjectIdR87(),sourceSavedAt:localSavedAt});if(saved.data?.snapshot?.savedAt)localStorage.setItem(DURABLE_META_KEY,String(saved.data.snapshot.savedAt));window.dispatchEvent(new CustomEvent('omega-r97-continuity-synced',{detail:saved.data?.snapshot||null}));return{ok:true,state:'SAVED',snapshot:saved.data?.snapshot||null}})().catch(error=>({ok:false,state:'LOCAL_CACHE_ONLY',error:error instanceof Error?error.message:String(error)})).finally(()=>{syncing=null});return syncing;
}

export async function createProjectR87(goal:string,intent:string,record:any){
 const now=Date.now(),memory=(()=>{try{return JSON.parse(localStorage.getItem('omega.v6.memory.r28')||'[]')}catch{return[]}})();
 const name=(goal.trim()||`${intent} workflow · STATE ${record?.stateId||1}`).slice(0,72);
 const core={name,created:now,updated:now,address:Number(record?.address)||0,stateId:Number(record?.stateId)||1,status:'ACTIVE_LOCAL' as const,note:`R87 project continuity · ${intent}`,memoryRefs:(Array.isArray(memory)?memory:[]).filter((x:any)=>x.stateId===record?.stateId).map((x:any)=>x.id).slice(-24),evidenceRefs:[],workflowRefs:[],operationRefs:[],lastIntent:intent,lastWorkflowStatus:'CREATED',authority:'BROWSER_LOCAL_PROJECT_CONTINUITY_R87'};
 const id=typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`project-${now}`,creationSha=await sha(core);
 const row:ContinuityProjectR87={id,...core,sha256:creationSha,continuityHash:creationSha};
 saveRaw([...loadRaw(),row]);setActiveProjectR87(id);return row;
}

export async function attachWorkflowToProjectR87(projectId:string,workflow:WorkflowSessionR85){
 const rows=loadRaw(),i=rows.findIndex(x=>x.id===projectId);if(i<0)return null;
 const p={...rows[i]},refs=[...(p.workflowRefs||[])].filter(x=>x.id!==workflow.id);
 refs.push({id:workflow.id,intent:workflow.intent,goal:workflow.goal,startedAt:workflow.createdAt,updatedAt:workflow.updatedAt,status:workflow.status});
 p.workflowRefs=refs.slice(-80);p.updated=Date.now();p.address=workflow.startAddress;p.stateId=workflow.startStateId;p.lastIntent=workflow.intent;p.lastWorkflowStatus=workflow.status;
 p.continuityHash=await sha(projectCore(p));rows[i]=p;saveRaw(rows);setActiveProjectR87(projectId);return p;
}

export async function recordProjectOperationR87(projectId:string|undefined,event:OmegaOperationR86){
 if(!projectId)return null;const rows=loadRaw(),i=rows.findIndex(x=>x.id===projectId);if(i<0)return null;
 const p={...rows[i]},ops=[...(p.operationRefs||[])];
 if(!ops.some(x=>x.id===event.id))ops.push({id:event.id,at:event.at,type:event.type,sha256:event.sha256,stateId:event.stateId,address:event.nextAddress??event.address,status:event.status});
 p.operationRefs=ops.slice(-188);p.updated=Date.now();
 if(Number.isFinite(event.nextAddress??event.address))p.address=Number(event.nextAddress??event.address);
 if(Number.isFinite(event.stateId))p.stateId=Number(event.stateId);
 p.continuityHash=await sha(projectCore(p));rows[i]=p;saveRaw(rows);return p;
}

export async function updateProjectWorkflowR87(projectId:string|undefined,workflow:WorkflowSessionR85,status=workflow.status){
 if(!projectId)return null;const rows=loadRaw(),i=rows.findIndex(x=>x.id===projectId);if(i<0)return null;
 const p={...rows[i]},refs=[...(p.workflowRefs||[])],idx=refs.findIndex(x=>x.id===workflow.id),ref={id:workflow.id,intent:workflow.intent,goal:workflow.goal,startedAt:workflow.createdAt,updatedAt:Date.now(),status};
 if(idx>=0)refs[idx]=ref;else refs.push(ref);
 p.workflowRefs=refs.slice(-80);p.updated=Date.now();p.lastIntent=workflow.intent;p.lastWorkflowStatus=status;
 const finalAddress=[...workflow.steps].reverse().find(x=>Number.isFinite(x.afterAddress))?.afterAddress;
 if(Number.isFinite(finalAddress))p.address=Number(finalAddress);
 p.continuityHash=await sha(projectCore(p));rows[i]=p;saveRaw(rows);return p;
}

export function projectContinuitySummaryR87(project:ContinuityProjectR87|null){
 if(!project)return null;
 return{id:project.id,name:project.name,stateId:project.stateId,address:project.address,workflows:project.workflowRefs?.length||0,operations:project.operationRefs?.length||0,lastIntent:project.lastIntent||'—',lastWorkflowStatus:project.lastWorkflowStatus||'—',continuityHash:project.continuityHash||project.sha256,boundary:'Project continuity is browser-local organization while unpaired. With an authenticated Hybrid bridge it is durably synchronized and browser storage becomes a recoverable offline cache. It is not a GitHub repository, Drive folder, or native filesystem project.'};
}
