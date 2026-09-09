export const GIBS_ENDPOINT='https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
export const GIBS_LAYERS={
  trueColor:'VIIRS_NOAA21_CorrectedReflectance_TrueColor',
  fires:'VIIRS_NOAA20_Thermal_Anomalies_375m_Day',
  night:'VIIRS_SNPP_DayNightBand_AtSensor_M15'
};

export function normalizeBbox(bbox){
  if(!Array.isArray(bbox)||bbox.length!==4)return [-180,-90,180,90];
  let [minLon,minLat,maxLon,maxLat]=bbox.map(Number);
  minLat=Math.max(-90,Math.min(90,minLat));maxLat=Math.max(-90,Math.min(90,maxLat));
  if(![minLon,minLat,maxLon,maxLat].every(Number.isFinite)||maxLon<=minLon)return [-180,-90,180,90];
  minLon=Math.max(-180,Math.min(180,minLon));maxLon=Math.max(-180,Math.min(180,maxLon));
  return [minLon,minLat,maxLon,maxLat];
}

export function buildGibsWmsUrl({bbox=[-180,-90,180,90],date=new Date().toISOString().slice(0,10),width=1200,height=600,layers=[GIBS_LAYERS.trueColor],transparent=false}={}){
  const b=normalizeBbox(bbox);
  const p=new URLSearchParams({
    SERVICE:'WMS',REQUEST:'GetMap',VERSION:'1.1.1',SRS:'EPSG:4326',
    BBOX:b.join(','),WIDTH:String(Math.max(64,Math.min(2048,Math.round(width)))),HEIGHT:String(Math.max(64,Math.min(2048,Math.round(height)))),
    FORMAT:'image/png',TRANSPARENT:transparent?'TRUE':'FALSE',TIME:String(date).slice(0,10),LAYERS:layers.join(','),STYLES:''
  });
  return `${GIBS_ENDPOINT}?${p.toString()}`;
}

export function gibsTransportUrl(url){
  if(!url)return null;
  const origin=globalThis.location?.origin;
  return origin?`${origin.replace(/\/$/,'')}/api/gibs?url=${encodeURIComponent(url)}`:url;
}

export function fallbackDates(date,maxBack=4){
  const start=new Date(`${String(date).slice(0,10)}T12:00:00Z`);
  if(!Number.isFinite(start.getTime()))return [];
  const out=[];
  for(let i=0;i<=Math.max(0,Math.min(10,Number(maxBack)||0));i++)out.push(new Date(start.getTime()-i*86400000).toISOString().slice(0,10));
  return out;
}

export function contextualTimestamp(record, fallbackDate=new Date()){
  const t=record?.startTime?new Date(record.startTime):fallbackDate;
  if(!Number.isFinite(t.getTime()))return new Date().toISOString().slice(0,10);
  return t.toISOString().slice(0,10);
}

export function gibsContextManifest({bbox,date,layers,url,requestedDate=null,fallbackDays=0}){
  return {
    authority:'NASA EOSDIS GIBS',
    kind:'NEAR_REAL_TIME_CONTEXT',
    measurementPromotion:false,
    bbox:normalizeBbox(bbox),date,requestedDate:requestedDate||date,fallbackDays,layers,url,
    semantics:'GIBS imagery is synchronized contextual Earth-observation evidence. It does not replace SAR measurement pixels and is not used as a SAR value unless a quantitative layer with an explicit physical mapping is separately decoded.'
  };
}

if(typeof document!=='undefined'){
  import('./location.mjs').catch(()=>{});
  import('./sentinel-console.mjs').catch(error=>console.error('Sentinel calibrated console failed to initialize',error));
  import('./sar-earth-overlay.mjs').catch(()=>{});
  import('./omega-field-console.mjs').catch(error=>console.error('OMEGA continuous field failed to initialize',error));
  import('./interaction-runtime.mjs').catch(error=>console.error('OMEGA interaction runtime failed to initialize',error));
}
