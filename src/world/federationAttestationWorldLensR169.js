import {assessGenesisR192Attestation} from '../federation/genesisAttestationR168.js';
import {assembleLivingWorldFrameR136} from './livingWorldFrameR136.js';

export const R169_REVISION='R169';
export const R169_SCHEMA='OMEGA_FEDERATION_ATTESTATION_WORLD_LENS_R169';
export const R169_LAWS=Object.freeze([
 'FEDERATION_ATTESTATION_IS_EVIDENCE_NOT_EXECUTION',
 'LIVE_VERIFIED_IS_NOT_CANONSTATE_PROMOTION',
 'R168_REMAINS_GENESIS_ATTESTATION_AUTHORITY',
 'R136_REMAINS_VISUAL_WORLD_FRAME_AUTHORITY',
 'R134_REMAINS_CANONICAL_WORLD_SCAR_CONTINUITY_AUTHORITY',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'PC_ONLINE_SOLVER_VALIDITY_AND_PHOTOREAL_REALITY_REQUIRE_DIRECT_PROOF'
]);

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const text=(v,n=180)=>String(v??'').trim().slice(0,n);

export async function assembleFederationAttestationWorldLensR169({evidence=null,context={}}={}){
 const attestation=assessGenesisR192Attestation(evidence);
 const verified=attestation.liveVerified===true;
 const state=attestation.state;
 const scarId=`R169:${state}:${text(attestation.observed?.workerVersion||'NO_VERSION',80)}`;
 const mission={
  id:`R169-FEDERATION-ATTESTATION-${text(context.sessionId||context.observerId||'SESSION',80)}`,
  planDigest:`R169:${state}:${verified?'LIVE_VERIFIED':'PROOF_REQUIRED'}`,
  scarIds:[scarId]
 };
 const frame=await assembleLivingWorldFrameR136({
  eventTime:context.eventTime??Date.now(),
  observerId:context.observerId||'omega-federation-attestation-lens',
  projection:context.projection||'WOVEN',
  address:context.address??0,
  previousHead:context.previousHead||null,
  intent:{id:verified?'R169-REVIEW-ATTESTED-FEDERATION':'R169-OBTAIN-FEDERATION-PROOF',sourceIds:['R168']},
  mission,
  federation:verified?{
   returned:true,
   node:'GENESIS_R192_ATTESTATION',
   sourceIds:['R168','GENESIS_R192','OPTICAL_R153.2'],
   proofIds:[scarId],
   scarIds:[scarId],
   payloadDigest:text(attestation.observed?.workerVersion,160)||null
  }:null,
  performance:context.performance||{},
  metrics:{
   continuity:clamp(context.metrics?.continuity??0.8),
   plasticity:clamp(context.metrics?.plasticity??0.6),
   contradiction:clamp(verified?0:0.65),
   burden:clamp(verified?0.2:0.7),
   evidence:clamp(verified?0.9:0.25),
   uncertainty:clamp(verified?0.2:0.8),
   scar:clamp(verified?0.25:0.75)
  }
 });
 return{
  schema:R169_SCHEMA,
  revision:R169_REVISION,
  ok:verified,
  attestation,
  worldId:frame.worldId,
  frame,
  visualOverlay:{state,verified,action:verified?'REVIEW_RETURNED_FEDERATION_EVIDENCE':'PROOF_REQUIRED',lod:frame.visualState.lod,sampleBudget:frame.visualState.sampleBudget,scarId,federationTruthBand:frame.visualState.truthBands.federation},
  routingIntent:{targetFamily:'FEDERATION_EVIDENCE',dispatchAuthorized:false,federationClosed:false},
  canonicalMutation:false,
  canonicalAdmissionAuthority:'R125',
  claims:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:false},
  truthBoundary:'R169 projects R168 Genesis attestation evidence into the existing R136/R134 living canonical-world scar/proof continuity. It does not prove federation execution or closure, deploy anything, claim a PC online, validate solver output, prove computed photoreal reality, or admit CanonState.'
 };
}

export function manifestR169(){return{schema:R169_SCHEMA,revision:R169_REVISION,laws:R169_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',attestationAuthority:'R168',visualWorldAuthority:'R136/R134'};}
