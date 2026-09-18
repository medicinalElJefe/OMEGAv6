import type{SarObservationR280}from'./sarTruthR280';
import type{SarRasterFieldR283}from'./sarRasterR283';

export type SarViewR325='SOURCE'|'AMPLITUDE'|'PHASE'|'COHERENCE'|'INTERFEROGRAM'|'DEFORMATION'|'ELEVATION'|'POLARIMETRY'|'MULTI_BAND'|'TIME_STACK'|'SCAR_UNCERTAINTY'|'PROOF';
export type SarFieldStateR325='BOUND'|'READY_TO_BIND'|'HELD';
export interface SarFieldPlanRowR325{view:SarViewR325;state:SarFieldStateR325;requires:string[];next:string;truth:string}

const has=(a?:number[])=>!!a?.length;
export function sarFieldPlanR325(obs:SarObservationR280,raster?:SarRasterFieldR283,catalogBound=false,assetPrefixBound=false):SarFieldPlanRowR325[]{
 const native=obs.nativeDataBound&&!!raster,complex=obs.complexDataBound&&native,calibrated=!!obs.calibration||['OBSERVED_CALIBRATED','CORRECTED','GEOCODED','FUSED','ASSIMILATED'].includes(obs.truth);
 const pair=Number(obs.geometry.temporalBaselineDays)>0&&Number(obs.geometry.baselineM)!==0;
 const p=obs.provenance.processingParameters||{};
 const rows:Record<SarViewR325,Omit<SarFieldPlanRowR325,'view'>>={
  SOURCE:{state:native&&has(raster?.amplitudeDb)?'BOUND':assetPrefixBound?'READY_TO_BIND':'HELD',requires:['exact native asset bytes','decoded raster samples'],next:assetPrefixBound?'decode the verified native container into a bounded raster':'verify the exact STAC data asset byte stream',truth:'Native measurement pixels only; catalogue previews never substitute.'},
  AMPLITUDE:{state:native&&has(raster?.amplitudeDb)&&calibrated?'BOUND':native?'READY_TO_BIND':'HELD',requires:['native raster','radiometric calibration/declared units'],next:native?'apply verified calibration and preserve units':'bind and decode native GRD/SLC measurement bytes',truth:'Amplitude/backscatter requires declared source units and calibration.'},
  PHASE:{state:complex&&has(raster?.phaseRad)?'BOUND':complex?'READY_TO_BIND':'HELD',requires:['SLC complex I/Q','phase decoding'],next:complex?'decode phase from bound complex samples':'select/bind a Sentinel-1 SLC complex source',truth:'GRD intensity cannot be promoted into phase.'},
  COHERENCE:{state:has(raster?.coherence)?'BOUND':complex&&pair?'READY_TO_BIND':'HELD',requires:['co-registered SLC pair','common geometry','coherence window'],next:complex?'bind a compatible second SLC acquisition and co-register the pair':'bind SLC complex data first',truth:'Coherence is a pair-derived measurement, not a single-scene catalogue property.'},
  INTERFEROGRAM:{state:complex&&has(raster?.phaseRad)&&pair?'BOUND':complex&&pair?'READY_TO_BIND':'HELD',requires:['co-registered SLC pair','wrapped phase difference'],next:complex?'form the interferometric pair after geometry/orbit alignment':'bind two compatible SLC acquisitions',truth:'Interferometric phase requires two coherent complex observations.'},
  DEFORMATION:{state:has(raster?.losDisplacementM)?'BOUND':p.unwrappedPhaseBound===true&&p.topographyHandled===true&&p.orbitHandled===true&&p.atmosphereHandled===true?'READY_TO_BIND':'HELD',requires:['unwrapped interferometric phase','orbit correction','topographic phase removal','atmospheric handling','sign convention'],next:'complete the interferometric residual ledger before metric LOS displacement',truth:'Metric deformation is held until residual contributors are explicitly handled.'},
  ELEVATION:{state:has(raster?.elevationM)?'BOUND':'HELD',requires:['DEM or admitted InSAR elevation product','vertical datum'],next:'bind an authoritative DEM/elevation product with vertical reference',truth:'Elevation is a separate source/derived field; it is not inferred from GRD brightness.'},
  POLARIMETRY:{state:has(raster?.polarimetricPower)?'BOUND':native&&['DUAL','QUAD'].includes(obs.polarization)?'READY_TO_BIND':'HELD',requires:['calibrated dual/quad polarization channels','common geometry'],next:native?'bind all required polarization channels and calibrate them':'select a dual/quad-polarized acquisition and bind native channels',truth:'Polarimetric products require multiple calibrated polarization channels.'},
  MULTI_BAND:{state:has(raster?.multiBandRelative)?'BOUND':'HELD',requires:['two or more physically distinct radar bands','common frame/normalization'],next:'bind comparable observations from distinct radar bands; polarization is not a substitute for wavelength band',truth:'Multi-band means different radar wavelength frames, not colorized single-band data.'},
  TIME_STACK:{state:native&&p.timeStackCount&&Number(p.timeStackCount)>=2?'BOUND':'HELD',requires:['multiple acquisitions','common grid','epoch ordering'],next:'bind and co-register at least two acquisitions for this target',truth:'A time stack requires more than one acquisition epoch.'},
  SCAR_UNCERTAINTY:{state:has(raster?.uncertainty)?'BOUND':native?'READY_TO_BIND':'HELD',requires:['quality/mask/residual evidence','declared uncertainty mapping'],next:native?'derive uncertainty only from returned quality/residual evidence':'bind native measurement and quality metadata first',truth:'Uncertainty is evidence-derived and cannot be painted decoratively.'},
  PROOF:{state:has(raster?.quality)?'BOUND':catalogBound||assetPrefixBound?'READY_TO_BIND':'HELD',requires:['source identity','provenance','field coverage','processing lineage'],next:catalogBound?'accumulate byte, decode, calibration and field receipts into one proof surface':'bind a real acquisition record first',truth:'Proof summarizes evidence; it never creates measurement authority.'}
 };
 return(Object.keys(rows)as SarViewR325[]).map(view=>({view,...rows[view]}));
}
