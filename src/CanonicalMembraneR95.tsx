import {useEffect,useMemo,useRef,useState} from 'react';
import {corpusState,projectionPoint,sourceRGB,PROJECTIONS,VIEW_MODES,type Projection,type ViewMode,STATE_COUNT} from './corpusRuntime';
import {compileSourceTraversal} from './sourceBackedModeRuntimeR21';
import {applyCanvasResolutionR119,R119_RESOLUTION_BOUNDARY} from './renderResolutionR119';
import OmegaPhysicsManifoldR132 from './OmegaPhysicsManifoldR132';
import './canonicalMembraneR95.css';
import './physicsManifoldHomeAuthorityR132.css';

type Props={address:number;onAddress?:(address:number)=>void;initialProjection?:Projection;initialView?:ViewMode;projection?:Projection;view?:ViewMode;showControls?:boolean;compact?:boolean;label?:string};

const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));

export default function CanonicalMembraneR95({address,onAddress,initialProjection='MANDALA',initialView='SOURCE_COLOR',projection:controlledProjection,view:controlledView,showControls=true,compact=false,label='20,736-CELL CANONICAL MEMBRANE'}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null);
 const [projectionState,setProjection]=useState<Projection>(initialProjection),[viewState,setView]=useState<ViewMode>(initialView),[routeDepth,setRouteDepth]=useState(compact?18:42);
 const projection=controlledProjection??projectionState,view=controlledView??viewState;
 const record=useMemo(()=>corpusState(address),[address]);
 const route=useMemo(()=>compileSourceTraversal(address,routeDepth),[address,routeDepth]);
 const coordinates=record.coordinates;
 const points=useMemo(()=>Array.from({length:STATE_COUNT},(_,i)=>projectionPoint(i,projection,1000)),[projection]);
 const colors=useMemo(()=>Array.from({length:STATE_COUNT},(_,i)=>sourceRGB(i,view)),[view]);
 const routePoints=useMemo(()=>route.path.map(x=>({address:x.address,...projectionPoint(x.address,projection,1000)})),[route,projection]);
 const homeComposite=compact&&label.startsWith('HOME ·');

 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const ctx=el.getContext('2d');if(!ctx)return;
  const base=document.createElement('canvas');
  const baseCtx=base.getContext('2d');if(!baseCtx)return;
  const paintBase=(bw:number,bh:number)=>{
   if(base.width!==bw||base.height!==bh){base.width=bw;base.height=bh}
   baseCtx.setTransform(bw/1000,0,0,bh/1000,0,0);baseCtx.fillStyle='#02080b';baseCtx.fillRect(0,0,1000,1000);
   if(projection==='LATTICE'){
    const cell=1000/144;
    for(let i=0;i<STATE_COUNT;i++){const [r,g,b]=colors[i],x=(i%144)*cell,y=Math.floor(i/144)*cell;baseCtx.fillStyle=`rgb(${r},${g},${b})`;baseCtx.fillRect(x,y,cell+.45,cell+.45)}
   }else{
    for(let i=0;i<STATE_COUNT;i++){const [r,g,b]=colors[i],p=points[i],radius=projection==='THREAD'?1.45:1.8;baseCtx.fillStyle=`rgba(${r},${g},${b},.72)`;baseCtx.beginPath();baseCtx.arc(p.x,p.y,radius,0,Math.PI*2);baseCtx.fill()}
   }
  };
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf=0,lastFrame=0,w=320,h=320,dpr=1;
  const resize=()=>{const rect=el.getBoundingClientRect(),res=applyCanvasResolutionR119(el,Math.max(1,rect.width),Math.max(1,rect.height),'AUTO');w=res.backingWidth;h=res.backingHeight;dpr=res.dpr;if(base.width!==w||base.height!==h)paintBase(w,h)};
  const draw=(time=0)=>{
   if(!reduced&&time-lastFrame<34){raf=requestAnimationFrame(draw);return}lastFrame=time;
   resize();ctx.setTransform(w/1000,0,0,h/1000,0,0);ctx.clearRect(0,0,1000,1000);ctx.drawImage(base,0,0,1000,1000);
   if(routePoints.length>1){
    ctx.save();ctx.strokeStyle='rgba(222,186,111,.78)';ctx.lineWidth=2.1;ctx.setLineDash([8,10]);ctx.lineDashOffset=-(time/32)%18;ctx.beginPath();routePoints.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
    routePoints.forEach((p,i)=>{if(i%Math.max(1,Math.floor(routePoints.length/9))===0){ctx.fillStyle='rgba(222,186,111,.9)';ctx.beginPath();ctx.arc(p.x,p.y,3.4,0,Math.PI*2);ctx.fill()}});
    const phase=(time/950)%(routePoints.length-1),index=Math.floor(phase),mix=phase-index,a=routePoints[index],b=routePoints[index+1],x=a.x+(b.x-a.x)*mix,y=a.y+(b.y-a.y)*mix;
    ctx.shadowColor='rgba(222,186,111,.9)';ctx.shadowBlur=14*dpr;ctx.fillStyle='rgba(244,213,145,.98)';ctx.beginPath();ctx.arc(x,y,4.4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
   }
   const mark=(a:number,stroke:string,r:number)=>{const p=projectionPoint(a,projection,1000);ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();return p};
   mark(record.autoPing.previous,'rgba(133,151,155,.92)',8);
   const cur=mark(address,'rgba(102,225,206,1)',13+(reduced?0:Math.sin(time/420)*1.5));
   mark(record.autoPing.dataNext,'rgba(226,188,111,1)',10);
   ctx.fillStyle='rgba(102,225,206,.95)';ctx.beginPath();ctx.arc(cur.x,cur.y,4.5,0,Math.PI*2);ctx.fill();
   if(!reduced)raf=requestAnimationFrame(draw);
  };
  const observer=new ResizeObserver(()=>{resize();if(reduced)draw(performance.now())});observer.observe(el);resize();paintBase(w,h);draw(performance.now());
  return()=>{observer.disconnect();if(raf)cancelAnimationFrame(raf)};
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

 const membraneStage=<div className='r95-membrane-stage'>
  <canvas ref={canvas} onPointerDown={choose} aria-label='Interactive 20,736-cell canonical membrane'/>
 </div>;

 return <section className={'r95-membrane '+(compact?'compact':'full')+(homeComposite?' r121-home-composite':'')} data-projection={projection} data-view={view} data-motion='admitted-route-time-sync' data-resolution-authority='R119'>
  <header><div><span>RENDER AUTHORITY · SOURCE-BOUND · R119 FULL RESOLUTION</span><b>{label}</b><small>Every rendered cell is one canonical address. No generated filler cells.</small></div><code>STATE {record.stateId} · D{coordinates.d} P{coordinates.p} R{coordinates.r} L{coordinates.l}</code></header>
  {showControls&&<div className='r95-membrane-controls'>
   <nav aria-label='Membrane projection'>{PROJECTIONS.map(x=><button key={x} className={projection===x?'active':''} onClick={()=>setProjection(x)}>{x}</button>)}</nav>
   <nav aria-label='Membrane data skin'>{VIEW_MODES.map(x=><button key={x} className={view===x?'active':''} onClick={()=>setView(x)}>{x.replaceAll('_',' ')}</button>)}</nav>
   <label>ROUTE <input type='range' min='6' max='72' value={routeDepth} onChange={e=>setRouteDepth(Number(e.target.value))}/><b>{routeDepth}</b></label>
  </div>}
  {homeComposite&&<OmegaPhysicsManifoldR132 address={address} onAddress={onAddress} projection={projection} view={view}/>} 
  {homeComposite?<details className='r121-home-membrane'><summary>CANONICAL SOURCE MEMBRANE · OPEN 20,736-CELL INSPECTION SURFACE</summary>{membraneStage}</details>:membraneStage}
  <details className='r98-membrane-data'>
   <summary>DATA · STATE {record.stateId} · {record.metrics.decision}</summary>
   <div className='r98-membrane-data-grid'>
    <div><span>PREVIOUS</span><b>{record.autoPing.previous+1}</b></div>
    <div><span>CURRENT</span><b>{record.stateId}</b></div>
    <div><span>ADMITTED NEXT</span><b>{record.autoPing.dataNext+1}</b></div>
    <div><span>DECISION</span><b>{record.metrics.decision}</b></div>
    <div><span>CΩ / Φ</span><b>{Number(record.metrics.continuity).toFixed(3)} / {Number(record.metrics.plasticity).toFixed(3)}</b></div>
    <div><span>q / Λ</span><b>{Number(record.metrics.contradiction).toFixed(3)} / {Number(record.metrics.burden).toFixed(3)}</b></div>
   </div>
  </details>
  <footer><span><i className='previous'/>previous packet</span><span><i className='current'/>current packet</span><span><i className='next'/>admitted route</span><b>{projection} position + {view} color are deterministic functions of the canonical corpus · {R119_RESOLUTION_BOUNDARY}</b></footer>
 </section>
}
