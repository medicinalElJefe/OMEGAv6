import {useEffect,useMemo,useRef,useState} from 'react';
import {corpusState,projectionPoint,sourceRGB,PROJECTIONS,VIEW_MODES,type Projection,type ViewMode,STATE_COUNT} from './corpusRuntime';
import {compileSourceTraversal} from './sourceBackedModeRuntimeR21';
import './canonicalMembraneR95.css';

type Props={address:number;onAddress?:(address:number)=>void;initialProjection?:Projection;initialView?:ViewMode;compact?:boolean;label?:string};

const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const DPR=()=>Math.min(2,typeof window==='undefined'?1:window.devicePixelRatio||1);

export default function CanonicalMembraneR95({address,onAddress,initialProjection='MANDALA',initialView='SOURCE_COLOR',compact=false,label='20,736-CELL CANONICAL MEMBRANE'}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null);
 const [projection,setProjection]=useState<Projection>(initialProjection),[view,setView]=useState<ViewMode>(initialView),[routeDepth,setRouteDepth]=useState(compact?18:42);
 const record=useMemo(()=>corpusState(address),[address]);
 const route=useMemo(()=>compileSourceTraversal(address,routeDepth),[address,routeDepth]);
 const coordinates=record.coordinates;
 const points=useMemo(()=>Array.from({length:STATE_COUNT},(_,i)=>projectionPoint(i,projection,1000)),[projection]);
 const colors=useMemo(()=>Array.from({length:STATE_COUNT},(_,i)=>sourceRGB(i,view)),[view]);
 const routePoints=useMemo(()=>route.path.map(x=>({address:x.address,...projectionPoint(x.address,projection,1000)})),[route,projection]);

 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const rect=el.getBoundingClientRect(),dpr=DPR(),w=Math.max(320,Math.floor(rect.width*dpr)),h=Math.max(320,Math.floor(rect.height*dpr));
  if(el.width!==w||el.height!==h){el.width=w;el.height=h}
  const ctx=el.getContext('2d');if(!ctx)return;
  ctx.setTransform(w/1000,0,0,h/1000,0,0);
  ctx.clearRect(0,0,1000,1000);
  ctx.fillStyle='#02080b';ctx.fillRect(0,0,1000,1000);

  if(projection==='LATTICE'){
   const cell=1000/144;
   for(let i=0;i<STATE_COUNT;i++){
    const [r,g,b]=colors[i],x=(i%144)*cell,y=Math.floor(i/144)*cell;
    ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.fillRect(x,y,cell+.45,cell+.45);
   }
  }else{
   for(let i=0;i<STATE_COUNT;i++){
    const [r,g,b]=colors[i],p=points[i],radius=projection==='THREAD'?1.45:1.8;
    ctx.fillStyle=`rgba(${r},${g},${b},.72)`;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();
   }
  }

  if(routePoints.length>1){
   ctx.strokeStyle='rgba(222,186,111,.72)';ctx.lineWidth=2.1;ctx.beginPath();routePoints.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
   routePoints.forEach((p,i)=>{if(i%Math.max(1,Math.floor(routePoints.length/9))===0){ctx.fillStyle='rgba(222,186,111,.9)';ctx.beginPath();ctx.arc(p.x,p.y,3.4,0,Math.PI*2);ctx.fill()}});
  }

  const mark=(a:number,stroke:string,r:number)=>{const p=projectionPoint(a,projection,1000);ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();return p};
  mark(record.autoPing.previous,'rgba(133,151,155,.92)',8);
  const cur=mark(address,'rgba(102,225,206,1)',13);
  mark(record.autoPing.dataNext,'rgba(226,188,111,1)',10);
  ctx.fillStyle='rgba(102,225,206,.95)';ctx.beginPath();ctx.arc(cur.x,cur.y,4.5,0,Math.PI*2);ctx.fill();
 },[address,record,projection,view,points,colors,routePoints]);

 const choose=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  if(!onAddress)return;
  const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*1000,y=(e.clientY-rect.top)/rect.height*1000;
  if(projection==='LATTICE'){
   const col=clamp(Math.floor(x/1000*144),0,143),row=clamp(Math.floor(y/1000*144),0,143);onAddress(row*144+col);return;
  }
  let best=address,bd=Infinity;
  for(let i=0;i<points.length;i++){const p=points[i],d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y);if(d<bd){bd=d;best=i}}
  onAddress(best);
 };

 return <section className={'r95-membrane '+(compact?'compact':'full')} data-projection={projection} data-view={view}>
  <header><div><span>RENDER AUTHORITY · SOURCE-BOUND</span><b>{label}</b><small>Every rendered cell is one canonical address. No generated filler cells.</small></div><code>STATE {record.stateId} · D{coordinates.d} P{coordinates.p} R{coordinates.r} L{coordinates.l}</code></header>
  <div className='r95-membrane-controls'>
   <nav aria-label='Membrane projection'>{PROJECTIONS.map(x=><button key={x} className={projection===x?'active':''} onClick={()=>setProjection(x)}>{x}</button>)}</nav>
   <nav aria-label='Membrane data skin'>{VIEW_MODES.map(x=><button key={x} className={view===x?'active':''} onClick={()=>setView(x)}>{x.replaceAll('_',' ')}</button>)}</nav>
   <label>ROUTE <input type='range' min='6' max='72' value={routeDepth} onChange={e=>setRouteDepth(Number(e.target.value))}/><b>{routeDepth}</b></label>
  </div>
  <div className='r95-membrane-stage'>
   <canvas ref={canvas} onPointerDown={choose} aria-label='Interactive 20,736-cell canonical membrane'/>
   <aside>
    <div><span>PREVIOUS</span><b>{record.autoPing.previous+1}</b></div>
    <div><span>CURRENT</span><b>{record.stateId}</b></div>
    <div><span>ADMITTED NEXT</span><b>{record.autoPing.dataNext+1}</b></div>
    <div><span>DECISION</span><b>{record.metrics.decision}</b></div>
    <div><span>CΩ / Φ</span><b>{Number(record.metrics.continuity).toFixed(3)} / {Number(record.metrics.plasticity).toFixed(3)}</b></div>
    <div><span>q / Λ</span><b>{Number(record.metrics.contradiction).toFixed(3)} / {Number(record.metrics.burden).toFixed(3)}</b></div>
   </aside>
  </div>
  <footer><span><i className='previous'/>previous packet</span><span><i className='current'/>current packet</span><span><i className='next'/>admitted route</span><b>{projection} position + {view} color are deterministic functions of the canonical corpus</b></footer>
 </section>
}
