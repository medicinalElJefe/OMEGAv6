import {YEAR_CORPUS_CAPABILITY_GRAPH_R474,auditCapabilityConservationR474} from './yearCorpusCapabilityGraphR474';
import {expandedCorpusCensusR484,auditExpandedCorpusCensusR484} from './system/expandedCorpusCensusR484';

/** Read-only convergence audit: joins existing R474 and R484 evidence without
 * claiming that matching labels prove archive content or actual execution. */
export const R534_SCHEMA='OMEGA_ACCUMULATIVE_CAPABILITY_BINDING_AUDIT_R534' as const;
export type R534Residual='SOURCE_LISTING_UNRESOLVED'|'EXECUTOR_NOT_PROVEN'|'PRESENTATION_NOT_PROVEN'|'ARCHIVE_EVIDENCE_REQUIRED';
export function auditAccumulativeBindingR534(){
 const graph=YEAR_CORPUS_CAPABILITY_GRAPH_R474;
 const census=expandedCorpusCensusR484();
 const archive=auditExpandedCorpusCensusR484(census);
 const bindings=graph.map(node=>{
  const executor=node.currentExecutor;
  const gaps:R534Residual[]=[];
  if(!executor.routable||node.strongestImplementation.state!=='EXECUTABLE')gaps.push('EXECUTOR_NOT_PROVEN');
  if(!node.presentationSurface.route)gaps.push('PRESENTATION_NOT_PROVEN');
  if(node.remainingGap)gaps.push('ARCHIVE_EVIDENCE_REQUIRED');
  return Object.freeze({capabilityId:node.identity.id,pillar:node.pillar,sourceBindingId:node.lineage.sourceBindingId,predecessors:node.lineage.predecessors,dependencies:node.dependencies,executorRoute:executor.route,executorState:node.strongestImplementation.state,truthClass:node.evidence.truthClass,remainingGap:node.remainingGap,residuals:Object.freeze(gaps),canonicalMutation:false as const});
 });
 const unresolvedListings=census.filter(x=>x.retention==='RETAIN_UNRESOLVED').map(x=>Object.freeze({recordId:x.id,identity:x.identity,source:x.source,residual:'SOURCE_LISTING_UNRESOLVED' as const,canonicalMutation:false as const}));
 const conservation=auditCapabilityConservationR474(graph,graph);
 return Object.freeze({schema:R534_SCHEMA,baseline:'R474_CAPABILITY_GRAPH_PLUS_R484_CENSUS',capabilityCount:bindings.length,censusRecordCount:census.length,archiveExhaustive:archive.exhaustive,conservationPass:conservation.pass,bindings:Object.freeze(bindings),unresolvedListings:Object.freeze(unresolvedListings),residualCount:bindings.reduce((n,x)=>n+x.residuals.length,unresolvedListings.length),canonicalMutation:false as const,productionPromotionClaimed:false as const,boundary:'Read-only source-ledger residuals, not live execution receipts, historical visual fidelity proof, external archive completeness, or production admission.'});
}
