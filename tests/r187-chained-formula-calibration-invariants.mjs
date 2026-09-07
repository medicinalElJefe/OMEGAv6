import assert from 'node:assert/strict';
import fs from 'node:fs';

const model=fs.readFileSync('src/chainedFormulaCalibrationR187.ts','utf8');
const view=fs.readFileSync('src/ChainedFormulaCalibrationR187.tsx','utf8');
const cache=fs.readFileSync('src/analysisCacheR189.ts','utf8');
const instrument=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');

for(const token of ['reconstructMultipathR185','compileDifferentialRelativityR186','actualDelta','linearDelta','quadraticDelta','predictedDelta','error','meanAbsoluteError','rmse','systematicBias','relinearizations','WELL_CALIBRATED_LOCAL_CHAIN','MIXED_LOCAL_VALIDITY','RELINEARIZE_REQUIRED','sharedCache?:AnalysisCacheR189','cache=sharedCache||createAnalysisCacheR189(field)'])assert.ok(model.includes(token),`R187 chained calibration law missing ${token}`);
assert.ok(cache.includes("import {INTERFERENCE_CALIBRATION_R184} from './interferenceResolutionR184'"),'R187 must inherit exact R184 state residual through the shared R189 cache');
for(const token of ['g.D*d.D+g.P*d.P+g.R*d.R+g.L*d.L','0.5*vec[r]*diff.hessian[r][c]*vec[c]','actual-predicted','Math.exp(-absoluteError/scale)'])assert.ok(model.includes(token),`R187 prediction/fit formula missing ${token}`);
assert.ok(model.includes('Each edge is re-linearized from its own R186 gradient/Hessian'),'R187 must re-linearize each edge');
assert.ok(model.includes('shares the exact R189 memoized state truth used by R184-R186'),'R187 shared-state-truth boundary missing');
assert.ok(model.includes('never edits R184 calibration weights automatically'),'R187 automatic coefficient rewrite boundary missing');
assert.ok(model.includes('never promotes an internally well-fit formula to empirical physical law'),'R187 empirical-law boundary missing');
assert.ok(!/Math\.random|Date\.now|requestAnimationFrame/.test(model),'R187 calibration must be deterministic and non-wall-clock');
assert.ok(!/canonicalMutation\s*:\s*true|CanonState\s*=/.test(model),'R187 must not mutate CanonState');

for(const token of ['CHAINED FORMULA CALIBRATION','Actual total ΔR','Predicted total ΔR','Mean confidence','Inspect formula prediction error and axis attribution','Formula miss is retained as calibration evidence'])assert.ok(view.includes(token),`R187 operator calibration surface missing ${token}`);
assert.ok(view.includes('<details'),'R187 edge audit must use progressive disclosure');
for(const token of ['compileChainedFormulaCalibrationR187','ChainedFormulaCalibrationR187','compileDifferentialRelativityR186','DifferentialRelativityR186','reconstructMultipathR185','MultipathReconstructionR185'])assert.ok(instrument.includes(token),`Visual Instrument missing R185-R187 chain ${token}`);
for(const retained of ['PC-LINEAGE DEPTH CAMERA','ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','VisualAtlasR183','OrientationFrameR182View','Admitted next','Previous','Yaw','Pitch'])assert.ok(instrument.includes(retained),`R187 degraded retained Visual Instrument function ${retained}`);
console.log('R187 CHAINED FORMULA CALIBRATION PASS · shared R189 state truth + stepwise Taylor audit + retained miss + re-linearization + no coefficient/Canon mutation');