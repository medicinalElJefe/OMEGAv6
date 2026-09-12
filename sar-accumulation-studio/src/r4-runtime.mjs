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
// R258.2 applies Unified Coherence to global metadata transport: one transient sector
// becomes an explicit scar and cannot stall unrelated source-backed sectors.
import './sar-global-fabric-coherence-transport.mjs';
import './sar-global-fabric-runtime.mjs';
// R258.4 guarantees an initial and camera-settled direct refresh so continuous
// map-view events cannot starve the source-fabric debounce before its first query.
import './sar-global-fabric-bootstrap-runtime.mjs';
import './sar-woven-motion-runtime.mjs';
import './earth-awareness-runtime.mjs';
import './earthscope-geodesy-runtime.mjs';
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
import './sar-r257-affine-detail-runtime.mjs';
import './sar-r257-detail-runtime.mjs';
import './sar-r257-experience-orchestrator.mjs';
import './sar-r258-calculus-runtime.mjs';
import './sar-r258-experience-runtime.mjs';
// R259 unifies the established modes and real Earth evidence into one explicit data cube,
// then makes the source-bound measured/calculus surface the visual authority.
import './canonical-earth-cube-runtime.mjs';
import './sar-r259-canonical-surface-runtime.mjs';

const runtime={
  release:'R4-R257',
  featureRelease:'R259',
  patchRelease:'R259.0',
  revision:'R259-CANONICAL-EARTH-DATA-CUBE-MULTISENSOR-COHERENCE-SURFACE',
  conception:'CONTINUOUS_SAR_EARTH_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE',
  canonMode:'FULL_OVERALL_CANON',
  coherenceMode:'UNIFIED_COHERENCE',
  mode188:'EVIDENCE_ADMISSION_STATE_TRANSLATION_WITHOUT_PHYSICAL_PROMOTION',
  visualState:'ONE_AUTHORITATIVE_DATA_NATIVE_IMAGE_PLANE_WITH_CALIBRATED_SENTINEL1_SPATIAL_CALCULUS_SOURCE_DEM_CONTEXT_EARTHSCOPE_GEODESY_AND_EXPLICIT_PROVENANCE',
  sourcePriority:['CALIBRATED_DEEP_TARGET_SAR','CALIBRATED_TARGET_SAR','CALIBRATED_REGIONAL_SAR','R259_CANONICAL_MEASURED_SURFACE','MEASURED_SPATIAL_CALCULUS_DISPLAY','CANONICAL_EARTH_DATA_CUBE','EARTHSCOPE_GNSS_MEASUREMENTS','DATA_NATIVE_DEM_SHAPED_DISPLAY','SOURCE_SAR_GCP_REGISTERED','GLOBAL_SENTINEL1_ACQUISITION_FABRIC','OBSERVED_HISTORICAL_SURFACE_WATER_CONTEXT','TOPOGRAPHIC_WATER_GEOMETRY_CONTEXT','FRAME_SYNCHRONIZED_LIVE_EARTH_EVENTS','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  refreshPolicy:'NON_STARVABLE_BOOTSTRAP_PLUS_SAME_KEY_REGIONAL_READ_REUSE_PLUS_CAMERA_SETTLED_PROGRESSIVE_SOURCE_DETAIL_PLUS_GLOBAL_FABRIC_PLUS_Z12_DEM_PLUS_EARTHSCOPE_GEODESY_PLUS_TARGET_BOUND_PROVIDER_WATCH',
  geometry:{regionalMeasured:'ADAPTIVE_COG_OVERVIEW_448_TO_768_DISPLAY_SAMPLES_CALIBRATED_AND_BLADE_REGISTERED',regionalSource:'SAFE_PRODUCT_GCP_BLADE_MESH_OR_FOOTPRINT_ONLY_OUTSIDE_MEASURED_IMAGE_PLANE',globalSar:'RECENT_SENTINEL1_FOOTPRINT_TIME_COG_SUPPORT_FABRIC',localMeasured:'TWO_TRIANGLE_PER_REGISTERED_CELL',focus:'LOCAL_FORWARD_AND_INVERSE_JACOBIAN',exactLens:'PROGRESSIVE_64_TO_128_RADIUS_REAL_SOURCE_PIXEL_READ_WITH_DEEP_FIT_UP_TO_7600_SCALE',affineDeepDetail:'EXACT_DECLARED_STAC_AFFINE_TESSELLATED_TO_12_SEGMENTS_FOR_257PX_SOURCE_PATCH',surfaceShaping:'CALIBRATED_SAR_LUMINANCE_PLUS_SOURCE_BOUND_GRADIENT_LAPLACIAN_TEXTURE_ORIENTATION_PLUS_OPTIONAL_DEM_NORMAL_RELIEF',water:'DEM_GRADIENT_D8_ACCUMULATION_TOPOGRAPHIC_FLOW_POTENTIAL'},
  computation:{measuredCalculus:'CALIBRATED_BACKSCATTER_DETAIL_PLUS_SPATIAL_GRADIENT_LAPLACIAN_LOCAL_TEXTURE_ORIENTATION_AND_BOUNDED_TARGET_TEMPORAL_DELTA_RATE_ROBUST_ANOMALY',canonicalEarthCube:'WGS84_X_Y_PLUS_SOURCED_Z_PLUS_TIME_PLUS_SOURCE_FAMILY_PLUS_PHYSICAL_OBSERVABLE_PLUS_EVIDENCE_CLASS_PLUS_MODE_OPERATOR',lemmaTranslator:'MODE188_EVIDENCE_ADMISSION_AND_RENDER_STATE_TRANSLATOR_APPLIED_TO_GLOBAL_FABRIC_OMEGA_FIELD_AND_CANONICAL_EARTH_FRAME',wovenContinuity:'INVARIANT_CARRY_PLUS_SCAR_HISTORY_CARRY_ACROSS_DECLARED_FRAMES',unifiedCoherence:'INDEPENDENT_SOURCE_FAMILIES_AND_SAME_KEY_MEASURED_READS_REMAIN_USABLE_WHILE_TRANSIENT_FAILURES_ARE_CARRIED_AS_NON_PROMOTING_SCARS',atlasLod:'12_TO_144_TO_1728_TO_20736_TO_248832_RENDER_ADDRESS_RESOLUTION',cameraMotion:'FRAME_COALESCED_POINTER_PAN_PLUS_EXPONENTIAL_ZOOM_PLUS_BOUNDED_INERTIA',terrainLod:'CAMERA_BOUND_TERRARIUM_TILE_STREAM_TO_Z12_AND_384_CELL_MAX_GRID',surfaceFusion:'MEASUREMENT_PRESERVING_DISPLAY_ONLY_FUSION',detailPromotion:'INTERACTIVE_EXACT_MEASUREMENT_THEN_BACKGROUND_DEEP_SOURCE_MEASUREMENT_PROMOTION',transport:'BOUNDED_BROWSER_AND_WORKER_RETRY_PLUS_FAIL_PARTIAL_GLOBAL_METADATA_AND_GEODESY_SCAR_LEDGER'},
  experience:{defaultMode:'EXPLORE',defaultDataView:'CANON_HD',layout:'ONE_IMAGE_PLANE_WITH_RESERVED_PROOF_EVIDENCE_MISSION_AND_ANALYSIS_ZONES',commandGeometry:'SINGLE_28PX_NO_WRAP_PRIMARY_CONTROL_ROW_INSIDE_36PX_RESERVED_DOCK',modes:['EXPLORE','ANALYZE','PROOF'],primaryControls:['SEARCH','SAR','WORLD','FIT','DATA','CANON_HD','MEASURED_CALCULUS_VIEW'],targetSelection:'EXPLICIT_TARGET_AUTO_ENTERS_REGIONAL_MEASURED_SCALE',loading:'SAME_KEY_NON_STARVABLE_PROGRESSIVE_REAL_SOURCE_READ_WITH_EXISTING_EARTH_SURFACE_RETAINED_UNTIL_NEW_MEASUREMENT_IS_READY',panelCollisionPolicy:'DRAWERS_RESIZE_CAMERA_SURFACE_PROOF_OWNS_RESERVED_COLUMN_NO_FLOATING_PRECISION_STRIP',cleanView:true,keyboard:['M_MISSION','E_EVIDENCE','A_ANALYSIS','F_CLEAN','ESC_CLOSE'],globalFabricVisual:'SUBORDINATE_SOURCE_SUPPORT_ONLY_WHEN_MEASURED_SAR_EXISTS',domContract:'LEGACY_STATUS_WRITES_PRESERVED_BUT_HIDDEN_OR_REPARENTED',viewportRule:'CALIBRATED_OR_DERIVED_SOURCE_BOUND_SURFACE_OWNS_IMAGE_WHEN_AVAILABLE'},
  earthAwareness:{topography:'AWS_OPEN_DATA_TERRAIN_TILES_TERRARIUM_MULTI_SCALE_Z12',observedWater:'EC_JRC_GLOBAL_SURFACE_WATER_1984_2024_RGB_CONTEXT',events:['USGS_EARTHQUAKES','NASA_EONET'],geodesy:'EARTHSCOPE_UNAVCO_GNSS_METADATA_POSITION_AND_VELOCITY_FAIL_PARTIAL',boreholeAdapters:['STRAIN_L2','TILT','PORE_PRESSURE','PORE_TEMPERATURE'],temporalSync:'SAR_FRAME_TO_EVENT_TIME_AND_TARGET_DISTANCE',canonRole:'INTERPRETIVE_COMPUTATIONAL_CONTEXT_ONLY'},
  boundaries:{footprintIsPixel:false,globalFabricIsCalibratedMosaic:false,unresolvedFabricSectorCreatesCoverage:false,wovenMotionIsGroundVelocity:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false,terrainShapedDisplayCreatesMeasurement:false,canonicalSurfaceCreatesMeasurement:false,spatialGradientCreatesMeasurement:false,spatialCurvatureCreatesMeasurement:false,localTextureCreatesMeasurement:false,temporalIntensityChangeIsDisplacement:false,temporalIntensityRateIsGroundVelocity:false,topographicFlowPotentialIsObservedWater:false,jrcRgbTilesAreNumericWaterAnalysis:false,eventProximityImpliesCausation:false,earthscopeStationMetadataIsDisplacement:false,geodesyFailureCreatesZeroMeasurement:false,exactLensMagnificationCreatesMeasurement:false,deepDetailCreatesMeasurement:false,affineTessellationCreatesMeasurement:false,mode188CreatesPhysicalLaw:false,atlasAddressIsPhysicalDimension:false,canonIsPhysicalMeasurement:false,realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true}
};
globalThis.OMEGA_SAR_R4_RUNTIME=runtime;

function polish(){
  document.title='OMEGA SAR R4 · Canonical Earth Data Plane';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='OMEGA SAR R4 R259 — calibrated Sentinel-1 source pixels, blade georegistration, source-bound spatial/temporal calculus, source DEM/water context, EarthScope geodesy, Full Overall Canon evidence hierarchy, Unified Coherence scar carry and Mode 188 admission in one canonical Earth data cube.';
  const identity=document.querySelector('.identity b');if(identity)identity.textContent='OMEGA SAR · R4';
  const sub=document.querySelector('.identity span');if(sub)sub.textContent='CANONICAL EARTH DATA PLANE / SENTINEL-1 / GEODESY / BLADE GEOMETRY / SPATIAL + TEMPORAL CALCULUS / WOVEN CONTINUITY';
  const mission=document.querySelector('.mission-banner b');if(mission)mission.textContent='SAR-FIRST CANONICAL EARTH PLANE · SOURCE PIXELS → EARTH REGISTRATION → MEASURED CALCULUS → MULTISENSOR COHERENCE → PROOF';
  const chain=document.querySelector('.truth-chain');if(chain)chain.textContent='TARGET → SOURCE EVIDENCE → WGS84 REGISTRATION → CANON / MODE188 ADMISSION → DATA CUBE → CANON HD SURFACE → PROOF';
  const note=document.querySelector('.map-note');if(note)note.textContent='Measured SAR owns the image plane · geodesy/terrain/events stay source-identified · derived calculus never becomes measurement';
  const visual=document.querySelector('#visual option[value="earth"]');if(visual)visual.textContent='Canonical measured Earth plane';
  const gibsCard=document.querySelector('#gibsEnabled')?.closest('.control-card');if(gibsCard){const kicker=gibsCard.querySelector('.card-kicker');if(kicker)kicker.textContent='OPTICAL ORIENTATION CONTEXT';}
  const earthHead=document.querySelector('#omegaEarthAwarenessHud header b');if(earthHead)earthHead.textContent='EARTH AWARENESS · R259';
  for(const p of document.querySelectorAll('.truth-body p')){
    if(/Earth imagery is the visual surface|Earth image is now data-native|primary Earth image is data-native/i.test(p.textContent||''))p.innerHTML='<b>The primary image plane is source-bound SAR whenever measured pixels are available.</b> Calibrated Sentinel-1 controls measured intensity; blade geometry registers source pixels to Earth; Full Overall Canon and Mode 188 control admission; Unified Coherence preserves valid partial sources and scars. Spatial calculus, DEM, water, events and geodesy remain explicitly typed measured/derived/context evidence.';
  }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else queueMicrotask(polish);}