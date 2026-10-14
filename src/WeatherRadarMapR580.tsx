import {useEffect,useMemo,useState} from 'react';
type RadarFrame={time:number;path:string};
type RadarResponse={host:string;radar:{past:RadarFrame[];nowcast:RadarFrame[]};generated:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const tile=(lat:number,lon:number,z:number)=>{const n=2**z;return {x:(lon+180)/360*n,y:(1-Math.asinh(Math.tan(clamp(lat,-85,85)*Math.PI/180))/Math.PI)/2*n}};
export default function WeatherRadarMapR580({lat,lon}:{lat:number;lon:number}){
 const [frames,setFrames]=useState<RadarFrame[]>([]),[host,setHost]=useState(''),[index,setIndex]=useState(0),[zoom,setZoom]=useState(6),[playing,setPlaying]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(true),[center,setCenter]=useState({lat,lon});
 useEffect(()=>setCenter({lat,lon}),[lat,lon]);
 useEffect(()=>{let live=true;setLoading(true);setError('');fetch('https://api.rainviewer.com/public/weather-maps.json',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('Radar catalog HTTP '+r.status);return r.json() as Promise<RadarResponse>}).then(r=>{if(!live)return;const rows=Array.isArray(r.radar?.past)?r.radar.past.filter(x=>Number.isInteger(x.time)&&typeof x.path==='string'&&/^\/v2\/radar\//.test(x.path)):[];rows.sort((a,b)=>a.time-b.time);setFrames(rows);setHost(/^https:\/\/[a-z0-9.-]+$/i.test(r.host)?r.host:'');setIndex(Math.max(0,rows.length-1));if(!rows.length)throw Error('No radar observations returned')}).catch(e=>{if(live){setFrames([]);setError(String(e))}}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
 useEffect(()=>{if(!playing||frames.length<2)return;const t=window.setInterval(()=>setIndex(i=>(i+1)%frames.length),650);return()=>window.clearInterval(t)},[playing,frames.length]);
 const z=clamp(zoom,3,9),n=2**z,pos=tile(center.lat,center.lon,z),frame=frames[index];
 const cells=useMemo(()=>{const out:{key:string;left:number;top:number;x:number;y:number}[]=[];const baseX=Math.floor(pos.x),baseY=Math.floor(pos.y);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=baseX+dx,y=baseY+dy;if(y<0||y>=n)continue;out.push({key:dx+':'+dy,left:(x-pos.x)*256,top:(y-pos.y)*256,x:(x+n)%n,y})}return out},[pos.x,pos.y,n]);
 const pan=(dx:number,dy:number)=>{const x=pos.x+dx,y=clamp(pos.y+dy,0.01,n-0.01);setCenter({lon:((x/n*360+540)%360)-180,lat:Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI})};
 return <section className='omega-r580' data-r580-radar-map='true' data-radar-state={loading?'LOADING':error?'ERROR':frame&&host?'READY':'HELD'}>
  <header><h3>Observed precipitation radar</h3><p>RainViewer historical radar tiles · real observation frames · map centered on selected location</p></header>
  <div className='omega-r580-controls'><button onClick={()=>setZoom(x=>clamp(x+1,3,9))} aria-label='Zoom radar in'>+</button><button onClick={()=>setZoom(x=>clamp(x-1,3,9))} aria-label='Zoom radar out'>−</button><button onClick={()=>pan(0,-.6)}>North</button><button onClick={()=>pan(-.6,0)}>West</button><button onClick={()=>pan(.6,0)}>East</button><button onClick={()=>pan(0,.6)}>South</button><button onClick={()=>setCenter({lat,lon})}>Target</button></div>
  <div className='omega-r580-map' role='img' aria-label='Georeferenced OpenStreetMap base with RainViewer radar reflectivity overlay'>
   {cells.map(c=><div key={c.key} className='omega-r580-tile' style={{left:'calc(50% + '+c.left+'px)',top:'calc(50% + '+c.top+'px)'}}><img alt='' src={'https://tile.openstreetmap.org/'+z+'/'+c.x+'/'+c.y+'.png'} loading='lazy'/>{frame&&host&&<img className='omega-r580-radar' alt='' src={host+frame.path+'/256/'+z+'/'+c.x+'/'+c.y+'/2/1_1.png'} loading='eager'/>}</div>)}
   <div className='omega-r580-target' aria-hidden='true'>+</div>
   <div className='omega-r580-attribution'>© OpenStreetMap contributors · Radar © RainViewer</div>
  </div>
  {loading&&<p role='status'>Retrieving real radar observation catalog…</p>}
  {error&&<p role='alert'>Radar source unavailable: {error}. No synthetic radar substituted.</p>}
  {frame&&<div className='omega-r580-timeline'><div><button disabled={frames.length<2} onClick={()=>setPlaying(v=>!v)}>{playing?'Pause':'Play radar history'}</button><button disabled={index===0} onClick={()=>{setPlaying(false);setIndex(i=>Math.max(0,i-1))}}>Previous</button><button disabled={index===frames.length-1} onClick={()=>{setPlaying(false);setIndex(i=>Math.min(frames.length-1,i+1))}}>Next</button></div><input aria-label='Radar observation timeline' type='range' min={0} max={Math.max(0,frames.length-1)} value={index} onChange={e=>{setPlaying(false);setIndex(Number(e.target.value))}}/><strong>{new Date(frame.time*1000).toLocaleString()} · {index+1}/{frames.length} verified provider frame identifiers</strong><small>Historical radar reflectivity, not forecast precipitation. Tiles are supplied by RainViewer. No velocity or rainfall rate is inferred.</small></div>}
 </section>;
}
