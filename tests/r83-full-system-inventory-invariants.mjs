import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R83/R168/R305 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const loader=fs.existsSync('src/specialistLoaderR109.tsx')?read('src/specialistLoaderR109.tsx'):'';
const home=read('src/OmegaHomeR71.tsx');
const shell=read('src/InstrumentOSShellR62.tsx');
const navigator=read('src/OmegaSideNavigatorR88.tsx');
const navigation=read('src/navigationRegistry.ts');
const atlas=read('src/SystemAtlasControl.tsx');
const inventory=read('src/OmegaSystemInventoryR83.tsx');
const inventoryCss=read('src/systemInventoryR83.css');
const master=read('src/softwareMasterLedgerR83.ts');
const archive=read('src/archiveDonorIndexR83.ts');
const hostBuild=read('src/hostBuildLedgerR83.ts');
const bins=read('src/v77BinLedgerR83.ts');
const families=read('src/systemAtlasRuntime.ts');
const completion=read('src/completionRuntimeR48.ts');
const authorities=read('src/allModesAuthority.ts');
const modes=read('src/SourceBackedModesPanelR21.tsx');
const modeRuntime=read('src/modeExpressionRuntimeR82.ts');
const modeCanvas=read('src/ModeExpressionCanvasR82.tsx');
const visual=read('src/VisualCompositorR65.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const extreme=read('src/ExtremeTraversalUnionR60.tsx');
const restoration=read('src/ExtremeRestorationR46.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const reachability=read('src/capabilityReachabilityR305.ts');
const browserProof=read('tests/r286-all-surface-browser-e2e.mjs');

const systemIds=[...master.matchAll(/"id":\s*"(SYS-\d{3})"/g)].map(x=>x[1]);
must(systemIds.length===100&&new Set(systemIds).size===100&&systemIds[0]==='SYS-001'&&systemIds.at(-1)==='SYS-100','master ledger must retain 100 unique system rows');
const menuOptionIds=[...master.matchAll(/"optionId":\s*"(M\d{2}-O\d{2})"/g)].map(x=>x[1]);
must(menuOptionIds.length===36&&new Set(menuOptionIds).size===36,'master ledger must retain 36 unique menu options');
const capIds=[...master.matchAll(/"id":\s*"(CAP-\d{3})"/g)].map(x=>x[1]);
must(capIds.length===18&&new Set(capIds).size===18,'master ledger must retain 18 unique capability rows');
must(master.includes('KEEP/MERGE/DONOR describes archive disposition, not current hosted execution'),'master ledger must preserve archive/execution truth separation');

const v77=[...bins.matchAll(/"id":\s*"(BIN-\d{2})"/g)].map(x=>x[1]);
must(v77.length===24&&new Set(v77).size===24&&v77[0]==='BIN-01'&&v77.at(-1)==='BIN-24','V77 must retain 24 unique bin identities');
must(!bins.includes('driveId')&&!bins.includes('drive.google.com'),'V77 registry must not publish private Drive identifiers');
must(bins.includes('archive bin presence is donor evidence, not hosted execution'),'V77 donor boundary missing');

const familyIds=[...families.matchAll(/F\('(S\d{2})'/g)].map(x=>x[1]);
must(familyIds.length===24&&new Set(familyIds).size===24,'24-family runtime inventory must remain intact');
must(families.includes("S22','Omega Installer / One-Click Shell','DESKTOP_STARTUP_PACKAGER'")&&families.includes("S23','Runtime API / WebSocket Service','LIVE_STATE_TRANSPORT'"),'authoritative v22 S22 installer and S23 runtime transport families must not be overwritten by UI/package aliases');
must(completion.includes('R48_COMPLETION_FAMILIES')&&completion.includes("S10:{successor:'SOURCE_ACTIVE',surface:'Matter Traversal'")&&completion.includes("S12:{successor:'LOCAL_ACTIVE',surface:'Build Out'")&&completion.includes("S21:{successor:'LOCAL_ACTIVE',surface:'Visual Instrument'"),'R48/R153 current successor family surfaces must remain explicit');
const surfBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const routeBlocks=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
const navBlock=(navigation.match(/OMEGA_NAVIGATION:OmegaNavItem\[]=\[(.*?)\];/s)||[])[1]||'';
const navNames=[...navBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length>0&&new Set(surfaces).size===surfaces.length,'application route layer must remain unique and non-empty');
must(routeBlocks.length===surfaces.length&&new Set(routeBlocks).size===routeBlocks.length,'shared registry and workstation route inventory must stay aligned');
must(navNames.length===routeBlocks.length&&new Set(navNames).size===navNames.length&&routeBlocks.every(x=>navNames.includes(x))&&navNames.every(x=>routeBlocks.includes(x)),'navigation registry must resolve the exact dynamic route set without orphan or missing destinations');

const names=(authorities.match(/const NAMES=\[(.*?)\] as const/s)||[])[1]||'';
const canonNames=[...names.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(canonNames.length===62,'62 canon/calculus authorities must remain intact');
must(authorities.includes('sourceModeEvaluations:179')&&authorities.includes('canonAuthorities:62'),'179 source modes and 62 canon lenses must remain separate counting layers');

must(home.includes('<OmegaSystemInventoryR83 compact'),'Home must expose the complete software system map instead of presenting application routes as the whole product');
must(shell.includes('OmegaSideNavigatorR88')&&navigator.includes("layer==='SOFTWARE'")&&navigator.includes('<OmegaSystemInventoryR83 compact'),'workstation browser must expose applications and software-system layers together');
must(atlas.includes('<OmegaSystemInventoryR83 onNavigate={onNavigate}/>'),'System Atlas must expose the complete software inventory directly');
for(const id of ['FABRIC','POTENTIAL','SYSTEMS','FAMILIES','HOST_BUILD','MENUS','CAPABILITIES','ARCHIVES','V77'])must(inventory.includes(`id:'${id}'`),`software navigator missing ${id} inventory layer`);
must(inventory.includes('Application destinations are an interface inventory only.')&&inventory.includes('All-mode authority fabric')&&inventory.includes('Eight functional layers'),'full software navigator must lead with capability/calculus/layer architecture');
must(inventory.includes('R48_COMPLETION_FAMILIES')&&inventory.includes("const currentRouteOf=(surface:string|undefined,fallback:string)=>String(surface||fallback||'System Atlas').split('/')[0].trim()"),'Runtime families tab must consume current R48/R153 successor surfaces and normalize them to operator routes');
must(inventory.includes("tab==='FAMILIES'&&families.map(x=>{const now=currentByFamily.get(x.id),route=currentRouteOf(now?.surface,x.target)")&&inventory.includes("go(route,'omega.r83.familyFocus',x.id)"),'Runtime families tab must launch current successor routes instead of historical x.target');
must(inventory.includes('V24 {x.status}')&&inventory.includes('current successor status/surface, operator route'),'Runtime families tab must preserve predecessor status while exposing current route truth');
must(inventory.includes('OMEGA_ROUTE_INVENTORY_R107.currentCount')&&inventory.includes('count is telemetry, not architecture'),'route count must remain dynamic inventory telemetry in System map');
must(hostBuild.includes('softwareRows:57')&&hostBuild.includes('autoPingCells:1728')&&hostBuild.includes('12 Domains × 12 Phases × 12 Regulation states'),'57-row local-host lineage and 1,728 auto-ping design must remain visible');
must((hostBuild.match(/"id":\s*"(?:OS|CC|TCS|M188|HYB|RND|TRV|FOR|AI|PKG|DAT|AUD|HOST|SPEC)-/g)||[]).length===57,'local-host lineage must retain all 57 unique implementation rows');
must(!inventoryCss.includes('.r83-inventory{position:fixed')&&!inventoryCss.includes('.r83-home-system-map{position:fixed'),'inventory may not create a global fixed overlay');

for(const token of ['OMEGA_CAPABILITY_REACHABILITY_FABRIC_R305','NO_LAYER_MAY_BURY_A_REGISTERED_FUNCTION','OMEGA_ALL_ROUTES_R82','OMEGA_NAVIGATION','OMEGA_NAVIGATION_CONTRACT_R289','MASTER_SYSTEMS_R83','MASTER_MENU_OPTIONS_R83','MASTER_CAPABILITIES_R83','routeForSystemR83','routeForMenuOptionR83','routeForCapabilityR83','surfaceLayerAuditR104','sourceModeEvaluations','canonAuthorities','unreachableLedgerRows','residualCount','Route count remains telemetry rather than an architectural ceiling'])must(reachability.includes(token),`R305 cross-ledger reachability fabric missing ${token}`);
must(!reachability.includes('fetch(')&&!reachability.includes('/api/')&&!reachability.includes('localStorage')&&!reachability.includes('sessionStorage'),'R305 reachability audit must remain read-only and backend independent');
must(!reachability.includes('routes.length===44')&&!reachability.includes('navNames.length===44')&&!reachability.includes('routeCount:44'),'R305 must not turn the historical route count into an architecture ceiling');
must(inventory.includes("import {R305_CAPABILITY_REACHABILITY} from './capabilityReachabilityR305'")&&inventory.includes("data-reachability-revision='R305'")&&inventory.includes('data-reachability-pass={R305_CAPABILITY_REACHABILITY.pass')&&inventory.includes('R305 reachability {R305_CAPABILITY_REACHABILITY.pass'),'System map must expose the R305 no-burial verdict without creating another router');
must(!browserProof.includes('expected.length!==44')&&!browserProof.includes('allRoutes!==44')&&!browserProof.includes('unique.length!==44'),'real-browser route proof must follow the dynamic canonical inventory rather than historical count 44');

must(archive.includes('software2VisibleItems:100')&&archive.includes('software2ListingComplete:false'),'2Software visible donor index must be exposed without falsely claiming a complete folder crawl');
must((archive.match(/OMEGA_B043_FULL_SYSTEM_PART_/g)||[]).length===29&&archive.includes('OMEGA_B043_RECONSTRUCTION_KIT.zip'),'B043 29-part full-system archive and reconstruction kit must remain visible');
must(archive.includes('presence ≠ execution')||archive.includes('do not mean those binaries are mounted, executing, promoted'),'archive-build presence must not be reported as runtime execution');

const eagerExtreme=workstation.includes("case 'Extreme Traversal':return <ExtremeTraversalUnionR60");
const deferredExtreme=workstation.includes("case 'Extreme Traversal':return <ExtremeTraversalR109")&&loader.includes("ExtremeTraversalUnionR60:()=>import('./ExtremeTraversalUnionR60')")&&loader.includes('ExtremeTraversalR109=lazy(LOADERS.ExtremeTraversalUnionR60)');
must(eagerExtreme||deferredExtreme,'Extreme Traversal route must restore canonical + restored-function union through eager or R109 deferred mount');
must(extreme.includes('Canonical traversal')&&extreme.includes('Restored functions')&&extreme.includes('<ExtremeRestorationR46'),'Extreme Traversal union must keep both canonical and restored executor views');
for(const x of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(x),`deep donor view lost: ${x}`);
for(const x of ["id:'S10'","id:'S12'","id:'S16'","id:'S18'","id:'S21'"])must(restoration.includes(x),`R46 restored family lost: ${x}`);

must(modes.includes('CANON_AUTHORITY_STACK')&&modes.includes('evaluateCanonAuthorityStack')&&modes.includes('SOURCE MODE CATALOG')&&modes.includes('CANON / CALCULUS AUTHORITY LENSES'),'Modes must surface both 179 source modes and 62 canon/calculus lenses');
must(modes.includes("selectedAuthority?'UNDERLYING SOURCE TRAVERSAL':'ACTUAL ADMITTED TRAVERSAL'"),'canon lens selection must not relabel the fallback source route as the selected authority execution');
must(modeRuntime.includes('authorityLens')&&modeRuntime.includes('not an additional corpus executor'),'canon lens expression runtime must remain distinct from execution');
must(modeCanvas.includes('CANON / CALCULUS GOVERNANCE LENS')&&modeCanvas.includes('CANON / CALCULUS LENS'),'canon lens visual labels must not say source-backed execution');
must(visual.includes("omega.r83.selectedModeRef")&&visual.includes('canon authority lens'),'Visual Instrument must carry selected source-mode/canon-lens identity across applications');

console.log(`R83/R168/R305 FULL SYSTEM INVENTORY + REACHABILITY PASS · ${surfaces.length} current destinations dynamically aligned across workstation/registry/navigation + 100 systems + 24 source families with current successor routing + 57 local-host rows + 1,728 auto-ping cells + 36 options + 18 capabilities + 179 source modes + 62 canon lenses + 24 V77 bins + reviewed archive builds preserved · no historical route-count ceiling`);
