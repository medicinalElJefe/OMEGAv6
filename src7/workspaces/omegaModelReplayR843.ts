import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {executeModelTaskR842,type OmegaTaskR842,type OmegaTaskRecordR842} from './omegaModelTaskRuntimeR842';
/** Portable, explicitly untrusted browser-local task replay. No host or Canon authority. */
export const R843_SESSION_SCHEMA='OMEGA_MODEL_REPLAY_R843' as const;
export type ReplayR843={schema:typeof R843_SESSION_SCHEMA;tasks:OmegaTaskR842[]};
export function encodeReplayR843(records:readonly OmegaTaskRecordR842[]):string{
 if(records.length>128)throw RangeError('Replay exceeds 128 tasks');
 const tasks=records.map(r=>r.request.kind==='EXPORT_MODEL_TRACE'?{kind:r.request.kind,route:[...r.request.route]}:{...r.request});
 return JSON.stringify({schema:R843_SESSION_SCHEMA,tasks});
}
export function decodeReplayR843(raw:string):ReplayR843{
 if(raw.length>25000)throw RangeError('Replay exceeds size limit');
 const data:unknown=JSON.parse(raw);
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid replay envelope');
 const o=data as Record<string,unknown>;
 if(o.schema!==R843_SESSION_SCHEMA||!Array.isArray(o.tasks)||o.tasks.length>128)throw Error('Invalid replay schema or task count');
 const tasks:OmegaTaskR842[]=o.tasks.map((value:unknown)=>{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid replay task');
  const t=value as Record<string,unknown>;
  if(t.kind==='INSPECT_MODEL_STATE'&&Number.isInteger(t.address)&&Number(t.address)>=0&&Number(t.address)<20736)return {kind:t.kind,address:Number(t.address)};
  if(t.kind==='TRACE_MODEL_SUCCESSORS'&&Number.isInteger(t.address)&&Number(t.address)>=0&&Number(t.address)<20736&&Number.isInteger(t.limit)&&Number(t.limit)>=1&&Number(t.limit)<=64)return {kind:t.kind,address:Number(t.address),limit:Number(t.limit)};
  if(t.kind==='EXPORT_MODEL_TRACE'&&Array.isArray(t.route)&&t.route.length>=1&&t.route.length<=64&&t.route.every(n=>Number.isInteger(n)&&n>=0&&n<20736))return {kind:t.kind,route:[...t.route]};
  throw Error('Invalid replay task payload');
 });
 return {schema:R843_SESSION_SCHEMA,tasks};
}
export function replayModelTasksR843(field:Mandala20736Field,raw:string){
 const {tasks}=decodeReplayR843(raw);
 const results=tasks.map(task=>executeModelTaskR842(field,task));
 return {schema:R843_SESSION_SCHEMA,results,taskCount:results.length,authority:'MODEL_DERIVED_RECOMPUTED' as const};
}
