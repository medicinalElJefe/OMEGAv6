import {lazy} from 'react';
import {deriveSpecialistPrefetchPolicyR110,selectWorkingSetPanelsR110} from './specialistWorkingSetPolicyR110.js';

const LOADERS={
 // R118: the ordinary Hybrid route now opens the current R117 connection experience.
 // The older R8 mission surface remains available only as a deferred advanced/donor layer inside HybridLinkR32.
 HybridLinkR117:()=>import('./HybridLinkR32'),
 HybridMissionControlR8:()=>import('./HybridMissionControlR8'),
 OmegaWorkspaceCockpitR18:()=>import('./OmegaWorkspaceCockpitR18'),
 ArchiveGovernanceControl:()=>import('./ArchiveGovernanceControl'),
 UniversalQualityControl:()=>import('./UniversalQualityControl'),
 SystemAtlasControl:()=>import('./SystemAtlasControl'),
 OmegaR36LivingSurfaces:()=>import('./OmegaR36LivingSurfaces'),
 RelativityLab:()=>import('./RelativityLab'),
 EarthObservatoryR8:()=>import('./EarthObservatoryR8'),
 ForecastSovereignPanel:()=>import('./ForecastSovereignPanel'),
 AtlasViewport:()=>import('./AtlasViewport'),
 AppliedRealityLab:()=>import('./AppliedRealityLab'),
 AtlasCalculatorPanel:()=>import('./AtlasCalculatorPanel'),
 OmegaInfinityPanel:()=>import('./OmegaInfinityPanel'),
 RecursiveScalePanel:()=>import('./RecursiveScalePanel'),
 WovenBuildOutPanel:()=>import('./WovenBuildOutPanel'),
 SAISovereignControl:()=>import('./SAISovereignControl'),
 IntelligenceFabricPanel:()=>import('./IntelligenceFabricPanel'),
 ExtremeTraversalUnionR60:()=>import('./ExtremeTraversalUnionR60'),
 OmegaSpecialistSuite:()=>import('./OmegaSpecialistSuite'),
 PluginRegistryR45:()=>import('./PluginRegistryR45'),
 SourceBackedModesPanelR21:()=>import('./SourceBackedModesPanelR21'),
 ModeCompletionWorkspaceR140:()=>import('./ModeCompletionWorkspaceR140')
} as const;

export const HybridMissionControlR109=lazy(LOADERS.HybridLinkR117);
export const OmegaWorkspaceCockpitR109=lazy(LOADERS.OmegaWorkspaceCockpitR18);
export const ArchiveGovernanceR109=lazy(LOADERS.ArchiveGovernanceControl);
export const UniversalQualityR109=lazy(LOADERS.UniversalQualityControl);
export const SystemAtlasR109=lazy(LOADERS.SystemAtlasControl);
export const MatterTraversalR109=lazy(()=>LOADERS.OmegaR36LivingSurfaces().then(m=>({default:m.MatterTraversalR36})));
export const VisualInstrumentR109=lazy(()=>LOADERS.OmegaR36LivingSurfaces().then(m=>({default:m.VisualInstrumentR36})));
export const TraversalR109=lazy(()=>LOADERS.OmegaR36LivingSurfaces().then(m=>({default:m.TraversalR36})));
export const RelativityR109=lazy(LOADERS.RelativityLab);
export const EarthNowR109=lazy(LOADERS.EarthObservatoryR8);
export const ForecastR109=lazy(LOADERS.ForecastSovereignPanel);
export const AtlasViewportR109=lazy(LOADERS.AtlasViewport);
export const RealityLabR109=lazy(LOADERS.AppliedRealityLab);
export const AtlasCalculatorR109=lazy(LOADERS.AtlasCalculatorPanel);
export const InfinityR109=lazy(LOADERS.OmegaInfinityPanel);
export const ScaleCompilerR109=lazy(LOADERS.RecursiveScalePanel);
export const BuildOutR109=lazy(LOADERS.WovenBuildOutPanel);
export const SAIControlR109=lazy(LOADERS.SAISovereignControl);
export const IntelligenceFabricR109=lazy(LOADERS.IntelligenceFabricPanel);
export const ExtremeTraversalR109=lazy(LOADERS.ExtremeTraversalUnionR60);
export const SpecialistSuiteR109=lazy(LOADERS.OmegaSpecialistSuite);
export const PluginRegistryR109=lazy(LOADERS.PluginRegistryR45);
// R140 preserves the R109 export name so the workstation router stays single-authority,
// while the Modes route now opens the completion workspace which embeds the R21 instrument.
export const SourceBackedModesR109=lazy(LOADERS.ModeCompletionWorkspaceR140);

export const RETAINED_DEEP_SPECIALIST_LOADERS_R109={
 OmegaVisualInstrument:()=>import('./OmegaVisualInstrument'),
 OmegaTraversalStudio:()=>import('./OmegaTraversalStudio'),
 MatterTraversal:()=>import('./MatterTraversal'),
 HybridMissionControlR8:LOADERS.HybridMissionControlR8
} as const;

const ROUTE_LOADERS:Record<string,readonly (()=>Promise<any>)[]>={
 'Hybrid Link':[LOADERS.HybridLinkR117],
 Workspace:[LOADERS.OmegaWorkspaceCockpitR18],Cockpit:[LOADERS.OmegaWorkspaceCockpitR18],
 'Archive Census':[LOADERS.ArchiveGovernanceControl],'Archive Operators':[LOADERS.ArchiveGovernanceControl],
 'Quality Compiler':[LOADERS.UniversalQualityControl],Validation:[LOADERS.UniversalQualityControl],
 'System Atlas':[LOADERS.SystemAtlasControl],'Control Matrix':[LOADERS.SystemAtlasControl],
 'Matter Traversal':[LOADERS.OmegaR36LivingSurfaces],'Visual Instrument':[LOADERS.OmegaR36LivingSurfaces],Traversal:[LOADERS.OmegaR36LivingSurfaces],'Immersive Traversal':[LOADERS.OmegaR36LivingSurfaces],
 Relativity:[LOADERS.RelativityLab],'Earth Now':[LOADERS.EarthObservatoryR8],Forecast:[LOADERS.ForecastSovereignPanel],Atlas:[LOADERS.AtlasViewport],
 'Reality Lab':[LOADERS.AppliedRealityLab],'Atlas Calculator':[LOADERS.AtlasCalculatorPanel],Infinity:[LOADERS.OmegaInfinityPanel],'Scale Compiler':[LOADERS.RecursiveScalePanel],
 'Build Out':[LOADERS.WovenBuildOutPanel],Development:[LOADERS.WovenBuildOutPanel],
 'SAI Lab':[LOADERS.SAISovereignControl,LOADERS.IntelligenceFabricPanel],'Kernel Intelligence':[LOADERS.SAISovereignControl],
 'Extreme Traversal':[LOADERS.ExtremeTraversalUnionR60],Modes:[LOADERS.ModeCompletionWorkspaceR140],Plugins:[LOADERS.PluginRegistryR45]
};
const SUITE_ROUTES=new Set(['Field','Data Motion','Convergence','Projects','Render Queue','Assets','Evidence & Proof','Memory','Canon Evolution','Governance','Consolidation','Instructions','Settings','System']);

export function specialistLoadersForPanelR109(panel:string){return ROUTE_LOADERS[panel]|| (SUITE_ROUTES.has(panel)?[LOADERS.OmegaSpecialistSuite]:[])}

export type SpecialistWorkingStateR110='REQUESTED'|'LOADED'|'PARTIAL'|'FAILED'|'SUPPRESSED';
export type SpecialistPrefetchPolicyR110={mode:'STANDARD'|'LIMITED'|'SUPPRESSED';budget:number;reason:string;saveData:boolean;effectiveType:string;hidden:boolean;lowPower:boolean};
export type SpecialistWorkingReceiptR110={panel:string;state:SpecialistWorkingStateR110;reason:string;requested:number;updatedAt:number;policy?:SpecialistPrefetchPolicyR110};
const WORKING_SET_R110=new Map<string,SpecialistWorkingReceiptR110>();
function nowR110(){return typeof performance!=='undefined'&&Number.isFinite(performance.now())?performance.now():Date.now()}
function rememberR110(receipt:SpecialistWorkingReceiptR110){WORKING_SET_R110.set(receipt.panel,receipt);return receipt}
export function specialistWorkingSetSnapshotR110(){return [...WORKING_SET_R110.values()].sort((a,b)=>b.updatedAt-a.updatedAt)}

export function specialistPrefetchPolicyR110(input:{lowPower?:boolean;visible?:boolean}={}):SpecialistPrefetchPolicyR110{
 const nav=typeof navigator==='undefined'?null:navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}};
 const connection=nav?.connection;
 const hidden=input.visible===false||(input.visible===undefined&&typeof document!=='undefined'&&document.visibilityState==='hidden');
 return deriveSpecialistPrefetchPolicyR110({saveData:Boolean(connection?.saveData),effectiveType:String(connection?.effectiveType||'unknown'),hidden,lowPower:Boolean(input.lowPower)}) as SpecialistPrefetchPolicyR110;
}

function idleTurnR110(){return new Promise<void>(resolve=>{
 const ric=(globalThis as any).requestIdleCallback;
 if(typeof ric==='function')ric(()=>resolve(),{timeout:900});
 else setTimeout(resolve,48);
})}

export async function prefetchSpecialistPanelR109(panel:string,reason='ROUTE_DEMAND'){
 const loaders=specialistLoadersForPanelR109(panel);
 if(!loaders.length)return{panel,requested:0,state:'EAGER_OR_INLINE' as const};
 rememberR110({panel,state:'REQUESTED',reason,requested:loaders.length,updatedAt:nowR110()});
 const settled=await Promise.allSettled(loaders.map(load=>load()));
 const state=settled.every(x=>x.status==='fulfilled')?'LOADED':settled.some(x=>x.status==='fulfilled')?'PARTIAL':'FAILED';
 rememberR110({panel,state,reason,requested:loaders.length,updatedAt:nowR110()});
 return{panel,requested:loaders.length,state:state==='LOADED'?'PREFETCHED' as const:state==='PARTIAL'?'PARTIAL' as const:'FAILED' as const};
}

export async function prefetchSpecialistPanelsR110(panels:readonly string[],input:{lowPower?:boolean;visible?:boolean;reason?:string}={}){
 const policy=specialistPrefetchPolicyR110(input),reason=input.reason||'SPECULATIVE_CONTINUITY';
 const candidates=[...new Set(panels.filter(Boolean))].filter(panel=>specialistLoadersForPanelR109(panel).length>0);
 if(policy.budget===0){
  candidates.forEach(panel=>rememberR110({panel,state:'SUPPRESSED',reason:`${reason}:${policy.reason}`,requested:specialistLoadersForPanelR109(panel).length,updatedAt:nowR110(),policy}));
  return{schema:'OMEGA_SPECIALIST_WORKING_SET_R110' as const,authority:'MODULE_BYTES_ONLY' as const,policy,receipts:specialistWorkingSetSnapshotR110()};
 }
 await idleTurnR110();
 const selected=selectWorkingSetPanelsR110(candidates,policy.budget),results=[] as any[];
 for(const panel of selected)results.push(await prefetchSpecialistPanelR109(panel,reason));
 return{schema:'OMEGA_SPECIALIST_WORKING_SET_R110' as const,authority:'MODULE_BYTES_ONLY' as const,policy,results,receipts:specialistWorkingSetSnapshotR110()};
}

// R109 compatibility entry: existing workflow callers automatically receive the safer R110 runtime-aware policy.
export async function prefetchSpecialistPanelsR109(panels:readonly string[]){return prefetchSpecialistPanelsR110(panels,{reason:'R109_WORKFLOW_COMPAT'})}

export const SPECIALIST_LOADING_TRUTH_R109={
 schema:'OMEGA_ROUTE_DEFERRED_SPECIALIST_FABRIC_R109',
 authority:'MODULE_BYTES_ONLY',
 eagerCore:['canonical corpus/state/calculus','ResponsiveRuntimeShell','SurfaceIntegrity','OmegaIntentWorkbench','OmegaCommandDeck','PhaseWheel','route/state authority'],
 deferred:'heavy specialist UI modules are loaded by dynamic import on route demand or bounded prefetch',
 prefetchBoundary:'Prefetch loads module bytes only. It does not invoke a capability, contact an external backend, mutate CanonState, create proof, or claim a cloud/native runtime is online.',
 routeBoundary:'OMEGA_SURFACES + normalizePanel + go remain the only workstation routing authority. This registry is a module loader, not a second router.'
} as const;

export const SPECIALIST_WORKING_SET_TRUTH_R110={
 schema:'OMEGA_SPECIALIST_WORKING_SET_R110',
 authority:'CURRENT_SESSION_MODULE_BYTE_TELEMETRY_ONLY',
 policy:'Speculative loading is suppressed while hidden, while Save-Data is active, or on 2G/slow-2G; low-power/3G sessions receive a one-panel budget; ordinary visible sessions receive a two-panel budget.',
 demandBoundary:'An operator-selected route may still demand-load its module even when speculative prefetch is suppressed.',
 telemetryBoundary:'REQUESTED/LOADED/PARTIAL/FAILED/SUPPRESSED describe current-session module-byte state only. They are not capability execution, evidence, solver status, cloud health, native-device proof, or CanonState.',
 authorityBoundary:'R110 reuses the R109 loader registry and existing workstation router. It adds no route owner, CanonState, execution bus, proof ledger, or federation authority.'
} as const;
