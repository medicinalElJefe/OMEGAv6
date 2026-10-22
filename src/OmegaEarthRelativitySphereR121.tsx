import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,Atom,CloudSun,Globe2,Layers3,Pause,Play,Radio,RefreshCw,Satellite,ShieldCheck,Waypoints} from 'lucide-react';
import {feature} from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import {api} from './platformAdapter';
import {corpusState,decodeAddress,sourceRGB,STATE_COUNT,type Projection,type ViewMode} from './corpusRuntime';
import {compileSourceTraversal} from './sourceBackedModeRuntimeR21';
import {R122_BUILD_LAYERS,R122_CONTINUITY_LAW,moduleSignalR122} from './fullSystemConvergenceR122';
import './omegaEarthRelativitySphereR121.css';

type Props={address:number;onAddress?:(address:number)=>void;projection?:Projection;view?:ViewMode};
type SphereLens='WHOLE'|'CUTAWAY'|'EVIDENCE'|'CANON'|'SPACE';
type Coverage={id:string;label:string;state:string;lastModified?:string|null};
type FieldCell={address:number;d:number;p:number;r:number;l:number;continuity:number;plasticity:number;contradiction:number;burden:number};
const LAND:any=feature(land110 as any,(land110 as any).objects.land);
const EARTH_RADIUS_KM=6371;
const EARTH_ROTATION_RAD_S=7.292115e-5;
const SURFACE_G=9.80665;
const SHELLS=[
 {name:'INNER CORE',radiusKm:1221.5,kind:'REFERENCE'},
 {name:'OUTER CORE',radiusKm:3480,kind:'REFERENCE'},
 {name:'LOWER MANTLE',radiusKm:5711,kind:'REFERENCE'},
 {name:'TRANSITION 410 km',radiusKm:5961,kind:'REFERENCE'},
 {name:'SURFACE',radiusKm:EARTH_RADIUS_KM,kind:'REFERENCE'}
] as const;
const ATMOSPHERE=[
 {name:'TROPOSPHERE',altKm:12},
 {name:'STRATOSPHERE',altKm:50},
 {name:'MESOSPHERE',altKm:85},
 {name:'THERMOSPHERE REF',altKm:600},
 {name:'EXOSPHERE DISPLAY CAP',altKm:10000}
] as const;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const wrapLon=(n:number)=>((n+540)%360)-180;
const rad=(d:number)=>d*Math.PI/180;
const deg=(r:number)=>r*180/Math.PI;
const fmt=(v:any,d=1)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';
const fract=(n:number)=>n-Math.floor(n);
const atlasAddress=(d:number,p:number,r:number,l:number)=>((((d*12)+p)*12+r)*12+l);
function mappedLatLon(address:number){const c=decodeAddress(address);return{lat:-90+(c.d+.5)/12*180,lon:-180+(c.p*12+c.r+.5)/144*360,coords:c}}
function project(lat:number,lon:number,rotation:number,cx:number,cy:number,R:number,radial=1){const la=rad(lat),lo=rad(wrapLon(lon-rotation)),x=R*radial*Math.cos(la)*Math.sin(lo),y=-R*radial*Math.sin(la),z=Math.cos(la)*Math.cos(lo);return{x:cx+x,y:cy+y,front:z>=0,z}}
function drawArrow(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number){const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x2-Math.cos(a-.45)*7,y2-Math.sin(a-.45)*7);ctx.moveTo(x2,y2);ctx.lineTo(x2-Math.cos(a+.45)*7,y2-Math.sin(a+.45)*7);ctx.stroke()}
function drawLand(ctx:CanvasRenderingContext2D,rotation:number,cx:number,cy:number,R:number){
 const polys=LAND.geometry?.type==='MultiPolygon'?LAND.geometry.coordinates:LAND.geometry?.type==='Polygon'?[LAND.geometry.coordinates]:[];
 const flush=(segment:any[])=>{if(segment.length<3)return;ctx.beginPath();ctx.moveTo(segment[0].x,segment[0].y);for(let i=1;i<segment.length;i++)ctx.lineTo(segment[i].x,segment[i].y);ctx.closePath();ctx.fill();ctx.stroke()};
 ctx.fillStyle='rgba(31,91,73,.68)';ctx.strokeStyle='rgba(136,225,201,.82)';ctx.lineWidth=1.05;
 for(const poly of polys)for(const ring of poly){let segment:any[]=[];for(const pt of ring){const p=project(pt[1],pt[0],rotation,cx,cy,R);if(!p.front){flush(segment);segment=[];continue}segment.push(p)}flush(segment)}
}
function relativeRadius(cell:FieldCell,projection:Projection,time:number){
 const l=projection==='INVERSE'?11-cell.l:cell.l;
 const shell=1.035+(l-5.5)*.0074;
 const invariantCarry=(cell.continuity-.5)*.018;
 const scarCompression=cell.contradiction*.008+cell.burden*.004;
 const phase=projection==='THREAD'?Math.sin((cell.p*12+cell.r)*.17+time*(.24+.42*cell.plasticity))*.012*cell.plasticity:projection==='MANDALA'?Math.sin((cell.d+cell.p+cell.r)*.73+time*.18)*.006*cell.plasticity:projection==='LATTICE'?((cell.r%3)-1)*.0035:0;
 return clamp(shell+invariantCarry-scarCompression+phase,1.004,1.16);
}

export default function OmegaEarthRelativitySphereR121({address,onAddress,projection='MANDALA',view='SOURCE_COLOR'}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null),drag=useRef<{x:number;rotation:number}|null>(null),displayRotation=useRef(0);
 const[lens,setLens]=useState<SphereLens>('WHOLE'),[running,setRunning]=useState(true),[freeRotation,setFreeRotation]=useState(0),[evidence,setEvidence]=useState<any>(null),[catalog,setCatalog]=useState<Coverage[]>([]),[coverage,setCoverage]=useState('G19-FD'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const mapped=useMemo(()=>mappedLatLon(address),[address]),record=useMemo(()=>corpusState(address),[address]),route=useMemo(()=>compileSourceTraversal(address,36),[address]);
 const field=useMemo<FieldCell[]>(()=>Array.from({length:STATE_COUNT},(_,i)=>{const s=corpusState(i),c=decodeAddress(i);return{address:i,d:c.d,p:c.p,r:c.r,l:c.l,continuity:Number(s.metrics.continuity)||0,plasticity:Number(s.metrics.plasticity)||0,contradiction:Number(s.metrics.contradiction)||0,burden:Number(s.metrics.burden)||0}}),[]);
 const colors=useMemo(()=>Array.from({length:STATE_COUNT},(_,i)=>sourceRGB(i,view)),[view]);
 const load=async()=>{setBusy(true);setError('');try{const[e,c]=await Promise.all([api.get<any>(`/api/earth/evidence?lat=${mapped.lat.toFixed(5)}&lon=${mapped.lon.toFixed(5)}`),api.get<any>('/api/earth/noaa/catalog')]);setEvidence(e.data||null);const rows=(c.data?.coverages||[]) as Coverage[];setCatalog(rows);if(rows.length&&!rows.some(x=>x.id===coverage))setCoverage(rows[0].id)}catch(x:any){setError(x?.message||'Returned Earth evidence is unavailable.')}finally{setBusy(false)}};
 useEffect(()=>{void load()},[address]);
 useEffect(()=>{const c=canvas.current;if(!c)return;let raf=0,alive=true,lastFrame=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw=(time=0)=>{if(!alive)return;if(!reduced&&time-lastFrame<32){raf=requestAnimationFrame(draw);return}lastFrame=time;
   const rect=c.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.max(360,Math.round(rect.width)),H=Math.max(560,Math.round(rect.height));
   if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}
   const ctx=c.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
   const cx=W*.5,cy=H*.49,R=Math.min(W*.315,H*.335),t=time*.001,rot=wrapLon(freeRotation+(running&&!reduced?t*2.65:0));displayRotation.current=rot;

   const bg=ctx.createRadialGradient(cx,cy,R*.06,cx,cy,R*2.35);bg.addColorStop(0,'rgba(13,64,68,.38)');bg.addColorStop(.42,'rgba(3,20,26,.92)');bg.addColorStop(1,'rgba(1,5,8,1)');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
   for(let i=0;i<92;i++){const sx=fract(Math.sin(i*91.73)*43758.5453)*W,sy=fract(Math.sin((i+17)*54.19)*12515.873)*H,a=.12+.48*fract(Math.sin(i*7.13)*951.37);ctx.fillStyle=`rgba(205,229,225,${a})`;ctx.fillRect(sx,sy,i%11===0?1.5:.7,i%11===0?1.5:.7)}

   /* 12-frame relative scaffold. This is atlas geometry, not a physical Earth shell. */
   ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.006);for(let k=0;k<12;k++){const a=k/12*Math.PI*2,rr=R*(1.50+.025*Math.sin(t*.28+k*.7)),x=Math.cos(a)*rr,y=Math.sin(a)*rr;ctx.strokeStyle=k%3===0?'rgba(218,181,105,.20)':'rgba(99,196,183,.11)';ctx.lineWidth=k%3===0?1.05:.7;ctx.beginPath();ctx.moveTo(Math.cos(a)*R*1.18,Math.sin(a)*R*1.18);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle=k%3===0?'rgba(222,188,112,.62)':'rgba(104,204,188,.42)';ctx.beginPath();ctx.arc(x,y,k%3===0?2.1:1.3,0,Math.PI*2);ctx.fill()}ctx.restore();
   for(const tilt of [-.62,0,.62]){ctx.strokeStyle=tilt===0?'rgba(92,184,202,.13)':'rgba(126,112,188,.09)';ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(cx,cy,R*1.56,R*(.45+Math.abs(tilt)*.17),tilt,0,Math.PI*2);ctx.stroke()}

   /* 16-module software fabric: archive-locked responsibilities expressed as a current-state signal ring. */
   if(lens==='WHOLE'||lens==='SPACE'){
    const nodes:{x:number;y:number;signal:number;rgb:number[];i:number}[]=[];
    R122_BUILD_LAYERS.forEach((layer,i)=>{const signal=moduleSignalR122(record.metrics,i,t),a=i/R122_BUILD_LAYERS.length*Math.PI*2-t*.012,inner=R*1.40,outer=R*(1.66+signal*.10),x0=cx+Math.cos(a)*inner,y0=cy+Math.sin(a)*inner,x=cx+Math.cos(a)*outer,y=cy+Math.sin(a)*outer,rgb=colors[Math.min(STATE_COUNT-1,Math.floor(i*STATE_COUNT/R122_BUILD_LAYERS.length))];nodes.push({x,y,signal,rgb,i});ctx.strokeStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${.07+.22*signal})`;ctx.lineWidth=.65+1.1*signal;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(cx+Math.cos(a+.18)*R*1.53,cy+Math.sin(a+.18)*R*1.53,x,y);ctx.stroke();ctx.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${.42+.45*signal})`;ctx.beginPath();ctx.arc(x,y,1.6+2.5*signal,0,Math.PI*2);ctx.fill();if(W>860&&i%2===0){ctx.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},.72)`;ctx.font='7px ui-monospace,monospace';ctx.textAlign=Math.cos(a)>=0?'left':'right';ctx.fillText(`${layer.id} ${layer.name.split(' ').slice(0,2).join(' ')}`,x+(Math.cos(a)>=0?7:-7),y+2)}});
    ctx.save();ctx.lineWidth=.65;for(let i=0;i<nodes.length;i++){const a=nodes[i],b=nodes[(i+1)%nodes.length],alpha=.045+.08*Math.min(a.signal,b.signal);ctx.strokeStyle=`rgba(${a.rgb[0]},${a.rgb[1]},${a.rgb[2]},${alpha})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(cx,cy,b.x,b.y);ctx.stroke()}ctx.restore();ctx.textAlign='start';
   }

   const drawField=(front:boolean)=>{if(!(lens==='CANON'||lens==='WHOLE'))return;for(let i=0;i<STATE_COUNT;i++){const cell=field[i],lat=-90+(cell.d+.5)/12*180,lon=-180+(cell.p*12+cell.r+.5)/144*360,radial=relativeRadius(cell,projection,t),pt=project(lat,lon,rot,cx,cy,R,radial);if(pt.front!==front)continue;const dist=Math.hypot(pt.x-cx,pt.y-cy);if(!front&&dist<R*.985)continue;const [cr,cg,cb]=colors[i],depth=front?.17+.58*pt.z:.055+.12*(1+pt.z),size=front?.55+1.05*cell.continuity:.45;ctx.fillStyle=`rgba(${cr},${cg},${cb},${clamp(depth,.035,.72)})`;ctx.fillRect(pt.x-size*.5,pt.y-size*.5,size,size)}};
   drawField(false);

   const outerScale=[1.048,1.078,1.11,1.20,1.38];ATMOSPHERE.forEach((s,i)=>{ctx.strokeStyle=i<3?'rgba(86,191,220,.14)':'rgba(145,119,196,.12)';ctx.lineWidth=i===0?2:1;ctx.setLineDash(i===4?[4,8]:[]);ctx.beginPath();ctx.arc(cx,cy,R*outerScale[i],0,Math.PI*2);ctx.stroke()});ctx.setLineDash([]);
   ctx.save();ctx.shadowColor='rgba(74,191,205,.48)';ctx.shadowBlur=24;ctx.strokeStyle='rgba(91,205,211,.28)';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(cx,cy,R*1.018,0,Math.PI*2);ctx.stroke();ctx.restore();

   const globe=ctx.createRadialGradient(cx-R*.38,cy-R*.44,R*.035,cx,cy,R*1.02);globe.addColorStop(0,'#2e7682');globe.addColorStop(.32,'#125060');globe.addColorStop(.68,'#072a38');globe.addColorStop(1,'#010b12');ctx.fillStyle=globe;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();
   ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.clip();drawLand(ctx,rot,cx,cy,R);
   ctx.strokeStyle='rgba(145,203,207,.12)';ctx.lineWidth=.65;for(let lat=-75;lat<=75;lat+=15){ctx.beginPath();let open=false;for(let lon=-180;lon<=180;lon+=3){const p=project(lat,lon,rot,cx,cy,R);if(!p.front){open=false;continue}if(!open){ctx.moveTo(p.x,p.y);open=true}else ctx.lineTo(p.x,p.y)}ctx.stroke()}for(let lon=-165;lon<180;lon+=15){ctx.beginPath();let open=false;for(let lat=-90;lat<=90;lat+=3){const p=project(lat,lon,rot,cx,cy,R);if(!p.front){open=false;continue}if(!open){ctx.moveTo(p.x,p.y);open=true}else ctx.lineTo(p.x,p.y)}ctx.stroke()}
   const shade=ctx.createLinearGradient(cx-R,cy-R*.2,cx+R,cy+R*.15);shade.addColorStop(0,'rgba(190,240,231,.06)');shade.addColorStop(.48,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,2,6,.58)');ctx.fillStyle=shade;ctx.fillRect(cx-R,cy-R,R*2,R*2);ctx.restore();

   if(lens==='CUTAWAY'||lens==='WHOLE'){const a0=-.69,a1=.69;ctx.save();ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a0,a1);ctx.closePath();ctx.clip();const layers=[{r:1,c:'rgba(61,82,82,.94)'},{r:5961/EARTH_RADIUS_KM,c:'rgba(121,89,59,.95)'},{r:5711/EARTH_RADIUS_KM,c:'rgba(89,72,54,.98)'},{r:3480/EARTH_RADIUS_KM,c:'rgba(173,91,44,.98)'},{r:1221.5/EARTH_RADIUS_KM,c:'rgba(243,190,91,.98)'}];for(const layer of layers){ctx.fillStyle=layer.c;ctx.beginPath();ctx.arc(cx,cy,R*layer.r,0,Math.PI*2);ctx.fill()}const coreGlow=ctx.createRadialGradient(cx,cy,0,cx,cy,R*.34);coreGlow.addColorStop(0,'rgba(255,232,153,.82)');coreGlow.addColorStop(1,'rgba(222,106,43,0)');ctx.fillStyle=coreGlow;ctx.fillRect(cx-R*.38,cy-R*.38,R*.76,R*.76);ctx.strokeStyle='rgba(255,236,192,.46)';ctx.lineWidth=1;for(const layer of layers){ctx.beginPath();ctx.arc(cx,cy,R*layer.r,a0,a1);ctx.stroke()}ctx.restore();ctx.strokeStyle='rgba(235,206,141,.62)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a0)*R,cy+Math.sin(a0)*R);ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a1)*R,cy+Math.sin(a1)*R);ctx.stroke()}

   drawField(true);
   if(lens==='CANON'||lens==='WHOLE'){ctx.save();ctx.lineWidth=1.7;ctx.strokeStyle='rgba(231,193,111,.72)';ctx.shadowColor='rgba(231,193,111,.38)';ctx.shadowBlur=8;let open=false;ctx.beginPath();for(const x of route.path){const m=mappedLatLon(x.address),cell=field[x.address],p=project(m.lat,m.lon,rot,cx,cy,R,relativeRadius(cell,projection,t)+.035);if(!p.front){open=false;continue}if(!open){ctx.moveTo(p.x,p.y);open=true}else ctx.lineTo(p.x,p.y)}ctx.stroke();ctx.restore();const routeIndex=Math.floor((t*1.55)%Math.max(1,route.path.length)),active=route.path[routeIndex];if(active){const m=mappedLatLon(active.address),cell=field[active.address],p=project(m.lat,m.lon,rot,cx,cy,R,relativeRadius(cell,projection,t)+.04);if(p.front){ctx.fillStyle='rgba(255,222,143,.98)';ctx.beginPath();ctx.arc(p.x,p.y,3.2,0,Math.PI*2);ctx.fill()}}}

   const target=project(mapped.lat,mapped.lon,rot,cx,cy,R,1.022);if(target.front){ctx.save();ctx.shadowColor='rgba(249,226,169,.9)';ctx.shadowBlur=18;ctx.fillStyle='rgba(249,226,169,.98)';ctx.beginPath();ctx.arc(target.x,target.y,4.8,0,Math.PI*2);ctx.fill();ctx.restore();ctx.strokeStyle='rgba(249,226,169,.46)';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(target.x,target.y,10+2.5*Math.sin(t*2),0,Math.PI*2);ctx.stroke()}
   if((lens==='EVIDENCE'||lens==='WHOLE')&&evidence&&target.front){const wind=clamp(Number(evidence?.localConditions?.windKph||0)/100,0,1),dir=rad(Number(evidence?.localConditions?.windDirectionDeg||45)),mag=clamp((Number(evidence?.seismic?.maxMagnitude||0)-1)/7,0,1),kp=clamp(Number(evidence?.spaceWeather?.kp||0)/9,0,1),temp=clamp((Number(evidence?.localConditions?.temperatureC||15)+25)/70,0,1);ctx.strokeStyle=`rgba(${Math.round(70+180*temp)},${Math.round(190-90*temp)},${Math.round(235-110*temp)},.42)`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(target.x,target.y,17,0,Math.PI*2);ctx.stroke();if(wind>.02){ctx.strokeStyle=`rgba(85,205,239,${.48+.35*wind})`;ctx.lineWidth=1.5+3*wind;drawArrow(ctx,target.x,target.y,target.x+Math.sin(dir)*(28+60*wind),target.y-Math.cos(dir)*(28+60*wind))}if(mag>.02){ctx.strokeStyle=`rgba(224,112,82,${.3+.5*mag})`;ctx.lineWidth=1.2;for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(target.x,target.y,12+j*12+Math.sin(t*2+j)*4*mag,0,Math.PI*2);ctx.stroke()}}if(kp>.04){ctx.strokeStyle=`rgba(95,226,157,${.18+.42*kp})`;ctx.lineWidth=1.2+4*kp;for(const lat of [67,-67]){ctx.beginPath();let open=false;for(let lon=-180;lon<=180;lon+=4){const p=project(lat,lon,rot,cx,cy,R,1.029);if(!p.front){open=false;continue}if(!open){ctx.moveTo(p.x,p.y);open=true}else ctx.lineTo(p.x,p.y)}ctx.stroke()}}}

   if(lens==='WHOLE'||lens==='SPACE'){ctx.strokeStyle='rgba(142,188,184,.25)';ctx.lineWidth=1;for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*.008,x1=cx+Math.cos(a)*R*1.58,y1=cy+Math.sin(a)*R*1.58,x2=cx+Math.cos(a)*R*1.40,y2=cy+Math.sin(a)*R*1.40;drawArrow(ctx,x1,y1,x2,y2)}}
   ctx.font='10px ui-monospace,monospace';ctx.fillStyle='rgba(217,235,231,.78)';ctx.fillText(`EARTH REFERENCE R=${EARTH_RADIUS_KM.toLocaleString()} km · Ω=${EARTH_ROTATION_RAD_S.toExponential(7)} rad/s · g₀=${SURFACE_G} m/s²`,14,20);ctx.fillStyle='rgba(226,190,113,.88)';ctx.fillText(`OMEGA STATE ${record.stateId} · D${mapped.coords.d+1} P${mapped.coords.p+1} R${mapped.coords.r+1} L${mapped.coords.l+1} · CANONICAL RADIAL LAYERS ARE REPRESENTATIONAL`,14,H-18);
   if(!reduced)raf=requestAnimationFrame(draw)
  };
  raf=requestAnimationFrame(draw);return()=>{alive=false;cancelAnimationFrame(raf)}
 },[address,record,route,mapped,evidence,lens,freeRotation,running,field,colors,projection]);
 const freezeRotation=()=>{setFreeRotation(displayRotation.current);setRunning(false)};
 const toggleMotion=()=>{if(running)freezeRotation();else setRunning(true)};
 const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{const rotation=displayRotation.current;setFreeRotation(rotation);drag.current={x:e.clientX,rotation};setRunning(false);e.currentTarget.setPointerCapture(e.pointerId)},pointerMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drag.current)return;setFreeRotation(wrapLon(drag.current.rotation-(e.clientX-drag.current.x)*.35))},pointerUp=()=>{drag.current=null};
 const choose=(e:React.DoubleClickEvent<HTMLCanvasElement>)=>{if(!onAddress)return;const rect=e.currentTarget.getBoundingClientRect(),W=rect.width,H=rect.height,cx=W*.5,cy=H*.49,R=Math.min(W*.315,H*.335),nx=(e.clientX-rect.left-cx)/R,ny=(e.clientY-rect.top-cy)/R;if(nx*nx+ny*ny>1)return;const z=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),lat=deg(Math.asin(clamp(-ny,-1,1))),lon=wrapLon(deg(Math.atan2(nx,z))+displayRotation.current),d=clamp(Math.floor((lat+90)/180*12),0,11),lonBin=clamp(Math.floor((lon+180)/360*144),0,143),p=Math.floor(lonBin/12),r=lonBin%12,l=mapped.coords.l;onAddress(atlasAddress(d,p,r,l))};
 const currentCoverage=catalog.find(x=>x.id===coverage)||catalog[0];
 return <section className='r121-sphere r122-volume' data-truth-boundary='REFERENCE OBSERVED REPRESENTATIONAL' data-projection={projection} data-view={view}>
  <header className='r121-sphere-head'><div><span>R122 · VOLUMETRIC EARTH / RELATIVITY / SYSTEM FABRIC</span><b>Core → Earth → atmosphere → orbital context → 20,736-cell relative field → 16 build layers</b><small>{projection} geometry · {view.replaceAll('_',' ')} data skin · one packet continuity across source evidence, traversal, rendering, proof and execution.</small></div><div><button onClick={toggleMotion}>{running?<Pause/>:<Play/>}{running?'Pause':'Motion'}</button><button onClick={()=>void load()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Refreshing':'Refresh evidence'}</button></div></header>
  <nav className='r121-sphere-lenses' aria-label='Whole sphere lenses'>{(['WHOLE','CUTAWAY','EVIDENCE','CANON','SPACE'] as SphereLens[]).map(x=><button key={x} className={lens===x?'active':''} onClick={()=>setLens(x)}>{x}</button>)}</nav>
  <div className='r121-sphere-body'>
   <div className='r121-sphere-stage'><canvas ref={canvas} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onDoubleClick={choose} aria-label='Interactive whole-sphere Earth relativity and full-system continuity instrument'/><div className='r121-sphere-hint'>DRAG ROTATION · DOUBLE-CLICK EARTH TO MOVE ADDRESS · 20,736 CELLS + 16 BUILD LAYERS SHARE ONE CONTINUITY FIELD</div></div>
   <aside className='r121-sphere-telemetry'>
    <section><header><Globe2/><span><b>EARTH REFERENCE</b><small>mean-radius shell geometry</small></span></header><div className='r121-shell-list'>{SHELLS.map(s=><div key={s.name}><span>{s.name}</span><b>{s.radiusKm.toLocaleString()} km</b></div>)}</div></section>
    <section><header><Activity/><span><b>RETURNED OBSERVATIONS</b><small>{evidence?.evidenceHash?'evidence hash bound':'not yet bound'}</small></span></header><div className='r121-kpis'><article><span>TEMP</span><b>{fmt(evidence?.localConditions?.temperatureC)}°C</b></article><article><span>WIND</span><b>{fmt(evidence?.localConditions?.windKph)} km/h</b></article><article><span>SEISMIC</span><b>{evidence?.seismic?.count??'—'} / 24h</b></article><article><span>Kp</span><b>{fmt(evidence?.spaceWeather?.kp)}</b></article></div></section>
    <section><header><Atom/><span><b>APPLIED RELATIVE FIELD</b><small>atlas resolution · not physical dimensions</small></span></header><div className='r121-kpis'><article><span>CELLS</span><b>{STATE_COUNT.toLocaleString()}</b></article><article><span>FABRIC</span><b>{R122_BUILD_LAYERS.length} modules</b></article><article><span>CΩ / Φ</span><b>{fmt(record.metrics.continuity,2)} / {fmt(record.metrics.plasticity,2)}</b></article><article><span>q / Λ</span><b>{fmt(record.metrics.contradiction,2)} / {fmt(record.metrics.burden,2)}</b></article></div><p><Waypoints/>Relative radius uses layer role + invariant carry + plastic phase − contradiction/burden compression. The module ring applies the same current packet metrics to archive-locked software responsibilities; neither construct is mislabeled as measured geology.</p></section>
   </aside>
  </div>
  <div className='r121-source-band'><div><ShieldCheck/><span><b>TRUTH BOUNDARY</b><small>REFERENCE = published Earth constants · OBSERVED = returned provider data · REPRESENTATIONAL = OMEGA atlas/calculus/software projection</small></span></div><div><Layers3/><span><b>CONTINUITY LAW</b><small>{R122_CONTINUITY_LAW}</small></span></div></div>
  <section className='r121-satellite'><header><div><Satellite/><span><b>NOAA / CIRA GEOCOLOR RETURN</b><small>{currentCoverage?.label||'No returned coverage'} · {currentCoverage?.state||'UNVERIFIED'} · {currentCoverage?.lastModified||'no timestamp returned'}</small></span></div>{catalog.length>0&&<select value={currentCoverage?.id||''} onChange={e=>setCoverage(e.target.value)}>{catalog.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select>}</header>{currentCoverage?<img src={`/api/earth/noaa/image?coverage=${encodeURIComponent(currentCoverage.id)}`} alt={`${currentCoverage.label} NOAA GeoColor returned source`}/>:<div className='r121-satellite-empty'><CloudSun/><span>No satellite coverage returned; nothing synthetic substituted.</span></div>}<footer><Radio/>Satellite imagery is evidence context, not a texture fabricated to fill the sphere.</footer></section>
  {error&&<div className='r121-sphere-error'>{error}</div>}
 </section>
}
