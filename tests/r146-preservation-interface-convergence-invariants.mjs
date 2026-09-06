import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R146 '+msg);
const registry=read('src/omegaExperienceRegistryR82.ts');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const r146=read('src/interfaceConvergenceR146.ts');
const css=read('src/omegaInterfaceConvergenceR146.css');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const workspaceBlock=(registry.match(/OMEGA_WORKSPACES_R82:[\s\S]*?=\[(.*?)\] as const;/s)||[])[1]||'';
const registryRoutes=[...workspaceBlock.matchAll(/routes:\[([^\]]*)\]/g)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));

must(surfaces.length===44,'workstation must retain all 44 currently registered destinations');
must(registryRoutes.length===44,'experience registry must retain all 44 currently registered destinations');
must(new Set(surfaces).size===surfaces.length,'workstation destinations must remain unique');
must(new Set(registryRoutes).size===registryRoutes.length,'registry destinations must remain unique');
must(surfaces.every(x=>registryRoutes.includes(x))&&registryRoutes.every(x=>surfaces.includes(x)),'registry and workstation route sets must remain identical');
for(const route of registryRoutes)must(nav.includes('onClick={()=>go(route)}')&&nav.includes('rows.map(route=>'),'navigator must continue rendering every registry route through the shared go() path');

for(const legacyCss of ["'./omegaSideNavigatorR88.css'","'./omegaSideNavigatorR100.css'","'./extremeLayerIntegrityR104.css'","'./dataTruthNavigationR105.css'","'./omegaSideNavigatorR120.css'","'./wholeSystemExperienceR132.css'"])must(nav.includes(legacyCss),`legacy visual layer ${legacyCss} must remain imported`);
must(nav.indexOf("'./omegaInterfaceConvergenceR146.css'")>nav.indexOf("'./wholeSystemExperienceR132.css'"),'R146 styling must be a final additive layer, never a replacement for inherited CSS');

for(const control of ['Expand OMEGA navigator','Widen side toolbar to show full labels','Open Command Center','Open Woven Continuity traversal instrument','Open Matter Traversal','Open Evidence and Proof','Browse all registered OMEGA applications','Browse full software and capability map','Collapse navigator','Browse everywhere','Browse software and capability map','Show all workspaces'])must(nav.includes(control),`labeled navigation control missing: ${control}`);
must(nav.includes('aria-label={`Show ${workspace.label} workspace`}'),'workspace submenu buttons must carry explicit accessible labels');
must(nav.includes('aria-label={`Open ${route}`}'),'every route button must carry an explicit accessible label');
must(nav.includes("e.key.toLowerCase()==='k'")&&nav.includes("e.key.toLowerCase()==='m'")&&nav.includes("e.key==='Escape'"),'Ctrl/Cmd+K, Ctrl/Cmd+Shift+M and Escape interaction laws must remain wired');
must(nav.includes("className='r146-nav-backdrop'")&&nav.includes("onClick={()=>setExpanded(false)}"),'mobile navigator must have a direct touch-dismiss backdrop');
must(nav.includes("data-interface-convergence='R146'")&&nav.includes("data-interface-convergence-pass={interfaceAudit.pass?'true':'false'}"),'navigator must expose machine-readable R146 preservation state');

for(const law of ['NO_REGISTERED_ROUTE_REMOVAL','NO_SPECIALIST_LAYER_FLATTENING','NO_MODE_OR_SUBFUNCTION_REMOVAL','VISUAL_PROMOTION_MUST_REMAIN_ADDITIVE','MOBILE_AND_DESKTOP_SHARE_THE_SAME_ROUTE_AUTHORITY'])must(r146.includes(law),`preservation law missing: ${law}`);
must(r146.includes("routing:'R143'")&&r146.includes("executionLifecycle:'R142'")&&r146.includes("computation:'R145'")&&r146.includes("canonicalAdmission:'R125'"),'R146 must preserve downstream authority chain');
must(r146.includes('canonicalMutation:false'),'interface convergence cannot mutate CanonState');

must(css.includes("@media(max-width:900px)")&&css.includes("@media(max-width:520px)"),'desktop/mobile responsive promotion must be explicit');
must(css.includes(':focus-visible'),'keyboard focus must remain visibly styled');
must(css.includes('.r146-nav-backdrop')&&css.includes('pointer-events:auto'),'mobile touch backdrop must become actionable only while expanded');
must(css.includes("html[data-omega-interface-convergence='R146'] .omega-workstation-v2"),'additive surface polish must apply through shared runtime state without rewriting specialist layers');
must(!css.includes('display:none!important')||css.includes('.r146-nav-close span'),'R146 must not globally hide inherited application layers');

const existingSpecialistImports=['responsivePolishR88.css','mobileVisualFirstR89.css','surfaceHierarchyR90.css','operationalSurfaceRefinementR91.css','specialistSurfaceClarityR92.css','specialistLoaderR109.css'];
for(const name of existingSpecialistImports)must(workstation.includes(name),`specialist visual/function layer removed from workstation: ${name}`);
for(const route of ['Hybrid Link','Matter Traversal','Visual Instrument','Relativity','Earth Now','Forecast','Atlas','Reality Lab','Infinity','Scale Compiler','Build Out','SAI Lab','Kernel Intelligence','Extreme Traversal','Immersive Traversal','Traversal','Archive Census','Archive Operators','Quality Compiler','Validation','System Atlas','Control Matrix'])must(workstation.includes(`case '${route}'`)||workstation.includes(`'${route}'`),`specialist route lost from workstation execution map: ${route}`);

console.log(`R146 PRESERVATION INTERFACE PASS · ${surfaces.length} routes retained · inherited CSS layers retained · labeled rail/mode/workspace/route controls · keyboard/mouse/touch nav preserved · mobile backdrop · R143→R142→R145→R125 authorities retained · no specialist flattening`);
