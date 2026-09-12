import fs from 'node:fs';
import assert from 'node:assert/strict';

const launcher=fs.readFileSync('src/OmegaLauncher.tsx','utf8');
const registry=fs.readFileSync('src/navigationRegistry.ts','utf8');
const atlas=fs.readFileSync('src/systemAtlasRuntime.ts','utf8');
const navBlock=(registry.match(/export const OMEGA_NAVIGATION:OmegaNavItem\[\]=\[(.*?)\];/s)||[])[1]||'';
const navNames=[...navBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
assert.equal(navNames.length,44,'canonical navigation registry must remain 44 real destinations');
assert.equal(new Set(navNames).size,44,'canonical navigation destinations must remain unique');

if(launcher.includes('const DOMAIN_SECTIONS=')){
 const domainBlock=launcher.slice(launcher.indexOf('const DOMAIN_SECTIONS=['),launcher.indexOf('] as const;'));
 for(const id of ['COMMAND','VISUAL','EARTH','INTELLIGENCE','BUILD','PROOF','SYSTEM'])assert(domainBlock.includes(`id:'${id}'`),`missing legacy functional navigation domain ${id}`);
 for(const name of navNames){const token=`'${name}'`;const count=domainBlock.split(token).length-1;assert.equal(count,1,`route ${name} must occur exactly once in the legacy functional domain map`)}
}else{
 assert(launcher.includes('LAUNCHER_MASTER_MENUS_R289=OMEGA_MASTER_MENU_NAVIGATION_R289'),'successor launcher must consume the canonical recovered 12-menu authority');
 const mapBlock=(registry.match(/OMEGA_MASTER_MENU_ROUTE_MAP_R289:[^=]+=\{(.*?)\n\};/s)||[])[1]||'';
 const routeMap=[...mapBlock.matchAll(/'([^']+)':'(\d\d)'/g)].map(x=>({route:x[1],menu:x[2]}));
 assert.equal(routeMap.length,44,'successor 12-menu map must cover all 44 canonical routes exactly once');
 assert.equal(new Set(routeMap.map(x=>x.route)).size,44,'successor menu map must not duplicate route ownership');
 for(const name of navNames)assert(routeMap.some(x=>x.route===name),`successor menu map missing route ${name}`);
 const menus=[...new Set(routeMap.map(x=>x.menu))].sort();
 assert.deepEqual(menus,['01','02','03','04','05','06','07','08','09','10','11','12'],'successor navigation must expose all 12 recovered master menus');
 for(const label of ['Runtime Core','Proof & Governance','Traversal','Render Field','Host Inputs','AI Orchestration','Data / Atlas','Audio / Signal','World / Forecast','Recovery / Packaging','Archive Merge','Operator Cockpit'])assert(atlas.includes(label),`recovered master menu missing ${label}`);
 assert(launcher.includes('data-master-menu={omegaMasterMenuForRouteR289(x.name)?.id||\'\'}'),'rendered route cards must expose their recovered menu identity');
}

assert(launcher.includes('OMEGA_NAVIGATION')&&launcher.includes('LAUNCHER_SURFACES=OMEGA_NAVIGATION'),'launcher must continue to use the canonical registry as route authority');
assert(!launcher.includes('@appdeploy/client'),'functional navigation must remain provider portable');
console.log('PASS navigation-functional-domains-r12-invariants · 44-route authority preserved through legacy 7-domain or stronger recovered 12-menu successor');
