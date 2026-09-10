// R4 is intentionally assembled as one ordered runtime rather than a collection of
// optional overlays. Each module participates in the same authoritative SAR camera.
import './sar-authority.mjs';
import './sar-render-authority.mjs';
import './sar-blade-render-runtime.mjs';
import './map-navigation-runtime.mjs';
import './location.mjs';
import './sentinel-console.mjs';
import './sar-measurement-authority.mjs';
import './earth-awareness-runtime.mjs';
import './jrc-water-observation-runtime.mjs';
import './earth-temporal-sync.mjs';
import './sar-browse-overlay.mjs';
import './sar-regional-runtime.mjs';
import './sar-earth-overlay.mjs';
import './sar-blade-lens-runtime.mjs';
import './sar-focus-runtime.mjs';
import './interaction-runtime.mjs';
import './omega-field-console.mjs';
import './r4-live-precision.mjs';
import './r249-exact-lens-runtime.mjs';

const runtime={
  release:'R4-R249',
  conception:'CONTINUOUS_SAR_EARTH_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE',
  visualState:'ADAPTIVE_MEASURED_REGIONAL_SAR_PLUS_EXACT_BLADE_MESH_PLUS_MAGNIFIED_MEASURED_SOURCE_LENS_PLUS_TOPO_DERIVED_WATER_GEOMETRY_PLUS_OBSERVED_WATER_HISTORY_PLUS_FRAME_SYNCHRONIZED_LIVE_EARTH_EVENTS',
  sourcePriority:['CALIBRATED_TARGET_SAR','CALIBRATED_REGIONAL_SAR','SOURCE_SAR_GCP_REGISTERED','OBSERVED_HISTORICAL_SURFACE_WATER_CONTEXT','TOPOGRAPHIC_WATER_GEOMETRY_CONTEXT','FRAME_SYNCHRONIZED_LIVE_EARTH_EVENTS','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  refreshPolicy:'TARGET_BOUND_PROVIDER_WATCH_5_MIN',
  geometry:{regionalMeasured:'ADAPTIVE_COG_OVERVIEW_CALIBRATED_AND_BLADE_REGISTERED',regionalSource:'SAFE_PRODUCT_GCP_BLADE_MESH_OR_FOOTPRINT_ONLY',localMeasured:'TWO_TRIANGLE_PER_REGISTERED_CELL',focus:'LOCAL_FORWARD_AND_INVERSE_JACOBIAN',exactLens:'MAGNIFIED_MEASURED_SOURCE_PIXELS_WITH_UNCHANGED_MAP_REGISTRATION',water:'DEM_GRADIENT_D8_ACCUMULATION_TOPOGRAPHIC_FLOW_POTENTIAL'},
  earthAwareness:{topography:'AWS_OPEN_DATA_TERRAIN_TILES',observedWater:'EC_JRC_GLOBAL_SURFACE_WATER_1984_2024_RGB_CONTEXT',events:['USGS_EARTHQUAKES','NASA_EONET'],temporalSync:'SAR_FRAME_TO_EVENT_TIME_AND_TARGET_DISTANCE',canonRole:'INTERPRETIVE_COMPUTATIONAL_CONTEXT_ONLY'},
  boundaries:{footprintIsPixel:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false,topographicFlowPotentialIsObservedWater:false,jrcRgbTilesAreNumericWaterAnalysis:false,eventProximityImpliesCausation:false,exactLensMagnificationCreatesMeasurement:false,canonIsPhysicalMeasurement:false,realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true}
};
globalThis.OMEGA_SAR_R4_RUNTIME=runtime;

function polish(){
  document.title='OMEGA SAR R4 · Continuous SAR Earth Instrument';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='OMEGA SAR R4 — source-backed continuous SAR Earth instrument with adaptive measured Sentinel-1 regional calibration, exact blade-registered local SAR, a magnified measured-source lens, inverse-Jacobian focus, terrain-derived water geometry, EC JRC historical surface-water context, frame-synchronized live Earth-event awareness, bounded OMEGA reconstruction, and explicit evidence boundaries.';
  const identity=document.querySelector('.identity b');if(identity)identity.textContent='OMEGA SAR · R4';
  const sub=document.querySelector('.identity span');if(sub)sub.textContent='CONTINUOUS SAR EARTH / EXACT SOURCE LENS / WATER GEOMETRY / FRAME ↔ WORLD SYNCHRONIZATION';
  const mission=document.querySelector('.mission-banner b');if(mission)mission.textContent='SAR-FIRST EARTH STATE · CALIBRATED REGIONAL + EXACT LOCAL SENTINEL-1 / NISAR · MAGNIFIED SOURCE LENS · TOPOGRAPHY · DERIVED + OBSERVED WATER · SYNCHRONIZED LIVE EVENTS · BOUNDED Ω';
  const chain=document.querySelector('.truth-chain');if(chain)chain.textContent='TARGET → ACQUISITION → REGIONAL COG → CALIBRATION → GCP/BLADE MESH → EXACT PATCH ↔ SOURCE LENS → TOPOGRAPHY → WATER FLOW POTENTIAL ↔ OBSERVED WATER HISTORY → FRAME ↔ WORLD EVENTS → Ω FIELD → PROOF';
  const note=document.querySelector('.map-note');if(note)note.textContent='SAR-first Earth camera · exact measured-source lens · adaptive regional COG · local blade mesh · inverse focus · DEM drainage potential · JRC 1984–2024 surface-water context · synchronized sourced Earth events';
  const visual=document.querySelector('#visual option[value="earth"]');if(visual)visual.textContent='Continuous SAR + Earth awareness';
  const gibsCard=document.querySelector('#gibsEnabled')?.closest('.control-card');if(gibsCard){const kicker=gibsCard.querySelector('.card-kicker');if(kicker)kicker.textContent='OPTICAL ORIENTATION CONTEXT';}
  for(const p of document.querySelectorAll('.truth-body p')){
    if(/Earth imagery is the visual surface/i.test(p.textContent||''))p.innerHTML='<b>SAR is the primary evidence surface.</b> Regional/exact SAR are source measured. The exact lens magnifies source pixels without creating detail. JRC historical surface-water RGB, terrain, derived drainage potential, live-event metadata, GIBS, and OMEGA/Canon retain separate provenance; event proximity is relational context, not causal proof.';
  }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else queueMicrotask(polish);}
