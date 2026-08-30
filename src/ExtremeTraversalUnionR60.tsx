import {useState} from 'react';
import {Activity,Layers3,ShieldCheck} from 'lucide-react';
import {TraversalR36} from './OmegaR36LivingSurfaces';
import ExtremeRestorationR46 from './ExtremeRestorationR46';
import './extremeTraversalUnionR60.css';

type Props={record:any;address:number;state:any;onAddress:(n:number)=>void;onNavigate:(p:string)=>void};
type View='CANONICAL'|'RESTORED';
export default function ExtremeTraversalUnionR60({record,address,state,onAddress,onNavigate}:Props){
 const[view,setView]=useState<View>('CANONICAL');
 return <section className='r60-extreme-union'>
  <header className='r60-extreme-head'><div><span>EXTREME TRAVERSAL · SOURCE-ACTIVE UNION</span><h2>Traversal + restored runtime functions</h2><p>The canonical traversal engine and bounded restored executors share one packet. Switching views never creates a second state authority.</p></div><ShieldCheck/></header>
  <nav className='r60-extreme-tabs' aria-label='Extreme Traversal views'>
   <button className={view==='CANONICAL'?'active':''} onClick={()=>setView('CANONICAL')}><Activity/><span><b>Canonical traversal</b><small>field · route · proof</small></span></button>
   <button className={view==='RESTORED'?'active':''} onClick={()=>setView('RESTORED')}><Layers3/><span><b>Restored functions</b><small>biology · micro build · data/language · cinematic · host/proof</small></span></button>
  </nav>
  {view==='CANONICAL'?<TraversalR36 variant='Extreme Traversal' address={address} state={state} onAddress={onAddress}/>:<ExtremeRestorationR46 record={record} address={address} onAddress={onAddress} onNavigate={onNavigate}/>} 
  <footer className='r60-extreme-boundary'><ShieldCheck/><span>Canonical traversal controls admitted packet evolution. Restored-function panels retain their own explicit browser/source/local/evidence boundaries; representational biology and cinematic views are not measurement or native-device proof.</span></footer>
 </section>
}
