import {useEffect,useState} from 'react';
import {initialWorkflowR538,normalizeWorkflowR538,transitionWorkflowR538,type WorkflowR538} from './workflowContextR538';
import './workflowSurfaceR538.css';
const KEY='omega7.workflow.r538';
const read=()=>{try{return normalizeWorkflowR538(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return initialWorkflowR538}};
export function WorkflowSurfaceR538({onNavigate}:{onNavigate:(route:string)=>void}){
 const[state,setState]=useState<WorkflowR538>(read);
 const[open,setOpen]=useState(false);
 useEffect(()=>{
  const sync=()=>{let address=11498;try{const stored=localStorage.getItem('omega.v6.address');if(stored===null)return;address=Number(stored)}catch{return}
   if(!Number.isInteger(address)||address<0||address>=20736)return;
   setState(s=>s.address===address?s:transitionWorkflowR538(s,{type:'NAVIGATE',address,source:'ATLAS_SHARED_STATE',at:new Date().toISOString()}));
  };
  sync();window.addEventListener('omega7-address-changed',sync);window.addEventListener('storage',sync);
  return()=>{window.removeEventListener('omega7-address-changed',sync);window.removeEventListener('storage',sync)};
 },[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}},[state]);
 const go=(address:number)=>{setState(s=>transitionWorkflowR538(s,{type:'RESTORE',address,source:'WORKFLOW_RESTORE',at:new Date().toISOString()}));try{localStorage.setItem('omega.v6.address',String(address));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address}}))}catch{};onNavigate('Atlas')};
 const bookmark=()=>setState(s=>transitionWorkflowR538(s,{type:'BOOKMARK',address:s.address,source:'USER_BOOKMARK',note:'Saved user workspace address',at:new Date().toISOString()}));
 return <section className='o7-r538-workflow' data-r538-workflow='true' aria-label='Shared OMEGA workflow context'>
  <div className='o7-r538-bar'><div><span>CONTINUOUS WORKSPACE</span><strong>State {state.address.toLocaleString()}</strong><small>Shared across instruments · user-controlled</small></div><div><button type='button' data-r538-bookmark onClick={bookmark}>☆ Save state</button><button type='button' onClick={()=>onNavigate('Atlas')}>Open Atlas ↗</button><button type='button' aria-expanded={open} onClick={()=>setOpen(x=>!x)}>{open?'Close history':'History & saved states'}</button></div></div>
  {open&&<div className='o7-r538-history'><section><h3>Saved states</h3>{state.bookmarks.length===0?<p>No saved states yet.</p>:state.bookmarks.map(e=><button key={e.id} onClick={()=>go(e.address)}>State {e.address.toLocaleString()} <small>{e.note||e.source}</small></button>)}</section><section><h3>Recent state changes</h3>{state.history.length===0?<p>Traverse the Atlas to begin.</p>:state.history.slice(0,12).map(e=><button key={e.id} onClick={()=>go(e.address)}>State {e.address.toLocaleString()} <small>{e.source}</small></button>)}</section></div>}
 </section>;
}
