import {projectFederationWorldVisualR174} from './livingWorldPulseR174.js';

export const R175_REVISION='R175';
export const R175_SCHEMA='OMEGA_MULTI_DOMAIN_LIVING_WORLD_TRUTH_R175';
export const R175_R140_EVENT='omega-r140-world-frame';
export const R175_LAWS=Object.freeze([
 'CONVERGE_EXISTING_R140_AND_R173_WORLD_EVENTS_WITHOUT_CREATING_NEW_WORLD_AUTHORITY',
 'R136_R134_REMAIN_VISUAL_WORLD_AND_SCAR_CONTINUITY_AUTHORITIES',
 'MISSION_EARTH_FEDERATION_HYBRID_AND_RENDER_TRUTH_BANDS_REMAIN_DOMAIN_BOUND',
 'ADAPTIVE_PERFORMANCE_CHANGES_VISUAL_COST_NOT_TRUTH',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'OBSERVATION_OR_PERSISTED_UI_STATE_IS_NOT_CURRENT_MACHINE_OR_DEPLOYMENT_PROOF',
 'SOLVER_VALIDITY_AND_COMPUTED_PHOTOREAL_REALITY_REQUIRE_DIRECT_DOMAIN_PROOF',
 'VISUAL_INTERACTION_REMAINS_INTENT_ONLY_UNTIL_EXISTING_GOVERNED_AUTHORIZATION'
]);
const text=(v,n=160)=>String(v??'').trim().slice(0,n);
const NONE=Object.freeze({mission:'NONE',earth:'UNPROVED',federation:'NONE',hybrid:'DEVICE_PROOF_REQUIRED',render:'NONE'});
const finite=v=>Number.isFinite(Number(v))?Number(v):null;
const scars=events=>Array.isArray(events)?events.reduce((n,e)=>n+(Array.isArray(e?.scarIds)?e.scarIds.length:0),0):0;
function fromR140(detail={}){
 const frame=detail?.frame||null,bands={...NONE,...(frame?.visualState?.truthBands||{})};
 const accepted=detail?.revision==='R140'&&frame?.worldId==='OMEGA_CANONICAL_WORLD'&&detail?.canonicalMutation!==true;
 const hybridDirect=accepted&&bands.hybrid==='CURRENT_EXECUTION_PROOF'&&frame?.frame?.hybrid?.proved===true;
 const renderDirect=accepted&&bands.render==='DIRECT_RENDER_PROOF_PRESENT'&&Array.isArray(frame?.events)&&frame.events.some(e=>e?.claim?.computedPhotorealRealityProved===true);
 return{eventAccepted:accepted,sourceRevision:'R140',worldId:text(frame?.worldId)||null,operationRef:frame?.operationRef||null,federationStage:'NONE',nextFederationStage:null,federationClosed:false,truthBands:bands,lod:finite(frame?.visualState?.lod),sampleBudget:finite(frame?.visualState?.sampleBudget),scarCount:scars(frame?.events),routingTarget:null,claims:{publicDeploymentProved:false,pcOnlineProved:hybridDirect,solverValidityProved:false,computedPhotorealRealityProved:renderDirect,currentNetworkReachabilityProved:false,federationClosedProved:false}};
}
function fromR173(detail={}){
 const pulse=projectFederationWorldVisualR174(detail),frame=detail?.world?.frame||null;
 const bands={...NONE,...(frame?.visualState?.truthBands||{}),federation:pulse.truthBand||'NONE'};
 return{eventAccepted:pulse.eventAccepted===true,sourceRevision:'R173',worldId:pulse.worldId,operationRef:frame?.operationRef||detail?.world?.operationRef||null,federationStage:pulse.stage,nextFederationStage:pulse.nextStage,federationClosed:pulse.federationClosed===true,truthBands:bands,lod:pulse.lod,sampleBudget:pulse.sampleBudget,scarCount:pulse.scarCount,routingTarget:pulse.routingTarget,claims:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,currentNetworkReachabilityProved:false,federationClosedProved:pulse.federationClosed===true}};
}
export function projectMultiDomainLivingWorldTruthR175(detail={}){
 const projected=detail?.revision==='R173'?fromR173(detail):fromR140(detail);
 return{schema:R175_SCHEMA,revision:R175_REVISION,...projected,activeDomains:Object.entries(projected.truthBands||NONE).filter(([,state])=>!['NONE','UNPROVED','DEVICE_PROOF_REQUIRED'].includes(String(state))).map(([domain])=>domain.toUpperCase()),dispatchAuthorized:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R175 is a read-only visual convergence of already-governed R140 runtime world frames and R173 durable federation-world events. It does not create evidence, authorize execution, mutate CanonState, prove deployment, validate a solver, or infer computed-photoreal reality.'};
}
export function manifestR175(){return{schema:R175_SCHEMA,revision:R175_REVISION,laws:R175_LAWS,eventAuthorities:['R140','R173'],visualWorldAuthority:'R136/R134',canonicalAdmissionAuthority:'R125',canonicalMutation:false,dispatchAuthorized:false};}
