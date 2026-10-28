import {traceSourceInstrumentR533} from './sourceInstrumentR533';
import type {R529Executor} from './developmentalExecutionFabricR529';

/** Portable read-only model replay. A snapshot is not an authenticated historical,
 * production, device, empirical, or canonical-state receipt. Import always
 * recomputes from the current corpus; stored results cannot authorize actions. */
export const R628_TRACE_SNAPSHOT_SCHEMA='OMEGA7_REPLAY_VERIFIED_SOURCE_TRACE_R628' as const;
export const R628_TRACE_TRUTH='LOCAL_SOURCE_MODEL_RECOMPUTATION_ONLY' as const;
type SourceTrace=ReturnType<typeof traceSourceInstrumentR533>;
const validExecutor=(x:unknown):x is Extract<R529Executor,'TRAVERSAL'|'FORECAST'>=>x==='TRAVERSAL'||x==='FORECAST';
const isObject=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);

export function exportSourceTraceSnapshotR628(trace:SourceTrace):string{
 if(trace.status!=='SOURCE_MODEL_EXECUTED'||!validExecutor(trace.executor))
  throw new Error('R628_EXECUTED_SOURCE_TRACE_REQUIRED');
 const replay=traceSourceInstrumentR533(trace.executor,trace.startAddress,trace.requestedSteps);
 if(replay.status!=='SOURCE_MODEL_EXECUTED'||JSON.stringify(trace)!==JSON.stringify(replay))
  throw new Error('R628_SOURCE_REPLAY_MISMATCH');
 return JSON.stringify({
  schema:R628_TRACE_SNAPSHOT_SCHEMA,version:1,truth:R628_TRACE_TRUTH,
  trace:replay
 },null,2);
}

export function importSourceTraceSnapshotR628(text:string):SourceTrace{
 if(typeof text!=='string'||text.length>32768)throw new Error('R628_SNAPSHOT_SIZE_REFUSED');
 let value:unknown;
 try{value=JSON.parse(text)}catch{throw new Error('R628_SNAPSHOT_JSON_INVALID')}
 if(!isObject(value)||value.schema!==R628_TRACE_SNAPSHOT_SCHEMA||value.version!==1||value.truth!==R628_TRACE_TRUTH||
    Object.keys(value).sort().join(',')!=='schema,trace,truth,version'||!isObject(value.trace))
  throw new Error('R628_SNAPSHOT_SHAPE_REFUSED');
 const trace=value.trace;
 if(!validExecutor(trace.executor)||typeof trace.startAddress!=='number'||!Number.isSafeInteger(trace.startAddress)||
    typeof trace.requestedSteps!=='number'||!Number.isSafeInteger(trace.requestedSteps))
  throw new Error('R628_SNAPSHOT_INPUT_REFUSED');
 const replay=traceSourceInstrumentR533(trace.executor,trace.startAddress,trace.requestedSteps);
 if(replay.status!=='SOURCE_MODEL_EXECUTED'||JSON.stringify(trace)!==JSON.stringify(replay))
  throw new Error('R628_SOURCE_REPLAY_MISMATCH');
 return replay;
}
