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
assert(nav.includes("const[open,setOpen]=useState(false)")&&nav.includes("setOpen(true)"),'application browser must be contextual rather than permanently occupying the canvas');
assert(nav.includes('Find anywhere in OMEGA'),'professional navigator must provide global flat application search');
assert(nav.includes('One banner')&&nav.includes('every route directly reachable'),'historical route reachability must remain governed and explicit');
assert(nav.includes('OMEGA V6')&&nav.includes('Everywhere')&&nav.includes('Software map'),'navigation must expose readable product/everywhere/software labels');
assert(navCss.includes('.r88-navigator-backdrop{position:fixed')&&navCss.includes('.r88-navigator{position:absolute;inset:0 auto 0 0'),'application browser must be an intentional edge-attached overlay');
assert(navCss.includes('@media(max-width:900px)')&&polish.includes('@media(max-width:900px)'),'navigator and active applications must have mobile-specific containment');
assert(polish.includes("html[data-omega-frame='desktop'] .omega-workstation-v2{padding-left:0!important}"),'active desktop application must keep full viewport width when menu is closed');
assert(resetCss.includes('.r58-display-stage{min-height:calc(100dvh - 230px)'),'visual instruments must receive dominant viewport space');
assert(resetCss.includes('.workstation-identity small{display:none!important}'),'legacy telemetry pressure must not dominate the workstation header');
assert(!workstation.includes('padding-right:330px'),'obsolete donor right-padding must stay retired');
assert(!app.includes('@appdeploy/client')&&!nav.includes('@appdeploy/client')&&!navCss.includes('@appdeploy/client'),'navigator must remain sovereign-provider portable');
console.log('PASS professional-workspace invariant · R89 flat pop-out navigation + viewport-first authority accepted');
