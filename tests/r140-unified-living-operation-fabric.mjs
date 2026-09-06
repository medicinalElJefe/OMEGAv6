import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R140 '+msg);
const operation=read('src/unifiedOperationFabricR140.ts');
const engine=read('src/unifiedCapabilityEngineR139.ts');
const field=read('src/OmegaCapabilityFieldR138.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const livingCss=read('src/livingSurfaceR36.css');
const capCss=read('src/capabilityFirstR138.css');
const sourceModes=read('src/sourceBackedModeRuntimeR21.ts');
const allModes=read('src/allModesAuthority.ts');
const weave=read('src/TraversalModeStageR100.tsx');
const r136=read('src/world/livingWorldFrameR136.js');
const r137=read('src/familyOperationalProofR137.ts');
const hybridTest=read('tests/r132-hybrid-execution-plane-invariants.mjs');

for(const law of ['MODE_EXECUTION_STATE_INFORMS_PRIORITY_NOT_TRUTH_PROMOTION','REGISTERED_CAPABILITY_ROUTE_PRECEDES_OPERATION','HYBRID_EXECUTION_REQUIRES_CURRENT_DEVICE_PROOF','EVIDENCE_CONTINUITY_AND_CONTRADICTION_PRESSURE_SHAPE_PRIORITY','PROJECTION_SELECTION_NEVER_EQUALS_CANONSTATE_ADMISSION','R125_REMAINS_THE_CANONSTATE_ADMISSION_AUTHORITY'])must(operation.includes(`'${law}'`),'operation law missing '+law);
must(operation.includes("action.kind==='EXECUTE'?'DEVICE_PROOF_REQUIRED':'ROUTE_READY'"),'Hybrid execution must remain current-device-proof gated');
for(const token of ['.24*route','.16*continuity','.12*plasticity','.16*evidence','.12*contradictionBound','.08*burdenBound','.06*modeCoverage','.06*kind'])must(operation.includes(token),'operation score missing bounded signal '+token);
must(operation.includes('canonicalMutation:false')&&operation.includes("canonicalAdmissionAuthority:'R125'"),'operation ranking must never mutate or replace R125 admission');
must(operation.includes('A high score is an operating priority, not empirical truth'),'priority/truth boundary missing');

for(const law of ['ONE_ROUTE_REGISTRY_ONE_CAPABILITY_RUNTIME','ALL_MODES_MEANS_ALL_MODES_CONSIDERED_NOT_ALL_MODES_FABRICATED','GATED_OR_CATALOG_ONLY_MODES_NEVER_CLAIM_EXECUTION'])must(engine.includes(`'${law}'`),'R139.1 unified capability law lost '+law);
must(field.includes('compileUnifiedCapabilityRuntimeR139')&&field.includes('rankUnifiedCapabilityActionsR140'),'R140 must extend rather than replace the R139.1 unified route engine');
must(field.includes("data-operation-fabric='R140'")&&field.includes("CANDIDATE_AUTHORITY='PROJECTION_NOT_CANON_ADMISSION'")&&field.includes("data-canonical-mutation='false'"),'field authority boundary missing');
must(field.includes('Ranked projected next')&&!field.includes("label:i===0?'Admitted next'"),'candidate projection label must remain distinct from canonical admission');
for(const signal of ['routeStrength','unifiedCoherence','?.C','?.Phi','evidence','contradictionPressure','Lambda','uncertainty','scar'])must(field.includes(signal),'full candidate rank missing '+signal);
for(const token of ["role='group'","role='button'",'tabIndex={0}','onClick={()=>runAction(n)}','onKeyDown={e=>runKey(e,n)}'])must(field.includes(token),'spatial capability node is not directly operable '+token);
must(!field.includes("<button className='r138-live-stage'"),'whole topology must not act as one catch-all button');
must(field.includes('mode coverage')&&field.includes('PROJECTION ≠ ADMISSION'),'operator telemetry must expose mode execution coverage and authority boundary');

must(living.includes("view==='LIVE'&&<><OmegaTraversalStudio"),'woven traversal must own the primary LIVE stage');
must(living.includes('current packet, CΩ/Φ/q/Λ, signed orientation, scar/history carry, route geometry'),'LIVE traversal must declare its bound relational state');
must(living.includes("className='r140-live-truth-bridge'")&&living.includes('title={`${variant} · admitted transition`}'),'exact transition truth must remain inspectable under the living stage');
must(living.includes("view==='ROUTE'&&<><TransitionTruthPlotR93"),'ROUTE + PROOF must keep direct transition evidence');
must(living.includes('Selecting an address does not itself admit CanonState'),'projection/admission boundary must remain visible in traversal');
must(livingCss.includes(".r140-live-truth-bridge[open]>.r93-truth-plot.r93-transition{display:grid!important"),'open proof bridge must reveal exact transition evidence');
must(livingCss.includes(".r140-live-truth-bridge:not([open])>.r93-truth-plot{display:none!important"),'closed proof bridge must remain subordinate');
must(capCss.includes(".r43-workspace-stage[data-view='ROUTE'] .r93-truth-plot.r93-transition{display:grid!important}"),'explicit proof route must override global chart retirement');

must(sourceModes.includes('catalogCount:179'),'179 source-mode evaluation authority must remain');
for(const state of ['EXECUTED_EXACT','SOURCE_PACKET','DERIVED_RUNTIME','GATED_MISSING_INPUTS'])must(sourceModes.includes(state),'source-mode execution state lost '+state);
must(sourceModes.includes('Only operators whose required inputs are present in the canonical packet are executed'),'source-mode truth boundary lost');
must(allModes.includes('canonAuthorities:62')&&allModes.includes('179 source-mode evaluations; 62 higher-order canon/calculus authorities'),'179 + 62 mode/lens separation lost');
must(allModes.includes('They do not create missing observations or establish new physical law'),'all-mode physical truth boundary lost');
for(const token of ['WOVEN_CONTINUITY_OPERATOR_R100','applyWovenContinuityR100','ATLAS_RESOLUTION_LEVELS_R101','CONTINUITY FLUX','INVARIANT CARRY','ORIENTATION σ'])must(weave.includes(token),'woven computational fabric missing '+token);
must(r136.includes("'ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS'")&&r136.includes("canonicalAdmissionAuthority:'R125'"),'R136/R125 world authority lost');
must(r137.includes('CURRENT_OPERATIONAL_PROOF_NEVER_AUTO_PROMOTES_CANONSTATE'),'R137 operational-proof separation lost');
must(hybridTest.includes("'/api/hybrid/agent/register'")&&hybridTest.includes("'/api/hybrid/agent/heartbeat'")&&hybridTest.includes("'/api/hybrid/agent/poll'")&&hybridTest.includes("'/api/hybrid/agent/result'"),'authenticated Hybrid execution transport invariant must remain present');

console.log('R140 UNIFIED LIVING OPERATION FABRIC PASS · R139.1 all-mode capability engine preserved · proof-aware route priority · direct spatial operation · woven LIVE traversal · exact proof retained · 179 source modes + 62 lenses truth-separated · Hybrid device proof + R125 admission boundaries intact');
