import type {OperatorColorRole} from './calculusVisualLawR37';

export type OmegaWorkspaceIdR82='COMMAND'|'EXPLORE'|'INTELLIGENCE'|'EVIDENCE'|'BUILD'|'SYSTEM';
export type OmegaFieldProjectionR82='FIELD'|'MATTER'|'TRAVERSAL'|'FORECAST'|'RELATIVITY'|'INFINITY'|'SCALE'|'CONVERGENCE';

export const OMEGA_WORKSPACES_R82:readonly {
 id:OmegaWorkspaceIdR82;
 label:string;
 copy:string;
 role:OperatorColorRole;
 routes:readonly string[];
}[]=[
 {id:'COMMAND',label:'Command',copy:'ask · work · connect',role:'ALPHA',routes:['Command Center','Workspace','Cockpit','Hybrid Link']},
 {id:'EXPLORE',label:'Explore',copy:'matter · earth · motion · scale',role:'CONSTRUCT',routes:['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal','Visual Instrument','Relativity','Earth Now','Forecast','Atlas','Field','Data Motion','Reality Lab','Atlas Calculator','Infinity','Convergence','Scale Compiler']},
 {id:'INTELLIGENCE',label:'Intelligence',copy:'modes · SAI · memory',role:'PRUNE',routes:['Modes','Kernel Intelligence','Memory','Canon Evolution','SAI Lab']},
 {id:'EVIDENCE',label:'Evidence',copy:'proof · archive · governance',role:'BASE',routes:['Quality Compiler','Evidence & Proof','Archive Census','Archive Operators','Governance','Validation']},
 {id:'BUILD',label:'Build',copy:'create · develop · assets',role:'ALPHA',routes:['Create','Projects','Render Queue','Assets','Development','Build Out']},
 {id:'SYSTEM',label:'System',copy:'atlas · settings · plugins',role:'OMEGA',routes:['Instructions','Plugins','Settings','System','System Atlas','Control Matrix','Consolidation']}
] as const;

export const OMEGA_FIELD_PROJECTIONS_R82:readonly {
 id:OmegaFieldProjectionR82;
 label:string;
 intent:string;
 signature:string;
 panel:string;
}[]=[
 {id:'FIELD',label:'Unified Field',intent:'coherence, contradiction, proof and operator balance',signature:'nested living membrane',panel:'Field'},
 {id:'MATTER',label:'Matter',intent:'compression, scar, burden and material relation',signature:'dense structural lattice',panel:'Matter Traversal'},
 {id:'TRAVERSAL',label:'Traversal',intent:'admitted route, carry and directional motion',signature:'moving corridor / route spine',panel:'Traversal'},
 {id:'FORECAST',label:'Forecast',intent:'future plasticity, uncertainty and branching possibility',signature:'forward branching fan',panel:'Forecast'},
 {id:'RELATIVITY',label:'Relativity',intent:'observer frame, phase shift and reference transformation',signature:'offset warped frames',panel:'Relativity'},
 {id:'INFINITY',label:'Recurrence',intent:'recursive return, Mode188 and scar persistence',signature:'recursive nested orbit',panel:'Infinity'},
 {id:'SCALE',label:'Scale',intent:'host-centered hierarchy, compression and nested depth',signature:'nested scale shells',panel:'Scale Compiler'},
 {id:'CONVERGENCE',label:'Convergence',intent:'closure, pruning and reduction toward coherent basin',signature:'inward converging streams',panel:'Convergence'}
] as const;

export const OMEGA_ALL_ROUTES_R82=OMEGA_WORKSPACES_R82.flatMap(x=>x.routes);
export const OMEGA_ROUTE_INVENTORY_R107={
 currentCount:OMEGA_ALL_ROUTES_R82.length,
 historicalR82Baseline:44,
 authority:'INVENTORY_TELEMETRY_NOT_ARCHITECTURE',
 boundary:'The historical R82 build happened to expose 44 registered destinations. Route count is a non-regression/inventory signal only; it is not a calculus primitive, capability ceiling, mode count, or fixed architectural law.'
} as const;
export function workspaceForRouteR82(route:string){return OMEGA_WORKSPACES_R82.find(x=>x.routes.includes(route))||OMEGA_WORKSPACES_R82[0]}
export function projectionForR82(id:OmegaFieldProjectionR82){return OMEGA_FIELD_PROJECTIONS_R82.find(x=>x.id===id)||OMEGA_FIELD_PROJECTIONS_R82[0]}
export function validateExperienceRegistryR82(){
 const routes=OMEGA_ALL_ROUTES_R82,unique=new Set(routes),workspaceIds=new Set(OMEGA_WORKSPACES_R82.map(x=>x.id)),projectionIds=new Set(OMEGA_FIELD_PROJECTIONS_R82.map(x=>x.id)),emptyWorkspaces=OMEGA_WORKSPACES_R82.filter(x=>x.routes.length===0).map(x=>x.id);
 return{
  workspaceCount:OMEGA_WORKSPACES_R82.length,
  routeCount:routes.length,
  uniqueRouteCount:unique.size,
  projectionCount:OMEGA_FIELD_PROJECTIONS_R82.length,
  historicalRouteBaseline:OMEGA_ROUTE_INVENTORY_R107.historicalR82Baseline,
  emptyWorkspaces,
  pass:routes.length>0&&unique.size===routes.length&&workspaceIds.size===OMEGA_WORKSPACES_R82.length&&emptyWorkspaces.length===0&&projectionIds.size===OMEGA_FIELD_PROJECTIONS_R82.length,
  boundary:'R107 validates reachability/uniqueness dynamically. The current destination count is telemetry, not architecture. OMEGA capability is governed by canonical state, calculus/mode authority, layer contracts, runtime execution, evidence and proof—not by a frozen route number.'
 };
}
