import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R109 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const loader=read('src/specialistLoaderR109.tsx');
const loaderCss=read('src/specialistLoaderR109.css');
const vite=read('vite.config.ts');
const accepted=read('src/acceptedProductionContractR95.ts');
const pkg=read('package.json');
const r103=read('tests/r103-intent-capability-router-invariants.mjs');
const r108=read('src/ultimateCapabilityRuntimeR108.ts');

// Route/state authority remains one workstation router; performance work may not create a second router.
const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length>0&&new Set(surfaces).size===surfaces.length,'current registered surface inventory must remain non-empty, unique, and intact');
must(workstation.includes('function normalizePanel(v:any):Panel')&&workstation.includes('const go=(name:string)=>'),'single workstation normalize/go authority missing');
must(loader.includes("routeBoundary:'OMEGA_SURFACES + normalizePanel + go remain the only workstation routing authority"),'loader must declare itself non-routing authority');
must(!loader.includes('setPanel(')&&!loader.includes('localState.write('),'loader registry may not mutate route or canonical browser state');

// Heavy specialist modules are true dynamic imports rather than eager imports or arbitrary cross-import manual chunks.
for(const module of ['HybridMissionControlR8','OmegaWorkspaceCockpitR18','ArchiveGovernanceControl','UniversalQualityControl','SystemAtlasControl','OmegaR36LivingSurfaces','RelativityLab','EarthObservatoryR8','ForecastSovereignPanel','AtlasViewport','AppliedRealityLab','AtlasCalculatorPanel','OmegaInfinityPanel','RecursiveScalePanel','WovenBuildOutPanel','SAISovereignControl','IntelligenceFabricPanel','ExtremeTraversalUnionR60','OmegaSpecialistSuite','PluginRegistryR45','SourceBackedModesPanelR21'])
 must(loader.includes(`import('./${module}')`),'dynamic specialist loader missing '+module);
for(const eager of ['EarthObservatoryR8','ForecastSovereignPanel','IntelligenceFabricPanel','SAISovereignControl','RelativityLab','AtlasCalculatorPanel','OmegaInfinityPanel','RecursiveScalePanel','AppliedRealityLab','WovenBuildOutPanel','OmegaR36LivingSurfaces','ExtremeTraversalUnionR60','OmegaSpecialistSuite','OmegaWorkspaceCockpitR18','HybridMissionControlR8','ArchiveGovernanceControl','UniversalQualityControl','SystemAtlasControl','PluginRegistryR45','SourceBackedModesPanelR21'])
 must(!new RegExp(`import\\s+(?:\\{[^}]*\\}|[^;]+)\\s+from\\s+['\"]\\./${eager}['\"]`).test(workstation),'heavy specialist remains eagerly imported: '+eager);
must(workstation.includes("from './specialistLoaderR109'"),'workstation must consume one deferred module registry');
must(loader.includes("OmegaVisualInstrument:()=>import('./OmegaVisualInstrument')")&&loader.includes("OmegaTraversalStudio:()=>import('./OmegaTraversalStudio')")&&loader.includes("MatterTraversal:()=>import('./MatterTraversal')"),'deep donor loaders must remain recoverable without eager-loading them');

// Suspense/fallback preserves current packet orientation and does not cover the visual stage.
must(workstation.includes("import {Suspense,useEffect,useMemo,useRef,useState} from 'react'"),'React Suspense authority missing');
must(workstation.includes("<Suspense fallback={specialistFallback}>{content}</Suspense>"),'route-deferred modules require bounded loading containment');
must(workstation.includes('Loading this instrument\'s module bytes for STATE')&&workstation.includes('does not execute the capability, contact an external backend, mutate CanonState, or create proof'),'loading truth boundary missing');
must(loaderCss.includes('.r109-specialist-loading')&&loaderCss.includes('@media(max-width:760px)'),'loading state must remain responsive');
must(!/\.r109-specialist-loading\{[^}]*position:(?:fixed|absolute)/.test(loaderCss),'loading state may not cover the primary stage');

// Prefetch is driven by route/workflow continuity but remains byte preparation only.
must(loader.includes('prefetchSpecialistPanelR109')&&loader.includes('prefetchSpecialistPanelsR109'),'bounded specialist prefetch API missing');
must(workstation.includes('void prefetchSpecialistPanelR109(next)'),'navigation should begin loading the selected specialist without changing route authority');
must(workstation.includes('workflow.capabilityPlan?.next?.routes')&&workstation.includes('prefetchSpecialistPanelsR109([next,...capabilityRoutes])'),'R108 workflow capability path should prefetch only likely next modules');
must(loader.includes('Prefetch loads module bytes only')&&loader.includes('does not invoke a capability')&&loader.includes('mutate CanonState'),'prefetch must never be represented as execution/proof');
must(!loader.includes('Math.random'),'specialist loading/prefetch must be deterministic');

// Vite now leaves application splitting to real dynamic imports; only vendor grouping is manually controlled.
must(vite.includes('function vendorChunkR109')&&vite.includes('manualChunks:vendorChunkR109'),'vendor-only manual partition missing');
for(const old of ["return'omega-explore'","return'omega-earth-forecast'","return'omega-runtime-intelligence'","return'omega-evidence-system'","return'omega-specialists'"])
 must(!vite.includes(old),'cross-import application manual chunk remains: '+old);
must(vite.includes("partition:'R109_ROUTE_DEFERRED_SPECIALISTS'")&&vite.includes('dynamic imports to defer heavy specialist UI modules'),'governed build receipt must identify true deferred topology');
must(vite.includes('Prefetch means module bytes are prepared')&&vite.includes('not capability execution'),'build receipt must keep prefetch/execution truth separate');
const r103PerformanceReceipt=['R103/R109 TASK-FIRST ROUTER PASS','R103/R111 TASK-FIRST ROUTER PASS','R103/R112 TASK-FIRST ROUTER PASS','R103/R112/R115 TASK-FIRST ROUTER PASS'].some(token=>r103.includes(token));
must(r103PerformanceReceipt&&r103.includes('manualChunks:vendorChunkR109'),'R103 performance invariant must recognize R109 directly or through a verified successor');

// Current presentation/routing ownership remains intact around the deferred component boundary.
for(const token of ['SPECIALIST_EXISTING=new Set<Panel>','SPECIALIST_SUITE=new Set<Panel>','VISUAL_FIRST_SURFACES=new Set<Panel>',"<SurfaceIntegrityR81 panel={panel} record={record} onRecover={()=>go('System')}","<OmegaIntentWorkbenchR85 variant='STRIP'"])
 must(workstation.includes(token),'accepted workstation ownership lost: '+token);
must(workstation.includes('HybridMissionControlR109')&&workstation.includes('MatterTraversalR109')&&workstation.includes('VisualInstrumentR109')&&workstation.includes('TraversalR109')&&workstation.includes('SpecialistSuiteR109'),'deferred specialist mounts incomplete');
must(r108.includes("schema:'OMEGA_ULTIMATE_CAPABILITY_MEMBRANE_R108'"),'R108 capability correlation authority lost');

// R109 becomes persistent production law and a release gate.
for(const rule of ['ROUTE_DEFERRED_SPECIALIST_LOADING','PREFETCH_IS_NOT_EXECUTION','CORE_AUTHORITY_EAGER'])must(accepted.includes("id:'"+rule+"'"),'accepted production contract missing '+rule);
must(accepted.includes('R109 route-deferred specialist loading + byte-prefetch truth authority'),'R109 preservation lineage missing');
must(pkg.includes('test:r109')&&pkg.includes('r109-route-deferred-specialist-fabric-invariants.mjs'),'R109 release gate missing');

console.log(`R109/R115 ROUTE-DEFERRED SPECIALIST FABRIC PASS · ${surfaces.length} registered destinations remain on one route/state authority · heavy specialist modules dynamic-imported · workflow/capability prefetch is bytes-only · vendor-only manual chunks · non-occluding Suspense containment`);
