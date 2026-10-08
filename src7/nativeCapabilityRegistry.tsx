import {lazy,Suspense,useEffect,useRef,type ReactNode} from 'react';
import type {OmegaRouteName} from '../src/navigationRegistry';
import type {Omega7Depth} from './capabilityRegistry';
import type {Omega7SoftwareLaunchContext} from './appState';
import {Omega7Boundary} from './Omega7Boundary';
import {HybridRuntimeSnapshotProviderR238} from '../src/HybridRuntimeSnapshotR238';

const EarthWorkspaceR438=lazy(()=>import('./workspaces/EarthWorkspaceR438'));
const CommandWorkspaceR439=lazy(()=>import('./workspaces/CommandWorkspaceR439'));
const TraversalWorkspaceR440=lazy(()=>import('./workspaces/TraversalWorkspaceR440'));
const ScienceWorkspaceR441=lazy(()=>import('./workspaces/ScienceWorkspaceR441'));
const ForecastVisualWorkspaceR442=lazy(()=>import('./workspaces/ForecastVisualWorkspaceR442'));
const WorkCreateWorkspaceR443=lazy(()=>import('./workspaces/WorkCreateWorkspaceR443'));
const DevelopmentComputeWorkspaceR444=lazy(()=>import('./workspaces/DevelopmentComputeWorkspaceR444'));
const SystemEvidenceWorkspaceR445=lazy(()=>import('./workspaces/SystemEvidenceWorkspaceR445'));

export const OMEGA7_NATIVE_ROUTES=Object.freeze(['Command Center','Hybrid Link','Workspace','Cockpit','Immersive Traversal','Matter Traversal','Extreme Traversal','Visual Instrument','Relativity','Earth Now','Forecast','Atlas','Traversal','Create','Field','Data Motion','Reality Lab','Atlas Calculator','Infinity','Convergence','Quality Compiler','Build Out','Projects','Render Queue','Assets','Modes','Kernel Intelligence','Evidence & Proof','Memory','Archive Census','Archive Operators','Development','Canon Evolution','SAI Lab','Governance','Consolidation','Instructions','Plugins','Settings','System','Validation','System Atlas','Scale Compiler','Control Matrix'] as const satisfies readonly OmegaRouteName[]);
export type Omega7NativeRoute=typeof OMEGA7_NATIVE_ROUTES[number];

export function isOmega7NativeRoute(route:string):route is Omega7NativeRoute{
 return (OMEGA7_NATIVE_ROUTES as readonly string[]).includes(route);
}

export function Omega7NativeSurface({route,onNavigate,depth,softwareLaunch}:{route:Omega7NativeRoute;onNavigate:(route:string)=>void;depth:Omega7Depth;softwareLaunch?:Omega7SoftwareLaunchContext|null}):ReactNode{
 const hostRef=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{
  if(!softwareLaunch||softwareLaunch.route!==route)return;
  let completed=false,clicked=false;
  const actuate=()=>{
   if(completed)return true;
   const failure=hostRef.current?.querySelector<HTMLElement>('.o7-native-failure');
   if(failure){completed=true;return true}
   const surface=hostRef.current?.querySelector<HTMLElement>('.o7-native-surface');
   if(surface){completed=true;surface.scrollIntoView({block:'start',behavior:'smooth'});return true}
   const button=hostRef.current?.querySelector<HTMLButtonElement>('.o7-open-instrument');
   if(button&&!button.disabled&&!clicked){clicked=true;button.click()}
   return false;
  };
  if(actuate())return;
  const observer=new MutationObserver(()=>{if(actuate())observer.disconnect()});
  if(hostRef.current)observer.observe(hostRef.current,{childList:true,subtree:true,attributes:true});
  const interval=window.setInterval(()=>{if(actuate()){observer.disconnect();window.clearInterval(interval)}},500);
  const timeout=window.setTimeout(()=>{observer.disconnect();window.clearInterval(interval)},60000);
  return()=>{observer.disconnect();window.clearInterval(interval);window.clearTimeout(timeout)};
 },[route,softwareLaunch?.bindingId]);
 let surface:ReactNode=null;
 switch(route){
  case'Command Center':surface=<CommandWorkspaceR439 key={route} onNavigate={onNavigate} depth={depth}/>;break;
  case'Earth Now':surface=<EarthWorkspaceR438 key={route}/>;break;
  case'Matter Traversal':case'Immersive Traversal':case'Extreme Traversal':case'Traversal':surface=<TraversalWorkspaceR440 key={route} route={route} onNavigate={onNavigate}/>;break;
  case'Relativity':case'Reality Lab':case'Atlas':case'Atlas Calculator':case'Scale Compiler':case'Infinity':surface=<ScienceWorkspaceR441 key={route} route={route} onNavigate={onNavigate} depth={depth}/>;break;
  case'Forecast':case'Visual Instrument':case'Field':case'Data Motion':case'Convergence':surface=<ForecastVisualWorkspaceR442 key={route} route={route} onNavigate={onNavigate} depth={depth}/>;break;
  case'Workspace':case'Projects':case'Memory':case'Create':case'Render Queue':case'Assets':surface=<WorkCreateWorkspaceR443 key={route} route={route} onNavigate={onNavigate} depth={depth}/>;break;
  case'Hybrid Link':case'Quality Compiler':case'Build Out':case'Development':case'Kernel Intelligence':case'SAI Lab':surface=<DevelopmentComputeWorkspaceR444 key={route} route={route} onNavigate={onNavigate} depth={depth}/>;break;
  case'Cockpit':case'Modes':case'Evidence & Proof':case'Archive Census':case'Archive Operators':case'Canon Evolution':case'Governance':case'Consolidation':case'Instructions':case'Plugins':case'Settings':case'System':case'Validation':case'System Atlas':case'Control Matrix':surface=<SystemEvidenceWorkspaceR445 key={route} route={route} onNavigate={onNavigate} depth={depth}/>;break;
 }
 return <div ref={hostRef} className='o7-executor-host' data-r512-executor-route={route} data-r512-binding={softwareLaunch?.bindingId||''}>
  {softwareLaunch&&softwareLaunch.route===route&&<section className='o7-software-executor-context' data-launch-state={softwareLaunch.launchState.toLowerCase()} aria-label='Previous software executor context'>
   <div><span>Previous software → current executor</span><h2>{softwareLaunch.name}</h2><p>{softwareLaunch.aliases.slice(0,5).join(' · ')}</p></div>
   <dl><div><dt>Operation</dt><dd>{softwareLaunch.operation}</dd></div><div><dt>Current executor</dt><dd>{route}</dd></div><div><dt>State</dt><dd>{softwareLaunch.launchState}</dd></div></dl>
   <small>{softwareLaunch.truth}</small>
  </section>}
  <HybridRuntimeSnapshotProviderR238><Omega7Boundary label={`OMEGA7 ${route}`}><Suspense fallback={<section className='o7-native-loading' role='status' aria-live='polite'>Opening {route}…</section>}>{surface}</Suspense></Omega7Boundary></HybridRuntimeSnapshotProviderR238>
 </div>;
}
