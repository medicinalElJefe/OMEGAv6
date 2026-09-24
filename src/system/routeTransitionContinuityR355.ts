import{OMEGA_NAVIGATION}from'../navigationRegistry';
import{CAPABILITY_BY_NAME,capabilityReality}from'../capabilityAuthority';
import{operationContractForRouteR143}from'../authoritativeOperationChainR143';
import{normalizeRouteIdentityR242}from'../navigationLemmaCalculusR242.js';

export const R355_ROUTE_TRANSITION_SCHEMA='OMEGA_ROUTE_TRANSITION_CONTINUITY_R355' as const;
export const R355_ROUTE_TRANSITION_OPERATOR='PARTITION → EXACT-IDENTITY TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/COMMIT' as const;
export const R355_ROUTE_TRANSITION_LAWS=[
 'EXACT_ROUTE_IDENTITY_PRECEDES_NAVIGATION',
 'ONE_TARGET_ROUTE_ONE_CAPABILITY_ONE_OPERATION_CONTRACT',
 'CURRENT_ROUTE_IS_CARRIED_AS_PARENT_CONTEXT',
 'UNRESOLVED_OR_DUPLICATE_ROUTE_IS_ESCALATED_NOT_GUESSED',
 'DONOR_OR_RESTORATION_DEBT_ROUTE_IS_HELD_NOT_IMPERSONATED',
 'ROUTE_TRANSITION_DOES_NOT_MUTATE_CANONSTATE',
 'TRANSITION_RECEIPT_CARRIES_ROUTE_CAPABILITY_EXECUTION_AND_RESIDUAL_STATE'
]as const;

export type RouteTransitionDecisionR355='STAY'|'TURN'|'ESCALATE';
export type RouteTransitionReceiptR355={
 schema:typeof R355_ROUTE_TRANSITION_SCHEMA;
 operator:typeof R355_ROUTE_TRANSITION_OPERATOR;
 from:string;
 target:string;
 fromIdentity:string;
 targetIdentity:string;
 decision:RouteTransitionDecisionR355;
 capabilityReality:string;
 routeId:string|null;
 capabilityId:string|null;
 executionDomain:string|null;
 invariantCarry:{from:string;target:string;targetIdentity:string;canonicalMutation:false};
 residuals:string[];
 structuralPass:boolean;
 canonicalMutation:false;
 boundary:string;
};

export function compileRouteTransitionR355(from:string,target:string):RouteTransitionReceiptR355{
 const fromName=String(from||'').trim(),targetName=String(target||'').trim();
 const fromIdentity=normalizeRouteIdentityR242(fromName),targetIdentity=normalizeRouteIdentityR242(targetName);
 const matches=OMEGA_NAVIGATION.filter(x=>normalizeRouteIdentityR242(x.name)===targetIdentity);
 const residuals:string[]=[];
 if(!targetIdentity)residuals.push('EMPTY_TARGET_IDENTITY');
 if(matches.length===0)residuals.push('UNREGISTERED_TARGET');
 if(matches.length>1)residuals.push('DUPLICATE_TARGET_IDENTITY');
 const capability=matches.length===1?CAPABILITY_BY_NAME.get(matches[0].name):null;
 if(matches.length===1&&!capability)residuals.push('CAPABILITY_AUTHORITY_MISSING');
 const reality=capability?capabilityReality(capability.name):'UNRESOLVED';
 if(['DONOR_ONLY','RESTORATION_DEBT'].includes(reality))residuals.push(`TARGET_NOT_CURRENTLY_ROUTABLE:${reality}`);
 let operation:any=null;
 if(matches.length===1&&capability){
  try{operation=operationContractForRouteR143(matches[0].name)}catch{residuals.push('OPERATION_CONTRACT_MISSING')}
 }
 const structuralPass=residuals.length===0;
 const decision:RouteTransitionDecisionR355=!structuralPass?'ESCALATE':fromIdentity===targetIdentity?'STAY':'TURN';
 const resolved=matches.length===1?matches[0].name:targetName;
 return{
  schema:R355_ROUTE_TRANSITION_SCHEMA,operator:R355_ROUTE_TRANSITION_OPERATOR,
  from:fromName,target:resolved,fromIdentity,targetIdentity,decision,capabilityReality:reality,
  routeId:operation?.routeId||null,capabilityId:operation?.capabilityId||null,executionDomain:operation?.executionDomain||null,
  invariantCarry:{from:fromName,target:resolved,targetIdentity,canonicalMutation:false},
  residuals,structuralPass,canonicalMutation:false,
  boundary:'R355 route-transition calculus is a deterministic software/navigation receipt. It preserves exact route identity, capability/operation binding and unresolved residuals; it does not execute the destination, prove external/device work, or mutate CanonState.'
 };
}
