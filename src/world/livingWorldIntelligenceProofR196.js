import {R1901_EVENT} from './livingWorldProofMembraneR1901.js';

export const R196_REVISION='R196';
export const R196_SCHEMA='OMEGA_LIVING_WORLD_INTELLIGENCE_PROOF_R196';
export const R196_EVENT='omega-living-world-intelligence-proof-r196';
export const R195_INTELLIGENCE_EVENT='omega-intelligence-proof-r195';
export const R196_LAWS=Object.freeze([
 'R1901_REMAINS_CURRENT_WORLD_PROOF_MEMBRANE_AUTHORITY',
 'R195_INTELLIGENCE_STATUS_IS_PROJECTED_NOT_PROMOTED_TO_CANON',
 'CURRENT_HYBRID_PROOF_IS_REQUIRED_FOR_NATIVE_INTELLIGENCE_EXECUTION',
 'TRAIN_LOCAL_AVAILABILITY_IS_NOT_TRAINED_MODEL_WEIGHT_PROOF',
 'RETURNED_EXECUTION_IS_NOT_FACTUAL_TRUTH',
 'R141_EXACT_RETURN_PROOF_REMAINS_REQUIRED',
 'R146_R147_REMAIN_EXECUTION_AUTHORITIES',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'ADAPTIVE_VISUAL_COST_MAY_CHANGE_WITHOUT_CHANGING_TRUTH'
]);

const lane=(bridge,id)=>Array.isArray(bridge?.lanes)?bridge.lanes.find(x=>x?.id===id):null;
const acceptedMembrane=(x)=>x?.schema==='OMEGA_LIVING_WORLD_CURRENT_PROOF_MEMBRANE_R1901'&&x?.eventAccepted===true&&!!x?.worldId;
const acceptedBridge=(x)=>String(x?.schema||'').startsWith('OMEGA_AUTHENTICATED_INTELLIGENCE_BRIDGE_R195')&&Array.isArray(x?.lanes);

export function projectLivingWorldIntelligenceProofR196({membrane=null,intelligence=null}={}){
 if(!acceptedMembrane(membrane))return{schema:R196_SCHEMA,revision:R196_REVISION,eventAccepted:false,worldId:null,intelligenceState:'HOLD_WORLD_PROOF_REQUIRED',nextAction:null,dispatchAuthorized:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R196 cannot project intelligence status without an accepted R190.1 living-world proof membrane.'};
 const bridgeOk=acceptedBridge(intelligence);
 const hybrid=bridgeOk?lane(intelligence,'HYBRID'):null;
 const hosted=bridgeOk?lane(intelligence,'HOSTED_AI'):null;
 const sai=bridgeOk?lane(intelligence,'SAI'):null;
 const currentHybrid=intelligence?.hybridOnline===true&&hybrid?.state==='LIVE';
 const trainerAvailable=intelligence?.trainerAvailable===true&&sai?.state==='AVAILABLE';
 const hostedAvailable=hosted?.state==='AVAILABLE';
 const intelligenceState=!bridgeOk?'HOLD_INTELLIGENCE_PROOF_REFRESH_REQUIRED':currentHybrid&&trainerAvailable?'AUTHENTICATED_INTELLIGENCE_PATH_AVAILABLE':'BOUNDED_PROPOSAL_ONLY';
 const nextAction=!bridgeOk
  ?{domain:'INTELLIGENCE',route:'Intelligence Fabric',intent:'REFRESH_AUTHENTICATED_INTELLIGENCE_PROOF',operatorConfirmationRequired:true}
  :!currentHybrid
   ?{domain:'HYBRID',route:'Hybrid Link',intent:'ACQUIRE_CURRENT_DEVICE_PROOF',operatorConfirmationRequired:true}
   :!trainerAvailable
    ?{domain:'INTELLIGENCE',route:'Intelligence Fabric',intent:'RESOLVE_TRAIN_LOCAL_CAPABILITY',operatorConfirmationRequired:true}
    :membrane.nextAction;
 return{
  schema:R196_SCHEMA,revision:R196_REVISION,eventAccepted:true,sourceRevision:membrane.sourceRevision,
  worldId:membrane.worldId,operationRef:membrane.operationRef,scarCount:membrane.scarCount,
  adaptiveContext:{...(membrane.adaptiveContext||{}),truthInvariant:true},truthBands:{...(membrane.truthBands||{})},proof:{...(membrane.proof||{})},
  intelligence:{state:intelligenceState,bridgeRevision:intelligence?.revision||'UNOBSERVED',measuredAt:intelligence?.measuredAt||null,hybridOnline:currentHybrid,deviceCount:currentHybrid?Number(intelligence?.deviceCount||0):0,trainerAvailable,hostedAvailable,buildAvailable:intelligence?.buildAvailable===true,lanes:bridgeOk?intelligence.lanes.map(x=>({id:x.id,state:x.state,authority:x.authority})):[]},
  federation:{...(membrane.federation||{})},nextAction,missionIntent:'ASSEMBLE_INTENT_FROM_CURRENT_WORLD_AND_AUTHENTICATED_INTELLIGENCE_PROOF_ONLY',
  dispatchAuthorized:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  authority:{world:'R136/R134',currentProof:'R190.1',intelligenceProjection:'R195.1',execution:'R146/R147',exactReturnProof:'R141',admission:'R125'},
  laws:R196_LAWS,
  truthBoundary:'R196 only projects current R195.1 intelligence/Hybrid capability state into the accepted R190.1 living-world proof membrane. It does not prove model weights, native execution, solver validity, public deployment, federation closure, Earth truth, computed-photoreal reality, factual truth, or Canon admission.'
 };
}

export function installLivingWorldIntelligenceProofR196({onUpdate=null}={}){
 if(typeof window==='undefined')return()=>{};
 let membrane=null,intelligence=null,lastFingerprint='';
 const publish=()=>{
  const projection=projectLivingWorldIntelligenceProofR196({membrane,intelligence});
  if(!projection.eventAccepted)return;
  const fingerprint=JSON.stringify([projection.worldId,projection.operationRef,projection.scarCount,projection.intelligence,projection.proof,projection.nextAction]);
  if(fingerprint===lastFingerprint)return;
  lastFingerprint=fingerprint;
  try{localStorage.setItem('omega.r196.livingWorldIntelligenceProof',JSON.stringify(projection));}catch{}
  try{document.documentElement.dataset.omegaIntelligenceProof=projection.intelligence.state;}catch{}
  window.dispatchEvent(new CustomEvent(R196_EVENT,{detail:projection}));
  if(typeof onUpdate==='function')onUpdate(projection);
 };
 const receiveMembrane=(event)=>{membrane=event?.detail||null;publish()};
 const receiveIntelligence=(event)=>{intelligence=event?.detail||null;publish()};
 window.addEventListener(R1901_EVENT,receiveMembrane);
 window.addEventListener(R195_INTELLIGENCE_EVENT,receiveIntelligence);
 return()=>{window.removeEventListener(R1901_EVENT,receiveMembrane);window.removeEventListener(R195_INTELLIGENCE_EVENT,receiveIntelligence)};
}

export function manifestR196(){return{schema:R196_SCHEMA,revision:R196_REVISION,laws:R196_LAWS,inputAuthorities:['R190.1','R195.1'],visualWorldAuthority:'R136/R134',executionAuthority:'R146/R147',exactReturnProofAuthority:'R141',canonicalAdmissionAuthority:'R125',dispatchAuthorized:false,canonicalMutation:false};}
