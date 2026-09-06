import {OMEGA_ALL_ROUTES_R82,OMEGA_WORKSPACES_R82,workspaceForRouteR82,type OmegaWorkspaceIdR82} from './omegaExperienceRegistryR82';

export type OmegaRouteTierR132='PRIMARY'|'SUPPORT'|'EXPERT';
export type OmegaSurfaceClassR132='OPERATE'|'VISUALIZE'|'REASON'|'PROVE'|'BUILD'|'SYSTEM';
export type OmegaLayoutLawR132='VISUAL_FIRST'|'SPLIT_WORKBENCH'|'WORKFLOW'|'DATA_DENSE'|'CONTROL_SURFACE';

const PRIMARY=new Set([
 'Command Center','Hybrid Link','Visual Instrument','Extreme Traversal','Matter Traversal','Earth Now','Atlas',
 'Modes','SAI Lab','Kernel Intelligence','Evidence & Proof','Validation','Governance','Projects','Development','Build Out',
 'System Atlas','Control Matrix','Plugins'
]);
const SUPPORT=new Set([
 'Workspace','Cockpit','Immersive Traversal','Traversal','Relativity','Forecast','Field','Data Motion','Reality Lab','Scale Compiler',
 'Memory','Canon Evolution','Quality Compiler','Archive Census','Create','Render Queue','Assets','Settings','System','Consolidation'
]);
const VISUAL=new Set(['Visual Instrument','Extreme Traversal','Matter Traversal','Immersive Traversal','Traversal','Relativity','Earth Now','Forecast','Atlas','Field','Data Motion','Reality Lab','Infinity','Convergence','Scale Compiler']);
const WORKFLOW=new Set(['Command Center','Workspace','Hybrid Link','Projects','Development','Build Out','Governance','Validation','Consolidation']);
const DATA_DENSE=new Set(['Modes','Kernel Intelligence','Memory','Evidence & Proof','Archive Census','Archive Operators','Quality Compiler','System Atlas','Control Matrix','Atlas Calculator']);

const SURFACE_BY_WORKSPACE:Record<OmegaWorkspaceIdR82,OmegaSurfaceClassR132>={
 COMMAND:'OPERATE',EXPLORE:'VISUALIZE',INTELLIGENCE:'REASON',EVIDENCE:'PROVE',BUILD:'BUILD',SYSTEM:'SYSTEM'
};

export const OMEGA_EXPERIENCE_LAWS_R132=Object.freeze({
 revision:'R132',
 navigation:'ONE_PERSISTENT_RAIL_ONE_COMPLETE_ROUTE_REGISTRY',
 hierarchy:'PRIMARY_THEN_SUPPORT_THEN_EXPERT_WITHOUT_REMOVING_ANY_ROUTE',
 desktop:'RESERVED_COLUMNS_NO_COVERING_PANELS',
 mobile:'VISUAL_FIRST_SINGLE_COLUMN_CONTROLS_MOVE_BELOW_FIELD',
 visual:'MODE_AND_PROJECTION_CHANGES_MUST_BIND_ACTUAL_GEOMETRY_OR_EVALUATED_TRACE',
 inspector:'FOCUS_BY_DEFAULT_DEEP_INSPECTION_ON_DEMAND',
 truth:'RETURNED_EXECUTION_EVIDENCE_AND_REPRESENTATION_NEVER_AUTO_PROMOTE_TO_CANON',
 boundary:'Organization changes presentation priority only. It never changes route authority, evidence class, CanonState, or the distinction between atlas address resolution and physical dimensions.'
});

export const OMEGA_ROUTE_ORGANIZATION_R132=OMEGA_ALL_ROUTES_R82.map((route,index)=>{
 const workspace=workspaceForRouteR82(route);
 const tier:OmegaRouteTierR132=PRIMARY.has(route)?'PRIMARY':SUPPORT.has(route)?'SUPPORT':'EXPERT';
 const layout:OmegaLayoutLawR132=VISUAL.has(route)?'VISUAL_FIRST':WORKFLOW.has(route)?'WORKFLOW':DATA_DENSE.has(route)?'DATA_DENSE':workspace.id==='SYSTEM'?'CONTROL_SURFACE':'SPLIT_WORKBENCH';
 return Object.freeze({route,index,workspaceId:workspace.id,tier,surfaceClass:SURFACE_BY_WORKSPACE[workspace.id],layout,overlayPolicy:'FORBIDDEN' as const,mobilePolicy:VISUAL.has(route)?'FIELD_FIRST_CONTROLS_BELOW' as const:'SINGLE_COLUMN' as const});
});

export function organizationForRouteR132(route:string){return OMEGA_ROUTE_ORGANIZATION_R132.find(x=>x.route===route)||OMEGA_ROUTE_ORGANIZATION_R132[0]}
export function primaryRoutesForWorkspaceR132(id:OmegaWorkspaceIdR82){return OMEGA_ROUTE_ORGANIZATION_R132.filter(x=>x.workspaceId===id&&x.tier==='PRIMARY').map(x=>x.route)}
export function organizedRoutesR132(routes:readonly string[]){const rank:Record<OmegaRouteTierR132,number>={PRIMARY:0,SUPPORT:1,EXPERT:2};return [...routes].sort((a,b)=>{const aa=organizationForRouteR132(a),bb=organizationForRouteR132(b);return rank[aa.tier]-rank[bb.tier]||aa.index-bb.index})}
export function validateExperienceOrganizationR132(){
 const routes=OMEGA_ROUTE_ORGANIZATION_R132.map(x=>x.route),unique=new Set(routes),missing=OMEGA_ALL_ROUTES_R82.filter(x=>!unique.has(x)),workspacePrimary=OMEGA_WORKSPACES_R82.map(w=>({id:w.id,count:primaryRoutesForWorkspaceR132(w.id).length}));
 return{revision:'R132',routeCount:routes.length,uniqueRouteCount:unique.size,missing,workspacePrimary,pass:routes.length===OMEGA_ALL_ROUTES_R82.length&&unique.size===routes.length&&missing.length===0&&workspacePrimary.every(x=>x.count>0),laws:OMEGA_EXPERIENCE_LAWS_R132};
}
