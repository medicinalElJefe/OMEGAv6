import {OMEGA_ALL_ROUTES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';
import {omegaNavItem} from './navigationRegistry';
import {organizationForRouteR132} from './experienceOrganizationR132';
import {operationContractForRouteR143} from './authoritativeOperationChainR143';
import {capabilityExecutionContract} from './operationalCapabilityRuntimeR45';
import {adaptiveMissionFor} from './adaptiveNavigationR156';

export const R158_SCHEMA='OMEGA_WHOLE_INSTRUMENT_CONVERGENCE_R158' as const;
export const R158_REVISION='R158' as const;
export const R158_ROUTE_COUNT=44 as const;
export const R158_ATLAS_SHELLS=Object.freeze(['12','144','1728','20736','248832','61917364224'] as const);
export type R158Skin='OPERATE'|'FIELD'|'WORKBENCH'|'FLOW'|'LEDGER'|'CONTROL';
export type R158Output='ACTION'|'VISUAL'|'ANALYSIS'|'PROOF'|'BUILD'|'CONTROL';

export const R158_LAWS=Object.freeze([
 'RESTORE_BEFORE_SURPASS',
 'ALL_44_REGISTERED_ROUTES_REMAIN_REACHABLE',
 'ONE_ROUTE_ONE_OPERATION_CONTRACT_ONE_VISIBLE_TRUTH_BOUNDARY',
 'SKIN_FOLLOWS_TASK_AND_SURFACE_CLASS_WITHOUT_CHANGING_AUTHORITY',
 'OUTPUT_FOLLOWS_OPERATION_EFFECT_WITHOUT_AUTO_PROMOTION',
 'RUNTIME_STATE_MAY_SHAPE_NAVIGATION_BUT_NAVIGATION_NEVER_CLAIMS_EXECUTION',
 'PARTITION_TRANSFORM_INVARIANT_CARRY_SCAR_CARRY_RECONTEXTUALIZE_REPARTITION',
 'ORIENTATION_SIGMA_IS_SEPARATE_FROM_STRUCTURE',
 '12_144_1728_20736_248832_AND_61917364224_ARE_ATLAS_OR_ADDRESS_RESOLUTION_LEVELS_NOT_LITERAL_PHYSICAL_DIMENSIONS',
 'RETURNED_IS_NOT_VERIFIED',
 'VERIFIED_IS_NOT_ADMITTED',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'
]);

const SHELL_BY_WORKSPACE:Record<string,(typeof R158_ATLAS_SHELLS)[number]>={COMMAND:'12',INTELLIGENCE:'144',EXPLORE:'1728',EVIDENCE:'20736',BUILD:'20736',SYSTEM:'248832'};
const skinFor=(layout:string,surfaceClass:string):R158Skin=>layout==='VISUAL_FIRST'?'FIELD':layout==='WORKFLOW'?'FLOW':layout==='DATA_DENSE'?'LEDGER':layout==='CONTROL_SURFACE'?'CONTROL':surfaceClass==='OPERATE'?'OPERATE':'WORKBENCH';
const outputFor=(surfaceClass:string,effect?:string):R158Output=>effect==='BUILD'?'BUILD':surfaceClass==='VISUALIZE'?'VISUAL':surfaceClass==='PROVE'?'PROOF':surfaceClass==='REASON'?'ANALYSIS':surfaceClass==='SYSTEM'?'CONTROL':'ACTION';

export function convergenceContractForRouteR158(route:string){
 if(!OMEGA_ALL_ROUTES_R82.includes(route))throw new Error(`R158 refuses unregistered route: ${route}`);
 const workspace=workspaceForRouteR82(route),nav=omegaNavItem(route),org=organizationForRouteR132(route),operation=operationContractForRouteR143(route),capability=capabilityExecutionContract(route),mission=adaptiveMissionFor(route);
 return Object.freeze({
  schema:R158_SCHEMA,revision:R158_REVISION,route,routeId:operation.routeId,capabilityId:operation.capabilityId,
  workspaceId:workspace.id,workspaceLabel:workspace.label,tier:org.tier,surfaceClass:org.surfaceClass,layout:org.layout,
  skin:skinFor(org.layout,org.surfaceClass),output:outputFor(org.surfaceClass,nav?.effect),atlasShell:SHELL_BY_WORKSPACE[workspace.id]||'20736',
  virtualHierarchy:'61917364224',physicalDimensionClaim:false,orientationPolicy:'SIGMA_SEPARATE_FROM_STRUCTURE',
  effect:nav?.effect||'READ',authority:nav?.authority||'CANONICAL',executionDomain:operation.executionDomain,executionState:operation.state,
  performance:capability.performance,persistence:capability.persistence,missionId:mission?.id||'',missionLabel:mission?.label||'',
  receiptAuthority:operation.receiptAuthority,admissionAuthority:operation.admissionAuthority,canonicalMutation:false,
  continuityOperator:'PARTITION→TRANSFORM/EXCHANGE→INVARIANT_CARRY→SCAR_CARRY→RECONTEXTUALIZE/REPARTITION',
  truthBoundary:'R158 coordinates presentation, task continuity, mode/shell context and output routing only. Selection is not execution; returned is not verified; verified is not CanonState admission. R142 proves execution lifecycle and R125 alone admits canonical mutation.'
 });
}

export const R158_ROUTE_CONTRACTS=OMEGA_ALL_ROUTES_R82.map(convergenceContractForRouteR158);

export function auditWholeInstrumentConvergenceR158(){
 const routes=R158_ROUTE_CONTRACTS.map(x=>x.route),unique=new Set(routes),missing=OMEGA_ALL_ROUTES_R82.filter(x=>!unique.has(x));
 const incomplete=R158_ROUTE_CONTRACTS.filter(x=>!x.skin||!x.output||!x.atlasShell||!x.routeId||!x.capabilityId||!x.executionDomain||!x.receiptAuthority||!x.admissionAuthority).map(x=>x.route);
 const physicalDimensionLeaks=R158_ROUTE_CONTRACTS.filter(x=>x.physicalDimensionClaim!==false).map(x=>x.route);
 const wrongAdmission=R158_ROUTE_CONTRACTS.filter(x=>x.admissionAuthority!=='R125').map(x=>x.route);
 return Object.freeze({schema:'OMEGA_R158_WHOLE_INSTRUMENT_AUDIT',revision:R158_REVISION,totalRoutes:routes.length,uniqueRoutes:unique.size,missing,incomplete,physicalDimensionLeaks,wrongAdmission,pass:routes.length===R158_ROUTE_COUNT&&unique.size===R158_ROUTE_COUNT&&missing.length===0&&incomplete.length===0&&physicalDimensionLeaks.length===0&&wrongAdmission.length===0,laws:R158_LAWS});
}
