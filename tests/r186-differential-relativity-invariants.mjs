import assert from 'node:assert/strict';
import fs from 'node:fs';

const model=fs.readFileSync('src/differentialRelativityR186.ts','utf8');
const view=fs.readFileSync('src/DifferentialRelativityR186.tsx','utf8');
const cache=fs.readFileSync('src/analysisCacheR189.ts','utf8');
const instrument=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');

for(const token of ["type Axis='D'|'P'|'R'|'L'",'gradient:number','curvature:number','mixed:MixedDerivativeR186[]','hessian:number[][]','principal:PrincipalDirectionR186[]','jacobiEigen(','shortestDelta(','ALIGNED_DESCENT','CROSS_GRADIENT','ASCENDING','STATIC','sharedCache?:AnalysisCacheR189','cache=sharedCache||createAnalysisCacheR189(field)'])assert.ok(model.includes(token),`R186 differential law missing ${token}`);
assert.ok(cache.includes("import {INTERFERENCE_CALIBRATION_R184} from './interferenceResolutionR184'"),'R186 must inherit the exact R184 residual calibration through R189');
for(const token of ["plus.residual-minus.residual)/2","plus.residual-2*source.residual+minus.residual","(pp-pm-mp+mm)/4","Math.hypot(...axes.map(x=>x.gradient))"] )assert.ok(model.includes(token),`R186 finite-difference formula missing ${token}`);
for(const token of ['BASIN','RIDGE','SADDLE','FLAT/TRANSITION'])assert.ok(model.includes(token),`R186 topology class missing ${token}`);
assert.ok(model.includes('discrete atlas coordinates'),'R186 must state D/P/R/L are atlas coordinates');
assert.ok(model.includes('not physical spatial derivatives'),'R186 physical-claim boundary missing');
assert.ok(model.includes('R189 may cache those exact state values but cannot alter them'),'R186/R189 memoization-only boundary missing');
assert.ok(!/Math\.random|Date\.now|requestAnimationFrame/.test(model),'R186 computation must be deterministic and non-wall-clock');
assert.ok(!/canonicalMutation\s*:\s*true|CanonState\s*=/.test(model),'R186 must not mutate CanonState');

for(const token of ['Gradient magnitude','Steepest local descent','Principal curvature','Inspect mixed derivatives and Hessian','route alignment','onSelectAddress(x.minus)','onSelectAddress(x.plus)'])assert.ok(view.includes(token),`R186 operator view missing ${token}`);
assert.ok(view.includes('<details'),'R186 matrix details must use progressive disclosure');
for(const token of ['compileDifferentialRelativityR186','DifferentialRelativityR186','reconstructMultipathR185','MultipathReconstructionR185','resolveInterferenceR184','InterferenceResolutionR184'])assert.ok(instrument.includes(token),`Visual Instrument missing R184-R186 chain ${token}`);
for(const retained of ['PC-LINEAGE DEPTH CAMERA','ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','VisualAtlasR183','OrientationFrameR182View','Admitted next','Previous','Yaw','Pitch'])assert.ok(instrument.includes(retained),`R186 degraded retained Visual Instrument function ${retained}`);
console.log('R186 DIFFERENTIAL RELATIVITY PASS · exact R184 residual reused through R189 + discrete gradient + Hessian + principal curvature + route alignment + progressive disclosure + no Canon mutation');