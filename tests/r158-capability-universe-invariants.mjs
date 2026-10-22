import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R158 '+m);
const runtime=read('src/capabilityUniverseRuntimeR158.ts');
const visual=read('src/CapabilityUniverseR158.tsx');
const css=read('src/capabilityUniverseR158.css');
const guard=read('src/interactionViewGuardR158.css');
const relativity=read('src/RelativityLab.tsx');
const reflexVisual=read('src/OrganismReflexFabricR158.tsx');
const reflexCss=read('src/organismReflexFabricR158.css');
const reflexRuntime=read('src/system/organismReflexR156.js');
const evolution=read('src/dimensionalRelativityEvolutionR156.ts');
const evolutionVisual=read('src/DimensionalRelativityEvolutionR156.tsx');
const r155=read('src/system/wholeSystemConvergenceR155.js');

for(const token of [
 "R158_SCHEMA='OMEGA_CAPABILITY_UNIVERSE_R158'",
 "compileAllModesTruthFusionR151",
 "compileRelativeCapacityFabricR154",
 "wholeSystemConvergenceManifestR155",
 "organismReflexManifestR156",
 "compileDimensionalRelativityEvolutionR156",
 "241_MODE_LENS_CHANNELS_RETAIN_PROVENANCE_AND_GATE_STATE",
 "15_CAPABILITY_FAMILIES_RETAIN_R155_OWNER_DEPENDENCY_AND_PROOF_STATE",
 "PROMOTED_ORGANISM_REFLEX_STAGES_REMAIN_VISIBLE_AS_CONTROL_FLOW_NOT_EXECUTION_PROOF",
 "CANONICAL_ATLAS_LOD_CHANGES_RENDER_COST_NOT_CANONSTATE",
 "ANIMATION_IS_A_STATE_BOUND_PROJECTION_NOT_EXECUTION_PROOF",
 "PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT",
 "NEUTRAL_ORIENTATION_REMAINS_NEUTRAL_AND_IS_NEVER_COERCED_TO_OUTVERSE",
 "REVISION_LABEL_COLLISION_NEVER_OVERRIDES_CAPABILITY_OWNER_AND_PROOF",
 "R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY"
])must(runtime.includes(token),`runtime missing ${token}`);

must(runtime.includes("export type R158AtlasLod='FRAME_144'|'VOLUME_1728'|'FULL_20736'"),'144/1728/20736 LOD contract missing');
must(runtime.includes("else for(let i=0;i<STATE_COUNT;i++)out.push(i)"),'full resident 20,736 atlas path missing');
must(runtime.includes('orientation=evolution.orientation;'),'R156 signed orientation must remain authoritative');
must(runtime.includes('directionalOrientation=orientation===0?1:orientation;'),'neutral orientation may use deterministic ordering only after semantic orientation is preserved');
must(runtime.includes('return{schema:R158_SCHEMA')&&runtime.includes('orientation,directionalOrientation'),'semantic and display orientations must both remain explicit');
must(!runtime.includes('orientation=evolution.orientation||1'),'neutral semantic orientation may not be coerced to +1');
must(runtime.includes('orientation=options.orientation??compileDimensionalRelativityEvolutionR156(address,4).orientation'),'capacity default orientation must come from R156, not a geometry-sign shortcut');
must(!runtime.includes('geometry?.phi>=0?1:-1'),'capacity orientation must not use the former always-positive phi shortcut');
must(runtime.includes('organismReflex.stages.map')&&runtime.includes('reflexEdges')&&runtime.includes('reflexResidualKinds'),'promoted organism reflex must be data-bound into the R158 universe');
must(runtime.includes("collisionLaw:'REVISION_NUMBER_ALONE_NEVER_DETERMINES_AUTHORITY'"),'R156 label collision must preserve capability-owner authority');
must(runtime.includes("const angle=(index/Math.max(1,capacity.plans.length))*TAU-Math.PI/2"),'capacity nodes must use one correct 2π polar revolution');

for(const token of [
 "type Scene='UNIVERSE'|'MODES'|'FAMILIES'|'CAPACITY'|'SWARM'|'TRUTH'|'NOW'|'DIMENSIONS'|'PROOF'",
 "getContext('webgl2'",
 "FULL_20736",
 "compileAtlasBufferR158",
 "compileCapabilityUniverseR158",
 "compileCapacityLayerR158",
 "requestIdleCallback",
 "'/api/hybrid/status'",
 "hybrid?.nativeExecutionClaimed===true",
 "d?.online===true",
 "PC PROVEN",
 "cloud/browser ≠ PC proof",
 "R158 · LIVING CAPABILITY UNIVERSE",
 "241 provenance-separated mode/lens channels",
 "15 R155 capability families",
 "12¹ → 12¹⁰"
])must(visual.includes(token),`visual missing ${token}`);
must(visual.includes("if(!(e.ctrlKey||e.metaKey))return")&&visual.includes('e.preventDefault()'),'ordinary wheel must remain document scroll while deliberate Ctrl/Cmd+wheel controls visual zoom');

must(css.includes('.capu158-stage canvas')&&css.includes('.capu158-overlay'),'WebGL + inspectable data overlay composition missing');
must(css.includes('@media(max-width:1050px)')&&css.includes('@media(max-width:580px)'),'desktop/mobile containment missing');
must(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced-motion accessibility boundary missing');

for(const token of ['OUTPUT_PLANE_FIRST','CONTROLS_RESERVE_LAYOUT','INSPECTORS_DOCK_OUTSIDE_OUTPUT','--r158-min-operational-surface:224px','.capu158.immersive{position:relative!important','.capu158-stage-label{display:none!important','[data-omega-visual-output='])must(guard.includes(token),`interaction guard missing ${token}`);
must(!guard.includes('.capu158.immersive{position:fixed'),'R158 focus mode may not become a fixed overlay');
must(guard.includes("html[data-omega-nav-present='true'] .omega-workstation-v2 .workstation-main{min-width:var(--r158-min-operational-surface)"),'global navigator must preserve the operational surface floor');

must(relativity.includes("import CapabilityUniverseR158 from './CapabilityUniverseR158'"),'Relativity must import R158 universe');
must(relativity.includes("import OrganismReflexFabricR158 from './OrganismReflexFabricR158'"),'Relativity must expose the promoted organism reflex fabric');
must(relativity.includes("import DimensionalRelativityEvolutionR156 from './DimensionalRelativityEvolutionR156'"),'Relativity must import R156 evolution');
must(relativity.includes("import './interactionViewGuardR158.css'"),'Relativity must load the R158 output-protection layer after its base CSS');
must(relativity.includes("data-omega-view-guard='R158'"),'Relativity root must declare the R158 interaction contract');
must(relativity.includes('<CapabilityUniverseR158 record={record} onNavigate={onNavigate}/>'),'R158 universe must be mounted as the primary Relativity instrument');
must(relativity.includes('<OrganismReflexFabricR158/>'),'promoted organism reflex visual must be mounted');
must(relativity.includes('<DimensionalRelativityEvolutionR156 record={record}/><DimensionalRelativityPanelR24 record={record}/>'),'R156 dimensional projection must extend rather than replace the exact R24 donor instrument');
must(relativity.indexOf('<CapabilityUniverseR158')<relativity.indexOf('<OrganismReflexFabricR158')&&relativity.indexOf('<OrganismReflexFabricR158')<relativity.indexOf("className='rel36-observer'"),'universe/reflex instruments must remain visible before secondary observer controls');
must(relativity.indexOf('<DimensionalRelativityPanelR24')<relativity.indexOf("<CalculusFieldR37 address={record.address} mode='RELATIVITY'"),'R24 authority must remain ahead of optional derived observer rendering');

for(const token of ['organismReflexManifestR156','Observed through admission-candidate reflex cycle','Every specialist return comes back through one bounded organism','R155 owns capability-family authority','Matching revision labels never merge those authorities','R125 remains sole CanonState admission authority'])must(reflexVisual.includes(token),`organism reflex visual missing ${token}`);
must(reflexCss.includes('.oref158-visual')&&reflexCss.includes('min-width:224px')&&reflexCss.includes('@media(max-width:760px)'),'organism reflex visual must preserve protected desktop/mobile output geometry');
for(const token of ['EVERY_SPECIALIST_RESULT_RETURNS_TO_THE_SAME_ORGANISM','RETURNED_IS_NOT_VERIFIED','VERIFIED_IS_NOT_CANONSTATE_ADMITTED','MAX_HOPS_AND_CYCLE_DETECTION_PREVENT_RUNAWAY_REFLEX_LOOPS','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])must(reflexRuntime.includes(token),`promoted organism reflex law missing ${token}`);

for(const token of ['REFERENCE_BIAS_ONLY','VIRTUAL_UNBOUND','R156_DIMENSION_BOUNDARY','contextualAsymmetry','orientation*R156_REFERENCE_KERNEL.a'])must(evolution.includes(token),`R156 truth boundary missing ${token}`);
must(evolutionVisual.includes("data-omega-visual-output='true'")&&evolutionVisual.includes("data-omega-control-plane='reserved'"),'R156 must explicitly separate output and controls');
must(evolutionVisual.includes('symmetry ≠ 1 − asymmetry'),'R156 visual must preserve independent symmetry/asymmetry');
must(r155.includes('INTERFACE_PRESERVATION')&&r155.includes('non-covering navigation'),'R155 interface-preservation owner must remain present');

console.log('R158 CAPABILITY UNIVERSE PASS · WebGL2 resident atlas + 241 provenance channels + 15 R155 families + promoted organism reflex + R154 capacity + causal NOW + swarm + Woven truth membranes + R156 signed dimensional relativity · non-trapping output interaction · desktop/mobile/proof boundaries preserved');
