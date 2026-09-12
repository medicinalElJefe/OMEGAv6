import {ALL_MODES_BOUNDARY} from './allModesAuthority';
import {OMEGA_NAVIGATION,OMEGA_NAVIGATION_CONTRACT_R289} from './navigationRegistry';
import {OMEGA_ALL_ROUTES_R82,validateExperienceRegistryR82} from './omegaExperienceRegistryR82';
import {MASTER_CAPABILITIES_R83,MASTER_MENU_OPTIONS_R83,MASTER_SYSTEMS_R83,routeForCapabilityR83,routeForMenuOptionR83,routeForSystemR83} from './softwareMasterLedgerR83';
import {surfaceLayerAuditR104} from './surfaceLayerContractR104';

export const R305_CAPABILITY_REACHABILITY_REVISION='R305' as const;

type ReachabilityRowR305={
 id:string;
 kind:'SYSTEM'|'MENU_OPTION'|'CAPABILITY';
 route:string;
 reachable:boolean;
};

const unique=(xs:string[])=>[...new Set(xs)];

/**
 * R305 turns the long-standing "no orphan feature / no buried function" design
 * requirement into one read-only cross-ledger audit. It adds no route, execution,
 * evidence, deployment or Canon authority. A PASS means the registered interface,
 * recovered software/menu/capability ledgers and eight-layer contracts still point
 * into the same canonical route fabric. It does NOT mean those targets are online,
 * executed, empirically proven or admitted to CanonState.
 */
export function capabilityReachabilityR305(){
 const registry=validateExperienceRegistryR82();
 const layerAudit=surfaceLayerAuditR104();
 const routes=[...OMEGA_ALL_ROUTES_R82];
 const routeSet=new Set(routes);
 const navNames=OMEGA_NAVIGATION.map(x=>x.name);
 const navSet=new Set(navNames);

 const systems:ReachabilityRowR305[]=MASTER_SYSTEMS_R83.map(x=>({id:x.id,kind:'SYSTEM',route:routeForSystemR83(x),reachable:routeSet.has(routeForSystemR83(x))}));
 const menuOptions:ReachabilityRowR305[]=MASTER_MENU_OPTIONS_R83.map(x=>({id:x.optionId,kind:'MENU_OPTION',route:routeForMenuOptionR83(x),reachable:routeSet.has(routeForMenuOptionR83(x))}));
 const capabilities:ReachabilityRowR305[]=MASTER_CAPABILITIES_R83.map(x=>({id:x.id,kind:'CAPABILITY',route:routeForCapabilityR83(x),reachable:routeSet.has(routeForCapabilityR83(x))}));
 const ledgerRows=[...systems,...menuOptions,...capabilities];

 const missingInNavigation=routes.filter(x=>!navSet.has(x));
 const orphanNavigation=navNames.filter(x=>!routeSet.has(x));
 const unreachableLedgerRows=ledgerRows.filter(x=>!x.reachable);
 const duplicateNavigation=navNames.filter((x,i)=>navNames.indexOf(x)!==i);
 const modeRoutePresent=routeSet.has('Modes');
 const systemMapPresent=routeSet.has('System Atlas')&&routeSet.has('Control Matrix');
 const evidenceRoutePresent=routeSet.has('Evidence & Proof')&&routeSet.has('Validation');

 const residuals=unique([
  ...missingInNavigation.map(x=>`ROUTE_NOT_IN_NAV:${x}`),
  ...orphanNavigation.map(x=>`NAV_NOT_IN_ROUTE_REGISTRY:${x}`),
  ...duplicateNavigation.map(x=>`DUPLICATE_NAV:${x}`),
  ...unreachableLedgerRows.map(x=>`${x.kind}_UNREACHABLE:${x.id}->${x.route}`),
  ...OMEGA_NAVIGATION_CONTRACT_R289.orphanRoutes.map(x=>`MASTER_MENU_ORPHAN_ROUTE:${x}`),
  ...OMEGA_NAVIGATION_CONTRACT_R289.emptyMenus.map(x=>`EMPTY_MASTER_MENU:${x}`),
  ...layerAudit.missingBindings.map(x=>`LAYER_BINDING_MISSING:${x}`),
  ...layerAudit.orphanBindings.map(x=>`LAYER_BINDING_ORPHAN:${x}`),
  ...(modeRoutePresent?[]:['MODE_AUTHORITY_ROUTE_MISSING:Modes']),
  ...(systemMapPresent?[]:['SYSTEM_MAP_ROUTE_MISSING:System Atlas/Control Matrix']),
  ...(evidenceRoutePresent?[]:['PROOF_ROUTE_MISSING:Evidence & Proof/Validation'])
 ]);

 return Object.freeze({
  schema:'OMEGA_CAPABILITY_REACHABILITY_FABRIC_R305',
  revision:R305_CAPABILITY_REACHABILITY_REVISION,
  rule:'NO_LAYER_MAY_BURY_A_REGISTERED_FUNCTION',
  routeAuthority:'OMEGA_ALL_ROUTES_R82',
  routeCount:routes.length,
  navigationCount:navNames.length,
  systemRows:systems.length,
  menuOptionRows:menuOptions.length,
  capabilityRows:capabilities.length,
  sourceModeEvaluations:ALL_MODES_BOUNDARY.sourceModeEvaluations,
  canonAuthorities:ALL_MODES_BOUNDARY.canonAuthorities,
  modeRoutePresent,
  systemMapPresent,
  evidenceRoutePresent,
  reachableLedgerRows:ledgerRows.length-unreachableLedgerRows.length,
  totalLedgerRows:ledgerRows.length,
  missingInNavigation,
  orphanNavigation,
  duplicateNavigation,
  unreachableLedgerRows,
  layerAudit,
  registry,
  residualCount:residuals.length,
  residuals,
  pass:registry.pass&&layerAudit.pass&&routes.length===navNames.length&&missingInNavigation.length===0&&orphanNavigation.length===0&&duplicateNavigation.length===0&&unreachableLedgerRows.length===0&&OMEGA_NAVIGATION_CONTRACT_R289.orphanRoutes.length===0&&OMEGA_NAVIGATION_CONTRACT_R289.emptyMenus.length===0&&modeRoutePresent&&systemMapPresent&&evidenceRoutePresent&&residuals.length===0,
  boundary:'R305 proves discoverability/routing coherence only. Registered, visible or routable does not mean executing, connected, empirically evidenced, deployed, promoted or Canon-admitted. Route count remains telemetry rather than an architectural ceiling.'
 });
}

export const R305_CAPABILITY_REACHABILITY=capabilityReachabilityR305();
