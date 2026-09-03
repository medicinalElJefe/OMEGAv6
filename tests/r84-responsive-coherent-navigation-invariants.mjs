import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R84 '+msg)};
const home=read('src/OmegaHomeR71.tsx');
const shell=read('src/InstrumentOSShellR62.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const navCss=read('src/omegaSideNavigatorR88.css');
const polish=read('src/responsivePolishR88.css');
const inventoryCss=read('src/systemInventoryR83.css');
const registry=read('src/omegaExperienceRegistryR82.ts');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'shared route registry must remain 44/44 unique');
for(const id of ['COMMAND','EXPLORE','INTELLIGENCE','EVIDENCE','BUILD','SYSTEM'])must(registry.includes(`id:'${id}'`),`workspace missing ${id}`);

must(home.includes('OmegaSideNavigatorR88'),'Home must mount the same global navigator as the workstation');
must(home.includes("omega-r88-open-navigator")&&home.includes('All 44 applications')&&home.includes('Complete software system'),'Home must open the shared navigator for applications and software');
must(home.includes("omega.r88.systemMapOpen")&&home.includes('return false'),'Home embedded software map must default collapsed under R88');
must(nav.includes('OMEGA_ALL_ROUTES_R82')&&nav.includes("className='r89-flat-scroll'")&&nav.includes('rows.map(route=>'),'navigator must render all 44 routes in one continuous scroll owner');
must(nav.includes("layer==='SOFTWARE'")&&nav.includes('<OmegaSystemInventoryR83 compact'),'navigator must preserve the complete software inventory layer');
must(nav.includes("if(e.key==='Escape')setExpanded(false)")&&nav.includes("dataset.omegaNavExpanded=expanded?'true':'false'"),'side navigator must close deterministically and expose layout-reservation state without locking the page beneath it');
must(navCss.includes('.r94-side-toolbar{')&&navCss.includes('.r94-nav-panel.r88-navigator{'),'navigation must remain one persistent edge toolbar with a collapsible panel');
must(navCss.includes('.r89-flat-scroll{min-height:0;overflow:auto'),'all routes must share one deliberate flat scrolling banner');
must(navCss.includes(".r71-topbar .r71-domains{display:none!important}")&&navCss.includes(".r84-home-launchpad{display:none!important}"),'Home must not repeat workspace compartments or basic launch panels outside the global navigator');
must(navCss.includes("@media(max-width:900px)")&&navCss.includes('--r94-nav-panel:min(42vw,220px)'),'mobile navigator must stay narrow enough to leave active content visible');

must(shell.includes('OmegaSideNavigatorR88')&&!shell.includes("className='r62-rail'"),'workstation must retire the legacy R62 route rail in favor of the shared R94 toolbar');
must(shell.includes("document.documentElement.dataset.omegaFrame=frame"),'workstation must preserve AUTO/DESKTOP/MOBILE frame authority');
must(navCss.includes("html[data-omega-nav-present='true'] :where(.omega-workstation-v2,.r71-home)")&&navCss.includes("html[data-omega-nav-expanded='true'] :where(.omega-workstation-v2,.r71-home)"),'desktop/mobile application must reserve exactly the collapsed/expanded R94 toolbar width');
must(polish.includes("grid-template-columns:auto minmax(0,1fr) auto"),'mobile topbar must keep identity and controls contained');
must(polish.includes('grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr))'),'specialist grids must reflow responsively');

must(inventoryCss.includes('.r83-inventory.compact{grid-template-rows:auto auto auto minmax(0,1fr) auto;min-height:0}'),'compact software inventory must keep one deliberate scroll owner');
must(inventoryCss.includes('.r83-inventory.compact .r83-inventory-kpis{display:flex'),'mobile inventory KPIs must compress horizontally');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'responsive navigation must not remove or duplicate application surfaces');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),`deep donor surface lost: ${token}`);

console.log('R84/R94 RESPONSIVE COHERENT NAVIGATION PASS · persistent side toolbar · desktop/mobile non-covering authority · 44/44 routes');
