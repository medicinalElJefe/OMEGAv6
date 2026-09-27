import {useEffect,useMemo,useRef,useState} from 'react';
import {CalendarDays,Clock3,Droplets,Gauge,RefreshCw,Satellite,ShieldCheck,ThermometerSun,Wind} from 'lucide-react';
import {api} from './platformAdapter';
import './earthWeatherR375.css';

type Props={lat:number;lon:number};
type WeatherMode='HOURLY'|'WEEKLY';

const num=(v:any,d=0)=>typeof v==='number'&&Number.isFinite(v)?v.toFixed(d):'—';
const pct=(v:any)=>typeof v==='number'&&Number.isFinite(v)?Math.round(v)+'%':'—';
const codeLabel=(code:any)=>{
 const c=Number(code);
 if(c===0)return'Clear';
 if([1,2].includes(c))return'Partly cloudy';
 if(c===3)return'Overcast';
 if([45,48].includes(c))return'Fog';
 if([51,53,55,56,57].includes(c))return'Drizzle';
 if([61,63,65,66,67].includes(c))return'Rain';
 if([71,73,75,77].includes(c))return'Snow';
 if([80,81,82].includes(c))return'Showers';
 if([85,86].includes(c))return'Snow showers';
 if([95,96,99].includes(c))return'Thunderstorm';
 return'Weather';
};
const localHour=(time:string,zone?:string)=>{try{return new Intl.DateTimeFormat(undefined,{hour:'numeric',hour12:true,timeZone:zone||undefined}).format(new Date(time))}catch{return String(time||'').slice(11,16)}};
const localDay=(time:string,zone?:string)=>{try{return new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric',timeZone:zone||undefined}).format(new Date(time))}catch{return String(time||'').slice(0,10)}};

export default function EarthWeatherR375({lat,lon}:Props){
 const[data,setData]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[mode,setMode]=useState<WeatherMode>('HOURLY');
 const request=useRef(0);
 const load=async()=>{const id=++request.current;setBusy(true);setError('');try{const r=await api.get<any>('/api/earth/weather?lat='+lat.toFixed(5)+'&lon='+lon.toFixed(5));if(id!==request.current)return;const target=r.data?.target;if(!target||Math.abs(Number(target.lat)-lat)>0.000011||Math.abs(Number(target.lon)-lon)>0.000011)throw new Error('Returned weather target does not match the selected Earth location.');setData(r.data)}catch(e:any){if(id===request.current)setError(e?.message||String(e))}finally{if(id===request.current)setBusy(false)}};
 useEffect(()=>{void load();return()=>{request.current++}},[lat,lon]);
 const hourly=useMemo(()=>{const all=Array.isArray(data?.hourly)?data.hourly:[],floor=Date.now()-60*60*1000,future=all.filter((row:any)=>{const t=Date.parse(row?.isoTime||'');return Number.isFinite(t)&&t>=floor});return(future.length?future:all).slice(0,48)},[data]);
 const daily=useMemo(()=>Array.isArray(data?.daily)?data.daily.slice(0,7):[],[data]);
 const q=data?.quality||{},sat=data?.satellite||{},current=data?.current||{},derived=data?.derived||{},scars=Array.isArray(data?.scarLedger)?data.scarLedger:[];
 return <section className='earth-r375-weather' data-earth-view='WEATHER' data-weather-state={busy?'LOADING':error?'ERROR':data?'READY':'IDLE'}>
  <header className='earth-r375-head'>
   <div><span>R375 · SOURCE-FIRST WEATHER</span><h3>{num(current.temperatureC,1)} °C · {codeLabel(current.weatherCode)}</h3><small>{num(lat,4)}°, {num(lon,4)}° · {data?.timezone||'local timezone pending'} · returned meteorology first, derived continuity second</small></div>
   <button type='button' onClick={()=>void load()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Refreshing…':'Refresh weather'}</button>
  </header>

  <div className='earth-r375-now'>
   <article><ThermometerSun/><span>Feels like</span><b>{num(current.apparentC,1)} °C</b><small>air {num(current.temperatureC,1)} °C</small></article>
   <article><Droplets/><span>Humidity / cloud</span><b>{pct(current.humidityPct)} · {pct(current.cloudPct)}</b><small>precip {num(current.precipMm,1)} mm</small></article>
   <article><Wind/><span>Wind / gust</span><b>{num(current.windKph,0)} / {num(current.gustKph,0)} km/h</b><small>{num(current.windDirectionDeg,0)}°</small></article>
   <article><Gauge/><span>Pressure</span><b>{num(current.surfacePressureHpa,0)} hPa</b><small>visibility {num(current.visibilityM==null?null:current.visibilityM/1000,1)} km</small></article>
  </div>

  <div className='earth-r375-proofbar'>
   <span><Satellite/><b>{sat.ok?sat.label||sat.id:'Satellite context unavailable'}</b><small>{sat.ok?(num(sat.ageMinutes,0)+' min observation age'):(sat.error||'no returned freshness proof')}</small></span>
   <span><ShieldCheck/><b>Source agreement {q.sourceAgreement==null?'—':pct(q.sourceAgreement*100)}</b><small>{q.agreementSamples||0} NWS/Open-Meteo hourly overlaps · agreement is not a skill probability</small></span>
   <span><Clock3/><b>24 h continuity {pct((derived.continuityMean24h||0)*100)}</b><small>derived transition coherence · does not overwrite forecast values</small></span>
   <span><CalendarDays/><b>Data completeness {pct((q.dataCompleteness||0)*100)}</b><small>{scars.length?scars.length+' retained scar(s)':'no source gaps retained'}</small></span>
  </div>

  <nav className='earth-r375-tabs' aria-label='Weather forecast view'>
   <button type='button' aria-pressed={mode==='HOURLY'} className={mode==='HOURLY'?'active':''} onClick={()=>setMode('HOURLY')}><Clock3/>Hourly · 48 h</button>
   <button type='button' aria-pressed={mode==='WEEKLY'} className={mode==='WEEKLY'?'active':''} onClick={()=>setMode('WEEKLY')}><CalendarDays/>Weekly · 7 day</button>
  </nav>

  {error&&<div className='earth-r375-error'>{error}</div>}
  {!error&&busy&&!data&&<div className='earth-r375-loading'>Resolving forecast, cross-source agreement, satellite freshness, and continuity…</div>}

  {mode==='HOURLY'&&<div className='earth-r375-hourly' aria-label='Hourly weather forecast'>
   {hourly.map((row:any,i:number)=><article className='earth-r375-hourly-card' key={row.time||i}>
    <header><b>{localHour(row.isoTime||row.time,data?.timezone)}</b><small>{i<24?'next 24 h':'24–48 h'}</small></header>
    <strong>{num(row.temperatureC,0)}°</strong><span>{codeLabel(row.weatherCode)}</span>
    <dl><div><dt>Feels</dt><dd>{num(row.apparentC,0)}°</dd></div><div><dt>Rain</dt><dd>{pct(row.precipProbabilityPct)}</dd></div><div><dt>Wind</dt><dd>{num(row.windKph,0)} km/h</dd></div><div><dt>Gust</dt><dd>{num(row.gustKph,0)} km/h</dd></div><div><dt>Cloud</dt><dd>{pct(row.cloudPct)}</dd></div><div><dt>CΩ</dt><dd>{pct((row.continuity||0)*100)}</dd></div></dl>
   </article>)}
  </div>}

  {mode==='WEEKLY'&&<div className='earth-r375-weekly' aria-label='Seven day weather forecast'>
   {daily.map((row:any,i:number)=><article className='earth-r375-day-card' key={row.date||i}>
    <header><b>{localDay(row.isoTime||row.date,data?.timezone)}</b><small>{codeLabel(row.weatherCode)}</small></header>
    <div className='earth-r375-range'><strong>{num(row.tempMaxC,0)}°</strong><span>{num(row.tempMinC,0)}°</span></div>
    <dl><div><dt>Precip</dt><dd>{pct(row.precipProbabilityMaxPct)}</dd></div><div><dt>Total</dt><dd>{num(row.precipitationMm,1)} mm</dd></div><div><dt>Wind max</dt><dd>{num(row.windMaxKph,0)} km/h</dd></div><div><dt>Gust max</dt><dd>{num(row.gustMaxKph,0)} km/h</dd></div><div><dt>Sunrise</dt><dd>{String(row.sunrise||'—').slice(11,16)}</dd></div><div><dt>Transition</dt><dd>{pct((row.transitionBurden||0)*100)}</dd></div></dl>
   </article>)}
  </div>}

  <details className='earth-r375-ledger'><summary>Forecast evidence + scar ledger</summary>
   <div><b>Primary returned forecast</b><span>{data?.sources?.openMeteo?.source||'unavailable'}</span></div>
   <div><b>Independent U.S. cross-check</b><span>{data?.sources?.nws?.ok?(data.sources.nws.office||'NWS grid forecast'):(data?.sources?.nws?.error||'not available for this target')}</span></div>
   <div><b>Satellite observation context</b><span>{sat.ok?(sat.source+' · '+(sat.lastModified||'timestamp unavailable')):(sat.error||'unavailable')}</span></div>
   {scars.map((x:any,i:number)=><div key={i}><b>{x.code||'SCAR'}</b><span>{x.detail||String(x)}</span></div>)}
  </details>

  <footer><ShieldCheck/><p><b>Truth boundary:</b> returned weather values remain source evidence. NOAA/GOES freshness is an observation gate, not synthetic local pixel analysis. NWS comparison measures source agreement, not guaranteed accuracy. Woven continuity and day-to-day transition scores describe forecast structure only; they cannot mutate CanonState or replace meteorological measurements.</p></footer>
 </section>;
}
