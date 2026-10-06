import {useEffect,useMemo,useRef,useState} from 'react';
import {OMEGA7_CAPABILITIES,OMEGA7_DOMAINS,omega7CapabilitiesForDomain,searchOmega7Capabilities,type Omega7Domain} from './capabilityRegistry';
import {Omega7AppStateProvider,useOmega7AppState} from './appState';
import {Omega7Boundary} from './Omega7Boundary';
import {isOmega7NativeRoute,Omega7NativeSurface} from './nativeCapabilityRegistry';
import {OMEGA7_PARITY_SUMMARY,parityEvidenceForRoute} from './parityLedgerR451';
import {OMEGA7_ACCEPTED_PARITY_SUMMARY,acceptedParityForRoute} from './parityLedgerR453';
import {OMEGA7_HEIGHTENED_SUMMARY} from './heightenedModeR457';
import {R468_EVENT,developmentalStateBusSnapshotR468,type R468Snapshot} from './developmentalStateBusR468';
import {R486_VISIBLE_CAPABILITIES,R486_VISIBLE_SUMMARY,type VisibleFamilyR486} from './visibleCapabilityConvergenceR486';
import './omega7.css';

type Props={onOpenLegacyRoute:(route:string)=>void;onExitToV6:()=>void};

const DOMAIN_LABEL:Record<Omega7Domain,string>={
 HOME:'Home',WORK:'Work',EXPLORE:'Explore',CREATE:'Create',DEVELOP:'Develop',SYSTEM:'System'
};
const DOMAIN_COPY:Record<Omega7Domain,string>={
 HOME:'Start a task, continue recent work, or search every OMEGA capability.',
 WORK:'Projects, workspace, memory and active work.',
 EXPLORE:'Earth, science, matter, motion, forecasting and state exploration.',
 CREATE:'Visual work, rendering, assets and generation.',
 DEVELOP:'Software, AI runtime, quality, build and connected compute.',
 SYSTEM:'Evidence, governance, settings, archives and diagnostics.'
};

function Omega7Shell({onOpenLegacyRoute,onExitToV6}:Props){
 const{state,dispatch}=useOmega7AppState();
 const inputRef=useRef<HTMLInputElement|null>(null);
 const [development,setDevelopment]=useState<R468Snapshot|null>(null);
 const [recoveredOpen,setRecoveredOpen]=useState(false);
 const [recoveredFamily,setRecoveredFamily]=useState<VisibleFamilyR486|'ALL'>('ALL');
 const domainCaps=useMemo(()=>state.domain==='HOME'?OMEGA7_CAPABILITIES:omega7CapabilitiesForDomain(state.domain),[state.domain]);
 const results=useMemo(()=>state.query?searchOmega7Capabilities(state.query):domainCaps,[state.query,domainCaps]);
 const healthRows=Object.entries(state.health);
 const selectedParity=state.selectedRoute?acceptedParityForRoute(state.selectedRoute):null;
 const historicalParity=state.selectedRoute?parityEvidenceForRoute(state.selectedRoute):null;
 const ready=healthRows.filter(([,v])=>v==='READY').length;
 const held=healthRows.filter(([,v])=>v==='HELD'||v==='DEGRADED'||v==='UNKNOWN').length;
 const failed=healthRows.filter(([,v])=>v==='FAILED').length;
 const recovered=useMemo(()=>R486_VISIBLE_CAPABILITIES.filter(x=>recoveredFamily==='ALL'||x.family===recoveredFamily),[recoveredFamily]);

 useEffect(()=>{
  const key=(event:KeyboardEvent)=>{
   if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();dispatch({type:'COMMAND',open:true});queueMicrotask(()=>inputRef.current?.focus())}
   if(event.key==='Escape'){dispatch({type:'COMMAND',open:false});dispatch({type:'STATUS',open:false})}
  };
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[dispatch]);
 useEffect(()=>{
  let live=true;
  const refresh=()=>void developmentalStateBusSnapshotR468().then(x=>{if(live)setDevelopment(x)});
  refresh();
  window.addEventListener(R468_EVENT,refresh as EventListener);
  return()=>{live=false;window.removeEventListener(R468_EVENT,refresh as EventListener)};
 },[]);

 const open=(route:string)=>{
  const cap=OMEGA7_CAPABILITIES.find(x=>x.legacyRoute===route);
  if(!cap)return;
  dispatch({type:'SELECT_ROUTE',route:cap.legacyRoute});
  dispatch({type:'COMMAND',open:false});
  if(!isOmega7NativeRoute(cap.legacyRoute))onOpenLegacyRoute(cap.legacyRoute);
 };

 return <div className='o7-app' data-omega7='true' data-depth={state.depth.toLowerCase()}>
  <header className='o7-topbar'>
   <button className='o7-brand' onClick={()=>dispatch({type:'DOMAIN',domain:'HOME'})}><b>OMEGA</b><span>7</span></button>
   <button className='o7-search-trigger' onClick={()=>{dispatch({type:'COMMAND',open:true});queueMicrotask(()=>inputRef.current?.focus())}}>Search or ask OMEGA <kbd>Ctrl K</kbd></button>
   <div className='o7-top-actions'>
    <select aria-label='Interface depth' value={state.depth} onChange={e=>dispatch({type:'DEPTH',depth:e.target.value as any})}>
     <option value='STANDARD'>Standard</option><option value='ADVANCED'>Advanced</option><option value='CANON'>Canon</option>
    </select>
    <button className='o7-health-button' data-state={failed?'failed':held?'degraded':'ready'} onClick={()=>dispatch({type:'STATUS',open:!state.statusOpen})}>
     {failed?'Needs attention':held?'Partially available':'System ready'}
    </button>
    <button className='o7-v6' onClick={onExitToV6}>OMEGA6</button>
   </div>
  </header>

  <aside className='o7-nav' aria-label='OMEGA7 primary navigation'>
   {OMEGA7_DOMAINS.map(domain=><button key={domain} className={state.domain===domain?'active':''} onClick={()=>dispatch({type:'DOMAIN',domain})}><span>{DOMAIN_LABEL[domain]}</span></button>)}
  </aside>

  <main className='o7-main' data-native-route={state.selectedRoute&&isOmega7NativeRoute(state.selectedRoute)?state.selectedRoute:''}>
   {state.selectedRoute&&isOmega7NativeRoute(state.selectedRoute)?
    <section className='o7-native-host'>
     <div className='o7-native-toolbar'><button onClick={()=>dispatch({type:'SELECT_ROUTE',route:null})}>← Back to {DOMAIN_LABEL[state.domain]}</button><span>OMEGA7 native · OMEGAv6 engine preserved</span></div>
     <Omega7NativeSurface route={state.selectedRoute} onNavigate={open} depth={state.depth}/>
    </section>:
    <>
     <section className='o7-intro'>
      <p>OMEGA7</p>
      <h1>{state.domain==='HOME'?'What do you want to do?':DOMAIN_LABEL[state.domain]}</h1>
      <span>{DOMAIN_COPY[state.domain]}</span>
     </section>

     {state.domain==='HOME'&&<section className='o7-home-actions'>
      <button onClick={()=>open('Command Center')}><b>Ask OMEGA</b><span>Start with a question or task</span></button>
      <button onClick={()=>open('Projects')}><b>Projects</b><span>Continue active work</span></button>
      <button onClick={()=>open('Earth Now')}><b>Earth & Weather</b><span>Explore current Earth data</span></button>
      <button onClick={()=>open('Development')}><b>Build Software</b><span>Develop, repair and validate</span></button>
     </section>}
     {state.domain==='HOME'&&<section className='o7-recovered' data-r486-visible-convergence='true'>
      <header><div><span>Recovered capability fabric</span><h2>Your recovered work is connected to the product</h2><p>{R486_VISIBLE_SUMMARY.total} recovered capability lineages now resolve through their current OMEGA executors. Open the function you need; lineage, gate and authority stay attached underneath.</p></div><button onClick={()=>setRecoveredOpen(x=>!x)}>{recoveredOpen?'Hide recovered capabilities':'Browse recovered capabilities'}</button></header>
      <div className='o7-recovered-summary'><article><b>{R486_VISIBLE_SUMMARY.executesNow}</b><span>execute now</span></article><article><b>{R486_VISIBLE_SUMMARY.adapters}</b><span>active adapters</span></article><article><b>{R486_VISIBLE_SUMMARY.truthGated}</b><span>truth/device gated</span></article><article><b>{R486_VISIBLE_SUMMARY.routable}/{R486_VISIBLE_SUMMARY.total}</b><span>bound to current routes</span></article></div>
      {recoveredOpen&&<><nav aria-label='Recovered capability groups'>{(['ALL','UNDERSTAND','EXPLORE','CREATE','BUILD','WORK','RECOVER'] as const).map(x=><button key={x} className={recoveredFamily===x?'active':''} onClick={()=>setRecoveredFamily(x)}>{x==='ALL'?'All':x[0]+x.slice(1).toLowerCase()}</button>)}</nav><div className='o7-recovered-grid'>{recovered.map(x=><article key={x.id} data-state={x.state.toLowerCase()}><header><span>{x.family} · {x.state==='EXECUTES_NOW'?'LIVE':x.state==='EXECUTES_AS_ADAPTER'?'ADAPTER':'GATED'}</span><b>{x.name}</b></header><p>{x.contribution}</p><footer><small>{x.operation}</small><button onClick={()=>open(x.route)}>Open {x.route}</button></footer>{state.depth!=='STANDARD'&&<details><summary>Lineage & proof</summary><p>{x.aliases.join(' · ')}</p><dl><div><dt>Reality</dt><dd>{x.capabilityReality}</dd></div><div><dt>Receipt</dt><dd>{x.receiptAuthority}</dd></div><div><dt>Admission</dt><dd>{x.admissionAuthority}</dd></div><div><dt>Boundary</dt><dd>{x.truth}</dd></div></dl></details>}</article>)}</div></>}
     </section>}

     <section className='o7-capability-section'>
      <header><div><b>{state.domain==='HOME'?'Capabilities':'Available tools'}</b><span>{results.length} shown · {OMEGA7_CAPABILITIES.length} inherited from OMEGAv6</span></div>{state.domain!=='HOME'&&<button onClick={()=>dispatch({type:'COMMAND',open:true})}>Find anything</button>}</header>
      <div className='o7-capability-grid'>
       {results.map(cap=><article key={cap.id} data-health={cap.availability.toLowerCase()} data-native={isOmega7NativeRoute(cap.legacyRoute)?'true':'false'} data-capability-route={cap.legacyRoute}>
        <div><small>{cap.domain}{isOmega7NativeRoute(cap.legacyRoute)?' · OMEGA7 NATIVE':''}</small><b>{cap.label}</b><p>{cap.description}</p></div>
        <footer><span>{cap.availability==='READY'?'Ready':cap.availability==='HELD'?'Requires evidence or connection':cap.availability}</span><button onClick={()=>open(cap.legacyRoute)}>{cap.primaryAction}</button></footer>
        {state.depth!=='STANDARD'&&<details><summary>Technical details</summary><dl><div><dt>Legacy route</dt><dd>{cap.legacyRoute}</dd></div><div><dt>Family</dt><dd>{cap.family}</dd></div><div><dt>Authority</dt><dd>{cap.authority}</dd></div><div><dt>Boundary</dt><dd>{cap.sourceBoundary}</dd></div><div><dt>Reality</dt><dd>{cap.reality}</dd></div></dl></details>}
       </article>)}
      </div>
     </section>
    </>}
  </main>

  {state.statusOpen&&<section className='o7-status' role='dialog' aria-label='System status'>
   <header><div><b>System status</b><span>{ready} ready · {held} limited · {failed} failed</span></div><button onClick={()=>dispatch({type:'STATUS',open:false})}>Close</button></header>
   <div>{healthRows.map(([key,value])=><article key={key} data-health={String(value).toLowerCase()}><span>{key.replaceAll(/([A-Z])/g,' $1')}</span><b>{value}</b></article>)}</div>
   <div className='o7-parity-summary' data-r451-parity='historical' data-r451-total={OMEGA7_PARITY_SUMMARY.total} data-r451-selected={historicalParity?.parityLevel||''} data-r453-parity='accepted'><article><span>Routes browser-proved</span><b>{OMEGA7_ACCEPTED_PARITY_SUMMARY.functionalDesktopMobile}/{OMEGA7_ACCEPTED_PARITY_SUMMARY.total}</b></article><article><span>Failure/recovery proved · family isolation</span><b>{OMEGA7_ACCEPTED_PARITY_SUMMARY.familyFailureIsolation}/{OMEGA7_ACCEPTED_PARITY_SUMMARY.total}</b></article><article><span>Performance proved</span><b>{OMEGA7_ACCEPTED_PARITY_SUMMARY.performance}/{OMEGA7_ACCEPTED_PARITY_SUMMARY.total}</b></article><article><span>Rollback proved</span><b>{OMEGA7_ACCEPTED_PARITY_SUMMARY.rollback}/{OMEGA7_ACCEPTED_PARITY_SUMMARY.total}</b></article><article><span>Legacy retired</span><b>{OMEGA7_ACCEPTED_PARITY_SUMMARY.legacyRetired}</b></article><article><span>Architecture</span><b>{OMEGA7_HEIGHTENED_SUMMARY.capabilityCount} capabilities · {OMEGA7_HEIGHTENED_SUMMARY.familyCount} compositions</b></article>{development&&<article data-r468-developmental-state={development.status.toLowerCase()}><span>Developmental ledger</span><b>{development.status} · {development.recordCount} records{development.headDecision?` · ${development.headDecision}`:''}</b></article>}{selectedParity&&<article><span>Selected route proof</span><b>{selectedParity.parityLevel.replaceAll('_',' ')}</b></article>}</div>
   <p>Availability, execution, parity proof, and Canon authority remain separate. Full product parity is accepted across the 44 inherited routes, while route-specific provider/device failure modes remain scoped to the evidence actually exercised. OMEGAv6 is still retained as rollback.</p>
  </section>}

  {state.commandOpen&&<div className='o7-command-backdrop' onMouseDown={e=>{if(e.currentTarget===e.target)dispatch({type:'COMMAND',open:false})}}>
   <section className='o7-command' role='dialog' aria-modal='true' aria-label='Search OMEGA'>
    <input ref={inputRef} value={state.query} onChange={e=>dispatch({type:'QUERY',query:e.target.value})} placeholder='Search capabilities or type what you want to do…'/>
    <div>{(state.query?searchOmega7Capabilities(state.query):OMEGA7_CAPABILITIES.slice(0,12)).slice(0,20).map(cap=><button key={cap.id} data-command-route={cap.legacyRoute} onClick={()=>open(cap.legacyRoute)}><span><b>{cap.label}</b><small>{cap.description}</small></span><em>{cap.availability}</em></button>)}</div>
   </section>
  </div>}
 </div>;
}

export default function Omega7Root(props:Props){
 return <Omega7Boundary label='OMEGA7 shell'><Omega7AppStateProvider><Omega7Shell {...props}/></Omega7AppStateProvider></Omega7Boundary>;
}
