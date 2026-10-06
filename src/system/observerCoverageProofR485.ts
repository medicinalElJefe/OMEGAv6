export const R485_OBSERVER_SCHEMA='OMEGA_OBSERVER_COVERAGE_PROOF_R485' as const;
export type ObserverCompletenessR485='EXHAUSTIVE_FOR_DECLARED_SCOPE'|'PARTIAL'|'UNKNOWN';
export type ObserverResultR485='OBSERVED'|'NOT_OBSERVED';
export type ObserverClaimR485='PRESENT'|'ABSENT'|'UNKNOWN';

export type ObserverReceiptR485={
 observerId:string;
 source:string;
 eventClassesVisible:readonly string[];
 filters:readonly string[];
 completeness:ObserverCompletenessR485;
 result:ObserverResultR485;
 evidenceIds:readonly string[];
 blindSpots:readonly string[];
};

export const R485_LAWS=Object.freeze([
 'ABSENCE_FROM_PARTIAL_OBSERVER_IS_NOT_EVENT_ABSENCE',
 'OBSERVER_PROJECTION_IS_NOT_CANONICAL_EVENT_HISTORY',
 'ABSENCE_REQUIRES_EXHAUSTIVE_DECLARED_SCOPE',
 'PRESENCE_REQUIRES_POSITIVE_EVIDENCE',
 'CONFLICTING_OBSERVERS_RETAIN_BOTH_RECEIPTS_UNTIL_RESOLVED'
] as const);

export function evaluateObserverReceiptR485(r:ObserverReceiptR485){
 const positive=r.result==='OBSERVED'&&r.evidenceIds.length>0;
 const exhaustive=r.completeness==='EXHAUSTIVE_FOR_DECLARED_SCOPE';
 const claim:ObserverClaimR485=positive?'PRESENT':r.result==='NOT_OBSERVED'&&exhaustive?'ABSENT':'UNKNOWN';
 return Object.freeze({
  schema:R485_OBSERVER_SCHEMA,claim,positiveEvidence:positive,absenceAdmissible:claim==='ABSENT',
  observerCoverage:{eventClassesVisible:r.eventClassesVisible,filters:r.filters,completeness:r.completeness,blindSpots:r.blindSpots},
  canonicalMutation:false as const,
  truthBoundary:'A returned observer result is a projection through declared coverage and filters. NOT_OBSERVED becomes ABSENT only when the observer is exhaustive for the exact declared scope.'
 });
}

export function reconcileObserversR485(receipts:readonly ObserverReceiptR485[]){
 const evaluated=receipts.map(receipt=>({receipt,evaluation:evaluateObserverReceiptR485(receipt)}));
 const present=evaluated.filter(x=>x.evaluation.claim==='PRESENT');
 const absent=evaluated.filter(x=>x.evaluation.claim==='ABSENT');
 const contradiction=present.length>0&&absent.length>0;
 return Object.freeze({
  schema:R485_OBSERVER_SCHEMA,
  claim:contradiction?'UNKNOWN':present.length?'PRESENT':absent.length===receipts.length&&receipts.length>0?'ABSENT':'UNKNOWN',
  contradiction,
  retainedReceipts:Object.freeze(evaluated),
  canonicalMutation:false as const
 });
}
