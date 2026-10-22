import {OMEGA7_CAPABILITIES} from './capabilityRegistry';
import {omega7FamilyForRoute,type Omega7NativeFamily} from './familyParityR452';

export const R453_SCHEMA='OMEGA7_ACCEPTED_PARITY_RECEIPTS_R453' as const;

export const R453_ACCEPTED_RECEIPTS=Object.freeze({
 schema:R453_SCHEMA,
 candidateHead:'e9084f885b7fd3b76273a54111e1d8d0e5e182fd',
 mergeCommit:'e2ed41ae1712a6f279cfc9862383357360a146ec',
 cloudBridgeRun:37179533741,
 cloudBridgeParityJob:111369323993,
 archiveConvergenceRun:37179533744,
 releaseControllerRun:37179533733,
 operationalSourceRun:37179533748,
 hybridCommandRun:37179533735,
 wovenHybridRun:37179533754,
 currentConvergenceRun:37179533745,
 cloudflareEvolutionRun:37179533763,
 rcwaRun:37179533760,
 interactionProof:'R446_44_ROUTE_DESKTOP_MOBILE_BROWSER_PROOF',
 familyFailureProof:'R452_8_OF_8_LAZY_FAMILY_BOUNDARY_FAILURE_ISOLATION',
 routePerformanceProof:'R452_44_ROUTE_BUILT_PRODUCT_PERFORMANCE',
 rollbackProof:'R449_DESKTOP_AND_PHONE_REVERSIBILITY',
 routeBudgetMs:8000,
 p95BudgetMs:6000,
 measuredP95Ms:415,
 measuredMaxRouteMs:475,
 canonicalMutation:false
});

const ROUTE_SPECIFIC_FAILURE_RECOVERY=new Map<string,string>([
 ['Workspace','R447_LAZY_CHUNK_FAILURE_ISOLATION'],
 ['Earth Now','R447_POST_FAILURE_ALTERNATE_ROUTE_RECOVERY'],
 ['Hybrid Link','R447_API_LOSS_FAIL_CLOSED']
]);

export type Omega7AcceptedParityLevel='FULL_PRODUCT_PARITY';
export type Omega7AcceptedParityRow={
 capabilityId:string;
 legacyRoute:string;
 family:Omega7NativeFamily;
 functionalDesktopMobileProved:true;
 familyFailureIsolationProved:true;
 routeSpecificFailureRecoveryProved:boolean;
 routeSpecificFailureRecoveryClass:string|null;
 fullRoutePerformanceProved:true;
 rollbackEnvelopeProved:true;
 parityLevel:Omega7AcceptedParityLevel;
 legacyRetired:false;
 proofAuthority:{
  interaction:'R446_OMEGA_CLOUD_BRIDGE';
  familyFailure:'R452_OMEGA_CLOUD_BRIDGE';
  performance:'R452_OMEGA_CLOUD_BRIDGE';
  rollback:'R449_OMEGA_CLOUD_BRIDGE';
 };
 canonicalMutation:false;
};

export const OMEGA7_ACCEPTED_PARITY_EVIDENCE:readonly Omega7AcceptedParityRow[]=OMEGA7_CAPABILITIES.map(cap=>{
 const family=omega7FamilyForRoute(cap.legacyRoute);
 if(!family)throw new Error('R453 missing accepted family mapping for '+cap.legacyRoute);
 const routeFailure=ROUTE_SPECIFIC_FAILURE_RECOVERY.get(cap.legacyRoute)||null;
 return{
  capabilityId:cap.id,
  legacyRoute:cap.legacyRoute,
  family:family.id,
  functionalDesktopMobileProved:true,
  familyFailureIsolationProved:true,
  routeSpecificFailureRecoveryProved:Boolean(routeFailure),
  routeSpecificFailureRecoveryClass:routeFailure,
  fullRoutePerformanceProved:true,
  rollbackEnvelopeProved:true,
  parityLevel:'FULL_PRODUCT_PARITY',
  legacyRetired:false,
  proofAuthority:{
   interaction:'R446_OMEGA_CLOUD_BRIDGE',
   familyFailure:'R452_OMEGA_CLOUD_BRIDGE',
   performance:'R452_OMEGA_CLOUD_BRIDGE',
   rollback:'R449_OMEGA_CLOUD_BRIDGE'
  },
  canonicalMutation:false
 } as const;
});

const count=(fn:(row:Omega7AcceptedParityRow)=>boolean)=>OMEGA7_ACCEPTED_PARITY_EVIDENCE.filter(fn).length;
export const OMEGA7_ACCEPTED_PARITY_SUMMARY=Object.freeze({
 schema:R453_SCHEMA,
 total:OMEGA7_ACCEPTED_PARITY_EVIDENCE.length,
 functionalDesktopMobile:count(()=>true),
 familyFailureIsolation:count(x=>x.familyFailureIsolationProved),
 routeSpecificFailureRecovery:count(x=>x.routeSpecificFailureRecoveryProved),
 performance:count(x=>x.fullRoutePerformanceProved),
 rollback:count(x=>x.rollbackEnvelopeProved),
 fullProductParity:count(x=>x.parityLevel==='FULL_PRODUCT_PARITY'),
 legacyRetired:count(x=>x.legacyRetired),
 canonicalMutation:false,
 truthBoundary:'R452 proves one injected lazy-boundary failure per native family and built-product performance for all 44 routes. It does not claim every provider/device/domain-specific failure mode was individually synthesized for every route.'
});

export function acceptedParityForRoute(route:string){
 return OMEGA7_ACCEPTED_PARITY_EVIDENCE.find(x=>x.legacyRoute===route)||null;
}
