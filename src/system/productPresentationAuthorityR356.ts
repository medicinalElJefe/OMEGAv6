import {CAPABILITY_BY_NAME,capabilityReality,CAPABILITY_REALITY_LABEL} from '../capabilityAuthority';
import {workspaceForRouteR82,OMEGA_ALL_ROUTES_R82} from '../omegaExperienceRegistryR82';
import {omegaMasterMenuForRouteR289} from '../navigationRegistry';
import {organizationForRouteR132} from '../experienceOrganizationR132';

export const R356_PRESENTATION_SCHEMA='OMEGA_PRODUCT_PRESENTATION_AUTHORITY_R356' as const;
export const R356_PRESENTATION_LAWS=Object.freeze([
 'ONE_ROUTE_ONE_PRESENTATION_RECORD',
 'CAPABILITY_AUTHORITY_PRECEDES_PRESENTATION',
 'WORKSPACE_AND_MASTER_MENU_ARE_CONTEXT_NOT_SEPARATE_STATE_AUTHORITIES',
 'VISUAL_ARCHETYPE_MAY_CHANGE_PRESENTATION_NOT_CAPABILITY_TRUTH',
 'LEGACY_PRESENTATION_IS_PROVENANCE_NOT_LIVE_AUTHORITY',
 'ONE_CANONICAL_SURFACE_FRAME_FOR_ALL_ROUTES',
 'CURRENT_AUTHORITIES_PRECEDE_RETAINED_COMPATIBILITY_LAYERS',
 'NO_PRESENTATION_RULE_MAY_MUTATE_CANONSTATE'
]);

export type ProductArchetypeR356='COMMAND'|'EXPLORATION'|'INTELLIGENCE'|'EVIDENCE'|'BUILD'|'SYSTEM';
export type ProductPresentationR356={
 schema:typeof R356_PRESENTATION_SCHEMA;
 route:string;
 workspace:string;
 workspaceLabel:string;
 masterMenu:string;
 masterMenuLabel:string;
 archetype:ProductArchetypeR356;
 family:string;
 purpose:string;
 reality:string;
 realityLabel:string;
 tier:string;
 layout:string;
 views:readonly string[];
 boundary:string;
 canonicalMutation:false;
};

const ARCHETYPE:Record<string,ProductArchetypeR356>={
 COMMAND:'COMMAND',EXPLORE:'EXPLORATION',INTELLIGENCE:'INTELLIGENCE',EVIDENCE:'EVIDENCE',BUILD:'BUILD',SYSTEM:'SYSTEM'
};

export function productPresentationForRouteR356(route:string):ProductPresentationR356{
 if(!OMEGA_ALL_ROUTES_R82.includes(route))throw new Error(`R356 presentation refuses unregistered route: ${route}`);
 const capability=CAPABILITY_BY_NAME.get(route);
 if(!capability)throw new Error(`R356 presentation missing capability authority: ${route}`);
 const workspace=workspaceForRouteR82(route),master=omegaMasterMenuForRouteR289(route),org=organizationForRouteR132(route),reality=capabilityReality(route);
 return{
  schema:R356_PRESENTATION_SCHEMA,route,workspace:workspace.id,workspaceLabel:workspace.label,
  masterMenu:master?.id||'UNASSIGNED',masterMenuLabel:master?.label||'Unassigned',
  archetype:ARCHETYPE[workspace.id]||'SYSTEM',family:capability.family,purpose:capability.purpose,
  reality,realityLabel:CAPABILITY_REALITY_LABEL[reality],tier:org.tier,layout:org.layout,
  views:capability.views,boundary:capability.boundary,canonicalMutation:false
 };
}

export const R356_PRODUCT_PRESENTATION=Object.freeze(OMEGA_ALL_ROUTES_R82.map(productPresentationForRouteR356));

export function auditProductPresentationR356(){
 const routes=R356_PRODUCT_PRESENTATION.map(x=>x.route),unique=new Set(routes),missing=OMEGA_ALL_ROUTES_R82.filter(x=>!unique.has(x));
 return{schema:'OMEGA_PRODUCT_PRESENTATION_AUDIT_R356',routes:routes.length,unique:unique.size,missing,pass:routes.length===OMEGA_ALL_ROUTES_R82.length&&unique.size===routes.length&&missing.length===0,canonicalMutation:false};
}
