import {lazy,Suspense,type ReactNode} from 'react';
import type {OmegaRouteName} from '../src/navigationRegistry';
import type {Omega7Depth} from './capabilityRegistry';
import {Omega7Boundary} from './Omega7Boundary';

const EarthWorkspaceR438=lazy(()=>import('./workspaces/EarthWorkspaceR438'));
const CommandWorkspaceR439=lazy(()=>import('./workspaces/CommandWorkspaceR439'));
const TraversalWorkspaceR440=lazy(()=>import('./workspaces/TraversalWorkspaceR440'));

export const OMEGA7_NATIVE_ROUTES=Object.freeze(['Command Center','Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'] as const satisfies readonly OmegaRouteName[]);
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
 }
 return <Omega7Boundary label={`OMEGA7 ${route}`}><Suspense fallback={<section className='o7-native-loading' role='status' aria-live='polite'>Opening {route}…</section>}>{surface}</Suspense></Omega7Boundary>;
}
