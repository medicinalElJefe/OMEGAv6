import {emitOperationR86,type OmegaOperationR86} from '../omegaOperationBusR86';
import {compileOperationWorldInputR140} from './operationWorldBridgeR140';
import {assembleReflexWorldTransitionR157} from './reflexWorldTransitionR157.js';

export const R160_REVISION='R160';
export const R160_SCHEMA='OMEGA_REFLEX_OPERATION_INGRESS_R160';
export const R160_LAWS=Object.freeze([
 'ONLY_EXPLICIT_RETURNED_RESULT_PAYLOADS_ENTER_THE_REFLEX_INGRESS',
 'RETURNED_REMAINS_DISTINCT_FROM_VERIFIED_AND_CANONSTATE_ADMISSION',
 'R156_R157_REFLEX_ASSEMBLY_REMAINS_NON_EXECUTING',
 'R160_DERIVED_MISSION_EVENTS_MAY_NOT_REENTER_R160',
 'R140_REMAINS_THE_ONLY_BROWSER_OPERATION_TO_WORLD_HEAD_BRIDGE',
 'R149_REMAINS_THE_EXISTING_DURABLE_WORLD_HEAD_ADAPTER',
 'EARTH_FEDERATION_HYBRID_AND_RENDER_PROOF_FIELDS_ARE_FORWARDED_NOT_INFERRED',
 'R159_SOVEREIGN_EXECUTION_AUTHORITY_REMAINS_STRONGER_AND_UNCHANGED',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'
]);

const RETURN_STATES=new Set(['RETURNED','VERIFIED','RECONTEXTUALIZED','ADMISSION_CANDIDATE']);
const text=(v:unknown,n=200)=>String(v??'').trim().slice(0,n);
const list=(v:unknown,limit=64)=>Array.isArray(v)?v.slice(-limit):[];
const strings=(v:unknown,limit=64)=>list(v,limit).map(x=>text(x,200)).filter(Boolean);
const object=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};

export function compileReflexIngressCandidateR160(event:OmegaOperationR86){
 const payload=object(event?.payload);
 const sourceFamily=text(payload.source_family||payload.family,120).toUpperCase();
 const returnedState=text(payload.returned_state||payload.lifecycle_state,120).toUpperCase();
 const residuals=list(payload.residuals,64);
 const eligible=Boolean(event?.schema==='OMEGA_OPERATION_EVENT_R86'&&payload.r160ReflexDerived!==true&&sourceFamily&&RETURN_STATES.has(returnedState)&&Array.isArray(payload.residuals));
 return{eligible,sourceFamily:sourceFamily||null,returnedState:returnedState||null,residualCount:residuals.length,reason:eligible?'EXPLICIT_RETURNED_RESULT':'NOT_EXPLICIT_RETURNED_RESULT',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
}

function reflexEventFromOperation(event:OmegaOperationR86){const payload=object(event.payload);return{source_family:payload.source_family||payload.family,canonical_address:payload.canonical_address??event.nextAddress??event.address??0,packet_id:payload.packet_id||event.sha256,returned_state:payload.returned_state||payload.lifecycle_state,residuals:list(payload.residuals,64),prior_scars:list(payload.prior_scars,64),path:list(payload.path,32),max_hops:payload.max_hops};}
function reflexContextFromOperation(event:OmegaOperationR86,previousHead:any){const world=compileOperationWorldInputR140(event) as any;return{eventTime:event.at,observerId:`r160-${text(event.surface,64).replace(/[^A-Za-z0-9._:-]+/g,'-')||'operation'}`,projection:world.projection,address:world.address,previousHead,earth:world.earth,federation:world.federation,hybrid:world.hybrid,render:world.render,performance:world.performance,metrics:world.metrics,intentId:event.workflowId?`workflow-${text(event.workflowId,120)}`:`return-${event.sha256}`,missionId:`reflex-return-${event.id}`};}
function derivedPayload(event:OmegaOperationR86,transition:any){const source=object(event.payload);const sourceIds=[event.sha256,...strings(source.sourceIds),...transition.reflex.residuals.map((r:any)=>text(r.evidence_id,200)).filter(Boolean)].filter((v,i,a)=>a.indexOf(v)===i);const proofIds=strings(source.proofIds);const scarIds=[transition.reflex.scar.scar_id,...strings(source.scarIds)].filter((v,i,a)=>a.indexOf(v)===i);return{r160ReflexDerived:true,sourceIds,proofIds,scarIds,earthObserved:source.earthObserved===true,federationReturned:source.federationReturned===true,federationNode:source.federationNode,nativeExecutionClaimed:source.nativeExecutionClaimed===true,devices:Array.isArray(source.devices)?source.devices:[],renderReceipt:source.renderReceipt===true,directPhotorealValidation:source.directPhotorealValidation===true,payloadDigest:source.payloadDigest,resultFingerprint:source.resultFingerprint,runtimeLoad:source.runtimeLoad,latencyPressure:source.latencyPressure,continuity:source.continuity,plasticity:source.plasticity,contradiction:source.contradiction,burden:source.burden,evidence:source.evidence,uncertainty:source.uncertainty,scar:source.scar,reflexMission:{sourceEventId:event.id,sourceEventSha256:event.sha256,sourceFamily:transition.reflex.source_family,returnedState:transition.reflex.returned_state,action:transition.reflex.action,next:transition.reflex.next,scarId:transition.reflex.scar.scar_id,missionId:transition.mission.missionId,intentId:transition.mission.intentId,planDigest:transition.mission.planDigest,targetFamilies:transition.mission.targetFamilies,state:transition.mission.state,requiresExecutionReceipts:true,requiresReturnVerification:true,canonicalMutation:false,canonicalAdmissionAuthority:'R125'}};}

export async function processReturnedOperationR160(event:OmegaOperationR86,previousHead:any=null){
 const candidate=compileReflexIngressCandidateR160(event);if(!candidate.eligible)return{ok:false,schema:R160_SCHEMA,revision:R160_REVISION,state:'IGNORED',candidate,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const transition=await assembleReflexWorldTransitionR157(reflexEventFromOperation(event),reflexContextFromOperation(event,previousHead));
 if(!transition?.ok)return{ok:false,schema:R160_SCHEMA,revision:R160_REVISION,state:'REFLEX_REJECTED',candidate,transition,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const operation=await emitOperationR86({type:'REFLEX_MISSION_ASSEMBLED',surface:event.surface,stateId:event.stateId,address:event.address,nextAddress:event.nextAddress,workflowId:event.workflowId,status:'INFO',detail:`R160 assembled ${transition.reflex.action} reflex mission from explicit ${transition.reflex.returned_state} return; execution and verification remain separately required.`,payload:derivedPayload(event,transition)});
 return{ok:true,schema:R160_SCHEMA,revision:R160_REVISION,state:'REFLEX_MISSION_ASSEMBLED',sourceEventId:event.id,sourceEventSha256:event.sha256,transition,operation,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R160 reacts only to an explicit R86 returned-result payload carrying a declared R155 source family, lifecycle return state, and residual array. R157 assembles the bounded reflex/mission; R160 then emits a non-executing R86 mission event so the already-installed R140 and R149 chain can persist its scar/intent. It does not invoke target families, alter R159 sovereign execution authority, prove federation handoff, prove PC online state, validate a solver, prove public deployment or computed photoreal reality, or mutate CanonState.'};
}

const pending=new Map<string,OmegaOperationR86>();const MAX_PENDING=64;let installed=false;
export function installReflexOperationIngressR160(){if(installed||typeof window==='undefined')return false;installed=true;window.addEventListener('omega-r86-operation',((e:Event)=>{const event=(e as CustomEvent<OmegaOperationR86>).detail;if(!event||!compileReflexIngressCandidateR160(event).eligible)return;pending.set(event.id,event);while(pending.size>MAX_PENDING){const first=pending.keys().next().value;if(!first)break;pending.delete(first)}}) as EventListener);window.addEventListener('omega-r140-world-frame',((e:Event)=>{const receipt=(e as CustomEvent<any>).detail;const event=pending.get(String(receipt?.eventId||''));if(!event)return;pending.delete(event.id);void processReturnedOperationR160(event,receipt?.frame?.head||null).then(result=>window.dispatchEvent(new CustomEvent('omega-r160-reflex-mission',{detail:result}))).catch(()=>{})}) as EventListener);return true;}
export function manifestR160(){return{ok:true,schema:R160_SCHEMA,revision:R160_REVISION,laws:R160_LAWS,chain:['explicit R86 returned-result operation','R140 source world frame','R156 reflex classification/scar','R157 intent-assembled living-world transition','R160 non-executing reflex mission operation','R140 canonical-world advance','R149 existing durable head sync'],truthBoundary:'R160 installs the missing runtime ingress into the already-promoted reflex/world system. It consumes explicit returned-result metadata only and never upgrades RETURNED to VERIFIED, R159 sovereign execution proof, CanonState admission, solver validity, public deployment, or computed-photoreal validation.'};}
