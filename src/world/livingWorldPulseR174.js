export const R174_REVISION='R174';
export const R174_SCHEMA='OMEGA_LIVING_WORLD_PULSE_R174';
export const R174_LAWS=Object.freeze([
 'VISUALIZE_EXISTING_R173_WORLD_EVENT_WITHOUT_CREATING_NEW_WORLD_AUTHORITY',
 'FEDERATION_STAGE_VISIBILITY_IS_NOT_EXECUTION_OR_NETWORK_REACHABILITY_PROOF',
 'R136_R134_REMAIN_VISUAL_WORLD_AND_SCAR_CONTINUITY_AUTHORITIES',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'HYBRID_PC_SOLVER_AND_COMPUTED_PHOTOREAL_CLAIMS_REQUIRE_DIRECT_PROOF',
 'OPERATOR_NAVIGATION_IS_INTENT_ONLY_NOT_DISPATCH_AUTHORIZATION'
]);

const text=(v,n=120)=>String(v??'').trim().slice(0,n);
const STAGES=['INTENT','PROPOSE','SCREEN','QUEUE','SOLVE','ADMIT'];

export function projectFederationWorldVisualR174(detail={}){
 const world=detail?.world||null;
 const visual=world?.visualOverlay||{};
 const stage=text(world?.lastVerifiedStage||visual.stage||'NONE',24).toUpperCase()||'NONE';
 const nextStage=text(world?.nextRequiredStage||visual.nextStage||'',24).toUpperCase()||null;
 const closed=world?.federationClosed===true&&detail?.claims?.federationClosedProved===true;
 const lod=Number.isFinite(Number(visual.lod))?Number(visual.lod):null;
 const sampleBudget=Number.isFinite(Number(visual.sampleBudget))?Number(visual.sampleBudget):null;
 const truthBand=text(visual.federationTruthBand||world?.frame?.visualState?.truthBands?.federation||'UNVERIFIED',80)||'UNVERIFIED';
 const validStage=stage==='NONE'||STAGES.includes(stage);
 return{
  schema:R174_SCHEMA,
  revision:R174_REVISION,
  eventAccepted:detail?.revision==='R173'&&detail?.changed===true&&Boolean(world)&&validStage,
  worldId:text(world?.worldId,160)||null,
  ledgerHead:text(detail?.head,180)||null,
  stage:validStage?stage:'NONE',
  nextStage:validStage?nextStage:null,
  federationClosed:closed,
  truthBand,
  lod,
  sampleBudget,
  scarCount:Array.isArray(world?.frame?.mission?.scarIds)?world.frame.mission.scarIds.length:Array.isArray(world?.stages)?world.stages.filter(s=>s?.complete).length:0,
  routingTarget:text(world?.routingIntent?.targetFamily,80)||null,
  dispatchAuthorized:false,
  canonicalMutation:false,
  canonicalAdmissionAuthority:'R125',
  claims:{
   publicDeploymentProved:false,
   pcOnlineProved:false,
   solverValidityProved:false,
   computedPhotorealRealityProved:false,
   currentNetworkReachabilityProved:false,
   federationClosedProved:closed
  }
 };
}

export function manifestR174(){return{schema:R174_SCHEMA,revision:R174_REVISION,laws:R174_LAWS,eventAuthority:'R173',visualWorldAuthority:'R136/R134',canonicalAdmissionAuthority:'R125',canonicalMutation:false,dispatchAuthorized:false};}
