import {generateDesignSpaceR145,screenBatchR145,sha256R145} from './advancedComputationKernelR145.js';

export const R145_CAMPAIGN_SCHEMA='OMEGA_ADAPTIVE_COMPUTATION_CAMPAIGN_R145';
export const R145_CAMPAIGN_ENGINE='R145_PARETO_ADAPTIVE_REFINEMENT_V1';
export const R145_MAX_GENERATIONS=4;
export const R145_MAX_POPULATION=256;
export const R145_CAMPAIGN_LAWS=Object.freeze([
 'GLOBAL_EXPLORATION_PRECEDES_LOCAL_REFINEMENT',
 'LOCAL_REFINEMENT_CARRIES_PARETO_ELITE_LINEAGE',
 'NO_GENERATION_SELF_PROMOTES_TO_FULLWAVE_TRUTH',
 'CAMPAIGN_CONVERGENCE_IS_NUMERICAL_NOT_PHYSICAL_VALIDATION',
 'R145_SCREEN_RECEIPTS_REMAIN_IMMUTABLE_STAGE_EVIDENCE',
 'R142_R144_R125_AUTHORITIES_REMAIN_DOWNSTREAM'
]);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=6)=>Number(Number(v).toFixed(n));
const halton=(index,base)=>{let f=1,r=0,i=index;while(i>0){f/=base;r+=f*(i%base);i=Math.floor(i/base)}return r};
const geometryKey=g=>['pitch_nm','width_nm','length_nm','height_nm','theta_deg'].map(k=>round(Number(g?.[k]||0),4)).join(':');

function safeGeometry(g){
 const pitch=Math.max(40,Number(g.pitch_nm)||300),width=Math.max(5,Math.min(pitch*.94,Number(g.width_nm)||pitch*.35)),length=Math.max(5,Math.min(pitch*.94,Number(g.length_nm)||pitch*.55)),height=Math.max(10,Number(g.height_nm)||500);
 return{pitch_nm:round(pitch,4),width_nm:round(width,4),length_nm:round(length,4),height_nm:round(height,4),theta_deg:round(((Number(g.theta_deg)||0)%180+180)%180,4),material:g.material||'NUMERIC_INDEX_MODEL'};
}
function perturbGeometry(elite,index,generation){
 const g=elite.candidate.geometry,scale=.16*Math.pow(.48,generation),signed=(base,seed)=>2*halton(index+seed,base)-1;
 const next={pitch_nm:g.pitch_nm*(1+scale*signed(2,generation*11+1)),width_nm:g.width_nm*(1+scale*1.15*signed(3,generation*13+2)),length_nm:g.length_nm*(1+scale*1.15*signed(5,generation*17+3)),height_nm:g.height_nm*(1+scale*1.35*signed(7,generation*19+4)),theta_deg:g.theta_deg+45*scale*signed(11,generation*23+5),material:g.material};
 return safeGeometry(next);
}
function nextPopulation(previous,generation,population,eliteCount){
 const elites=previous.top_candidates.slice(0,Math.min(eliteCount,previous.top_candidates.length));
 const out=[],seen=new Set();
 const add=c=>{const key=geometryKey(c.geometry);if(seen.has(key))return;seen.add(key);out.push(c)};
 for(const row of elites)add({...row.candidate,candidate_id:`${row.candidate.candidate_id}_g${generation}_elite`,lineage:[...(row.candidate.lineage||[]),`r145:campaign:g${generation}:elite`]});
 let cursor=1;
 while(out.length<population&&elites.length){
  const elite=elites[(cursor-1)%elites.length],geometry=perturbGeometry(elite,cursor,generation);
  add({...elite.candidate,candidate_id:`r145_g${generation}_${String(cursor).padStart(4,'0')}`,geometry,lineage:[...(elite.candidate.lineage||[]),`r145:campaign:g${generation}:parent:${elite.candidate.candidate_id}`]});cursor++;
  if(cursor>population*8)break;
 }
 return out.slice(0,population);
}
function stageSummary(stage,index){return{generation:index,candidate_count:stage.summary.candidate_count,pareto_front_size:stage.summary.pareto_front_size,best_candidate_id:stage.summary.best_candidate_id,best_objective:stage.summary.best_objective,rcwa_ready:stage.summary.rcwa_ready,fdtd_escalations:stage.summary.fdtd_escalations,result_sha256:stage.receipt.result_sha256,runtime_ms:stage.receipt.runtime_ms}}

export async function runAdaptiveCampaignR145(request={}){
 const started=Date.now(),generations=Math.max(1,Math.min(R145_MAX_GENERATIONS,Math.floor(Number(request.generations)||3))),population=Math.max(16,Math.min(R145_MAX_POPULATION,Math.floor(Number(request.population)||Math.floor(Number(request?.design_space?.count)||128))),eliteCount=Math.max(2,Math.min(24,Math.floor(Number(request.elite_count)||8))),convergenceTolerance=clamp(finite(request.convergence_tolerance)?request.convergence_tolerance:.0025,0,.1);
 const baseDesign={...(request.design_space||request),count:population};
 let candidates=Array.isArray(request.candidates)&&request.candidates.length?request.candidates.slice(0,population):generateDesignSpaceR145(baseDesign),last=null;
 const stages=[],history=[];
 for(let generation=0;generation<generations;generation++){
  const stage=await screenBatchR145({...request,candidates,design_space:undefined});
  stages.push(stage);history.push(stageSummary(stage,generation));last=stage;
  if(generation<generations-1)candidates=nextPopulation(stage,generation+1,population,eliteCount);
 }
 const initial=history[0]?.best_objective||0,final=history.at(-1)?.best_objective||0,deltas=history.slice(1).map((x,i)=>round(x.best_objective-history[i].best_objective)),converged=history.length>1&&Math.abs(deltas.at(-1)||0)<=convergenceTolerance;
 const lineage={schema:R145_CAMPAIGN_SCHEMA,engine:R145_CAMPAIGN_ENGINE,generations,population,elite_count:eliteCount,stage_hashes:history.map(x=>x.result_sha256),initial_best:initial,final_best:final,deltas};
 const campaignSha256=await sha256R145(lineage);
 const receipt={schema:'OMEGA_ADAPTIVE_COMPUTE_RECEIPT_R145',state:'RETURNED',engine:R145_CAMPAIGN_ENGINE,campaign_sha256:campaignSha256,stage_result_sha256:history.map(x=>x.result_sha256),generations_completed:history.length,evaluations:history.reduce((s,x)=>s+x.candidate_count,0),initial_best:initial,final_best:final,objective_improvement:round(final-initial),converged,convergence_tolerance:convergenceTolerance,runtime_ms:Date.now()-started,fullwave_validation:false,canonical_mutation:false,downstream_execution_receipt_authority:'R142',deployment_attestation_authority:'R144',canonical_admission_authority:'R125'};
 return{ok:true,schema:R145_CAMPAIGN_SCHEMA,revision:'R145',engine:R145_CAMPAIGN_ENGINE,summary:{generations:history.length,population,evaluations:receipt.evaluations,elite_count:eliteCount,initial_best:initial,final_best:final,objective_improvement:receipt.objective_improvement,converged,best_candidate_id:last?.summary?.best_candidate_id||null,pareto_front_size:last?.summary?.pareto_front_size||0,rcwa_ready:last?.summary?.rcwa_ready||0,fdtd_escalations:last?.summary?.fdtd_escalations||0},history,top_candidates:last?.top_candidates||[],fullwave_queue:last?.fullwave_queue||[],fdtd_requests:last?.fdtd_requests||[],receipt,laws:R145_CAMPAIGN_LAWS,truth_boundary:'Adaptive refinement concentrates deterministic reduced-order evaluation around prior Pareto elites. Better campaign objective is numerical screening evidence only; full-wave execution, independent cross-check, fabrication validity and CanonState admission remain separate proof stages.'};
}

export function adaptiveCampaignManifestR145(){return{schema:R145_CAMPAIGN_SCHEMA,revision:'R145',engine:R145_CAMPAIGN_ENGINE,max_generations:R145_MAX_GENERATIONS,max_population:R145_MAX_POPULATION,max_evaluations:R145_MAX_GENERATIONS*R145_MAX_POPULATION,default_generations:3,default_population:128,default_elite_count:8,laws:R145_CAMPAIGN_LAWS,authority:{screening:'R145',fullwaveExecution:'R142_REQUIRED',deployment:'R144',canonicalAdmission:'R125'},truth_boundary:'Campaign convergence is convergence of the reduced-order search objective, not convergence of Maxwell solvers or physical measurements.'}}
