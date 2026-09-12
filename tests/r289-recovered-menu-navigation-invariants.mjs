import './r290-navigation-contract-closure-invariants.mjs';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R289 recovered-menu invariant failed: ${msg}`)};
const nav=read('src/navigationRegistry.ts');
const launcher=read('src/OmegaLauncher.tsx');
const launcherCss=read('src/omegaLauncherR289.css');
const liveNav=read('src/OmegaSideNavigatorR88.tsx');
const liveNavCss=read('src/omegaSideNavigatorR289.css');
const dataTruthNavCss=read('src/dataTruthNavigationR105.css');
const atlas=read('src/systemAtlasRuntime.ts');
const archive=read('src/archiveNativeConvergenceR288.ts');

const navBlock=(nav.match(/export const OMEGA_NAVIGATION:OmegaNavItem\[\]=\[(.*?)\];/s)||[])[1]||'';
const routeNames=[...navBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
const mapBlock=(nav.match(/OMEGA_MASTER_MENU_ROUTE_MAP_R289:[^=]+=\{(.*?)\n\};/s)||[])[1]||'';
const routeMap=[...mapBlock.matchAll(/'([^']+)':'(\d\d)'/g)].map(x=>({route:x[1],menu:x[2]}));
const menus=[...new Set(routeMap.map(x=>x.menu))].sort();

must(routeNames.length===44,'exact 44-route registry must remain');
must(new Set(routeNames).size===44,'route names must remain unique');
must(routeMap.length===44,'every route must have exactly one recovered master-menu assignment');
must(new Set(routeMap.map(x=>x.route)).size===44,'master-menu mapping must not duplicate routes');
for(const name of routeNames)must(routeMap.some(x=>x.route===name),`orphan route ${name}`);
must(JSON.stringify(menus)===JSON.stringify(['01','02','03','04','05','06','07','08','09','10','11','12']),'all 12 recovered master menus must own at least one route');

for(const token of ['OMEGA_RECOVERED_MASTER_MENU_NAVIGATION_R289','ONE_44_ROUTE_AUTHORITY_PRESENTED_THROUGH_12_RECOVERED_MASTER_MENUS','OMEGA_MASTER_MENU_NAVIGATION_R289','omegaMasterMenuForRouteR289'])must(nav.includes(token),`navigation contract missing ${token}`);
for(const token of ["['01','Runtime Core'","['02','Proof & Governance'","['03','Traversal'","['04','Render Field'","['05','Host Inputs'","['06','AI Orchestration'","['07','Data / Atlas'","['08','Audio / Signal'","['09','World / Forecast'","['10','Recovery / Packaging'","['11','Archive Merge'","['12','Operator Cockpit'"])must(atlas.includes(token),`system atlas master menu missing ${token}`);

// Dormant/secondary launcher must still consume the same taxonomy and use valid native controls.
must(launcher.includes('LAUNCHER_MASTER_MENUS_R289=OMEGA_MASTER_MENU_NAVIGATION_R289'),'launcher must consume the canonical recovered master-menu navigation');
must(!launcher.includes('const DOMAIN_SECTIONS='),'launcher must not retain an independent hard-coded domain taxonomy');
must(launcher.includes("data-master-menu={omegaMasterMenuForRouteR289(x.name)?.id||''}"),'rendered launcher routes must expose their recovered master-menu identity');
must(launcher.includes('44 routes · 12 recovered menus · ALL MODES'),'launcher must expose the complete navigation contract');
must(launcher.includes("import './omegaLauncherR289.css'"),'responsive launcher R289 menu layer must be mounted');
must(launcherCss.includes('overflow-y:auto')&&launcherCss.includes('@media(max-height:760px)')&&launcherCss.includes('@media(max-width:760px)'),'launcher 12-menu rail must remain scrollable and responsive on short/mobile viewports');
must(launcher.includes("className='omega-nexus-route'"),'each launcher application row must expose a native route activation control');
must(launcher.includes("type='button' className='omega-nexus-route'"),'launcher route activator must be a native non-submit button');
must(launcher.includes("className={'omega-nexus-fav '"),'favorite must remain an independent native button');
must(launcher.includes("onClick={()=>fav(x.name)}"),'favorite action must not require bubbling through the route control');
must(!launcher.includes("className='omega-nexus-card' role='button'"),'launcher application row container must not masquerade as a second interactive control');
must(!launcher.includes('onKeyDown={e=>activate(x.name,e)}')&&!launcher.includes('const activate='),'launcher route keyboard activation must use native button semantics rather than synthetic key dispatch');
must(launcherCss.includes('.omega-nexus-route:focus-visible')&&launcherCss.includes('.omega-nexus-card:focus-within'),'launcher route and favorite focus must remain visibly represented');

// The actual Home-mounted R88/R239 navigator is the user-facing authority surface. R289 may organize it, never replace it.
for(const token of [
 "import {OMEGA_MASTER_MENU_NAVIGATION_R289,omegaMasterMenuForRouteR289} from './navigationRegistry'",
 "import './omegaSideNavigatorR289.css'",
 "compileNavigationLemmaR242({routes:routeRecords,query,workspaceFilter,currentRoute:currentPanel})",
 "const lemmaRows=useMemo(()=>navigationLemma.routes.map",
 "lemmaRows.filter(route=>masterMenu==='ALL'||omegaMasterMenuForRouteR289(route)?.id===masterMenu)",
 "aria-label='Recovered OMEGA master menus'",
 "aria-label='Application workspace submenu'",
 "className={'r89-flat-route r104-route '",
 "onClick={()=>go(route)}",
 "data-master-menu={master?.id||''}",
 "data-master-menu-presentation-revision={R289_MASTER_MENU_PRESENTATION_REVISION}"
])must(liveNav.includes(token),`live navigator missing ${token}`);
must(liveNav.indexOf('const navigationLemma=useMemo')<liveNav.indexOf('const lemmaRows=useMemo')&&liveNav.indexOf('const lemmaRows=useMemo')<liveNav.indexOf('const rows=useMemo'),'R289 master-menu filtering must remain downstream of the R242 navigation lemma');
must(liveNav.includes("setMasterMenu('ALL')")&&liveNav.includes("[masterMenu,setMasterMenu]=useState<MasterMenuFilterR289>('ALL')"),'live navigator must reset and explicitly own only presentation-filter state');
must(liveNav.includes('OMEGA_WORKSPACES_R82.map'),'existing workspace filter must remain alongside recovered-menu filtering');
must(!liveNav.includes('onNavigate(masterMenu')&&!liveNav.includes('resolveExactRouteR242(routeRecords,masterMenu'),'master-menu state must never become a route identity or navigation authority');
must(liveNav.includes("R289 recovered-menu presentation downstream of lemma"),'visible technical truth must state the R289 authority boundary');
must(liveNavCss.includes('overflow-x:auto')&&liveNavCss.includes("[aria-pressed='true']")&&liveNavCss.includes('@media(max-width:760px)'),'live 12-menu filter must remain horizontally scrollable, selected-state explicit and mobile responsive');
// R239 browser proof caught the read-only context strip physically intercepting workspace buttons.
// The fix is part of the product contract: actionable filters stay above it and the informational strip is pointer-transparent.
must(/\.r105-workspace-filter\{[^}]*position:relative;z-index:2/.test(dataTruthNavCss),'workspace filter controls must own the higher pointer stacking layer');
must(/\.r105-context-note\{[^}]*position:relative;z-index:1;pointer-events:none/.test(dataTruthNavCss),'read-only context note must never intercept pointer input from workspace controls');

const bindRoutes=[...archive.matchAll(/bindsTo:\[([^\]]+)\]/g)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
for(const route of [...new Set(bindRoutes)])must(routeNames.includes(route),`recovered Drive authority binds to non-route ${route}`);
for(const required of ['Archive Census','Archive Operators','Build Out','System Atlas','Modes','Relativity','Matter Traversal','Evidence & Proof','Control Matrix'])must(bindRoutes.includes(required),`recovery corpus must remain visibly bound to ${required}`);

console.log(`R289 RECOVERED MASTER-MENU NAVIGATION PASS · ${routeNames.length} routes · ${menus.length} recovered menus · ${new Set(bindRoutes).size} recovery-bound surfaces · live R88/R239 organization is downstream of R242 lemma · workspace/search filters pointer-safe · zero orphan routes/bindings · launcher route/favorite controls use independent native semantics`);
