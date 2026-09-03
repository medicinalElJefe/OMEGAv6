import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const shell=read('src/InstrumentOSShellR62.tsx');
const shellCss=read('src/instrumentOSR62.css');
const navigator=read('src/OmegaSideNavigatorR88.tsx');
const navigatorCss=read('src/omegaSideNavigatorR88.css');
const experience=read('src/omegaExperienceRegistryR82.ts');
const reset=read('src/productResetR67.css');
const integrity=read('src/SurfaceIntegrityR81.tsx');
const integrityCss=read('src/surfaceIntegrityR81.css');
const app=read('src/App.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const navigation=read('src/navigationRegistry.ts');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'R81 requires all 44 canonical surfaces, unique');

const existingBlock=(workstation.match(/SPECIALIST_EXISTING=new Set<Panel>\(\[(.*?)\]\)/s)||[])[1]||'';
const suiteBlock=(workstation.match(/SPECIALIST_SUITE=new Set<Panel>\(\[(.*?)\]\)/s)||[])[1]||'';
const existing=[...existingBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const suite=[...suiteBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const inline=['Command Center','Create','Development','Modes','Plugins'];
const mounted=[...existing,...suite,...inline];
must(mounted.length===44&&new Set(mounted).size===44,'every canonical surface must have one and only one mount owner');
for(const s of surfaces)must(mounted.includes(s),`surface has no explicit mount owner: ${s}`);

const workspaceRoutes=[...experience.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(workspaceRoutes.length===44&&new Set(workspaceRoutes).size===44,'application browser must expose all 44 surfaces exactly once');
for(const s of surfaces)must(workspaceRoutes.includes(s),`application browser omitted ${s}`);

const navNames=[...navigation.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
must(navNames.length===44&&new Set(navNames).size===44,'shared navigation registry must retain 44 unique entries');
must(surfaces.every(x=>navNames.includes(x))&&navNames.every(x=>surfaces.includes(x)),'workstation and shared navigation must remain the same set');

must(workstation.includes("<SurfaceIntegrityR81 panel={panel} record={record} onRecover={()=>go('System')}>{content}</SurfaceIntegrityR81>"),'every active surface must mount inside R81 containment with canonical state context');
must(integrity.includes('<PanelBoundary panel={panel}'),'surface failure must be isolated without crashing the whole build');
must(integrity.includes("className='omega-surface-r81'"),'R81 surface wrapper missing');
must(integrityCss.includes('overflow-x:clip')&&integrityCss.includes("table){\n display:block")&&integrityCss.includes('overflow-x:auto'),'surface content must stay contained while wide tables/tabs remain viewable');
must(integrityCss.includes('.r43-workspace-tabs')&&integrityCss.includes('overflow-x:auto'),'deep-workspace tabs must remain reachable on narrow screens');
must(integrityCss.includes('@media(max-width:900px)'),'R81 mobile containment missing');

must(navigatorCss.includes('.r89-flat-scroll{min-height:0;overflow:auto'),'global application banner must have one deliberate flat scroll owner');
must(!navigator.includes('.slice('),'global application banner must not hide later routes behind slicing');
must(reset.includes('.workstation-identity{min-width:0!important;overflow:hidden!important}'),'long route identity must not cover topbar controls');
must(navigatorCss.includes('env(safe-area-inset-bottom,0px)'),'mobile side navigation must respect safe areas');
must(navigator.includes("if(e.key==='Escape')setExpanded(false)"),'application toolbar panel must support deterministic Escape collapse');
must(!navigator.includes("document.body.style.overflow='hidden'")&&navigator.includes("dataset.omegaNavExpanded=expanded?'true':'false'"),'expanded application toolbar must reserve layout width instead of locking/covering the surface');
must(navigator.includes("aria-current={currentPanel===route?'page':undefined}"),'active route must be exposed accessibly');
must(shell.includes('OmegaSideNavigatorR88'),'R81 containment must mount under the shared R88 navigator authority');

for(const token of [
 "view==='DEEP'&&<MatterTraversal",
 "view==='DEEP'&&<OmegaVisualInstrument",
 "view==='DEEP'&&<OmegaTraversalStudio"
])must(living.includes(token),`restored deep donor view is no longer reachable: ${token}`);

must(app.includes("import './surfaceIntegrityR81.css';"),'R81 integrity stylesheet must be loaded');
must(app.indexOf("surfaceIntegrityR81.css")>app.indexOf("productResetR67.css"),'R81 containment must resolve later donor layout conflicts without reskinning the product');
must(!integrityCss.includes('.omega-surface-r81{display:none')&&!integrityCss.includes('.omega-surface-r81>*{display:none'),'surface-integrity layer may not hide application content');
must(!integrityCss.match(/position\s*:\s*fixed/),'surface-integrity layer may not create another fixed shell');

console.log('R81 SURFACE INTEGRITY PASS · 44/44 mounted · 44/44 reachable · deep donors preserved · mobile/desktop containment locked');