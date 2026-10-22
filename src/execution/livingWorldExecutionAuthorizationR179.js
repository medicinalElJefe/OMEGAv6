import {createRunR146,transitionRunR146} from './durableOperationExecutionR146.js';

export const R179_REVISION='R179';
export const R179_SCHEMA='OMEGA_LIVING_WORLD_DURABLE_AUTHORIZATION_R179';
export const R179_LAWS=Object.freeze([
 'R178_RESOLVED_LIVING_WORLD_MISSION_REQUIRED',
 'EXPLICIT_OPERATOR_AUTHORIZATION_REQUIRED',
 'ONLY_R143_AVAILABLE_CONTRACTS_MAY_ENTER_R146',
 'R146_REMAINS_DURABLE_EXECUTION_LIFECYCLE_AUTHORITY',
 'R179_STOPS_AT_AUTHORIZED_AND_NEVER_DISPATCHES_R147',
 'R162_REMAINS_REFLEX_SPECIFIC_AUTHORIZATION_DISPATCH_AUTHORITY',
 'WORLD_OPERATION_AND_SCAR_LINEAGE_MUST_BE_PRESERVED_AS_METADATA',
 'RETURNED_DOES_NOT_EQUAL_VERIFIED',
 'HYBRID_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'FEDERATION_CLOSURE_REQUIRES_COMPLETE_VERIFIED_RECEIPT_CHAIN',
 'SOLVER_VALIDITY_REQUIRES_INDEPENDENT_SCIENTIFIC_PROOF',
 'COMPUTED_PHOTOREAL_REALITY_REQUIRES_DIRECT_RENDER_VALIDATION',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o}return v};
const text=(v,n=1000)=>String(v??'').trim().slice(0,n);
const validResolution=r=>Boolean(r?.revision==='R178'&&r?.schema==='OMEGA_LIVING_WORLD_MISSION_CONTRACT_RESOLUTION_R178'&&r?.accepted===true&&r?.dispatchAuthorized===false&&r?.executionInvoked===false&&r?.canonicalMutation===false&&r?.canonicalAdmissionAuthority==='R125');
const readyStep=s=>Boolean(s?.readiness==='CONTRACT_RESOLVED_NOT_AUTHORIZED'&&s?.contract?.schema==='OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'&&s?.contract?.revision==='R143'&&s?.contract?.state==='AVAILABLE'&&s?.contract?.receiptAuthority==='R142'&&s?.contract?.admissionAuthority==='R125');

export async function authorizeLivingWorldMissionR179(runtime,resolution={},input={}){
 if(!validResolution(resolution))return{ok:false,status:400,code:'R179_R178_RESOLUTION_REQUIRED',dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const selected=Array.isArray(input.authorizedStepIndexes)?[...new Set(input.authorizedStepIndexes.filter(Number.isInteger))]:[];
 const preview=(Array.isArray(resolution.resolvedSteps)?resolution.resolvedSteps:[]).filter(step=>selected.includes(step.index)).map(step=>({index:step.index,route:step.route,capabilityId:step.contract?.capabilityId||null,executionDomain:step.contract?.executionDomain||null,readiness:step.readiness,eligible:readyStep(step)}));
 if(input.authorized!==true||input.confirmation!=='AUTHORIZE_SELECTED_R143_CONTRACTS')return{ok:false,status:409,code:'R179_EXPLICIT_OPERATOR_AUTHORIZATION_REQUIRED',preview,dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R179 performs no R146 creation or transition until explicit authorization and the exact confirmation token are supplied.'};
 if(selected.length===0)return{ok:false,status:400,code:'R179_AUTHORIZED_STEP_SELECTION_REQUIRED',preview,dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const steps=Array.isArray(resolution.resolvedSteps)?resolution.resolvedSteps:[];
 const selectedSteps=steps.filter(step=>selected.includes(step.index));
 const ineligible=selectedSteps.filter(step=>!readyStep(step));
 if(selectedSteps.length!==selected.length||ineligible.length)return{ok:false,status:409,code:'R179_SELECTED_CONTRACT_NOT_AVAILABLE',preview,heldIndexes:ineligible.map(x=>x.index),dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const runs=[];
 for(const step of selectedSteps){
  const created=await createRunR146(runtime,{contract:step.contract,intent:text(step.action||step.reason||step.route,2000),metadata:{sourceRevision:'R179',sourceMissionId:resolution.sourceMissionId||null,worldId:resolution.worldId||'OMEGA_CANONICAL_WORLD',sourceOperationRef:stable(resolution.sourceOperationRef||null),scarCount:Number(resolution.scarCount)||0,adaptiveContext:stable(resolution.adaptiveContext||null),livingWorldStepIndex:step.index,livingWorldDomain:step.domain||null,livingWorldReason:text(step.reason,500)||null}});
  if(!created?.ok)return{ok:false,status:created?.status||500,code:created?.code||'R179_R146_CREATE_FAILED',runs,dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
  const authorized=await transitionRunR146(runtime,created.run.id,{state:'AUTHORIZED',reason:text(input.reason||'Explicit operator authorization for R178 living-world mission contract',500),evidence:{proofRef:'R179_EXPLICIT_OPERATOR_AUTHORIZATION'}});
  if(!authorized?.ok)return{ok:false,status:authorized?.status||500,code:authorized?.code||'R179_R146_AUTHORIZATION_FAILED',runs:[...runs,{created:created.run,authorization:authorized}],dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
  runs.push({runId:authorized.run.id,state:authorized.run.state,route:authorized.run.contract.route,capabilityId:authorized.run.contract.capabilityId,executionDomain:authorized.run.contract.executionDomain,headSha256:authorized.run.headSha256});
 }
 return{ok:true,status:200,schema:R179_SCHEMA,revision:R179_REVISION,state:'AUTHORIZED_NOT_DISPATCHED',worldId:resolution.worldId||'OMEGA_CANONICAL_WORLD',sourceMissionId:resolution.sourceMissionId||null,authorizedStepIndexes:selected,runs,dispatchAuthorized:false,executionInvoked:false,returned:false,verified:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',claims:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:false},nextAuthority:'R147_EXISTING_DOMAIN_DISPATCH_AFTER_SEPARATE_GOVERNED_ACTION',truthBoundary:'R179 converts explicitly authorized, R143-AVAILABLE living-world mission contracts into R146 DISCOVERED→AUTHORIZED durable history only. It does not dispatch R147, prove invocation/return/verification, establish PC online or federation closure, validate a scientific solver, prove computed photoreal reality, or admit CanonState.'};
}

export function manifestR179(){return{ok:true,schema:'OMEGA_LIVING_WORLD_DURABLE_AUTHORIZATION_MANIFEST_R179',revision:R179_REVISION,inherits:['R178 living-world contract resolution','R146 durable execution history','R143 authoritative operation contracts','R136/R134 living canonical world','R125 canonical admission'],laws:R179_LAWS,dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R179 is a bounded explicit-authorization bridge into existing R146 durable execution history. R147 remains dispatch authority; R162 remains the reflex-specific authorization/dispatch bridge.'};}
