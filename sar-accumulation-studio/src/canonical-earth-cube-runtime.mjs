import { buildCanonicalEarthFrame, canonicalObservation, renderDirective, CANON_DOMAIN_REGISTRY } from './canonical-earth-cube-core.mjs';
import { atlasLodForScale } from './lemma-state-calculus.mjs';

const map=typeof document!=='undefined'?document.querySelector('#map'):null;
let raf=0,revision=0;
const state={state:'INITIALIZING',release:'R259',frame:null,directive:null,updatedAt:null,revision:0,boundary:'Canonical Earth Data Cube binds heterogeneous sourced Earth observations into one evidence/provenance frame. It never promotes derived/context/reconstruction fields into physical measurement.'};
globalThis.OMEGA_CANONICAL_EARTH_CUBE=state;

const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,finite(v)?Number(v):a));
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function nav(){return globalThis.OMEGA_SAR_NAVIGATION||null;}
function loc(x){return finite(x?.lon)&&finite(x?.lat)?{lon:Number(x.lon),lat:Number(x.lat)}:null;}
function validFraction(p){const n=Number(p?.width)*Number(p?.height);const v=Number(p?.stats?.validCount??p?.stats?.valid);return n>0&&finite(v)?clamp(v/n):p?.evidence?.measured===true?.94:.65;}
function meshRegistration(p){const m=p?.geoMesh;if(!m?.nodes)return .45;const seg=Math.max(1,Number(m.segments)||m.nodes.length-1),expected=(seg+1)*(seg+1),valid=Math.max(0,Number(m.validNodeCount)||0);return clamp(valid/Math.max(1,expected));}
function freshnessFromTime(value,halfLifeHours=720){const t=new Date(value||0).getTime();if(!Number.isFinite(t))return .55;const age=Math.max(0,(Date.now()-t)/3600000);return clamp(1/(1+age/Math.max(1,halfLifeHours)));}
function sourceRef(...parts){return parts.filter(Boolean).map(String);}

function sarObservations(out){
  const r=renderer(),exact=r?.sarOverlay?.patch,regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch;
  if(regional?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&regional?.evidence?.measured===true){
    out.push(canonicalObservation({id:`SAR:REGIONAL:${regional.id||'scene'}`,domain:'SAR',observable:'Calibrated Sentinel-1 regional backscatter',evidenceClass:'REGISTERED_MEASURED',timestamp:regional.startTime,sourceRefs:sourceRef(regional.id,regional.assets?.data?.href,regional.sourceUrl),extent:regional.bbox||null,units:'dB',completeness:validFraction(regional),registration:meshRegistration(regional),freshness:freshnessFromTime(regional.startTime,24*180),agreement:.98,boundary:'Calibrated Sentinel-1 regional COG pixels registered through source-backed geolocation. Measured SAR owns image authority when present.'}));
  }
  if(exact?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&exact?.evidence?.measured===true){
    out.push(canonicalObservation({id:`SAR:EXACT:${exact.id||'scene'}`,domain:'SAR',observable:'Calibrated Sentinel-1 exact target backscatter',evidenceClass:'REGISTERED_MEASURED',timestamp:exact.startTime,sourceRefs:sourceRef(exact.id,exact.assets?.data?.href,exact.sourceUrl),location:loc(nav()?.target),units:'dB',completeness:validFraction(exact),registration:meshRegistration(exact),freshness:freshnessFromTime(exact.startTime,24*180),agreement:.995,boundary:'Exact calibrated source read. Display magnification, blade tessellation and calculus do not create additional measurements.'}));
  }
  const calculus=globalThis.OMEGA_SAR_R258_CALCULUS;
  if(calculus?.spatial&&calculus?.source){
    out.push(canonicalObservation({id:`SAR:SPATIAL_CALCULUS:${calculus.source.id||'scene'}`,domain:'SAR',observable:'Spatial derivatives / local texture from calibrated backscatter',evidenceClass:'DERIVED_MEASURED',timestamp:calculus.source.startTime,sourceRefs:sourceRef(calculus.source.id,'OMEGA_SAR_R258_CALCULUS'),units:calculus.spatial?.spacingMeters?'dB/m and dB/m²':'source-pixel derivative units',completeness:clamp(calculus.spatial?.stats?.validFraction??.8),registration:.96,freshness:freshnessFromTime(calculus.source.startTime,24*180),agreement:.96,boundary:calculus.spatial.boundary||'Deterministic transform of measured calibrated SAR; no measurement promotion.'}));
  }
  if(calculus?.temporal?.state==='MEASURED_TEMPORAL_CALCULUS_READY'){
    out.push(canonicalObservation({id:`SAR:TEMPORAL:${calculus.temporal.lastTime}`,domain:'SAR',observable:'Acquisition-time calibrated backscatter change',evidenceClass:'DERIVED_MEASURED',timestamp:calculus.temporal.lastTime,sourceRefs:['OMEGA_SAR_R258_TEMPORAL_SAMPLES'],location:loc(nav()?.target),units:'dB / dB per day',completeness:clamp(calculus.temporal.observations/6),registration:.98,freshness:freshnessFromTime(calculus.temporal.lastTime,24*90),agreement:clamp(1-Math.min(1,Math.abs(Number(calculus.temporal.latestRobustZ)||0)/8)),payload:{observations:calculus.temporal.observations,deltaDb:calculus.temporal.deltaDb,rateDbPerDay:calculus.temporal.rateDbPerDay,robustZ:calculus.temporal.latestRobustZ},boundary:calculus.temporal.boundary}));
  }
  const fabric=globalThis.OMEGA_SAR_GLOBAL_FABRIC;
  if(fabric?.fabric){
    const total=fabric.fabric.cells?.length||0,covered=fabric.fabric.cells?.filter(c=>c.coverage>0).length||0;
    out.push(canonicalObservation({id:`SAR:FABRIC:${fabric.updatedAt||'now'}`,domain:'SAR',observable:'Sentinel-1 acquisition support fabric',evidenceClass:'SOURCE_SUPPORTED',timestamp:fabric.updatedAt,sourceRefs:['EARTH_SEARCH_SENTINEL1_GRD_METADATA'],extent:fabric.fabric.bbox,completeness:total?covered/total:0,registration:.92,freshness:freshnessFromTime(fabric.updatedAt,6),agreement:clamp(1-(fabric.scarLedger?.length||0)/Math.max(1,(fabric.sectorResolved||0)+(fabric.scarLedger?.length||0))),scar:clamp((fabric.scarLedger?.length||0)/12),payload:{records:fabric.records?.length||0,coveredCells:covered,totalCells:total,atlas:fabric.fabric.lod?.atlasAddress||null},boundary:fabric.boundary}));
  }
}

function terrainWaterObservations(out){
  const t=globalThis.OMEGA_DATA_NATIVE_TERRAIN;
  if(t?.state==='READY'&&t.terrain){
    out.push(canonicalObservation({id:`TERRAIN:${t.updatedAt||'ready'}`,domain:'TERRAIN',observable:'Source digital elevation model',evidenceClass:'CONTEXT',timestamp:t.updatedAt,sourceRefs:[t.terrain.source||'AWS_OPEN_DATA_TERRAIN_TILES'],extent:t.terrain.bbox,units:'m',completeness:.96,registration:.98,freshness:.96,agreement:.99,payload:{z:t.terrain.z,width:t.terrain.width,height:t.terrain.height,min:t.terrain.min,max:t.terrain.max},boundary:t.boundary||'Terrain is sourced Earth context and does not create SAR measurement.'}));
    if(t.water?.geometry){
      out.push(canonicalObservation({id:`WATER:DEM:${t.updatedAt||'ready'}`,domain:'WATER',observable:'DEM-derived topographic drainage potential',evidenceClass:'DERIVED_MEASURED',timestamp:t.updatedAt,sourceRefs:[t.terrain.source||'AWS_OPEN_DATA_TERRAIN_TILES','OMEGA_WATER_GEOMETRY'],extent:t.terrain.bbox,completeness:.94,registration:.98,freshness:.96,agreement:.93,payload:{summary:t.water.summary||null},boundary:'Flow, boundary, curvature and accumulation are deterministic terrain-derived context. They are not observed water depth, discharge or flood extent.'}));
    }
  }
  const jrc=globalThis.OMEGA_WATER_OBSERVATION;
  if(jrc?.state==='READY')out.push(canonicalObservation({id:`WATER:JRC:${jrc.updatedAt||jrc.period}`,domain:'WATER',observable:'Historical surface-water cartographic context',evidenceClass:'CONTEXT',timestamp:jrc.updatedAt,sourceRefs:[jrc.source||'EC_JRC_GLOBAL_SURFACE_WATER_2024'],completeness:clamp((jrc.visibleTiles||0)/4),registration:.96,freshness:.9,agreement:.96,payload:{period:jrc.period,layer:jrc.layer,visibleTiles:jrc.visibleTiles},boundary:jrc.analysisBoundary}));
}

function eventObservations(out){
  const e=globalThis.OMEGA_EARTH_AWARENESS;if(!e)return;const bbox=renderer()?.viewBounds?.();const visible=(e.events||[]).filter(v=>!bbox||(v.lon>=bbox[0]&&v.lon<=bbox[2]&&v.lat>=bbox[1]&&v.lat<=bbox[3]));if(!visible.length)return;
  out.push(canonicalObservation({id:`EVENTS:${e.eventsUpdatedAt||'now'}`,domain:'EVENTS',observable:'Current sourced natural-event metadata in camera',evidenceClass:'CONTEXT',timestamp:e.eventsUpdatedAt,sourceRefs:['USGS_EARTHQUAKES','NASA_EONET'],extent:bbox||null,completeness:clamp(visible.length/20),registration:.99,freshness:freshnessFromTime(e.eventsUpdatedAt,24),agreement:.98,payload:{visible:visible.length,total:e.events.length,sources:['USGS','NASA_EONET']},boundary:e.boundaries?.events||'Event metadata are contextual and do not imply causal relation to SAR change.'}));
}

function geodesyObservations(out){
  const g=globalThis.OMEGA_EARTHSCOPE_GEODESY;if(!g)return;
  for(const station of g.stations||[]){
    out.push(canonicalObservation({id:`GNSS:STATION:${station.id}`,domain:'GNSS',observable:'GNSS station location/metadata',evidenceClass:'SOURCE_SUPPORTED',timestamp:g.updatedAt,sourceRefs:[`EARTHSCOPE_GNSS:${station.id}`],location:{lon:station.lon,lat:station.lat},units:'WGS84 station metadata',completeness:.9,registration:.995,freshness:freshnessFromTime(g.updatedAt,24),agreement:.99,payload:{station:station.id,name:station.name||null,height:station.height??null},boundary:'Station metadata identify a real geodetic sensor location; they are not themselves a displacement measurement.'}));
  }
  for(const sample of g.measurements||[]){
    out.push(canonicalObservation({id:`GNSS:MEASURED:${sample.station}:${sample.observable||'sample'}:${sample.timestamp||g.updatedAt}`,domain:'GNSS',observable:sample.observable||'GNSS position/velocity sample',evidenceClass:'MEASURED',timestamp:sample.timestamp||g.updatedAt,sourceRefs:[`EARTHSCOPE_GNSS:${sample.station}`],location:sample.location||null,units:sample.units||null,value:sample.value??null,completeness:sample.completeness??.9,registration:.995,freshness:freshnessFromTime(sample.timestamp||g.updatedAt,24*14),agreement:.98,payload:sample,boundary:'EarthScope/NGF geodetic service product. Its reference frame, units and source timestamp remain attached to the observation.'}));
  }
}

function scars(){
  const out=[];const fabric=globalThis.OMEGA_SAR_GLOBAL_FABRIC;for(const s of fabric?.scarLedger||[])out.push({domain:'SAR',source:'GLOBAL_SENTINEL1_FABRIC',...s});const g=globalThis.OMEGA_EARTHSCOPE_GEODESY;for(const s of g?.scarLedger||[])out.push({domain:'GNSS',source:'EARTHSCOPE_GEODESY',...s});return out;
}

function rebuild(){
  cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
    const r=renderer();if(!r)return;const observations=[];sarObservations(observations);terrainWaterObservations(observations);eventObservations(observations);geodesyObservations(observations);
    const bbox=r.viewBounds?.()||null,target=loc(nav()?.target),atlas=atlasLodForScale(Number(r.view?.scale)||1,{width:r.w||map?.clientWidth||1,height:r.h||map?.clientHeight||1}),camera={center:{lon:r.view?.centerLon??null,lat:r.view?.centerLat??null},scale:Number(r.view?.scale)||1,width:r.w||null,height:r.h||null};
    const frame=buildCanonicalEarthFrame({target,bbox,atlas,observations,scars:scars(),camera});state.frame=frame;state.directive=renderDirective(frame);state.updatedAt=frame.generatedAt;state.revision=++revision;state.state='READY';updatePanel();window.dispatchEvent(new CustomEvent('omega-canonical-earth-cube',{detail:{revision:state.revision,frame,directive:state.directive}}));
  });
}

function updatePanel(){
  const node=document.querySelector('#omegaCanonicalCubeSummary');if(!node||!state.frame)return;const f=state.frame.fusion,d=state.directive,present=Object.entries(state.frame.domains).filter(([,v])=>v.present).map(([k])=>k);node.textContent=`${f.measured} measured · ${f.derived} derived · ${f.context} context · ${f.scarCount} scars · ${present.join(' / ')||'no sources'} · Mode188 ${f.mode188.decision} · ${d.primary}`;
  node.title=d.english;
}
function installPanel(){
  const deck=document.querySelector('.analysis-deck');if(!deck||document.querySelector('#omegaCanonicalCubePanel'))return;const panel=document.createElement('section');panel.id='omegaCanonicalCubePanel';panel.className='panel omega-canonical-cube-panel';panel.innerHTML='<div class="panel-head"><div><span class="eyebrow">CANONICAL EARTH DATA CUBE · R259</span><h2>Measured → registered → derived → context → reconstruction</h2></div></div><div id="omegaCanonicalCubeSummary" class="micro">Assembling sourced Earth state…</div><div class="micro">Axes: WGS84 x/y · sourced elevation/depth z · acquisition/observation time t · source family s · physical observable p · evidence class e · mode/operator m. Full Overall Canon preserves evidence rank; Unified Coherence carries partial source truth and scars; Mode 188 controls admission, never physical measurement.</div>';deck.prepend(panel);
}
function install(){installPanel();const events=['omega-global-sar-fabric-update','omega-regional-sar-measurement','omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear','omega-r258-temporal-calculus','omega-data-native-terrain','omega-water-observation-update','omega-earth-awareness-update','omega-earthscope-geodesy'];for(const name of events)window.addEventListener(name,rebuild);map?.addEventListener('omega-map-view',rebuild);map?.addEventListener('omega-map-select',rebuild);rebuild();}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
state.rebuild=rebuild;state.domains=CANON_DOMAIN_REGISTRY;