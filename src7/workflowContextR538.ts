/** One user-controlled context spanning Atlas, traversal, forecast and recovered instruments.
 * Local persistence is user-workspace continuity, never canonical authority. */
export const OMEGA_WORKFLOW_R538='OMEGA_USER_WORKFLOW_CONTEXT_R538';
export type WorkflowEntryR538={id:string;address:number;source:string;note:string;createdAt:string};
export type WorkflowR538={version:1;address:number;history:WorkflowEntryR538[];bookmarks:WorkflowEntryR538[]};
export const initialWorkflowR538:WorkflowR538={version:1,address:11498,history:[],bookmarks:[]};
const bounded=(n:number)=>Number.isInteger(n)&&n>=0&&n<20736;
export function normalizeWorkflowR538(value:unknown):WorkflowR538{
 const v=value&&typeof value==='object'?value as Partial<WorkflowR538>:{};
 const rows=(x:unknown):WorkflowEntryR538[]=>Array.isArray(x)?x.filter((e):e is WorkflowEntryR538=>!!e&&typeof e==='object'&&bounded(e.address)&&typeof e.id==='string'&&typeof e.source==='string'&&typeof e.note==='string'&&typeof e.createdAt==='string').slice(0,48):[];
 return{version:1,address:bounded(v.address as number)?v.address!:11498,history:rows(v.history),bookmarks:rows(v.bookmarks)};
}
export function transitionWorkflowR538(state:WorkflowR538,action:{type:'NAVIGATE'|'BOOKMARK'|'RESTORE';address:number;source:string;note?:string;at:string}):WorkflowR538{
 if(!bounded(action.address))throw new Error('R538_ADDRESS_OUT_OF_RANGE');
 const item:WorkflowEntryR538={id:`${action.at}:${action.address}:${action.source}`,address:action.address,source:action.source.slice(0,80),note:(action.note||'').slice(0,240),createdAt:action.at};
 if(action.type==='BOOKMARK')return{...state,bookmarks:[item,...state.bookmarks.filter(x=>x.address!==action.address)].slice(0,48)};
 if(state.address===action.address)return state;
 return{...state,address:action.address,history:[item,...state.history.filter(x=>x.address!==action.address)].slice(0,48)};
}
