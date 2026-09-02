import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R90 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const css=read('src/surfaceHierarchyR90.css');
const shell=read('src/InstrumentOSShellR62.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const earth=read('src/EarthNowInstrument.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const modes=read('src/SourceBackedModesPanelR21.tsx');
const sai=read('src/SAISovereignControl.tsx');
const atlas=read('src/SystemAtlasControl.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical surface universe must remain 44/44 unique');
must(workstation.includes("import './surfaceHierarchyR90.css';"),'R90 hierarchy authority must load after R89');
must(workstation.indexOf("surfaceHierarchyR90.css")>workstation.indexOf("mobileVisualFirstR89.css"),'R90 must be final workstation presentation authority');
must(shell.includes('OmegaSideNavigatorR88')&&!shell.includes("className='r62-rail'"),'active shell must remain the shared flat navigator, not a legacy rail');
must(nav.includes("className='r89-flat-scroll'")&&nav.includes('rows.map(route=>'),'flat 44-route navigation must remain intact');

for(const p of ['Earth Now','Hybrid Link','Modes','Evidence & Proof','SAI Lab','Kernel Intelligence','System Atlas','Control Matrix'])
 must(css.includes("data-panel='"+p+"'")||css.includes("data-panel='"+p+"']"),'missing R90 hierarchy coverage for '+p);
must(css.includes("grid-template-rows:minmax(66dvh,1fr) auto")&&css.includes(".earth-legend{position:static!important"),'Earth mobile globe must own viewport and legend must leave canvas overlay');
must(css.includes(".hybrid-r32-livegrid{display:flex!important")&&css.includes("scroll-snap-type:x proximity"),'Hybrid live proof lists must remain reachable without vertical wall');
must(css.includes(".sbm21-expression{order:1}")&&css.includes(".sbm21-expression .mer82-stage{min-height:68dvh!important}"),'Modes selected expression must lead mobile hierarchy');
must(css.includes(".r28-evidence-grid{display:flex!important")&&css.includes(".r85-evidence-workflow>div{display:flex!important"),'Evidence proof/workflow must remain complete but swipe-scannable');
must(css.includes(".sai-tabs{position:sticky!important")&&css.includes(".sai-summary{display:flex!important"),'SAI must prioritize one active tab with compact status ribbon');
must(css.includes(".system-atlas-r38{gap:6px!important;--sys-field-min:66dvh!important}")&&css.includes(".atlas-r38-context{display:flex!important"),'System Atlas active packet must dominate mobile hierarchy');

must(!css.includes(".earth-proof{display:none")&&!css.includes(".special-boundary{display:none")&&!css.includes(".sbm21-expression{display:none")&&!css.includes(".sai-footer{display:none"),'R90 may not hide truth/proof boundaries or primary expression');
must(earth.includes('Truth boundary:')&&earth.includes('not a physical geolocation'),'Earth truth boundary must remain explicit');
must(hybrid.includes('Native execution is claimed only while an authenticated agent heartbeat is current'),'Hybrid native-execution truth gate must remain explicit');
must(modes.includes('Catalog membership is never reported as execution'),'Modes catalog/execution separation must remain explicit');
must(sai.includes('It cannot silently edit GitHub or promote production from the browser'),'SAI production mutation boundary must remain explicit');
must(atlas.includes('registration ≠ execution')&&atlas.includes('Registered capability never implies executable capability'),'System Atlas registration/execution separation must remain explicit');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),'deep donor lost: '+token);
must(!css.includes('@appdeploy/client'),'R90 hierarchy must remain provider portable');
console.log('R90 INTEGRITY-PRESERVING SURFACE HIERARCHY PASS · 44 routes · truth gates intact · dense mobile surfaces promoted without capability deletion');
