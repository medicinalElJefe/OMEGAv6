import {OMEGA_ALL_ROUTES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';

export const R143_SCHEMA='OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143' as const;
export const R143_REVISION='R143' as const;
export const R143_LAWS=Object.freeze([
 'ONE_REGISTERED_ROUTE_ONE_OPERATION_CONTRACT',
 'UI_CONTROL_REQUIRES_REGISTERED_ROUTE',
 'REGISTERED_ROUTE_REQUIRES_CAPABILITY_ID',
 'CAPABILITY_ID_REQUIRES_EXECUTION_DOMAIN',
 'ROUTE_READINESS_IS_NOT_INVOCATION',
 'UI_SELECTION_IS_NOT_EXECUTION_PROOF',
 'RETURNED_IS_NOT_VERIFIED',
 'R142_RECEIPTS_REMAIN_EXECUTION_TRUTH_AUTHORITY',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY',
 'NO_ORPHAN_ROUTE_NO_SHADOW_CAPABILITY_NO_SILENT_DEAD_CONTROL'
]);

export type RouteExecutionDomainR143='AI'|'SAI'|'PLUGIN'|'HYBRID'|'BUILD'|'PROOF'|'LOCAL';
export type RouteTruthStateR143='DISCOVERED'|'AVAILABLE'|'UNAVAILABLE';
export type AuthoritativeRouteOperationR143={
 schema:typeof R143_SCHEMA;revision:typeof R143_REVISION;routeId:string;route:string;workspaceId:string;capabilityId:string;executionDomain:RouteExecutionDomainR143;state:RouteTruthStateR143;capabilityReality:string;receiptAuthority:'R142';receiptSchema:'OMEGA_CAPABILITY_EXECUTION_RECEIPT_R142';executionProofRequired:true;canonicalMutation:false;admissionAuthority:'R125';truthBoundary:string;
};

const BUILD=new Set(['Create','Projects','Render Queue','Assets','Development','Build Out']);
const PROOF=new Set(['Quality Compiler','Evidence & Proof','Validation']);
const AI=new Set(['Modes','Kernel Intelligence','Memory','Canon Evolution']);
const SAI=new Set(['SAI Lab']);
const slug=(value:string)=>value.trim().toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function executionDomainForRouteR143(route:string):RouteExecutionDomainR143{
 if(route==='Hybrid Link')return'HYBRID';
 if(route==='Plugins')return'PLUGIN';
 if(SAI.has(route))return'SAI';
 if(AI.has(route))return'AI';
 if(BUILD.has(route))return'BUILD';
 if(PROOF.has(route))return'PROOF';
 return'LOCAL';
}

function stateForReality(reality:string):RouteTruthStateR143{
 if(['LOCAL_ACTIVE','SOURCE_ACTIVE','RUNTIME_ACTIVE'].includes(reality))return'AVAILABLE';
 if(['DONOR_ONLY','RESTORATION_DEBT'].includes(reality))return'UNAVAILABLE';
 return'DISCOVERED';
}

export function buildRouteOperationContractR143(route:string):AuthoritativeRouteOperationR143{
 if(!OMEGA_ALL_ROUTES_R82.includes(route))throw new Error(`R143 refuses unregistered route: ${route}`);
 const workspace=workspaceForRouteR82(route),capabilityReality=effectiveCapabilityReality(route);
 return{schema:R143_SCHEMA,revision:R143_REVISION,routeId:`route:${slug(route)}`,route,workspaceId:workspace.id,capabilityId:`capability:${slug(route)}`,executionDomain:executionDomainForRouteR143(route),state:stateForReality(capabilityReality),capabilityReality,receiptAuthority:'R142',receiptSchema:'OMEGA_CAPABILITY_EXECUTION_RECEIPT_R142',executionProofRequired:true,canonicalMutation:false,admissionAuthority:'R125',truthBoundary:'UI reachability, route registration and capability availability are not invocation, return, verification, or CanonState admission. R142 receipts prove execution lifecycle; R125 alone admits canonical mutation.'};
}

export const R143_OPERATION_CONTRACTS=OMEGA_ALL_ROUTES_R82.map(buildRouteOperationContractR143);

export function operationContractForRouteR143(route:string){
 const found=R143_OPERATION_CONTRACTS.find(x=>x.route===route);
 if(!found)throw new Error(`R143 has no authoritative operation contract for route: ${route}`);
 return found;
}

export function auditAuthoritativeOperationChainR143(){
 const routes=OMEGA_ALL_ROUTES_R82,contracts=R143_OPERATION_CONTRACTS;
 const routeIds=contracts.map(x=>x.routeId),capabilityIds=contracts.map(x=>x.capabilityId),mappedRoutes=new Set(contracts.map(x=>x.route));
 const orphanRoutes=routes.filter(route=>!mappedRoutes.has(route));
 const unknownRoutes=contracts.filter(x=>!routes.includes(x.route)).map(x=>x.route);
 const duplicateRouteIds=routeIds.filter((x,i,a)=>a.indexOf(x)!==i);
 const duplicateCapabilityIds=capabilityIds.filter((x,i,a)=>a.indexOf(x)!==i);
 const incomplete=contracts.filter(x=>!x.routeId||!x.capabilityId||!x.executionDomain||!x.receiptAuthority).map(x=>x.route);
 return{schema:'OMEGA_R143_OPERATION_CHAIN_AUDIT',totalRoutes:routes.length,mappedRoutes:mappedRoutes.size,orphanRoutes,unknownRoutes,duplicateRouteIds:[...new Set(duplicateRouteIds)],duplicateCapabilityIds:[...new Set(duplicateCapabilityIds)],incomplete,pass:routes.length>0&&contracts.length===routes.length&&orphanRoutes.length===0&&unknownRoutes.length===0&&duplicateRouteIds.length===0&&duplicateCapabilityIds.length===0&&incomplete.length===0,canonicalMutation:false,admissionAuthority:'R125' as const,boundary:'A passing R143 audit proves route-to-capability contract completeness only. It does not prove a provider, device, plugin, Hybrid host, or external service executed; those claims require R142/R141 receipts.'};
}
