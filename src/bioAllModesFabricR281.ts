import {evaluateCanonAuthorityStack} from './allModesAuthority';
import {evaluateCorpusModes} from './corpusRuntime';
import {compileModeRealizationRegistryR280} from './modeRealizationRegistryR280';

export const BIO_ALL_MODES_R281_SCHEMA='OMEGA_BIO_ALL_241_MODE_FABRIC_R281' as const;
export const BIO_ALL_MODES_R281_LAWS=Object.freeze([
  'ALL_MODES_MEANS_179_SOURCE_CATALOG_PLUS_62_CANON_AUTHORITIES',
  'SOURCE_CATALOG_AFFINITY_IS_NOT_EXACT_DONOR_FORMULA_EXECUTION',
  'CANON_LENS_ACTIVATION_IS_NOT_INDEPENDENT_EMPIRICAL_EVIDENCE',
  'UNPROVEN_GATED_AND_CHARTED_CHANNELS_REMAIN_VISIBLE',
  'EVERY_MODE_CHANNEL_HAS_ZERO_MEASUREMENT_AUTHORITY',
  'MODE_AGREEMENT_IS_INTERNAL_MODEL_COHERENCE_NOT_INDEPENDENT_REPLICATION',
  'INSTRUMENT_OBSERVATIONS_OUTRANK_ALL_MODEL_OVERLAYS'
]);

const clamp=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));

export function compileBioAllModesFabricR281(record:any){
  const source=evaluateCorpusModes(record);
  const canon=evaluateCanonAuthorityStack(record);
  const realization=compileModeRealizationRegistryR280(record);
  const realizationById=new Map(realization.rows.map(x=>[x.id,x]));

  const sourceChannels=source.results.map((mode:any,index:number)=>({
    key:`SOURCE:${mode.id}`,
    family:'SOURCE_CATALOG' as const,
    ordinal:index+1,
    id:String(mode.id),
    name:String(mode.name),
    group:String(mode.category||'SOURCE'),
    activation:clamp(mode.score),
    state:String(mode.gate||'UNKNOWN'),
    realization:'SOURCE_CATALOG_AFFINITY' as const,
    measurementAuthority:0 as const,
    provenExecution:false,
    operator:String(mode.operator||''),
    algebra:String(mode.algebra||''),
    calculus:String(mode.calculus||''),
    proof:String(mode.proof||''),
    boundary:'Catalog affinity over the current packet; not a claim that the historical donor formula executed exactly.'
  }));

  const canonChannels=canon.map((mode:any,index:number)=>{
    const r=realizationById.get(mode.id);
    return{
      key:`CANON:${mode.id}`,
      family:'CANON_AUTHORITY' as const,
      ordinal:index+1,
      id:String(mode.id),
      name:String(mode.name),
      group:String(mode.group||'CANON'),
      activation:clamp(mode.activation),
      state:String(mode.state||'UNKNOWN'),
      realization:String(r?.stage||'CHARTED'),
      measurementAuthority:0 as const,
      provenExecution:r?.stage==='PROMOTED'||r?.stage==='TESTED',
      operator:'CANON_LENS',
      algebra:'BOUND_BY_MODE_REALIZATION_REGISTRY',
      calculus:String(mode.basis||''),
      proof:(r?.binding?.tests||[]).join(' · '),
      boundary:String(r?.binding?.boundary||'Derived canon lens; not an instrument observation.')
    };
  });

  const channels=[...sourceChannels,...canonChannels];
  return{
    schema:BIO_ALL_MODES_R281_SCHEMA,
    laws:BIO_ALL_MODES_R281_LAWS,
    total:channels.length,
    sourceCatalogCount:sourceChannels.length,
    canonAuthorityCount:canonChannels.length,
    measurementAuthority:0,
    sourceSummary:{stay:source.stay,turn:source.turn,escalate:source.escalate,weakest:source.weakest?.name||null,strongest:source.strongest?.name||null},
    canonSummary:{promoted:realization.summary.promoted,tested:realization.summary.tested,implemented:realization.summary.implemented,gated:realization.summary.gated,charted:realization.summary.charted},
    channels,
    canonicalMutation:false,
    truthBoundary:'R281 Heavy Bio all-modes fabric exposes all 179 source-catalog channels and all 62 canon/calculus authorities (241 total) as analytical overlays. Source-catalog scores are packet-affinity evaluations, not exact execution of every historical donor formula. Canon activations retain R280 realization state. Every channel has measurementAuthority=0 and therefore cannot create, alter, fill, calibrate, or overrule an instrument observation.'
  };
}
