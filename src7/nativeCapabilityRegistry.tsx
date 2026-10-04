import {lazy,Suspense,type ReactNode} from 'react';
import type {OmegaRouteName} from '../src/navigationRegistry';
import type {Omega7Depth} from './capabilityRegistry';
import {Omega7Boundary} from './Omega7Boundary';

const EarthWorkspaceR438=lazy(()=>import('./workspaces/EarthWorkspaceR438'));
const CommandWorkspaceR439=lazy(()=>import('./workspaces/CommandWorkspaceR439'));
const TraversalWorkspaceR440=lazy(()=>import('./workspaces/TraversalWorkspaceR440'));
const ScienceWorkspaceR441=lazy(()=>import('./workspaces/ScienceWorkspaceR441'));
const ForecastVisualWorkspaceR442=lazy(()=>import('./workspaces/ForecastVisualWorkspaceR442'));
const WorkCreateWorkspaceR443=lazy(()=>import('./workspaces/WorkCreateWorkspaceR443'));

export const OMEGA7_NATIVE_ROUTES=Object.freeze(['Command Center','Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal','Relativity','Reality Lab','Atlas','Atlas Calculator','Scale Compiler','Infinity','Forecast','Visual Instrument','Field','Data Motion','Convergence','Workspace','Projects','Memory','Create','Render Queue','Assets'] as const satisfies readonly OmegaRouteName[]);
export type Omega7NativeRoute=typeof OMEGA7_NATIVE_ROUTES[number];

export function isOmega7NativeRoute(route:string):route is Omega7NativeRoute{
 return (OMEGA7_NATIVE_ROUTES as readonly string[]).includes(route);
}

export function Omega7NativeSurface({route,onNavigate,depth}:{route:Omega7NativeRoute;onNavigate:(route:string)=>void;depth:Omega7Depth}):ReactNode{
 let surface:ReactNode=null;
 switch(route){
  case'Command Center':surface=<CommandWorkspaceR439 onNavigate={onNavigate} depth={depth}/>;break;
  case'Earth Now':surface=<EarthWorkspaceR438/>;break;
  case'Matter Traversal':case'Immersive Traversal':case'Extreme Traversal':case'Traversal':surface=<TraversalWorkspaceR440 route={route} onNavigate={onNavigate}/>;break;
  case'Relativity':case'Reality Lab':case'Atlas':case'Atlas Calculator':case'Scale Compiler':case'Infinity':surface=<ScienceWorkspaceR441 route={route} onNavigate={onNavigate} depth={depth}/>;break;
  case'Forecast':case'Visual Instrument':case'Field':case'Data Motion':case'Convergence':surface=<ForecastVisualWorkspaceR442 route={route} onNavigate={onNavigate} depth={depth}/>;break;
  case'Workspace':case'Projects':case'Memory':case'Create':case'Render Queue':case'Assets':surface=<WorkCreateWorkspaceR443 route={route} onNavigate={onNavigate} depth={depth}/>;break;
 }
 return <Omega7Boundary label={`OMEGA7 ${route}`}><Suspense fallback={<section className='o7-native-loading' role='status' aria-live='polite'>Opening {route}…</section>}>{surface}</Suspense></Omega7Boundary>;
}
