import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R158 '+m);
const runtime=read('src/capabilityUniverseRuntimeR158.ts');
const visual=read('src/CapabilityUniverseR158.tsx');
const css=read('src/capabilityUniverseR158.css');
const guard=read('src/interactionViewGuardR158.css');
const relativity=read('src/RelativityLab.tsx');
const evolution=read('src/dimensionalRelativityEvolutionR156.ts');
const evolutionVisual=read('src/DimensionalRelativityEvolutionR156.tsx');
const r155=read('src/system/wholeSystemConvergenceR155.js');

for(const token of [
 "R158_SCHEMA='OMEGA_CAPABILITY_UNIVERSE_R158'",
 "compileAllModesTruthFusionR151",
 "compileRelativeCapacityFabricR154",
 "wholeSystemConvergenceManifestR155",
 "compileDimensionalRelativityEvolutionR156",
 "241_MODE_LENS_CHANNELS_RETAIN_PROVENANCE_AND_GATE_STATE",
 "15_CAPABILITY_FAMILIES_RETAIN_R155_OWNER_DEPENDENCY_AND_PROOF_STATE",
 "CANONICAL_ATLAS_LOD_CHANGES_RENDER_COST_NOT_CANONSTATE",
 "ANIMATION_IS_A_STATE_BOUND_PROJECTION_NOT_EXECUTION_PROOF",
 "PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT",
 "NEUTRAL_ORIENTATION_REMAINS_NEUTRAL_AND_IS_NEVER_COERCED_TO_OUTVERSE",
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

must(css.includes('.capu158-stage canvas')&&css.includes('.capu158-overlay'),'WebGL + inspectable data overlay composition missing');
must(css.includes('@media(max-width:1050px)')&&css.includes('@media(max-width:580px)'),'desktop/mobile containment missing');
must(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced-motion accessibility boundary missing');

for(const token of ['OUTPUT_PLANE_FIRST','CONTROLS_RESERVE_LAYOUT','INSPECTORS_DOCK_OUTSIDE_OUTPUT','--r158-min-operational-surface:224px','.capu158.immersive{position:relative!important','.capu158-stage-label{display:none!important','[data-omega-visual-output='])must(guard.includes(token),`interaction guard missing ${token}`);
must(!guard.includes('.capu158.immersive{position:fixed'),'R158 focus mode may not become a fixed overlay');
must(guard.includes("html[data-omega-nav-present='true'] .omega-workstation-v2 .workstation-main{min-width:var(--r158-min-operational-surface)"),'global navigator must preserve the operational surface floor');

must(relativity.includes("import CapabilityUniverseR158 from './CapabilityUniverseR158'"),'Relativity must import R158 universe');
must(relativity.includes("import DimensionalRelativityEvolutionR156 from './DimensionalRelativityEvolutionR156'"),'Relativity must import R156 evolution');
must(relativity.includes("import './interactionViewGuardR158.css'"),'Relativity must load the R158 output-protection layer after its base CSS');
must(relativity.includes("data-omega-view-guard='R158'"),'Relativity root must declare the R158 interaction contract');
must(relativity.includes('<CapabilityUniverseR158 record={record} onNavigate={onNavigate}/>'),'R158 universe must be mounted as the primary Relativity instrument');
must(relativity.includes('<DimensionalRelativityEvolutionR156 record={record}/><DimensionalRelativityPanelR24 record={record}/>'),'R156 must extend rather than replace the exact R24 donor instrument');
must(relativity.indexOf('<CapabilityUniverseR158')<relativity.indexOf("className='rel36-observer'"),'capability universe must be visible before secondary observer controls');
must(relativity.indexOf('<DimensionalRelativityPanelR24')<relativity.indexOf("<CalculusFieldR37 address={record.address} mode='RELATIVITY'"),'R24 authority must remain ahead of optional derived observer rendering');

for(const token of ['REFERENCE_BIAS_ONLY','VIRTUAL_UNBOUND','R156_DIMENSION_BOUNDARY','contextualAsymmetry','orientation*R156_REFERENCE_KERNEL.a'])must(evolution.includes(token),`R156 truth boundary missing ${token}`);
must(evolutionVisual.includes("data-omega-visual-output='true'")&&evolutionVisual.includes("data-omega-control-plane='reserved'"),'R156 must explicitly separate output and controls');
must(evolutionVisual.includes('symmetry ≠ 1 − asymmetry'),'R156 visual must preserve independent symmetry/asymmetry');
must(r155.includes('INTERFACE_PRESERVATION')&&r155.includes('non-covering navigation'),'R155 interface-preservation owner must remain present');

console.log('R158 CAPABILITY UNIVERSE PASS · WebGL2 resident atlas + 241 provenance channels + 15 R155 families + R154 capacity + causal NOW + swarm + Woven truth membranes + R156 signed dimensional relativity · output plane protected from controls/navigation · desktop/mobile/proof boundaries preserved');
