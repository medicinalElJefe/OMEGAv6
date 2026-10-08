import {lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {OMEGA7_CAPABILITIES,OMEGA7_DOMAINS,type Omega7Domain} from './capabilityRegistry';
import {Omega7AppStateProvider,useOmega7AppState} from './appState';
import {Omega7Boundary} from './Omega7Boundary';
import {isOmega7NativeRoute,Omega7NativeSurface} from './nativeCapabilityRegistry';
import {OMEGA7_PARITY_SUMMARY,parityEvidenceForRoute} from './parityLedgerR451';
import {OMEGA7_ACCEPTED_PARITY_SUMMARY,acceptedParityForRoute} from './parityLedgerR453';
import {OMEGA7_HEIGHTENED_SUMMARY} from './heightenedModeR457';
import {R468_EVENT,developmentalStateBusSnapshotR468,type R468Snapshot} from './developmentalStateBusR468';
import {R486_VISIBLE_SUMMARY,type VisibleFamilyR486} from './visibleCapabilityConvergenceR486';
import {menuSectionsForDomainR512,R512_EXECUTABLE_SOFTWARE,searchExecutableMenuR512,type R512SoftwareBinding} from './executableMenuR512';
import OperationalTruthR495 from './OperationalTruthR495';
import './omega7.css';

const OmegaHomeR71=lazy(()=>import('../src/OmegaHomeR71'));

type Props={onOpenLegacyRoute:(route:string)=>void;onExitToV6:()=>void};

const DOMAIN_LABEL:Record<Omega7Domain,string>={
 HOME:'Home',WORK:'Work',EXPLORE:'Explore',CREATE:'Create',DEVELOP:'Build',SYSTEM:'System'
};
const DOMAIN_COPY:Record<Omega7Domain,string>={
 HOME:'Start a task, continue recent work, or search every OMEGA capability.',
 WORK:'Projects, workspace, memory and active work.',
 EXPLORE:'Earth, science, matter, motion, forecasting and state exploration.',
 CREATE:'Visual work, rendering, assets and generation.',
 DEVELOP:'Build, repair, AI runtime, quality and connected compute.',
 SYSTEM:'Evidence, governance, settings, archives and diagnostics.'
};

function Omega7Shell({onOpenLegacyRoute,onExitToV6}:Props){
 const{state,dispatch}=useOmega7AppState();
 const inputRef=useRef<HTMLInputElement|null>(null);
 const [development,setDevelopment]=useState<R468Snapshot|null>(null);
 const [recoveredOpen,setRecoveredOpen]=useState(false);
 const [recoveredFamily,setRecoveredFamily]=useState<VisibleFamilyR486|'ALL'>('ALL');
 const menuSections=useMemo(()=>menuSectionsForDomainR512(state.domain),[state.domain]);
 const commandResults=useMemo(()=>searchExecutableMenuR512(state.query,state.domain).slice(0,24),[state.query,state.domain]);
 const healthRows=Object.entries(state.health);
 const selectedParity=state.selectedRoute?acceptedParityForRoute(state.selectedRoute):null;
 const historicalParity=state.selectedRoute?parityEvidenceForRoute(state.selectedRoute):null;
 const ready=healthRows.filter(([,v])=>v==='READY').length;
 const held=healthRows.filter(([,v])=>v==='HELD'||v==='DEGRADED'||v==='UNKNOWN').length;
 const failed=healthRows.filter(([,v])=>v==='FAILED').length;
 const recovered=useMemo(()=>R512_EXECUTABLE_SOFTWARE.filter(x=>recoveredFamily==='ALL'||x.family===recoveredFamily),[recoveredFamily]);

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
  dispatch({type:'DOMAIN',domain:cap.domain});
  dispatch({type:'SELECT_ROUTE',route:cap.legacyRoute});
  dispatch({type:'COMMAND',open:false});
  if(!isOmega7NativeRoute(cap.legacyRoute))onOpenLegacyRoute(cap.legacyRoute);
 };
 const launchSoftware=(software:R512SoftwareBinding)=>{
  const cap=OMEGA7_CAPABILITIES.find(x=>x.legacyRoute===software.route);
  if(!cap||!isOmega7NativeRoute(cap.legacyRoute))return;
  dispatch({type:'DOMAIN',domain:cap.domain});
  dispatch({type:'LAUNCH_SOFTWARE',launch:{
   bindingId:software.id,
   name:software.name,
   route:cap.legacyRoute,
   operation:software.operation,
   state:software.state,
   launchState:software.launchState,
   aliases:software.aliases,
   truth:software.truth,
   capabilityReality:software.capabilityReality,
   receiptAuthority:software.receiptAuthority,
   admissionAuthority:software.admissionAuthority,
  }});
 };

 return <div className='o7-app' data-omega7='true' data-depth={state.depth.toLowerCase()}>
  <header className='o7-topbar'>
   <button className='o7-brand' onClick={()=>dispatch({type:'DOMAIN',domain:'HOME'})}><b>OMEGA</b><span>7</span></button>
   <button className='o7-search-trigger' onClick={()=>{dispatch({type:'COMMAND',open:true});queueMicrotask(()=>inputRef.current?.focus())}}>Search tools or previous software <kbd>Ctrl K</kbd></button>
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
    <section className='o7-native-host' data-native-host-route={state.selectedRoute}>
     <div className='o7-native-toolbar'><button onClick={()=>dispatch({type:'SELECT_ROUTE',route:null})}>← Back to {DOMAIN_LABEL[state.domain]}</button><span>OMEGA7 native · OMEGAv6 engine preserved</span></div>
     <Omega7NativeSurface route={state.selectedRoute} onNavigate={open} depth={state.depth} softwareLaunch={state.softwareLaunch}/>
    </section>:
    <>
     {state.domain!=='HOME'&&<section className='o7-intro'>
      <p>OMEGA7</p>
      <h1>{DOMAIN_LABEL[state.domain]}</h1>
      <span>{DOMAIN_COPY[state.domain]}</span>
     </section>}

     {state.domain==='HOME'&&<section className='o7-home-visual o7-home-established' data-r510-visual-restoration='CURRENT_R71_CANONICAL_HOME'>
      <Suspense fallback={<div className='o7-home-stage-loading'>Materializing current OMEGA visual system…</div>}>
       <OmegaHomeR71
        embedded
        onEnter={open}
        onOpenAllTools={()=>{dispatch({type:'COMMAND',open:true});queueMicrotask(()=>inputRef.current?.focus())}}
        onOpenSystemMap={()=>open('System Atlas')}
       />
      </Suspense>
     </section>}
     {state.domain==='HOME'&&<OperationalTruthR495 depth={state.depth} onNavigate={open}/>}\n     {state.domain==='HOME'&&<section className='o7-recovered' data-r486-visible-convergence='true'>
      <header><div><span>Previous software · current executors</span><h2>Your earlier OMEGA software is launchable through its current working successor</h2><p>{R486_VISIBLE_SUMMARY.total} recovered software/capability lineages are bound to current OMEGA executors. Historical names remain searchable aliases; launch carries the exact operation and truth boundary into the working surface.</p></div><button onClick={()=>setRecoveredOpen(x=>!x)}>{recoveredOpen?'Hide previous software':'Browse previous software'}</button></header>
      <div className='o7-recovered-summary'><article><b>{R486_VISIBLE_SUMMARY.executesNow}</b><span>execute now</span></article><article><b>{R486_VISIBLE_SUMMARY.adapters}</b><span>active adapters</span></article><article><b>{R486_VISIBLE_SUMMARY.truthGated}</b><span>truth/device gated</span></article><article><b>{R486_VISIBLE_SUMMARY.routable}/{R486_VISIBLE_SUMMARY.total}</b><span>bound to current routes</span></article></div>
      {recoveredOpen&&<><nav aria-label='Previous software groups'>{(['ALL','UNDERSTAND','EXPLORE','CREATE','BUILD','WORK','RECOVER'] as const).map(x=><button key={x} className={recoveredFamily===x?'active':''} onClick={()=>setRecoveredFamily(x)}>{x==='ALL'?'All':x[0]+x.slice(1).toLowerCase()}</button>)}</nav><div className='o7-recovered-grid'>{recovered.map(x=><article key={x.id} data-state={x.state.toLowerCase()} data-r512-software-binding={x.id}><header><span>{x.family} · {x.launchState}</span><b>{x.name}</b></header><p>{x.contribution}</p><footer><small>{x.operation} → {x.route}</small><button onClick={()=>launchSoftware(x)}>{x.launchState==='LIVE'?'Launch current executor':x.launchState==='ADAPTER'?'Launch adapted successor':'Open evidence/device gate'}</button></footer>{state.depth!=='STANDARD'&&<details><summary>Aliases, lineage & proof</summary><p>{x.aliases.join(' · ')}</p><dl><div><dt>Current executor</dt><dd>{x.route}</dd></div><div><dt>Reality</dt><dd>{x.capabilityReality}</dd></div><div><dt>Receipt</dt><dd>{x.receiptAuthority}</dd></div><div><dt>Admission</dt><dd>{x.admissionAuthority}</dd></div><div><dt>Boundary</dt><dd>{x.truth}</dd></div></dl></details>}</article>)}</div></>}
     </section>}

     <section className='o7-capability-section o7-r512-menu' data-r512-menu='intent-capability-executor'>
      <header><div><b>{state.domain==='HOME'?'Current OMEGA':'Tools in '+DOMAIN_LABEL[state.domain]}</b><span>{state.domain==='HOME'?'Six primary starting points. Every other tool and previous software name remains searchable.':OMEGA7_CAPABILITIES.filter(x=>x.domain===state.domain).length+' current capabilities, organized by use instead of one flat list.'}</span></div><button onClick={()=>{dispatch({type:'COMMAND',open:true});queueMicrotask(()=>inputRef.current?.focus())}}>Search everything</button></header>
      <div className='o7-menu-groups'>
       {menuSections.map(section=><section key={section.id} className='o7-menu-group' data-r512-menu-section={section.id.toLowerCase()}>
        <header><div><b>{section.label}</b><span>{section.copy}</span></div><em>{section.capabilities.length}</em></header>
        <div className='o7-capability-grid'>
         {section.capabilities.map(cap=><article key={cap.id} data-health={cap.availability.toLowerCase()} data-native={isOmega7NativeRoute(cap.legacyRoute)?'true':'false'} data-capability-route={cap.legacyRoute}>
          <div><small>{cap.family}{isOmega7NativeRoute(cap.legacyRoute)?' · CURRENT EXECUTOR':''}</small><b>{cap.label}</b><p>{cap.description}</p></div>
          <footer><span>{cap.availability==='READY'?'Ready':cap.availability==='HELD'?'Requires evidence or connection':cap.availability}</span><button onClick={()=>open(cap.legacyRoute)}>{cap.primaryAction}</button></footer>
          {state.depth!=='STANDARD'&&<details><summary>Technical details</summary><dl><div><dt>Route</dt><dd>{cap.legacyRoute}</dd></div><div><dt>Family</dt><dd>{cap.family}</dd></div><div><dt>Authority</dt><dd>{cap.authority}</dd></div><div><dt>Boundary</dt><dd>{cap.sourceBoundary}</dd></div><div><dt>Reality</dt><dd>{cap.reality}</dd></div></dl></details>}
         </article>)}
        </div>
       </section>)}
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
    <header><div><b>Find a tool or previous software</b><span>Historical names resolve to their current working executor.</span></div><kbd>Esc</kbd></header>
    <input ref={inputRef} value={state.query} onChange={e=>dispatch({type:'QUERY',query:e.target.value})} placeholder='Try “Omega Atlas OS”, “Mode 188”, “Earth”, “build”, “proof”…'/>
    <div>{commandResults.map(result=>{
     if(result.kind==='CAPABILITY'){
      const cap=result.capability;
      return <button key={result.id} data-command-route={cap.legacyRoute} onClick={()=>open(cap.legacyRoute)}><span><small>Current tool · {cap.domain}</small><b>{cap.label}</b><em>{cap.description}</em></span><strong>{cap.availability}</strong></button>;
     }
     const software=result.software;
     return <button key={result.id} data-command-software={software.id} data-command-route={software.route} onClick={()=>launchSoftware(software)}><span><small>Previous software · {software.launchState}</small><b>{software.name}</b><em>{software.operation} → {software.route}</em></span><strong>{software.launchState==='GATED'?'OPEN GATE':'LAUNCH'}</strong></button>;
    })}</div>
   </section>
  </div>}
 </div>;
}

export default function Omega7Root(props:Props){
 return <Omega7Boundary label='OMEGA7 shell'><Omega7AppStateProvider><Omega7Shell {...props}/></Omega7AppStateProvider></Omega7Boundary>;
}
