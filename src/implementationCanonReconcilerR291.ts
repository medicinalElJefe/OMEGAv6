export type CanonDisposition='IMPLEMENTED'|'PARTIAL'|'SUPERSEDED'|'DONOR'|'PLANNED'|'REJECTED';
export type CanonEvidence={sourceArtifact?:string;sourcePresent:boolean;testProof?:string;testPassed:boolean;runtimeObserved?:boolean;supersededBy?:string;donorOnly?:boolean;rejectedReason?:string};
export type CanonRow={rowId:string;type:string;phase:string;component:string;artifact:string;symbol:string;purpose:string;archiveStatus:string;priority:string;sequence:number};
export type CanonReconciliation={row:CanonRow;disposition:CanonDisposition;confidence:number;evidence:CanonEvidence;reason:string;admissionBlocked:boolean};

export const IMPLEMENTATION_CANON_TRUTH_BOUNDARY='The 675-row archive workbook is an implementation specification. A PLANNED or named archive row is not proof that a current OMEGAv6 implementation exists. IMPLEMENTED requires current source plus passing proof; runtime-observed claims require runtime evidence.';

export const IMPLEMENTATION_CANON_HARD_INVARIANTS_R291=[
 ['CANON-000001','Single authoritative runtime','Exactly one canonical state writer exists; every other subsystem consumes immutable snapshots.'],
 ['CANON-000002','No decorative geometry','Every rendered primitive traces to one or more source state IDs.'],
 ['CANON-000003','Time before meaning','No observation enters reconstruction until required times are bound.'],
 ['CANON-000004','Units and frames mandatory','Every physical quantity carries units and an explicit coordinate/reference frame.'],
 ['CANON-000005','Completion is not admission','Completed computation remains quarantined until validity/dependency/evidence/contradiction/proof gates pass.'],
 ['CANON-000006','Scar survives recovery','Restart/rollback/recovery preserve required causal history and proof provenance.'],
 ['CANON-000007','Lens weights are calibrated','No lens weight is universal; each host/sensor profile is versioned and calibrated.'],
 ['CANON-000008','Deterministic replay','Recorded feed + config + code/shader hashes reproduce declared state/frame hashes within tolerance.'],
 ['CANON-000009','No hidden synthetic scene substitution','Live/recorded source feeds cannot silently fall back to generated scenery.'],
 ['CANON-000010','No untyped atlas claim','20,736 is address topology; physical meaning requires calibrated host mappings.'],
 ['CANON-000011','Observer changes projection, not canonical existence','LOD/culling may reduce compute or visibility but cannot erase canonical state/scar.'],
 ['CANON-000012','Schema expansion is proof-gated','New latent coordinates require persistent structured residual plus held-out improvement.']
] as const;

export function reconcileImplementationCanonRowR291(row:CanonRow,evidence:CanonEvidence):CanonReconciliation{
 let disposition:CanonDisposition='PLANNED',confidence=.35,reason='No current implementation proof is attached.';
 if(evidence.rejectedReason){disposition='REJECTED';confidence=1;reason=evidence.rejectedReason}
 else if(evidence.supersededBy){disposition='SUPERSEDED';confidence=.95;reason=`Superseded by ${evidence.supersededBy}.`}
 else if(evidence.donorOnly){disposition='DONOR';confidence=.9;reason='Artifact is retained as a donor/reference and is not current runtime authority.'}
 else if(evidence.sourcePresent&&evidence.testPassed){disposition='IMPLEMENTED';confidence=evidence.runtimeObserved===false?.88:.98;reason='Current source exists and a passing proof is attached.'}
 else if(evidence.sourcePresent||evidence.testPassed){disposition='PARTIAL';confidence=.68;reason='Only part of the source/proof pair required for implementation admission is present.'}
 const admissionBlocked=disposition!=='IMPLEMENTED';
 return{row,disposition,confidence,evidence,reason,admissionBlocked};
}

export function reconcileImplementationCanonR291(rows:CanonRow[],evidenceByRow:Record<string,CanonEvidence>){
 const results=rows.map(row=>reconcileImplementationCanonRowR291(row,evidenceByRow[row.rowId]||{sourcePresent:false,testPassed:false}));
 const counts=results.reduce<Record<CanonDisposition,number>>((o,r)=>(o[r.disposition]++,o),{IMPLEMENTED:0,PARTIAL:0,SUPERSEDED:0,DONOR:0,PLANNED:0,REJECTED:0});
 return{schema:'OMEGA_IMPLEMENTATION_CANON_RECONCILIATION_R291',sourceRowTarget:675,rows:results.length,counts,results,truthBoundary:IMPLEMENTATION_CANON_TRUTH_BOUNDARY};
}

export function assertImplementationCanonAdmissionR291(result:CanonReconciliation){if(result.disposition!=='IMPLEMENTED')throw new Error(`Canon admission denied for ${result.row.rowId}: ${result.disposition} · ${result.reason}`);return result}
