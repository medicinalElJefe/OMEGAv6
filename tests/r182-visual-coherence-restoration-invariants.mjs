import assert from 'node:assert/strict';
import fs from 'node:fs';

const authority=fs.readFileSync('src/visualCoherenceR182.ts','utf8');
const visual=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');
const overlay=fs.readFileSync('src/ContinuousFieldOverlayR13.tsx','utf8');
const matter=fs.readFileSync('src/MatterTraversal.tsx','utf8');
const motion=fs.readFileSync('src/motionDomainRuntime.ts','utf8');
const traversal=fs.readFileSync('src/TraversalModeStageR100.tsx','utf8');
const orientation=fs.readFileSync('src/orientationFrameR182.ts','utf8');
const orientationView=fs.readFileSync('src/OrientationFrameR182.tsx','utf8');
const css=fs.readFileSync('src/visualCoherenceR182.css','utf8')+fs.readFileSync('src/orientationFrameR182.css','utf8');

for(const token of ["VISUAL_MOTION_DEFAULT='PACKET_LOCKED'","mode:playing?'ROUTE_REPLAY':'PACKET_LOCKED'","source:playing?'GOVERNED_ROUTE_PROGRESS':'CANONICAL_PACKET'",'transitionPressure','invariantSupport','residualPressure','No ambient constellation drift'])assert.ok(authority.includes(token),`R182 visual authority missing ${token}`);

assert.ok(!visual.includes('now*.000035'),'Visual Instrument must not auto-rotate from wall clock');
assert.ok(!visual.includes('requestAnimationFrame(draw)'),'Visual Instrument base field must redraw from state/observer changes rather than endless ambient RAF');
for(const token of ['PC-LINEAGE DEPTH CAMERA','ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','COMPILER_LINEAGES','SPINE_VIEWS','LENSES','Admitted next','Previous','Zoom in level','Zoom out level','Camera −','Camera +','Yaw','Pitch','OrientationFrameR182View','PACKET LOCKED'])assert.ok(visual.includes(token),`Visual Instrument lost retained function ${token}`);
assert.ok(!overlay.includes('Math.sin(t*8'),'Vector basins must not pulse from ambient clock');
assert.ok(!overlay.includes('now*.00015'),'Continuous overlay must not advance geometry from wall clock');
for(const token of ['compileDomainBands','compileRouteFlow','compileVectorCarryR113','INGRESS / EGRESS / BLOCKED / RESIDUE','field.routeNext[address]'])assert.ok(overlay.includes(token),`Continuous overlay lost semantic layer ${token}`);

assert.ok(matter.includes("[playing,setPlaying]=useState(false)"),'Matter Traversal must be stable by default');
assert.ok(matter.includes("[drawer,setDrawer]=useState(false)"),'Matter inspector must use progressive disclosure by default');
assert.ok(matter.includes("uni('uTime',motionTime)"),'Matter shader must use route/replay phase');
assert.ok(!/now\*\.000015|Math\.sin\(now\*\.005\)|now\*\.001/.test(matter),'Matter geometry must not use wall-clock animation');
for(const token of ["'MATTER','CORRIDOR','PROOF','TOPOLOGY','REPLAY'","'HOST_FOLLOW','SHELL_FOLLOW','PROOF_FOLLOW','FREE'","'NODE','SHELL','HEATMAP','HOST','PROOF'",'downloadReplay','downloadSupportBundle','proofPlate','bookmark','sonify','Live Immersive','Extreme Traversal','Commit'])assert.ok(matter.includes(token),`Matter Traversal lost retained function ${token}`);

// R310: the eight scale buttons are reference lenses over one packet, not eight fake physical simulations.
for(const token of ['OMEGA_MATTER_SCALE_AUTHORITY_R310','FORMAL_REFERENCE_ONLY','sharedCanonicalPacket:true','physicalMeasurement:false','externalTelemetry:false','scaleCount:8','matterScaleAuditR310','FORMAL_MODEL_FRAME'])assert.ok(motion.includes(token),`R310 scale authority missing ${token}`);
for(const id of ['NUCLEAR','ATOMIC','CHEMICAL','BIOLOGICAL','HUMAN','PLANETARY','STELLAR','GALACTIC'])assert.ok(motion.includes(`id:'${id}'`),`R310 scale registry lost ${id}`);
for(const law of ['shell-bound radial contraction + scar-phase pulse','shell-indexed angular relation + evidence-weighted height','anisotropic bond-axis stretch + plasticity displacement','coupled continuity/plasticity deformation with bounded phase motion','embodied anisotropy weighted by continuity and plasticity','slow angular reference rotation + continuity-weighted flattening','slow angular relation + plasticity-weighted radial expansion','logarithmic-spiral reference transform + evidence-weighted flattening'])assert.ok(motion.includes(law),`R310 distinct scale scene law missing ${law}`);
assert.ok(motion.includes('sharedCanonicalPacket:true'),'R310 scale identity carry must be explicit');
assert.ok(motion.includes('does not assert SI displacement')&&motion.includes('literal physical reconstruction'),'R310 Matter scale boundary must reject false physical reconstruction');
assert.ok(matter.includes('same canonical packet · different physical-reference context'),'Matter UI must retain one-packet scale explanation');
assert.ok(matter.includes('motionPacket.basis'),'Matter readout must expose the R310 scale-specific truth basis');
assert.ok(css.includes("FORMAL MODEL FRAME · SAME CANONICAL PACKET · NOT TELEMETRY"),'R310 Matter readout must visibly disclose formal-model/not-telemetry authority');
assert.ok(css.includes('.matter-traversal .motion-readout>small'),'R310 scale-specific basis text must be promoted to readable visual hierarchy');

assert.ok(traversal.includes("const[animated,setAnimated]=useState(false);"),'Woven Traversal must be stable by default');
for(const token of ["setAnimated(v=>!v)","animated?'Pause motion':'Animate'","<label>TIME<input type='range'",'timeScale','ORIENTATION σ','visualFieldPoint(','warpTraversalPointR99(','applyWovenContinuityR100(','compileSourceTraversal(address,routeDepth)',"projectionPoint(step.address,'MANDALA',1000)"])assert.ok(traversal.includes(token),`Traversal mode lost retained function ${token}`);

for(const token of ['sourceState','targetState','tangent','turn','sigma','phaseDelta','observer','referenceAxis','OBSERVER_ONLY'])assert.ok(orientation.includes(token),`Orientation contract missing ${token}`);
for(const token of ['Forward tangent','Signed turn','Motion / v / a','Observer camera','+X'])assert.ok(orientationView.includes(token),`Orientation view missing ${token}`);
assert.ok(css.includes('@media(max-width:600px)'),'R182 mobile containment missing');
console.log('R310/R182 VISUAL COHERENCE PASS · packet-locked motion · eight distinct formal Matter scale lenses · visible model/not-telemetry disclosure · no physical reconstruction overclaim · persistent orientation · retained functions · progressive disclosure');