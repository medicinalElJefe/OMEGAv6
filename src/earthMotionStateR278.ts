export type EarthMotionSampleR278={
 id:string;lat:number;lon:number;observedAt:string|null;temperatureC:number|null;cloudPct:number|null;surfacePressureHpa:number|null;windKph:number|null;windDirectionDeg:number|null;quality:number;flow:number;boundary:number;scar:number;memory:number;continuity:number;woven:number;futurePreservation:number
};
export type EarthMotionStateR278={schema:'OMEGA_EARTH_MOTION_STATE_R278';revision:'R278';observedAt:string;provider:string;sampleCount:number;observedCount:number;samples:EarthMotionSampleR278[];summary:{quality:number;flow:number;boundary:number;scar:number;memory:number;continuity:number;woven:number;futurePreservation:number;maxWindKph:number};truthBoundary:string};

const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const num=(v:any)=>Number.isFinite(Number(v))?Number(v):null;
const angleDelta=(a:number,b:number)=>{const d=Math.abs((((a-b)+540)%360)-180);return clamp(d/180)};
const STORAGE='omega.r278.earth-motion.previous';
const LATS=[-75,-55,-35,-15,5,25,45,65];
const LONS=[-165,-135,-105,-75,-45,-15,15,45,75,105,135,165];
const GRID=LATS.flatMap(lat=>LONS.map(lon=>({lat,lon,id:`${lat}:${lon}`})));

function previousMap(){if(typeof localStorage==='undefined')return new Map<string,any>();try{const rows=JSON.parse(localStorage.getItem(STORAGE)||'[]');return new Map((Array.isArray(rows)?rows:[]).map((x:any)=>[String(x.id),x]))}catch{return new Map<string,any>()}}
function savePrevious(rows:EarthMotionSampleR278[]){if(typeof localStorage==='undefined')return;try{localStorage.setItem(STORAGE,JSON.stringify(rows.map(x=>({id:x.id,windKph:x.windKph,windDirectionDeg:x.windDirectionDeg,surfacePressureHpa:x.surfacePressureHpa,observedAt:x.observedAt}))))}catch{}}
function mean(rows:EarthMotionSampleR278[],key:keyof EarthMotionSampleR278){const xs=rows.map(x=>Number(x[key])).filter(Number.isFinite);return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0}

export async function fetchEarthMotionStateR278(signal?:AbortSignal):Promise<EarthMotionStateR278>{
 const lat=GRID.map(x=>x.lat).join(','),lon=GRID.map(x=>x.lon).join(',');
 const current=['temperature_2m','cloud_cover','surface_pressure','wind_speed_10m','wind_direction_10m'].join(',');
 const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=${encodeURIComponent(current)}&timezone=UTC&forecast_days=1`;
 const response=await fetch(url,{signal,headers:{accept:'application/json'}});
 if(!response.ok)throw new Error(`Open-Meteo global field HTTP ${response.status}`);
 const raw=await response.json();const rows=Array.isArray(raw)?raw:[raw],prev=previousMap();
 const samples:EarthMotionSampleR278[]=GRID.map((g,i)=>{const r=rows[i]||{},c=r.current||{},temperatureC=num(c.temperature_2m),cloudPct=num(c.cloud_cover),surfacePressureHpa=num(c.surface_pressure),windKph=num(c.wind_speed_10m),windDirectionDeg=num(c.wind_direction_10m);const valid=[temperatureC,cloudPct,surfacePressureHpa,windKph,windDirectionDeg].filter(x=>x!==null).length,quality=valid/5,old=prev.get(g.id),speedDelta=old&&windKph!==null&&num(old.windKph)!==null?clamp(Math.abs(windKph-Number(old.windKph))/80):0,dirDelta=old&&windDirectionDeg!==null&&num(old.windDirectionDeg)!==null?angleDelta(windDirectionDeg,Number(old.windDirectionDeg)):0,pressureDelta=old&&surfacePressureHpa!==null&&num(old.surfacePressureHpa)!==null?clamp(Math.abs(surfacePressureHpa-Number(old.surfacePressureHpa))/60):0,scar=old?clamp(.50*speedDelta+.35*dirDelta+.15*pressureDelta):0,memory=old?clamp(1-scar):1,flow=windKph===null?0:clamp(windKph/140),boundary=surfacePressureHpa===null?0:clamp(Math.abs(surfacePressureHpa-1013.25)/80),continuity=clamp(quality*(1-.62*scar)),woven=Math.sqrt(clamp(continuity*memory)),futurePreservation=clamp(woven*(1-.35*boundary));return{id:g.id,lat:g.lat,lon:g.lon,observedAt:c.time?String(c.time):null,temperatureC,cloudPct,surfacePressureHpa,windKph,windDirectionDeg,quality,flow,boundary,scar,memory,continuity,woven,futurePreservation}});
 savePrevious(samples);
 return{schema:'OMEGA_EARTH_MOTION_STATE_R278',revision:'R278',observedAt:new Date().toISOString(),provider:'Open-Meteo current multi-coordinate WGS84 field',sampleCount:samples.length,observedCount:samples.filter(x=>x.quality===1).length,samples,summary:{quality:mean(samples,'quality'),flow:mean(samples,'flow'),boundary:mean(samples,'boundary'),scar:mean(samples,'scar'),memory:mean(samples,'memory'),continuity:mean(samples,'continuity'),woven:mean(samples,'woven'),futurePreservation:mean(samples,'futurePreservation'),maxWindKph:Math.max(0,...samples.map(x=>x.windKph||0))},truthBoundary:'R278 uses returned current provider values at a bounded sparse global WGS84 grid. Flow/boundary/scar/memory/continuity/woven/future-preservation are OMEGA software-derived visualization metrics over those observations, not replacement satellite pixels, not literal physical dimensions, not a new law of nature, and not CanonState admission.'};
}
