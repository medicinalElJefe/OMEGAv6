import {YEAR_CORPUS_CAPABILITY_GRAPH_R474,type CapabilityNodeR474} from '../yearCorpusCapabilityGraphR474';
import {compileWholeCorpusResidualsR479,type R479MissionResidual} from './wholeCorpusConvergenceMissionR479';

export const R481_DISPOSITION_SCHEMA='OMEGA_RESIDUAL_DISPOSITION_R481' as const;
export type R481Disposition='DIRECT_EXECUTOR_REQUIRED'|'EXTERNAL_EVIDENCE_REQUIRED'|'INTENTIONAL_ADAPTER_ACCEPTED'|'SUPERSEDED_WITH_EVIDENCE'|'INVALID_WITH_EVIDENCE';
export type R481DispositionRecord={capabilityId:string;disposition:R481Disposition;evidenceIds:readonly string[];rationale:string;authority:string};

const NON_WAIVABLE=new Set<R479MissionResidual['class']>(['MISSING_EXECUTOR','TRUTH_GATE','PRESENTATION_GAP','PROOF_GAP','RECOVERY_GAP','DEPENDENCY_GAP']);

export function evaluateResidualDispositionR481(residual:R479MissionResidual,record?:R481DispositionRecord){
 const evidence=Object.freeze([...(record?.evidenceIds||[])].filter(Boolean));
 const exact=!!record&&record.capabilityId===residual.capabilityId;
 const evidenceBacked=exact&&evidence.length>0&&record!.rationale.trim().length>0&&record!.authority.trim().length>0;
 const adapterAcceptance=residual.class==='ADAPTER_GAP'&&record?.disposition==='INTENTIONAL_ADAPTER_ACCEPTED'&&evidenceBacked;
 const superseded=residual.class==='ADAPTER_GAP'&&record?.disposition==='SUPERSEDED_WITH_EVIDENCE'&&evidenceBacked;
 const invalid=residual.class==='ADAPTER_GAP'&&record?.disposition==='INVALID_WITH_EVIDENCE'&&evidenceBacked;
 const resolved=adapterAcceptance||superseded||invalid;
 return Object.freeze({schema:R481_DISPOSITION_SCHEMA,capabilityId:residual.capabilityId,residualClass:residual.class,disposition:record?.disposition||null,evidenceIds:evidence,resolved,nonWaivable:NON_WAIVABLE.has(residual.class),canonicalAdmission:false as const,admissionAuthority:'R125' as const,truthBoundary:'Only adapter gaps may be disposition-resolved. Truth gates, missing executors, presentation/proof/recovery/dependency gaps cannot be accepted away.'});
}

export function evaluateWholeCorpusResidualDispositionR481(records:readonly R481DispositionRecord[],graph:readonly CapabilityNodeR474[]=YEAR_CORPUS_CAPABILITY_GRAPH_R474){
 const residuals=compileWholeCorpusResidualsR479(graph);
 const byCapability=new Map(records.map(x=>[x.capabilityId,x] as const));
 const evaluations=residuals.map(r=>evaluateResidualDispositionR481(r,byCapability.get(r.capabilityId)));
 const unresolved=evaluations.filter(x=>!x.resolved);
 return Object.freeze({schema:R481_DISPOSITION_SCHEMA,residuals:evaluations,unresolved,unresolvedCount:unresolved.length,resolvedByDisposition:evaluations.filter(x=>x.resolved).length,completionEligible:unresolved.length===0,canonicalAdmission:false as const,admissionAuthority:'R125' as const});
}
