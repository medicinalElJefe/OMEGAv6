import {lazy,Suspense,type ReactNode} from 'react';
import type {OmegaRouteName} from '../src/navigationRegistry';
import {Omega7Boundary} from './Omega7Boundary';

const EarthWorkspaceR438=lazy(()=>import('./workspaces/EarthWorkspaceR438'));
const TraversalWorkspaceR439=lazy(()=>import('./workspaces/TraversalWorkspaceR439'));

export const OMEGA7_NATIVE_ROUTES=Object.freeze(['Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'] as const satisfies readonly OmegaRouteName[]);
export type Omega7NativeRoute=typeof OMEGA7_NATIVE_ROUTES[number];

export function isOmega7NativeRoute(route:string):route is Omega7NativeRoute{
 return (OMEGA7_NATIVE_ROUTES as readonly string[]).includes(route);
}

export function Omega7NativeSurface({route}:{route:Omega7NativeRoute}):ReactNode{
 let surface:ReactNode=null;
 switch(route){
  case'Earth Now':surface=<EarthWorkspaceR438/>;break;
  case'Matter Traversal':case'Immersive Traversal':case'Extreme Traversal':case'Traversal':surface=<TraversalWorkspaceR439 route={route}/>;break;
 }
 return <Omega7Boundary label={`OMEGA7 ${route}`}><Suspense fallback={<section className='o7-native-loading' role='status' aria-live='polite'>Opening {route}…</section>}>{surface}</Suspense></Omega7Boundary>;
}
