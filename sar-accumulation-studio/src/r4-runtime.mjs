// R4 is intentionally assembled as one ordered runtime rather than a collection of
// optional overlays. Each module participates in the same authoritative SAR camera.
import './sar-authority.mjs';
import './sar-render-authority.mjs';
import './sar-blade-render-runtime.mjs';
import './map-navigation-runtime.mjs';
import './sar-smooth-motion-runtime.mjs';
import './location.mjs';
import './sentinel-console.mjs';
import './sar-measurement-authority.mjs';
import './sar-global-fabric-runtime.mjs';
import './sar-woven-motion-runtime.mjs';
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
import './omega-lemma-translator-runtime.mjs';
import './r4-live-precision.mjs';
import './r249-exact-lens-runtime.mjs';

const runtime={
  release:'R4-R251',
  conception:'CONTINUOUS_SAR_EARTH_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE',
  visualState:'GLOBAL_SOURCE_BACKED_SAR_EVIDENCE_FABRIC_PLUS_SMOOTH_INERTIAL_CAMERA_PLUS_MODE188_LEMMA_TRANSLATOR_PLUS_WOVEN_CONTINUITY_MOTION_PLUS_CALIBRATED_REGIONAL_AND_EXACT_SAR_PLUS_EARTH_AWARENESS',
  sourcePriority:['CALIBRATED_TARGET_SAR','CALIBRATED_REGIONAL_SAR','SOURCE_SAR_GCP_REGISTERED','GLOBAL_SENTINEL1_ACQUISITION_FABRIC','OBSERVED_HISTORICAL_SURFACE_WATER_CONTEXT','TOPOGRAPHIC_WATER_GEOMETRY_CONTEXT','FRAME_SYNCHRONIZED_LIVE_EARTH_EVENTS','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  refreshPolicy:'CAMERA_SETTLED_GLOBAL_FABRIC_PLUS_TARGET_BOUND_PROVIDER_WATCH_5_MIN',
  geometry:{regionalMeasured:'ADAPTIVE_COG_OVERVIEW_CALIBRATED_AND_BLADE_REGISTERED',regionalSource:'SAFE_PRODUCT_GCP_BLADE_MESH_OR_FOOTPRINT_ONLY',globalSar:'RECENT_SENTINEL1_FOOTPRINT_TIME_COG_SUPPORT_FABRIC',localMeasured:'TWO_TRIANGLE_PER_REGISTERED_CELL',focus:'LOCAL_FORWARD_AND_INVERSE_JACOBIAN',exactLens:'MAGNIFIED_MEASURED_SOURCE_PIXELS_WITH_UNCHANGED_MAP_REGISTRATION',water:'DEM_GRADIENT_D8_ACCUMULATION_TOPOGRAPHIC_FLOW_POTENTIAL'},
  computation:{lemmaTranslator:'MODE188_EVIDENCE_ADMISSION_AND_RENDER_STATE_TRANSLATOR_APPLIED_TO_GLOBAL_FABRIC_AND_OMEGA_FIELD',wovenContinuity:'INVARIANT_CARRY_PLUS_SCAR_HISTORY_CARRY_ACROSS_DECLARED_FRAMES',cameraMotion:'FRAME_COALESCED_POINTER_PAN_PLUS_EXPONENTIAL_ZOOM_PLUS_BOUNDED_INERTIA',atlasLod:'12_TO_144_TO_1728_TO_20736_TO_248832_RENDER_ADDRESS_RESOLUTION'},
  earthAwareness:{topography:'AWS_OPEN_DATA_TERRAIN_TILES',observedWater:'EC_JRC_GLOBAL_SURFACE_WATER_1984_2024_RGB_CONTEXT',events:['USGS_EARTHQUAKES','NASA_EONET'],temporalSync:'SAR_FRAME_TO_EVENT_TIME_AND_TARGET_DISTANCE',canonRole:'INTERPRETIVE_COMPUTATIONAL_CONTEXT_ONLY'},
  boundaries:{footprintIsPixel:false,globalFabricIsCalibratedMosaic:false,wovenMotionIsGroundVelocity:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false,topographicFlowPotentialIsObservedWater:false,jrcRgbTilesAreNumericWaterAnalysis:false,eventProximityImpliesCausation:false,exactLensMagnificationCreatesMeasurement:false,mode188CreatesPhysicalLaw:false,atlasAddressIsPhysicalDimension:false,canonIsPhysicalMeasurement:false,realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true}
};
globalThis.OMEGA_SAR_R4_RUNTIME=runtime;

function polish(){
  document.title='OMEGA SAR R4 · Continuous SAR Earth Instrument';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='OMEGA SAR R4 R251 — source-backed global Sentinel-1 acquisition fabric, frame-coalesced inertial Earth camera, Mode188 lemma-state evidence translator across the global and OMEGA fields, woven continuity motion projection, adaptive calibrated regional SAR, exact blade-registered local SAR, measured-source lens, water geometry and synchronized Earth-event awareness.';
  const identity=document.querySelector('.identity b');if(identity)identity.textContent='OMEGA SAR · R4';
  const sub=document.querySelector('.identity span');if(sub)sub.textContent='GLOBAL SAR FABRIC / SMOOTH WOVEN MOTION / MODE 188 LEMMA TRANSLATOR / EARTH AWARENESS';
  const mission=document.querySelector('.mission-banner b');if(mission)mission.textContent='SAR-FIRST EARTH STATE · GLOBAL SOURCE COVERAGE FABRIC → CALIBRATED REGIONAL → EXACT LOCAL · MODE188 TRANSLATION · WOVEN CONTINUITY MOTION · WATER + LIVE EARTH CONTEXT';
  const chain=document.querySelector('.truth-chain');if(chain)chain.textContent='CAMERA → GLOBAL SAR FABRIC → LEMMA/MODE188 → ACQUISITION → REGIONAL COG → CALIBRATION → BLADE MESH → EXACT PATCH ↔ SOURCE LENS → TOPO/WATER → FRAME ↔ WORLD EVENTS → Ω FIELD → LEMMA TRANSLATION → PROOF';
  const note=document.querySelector('.map-note');if(note)note.textContent='Smooth inertial Earth camera · recent Sentinel-1 coverage/time fabric · woven continuity motion display · adaptive calibrated regional COG · exact local blade mesh · explicit evidence boundaries';
  const visual=document.querySelector('#visual option[value="earth"]');if(visual)visual.textContent='Global SAR fabric + measured SAR + Earth awareness';
  const gibsCard=document.querySelector('#gibsEnabled')?.closest('.control-card');if(gibsCard){const kicker=gibsCard.querySelector('.card-kicker');if(kicker)kicker.textContent='OPTICAL ORIENTATION CONTEXT';}
  const earthHead=document.querySelector('#omegaEarthAwarenessHud header b');if(earthHead)earthHead.textContent='EARTH AWARENESS · R251';
  for(const p of document.querySelectorAll('.truth-body p')){
    if(/Earth imagery is the visual surface/i.test(p.textContent||''))p.innerHTML='<b>SAR evidence has explicit levels.</b> Exact/regional calibrated SAR are measured. The global fabric is source-backed acquisition coverage/time/COG support, not a calibrated pixel mosaic. Mode188/lemma and woven-continuity layers translate/admit/render bounded computational state; they do not manufacture measurements or new physical laws.';
  }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else queueMicrotask(polish);}
