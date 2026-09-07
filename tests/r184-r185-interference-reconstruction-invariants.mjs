import assert from 'node:assert/strict';
import fs from 'node:fs';

const r184=fs.readFileSync('src/interferenceResolutionR184.ts','utf8');
const r184view=fs.readFileSync('src/InterferenceResolutionR184.tsx','utf8');
const r185=fs.readFileSync('src/multipathReconstructionR185.ts','utf8');
const r185view=fs.readFileSync('src/MultipathReconstructionR185.tsx','utf8');
const instrument=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');

for(const token of ['continuityProtective:0.865606','burdenPressure:0.894663','contradictionPressure:0.82','scarPressure:0.58','phasePressure:0.54','accelerationPressure:0.42','evidenceProtection:0.35'])assert.ok(r184.includes(token),`R184 calibration missing ${token}`);
for(const token of ["'ADMITTED_NEXT'","'D+'","'D-'","'P+'","'P-'","'R+'","'R-'","'L+'","'L-'",'visited=new Set','minImprovement=.004','canonicalMutation:false','Internal coherence is not empirical certainty'])assert.ok(r184.includes(token),`R184 bounded actual-state law missing ${token}`);
assert.ok(!/Math\.random|Date\.now|requestAnimationFrame/.test(r184),'R184 resolution must be deterministic and non-wall-clock');
for(const token of ['Baseline interference decomposition','Rejected candidates are retained','canonicalMutation=false','onSelectAddress(c.address)'])assert.ok(r184view.includes(token),`R184 operator audit surface missing ${token}`);

assert.ok(r185.includes("INTERFERENCE_CALIBRATION_R184"),'R185 must reuse R184 calibration authority');
for(const token of ['beamWidth=12','maxDepth=8','Math.min(24','Math.min(12','temporaryWorsening>.30','evidenceFloor<.05','reverseReachable','motionConsistency','scarCost','paretoFrontier','dominates(','localGreedyComparator','actual addressable OMEGA states only'])assert.ok(r185.includes(token),`R185 deep reconstruction law missing ${token}`);
for(const token of ['ADMITTED_NEXT','D+','D-','P+','P-','R+','R-','L+','L-'])assert.ok(r185.includes(token),`R185 actual-state relation missing ${token}`);
assert.ok(!/Math\.random|Date\.now|requestAnimationFrame/.test(r185),'R185 multipath search must be deterministic and non-wall-clock');
assert.ok(!/CanonState\s*=|canonicalMutation\s*:\s*true/.test(r185),'R185 must not mutate CanonState');
assert.ok(r185.includes('temporary local worsening'),'R185 must explicitly account for bounded non-greedy excursions');
assert.ok(r185.includes('External claims still require independent evidence'),'R185 empirical truth boundary missing');

for(const token of ['Competing lawful explanations','Pareto paths','Best current reconstruction','Inspect competing paths, rejected tradeoffs and Pareto frontier','onSelectAddress(s.address)'])assert.ok(r185view.includes(token),`R185 progressive operator surface missing ${token}`);
assert.ok(r185view.includes('<details'),'R185 full frontier must use progressive disclosure');
for(const token of ["reconstructMultipathR185","MultipathReconstructionR185","resolveInterferenceR184","InterferenceResolutionR184"])assert.ok(instrument.includes(token),`Visual Instrument missing reconstruction integration ${token}`);
for(const retained of ['PC-LINEAGE DEPTH CAMERA','ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','VisualAtlasR183','OrientationFrameR182View','Admitted next','Previous','Yaw','Pitch'])assert.ok(instrument.includes(retained),`R185 degraded retained Visual Instrument function ${retained}`);
console.log('R184/R185 INTERFERENCE RECONSTRUCTION PASS · actual-state local descent + bounded multipath Pareto reconstruction + reversible audit + no Canon mutation');
