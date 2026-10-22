import {evaluateCanonAuthorityStack} from './allModesAuthority';
import {compileModeRealizationRegistryR280} from './modeRealizationRegistryR280';

export const BIO_INSTRUMENT_R281_SCHEMA='OMEGA_BIO_INSTRUMENT_FRAME_R281' as const;
export const BIO_INSTRUMENT_R281_LAWS=Object.freeze([
  'RAW_MEASUREMENT_IS_NEVER_REPLACED_BY_MODEL_OUTPUT',
  'CORRECTED_MEASUREMENT_REQUIRES_EXPLICIT_CALIBRATION_MODEL',
  'MEASUREMENT_UNCERTAINTY_PROPAGATES_IN_QUADRATURE_FOR_DECLARED_INDEPENDENT_COMPONENTS',
  'CALIBRATION_EXPIRY_OR_MISSING_TRACEABILITY_PREVENTS_INSTRUMENT_READY_STATUS',
  'MODE_OUTPUTS_MAY_OVERLAY_MEASUREMENTS_BUT_HAVE_ZERO_MEASUREMENT_AUTHORITY',
  'UNPROVEN_MODES_REMAIN_VISIBLE_AS_EXPERIMENTAL_OVERLAYS_AND_CANNOT ALTER_OBSERVED_VALUES',
  'BIOLOGICAL_CONTEXT_LAYERS_ARE_RELATIONAL_VIEWS_NOT_AUTOMATIC_ANATOMICAL_FACTS',
  'NO_PATIENT_IDENTITY_IS_REQUIRED_BY_THIS COMPUTATIONAL_FRAME'.replace(' COMPUTATIONAL','_COMPUTATIONAL'),
  'TWELVE_TO_SIXTY_ONE_BILLION_ADDRESS_LEVELS_ARE_MODEL_ADDRESS_SPACES_NOT_PHYSICAL_DIMENSIONS'
]);

export const BIO_DOMAINS_R281=Object.freeze([
  'Nervous_System','Cardiovascular','Respiratory','Digestive','Endocrine','Immune_Inflammatory',
  'Musculoskeletal','Renal_Fluid','Sleep_Circadian','Cognitive_Attention','Emotional_Social','Environmental_Load'
] as const);

export const BIO_CONTEXT_LAYERS_R281=Object.freeze([
  'Cell','Tissue','Organ','System','Body','Behavior','Attention','Emotion','Relationship','Work_Environment','City_Planet','Future_Pattern'
] as const);

export const BIO_SCALE_LEVELS_R281=Object.freeze([
  'ORGANISM','ORGAN','TISSUE','CELL','ORGANELLE','MOLECULE','ATOM'
] as const);

export const BIO_INTEROP_TARGETS_R281=Object.freeze([
  'DEVICE_PACKET','JSON','CSV','FHIR_OBSERVATION_TARGET','DICOM_SR_TARGET','DICOM_IMAGE_REFERENCE_TARGET'
] as const);

export type BioSourceFormatR281=typeof BIO_INTEROP_TARGETS_R281[number];
export type BioInstrumentQualityR281='INSTRUMENT_READY'|'RESEARCH_ONLY'|'CALIBRATION_REQUIRED'|'REJECTED';
export type BioCalibrationStateR281='CURRENT'|'DUE_SOON'|'EXPIRED'|'UNKNOWN';

export type BioInstrumentSampleR281={
  id:string;
  domain:number;
  layer:number;
  variable:string;
  rawValue:number;
  unit:string;
  observedAt:string;
  sourceFormat?:BioSourceFormatR281;
  source:string;
  device:{
    id:string;
    manufacturer?:string;
    model?:string;
    serialHash?:string;
    acquisitionId?:string;
  };
  calibration?:{
    calibratedAt?:string;
    dueAt?:string;
    traceability?:string;
    standard?:string;
    gain?:number;
    offset?:number;
    gainUncertainty?:number;
    offsetUncertainty?:number;
  };
  uncertainty?:{
    instrument?:number;
    calibration?:number;
    repeatability?:number;
    resolution?:number;
    coverageFactor?:number;
  };
  limits?:{min?:number;max?:number};
  verified:boolean;
  maxAgeMs?:number;
};

export type CalibratedBioSampleR281=BioInstrumentSampleR281&{
  correctedValue:number;
  standardUncertainty:number;
  expandedUncertainty:number;
  relativeExpandedUncertainty:number|null;
  coverageFactor:number;
  calibrationState:BioCalibrationStateR281;
  quality:BioInstrumentQualityR281;
  errors:string[];
  warnings:string[];
};

const EPS=1e-12;
const finite=(x:any)=>Number.isFinite(Number(x));
const axis=(x:any)=>Math.max(1,Math.min(12,Math.floor(Number(x)||1)));
const validDate=(x:any)=>typeof x==='string'&&Number.isFinite(Date.parse(x));
const nonnegative=(x:any)=>finite(x)&&Number(x)>=0;
const fnv1a32=(text:string)=>{let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')};
const clamp01=(x:any)=>Math.max(0,Math.min(1,finite(x)?Number(x):0));

export function calibrationStateR281(sample:BioInstrumentSampleR281,nowMs=Date.now()):BioCalibrationStateR281{
  const c=sample.calibration;
  if(!c||!validDate(c.calibratedAt)||!validDate(c.dueAt))return'UNKNOWN';
  const due=Date.parse(c.dueAt!);
  if(due<nowMs)return'EXPIRED';
  if(due-nowMs<=30*24*60*60*1000)return'DUE_SOON';
  return'CURRENT';
}

export function calibrateBioInstrumentSampleR281(sample:BioInstrumentSampleR281,nowMs=Date.now()):CalibratedBioSampleR281{
  const errors:string[]=[],warnings:string[]=[];
  if(!sample?.id)errors.push('MISSING_ID');
  if(!(Number(sample?.domain)>=1&&Number(sample?.domain)<=12))errors.push('INVALID_DOMAIN');
  if(!(Number(sample?.layer)>=1&&Number(sample?.layer)<=12))errors.push('INVALID_LAYER');
  if(!sample?.variable)errors.push('MISSING_VARIABLE');
  if(!finite(sample?.rawValue))errors.push('NONFINITE_VALUE');
  if(!sample?.unit)errors.push('MISSING_UNIT');
  if(!validDate(sample?.observedAt))errors.push('INVALID_TIMESTAMP');
  if(!sample?.source)errors.push('MISSING_SOURCE');
  if(!sample?.device?.id)errors.push('MISSING_DEVICE_ID');
  if(!sample?.verified)errors.push('UNVERIFIED_SOURCE');
  const c=sample.calibration||{},u=sample.uncertainty||{};
  const gain=finite(c.gain)?Number(c.gain):1,offset=finite(c.offset)?Number(c.offset):0;
  if(!finite(c.gain)&&c.gain!=null)errors.push('INVALID_GAIN');
  if(!finite(c.offset)&&c.offset!=null)errors.push('INVALID_OFFSET');
  for(const [name,value] of Object.entries({instrument:u.instrument,calibration:u.calibration,repeatability:u.repeatability,resolution:u.resolution,gainUncertainty:c.gainUncertainty,offsetUncertainty:c.offsetUncertainty})){
    if(value!=null&&!nonnegative(value))errors.push(`INVALID_${name.toUpperCase()}`);
  }
  const raw=finite(sample.rawValue)?Number(sample.rawValue):0;
  const correctedValue=gain*raw+offset;
  const uInstrument=nonnegative(u.instrument)?Number(u.instrument):0;
  const uCalibration=nonnegative(u.calibration)?Number(u.calibration):0;
  const uRepeat=nonnegative(u.repeatability)?Number(u.repeatability):0;
  const uResolution=nonnegative(u.resolution)?Number(u.resolution)/Math.sqrt(12):0;
  const uGain=nonnegative(c.gainUncertainty)?Math.abs(raw)*Number(c.gainUncertainty):0;
  const uOffset=nonnegative(c.offsetUncertainty)?Number(c.offsetUncertainty):0;
  const standardUncertainty=Math.sqrt((gain*uInstrument)**2+uCalibration**2+uRepeat**2+uResolution**2+uGain**2+uOffset**2);
  const coverageFactor=finite(u.coverageFactor)&&Number(u.coverageFactor)>0?Number(u.coverageFactor):2;
  const expandedUncertainty=coverageFactor*standardUncertainty;
  const relativeExpandedUncertainty=Math.abs(correctedValue)>EPS?Math.abs(expandedUncertainty/correctedValue):null;
  const calibrationState=calibrationStateR281(sample,nowMs);
  if(calibrationState==='UNKNOWN')warnings.push('CALIBRATION_UNKNOWN');
  if(calibrationState==='DUE_SOON')warnings.push('CALIBRATION_DUE_SOON');
  if(calibrationState==='EXPIRED')errors.push('CALIBRATION_EXPIRED');
  if(!c.traceability)warnings.push('TRACEABILITY_MISSING');
  if(!c.standard)warnings.push('CALIBRATION_STANDARD_MISSING');
  if(standardUncertainty===0)warnings.push('UNCERTAINTY_NOT_DECLARED');
  if(sample.maxAgeMs&&validDate(sample.observedAt)&&nowMs-Date.parse(sample.observedAt)>sample.maxAgeMs)errors.push('STALE_MEASUREMENT');
  if(sample.limits?.min!=null&&finite(sample.limits.min)&&correctedValue<Number(sample.limits.min))warnings.push('BELOW_DECLARED_DEVICE_RANGE');
  if(sample.limits?.max!=null&&finite(sample.limits.max)&&correctedValue>Number(sample.limits.max))warnings.push('ABOVE_DECLARED_DEVICE_RANGE');
  let quality:BioInstrumentQualityR281='RESEARCH_ONLY';
  if(errors.length)quality='REJECTED';
  else if(calibrationState==='EXPIRED'||calibrationState==='UNKNOWN')quality='CALIBRATION_REQUIRED';
  else if(c.traceability&&c.standard&&standardUncertainty>0&&sample.verified)quality='INSTRUMENT_READY';
  return{...sample,domain:axis(sample.domain),layer:axis(sample.layer),correctedValue,standardUncertainty,expandedUncertainty,relativeExpandedUncertainty,coverageFactor,calibrationState,quality,errors,warnings};
}

function parseCsvLine(line:string){
  const out:string[]=[];let cur='',quoted=false;
  for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){out.push(cur);cur=''}else cur+=ch}
  out.push(cur);return out.map(x=>x.trim());
}
function asBool(x:any){return x===true||String(x).toLowerCase()==='true'||String(x)==='1'||String(x).toLowerCase()==='yes'}
function numOrUndefined(x:any){return x==null||x===''?undefined:Number(x)}

export function parseBioInstrumentTextR281(text:string,fileName='instrument.json'):BioInstrumentSampleR281[]{
  if(/\.json$/i.test(fileName)||text.trim().startsWith('[')||text.trim().startsWith('{')){
    const parsed=JSON.parse(text);const rows=Array.isArray(parsed)?parsed:Array.isArray(parsed?.samples)?parsed.samples:[parsed];
    return rows.map((x:any,i:number)=>({
      id:String(x.id||`sample-${i+1}`),domain:Number(x.domain),layer:Number(x.layer),variable:String(x.variable||''),rawValue:Number(x.rawValue??x.value),unit:String(x.unit||''),observedAt:String(x.observedAt||''),sourceFormat:(x.sourceFormat||'JSON') as BioSourceFormatR281,source:String(x.source||fileName),
      device:{id:String(x.device?.id||x.deviceId||''),manufacturer:x.device?.manufacturer,model:x.device?.model,serialHash:x.device?.serialHash,acquisitionId:x.device?.acquisitionId},
      calibration:x.calibration,uncertainty:x.uncertainty,limits:x.limits,verified:asBool(x.verified),maxAgeMs:numOrUndefined(x.maxAgeMs)
    }));
  }
  const lines=text.split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)return[];
  const headers=parseCsvLine(lines[0]).map(x=>x.trim());
  return lines.slice(1).map((line,i)=>{const cells=parseCsvLine(line),x:any={};headers.forEach((h,j)=>x[h]=cells[j]??'');return{
    id:String(x.id||`sample-${i+1}`),domain:Number(x.domain),layer:Number(x.layer),variable:String(x.variable||''),rawValue:Number(x.rawValue??x.value),unit:String(x.unit||''),observedAt:String(x.observedAt||''),sourceFormat:'CSV',source:String(x.source||fileName),
    device:{id:String(x.deviceId||''),manufacturer:x.manufacturer||undefined,model:x.model||undefined,serialHash:x.serialHash||undefined,acquisitionId:x.acquisitionId||undefined},
    calibration:{calibratedAt:x.calibratedAt||undefined,dueAt:x.dueAt||undefined,traceability:x.traceability||undefined,standard:x.calibrationStandard||undefined,gain:numOrUndefined(x.gain),offset:numOrUndefined(x.offset),gainUncertainty:numOrUndefined(x.gainUncertainty),offsetUncertainty:numOrUndefined(x.offsetUncertainty)},
    uncertainty:{instrument:numOrUndefined(x.instrumentUncertainty),calibration:numOrUndefined(x.calibrationUncertainty),repeatability:numOrUndefined(x.repeatabilityUncertainty),resolution:numOrUndefined(x.resolution),coverageFactor:numOrUndefined(x.coverageFactor)},
    limits:{min:numOrUndefined(x.min),max:numOrUndefined(x.max)},verified:asBool(x.verified),maxAgeMs:numOrUndefined(x.maxAgeMs)
  } as BioInstrumentSampleR281});
}

export function compileBioInstrumentFrameR281(record:any,samples:BioInstrumentSampleR281[]=[],nowMs=Date.now()){
  const calibrated=samples.map(x=>calibrateBioInstrumentSampleR281(x,nowMs));
  const accepted=calibrated.filter(x=>x.quality!=='REJECTED'),instrumentReady=calibrated.filter(x=>x.quality==='INSTRUMENT_READY');
  const modes=evaluateCanonAuthorityStack(record),realization=compileModeRealizationRegistryR280(record),realizationById=new Map(realization.rows.map(x=>[x.id,x]));
  const modeOverlays=modes.map(mode=>{const r=realizationById.get(mode.id);const stage=r?.stage||'CHARTED';const stageWeight=stage==='PROMOTED'?1:stage==='TESTED'?.82:stage==='IMPLEMENTED'?.62:stage==='GATED'?.25:.38;return{
    id:mode.id,name:mode.name,group:mode.group,activation:mode.activation,state:mode.state,realization:stage,experimentalWeight:clamp01(mode.activation*stageWeight),measurementAuthority:0,basis:mode.basis
  }});
  const domains=BIO_DOMAINS_R281.map((name,i)=>{const rows=accepted.filter(x=>x.domain===i+1),ready=instrumentReady.filter(x=>x.domain===i+1);return{index:i+1,name,samples:rows.length,instrumentReady:ready.length,meanRelativeUncertainty:ready.length?ready.reduce((n,x)=>n+(x.relativeExpandedUncertainty??0),0)/ready.length:null}});
  const layers=BIO_CONTEXT_LAYERS_R281.map((name,i)=>{const rows=accepted.filter(x=>x.layer===i+1),ready=instrumentReady.filter(x=>x.layer===i+1);return{index:i+1,name,samples:rows.length,instrumentReady:ready.length}});
  const readiness=instrumentReady.length?'INSTRUMENT_FRAME_READY':accepted.length?'VALIDATION_OR_CALIBRATION_REQUIRED':'NO_INSTRUMENT_DATA';
  const modelMetrics={continuity:clamp01(record?.metrics?.continuity),plasticity:clamp01(record?.metrics?.plasticity),contradiction:clamp01(record?.metrics?.contradiction),burden:clamp01(record?.metrics?.burden),scar:clamp01(record?.metrics?.scar),evidence:clamp01(record?.metrics?.evidence),decision:String(record?.metrics?.decision||'UNKNOWN')};
  const provenanceHash=fnv1a32(JSON.stringify(calibrated.map(x=>({id:x.id,source:x.source,device:x.device.id,observedAt:x.observedAt,value:x.correctedValue,unit:x.unit,u:x.expandedUncertainty,quality:x.quality}))));
  return{
    schema:BIO_INSTRUMENT_R281_SCHEMA,laws:BIO_INSTRUMENT_R281_LAWS,
    readiness,clinicalAuthority:'VALIDATION_REQUIRED',patientIdentityRequired:false,
    standardsTargets:{qualitySystem:'FDA_QMSR_ISO_13485_TARGET',softwareLifecycle:'IEC_62304_TARGET',riskManagement:'ISO_14971_TARGET',usability:'IEC_62366_1_TARGET',medicalImaging:'DICOM_2025D_TARGET',interoperability:'FHIR_OBSERVATION_TARGET',cybersecurity:'FDA_2026_CYBERSECURITY_GUIDANCE_TARGET'},
    measurement:{supplied:calibrated.length,accepted:accepted.length,instrumentReady:instrumentReady.length,rejected:calibrated.filter(x=>x.quality==='REJECTED').length,calibrationRequired:calibrated.filter(x=>x.quality==='CALIBRATION_REQUIRED').length,researchOnly:calibrated.filter(x=>x.quality==='RESEARCH_ONLY').length,provenanceHash,samples:calibrated},
    atlas:{domains,layers,physicalScale:[...BIO_SCALE_LEVELS_R281],materializedAddressSpace:20736,projectedAddressSpace:61917364224},
    model:{source:'CANON_PACKET_MODEL_ONLY',metrics:modelMetrics},
    allModes:{count:modeOverlays.length,measurementAuthority:0,overlays:modeOverlays,experimentalAggregate:modeOverlays.reduce((n,x)=>n+x.experimentalWeight,0)/Math.max(1,modeOverlays.length)},
    separation:{observed:'instrument packets with units/calibration/uncertainty/provenance',derived:'calibration correction and uncertainty propagation',model:'canonical packet and all-mode overlays',rule:'OBSERVED_NEVER_OVERWRITTEN_BY_DERIVED_OR_MODEL'},
    canonicalMutation:false,
    truthBoundary:'R281 is an instrument-accuracy and validation-readiness frame, not a declaration of medical-device clearance, clinical validity, or diagnostic performance. Instrument measurements remain dimensioned observations with explicit uncertainty and calibration provenance. All 62 canon modes are visible as experimental/model overlays with zero measurement authority; unproven modes cannot change observed values or create missing physiology.'
  };
}
