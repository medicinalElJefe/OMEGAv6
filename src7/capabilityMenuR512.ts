import {OMEGA7_CAPABILITIES,type Omega7Capability,type Omega7Domain} from './capabilityRegistry';
import {R486_VISIBLE_CAPABILITIES} from './visibleCapabilityConvergenceR486';

export const R512_CAPABILITY_MENU_SCHEMA='OMEGA_CAPABILITY_FIRST_MENU_R512' as const;

export const R512_DOMAIN_MENU:readonly {
 id:Omega7Domain;
 label:string;
 shortLabel:string;
 purpose:string;
 primaryRoutes:readonly string[];
}[]=[
 {id:'HOME',label:'Home',shortLabel:'Home',purpose:'Start, search, resume and see the current OMEGA field.',primaryRoutes:['Command Center','Workspace','System Atlas']},
 {id:'WORK',label:'Work',shortLabel:'Work',purpose:'Projects, memory, workspace and ongoing work.',primaryRoutes:['Projects','Workspace','Memory']},
 {id:'EXPLORE',label:'Explore & Analyze',shortLabel:'Explore',purpose:'Earth, matter, traversal, atlas, forecast and analysis.',primaryRoutes:['Earth Now','Matter Traversal','Atlas','Forecast','Relativity']},
 {id:'CREATE',label:'Create & Visualize',shortLabel:'Create',purpose:'Visual instruments, rendering, assets and creative output.',primaryRoutes:['Visual Instrument','Create','Render Queue','Assets']},
 {id:'DEVELOP',label:'Build & Automate',shortLabel:'Build',purpose:'Software, AI, connected compute, repair and development.',primaryRoutes:['Development','Build Out','Kernel Intelligence','Hybrid Link','SAI Lab']},
 {id:'SYSTEM',label:'System & Proof',shortLabel:'System',purpose:'Evidence, governance, validation, archives, settings and diagnostics.',primaryRoutes:['Evidence & Proof','System Atlas','Validation','Governance','Settings']}
] as const;

const routeRank=(route:string,domain:Omega7Domain)=>{
 const meta=R512_DOMAIN_MENU.find(x=>x.id===domain);
 const i=meta?.primaryRoutes.indexOf(route)??-1;
 return i<0?999:i;
};

export function menuCapabilitiesR512(domain:Omega7Domain){
 const rows=OMEGA7_CAPABILITIES.filter(x=>domain==='HOME'||x.domain===domain);
 return [...rows].sort((a,b)=>{
  const ar=a.availability==='READY'?0:a.availability==='HELD'?1:2;
  const br=b.availability==='READY'?0:b.availability==='HELD'?1:2;
  return ar-br||routeRank(a.legacyRoute,domain)-routeRank(b.legacyRoute,domain)||a.label.localeCompare(b.label);
 });
}

export function menuSectionsR512(domain:Omega7Domain){
 const rows=menuCapabilitiesR512(domain);
 return Object.freeze({
  ready:Object.freeze(rows.filter(x=>x.availability==='READY')),
  gated:Object.freeze(rows.filter(x=>x.availability!=='READY')),
 });
}

export function quickActionsR512(domain:Omega7Domain){
 const meta=R512_DOMAIN_MENU.find(x=>x.id===domain)||R512_DOMAIN_MENU[0];
 const byRoute=new Map(OMEGA7_CAPABILITIES.map(x=>[x.legacyRoute,x]));
 const primary=meta.primaryRoutes.map(route=>byRoute.get(route)).filter(Boolean) as Omega7Capability[];
 const primaryIds=new Set(primary.map(x=>x.id));
 const fill=menuCapabilitiesR512(domain).filter(x=>!primaryIds.has(x.id));
 return Object.freeze([...primary,...fill].slice(0,6));
}

export function recoveredForDomainR512(domain:Omega7Domain){
 const routeDomain=new Map(OMEGA7_CAPABILITIES.map(x=>[x.legacyRoute,x.domain]));
 return R486_VISIBLE_CAPABILITIES
  .filter(x=>domain==='HOME'||routeDomain.get(x.route as any)===domain)
  .sort((a,b)=>{
   const rank=(x:any)=>x.state==='EXECUTES_NOW'?0:x.state==='EXECUTES_AS_ADAPTER'?1:2;
   return rank(a)-rank(b)||a.name.localeCompare(b.name);
  });
}

export const R512_MENU_SUMMARY=Object.freeze({
 schema:R512_CAPABILITY_MENU_SCHEMA,
 domains:R512_DOMAIN_MENU.length,
 routes:OMEGA7_CAPABILITIES.length,
 recovered:R486_VISIBLE_CAPABILITIES.length,
 reviewedSystems:100,
 executableRecovered:R486_VISIBLE_CAPABILITIES.filter(x=>x.state!=='TRUTH_GATED'&&x.routable).length,
 gatedRecovered:R486_VISIBLE_CAPABILITIES.filter(x=>x.state==='TRUTH_GATED').length,
 rule:'MENUS_PRESENT_CAPABILITIES; CAPABILITIES_RESOLVE_EXECUTORS; HISTORICAL_SYSTEMS_RESOLVE_SUCCESSORS; ROUTES_ARE_PRESENTATION_TARGETS_NOT_CAPABILITY_IDENTITY',
 canonicalMutation:false
});

export type RecoveredExecutionCapsuleR512={
 schema:'OMEGA_RECOVERED_EXECUTION_CAPSULE_R512';
 recoveredId:string;
 recoveredName:string;
 route:string;
 operation:string;
 capabilityId:string;
 executionDomain:string;
 state:'EXECUTES_NOW'|'EXECUTES_AS_ADAPTER'|'TRUTH_GATED'|'ARCHIVE_ONLY'|'RESTORATION_REQUIRED';
 capabilityReality:string;
 receiptAuthority:'R142';
 admissionAuthority:'R125';
 truthBoundary:string;
 sourceKind:'CAPABILITY_LINEAGE'|'SYSTEM_LEDGER';
 launchKind:'EXECUTE'|'ADAPTER'|'EVIDENCE_GATE'|'ARCHIVE'|'RESTORE';
 createdAt:string;
 canonicalMutation:false;
};

export function recoveredExecutionCapsuleR512(x:(typeof R486_VISIBLE_CAPABILITIES)[number],createdAt=new Date().toISOString()):RecoveredExecutionCapsuleR512{
 return Object.freeze({
  schema:'OMEGA_RECOVERED_EXECUTION_CAPSULE_R512',
  recoveredId:x.id,recoveredName:x.name,route:x.route,operation:x.operation,capabilityId:x.capabilityId,
  executionDomain:x.executionDomain,state:x.state,capabilityReality:x.capabilityReality,
  receiptAuthority:x.receiptAuthority,admissionAuthority:x.admissionAuthority,truthBoundary:x.truthBoundary,
  sourceKind:'CAPABILITY_LINEAGE',launchKind:x.state==='EXECUTES_NOW'?'EXECUTE':x.state==='EXECUTES_AS_ADAPTER'?'ADAPTER':'EVIDENCE_GATE',
  createdAt,canonicalMutation:false
 });
}

