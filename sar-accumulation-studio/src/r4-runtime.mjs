// R4 is intentionally assembled as one ordered runtime rather than a collection of
// optional overlays. Each module participates in the same authoritative SAR camera.
import './sar-authority.mjs';
import './sar-render-authority.mjs';
import './map-navigation-runtime.mjs';
import './location.mjs';
import './sentinel-console.mjs';
import './sar-measurement-authority.mjs';
import './sar-browse-overlay.mjs';
import './sar-earth-overlay.mjs';
import './sar-focus-runtime.mjs';
import './interaction-runtime.mjs';
import './omega-field-console.mjs';
import './r4-live-precision.mjs';

const runtime={
  release:'R4',
  conception:'CONTINUOUS_SAR_EARTH_INSTRUMENT',
  authority:'SINGLE_WGS84_TARGET_SCENE_CAMERA_SPINE',
  visualState:'HIGH_FIDELITY_MEASURED_MESH_PLUS_LIVE_PRECISION',
  sourcePriority:['CALIBRATED_SAR','SOURCE_SAR','OMEGA_BOUNDED_RECONSTRUCTION','EARTH_CONTEXT'],
  refreshPolicy:'TARGET_BOUND_PROVIDER_WATCH_5_MIN',
  boundaries:{footprintIsPixel:false,browseIsMeasurement:false,inferenceIsObservation:false,earthContextIsSar:false,realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true}
};
globalThis.OMEGA_SAR_R4_RUNTIME=runtime;

function polish(){
  document.title='OMEGA SAR R4 · Continuous SAR Earth Instrument';
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content='OMEGA SAR R4 — source-backed continuous SAR Earth instrument with measured Sentinel-1 calibration, georegistered local pixel patches, bounded OMEGA reconstruction, temporal accumulation, live provider watch, and explicit proof boundaries.';
  const identity=document.querySelector('.identity b');if(identity)identity.textContent='OMEGA SAR · R4';
  const sub=document.querySelector('.identity span');if(sub)sub.textContent='CONTINUOUS SAR EARTH / LIVE PRECISION / TEMPORAL EVIDENCE WORKSTATION';
  const mission=document.querySelector('.mission-banner b');if(mission)mission.textContent='SAR-FIRST EARTH STATE · MEASURED SENTINEL-1 / NISAR + BOUNDED OMEGA RECONSTRUCTION';
  const chain=document.querySelector('.truth-chain');if(chain)chain.textContent='TARGET → ACQUISITION → SOURCE SAR → GEOLOCATION → CALIBRATION → MEASURED MESH → Ω FIELD → TEMPORAL MOTION → PROOF';
  const note=document.querySelector('.map-note');if(note)note.textContent='SAR-first Earth camera · exact measured mesh at local scale · bounded Ω field between observations · provider freshness shown explicitly · drag view · wheel zoom · click binds target';
  const visual=document.querySelector('#visual option[value="earth"]');if(visual)visual.textContent='Continuous SAR Earth field';
  const gibsCard=document.querySelector('#gibsEnabled')?.closest('.control-card');if(gibsCard){const kicker=gibsCard.querySelector('.card-kicker');if(kicker)kicker.textContent='OPTICAL ORIENTATION CONTEXT';}
  for(const p of document.querySelectorAll('.truth-body p')){
    if(/Earth imagery is the visual surface/i.test(p.textContent||''))p.innerHTML='<b>SAR is the primary evidence surface.</b> NASA GIBS is subordinate georegistered Earth context only; it never replaces or becomes a SAR measurement.';
  }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else queueMicrotask(polish);}
