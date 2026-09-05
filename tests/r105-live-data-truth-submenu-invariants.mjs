import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R105 '+msg)};

const nav=read('src/OmegaSideNavigatorR88.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const infinity=read('src/OmegaInfinityPanel.tsx');
const infinityLive=read('src/InfinityLiveTruthR105.tsx');
const infinityRuntime=read('src/omegaInfinityRuntime.ts');
const performance=read('src/ProofPerformanceProviderR55.tsx');
const freshness=read('src/dataFreshnessR105.ts');
const accepted=read('src/acceptedProductionContractR95.ts');
const r55=read('tests/r55-proof-performance-provider-invariants.mjs');

// Contextual submenus filter one canonical registered route inventory; historical 44 remains telemetry, never a ceiling.
for(const id of ['COMMAND','EXPLORE','INTELLIGENCE','EVIDENCE','BUILD','SYSTEM'])must(registry.includes(`id:'${id}'`),'workspace registry missing '+id);
const routeGroups=[...registry.matchAll(/routes:\[(.*?)\]/gs)].map(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
const registeredRoutes=routeGroups.flat();
must(registeredRoutes.length>0&&new Set(registeredRoutes).size===registeredRoutes.length,'route inventory must remain non-empty and unique');
must(nav.includes('OMEGA_WORKSPACES_R82')&&nav.includes("type WorkspaceFilter='ALL'|OmegaWorkspaceIdR82"),'navigator workspace submenu authority missing');
must(nav.includes("localStorage.getItem('omega.r82.workspace')")&&nav.includes("detail?.layer==='APPLICATIONS'?storedWorkspace()"),'Home contextual All tools handoff must retain active workspace');
must(nav.includes("className='r105-workspace-filter'")&&nav.includes('OMEGA_WORKSPACES_R82.map(workspace=>'),'six workspace submenu controls must be rendered');
must(nav.includes('OMEGA_ALL_ROUTES_R82.filter')&&nav.includes('rows.map(route=>')&&!nav.includes('rows.slice('),'submenu filtering must preserve flat registered route inventory and direct reachability');
must(nav.includes('routeCount=OMEGA_ROUTE_INVENTORY_R107.currentCount')&&nav.includes("setWorkspaceFilter('ALL');open('EVERYWHERE')")&&nav.includes('Everywhere <b>{routeCount}</b>'),'global Everywhere path must restore the complete registered route inventory dynamically');
must(nav.includes('OmegaSystemInventoryR83 compact onNavigate={go}'),'software-system submenu must remain functional');

// Archived 2025 workbook SAMPLE data stays preserved but cannot own the primary NOW graph.
must(infinityRuntime.includes("2025-12-01T12:00:00")&&infinityRuntime.includes('workbook SAMPLE rows'),'recovered dated Infinity donor must remain preserved and classified');
must(infinity.includes('<InfinityLiveTruthR105 record={record}/>'),'Infinity primary current graph missing');
must(infinity.indexOf('<InfinityLiveTruthR105 record={record}/>')<infinity.indexOf('<InfinityTruthPlotR93 record={record} index={index}/>'),'archived workbook graph must follow the current canonical graph');
must(infinity.includes('Archived donor / workbook SAMPLE rows · Dec 1 2025 · inspect only'),'archived workbook graph must expose its date/source status');
must(infinity.includes("[playing,setPlaying]=useState(false)")&&infinity.includes('if(!playing||!showWorkbook)return'),'archived sample animation may not auto-run as NOW');
must(infinity.includes("<canvas ref={canvas} className='inf36-archive-canvas'"),'workbook/live projection control must drive an actually mounted renderer');
must(infinityLive.includes('compileSourceTraversal(Number(record?.address??0),72)')&&infinityLive.includes('corpusState(step.address)'),'current recurrence must derive from the canonical admitted route');
for(const metric of ['continuity','contradiction','burden','plasticity','evidence'])must(infinityLive.includes(metric),'live recurrence missing canonical metric '+metric);
must(!infinityLive.includes('OMEGA_INFINITY_ROWS')&&!infinityLive.includes('2025-'),'current recurrence component may not read archived workbook rows');
must(infinityLive.includes('not wall-clock time')||infinityLive.includes('not a clock'),'route progression must not masquerade as a time series');

// Retained browser performance journals stay available but cannot silently populate current-session statistics.
must(freshness.includes('currentSessionRowsR105')&&freshness.includes('R105_SESSION_START_MS')&&freshness.includes('Archived, recovered, workbook SAMPLE'),'temporal freshness helper missing');
must(performance.includes('const sessionSamples=useMemo(()=>currentSessionRowsR105(samples)')&&performance.includes('sessionSamples.slice(-30)'),'performance avg/p95 must be current-session only');
must(performance.includes('current-session /')&&performance.includes('retained samples')&&performance.includes('retained observed history, not current provider state'),'retained performance/provider history must be explicitly labeled');
must(performance.includes("omega.r55.performance.journal")&&performance.includes("omega.r55.provider.transitions")&&performance.includes('slice(-188)'),'R55 bounded history capability must not be removed');

// Persist temporal truth and preserve every earlier architecture layer.
must(accepted.includes("id:'NO_STALE_NOW_GRAPH'")&&accepted.includes("'R105 live-data freshness + contextual workspace submenu authority'"),'R105 accepted production law missing');
for(const prior of ['R100 woven continuity geometry/time','R101 weave-derived effective resolution','R102 four-node capability fabric','R103 task-first capability router','R104 eight-layer functional correlation'])must(accepted.includes(prior),'prior accepted layer lost: '+prior);
must(r55.includes("await import('./r105-live-data-truth-submenu-invariants.mjs')")||r55.includes("import './r105-live-data-truth-submenu-invariants.mjs'"),'R105 gate must execute inside full R55/static release path');

console.log(`R105 LIVE DATA TRUTH + SUBMENU PASS · ${registeredRoutes.length} registered routes preserved · 6 contextual submenus · current canonical recurrence separated from 2025 donor samples · current-session performance truth enforced`);
await import('./r106-temporal-ledger-truth-invariants.mjs');
