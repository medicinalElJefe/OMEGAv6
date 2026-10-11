import {YEAR_CORPUS_CAPABILITY_GRAPH_R474} from './yearCorpusCapabilityGraphR474';
import {measureAccumulativeConvergenceR534} from './accumulativeConvergenceCoverageR534';
import {composeHeightenedR457} from '../src7/heightenedModeR457';

/** Developmental recovery planning, not autonomous source mutation.
 * Reuses R474 identities, R457 composition, R534 coverage, and explicit
 * deployment preconditions. No planner result can authorize promotion. */
export const R534_BUILD_ASSIST_SCHEMA='OMEGA_DEVELOPMENTAL_BUILD_ASSIST_R534' as const;
export type R534RecoveryWork={
 capabilityId:string;route:string;priority:number;kind:'RECOVER_SOURCE'|'PROVE_EXECUTOR'|'PROVE_VISUAL_PARITY'|'PROVE_DEVICE';
 evidenceNeeded:readonly string[];deploymentPreconditions:readonly string[];
 status:'PLANNED_UNPROVEN';canonicalMutation:false
};
const CRITICAL=new Set(['FIELD_RENDER','SPHERE','ATLAS','TRAVERSAL','HEIGHTENED','HYBRID','SAI','ARCHIVE','FORECAST_LAE','RUNTIME']);
export function planDevelopmentalBuildAssistR534(){
 const coverage=measureAccumulativeConvergenceR534();
 const tasks:R534RecoveryWork[]=[];
 for(const cap of coverage.capabilities){
  const node=YEAR_CORPUS_CAPABILITY_GRAPH_R474.find(x=>x.identity.id===cap.id)!;
  const composition=composeHeightenedR457([node.currentExecutor.route]);
  const proof=['EXACT_SOURCE_ARTIFACT_AND_HASH','STRONGEST_VALID_PREDECESSOR_COMPARISON','ACTUAL_EXECUTION_RECEIPT','DESKTOP_MOBILE_BEHAVIORAL_PARITY','EXACT_PROMOTED_SHA_PRODUCTION_PROOF'];
  const deployment=['CANONICAL_STATE_R125_UNCHANGED','R142_EXECUTION_RECEIPTS','NO_VISUAL_OR_NAVIGATION_REGRESSION','ROLLBACK_ELIGIBLE','PRODUCTION_DEPLOY_PATH_VERIFIED'];
  const kind=cap.id==='HYBRID'||cap.id==='SAI'?'PROVE_DEVICE':!cap.sourceModelBound?'RECOVER_SOURCE':node.pillar==='RENDERING'||cap.id==='SPHERE'||cap.id==='ATLAS'?'PROVE_VISUAL_PARITY':'PROVE_EXECUTOR';
  const priority=(CRITICAL.has(cap.id)?100:0)+(kind==='RECOVER_SOURCE'?30:kind==='PROVE_VISUAL_PARITY'?25:20)+(composition.status==='READY'?5:0);
  tasks.push(Object.freeze({capabilityId:cap.id,route:node.currentExecutor.route,priority,kind,evidenceNeeded:Object.freeze([...proof,...(composition.status==='HELD'?['R457_ROUTE_COMPOSITION_HELD']:[])]),deploymentPreconditions:Object.freeze(deployment),status:'PLANNED_UNPROVEN' as const,canonicalMutation:false as const}));
 }
 tasks.sort((a,b)=>b.priority-a.priority||a.capabilityId.localeCompare(b.capabilityId));
 return Object.freeze({schema:R534_BUILD_ASSIST_SCHEMA,coverageSchema:coverage.schema,total:tasks.length,topPriority:Object.freeze(tasks.slice(0,12)),tasks:Object.freeze(tasks),sourceMutationAuthorized:false as const,productionAdmissionAuthorized:false as const,canonicalMutation:false as const,truthBoundary:'Planning uses existing typed corpus and heightened composition; it neither performs recovery nor grants CI/deployment authority.'});
}
