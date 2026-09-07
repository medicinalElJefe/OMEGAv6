import {FAMILIES,type SystemFamily,type SystemFamilyStatus} from '../systemAtlasRuntime';

export const R168_REVISION='R168' as const;
export const R168_SCHEMA='OMEGA_EFFECTIVE_SYSTEM_FAMILY_EXECUTION_R168' as const;

export type SuccessorExecutionR168={
 familyId:string;
 effectiveStatus:SystemFamilyStatus;
 sourceRevision:string;
 executor:string;
 operatorRoute:string;
 boundary:string;
};

export const SUCCESSOR_EXECUTION_R168:readonly SuccessorExecutionR168[]=Object.freeze([
 {familyId:'S10',effectiveStatus:'SOURCE_ACTIVE',sourceRevision:'R46',executor:'BiologicalTraversalR46',operatorRoute:'Matter Traversal',boundary:'Representational organism → organ → tissue → cell → organelle → molecule → atom traversal bound to the canonical packet; no microscopy, diagnosis, or physical-measurement claim.'},
 {familyId:'S12',effectiveStatus:'LOCAL_ACTIVE',sourceRevision:'R153',executor:'MicroBuildR46',operatorRoute:'Build Out',boundary:'SHA-256-bound portable JSON/ZIP sovereign seed export is active; self-deploying/native installer execution remains device-proof gated.'},
 {familyId:'S16',effectiveStatus:'LOCAL_ACTIVE',sourceRevision:'R153',executor:'OmegaDataLexiconR46+xlsxLiteR153',operatorRoute:'Plugins',boundary:'Browser-local CSV/JSON/XLSX fingerprint, first-sheet read, cached formula-value provenance, and bounded XLSX round-trip are active; Excel macros/recalculation are not executed.'},
 {familyId:'S18',effectiveStatus:'LOCAL_ACTIVE',sourceRevision:'R46/R153',executor:'OmegaDataLexiconR46',operatorRoute:'Plugins',boundary:'Deterministic packet↔lexicon token/operator/route compilation is active; it is not universal translation proof or inferred-intent authority.'},
 {familyId:'S21',effectiveStatus:'LOCAL_ACTIVE',sourceRevision:'R46/R65',executor:'CinematicFieldRendererR46+VisualCompositorR65',operatorRoute:'Visual Instrument',boundary:'Packet-bound browser cinematic SVG still rendering is active; native GPU video/photoreal external synthesis remains separately gated.'}
]);

const BY_ID=new Map(SUCCESSOR_EXECUTION_R168.map(x=>[x.familyId,x]));

export type EffectiveSystemFamilyR168=SystemFamily&{
 historicalStatus:SystemFamilyStatus;
 effectiveStatus:SystemFamilyStatus;
 successor:SuccessorExecutionR168|null;
 restoredBySuccessor:boolean;
 operatorRoute:string;
 executionBoundary:string;
};

export function effectiveSystemFamilyR168(family:SystemFamily):EffectiveSystemFamilyR168{
 const successor=BY_ID.get(family.id)||null;
 return {...family,historicalStatus:family.status,effectiveStatus:successor?.effectiveStatus||family.status,successor,restoredBySuccessor:Boolean(successor),operatorRoute:successor?.operatorRoute||family.target,executionBoundary:successor?.boundary||family.statusNote};
}

export const EFFECTIVE_SYSTEM_FAMILIES_R168:readonly EffectiveSystemFamilyR168[]=Object.freeze(FAMILIES.map(effectiveSystemFamilyR168));

export function effectiveFamilyByIdR168(id:string){return EFFECTIVE_SYSTEM_FAMILIES_R168.find(x=>x.id===id)||null}
export function effectiveFamilyStatusR168(id:string):SystemFamilyStatus{return effectiveFamilyByIdR168(id)?.effectiveStatus||'RESTORATION_DEBT'}

export function systemFamilyExecutionSummaryR168(){
 const historical=Object.fromEntries([...new Set(FAMILIES.map(x=>x.status))].map(status=>[status,FAMILIES.filter(x=>x.status===status).length]));
 const effective=Object.fromEntries([...new Set(EFFECTIVE_SYSTEM_FAMILIES_R168.map(x=>x.effectiveStatus))].map(status=>[status,EFFECTIVE_SYSTEM_FAMILIES_R168.filter(x=>x.effectiveStatus===status).length]));
 const promoted=EFFECTIVE_SYSTEM_FAMILIES_R168.filter(x=>x.restoredBySuccessor).map(x=>({id:x.id,from:x.historicalStatus,to:x.effectiveStatus,executor:x.successor?.executor,route:x.operatorRoute}));
 return{schema:R168_SCHEMA,revision:R168_REVISION,familyCount:EFFECTIVE_SYSTEM_FAMILIES_R168.length,historical,effective,promoted,remainingDebt:EFFECTIVE_SYSTEM_FAMILIES_R168.filter(x=>['RESTORATION_DEBT','DONOR_ONLY','NATIVE_TARGET'].includes(x.effectiveStatus)).map(x=>x.id),canonicalAdmissionAuthority:'R125',laws:{
  lineage:'HISTORICAL_STATUS_IS_PRESERVED_SEPARATELY_FROM_SUCCESSOR_EXECUTION_STATE',
  promotion:'SUCCESSOR_EXECUTION_REQUIRES_EXISTING_EXECUTOR_PLUS_BOUNDARY_PROOF',
  routing:'EFFECTIVE_EXECUTION_STATE_MUST_ROUTE_TO_THE_ACTUAL_EXECUTOR_SURFACE',
  dimensions:'12_144_1728_20736_ARE_ATLAS_AND_REPRESENTATION_RESOLUTION_NOT_PHYSICAL_DIMENSIONS',
  continuity:'PARTITION_TRANSFORM_INVARIANT_CARRY_SCAR_HISTORY_CARRY_RECONTEXTUALIZE',
  canon:'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'
 }};
}
