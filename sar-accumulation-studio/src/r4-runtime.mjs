// R4 is intentionally assembled as one ordered runtime rather than a collection of
// optional overlays. Each module participates in the same authoritative SAR camera.
import './sar-browser-transport-resilience.mjs';
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
import './data-native-terrain-runtime.mjs';
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
import './sar-experience-runtime.mjs';
import './sar-experience-compat-runtime.mjs';
import './sar-balanced-viewport-runtime.mjs';
import './sar-primary-workstation-runtime.mjs';
import './data-native-surface-runtime.mjs';

const runtime={
  release:'R4-R256',
  conception:'CONTINUOUS_SAR_EARTH_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE',
  visualState:'DATA_NATIVE_SHAPED_EARTH_SURFACE_WITH_CALIBRATED_SAR_LUMINANCE_DEM_NORMAL_RELIEF_DERIVED_WATER_GEOMETRY_AND_SOURCE_BACKED_MULTI_SCALE_CONTEXT',
  sourcePriority:['CALIBRATED_TARGET_SAR','CALIBRATED_REGIONAL_SAR','DATA_NATIVE_DEM_SHAPED_DISPLAY','SOURCE_SAR_GCP_REGISTERED','GLOBAL_SENTINEL1_ACQUISITION_FABRIC','OBSERVED_HISTORICAL_SURFACE_WATER_CONTEXT','TOPOGRAPHIC_WATER_GEOMETRY_CONTEXT','FRAME_SYNCHRONIZED_LIVE_EARTH_EVENTS','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  refreshPolicy:'CAMERA_SETTLED_GLOBAL_FABRIC_PLUS_MULTI_SCALE_DEM_STREAM_PLUS_TARGET_BOUND_PROVIDER_WATCH_5_MIN',
  geometry:{regionalMeasured:'ADAPTIVE_COG_OVERVIEW_CALIBRATED_AND_BLADE_REGISTERED',regionalSource:'SAFE_PRODUCT_GCP_BLADE_MESH_OR_FOOTPRINT_ONLY',globalSar:'RECENT_SENTINEL1_FOOTPRINT_TIME_COG_SUPPORT_FABRIC',localMeasured:'TWO_TRIANGLE_PER_REGISTERED_CELL',focus:'LOCAL_FORWARD_AND_INVERSE_JACOBIAN',exactLens:'MAGNIFIED_MEASURED_SOURCE_PIXELS_WITH_UNCHANGED_MAP_REGISTRATION',surfaceShaping:'CALIBRATED_SAR_LUMINANCE_PLUS_DEM_NORMAL_HILLSHADE_PLUS_MULTISCALE_SAR_TEXTURE',water:'DEM_GRADIENT_D8_ACCUMULATION_TOPOGRAPHIC_FLOW_POTENTIAL'},
  computation:{lemmaTranslator:'MODE188_EVIDENCE_ADMISSION_AND_RENDER_STATE_TRANSLATOR_APPLIED_TO_GLOBAL_FABRIC_AND_OMEGA_FIELD',wovenContinuity:'INVARIANT_CARRY_PLUS_SCAR_HISTORY_CARRY_ACROSS_DECLARED_FRAMES',cameraMotion:'FRAME_COALESCED_POINTER_PAN_PLUS_EXPONENTIAL_ZOOM_PLUS_BOUNDED_INERTIA',atlasLod:'12_TO_144_TO_1728_TO_20736_TO_248832_RENDER_ADDRESS_RESOLUTION',terrainLod:'CAMERA_BOUND_TERRARIUM_TILE_STREAM_TO_256_CELL_MAX_GRID',surfaceFusion:'MEASUREMENT_PRESERVING_DISPLAY_ONLY_FUSION',transport:'BOUNDED_BROWSER_AND_WORKER_RETRY_FOR_TRANSIENT_SENTINEL_NETWORK_FAILURES_ONLY'},
  experience:{defaultMode:'EXPLORE',layout:'SAR_PRIMARY_VIEW_WITH_40PX_COMMAND_STRIP_AND_BOUNDED_DRAWERS',modes:['EXPLORE','ANALYZE','PROOF'],primaryControls:['SEARCH','SAR','WORLD','FIT','DATA'],targetSelection:'EXPLICIT_TARGET_AUTO_ENTERS_REGIONAL_MEASURED_SCALE',cleanView:true,keyboard:['M_MISSION','E_EVIDENCE','A_ANALYSIS','F_CLEAN','ESC_CLOSE'],globalFabricVisual:'SUBORDINATE_SOURCE_SUPPORT_ONLY_WHEN_MEASURED_SAR_EXISTS',domContract:'LEGACY_STATUS_WRITES_PRESERVED_HIDDEN',viewportRule:'DATA_NATIVE_SHAPED_MEASURED_SAR_OWNS_THE_IMAGE_WHEN_AVAILABLE'},
  earthAwareness:{topography:'AWS_OPEN_DATA_TERRAIN_TILES_TERRARIUM_MULTI_SCALE',observedWater:'EC_JRC_GLOBAL_SURFACE_WATER_1984_2024_RGB_CONTEXT',events:['USGS_EARTHQUAKES','NASA_EONET'],temporalSync:'SAR_FRAME_TO_EVENT_TIME_AND_TARGET_DISTANCE',canonRole:'INTERPRETIVE_COMPUTATIONAL_CONTEXT_ONLY'},
  boundaries:{footprintIsPixel:false,globalFabricIsCalibratedMosaic:false,wovenMotionIsGroundVelocity:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false,terrainShapedDisplayCreatesMeasurement:false,topographicFlowPotentialIsObservedWater:false,jrcRgbTilesAreNumericWaterAnalysis:false,eventProximityImpliesCausation:false,exactLensMagnificationCreatesMeasurement:false,mode188CreatesPhysicalLaw:false,atlasAddressIsPhysicalDimension:false,canonIsPhysicalMeasurement:false,realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true}
};
globalThis.OMEGA_SAR_R4_RUNTIME=runtime;

function polish(){
  document.title='OMEGA SAR R4 · Data-Native Earth Surface';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='OMEGA SAR R4 R256 — source-backed SAR-first Earth workstation whose primary visual surface is shaped directly from calibrated Sentinel-1 backscatter, source DEM relief, derived water geometry and multi-scale Earth context while preserving strict measurement/provenance boundaries.';
  const identity=document.querySelector('.identity b');if(identity)identity.textContent='OMEGA SAR · R4';
  const sub=document.querySelector('.identity span');if(sub)sub.textContent='DATA-NATIVE EARTH SURFACE / CALIBRATED SAR / DEM RELIEF / MODE 188 / WOVEN CONTINUITY';
  const mission=document.querySelector('.mission-banner b');if(mission)mission.textContent='SAR-FIRST SHAPED EARTH · CALIBRATED BACKSCATTER → BLADE REGISTRATION → DEM NORMAL RELIEF → WATER GEOMETRY → MULTI-SCALE CONTINUITY';
  const chain=document.querySelector('.truth-chain');if(chain)chain.textContent='TARGET → SAR CAMERA → CALIBRATED COG → BLADE MESH → DATA-NATIVE SURFACE SHAPING → EXACT PATCH ↔ SOURCE LENS → EARTH CONTEXT → Ω FIELD → PROOF';
  const note=document.querySelector('.map-note');if(note)note.textContent='Measured SAR controls image luminance · DEM shapes relief · water geometry remains derived context · no synthetic SAR pixels';
  const visual=document.querySelector('#visual option[value="earth"]');if(visual)visual.textContent='Data-native shaped SAR Earth';
  const gibsCard=document.querySelector('#gibsEnabled')?.closest('.control-card');if(gibsCard){const kicker=gibsCard.querySelector('.card-kicker');if(kicker)kicker.textContent='OPTICAL ORIENTATION CONTEXT';}
  const earthHead=document.querySelector('#omegaEarthAwarenessHud header b');if(earthHead)earthHead.textContent='EARTH AWARENESS · R256';
  for(const p of document.querySelectorAll('.truth-body p')){
    if(/Earth imagery is the visual surface/i.test(p.textContent||''))p.innerHTML='<b>The Earth image is now data-native.</b> Calibrated SAR controls measured luminance; source DEM normals provide relief; derived drainage potential and observed historical water remain separately identified context. Surface shaping is display computation only and never alters the underlying SAR dB/power arrays.';
  }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else queueMicrotask(polish);}
