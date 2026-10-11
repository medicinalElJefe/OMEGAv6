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
