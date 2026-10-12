import {useEffect,useState} from 'react';
import {api} from './platformAdapter';
import EarthWeatherR375 from './EarthWeatherR375';
import './weatherObservationStudioR563.css';
type Coverage={id:string;label:string;state?:string;lastModified?:string;source?:string};
export default function WeatherObservationStudioR563({lat,lon}:{lat:number;lon:number}){
 const[catalog,setCatalog]=useState<Coverage[]>([]);
 const[selected,setSelected]=useState('');
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState('');
 const[imageError,setImageError]=useState('');
 const[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError('');api.get<any>('/api/earth/noaa/catalog').then(r=>{
  if(!active)return;
  const rows=Array.isArray(r.data?.coverages)?r.data.coverages.filter((x:any)=>typeof x.id==='string'&&typeof x.label==='string') as Coverage[]:[];
  setCatalog(rows);setSelected(old=>rows.some(x=>x.id===old)?old:rows.find(x=>x.id==='G19-FD')?.id||rows[0]?.id||'');
 }).catch(e=>{if(active){setCatalog([]);setError(e instanceof Error?e.message:String(e))}}).finally(()=>{if(active)setLoading(false)});
 return()=>{active=false};
 },[revision]);
 const current=catalog.find(x=>x.id===selected);
 return <section className='omega-weather-studio' data-r563-weather-studio='true'>
  <header className='omega-weather-studio-head'><div><span>OMEGA WEATHER · DEDICATED OBSERVATION STUDIO</span><h2>Weather intelligence and observed imagery</h2><p>Separate forecast and satellite panels, using returned public-source data. Imagery is observational context, not a georeferenced precipitation or radar overlay.</p></div><button type='button' onClick={()=>setRevision(n=>n+1)} disabled={loading}>Refresh satellite catalog</button></header>
  <div className='omega-weather-studio-grid'>
   <section className='omega-weather-studio-panel' aria-label='Weather satellite observation panel' data-r563-satellite-panel='true'>
    <header><span>PUBLIC SATELLITE OBSERVATIONS</span><h3>NOAA imagery catalog</h3><p>Available GOES coverages are returned by the existing OMEGA NOAA catalog endpoint. Coverage availability and image freshness are shown as received.</p></header>
    {loading&&<p role='status'>Loading NOAA coverage catalog…</p>}
    {error&&<p role='alert'>NOAA catalog unavailable: {error}</p>}
    {!loading&&!error&&!catalog.length&&<p role='status'>No verified satellite coverages returned. No substitute pixels are generated.</p>}
    {catalog.length>0&&<><label htmlFor='r563-coverage'>Observed coverage</label><select id='r563-coverage' value={selected} onChange={e=>{setSelected(e.target.value);setImageError('')}}>{catalog.map(x=><option key={x.id} value={x.id}>{x.label} · {x.state||'unverified'}</option>)}</select>
    {current&&<figure><img key={current.id} src={'/api/earth/noaa/image?coverage='+encodeURIComponent(current.id)} alt={'Returned NOAA satellite image: '+current.label} loading='eager' onError={()=>setImageError('Satellite image unavailable from current source')} onLoad={()=>setImageError('')}/><figcaption><b>{current.label}</b><span>{current.state||'UNVERIFIED'} · {current.lastModified||'source time unavailable'}</span>{imageError&&<small role='alert'>{imageError}</small>}</figcaption></figure>}
    <div className='omega-weather-studio-coverage'>{catalog.map(x=><button type='button' key={x.id} aria-pressed={selected===x.id} onClick={()=>{setSelected(x.id);setImageError('')}}>{x.label}</button>)}</div></>}
   </section>
   <section className='omega-weather-studio-panel' aria-label='Source-backed weather forecast panel' data-r563-forecast-panel='true'><EarthWeatherR375 lat={lat} lon={lon}/></section>
  </div>
  <footer><strong>Evidence boundary:</strong> NOAA image pixels are not synthetic weather layers. Forecasts and observed imagery may have different timestamps, resolutions and spatial footprints. Radar precipitation, multispectral cloud products, NEXRAD and quantitative satellite fusion require independent verified source adapters before being presented as operational maps.</footer>
 </section>;
}
