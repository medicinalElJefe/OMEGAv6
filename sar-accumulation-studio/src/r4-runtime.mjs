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
// R257 owns final experience/layout priority and progressive real-source detail.
import './sar-r257-affine-detail-runtime.mjs';
import './sar-r257-detail-runtime.mjs';
import './sar-r257-experience-orchestrator.mjs';

const runtime={
  release:'R4-R257',
  conception:'CONTINUOUS_SAR_EARTH_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE',
  visualState:'HIGH_DETAIL_DATA_NATIVE_MEASURED_EARTH_WITH_PROGRESSIVE_SENTINEL1_SOURCE_READS_384_CELL_DEM_RELIEF_BLADE_REGISTRATION_AND_COLLISION_FREE_TELEMETRY',
  sourcePriority:['CALIBRATED_DEEP_TARGET_SAR','CALIBRATED_TARGET_SAR','CALIBRATED_REGIONAL_SAR','DATA_NATIVE_DEM_SHAPED_DISPLAY','SOURCE_SAR_GCP_REGISTERED','GLOBAL_SENTINEL1_ACQUISITION_FABRIC','OBSERVED_HISTORICAL_SURFACE_WATER_CONTEXT','TOPOGRAPHIC_WATER_GEOMETRY_CONTEXT','FRAME_SYNCHRONIZED_LIVE_EARTH_EVENTS','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  refreshPolicy:'CAMERA_SETTLED_PROGRESSIVE_SOURCE_DETAIL_PLUS_GLOBAL_FABRIC_PLUS_Z12_DEM_STREAM_PLUS_TARGET_BOUND_PROVIDER_WATCH_5_MIN',
  geometry:{regionalMeasured:'ADAPTIVE_COG_OVERVIEW_448_TO_768_DISPLAY_SAMPLES_CALIBRATED_AND_BLADE_REGISTERED',regionalSource:'SAFE_PRODUCT_GCP_BLADE_MESH_OR_FOOTPRINT_ONLY_IN_PROOF',globalSar:'RECENT_SENTINEL1_FOOTPRINT_TIME_COG_SUPPORT_FABRIC',localMeasured:'TWO_TRIANGLE_PER_REGISTERED_CELL',focus:'LOCAL_FORWARD_AND_INVERSE_JACOBIAN',exactLens:'PROGRESSIVE_64_TO_128_RADIUS_REAL_SOURCE_PIXEL_READ_WITH_DEEP_FIT_UP_TO_7600_SCALE',affineDeepDetail:'EXACT_DECLARED_STAC_AFFINE_TESSELLATED_TO_12_SEGMENTS_FOR_257PX_SOURCE_PATCH',surfaceShaping:'CALIBRATED_SAR_LUMINANCE_PLUS_DEM_NORMAL_HILLSHADE_PLUS_MULTISCALE_SAR_TEXTURE',water:'DEM_GRADIENT_D8_ACCUMULATION_TOPOGRAPHIC_FLOW_POTENTIAL'},
  computation:{lemmaTranslator:'MODE188_EVIDENCE_ADMISSION_AND_RENDER_STATE_TRANSLATOR_APPLIED_TO_GLOBAL_FABRIC_AND_OMEGA_FIELD',wovenContinuity:'INVARIANT_CARRY_PLUS_SCAR_HISTORY_CARRY_ACROSS_DECLARED_FRAMES',cameraMotion:'FRAME_COALESCED_POINTER_PAN_PLUS_EXPONENTIAL_ZOOM_PLUS_BOUNDED_INERTIA',atlasLod:'12_TO_144_TO_1728_TO_20736_TO_248832_RENDER_ADDRESS_RESOLUTION',terrainLod:'CAMERA_BOUND_TERRARIUM_TILE_STREAM_TO_Z12_AND_384_CELL_MAX_GRID',surfaceFusion:'MEASUREMENT_PRESERVING_DISPLAY_ONLY_FUSION',detailPromotion:'INTERACTIVE_EXACT_MEASUREMENT_THEN_BACKGROUND_DEEP_SOURCE_MEASUREMENT_PROMOTION',transport:'BOUNDED_BROWSER_AND_WORKER_RETRY_FOR_TRANSIENT_SENTINEL_NETWORK_FAILURES_ONLY'},
  experience:{defaultMode:'EXPLORE',layout:'SAR_PRIMARY_VIEW_WITH_COMMAND_STRIP_RESERVED_ZONES_BOUNDED_DRAWERS_AND_SINGLE_PROOF_TELEMETRY_STACK',modes:['EXPLORE','ANALYZE','PROOF'],primaryControls:['SEARCH','SAR','WORLD','FIT','DATA'],targetSelection:'EXPLICIT_TARGET_AUTO_ENTERS_REGIONAL_MEASURED_SCALE',loading:'PROGRESSIVE_STATUS_WITH_EXISTING_EARTH_SURFACE_RETAINED_UNTIL_NEW_MEASUREMENT_IS_READY',panelCollisionPolicy:'ONE_PROOF_STACK_PLUS_MUTUALLY_EXCLUSIVE_DRAWERS_AND_MAP_CONTROL_RESERVATION',cleanView:true,keyboard:['M_MISSION','E_EVIDENCE','A_ANALYSIS','F_CLEAN','ESC_CLOSE'],globalFabricVisual:'SUBORDINATE_SOURCE_SUPPORT_ONLY_WHEN_MEASURED_SAR_EXISTS',domContract:'LEGACY_STATUS_WRITES_PRESERVED_HIDDEN_OR_REPARENTED_IN_PROOF',viewportRule:'DATA_NATIVE_SHAPED_MEASURED_SAR_OWNS_THE_IMAGE_WHEN_AVAILABLE'},
  earthAwareness:{topography:'AWS_OPEN_DATA_TERRAIN_TILES_TERRARIUM_MULTI_SCALE_Z12',observedWater:'EC_JRC_GLOBAL_SURFACE_WATER_1984_2024_RGB_CONTEXT',events:['USGS_EARTHQUAKES','NASA_EONET'],temporalSync:'SAR_FRAME_TO_EVENT_TIME_AND_TARGET_DISTANCE',canonRole:'INTERPRETIVE_COMPUTATIONAL_CONTEXT_ONLY'},
  boundaries:{footprintIsPixel:false,globalFabricIsCalibratedMosaic:false,wovenMotionIsGroundVelocity:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false,terrainShapedDisplayCreatesMeasurement:false,topographicFlowPotentialIsObservedWater:false,jrcRgbTilesAreNumericWaterAnalysis:false,eventProximityImpliesCausation:false,exactLensMagnificationCreatesMeasurement:false,deepDetailCreatesMeasurement:false,affineTessellationCreatesMeasurement:false,mode188CreatesPhysicalLaw:false,atlasAddressIsPhysicalDimension:false,canonIsPhysicalMeasurement:false,realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true}
};
globalThis.OMEGA_SAR_R4_RUNTIME=runtime;

function polish(){
  document.title='OMEGA SAR R4 · High-Detail Measured Earth';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='OMEGA SAR R4 R257 — progressive high-detail SAR-first Earth workstation using larger real Sentinel-1 measurement reads, higher terrain LOD, blade registration, data-native surface shaping and a collision-free proof/layout system while preserving strict measurement/provenance boundaries.';
  const identity=document.querySelector('.identity b');if(identity)identity.textContent='OMEGA SAR · R4';
  const sub=document.querySelector('.identity span');if(sub)sub.textContent='HIGH-DETAIL MEASURED EARTH / SENTINEL-1 / DEM RELIEF / MODE 188 / WOVEN CONTINUITY';
  const mission=document.querySelector('.mission-banner b');if(mission)mission.textContent='SAR-FIRST HIGH DETAIL · CALIBRATED SOURCE PIXELS → BLADE REGISTRATION → DEM RELIEF → WATER GEOMETRY → MULTI-SCALE CONTINUITY';
  const chain=document.querySelector('.truth-chain');if(chain)chain.textContent='TARGET → SAR CAMERA → REGIONAL COG → PROGRESSIVE EXACT SOURCE READ → BLADE MESH → DATA-NATIVE SURFACE → DEEP FIT → Ω FIELD → PROOF';
  const note=document.querySelector('.map-note');if(note)note.textContent='Measured SAR controls luminance · higher detail reads more source pixels · DEM shapes relief · no synthetic SAR pixels';
  const visual=document.querySelector('#visual option[value="earth"]');if(visual)visual.textContent='High-detail measured SAR Earth';
  const gibsCard=document.querySelector('#gibsEnabled')?.closest('.control-card');if(gibsCard){const kicker=gibsCard.querySelector('.card-kicker');if(kicker)kicker.textContent='OPTICAL ORIENTATION CONTEXT';}
  const earthHead=document.querySelector('#omegaEarthAwarenessHud header b');if(earthHead)earthHead.textContent='EARTH AWARENESS · R257';
  for(const p of document.querySelectorAll('.truth-body p')){
    if(/Earth imagery is the visual surface|Earth image is now data-native/i.test(p.textContent||''))p.innerHTML='<b>The primary Earth image is data-native and progressively refined.</b> Calibrated Sentinel-1 controls measured luminance; larger source-backed reads increase real detail; source DEM normals provide relief; derived drainage potential and observed historical water remain separately identified context. Display shaping never alters the underlying SAR dB/power arrays.';
  }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else queueMicrotask(polish);}
