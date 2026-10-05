import {YEAR_CORPUS_CAPABILITY_GRAPH_R474,auditCapabilityConservationR474,type CapabilityNodeR474} from '../yearCorpusCapabilityGraphR474';

export const R479_MISSION_SCHEMA='OMEGA_WHOLE_CORPUS_CONVERGENCE_MISSION_R479' as const;

export type R479MissionResidualClass='MISSING_EXECUTOR'|'TRUTH_GATE'|'PRESENTATION_GAP'|'PROOF_GAP'|'RECOVERY_GAP'|'DEPENDENCY_GAP';
export type R479MissionResidual={capabilityId:string;pillar:string;class:R479MissionResidualClass;gap:string;blocking:boolean};

export function compileWholeCorpusResidualsR479(graph:readonly CapabilityNodeR474[]=YEAR_CORPUS_CAPABILITY_GRAPH_R474):readonly R479MissionResidual[]{
 const out:R479MissionResidual[]=[];
 for(const n of graph){
  if(!n.currentExecutor.routable)out.push({capabilityId:n.identity.id,pillar:n.pillar,class:'MISSING_EXECUTOR',gap:'CURRENT_EXECUTOR_NOT_ROUTABLE',blocking:true});
  if(n.strongestImplementation.state==='TRUTH_GATED')out.push({capabilityId:n.identity.id,pillar:n.pillar,class:'TRUTH_GATE',gap:n.remainingGap||'EXTERNAL_TRUTH_PROOF_REQUIRED',blocking:false});
  if(!n.presentationSurface.generatedFromCapability||n.presentationSurface.definesCapability)out.push({capabilityId:n.identity.id,pillar:n.pillar,class:'PRESENTATION_GAP',gap:'PRESENTATION_NOT_DERIVED_FROM_CAPABILITY',blocking:true});
  if(!n.evidence.requirements.includes('SCARS_RETAINED'))out.push({capabilityId:n.identity.id,pillar:n.pillar,class:'RECOVERY_GAP',gap:'SCAR_RETENTION_MISSING',blocking:true});
  if(!n.evidence.requirements.includes('R125_SOLE_CANONSTATE_ADMISSION'))out.push({capabilityId:n.identity.id,pillar:n.pillar,class:'PROOF_GAP',gap:'CANON_ADMISSION_BOUNDARY_MISSING',blocking:true});
 }
 return Object.freeze(out);
}

export function evaluateWholeCorpusMissionR479(candidate:readonly CapabilityNodeR474[],previous:readonly CapabilityNodeR474[]=YEAR_CORPUS_CAPABILITY_GRAPH_R474){
 const conservation=auditCapabilityConservationR474(previous,candidate);
 const residuals=compileWholeCorpusResidualsR479(candidate);
 const blocking=residuals.filter(x=>x.blocking);
 return Object.freeze({
  schema:R479_MISSION_SCHEMA,
  mission:'CONVERGE_ENTIRE_ACCUMULATED_OMEGA_CORPUS_INTO_ONE_COHERENT_FUNCTIONING_SYSTEM',
  scope:'WHOLE_YEAR_CORPUS_NOT_LATEST_REVISION',
  convergenceUnit:'CAPABILITY_LINEAGE_NOT_ROUTE',
  selectionRule:'STRONGEST_VALID_IMPLEMENTATION_NOT_NEWEST',
  presentationRule:'CAPABILITY_TO_COMPOSITION_TO_PRESENTATION',
  wovenContinuity:['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_HISTORY_CARRY','RE_CONTEXTUALIZE_REPARTITION'] as const,
  conservation,
  residuals,
  blockingResiduals:blocking,
  promotionEligible:conservation.pass&&blocking.length===0,
  completionEligible:conservation.pass&&residuals.length===0,
  canonicalAdmissionAuthority:'R125' as const,
  canonicalMutation:false as const,
  truthBoundary:'Mission success requires capability conservation plus closure of the whole recovered corpus residual set. A green latest revision alone is never equivalent to whole-system completion.'
 });
}
