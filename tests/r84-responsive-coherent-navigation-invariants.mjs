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
must(nav.includes("if(e.key==='Escape')setOpen(false)")&&nav.includes("document.body.style.overflow='hidden'"),'side navigator must close deterministically and lock the page beneath it');
must(navCss.includes('.r88-navigator{position:absolute;inset:0 auto 0 0'),'navigation must remain an edge pop-out rather than a page section');
must(navCss.includes('.r89-flat-scroll{min-height:0;overflow:auto'),'all routes must share one deliberate flat scrolling banner');
must(navCss.includes(".r71-topbar .r71-domains{display:none!important}")&&navCss.includes(".r84-home-launchpad{display:none!important}"),'Home must not repeat workspace compartments or basic launch panels outside the global navigator');
must(navCss.includes("@media(max-width:900px)")&&navCss.includes("width:min(88vw,354px)!important"),'mobile navigator must remain a compact side-owned banner');

must(shell.includes('OmegaSideNavigatorR88')&&!shell.includes("className='r62-rail'"),'workstation must retire the permanent desktop/mobile route rail');
must(shell.includes("document.documentElement.dataset.omegaFrame=frame"),'workstation must preserve AUTO/DESKTOP/MOBILE frame authority');
must(polish.includes("html[data-omega-frame='desktop'] .omega-workstation-v2{padding-left:0!important}"),'desktop application must recover the width formerly reserved by the rail');
must(polish.includes("grid-template-columns:auto minmax(0,1fr) auto"),'mobile topbar must keep identity and controls contained');
must(polish.includes('grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr))'),'specialist grids must reflow responsively');

must(inventoryCss.includes('.r83-inventory.compact{grid-template-rows:auto auto auto minmax(0,1fr) auto;min-height:0}'),'compact software inventory must keep one deliberate scroll owner');
must(inventoryCss.includes('.r83-inventory.compact .r83-inventory-kpis{display:flex'),'mobile inventory KPIs must compress horizontally');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'responsive navigation must not remove or duplicate application surfaces');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),`deep donor surface lost: ${token}`);

console.log('R84 RESPONSIVE COHERENT NAVIGATION PASS · R89 flat side banner · desktop/mobile viewport authority · 44/44 routes · no buried workspace hierarchy');
