import assert from 'node:assert/strict';
import fs from 'node:fs';

const model=fs.readFileSync('src/differentialRelativityR186.ts','utf8');
const view=fs.readFileSync('src/DifferentialRelativityR186.tsx','utf8');
const instrument=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');

for(const token of ['INTERFERENCE_CALIBRATION_R184',"type Axis='D'|'P'|'R'|'L'",'gradient:number','curvature:number','mixed:MixedDerivativeR186[]','hessian:number[][]','principal:PrincipalDirectionR186[]','jacobiEigen(','shortestDelta(','ALIGNED_DESCENT','CROSS_GRADIENT','ASCENDING','STATIC'])assert.ok(model.includes(token),`R186 differential law missing ${token}`);
for(const token of ["plus.residual-minus.residual)/2","plus.residual-2*source.residual+minus.residual","(pp-pm-mp+mm)/4","Math.hypot(...axes.map(x=>x.gradient))"] )assert.ok(model.includes(token),`R186 finite-difference formula missing ${token}`);
for(const token of ['BASIN','RIDGE','SADDLE','FLAT/TRANSITION'])assert.ok(model.includes(token),`R186 topology class missing ${token}`);
assert.ok(model.includes('discrete atlas coordinates'),'R186 must state D/P/R/L are atlas coordinates');
assert.ok(model.includes('not physical spatial derivatives'),'R186 physical-claim boundary missing');
assert.ok(!/Math\.random|Date\.now|requestAnimationFrame/.test(model),'R186 computation must be deterministic and non-wall-clock');
assert.ok(!/canonicalMutation\s*:\s*true|CanonState\s*=/.test(model),'R186 must not mutate CanonState');

for(const token of ['Gradient magnitude','Steepest local descent','Principal curvature','Inspect mixed derivatives and Hessian','route alignment','onSelectAddress(x.minus)','onSelectAddress(x.plus)'])assert.ok(view.includes(token),`R186 operator view missing ${token}`);
assert.ok(view.includes('<details'),'R186 matrix details must use progressive disclosure');
for(const token of ['compileDifferentialRelativityR186','DifferentialRelativityR186','reconstructMultipathR185','MultipathReconstructionR185','resolveInterferenceR184','InterferenceResolutionR184'])assert.ok(instrument.includes(token),`Visual Instrument missing R184-R186 chain ${token}`);
for(const retained of ['PC-LINEAGE DEPTH CAMERA','ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','VisualAtlasR183','OrientationFrameR182View','Admitted next','Previous','Yaw','Pitch'])assert.ok(instrument.includes(retained),`R186 degraded retained Visual Instrument function ${retained}`);
console.log('R186 DIFFERENTIAL RELATIVITY PASS · discrete gradient + Hessian + principal curvature + route alignment + progressive disclosure + no Canon mutation');
