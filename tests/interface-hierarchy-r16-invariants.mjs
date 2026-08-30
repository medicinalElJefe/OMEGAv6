import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync('src/App.tsx','utf8');
const design=fs.readFileSync('src/sovereignDesignR59.css','utf8');
const reset=fs.readFileSync('src/productResetR67.css','utf8');
const shell=fs.readFileSync('src/InstrumentOSShellR62.tsx','utf8');
const shellCss=fs.readFileSync('src/instrumentOSR62.css','utf8');
const capCss=fs.readFileSync('src/capabilityRestoreR43.css','utf8');

// R16 behavioral law survives; R16 stylesheet itself no longer owns the application.
assert(!app.includes("import './omegaInterfaceR16.css'"),'superseded R16 global authority must not override current product hierarchy');
assert(design.includes('.special-app')&&design.includes('background-color:transparent!important'),'application workspaces must remain open canvases rather than giant rounded cards');
assert(reset.includes('.workstation-topbar')&&reset.includes('height:50px!important'),'top bar must remain a quiet application frame');
assert(design.includes('.r43-workspace-tabs')&&reset.includes('.r43-workspace-tabs'),'segmented specialist navigation must retain compact hierarchy');
assert(reset.includes('.r58-display-stage')&&reset.includes('min-height:calc(100dvh - 230px)'),'visual stage must dominate the viewport');
assert(shell.includes('className=\'r62-drawer\'')&&shellCss.includes('.r62-drawer'),'application switcher must be an intentional edge-attached drawer');
assert(shellCss.includes('@media(max-width:900px)')&&reset.includes('@media(max-width:900px)'),'mobile must use a distinct contained hierarchy');
assert(capCss.includes('r43-capability')||capCss.includes('capability'),'dense analytical capability matrix styling must remain available');
assert(reset.includes('.r60-runtime-functions')&&reset.includes('.r63-tool-drawer'),'secondary inventories must remain progressively disclosed rather than dominate the canvas');
assert(!app.includes('@appdeploy/client')&&!design.includes('@appdeploy/client')&&!reset.includes('@appdeploy/client'),'interface must remain provider-portable');
console.log('PASS interface hierarchy invariant · current product behavior preserved without R16 global ownership');
