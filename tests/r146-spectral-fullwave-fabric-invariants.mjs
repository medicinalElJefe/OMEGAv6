import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileFullwavePromotionR146,fullwavePromotionManifestR146,R146_MAX_FINALISTS,R146_MAX_WAVELENGTHS} from '../src/computation/fullwavePromotionR146.js';

const manifest=fullwavePromotionManifestR146();
assert.equal(manifest.schema,'OMEGA_FULLWAVE_PROMOTION_R146');
assert.equal(manifest.revision,'R146');
assert.equal(manifest.max_finalists,R146_MAX_FINALISTS);
assert.equal(manifest.max_wavelengths,R146_MAX_WAVELENGTHS);
assert.ok(manifest.accepted_sources.includes('OMEGA_COMPUTE_BATCH_RESULT_R145'));
assert.ok(manifest.accepted_sources.includes('OMEGA_ADAPTIVE_COMPUTATION_CAMPAIGN_R145'));
for(const law of ['R145_SCREENING_NEVER_SELF_PROMOTES_TO_FULLWAVE_TRUTH','R146_PROMOTION_REQUIRES_R145_STAY','MATERIAL_IDENTITY_MUST_BE_EXPLICIT_FOR_DISPERSION_EXECUTION','EVERY_SPECTRAL_JOB_PRESERVES_R145_RECEIPT_AND_CANDIDATE_LINEAGE','RCWA_EXECUTION_REQUIRES_AUTHENTICATED_SOVEREIGN_RETURN','NONCONVERGED_SPECTRAL_POINTS_REMAIN_HELD'])assert.ok(manifest.laws.includes(law),`missing law ${law}`);

const geometry={pitch_nm:330,width_nm:92,length_nm:258,height_nm:548,theta_deg:27,material:'NUMERIC_INDEX_MODEL'};
const material_model={n_incident:1,n_feature:2.43,n_background:1,n_substrate:1.46};
const stay={gate:'STAY',mode188_score:1.19,continuity:.88,burden:.22,contradiction:.14,scar:.11,authority:'R145_SCREENING_PROJECTION_NOT_CANONSTATE_ADMISSION'};
const turn={...stay,gate:'TURN',mode188_score:.97};
const metricBase={objective_score:.84,coupling_proxy_max:.08,resonance_risk_max:.18,fabrication_sensitivity:.12,diffraction_risk_max:.05};
const candidate=(id)=>({candidate_id:id,source_packet_id:`packet_${id}`,geometry,wavelength_nm:550,material_model,lineage:['genesis:test','r145:test']});
const input={schema:'OMEGA_COMPUTE_BATCH_RESULT_R145',revision:'R145',receipt:{result_sha256:'a'.repeat(64),fullwave_validation:false,canonical_mutation:false},top_candidates:[
 {candidate:candidate('elite_rcwa'),proof_projection:stay,requested_solver:'rcwa',metrics:metricBase,pareto_rank:1},
 {candidate:candidate('held_turn'),proof_projection:turn,requested_solver:'rcwa',metrics:{...metricBase,objective_score:.75},pareto_rank:2},
 {candidate:candidate('held_fdtd'),proof_projection:stay,requested_solver:'fdtd',metrics:{...metricBase,objective_score:.72},pareto_rank:3}
]};
await assert.rejects(()=>compileFullwavePromotionR146(input,{material_names:{}}),/material_names\.incident/);
const out=await compileFullwavePromotionR146(input,{material_names:{incident:'air',feature:'tio2_design',background:'air',substrate:'sio2_fused'},spectral_points:7,fractional_bandwidth:.18,max_finalists:4});
assert.equal(out.ok,true);assert.equal(out.schema,'OMEGA_FULLWAVE_PROMOTION_R146');assert.equal(out.jobs.length,1);assert.equal(out.held.length,2);
const job=out.jobs[0];
assert.equal(job.schema,'OMEGA_FULLWAVE_QUEUE_v1');assert.equal(job.execution_mode,'DISPERSION_SPECTRAL_R146');assert.equal(job.solver,'rcwa');assert.equal(job.proof.gate,'STAY');assert.ok(job.proof.mode188_score>=1.05);assert.ok(job.proof.contradiction<.75);
assert.deepEqual(job.material_names,{incident:'air',feature:'tio2_design',background:'air',substrate:'sio2_fused'});assert.equal(job.spectral.wavelengths_nm.length,7);assert.ok(job.spectral.wavelengths_nm.every(x=>Number.isFinite(x)&&x>0));assert.ok(job.spectral.wavelengths_nm[0]<550&&job.spectral.wavelengths_nm.at(-1)>550);
assert.ok(['n_incident','n_feature','n_background','n_substrate'].every(k=>Number.isFinite(job.material_model[k])&&job.material_model[k]>0));
assert.match(job.job_sha256,/^[a-f0-9]{64}$/);assert.match(out.receipt.promotion_sha256,/^[a-f0-9]{64}$/);assert.equal(out.receipt.state,'COMPILED_NOT_EXECUTED');assert.equal(out.receipt.fullwave_validation,false);assert.equal(out.receipt.canonical_mutation,false);assert.equal(out.receipt.execution_receipt_authority,'R142');assert.equal(out.receipt.deployment_attestation_authority,'R144');assert.equal(out.receipt.canonical_admission_authority,'R125');
assert.ok(job.lineage.includes('r145:receipt:'+input.receipt.result_sha256));assert.match(job.truth_boundary,/Promotion is not execution/);assert.match(out.truth_boundary,/authenticated Sovereign execution/);
assert.equal(out.held.find(x=>x.candidate_id==='held_turn')?.reason,'R145_GATE_NOT_STAY');assert.equal(out.held.find(x=>x.candidate_id==='held_fdtd')?.reason,'R145_REQUESTED_FDTD');

const adaptive={...input,schema:'OMEGA_ADAPTIVE_COMPUTATION_CAMPAIGN_R145',receipt:{campaign_sha256:'b'.repeat(64),fullwave_validation:false,canonical_mutation:false},top_candidates:[input.top_candidates[0]]};
const adaptiveOut=await compileFullwavePromotionR146(adaptive,{material_names:{incident:'air',feature:'sin_design',background:'air',substrate:'sio2_fused'},wavelengths_nm:[470,532,650]});
assert.equal(adaptiveOut.source_kind,'CAMPAIGN');assert.deepEqual(adaptiveOut.jobs[0].spectral.wavelengths_nm,[470,532,650]);assert.ok(adaptiveOut.jobs[0].lineage.includes('r145:receipt:'+'b'.repeat(64)));

const agent=fs.readFileSync('public/omega-rcwa-agent.py','utf8'),runtime=fs.readFileSync('src/workerR34.js','utf8');
for(const marker of ["VERSION='R146.0'",'DISPERSION_SPECTRAL_R146','OMEGA_SPECTRAL_RESULT_v1','spectral_rcwa','dispersion_materials_r35','tio2_design','sio2_fused'])assert.ok(agent.includes(marker),`agent missing ${marker}`);
for(const marker of ['validSpectralResult','SPECTRAL_SCHEMA_LINEAGE_AND_CHILDREN_PASS','spectral_rcwa','material_names:job.material_names||null','spectral:job.spectral||null','OMEGA_FULLWAVE_RUNTIME_R146'])assert.ok(runtime.includes(marker),`runtime missing ${marker}`);
assert.ok(!agent.includes('fullwave_validation=True'));assert.ok(!agent.includes('fabrication_validated=True'));
console.log(`R146 SPECTRAL FULLWAVE PROMOTION PASS · ${job.spectral.wavelengths_nm.length} wavelengths · held ${out.held.length} · promotion ${out.receipt.promotion_sha256.slice(0,12)}`);
