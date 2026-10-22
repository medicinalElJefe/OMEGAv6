export const R178_REVISION='R178';
export const R178_SCHEMA='OMEGA_LIVING_WORLD_MISSION_CONTRACT_RESOLUTION_R178';
export const R178_LAWS=Object.freeze([
 'R177_OPERATOR_STAGED_MISSION_REQUIRED',
 'EVERY_SELECTED_STEP_MUST_RESOLVE_TO_EXISTING_R143_OPERATION_CONTRACT',
 'R143_ROUTE_CAPABILITY_EXECUTION_DOMAIN_REMAIN_AUTHORITATIVE',
 'CONTRACT_RESOLUTION_IS_NOT_EXECUTION_AUTHORIZATION',
 'UNAVAILABLE_OR_DISCOVERED_ROUTES_REMAIN_HELD',
 'PRESERVE_R136_R134_WORLD_AND_SCAR_CONTINUITY_REFERENCES',
 'PRESERVE_R125_AS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'NO_R146_TRANSITION_NO_R147_DISPATCH_NO_R162_AUTHORIZATION',
 'DO_NOT_INFER_PUBLIC_DEPLOYMENT_PC_ONLINE_SOLVER_VALIDITY_FEDERATION_CLOSURE_OR_COMPUTED_PHOTOREAL_REALITY'
]);

const DOMAIN_ROUTE=Object.freeze({
 FEDERATION:'Convergence',
 HYBRID:'Hybrid Link',
 EARTH:'Earth Now',
 RENDER:'Render Queue',
 MISSION:'Convergence'
});
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=stable(v[k]);return out}return v};
const text=(v,n=160)=>String(v??'').trim().slice(0,n);

function contractForRoute(contracts,route){return contracts.find(c=>c?.route===route)||null}

export function resolveLivingWorldMissionContractsR178(staged={},contracts=[]){
 const stagedOk=staged?.revision==='R177'&&staged?.accepted===true&&staged?.state==='OPERATOR_STAGED_NOT_AUTHORIZED'&&staged?.staging?.operatorStaged===true&&staged?.dispatchAuthorized===false&&staged?.executionInvoked===false;
 if(!stagedOk)return{schema:R178_SCHEMA,revision:R178_REVISION,accepted:false,state:'R177_OPERATOR_STAGED_MISSION_REQUIRED',dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',resolvedSteps:[]};
 const authoritative=Array.isArray(contracts)?contracts.filter(c=>c?.schema==='OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'&&c?.revision==='R143'):[];
 const steps=Array.isArray(staged?.mission?.steps)?staged.mission.steps:[];
 const resolvedSteps=steps.map((step,index)=>{
  const domain=text(step?.domain,40).toUpperCase();
  const route=DOMAIN_ROUTE[domain]||null;
  const contract=route?contractForRoute(authoritative,route):null;
  const contractState=contract?.state||'UNRESOLVED';
  const readiness=!contract?'HOLD_NO_R143_CONTRACT':contractState==='AVAILABLE'?'CONTRACT_RESOLVED_NOT_AUTHORIZED':`HOLD_ROUTE_${contractState}`;
  return{index,domain,action:text(step?.action,120),reason:text(step?.reason,160),route,readiness,contract:contract?stable(contract):null};
 });
 const unresolved=resolvedSteps.filter(x=>!x.contract);
 const held=resolvedSteps.filter(x=>x.readiness!=='CONTRACT_RESOLVED_NOT_AUTHORIZED');
 return{
  schema:R178_SCHEMA,revision:R178_REVISION,accepted:true,
  state:unresolved.length?'HELD_UNRESOLVED_CONTRACT':held.length?'CONTRACTS_RESOLVED_WITH_ROUTE_HOLDS':'CONTRACTS_RESOLVED_NOT_AUTHORIZED',
  worldId:staged.worldId||'OMEGA_CANONICAL_WORLD',sourceOperationRef:stable(staged.sourceOperationRef||null),scarCount:Number(staged.scarCount)||0,adaptiveContext:stable(staged.adaptiveContext||null),
  sourceMissionId:staged?.mission?.missionId||null,resolvedSteps,unresolvedCount:unresolved.length,heldCount:held.length,
  dispatchAuthorized:false,executionInvoked:false,authorizationRequired:true,canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  claims:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:false},
  nextAuthority:unresolved.length?'OPERATOR_REVIEW_CONTRACT_GAP':'EXPLICIT_GOVERNED_EXECUTION_AUTHORIZATION',
  truthBoundary:'R178 resolves an operator-staged R177 living-world mission onto existing R143 route/capability/execution-domain contracts. Resolution does not authorize R146, dispatch R147, invoke Hybrid/federation/solver/render execution, prove returned evidence, or admit CanonState.'
 };
}

export function manifestR178(){return{schema:R178_SCHEMA,revision:R178_REVISION,laws:R178_LAWS,inputAuthority:'R177',operationContractAuthority:'R143',visualWorldAuthority:'R136/R134',executionAuthorities:['R146','R147','R162'],canonicalAdmissionAuthority:'R125',dispatchAuthorized:false};}
