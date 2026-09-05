import fs from 'node:fs';
const app=fs.readFileSync('src/App.tsx','utf8');
const css=fs.readFileSync('src/productResetR67.css','utf8');
const home=fs.readFileSync('src/OmegaHomeR59.tsx','utf8');
const shell=fs.readFileSync('src/InstrumentOSShellR62.tsx','utf8');
const navigator=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
const req=[
 [app.includes("import './productResetR67.css';"),'final product reset is imported'],
 [app.indexOf("productResetR67.css")>app.indexOf("instrumentOSR62.css"),'reset owns final cascade authority'],
 [css.includes('.r59-home>.r59-rail{display:none!important}'),'duplicate home rail removed'],
 [css.includes('.r59-display-deck,.r59-primary{display:none!important}'),'duplicate home card inventories demoted'],
 [css.includes('min-height:calc(100dvh - 72px)'),'first viewport is command + living field'],
 [css.includes('.workstation-identity small{display:none!important}'),'workstation telemetry wall demoted'],
 [css.includes('.hybrid-r32-install{grid-template-columns:repeat(3'),'Hybrid 3-step connection path remains available'],
 [css.includes('@media(max-width:900px)'),'mobile containment exists'],
 [home.includes('SovereignRuntimeConstellationR62'),'living runtime remains on Home'],
 [home.includes('ExtremeTraversalUnionR60'),'restored execution stack remains reachable'],
 [shell.includes('OmegaSideNavigatorR88')&&navigator.includes('r89-flat-scroll')&&navigator.includes('rows.map(route=>')&&!navigator.includes('rows.slice('),'all historical routes remain directly reachable through the governed readable flat side navigator']
];
const bad=req.filter(([ok])=>!ok);if(bad.length){console.error('R67 invariant FAIL');for(const[,m]of bad)console.error('-',m);process.exit(1)}
console.log('R67 product reset invariant PASS');for(const[,m]of req)console.log('PASS',m);
await import('./r68-style-authority-invariant.mjs');
