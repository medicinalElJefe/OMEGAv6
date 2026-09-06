import {compileSaiImprovementProposal,compileSaiRetrievalPlan,SAI_B059_AUTHORITIES} from './saiB059Runtime';
import {compileFullCanonContextR120,fullCanonPromptContextR120} from './fullCanonRuntimeR120';

export function compileSaiFullCanonRetrievalR120(query:string,record:any){
 const base=compileSaiRetrievalPlan(query,Number(record?.address||0)),canon=compileFullCanonContextR120('SAI Lab',record),promptContext=fullCanonPromptContextR120(record,'SAI Lab');
 const priorityFamilies=canon.intelligence.priorityFamilies.map(x=>x.name);
 return{
  ...base,
  schema:'OMEGA_SAI_FULL_CANON_RETRIEVAL_PLAN_R120',
  canonContext:promptContext,
  priorityModeFamilies:priorityFamilies,
  computeReadiness:canon.carry.computeReadiness,
  proofReadiness:canon.carry.proofReadiness,
  execution:'PLAN_ONLY_UNTIL_BOUND_PROVIDER_OR_CURRENT_SOVEREIGN_PC',
  boundary:`${base.boundary} ${canon.intelligence.boundary}`
 };
}

export function compileSaiFullCanonImprovementR120(record:any,modeSummary?:{appliedCount?:number;gatedCount?:number;catalogCount?:number}){
 const base=compileSaiImprovementProposal(record,modeSummary),canon=compileFullCanonContextR120('SAI Lab',record);
 const observations=[...base.observations];
 observations.push(`Full Canon compute readiness=${canon.carry.computeReadiness.toFixed(3)} · proof readiness=${canon.carry.proofReadiness.toFixed(3)} · invariant carry=${canon.carry.invariant.toFixed(3)} · residual carry=${canon.carry.residual.toFixed(3)}.`);
 observations.push(`Priority mode families: ${canon.intelligence.priorityFamilies.map(x=>`${x.name} ${x.value.toFixed(2)}`).join(' · ')}.`);
 const targets=[...base.targets,
  {area:'FULL_CANON_COMPUTE_FABRIC',reason:'Use the same Woven/RSC/mode-family state to coordinate computation, visualization and intelligence rather than treating calculus as a passive display label.',acceptance:'Every record-backed surface exposes one R120 Canon context; SAI retrieval/improvement receives the same context; gated formulas remain zero-weight until inputs exist.'},
  {area:'SOVEREIGN_LOCAL_LEARNING',reason:'High-value local indexing/training should use the approved corpus/root only and must inherit proof receipts from the current PC heartbeat.',acceptance:'No local-learning execution without current authenticated Sovereign heartbeat; no hidden writes outside approved root; every accepted result returns a receipt.'}
 ];
 return{...base,schema:'OMEGA_SAI_FULL_CANON_GOVERNED_IMPROVEMENT_R120',observations,targets,canonContext:fullCanonPromptContextR120(record,'SAI Lab'),executionBoundary:`${base.executionBoundary}__FULL_CANON_CONTEXT_IS_COORDINATION_NOT_UNSEEN_MODEL_TRAINING`};
}

export function compileSaiLocalLearningPlanR120(record:any){
 const canon=compileFullCanonContextR120('SAI Lab',record);
 return{
  schema:'OMEGA_SAI_LOCAL_LEARNING_PLAN_R120',
  stateId:canon.stateId,address:canon.address,decision:canon.decision,
  requiresAuthenticatedHeartbeat:true,
  approvedRootOnly:true,
  cDriveRuntimeWritesAllowed:false,
  authorities:SAI_B059_AUTHORITIES.map(x=>({name:x.name,role:x.role,sha256:x.sha256})),
  stages:['INDEX_APPROVED_CORPUS','CORRELATE_PROVENANCE','COMPILE_CANON_FEATURES','TRAIN_LOCAL_BOUNDED_MODEL_OR_INDEX','VALIDATE_AGAINST_HELD_EVIDENCE','RETURN_PROOF_RECEIPT'],
  featureContext:{masterOperator:canon.masterOperator,priorityFamilies:canon.intelligence.priorityFamilies,kernel:canon.woven,carry:canon.carry,referenceKernel:canon.referenceKernel},
  readiness:{compute:canon.carry.computeReadiness,proof:canon.carry.proofReadiness,sourceGroundedContributors:canon.intelligence.sourceGroundedContributors},
  execution:'HELD_UNTIL_CURRENT_SOVEREIGN_PC_HEARTBEAT_AND_EXPLICIT_LOCAL_JOB',
  boundary:'This is a bounded local-learning execution plan. It does not claim foundation-model pretraining, autonomous self-modification, or hidden weights. Training/indexing becomes real only when a current authenticated Sovereign PC executes the governed job and returns a receipt.'
 };
}
