import fs from 'node:fs';
import assert from 'node:assert/strict';
const nav=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
const css=fs.readFileSync('src/omegaSideNavigatorR156.css','utf8');
const registry=fs.readFileSync('src/omegaExperienceRegistryR82.ts','utf8');
const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
assert.equal(routes.length,44,'R156 primary navigator must preserve the complete 44-route universe');
assert.equal(new Set(routes).size,44,'R156 primary navigator cannot duplicate canonical routes');

for(const token of [
 "import {omegaNavItem} from './navigationRegistry'",
 "from './adaptiveNavigationR156'",
 "from './liveNavigationR156'",
 "import './omegaSideNavigatorR156.css'",
 'useLiveNavigationR156()',
 'rankRoutesForIntent(q,organized)',
 'rankMissionStacksForIntent(query)',
 "adaptiveNextRoutes(currentPanel,'',live)",
 "omega.r156.globalPins",
 "omega.r156.globalRecent",
 "live.pcOnline?'PC LIVE':'PC'",
 "missionRunning?'RUN':'STATE'",
 'Live operating surface',
 "className='r156-global-context'",
 "className='r156-global-live-grid'",
 'NEXT BEST ACTIONS',
 "className='r156-global-path'",
 "className='r156-continuity-strip'",
 'Describe the outcome: repair build, prove it, connected PC, Earth forecast…',
 "className='r156-task-matches'",
 'TASK WORKSPACES',
 'rows.map(route=>',
 "className='r132-route-meta r156-route-meta'",
 'all 44 destinations remain reachable',
 'Persistent rail · active application remains visible'
])assert.ok(nav.includes(token),`R156 global navigator missing ${token}`);

assert.ok(nav.includes('organizedRoutesR132(filtered)'),'R156 must retain R132 route organization authority');
assert.ok(nav.includes('data-tier={org.tier}')&&nav.includes('org.layout.replaceAll'),'R156 must preserve R132 tier/layout metadata even while simplifying visible rows');
assert.ok(!nav.includes('rows.slice('),'R156 must never hide route results through arbitrary slicing');
assert.ok(!nav.includes('autoExecute'),'R156 navigation cannot auto-execute a suggested action');

for(const token of [
 '.r156-global-nav .r94-nav-panel',
 '.r156-rail-live',
 '.r156-active-instrument',
 '.r156-global-context',
 '.r156-global-live-grid',
 '.r156-global-next',
 '.r156-global-path',
 '.r156-continuity-strip',
 '.r156-semantic-search',
 '.r156-task-matches',
 '.r156-route-meta',
 '@media(max-width:900px)',
 '@media(max-width:520px)',
 '@media(prefers-reduced-motion:reduce)'
])assert.ok(css.includes(token),`R156 primary navigator CSS missing ${token}`);
assert.ok(!css.includes('width:100vw!important'),'R156 global navigator may not become a permanent full-width obstruction');
console.log('PASS R156 primary global navigator · live PC/mission/RCWA/proof fabric + semantic command deck + task workspaces + continuity pins/recent + complete 44-route flat registry');
