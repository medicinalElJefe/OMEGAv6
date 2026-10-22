import {corpusState,STATE_COUNT} from '../src/corpusRuntime';

export const R535_SCHEMA='OMEGA7_SOURCE_CONTINUITY_TRANSITION_R535' as const;
export function verifySourceContinuityTransitionR535(address:number,claimedNext?:number){
 if(!Number.isInteger(address)||address<0||address>=STATE_COUNT)
  return Object.freeze({schema:R535_SCHEMA,status:'HELD' as const,reasons:['ADDRESS_OUT_OF_RANGE'],canonicalMutation:false as const});
 const from=corpusState(address);
 const next=Number(from.autoPing.dataNext);
 if(!Number.isInteger(next)||next<0||next>=STATE_COUNT)
  return Object.freeze({schema:R535_SCHEMA,status:'HELD' as const,reasons:['INVALID_SOURCE_SUCCESSOR'],address,canonicalMutation:false as const});
 if(claimedNext!==undefined&&claimedNext!==next)
  return Object.freeze({schema:R535_SCHEMA,status:'HELD' as const,reasons:['CLAIMED_SUCCESSOR_MISMATCH'],address,claimedNext,sourceNext:next,canonicalMutation:false as const});
 const to=corpusState(next);
 const sourceMetrics=from.metrics,successorMetrics=to.metrics;
 const finite=[sourceMetrics.continuity,sourceMetrics.scar,sourceMetrics.contradiction,successorMetrics.continuity,successorMetrics.scar,successorMetrics.contradiction].every(Number.isFinite);
 if(!finite)return Object.freeze({schema:R535_SCHEMA,status:'HELD' as const,reasons:['NONFINITE_METRICS'],address,nextAddress:next,canonicalMutation:false as const});
 return Object.freeze({
  schema:R535_SCHEMA,status:'SOURCE_TRANSITION_VERIFIED' as const,
  address,nextAddress:next,fromStateId:from.stateId,toStateId:to.stateId,
  from:{continuity:sourceMetrics.continuity,scar:sourceMetrics.scar,contradiction:sourceMetrics.contradiction,decision:sourceMetrics.decision},
  to:{continuity:successorMetrics.continuity,scar:successorMetrics.scar,contradiction:successorMetrics.contradiction,decision:successorMetrics.decision},
  deltaContinuity:successorMetrics.continuity-sourceMetrics.continuity,
  deltaContradiction:successorMetrics.contradiction-sourceMetrics.contradiction,
  scarPreservedAsEvidence:true as const,
  executionClaimed:false as const,canonicalMutation:false as const,
  truthBoundary:'SOURCE_SUCCESSOR_AND_METRIC_DIFFERENCE_ONLY_NOT_CANONICAL_ADMISSION_OR_RUNTIME_EXECUTION'
 });
}
