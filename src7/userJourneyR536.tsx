import {useEffect,useState} from 'react';
import {OMEGA7_CAPABILITIES} from './capabilityRegistry';
import './userJourneyR536.css';
const KEY='omega7.userJourney.r536';
type Journey={recent:string[];pinned:string[]};
const clean=(value:unknown):string[]=>Array.isArray(value)?[...new Set(value.filter((x):x is string=>typeof x==='string'&&OMEGA7_CAPABILITIES.some(c=>c.legacyRoute===x)))].slice(0,8):[];
const read=():Journey=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return{recent:clean(x.recent),pinned:clean(x.pinned)}}catch{return{recent:[],pinned:[]}}};
export function OmegaUserJourneyR536({route,onOpen}:{route:string|null;onOpen:(route:string)=>void}){
 const[journey,setJourney]=useState<Journey>(read);
 const[expanded,setExpanded]=useState(false);
 useEffect(()=>{if(!route||!OMEGA7_CAPABILITIES.some(c=>c.legacyRoute===route))return;setJourney(old=>({...old,recent:[route,...old.recent.filter(x=>x!==route)].slice(0,8)}))},[route]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(journey))}catch{}},[journey]);
 const togglePin=(value:string)=>setJourney(old=>({...old,pinned:old.pinned.includes(value)?old.pinned.filter(x=>x!==value):[value,...old.pinned].slice(0,8)}));
 const entries=[...new Set([...journey.pinned,...journey.recent])];
 return <section className='o7-r536-journey' data-r536-journey='true' aria-label='Your OMEGA workspace continuity'>
  <div className='o7-r536-journey-top'><div><span>YOUR WORKSPACE CONTINUITY</span><strong>{route?OMEGA7_CAPABILITIES.find(c=>c.legacyRoute===route)?.label||route:'OMEGA overview'}</strong></div><div className='o7-r536-journey-actions'>{route&&<button type='button' data-r536-pin-current onClick={()=>togglePin(route)}>{journey.pinned.includes(route)?'★ Pinned':'☆ Pin workspace'}</button>}<button type='button' aria-expanded={expanded} onClick={()=>setExpanded(x=>!x)}>{expanded?'Hide history':'Recent work'}</button></div></div>
  {expanded&&<div className='o7-r536-journey-history'>{entries.length===0?<p>Open a workspace to start your continuity history.</p>:entries.map(x=>{const c=OMEGA7_CAPABILITIES.find(v=>v.legacyRoute===x);return <div key={x} className={x===route?'current':''}><button type='button' onClick={()=>onOpen(x)} data-r536-resume={x}><strong>{c?.label||x}</strong><small>{c?.domain||'WORKSPACE'} · {c?.availability||'UNKNOWN'}</small></button><button type='button' aria-label={(journey.pinned.includes(x)?'Unpin ':'Pin ')+(c?.label||x)} onClick={()=>togglePin(x)}>{journey.pinned.includes(x)?'★':'☆'}</button></div>})}</div>}
 </section>;
}
