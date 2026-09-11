import { mode188FromChart } from './earth-canon-cube.mjs';
import { domainStatusSnapshot, R260_ENGLISH_TRANSLATION } from './earth-canon-domain-registry.mjs';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const finite=v=>Number.isFinite(Number(v));

export function synthesizeCanonicalVisualField(cube,{terrainCoverage=0,temporalReady=false,structureReady=false}={}){
  if(!cube?.summary||!cube?.renderPlan)return Object.freeze({state:'WAITING_FOR_CANON',channels:null,boundary:'No Canon evidence cube is ready.'});
  const packets=cube.packets||[],s=cube.summary,total=Math.max(1,packets.length),measuredPackets=packets.filter(p=>p?.measured),derivedPackets=packets.filter(p=>p?.evidenceClass==='DERIVED_FROM_MEASURED'),contextPackets=packets.filter(p=>['CONTEXT','SOURCE_SUPPORT'].includes(p?.evidenceClass)),reconstructedPackets=packets.filter(p=>p?.evidenceClass==='RECONSTRUCTED'),unknownPackets=packets.filter(p=>p?.evidenceClass==='UNKNOWN');
  const measuredSupport=clamp(measuredPackets.length/Math.max(1,Math.min(3,total))),derivedSupport=clamp(derivedPackets.length/4),contextSupport=clamp(contextPackets.length/6),reconstructionSupport=clamp(reconstructedPackets.length/3),unknownSupport=clamp(unknownPackets.length/Math.max(1,total));
  const terrain=clamp(terrainCoverage),temporal=temporalReady?1:0,structure=structureReady?1:0,scarPressure=clamp((cube.scars?.length||0)/24),continuity=clamp(s.continuity),burden=clamp(s.burden+.35*scarPressure),contradiction=clamp(s.contradiction),gate=mode188FromChart({C:continuity,Lambda:burden,q:contradiction});
  const admissionGain=gate.admissibility==='ACCEPT'?1:(gate.admissibility==='CONDITIONAL'?0.74:0.42),hasMeasured=measuredPackets.length>0,exact=cube.renderPlan.authority==='EXACT_MEASURED_SAR',regional=cube.renderPlan.authority==='REGIONAL_MEASURED_SAR';
  const terrainMeasuredCap=exact?0.10:(regional?0.17:0.13),waterCap=hasMeasured?0.07:0.20,eventCap=hasMeasured?0.04:0.12,reconstructionCap=hasMeasured?0.02:0.16;
  // The measured image is never attenuated below authority 1. Derived channels only shape presentation.
  const channels=Object.freeze({
    measuredLuminance:hasMeasured?1:0,
    measuredStructure:hasMeasured?clamp((.12+.10*structure+.06*derivedSupport)*admissionGain,0,.28):0,
    localContrast:hasMeasured?clamp((.10+.08*structure+.04*continuity)*admissionGain,0,.22):0,
    terrainRelief:hasMeasured?clamp(terrain*terrainMeasuredCap*admissionGain,0,.18):clamp(terrain*.70,0,.72),
    waterContext:clamp(contextSupport*(hasMeasured?0.055:0.16)*admissionGain,0,waterCap),
    temporalChange:hasMeasured?clamp(temporal*(.07+.05*derivedSupport)*admissionGain,0,.12):0,
    eventContext:clamp(contextSupport*(hasMeasured?0.025:0.10),0,eventCap),
    reconstruction:clamp(reconstructionSupport*(hasMeasured?0.012:0.12)*admissionGain,0,reconstructionCap),
    uncertainty:clamp(.45*burden+.35*contradiction+.20*unknownSupport),
    scar:scarPressure
  });
  const detailPriority=clamp(.42*measuredSupport+.16*derivedSupport+.12*structure+.10*terrain+.08*temporal+.08*continuity+.04*(1-contradiction));
  const renderState=hasMeasured?(exact?'EXACT_MEASURED_STRUCTURE':regional?'REGIONAL_MEASURED_STRUCTURE':'MEASURED_STRUCTURE'):(terrain>0?'CONTEXTUAL_EARTH_STRUCTURE':'EARTH_SUPPORT_WAITING');
  return Object.freeze({
    state:'READY',schema:'omega.earth.visual-field.r260.v1',renderState,authority:cube.renderPlan.authority,primarySurface:cube.renderPlan.primarySurface,gate,detailPriority,channels,domainStatus:domainStatusSnapshot(packets),support:Object.freeze({measuredSupport,derivedSupport,contextSupport,reconstructionSupport,unknownSupport,terrain,temporal,structure,continuity,burden,contradiction}),english:Object.freeze({...R260_ENGLISH_TRANSLATION,current:`${renderState.replaceAll('_',' ')}. Mode 188 ${gate.decision} / ${gate.admissibility}. Measured luminance authority ${channels.measuredLuminance.toFixed(2)}; derived structure ${channels.measuredStructure.toFixed(2)}; terrain relief ${channels.terrainRelief.toFixed(2)}.`}),
    boundary:'R260 visual synthesis decides presentation weights only. Calibrated measurement stays the luminance authority. Structure tensors, spatial/temporal calculus, terrain, water, events, Canon variables and Woven Continuity remain derived/contextual operators and cannot create missing sensor samples, physical displacement, phase, coherence, elevation from SAR or causal claims.'
  });
}

export function visualFieldInvariant(field){
  if(!field?.channels)return {ok:false,reason:'NO_CHANNELS'};const c=field.channels;
  const finiteChannels=Object.values(c).every(finite),measurementSafe=c.measuredLuminance===0||c.measuredLuminance===1,derivedBounded=c.measuredStructure<=.28&&c.localContrast<=.22&&c.terrainRelief<=.72&&c.reconstruction<=.16;
  return {ok:finiteChannels&&measurementSafe&&derivedBounded,finiteChannels,measurementSafe,derivedBounded};
}
