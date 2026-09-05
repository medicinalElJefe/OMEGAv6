import {lazy} from 'react';

const LOADERS={
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
 SourceBackedModesPanelR21:()=>import('./SourceBackedModesPanelR21')
} as const;

export const HybridMissionControlR109=lazy(LOADERS.HybridMissionControlR8);
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
export const SourceBackedModesR109=lazy(LOADERS.SourceBackedModesPanelR21);

export const RETAINED_DEEP_SPECIALIST_LOADERS_R109={
 OmegaVisualInstrument:()=>import('./OmegaVisualInstrument'),
 OmegaTraversalStudio:()=>import('./OmegaTraversalStudio'),
 MatterTraversal:()=>import('./MatterTraversal')
} as const;

const ROUTE_LOADERS:Record<string,readonly (()=>Promise<any>)[]>={
 'Hybrid Link':[LOADERS.HybridMissionControlR8],
 Workspace:[LOADERS.OmegaWorkspaceCockpitR18],Cockpit:[LOADERS.OmegaWorkspaceCockpitR18],
 'Archive Census':[LOADERS.ArchiveGovernanceControl],'Archive Operators':[LOADERS.ArchiveGovernanceControl],
 'Quality Compiler':[LOADERS.UniversalQualityControl],Validation:[LOADERS.UniversalQualityControl],
 'System Atlas':[LOADERS.SystemAtlasControl],'Control Matrix':[LOADERS.SystemAtlasControl],
 'Matter Traversal':[LOADERS.OmegaR36LivingSurfaces],'Visual Instrument':[LOADERS.OmegaR36LivingSurfaces],Traversal:[LOADERS.OmegaR36LivingSurfaces],'Immersive Traversal':[LOADERS.OmegaR36LivingSurfaces],
 Relativity:[LOADERS.RelativityLab],'Earth Now':[LOADERS.EarthObservatoryR8],Forecast:[LOADERS.ForecastSovereignPanel],Atlas:[LOADERS.AtlasViewport],
 'Reality Lab':[LOADERS.AppliedRealityLab],'Atlas Calculator':[LOADERS.AtlasCalculatorPanel],Infinity:[LOADERS.OmegaInfinityPanel],'Scale Compiler':[LOADERS.RecursiveScalePanel],
 'Build Out':[LOADERS.WovenBuildOutPanel],Development:[LOADERS.WovenBuildOutPanel],
 'SAI Lab':[LOADERS.SAISovereignControl,LOADERS.IntelligenceFabricPanel],'Kernel Intelligence':[LOADERS.SAISovereignControl],
 'Extreme Traversal':[LOADERS.ExtremeTraversalUnionR60],Modes:[LOADERS.SourceBackedModesPanelR21],Plugins:[LOADERS.PluginRegistryR45]
};
const SUITE_ROUTES=new Set(['Field','Data Motion','Convergence','Projects','Render Queue','Assets','Evidence & Proof','Memory','Canon Evolution','Governance','Consolidation','Instructions','Settings','System']);

export function specialistLoadersForPanelR109(panel:string){return ROUTE_LOADERS[panel]|| (SUITE_ROUTES.has(panel)?[LOADERS.OmegaSpecialistSuite]:[])}
export async function prefetchSpecialistPanelR109(panel:string){
 const loaders=specialistLoadersForPanelR109(panel);
 if(!loaders.length)return{panel,requested:0,state:'EAGER_OR_INLINE' as const};
 const settled=await Promise.allSettled(loaders.map(load=>load()));
 return{panel,requested:loaders.length,state:settled.every(x=>x.status==='fulfilled')?'PREFETCHED' as const:'PARTIAL' as const};
}
export async function prefetchSpecialistPanelsR109(panels:readonly string[]){
 const unique=[...new Set(panels.filter(Boolean))].slice(0,3);
 return Promise.all(unique.map(prefetchSpecialistPanelR109));
}

export const SPECIALIST_LOADING_TRUTH_R109={
 schema:'OMEGA_ROUTE_DEFERRED_SPECIALIST_FABRIC_R109',
 authority:'MODULE_BYTES_ONLY',
 eagerCore:['canonical corpus/state/calculus','ResponsiveRuntimeShell','SurfaceIntegrity','OmegaIntentWorkbench','OmegaCommandDeck','PhaseWheel','route/state authority'],
 deferred:'heavy specialist UI modules are loaded by dynamic import on route demand or bounded prefetch',
 prefetchBoundary:'Prefetch loads module bytes only. It does not invoke a capability, contact an external backend, mutate CanonState, create proof, or claim a cloud/native runtime is online.',
 routeBoundary:'OMEGA_SURFACES + normalizePanel + go remain the only workstation routing authority. This registry is a module loader, not a second router.'
} as const;
