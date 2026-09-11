import { buildCanonicalEarthCube, canonPacket, EARTH_SOURCE_FAMILIES, EARTH_CANON_ENGLISH, englishCubeSummary } from './earth-canon-cube.mjs';

let timer=null,previousCube=null,generation=0;
const state={state:'INITIALIZING',release:'R259',cube:null,packets:[],updatedAt:null,error:null,documentedAdapters:Object.fromEntries(Object.entries(EARTH_SOURCE_FAMILIES).filter(([,v])=>v.status==='DOCUMENTED_ADAPTER_PENDING')),english:EARTH_CANON_ENGLISH,boundary:'R259 unifies already-proven runtime evidence into one Canon/Unified-Coherence/Mode-188 state. It does not make pending GNSS/strain/seismic/tilt/pore-pressure/environment adapters live and it does not promote context or reconstruction into measurement.'};
globalThis.OMEGA_EARTH_CANON=state;

const finite=v=>Number.isFinite(Number(v));
const ageHours=iso=>{const t=new Date(iso||0).getTime();return Number.isFinite(t)?Math.max(0,(Date.now()-t)/3600000):0;};
const renderer=()=>globalThis.OMEGA_SAR_RENDERER||null;

function exactPacket(){
  const p=renderer()?.sarOverlay?.patch;if(p?.state!=='CALIBRATED_SENTINEL1_TARGET_PATCH'||p?.evidence?.measured!==true)return null;
  return canonPacket({id:`exact:${p.id}:${p.startTime||''}`,sourceFamily:'SENTINEL1_SAR',parameter:'calibrated_backscatter',evidenceClass:'MEASURED',exactMeasured:true,continuity:1,burden:0,contradiction:0,position:p.target||null,time:p.startTime||null,value:finite(p.stats?.p50)?Number(p.stats.p50):null,units:'dB',resolution:{width:p.width,height:p.height,sourceWindow:p.sourceWindow||null},provenance:p.provenance||null,renderRole:'PRIMARY_EXACT_MEASURED_SURFACE',proofBoundary:p.boundary||'Calibrated source pixels remain measured; display transforms do not create new measurement.'});
}
function regionalPacket(){
  const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT,p=r?.patch;if(r?.state!=='READY'||p?.state!=='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'||p?.evidence?.measured!==true)return null;
  return canonPacket({id:`regional:${p.id}:${p.startTime||''}`,sourceFamily:'SENTINEL1_SAR',parameter:'calibrated_backscatter',evidenceClass:'MEASURED',regionalMeasured:true,continuity:.98,burden:p.processing?.overviewResampled?.03:0,contradiction:0,position:p.target||null,time:p.startTime||null,value:finite(p.stats?.p50)?Number(p.stats.p50):null,units:'dB',resolution:{width:p.width,height:p.height,sourceWindow:p.sourceWindow||null,overview:p.overview||null},coverage:p.coverageBbox||null,provenance:p.provenance||null,renderRole:'PRIMARY_REGIONAL_MEASURED_SURFACE',proofBoundary:p.boundary});
}
function globalFabricPacket(){
  const f=globalThis.OMEGA_SAR_GLOBAL_FABRIC;if(!f?.fabric||!Array.isArray(f.records))return null;const covered=f.fabric.cells?.filter?.(c=>c.coverage>0)?.length||0,total=f.fabric.cells?.length||0,coverage=total?covered/total:0,scars=Array.isArray(f.scarLedger)?f.scarLedger:[];
  return canonPacket({id:`fabric:${f.updatedAt||'current'}`,sourceFamily:'SENTINEL1_SAR',parameter:'acquisition_coverage_support',evidenceClass:'SOURCE_SUPPORT',sourceCoverage:f.records.length,continuity:Math.min(.92,.48+.40*coverage),burden:Math.min(1,scars.length/12),contradiction:0,time:f.updatedAt||null,coverage:f.fabric.bbox||null,value:f.records.length,units:'source records',memory:{previousFabric:!!f.previousFabric},scar:scars.length?{count:scars.length,recent:scars.slice(-6)}:null,renderRole:'SUBORDINATE_SOURCE_SUPPORT',proofBoundary:f.boundary});
}
function terrainPackets(){
  const t=globalThis.OMEGA_DATA_NATIVE_TERRAIN;if(t?.state!=='READY'||!t.terrain)return [];
  const terrain=canonPacket({id:`terrain:${t.updatedAt||'current'}`,sourceFamily:'TERRARIUM_DEM',parameter:'elevation',evidenceClass:'CONTEXT',continuity:.94,burden:0,contradiction:0,time:t.updatedAt||null,coverage:t.terrain.bbox||null,value:finite(t.terrain.max)&&finite(t.terrain.min)?Number(t.terrain.max)-Number(t.terrain.min):null,units:'m elevation span',resolution:{width:t.terrain.width,height:t.terrain.height,z:t.terrain.z,tileCount:t.terrain.tileCount},provenance:{source:t.terrain.source||t.policy?.source},renderRole:'SHAPE_CONTEXT',proofBoundary:t.boundary});
  const flow=t.water?.geometry?canonPacket({id:`water-geometry:${t.updatedAt||'current'}`,sourceFamily:'TERRARIUM_DEM',parameter:'topographic_flow_potential',evidenceClass:'CONTEXT',continuity:.84,burden:0,contradiction:0,time:t.updatedAt||null,coverage:t.terrain.bbox||null,provenance:{source:'DERIVED_FROM_SOURCE_DEM'},renderRole:'LOW_WEIGHT_SHAPE_CONTEXT',proofBoundary:'Slope, aspect, curvature and D8 drainage potential are derived from source DEM. They are not observed water, depth, discharge, flood extent or SAR measurement.'}):null;
  return flow?[terrain,flow]:[terrain];
}
function jrcPacket(){
  const w=globalThis.OMEGA_WATER_OBSERVATION;if(w?.state!=='READY')return null;
  return canonPacket({id:`jrc:${w.updatedAt||'current'}:${w.layer||'occurrence'}`,sourceFamily:'JRC_WATER',parameter:'historical_surface_water_context',evidenceClass:'CONTEXT',continuity:.88,burden:0,contradiction:0,time:w.updatedAt||null,value:Number(w.visibleTiles)||0,units:'visible tiles',provenance:{source:w.source,period:w.period,attribution:w.attribution},renderRole:'SUBORDINATE_WATER_CONTEXT',proofBoundary:w.analysisBoundary});
}
function eventPackets(){
  const a=globalThis.OMEGA_EARTH_AWARENESS;if(!Array.isArray(a?.events)||!a.events.length)return [];
  const usgs=a.events.filter(e=>e.authority==='USGS'),eonet=a.events.filter(e=>e.authority==='NASA_EONET'),out=[];
  if(usgs.length)out.push(canonPacket({id:`usgs-events:${a.eventsUpdatedAt||'current'}`,sourceFamily:'USGS_SEISMIC',parameter:'earthquake_event_metadata',evidenceClass:'CONTEXT',continuity:.90,burden:0,contradiction:0,time:a.eventsUpdatedAt||null,value:usgs.length,units:'events',renderRole:'EVENT_CONTEXT',proofBoundary:a.boundaries?.events}));
  if(eonet.length)out.push(canonPacket({id:`eonet-events:${a.eventsUpdatedAt||'current'}`,sourceFamily:'NASA_EONET',parameter:'natural_event_metadata',evidenceClass:'CONTEXT',continuity:.86,burden:0,contradiction:0,time:a.eventsUpdatedAt||null,value:eonet.length,units:'events',renderRole:'EVENT_CONTEXT',proofBoundary:a.boundaries?.events}));
  return out;
}
function temporalPacket(){
  const t=globalThis.OMEGA_SAR_R258_CALCULUS?.temporal;if(t?.state!=='MEASURED_TEMPORAL_CALCULUS_READY'||!(t.observations>0))return null;
  return canonPacket({id:`temporal:${t.lastTime||'current'}`,sourceFamily:'SENTINEL1_SAR',parameter:'temporal_backscatter_change',evidenceClass:'DERIVED_FROM_MEASURED',continuity:Math.min(.96,.62+.05*t.observations),burden:t.observations<3?.18:0,contradiction:0,time:t.lastTime||null,frameGapHours:Number(t.medianCadenceHours)||0,value:finite(t.deltaDb)?Number(t.deltaDb):null,units:'dB change',provenance:{measuredSamples:t.observations,first:t.firstTime,last:t.lastTime},renderRole:'TEMPORAL_DERIVED_SURFACE',proofBoundary:t.boundary});
}
function measuredCalculusPacket(){
  const c=globalThis.OMEGA_SAR_R258_CALCULUS;if(!c?.spatial||!c?.source?.evidence?.measured)return null;
  return canonPacket({id:`spatial-calculus:${c.source.id||'current'}:${c.source.width}x${c.source.height}`,sourceFamily:'SENTINEL1_SAR',parameter:'measured_spatial_calculus',evidenceClass:'DERIVED_FROM_MEASURED',continuity:.95,burden:c.spatial.spacingMeters?0:.08,contradiction:0,time:c.source.startTime||null,value:Number(c.spatial.stats?.validCount)||null,units:'valid calibrated samples',resolution:{width:c.source.width,height:c.source.height,metric:c.spatial.spacingMeters||c.spatial.metric||null},renderRole:'MEASURED_DERIVED_DETAIL',proofBoundary:c.spatial.boundary});
}
function omegaPacket(){
  const f=globalThis.OMEGA_SAR_FIELD_RUNTIME?.field;if(!f?.cells?.length)return null;const measured=f.cells.filter(c=>c.measured).length,inferred=f.cells.filter(c=>c.inferred).length,contradictions=Number(f.summary?.contradictions)||0;
  return canonPacket({id:`omega:${f.generatedAt||Date.now()}`,sourceFamily:'OMEGA_FIELD',parameter:'bounded_continuity_reconstruction',evidenceClass:'RECONSTRUCTED',continuity:Number(f.summary?.admittedFraction)||Number(f.summary?.coverage)||.35,burden:Math.min(1,(Number(f.summary?.holdFraction)||0)+contradictions/Math.max(1,f.cells.length)),contradiction:Math.min(1,contradictions/Math.max(1,f.cells.length)),value:inferred,units:'derived cells',sourceCoverage:measured,renderRole:'SUBORDINATE_RECONSTRUCTION',proofBoundary:f.boundary});
}
function collection(){return [exactPacket(),regionalPacket(),globalFabricPacket(),...terrainPackets(),jrcPacket(),...eventPackets(),measuredCalculusPacket(),temporalPacket(),omegaPacket()].filter(Boolean);}

function publish(cube){
  state.cube=cube;state.packets=cube.packets;state.updatedAt=cube.updatedAt;state.state='READY';state.error=null;globalThis.OMEGA_EARTH_CANON_CUBE=cube;
  window.dispatchEvent(new CustomEvent('omega-earth-canon-update',{detail:{updatedAt:cube.updatedAt,summary:cube.summary,renderPlan:cube.renderPlan,english:englishCubeSummary(cube),scars:cube.scars.slice(-12)}}));
}
function rebuild(){
  const my=++generation;
  try{const packets=collection(),cube=buildCanonicalEarthCube(packets,previousCube);if(my!==generation)return;previousCube=cube;publish(cube);}catch(error){if(my!==generation)return;state.state='ERROR';state.error=error.message;window.dispatchEvent(new CustomEvent('omega-earth-canon-error',{detail:{error:error.message}}));}
}
function schedule(delay=42){clearTimeout(timer);timer=setTimeout(rebuild,delay);}
function install(){
  const events=['omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear','omega-regional-sar-measurement','omega-global-sar-fabric-update','omega-data-native-terrain','omega-earth-awareness-update','omega-r258-temporal-calculus','omega-water-observation-update','omega-field-update','omega-r257-deep-detail'];
  for(const name of events)window.addEventListener(name,()=>schedule(name.includes('terrain')?90:35));
  document.querySelector('#map')?.addEventListener('omega-map-select',()=>schedule(40));
  document.querySelector('#map')?.addEventListener('omega-map-view',()=>schedule(120));
  schedule(120);setInterval(()=>schedule(0),5000);state.rebuild=rebuild;state.schedule=schedule;
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
