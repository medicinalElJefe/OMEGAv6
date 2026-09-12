import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R289 recovered-menu invariant failed: ${msg}`)};
const nav=read('src/navigationRegistry.ts');
const launcher=read('src/OmegaLauncher.tsx');
const launcherCss=read('src/omegaLauncherR289.css');
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

must(launcher.includes('LAUNCHER_MASTER_MENUS_R289=OMEGA_MASTER_MENU_NAVIGATION_R289'),'launcher must consume the canonical recovered master-menu navigation');
must(!launcher.includes('const DOMAIN_SECTIONS='),'launcher must not retain an independent hard-coded domain taxonomy');
must(launcher.includes("data-master-menu={omegaMasterMenuForRouteR289(x.name)?.id||''}"),'rendered routes must expose their recovered master-menu identity');
must(launcher.includes('44 routes · 12 recovered menus · ALL MODES'),'launcher must expose the complete navigation contract');
must(launcher.includes("import './omegaLauncherR289.css'"),'responsive R289 menu layer must be mounted');
must(launcherCss.includes('overflow-y:auto')&&launcherCss.includes('@media(max-height:760px)')&&launcherCss.includes('@media(max-width:760px)'),'12-menu rail must remain scrollable and responsive on short/mobile viewports');

const bindRoutes=[...archive.matchAll(/bindsTo:\[([^\]]+)\]/g)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
for(const route of [...new Set(bindRoutes)])must(routeNames.includes(route),`recovered Drive authority binds to non-route ${route}`);
for(const required of ['Archive Census','Archive Operators','Build Out','System Atlas','Modes','Relativity','Matter Traversal','Evidence & Proof','Control Matrix'])must(bindRoutes.includes(required),`recovery corpus must remain visibly bound to ${required}`);

console.log(`R289 RECOVERED MASTER-MENU NAVIGATION PASS · ${routeNames.length} routes · ${menus.length} recovered menus · ${new Set(bindRoutes).size} recovery-bound surfaces · zero orphan routes/bindings`);
