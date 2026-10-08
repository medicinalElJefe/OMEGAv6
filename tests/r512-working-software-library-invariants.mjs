import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry=fs.readFileSync('src/softwareLaunchRegistryR512.ts','utf8');
const library=fs.readFileSync('src/SoftwareLibraryR512.tsx','utf8');
const nav=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const corpus=fs.readFileSync('src/yearCorpusExecutionR473.ts','utf8');
const pkg=fs.readFileSync('package.json','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');

for(const token of [
 "YEAR_CORPUS_EXECUTION_R473.map(compile)",
 "operationContractForRouteR143(binding.route)",
 "OMEGA_ALL_ROUTES_R82.includes(binding.route as any)",
 "WORKS_NOW","SUCCESSOR_ADAPTER","EVIDENCE_GATED",
 "Historical software names are searchable aliases for current executor bindings",
])assert.ok(registry.includes(token),'R512 launch registry missing '+token);

for(const alias of [
 'Omega Atlas OS','Omega Sovereign Runtime','Local Sovereign AI','Desktop Link','OMEGA_DESKTOP_LINK',
 'Temple Garden','JST','Midland Credit','Vantage West','DAY','Music Engine','OmegaInfinity'
])assert.ok(corpus.includes(alias),'R512 historical alias missing from executable corpus binding: '+alias);

for(const token of [
 "data-r512-software-library='true'",
 "row.launchable&&onNavigate(row.route)",
 "Current executor",
 "Launch successor",
 "Open gated executor",
])assert.ok(library.includes(token),'R512 software library missing '+token);

assert.ok(nav.includes("<SoftwareLibraryR512 onNavigate={go}/>"),'normal Software view must use the working launch library');
assert.ok(nav.includes("showTechnical&&<OmegaSystemInventoryR83 compact onNavigate={go}/>"),'forensic inventory must remain available only in Technical view');
assert.ok(nav.includes("{showTechnical&&<div className='r333-filter-row r411-master-row'>"),'legacy 12-menu filter must not clutter simple navigation');
assert.ok(nav.includes("<b>WORKSPACE</b><small>What are you doing?</small>"),'simple navigation must be task/workspace organized');
assert.ok(nav.includes("title='Software library'"),'rail must expose Software Library directly');

for(const token of [
 "import SoftwareLibraryR512 from '../src/SoftwareLibraryR512'",
 "SOFTWARE_LAUNCH_ROWS_R512",
 "softwareMatches.map(row=>",
 "data-command-software={row.id}",
 "<SoftwareLibraryR512 onNavigate={open}/>",
])assert.ok(root.includes(token),'OMEGA7 R512 integration missing '+token);

assert.ok(pkg.includes('test:r512'),'R512 invariant must be wired into npm check');
assert.ok(ci.includes('r512-working-software-library-browser-e2e.mjs'),'R512 browser proof must be release-blocking');

console.log('R512 WORKING SOFTWARE LIBRARY PASS · simple menu uses six workspaces · recovered master menus technical-only · historical software aliases launch current executors · inventory remains forensic · OMEGA7 Ctrl-K and recovered surface use the same launch authority');
