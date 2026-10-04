import {OMEGA7_CAPABILITIES} from './capabilityRegistry';

export const R452_SCHEMA='OMEGA7_FAMILY_PARITY_R452' as const;

export type Omega7NativeFamily=
 |'COMMAND_RUNTIME'
 |'EARTH_WEATHER'
 |'MOTION_TRAVERSAL'
 |'SCIENCE_RELATIVITY_ATLAS'
 |'FORECAST_VISUAL_FIELD'
 |'WORK_CREATE_CONTINUITY'
 |'DEVELOPMENT_COMPUTE'
 |'SYSTEM_EVIDENCE_GOVERNANCE';

export type Omega7FamilyContract={
 id:Omega7NativeFamily;
 representativeRoute:string;
 routes:readonly string[];
 failureProof:'R452_FAMILY_LAZY_BOUNDARY';
 performanceProof:'R452_44_ROUTE_BROWSER_BUDGET';
 rollbackProof:'R449_SHELL_REVERSIBILITY';
};

export const OMEGA7_FAMILY_CONTRACTS:readonly Omega7FamilyContract[]=[
 {id:'COMMAND_RUNTIME',representativeRoute:'Command Center',routes:['Command Center'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'},
 {id:'EARTH_WEATHER',representativeRoute:'Earth Now',routes:['Earth Now'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'},
 {id:'MOTION_TRAVERSAL',representativeRoute:'Traversal',routes:['Immersive Traversal','Matter Traversal','Extreme Traversal','Traversal'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'},
 {id:'SCIENCE_RELATIVITY_ATLAS',representativeRoute:'Relativity',routes:['Relativity','Atlas','Reality Lab','Atlas Calculator','Infinity','Scale Compiler'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'},
 {id:'FORECAST_VISUAL_FIELD',representativeRoute:'Forecast',routes:['Visual Instrument','Forecast','Field','Data Motion','Convergence'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'},
 {id:'WORK_CREATE_CONTINUITY',representativeRoute:'Workspace',routes:['Workspace','Create','Projects','Render Queue','Assets','Memory'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'},
 {id:'DEVELOPMENT_COMPUTE',representativeRoute:'Hybrid Link',routes:['Hybrid Link','Quality Compiler','Build Out','Development','Kernel Intelligence','SAI Lab'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'},
 {id:'SYSTEM_EVIDENCE_GOVERNANCE',representativeRoute:'Evidence & Proof',routes:['Cockpit','Modes','Evidence & Proof','Archive Census','Archive Operators','Canon Evolution','Governance','Consolidation','Instructions','Plugins','Settings','System','Validation','System Atlas','Control Matrix'],failureProof:'R452_FAMILY_LAZY_BOUNDARY',performanceProof:'R452_44_ROUTE_BROWSER_BUDGET',rollbackProof:'R449_SHELL_REVERSIBILITY'}
] as const;

const familyByRoute=new Map<string,Omega7FamilyContract>();
for(const family of OMEGA7_FAMILY_CONTRACTS)for(const route of family.routes){
 if(familyByRoute.has(route))throw new Error('duplicate OMEGA7 family route '+route);
 familyByRoute.set(route,family);
}

export function omega7FamilyForRoute(route:string){return familyByRoute.get(route)||null}

export const OMEGA7_FAMILY_COVERAGE=Object.freeze({
 schema:R452_SCHEMA,
 families:OMEGA7_FAMILY_CONTRACTS.length,
 routes:familyByRoute.size,
 inheritedRoutes:OMEGA7_CAPABILITIES.length,
 complete:familyByRoute.size===OMEGA7_CAPABILITIES.length&&OMEGA7_CAPABILITIES.every(cap=>familyByRoute.has(cap.legacyRoute)),
 canonicalMutation:false
});
