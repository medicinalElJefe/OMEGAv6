import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('src/App.tsx','utf8');
const launcher=fs.readFileSync('src/OmegaLauncher.tsx','utf8');
const navCss=fs.readFileSync('src/omegaLauncherR13.css','utf8');
const proCss=fs.readFileSync('src/omegaProfessionalR13.css','utf8');
const workstation=fs.readFileSync('src/workstationV2.css','utf8');

assert(app.includes("import './omegaProfessionalR13.css'"),'R13 professional composition layer must be loaded last');
assert(launcher.includes("import './omegaLauncherR13.css'"),'professional navigator styling must be mounted');
assert(launcher.includes("const[open,setOpen]=useState(false),[q,setQ]=useState(''),[domain,setDomain]"),'navigator must focus one functional domain at a time');
assert(launcher.includes("label:'Visualize'")&&launcher.includes("label:'Earth & Forecast'")&&launcher.includes("label:'Evidence'"),'navigator must expose concise human functional domains');
assert(navCss.includes('grid-template-columns:72px minmax(0,1fr)'),'desktop navigator must use a compact domain rail plus focused application pane');
assert(navCss.includes('inset:0 auto 0 0')&&navCss.includes('height:100dvh'),'navigator must behave as a workstation side switcher rather than centered card modal');
assert(navCss.includes('@media(max-width:760px)'),'navigator must have a mobile-specific composition');
assert(proCss.includes('.workstation-main')&&proCss.includes('padding-right:max(10px'),'R13 must override the legacy permanently reserved 330px workstation rail');
assert(workstation.includes('padding-right:330px'),'legacy pressure point must remain detectable as donor debt until source refactor removes it');
assert(proCss.includes('.responsive-shell-rail')&&proCss.includes('transform:translateX(calc(100% + 24px))'),'desktop runtime rail must be contextual instead of permanently occupying the canvas');
assert(proCss.includes('.visual-stage{min-height:clamp(560px,72dvh,920px)'),'visual instruments must receive dominant viewport space');
assert(!launcher.includes('One map. Forty-four real destinations.'),'navigator must not regress to wall-of-cards language');
assert(!launcher.includes("import './omegaLauncher.css'")&&!launcher.includes("import './omegaLauncherR12.css'"),'launcher must not inherit legacy modal/card-wall styling');
assert(!launcher.includes('@appdeploy/client')&&!proCss.includes('@appdeploy/client'),'navigator must remain sovereign-provider portable');
console.log('PASS professional-workspace-r13-invariants · R15 compact switcher accepted');
