import {useEffect,useMemo,useState} from 'react';
import {Activity,ChevronLeft,ChevronRight,CloudSun,Globe2,Layers3,Map,Mountain,Pause,Play,Radio,RefreshCw,Satellite,ShieldCheck,Wind} from 'lucide-react';
import EarthNowInstrument,{type EarthInstrumentMode} from './EarthNowInstrument';
import EarthObservedGlobeR281 from './EarthObservedGlobeR281';
import EarthLivingFieldR36 from './EarthLivingFieldR36';
import EarthGroundTraversalR9 from './EarthGroundTraversalR9';
import {api} from './platformAdapter';
import {decodeAddress} from './corpusRuntime';
import './earthObservatoryR8.css';

type Props={address:number};
type Coverage={id:string;label:string;state:string;lastModified?:string|null;truth?:string};
type Focus='ALL'|'WEATHER'|'SEISMIC'|'EVENTS'|'SPACE';
type EarthView='SATELLITE'|'PLANET'|'MOTION'|'EVIDENCE'|'SPACE'|'GROUND'|'CALCULUS';
const fmt=(v:any,d=1)=>typeof v==='number'&&Number.isFinite(v)?v.toFixed(d):'—';
const VIEWS:{id:EarthView;label:string;copy:string}[]=[
 {id:'SATELLITE',label:'Satellite',copy:'latest returned NOAA/CIRA imagery'},
 {id:'PLANET',label:'Planet',copy:'global observed texture + true projection'},
 {id:'MOTION',label:'Global motion',copy:'returned winds + derived continuity'},
 {id:'EVIDENCE',label:'Evidence',copy:'weather · seismic · events · space'},
 {id:'SPACE',label:'Earth / space',copy:'solar geometry + near-space frame'},
 {id:'GROUND',label:'Ground',copy:'region → city → street → ground evidence'},
 {id:'CALCULUS',label:'Calculus',copy:'representational comparison only'}
];
function savedView():EarthView{try{const v=localStorage.getItem('omega.earth.r279.view') as EarthView|null;return VIEWS.some(x=>x.id===v)?v!:'SATELLITE'}catch{return'SATELLITE'}}

export default function EarthObservatoryR8({address}:Props){
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const initial=useMemo(()=>({lat:-90+(coords.d+.5)/12*180,lon:-180+(coords.p*12+coords.r+.5)/144*360}),[coords]);
 const[lat,setLat]=useState(initial.lat),[lon,setLon]=useState(initial.lon),[evidence,setEvidence]=useState<any>(null),[catalog,setCatalog]=useState<Coverage[]>([]),[selected,setSelected]=useState('G19-FD'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[playing,setPlaying]=useState(false),[focus,setFocus]=useState<Focus>('ALL'),[view,setView]=useState<EarthView>(savedView);
 const queryAt=async(qLat=lat,qLon=lon)=>{setBusy(true);setError('');try{const[e,c]=await Promise.all([api.get<any>(`/api/earth/evidence?lat=${qLat.toFixed(5)}&lon=${qLon.toFixed(5)}`),api.get<any>('/api/earth/noaa/catalog')]);setEvidence(e.data);const rows=(c.data?.coverages||[]) as Coverage[];setCatalog(rows);if(rows.length&&!rows.some(x=>x.id===selected))setSelected(rows.some(x=>x.id==='G19-FD')?'G19-FD':rows[0].id)}catch(x:any){setError(x?.message||String(x))}finally{setBusy(false)}};
 useEffect(()=>{setLat(initial.lat);setLon(initial.lon);void queryAt(initial.lat,initial.lon)},[initial.lat,initial.lon]);
 useEffect(()=>{try{localStorage.setItem('omega.earth.r279.view',view)}catch{}},[view]);
 useEffect(()=>{if(!playing||!catalog.length)return;const id=window.setInterval(()=>setSelected(v=>{const i=Math.max(0,catalog.findIndex(x=>x.id===v));return catalog[(i+1)%catalog.length]?.id||v}),6000);return()=>window.clearInterval(id)},[playing,catalog]);
 const current=catalog.find(x=>x.id===selected)||catalog[0];
 const fullDisks=['G19-FD','G18-FD'].map(id=>catalog.find(x=>x.id===id)).filter(Boolean) as Coverage[];
 const move=(delta:number)=>{if(!catalog.length)return;const i=Math.max(0,catalog.findIndex(x=>x.id===selected));setSelected(catalog[(i+delta+catalog.length)%catalog.length].id)};
 const chooseView=(next:EarthView)=>{setView(next);setPlaying(false)};
 const instrumentMode:EarthInstrumentMode=view==='MOTION'?'MOTION':view==='EVIDENCE'?'EVIDENCE':view==='SPACE'?'SPACE':'PLANET';
 const focusRows=[
  {id:'WEATHER' as Focus,icon:<Wind/>,label:'Weather',value:`${fmt(evidence?.localConditions?.temperatureC)} °C · ${fmt(evidence?.localConditions?.windKph)} km/h`,detail:`cloud ${fmt(evidence?.localConditions?.cloudPct,0)}%`},
  {id:'SEISMIC' as Focus,icon:<Activity/>,label:'Seismic',value:`${evidence?.seismic?.count??'—'} / 24h`,detail:`Mmax ${fmt(evidence?.seismic?.maxMagnitude)}`},
  {id:'EVENTS' as Focus,icon:<Layers3/>,label:'Natural events',value:`${evidence?.naturalEvents?.count??'—'} open`,detail:evidence?.naturalEvents?.nearest?.category||'none returned'},
  {id:'SPACE' as Focus,icon:<Radio/>,label:'Space weather',value:`Kp ${fmt(evidence?.spaceWeather?.kp)}`,detail:evidence?.spaceWeather?.observationTime||'unavailable'}
 ];
 const resetTarget=()=>{setLat(initial.lat);setLon(initial.lon);void queryAt(initial.lat,initial.lon)};
 const renderSatellite=()=> <section className='earth-r279-satellite' data-earth-view='SATELLITE'>
  <header><div><span>OBSERVED SATELLITE SURFACE</span><h3>Latest returned NOAA / CIRA GeoColor</h3><small>Source imagery is shown as imagery. OMEGA does not paint calculated pixels into unavailable satellite regions.</small></div><div className='earth-r279-sat-controls'><button type='button' onClick={()=>move(-1)} disabled={!catalog.length} aria-label='Previous satellite coverage'><ChevronLeft/></button><button type='button' onClick={()=>setPlaying(v=>!v)} disabled={!catalog.length}>{playing?<Pause/>:<Play/>}{playing?'Stop cycle':'Cycle coverage'}</button><button type='button' onClick={()=>move(1)} disabled={!catalog.length} aria-label='Next satellite coverage'><ChevronRight/></button></div></header>
  <div className='earth-r279-sat-main'>{current?<figure><img src={`/api/earth/noaa/image?coverage=${encodeURIComponent(current.id)}`} alt={`${current.label} NOAA GeoColor latest returned image`}/><figcaption><b>{current.label}</b><span>{current.state||'UNVERIFIED'} · {current.lastModified||'timestamp unavailable'}</span></figcaption></figure>:<div className='earth-r279-sat-empty'><CloudSun/><b>No satellite coverage returned.</b><span>No substitute image is fabricated.</span></div>}<nav aria-label='Satellite coverage menu'>{catalog.map(x=><button type='button' key={x.id} onClick={()=>setSelected(x.id)} className={x.id===current?.id?'active':''}><span>{x.label}</span><small>{x.state}</small></button>)}</nav></div>
  {fullDisks.length>0&&<div className='earth-r279-global-pair'><header><Satellite/><span><b>FULL-DISK OBSERVATION PAIR</b><small>GOES-East + GOES-West returned views · separate source geometries, not falsely stitched.</small></span></header><div>{fullDisks.map(x=><figure key={x.id}><img src={`/api/earth/noaa/image?coverage=${encodeURIComponent(x.id)}`} alt={`${x.label} returned full-disk GeoColor`}/><figcaption><b>{x.label}</b><small>{x.lastModified||'timestamp unavailable'}</small></figcaption></figure>)}</div></div>}
 </section>;
 return <section className='earth-r8 earth-r72 earth-r279'>
  <header className='earth-r72-bar'><div><span>EARTH NOW · SOURCE-FIRST PLANETARY WORKSPACE</span><h2>Observe first. Compute relationships second. Keep both visible.</h2><small>Satellite imagery, WGS84 observations, derived motion, ground evidence and representational calculus remain explicitly separated.</small></div><button type='button' className='primary' onClick={()=>void queryAt()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Refreshing…':'Refresh returned evidence'}</button></header>
  <nav className='earth-r279-view-tabs' aria-label='Earth view menu'>{VIEWS.map(x=><button type='button' key={x.id} className={view===x.id?'active':''} aria-pressed={view===x.id} onClick={()=>chooseView(x.id)}><b>{x.label}</b><small>{x.copy}</small></button>)}</nav>
  <div className='earth-r72-workspace'>
   <div className='earth-r72-stage earth-r279-stage'>{view==='SATELLITE'?renderSatellite():view==='PLANET'?<EarthObservedGlobeR281 address={address} evidence={evidence} targetLat={lat} targetLon={lon}/>:view==='GROUND'?<section className='earth-r279-ground' data-earth-view='GROUND'><EarthGroundTraversalR9 lat={lat} lon={lon}/></section>:view==='CALCULUS'?<section className='earth-r279-calculus' data-earth-view='CALCULUS' data-provenance='REPRESENTATIONAL'><EarthLivingFieldR36 address={address} lat={lat} lon={lon} evidence={evidence}/><p>REPRESENTATIONAL ONLY · returned measurements determine observed quantities; OMEGA calculus changes relational rendering and inference, not source pixels.</p></section>:<EarthNowInstrument address={address} evidence={evidence} targetLat={lat} targetLon={lon} mode={instrumentMode}/>}</div>
   <aside className='earth-r72-console'><div className='earth-r72-location'><Globe2/><div><b>WGS84 target</b><small>Changes the returned-source query target and evidence marker.</small></div></div><div className='earth-r72-coords'><label>Latitude<input type='number' min='-90' max='90' step='.01' value={lat} onChange={e=>setLat(Math.max(-90,Math.min(90,Number(e.target.value))))}/></label><label>Longitude<input type='number' min='-180' max='180' step='.01' value={lon} onChange={e=>setLon(Math.max(-180,Math.min(180,Number(e.target.value))))}/></label></div><button type='button' className='earth-r72-apply' onClick={()=>void queryAt()} disabled={busy}>Query this location</button><button type='button' className='earth-r72-reset' onClick={resetTarget}>Return + query model-mapped target</button><div className='earth-r72-focus-head'><b>Evidence channels</b><button type='button' className={focus==='ALL'?'active':''} onClick={()=>setFocus('ALL')}>Show all</button></div><div className='earth-r72-focus'>{focusRows.map(row=><button type='button' key={row.id} className={focus===row.id?'active':''} onClick={()=>setFocus(v=>v===row.id?'ALL':row.id)}>{row.icon}<span><b>{row.label}</b><strong>{row.value}</strong><small>{row.detail}</small></span></button>)}</div><div className='earth-r72-truth'><ShieldCheck/><span><b>{evidence?.evidenceHash?'RETURNED EVIDENCE BOUND':'EVIDENCE NOT YET BOUND'}</b><small>{evidence?.verifiedAt||'No verification timestamp returned.'}</small></span></div></aside>
  </div>
  {error&&<div className='earth-r8-error'>{error}</div>}
  <div className={`earth-r72-strip focus-${focus.toLowerCase()}`}>{focusRows.filter(x=>focus==='ALL'||focus===x.id).map(row=><article key={row.id}>{row.icon}<span>{row.label}</span><b>{row.value}</b><small>{row.detail}</small></article>)}<article className='derived'><Mountain/><span>Derived context</span><b>{fmt(evidence?.derivedContext?.index,4)}</b><small>display summary only · not physical proof</small></article></div>
  <div className='earth-r279-shortcuts'><button type='button' onClick={()=>chooseView('SATELLITE')}><Satellite/>Observed imagery</button><button type='button' onClick={()=>chooseView('MOTION')}><Wind/>Global motion</button><button type='button' onClick={()=>chooseView('GROUND')}><Map/>Ground / street evidence</button><button type='button' onClick={()=>chooseView('CALCULUS')}><Layers3/>Representational calculus</button></div>
  <footer className='earth-r72-proof'><ShieldCheck/><div><b>Evidence hash</b><code>{evidence?.evidenceHash||'not available'}</code></div><p>Earth → Region → City → Street → Ground remains source-backed. Satellite, returned point evidence, interpolated motion and OMEGA representation are visibly distinct; unavailable providers remain unavailable.</p></footer>
 </section>;
}