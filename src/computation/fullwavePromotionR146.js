import {sha256R145} from './advancedComputationKernelR145.js';

export const R146_SCHEMA='OMEGA_FULLWAVE_PROMOTION_R146';
export const R146_REVISION='R146';
export const R146_MAX_FINALISTS=8;
export const R146_MAX_WAVELENGTHS=33;
export const R146_LAWS=Object.freeze([
 'R145_SCREENING_NEVER_SELF_PROMOTES_TO_FULLWAVE_TRUTH',
 'R146_PROMOTION_REQUIRES_R145_STAY',
 'MATERIAL_IDENTITY_MUST_BE_EXPLICIT_FOR_DISPERSION_EXECUTION',
 'EVERY_SPECTRAL_JOB_PRESERVES_R145_RECEIPT_AND_CANDIDATE_LINEAGE',
 'RCWA_EXECUTION_REQUIRES_AUTHENTICATED_SOVEREIGN_RETURN',
 'NONCONVERGED_SPECTRAL_POINTS_REMAIN_HELD',
 'FABRICATION_CLAIMS_REQUIRE_MEASURED_PROCESS_SPECIFIC_DATA',
 'R142_EXECUTION_R144_DEPLOYMENT_R125_ADMISSION_AUTHORITIES_REMAIN_SEPARATE'
]);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=6)=>Number(Number(v).toFixed(n));
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;

function resultKind(input){
 if(input?.schema==='OMEGA_COMPUTE_BATCH_RESULT_R145')return'BATCH';
 if(input?.schema==='OMEGA_ADAPTIVE_COMPUTATION_CAMPAIGN_R145')return'CAMPAIGN';
 throw new Error('R146 requires an R145 batch result or adaptive campaign result');
}
function materialNames(spec={}){
 const required=['incident','feature','background','substrate'],out={};
 for(const key of required){const value=String(spec?.[key]||'').trim();if(!value)throw new Error(`material_names.${key} is required for dispersion-aware promotion`);out[key]=value}
 return out;
}
function wavelengthGrid(center,count,bw,explicit){
 if(Array.isArray(explicit)&&explicit.length){
  const vals=[...new Set(explicit.filter(x=>finite(x)&&Number(x)>0).map(Number))].sort((a,b)=>a-b).slice(0,R146_MAX_WAVELENGTHS);
  if(!vals.length)throw new Error('wavelengths_nm contains no positive finite wavelengths');
  return vals.map(x=>round(x,6));
 }
 const n=Math.max(1,Math.min(R146_MAX_WAVELENGTHS,Math.floor(Number(count)||9))),band=clamp(finite(bw)?bw:.16,0,.8);
 if(n===1)return[round(center,6)];
 return Array.from({length:n},(_,i)=>round(center*(1-band/2+band*i/(n-1)),6));
}
function candidateRows(input){return Array.isArray(input?.top_candidates)?input.top_candidates:[]}
function nominalMaterial(candidate){const m=candidate?.material_model||{};return{n_incident:Number(m.n_incident)||1,n_feature:Number(m.n_feature)||2,n_background:Number(m.n_background)||1,n_substrate:Number(m.n_substrate)||1.46}}
function candidateProof(row){return row?.proof_projection||row?.candidate?.proof||null}
function sourceReceipt(input){return input?.receipt?.result_sha256||input?.receipt?.campaign_sha256||input?.receipt?.source_sha256||null}

export async function compileFullwavePromotionR146(input,options={}){
 const kind=resultKind(input),names=materialNames(options.material_names),limit=Math.max(1,Math.min(R146_MAX_FINALISTS,Math.floor(Number(options.max_finalists)||4))),rows=candidateRows(input),r145Receipt=sourceReceipt(input);
 if(!r145Receipt)throw new Error('R145 receipt identity is required for R146 lineage');
 const jobs=[],held=[];
 for(const row of rows){
  if(jobs.length>=limit)break;
  const c=row?.candidate||{},proof=candidateProof(row),geometry=c.geometry||{},center=Number(c.wavelength_nm)||Number(options.center_wavelength_nm)||550;
  if(proof?.gate!=='STAY'){held.push({candidate_id:c.candidate_id||null,reason:'R145_GATE_NOT_STAY'});continue}
  if(String(row?.requested_solver||'').toLowerCase()!=='rcwa'){held.push({candidate_id:c.candidate_id||null,reason:`R145_REQUESTED_${String(row?.requested_solver||'UNKNOWN').toUpperCase()}`});continue}
  if(!['pitch_nm','width_nm','length_nm','height_nm'].every(k=>finite(geometry[k])&&Number(geometry[k])>0)){held.push({candidate_id:c.candidate_id||null,reason:'INVALID_GEOMETRY'});continue}
  const complexity=clamp(.35*Number(row?.metrics?.coupling_proxy_max||0)+.25*Number(row?.metrics?.resonance_risk_max||0)+.2*Number(row?.metrics?.fabrication_sensitivity||0)+.2*Number(row?.metrics?.diffraction_risk_max||0),0,1),spectralPoints=Math.max(3,Math.min(R146_MAX_WAVELENGTHS,Math.floor(Number(options.spectral_points)||Math.round(9+16*complexity)))),wavelengths=wavelengthGrid(center,spectralPoints,options.fractional_bandwidth,options.wavelengths_nm),nominal=nominalMaterial(c),candidateId=String(c.candidate_id||`candidate_${jobs.length+1}`),sourcePacketId=String(c.source_packet_id||candidateId),objective=Number(row?.metrics?.objective_score||0),harmonicsLow=Math.max(25,Math.min(121,Math.round(33+48*complexity))),harmonicsHigh=Math.max(harmonicsLow+8,Math.min(169,Math.round(harmonicsLow+24+32*complexity)));
  const core={schema:'OMEGA_FULLWAVE_QUEUE_v1',job_id:`r146_${candidateId}`,source_packet_id:sourcePacketId,solver:'rcwa',execution_mode:'DISPERSION_SPECTRAL_R146',geometry:{pitch_nm:Number(geometry.pitch_nm),width_nm:Number(geometry.width_nm),length_nm:Number(geometry.length_nm),height_nm:Number(geometry.height_nm),theta_deg:Number(geometry.theta_deg)||0,material:geometry.material||'R145_CANDIDATE'},wavelength_nm:center,polarization:String(options.polarization||'s').toLowerCase()==='p'?'p':'s',material_model:nominal,material_names:names,spectral:{wavelengths_nm:wavelengths},numerics:{nx:Math.max(32,Math.min(256,Math.floor(Number(options.nx)||72))),ny:Math.max(32,Math.min(256,Math.floor(Number(options.ny)||72))),harmonics_low:harmonicsLow,harmonics_high:harmonicsHigh,convergence_tolerance:clamp(finite(options.convergence_tolerance)?options.convergence_tolerance:.02,.001,.2),energy_tolerance:clamp(finite(options.energy_tolerance)?options.energy_tolerance:.02,.001,.2),incidence_theta_deg:Number(options.incidence_theta_deg)||0,incidence_phi_deg:Number(options.incidence_phi_deg)||0},proof:{...proof,authority:'R145_SCREENING_PROJECTION'},priority:round(clamp(.5+.5*objective,0,1)),lineage:[...(Array.isArray(c.lineage)?c.lineage:[]),`r145:receipt:${r145Receipt}`,`r146:promote:${candidateId}`],promotion:{schema:R146_SCHEMA,revision:R146_REVISION,r145_result_kind:kind,r145_receipt:r145Receipt,candidate_id:candidateId,pareto_rank:Number(row?.pareto_rank)||null,objective_score:round(objective),material_identity:'EXPLICIT_DESIGN_MODEL_NAMES',fullwave_truth:false,canonical_mutation:false},truth_boundary:'R146 promotes a proof-admissible R145 finalist into a dispersion-aware RCWA request. Promotion is not execution. Full-wave truth requires a returned authenticated Sovereign spectral result whose convergence gates pass.'};
  const job_sha256=await sha256R145(stable(core));jobs.push({...core,job_sha256});
 }
 const manifestCore={schema:R146_SCHEMA,revision:R146_REVISION,source_kind:kind,r145_receipt:r145Receipt,selected:jobs.map(x=>({job_id:x.job_id,source_packet_id:x.source_packet_id,job_sha256:x.job_sha256,wavelengths:x.spectral.wavelengths_nm.length,priority:x.priority})),held,material_names:names,laws:R146_LAWS};
 return{ok:true,...manifestCore,receipt:{schema:'OMEGA_FULLWAVE_PROMOTION_RECEIPT_R146',state:'COMPILED_NOT_EXECUTED',promotion_sha256:await sha256R145(stable(manifestCore)),jobs:jobs.length,held:held.length,fullwave_validation:false,canonical_mutation:false,execution_receipt_authority:'R142',deployment_attestation_authority:'R144',canonical_admission_authority:'R125'},jobs,truth_boundary:'Compilation proves only deterministic promotion and lineage. RCWA validity begins only after authenticated Sovereign execution returns wavelength-resolved solver packets and convergence evidence.'};
}

export function fullwavePromotionManifestR146(){return{schema:R146_SCHEMA,revision:R146_REVISION,max_finalists:R146_MAX_FINALISTS,max_wavelengths:R146_MAX_WAVELENGTHS,accepted_sources:['OMEGA_COMPUTE_BATCH_RESULT_R145','OMEGA_ADAPTIVE_COMPUTATION_CAMPAIGN_R145'],output:'OMEGA_FULLWAVE_QUEUE_v1 + spectral/material_names',laws:R146_LAWS,authority:{screening:'R145',promotion:'R146',execution:'R142_REQUIRED',deployment:'R144',canonicalAdmission:'R125'}}}
