import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const shell=read('src/InstrumentOSShellR62.tsx');
const shellCss=read('src/instrumentOSR62.css');
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

const workspaceBlock=(shell.match(/const WORKSPACES=\[(.*?)\] as const;/s)||[])[1]||'';
const workspaceRoutes=[...workspaceBlock.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(workspaceRoutes.length===44&&new Set(workspaceRoutes).size===44,'application browser must expose all 44 surfaces exactly once');
for(const s of surfaces)must(workspaceRoutes.includes(s),`application browser omitted ${s}`);

const navNames=[...navigation.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
must(navNames.length===44&&new Set(navNames).size===44,'shared navigation registry must retain 44 unique entries');
must(surfaces.every(x=>navNames.includes(x))&&navNames.every(x=>surfaces.includes(x)),'workstation and shared navigation must remain the same set');

must(workstation.includes("<SurfaceIntegrityR81 panel={panel} onRecover={()=>go('System')}>{content}</SurfaceIntegrityR81>"),'every active surface must mount inside R81 containment');
must(integrity.includes('<PanelBoundary panel={panel}'),'surface failure must be isolated without crashing the whole build');
must(integrity.includes("className='omega-surface-r81'"),'R81 surface wrapper missing');
must(integrityCss.includes('overflow-x:auto')&&integrityCss.includes('max-width:100%'),'surface content must stay viewable rather than overlap the viewport');
must(integrityCss.includes('.r43-workspace-tabs')&&integrityCss.includes('overflow-x:auto'),'deep-workspace tabs must remain reachable on narrow screens');
must(integrityCss.includes('@media(max-width:900px)'),'R81 mobile containment missing');

must(shellCss.includes('overflow-x:auto')&&shellCss.includes('.r62-rail nav::-webkit-scrollbar{display:none}'),'mobile workspace rail must scroll instead of overlap');
must(!reset.includes('.r62-rail nav button:nth-child(n+5){display:none!important}'),'mobile navigation must not hide Build/System workspace access');
must(reset.includes('.workstation-identity{min-width:0!important;overflow:hidden!important}'),'long route identity must not cover topbar controls');
must(shellCss.includes('env(safe-area-inset-bottom,0px)'),'mobile navigation must respect bottom safe area');
must(shell.includes("if(e.key==='Escape')setOpen(false)"),'application drawer must support deterministic Escape close');
must(shell.includes("document.body.style.overflow='hidden'"),'open application drawer must not scroll the surface underneath');
must(shell.includes("aria-current={panel===name?'page':undefined}"),'active route must be exposed accessibly');
must(shell.includes('navRef.current?.querySelector'),'active mobile workspace must be brought into view');

for(const token of [
 "view==='DEEP'&&<MatterTraversal",
 "view==='DEEP'&&<OmegaVisualInstrument",
 "view==='DEEP'&&<OmegaTraversalStudio"
])must(living.includes(token),`restored deep donor view is no longer reachable: ${token}`);

must(app.includes("import './surfaceIntegrityR81.css';"),'R81 integrity stylesheet must be loaded');
must(app.indexOf("surfaceIntegrityR81.css")>app.indexOf("productResetR67.css"),'R81 containment must resolve later donor layout conflicts without reskinning the product');
must(!integrityCss.match(/display\s*:\s*none/),'surface-integrity layer may not hide application content');
must(!integrityCss.match(/position\s*:\s*fixed/),'surface-integrity layer may not create another fixed shell');

console.log('R81 SURFACE INTEGRITY PASS · 44/44 mounted · 44/44 reachable · deep donors preserved · mobile/desktop containment locked');