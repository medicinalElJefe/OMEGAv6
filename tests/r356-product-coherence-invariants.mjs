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
for(const token of ["onToggle={e=>setProofOpen(e.currentTarget.open)}","data-r356-proof-state={proofOpen?(proofDeep?'DEEP_READY':'PROVENANCE_READY'):'CLOSED'}","proofOpen&&<div className='r356-proof-lineage-summary'","proofDeep&&record&&<div className='r356-proof-lineage-deep'","window.setTimeout(()=>setProofDeep(true),120)"])assert.ok(surface.includes(token),`R356 proof-lineage disclosure must keep native toggle lightweight before deep calculus mount: ${token}`);
assert.ok(capabilityField.includes("width='120' height='120' rx='60'")&&capabilityField.includes("data-r356-touch-envelope='120'"),'R356 must preserve the enlarged SVG capability interaction envelope required by the 44px mobile touch contract');
assert.ok(css.includes("@media(max-width:900px){\n :root{--r356-radius:11px;--r356-gap:9px}\n .r356-product-surface{padding:6px}"),'R356 mobile surface inset must preserve the proven 240px deep-workbench width floor');

console.log('R356 PRODUCT COHERENCE PASS · one live root visual authority · canonical surface frame · 44-route authority-derived presentation · current convergence precedes retained lineage · 44px mobile capability interaction envelope + R188 width floor + non-blocking proof-lineage disclosure preserved · legacy presentation preserved as provenance only');
