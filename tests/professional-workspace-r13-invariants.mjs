import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('src/App.tsx','utf8');
const shell=fs.readFileSync('src/InstrumentOSShellR62.tsx','utf8');
const shellCss=fs.readFileSync('src/instrumentOSR62.css','utf8');
const resetCss=fs.readFileSync('src/productResetR67.css','utf8');
const workstation=fs.readFileSync('src/workstationV2.css','utf8');

assert(app.includes("import './instrumentOSR62.css'"),'current professional Instrument OS styling must be mounted');
assert(app.includes("import './productResetR67.css'"),'current product reset must own final cascade authority');
assert(!app.includes("import './omegaProfessionalR13.css'"),'superseded R13 global composition must not override current product authority');
assert(shell.includes("label:'Command'")&&shell.includes("label:'Explore'")&&shell.includes("label:'Evidence'")&&shell.includes("label:'System'"),'navigator must expose concise functional workspaces');
assert(shell.includes("const[open,setOpen]=useState(false)")&&shell.includes("setOpen(true)"),'instrument browser must be contextual rather than permanently occupying the canvas');
assert(shell.includes("Search every OMEGA instrument"),'professional navigator must provide global instrument search');
assert(shell.includes("44 historical routes remain reachable"),'historical route reachability must remain governed and explicit');
assert(shellCss.includes('--r62-rail:74px')||resetCss.includes('padding-left:72px'),'desktop navigator must retain a compact rail rather than a wide permanent sidebar');
assert(shellCss.includes('.r62-overlay{position:fixed')&&shellCss.includes('.r62-drawer'),'instrument browser must be an intentional overlay/drawer');
assert(shellCss.includes('@media(max-width:900px)')&&resetCss.includes('@media(max-width:900px)'),'navigator and product must have mobile-specific containment');
assert(resetCss.includes('.r58-display-stage{min-height:calc(100dvh - 230px)'),'visual instruments must receive dominant viewport space');
assert(resetCss.includes('.workstation-identity small{display:none!important}'),'legacy telemetry pressure must not dominate the workstation header');
assert(workstation.includes('padding-right:330px'),'historical donor pressure point remains detectable until the legacy stylesheet itself is retired');
assert(!app.includes('@appdeploy/client')&&!shell.includes('@appdeploy/client')&&!resetCss.includes('@appdeploy/client'),'navigator must remain sovereign-provider portable');
console.log('PASS professional-workspace invariant · current Instrument OS + viewport-first authority accepted');
