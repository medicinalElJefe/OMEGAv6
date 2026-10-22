import {compileBioAllModesFabricR281} from './bioAllModesFabricR281';

export const BIO_MODE_EXPERIENCE_R284_SCHEMA='OMEGA_BIO_MODE_EXPERIENCE_R284' as const;
export const BIO_MODE_EXPERIENCE_R284_LAWS=Object.freeze([
  'MODE_UI_MUST_RENDER_SOURCE_METADATA_NOT_INVENT_CLINICAL_MEANING',
  'SOURCE_CATALOG_AFFINITY_IS_NOT_EXACT_HISTORICAL_OPERATOR_EXECUTION',
  'CANON_ACTIVATION_IS_NOT_AN_INSTRUMENT_OBSERVATION',
  'EVERY_CHANNEL_RETAINS_ZERO_MEASUREMENT_AUTHORITY',
  'MODE_COMPARISON_MAY_COMPARE_MODEL_METADATA_BUT_NOT_CREATE_CLINICAL_EVIDENCE',
  'CLINICAL_INFLUENCE_REMAINS_OWNED_BY_R282_SCOPE_MATCHED_VALIDATION_AND_RELEASE_AUTHORITY',
  'EDUCATIONAL_EXPLANATION_MUST_PRESERVE_THE_CHANNEL_TRUTH_BOUNDARY'
]);

export type BioModeEvidenceClassR284='EXECUTION_BOUND'|'IMPLEMENTED_OR_TESTED'|'CHARTED_OR_GATED'|'CATALOG_AFFINITY';

const clean=(x:any)=>String(x??'').trim();
const stageRank=(x:string)=>x==='PROMOTED'?5:x==='TESTED'?4:x==='IMPLEMENTED'?3:x==='GATED'?2:x==='CHARTED'?1:0;

export function evidenceClassR284(channel:any):BioModeEvidenceClassR284{
  if(channel?.family==='SOURCE_CATALOG')return'CATALOG_AFFINITY';
  if(channel?.provenExecution&&clean(channel?.proof))return'EXECUTION_BOUND';
  if(stageRank(clean(channel?.realization))>=3)return'IMPLEMENTED_OR_TESTED';
  return'CHARTED_OR_GATED';
}

export function compileBioModeExperienceR284(record:any){
  const fabric=compileBioAllModesFabricR281(record);
  const channels=fabric.channels.map((channel:any)=>{
    const evidenceClass=evidenceClassR284(channel);
    const isSource=channel.family==='SOURCE_CATALOG';
    const education=isSource
      ? 'This channel is a source-catalog affinity evaluation over the current canonical packet. It is useful for comparative research routing, but it does not prove that a historical donor formula executed exactly.'
      : `This channel is a canon analytical lens. Its current realization state is ${clean(channel.realization)||'UNKNOWN'}; any listed proof is software/evaluation evidence for that lens, not independent biological replication.`;
    const validationNeed=isSource
      ? 'Reproduce the declared source operator on an independently specified dataset, bind versioned inputs/outputs, then compare against untouched holdout and prospective evidence before any clinical influence is considered.'
      : 'Bind the exact lens implementation and version, preserve measurement/model separation, validate against untouched holdout and prospective evidence for a locked intended use, then let R282 determine whether any clinical weight is authorized.';
    return{
      ...channel,
      evidenceClass,
      education,
      validationNeed,
      proofPresent:Boolean(clean(channel.proof)),
      clinicalDisplayAuthority:0 as const,
      measurementAuthority:0 as const,
      interactionBoundary:'Selection, filtering, sorting, visualization and comparison are read-only analytical interactions. They do not mutate observations, validation evidence, release state or CanonState.'
    };
  });
  const groups=[...new Set(channels.map((x:any)=>clean(x.group)||'UNSPECIFIED'))].sort((a,b)=>a.localeCompare(b));
  return{
    schema:BIO_MODE_EXPERIENCE_R284_SCHEMA,
    laws:BIO_MODE_EXPERIENCE_R284_LAWS,
    total:channels.length,
    sourceCatalogCount:fabric.sourceCatalogCount,
    canonAuthorityCount:fabric.canonAuthorityCount,
    groups,
    channels,
    measurementAuthority:0,
    clinicalDisplayAuthority:0,
    truthBoundary:'R284 improves how the 241 analytical channels are explored and taught. It does not add measurement authority, clinical validation, regulatory authorization, diagnostic meaning or autonomous clinical action. Instrument observations remain upstream; R282 remains the only clinical-weight/release gate.'
  };
}

export function compareBioModesR284(a:any,b:any){
  if(!a||!b)return null;
  return{
    activationDelta:Number(a.activation||0)-Number(b.activation||0),
    sameFamily:a.family===b.family,
    sameGroup:a.group===b.group,
    realizationDelta:stageRank(clean(a.realization))-stageRank(clean(b.realization)),
    proofPair:Boolean(a.proofPresent&&b.proofPresent),
    measurementAuthorityDelta:0,
    truthBoundary:'This comparison is descriptive model metadata. A difference in activation, state, group or realization is not a physiological difference, treatment effect, diagnosis, prognosis or independent replication.'
  };
}
