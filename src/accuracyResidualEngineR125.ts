export const R125_ENGINE='OMEGA_R125_ACCURACY_FIRST_RESIDUAL_ENGINE' as const;

export type ResidualKind='TEST_FAILURE'|'BUILD_FAILURE'|'INVARIANT_GAP'|'CAPABILITY_UNWIRED'|'PERFORMANCE_REGRESSION'|'SOURCE_LINEAGE_GAP'|'DEPLOYMENT_UNPROVEN'|'TRUTH_BOUNDARY_RISK';
export type ResidualSeverity='LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
export type EvidenceClass='TEST'|'BUILD'|'SOURCE'|'RUNTIME'|'BENCHMARK'|'DEPLOYMENT'|'PROOF';
export type ActionMode='AUTO_REPAIR'|'QUEUE_FOR_REVIEW'|'OBSERVE_ONLY'|'BLOCK';

export type EvidenceRef={id:string;kind:EvidenceClass;source:string;observedAt:string;claim:string;verified:boolean;value?:number|string|boolean};
export type Residual={id:string;kind:ResidualKind;severity:ResidualSeverity;summary:string;evidence:EvidenceRef[];affected:string[];reproducible:boolean;confidence:number;};
export type RepairRecipe={id:string;handles:ResidualKind[];risk:'LOW'|'MEDIUM'|'HIGH';requires:string[];preserves:string[];generator:string;};
export type BuildProposal={id:string;residualId:string;recipeId:string;mode:ActionMode;confidence:number;reasons:string[];preserves:string[];};

const clamp=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
export function evidenceConfidence(e:EvidenceRef[]){
 const verified=e.filter(x=>x.verified);
 if(!verified.length)return 0;
 const diversity=new Set(verified.map(x=>x.kind)).size;
 const verification=verified.length/e.length;
 return clamp(.62*verification+.38*Math.min(1,diversity/3));
}

export function classifyResidual(r:Omit<Residual,'confidence'>):Residual{return{...r,confidence:evidenceConfidence(r.evidence)}}

export function actionMode(r:Residual,recipe:RepairRecipe|undefined):ActionMode{
 if(r.kind==='TRUTH_BOUNDARY_RISK'||r.severity==='CRITICAL')return'BLOCK';
 if(!r.reproducible||r.confidence<.72)return'OBSERVE_ONLY';
 if(!recipe)return'QUEUE_FOR_REVIEW';
 if(recipe.risk==='LOW'&&r.confidence>=.92)return'AUTO_REPAIR';
 return'QUEUE_FOR_REVIEW';
}

export function proposalFor(r:Residual,recipes:RepairRecipe[]):BuildProposal{
 const recipe=recipes.find(x=>x.handles.includes(r.kind));
 const mode=actionMode(r,recipe);
 return{id:`P-${r.id}`,residualId:r.id,recipeId:recipe?.id??'NONE',mode,confidence:r.confidence,reasons:[`kind=${r.kind}`,`severity=${r.severity}`,`reproducible=${r.reproducible}`,`verifiedEvidence=${r.evidence.filter(x=>x.verified).length}/${r.evidence.length}`],preserves:recipe?.preserves??[]};
}

export const R125_LAWS=[
 'NO_PROPOSAL_WITHOUT_EXPLICIT_EVIDENCE',
 'UNVERIFIED_EVIDENCE_CANNOT_AUTHORIZE_MUTATION',
 'LOW_CONFIDENCE_RESIDUALS_ARE_OBSERVED_NOT_REPAIRED',
 'AUTO_REPAIR_REQUIRES_REPRODUCIBLE_RESIDUAL_CONFIDENCE_GTE_0_92_AND_LOW_RISK_REGISTERED_RECIPE',
 'MEDIUM_OR_HIGH_RISK_CHANGES_REQUIRE_REVIEW_OR_STRONGER_EXTERNAL_AUTHORITY',
 'TRUTH_BOUNDARY_RISK_ALWAYS_BLOCKS_AUTONOMOUS_MUTATION',
 'FAILED_REPAIR_NEVER_MUTATES_MAIN',
 'EVERY_ADMISSION_PRESERVES_ROLLBACK_PROOF_AND_SOURCE_LINEAGE',
 'NO_GENERATED_SCENE_FALLBACK_FOR_COMPUTED_REALITY',
 'NO_FALSE_PC_ONLINE_SOLVER_VALIDITY_OR_DEPLOYMENT_CLAIMS',
 'NO_WHOLESALE_ARCHIVE_REPLACEMENT',
 'OBSERVE_CAN_RUN_FOREVER_BUT_BUILD_ONLY_ADVANCES_WHEN EVIDENCE_SUPPORTS_A_BOUNDED_CHANGE'
] as const;
