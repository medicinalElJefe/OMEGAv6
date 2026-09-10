// R4 is intentionally assembled as one ordered runtime rather than a collection of
// optional overlays. Each module participates in the same authoritative SAR camera.
import './sar-authority.mjs';
import './map-navigation-runtime.mjs';
import './location.mjs';
import './sentinel-console.mjs';
import './sar-browse-overlay.mjs';
import './sar-earth-overlay.mjs';
import './sar-focus-runtime.mjs';
import './interaction-runtime.mjs';
import './omega-field-console.mjs';

globalThis.OMEGA_SAR_R4_RUNTIME={
  release:'R4',
  conception:'CONTINUOUS_SAR_EARTH_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE',
  sourcePriority:['CALIBRATED_SAR','SOURCE_SAR','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  boundaries:{footprintIsPixel:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false}
};
