import {useEffect,useState} from 'react';
import {Earth,Layers3,ShieldCheck} from 'lucide-react';
import {projectLivingSceneVisualR2023,R2023_EVENT,R2023_SNAPSHOT_KEY} from './world/livingSceneVisualR2023.js';
import './livingSceneEvidenceBandR2023.css';
type Props={onNavigate:(panel:string)=>void};
const EMPTY=projectLivingSceneVisualR2023();
export default function LivingSceneEvidenceBandR2023({onNavigate}:Props){
 const[state,setState]=useState<any>(EMPTY);
 useEffect(()=>{const readSnapshot=()=>{try{return JSON.parse(localStorage.getItem(R2023_SNAPSHOT_KEY)||'null')}catch{return null}};const receive=(event:Event)=>{const next=projectLivingSceneVisualR2023({receipt:(event as CustomEvent).detail,snapshot:readSnapshot()});setState(next);try{localStorage.setItem('omega.r2023.livingSceneVisual',JSON.stringify(next))}catch{}};window.addEventListener(R2023_EVENT,receive as EventListener);return()=>window.removeEventListener(R2023_EVENT,receive as EventListener)},[]);
 const target=state.target?`${state.target.lat.toFixed(4)}, ${state.target.lon.toFixed(4)} · ${state.target.crs}`:'Awaiting provenance-bound Earth + ground target';
 const hashes=state.eventAccepted?`E ${state.earthHash.slice(0,12)}… · G ${state.groundHash.slice(0,12)}…`:'No empirical scene promoted';
 return <section className='r2023-scene' data-active={state.eventAccepted?'true':'false'} aria-label='Evidence-bound living scene state'><div className='r2023-scene-icon'><Layers3/></div><div className='r2023-scene-copy'><small>R202.2 → R202.3 · ONE CANONICAL WORLD</small><b>{state.label}</b><span>{target}</span><em>{hashes} · R122 {state.renderInputReady?'INPUT READY':'HELD'} · PHOTOREAL UNPROVEN</em></div><div className='r2023-scene-proof'><ShieldCheck/><span>Canon R125 only</span><span>Solver unproven</span><span>PC unproven</span></div><button onClick={()=>onNavigate(state.route||'Earth Now')}><Earth/>Open Earth</button></section>;
}
