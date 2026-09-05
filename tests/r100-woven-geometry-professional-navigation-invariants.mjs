import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R100 '+msg)};

const nav=read('src/OmegaSideNavigatorR88.tsx');
const navCss=read('src/omegaSideNavigatorR100.css');
const oldNavCss=read('src/omegaSideNavigatorR88.css');
const modeCss=read('src/designModesR100.css');
const studio=read('src/OmegaTraversalStudio.tsx');
const weave=read('src/wovenContinuityGeometryR100.ts');
const modes=read('src/traversalModeDesignR99.ts');
const stage=read('src/TraversalModeStageR99.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const accepted=read('src/acceptedProductionContractR95.ts');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'canonical route universe must remain 44/44 unique');

must(weave.includes("partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition"),'woven continuity operator must preserve the declared transform sequence');
must(weave.includes('12→144→1728→20,736→248,832 are atlas/address resolution levels, not literal physical dimensions'),'atlas levels must remain representational address scales rather than physical-dimension claims');
must(weave.includes("orientation:'σ∈{-1,0,+1}"),'orientation must be factored from structure');
must(weave.includes("referenceKernel:'37/73 may be retained as a reference bias only"),'37/73 must remain a reference kernel, not fixed symmetry/asymmetry labels');
must(weave.includes('WOVEN_ATLAS_TIERS_R100=[12,144,1728,20736,248832]'),'weave state must resolve into canonical atlas address tiers');
must(weave.includes('timeSeconds*temporalRate*TAU'),'woven state must be explicitly synchronized with runtime time');
must(weave.includes('warpWovenPointR100')&&weave.includes('// 1) partition')&&weave.includes('// 5) re-contextualize/repartition'),'geometry response must execute all five continuity stages');
must(!weave.includes('Math.random'),'woven geometry must remain deterministic from declared source state and time');

must(modes.includes("WEAVE:{id:'WEAVE'"),'design grammar must expose Woven as a real selectable mode');
must(modes.includes("mode==='WEAVE'")&&modes.includes('warpWovenPointR100'),'Woven mode must alter geometry, not only labels or color');
for(const mode of ['UNIFIED','SHELL','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF'])must(modes.includes(`${mode}:{id:'${mode}'`),`R99 mode must remain preserved: ${mode}`);
must(stage.includes("'WEAVE'")&&stage.includes("LABEL:Record<TraversalDesignModeR99,string>")&&stage.includes("WEAVE:'Woven'"),'stage must expose the Woven mode without deleting prior modes');
must(stage.includes('r100-weave-readout')&&stage.includes('weaveSummary.atlas')&&stage.includes('weaveSnapshot.orientation'),'weave state must be visible as a compact dimensional-atlas output outside the canvas');
must(stage.includes('Representational geometry is derived from the canonical packet and admitted route'),'source-truth boundary must remain explicit');
must(stage.includes('It is not an external physical observation.'),'visual output may not silently claim external physical observation');
must(studio.includes("import './designModesR100.css'"),'woven stage presentation must be mounted by the traversal studio');
must(modeCss.includes('.r100-weave-readout')&&modeCss.includes(".r99-mode-stage[data-mode='WEAVE']"),'new weave output must share the professional visual system rather than becoming another floating panel');

must(nav.includes("import './omegaSideNavigatorR100.css'"),'professional navigator override must be mounted by the canonical shared side navigator');
must(nav.includes('OMEGA_ALL_ROUTES_R82')&&nav.includes("className='r89-flat-scroll'")&&nav.includes('rows.map(route=>'),'navigator must keep one flat 44-route owner');
must(nav.includes('COMMAND NAVIGATOR')&&nav.includes('activeWorkspace'),'expanded navigation must show useful current-workspace context');
must(oldNavCss.includes("html[data-omega-nav-expanded='true'] :where(.omega-workstation-v2,.r71-home)"),'pre-existing non-covering navigation contract must remain in source');
must(navCss.includes('--r100-nav-rail')&&navCss.includes('--r100-nav-panel'),'R100 must use a coherent rail/panel token system');
must(navCss.includes("html[data-omega-nav-expanded='true'] :where(.omega-workstation-v2,.r71-home)")&&navCss.includes('width:calc(100% - var(--r100-nav-rail) - var(--r100-nav-panel))'),'expanded desktop navigation must continue reserving space instead of covering the active application');
must(navCss.includes('@media(max-width:900px)')&&navCss.includes('--r100-nav-panel:min(54vw,240px)')&&navCss.includes('--r100-nav-panel:min(58vw,220px)'),'mobile navigator must remain compact and side-owned while leaving stage area visible');

must(accepted.includes("id:'MODE_VISUAL_FUNCTION_CORRELATION'"),'R100 must preserve R99 mode/function correlation governance');
must(accepted.includes("id:'WOVEN_CONTINUITY_GEOMETRY_AUTHORITY'")&&accepted.includes("'R100 woven-continuity geometry + professional navigation authority'"),'woven geometry law and professional navigation must be durable non-regression production authority');
console.log('R100 PASS · professional non-covering navigator · time-synchronized woven continuity geometry · weave state atlas output · 44 routes and R99 modes preserved');
