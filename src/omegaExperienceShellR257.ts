import type {OmegaExperienceDepthR257,OmegaExperienceIdR257} from './OmegaExperienceContextR257';

export type OmegaExperienceDefinitionR257={id:OmegaExperienceIdR257;label:string;copy:string;workspace:string;lens:string;routes:readonly string[];defaultDepth:OmegaExperienceDepthR257};
export const OMEGA_EXPERIENCES_R257:readonly OmegaExperienceDefinitionR257[]=[
 {id:'EXPLORE',label:'Explore',copy:'discover · traverse · understand',workspace:'EXPLORE',lens:'FIELD',routes:['Matter Traversal','Earth Now','Visual Instrument','Traversal'],defaultDepth:'FOCUS'},
 {id:'OPERATE',label:'Operate',copy:'live state · connect · act',workspace:'COMMAND',lens:'TRAVERSAL',routes:['Hybrid Link','Command Center','Earth Now','Workspace'],defaultDepth:'ADVANCED'},
 {id:'VISUALIZE',label:'Visualize',copy:'see · scale · immerse',workspace:'EXPLORE',lens:'SCALE',routes:['Visual Instrument','Earth Now','Immersive Traversal','Matter Traversal'],defaultDepth:'FOCUS'},
 {id:'ANALYZE',label:'Analyze',copy:'compare · calculate · resolve',workspace:'EXPLORE',lens:'RELATIVITY',routes:['Relativity','Forecast','Convergence','Atlas Calculator'],defaultDepth:'ADVANCED'},
 {id:'BUILD',label:'Build',copy:'create · develop · package',workspace:'BUILD',lens:'CONVERGENCE',routes:['Development','Build Out','Projects','Create'],defaultDepth:'ADVANCED'},
 {id:'PROVE',label:'Prove',copy:'evidence · receipts · lineage',workspace:'EVIDENCE',lens:'CONVERGENCE',routes:['Evidence & Proof','Validation','Governance','Archive Census'],defaultDepth:'FULL'}
] as const;
export const EXPERIENCE_TRUTH_CONTRACT_R257={
 authority:'PRESENTATION_ONLY',
 law:'PRESENTATION_MAY_TRANSFORM_TRUTH_CLASSIFICATION_MAY_NOT',
 boundaries:['UNPROVEN_NEVER_BECOMES_PROVEN_FROM_VIEW_STATE','RECONSTRUCTION_NEVER_BECOMES_OBSERVATION','FORECAST_NEVER_BECOMES_OBSERVATION','PRIVATE_PC_EXECUTION_REQUIRES_CURRENT_AUTHENTICATED_RETURN','R125_CANONSTATE_ADMISSION_UNCHANGED','R141_EXACT_RETURN_CLOSURE_UNCHANGED','R147_EXECUTION_DISPATCH_UNCHANGED','R240_SOURCE_PROMOTION_UNCHANGED','CI_YML_SOLE_PRODUCTION_WRITER']
} as const;
export function experienceDefinitionR257(id:OmegaExperienceIdR257){return OMEGA_EXPERIENCES_R257.find(x=>x.id===id)||OMEGA_EXPERIENCES_R257[0]}
