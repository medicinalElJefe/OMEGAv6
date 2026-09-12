import { mode188FromChart } from './earth-canon-cube.mjs';
import { domainStatusSnapshot, R260_ENGLISH_TRANSLATION } from './earth-canon-domain-registry.mjs';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const finite=v=>Number.isFinite(Number(v));

export function synthesizeCanonicalVisualField(cube,{terrainCoverage=0,temporalReady=false,structureReady=false}={}){
  if(!cube?.summary||!cube?.renderPlan)return Object.freeze({state:'WAITING_FOR_CANON',channels:null,boundary:'No Canon evidence cube is ready.'});
  const packets=cube.packets||[],s=cube.summary,total=Math.max(1,packets.length),measuredPackets=packets.filter(p=>p?.measured),derivedPackets=packets.filter(p=>p?.evidenceClass==='DERIVED_FROM_MEASURED'),contextPackets=packets.filter(p=>['CONTEXT','SOURCE_SUPPORT'].includes(p?.evidenceClass)),reconstructedPackets=packets.filter(p=>p?.evidenceClass==='RECONSTRUCTED'),unknownPackets=packets.filter(p=>p?.evidenceClass==='UNKNOWN'),gnssMeasured=packets.filter(p=>p?.sourceFamily==='GNSS'&&p?.measured&&p?.canClaimLiveMeasurement===true),gnssDerived=packets.filter(p=>p?.sourceFamily==='GNSS'&&p?.evidenceClass==='DERIVED_FROM_MEASURED');
  const measuredSupport=clamp(measuredPackets.length/Math.max(1,Math.min(3,total))),derivedSupport=clamp(derivedPackets.length/4),contextSupport=clamp(contextPackets.length/6),reconstructionSupport=clamp(reconstructedPackets.length/3),unknownSupport=clamp(unknownPackets.length/Math.max(1,total)),geodesySupport=clamp(gnssMeasured.reduce((sum,p)=>sum+clamp(p.continuity),0)/Math.max(1,Math.min(6,gnssMeasured.length||1))),geodesyGradientSupport=clamp(gnssDerived.filter(p=>p.parameter==='gnss_velocity_gradient').reduce((sum,p)=>sum+clamp(p.continuity),0));
  const terrain=clamp(terrainCoverage),temporal=temporalReady?1:0,structure=structureReady?1:0,scarPressure=clamp((cube.scars?.length||0)/24),continuity=clamp(s.continuity),burden=clamp(s.burden+.35*scarPressure),contradiction=clamp(s.contradiction),gate=mode188FromChart({C:continuity,Lambda:burden,q:contradiction});
  const admissionGain=gate.admissibility==='ACCEPT'?1:(gate.admissibility==='CONDITIONAL'?0.74:0.42),hasMeasured=measuredPackets.length>0,exact=cube.renderPlan.authority==='EXACT_MEASURED_SAR',regional=cube.renderPlan.authority==='REGIONAL_MEASURED_SAR';
  const terrainMeasuredCap=exact?0.10:(regional?0.17:0.13),waterCap=hasMeasured?0.07:0.20,eventCap=hasMeasured?0.04:0.12,reconstructionCap=hasMeasured?0.02:0.16;
  // The measured SAR image is never attenuated below authority 1. Independent measured
  // geodesy is exposed as a bounded co-evidence channel and never rewrites SAR luminance.
  const channels=Object.freeze({
    measuredLuminance:hasMeasured?1:0,
    measuredStructure:hasMeasured?clamp((.12+.10*structure+.06*derivedSupport)*admissionGain,0,.28):0,
    localContrast:hasMeasured?clamp((.10+.08*structure+.04*continuity)*admissionGain,0,.22):0,
    terrainRelief:hasMeasured?clamp(terrain*terrainMeasuredCap*admissionGain,0,.18):clamp(terrain*.70,0,.72),
    waterContext:clamp(contextSupport*(hasMeasured?0.055:0.16)*admissionGain,0,waterCap),
    temporalChange:hasMeasured?clamp(temporal*(.07+.05*derivedSupport)*admissionGain,0,.12):0,
    geodesyVectors:clamp(geodesySupport*(hasMeasured?.16:.30)*admissionGain,0,.30),
    geodesyGradient:clamp(geodesyGradientSupport*(hasMeasured?.10:.18)*admissionGain,0,.18),
    eventContext:clamp(contextSupport*(hasMeasured?0.025:0.10),0,eventCap),
    reconstruction:clamp(reconstructionSupport*(hasMeasured?0.012:0.12)*admissionGain,0,reconstructionCap),
    uncertainty:clamp(.45*burden+.35*contradiction+.20*unknownSupport),
    scar:scarPressure
  });
  const detailPriority=clamp(.39*measuredSupport+.15*derivedSupport+.11*structure+.09*terrain+.07*temporal+.06*geodesySupport+.04*geodesyGradientSupport+.05*continuity+.04*(1-contradiction));
  const renderState=hasMeasured?(exact?'EXACT_MEASURED_STRUCTURE':regional?'REGIONAL_MEASURED_STRUCTURE':'MEASURED_STRUCTURE'):(terrain>0?'CONTEXTUAL_EARTH_STRUCTURE':'EARTH_SUPPORT_WAITING');
  return Object.freeze({
    state:'READY',schema:'omega.earth.visual-field.r261.v1',renderState,authority:cube.renderPlan.authority,primarySurface:cube.renderPlan.primarySurface,gate,detailPriority,channels,domainStatus:domainStatusSnapshot(packets),support:Object.freeze({measuredSupport,derivedSupport,contextSupport,reconstructionSupport,unknownSupport,terrain,temporal,structure,geodesySupport,geodesyGradientSupport,continuity,burden,contradiction}),english:Object.freeze({...R260_ENGLISH_TRANSLATION,current:`${renderState.replaceAll('_',' ')}. Mode 188 ${gate.decision} / ${gate.admissibility}. Measured SAR luminance authority ${channels.measuredLuminance.toFixed(2)}; source-derived structure ${channels.measuredStructure.toFixed(2)}; terrain relief ${channels.terrainRelief.toFixed(2)}; source-proven GNSS vector channel ${channels.geodesyVectors.toFixed(2)}.`}),
    boundary:'R261 visual synthesis decides presentation weights only. Calibrated SAR stays the primary image luminance when present. Source-proven GNSS velocities remain independent measured geodesy in their declared reference frame; the derived velocity gradient remains derived. Structure tensors, spatial/temporal calculus, terrain, water, events, Canon variables and Woven Continuity cannot create missing sensor samples, SAR phase/coherence/displacement, GNSS observations or causal claims.'
  });
}

export function visualFieldInvariant(field){
  if(!field?.channels)return {ok:false,reason:'NO_CHANNELS'};const c=field.channels;
  const finiteChannels=Object.values(c).every(finite),measurementSafe=c.measuredLuminance===0||c.measuredLuminance===1,derivedBounded=c.measuredStructure<=.28&&c.localContrast<=.22&&c.terrainRelief<=.72&&c.reconstruction<=.16&&c.geodesyVectors<=.30&&c.geodesyGradient<=.18;
  return {ok:finiteChannels&&measurementSafe&&derivedBounded,finiteChannels,measurementSafe,derivedBounded};
}