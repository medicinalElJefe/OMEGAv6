import {YEAR_CORPUS_CAPABILITY_GRAPH_R474} from './yearCorpusCapabilityGraphR474';
import {auditAccumulativeBindingR534} from './accumulativeBindingAuditR534';
import {R534_SOURCE_MODEL_BINDINGS} from './accumulativeCapabilityExecutionR534';
export const R534_CONVERGENCE_SCHEMA='OMEGA_ACCUMULATIVE_CONVERGENCE_COVERAGE_R534' as const;
/** No coverage inflation: a model operation never qualifies as recovered
 * historical renderer, native executor, external dataset, or deployed host. */
export function measureAccumulativeConvergenceR534(){
 const audit=auditAccumulativeBindingR534();
 const capabilities=YEAR_CORPUS_CAPABILITY_GRAPH_R474.map(node=>{
  const sourceModelBound=Object.prototype.hasOwnProperty.call(R534_SOURCE_MODEL_BINDINGS,node.identity.id);
  const truthGated=node.strongestImplementation.state==='TRUTH_GATED';
  const gaps=audit.bindings.find(x=>x.capabilityId===node.identity.id)?.residuals||[];
  return Object.freeze({id:node.identity.id,pillar:node.pillar,route:node.currentExecutor.route,sourceModelBound,sourceModelExecutable:sourceModelBound&&!truthGated&&node.identity.id!=='HYBRID',historicalParityProven:false as const,productionExecutionProvenByThisAudit:false as const,truthGated,unresolved:gaps.length>0||!sourceModelBound,remainingGap:node.remainingGap});
 });
 const sourceModelExecutable=capabilities.filter(x=>x.sourceModelExecutable).length;
 const hostGated=capabilities.filter(x=>x.id==='HYBRID'&&x.sourceModelBound).length;
 return Object.freeze({schema:R534_CONVERGENCE_SCHEMA,totalCapabilities:capabilities.length,sourceModelExecutable,hostGated,notSourceModelExecutable:capabilities.length-sourceModelExecutable,unresolvedArchiveListings:audit.unresolvedListings.length,archiveExhaustive:audit.archiveExhaustive,historicalParityProven:0,productionExecutionProvenByThisAudit:0,capabilities:Object.freeze(capabilities),canonicalMutation:false as const,fullRestorationClaimed:false as const,truthBoundary:'R474 corpus-wide capability identities; R533/R534 executable model subsets only. External live execution and historical visual parity require independent source-specific proof.'});
}
