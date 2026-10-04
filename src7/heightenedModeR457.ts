import {OMEGA7_CAPABILITIES,type Omega7Capability,type Omega7Depth} from './capabilityRegistry';
import {OMEGA7_FAMILY_CONTRACTS,omega7FamilyForRoute,type Omega7NativeFamily} from './familyParityR452';
import {acceptedParityForRoute} from './parityLedgerR453';
import {routeLayerOutputR111,type OmegaLayerR111} from '../src/capability/routeLayerOutputRegistryR111';
import {capabilityExecutionContract} from '../src/operationalCapabilityRuntimeR45';

export const R457_SCHEMA='OMEGA7_HEIGHTENED_COMPOSITION_R457' as const;

export type HeightenedCapabilityContractR457={
 capabilityId:string;
 legacyRoute:string;
 family:Omega7NativeFamily;
 capability:{
  label:string;
  purpose:string;
  reality:string;
  executionInput:string;
  executionOutput:string;
  executionProof:string;
  primaryLayer:OmegaLayerR111;
  layers:readonly OmegaLayerR111[];
  evidenceClass:string;
 };
 composition:{
  family:Omega7NativeFamily;
  representativeRoute:string;
  failureProof:string;
  performanceProof:string;
  rollbackProof:string;
  sourceBoundary:string;
  futureRetention:'PRESERVE_CAPABILITY';
  pruneAuthority:'EXPLICIT_PARITY_AND_REPLACEMENT_PROOF_REQUIRED';
 };
 presentation:{
  humanDomain:string;
  standardLabel:string;
  primaryAction:string;
  depthPolicy:'STANDARD_FIRST_ADVANCED_CANON_ON_DEMAND';
  authority:'PRESENTATION_ONLY';
 };
 accepted:{
  fullProductParity:true;
  rollbackAvailable:true;
  legacyRetired:false;
  canonicalMutation:false;
 };
};

function contractFor(cap:Omega7Capability):HeightenedCapabilityContractR457{
 const family=omega7FamilyForRoute(cap.legacyRoute);
 if(!family)throw new Error('R457 missing family for '+cap.legacyRoute);
 const parity=acceptedParityForRoute(cap.legacyRoute);
 if(!parity||parity.parityLevel!=='FULL_PRODUCT_PARITY')throw new Error('R457 requires accepted R453 parity for '+cap.legacyRoute);
 const layer=routeLayerOutputR111(cap.legacyRoute);
 const execution=capabilityExecutionContract(cap.legacyRoute);
 return{
  capabilityId:cap.id,
  legacyRoute:cap.legacyRoute,
  family:family.id,
  capability:{
   label:cap.label,
   purpose:cap.description,
   reality:execution.reality,
   executionInput:execution.input,
   executionOutput:execution.output,
   executionProof:execution.proof,
   primaryLayer:layer.primary,
   layers:layer.layers,
   evidenceClass:layer.evidenceClass
  },
  composition:{
   family:family.id,
   representativeRoute:family.representativeRoute,
   failureProof:family.failureProof,
   performanceProof:family.performanceProof,
   rollbackProof:family.rollbackProof,
   sourceBoundary:cap.sourceBoundary,
   futureRetention:'PRESERVE_CAPABILITY',
   pruneAuthority:'EXPLICIT_PARITY_AND_REPLACEMENT_PROOF_REQUIRED'
  },
  presentation:{
   humanDomain:cap.domain,
   standardLabel:cap.label,
   primaryAction:cap.primaryAction,
   depthPolicy:'STANDARD_FIRST_ADVANCED_CANON_ON_DEMAND',
   authority:'PRESENTATION_ONLY'
  },
  accepted:{
   fullProductParity:true,
   rollbackAvailable:true,
   legacyRetired:false,
   canonicalMutation:false
  }
 };
}

export const OMEGA7_HEIGHTENED_CAPABILITIES:readonly HeightenedCapabilityContractR457[]=OMEGA7_CAPABILITIES.map(contractFor);

export const OMEGA7_HEIGHTENED_BY_ROUTE=new Map(OMEGA7_HEIGHTENED_CAPABILITIES.map(x=>[x.legacyRoute,x]));

export type HeightenedCompositionPlanR457={
 schema:typeof R457_SCHEMA;
 requestedRoutes:readonly string[];
 resolvedRoutes:readonly string[];
 families:readonly Omega7NativeFamily[];
 layers:readonly OmegaLayerR111[];
 proofAuthorities:readonly string[];
 retainedFutureRoutes:readonly string[];
 presentationDepth:Omega7Depth;
 canonicalMutation:false;
 legacyRetirementAllowed:false;
 status:'READY'|'HELD';
 reasons:readonly string[];
};

export function composeHeightenedR457(routes:readonly string[],presentationDepth:Omega7Depth='STANDARD'):HeightenedCompositionPlanR457{
 const reasons:string[]=[];
 const unique=[...new Set(routes)];
 const resolved:HeightenedCapabilityContractR457[]=[];
 for(const route of unique){
  const contract=OMEGA7_HEIGHTENED_BY_ROUTE.get(route);
  if(!contract){reasons.push('UNKNOWN_ROUTE:'+route);continue}
  resolved.push(contract);
 }
 const familySet=new Set<Omega7NativeFamily>(resolved.map(x=>x.family));
 const layerSet=new Set<OmegaLayerR111>();
 const proofSet=new Set<string>();
 for(const row of resolved){
  for(const layer of row.capability.layers)layerSet.add(layer);
  proofSet.add(row.capability.executionProof);
  proofSet.add(row.composition.failureProof);
  proofSet.add(row.composition.performanceProof);
  proofSet.add(row.composition.rollbackProof);
 }
 const retainedFutureRoutes=OMEGA7_HEIGHTENED_CAPABILITIES
  .filter(row=>familySet.has(row.family)&&!unique.includes(row.legacyRoute))
  .map(row=>row.legacyRoute);
 if(!resolved.length)reasons.push('NO_ADMISSIBLE_CAPABILITY');
 return{
  schema:R457_SCHEMA,
  requestedRoutes:unique,
  resolvedRoutes:resolved.map(x=>x.legacyRoute),
  families:[...familySet],
  layers:[...layerSet],
  proofAuthorities:[...proofSet],
  retainedFutureRoutes,
  presentationDepth,
  canonicalMutation:false,
  legacyRetirementAllowed:false,
  status:reasons.length?'HELD':'READY',
  reasons
 };
}

export type HeightenedRetirementRequestR457={
 legacyRoute:string;
 replacementRoutes:readonly string[];
 explicitReplacementProof:boolean;
 rollbackStillAvailable:boolean;
};

export type HeightenedRetirementDecisionR457={
 schema:typeof R457_SCHEMA;
 legacyRoute:string;
 decision:'HOLD';
 reasons:readonly string[];
 futureTopologyPreserved:boolean;
 canonicalMutation:false;
};

export function evaluateRetirementR457(request:HeightenedRetirementRequestR457):HeightenedRetirementDecisionR457{
 const current=OMEGA7_HEIGHTENED_BY_ROUTE.get(request.legacyRoute);
 const reasons:string[]=[];
 if(!current)reasons.push('UNKNOWN_CAPABILITY');
 if(!request.explicitReplacementProof)reasons.push('REPLACEMENT_PROOF_REQUIRED');
 if(!request.rollbackStillAvailable)reasons.push('ROLLBACK_REQUIRED');
 if(!request.replacementRoutes.length)reasons.push('REPLACEMENT_ROUTE_REQUIRED');
 for(const replacement of request.replacementRoutes)if(!OMEGA7_HEIGHTENED_BY_ROUTE.has(replacement))reasons.push('UNKNOWN_REPLACEMENT:'+replacement);
 if(current)reasons.push('R457_DOES_NOT_RETIRE_ACCEPTED_CAPABILITIES');
 return{
  schema:R457_SCHEMA,
  legacyRoute:request.legacyRoute,
  decision:'HOLD',
  reasons,
  futureTopologyPreserved:true,
  canonicalMutation:false
 };
}

export const OMEGA7_HEIGHTENED_SUMMARY=Object.freeze({
 schema:R457_SCHEMA,
 capabilityCount:OMEGA7_HEIGHTENED_CAPABILITIES.length,
 familyCount:OMEGA7_FAMILY_CONTRACTS.length,
 presentationDomains:new Set(OMEGA7_CAPABILITIES.map(x=>x.domain)).size,
 fullProductParity:OMEGA7_HEIGHTENED_CAPABILITIES.filter(x=>x.accepted.fullProductParity).length,
 rollbackAvailable:OMEGA7_HEIGHTENED_CAPABILITIES.filter(x=>x.accepted.rollbackAvailable).length,
 legacyRetired:0,
 capabilityCompositionPresentationSeparated:true,
 contradictionAndScarPolicy:'RETAIN_DO_NOT_NORMALIZE_AWAY',
 futureTopologyPolicy:'PRESERVE_CAPABILITY_UNTIL_EXPLICIT_REPLACEMENT_PROOF',
 noNewPhysicalPrimitive:true,
 physicalDimensionClaim:false,
 canonicalMutation:false
});
