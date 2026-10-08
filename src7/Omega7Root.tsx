import {Fragment,lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {OMEGA7_CAPABILITIES,omega7CapabilitiesForDomain,searchOmega7Capabilities,type Omega7Domain} from './capabilityRegistry';
import {Omega7AppStateProvider,useOmega7AppState} from './appState';
import {Omega7Boundary} from './Omega7Boundary';
import {isOmega7NativeRoute,Omega7NativeSurface} from './nativeCapabilityRegistry';
import {OMEGA7_PARITY_SUMMARY,parityEvidenceForRoute} from './parityLedgerR451';
import {OMEGA7_ACCEPTED_PARITY_SUMMARY,acceptedParityForRoute} from './parityLedgerR453';
import {OMEGA7_HEIGHTENED_SUMMARY} from './heightenedModeR457';
import {R468_EVENT,developmentalStateBusSnapshotR468,type R468Snapshot} from './developmentalStateBusR468';
import {R486_VISIBLE_CAPABILITIES,R486_VISIBLE_SUMMARY,type VisibleFamilyR486} from './visibleCapabilityConvergenceR486';
import {R512_DOMAIN_MENU,R512_MENU_SUMMARY,menuSectionsR512,recoveredForDomainR512,recoveredExecutionCapsuleR512,type RecoveredExecutionCapsuleR512} from './capabilityMenuR512';
import type {R512RecoveredSystemResolution} from '../src/recoveredSoftwareExecutionR512';
import OperationalTruthR495 from './OperationalTruthR495';
import './omega7.css';

const OmegaHomeR71=lazy(()=>import('../src/OmegaHomeR71'));

type Props={onOpenLegacyRoute:(route:string)=>void;onExitToV6:()=>void};

const DOMAIN_LABEL:Record<Omega7Domain,string>={
 HOME:'Home',WORK:'Work',EXPLORE:'Explore',CREATE:'Create',DEVELOP:'Develop',SYSTEM:'System'
};
function Omega7Shell({onOpenLegacyRoute,onExitToV6}:Props){
 const{state,dispatch}=useOmega7AppState();
 const inputRef=useRef<HTMLInputElement|null>(null);
 const [development,setDevelopment]=useState<R468Snapshot|null>(null);
 const [recoveredOpen,setRecoveredOpen]=useState(false);
 const [recoveredFamily,setRecoveredFamily]=useState<VisibleFamilyR486|'ALL'>('ALL');
 const [previousSoftwareQuery,setPreviousSoftwareQuery]=useState('');
 const [previousSoftwareResults,setPreviousSoftwareResults]=useState<readonly R512RecoveredSystemResolution[]>([]);
 const [commandPreviousSoftware,setCommandPreviousSoftware]=useState<readonly R512RecoveredSystemResolution[]>([]);
 const [activeRecovered,setActiveRecovered]=useState<RecoveredExecutionCapsuleR512|null>(()=>{try{const raw=sessionStorage.getItem('omega.r512.executionCapsule');return raw?JSON.parse(raw):null}catch{return null}});
 const domainCaps=useMemo(()=>state.domain==='HOME'?OMEGA7_CAPABILITIES:omega7CapabilitiesForDomain(state.domain),[state.domain]);
 const results=useMemo(()=>state.query?searchOmega7Capabilities(state.query):domainCaps,[state.query,domainCaps]);
 const healthRows=Object.entries(state.health);
 const selectedParity=state.selectedRoute?acceptedParityForRoute(state.selectedRoute):null;
 const historicalParity=state.selectedRoute?parityEvidenceForRoute(state.selectedRoute):null;
 const ready=healthRows.filter(([,v])=>v==='READY').length;
 const held=healthRows.filter(([,v])=>v==='HELD'||v==='DEGRADED'||v==='UNKNOWN').length;
 const failed=healthRows.filter(([,v])=>v==='FAILED').length;
 const recovered=useMemo(()=>R486_VISIBLE_CAPABILITIES.filter(x=>recoveredFamily==='ALL'||x.family===recoveredFamily),[recoveredFamily]);
 const menuSections=useMemo(()=>menuSectionsR512(state.domain),[state.domain]);
 const domainRecovered=useMemo(()=>recoveredForDomainR512(state.domain),[state.domain]);
 const domainMenu=R512_DOMAIN_MENU.find(x=>x.id===state.domain)||R512_DOMAIN_MENU[0];
 useEffect(()=>{let live=true;const q=previousSoftwareQuery.trim();if(!q){setPreviousSoftwareResults([]);return()=>{live=false}};void import('./recoveredSystemSearchR512').then(m=>{if(live)setPreviousSoftwareResults(m.searchRecoveredSystemsR512(q).slice(0,12))});return()=>{live=false}},[previousSoftwareQuery]);
 useEffect(()=>{let live=true;const q=state.query.trim();if(!q){setCommandPreviousSoftware([]);return()=>{live=false}};void import('./recoveredSystemSearchR512').then(m=>{if(live)setCommandPreviousSoftware(m.searchRecoveredSystemsR512(q).slice(0,8))});return()=>{live=false}},[state.query]);

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

 const launchCapsule=(capsule:RecoveredExecutionCapsuleR512)=>{
  setActiveRecovered(capsule);
  try{sessionStorage.setItem('omega.r512.executionCapsule',JSON.stringify(capsule))}catch{}
  window.dispatchEvent(new CustomEvent('omega-r512-execute-capability',{detail:capsule}));
  open(capsule.route);
 };
 const launchRecovered=(entry:(typeof R486_VISIBLE_CAPABILITIES)[number])=>launchCapsule(recoveredExecutionCapsuleR512(entry));
 const launchRecoveredSystem=(entry:R512RecoveredSystemResolution)=>void import('./recoveredSystemSearchR512').then(m=>launchCapsule(m.recoveredSystemExecutionCapsuleR512(entry)));
 const clearRecoveredExecution=()=>{
  setActiveRecovered(null);
  try{sessionStorage.removeItem('omega.r512.executionCapsule')}catch{}
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

  <aside className='o7-nav o7-nav-r512' aria-label='OMEGA7 capability-first navigation' data-navigation-revision='R512'>
   {R512_DOMAIN_MENU.map(menu=><button key={menu.id} className={state.domain===menu.id?'active':''} onClick={()=>dispatch({type:'DOMAIN',domain:menu.id})} title={menu.purpose}><span>{menu.shortLabel}</span><small>{menu.id==='HOME'?'start':menuSectionsR512(menu.id).ready.length+' ready'}</small></button>)}
  </aside>

  <main className='o7-main' data-native-route={state.selectedRoute&&isOmega7NativeRoute(state.selectedRoute)?state.selectedRoute:''}>
   {state.selectedRoute&&isOmega7NativeRoute(state.selectedRoute)?
    <section className='o7-native-host' data-native-host-route={state.selectedRoute}>
     <div className='o7-native-toolbar'><button onClick={()=>dispatch({type:'SELECT_ROUTE',route:null})}>← Back to {DOMAIN_LABEL[state.domain]}</button><span>OMEGA7 native · OMEGAv6 engine preserved</span></div>
     {activeRecovered&&activeRecovered.route===state.selectedRoute&&<aside className='o7-executor-capsule' data-r512-executor={activeRecovered.recoveredId} data-state={activeRecovered.state.toLowerCase()}>
      <div><span>Resolved historical software</span><b>{activeRecovered.recoveredName}</b><small>{activeRecovered.operation} → {activeRecovered.route}</small></div>
      <dl><div><dt>Executor</dt><dd>{activeRecovered.capabilityId}</dd></div><div><dt>Domain</dt><dd>{activeRecovered.executionDomain}</dd></div><div><dt>State</dt><dd>{activeRecovered.state.replaceAll('_',' ')}</dd></div><div><dt>Action</dt><dd>{(activeRecovered.launchKind||'EXECUTE').replaceAll('_',' ')}</dd></div><div><dt>Source</dt><dd>{(activeRecovered.sourceKind||'CAPABILITY_LINEAGE').replaceAll('_',' ')}</dd></div><div><dt>Proof</dt><dd>{activeRecovered.receiptAuthority} / {activeRecovered.admissionAuthority}</dd></div></dl>
      <button onClick={clearRecoveredExecution}>Clear focus</button>
     </aside>}
     <Omega7NativeSurface route={state.selectedRoute} onNavigate={open} depth={state.depth} softwareLaunch={activeRecovered}/>
    </section>:
    <>
     {state.domain!=='HOME'&&<section className='o7-intro o7-intro-r512'>
      <p>OMEGA7 · {domainMenu.label}</p>
      <h1>{domainMenu.label}</h1>
      <span>{domainMenu.purpose}</span>
      <div className='o7-quick-menu' aria-label={domainMenu.label+' quick actions'}>
       {menuSections.ready.slice(0,6).map(cap=><button key={cap.id} onClick={()=>open(cap.legacyRoute)} data-health='ready'><b>{cap.label}</b><small>{cap.primaryAction}</small></button>)}
       {menuSections.ready.length===0&&<em>No immediately executable tools in this area.</em>}
      </div>
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
      <header><div><span>Recovered capability fabric</span><h2>Your recovered work is connected to the product</h2><p>{R486_VISIBLE_SUMMARY.total} recovered capability lineages now resolve through their current OMEGA executors. Open the function you need; lineage, gate and authority stay attached underneath.</p></div><button onClick={()=>setRecoveredOpen(x=>!x)}>{recoveredOpen?'Hide recovered capabilities':'Browse recovered capabilities'}</button></header>
      <div className='o7-recovered-summary'><article><b>{R486_VISIBLE_SUMMARY.executesNow}</b><span>execute now</span></article><article><b>{R486_VISIBLE_SUMMARY.adapters}</b><span>active adapters</span></article><article><b>{R512_MENU_SUMMARY.reviewedSystems}</b><span>reviewed historical systems</span></article><article><b>{R486_VISIBLE_SUMMARY.total}</b><span>resolved capability lineages</span></article></div>
      {recoveredOpen&&<>
       <section className='o7-previous-software-search' aria-label='Previous software search'>
        <header><div><span>Previous software</span><b>Find an old system by the name you remember</b><small>{R512_MENU_SUMMARY.reviewedSystems} reviewed systems · working successors launch current executors · donors stay archive-only</small></div></header>
        <input value={previousSoftwareQuery} onChange={e=>setPreviousSoftwareQuery(e.target.value)} placeholder='Search old software names, packages, families or roles…' aria-label='Search previous software'/>
        {previousSoftwareQuery.trim()&&<div>{previousSoftwareResults.map(row=><button key={row.systemId} onClick={()=>launchRecoveredSystem(row)} data-r512-system-launch={row.systemId} data-state={row.state.toLowerCase()}><span><b>{row.artifact}</b><small>{row.family} · {row.capability}</small></span><em>{row.state==='WORKING_SUCCESSOR'?'Run current successor':row.state==='GATED_SUCCESSOR'?'Open evidence gate':row.state==='ARCHIVE_ONLY'?'Inspect lineage':'Open restoration status'}</em></button>)}</div>}
       </section>
       <nav aria-label='Recovered capability groups'>{(['ALL','UNDERSTAND','EXPLORE','CREATE','BUILD','WORK','RECOVER'] as const).map(x=><button key={x} className={recoveredFamily===x?'active':''} onClick={()=>setRecoveredFamily(x)}>{x==='ALL'?'All':x[0]+x.slice(1).toLowerCase()}</button>)}</nav>
       <div className='o7-recovered-grid'>{recovered.map(x=><article key={x.id} data-state={x.state.toLowerCase()}><header><span>{x.family} · {x.state==='EXECUTES_NOW'?'LIVE':x.state==='EXECUTES_AS_ADAPTER'?'ADAPTER':'GATED'}</span><b>{x.name}</b></header><p>{x.contribution}</p><footer><small>{x.operation}</small><button onClick={()=>launchRecovered(x)} data-r512-recovered-launch={x.id}>{x.state==='TRUTH_GATED'?'Open evidence gate':x.state==='EXECUTES_AS_ADAPTER'?'Run current adapter':'Run recovered software'}</button></footer>{state.depth!=='STANDARD'&&<details><summary>Lineage & proof</summary><p>{x.aliases.join(' · ')}</p><dl><div><dt>Reality</dt><dd>{x.capabilityReality}</dd></div><div><dt>Receipt</dt><dd>{x.receiptAuthority}</dd></div><div><dt>Admission</dt><dd>{x.admissionAuthority}</dd></div><div><dt>Boundary</dt><dd>{x.truth}</dd></div></dl></details>}</article>)}</div>
      </>}
     </section>}

     {state.domain!=='HOME'&&domainRecovered.length>0&&<section className='o7-domain-recovered' data-r512-domain-recovered={state.domain}>
      <header><div><span>Recovered software</span><b>Previous software, resolved to current executors</b><small>These are historical identities with a specific current operation—not menu aliases.</small></div><strong>{domainRecovered.filter(x=>x.state!=='TRUTH_GATED').length} runnable · {domainRecovered.filter(x=>x.state==='TRUTH_GATED').length} gated</strong></header>
      <div>{domainRecovered.slice(0,8).map(x=><button key={x.id} onClick={()=>launchRecovered(x)} data-state={x.state.toLowerCase()} data-r512-recovered-launch={x.id}><span><b>{x.name}</b><small>{x.operation}</small></span><em>{x.state==='TRUTH_GATED'?'Evidence gate':x.state==='EXECUTES_AS_ADAPTER'?'Adapter':'Run now'}</em></button>)}</div>
     </section>}

     <section className='o7-capability-section'>
      <header><div><b>{state.domain==='HOME'?'Capabilities':'Available tools'}</b><span>{results.length} shown · {OMEGA7_CAPABILITIES.length} inherited from OMEGAv6</span></div>{state.domain!=='HOME'&&<button onClick={()=>dispatch({type:'COMMAND',open:true})}>Find anything</button>}</header>
      <div className='o7-capability-grid o7-capability-grid-r512'>
       {(['READY','GATED'] as const).map(section=>{const rows=results.filter(cap=>section==='READY'?cap.availability==='READY':cap.availability!=='READY');if(!rows.length)return null;return <Fragment key={section}><h3 className='o7-capability-group-title'>{section==='READY'?'Ready now':'Needs evidence / connection'} <span>{rows.length}</span></h3>{rows.map(cap=><article key={cap.id} data-health={cap.availability.toLowerCase()} data-native={isOmega7NativeRoute(cap.legacyRoute)?'true':'false'} data-capability-route={cap.legacyRoute}>
        <div><small>{cap.domain}{isOmega7NativeRoute(cap.legacyRoute)?' · OMEGA7 NATIVE':''}</small><b>{cap.label}</b><p>{cap.description}</p></div>
        <footer><span>{cap.availability==='READY'?'Ready':cap.availability==='HELD'?'Requires evidence or connection':cap.availability}</span><button onClick={()=>open(cap.legacyRoute)}>{cap.primaryAction}</button></footer>
        {state.depth!=='STANDARD'&&<details><summary>Technical details</summary><dl><div><dt>Route</dt><dd>{cap.legacyRoute}</dd></div><div><dt>Family</dt><dd>{cap.family}</dd></div><div><dt>Authority</dt><dd>{cap.authority}</dd></div><div><dt>Boundary</dt><dd>{cap.sourceBoundary}</dd></div><div><dt>Reality</dt><dd>{cap.reality}</dd></div></dl></details>}
       </article>)}</Fragment>})}
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
    <div>
     {(state.query?searchOmega7Capabilities(state.query):OMEGA7_CAPABILITIES.slice(0,12)).slice(0,16).map(cap=><button key={cap.id} data-command-route={cap.legacyRoute} onClick={()=>open(cap.legacyRoute)}><span><b>{cap.label}</b><small>{cap.description}</small></span><em>{cap.availability}</em></button>)}
     {state.query&&commandPreviousSoftware.length>0&&<div className='o7-command-divider'>Previous software → current successor</div>}
     {state.query&&commandPreviousSoftware.map(row=><button key={'system-'+row.systemId} data-command-system={row.systemId} onClick={()=>launchRecoveredSystem(row)}><span><b>{row.artifact}</b><small>{row.family} · {row.route}</small></span><em>{row.state==='WORKING_SUCCESSOR'?'LIVE':row.state==='GATED_SUCCESSOR'?'GATED':row.state==='ARCHIVE_ONLY'?'ARCHIVE':'RESTORE'}</em></button>)}
    </div>
   </section>
  </div>}
 </div>;
}

export default function Omega7Root(props:Props){
 return <Omega7Boundary label='OMEGA7 shell'><Omega7AppStateProvider><Omega7Shell {...props}/></Omega7AppStateProvider></Omega7Boundary>;
}
