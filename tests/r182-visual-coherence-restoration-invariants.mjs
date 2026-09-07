import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileVisualMotionClockR182,calibratedVisualFieldR182,VISUAL_COHERENCE_BOUNDARY} from '../src/visualCoherenceR182.ts';

const visual=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');
const overlay=fs.readFileSync('src/ContinuousFieldOverlayR13.tsx','utf8');
const matter=fs.readFileSync('src/MatterTraversal.tsx','utf8');
const orientation=fs.readFileSync('src/orientationFrameR182.ts','utf8');
const orientationView=fs.readFileSync('src/OrientationFrameR182.tsx','utf8');
const css=fs.readFileSync('src/visualCoherenceR182.css','utf8')+fs.readFileSync('src/orientationFrameR182.css','utf8');

assert.equal(compileVisualMotionClockR182(false,7,.42).mode,'PACKET_LOCKED');
assert.equal(compileVisualMotionClockR182(false,7,.42).routePhase,7.42);
assert.equal(compileVisualMotionClockR182(true,7,.42).mode,'ROUTE_REPLAY');
const field=calibratedVisualFieldR182({stateId:9,autoPing:{dataNext:10},metrics:{continuity:.8,plasticity:.7,contradiction:.2,burden:.1,scar:.25,evidence:.9,decision:'TURN'},math:{normalizedMotionRelativity:.6},phi:{dPhi:.3},predict:{carry:.4}});
for(const key of ['transitionPressure','invariantSupport','residualPressure'])assert.ok(Number.isFinite(field[key]),`R182 ${key} must be finite`);
assert.match(VISUAL_COHERENCE_BOUNDARY,/No ambient constellation drift/);

assert.ok(!visual.includes('now*.000035'),'Visual Instrument must not auto-rotate from wall clock');
assert.ok(!visual.includes('requestAnimationFrame(draw)'),'Visual Instrument base field must redraw from state/observer changes rather than endless ambient RAF');
for(const token of ['ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','COMPILER_LINEAGES','SPINE_VIEWS','LENSES','Admitted next','Previous','Zoom in level','Zoom out level','Yaw','Pitch','OrientationFrameR182View','PACKET LOCKED'])assert.ok(visual.includes(token),`Visual Instrument lost retained function ${token}`);
assert.ok(!overlay.includes('Math.sin(t*8'),'Vector basins must not pulse from ambient clock');
assert.ok(!overlay.includes('now*.00015'),'Continuous overlay must not advance geometry from wall clock');
for(const token of ['compileDomainBands','compileRouteFlow','compileVectorCarryR113','INGRESS / EGRESS / BLOCKED / RESIDUE','field.routeNext[address]'])assert.ok(overlay.includes(token),`Continuous overlay lost semantic layer ${token}`);

assert.ok(matter.includes("[playing,setPlaying]=useState(false)"),'Matter Traversal must be stable by default');
assert.ok(matter.includes("[drawer,setDrawer]=useState(false)"),'Matter inspector must use progressive disclosure by default');
assert.ok(matter.includes("uni('uTime',motionTime)"),'Matter shader must use route/replay phase');
assert.ok(!/now\*\.000015|Math\.sin\(now\*\.005\)|now\*\.001/.test(matter),'Matter geometry must not use wall-clock animation');
for(const token of ["'MATTER','CORRIDOR','PROOF','TOPOLOGY','REPLAY'","'HOST_FOLLOW','SHELL_FOLLOW','PROOF_FOLLOW','FREE'","'NODE','SHELL','HEATMAP','HOST','PROOF'",'downloadReplay','downloadSupportBundle','proofPlate','bookmark','sonify','Live Immersive','Extreme Traversal','Commit'])assert.ok(matter.includes(token),`Matter Traversal lost retained function ${token}`);

for(const token of ['sourceState','targetState','tangent','turn','sigma','phaseDelta','observer','referenceAxis','OBSERVER_ONLY'])assert.ok(orientation.includes(token),`Orientation contract missing ${token}`);
for(const token of ['Forward tangent','Signed turn','Motion / v / a','Observer camera','+X'])assert.ok(orientationView.includes(token),`Orientation view missing ${token}`);
assert.ok(css.includes('@media(max-width:600px)'),'R182 mobile containment missing');
console.log('R182 VISUAL COHERENCE RESTORATION PASS · packet-locked motion, persistent orientation, retained functions, progressive disclosure');
