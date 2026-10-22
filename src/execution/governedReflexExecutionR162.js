import {readRunR146,transitionRunR146} from './durableOperationExecutionR146.js';
import {dispatchRunR147} from './unifiedExecutorFabricR147.js';

export const R162_REVISION='R162';
export const R162_SCHEMA='OMEGA_GOVERNED_REFLEX_EXECUTION_R162';
export const R162_LAWS=Object.freeze([
 'R161_DURABLE_DISCOVERED_HANDOFF_REQUIRED',
 'EXPLICIT_EXECUTION_AUTHORIZATION_REQUIRED',
 'R146_AUTHORIZATION_PRECEDES_R147_DISPATCH',
 'R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY',
 'RETURNED_DOES_NOT_EQUAL_VERIFIED',
 'HYBRID_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'FEDERATION_ROUTING_OR_RETURN_DOES_NOT_PROVE_FULL_CLOSURE',
 'SOLVER_EXECUTION_OR_CONVERGENCE_DOES_NOT_PROVE_SCIENTIFIC_VALIDITY',
 'RENDER_RECEIPT_DOES_NOT_PROVE_COMPUTED_PHOTOREAL_REALITY',
 'R159_REMAINS_POST_RETURN_SOVEREIGN_CONVERGENCE_AUTHORITY',
 'R134_R136_WORLD_AND_SCAR_REFERENCES_REMAIN_NON_CANONICAL_EVIDENCE',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const text=(v,n=1000)=>String(v??'').trim().slice(0,n);
const validHandoff=h=>Boolean(h?.ok===true&&h?.revision==='R161'&&h?.schema==='OMEGA_REFLEX_MISSION_DURABLE_HANDOFF_R161'&&h?.state==='DURABLE_EXECUTION_INTENT_DISCOVERED'&&h?.run?.id&&h?.run?.state==='DISCOVERED'&&h?.canonicalMutation===false&&h?.canonicalAdmissionAuthority==='R125');

export async function authorizeAndDispatchReflexMissionR162(runtime,handoff,input={}){
 if(!validHandoff(handoff))return{ok:false,status:400,code:'R162_R161_DISCOVERED_HANDOFF_REQUIRED',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const current=await readRunR146(runtime,handoff.run.id);
 if(!current||current.state!=='DISCOVERED')return{ok:false,status:409,code:'R162_DISCOVERED_RUN_REQUIRED',run:current||null,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const preview={schema:R162_SCHEMA,revision:R162_REVISION,runId:current.id,missionId:text(handoff.preview?.missionId,160)||null,intentId:text(handoff.preview?.intentId,160)||null,executorId:text(handoff.executorPlan?.executorId,64)||null,domain:text(current.contract?.executionDomain,32),worldHeadSha256:text(handoff.preview?.worldHeadSha256,256)||null,scarId:text(handoff.preview?.scarId,180)||null,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 if(input.authorized!==true)return{ok:false,status:409,code:'R162_EXPLICIT_EXECUTION_AUTHORIZATION_REQUIRED',preview,truthBoundary:'No R146 AUTHORIZED transition and no R147 dispatch occur until explicit execution authorization is true.'};
 const authorized=await transitionRunR146(runtime,current.id,{state:'AUTHORIZED',reason:text(input.reason||'Explicit operator authorization for R161 reflex mission execution',500),evidence:{proofRef:'R162_EXPLICIT_EXECUTION_AUTHORIZATION'}});
 if(!authorized.ok)return{...authorized,schema:R162_SCHEMA,revision:R162_REVISION,preview,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const dispatched=await dispatchRunR147(runtime,current.id,{...input.dispatch,executorId:input.executorId||handoff.executorPlan?.executorId,strategy:input.strategy||handoff.executorPlan?.strategy});
 return{ok:Boolean(dispatched?.ok),status:dispatched?.status||200,schema:R162_SCHEMA,revision:R162_REVISION,state:dispatched?.run?.state||authorized.run.state,preview,authorizationEvent:authorized.event,dispatch:dispatched,executionTruth:{authorized:true,available:['AVAILABLE','INVOKED','RETURNED','VERIFIED'].includes(dispatched?.run?.state),invoked:['INVOKED','RETURNED','VERIFIED'].includes(dispatched?.run?.state),returned:['RETURNED','VERIFIED'].includes(dispatched?.run?.state),verified:dispatched?.run?.state==='VERIFIED',pcOnline:false,federationClosed:false,solverValidated:false,computedPhotorealRealityProved:false},nextAuthority:dispatched?.run?.state==='RETURNED'||dispatched?.run?.state==='VERIFIED'?'R159_POST_RETURN_SOVEREIGN_CONVERGENCE':'R147_DOMAIN_EXECUTION_LIFECYCLE',canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R162 performs only the explicit authorization-to-existing-dispatch seam. R146 owns durable execution history and R147 owns executor dispatch. Returned output remains distinct from proof, PC ONLINE remains heartbeat-gated, federation closure requires its complete receipt chain, solver validity requires independent scientific proof, computed photoreal reality requires direct render validation, and CanonState admission remains R125-only.'};
}

export function manifestR162(){return{ok:true,schema:'OMEGA_GOVERNED_REFLEX_EXECUTION_MANIFEST_R162',revision:R162_REVISION,inherits:['R161 durable reflex handoff','R146 durable execution history','R147 unified executor fabric','R159 post-return sovereign convergence','R134/R136 living canonical world','R125 canonical admission'],laws:R162_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R162 is an additive governed authorization/dispatch bridge. It does not create a second executor, federation authority, world authority, proof authority, deployment authority, or CanonState authority.'}}
