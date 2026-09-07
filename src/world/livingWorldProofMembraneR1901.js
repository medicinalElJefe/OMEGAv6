import {R173_EVENT} from './federationLedgerWorldObserverR173.js';
import {R175_R140_EVENT,projectMultiDomainLivingWorldTruthR175} from './multiDomainLivingWorldTruthR175.js';

export const R1901_REVISION='R190.1';
export const R1901_SCHEMA='OMEGA_LIVING_WORLD_CURRENT_PROOF_MEMBRANE_R1901';
export const R1901_EVENT='omega-living-world-current-proof-r1901';
export const R1901_LAWS=Object.freeze([
 'PROJECT_EXISTING_R175_TRUTH_WITHOUT_CREATING_EVIDENCE_OR_WORLD_AUTHORITY',
 'R136_R134_REMAIN_VISUAL_WORLD_AND_SCAR_CONTINUITY_AUTHORITIES',
 'ADAPTIVE_LOD_AND_SAMPLE_BUDGET_CHANGE_COST_NOT_TRUTH',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'PC_ONLINE_REQUIRES_CURRENT_HYBRID_EXECUTION_PROOF',
 'FEDERATION_CLOSURE_REQUIRES_EXISTING_RECEIPT_CHAIN_PROOF',
 'EARTH_TRUTH_REQUIRES_EXISTING_OBSERVED_EVIDENCE',
 'SOLVER_VALIDITY_REQUIRES_SEPARATE_DIRECT_SOLVER_PROOF',
 'COMPUTED_PHOTOREAL_REALITY_REQUIRES_DIRECT_RENDER_PROOF',
 'DEPLOYMENT_REQUIRES_SEPARATE_DIRECT_DEPLOYMENT_PROOF',
 'NEXT_ACTION_IS_OPERATOR_INTENT_ONLY_NOT_DISPATCH_AUTHORIZATION'
]);

const held=(state)=>String(state||'').startsWith('HOLD_');
const meaningful=(state)=>!['','NONE','UNPROVED','DEVICE_PROOF_REQUIRED'].includes(String(state||''));

export function projectLivingWorldProofMembraneR1901(detail={}){
 const world=projectMultiDomainLivingWorldTruthR175(detail);
 if(!world.eventAccepted)return{schema:R1901_SCHEMA,revision:R1901_REVISION,eventAccepted:false,sourceRevision:world.sourceRevision||'NONE',worldId:null,proof:{},nextAction:null,dispatchAuthorized:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'Rejected events cannot create current proof.'};
 const proof={
  hybrid:world.claims?.pcOnlineProved===true?'CURRENT_DEVICE_PROOF_PRESENT':'HOLD_DEVICE_PROOF_REQUIRED',
  earth:meaningful(world.truthBands?.earth)?'OBSERVED_EVIDENCE_PRESENT':'HOLD_VERIFIED_EARTH_EVIDENCE_REQUIRED',
  federation:world.claims?.federationClosedProved===true?'RECEIPT_CHAIN_CLOSED':'HOLD_FEDERATION_RECEIPT_CHAIN_INCOMPLETE',
  render:world.claims?.computedPhotorealRealityProved===true?'DIRECT_RENDER_PROOF_PRESENT':'HOLD_COMPUTED_REALITY_PROOF_REQUIRED',
  solver:world.claims?.solverValidityProved===true?'DIRECT_SOLVER_PROOF_PRESENT':'HOLD_DIRECT_SOLVER_PROOF_REQUIRED',
  deployment:world.claims?.publicDeploymentProved===true?'DIRECT_DEPLOYMENT_PROOF_PRESENT':'HOLD_DIRECT_DEPLOYMENT_PROOF_REQUIRED'
 };
 const priority=[
  ['hybrid','Hybrid Link','ACQUIRE_CURRENT_DEVICE_PROOF'],
  ['earth','Earth Now','ACQUIRE_VERIFIED_EARTH_EVIDENCE'],
  ['federation','Convergence',world.nextFederationStage?`ADVANCE_${world.nextFederationStage}`:'COMPLETE_FEDERATION_RECEIPT_CHAIN'],
  ['render','Visual Instrument','ACQUIRE_DIRECT_RENDER_PROOF'],
  ['solver','Evidence & Proof','ACQUIRE_DIRECT_SOLVER_PROOF'],
  ['deployment','Evidence & Proof','ACQUIRE_DIRECT_DEPLOYMENT_PROOF']
 ];
 const next=priority.find(([domain])=>held(proof[domain]));
 return{
  schema:R1901_SCHEMA,revision:R1901_REVISION,eventAccepted:true,sourceRevision:world.sourceRevision,
  worldId:world.worldId,operationRef:world.operationRef,scarCount:world.scarCount,
  adaptiveContext:{lod:world.lod,sampleBudget:world.sampleBudget,truthInvariant:true},
  truthBands:{...world.truthBands},activeDomains:[...(world.activeDomains||[])],
  federation:{stage:world.federationStage,nextStage:world.nextFederationStage,routingTarget:world.routingTarget,closed:world.federationClosed===true},
  proof,
  nextAction:next?{domain:next[0].toUpperCase(),route:next[1],intent:next[2],operatorConfirmationRequired:true}:null,
  missionIntent:'REVIEW_CURRENT_PROOF_AND_ADVANCE_ONLY_FROM_EXISTING_EVIDENCE',
  dispatchAuthorized:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  authority:{world:'R136/R134',truthProjection:'R175',execution:'R146/R147',admission:'R125'},
  truthBoundary:'R190.1 is a read-only current-proof membrane over accepted R175 world truth. It cannot prove deployment, PC-online state, solver validity, federation closure, Earth truth, or computed-photoreal reality beyond direct evidence already accepted by the inherited domain authorities.'
 };
}

export function installLivingWorldProofMembraneR1901({onUpdate=null}={}){
 if(typeof window==='undefined')return()=>{};
 const receive=(event)=>{
  const membrane=projectLivingWorldProofMembraneR1901(event?.detail||{});
  if(!membrane.eventAccepted)return;
  try{localStorage.setItem('omega.r1901.currentProofMembrane',JSON.stringify(membrane));}catch{}
  try{document.documentElement.dataset.omegaCurrentProof=membrane.nextAction?.domain||'PROOF_COMPLETE';}catch{}
  window.dispatchEvent(new CustomEvent(R1901_EVENT,{detail:membrane}));
  if(typeof onUpdate==='function')onUpdate(membrane);
 };
 window.addEventListener(R173_EVENT,receive);
 window.addEventListener(R175_R140_EVENT,receive);
 return()=>{window.removeEventListener(R173_EVENT,receive);window.removeEventListener(R175_R140_EVENT,receive)};
}

export function manifestR1901(){return{schema:R1901_SCHEMA,revision:R1901_REVISION,laws:R1901_LAWS,inputAuthorities:['R140','R173'],truthProjectionAuthority:'R175',visualWorldAuthority:'R136/R134',executionAuthority:'R146/R147',canonicalAdmissionAuthority:'R125',dispatchAuthorized:false,canonicalMutation:false};}
