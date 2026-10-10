import {corpusState,decodeAddress,STATE_COUNT} from '../src/corpusRuntime';
import {fullSphereProjectionR525} from '../src/fullSphereRecoveryR525';
import {evaluateExecutionProposalR529,type R529Proposal} from './developmentalExecutionFabricR529';

export const R530_SCHEMA='OMEGA7_SOURCE_BOUND_EXECUTION_RECEIPT_R530' as const;
export type R530Request={proposal:R529Proposal;address:number};
export function executeSourceBoundR530(request:R530Request){
 const admission=evaluateExecutionProposalR529(request.proposal);
 if(admission.status!=='ADMISSIBLE_PROPOSAL')return Object.freeze({schema:R530_SCHEMA,status:'HELD' as const,admission,executionClaimed:false as const,canonicalMutation:false as const});
 if(!Number.isInteger(request.address)||request.address<0||request.address>=STATE_COUNT)return Object.freeze({schema:R530_SCHEMA,status:'HELD' as const,reasons:['ADDRESS_OUT_OF_RANGE'],admission,executionClaimed:false as const,canonicalMutation:false as const});
 if(request.proposal.executor==='SAI_HYBRID')return Object.freeze({schema:R530_SCHEMA,status:'EXTERNAL_HOST_PROOF_REQUIRED' as const,admission,executionClaimed:false as const,canonicalMutation:false as const});
 const packet=corpusState(request.address);
 const coordinate=decodeAddress(request.address);
 const evidence={address:request.address,coordinate,stateId:packet.stateId,decision:packet.metrics.decision,continuity:packet.metrics.continuity,plasticity:packet.metrics.plasticity,scar:packet.metrics.scar,contradiction:packet.metrics.contradiction};
 if(request.proposal.executor==='VISUALIZATION'){
  const geometry=fullSphereProjectionR525({address:request.address,continuity:packet.metrics.continuity,plasticity:packet.metrics.plasticity,scar:packet.metrics.scar,contradiction:packet.metrics.contradiction,yaw:0,fold:0,lens:'CONTINUITY'});
  return Object.freeze({schema:R530_SCHEMA,status:'SOURCE_EXECUTED' as const,executor:'VISUALIZATION' as const,evidence,geometry:{shellCount:geometry.shells.length,edgeCount:geometry.shells.reduce((n,s)=>n+s.edges.length,0),antipodeIndex0:geometry.antipodeIndex0},admission,executionClaimed:true as const,canonicalMutation:false as const,truthBoundary:'DETERMINISTIC_SOURCE_MODEL_PROJECTION_NOT_EMPIRICAL_OBSERVATION'});
 }
 if(request.proposal.executor==='TRAVERSAL')return Object.freeze({schema:R530_SCHEMA,status:'SOURCE_EXECUTED' as const,executor:'TRAVERSAL' as const,evidence,nextAddress:Number(packet.autoPing.dataNext),admission,executionClaimed:true as const,canonicalMutation:false as const,truthBoundary:'ADDRESS_TOPOLOGY_NOT_PHYSICAL_TRAVEL'});
 return Object.freeze({schema:R530_SCHEMA,status:'SOURCE_EXECUTED' as const,executor:'FORECAST' as const,evidence,modelNextAddress:Number(packet.autoPing.dataNext),admission,executionClaimed:true as const,canonicalMutation:false as const,truthBoundary:'MODEL_SUCCESSOR_NOT_VERIFIED_FUTURE'});
}
