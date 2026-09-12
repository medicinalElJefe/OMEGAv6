const map=typeof document!=='undefined'?document.querySelector('#map'):null;
let timer=0,generation=0,controller=null;
const BASE='/api/geodesy';
const state={state:'INITIALIZING',release:'R259',stations:[],measurements:[],updatedAt:null,scarLedger:[],bbox:null,source:'EARTHSCOPE_NGF_PUBLIC_WEB_SERVICES',boundary:'EarthScope/NGF station metadata and geodetic products remain source-identified context/measurement. Failure of this optional adapter never fabricates a station, displacement or zero-valued observation and never blocks SAR.'};
globalThis.OMEGA_EARTHSCOPE_GEODESY=state;

const finite=v=>Number.isFinite(Number(v));
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function target(){const t=globalThis.OMEGA_SAR_NAVIGATION?.target;return finite(t?.lon)&&finite(t?.lat)?{lon:Number(t.lon),lat:Number(t.lat)}:null;}
function cleanStationId(v){const s=String(v??'').trim().toUpperCase();return /^[A-Z0-9]{4}$/.test(s)?s:null;}
function firstNumber(obj,keys){for(const key of keys){const v=obj?.[key];if(finite(v))return Number(v);}return NaN;}
function firstString(obj,keys){for(const key of keys){const v=obj?.[key];if(v!=null&&String(v).trim())return String(v).trim();}return null;}
function flattenObjects(value,out=[],depth=0){if(depth>8||value==null)return out;if(Array.isArray(value)){for(const x of value)flattenObjects(x,out,depth+1);return out;}if(typeof value==='object'){out.push(value);for(const v of Object.values(value))if(v&&typeof v==='object')flattenObjects(v,out,depth+1);}return out;}
function normalizeStations(payload){
  const rows=flattenObjects(payload),byId=new Map();
  for(const row of rows){
    const id=cleanStationId(firstString(row,['station','site','siteID','siteId','stationId','stationID','fourCharacterId','id','name']));
    const lat=firstNumber(row,['latitude','lat','Latitude','LATITUDE']),lon=firstNumber(row,['longitude','lon','lng','Longitude','LONGITUDE']);if(!id||!finite(lat)||!finite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)continue;
    const existing=byId.get(id)||{};byId.set(id,{...existing,id,lat,lon,height:firstNumber(row,['height','elevation','ellipsoidHeight','altitude']),name:firstString(row,['stationName','siteName','description','name'])||existing.name||null,raw:row});
  }
  return [...byId.values()];
}
function hav(a,b){const r=Math.PI/180,p1=a.lat*r,p2=b.lat*r,dp=(b.lat-a.lat)*r,dl=(b.lon-a.lon)*r,s=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 6371.0088*2*Math.atan2(Math.sqrt(s),Math.sqrt(Math.max(0,1-s)));}
function addScar(reason,detail={}){state.scarLedger.push({at:new Date().toISOString(),reason:String(reason?.message||reason||'unresolved'),...detail,measurementPromotion:false});if(state.scarLedger.length>36)state.scarLedger.splice(0,state.scarLedger.length-36);}
async function fetchJson(url,signal){const r=await fetch(url,{signal,headers:{accept:'application/json'}});if(!r.ok)throw Object.assign(new Error(`EarthScope ${r.status}`),{status:r.status,url:String(url)});const text=await r.text();try{return JSON.parse(text);}catch{throw new Error('EarthScope response was not JSON for this adapter request');}}
function stationUrl(bbox){const [w,s,e,n]=bbox,u=new URL(`${BASE}/gnss/sites`,location.origin);u.searchParams.set('minlat',String(s));u.searchParams.set('maxlat',String(n));u.searchParams.set('minlon',String(w));u.searchParams.set('maxlon',String(e));return u;}
function positionUrl(station){const u=new URL(`${BASE}/gnss/position`,location.origin),end=new Date(),start=new Date(end.getTime()-45*86400000);u.searchParams.set('station',station);u.searchParams.set('analysisCenter','cwu');u.searchParams.set('referenceFrame','nam14');u.searchParams.set('report','short');u.searchParams.set('refCoordOption','from_analysis_center');u.searchParams.set('starttime',start.toISOString().slice(0,10));u.searchParams.set('endtime',end.toISOString().slice(0,10));return u;}
function velocityUrl(station){const u=new URL(`${BASE}/gnss/velocity`,location.origin);u.searchParams.set('station',station);u.searchParams.set('analysisCenter','cwu');u.searchParams.set('referenceFrame','nam14');u.searchParams.set('report','short');u.searchParams.set('solutionType','snaps');return u;}
function normalizeMeasurement(payload,station,stationMeta){
  const rows=flattenObjects(payload),candidates=[];
  for(const row of rows){const timestamp=firstString(row,['date','datetime','timestamp','epoch','time','Date','Datetime']);const east=firstNumber(row,['east','east_mm','east_m','easting','East']),north=firstNumber(row,['north','north_mm','north_m','northing','North']),up=firstNumber(row,['up','up_mm','up_m','vertical','heightChange','Up']);const lat=firstNumber(row,['latitude','lat']),lon=firstNumber(row,['longitude','lon']);if(!timestamp&&![east,north,up,lat,lon].some(finite))continue;const t=timestamp?new Date(timestamp).getTime():0;candidates.push({t,row,timestamp:timestamp&&Number.isFinite(t)?new Date(t).toISOString():null,east,north,up,lat,lon});}
  if(!candidates.length)return null;candidates.sort((a,b)=>a.t-b.t);const q=candidates.at(-1),vector={east:finite(q.east)?q.east:null,north:finite(q.north)?q.north:null,up:finite(q.up)?q.up:null};return {station,timestamp:q.timestamp,observable:'GNSS daily position solution',units:'service-declared position solution units',location:finite(q.lon)&&finite(q.lat)?{lon:q.lon,lat:q.lat}:{lon:stationMeta.lon,lat:stationMeta.lat},value:vector,completeness:[vector.east,vector.north,vector.up].filter(finite).length/3,raw:q.row};
}
function normalizeVelocity(payload,station,stationMeta){
  const rows=flattenObjects(payload),candidates=[];for(const row of rows){const east=firstNumber(row,['eastVelocity','east_velocity','ve','velE','velocityEast','east']),north=firstNumber(row,['northVelocity','north_velocity','vn','velN','velocityNorth','north']),up=firstNumber(row,['upVelocity','verticalVelocity','up_velocity','vu','velU','velocityUp','up']),timestamp=firstString(row,['date','datetime','timestamp','epoch','time','solutionDate']);if(![east,north,up].some(finite))continue;candidates.push({row,east,north,up,timestamp});}
  if(!candidates.length)return null;const q=candidates.at(-1),vector={east:finite(q.east)?q.east:null,north:finite(q.north)?q.north:null,up:finite(q.up)?q.up:null};return {station,timestamp:q.timestamp&&Number.isFinite(new Date(q.timestamp).getTime())?new Date(q.timestamp).toISOString():null,observable:'GNSS long-term velocity solution',units:'service-declared velocity solution units',location:{lon:stationMeta.lon,lat:stationMeta.lat},value:vector,completeness:[vector.east,vector.north,vector.up].filter(finite).length/3,raw:q.row};
}
async function loadMeasurement(stationMeta,signal){const out=[];try{const payload=await fetchJson(positionUrl(stationMeta.id),signal),sample=normalizeMeasurement(payload,stationMeta.id,stationMeta);if(sample)out.push(sample);else addScar('GNSS position product returned no recognized numeric position fields',{station:stationMeta.id});}catch(error){if(error?.name!=='AbortError')addScar(error,{station:stationMeta.id,kind:'GNSS_POSITION'});}
  try{const payload=await fetchJson(velocityUrl(stationMeta.id),signal),sample=normalizeVelocity(payload,stationMeta.id,stationMeta);if(sample)out.push(sample);else addScar('GNSS velocity product returned no recognized numeric velocity fields',{station:stationMeta.id});}catch(error){if(error?.name!=='AbortError')addScar(error,{station:stationMeta.id,kind:'GNSS_VELOCITY'});}return out;}
async function load(){
  const r=renderer();if(!r)return;const bbox=r.viewBounds?.();if(!Array.isArray(bbox)||bbox.length!==4)return;const lonSpan=bbox[2]-bbox[0],latSpan=bbox[3]-bbox[1];if(!(lonSpan>0&&latSpan>0)||lonSpan>55||latSpan>38){state.state='OUT_OF_SCALE';state.stations=[];state.measurements=[];state.bbox=bbox;emit();return;}
  controller?.abort();controller=new AbortController();const signal=controller.signal,my=++generation;state.state='LOADING';state.bbox=[...bbox];emit();
  try{
    const payload=await fetchJson(stationUrl(bbox),signal);if(signal.aborted||my!==generation)return;let stations=normalizeStations(payload);const t=target()||{lon:(bbox[0]+bbox[2])/2,lat:(bbox[1]+bbox[3])/2};stations=stations.map(s=>({...s,distanceKm:hav(t,s)})).sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,80);state.stations=stations;state.measurements=[];
    if(stations.length&&Number(r.view?.scale)>=24){const nearest=stations.slice(0,Math.min(3,stations.length)),measured=await Promise.all(nearest.map(s=>loadMeasurement(s,signal)));if(signal.aborted||my!==generation)return;state.measurements=measured.flat().filter(Boolean);}
    state.updatedAt=new Date().toISOString();state.state='READY';emit();
  }catch(error){if(signal.aborted||my!==generation||error?.name==='AbortError')return;addScar(error,{kind:'STATION_METADATA'});state.state='PARTIAL_UNRESOLVED';state.updatedAt=new Date().toISOString();emit();}
}
function emit(){window.dispatchEvent(new CustomEvent('omega-earthscope-geodesy',{detail:{state:state.state,stations:state.stations.length,measurements:state.measurements.length,scars:state.scarLedger.length,updatedAt:state.updatedAt,boundary:state.boundary}}));}
function schedule(delay=900){clearTimeout(timer);timer=setTimeout(()=>load().catch(error=>{addScar(error,{kind:'SCHEDULE'});state.state='PARTIAL_UNRESOLVED';emit();}),delay);}
function install(){map?.addEventListener('omega-map-view',()=>schedule(1100));map?.addEventListener('omega-map-select',()=>schedule(180));window.addEventListener('omega-camera-motion-settled',()=>schedule(180));schedule(1300);}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
state.reload=load;state.schedule=schedule;state.normalizeStations=normalizeStations;