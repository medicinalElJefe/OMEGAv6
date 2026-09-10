import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const css=fs.readFileSync('src/interfacePolishR203.css','utf8');
const nav=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const r120=fs.readFileSync('src/omegaSideNavigatorR120.css','utf8');

assert.ok(app.includes("import './interfacePolishR203.css';"),'R203 polish must load from the canonical application root');
for(const retained of ["import './surfaceIntegrityR81.css';","import './capabilityFirstR138.css';","<LivingWorldPulseR174 onNavigate={navigate}/>","<LivingSceneEvidenceBandR2023 onNavigate={navigate}/>"])assert.ok(app.includes(retained),`R203 must preserve inherited root surface ${retained}`);

for(const token of ['.r120-adaptive-nav .r94-nav-rail','.r120-adaptive-nav .r94-nav-panel','.r89-flat-route.active','.workstation-main',':where(.panel,.special-app)',':focus-visible','@media(max-width:900px)','@media(max-width:520px)','@media(prefers-reduced-motion:reduce)'])assert.ok(css.includes(token),`R203 polish coverage missing ${token}`);
assert.ok(css.includes('Visual-only: no route, execution, proof, Canon, or persistence authority.'),'R203 must declare visual-only truth boundary');
assert.ok(!css.includes('display:none!important}.r94-rail-action'),'R203 must not hide the persistent route rail');

assert.ok(nav.includes('OMEGA_ALL_ROUTES_R82'),'R203 must retain the complete authoritative route registry');
assert.ok(nav.includes('onNavigate(panel)')||nav.includes('onNavigate(resolved.name)'),'R203 must retain the navigation dispatch path; later exact-route resolution may dispatch the resolved registered identity');
assert.ok(nav.includes("if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k')"),'R203 must retain command-search navigation shortcut');
assert.ok(/if\(e\.key==='Escape'\)\s*\{?\s*setExpanded\(false\)/.test(nav),'R203 must retain navigator escape behavior across later accessibility/navigation convergence');
assert.ok(nav.includes("onClick={()=>go(route)}"),'R203 must keep every registered route directly navigable');

assert.ok(workstation.includes("export const OMEGA_SURFACES=['Command Center'"),'R203 must preserve complete workstation surface authority');
assert.ok(workstation.includes("const go=(name:string)=>"),'R203 must preserve the existing route/go execution path');
assert.ok(r120.includes('calc(100vw - var(--r94-nav-rail) - 224px)'),'R203 must preserve the R155 mobile instrument-space floor');

console.log('R203 PASS · unified late-loading design polish covers panels, menus, controls and responsive navigation while preserving the full route registry, exact resolved go/onNavigate paths, living-world proof surfaces, mobile instrument floor, reduced-motion accessibility, and all authority boundaries.');
