import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('src/App.tsx','utf8');
const shell=fs.readFileSync('src/InstrumentOSShellR62.tsx','utf8');
const nav=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
const navCss=fs.readFileSync('src/omegaSideNavigatorR88.css','utf8');
const resetCss=fs.readFileSync('src/productResetR67.css','utf8');
const polish=fs.readFileSync('src/responsivePolishR88.css','utf8');
const workstation=fs.readFileSync('src/workstationV2.css','utf8');

assert(app.includes("import './instrumentOSR62.css'"),'retained Instrument OS donor styling must stay mounted for specialist lineage');
assert(app.includes("import './productResetR67.css'"),'product reset must remain mounted');
assert(!app.includes("import './omegaProfessionalR13.css'"),'superseded R13 global composition must not override current product authority');
assert(shell.includes('OmegaSideNavigatorR88'),'mounted shell must delegate navigation to the shared R88 side navigator');
assert(nav.includes('workspaceForRouteR82')&&nav.includes('OMEGA_ALL_ROUTES_R82'),'navigator must consume the shared 44-route experience registry without rendering workspace compartments');
assert(nav.includes("const[expanded,setExpanded]=useState(false)")&&nav.includes('setExpanded(true)'),'application browser must be collapsible while leaving a slim persistent toolbar visible');
assert(nav.includes('Find anywhere in OMEGA'),'professional navigator must provide global flat application search');
assert(nav.includes('Persistent rail')&&nav.includes('active application remains visible'),'historical route reachability must remain governed, explicit, and non-covering');
assert(nav.includes('OMEGA V6')&&nav.includes('Everywhere')&&nav.includes('Software map'),'navigation must expose readable product/everywhere/software labels');
assert(!nav.includes('r88-navigator-backdrop')&&navCss.includes('.r94-side-toolbar{')&&navCss.includes('.r94-nav-panel.r88-navigator{'),'application browser must be a persistent edge toolbar, not a modal overlay');
assert(navCss.includes('@media(max-width:900px)')&&polish.includes('@media(max-width:900px)'),'navigator and active applications must have mobile-specific containment');
assert(navCss.includes("html[data-omega-nav-present='true'] :where(.omega-workstation-v2,.r71-home)")&&navCss.includes("html[data-omega-nav-expanded='true'] :where(.omega-workstation-v2,.r71-home)"),'active application must reserve only the toolbar width in collapsed/expanded states');
assert(resetCss.includes('.r58-display-stage{min-height:calc(100dvh - 230px)'),'visual instruments must receive dominant viewport space');
assert(resetCss.includes('.workstation-identity small{display:none!important}'),'legacy telemetry pressure must not dominate the workstation header');
assert(!workstation.includes('padding-right:330px'),'obsolete donor right-padding must stay retired');
assert(!app.includes('@appdeploy/client')&&!nav.includes('@appdeploy/client')&&!navCss.includes('@appdeploy/client'),'navigator must remain sovereign-provider portable');
console.log('PASS professional-workspace invariant · R94 persistent collapsible navigation + viewport-first authority accepted');
