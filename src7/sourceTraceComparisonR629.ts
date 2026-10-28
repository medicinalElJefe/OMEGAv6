import {traceSourceInstrumentR533} from './sourceInstrumentR533';

export const R629_COMPARISON_SCHEMA='OMEGA7_RECOMPUTED_SOURCE_FORK_COMPARISON_R629' as const;
export const R629_COMPARISON_TRUTH='LOCAL_ADDRESS_MODEL_ONLY_NOT_OBSERVED_TIME' as const;
type Trace=ReturnType<typeof traceSourceInstrumentR533>;
const bounded=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<20736;
const delta=(left:number|null,right:number|null)=>left===null||right===null?null:right-left;

/** Compare two independently executed, bounded corpus successor traces.
 * The input trace must itself replay exactly. No imported result, UI state,
 * forecast label, or comparison may grant CanonState or deployment authority. */
export function compareSourceTracesR629(baseline:Trace,comparisonAddress:number){
 if(baseline.status!=='SOURCE_MODEL_EXECUTED'||(baseline.executor!=='TRAVERSAL'&&baseline.executor!=='FORECAST'))
  throw new Error('R629_EXECUTED_TRAVERSAL_OR_FORECAST_REQUIRED');
 if(!bounded(comparisonAddress))throw new Error('R629_COMPARISON_ADDRESS_REFUSED');
 const left=traceSourceInstrumentR533(baseline.executor,baseline.startAddress,baseline.requestedSteps);
 if(left.status!=='SOURCE_MODEL_EXECUTED'||JSON.stringify(left)!==JSON.stringify(baseline))
  throw new Error('R629_BASELINE_REPLAY_MISMATCH');
 const right=traceSourceInstrumentR533(baseline.executor,comparisonAddress,baseline.requestedSteps);
 if(right.status!=='SOURCE_MODEL_EXECUTED')throw new Error('R629_COMPARISON_TRACE_HELD');
 const length=Math.max(left.frames.length,right.frames.length);
 const rows=Array.from({length},(_,index)=>{
  const a=left.frames[index]??null,b=right.frames[index]??null;
  const same=!!a&&!!b&&a.address===b.address&&a.nextAddress===b.nextAddress&&a.decision===b.decision;
  return{
   index,leftAddress:a?.address??null,rightAddress:b?.address??null,
   leftNextAddress:a?.nextAddress??null,rightNextAddress:b?.nextAddress??null,
   leftDecision:a?.decision??null,rightDecision:b?.decision??null,
   sameSourceTransition:same,
   continuityDelta:delta(a?.continuity??null,b?.continuity??null),
   plasticityDelta:delta(a?.plasticity??null,b?.plasticity??null),
   scarDelta:delta(a?.scar??null,b?.scar??null),
   contradictionDelta:delta(a?.contradiction??null,b?.contradiction??null),
   continuityVelocityDelta:delta(a?.developmental.continuityVelocity??null,b?.developmental.continuityVelocity??null),
   continuityAccelerationDelta:delta(a?.developmental.continuityAcceleration??null,b?.developmental.continuityAcceleration??null),
   scarVelocityDelta:delta(a?.developmental.scarVelocity??null,b?.developmental.scarVelocity??null)
  };
 });
 const firstDivergence=rows.findIndex(row=>!row.sameSourceTransition);
 const commonPrefix=firstDivergence===-1?rows.length:firstDivergence;
 return{
  schema:R629_COMPARISON_SCHEMA,version:1,truth:R629_COMPARISON_TRUTH,
  status:'SOURCE_MODEL_EXECUTED' as const,executor:baseline.executor,
  startAddress:baseline.startAddress,comparisonAddress,requestedSteps:baseline.requestedSteps,
  left,right,rows,commonPrefix,firstDivergenceIndex:firstDivergence===-1?null:firstDivergence,
  identical:firstDivergence===-1&&left.termination===right.termination,
  leftTermination:left.termination,rightTermination:right.termination,
  canonicalMutation:false as const,productionAdmissionClaimed:false as const,
  historicalParityClaimed:false as const,physicalTimeClaimed:false as const
 };
}
export type SourceComparisonR629=ReturnType<typeof compareSourceTracesR629>;

export function exportSourceComparisonR629(comparison:SourceComparisonR629):string{
 const replay=traceSourceInstrumentR533(comparison.executor,comparison.startAddress,comparison.requestedSteps);
 const verified=compareSourceTracesR629(replay,comparison.comparisonAddress);
 if(JSON.stringify(verified)!==JSON.stringify(comparison))throw new Error('R629_COMPARISON_REPLAY_MISMATCH');
 return JSON.stringify(verified,null,2);
}
export function importSourceComparisonR629(text:string):SourceComparisonR629{
 if(typeof text!=='string'||text.length>65536)throw new Error('R629_SNAPSHOT_SIZE_REFUSED');
 let value:unknown;
 try{value=JSON.parse(text)}catch{throw new Error('R629_SNAPSHOT_JSON_INVALID')}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('R629_SNAPSHOT_SHAPE_REFUSED');
 const raw=value as Record<string,unknown>;
 if(raw.schema!==R629_COMPARISON_SCHEMA||raw.version!==1||raw.truth!==R629_COMPARISON_TRUTH||
  (raw.executor!=='TRAVERSAL'&&raw.executor!=='FORECAST')||!bounded(raw.startAddress)||!bounded(raw.comparisonAddress)||
  typeof raw.requestedSteps!=='number'||!Number.isSafeInteger(raw.requestedSteps)||raw.requestedSteps<1||raw.requestedSteps>12)
  throw new Error('R629_SNAPSHOT_SHAPE_REFUSED');
 const baseline=traceSourceInstrumentR533(raw.executor,raw.startAddress as number,raw.requestedSteps);
 const verified=compareSourceTracesR629(baseline,raw.comparisonAddress as number);
 if(JSON.stringify(raw)!==JSON.stringify(verified))throw new Error('R629_COMPARISON_REPLAY_MISMATCH');
 return verified;
}
