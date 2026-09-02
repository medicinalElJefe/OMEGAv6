import {useEffect,useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight,CloudSun,Globe2,Pause,Play,RefreshCw,ShieldCheck,Activity,Wind,Radio,Mountain,Layers3} from 'lucide-react';
import EarthNowInstrument from './EarthNowInstrument';
import EarthLivingFieldR36 from './EarthLivingFieldR36';
import EarthGroundTraversalR9 from './EarthGroundTraversalR9';
import {api} from './platformAdapter';
import {decodeAddress} from './corpusRuntime';
import './earthObservatoryR8.css';

type Props={address:number};
type Coverage={id:string;label:string;state:string;lastModified?:string|null;truth:string};
type Focus='ALL'|'WEATHER'|'SEISMIC'|'EVENTS'|'SPACE';
const fmt=(v:any,d=1)=>typeof v==='number'&&Number.isFinite(v)?v.toFixed(d):'—';

export default function EarthObservatoryR8({address}:Props){
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const initial=useMemo(()=>({lat:-90+(coords.d+.5)/12*180,lon:-180+(coords.p*12+coords.r+.5)/144*360}),[coords]);
 const[lat,setLat]=useState(initial.lat),[lon,setLon]=useState(initial.lon),[evidence,setEvidence]=useState<any>(null),[catalog,setCatalog]=useState<Coverage[]>([]),[selected,setSelected]=useState('G19-CONUS'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[playing,setPlaying]=useState(false),[focus,setFocus]=useState<Focus>('ALL'),[showGround,setShowGround]=useState(false),[showCalculus,setShowCalculus]=useState(false);
 useEffect(()=>{setLat(initial.lat);setLon(initial.lon)},[initial.lat,initial.lon]);
 const load=async()=>{setBusy(true);setError('');try{const[e,c]=await Promise.all([api.get<any>(`/api/earth/evidence?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}`),api.get<any>('/api/earth/noaa/catalog')]);setEvidence(e.data);setCatalog(c.data?.coverages||[])}catch(x:any){setError(x?.message||String(x))}finally{setBusy(false)}};
 useEffect(()=>{void load()},[]);
 useEffect(()=>{if(!playing||!catalog.length)return;const id=window.setInterval(()=>setSelected(v=>{const i=Math.max(0,catalog.findIndex(x=>x.id===v));return catalog[(i+1)%catalog.length]?.id||v}),5000);return()=>window.clearInterval(id)},[playing,catalog]);
 const current=catalog.find(x=>x.id===selected)||catalog[0];
 const move=(delta:number)=>{if(!catalog.length)return;const i=Math.max(0,catalog.findIndex(x=>x.id===selected));setSelected(catalog[(i+delta+catalog.length)%catalog.length].id)};
 const focusRows=[
  {id:'WEATHER' as Focus,icon:<Wind/>,label:'Weather',value:`${fmt(evidence?.localConditions?.temperatureC)} °C · ${fmt(evidence?.localConditions?.windKph)} km/h`,detail:`cloud ${fmt(evidence?.localConditions?.cloudPct,0)}%`},
  {id:'SEISMIC' as Focus,icon:<Activity/>,label:'Seismic',value:`${evidence?.seismic?.count??'—'} / 24h`,detail:`Mmax ${fmt(evidence?.seismic?.maxMagnitude)}`},
  {id:'EVENTS' as Focus,icon:<Layers3/>,label:'Natural events',value:`${evidence?.naturalEvents?.count??'—'} open`,detail:evidence?.naturalEvents?.nearest?.category||'none returned'},
  {id:'SPACE' as Focus,icon:<Radio/>,label:'Space weather',value:`Kp ${fmt(evidence?.spaceWeather?.kp)}`,detail:evidence?.spaceWeather?.observationTime||'unavailable'}
 ];
 return <section className='earth-r8 earth-r72'>
  <header className='earth-r72-bar'>
   <div><span>EARTH NOW · SOURCE-BACKED DIRECT WORKSPACE</span><h2>Operate the evidence in geographic context.</h2><small>WGS84 geography and returned public observations remain distinct from OMEGA model/interface shells.</small></div>
   <button className='primary' onClick={load} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Refreshing…':'Refresh returned evidence'}</button>
  </header>
  <div className='earth-r72-workspace'>
   <div className='earth-r72-stage'><EarthNowInstrument address={address} evidence={evidence} targetLat={lat} targetLon={lon}/></div>
   <aside className='earth-r72-console'>
    <div className='earth-r72-location'><Globe2/><div><b>WGS84 target</b><small>Directly changes the returned-source query target.</small></div></div>
    <div className='earth-r72-coords'><label>Latitude<input type='number' min='-90' max='90' step='.01' value={lat} onChange={e=>setLat(Math.max(-90,Math.min(90,Number(e.target.value))))}/></label><label>Longitude<input type='number' min='-180' max='180' step='.01' value={lon} onChange={e=>setLon(Math.max(-180,Math.min(180,Number(e.target.value))))}/></label></div>
    <button className='earth-r72-apply' onClick={load} disabled={busy}>Query this location</button>
    <button className='earth-r72-reset' onClick={()=>{setLat(initial.lat);setLon(initial.lon)}}>Return to model-mapped target</button>
    <div className='earth-r72-focus-head'><b>Evidence layers</b><button className={focus==='ALL'?'active':''} onClick={()=>setFocus('ALL')}>Show all</button></div>
    <div className='earth-r72-focus'>{focusRows.map(row=><button key={row.id} className={focus===row.id?'active':''} onClick={()=>setFocus(v=>v===row.id?'ALL':row.id)}>{row.icon}<span><b>{row.label}</b><strong>{row.value}</strong><small>{row.detail}</small></span></button>)}</div>
    <div className='earth-r72-truth'><ShieldCheck/><span><b>{evidence?.evidenceHash?'RETURNED EVIDENCE BOUND':'EVIDENCE NOT YET BOUND'}</b><small>{evidence?.verifiedAt||'No verification timestamp returned.'}</small></span></div>
   </aside>
  </div>
  {error&&<div className='earth-r8-error'>{error}</div>}
  <div className={`earth-r72-strip focus-${focus.toLowerCase()}`}>
   {focusRows.filter(x=>focus==='ALL'||focus===x.id).map(row=><article key={row.id}>{row.icon}<span>{row.label}</span><b>{row.value}</b><small>{row.detail}</small></article>)}
   <article className='derived'><Mountain/><span>Derived context</span><b>{fmt(evidence?.derivedContext?.index,4)}</b><small>display summary only · not physical proof</small></article>
  </div>
  <section className='earth-r72-noaa'>
   <header><div><span>NOAA STAR · GEOCOLOR</span><b>{current?.label||'Loading coverage…'}</b><small>{current?.state||'UNVERIFIED'} · {current?.lastModified||'no Last-Modified returned'}</small></div><div><button onClick={()=>move(-1)} disabled={!catalog.length}><ChevronLeft/></button><button onClick={()=>setPlaying(v=>!v)} disabled={!catalog.length}>{playing?<Pause/>:<Play/>}</button><button onClick={()=>move(1)} disabled={!catalog.length}><ChevronRight/></button></div></header>
   <div className='earth-r72-noaa-stage'>{current&&<img src={`/api/earth/noaa/image?coverage=${encodeURIComponent(current.id)}`} alt={`${current.label} NOAA GeoColor latest alias`}/>}<nav>{catalog.map(x=><button key={x.id} onClick={()=>setSelected(x.id)} className={x.id===current?.id?'active':''}><span>{x.label}</span><small>{x.state}</small></button>)}</nav></div>
   <p><CloudSun/> GeoColor is a NOAA/CIRA derived sensor composite. Missing or unavailable source material is not synthetically replaced.</p>
  </section>
  <div className='earth-r72-disclosure'>
   <button className={showGround?'active':''} onClick={()=>setShowGround(v=>!v)}>Ground / street evidence</button>
   <button className={showCalculus?'active':''} onClick={()=>setShowCalculus(v=>!v)}>Representational calculus comparison</button>
  </div>
  {showGround&&<section className='earth-r72-expanded'><EarthGroundTraversalR9 lat={lat} lon={lon}/></section>}
  {showCalculus&&<section className='earth-r72-expanded' data-provenance='REPRESENTATIONAL'><EarthLivingFieldR36 address={address} lat={lat} lon={lon} evidence={evidence}/><p>REPRESENTATIONAL ONLY · Returned measurements determine event magnitude; OMEGA calculus controls relational rendering. This is not a second Earth sensor or additional observation source.</p></section>}
  <footer className='earth-r72-proof'><ShieldCheck/><div><b>Evidence hash</b><code>{evidence?.evidenceHash||'not available'}</code></div><p>Earth → Region → City → Street → Ground remains source-backed. Unavailable providers remain unavailable.</p></footer>
 </section>
}
