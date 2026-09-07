import {createRunR146} from './durableOperationExecutionR146.js';
import {selectExecutorR147} from './unifiedExecutorFabricR147.js';

export const R161_REVISION='R161';
export const R161_SCHEMA='OMEGA_REFLEX_MISSION_DURABLE_HANDOFF_R161';
export const R161_LAWS=Object.freeze([
 'R157_INTENT_ASSEMBLED_MISSION_REQUIRED',
 'EXPLICIT_HANDOFF_CONFIRMATION_PERSISTS_INTENT_NOT_INVOCATION',
 'R143_AUTHORITATIVE_OPERATION_CONTRACT_REQUIRED',
 'R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY',
 'R147_EXECUTOR_SELECTION_IS_ROUTING_PLAN_NOT_INVOCATION',
 'FEDERATION_SELECTION_DOES_NOT_PROVE_PROPOSE_SCREEN_SOLVE_OR_ADMIT',
 'HYBRID_SELECTION_DOES_NOT_PROVE_PC_ONLINE_WITHOUT_CURRENT_AUTHENTICATED_HEARTBEAT',
 'R159_REMAINS_POST_RETURN_SOVEREIGN_CONVERGENCE_AUTHORITY',
 'R134_R136_WORLD_AND_SCAR_REFERENCES_REMAIN_NON_CANONICAL_EVIDENCE',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY',
 'NO_AUTONOMOUS_DISPATCH_FROM_REFLEX'
]);

const text=(v,n=500)=>String(v??'').trim().slice(0,n);
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=stable(v[k]);return out}return v};
const validTransition=t=>Boolean(t?.ok===true&&t?.revision==='R157'&&t?.mission?.state==='INTENT_ASSEMBLED_NOT_EXECUTION_PROOF'&&t?.canonicalMutation===false&&t?.canonicalAdmissionAuthority==='R125');
const validContract=c=>Boolean(c?.schema==='OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'&&c?.revision==='R143'&&c?.routeId&&c?.route&&c?.capabilityId&&c?.executionDomain&&c?.receiptAuthority==='R142'&&c?.admissionAuthority==='R125');

export async function handoffReflexMissionR161(runtime,transition,input={}){
 if(!validTransition(transition))return{ok:false,status:400,code:'R161_R157_INTENT_MISSION_REQUIRED',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const contract=input.contract;
 if(!validContract(contract))return{ok:false,status:400,code:'R161_R143_CONTRACT_REQUIRED',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const preview={
  schema:R161_SCHEMA,revision:R161_REVISION,
  missionId:text(transition.mission.missionId,160),intentId:text(transition.mission.intentId,160),
  targetFamilies:[...(transition.mission.targetFamilies||[])].map(x=>text(x,120)).filter(Boolean),
  routeId:text(contract.routeId,160),capabilityId:text(contract.capabilityId,160),executionDomain:text(contract.executionDomain,32).toUpperCase(),
  requestedStrategy:text(input.strategy||'AUTO',32).toUpperCase(),requestedExecutorId:text(input.executorId,64).toUpperCase()||null,
  worldHeadSha256:text(transition.world?.head?.headSha256||transition.operationRef?.headSha256,256)||null,
  scarId:text(transition.reflex?.scar?.scar_id,180)||null,
  continuityOperationRef:transition.operationRef?stable(transition.operationRef):null,
  canonicalMutation:false,canonicalAdmissionAuthority:'R125'
 };
 if(input.confirmed!==true)return{ok:false,status:409,code:'R161_EXPLICIT_HANDOFF_CONFIRMATION_REQUIRED',preview,truthBoundary:'R161 confirmation persists a durable execution intent only. Without explicit confirmation no R146 run is created and no executor is selected, invoked, returned, or verified.'};
 const created=await createRunR146(runtime,{
  contract,
  intent:text(input.intent||transition.reflex?.next||`Resolve reflex mission ${preview.missionId}`,2000),
  metadata:{
   sourceRevision:'R157',sourceMissionId:preview.missionId,sourceIntentId:preview.intentId,targetFamilies:preview.targetFamilies,
   reflexAction:text(transition.reflex?.action,32),reflexScarId:preview.scarId,worldHeadSha256:preview.worldHeadSha256,
   continuityOperationRef:preview.continuityOperationRef,requestedStrategy:preview.requestedStrategy,requestedExecutorId:preview.requestedExecutorId,
   sourceOperationReceiptHash:text(input.sourceOperationReceiptHash,256)||null,canonicalMutation:false,canonicalAdmissionAuthority:'R125'
  }
 });
 if(!created.ok)return{...created,schema:R161_SCHEMA,revision:R161_REVISION,preview,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const plan=await selectExecutorR147(runtime,created.run,{strategy:preview.requestedStrategy,executorId:preview.requestedExecutorId||undefined});
 return{
  ok:true,status:201,schema:R161_SCHEMA,revision:R161_REVISION,state:'DURABLE_EXECUTION_INTENT_DISCOVERED',preview,run:created.run,executorPlan:plan,
  executionTruth:{authorized:false,available:false,invoked:false,returned:false,verified:false,pcOnline:false,federationClosed:false,solverValidated:false,computedPhotorealRealityProved:false},
  nextRequired:'EXPLICIT_R146_AUTHORIZATION_THEN_R147_DISPATCH_AND_DOMAIN_SPECIFIC_RETURN_PROOF',
  canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R161 hands an explicitly confirmed R157 reflex mission into existing R146 durable execution history and computes the existing R147 routing plan. The created run remains DISCOVERED. R161 never authorizes or dispatches autonomously, never upgrades executor availability to execution proof, never turns federation selection into closure, never claims PC online without a current authenticated heartbeat, and never changes CanonState.'
 };
}

export function manifestR161(){return{ok:true,schema:R161_SCHEMA,revision:R161_REVISION,inherits:['R157 reflex living-world transition','R143 authoritative operation contract','R146 durable execution history','R147 unified executor fabric','R159 sovereign execution convergence','R125 canonical admission'],laws:R161_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R161 is an additive mission-to-execution handoff. It persists explicit reflex intent into the current execution authority while preserving authorization, invocation, return, verification, federation, Hybrid, solver and CanonState truth boundaries.'}}
