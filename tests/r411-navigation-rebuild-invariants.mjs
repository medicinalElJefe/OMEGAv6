import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const css=read('src/omegaSideNavigatorR411.css');
const earth=read('src/EarthObservatoryR8.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
assert.equal(routes.length,44,'R411 must preserve all 44 canonical destinations');
assert.equal(new Set(routes).size,44,'R411 route authority must stay unique');

for(const token of [
 "R411_NAVIGATION_REBUILD_REVISION='R411'",
 "import './omegaSideNavigatorR411.css'",
 "addEventListener('omega-r88-open-navigator'",
 "aria-controls='omega-global-navigator'",
 "id='omega-global-navigator'",
 "rows.map(route=>",
 "onClick={()=>go(route)}",
 "organizedRoutesR132(filtered)",
 "role='status'",
 "aria-live='polite'"
])assert.ok(nav.includes(token),'R411 navigation contract missing '+token);

assert.ok(!nav.includes('rows.slice('),'R411 may not truncate registered routes');
assert.ok(!nav.includes('/api/')&&!nav.includes('fetch('),'R411 navigation must remain presentation-only and backend-independent');

for(const token of [
 '.r411-navigation .r94-nav-rail',
 '.r411-navigation .r94-nav-panel.r88-navigator',
 'grid-template-columns:repeat(7,minmax(0,1fr))',
 'html[data-omega-nav-expanded="true"]',
 'html[data-omega-presentation-fullscreen="true"] .r411-navigation{display:none!important}',
 'workstation-topbar{visibility:hidden!important;pointer-events:none!important}',
 '@media(max-width:900px)',
 '@media(any-pointer:coarse)',
 '@media(prefers-reduced-motion:reduce)'
])assert.ok(css.includes(token),'R411 presentation contract missing '+token);

assert.ok(earth.includes("dataset.omegaPresentationFullscreen='true'"),'Earth fullscreen must declare exclusive viewport ownership');
assert.ok(earth.includes('delete document.documentElement.dataset.omegaPresentationFullscreen'),'Earth fullscreen ownership must clear on exit/unmount');

console.log('R411 NAVIGATION REBUILD PASS');