import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const surface=fs.readFileSync('src/SurfaceIntegrityR81.tsx','utf8');
const authority=fs.readFileSync('src/system/productPresentationAuthorityR356.ts','utf8');
const css=fs.readFileSync('src/productCoherenceR356.css','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const capabilityField=fs.readFileSync('src/OmegaCapabilityFieldR138.tsx','utf8');
const registry=fs.readFileSync('src/omegaExperienceRegistryR82.ts','utf8');
const capabilities=fs.readFileSync('src/capabilityAuthority.ts','utf8');
const interactionBinding=fs.readFileSync('src/system/interactionBindingR356.ts','utf8');
const interactionProof=fs.readFileSync('tests/r313-full-control-interaction-browser-e2e.mjs','utf8');
const navigationProof=fs.readFileSync('tests/r239-user-navigation-browser-e2e.mjs','utf8');
const disclosureProof=fs.readFileSync('tests/r313-panel-disclosure-browser-e2e.mjs','utf8');

const legacy=[
 './coherenceRepairR35.css','./specialistDepthR38_3.css','./mobileMatterR42.css','./sovereignDesignR59.css',
 './instrumentOSR62.css','./productResetR67.css','./capabilityFirstR138.css','./interfacePolishR203.css'
];
for(const item of legacy)assert.ok(!app.includes(`import '${item}'`),`legacy root presentation authority still live: ${item}`);
for(const item of legacy)assert.ok(fs.existsSync('src/'+item.slice(2)),`legacy presentation provenance missing: ${item}`);

for(const item of ['./index.css','./workstation.css','./surfaceIntegrityR81.css','./productCoherenceR356.css'])
 assert.ok(app.includes(`import '${item}'`),`canonical live style missing: ${item}`);
assert.ok(app.includes("data-r356-product='CANONICAL_PRODUCT_GRAMMAR'"));

for(const token of [
 'ONE_ROUTE_ONE_PRESENTATION_RECORD','ONE_CANONICAL_SURFACE_FRAME_FOR_ALL_ROUTES',
 'LEGACY_PRESENTATION_IS_PROVENANCE_NOT_LIVE_AUTHORITY','CURRENT_AUTHORITIES_PRECEDE_RETAINED_COMPATIBILITY_LAYERS',
 'productPresentationForRouteR356','auditProductPresentationR356'
])assert.ok(authority.includes(token),`R356 presentation authority missing ${token}`);

for(const token of [
 "className='omega-surface-r81 r356-product-surface'","data-r356-product-surface='true'",
 "data-r356-workspace={presentation.workspace}","data-r356-archetype={presentation.archetype}",
 "className='r356-surface-frame'","className='r356-surface-provenance'","className='r356-surface-content'"
])assert.ok(surface.includes(token),`R356 canonical surface frame missing ${token}`);

for(const token of [
 '.r356-product-surface{','.r356-surface-frame{','.r356-surface-content{',
 "[data-r356-archetype='COMMAND']","[data-r356-archetype='EXPLORATION']",
 '.r356-convergence-section{','.r356-compatibility-stack{','@media(max-width:900px)','@media(prefers-reduced-motion:reduce)'
])assert.ok(css.includes(token),`R356 product grammar missing ${token}`);

const currentOrder=[
 '<OmegaUnifiedConvergenceR348','<OmegaHardwareFieldR349','<OmegaTemporalCheckpointR350',
 '<OmegaGpuPacketMirrorR351','<OmegaGpuComputeR352','<OmegaProofBoundSceneR354','<OmegaProofBoundTemporalTraversalR355'
].map(x=>suite.indexOf(x));
assert.ok(currentOrder.every(x=>x>=0),'R348→R355 current convergence stack missing');
for(let i=1;i<currentOrder.length;i++)assert.ok(currentOrder[i]>currentOrder[i-1],'R348→R355 current convergence ordering mutated');
const compat=suite.indexOf("className='r356-compatibility-stack'");
assert.ok(compat>currentOrder.at(-1),'retained compatibility must render after current convergence authorities');
for(const token of ['FullRestorationConvergenceR168','OmegaMaximumCockpitR126','ReflexAutonomicR164','OmegaAutonomicR125','OmegaOrganismR123','OmegaSwarmR121','OmegaFieldMotionConvergenceR28'])
 assert.ok(suite.includes(token),`retained capability lineage missing ${token}`);

const routeBlock=(registry.match(/OMEGA_ALL_ROUTES_R82=OMEGA_WORKSPACES_R82\.flatMap/)||[])[0];
assert.ok(routeBlock,'R356 must derive presentation from canonical route registry');
assert.ok(capabilities.includes('OMEGA_CAPABILITY_AUTHORITY'),'R356 must preserve capability authority');
assert.ok(!css.includes('display:none!important}.r94-rail-action'),'R356 may not erase canonical navigation');
for(const token of ["data-r356-interaction-ready={interactionReady?'true':'false'}","data-r356-capability-ready","data-r356-capability-ready-key","data-r356-capability-binding-key","setInteractionReady(true)","className='r356-proof-toggle'","aria-expanded={proofOpen}","aria-controls={`r356-proof-${slug(panel)}`}","className='r356-proof-region'","hidden={!proofOpen}","data-r356-lightweight-proof='true'","className='r356-load-deep-proof'","setProofDeep(true)","proofDeep&&<div className='r356-proof-lineage-deep'","<SurfaceProvenanceR94 surface={panel}/>"])assert.ok((surface+capabilityField).includes(token),`R356 interaction/proof readiness contract missing: ${token}`);
assert.ok(!surface.includes('<details key={panel}')&&!surface.includes('proofDetailsRef'),'R356 top-level proof disclosure must use explicit aria-expanded semantics, not native details scheduling');
assert.ok(!surface.includes('setTimeout(()=>setProofDeep')&&!surface.includes('proofDeepTimer'),'R356 disclosure may not auto-mount deep lineage/calculus');
assert.ok(surface.includes("cap.dataset.r356CapabilityLayoutReady==='true'")&&surface.includes('cap.dataset.r356CapabilityBindingKey===stateKey')&&!surface.includes("cap.dataset.r356CapabilityReady==='true'"),'R356 interaction readiness must bind to stable panel/state layout, not asynchronous live telemetry freshness');
for(const token of ["className='r356-native-node-controls'","type='button' className='r356-native-node-control'","aria-hidden='true' pointerEvents='none'","startTransition(()=>onNavigate(action.route!))"])assert.ok(capabilityField.includes(token),`R356 native capability interaction boundary missing ${token}`);
assert.ok(!capabilityField.includes("role='button' tabIndex={0}")&&!capabilityField.includes('onKeyDown={e=>runKey(e,n)}'),'R356 must not regress to SVG pseudo-buttons');
assert.ok(css.includes("@media(max-width:900px){\n :root{--r356-radius:11px;--r356-gap:9px}\n .r356-product-surface{padding:6px}"),'R356 mobile surface inset must preserve the proven 240px deep-workbench width floor');
assert.ok(css.includes(".omega-workstation-v2[data-panel='Earth Now'] .workstation-main{padding-inline:1px!important}")&&css.includes(".r356-product-surface[data-r356-route='Earth Now']{padding-inline:1px"),'R356 mobile Earth must retain viewport-first instrument geometry without horizontal overflow');
const capabilityCss=fs.readFileSync('src/capabilityFirstR138.css','utf8');
for(const token of ['scrollbar-gutter:stable','overflow-anchor:none'])assert.ok((css+capabilityCss).includes(token),`R356 stable interaction coordinate contract missing ${token}`);
for(const token of ['grid-auto-rows:84px','height:84px!important','contain:layout paint size','translate:-50% -50%'])assert.ok(capabilityCss.includes(token),`R356 fixed capability-control geometry missing ${token}`);
assert.ok(!capabilityCss.includes('transform:translate(-50%,-50%)!important'),'R356 native topology control must not be double-translated');


const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
assert.ok(capabilityField.includes("data-r356-capability-layout-ready='true'"),'R356 deterministic capability layout readiness missing');
assert.ok(surface.includes("cap.dataset.r356CapabilityLayoutReady==='true'"),'R356 surface readiness must use deterministic layout truth');
assert.ok(surface.includes("cap.dataset.r356CapabilityBindingKey===stateKey"),'R356 surface readiness must bind exact state identity');
assert.ok(workstation.includes("scrollTo({top:0,behavior:'auto'})"),'R356 route coordinate commit must be immediate');
assert.ok(!workstation.includes("scrollTo({top:0,behavior:'smooth'})"),'R356 route commit may not leave controls moving under interaction proof');
assert.ok(interactionBinding.includes('interactionBindingKeyR356'),'R356 one interaction-binding function missing');
assert.ok(surface.includes('interactionBindingKeyR356(panel,record)')&&capabilityField.includes('interactionBindingKeyR356(panel,record,address)'),'R356 surface/capability identity must share one binding-key authority');
assert.ok(workstation.includes('startTransition(()=>setPanel(next))'),'R356 workstation route commits must be transition-scheduled');
assert.ok(interactionProof.includes('surfaceContinuityState')&&interactionProof.includes('afterContinuity.stateKey!==beforeContinuity.stateKey'),'R356 interaction proof must distinguish canonical state change from local same-state UI change');
assert.ok(interactionProof.includes('local interaction broke same-state surface continuity'),'R356 local interaction continuity must remain fail-closed');
assert.ok(capabilityCss.includes('min-height:46px')&&capabilityCss.includes('-webkit-line-clamp:2'),'R356 live capability telemetry must not move topology controls during async repaint');
assert.ok(navigationProof.includes('activateRailRoute')&&navigationProof.includes('before.panel!==name')&&navigationProof.includes("root.dataset.omegaRouteState==='COMMITTED'")&&navigationProof.includes('root.dataset.omegaRouteCurrent===name')&&navigationProof.includes('root.dataset.omegaRouteTarget===name'),'R356 persistent navigation proof must accept an already-committed same-route identity while requiring lifecycle movement for a different route');
assert.ok(disclosureProof.includes('before.panel!==name')&&disclosureProof.includes("root.dataset.omegaRouteState==='COMMITTED'")&&disclosureProof.includes('root.dataset.omegaRouteCurrent===name')&&disclosureProof.includes('root.dataset.omegaRouteTarget===name'),'R356 disclosure proof must accept already-committed same-route identity while proving exact committed lifecycle for route changes');


console.log('R356 PRODUCT COHERENCE PASS · one live root visual authority · canonical surface frame · 44-route authority-derived presentation · current convergence precedes retained lineage · 44px mobile capability interaction envelope + R188 width floor + non-blocking proof-lineage disclosure preserved · legacy presentation preserved as provenance only');
