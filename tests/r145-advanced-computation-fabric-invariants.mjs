import assert from 'node:assert/strict';
import fs from 'node:fs';
import {computationManifestR145,generateDesignSpaceR145,screenBatchR145,screenCandidateR145,R145_ENGINE} from '../src/computation/advancedComputationKernelR145.js';

const manifest=computationManifestR145();
assert.equal(manifest.schema,'OMEGA_ADVANCED_COMPUTATION_R145');
assert.equal(manifest.revision,'R145');
assert.equal(manifest.engine,R145_ENGINE);
for(const cap of ['HALTON_DESIGN_SPACE','EFFECTIVE_MEDIUM_ANISOTROPY','THIN_FILM_TRANSFER','SPECTRAL_SWEEP','POLARIZATION_SWEEP','RAYLEIGH_MARGIN','EVANESCENT_COUPLING_PROXY','FABRICATION_PERTURBATION_ENSEMBLE','PARETO_RANKING','ADAPTIVE_RCWA_FDTD_ROUTING','SHA256_COMPUTE_RECEIPTS'])assert.ok(manifest.capabilities.includes(cap),`missing ${cap}`);
for(const law of ['REDUCED_ORDER_IS_NOT_FULLWAVE_MAXWELL_VALIDATION','PARETO_RANK_IS_NOT_CANONSTATE_ADMISSION','RCWA_QUEUE_REQUIRES_SCREEN_PROOF_STAY','FDTD_LABEL_REQUIRES_REAL_EXECUTOR_RETURN','FABRICATION_CLAIM_REQUIRES_INDEPENDENT_MEASUREMENT','R142_REMAINS_EXECUTION_RECEIPT_AUTHORITY','R144_REMAINS_DEPLOYMENT_ATTESTATION_AUTHORITY','R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(manifest.laws.includes(law),`law missing ${law}`);

const generated=generateDesignSpaceR145({count:24,wavelength_nm:550,target_phase_deg:180,material_model:{n_incident:1,n_feature:2.25,n_background:1,n_substrate:1.46}});
assert.equal(generated.length,24);
assert.equal(new Set(generated.map(x=>x.candidate_id)).size,24);
for(const c of generated){assert.ok(c.geometry.width_nm<c.geometry.pitch_nm);assert.ok(c.geometry.length_nm<c.geometry.pitch_nm);assert.ok(c.geometry.height_nm>0)}

const one=screenCandidateR145(generated[0],{spectral_points:5,fractional_bandwidth:.12,fabrication_tolerance_nm:5,polarizations:['s','p']});
assert.equal(one.schema,'OMEGA_COMPUTE_CANDIDATE_R145');
assert.equal(one.points.length,10);
assert.equal(one.robustness_samples.length,9);
for(const key of ['mean_useful_efficiency','min_useful_efficiency','mean_transmission','phase_rms_deg','phase_max_deg','polarization_sensitivity','rayleigh_margin_min','diffraction_risk_max','coupling_proxy_max','resonance_risk_max','resonance_sensitivity','fabrication_sensitivity','robustness_score','objective_score'])assert.ok(Number.isFinite(one.metrics[key]),`non-finite metric ${key}`);
for(const key of ['mean_useful_efficiency','min_useful_efficiency','mean_transmission','polarization_sensitivity','diffraction_risk_max','coupling_proxy_max','resonance_risk_max','resonance_sensitivity','fabrication_sensitivity','robustness_score','objective_score'])assert.ok(one.metrics[key]>=0&&one.metrics[key]<=1,`metric outside normalized range ${key}`);
assert.ok(['STAY','TURN'].includes(one.proof_projection.gate));
assert.ok(['rcwa','fdtd'].includes(one.requested_solver));
assert.match(one.truth_boundary,/not RCWA\/FDTD\/FEM or measurement/i);

const batch=await screenBatchR145({design_space:{count:32,wavelength_nm:550,target_phase_deg:180,material_model:{n_incident:1,n_feature:2.25,n_background:1,n_substrate:1.46}},spectral_points:7,fractional_bandwidth:.16,fabrication_tolerance_nm:6,polarizations:['s','p']});
assert.equal(batch.ok,true);assert.equal(batch.schema,'OMEGA_COMPUTE_BATCH_RESULT_R145');assert.equal(batch.revision,'R145');assert.equal(batch.summary.candidate_count,32);assert.ok(batch.summary.pareto_front_size>=1);assert.ok(batch.top_candidates.length>0&&batch.top_candidates.length<=32);
assert.match(batch.receipt.source_sha256,/^[a-f0-9]{64}$/);assert.match(batch.receipt.result_sha256,/^[a-f0-9]{64}$/);assert.equal(batch.receipt.fullwave_validation,false);assert.equal(batch.receipt.canonical_mutation,false);assert.equal(batch.receipt.downstream_execution_receipt_authority,'R142');assert.equal(batch.receipt.deployment_attestation_authority,'R144');assert.equal(batch.receipt.canonical_admission_authority,'R125');
for(const row of batch.top_candidates){assert.ok(Number.isInteger(row.pareto_rank)&&row.pareto_rank>=1);assert.ok(['rcwa','fdtd'].includes(row.requested_solver));if(row.fullwave_request?.schema==='OMEGA_FULLWAVE_QUEUE_v1'){assert.equal(row.proof_projection.gate,'STAY');assert.equal(row.requested_solver,'rcwa');assert.equal(row.fullwave_request.solver,'rcwa');assert.match(row.fullwave_request.truth_boundary,/not RCWA execution/i)}if(row.requested_solver==='fdtd'&&row.proof_projection.gate==='STAY'){assert.equal(row.fullwave_request?.schema,'OMEGA_FULLWAVE_REQUEST_R145');assert.equal(row.fullwave_request?.state,'CAPABILITY_REQUIRED')}}
for(const job of batch.fullwave_queue){assert.equal(job.schema,'OMEGA_FULLWAVE_QUEUE_v1');assert.equal(job.solver,'rcwa');assert.equal(job.proof.gate,'STAY');assert.ok(job.proof.mode188_score>=1.05);assert.ok(job.proof.contradiction<.75)}

const service=fs.readFileSync('services/opticalMachineR115.js','utf8'),ui=fs.readFileSync('src/AdvancedComputationR145.tsx','utf8'),suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
assert.match(service,/advancedComputationKernelR145/);assert.match(service,/\/api\/computation\/r145\/manifest/);assert.match(service,/\/api\/computation\/r145\/screen-batch/);assert.match(service,/\/api\/federation\/screen/);assert.match(service,/R115_BOUNDED_SCALAR_SCREEN/);assert.match(service,/ADVANCED_REDUCED_ORDER_SCREEN_ONLY/);
assert.match(ui,/LOCAL_BROWSER_SAME_KERNEL/);assert.match(ui,/CLOUDFLARE_MACHINE_R145/);assert.match(ui,/Open Sovereign execution/);assert.match(ui,/Reduced-order only/);assert.match(suite,/panel==='Validation'/);assert.match(suite,/AdvancedComputationR145/);assert.match(suite,/Retained validation utility authority/);
assert.ok(!service.includes('fullwave_validation:true'));assert.ok(!ui.includes('RCWA VERIFIED'));
console.log(`R145 ADVANCED COMPUTATION FABRIC PASS · ${batch.summary.candidate_count} candidates · Pareto ${batch.summary.pareto_front_size} · RCWA-ready ${batch.summary.rcwa_ready} · FDTD-escalate ${batch.summary.fdtd_escalations} · receipt ${batch.receipt.result_sha256.slice(0,12)}`);
