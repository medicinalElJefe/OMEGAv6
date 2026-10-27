import {corpusState,decodeAddress,STATE_COUNT} from '../src/corpusRuntime';
import {fullSphereProjectionR525} from '../src/fullSphereRecoveryR525';
import type {R529Executor} from './developmentalExecutionFabricR529';
export const R533_SCHEMA='OMEGA7_READ_ONLY_SOURCE_INSTRUMENT_R533' as const;
export function inspectSourceInstrumentR533(executor:R529Executor,address:number){
 if(!Number.isInteger(address)||address<0||address>=STATE_COUNT)return Object.freeze({schema:R533_SCHEMA,status:'HELD' as const,reasons:['ADDRESS_OUT_OF_RANGE'],executionClaimed:false as const,canonicalMutation:false as const});
 if(executor==='SAI_HYBRID')return Object.freeze({schema:R533_SCHEMA,status:'EXTERNAL_HOST_PROOF_REQUIRED' as const,reasons:['AUTHENTICATED_HOST_RECEIPT_REQUIRED'],executionClaimed:false as const,canonicalMutation:false as const});
 const packet=corpusState(address),coordinate=decodeAddress(address);
 const evidence={address,coordinate,stateId:packet.stateId,decision:packet.metrics.decision,continuity:packet.metrics.continuity,plasticity:packet.metrics.plasticity,scar:packet.metrics.scar,contradiction:packet.metrics.contradiction};
 if(executor==='VISUALIZATION'){
  const projection=fullSphereProjectionR525({address,continuity:packet.metrics.continuity,plasticity:packet.metrics.plasticity,scar:packet.metrics.scar,contradiction:packet.metrics.contradiction,yaw:0,fold:0,lens:'CONTINUITY'});
  return Object.freeze({schema:R533_SCHEMA,status:'SOURCE_MODEL_EXECUTED' as const,executor,evidence,geometry:{shellCount:projection.shells.length,edgeCount:projection.shells.reduce((n,s)=>n+s.edges.length,0),antipodeIndex0:projection.antipodeIndex0},executionClaimed:true as const,canonicalMutation:false as const,truthBoundary:'READ_ONLY_SOURCE_GEOMETRY_NOT_DEPLOYMENT_OR_EMPIRICAL_PROOF'});
 }
 if(executor==='TRAVERSAL')return Object.freeze({schema:R533_SCHEMA,status:'SOURCE_MODEL_EXECUTED' as const,executor,evidence,nextAddress:Number(packet.autoPing.dataNext),executionClaimed:true as const,canonicalMutation:false as const,truthBoundary:'READ_ONLY_ADDRESS_TOPOLOGY_NOT_PHYSICAL_TRAVEL'});
 return Object.freeze({schema:R533_SCHEMA,status:'SOURCE_MODEL_EXECUTED' as const,executor:'FORECAST' as const,evidence,modelNextAddress:Number(packet.autoPing.dataNext),executionClaimed:true as const,canonicalMutation:false as const,truthBoundary:'READ_ONLY_MODEL_SUCCESSOR_NOT_EMPIRICAL_FUTURE'});
}


/** R627: bounded, read-only model successor traversal. These are corpus address
 * transitions, not observations of historical time, a physical trajectory,
 * an external forecast, or an authenticated host execution. */
export function traceSourceInstrumentR533(executor:R529Executor,address:number,steps:number){
 const base={schema:'OMEGA7_BOUNDED_SOURCE_TRACE_R627' as const,executor,startAddress:address,requestedSteps:steps,canonicalMutation:false as const,productionAdmissionClaimed:false as const,historicalCapabilityRestored:false as const,truthBoundary:'READ_ONLY_CORPUS_ADDRESS_SEQUENCE_NOT_PHYSICAL_TRAVEL_OR_EMPIRICAL_FORECAST'};
 const held=(reason:string)=>Object.freeze({...base,status:'HELD' as const,reasons:Object.freeze([reason]),frames:Object.freeze([]),executionClaimed:false as const});
 if(!Number.isInteger(steps)||steps<1||steps>12)return held('STEPS_MUST_BE_INTEGER_1_TO_12');
 if(executor!=='TRAVERSAL'&&executor!=='FORECAST')return held('ONLY_TRAVERSAL_OR_FORECAST_SOURCE_MODELS');
 if(!Number.isSafeInteger(address)||address<0||address>=STATE_COUNT)return held('ADDRESS_OUT_OF_RANGE');
 const frames:{index:number;address:number;stateId:number;decision:string;continuity:number;scar:number;contradiction:number;nextAddress:number}[]=[];
 const seen=new Set<number>();
 let cursor=address,termination='STEP_LIMIT_REACHED';
 for(let i=0;i<steps;i++){
  if(seen.has(cursor)){termination='CYCLE_DETECTED';break}
  seen.add(cursor);
  const result=inspectSourceInstrumentR533(executor,cursor);
  if(result.status!=='SOURCE_MODEL_EXECUTED')return held('SOURCE_MODEL_NOT_EXECUTABLE');
  const next='nextAddress' in result?result.nextAddress:'modelNextAddress' in result?result.modelNextAddress:NaN;
  if(!Number.isSafeInteger(next)||next<0||next>=STATE_COUNT)return held('INVALID_SOURCE_SUCCESSOR');
  frames.push(Object.freeze({index:i,address:cursor,stateId:result.evidence.stateId,decision:result.evidence.decision,continuity:result.evidence.continuity,scar:result.evidence.scar,contradiction:result.evidence.contradiction,nextAddress:next}));
  if(seen.has(next)){termination='CYCLE_DETECTED';break}
  cursor=next;
 }
 return Object.freeze({...base,status:'SOURCE_MODEL_EXECUTED' as const,reasons:Object.freeze([]),frames:Object.freeze(frames),termination,executionClaimed:true as const});
}
