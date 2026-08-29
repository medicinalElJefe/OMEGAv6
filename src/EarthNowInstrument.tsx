import {useEffect,useMemo,useRef,useState} from 'react';
import {Globe2,Pause,Play,ShieldCheck} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import './earthNow.css';

type Props={address:number};
type SunState={utc:Date,declination:number,subsolarLat:number,subsolarLon:number,gst:number};
const rad=(d:number)=>d*Math.PI/180;
const deg=(r:number)=>r*180/Math.PI;
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const wrapLon=(x:number)=>((x+540)%360)-180;

function solarState(date:Date):SunState{
  const ms=date.getTime();
  const jd=ms/86400000+2440587.5;
  const T=(jd-2451545.0)/36525;
  const L0=(280.46646+T*(36000.76983+T*0.0003032))%360;
  const M=357.52911+T*(35999.05029-0.0001537*T);
  const e=0.016708634-T*(0.000042037+0.0000001267*T);
  const C=Math.sin(rad(M))*(1.914602-T*(0.004817+0.000014*T))+Math.sin(rad(2*M))*(0.019993-0.000101*T)+Math.sin(rad(3*M))*0.000289;
  const trueLong=L0+C;
  const omega=125.04-1934.136*T;
  const lambda=trueLong-0.00569-0.00478*Math.sin(rad(omega));
  const eps0=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60;
  const eps=eps0+0.00256*Math.cos(rad(omega));
  const decl=deg(Math.asin(Math.sin(rad(eps))*Math.sin(rad(lambda))));
  const y=Math.tan(rad(eps/2))**2;
  const eq=4*deg(y*Math.sin(2*rad(L0))-2*e*Math.sin(rad(M))+4*e*y*Math.sin(rad(M))*Math.cos(2*rad(L0))-.5*y*y*Math.sin(4*rad(L0))-1.25*e*e*Math.sin(2*rad(M)));
  const minutes=date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60+date.getUTCMilliseconds()/60000;
  const subLon=wrapLon(180-(minutes+eq)*0.25);
  const gst=(280.46061837+360.98564736629*(jd-2451545.0)+0.000387933*T*T-T*T*T/38710000)%360;
  return {utc:date,declination:decl,subsolarLat:decl,subsolarLon:subLon,gst:(gst+360)%360};
}

function project(lat:number,lon:number,rotation:number,cx:number,cy:number,R:number){
  const la=rad(lat),lo=rad(wrapLon(lon-rotation));
  const x=R*Math.cos(la)*Math.sin(lo);
  const y=-R*Math.sin(la);
  const z=Math.cos(la)*Math.cos(lo);
  return {x:cx+x,y:cy+y,front:z>=0,z};
}

function terminatorPoints(sun:SunState,rotation:number,cx:number,cy:number,R:number){
  const d=rad(sun.subsolarLat),l0=rad(sun.subsolarLon);
  const sx=Math.cos(d)*Math.cos(l0),sy=Math.cos(d)*Math.sin(l0),sz=Math.sin(d);
  const seed=Math.abs(sz)<0.9?{x:0,y:0,z:1}:{x:1,y:0,z:0};
  let ux=sy*seed.z-sz*seed.y,uy=sz*seed.x-sx*seed.z,uz=sx*seed.y-sy*seed.x;
  const un=Math.hypot(ux,uy,uz)||1;ux/=un;uy/=un;uz/=un;
  const vx=sy*uz-sz*uy,vy=sz*ux-sx*uz,vz=sx*uy-sy*ux;
  const out:{x:number,y:number,front:boolean}[]=[];
  for(let i=0;i<=240;i++){const a=i/240*Math.PI*2,X=ux*Math.cos(a)+vx*Math.sin(a),Y=uy*Math.cos(a)+vy*Math.sin(a),Z=uz*Math.cos(a)+vz*Math.sin(a),lat=deg(Math.asin(clamp(Z,-1,1))),lon=deg(Math.atan2(Y,X)),p=project(lat,lon,rotation,cx,cy,R);out.push(p)}
  return out;
}

export default function EarthNowInstrument({address}:Props){
  const canvas=useRef<HTMLCanvasElement|null>(null);
  const [running,setRunning]=useState(true);
  const [now,setNow]=useState(()=>new Date());
  const [rotation,setRotation]=useState(0);
  useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[running]);
  const sun=useMemo(()=>solarState(now),[now]);
  const record=useMemo(()=>corpusState(address),[address]);
  const coords=useMemo(()=>decodeAddress(address),[address]);
  const mappedLat=useMemo(()=>-90+(coords.d+.5)/12*180,[coords.d]);
  const mappedLon=useMemo(()=>-180+(coords.p*12+coords.r+.5)/144*360,[coords.p,coords.r]);
  useEffect(()=>{const c=canvas.current;if(!c)return;let raf=0,alive=true;const draw=()=>{if(!alive)return;const rect=c.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.max(320,Math.round(rect.width)),H=Math.max(360,Math.round(rect.height));if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}const ctx=c.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);const cx=W/2,cy=H*.48,R=Math.min(W*.39,H*.39);const grad=ctx.createRadialGradient(cx-R*.35,cy-R*.38,R*.08,cx,cy,R);grad.addColorStop(0,'#17374a');grad.addColorStop(.55,'#0b2434');grad.addColorStop(1,'#04101a');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.clip();ctx.strokeStyle='rgba(145,205,225,.18)';ctx.lineWidth=1;for(let lat=-60;lat<=60;lat+=30){ctx.beginPath();let first=true;for(let lon=-180;lon<=180;lon+=2){const p=project(lat,lon,rotation,cx,cy,R);if(!p.front){first=true;continue}if(first){ctx.moveTo(p.x,p.y);first=false}else ctx.lineTo(p.x,p.y)}ctx.stroke()}for(let lon=-150;lon<=180;lon+=30){ctx.beginPath();let first=true;for(let lat=-90;lat<=90;lat+=2){const p=project(lat,lon,rotation,cx,cy,R);if(!p.front){first=true;continue}if(first){ctx.moveTo(p.x,p.y);first=false}else ctx.lineTo(p.x,p.y)}ctx.stroke()}const night=ctx.createLinearGradient(cx-R,cy,cx+R,cy);night.addColorStop(0,'rgba(0,0,0,.66)');night.addColorStop(.55,'rgba(0,0,0,.18)');night.addColorStop(1,'rgba(255,220,155,.06)');ctx.fillStyle=night;ctx.fillRect(cx-R,cy-R,R*2,R*2);const term=terminatorPoints(sun,rotation,cx,cy,R);ctx.strokeStyle='rgba(244,198,112,.88)';ctx.lineWidth=1.7;ctx.beginPath();let started=false;for(const p of term){if(!p.front){started=false;continue}if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}ctx.stroke();const sp=project(sun.subsolarLat,sun.subsolarLon,rotation,cx,cy,R);if(sp.front){ctx.fillStyle='rgba(255,222,145,.95)';ctx.beginPath();ctx.arc(sp.x,sp.y,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,222,145,.35)';ctx.beginPath();ctx.arc(sp.x,sp.y,11,0,Math.PI*2);ctx.stroke()}const mp=project(mappedLat,mappedLon,rotation,cx,cy,R);if(mp.front){ctx.fillStyle='#79e0d1';ctx.beginPath();ctx.arc(mp.x,mp.y,4.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(121,224,209,.42)';ctx.beginPath();ctx.arc(mp.x,mp.y,10,0,Math.PI*2);ctx.stroke()}ctx.restore();ctx.strokeStyle='rgba(160,220,235,.32)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(232,244,247,.72)';ctx.font='11px ui-monospace,monospace';ctx.fillText(`UTC ${sun.utc.toISOString().replace('.000','')}`,14,20);ctx.fillText(`SUBSOLAR ${sun.subsolarLat.toFixed(2)}° / ${sun.subsolarLon.toFixed(2)}°`,14,38);raf=requestAnimationFrame(draw)};raf=requestAnimationFrame(draw);return()=>{alive=false;cancelAnimationFrame(raf)}},[sun,rotation,mappedLat,mappedLon]);
  return <section className='earth-now-plus'>
    <div className='earth-now-head'><div><span>EARTH NOW+ · ANALYTICAL PLANETARY FRAME</span><b>Real solar geometry, explicit source mapping, no fabricated live feed</b></div><ShieldCheck/></div>
    <div className='earth-now-grid'><div className='earth-now-stage'><canvas ref={canvas} aria-label='Analytical Earth globe with solar terminator and source-state marker'/><div className='earth-legend'><span><i className='sun-dot'/>Subsolar point</span><span><i className='state-dot'/>OMEGA representational state mapping</span></div></div><aside>
      <div className='earth-kpi'><span>Solar declination</span><b>{sun.declination.toFixed(3)}°</b><small>NOAA-style analytical approximation from UTC</small></div>
      <div className='earth-kpi'><span>Subsolar longitude</span><b>{sun.subsolarLon.toFixed(3)}°</b><small>Computed from equation of time + UTC</small></div>
      <div className='earth-kpi'><span>Greenwich sidereal angle</span><b>{sun.gst.toFixed(3)}°</b><small>Analytical Earth rotation reference</small></div>
      <div className='earth-kpi'><span>External Earth feeds</span><b>EXTERNAL_DEGRADED</b><small>No satellite/weather/traffic imagery is claimed live</small></div>
      <div className='earth-kpi'><span>OMEGA source address</span><b>{record.stateId.toLocaleString()}</b><small>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l}; map marker is representational, not geolocation</small></div>
      <div className='earth-controls'><button onClick={()=>setRunning(v=>!v)}>{running?<><Pause/>Freeze UTC</>:<><Play/>Resume UTC</>}</button><label>Globe longitude<input type='range' min='-180' max='180' step='1' value={rotation} onChange={e=>setRotation(Number(e.target.value))}/></label><button onClick={()=>setRotation(sun.subsolarLon)}>Center sun</button><button onClick={()=>setRotation(mappedLon)}>Center source state</button></div>
    </aside></div>
    <div className='earth-proof'><ShieldCheck/><span><b>Truth boundary:</b> day/night geometry and solar position are computed locally from UTC. The turquoise OMEGA marker is a deterministic visualization of the 20,736-state address and is not a claim about a physical place. External observations remain degraded until a verified provider is bound.</span></div>
  </section>
}
