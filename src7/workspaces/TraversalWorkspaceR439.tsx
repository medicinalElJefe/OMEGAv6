import {useEffect,useMemo,useState} from 'react';
import {MatterTraversalR36,TraversalR36} from '../../src/OmegaR36LivingSurfaces';
import ExtremeTraversalUnionR60 from '../../src/ExtremeTraversalUnionR60';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';

export type Omega7TraversalRoute='Matter Traversal'|'Immersive Traversal'|'Extreme Traversal'|'Traversal';

const clamp=(n:number)=>Math.max(0,Math.min(20735,Number.isFinite(n)?Math.floor(n):11498));
const readAddress=()=>{try{return clamp(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};
const writeAddress=(n:number)=>{const next=clamp(n);try{localStorage.setItem('omega.v6.address',String(next));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:next}}))}catch{}return next};

export default function TraversalWorkspaceR439({route}:{route:Omega7TraversalRoute}){
 const[ready,setReady]=useState(false),[error,setError]=useState(''),[address,setAddress]=useState(readAddress);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live){setReady(true);setError('')}}).catch(e=>{if(live)setError(e instanceof Error?e.message:String(e))});return()=>{live=false}},[]);
 useEffect(()=>{const sync=()=>setAddress(current=>{const next=readAddress();return next===current?current:next});const id=window.setInterval(sync,850);window.addEventListener('storage',sync);window.addEventListener('omega7-address-changed',sync as EventListener);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync);window.removeEventListener('omega7-address-changed',sync as EventListener)}},[]);
 const commit=(next:number)=>setAddress(writeAddress(next));
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const state=useMemo(()=>({atlas:{address},modePolicy:'CONTEXTUAL',frozen:false,d:coords.d,p:coords.p,r:coords.r,l:coords.l,workflow:'LAW',preset:'SOVEREIGN',timeAuthority:'NOW',viewportMode:'CANON_FIELD',instrumentView:'LIVE',workspace:'LAW',embodimentIndex:4}),[address,coords]);
 const navigate=(name:string)=>window.dispatchEvent(new CustomEvent('omega7-route-request',{detail:{route:name}}));

 if(error)return <section className='o7-native-failure' role='alert'><b>Traversal source runtime is unavailable.</b><p>{error}</p><button onClick={()=>location.reload()}>Retry runtime</button></section>;
 if(!ready||!record)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing traversal source state…</section>;

 return <section className='o7-native-workspace o7-traversal-workspace' data-omega7-native='motion.traversal' data-route={route} data-address={address}>
  <header className='o7-native-head'>
   <div><span>Explore · Motion & Traversal</span><h1>{route}</h1><p>One canonical address, one admitted route law, and one proof lineage. The view may change depth or representation; the state authority does not.</p></div>
   <aside><b>State {record.stateId.toLocaleString()}</b><small>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l} · {record.metrics.decision}</small></aside>
  </header>
  <div className='o7-native-surface'>
   {route==='Matter Traversal'?<MatterTraversalR36 address={address} onAddress={commit} state={state} onNavigate={navigate}/>:
    route==='Extreme Traversal'?<ExtremeTraversalUnionR60 record={record} address={address} state={state} onAddress={commit} onNavigate={navigate}/>:
    <TraversalR36 variant={route} address={address} state={state} onAddress={commit} onNavigate={navigate}/>}
  </div>
 </section>;
}
