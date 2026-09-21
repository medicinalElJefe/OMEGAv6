import{useEffect,useMemo,useRef,useState}from'react';
import{Cpu,Grid3X3,Monitor,ShieldCheck}from'lucide-react';
import{compileCanonicalTypedFieldR349,compileHardwareExecutionPlanR349,evolveHardwareFieldR349,renderExactAddressFieldR349,R349_SIDE,type HardwarePlanR349}from'./system/wovenHardwareFieldR349';
import'./omegaHardwareFieldR349.css';

type Props={address:number;orientation?:number};
type Summary={invariantBefore:number;invariantAfter:number;invariantResidual:number;scarDelta:number;proof:{invariantStatus:string;fullAddressCoverage:boolean};renderChecksum:string;pixelCount:number;lens:string;boundary:string};
const fmt=(n:number)=>Number.isFinite(n)?n.toExponential(3):'—';

export default function OmegaHardwareFieldR349({address,orientation=0}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null),[rgba,setRgba]=useState<Uint8ClampedArray|null>(null),[summary,setSummary]=useState<Summary|null>(null),[error,setError]=useState('');
 const hint=useMemo(()=>({logicalCores:typeof navigator!=='undefined'?navigator.hardwareConcurrency:1,deviceMemoryGB:typeof navigator!=='undefined'?(navigator as any).deviceMemory:null,devicePixelRatio:typeof window!=='undefined'?window.devicePixelRatio:1,workerAvailable:typeof Worker!=='undefined'}),[]);
 const plan=useMemo<HardwarePlanR349>(()=>compileHardwareExecutionPlanR349(hint),[hint]);
 useEffect(()=>{
  let disposed=false;setError('');
  const fallback=()=>{try{const source=compileCanonicalTypedFieldR349(0),evolution=evolveHardwareFieldR349(source,{orientation,transportRate:.125}),render=renderExactAddressFieldR349(evolution.field,'COMPOSITE');if(disposed)return;setRgba(render.rgba);setSummary({invariantBefore:evolution.invariantBefore,invariantAfter:evolution.invariantAfter,invariantResidual:evolution.invariantResidual,scarDelta:evolution.scarDelta,proof:evolution.proof,renderChecksum:render.checksum,pixelCount:render.pixelCount,lens:render.lens,boundary:render.boundary})}catch(e){if(!disposed)setError(e instanceof Error?e.message:String(e))}};
  if(typeof Worker==='undefined'){fallback();return()=>{disposed=true}};
  const worker=new Worker(new URL('./system/wovenHardwareWorkerR349.ts',import.meta.url),{type:'module'});
  worker.onmessage=(event)=>{if(disposed)return;const m=event.data;if(!m?.ok){setError(String(m?.error||'R349 worker failed'));worker.terminate();fallback();return}setRgba(new Uint8ClampedArray(m.rgba));setSummary(m.summary);worker.terminate()};
  worker.onerror=()=>{if(disposed)return;worker.terminate();fallback()};
  worker.postMessage({type:'COMPILE_RENDER',orientation,transportRate:.125,lens:'COMPOSITE',hardwareHint:hint});
  return()=>{disposed=true;worker.terminate()};
 },[orientation,hint]);
 useEffect(()=>{if(!rgba||!canvas.current)return;const ctx=canvas.current.getContext('2d',{alpha:false});if(!ctx)return;ctx.imageSmoothingEnabled=false;ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba),R349_SIDE,R349_SIDE),0,0)},[rgba]);
 const x=address%R349_SIDE,y=Math.floor(address/R349_SIDE);
 return <section className='r349-field' data-r349-hardware-field='OMEGA_HARDWARE_WOVEN_FIELD_R349'>
  <header><div><span>R349 · HARDWARE WOVEN FIELD</span><h3>Calculus → typed state → bounded hardware partition → exact-address raster</h3><p>One pixel equals one canonical address. Browser hardware reports only scheduling/display hints; computation and render do not upgrade model state into physical measurement.</p></div><ShieldCheck/></header>
  <div className='r349-grid'>
   <article className='r349-canvas-wrap'><canvas ref={canvas} width={R349_SIDE} height={R349_SIDE} aria-label='R349 exact 144 by 144 canonical address field'/><span className='r349-selected' style={{left:`${(x/R349_SIDE)*100}%`,top:`${(y/R349_SIDE)*100}%`}}/><small>selected address {address+1}/20,736 · pixel ({x},{y})</small></article>
   <div className='r349-stats'>
    <article><Cpu/><span><small>HARDWARE PLAN</small><b>{plan.workerCount} bounded partition{plan.workerCount===1?'':'s'}</b><em>{plan.logicalCores} logical-core hint · {plan.workerAvailable?'worker path':'main-thread fallback'}</em></span></article>
    <article><Monitor/><span><small>DISPLAY PATH</small><b>{plan.render.width}×{plan.render.height} exact raster</b><em>DPR {plan.devicePixelRatio.toFixed(2)} · CSS scale {plan.render.cssScale}× · nearest-cell identity</em></span></article>
    <article><Grid3X3/><span><small>FIELD COVERAGE</small><b>{summary?summary.pixelCount.toLocaleString():'compiling'} addresses</b><em>{summary?`render ${summary.renderChecksum}`:'worker numerical field pending'}</em></span></article>
    <article><ShieldCheck/><span><small>INVARIANT RESIDUAL</small><b>{summary?fmt(summary.invariantResidual):'—'}</b><em>{summary?.proof?.invariantStatus??'PENDING'} · full coverage {summary?.proof?.fullAddressCoverage?'YES':'PENDING'}</em></span></article>
   </div>
  </div>
  {error&&<div className='r349-error'>{error}</div>}
  <footer><b>Execution boundary</b><span>{summary?.boundary??'R349 remains software/model computation until returned physical or device evidence independently establishes a stronger claim.'}</span></footer>
 </section>;
}
