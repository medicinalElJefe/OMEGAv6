import {useEffect,useState} from 'react';
import {initialWorkflowR538,normalizeWorkflowR538,transitionWorkflowR538,exportWorkflowSnapshotR538,importWorkflowSnapshotR538,type WorkflowR538} from './workflowContextR538';
import './workflowSurfaceR538.css';
const KEY='omega7.workflow.r538';
const read=()=>{try{return normalizeWorkflowR538(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return initialWorkflowR538}};
export function WorkflowSurfaceR538({onNavigate}:{onNavigate:(route:string)=>void}){
 const[state,setState]=useState<WorkflowR538>(read);
 const[open,setOpen]=useState(false);
 const[snapshotOpen,setSnapshotOpen]=useState(false);
 const[snapshotText,setSnapshotText]=useState('');
 const[snapshotStatus,setSnapshotStatus]=useState('');
 useEffect(()=>{
  const sync=()=>{let address=11498;try{address=Number(localStorage.getItem('omega.v6.address')||11498)}catch{}
   if(!Number.isInteger(address)||address<0||address>=20736)return;
   setState(s=>s.address===address?s:transitionWorkflowR538(s,{type:'NAVIGATE',address,source:'ATLAS_SHARED_STATE',at:new Date().toISOString()}));
  };
  const storage=(event:StorageEvent)=>{if(event.key===KEY&&event.newValue){try{setState(importWorkflowSnapshotR538(event.newValue))}catch{}}else if(event.key==='omega.v6.address')sync()};
  sync();window.addEventListener('omega7-address-changed',sync);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener('omega7-address-changed',sync);window.removeEventListener('storage',storage)};
 },[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}},[state]);
 const go=(address:number)=>{try{localStorage.setItem('omega.v6.address',String(address));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address}}))}catch{};setState(s=>transitionWorkflowR538(s,{type:'RESTORE',address,source:'WORKFLOW_RESTORE',at:new Date().toISOString()}));onNavigate('Atlas')};
 const bookmark=()=>setState(s=>transitionWorkflowR538(s,{type:'BOOKMARK',address:s.address,source:'USER_BOOKMARK',note:'Saved user workspace address',at:new Date().toISOString()}));
 const prepareSnapshot=()=>{setSnapshotText(exportWorkflowSnapshotR538(state));setSnapshotStatus('Local workspace snapshot prepared. Copy this JSON to preserve it on another device. No upload occurs.')};
 const restoreSnapshot=()=>{try{const imported=importWorkflowSnapshotR538(snapshotText);setState(s=>({...imported,address:s.address}));setSnapshotStatus('Saved states and history imported locally. Current Atlas address unchanged until you select a saved state.')}catch(error){setSnapshotStatus(error instanceof Error?error.message:'R538_SNAPSHOT_REFUSED')}};
 return <section className='o7-r538-workflow' data-r538-workflow='true' aria-label='Shared OMEGA workflow context'>
  <div className='o7-r538-bar'><div><span>CONTINUOUS WORKSPACE</span><strong>State {state.address.toLocaleString()}</strong><small>Shared across instruments · user-controlled</small></div><div><button type='button' data-r538-bookmark onClick={bookmark}>☆ Save state</button><button type='button' onClick={()=>onNavigate('Atlas')}>Open Atlas ↗</button><button type='button' aria-expanded={open} onClick={()=>setOpen(x=>!x)}>{open?'Close history':'History & saved states'}</button><button type='button' aria-expanded={snapshotOpen} onClick={()=>setSnapshotOpen(x=>!x)}>Portable snapshot</button></div></div>
  {snapshotOpen&&<div className='o7-r538-snapshot'><p>User-local bookmark/history transfer only. No source archive, CanonState, device proof or external upload.</p><div><button type='button' onClick={prepareSnapshot}>Prepare snapshot</button><button type='button' onClick={restoreSnapshot}>Import snapshot</button></div><textarea aria-label='Workspace snapshot JSON' value={snapshotText} onChange={e=>setSnapshotText(e.target.value)} rows={5} spellCheck={false}/>{snapshotStatus&&<p role='status' data-r538-snapshot-status>{snapshotStatus}</p>}</div>}
  {open&&<div className='o7-r538-history'><section><h3>Saved states</h3>{state.bookmarks.length===0?<p>No saved states yet.</p>:state.bookmarks.map(e=><button key={e.id} onClick={()=>go(e.address)}>State {e.address.toLocaleString()} <small>{e.note||e.source}</small></button>)}</section><section><h3>Recent state changes</h3>{state.history.length===0?<p>Traverse the Atlas to begin.</p>:state.history.slice(0,12).map(e=><button key={e.id} onClick={()=>go(e.address)}>State {e.address.toLocaleString()} <small>{e.source}</small></button>)}</section></div>}
 </section>;
}
