import assert from 'node:assert/strict';
import {applyFullwaveCalibrationR147,fitFullwaveCalibrationR147,fullwaveCalibrationManifestR147,R147_ENGINE,R147_FOLDS,R147_MIN_OBSERVATIONS} from '../src/computation/fullwaveCalibrationR147.js';

const manifest=fullwaveCalibrationManifestR147();
assert.equal(manifest.schema,'OMEGA_FULLWAVE_CALIBRATION_R147');assert.equal(manifest.engine,R147_ENGINE);assert.equal(manifest.folds,R147_FOLDS);assert.equal(manifest.min_observations,R147_MIN_OBSERVATIONS);assert.equal(manifest.authority.output,'CROSS_VALIDATED_SCREENING_HINT_ONLY');
for(const law of ['ONLY_CONVERGED_FULLWAVE_RETURNS_MAY_CALIBRATE','OUT_OF_FOLD_IMPROVEMENT_IS_REQUIRED_BEFORE_MODEL_USE','CALIBRATION_GATE_PASS_IS_NOT_CANONSTATE_ADMISSION','CALIBRATION_NEVER_REWRITES_ORIGINAL_R145_RECEIPTS','FABRICATION_VALIDATION_REQUIRES_INDEPENDENT_MEASUREMENT'])assert.ok(manifest.laws.includes(law),`missing ${law}`);

const observations=[];
for(let i=0;i<75;i++){
 const fill=.12+.65*((i%17)/16),pitchRatio=.48+.34*((i%11)/10),heightRatio=.35+.82*((i%13)/12),aspect=.55+2.3*((i%19)/18),anisotropy=.02+.42*((i%7)/6),theta=(i%12)/12,coupling=.02+.16*((i%9)/8),diffraction=.01+.18*((i%5)/4),resonance=.04+.25*((i%8)/7),pred=.25+.48*((i%23)/22);
 const residual=.055-.07*fill+.035*heightRatio-.028*anisotropy-.025*coupling+.018*theta;
 const observed=Math.max(0,Math.min(1,pred+residual));
 observations.push({schema:'OMEGA_CALIBRATION_OBSERVATION_R147',observation_id:`obs_${String(i).padStart(3,'0')}`,candidate_id:`candidate_${i}`,wavelength_nm:450+(i%15)*14,polarization:'s',features:{fill,pitch_ratio:pitchRatio,height_ratio:heightRatio,aspect,anisotropy,theta_norm:theta},r145_transmission:pred,r145_metrics:{coupling_proxy:coupling,diffraction_risk:diffraction,resonance_risk:resonance},fullwave_transmission:observed,fullwave_reflection:1-observed,fullwave_converged:true,fullwave_schema:'OMEGA_SPECTRAL_RESULT_v1',r145_receipt:'a'.repeat(64),r146_result_sha256:(i%3===0?'b':i%3===1?'c':'d').repeat(64),lineage:['synthetic:r147-test'],truth_boundary:'synthetic deterministic calibration invariant only'});
}
observations.push({...observations[0],observation_id:'failed_solver_should_be_excluded',fullwave_converged:false,fullwave_transmission:0});
const insufficient=await fitFullwaveCalibrationR147(observations.slice(0,10));assert.equal(insufficient.ok,false);assert.equal(insufficient.state,'HOLD_INSUFFICIENT_EVIDENCE');assert.equal(insufficient.model,undefined);
const fit=await fitFullwaveCalibrationR147(observations,{lambda:.001,required_improvement:.05});
assert.equal(fit.ok,true);assert.equal(fit.state,'CALIBRATION_GATE_PASS');assert.equal(fit.observations,75);assert.equal(fit.model.schema,'OMEGA_FULLWAVE_CALIBRATION_MODEL_R147');assert.match(fit.model.model_sha256,/^[a-f0-9]{64}$/);assert.match(fit.receipt_sha256,/^[a-f0-9]{64}$/);assert.equal(fit.canonical_mutation,false);assert.equal(fit.screen_engine_mutation,false);assert.equal(fit.physical_validation,false);assert.ok(fit.cross_validation.calibrated_rmse<fit.cross_validation.baseline_rmse);assert.ok(fit.cross_validation.relative_rmse_improvement>=.05);assert.ok(fit.cross_validation.folds.length>=4);assert.ok(fit.cross_validation.max_fold_regression<=.15);
const sample=observations[21],corrected=applyFullwaveCalibrationR147(fit.model,sample);assert.ok(Math.abs(corrected-sample.fullwave_transmission)<Math.abs(sample.r145_transmission-sample.fullwave_transmission));
assert.match(fit.truth_boundary,/screening hint only/);assert.match(fit.truth_boundary,/never self-modifies CanonState/);

const noSignal=observations.slice(0,40).map((o,i)=>({...o,observation_id:`noise_${i}`,fullwave_transmission:Math.max(0,Math.min(1,o.r145_transmission+(.02*((i%2)*2-1))))}));
const conservative=await fitFullwaveCalibrationR147(noSignal,{lambda:.2,required_improvement:.45});assert.equal(conservative.ok,false);assert.equal(conservative.state,'HOLD_NO_GENERALIZATION_PROOF');assert.equal(conservative.model,null);
console.log(`R147 FULLWAVE CALIBRATION PASS · ${fit.observations} converged observations · OOF RMSE ${fit.cross_validation.baseline_rmse} → ${fit.cross_validation.calibrated_rmse} · improvement ${(100*fit.cross_validation.relative_rmse_improvement).toFixed(1)}% · ${fit.model.model_sha256.slice(0,12)}`);
