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


export const R457_DEVELOPMENTAL_SEQUENCE=Object.freeze([
 'CANONICAL_STATE',
 'NORMALIZED_RELATIONAL_DIFFERENCE',
 'GROWTH_VECTOR',
 'GROWTH_TRANSPORT',
 'DEVELOPMENTAL_ACCELERATION',
 'DEVELOPMENTAL_JERK',
 'ORDER_SENSITIVITY',
 'DEVELOPMENTAL_CURVATURE',
 'DEVELOPMENTAL_SCAR',
 'CONTINUITY_CONE',
 'RECOVERABILITY',
 'VIABILITY',
 'GOVERNANCE_PROMOTION',
 'GROWTH_LAW_UPDATE'
] as const);

export const R457_DEWEY_KERNEL=Object.freeze({
 workflow:'SENSE_NORMALIZE_SCORE_GATE_ACT_LEDGER',
 decisionLaw:'STAY_TURN_ESCALATE',
 score:'S=(CΩ·Φ)/(q+Λ+ε)',
 pruneLaw:'PRUNE_TRANSLATE_PROVE',
 scarLaw:'RETAIN_NEGATIVE_KNOWLEDGE',
 authorityLaw:'PROOF_AND_AUTHORITY_BEFORE_PROMOTION',
 physicalPrimitiveClaim:false
});

export type HeightenedDevelopmentalMetricsR457={
 continuity:number;
 futurePlasticity:number;
 contradiction:number;
 burden:number;
 recoverability:number;
 proofCoverage:number;
 capabilityCoverage:number;
 humanComprehension:number;
 futureTopologyRetention:number;
 scarPressure:number;
};

export type HeightenedDevelopmentalVectorR457={
 continuity:number;
 futurePlasticity:number;
 contradiction:number;
 burden:number;
 recoverability:number;
 proofCoverage:number;
 capabilityCoverage:number;
 humanComprehension:number;
 futureTopologyRetention:number;
 scarPressure:number;
};

export type HeightenedDevelopmentalEvidenceR457={
 parentStateRef:string;
 candidateStateRef:string;
 sourceHead:string;
 metricRefs:Partial<Record<keyof HeightenedDevelopmentalMetricsR457,string>>;
 proofRefs:readonly string[];
};

export type HeightenedDevelopmentalTransitionInputR457={
 parent:HeightenedDevelopmentalMetricsR457;
 candidate:HeightenedDevelopmentalMetricsR457;
 previousGrowth?:Partial<HeightenedDevelopmentalVectorR457>;
 previousAcceleration?:Partial<HeightenedDevelopmentalVectorR457>;
 authorityClosed:boolean;
 proofSurvives:boolean;
 rollbackAvailable:boolean;
 dependencyOrderPreserved:boolean;
 canonicalMutation?:boolean;
 evidence:HeightenedDevelopmentalEvidenceR457;
};

export const R457_AUTHORITATIVE_PROOF_FAMILIES=Object.freeze([
 'R210 Release Controller',
 'R223 Cloudflare Evolution Authority',
 'R202 Operational Source Authority',
 'OMEGA Cloud Bridge CI',
 'R170 Current Convergence',
 'OMEGA R237 Hybrid Command Authority Proof',
 'OMEGA R238 Woven Hybrid Continuity Convergence',
 'R241 Archive Convergence Visual Intelligence'
] as const);

const R457_EPSILON=1e-9;
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const normalizeDevelopmentalMetricsR457=(row:HeightenedDevelopmentalMetricsR457):HeightenedDevelopmentalMetricsR457=>({
 continuity:clamp01(row.continuity),
 futurePlasticity:clamp01(row.futurePlasticity),
 contradiction:clamp01(row.contradiction),
 burden:clamp01(row.burden),
 recoverability:clamp01(row.recoverability),
 proofCoverage:clamp01(row.proofCoverage),
 capabilityCoverage:clamp01(row.capabilityCoverage),
 humanComprehension:clamp01(row.humanComprehension),
 futureTopologyRetention:clamp01(row.futureTopologyRetention),
 scarPressure:clamp01(row.scarPressure)
});
const zeroDevelopmentalVectorR457=():HeightenedDevelopmentalVectorR457=>({continuity:0,futurePlasticity:0,contradiction:0,burden:0,recoverability:0,proofCoverage:0,capabilityCoverage:0,humanComprehension:0,futureTopologyRetention:0,scarPressure:0});
const vectorFromPartialR457=(row?:Partial<HeightenedDevelopmentalVectorR457>):HeightenedDevelopmentalVectorR457=>({...zeroDevelopmentalVectorR457(),...(row||{})});
const mapVectorR457=(a:HeightenedDevelopmentalVectorR457,b:HeightenedDevelopmentalVectorR457,fn:(x:number,y:number)=>number):HeightenedDevelopmentalVectorR457=>({
 continuity:fn(a.continuity,b.continuity),futurePlasticity:fn(a.futurePlasticity,b.futurePlasticity),contradiction:fn(a.contradiction,b.contradiction),burden:fn(a.burden,b.burden),recoverability:fn(a.recoverability,b.recoverability),proofCoverage:fn(a.proofCoverage,b.proofCoverage),capabilityCoverage:fn(a.capabilityCoverage,b.capabilityCoverage),humanComprehension:fn(a.humanComprehension,b.humanComprehension),futureTopologyRetention:fn(a.futureTopologyRetention,b.futureTopologyRetention),scarPressure:fn(a.scarPressure,b.scarPressure)
});
const vectorNormR457=(row:HeightenedDevelopmentalVectorR457)=>Math.sqrt(Object.values(row).reduce((sum,value)=>sum+value*value,0));
const deweyScoreR457=(row:HeightenedDevelopmentalMetricsR457)=>(row.continuity*row.futurePlasticity)/(row.contradiction+row.burden+R457_EPSILON);

export function evaluateDevelopmentalTransitionR457(input:HeightenedDevelopmentalTransitionInputR457){
 const parent=normalizeDevelopmentalMetricsR457(input.parent),candidate=normalizeDevelopmentalMetricsR457(input.candidate);
 const relationalDifference:HeightenedDevelopmentalVectorR457={
  continuity:candidate.continuity-parent.continuity,
  futurePlasticity:candidate.futurePlasticity-parent.futurePlasticity,
  contradiction:candidate.contradiction-parent.contradiction,
  burden:candidate.burden-parent.burden,
  recoverability:candidate.recoverability-parent.recoverability,
  proofCoverage:candidate.proofCoverage-parent.proofCoverage,
  capabilityCoverage:candidate.capabilityCoverage-parent.capabilityCoverage,
  humanComprehension:candidate.humanComprehension-parent.humanComprehension,
  futureTopologyRetention:candidate.futureTopologyRetention-parent.futureTopologyRetention,
  scarPressure:candidate.scarPressure-parent.scarPressure
 };
 const growthVector:HeightenedDevelopmentalVectorR457={
  ...relationalDifference,
  contradiction:-relationalDifference.contradiction,
  burden:-relationalDifference.burden,
  scarPressure:-relationalDifference.scarPressure
 };
 const transportedGrowth={frame:'NORMALIZED_SOFTWARE_ACCEPTANCE_R457' as const,vector:growthVector,invariantCarry:['CAPABILITY_IDENTITY','PROOF_AUTHORITY','R125_ADMISSION','ROLLBACK','SCAR_HISTORY'] as const};
 const previousGrowth=vectorFromPartialR457(input.previousGrowth),previousAcceleration=vectorFromPartialR457(input.previousAcceleration);
 const acceleration=mapVectorR457(growthVector,previousGrowth,(x,y)=>x-y);
 const jerk=mapVectorR457(acceleration,previousAcceleration,(x,y)=>x-y);
 const parentScore=deweyScoreR457(parent),candidateScore=deweyScoreR457(candidate);
 const metricKeys=(Object.keys(parent) as (keyof HeightenedDevelopmentalMetricsR457)[]);
 const missingMetricEvidence=metricKeys.filter(key=>!String(input.evidence?.metricRefs?.[key]||'').trim());
 const parentStateRef=String(input.evidence?.parentStateRef||'').trim();
 const candidateStateRef=String(input.evidence?.candidateStateRef||'').trim();
 const sourceHead=String(input.evidence?.sourceHead||'').trim();
 const proofRefs=Array.isArray(input.evidence?.proofRefs)?input.evidence.proofRefs.map(String).map(x=>x.trim()).filter(Boolean):[];
 const missingAuthoritativeProofs=R457_AUTHORITATIVE_PROOF_FAMILIES.filter(name=>!proofRefs.includes(name));
 const hardVetoes:string[]=[];
 if(!parentStateRef)hardVetoes.push('PARENT_STATE_UNBOUND');
 if(!candidateStateRef)hardVetoes.push('CANDIDATE_STATE_UNBOUND');
 if(parentStateRef&&candidateStateRef&&parentStateRef===candidateStateRef)hardVetoes.push('STATE_TRANSITION_IDENTITY_COLLISION');
 if(!/^[0-9a-f]{40}$/i.test(sourceHead))hardVetoes.push('SOURCE_HEAD_NOT_EXACT_GIT_SHA');
 if(missingMetricEvidence.length)hardVetoes.push('METRIC_EVIDENCE_INCOMPLETE:'+missingMetricEvidence.join(','));
 if(missingAuthoritativeProofs.length)hardVetoes.push('AUTHORITATIVE_PROOF_SET_INCOMPLETE:'+missingAuthoritativeProofs.join(','));
 if(!input.authorityClosed)hardVetoes.push('AUTHORITY_NOT_CLOSED');
 if(!input.proofSurvives)hardVetoes.push('PROOF_DID_NOT_SURVIVE_TRANSPORT');
 if(!input.rollbackAvailable)hardVetoes.push('ROLLBACK_NOT_AVAILABLE');
 if(!input.dependencyOrderPreserved)hardVetoes.push('DEPENDENCY_ORDER_VIOLATION');
 if(input.canonicalMutation===true)hardVetoes.push('UNAUTHORIZED_CANONICAL_MUTATION');
 if(candidate.capabilityCoverage+R457_EPSILON<parent.capabilityCoverage)hardVetoes.push('CAPABILITY_COVERAGE_REGRESSED');
 if(candidate.proofCoverage+R457_EPSILON<parent.proofCoverage)hardVetoes.push('PROOF_COVERAGE_REGRESSED');
 if(candidate.futureTopologyRetention+R457_EPSILON<parent.futureTopologyRetention)hardVetoes.push('FUTURE_TOPOLOGY_COLLAPSED');
 if(candidate.recoverability+R457_EPSILON<parent.recoverability)hardVetoes.push('RECOVERABILITY_REGRESSED');
 const growthNet=Object.values(growthVector).reduce((sum,value)=>sum+value,0);
 const scoreNonRegressed=candidateScore+R457_EPSILON>=parentScore;
 const decision=hardVetoes.length?'ESCALATE':growthNet>R457_EPSILON&&scoreNonRegressed?'TURN':'STAY';
 const developmentalScar=Object.freeze({
  pressure:candidate.scarPressure,
  contradiction:candidate.contradiction,
  retained:true,
  clearedByPresentation:false
 });
 const continuityCone=Object.freeze({
  reachable:hardVetoes.length===0,
  futureTopologyRetention:candidate.futureTopologyRetention,
  recoverability:candidate.recoverability,
  rollbackAvailable:input.rollbackAvailable,
  authorityClosed:input.authorityClosed,
  proofSurvives:input.proofSurvives,
  dependencyOrderPreserved:input.dependencyOrderPreserved
 });
 return Object.freeze({
  schema:'OMEGA7_HEIGHTENED_DEVELOPMENTAL_TRANSITION_R457',
  sequence:R457_DEVELOPMENTAL_SEQUENCE,
  parent,
  candidate,
  normalizedRelationalDifference:Object.freeze(relationalDifference),
  growthVector:Object.freeze(growthVector),
  transportedGrowth:Object.freeze(transportedGrowth),
  developmentalAcceleration:Object.freeze(acceleration),
  developmentalJerk:Object.freeze(jerk),
  derivativeBasis:'DISCRETE_DEVELOPMENTAL_STEP_NOT_PHYSICAL_TIME',
  orderSensitivity:Object.freeze({dependencyOrderPreserved:input.dependencyOrderPreserved,violation:input.dependencyOrderPreserved?0:1}),
  developmentalCurvature:vectorNormR457(acceleration)/(vectorNormR457(growthVector)+R457_EPSILON),
  developmentalScar,
  continuityCone,
  dewey:Object.freeze({parentScore,candidateScore,continuity:candidate.continuity,futurePlasticity:candidate.futurePlasticity,contradiction:candidate.contradiction,burden:candidate.burden}),
  evidence:Object.freeze({parentStateRef,candidateStateRef,sourceHead,metricRefs:Object.freeze({...input.evidence.metricRefs}),proofRefs:Object.freeze([...proofRefs]),missingMetricEvidence:Object.freeze(missingMetricEvidence),missingAuthoritativeProofs:Object.freeze([...missingAuthoritativeProofs])}),
  growthNet,
  hardVetoes:Object.freeze(hardVetoes),
  decision,
  promotionAllowed:decision==='TURN'&&hardVetoes.length===0,
  canonicalMutation:false,
  truthBoundary:'R457 developmental metrics are normalized software-governance telemetry and require explicit per-metric evidence, distinct parent/candidate identities, an exact Git head, and the complete eight-family proof-reference set. References remain pointers rather than self-authenticating evidence; exact proof results and R125 admission remain external gates. No empirical evidence, physical dimension, or CanonState authority is created here.'
 });
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
