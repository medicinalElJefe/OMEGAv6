import {sha256R145} from './advancedComputationKernelR145.js';

export const R150_SCHEMA='OMEGA_NUMERICAL_TRUST_ENVELOPE_R150';
export const R150_ENGINE='R150_MULTI_RESOLUTION_RCWA_TRUST_ENVELOPE_V1';
export const R150_LEVELS=3;
export const R150_MAX_WAVELENGTHS=33;
export const R150_LAWS=Object.freeze([
 'ONE_INTERNAL_CONVERGENCE_FLAG_IS_NOT_A_NUMERICAL_TRUST_ENVELOPE',
 'TRUST_REQUIRES_MULTIPLE_DISTINCT_RESOLUTION_LEVELS',
 'EVERY_LEVEL_MUST_PRESERVE_IDENTICAL_PHYSICAL_INPUTS',
 'SPECTRAL_GRID_AND_MATERIAL_IDENTITY_MUST_MATCH_ACROSS_LEVELS',
 'FINAL_REFINEMENT_DRIFT_AND_ENERGY_BALANCE_ARE_EXPLICIT_GATES',
 'R150_PASS_IS_SAME_SOLVER_FAMILY_NUMERICAL_STABILITY_NOT_INDEPENDENT_SOLVER_VALIDATION',
 'R150_PASS_IS_NOT_FABRICATION_VALIDATION',
 'R150_NEVER_MUTATES_R145_R146_R147_R148_R149_OR_CANONSTATE_AUTHORITY'
]);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=8)=>Number(Number(v).toFixed(n));
const rmse=a=>Math.sqrt(a.length?a.reduce((s,x)=>s+x*x,0)/a.length:0);
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;

function validBaseJob(job){
 const wavelengths=job?.spectral?.wavelengths_nm;
 return job?.schema==='OMEGA_FULLWAVE_QUEUE_v1'&&String(job?.solver||'').toLowerCase()==='rcwa'&&job?.proof?.gate==='STAY'&&Array.isArray(wavelengths)&&wavelengths.length>=1&&wavelengths.length<=R150_MAX_WAVELENGTHS&&wavelengths.every(x=>finite(x)&&Number(x)>0)&&job?.execution_mode==='DISPERSION_SPECTRAL_R146';
}
function nInt(v,fallback,min,max){return Math.max(min,Math.min(max,Math.floor(Number(v)||fallback)))}
function levelNumerics(base,level){
 const nx=nInt(base?.nx,48,32,128),ny=nInt(base?.ny,48,32,128),low=nInt(base?.harmonics_low,33,17,121),high=nInt(base?.harmonics_high,57,low+8,169);
 const scale=level===0?.72:level===1?1:1.34,hScale=level===0?.74:level===1?1:1.38;
 const levelNx=nInt(Math.round(nx*scale),nx,24,160),levelNy=nInt(Math.round(ny*scale),ny,24,160),levelLow=nInt(Math.round(low*hScale),low,13,161),levelHigh=nInt(Math.round(high*hScale),high,levelLow+8,241);
 return{...base,nx:levelNx,ny:levelNy,harmonics_low:levelLow,harmonics_high:levelHigh,convergence_tolerance:clamp(finite(base?.convergence_tolerance)?base.convergence_tolerance:.04,.001,.2),energy_tolerance:clamp(finite(base?.energy_tolerance)?base.energy_tolerance:.03,.001,.2)};
}
function physicalIdentity(job){return{source_packet_id:job.source_packet_id,solver:'rcwa',execution_mode:job.execution_mode,geometry:job.geometry,wavelength_nm:job.wavelength_nm,polarization:job.polarization,material_model:job.material_model,material_names:job.material_names,spectral:job.spectral,proof:job.proof}}

export async function compileNumericalTrustLadderR150(baseJob,options={}){
 if(!validBaseJob(baseJob))throw new Error('R150 requires a proof-admissible R146 dispersion spectral RCWA job');
 const sourceJobSha=String(baseJob.job_sha256||await sha256R145(stable(baseJob))),baseNumerics={...(baseJob.numerics||{})},levels=[];
 for(let index=0;index<R150_LEVELS;index++){
  const id=`L${index}`,numerics=levelNumerics(baseNumerics,index),jobCore={...baseJob,job_id:`${String(baseJob.job_id||baseJob.source_packet_id)}_r150_${id}`,numerics,lineage:[...(Array.isArray(baseJob.lineage)?baseJob.lineage:[]),`r150:source-job:${sourceJobSha}`,`r150:trust-level:${id}`],trust_ladder:{schema:R150_SCHEMA,revision:'R150',engine:R150_ENGINE,level_id:id,level_index:index,source_job_sha256:sourceJobSha,fullwave_truth:false,canonical_mutation:false},truth_boundary:'R150 ladder member is an R146 spectral RCWA request at one numerical resolution. It is not trusted merely because it was compiled or executed once.'};
  levels.push({level_id:id,level_index:index,job:{...jobCore,job_sha256:await sha256R145(stable(jobCore))}});
 }
 const distinct=new Set(levels.map(x=>`${x.job.numerics.nx}:${x.job.numerics.ny}:${x.job.numerics.harmonics_low}:${x.job.numerics.harmonics_high}`));if(distinct.size!==R150_LEVELS)throw new Error('R150 resolution ladder failed to produce three distinct numerical levels');
 const physicalHashes=await Promise.all(levels.map(x=>sha256R145(stable(physicalIdentity(x.job)))));if(new Set(physicalHashes).size!==1)throw new Error('R150 ladder changed physical identity across numerical levels');
 const core={schema:R150_SCHEMA,revision:'R150',engine:R150_ENGINE,state:'COMPILED_NOT_EXECUTED',source_job_sha256:sourceJobSha,physical_identity_sha256:physicalHashes[0],outer_tolerance:clamp(finite(options.outer_tolerance)?options.outer_tolerance:.025,.001,.2),energy_tolerance:clamp(finite(options.energy_tolerance)?options.energy_tolerance:.03,.001,.2),levels:levels.map(x=>({level_id:x.level_id,level_index:x.level_index,job_id:x.job.job_id,job_sha256:x.job.job_sha256,numerics:x.job.numerics})),laws:R150_LAWS,canonical_mutation:false,independent_solver_validation:false,physical_validation:false};
 const ladder_sha256=await sha256R145(stable(core));return{ok:true,...core,ladder_sha256,jobs:levels,truth_boundary:'Compilation creates three physically identical R146 spectral jobs with distinct numerical resolutions. Trust begins only after all three authenticated Sovereign returns are compared.'};
}

function unwrap(item,index){if(item?.result)return{level_id:String(item.level_id||`L${index}`),result:item.result};return{level_id:String(item?.level_id||`L${index}`),result:item}}
function validSpectral(result){return result?.schema==='OMEGA_SPECTRAL_RESULT_v1'&&result?.worker==='omega-sovereign'&&result?.solver==='rcwa'&&Array.isArray(result?.points)&&result.points.length>=1&&result.points.length<=R150_MAX_WAVELENGTHS&&result.points.every(p=>finite(p?.wavelength_nm)&&p?.result?.schema==='OMEGA_RESULT_v1'&&p.result.worker==='omega-sovereign'&&p.result.solver==='rcwa'&&finite(p.result?.observables?.R)&&finite(p.result?.observables?.T))}
function wavelengthKey(x){return Number(x).toFixed(8)}
function pointMap(result){return new Map(result.points.map(p=>[wavelengthKey(p.wavelength_nm),p]))}
function hashLike(x){return /^[a-f0-9]{64}$/i.test(String(x||''))}

export async function analyzeNumericalTrustEnvelopeR150(ladder,returns,options={}){
 const expectedLevels=Array.isArray(ladder?.levels)?ladder.levels:[],items=(Array.isArray(returns)?returns:[]).map(unwrap).sort((a,b)=>a.level_id.localeCompare(b.level_id));
 const outerTolerance=clamp(finite(options.outer_tolerance)?options.outer_tolerance:ladder?.outer_tolerance??.025,.001,.2),energyTolerance=clamp(finite(options.energy_tolerance)?options.energy_tolerance:ladder?.energy_tolerance??.03,.001,.2);
 const fail=async(state,reason)=>{const core={schema:R150_SCHEMA,revision:'R150',engine:R150_ENGINE,state,reason,ladder_sha256:ladder?.ladder_sha256||null,levels_received:items.length,outer_tolerance:outerTolerance,energy_tolerance:energyTolerance,canonical_mutation:false,independent_solver_validation:false,physical_validation:false,laws:R150_LAWS};return{ok:false,...core,trust_sha256:await sha256R145(stable(core)),truth_boundary:'R150 did not establish a numerical trust envelope. The returned evidence remains held and no higher learning authority is implied.'}};
 if(expectedLevels.length!==R150_LEVELS||items.length!==R150_LEVELS)return fail('HOLD_INCOMPLETE_LADDER','Exactly three compiled levels and three returned results are required.');
 if(items.some(x=>!validSpectral(x.result)))return fail('HOLD_INVALID_RESULT','Every ladder level must return a valid Sovereign OMEGA_SPECTRAL_RESULT_v1.');
 const source=new Set(items.map(x=>String(x.result.source_packet_id||'')));if(source.size!==1)return fail('HOLD_PHYSICAL_IDENTITY_MISMATCH','Returned source_packet_id differs across numerical levels.');
 const grids=items.map(x=>x.result.points.map(p=>wavelengthKey(p.wavelength_nm)).join('|'));if(new Set(grids).size!==1)return fail('HOLD_SPECTRAL_GRID_MISMATCH','Returned wavelength grids differ across numerical levels.');
 const expectedIds=expectedLevels.map(x=>String(x.level_id)).sort(),actualIds=items.map(x=>x.level_id);if(expectedIds.some((x,i)=>x!==actualIds[i]))return fail('HOLD_LEVEL_ID_MISMATCH','Returned level identifiers do not match the compiled ladder.');
 const allConverged=items.every(x=>x.result.converged_all===true&&x.result.points.every(p=>p.result.converged===true));
 const maps=items.map(x=>pointMap(x.result)),wavelengths=items[0].result.points.map(p=>Number(p.wavelength_nm)),perPoint=[];
 for(const wl of wavelengths){const key=wavelengthKey(wl),p0=maps[0].get(key),p1=maps[1].get(key),p2=maps[2].get(key),r0=Number(p0.result.observables.R),r1=Number(p1.result.observables.R),r2=Number(p2.result.observables.R),t0=Number(p0.result.observables.T),t1=Number(p1.result.observables.T),t2=Number(p2.result.observables.T),d01=Math.max(Math.abs(r1-r0),Math.abs(t1-t0)),d12=Math.max(Math.abs(r2-r1),Math.abs(t2-t1)),energy=Math.max(Number(p0.result.convergence_metrics?.energy_balance_error)||0,Number(p1.result.convergence_metrics?.energy_balance_error)||0,Number(p2.result.convergence_metrics?.energy_balance_error)||0),contracted=d12<=d01*1.25||d12<=outerTolerance*.5;perPoint.push({wavelength_nm:wl,R:[round(r0),round(r1),round(r2)],T:[round(t0),round(t1),round(t2)],delta_coarse_medium:round(d01),delta_medium_fine:round(d12),refinement_contracted:contracted,max_energy_balance_error:round(energy),fine_result_sha256:p2.result.result_sha256||null})}
 const finalDelta=perPoint.map(x=>x.delta_medium_fine),deltaT=perPoint.map(x=>x.T[2]-x.T[1]),deltaR=perPoint.map(x=>x.R[2]-x.R[1]),maxFinal=Math.max(...finalDelta),spectralRmseT=rmse(deltaT),spectralRmseR=rmse(deltaR),maxEnergy=Math.max(...perPoint.map(x=>x.max_energy_balance_error)),contractionFraction=perPoint.filter(x=>x.refinement_contracted).length/perPoint.length,hashesValid=items.every(x=>hashLike(x.result.result_sha256)&&x.result.points.every(p=>hashLike(p.result.result_sha256))),pass=allConverged&&maxFinal<=outerTolerance&&maxEnergy<=energyTolerance&&spectralRmseT<=outerTolerance&&spectralRmseR<=outerTolerance&&hashesValid,state=pass?'TRUST_ENVELOPE_PASS':!allConverged?'HOLD_INTERNAL_NONCONVERGENCE':'HOLD_NUMERICAL_DRIFT';
 const core={schema:R150_SCHEMA,revision:'R150',engine:R150_ENGINE,state,source_packet_id:[...source][0],ladder_sha256:ladder.ladder_sha256,levels:R150_LEVELS,wavelengths:wavelengths.length,outer_tolerance:outerTolerance,energy_tolerance:energyTolerance,all_internal_converged:allConverged,result_hashes_valid:hashesValid,max_final_refinement_delta_rt:round(maxFinal),spectral_rmse_t_medium_to_fine:round(spectralRmseT),spectral_rmse_r_medium_to_fine:round(spectralRmseR),max_energy_balance_error:round(maxEnergy),refinement_contraction_fraction:round(contractionFraction),per_point:perPoint,source_result_sha256:items.map(x=>x.result.result_sha256),canonical_mutation:false,independent_solver_validation:false,physical_validation:false,laws:R150_LAWS};
 const trust_sha256=await sha256R145(stable(core));return{ok:pass,...core,trust_sha256,truth_boundary:pass?'R150 establishes numerical stability across three resolutions within one RCWA/grcwa solver family. It is stronger numerical evidence, not an independent-solver cross-check or physical/fabrication validation.':'R150 detected unresolved numerical instability or nonconvergence. The result remains held and must not feed calibration as trusted evidence.'};
}

export function numericalTrustEnvelopeManifestR150(){return{schema:R150_SCHEMA,revision:'R150',engine:R150_ENGINE,levels:R150_LEVELS,max_wavelengths:R150_MAX_WAVELENGTHS,checks:['physical-input identity','spectral-grid identity','three distinct numerical resolutions','per-level internal convergence','medium-to-fine R/T drift','spectral RMSE drift','energy balance','result hashes'],laws:R150_LAWS,authority:{input:'R146_SPECTRAL_JOB_AND_RETURNS',output:'SAME_SOLVER_NUMERICAL_TRUST_ONLY',activeLearning:'R148',coverage:'R149',calibration:'R147_RETEST_REQUIRED',canonicalAdmission:'R125'}}}
