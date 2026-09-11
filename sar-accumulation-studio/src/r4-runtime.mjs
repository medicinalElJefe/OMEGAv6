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
// R259 turns the already-charted Canon, Unified Coherence, Mode 188, Woven Continuity,
// measured calculus, terrain/water context and live source runtimes into one evidence
// cube and one render-authority path. Documented geodesy families are adapter contracts
// only until a source-proven adapter is connected.
import './earth-canon-adapters.mjs';
import './earth-canon-runtime.mjs';
import './earth-canon-detail-runtime.mjs';
import './earth-canon-compositor-runtime.mjs';

const runtime={
  release:'R4-R257',
  featureRelease:'R259',
  patchRelease:'R259.0',
  revision:'R259-FULL-CANON-EARTH-SYNTHESIS-CUBE-UNIFIED-COHERENCE-MODE188-DATA-NATIVE-SHAPE',
  conception:'CONTINUOUS_MULTI_SOURCE_EARTH_COMPUTATION_AND_SAR_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE_PLUS_CANONICAL_EVIDENCE_CUBE',
  canonMode:'FULL_OVERALL_CANON',
  coherenceMode:'UNIFIED_COHERENCE',
  mode188:'CHARTED_S_EQUALS_C_OVER_LAMBDA_PLUS_Q_PLUS_LAMBDAQ_GATE_WITH_EVIDENCE_ADMISSION_STATE_TRANSLATION_WITHOUT_PHYSICAL_PROMOTION',
  visualState:'ONE_AUTHORITATIVE_IMAGE_PLANE_WITH_CANONICAL_MEASURED_SHAPE_CALIBRATED_SENTINEL1_BLADE_REGISTRATION_MEASURED_SPATIAL_CALCULUS_COHERENT_DEM_CONTEXT_AND_RESERVED_TOOL_GEOMETRY',
  sourcePriority:['CALIBRATED_DEEP_TARGET_SAR','CALIBRATED_TARGET_SAR','CALIBRATED_REGIONAL_SAR','R259_CANONICAL_MEASURED_SHAPE','MEASURED_SPATIAL_CALCULUS_DISPLAY','DATA_NATIVE_DEM_SHAPED_DISPLAY','SOURCE_SAR_GCP_REGISTERED','GLOBAL_SENTINEL1_ACQUISITION_FABRIC','OBSERVED_HISTORICAL_SURFACE_WATER_CONTEXT','TOPOGRAPHIC_WATER_GEOMETRY_CONTEXT','FRAME_SYNCHRONIZED_LIVE_EARTH_EVENTS','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  refreshPolicy:'CANON_CUBE_EVENT_REBUILD_PLUS_NON_STARVABLE_BOOTSTRAP_PLUS_SAME_KEY_REGIONAL_READ_REUSE_PLUS_CAMERA_SETTLED_PROGRESSIVE_SOURCE_DETAIL_PLUS_GLOBAL_FABRIC_PLUS_Z12_DEM_STREAM_PLUS_TARGET_BOUND_PROVIDER_WATCH_5_MIN',
  geometry:{regionalMeasured:'ADAPTIVE_COG_OVERVIEW_448_TO_768_DISPLAY_SAMPLES_CALIBRATED_AND_BLADE_REGISTERED',regionalSource:'SAFE_PRODUCT_GCP_BLADE_MESH_OR_FOOTPRINT_ONLY_OUTSIDE_MEASURED_IMAGE_PLANE',globalSar:'RECENT_SENTINEL1_FOOTPRINT_TIME_COG_SUPPORT_FABRIC',localMeasured:'TWO_TRIANGLE_PER_REGISTERED_CELL',focus:'LOCAL_FORWARD_AND_INVERSE_JACOBIAN',exactLens:'PROGRESSIVE_64_TO_128_RADIUS_REAL_SOURCE_PIXEL_READ_WITH_DEEP_FIT_UP_TO_7600_SCALE',affineDeepDetail:'EXACT_DECLARED_STAC_AFFINE_TESSELLATED_TO_12_SEGMENTS_FOR_257PX_SOURCE_PATCH',surfaceShaping:'CALIBRATED_SAR_LUMINANCE_PLUS_SOURCE_BOUND_GRADIENT_CURVATURE_TEXTURE_ORIENTATION_PLUS_OPTIONAL_COHERENT_DEM_RELIEF',water:'DEM_GRADIENT_D8_ACCUMULATION_TOPOGRAPHIC_FLOW_POTENTIAL'},
  computation:{earthCube:'X_Y_Z_CONTEXT_T_SOURCE_PARAMETER_EVIDENCE_MODE_CANONICAL_PACKET_SPACE',measuredCalculus:'CALIBRATED_BACKSCATTER_DETAIL_PLUS_SPATIAL_GRADIENT_LAPLACIAN_LOCAL_TEXTURE_AND_BOUNDED_TARGET_TEMPORAL_DELTA_RATE_ROBUST_ANOMALY',lemmaTranslator:'MODE188_EVIDENCE_ADMISSION_AND_RENDER_STATE_TRANSLATOR_APPLIED_TO_GLOBAL_FABRIC_OMEGA_FIELD_AND_CANON_PACKET_SUMMARY',chartedMode188:'S_EQUALS_C_DIVIDED_BY_LAMBDA_PLUS_Q_PLUS_LAMBDA_Q_WITH_STAY_TURN_ESCALATE_AND_ACCEPT_CONDITIONAL_PRUNE',wovenContinuity:'INVARIANT_CARRY_PLUS_SCAR_HISTORY_CARRY_ACROSS_DECLARED_FRAMES',unifiedCoherence:'INDEPENDENT_SOURCE_SECTORS_AND_MEASURED_READS_REMAIN_USABLE_WHILE_TRANSIENT_FAILURES_ARE_CARRIED_AS_NON_PROMOTING_SCARS',constructPrune:'011_CONSTRUCT_AND_01_MINUS_1_PRUNE_APPLY_TO_DERIVED_ADMISSION_NOT_MEASURED_PIXEL_MUTATION',atlasLod:'12_TO_144_TO_1728_TO_20736_TO_248832_RENDER_ADDRESS_RESOLUTION_NOT_PHYSICAL_DIMENSIONS',cameraMotion:'FRAME_COALESCED_POINTER_PAN_PLUS_EXPONENTIAL_ZOOM_PLUS_BOUNDED_INERTIA',terrainLod:'CAMERA_BOUND_TERRARIUM_TILE_STREAM_TO_Z12_AND_384_CELL_MAX_GRID',surfaceFusion:'MEASUREMENT_PRESERVING_DISPLAY_ONLY_FUSION',detailPromotion:'INTERACTIVE_EXACT_MEASUREMENT_THEN_BACKGROUND_DEEP_SOURCE_MEASUREMENT_PROMOTION',transport:'BOUNDED_BROWSER_AND_WORKER_RETRY_PLUS_FAIL_PARTIAL_GLOBAL_METADATA_SCAR_LEDGER'},
  experience:{defaultMode:'EXPLORE',layout:'ONE_IMAGE_PLANE_WITH_RESERVED_PROOF_EVIDENCE_MISSION_AND_ANALYSIS_ZONES',commandGeometry:'SINGLE_NO_WRAP_PRIMARY_CONTROL_ROW_PLUS_COMPACT_ENGLISH_CANON_STATUS',modes:['EXPLORE','ANALYZE','PROOF'],primaryControls:['SEARCH','SAR','WORLD','FIT','DATA','MEASURED_CALCULUS_VIEW','CANON_ENGLISH_STATE'],targetSelection:'EXPLICIT_TARGET_AUTO_ENTERS_REGIONAL_MEASURED_SCALE',loading:'SAME_KEY_NON_STARVABLE_PROGRESSIVE_REAL_SOURCE_READ_WITH_EXISTING_EARTH_SURFACE_RETAINED_UNTIL_NEW_MEASUREMENT_IS_READY',panelCollisionPolicy:'DRAWERS_RESIZE_CAMERA_SURFACE_PROOF_OWNS_RESERVED_COLUMN_NO_FLOATING_PRECISION_STRIP',cleanView:true,keyboard:['M_MISSION','E_EVIDENCE','A_ANALYSIS','F_CLEAN','ESC_CLOSE'],globalFabricVisual:'SUBORDINATE_SOURCE_SUPPORT_ONLY_WHEN_MEASURED_SAR_EXISTS',domContract:'LEGACY_STATUS_WRITES_PRESERVED_BUT_HIDDEN_OR_REPARENTED',viewportRule:'MEASURED_CANONICAL_SHAPE_OWNS_IMAGE_WHEN_AVAILABLE_SPECIALIZED_DERIVED_VIEWS_ARE_USER_SELECTED'},
  earthAwareness:{topography:'AWS_OPEN_DATA_TERRAIN_TILES_TERRARIUM_MULTI_SCALE_Z12',observedWater:'EC_JRC_GLOBAL_SURFACE_WATER_1984_2024_RGB_CONTEXT',events:['USGS_EARTHQUAKES','NASA_EONET'],temporalSync:'SAR_FRAME_TO_EVENT_TIME_AND_TARGET_DISTANCE',documentedAdapters:['GNSS','STRAIN','SEISMIC','TILT','PORE_PRESSURE','ENVIRONMENT'],adapterRule:'DOCUMENTED_FAMILY_IS_NOT_LIVE_MEASUREMENT_UNTIL_REGISTERED_ADAPTER_PROVES_SOURCE_LINEAGE',canonRole:'MULTI_SOURCE_EVIDENCE_CONTEXT_WITH_EXPLICIT_PROVENANCE_AND_TRUTH_RANK'},
  boundaries:{footprintIsPixel:false,globalFabricIsCalibratedMosaic:false,unresolvedFabricSectorCreatesCoverage:false,wovenMotionIsGroundVelocity:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false,terrainShapedDisplayCreatesMeasurement:false,canonicalShapeCreatesMeasurement:false,spatialGradientCreatesMeasurement:false,spatialCurvatureCreatesMeasurement:false,localTextureCreatesMeasurement:false,temporalIntensityChangeIsDisplacement:false,temporalIntensityRateIsGroundVelocity:false,topographicFlowPotentialIsObservedWater:false,jrcRgbTilesAreNumericWaterAnalysis:false,eventProximityImpliesCausation:false,exactLensMagnificationCreatesMeasurement:false,deepDetailCreatesMeasurement:false,affineTessellationCreatesMeasurement:false,mode188CreatesPhysicalLaw:false,atlasAddressIsPhysicalDimension:false,canonIsPhysicalMeasurement:false,documentedAdapterIsLiveData:false,realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true}
};
globalThis.OMEGA_SAR_R4_RUNTIME=runtime;

function polish(){
  document.title='OMEGA SAR R4 · Canonical Earth Synthesis';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='OMEGA SAR R4 R259 — canonical multi-source Earth evidence cube with calibrated Sentinel-1 measured shape, blade georegistration, spatial/temporal measured calculus, coherent DEM/water context, Full Overall Canon, Unified Coherence, Mode 188 and explicit provenance boundaries.';
  const identity=document.querySelector('.identity b');if(identity)identity.textContent='OMEGA SAR · R4';
  const sub=document.querySelector('.identity span');if(sub)sub.textContent='R259 / MEASURED EARTH / CANON / MODE 188 / BLADE GEOMETRY / WOVEN CONTINUITY';
  const mission=document.querySelector('.mission-banner b');if(mission)mission.textContent='REAL EARTH EVIDENCE → CALIBRATION → REGISTRATION → CANON ADMISSION → MODE 188 → DATA-NATIVE SHAPE → PROOF';
  const chain=document.querySelector('.truth-chain');if(chain)chain.textContent='SOURCE → PROVENANCE → WGS84 → MEASURED / DERIVED / CONTEXT / RECONSTRUCTED → C / Λ / q → STAY / TURN / ESCALATE → IMAGE';
  const note=document.querySelector('.map-note');if(note)note.textContent='Measured SAR owns the image · Canon governs admission · context stays context · unknown stays unknown';
  const visual=document.querySelector('#visual option[value="earth"]');if(visual)visual.textContent='Canonical measured Earth';
  const gibsCard=document.querySelector('#gibsEnabled')?.closest('.control-card');if(gibsCard){const kicker=gibsCard.querySelector('.card-kicker');if(kicker)kicker.textContent='OPTICAL ORIENTATION CONTEXT';}
  const earthHead=document.querySelector('#omegaEarthAwarenessHud header b');if(earthHead)earthHead.textContent='EARTH AWARENESS · R259';
  for(const p of document.querySelectorAll('.truth-body p')){
    if(/Earth imagery is the visual surface|Earth image is now data-native|primary Earth image is data-native|primary image plane is source-bound SAR/i.test(p.textContent||''))p.innerHTML='<b>The primary image is the highest-authority source-backed Earth evidence available at the current frame.</b> Calibrated Sentinel-1 owns measured intensity; blade geometry registers source pixels to Earth; Canon and Mode 188 decide admission/priority; DEM, water and events remain identified context; bounded reconstruction stays subordinate; missing measurement remains unknown.';
  }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else queueMicrotask(polish);}
