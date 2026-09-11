import { FOLD_SCALE_CANON } from './charted-canon.mjs';
import { translateLemmaState } from './lemma-state-calculus.mjs';

const finite=v=>Number.isFinite(Number(v));
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const nowIso=()=>new Date().toISOString();

export const EARTH_EVIDENCE_ORDER=Object.freeze({
  UNKNOWN:0,
  RECONSTRUCTED:1,
  CONTEXT:2,
  SOURCE_SUPPORT:3,
  DERIVED_FROM_MEASURED:4,
  REGISTERED_MEASURED:5,
  MEASURED:6
});

export const EARTH_SOURCE_FAMILIES=Object.freeze({
  SENTINEL1_SAR:{label:'Sentinel-1 SAR',kind:'SAR',status:'LIVE_RUNTIME',observable:'calibrated radar backscatter',evidence:'MEASURED'},
  NISAR:{label:'NISAR',kind:'SAR',status:'RUNTIME_WHEN_SOURCE_PROVEN',observable:'mission radar products',evidence:'MEASURED_WHEN_PRODUCT_PROVEN'},
  TERRARIUM_DEM:{label:'AWS Terrain Tiles / Terrarium',kind:'TOPOGRAPHY',status:'LIVE_RUNTIME',observable:'elevation',evidence:'CONTEXT'},
  JRC_WATER:{label:'EC JRC Global Surface Water',kind:'WATER',status:'LIVE_RUNTIME',observable:'historical surface-water cartography',evidence:'CONTEXT'},
  USGS_SEISMIC:{label:'USGS earthquakes',kind:'SEISMIC_EVENT',status:'LIVE_RUNTIME',observable:'earthquake event metadata',evidence:'CONTEXT'},
  NASA_EONET:{label:'NASA EONET',kind:'EARTH_EVENT',status:'LIVE_RUNTIME',observable:'natural-event metadata',evidence:'CONTEXT'},
  GNSS:{label:'GNSS / GPS geodesy',kind:'GEODESY',status:'DOCUMENTED_ADAPTER_PENDING',observable:'position / displacement / velocity time series',evidence:'MEASURED_WHEN_SOURCE_PROVEN'},
  STRAIN:{label:'Borehole strain',kind:'GEODESY',status:'DOCUMENTED_ADAPTER_PENDING',observable:'strain time series',evidence:'MEASURED_WHEN_SOURCE_PROVEN'},
  SEISMIC:{label:'Borehole / station seismic',kind:'SEISMOLOGY',status:'DOCUMENTED_ADAPTER_PENDING',observable:'seismic waveform / event state',evidence:'MEASURED_WHEN_SOURCE_PROVEN'},
  TILT:{label:'Tiltmeter',kind:'GEODESY',status:'DOCUMENTED_ADAPTER_PENDING',observable:'tilt / rotation time series',evidence:'MEASURED_WHEN_SOURCE_PROVEN'},
  PORE_PRESSURE:{label:'Pore pressure',kind:'HYDRO_GEOMECHANICS',status:'DOCUMENTED_ADAPTER_PENDING',observable:'subsurface fluid pressure',evidence:'MEASURED_WHEN_SOURCE_PROVEN'},
  ENVIRONMENT:{label:'Environmental station data',kind:'ENVIRONMENT',status:'DOCUMENTED_ADAPTER_PENDING',observable:'temperature / pressure / rainfall',evidence:'MEASURED_WHEN_SOURCE_PROVEN'},
  OMEGA_FIELD:{label:'OMEGA bounded field',kind:'DERIVED',status:'LIVE_RUNTIME',observable:'bounded reconstruction / continuity state',evidence:'RECONSTRUCTED'}
});

export const EARTH_CANON_ENGLISH=Object.freeze({
  C:'Continuity: how coherent, supported and connected the current state is.',
  Lambda:'Burden: unresolved load, missing support, mismatch or constraint carried by the state.',
  q:'Contradiction: disagreement, instability or evidence conflict that must remain visible.',
  Omega:'Omega: stabilized coherence after burden and contradiction are accounted for.',
  F:'Flow: the capacity for state, information or structure to move through the current constraints.',
  B:'Boundary: the constraint or host geometry that shapes flow.',
  K:'Curvature: local bending or change of direction in the declared field.',
  M:'Memory: history carried into the present state.',
  Scar:'Scar: retained unresolved history; a failure or gap is recorded rather than converted to zero.',
  Mode188:'Mode 188: evidence-state decision gate. It decides STAY, TURN or ESCALATE and ACCEPT, CONDITIONAL or PRUNE; it never creates a physical observation.',
  OverallCanon:'Full Overall Canon: measured evidence outranks derived/contextual state, provenance survives transforms, unknown remains unknown, and new physical claims require external validation.',
  UnifiedCoherence:'Unified Coherence: valid partial evidence remains usable when another source fails; failures become explicit scars rather than global collapse or invented values.',
  WovenContinuity:'Woven Continuity: constrained redistribution across declared frames with invariant carry, history/scar carry, orientation and recoverable path.',
  Atlas:'Atlas levels 12 → 144 → 1728 → 20,736 → 248,832 are address/render-resolution levels, not literal physical dimensions.',
  Construct011:'011 construct: promote or assemble a derived candidate only when evidence and admission rules permit it.',
  Prune01m1:'01-1 prune: suppress an unsupported or contradictory derived candidate without deleting the underlying evidence or scar.'
});

export function mode188FromChart({C=0,Lambda=0,q=0,tau=.08}={}){
  const c=Math.max(0,Number(C)||0),burden=Math.max(0,Number(Lambda)||0),contradiction=Math.max(0,Number(q)||0);
  const denominator=burden+contradiction+burden*contradiction;
  const S=denominator>1e-12?c/denominator:(c>0?Infinity:0);
  const decision=S>1?'STAY':S>=1-Math.max(0,Number(tau)||0)?'TURN':'ESCALATE';
  const admissibility=decision==='STAY'?'ACCEPT':decision==='TURN'?'CONDITIONAL':'PRUNE';
  return {S,decision,admissibility,C:c,Lambda:burden,q:contradiction,formula:'S = C / (Λ + q + Λq)',english:decision==='STAY'?'Current evidence is coherent enough to hold the present path.':decision==='TURN'?'The state is near the decision boundary; preserve evidence and change representation, source or scale.':'The current state carries too much burden/contradiction for strong admission; escalate evidence or prune only the unsupported derived claim.'};
}

function normalizeEvidenceClass(value='UNKNOWN'){
  const v=String(value||'UNKNOWN').toUpperCase();
  if(v==='MEASURED'||v==='MEASURED_EXACT'||v==='MEASURED_REGIONAL')return 'MEASURED';
  if(v==='REGISTERED_MEASURED')return v;
  if(v==='DERIVED'||v==='DERIVED_FROM_MEASURED')return 'DERIVED_FROM_MEASURED';
  if(v==='SOURCE_SUPPORT'||v==='SOURCE_COVERED')return 'SOURCE_SUPPORT';
  if(v==='CONTEXT'||v==='CONTEXT_ONLY')return 'CONTEXT';
  if(v==='RECONSTRUCTED'||v==='INFERRED'||v==='DERIVED_WOVEN_CONTINUITY')return 'RECONSTRUCTED';
  return 'UNKNOWN';
}

export function canonPacket(input={}){
  const evidenceClass=normalizeEvidenceClass(input.evidenceClass),rank=EARTH_EVIDENCE_ORDER[evidenceClass]??0,measured=evidenceClass==='MEASURED'||evidenceClass==='REGISTERED_MEASURED';
  const exactMeasured=measured&&!!input.exactMeasured,regionalMeasured=measured&&!exactMeasured&&!!input.regionalMeasured;
  const continuity=clamp01(input.continuity??input.confidence??(measured?1:0)),burden=Math.max(0,Number(input.burden)||0),contradiction=Math.max(0,Number(input.contradiction)||0),mode188=mode188FromChart({C:continuity,Lambda:burden,q:contradiction});
  const lemma=translateLemmaState({exactMeasured,regionalMeasured,sourceCoverage:Number(input.sourceCoverage)||0,fieldConfidence:continuity,gammaAdmission:measured?'ADMIT_MEASURED':mode188.admissibility==='ACCEPT'?'ADMIT_HIGH':mode188.admissibility==='CONDITIONAL'?'ADMIT_BOUNDED':'HOLD_LOW_CONFIDENCE',frameGapHours:Number(input.frameGapHours)||0,spatialOverlap:input.spatialOverlap??(measured?1:0),cameraVelocity:Number(input.cameraVelocity)||0,orientation:input.orientation??1,contradictions:contradiction>0?1:0,contextAvailable:evidenceClass==='CONTEXT'});
  const sourceFamily=String(input.sourceFamily||'UNKNOWN'),registry=EARTH_SOURCE_FAMILIES[sourceFamily]||null;
  const liveStatus=registry?.status||String(input.sourceStatus||'UNREGISTERED');
  const canClaimLiveMeasurement=measured&&liveStatus!=='DOCUMENTED_ADAPTER_PENDING'&&input.sourceProven!==false;
  return Object.freeze({
    schema:'omega.earth.canon.packet.v1',id:String(input.id||`${sourceFamily}:${input.parameter||'state'}:${input.time||nowIso()}`),sourceFamily,sourceStatus:liveStatus,parameter:String(input.parameter||registry?.observable||'state'),evidenceClass,rank,measured,exactMeasured,regionalMeasured,canClaimLiveMeasurement,
    position:input.position||null,time:input.time||null,resolution:input.resolution||null,coverage:input.coverage||null,value:input.value??null,units:input.units||null,provenance:input.provenance||null,
    continuity,burden,contradiction,omega:continuity/(1+burden+Math.abs(contradiction)),mode188,lemma,
    memory:input.memory||null,scar:input.scar||null,renderRole:input.renderRole||null,proofBoundary:input.proofBoundary||null,
    english:{source:registry?.label||sourceFamily,observable:registry?.observable||String(input.parameter||'state'),evidence:measured?'Direct or registered measurement.':evidenceClass==='DERIVED_FROM_MEASURED'?'Deterministic transform of measured evidence; not a new sensor observation.':evidenceClass==='CONTEXT'?'Real contextual source; not the primary SAR measurement.':evidenceClass==='SOURCE_SUPPORT'?'Real source coverage/support metadata; not calibrated measurement pixels.':evidenceClass==='RECONSTRUCTED'?'Bounded reconstruction/inference; never promoted to observation.':'Unresolved state preserved as unknown.',decision:mode188.english}
  });
}

function contradictionBetween(a,b){
  if(!a||!b)return 0;
  if(a.measured&&b.measured&&a.parameter===b.parameter&&finite(a.value)&&finite(b.value)){
    const scale=Math.max(1e-9,Math.abs(Number(a.value))+Math.abs(Number(b.value)));
    return clamp01(Math.abs(Number(a.value)-Number(b.value))/scale*2);
  }
  if(a.measured!==b.measured&&a.parameter===b.parameter&&finite(a.value)&&finite(b.value))return .15;
  return 0;
}

export function buildCanonicalEarthCube(packets=[],previous=null){
  const normalized=(packets||[]).filter(Boolean).map(p=>p?.schema==='omega.earth.canon.packet.v1'?p:canonPacket(p));
  const bySource={},byEvidence={},scars=[];let measured=0,derived=0,context=0,reconstructed=0,unknown=0,contradictionSum=0,contradictionPairs=0;
  for(const p of normalized){(bySource[p.sourceFamily]??=[]).push(p);(byEvidence[p.evidenceClass]??=[]).push(p);if(p.measured)measured++;else if(p.evidenceClass==='DERIVED_FROM_MEASURED')derived++;else if(p.evidenceClass==='CONTEXT'||p.evidenceClass==='SOURCE_SUPPORT')context++;else if(p.evidenceClass==='RECONSTRUCTED')reconstructed++;else unknown++;if(p.scar)scars.push({packet:p.id,source:p.sourceFamily,scar:p.scar});}
  for(let i=0;i<normalized.length;i++)for(let j=i+1;j<normalized.length;j++){const c=contradictionBetween(normalized[i],normalized[j]);if(c>0){contradictionSum+=c;contradictionPairs++;}}
  const measurementSupport=normalized.filter(p=>p.measured).reduce((s,p)=>s+p.continuity,0)/Math.max(1,measured),sourceDiversity=Object.keys(bySource).length,contradiction=contradictionPairs?contradictionSum/contradictionPairs:0;
  const missingPenalty=normalized.length?unknown/normalized.length:1,continuity=clamp01(.55*measurementSupport+.18*clamp01(sourceDiversity/6)+.17*(1-contradiction)+.10*(1-missingPenalty)),burden=clamp01(.48*missingPenalty+.30*clamp01(scars.length/Math.max(1,normalized.length))+.22*contradiction),gate=mode188FromChart({C:continuity,Lambda:burden,q:contradiction});
  const exact=normalized.some(p=>p.exactMeasured&&p.measured),regional=normalized.some(p=>p.regionalMeasured&&p.measured),terrain=normalized.some(p=>p.sourceFamily==='TERRARIUM_DEM'&&(p.evidenceClass==='CONTEXT'||p.evidenceClass==='DERIVED_FROM_MEASURED')),temporal=normalized.some(p=>p.parameter==='temporal_backscatter_change'&&p.evidenceClass==='DERIVED_FROM_MEASURED'),water=normalized.some(p=>p.sourceFamily==='JRC_WATER'||p.parameter==='topographic_flow_potential');
  const renderPlan={
    authority:exact?'EXACT_MEASURED_SAR':regional?'REGIONAL_MEASURED_SAR':measured?'MEASURED_EVIDENCE':'SOURCE_OR_CONTEXT_ONLY',
    primarySurface:exact?'EXACT_CANONICAL_SHAPE':regional?'REGIONAL_CANONICAL_SHAPE':terrain?'TERRAIN_RELIEF':'EARTH_CONTEXT',
    measuredWeight:exact?1:(regional?.98:(measured?.95:0)),
    terrainWeight:terrain?(measured?.32:.82):0,
    waterWeight:water?.14:0,
    temporalWeight:temporal?.22:0,
    reconstructionWeight:measured?.025:.18,
    contextCeiling:measured?.10:.72,
    modesAvailable:['MEASURED_DETAIL','MEASURED_SIGMA0','SPATIAL_GRADIENT','SPATIAL_CURVATURE','LOCAL_TEXTURE',...(terrain?['SAR_DEM_RELIEF']:[]),...(temporal?['TEMPORAL_CHANGE']:[]),...(water?['WATER_GEOMETRY_CONTEXT']:[]),'EVIDENCE_PROVENANCE','MODE188_COHERENCE'],
    rule:'Measured evidence owns the image. Derived fields shape or explain the display only when source-backed; context is subordinate; reconstruction never overwrites measurement; unknown stays unknown.'
  };
  const priorScars=Array.isArray(previous?.scars)?previous.scars:[],scarLedger=[...priorScars.slice(-96),...scars].slice(-128);
  return Object.freeze({schema:'omega.earth.canon.cube.v1',updatedAt:nowIso(),axes:['x','y','z/context','t','source','parameter','evidence','mode'],atlas:FOLD_SCALE_CANON.stateSpace,packets:normalized,bySource,byEvidence,summary:{packets:normalized.length,measured,derived,context,reconstructed,unknown,sourceDiversity,continuity,burden,contradiction,omega:continuity/(1+burden+Math.abs(contradiction)),mode188:gate},renderPlan,scars:scarLedger,english:EARTH_CANON_ENGLISH,boundary:'This cube is a provenance/evidence/computation structure. It does not convert context, reconstruction, catalog footprints, charted Canon variables, or documented future adapters into physical measurements.'});
}

export function englishCubeSummary(cube){
  if(!cube)return 'Earth Canon is not ready.';const s=cube.summary,r=cube.renderPlan;
  return `${r.authority.replaceAll('_',' ')}. ${s.measured} measured packet${s.measured===1?'':'s'}, ${s.derived} measured-derived, ${s.context} source/context, ${s.reconstructed} reconstructed, ${s.unknown} unresolved. Mode 188: ${s.mode188.decision} / ${s.mode188.admissibility}. Primary surface: ${r.primarySurface.replaceAll('_',' ')}.`;
}
