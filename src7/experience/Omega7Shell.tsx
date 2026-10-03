import {useMemo,useReducer,useState} from 'react';
import {Command,Search,Activity,Settings2,PanelRight,Home,Briefcase,Compass,Sparkles,Code2,ShieldCheck} from 'lucide-react';
import {OMEGA7_CAPABILITIES,OMEGA7_CAPABILITY_BY_ID,OMEGA7_PRIMARY_DOMAINS,capabilitiesForDomain} from '../kernel/capabilityRegistry';
import {initialOmega7State,omega7Reducer} from '../kernel/appState';
import type {Omega7HumanDomain} from '../kernel/types';
import {Omega7CapabilityBoundary} from './Omega7CapabilityBoundary';
import './omega7.css';

type Props={
 renderLegacySurface:(legacyRoute:string)=>React.ReactNode;
 onLegacyNavigate?:(legacyRoute:string)=>void;
};

const ICON:Record<Omega7HumanDomain,any>={HOME:Home,WORK:Briefcase,EXPLORE:Compass,CREATE:Sparkles,DEVELOP:Code2,SYSTEM:ShieldCheck};

export default function Omega7Shell({renderLegacySurface,onLegacyNavigate}:Props){
 const[state,dispatch]=useReducer(omega7Reducer,initialOmega7State);
 const[query,setQuery]=useState('');
 const active=state.activeCapabilityId?OMEGA7_CAPABILITY_BY_ID.get(state.activeCapabilityId)||null:null;
 const domainCaps=useMemo(()=>capabilitiesForDomain(state.activeDomain),[state.activeDomain]);
 const search=query.trim().toLowerCase();
 const results=useMemo(()=>search?OMEGA7_CAPABILITIES.filter(x=>`${x.label} ${x.description} ${x.humanDomain}`.toLowerCase().includes(search)).slice(0,18):[],[search]);
 const open=(id:string)=>{
  const cap=OMEGA7_CAPABILITY_BY_ID.get(id);if(!cap)return;
  dispatch({type:'OPEN_CAPABILITY',capabilityId:cap.id,legacyRoute:cap.legacyRoute});
  dispatch({type:'COMMAND_OPEN',open:false});
  setQuery('');
  onLegacyNavigate?.(cap.legacyRoute);
 };
 return <div className='o7-shell' data-omega7-schema={state.schema} data-presentation={state.presentation.toLowerCase()}>
  <header className='o7-top'>
   <div className='o7-brand'><span>OMEGA</span><b>7</b></div>
   <button className='o7-command' onClick={()=>dispatch({type:'COMMAND_OPEN',open:true})}><Search size={16}/><span>Ask, search, or open anything</span><kbd>⌘ K</kbd></button>
   <div className='o7-top-actions'>
    <button title='System health' onClick={()=>dispatch({type:'DIAGNOSTICS_OPEN',open:!state.diagnosticsOpen})}><Activity/></button>
    <button title='Inspector' onClick={()=>dispatch({type:'INSPECTOR_OPEN',open:!state.inspectorOpen})}><PanelRight/></button>
    <button title='Settings'><Settings2/></button>
   </div>
  </header>

  <aside className='o7-nav' aria-label='OMEGA7 primary navigation'>
   {OMEGA7_PRIMARY_DOMAINS.map(d=>{const I=ICON[d.id];return <button key={d.id} className={state.activeDomain===d.id?'active':''} onClick={()=>dispatch({type:'NAVIGATE_DOMAIN',domain:d.id})}><I/><span>{d.label}</span></button>})}
  </aside>

  <main className='o7-main'>
   {!active?<section className='o7-home'>
    <header><span>{OMEGA7_PRIMARY_DOMAINS.find(x=>x.id===state.activeDomain)?.label}</span><h1>{state.activeDomain==='HOME'?'What do you want to do?':'Choose a capability'}</h1><p>{OMEGA7_PRIMARY_DOMAINS.find(x=>x.id===state.activeDomain)?.description}</p></header>
    <div className='o7-card-grid'>{domainCaps.map(cap=><button key={cap.id} className='o7-cap-card' onClick={()=>open(cap.id)}><b>{cap.label}</b><p>{cap.description}</p><small>{cap.layout.toLowerCase()} · {cap.execution.toLowerCase()}</small></button>)}</div>
   </section>:
   <section className='o7-workspace' data-layout={active.layout.toLowerCase()}>
    <header className='o7-workspace-head'><div><span>{active.humanDomain}</span><h1>{active.label}</h1><p>{active.description}</p></div><div className='o7-status'><i></i><span>Inherited from OMEGAv6</span></div></header>
    <div className='o7-surface'>
     <Omega7CapabilityBoundary label={active.label}>{renderLegacySurface(active.legacyRoute)}</Omega7CapabilityBoundary>
    </div>
   </section>}
  </main>

  {state.inspectorOpen&&<aside className='o7-inspector'><header><b>Details</b><button onClick={()=>dispatch({type:'INSPECTOR_OPEN',open:false})}>Close</button></header>{active?<><dl><div><dt>Capability</dt><dd>{active.label}</dd></div><div><dt>Runtime source</dt><dd>OMEGAv6 inherited</dd></div><div><dt>Execution</dt><dd>{active.execution}</dd></div><div><dt>Authority</dt><dd>{active.authority}</dd></div></dl><button onClick={()=>dispatch({type:'SET_PRESENTATION',presentation:state.presentation==='STANDARD'?'ADVANCED':state.presentation==='ADVANCED'?'CANON':'STANDARD'})}>View: {state.presentation}</button></>:<p>Select a capability to inspect its execution and evidence context.</p>}</aside>}

  {state.diagnosticsOpen&&<aside className='o7-diagnostics'><header><b>System health</b><button onClick={()=>dispatch({type:'DIAGNOSTICS_OPEN',open:false})}>Close</button></header><div className='o7-health-row'><span>OMEGA7 shell</span><b>READY</b></div><div className='o7-health-row'><span>Inherited capability registry</span><b>{OMEGA7_CAPABILITIES.length} REGISTERED</b></div><p>Capability failures are isolated from the shell. Canonical state is never changed by presentation state.</p></aside>}

  {state.commandOpen&&<div className='o7-command-layer' role='dialog' aria-modal='true' aria-label='OMEGA7 command palette' onMouseDown={e=>{if(e.currentTarget===e.target)dispatch({type:'COMMAND_OPEN',open:false})}}>
   <div className='o7-command-panel'><label><Command/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search capabilities or describe what you want…'/></label><div className='o7-command-results'>{(search?results:OMEGA7_CAPABILITIES.slice(0,10)).map(cap=><button key={cap.id} onClick={()=>open(cap.id)}><span><b>{cap.label}</b><small>{cap.description}</small></span><em>{cap.humanDomain}</em></button>)}</div></div>
  </div>}
 </div>
}
