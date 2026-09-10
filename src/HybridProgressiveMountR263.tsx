import {type CSSProperties,type ReactNode,useEffect,useRef,useState} from 'react';
import './hybridProgressiveMountR263.css';

type Props={label:string;children:ReactNode;minHeight?:number;rootMargin?:string};

export default function HybridProgressiveMountR263({label,children,minHeight=360,rootMargin='900px 0px'}:Props){
 const host=useRef<HTMLDivElement|null>(null);
 const[ready,setReady]=useState(false);
 useEffect(()=>{
  if(ready)return;
  const node=host.current;
  if(!node)return;
  if(typeof IntersectionObserver==='undefined'){setReady(true);return}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){setReady(true);observer.disconnect()}
  },{root:null,rootMargin,threshold:0.01});
  observer.observe(node);
  return()=>observer.disconnect();
 },[ready,rootMargin]);
 const style={'--r263-min-height':`${Math.max(160,minHeight)}px`} as CSSProperties;
 return <div ref={host} className='r263-progressive-mount' data-r263-ready={ready?'YES':'NO'} data-r263-label={label} style={style}>
  {ready?children:<div className='r263-progressive-shell' aria-hidden='true'><span>{label}</span><small>Prepared on demand near the viewport</small></div>}
 </div>;
}

export const HYBRID_PROGRESSIVE_MOUNT_TRUTH_R263={
 schema:'OMEGA_HYBRID_PROGRESSIVE_MOUNT_R263',
 authority:'PRESENTATION_AND_MODULE_BYTES_ONLY',
 trigger:'near-viewport IntersectionObserver demand with deterministic no-observer fallback',
 boundary:'R263 defers rendering/module evaluation only. It does not poll a backend, dispatch work, mutate source, promote a candidate, deploy production, or admit CanonState.'
} as const;
