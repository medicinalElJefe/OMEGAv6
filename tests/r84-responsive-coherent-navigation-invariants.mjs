import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R84 '+msg)};
const home=read('src/OmegaHomeR71.tsx');
const homeCss=read('src/omegaHomeR71.css');
const shell=read('src/InstrumentOSShellR62.tsx');
const shellCss=read('src/instrumentOSR62.css');
const reset=read('src/productResetR67.css');
const inventoryCss=read('src/systemInventoryR83.css');
const registry=read('src/omegaExperienceRegistryR82.ts');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'shared route registry must remain 44/44 unique');
for(const id of ['COMMAND','EXPLORE','INTELLIGENCE','EVIDENCE','BUILD','SYSTEM'])must(registry.includes(`id:'${id}'`),`workspace missing ${id}`);

must(home.includes("className='r84-home-launchpad'"),'Home must expose a first-screen workspace launchpad');
must(home.includes('Everything stays reachable from here.'),'Home launchpad must state navigation authority clearly');
must(home.includes('All 44 applications')&&home.includes('Complete software system'),'Home must expose both route and full-software entry points directly');
must(home.includes("browserLayer==='APPLICATIONS'")&&home.includes("browserLayer==='SOFTWARE'"),'Home browser must share applications/software layers with workstation');
must(home.includes("placeholder='Search all 44 OMEGA applications'"),'Home must preserve global application search');
must(home.includes("<OmegaSystemInventoryR83 compact onNavigate={enter}/>"),'Home software browser must expose complete software navigator');
must(home.includes("document.body.style.overflow='hidden'")&&home.includes("if(e.key==='Escape')setShowApps(false)"),'Home browser must be modal and Escape-closeable');
must(home.includes("window.matchMedia('(max-width: 820px)').matches"),'Home embedded full inventory must default compact/collapsed based on mobile viewport when no user preference exists');
must(home.includes("setShowApps(false);localState.write('omega.v6.panel'"),'navigation must close the browser before changing application');

must(homeCss.includes('.r84-home-launchpad>div{display:grid;grid-template-columns:repeat(6'),'desktop Home must show all six workspaces at once');
must(homeCss.includes(".r84-home-launchpad>div{grid-template-columns:repeat(2,minmax(0,1fr))}"),'mobile Home must show workspaces in a readable two-column grid');
must(homeCss.includes('.r71-domains{display:none!important}'),'mobile Home must not duplicate a second scrolling workspace menu in the sticky header');
must(homeCss.includes(".r71-app-drawer{top:calc(62px + env(safe-area-inset-top,0px));bottom:0;left:0;right:0;width:100%"),'mobile Home browser must own the remaining viewport without overlap');
must(homeCss.includes('.r84-home-browser-workspaces{display:flex;overflow-x:auto'),'mobile browser workspace choices must remain reachable without wrapping/overlap');

must(shell.includes("document.documentElement.dataset.omegaBrowserOpen='true'"),'workstation browser must publish modal-open state');
must(shell.includes("delete document.documentElement.dataset.omegaBrowserOpen"),'workstation browser modal state must clean up');
must(shell.includes("Browse all applications and software systems"),'workstation quick nav must disclose complete browser scope');
must(shell.includes("browserLayer==='SOFTWARE'")&&shell.includes("<OmegaSystemInventoryR83 compact onNavigate={go}/>"),'workstation browser must preserve full software layer');
must(shellCss.includes("html[data-omega-browser-open='true'] .r62-rail{opacity:0;pointer-events:none}"),'mobile bottom rail must not remain interactive beneath the full-screen browser');
must(shellCss.includes(".r62-rail button span{display:block!important"),'mobile bottom navigation must retain readable labels instead of unexplained icons');
must(shellCss.includes('.r62-overlay{z-index:400;padding:0!important;inset:0!important}'),'mobile system browser must own the viewport while open');
must(reset.includes('.r62-overlay{padding-bottom:0!important}'),'late product reset must not reintroduce bottom-rail overlap under the modal');
must(reset.includes('.r62-rail button{width:54px!important;min-height:54px!important'),'late product reset must preserve touch-sized labeled mobile navigation');

must(inventoryCss.includes('.r83-inventory.compact{grid-template-rows:auto auto auto minmax(0,1fr) auto;min-height:0}'),'compact software inventory must have one deliberate scroll owner');
must(inventoryCss.includes('.r83-inventory.compact .r83-inventory-kpis{display:flex'),'mobile inventory KPIs must compress horizontally instead of consuming the screen');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'responsive navigation must not remove or duplicate application surfaces');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),`deep donor surface lost: ${token}`);

console.log('R84 RESPONSIVE COHERENT NAVIGATION PASS · desktop/mobile main-page reachability · 44/44 routes · software system browser · no modal/nav overlap');