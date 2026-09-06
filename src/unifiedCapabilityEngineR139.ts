import {compileFullOverallModePlanR79,type OmegaIntentR79,type PlannedModeR79} from './fullOverallModeOrchestratorR79';
import {OMEGA_ALL_ROUTES_R82,OMEGA_WORKSPACES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';

export const R139_REVISION='R139';
export const R139_SCHEMA='OMEGA_UNIFIED_CAPABILITY_ENGINE_R139';
export const R139_LAWS=Object.freeze([
 'ONE_ROUTE_REGISTRY_ONE_CAPABILITY_RUNTIME',
 'ALL_MODES_MEANS_ALL_MODES_CONSIDERED_NOT_ALL_MODES_FABRICATED',
 'GATED_OR_CATALOG_ONLY_MODES_NEVER_CLAIM_EXECUTION',
 'CAPABILITY_ACTION_REQUIRES_A_REGISTERED_ROUTE',
 'SAI_AI_HYBRID_BUILD_AND_PROOF_ARE_DISTINCT_EXECUTION_DOMAINS',
 'WOVEN_CONTINUITY_CARRIES_STATE_HISTORY_NOT_UNPROVEN_AUTHORITY',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

export type CapabilityActionKindR139='EXECUTE'|'BUILD'|'PROVE'|'EXPLORE'|'INTELLIGENCE'|'GOVERN'|'SYSTEM';
export type CapabilityActionR139={route:string;workspace:string;kind:CapabilityActionKindR139;reason:string;priority:number};
export type ModeExecutionSummaryR139={considered:number;executable:number;executedExact:number;sourcePacket:number;derivedRuntime:number;gated:number;catalogLens:number;activeIds:string[];gatedIds:string[];catalogIds:string[]};

const INTENT_ROUTES:Record<OmegaIntentR79,readonly string[]>={
 GENERAL:['Command Center','Workspace','Evidence & Proof','System Atlas'],
 TRUTH:['Evidence & Proof','Validation','Reality Lab','System Atlas'],
 BUILD:['Build Out','Development','Projects','Hybrid Link'],
 REPAIR:['Build Out','Hybrid Link','Validation','Evidence & Proof'],
 PERFORMANCE:['Control Matrix','System Atlas','Hybrid Link','Development'],
 FORECAST:['Forecast','Traversal','Relativity','Evidence & Proof'],
 DESIGN:['Visual Instrument','Create','Assets','Render Queue'],
 VISUAL:['Visual Instrument','Matter Traversal','Field','Render Queue'],
 TRAVERSAL:['Traversal','Matter Traversal','Extreme Traversal','Relativity'],
 RELATIVITY:['Relativity','Traversal','Field','Scale Compiler'],
 EARTH:['Earth Now','Traversal','Evidence & Proof','Reality Lab'],
 BIOLOGY:['Matter Traversal','Scale Compiler','Reality Lab','Evidence & Proof'],
 MEMORY:['Memory','Archive Census','Archive Operators','Canon Evolution'],
 GOVERNANCE:['Governance','Convergence','Control Matrix','Evidence & Proof'],
 PROOF:['Evidence & Proof','Validation','Quality Compiler','System Atlas'],
 TRANSLATE:['Instructions','Command Center','SAI Lab','Memory'],
 CREATE:['Create','Build Out','Visual Instrument','Assets'],
 RECURSION:['Infinity','Scale Compiler','Convergence','Memory'],
 SYSTEM:['System Atlas','Control Matrix','Plugins','Hybrid Link'],
 ALL_MODES:['Modes','Kernel Intelligence','SAI Lab','System Atlas']
};

function actionKind(route:string):CapabilityActionKindR139{
 if(route==='Hybrid Link')return'EXECUTE';
 if(['Build Out','Development','Projects','Create','Assets','Render Queue'].includes(route))return'BUILD';
 if(['Evidence & Proof','Validation','Quality Compiler'].includes(route))return'PROVE';
 if(['SAI Lab','Kernel Intelligence','Modes','Memory'].includes(route))return'INTELLIGENCE';
 if(['Governance','Convergence','Control Matrix','Canon Evolution'].includes(route))return'GOVERN';
 if(['System Atlas','System','Settings','Plugins','Instructions','Consolidation'].includes(route))return'SYSTEM';
 return'EXPLORE';
}
function modeSummary(rows:PlannedModeR79[],considered:number):ModeExecutionSummaryR139{
 const all=new Map(rows.map(x=>[x.id,x]));const vals=[...all.values()];
 const exact=vals.filter(x=>x.state==='EXECUTED_EXACT'),packet=vals.filter(x=>x.state==='SOURCE_PACKET'),derived=vals.filter(x=>x.state==='DERIVED_RUNTIME'),gated=vals.filter(x=>x.state==='GATED_MISSING_INPUTS'),catalog=vals.filter(x=>x.state==='CATALOG_LENS');
 return{considered,executable:exact.length+packet.length+derived.length,executedExact:exact.length,sourcePacket:packet.length,derivedRuntime:derived.length,gated:gated.length,catalogLens:Math.max(catalog.length,considered-vals.length),activeIds:[...exact,...packet,...derived].map(x=>x.id),gatedIds:gated.map(x=>x.id),catalogIds:catalog.map(x=>x.id)};
}
function uniqueRoutes(intents:OmegaIntentR79[]){const out:string[]=[];for(const intent of intents)for(const route of INTENT_ROUTES[intent]||[])if(!out.includes(route))out.push(route);return out}

export function compileUnifiedCapabilityRuntimeR139(record:any,panel:string,prompt=''){
 const plan=compileFullOverallModePlanR79(record,panel,prompt);
 const planned=[...plan.kernel,...plan.intentModes,...plan.supportModes];
 const modes=modeSummary(planned,plan.catalogCount);
 const intents=(plan.explicitAllModes?(['ALL_MODES',...plan.intents.filter(x=>x!=='ALL_MODES')] as OmegaIntentR79[]):plan.intents);
 const requestedRoutes=uniqueRoutes(intents);
 const routes=requestedRoutes.filter(r=>OMEGA_ALL_ROUTES_R82.includes(r));
 const actions:CapabilityActionR139[]=routes.map((route,index)=>({route,workspace:workspaceForRouteR82(route).id,kind:actionKind(route),reason:`${intents.join('+')} intent → registered ${route} capability`,priority:Math.max(0,1-index*.06)}));
 const menuAudit={workspaceCount:OMEGA_WORKSPACES_R82.length,routeCount:OMEGA_ALL_ROUTES_R82.length,uniqueRouteCount:new Set(OMEGA_ALL_ROUTES_R82).size,allActionRoutesRegistered:actions.every(x=>OMEGA_ALL_ROUTES_R82.includes(x.route))};
 return{
  schema:R139_SCHEMA,revision:R139_REVISION,plan,modes,actions,menuAudit,
  providers:{ai:'CLOUDFLARE_AI_BINDING_OR_ROUTED_PROVIDER',sai:'SAI Lab',plugins:'Plugins',hybrid:'Hybrid Link',build:'Build Out',proof:'Evidence & Proof'},
  allModes:{requested:plan.explicitAllModes,considered:plan.catalogCount,executable:modes.executable,truth:`${plan.catalogCount} catalog modes considered; only exact/source-packet/derived-runtime modes may count as executable. Gated and catalog-only entries remain non-executed.`},
  wovenContinuity:{operator:'partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition',authority:'STATE_AND_HISTORY_CONTINUITY_NOT_CANON_PROMOTION'},
  canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R139 unifies mode selection, menu reachability and capability routing. It does not pretend catalog lenses or missing-input modes executed, does not equate AI/SAI/Hybrid availability with proof, and does not mutate CanonState.'
 };
}

export function auditUnifiedCapabilityRuntimeR139(){
 const allMapped=Object.values(INTENT_ROUTES).flat();
 const unknown=[...new Set(allMapped.filter(r=>!OMEGA_ALL_ROUTES_R82.includes(r)))];
 return{schema:'OMEGA_R139_RUNTIME_AUDIT',intentCount:Object.keys(INTENT_ROUTES).length,registeredRoutes:OMEGA_ALL_ROUTES_R82.length,unknownRoutes:unknown,pass:unknown.length===0&&new Set(OMEGA_ALL_ROUTES_R82).size===OMEGA_ALL_ROUTES_R82.length,boundary:'Menu/capability consistency audit only; pass does not prove external services or native devices are online.'};
}
