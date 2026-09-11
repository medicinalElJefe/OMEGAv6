export const R260_DOMAIN_REGISTRY=Object.freeze({
  SENTINEL1_SAR:Object.freeze({label:'Sentinel-1 calibrated SAR',family:'SAR',status:'LIVE',observables:['calibrated_backscatter','acquisition_time','polarization','registered_source_geometry'],units:['dB','UTC','source pixel','WGS84'],visualRole:'PRIMARY_MEASURED_IMAGE',truth:'Measured only when calibration, source lineage and georegistration are proven.'}),
  NISAR:Object.freeze({label:'NISAR radar products',family:'SAR',status:'SOURCE_PROVEN_ONLY',observables:['mission_radar_product','acquisition_time','polarization'],units:['source declared'],visualRole:'PRIMARY_MEASURED_IMAGE_WHEN_PROVEN',truth:'No measurement authority without a resolved source product.'}),
  TERRARIUM_DEM:Object.freeze({label:'Source DEM terrain',family:'TOPOGRAPHY',status:'LIVE_CONTEXT',observables:['elevation','slope','aspect','curvature','topographic_flow_potential'],units:['m','derived'],visualRole:'SHAPE_CONTEXT',truth:'Elevation is source terrain context; slope, aspect, curvature and flow potential are derived from it.'}),
  JRC_WATER:Object.freeze({label:'Historical surface-water context',family:'WATER',status:'LIVE_CONTEXT',observables:['historical_surface_water_cartography'],units:['provider display'],visualRole:'SUBORDINATE_CONTEXT',truth:'Provider cartography is context and is not water depth, discharge or live flood measurement.'}),
  USGS_SEISMIC:Object.freeze({label:'USGS earthquake events',family:'SEISMIC',status:'LIVE_CONTEXT',observables:['event_time','location','magnitude'],units:['UTC','WGS84','magnitude'],visualRole:'EVENT_CONTEXT',truth:'Event proximity is context and does not establish causation.'}),
  NASA_EONET:Object.freeze({label:'NASA EONET events',family:'EARTH_EVENT',status:'LIVE_CONTEXT',observables:['event_time','location','category'],units:['UTC','WGS84'],visualRole:'EVENT_CONTEXT',truth:'Event metadata is context and never SAR measurement.'}),
  GNSS:Object.freeze({label:'GNSS / GPS geodesy',family:'GEODESY',status:'ADAPTER_PENDING',observables:['position','displacement','velocity_time_series'],units:['source declared'],visualRole:'VECTOR_OR_TIME_SERIES_WHEN_PROVEN',truth:'Schema is available now; measured authority requires a source-proven adapter.'}),
  STRAIN:Object.freeze({label:'Borehole strain',family:'GEODESY',status:'ADAPTER_PENDING',observables:['strain_time_series'],units:['source declared'],visualRole:'FIELD_OR_TIME_SERIES_WHEN_PROVEN',truth:'Schema is available now; measured authority requires a source-proven adapter.'}),
  SEISMIC:Object.freeze({label:'Station seismic',family:'SEISMOLOGY',status:'ADAPTER_PENDING',observables:['waveform','station_state'],units:['source declared'],visualRole:'WAVEFORM_OR_EVENT_FIELD_WHEN_PROVEN',truth:'Schema is available now; measured authority requires a source-proven adapter.'}),
  TILT:Object.freeze({label:'Tiltmeter',family:'GEODESY',status:'ADAPTER_PENDING',observables:['tilt','rotation_time_series'],units:['source declared'],visualRole:'ORIENTATION_FIELD_WHEN_PROVEN',truth:'Schema is available now; measured authority requires a source-proven adapter.'}),
  PORE_PRESSURE:Object.freeze({label:'Pore pressure',family:'HYDRO_GEOMECHANICS',status:'ADAPTER_PENDING',observables:['subsurface_fluid_pressure'],units:['source declared'],visualRole:'SCALAR_FIELD_WHEN_PROVEN',truth:'Schema is available now; measured authority requires a source-proven adapter.'}),
  ENVIRONMENT:Object.freeze({label:'Environmental station data',family:'ENVIRONMENT',status:'ADAPTER_PENDING',observables:['temperature','atmospheric_pressure','rainfall'],units:['source declared'],visualRole:'CONTEXT_FIELD_WHEN_PROVEN',truth:'Schema is available now; measured authority requires a source-proven adapter.'}),
  OMEGA_FIELD:Object.freeze({label:'OMEGA bounded continuity field',family:'DERIVED',status:'LIVE_DERIVED',observables:['bounded_continuity','admission_state','scar_state'],units:['derived'],visualRole:'SUBORDINATE_RECONSTRUCTION',truth:'Derived/reconstructed state never replaces an observation.'})
});

export const R260_ENGLISH_TRANSLATION=Object.freeze({
  measured:'Direct or registered source observation.',
  derived:'A deterministic calculation from measured evidence; useful for structure, not a new sensor observation.',
  context:'Real external information that helps interpret the image but does not become the primary measurement.',
  reconstructed:'Bounded inference carried below measurement authority.',
  unknown:'Unresolved support retained as unknown instead of zero-filled.',
  continuity:'How strongly the current state remains supported and coherent across declared frames.',
  burden:'Missing support, mismatch or processing constraint carried by the state.',
  contradiction:'Conflict between admissible evidence that must stay visible.',
  mode188:'The STAY / TURN / ESCALATE and ACCEPT / CONDITIONAL / PRUNE decision gate for derived admission and presentation.',
  wovenContinuity:'Invariant carry plus history/scar carry through a declared frame transformation, with orientation and recoverable path.',
  unifiedCoherence:'Keep valid partial evidence usable while failed or missing sources remain explicit scars.',
  canon:'Measured evidence outranks derived/contextual/reconstructed state, provenance survives every transform, and unknown stays unknown.'
});

export function domainStatusSnapshot(packets=[]){
  const active=new Map();
  for(const p of packets||[]){const k=String(p?.sourceFamily||'');if(!k)continue;const row=active.get(k)||{packets:0,measured:0,derived:0,context:0,reconstructed:0};row.packets++;if(p?.measured)row.measured++;else if(p?.evidenceClass==='DERIVED_FROM_MEASURED')row.derived++;else if(p?.evidenceClass==='RECONSTRUCTED')row.reconstructed++;else row.context++;active.set(k,row);}
  return Object.freeze(Object.fromEntries(Object.entries(R260_DOMAIN_REGISTRY).map(([key,definition])=>[key,Object.freeze({...definition,current:active.get(key)||{packets:0,measured:0,derived:0,context:0,reconstructed:0}})])));
}

export const R260_DOMAIN_BOUNDARY='This registry translates charted and documented Earth-data families into one software contract. It does not copy another system, activate unavailable sources, create physical laws, or promote pending adapters into live measurement.';
