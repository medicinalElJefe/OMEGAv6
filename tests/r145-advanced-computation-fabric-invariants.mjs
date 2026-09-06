import assert from 'node:assert/strict';
import fs from 'node:fs';
import {computationManifestR145,generateDesignSpaceR145,screenBatchR145,screenCandidateR145,R145_ENGINE} from '../src/computation/advancedComputationKernelR145.js';
import {adaptiveCampaignManifestR145,runAdaptiveCampaignR145,R145_CAMPAIGN_ENGINE} from '../src/computation/adaptiveComputationCampaignR145.js';

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

const request={design_space:{count:32,wavelength_nm:550,target_phase_deg:180,material_model:{n_incident:1,n_feature:2.25,n_background:1,n_substrate:1.46}},spectral_points:7,fractional_bandwidth:.16,fabrication_tolerance_nm:6,polarizations:['s','p']};
const batch=await screenBatchR145(request);
assert.equal(batch.ok,true);assert.equal(batch.schema,'OMEGA_COMPUTE_BATCH_RESULT_R145');assert.equal(batch.revision,'R145');assert.equal(batch.summary.candidate_count,32);assert.ok(batch.summary.pareto_front_size>=1);assert.ok(batch.top_candidates.length>0&&batch.top_candidates.length<=32);
assert.match(batch.receipt.source_sha256,/^[a-f0-9]{64}$/);assert.match(batch.receipt.result_sha256,/^[a-f0-9]{64}$/);assert.equal(batch.receipt.fullwave_validation,false);assert.equal(batch.receipt.canonical_mutation,false);assert.equal(batch.receipt.downstream_execution_receipt_authority,'R142');assert.equal(batch.receipt.deployment_attestation_authority,'R144');assert.equal(batch.receipt.canonical_admission_authority,'R125');
for(const row of batch.top_candidates){assert.ok(Number.isInteger(row.pareto_rank)&&row.pareto_rank>=1);assert.ok(['rcwa','fdtd'].includes(row.requested_solver));if(row.fullwave_request?.schema==='OMEGA_FULLWAVE_QUEUE_v1'){assert.equal(row.proof_projection.gate,'STAY');assert.equal(row.requested_solver,'rcwa');assert.equal(row.fullwave_request.solver,'rcwa');assert.match(row.fullwave_request.truth_boundary,/not RCWA execution/i)}if(row.requested_solver==='fdtd'&&row.proof_projection.gate==='STAY'){assert.equal(row.fullwave_request?.schema,'OMEGA_FULLWAVE_REQUEST_R145');assert.equal(row.fullwave_request?.state,'CAPABILITY_REQUIRED')}}
for(const job of batch.fullwave_queue){assert.equal(job.schema,'OMEGA_FULLWAVE_QUEUE_v1');assert.equal(job.solver,'rcwa');assert.equal(job.proof.gate,'STAY');assert.ok(job.proof.mode188_score>=1.05);assert.ok(job.proof.contradiction<.75)}

const campaignManifest=adaptiveCampaignManifestR145();
assert.equal(campaignManifest.schema,'OMEGA_ADAPTIVE_COMPUTATION_CAMPAIGN_R145');
assert.equal(campaignManifest.engine,R145_CAMPAIGN_ENGINE);
assert.equal(campaignManifest.max_generations,4);assert.equal(campaignManifest.max_population,256);assert.equal(campaignManifest.max_evaluations,1024);
for(const law of ['GLOBAL_EXPLORATION_PRECEDES_LOCAL_REFINEMENT','LOCAL_REFINEMENT_CARRIES_PARETO_ELITE_LINEAGE','NO_GENERATION_SELF_PROMOTES_TO_FULLWAVE_TRUTH','CAMPAIGN_CONVERGENCE_IS_NUMERICAL_NOT_PHYSICAL_VALIDATION','R145_SCREEN_RECEIPTS_REMAIN_IMMUTABLE_STAGE_EVIDENCE','R142_R144_R125_AUTHORITIES_REMAIN_DOWNSTREAM'])assert.ok(campaignManifest.laws.includes(law),`campaign law missing ${law}`);
const campaign=await runAdaptiveCampaignR145({...request,generations:3,population:32,elite_count:6,convergence_tolerance:.0025});
assert.equal(campaign.ok,true);assert.equal(campaign.schema,'OMEGA_ADAPTIVE_COMPUTATION_CAMPAIGN_R145');assert.equal(campaign.engine,R145_CAMPAIGN_ENGINE);assert.equal(campaign.summary.generations,3);assert.equal(campaign.history.length,3);assert.equal(campaign.receipt.generations_completed,3);assert.equal(campaign.receipt.evaluations,campaign.history.reduce((s,x)=>s+x.candidate_count,0));assert.ok(campaign.receipt.evaluations>=64&&campaign.receipt.evaluations<=96);
assert.match(campaign.receipt.campaign_sha256,/^[a-f0-9]{64}$/);assert.equal(campaign.receipt.stage_result_sha256.length,3);for(const hash of campaign.receipt.stage_result_sha256)assert.match(hash,/^[a-f0-9]{64}$/);
assert.equal(campaign.receipt.fullwave_validation,false);assert.equal(campaign.receipt.canonical_mutation,false);assert.equal(campaign.receipt.downstream_execution_receipt_authority,'R142');assert.equal(campaign.receipt.deployment_attestation_authority,'R144');assert.equal(campaign.receipt.canonical_admission_authority,'R125');
for(let i=0;i<campaign.history.length;i++){assert.equal(campaign.history[i].generation,i);assert.ok(campaign.history[i].candidate_count>0);assert.match(campaign.history[i].result_sha256,/^[a-f0-9]{64}$/)}
assert.ok(campaign.top_candidates.length>0);assert.match(campaign.truth_boundary,/numerical screening evidence only/i);

const service=fs.readFileSync('services/opticalMachineR115.js','utf8'),ui=fs.readFileSync('src/AdvancedComputationR145.tsx','utf8'),suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8'),quality=fs.readFileSync('src/UniversalQualityControl.tsx','utf8');
assert.match(service,/advancedComputationKernelR145/);assert.match(service,/adaptiveComputationCampaignR145/);assert.match(service,/\/api\/computation\/r145\/manifest/);assert.match(service,/\/api\/computation\/r145\/screen-batch/);assert.match(service,/\/api\/computation\/r145\/optimize/);assert.match(service,/\/api\/federation\/screen/);assert.match(service,/R115_BOUNDED_SCALAR_SCREEN/);assert.match(service,/ADVANCED_REDUCED_ORDER_SCREEN_ONLY/);assert.match(service,/ADAPTIVE_REDUCED_ORDER_SCREEN_ONLY/);
assert.match(ui,/LOCAL_BROWSER_SAME_KERNEL/);assert.match(ui,/CLOUDFLARE_MACHINE_R145/);assert.match(ui,/Reduced-order only/);assert.match(quality,/AdvancedComputationR145/);assert.match(quality,/<AdvancedComputationR145/);assert.match(suite,/AdvancedComputationR145/);
assert.ok(!service.includes('fullwave_validation:true'));assert.ok(!ui.includes('RCWA VERIFIED'));
console.log(`R145 ADVANCED COMPUTATION FABRIC PASS · sweep ${batch.summary.candidate_count} · adaptive ${campaign.summary.generations} generations/${campaign.receipt.evaluations} evals · Pareto ${campaign.summary.pareto_front_size} · RCWA-ready ${campaign.summary.rcwa_ready} · FDTD-escalate ${campaign.summary.fdtd_escalations} · campaign ${campaign.receipt.campaign_sha256.slice(0,12)}`);
