import {assembleLivingWorldIntentR176} from './livingWorldIntentProposalR176.js';

export const R177_REVISION='R177';
export const R177_SCHEMA='OMEGA_LIVING_WORLD_MISSION_COMPOSER_R177';
export const R177_EVENT='omega-living-world-mission-r177';
export const R177_LAWS=Object.freeze([
 'R176_ACCEPTED_INTENT_PROPOSAL_REQUIRED',
 'OPERATOR_STAGING_IS_NOT_EXECUTION_AUTHORIZATION',
 'MISSION_EDITS_MAY_NARROW_OR_ANNOTATE_BUT_NOT_INVENT_DOMAIN_PROOF',
 'PRESERVE_R136_R134_WORLD_AND_SCAR_CONTINUITY_REFERENCES',
 'PRESERVE_R125_AS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'NO_R146_TRANSITION_OR_R147_DISPATCH_FROM_COMPOSER',
 'DO_NOT_INFER_PUBLIC_DEPLOYMENT_PC_ONLINE_SOLVER_VALIDITY_FEDERATION_CLOSURE_OR_COMPUTED_PHOTOREAL_REALITY'
]);
const text=(v,n=500)=>String(v??'').trim().slice(0,n);
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=stable(v[k]);return out}return v};

export function composeLivingWorldMissionR177(world={},input={}){
 const proposal=assembleLivingWorldIntentR176(world);
 if(proposal?.accepted!==true||proposal?.intentOnly!==true||proposal?.dispatchAuthorized!==false)return{schema:R177_SCHEMA,revision:R177_REVISION,accepted:false,state:'R176_ACCEPTED_INTENT_REQUIRED',dispatchAuthorized:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',mission:null};
 const proposed=Array.isArray(proposal?.mission?.steps)?proposal.mission.steps:[];
 const selectedRaw=Array.isArray(input.selectedStepIndexes)?input.selectedStepIndexes:proposed.map((_,i)=>i);
 const selected=[...new Set(selectedRaw.map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<proposed.length))].slice(0,12);
 const steps=selected.map(i=>stable(proposed[i]));
 const staged=input.operatorStaged===true;
 const note=text(input.note,800)||null;
 return{
  schema:R177_SCHEMA,revision:R177_REVISION,accepted:true,state:staged?'OPERATOR_STAGED_NOT_AUTHORIZED':'PREVIEW_NOT_STAGED',
  worldId:proposal.worldId,sourceOperationRef:stable(proposal.sourceOperationRef),scarCount:Number(proposal.scarCount)||0,
  adaptiveContext:stable(proposal.adaptiveContext),sourceMissionId:proposal.mission.missionId,
  mission:{missionId:`R177:${proposal.mission.missionId}`,kind:'VISUAL_LIVING_WORLD_MISSION',steps,activeDomains:[...(proposal.mission.activeDomains||[])].slice(0,12),routingTarget:proposal.mission.routingTarget||null,operatorNote:note},
  staging:{operatorStaged:staged,authorizationRequired:true,selectedStepIndexes:selected},
  dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  claims:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:false},
  nextAuthority:staged?'EXISTING_GOVERNED_EXECUTION_AUTHORIZATION_PATH':'OPERATOR_REVIEW_AND_STAGE',
  truthBoundary:'R177 turns the accepted R176 proposal into a visual operator-staged mission object while preserving world/scar continuity. Staging is not R146 authorization, R147 dispatch, proof, federation closure, machine state, scientific validation, render validation, or CanonState admission.'
 };
}
export function manifestR177(){return{schema:R177_SCHEMA,revision:R177_REVISION,laws:R177_LAWS,inputAuthority:'R176',visualWorldAuthority:'R136/R134',canonicalAdmissionAuthority:'R125',operatorStagingOnly:true,dispatchAuthorized:false};}
