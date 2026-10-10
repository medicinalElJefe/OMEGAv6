import {composeHeightenedR457,evaluateDevelopmentalTransitionR457,type HeightenedDevelopmentalTransitionInputR457,type HeightenedDevelopmentalMetricsR457} from './heightenedModeR457';

export const R529_SCHEMA='OMEGA7_DEVELOPMENTAL_EXECUTION_FABRIC_R529' as const;
export type R529Executor='VISUALIZATION'|'TRAVERSAL'|'FORECAST'|'SAI_HYBRID';
export type R529Proposal={id:string;routes:readonly string[];executor:R529Executor;parent:HeightenedDevelopmentalMetricsR457;candidate:HeightenedDevelopmentalMetricsR457;previousGrowth?:HeightenedDevelopmentalTransitionInputR457['previousGrowth'];previousAcceleration?:HeightenedDevelopmentalTransitionInputR457['previousAcceleration'];evidence:HeightenedDevelopmentalTransitionInputR457['evidence'];authorityClosed:boolean;proofSurvives:boolean;rollbackAvailable:boolean;dependencyOrderPreserved:boolean;canonicalMutation?:boolean};
export type R529Receipt={schema:typeof R529_SCHEMA;id:string;executor:R529Executor;status:'ADMISSIBLE_PROPOSAL'|'HELD';reasons:readonly string[];resolvedRoutes:readonly string[];growth:ReturnType<typeof evaluateDevelopmentalTransitionR457>;executionClaimed:false;canonicalMutation:false;sourceAuthority:'R125_ONLY'};
const EXECUTOR_ROUTES:Readonly<Record<R529Executor,readonly string[]>>={
 VISUALIZATION:['Atlas','Relativity','Reality Lab'],
 TRAVERSAL:['Scale Compiler','Reality Lab','Atlas','Traversal','Extreme Traversal'],
 FORECAST:['Forecast','Relativity'],
 SAI_HYBRID:['Hybrid Link','SAI Lab']
};
export function evaluateExecutionProposalR529(proposal:R529Proposal):R529Receipt{
 const composition=composeHeightenedR457(proposal.routes);
 const growth=evaluateDevelopmentalTransitionR457({
  parent:proposal.parent,candidate:proposal.candidate,previousGrowth:proposal.previousGrowth,
  previousAcceleration:proposal.previousAcceleration,evidence:proposal.evidence,
  authorityClosed:proposal.authorityClosed,proofSurvives:proposal.proofSurvives,
  rollbackAvailable:proposal.rollbackAvailable,dependencyOrderPreserved:proposal.dependencyOrderPreserved,
  canonicalMutation:proposal.canonicalMutation
 });
 const reasons=[...composition.reasons,...growth.hardVetoes];
 if(!proposal.id.trim())reasons.push('MISSING_PROPOSAL_ID');
 if(!EXECUTOR_ROUTES[proposal.executor])reasons.push('UNKNOWN_EXECUTOR');
 else if(!composition.resolvedRoutes.some(route=>EXECUTOR_ROUTES[proposal.executor].includes(route)))reasons.push('EXECUTOR_ROUTE_MISMATCH');
 if(!growth.promotionAllowed)reasons.push('DEVELOPMENTAL_PROMOTION_NOT_ADMISSIBLE');
 return Object.freeze({schema:R529_SCHEMA,id:proposal.id,executor:proposal.executor,status:reasons.length?'HELD':'ADMISSIBLE_PROPOSAL',reasons:Object.freeze(reasons),resolvedRoutes:composition.resolvedRoutes,growth,executionClaimed:false,canonicalMutation:false,sourceAuthority:'R125_ONLY'});
}
