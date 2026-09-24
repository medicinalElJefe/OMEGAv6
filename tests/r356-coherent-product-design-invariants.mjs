import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const frame=read('src/OmegaProductFrameR356.tsx');
const css=read('src/omegaProductFrameR356.css');
const suite=read('src/OmegaSpecialistSuite.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const app=read('src/App.tsx');
const navigation=read('src/navigationRegistry.ts');
const capability=read('src/capabilityAuthority.ts');
const r355=read('tests/r355-monotonic-successor-invariants.mjs');
const disclosure=read('tests/r313-panel-disclosure-browser-e2e.mjs');
const membrane=read('src/CanonicalMembraneR95.tsx');
const membraneCss=read('src/canonicalMembraneR95.css');
const calculusField=read('src/CalculusFieldR37.tsx');
const calculusFieldCss=read('src/calculusFieldR37.css');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const capabilityBlock=(capability.match(/OMEGA_CAPABILITY_AUTHORITY:readonly CapabilityContract\[]=\[(.*?)\] as const;/s)||[])[1]||'';
const capabilities=[...capabilityBlock.matchAll(/\{name:'([^']+)'/g)].map(x=>x[1]);
assert.equal(surfaces.length,44,'R356 must preserve all 44 R355 routes');
assert.equal(new Set(surfaces).size,44);
assert.deepEqual(new Set(capabilities),new Set(surfaces),'R356 route/capability authority must remain 44/44 identical');

for(const token of[
 "import OmegaProductFrameR356 from './OmegaProductFrameR356'",
 "data-product-design='R356'",
 '<OmegaProductFrameR356',
 '<SurfaceIntegrityR81 panel={panel}',
 '<ResponsiveRuntimeShell uiMode={uiMode}'
])assert.ok(workstation.includes(token),`R356 workstation integration missing ${token}`);
const ready=workstation.slice(workstation.indexOf("const reality=effectiveCapabilityReality(panel)"));
assert.ok(!ready.includes("className='workstation-topbar'"),'R356 ready-state path must not retain the old competing workstation topbar');
assert.ok(ready.includes('workflowSlot=workflow?'),'R356 workflow strip must be contextual rather than free-floating');

for(const token of[
 "className='r356-product-frame'",
 "className='r356-route-header'",
 "className='r356-state-ribbon'",
 "className='r356-workspace-grid'",
 "className='r356-primary-stage'",
 "className='r356-context-rail'",
 'One route authority · one canonical state'
])assert.ok(frame.includes(token),`R356 product frame missing ${token}`);

for(const token of[
 '.r356-product-frame{',
 '.r356-route-header{',
 '.r356-workspace-grid{',
 '.r356-context-rail{',
 '.r356-canonical-nav',
 '.r71-home',
 '.r356-capability-context',
 '.r356-module-group'
])assert.ok(css.includes(token),`R356 visual grammar missing ${token}`);
assert.ok(app.includes("import './omegaProductFrameR356.css'"),'R356 must be the final global product visual authority');
assert.ok(nav.includes('r356-canonical-nav')&&nav.includes("data-product-design='R356'"),'global navigator must participate in R356 product design');
for(const token of[".r356-workspace-grid{display:flex!important;flex-direction:column!important;align-items:stretch!important","inline-size:100%!important;max-inline-size:100%!important",".r356-primary-stage :where(.r36-living-surface,.r43-workspace-stage,.visual-instrument-app,.special-app,.panel)"])assert.ok(css.includes(token),`R356 mobile width ownership missing ${token}`);

for(const token of[
 "className='r356-capability-context'",
 "className='r138-capability-first r356-specialist-stack'",
 "className='r356-convergence'",
 'CURRENT CONVERGENCE','TEMPORAL + COMPUTE','GOVERNANCE + ADVANCEMENT','RESTORED EXECUTION','HISTORICAL CONTINUITY',
 '<OmegaUnifiedConvergenceR348 record={record} status={status}/>',
 '<OmegaHardwareFieldR349 address={address}/>',
 '<OmegaTemporalCheckpointR350/>','<OmegaGpuPacketMirrorR351/>','<OmegaGpuComputeR352/>','<OmegaProofBoundSceneR354/>','<OmegaProofBoundTemporalTraversalR355/>',
 '<FullRestorationConvergenceR168 record={record} address={address} onNavigate={onNavigate}/>',
 '<OmegaMaximumCockpitR126 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>',
 '<ReflexAutonomicR164/>','<OmegaAutonomicR125/>','<OmegaOrganismR123/>','<OmegaSwarmR121'
])assert.ok(suite.includes(token),`R356 specialist composition lost ${token}`);
assert.ok(!suite.includes("className='r121-legacy-convergence' open"),'R356 historical compatibility bodies must no longer auto-open over current convergence');
assert.ok(r355.includes('44/44 routes + capability authorities preserved'),'R356 must inherit the R355 monotonic successor floor');
const disclosureScroll=disclosure.indexOf("scrollLocatorForContinuity(summary)");
const disclosureStable=disclosure.indexOf("waitForStableLocator(page,summary");
const disclosureClick=disclosure.indexOf("summary.click({timeout:10000})");
assert.ok(disclosure.includes("el.scrollIntoView({block:'center',inline:'nearest'})"),'R356 disclosure proof must use non-actuating DOM scroll before geometry proof');
assert.ok(!disclosure.includes('summary.scrollIntoViewIfNeeded()'),'R356 disclosure proof may not require Playwright actionability before geometry continuity is established');
assert.ok(disclosureScroll>=0&&disclosureStable>disclosureScroll&&disclosureClick>disclosureStable,'R356 disclosure continuity repair must order scroll → stable geometry → real click');
assert.ok(!disclosure.includes('control.scrollIntoViewIfNeeded()'),'R356 aria-expanded disclosure proof may not require Playwright actionability before geometry continuity');
assert.ok(disclosure.includes('scrollLocatorForContinuity(control)')&&disclosure.includes('waitForStableLocator(page,control'),'R356 aria-expanded disclosure controls must follow the same geometry-first pointer law');
const membraneDraw=(membrane.match(/const draw=\(time=0\)=>\{([\s\S]*?)if\(!reduced\)raf=requestAnimationFrame\(draw\)/)||[])[1]||'';
assert.ok(membraneDraw&&!membraneDraw.includes('resize()'),'R356 membrane animation may paint every frame but may not rewrite canvas resolution/layout every frame');
assert.ok(membrane.includes("const observer=new ResizeObserver(()=>{resize();if(reduced)draw(performance.now())})"),'R356 membrane resolution writes must remain bound to actual resize observation');
assert.ok(membraneCss.includes(".r95-membrane-stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;min-height:0"),'R356 canvas backing resolution may not participate in membrane document-flow geometry');
assert.ok(membraneCss.includes(".r95-membrane-stage{position:relative;min-height:620px"),'R356 membrane stage must remain the stable layout owner');
assert.ok(css.includes(".omega-workstation-v2[data-product-design='R356'][data-panel='Visual Instrument'] .r356-primary-stage .r36-living-surface{overflow:visible!important}"),'R356 Visual Instrument outer shell must not become a hidden vertical scroll membrane');
assert.ok(css.includes(".r356-workspace-grid>.r356-primary-stage{grid-column:1!important;grid-row:1!important;justify-self:stretch!important;inline-size:100%!important;max-inline-size:100%!important}"),'R356 desktop primary instrument must explicitly own flexible grid track 1');
assert.ok(css.includes(".r356-workspace-grid>.r356-context-rail{grid-column:2!important;grid-row:1!important;justify-self:stretch!important;inline-size:100%!important;max-inline-size:100%!important}"),'R356 desktop context rail must explicitly own bounded grid track 2');
const calculusDraw=(calculusField.match(/const draw=\(now:number\)=>\{([\s\S]*?)raf=requestAnimationFrame\(draw\)\}/)||[])[1]||'';
assert.ok(calculusDraw&&!calculusDraw.includes('applyCanvasResolutionR119'),'R356 calculus animation may paint every frame but may not rewrite canvas resolution/layout every frame');
assert.ok(calculusField.includes("const observer=new ResizeObserver(()=>{resize();if(reduce)draw(performance.now())})"),'R356 calculus backing resolution must be bound to actual stage resize observation');
assert.ok(calculusFieldCss.includes(".cfr37-stage{position:relative;min-height:500px")&&calculusFieldCss.includes("overflow:hidden"),'R356 calculus stage must remain the stable layout owner');
assert.ok(calculusFieldCss.includes(".calculus-field-r37 canvas{position:absolute;inset:0;display:block;width:100%;height:100%;min-height:0"),'R356 calculus canvas backing size may not participate in document-flow geometry');

assert.ok(navigation.includes("export const OMEGA_NAVIGATION")&&navigation.includes("OMEGA_NAV_GROUPS"),'R356 must preserve the existing canonical navigation registry');

console.log('R356 COHERENT PRODUCT DESIGN PASS · 44/44 route+capability authority preserved · one ready-state product frame owns header/state/context geometry · Home+navigator share the same visual grammar · capability topology is contextual · Convergence is grouped by current/compute/governance/restored/history without deleting inherited engines');
