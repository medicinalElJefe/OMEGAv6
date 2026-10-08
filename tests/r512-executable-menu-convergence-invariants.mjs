import assert from 'node:assert/strict';
import fs from 'node:fs';

const year=fs.readFileSync('src/yearCorpusExecutionR473.ts','utf8');
const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const menu=fs.readFileSync('src7/executableMenuR512.ts','utf8');
const state=fs.readFileSync('src7/appState.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');

const rows=[...year.matchAll(/B\('([^']+)','([^']+)','([^']+)','(EXECUTES_NOW|EXECUTES_AS_ADAPTER|TRUTH_GATED)','([^']+)','([^']+)'/g)]
 .map(m=>({id:m[1],name:m[2],domain:m[3],state:m[4],route:m[5],operation:m[6]}));
assert.equal(rows.length,72,'R512 must preserve the complete 72-binding recovered software/capability execution corpus');

const routeMatch=native.match(/OMEGA7_NATIVE_ROUTES=Object\.freeze\(\[([\s\S]*?)\] as const/);
assert.ok(routeMatch,'OMEGA7 native route registry missing');
const nativeRoutes=[...routeMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
assert.equal(nativeRoutes.length,44,'R512 must preserve all 44 native route executors');

const unresolved=rows.filter(row=>!nativeRoutes.includes(row.route));
assert.deepEqual(unresolved,[],'every recovered software binding must resolve to a current native executor');

assert.ok(menu.includes("R512_MENU_SCHEMA='OMEGA7_EXECUTABLE_MENU_R512'"));
assert.ok(menu.includes("R512_EXECUTABLE_SOFTWARE"));
assert.ok(menu.includes("searchExecutableMenuR512"));
assert.ok(menu.includes("menuSectionsForDomainR512"));
assert.ok(menu.includes("Historical names")||menu.includes("aliases"));
assert.ok(menu.includes(".replace(/(\\\\d),(?=\\\\d)/g,'$1')")||menu.includes(".replace(/(\\d),(?=\\d)/g,'$1')"),'R512 query normalization must preserve numeric commas');
assert.ok(menu.includes(".replace(/\\\\s+/g,' ')")||menu.includes(".replace(/\\s+/g,' ')"),'R512 query normalization must collapse whitespace');

for(const token of [
 "softwareLaunch:Omega7SoftwareLaunchContext|null",
 "type:'LAUNCH_SOFTWARE'",
 "case'LAUNCH_SOFTWARE'",
])assert.ok(state.includes(token),'R512 launch state missing '+token);

for(const token of [
 "launchSoftware=(software:R512SoftwareBinding)",
 "data-command-software",
 "Previous software · current executors",
 "Launch current executor",
 "Launch adapted successor",
 "Open evidence/device gate",
 "menuSections.map",
 "data-r512-menu='intent-capability-executor'",
])assert.ok(root.includes(token),'R512 menu/executor wiring missing '+token);

assert.ok(root.includes("data-command-software-route={software.route}")||root.includes("data-command-software-route={result.software.route}"),'previous-software command results must preserve stable executor-route identity without colliding with canonical capability parity selectors');
assert.equal(root.includes("onClick={()=>open(x.route)}"),false,'recovered software must not degrade to a generic route bookmark');

for(const token of [
 "Previous software → current executor",
 "data-r512-executor-route",
 "data-r512-binding",
 "MutationObserver",
 "querySelector<HTMLButtonElement>('.o7-open-instrument')",
])assert.ok(native.includes(token),'R512 native executor bridge missing '+token);

for(const token of [
 'R512 · EXECUTABLE MENU CONVERGENCE',
 '.o7-menu-groups',
 '.o7-menu-group',
 '.o7-software-executor-context',
])assert.ok(css.includes(token),'R512 menu styling missing '+token);

const byState={
 live:rows.filter(x=>x.state==='EXECUTES_NOW').length,
 adapter:rows.filter(x=>x.state==='EXECUTES_AS_ADAPTER').length,
 gated:rows.filter(x=>x.state==='TRUTH_GATED').length,
};
assert.deepEqual(byState,{live:51,adapter:15,gated:6});

console.log('R512 EXECUTABLE MENU SOURCE PASS · 72/72 recovered bindings resolve to 44 native executors · 51 live · 15 adapters · 6 truth-gated · aliases launch with operation context');
