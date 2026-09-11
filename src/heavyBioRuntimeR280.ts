export const HEAVY_BIO_R280_SCHEMA='OMEGA_HEAVY_BIO_RUNTIME_R280' as const;
export const HEAVY_BIO_ATLAS_RESOLUTIONS_R280=Object.freeze([12,144,1728,20736,248832] as const);
export const HEAVY_BIO_PROJECTED_STATE_COUNT_R280=61917364224n;
export const HEAVY_BIO_R280_LAWS=Object.freeze([
  'BIOLOGICAL_MODEL_STATE_IS_NOT_A_MEDICAL_MEASUREMENT',
  'OBSERVED_INFERRED_AND_MODEL_DERIVED_VALUES_REMAIN_DISTINCT',
  'TWENTY_THOUSAND_SEVEN_HUNDRED_THIRTY_SIX_IS_A_MATERIALIZED_ATLAS_ADDRESS_SPACE_NOT_A_PHYSICAL_DIMENSION',
  'SIXTY_ONE_BILLION_NINE_HUNDRED_SEVENTEEN_MILLION_THREE_HUNDRED_SIXTY_FOUR_THOUSAND_TWO_HUNDRED_TWENTY_FOUR_IS_A_PROJECTED_ADDRESS_SPACE_NOT_A_MATERIALIZED_ROW_COUNT',
  'SCAR_IS_HISTORY_CARRY_AND_MUST_NOT_BE_SILENTLY_INTERPRETED_AS_INJURY',
  'INSUFFICIENT_OR_INVALID_EVIDENCE_RETURNS_HOLD_NOT_SYNTHETIC_BIOLOGICAL_TRUTH',
  'NO_DIAGNOSIS_TREATMENT_OR_CLINICAL_CLAIM_IS_CREATED_BY_THIS_RUNTIME'
]);

export const HEAVY_BIO_DOMAINS_R280=Object.freeze([
  'Structural','Metabolic','Neural','Sensory','Emotional','Cognitive',
  'Autonomic','Hormonal/Signaling','Immune/Inflammatory','Temporal','Meaning/Predictive','Integrative/Circulatory'
] as const);

export type HeavyBioEvidenceClassR280='MEASUREMENT'|'LAB'|'WEARABLE'|'OBSERVATION'|'STUDY'|'MODEL';
export type HeavyBioEvidenceR280={
  id:string;
  source:string;
  observedAt:string;
  domain:number;
  variable:string;
  value?:number|string;
  unit?:string;
  uncertainty?:number;
  evidenceClass:HeavyBioEvidenceClassR280;
  verified:boolean;
};
export type HeavyBioCoordinatesR280={
  domain:number;
  phase:number;
  regulation:number;
  layer:number;
  hiddenAxis?:number;
  observer?:number;
  star?:number;
  operator?:number;
  timeScale?:number;
  environment?:number;
};
export type HeavyBioStateR280={
  continuity:number;
  plasticity:number;
  contradiction:number;
  burden:number;
  scar:number;
  conductance:number;
  coherence:number;
};
export type HeavyBioEventR280={impact:number;persistence:number;weight?:number};
export type HeavyBioThresholdsR280={turn:number;stay:number;minimumEvidence:number};
export type HeavyBioDecisionR280='HOLD'|'ESCALATE'|'TURN'|'STAY';
export type HeavyBioInputR280={
  coordinates:HeavyBioCoordinatesR280;
  state:HeavyBioStateR280;
  evidence?:HeavyBioEvidenceR280[];
  event?:HeavyBioEventR280;
  thresholds?:Partial<HeavyBioThresholdsR280>;
  scarRetention?:number;
};

const EPS=1e-9;
const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const axis=(x:any)=>Math.max(1,Math.min(12,Math.floor(Number(x)||1)));
const validIso=(s:any)=>typeof s==='string'&&Number.isFinite(Date.parse(s));
const fnv1a32=(text:string)=>{let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')};

const EVIDENCE_WEIGHT:Record<HeavyBioEvidenceClassR280,number>={
  MEASUREMENT:1,
  LAB:1,
  WEARABLE:.82,
  OBSERVATION:.62,
  STUDY:.72,
  MODEL:.30
};

export function heavyBio20736AddressR280(c:Pick<HeavyBioCoordinatesR280,'domain'|'phase'|'regulation'|'layer'>){
  const d=axis(c.domain)-1,p=axis(c.phase)-1,r=axis(c.regulation)-1,l=axis(c.layer)-1;
  return (((d*12+p)*12+r)*12+l);
}

export function heavyBioProjectedAddressR280(c:HeavyBioCoordinatesR280){
  const values=[c.domain,c.phase,c.regulation,c.layer,c.hiddenAxis,c.observer,c.star,c.operator,c.timeScale,c.environment];
  if(values.some(v=>v==null))return null;
  let n=0n;
  for(const v of values)n=n*12n+BigInt(axis(v)-1);
  return (n+1n).toString();
}

function validateEvidence(e:HeavyBioEvidenceR280){
  const errors:string[]=[];
  if(!e?.id)errors.push('id');
  if(!e?.source)errors.push('source');
  if(!validIso(e?.observedAt))errors.push('observedAt');
  if(!e?.variable)errors.push('variable');
  if(!(Number(e?.domain)>=1&&Number(e?.domain)<=12))errors.push('domain');
  if(!e?.verified)errors.push('verified');
  if(typeof e?.value==='number'&&!e?.unit)errors.push('unit');
  if(e?.uncertainty!=null&&(!Number.isFinite(Number(e.uncertainty))||Number(e.uncertainty)<0))errors.push('uncertainty');
  const uncertainty=e?.uncertainty==null?.18:cl(e.uncertainty);
  const weight=errors.length?0:cl((EVIDENCE_WEIGHT[e.evidenceClass]??.25)*(1-.55*uncertainty));
  return{ok:errors.length===0,errors,weight};
}

export function compileHeavyBioStateR280(input:HeavyBioInputR280){
  const c={
    domain:axis(input.coordinates.domain),phase:axis(input.coordinates.phase),regulation:axis(input.coordinates.regulation),layer:axis(input.coordinates.layer),
    hiddenAxis:input.coordinates.hiddenAxis==null?undefined:axis(input.coordinates.hiddenAxis),
    observer:input.coordinates.observer==null?undefined:axis(input.coordinates.observer),
    star:input.coordinates.star==null?undefined:axis(input.coordinates.star),
    operator:input.coordinates.operator==null?undefined:axis(input.coordinates.operator),
    timeScale:input.coordinates.timeScale==null?undefined:axis(input.coordinates.timeScale),
    environment:input.coordinates.environment==null?undefined:axis(input.coordinates.environment)
  };
  const state={
    continuity:cl(input.state.continuity),plasticity:cl(input.state.plasticity),contradiction:cl(input.state.contradiction),burden:cl(input.state.burden),
    scar:cl(input.state.scar),conductance:cl(input.state.conductance),coherence:cl(input.state.coherence)
  };
  const evidenceRows=(input.evidence||[]).map(e=>({packet:e,validation:validateEvidence(e)}));
  const validEvidence=evidenceRows.filter(x=>x.validation.ok),invalidEvidence=evidenceRows.filter(x=>!x.validation.ok);
  const evidenceStrength=cl(validEvidence.reduce((n,x)=>n+x.validation.weight,0)/Math.max(1,validEvidence.length));
  const rawScore=(state.continuity*state.plasticity*state.conductance*state.coherence)/(state.burden+state.contradiction+state.scar+EPS);
  const normalizedScore=rawScore/(1+Math.abs(rawScore));
  const thresholds:HeavyBioThresholdsR280={
    turn:cl(input.thresholds?.turn??.35),stay:cl(input.thresholds?.stay??.65),minimumEvidence:cl(input.thresholds?.minimumEvidence??.35)
  };
  if(thresholds.stay<=thresholds.turn)thresholds.stay=Math.min(1,thresholds.turn+.15);
  let decision:HeavyBioDecisionR280='HOLD';
  if(evidenceStrength>=thresholds.minimumEvidence){
    decision=normalizedScore>=thresholds.stay?'STAY':normalizedScore>=thresholds.turn?'TURN':'ESCALATE';
  }
  const retention=cl(input.scarRetention??.82),event=input.event;
  const eventContribution=event?cl(event.impact)*cl(event.persistence)*cl(event.weight??1):0;
  const scarNext=cl(retention*state.scar+eventContribution);
  const atlasAddress=heavyBio20736AddressR280(c),projectedAddress=heavyBioProjectedAddressR280(c);
  const invariantCarry={domain:c.domain,atlasAddress,domainName:HEAVY_BIO_DOMAINS_R280[c.domain-1],evidenceBoundary:'OBSERVED_INFERRED_MODEL_SEPARATED'};
  const compact={c,state,evidenceStrength,rawScore,normalizedScore,decision,scarNext,atlasAddress,projectedAddress,invariantCarry};
  return{
    schema:HEAVY_BIO_R280_SCHEMA,laws:HEAVY_BIO_R280_LAWS,
    atlas:{materializedAddress:atlasAddress,materializedStateCount:20736,projectedAddress,projectedStateCount:HEAVY_BIO_PROJECTED_STATE_COUNT_R280.toString(),resolutionLevels:HEAVY_BIO_ATLAS_RESOLUTIONS_R280},
    coordinates:c,domainName:HEAVY_BIO_DOMAINS_R280[c.domain-1],state,
    evidence:{supplied:evidenceRows.length,valid:validEvidence.length,invalid:invalidEvidence.length,strength:evidenceStrength,packets:validEvidence.map(x=>({id:x.packet.id,source:x.packet.source,observedAt:x.packet.observedAt,domain:x.packet.domain,variable:x.packet.variable,value:x.packet.value??null,unit:x.packet.unit??null,class:x.packet.evidenceClass,weight:x.validation.weight})),invalidPackets:invalidEvidence.map(x=>({id:x.packet.id||null,errors:x.validation.errors}))},
    model:{rawScore,normalizedScore,decision,thresholds,authority:'MODEL_DERIVED_COORDINATION_SCORE_NOT_MEDICAL_MEASUREMENT'},
    continuity:{partition:{before:state},transform:'HEAVY_BIO_COORDINATION_UPDATE',invariantCarry,scarCarry:{previous:state.scar,retention,eventContribution,next:scarNext},recontextualized:{...state,scar:scarNext}},
    fingerprint:fnv1a32(JSON.stringify(compact)),canonicalMutation:false,
    truthBoundary:'R280 Heavy Bio is an evidence-gated computational atlas over explicit normalized inputs. It does not infer disease, diagnosis, treatment, physiology, or personal health from atlas coordinates. Higher address counts are representational projections, not physical dimensions or simultaneous materialized rows.'
  };
}
