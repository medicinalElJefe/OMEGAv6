import {applyFullwaveCalibrationR147} from './fullwaveCalibrationR147.js';
import {sha256R145} from './advancedComputationKernelR145.js';

export const R148_SCHEMA='OMEGA_ACTIVE_FULLWAVE_LEARNING_R148';
export const R148_ENGINE='R148_INFORMATION_GAIN_BUDGETED_ACQUISITION_V1';
export const R148_MAX_BUDGET=24;
export const R148_LAWS=Object.freeze([
 'EXPENSIVE_SOLVER_BUDGET_IS_EXPLICIT_AND_BOUNDED',
 'ACTIVE_SELECTION_NEVER_BYPASSES_R145_STAY_AND_RCWA_ELIGIBILITY',
 'NOVELTY_IS_MEASURED_AGAINST_PRIOR_CONVERGED_FULLWAVE_OBSERVATIONS',
 'SELECTION_BALANCES_OBJECTIVE_RISK_MODEL_GAP_AND_DIVERSITY',
 'ACQUISITION_SCORE_IS_NOT_PHYSICAL_TRUTH',
 'SELECTED_CANDIDATES_STILL_REQUIRE_R146_PROMOTION_AND_AUTHENTICATED_EXECUTION',
 'R147_CALIBRATION_HINT_NEVER_BECOMES_CANONSTATE_BY_SELECTION',
 'FAILED_OR_NONCONVERGED_SOLVES_REMAIN_SCAR_EVIDENCE'
]);

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=8)=>Number(Number(v).toFixed(n));
const dist=(a,b)=>Math.sqrt(a.reduce((s,x,i)=>s+(x-b[i])**2,0)/Math.max(1,a.length));

function descriptorFromGeometry(g={},wavelength=550){
 const p=Number(g.pitch_nm),w=Number(g.width_nm),l=Number(g.length_nm),h=Number(g.height_nm),wl=Number(wavelength),theta=((((Number(g.theta_deg)||0)%180)+180)%180)/180;
 if(![p,w,l,h,wl].every(finite)||Math.min(p,w,l,h,wl)<=0)return null;
 const fill=clamp((w*l)/(p*p)),pitchRatio=clamp((p/wl-.25)/1.25),heightRatio=clamp((h/wl-.05)/2.95),aspect=clamp((l/Math.max(w,1e-9)-.25)/3.75),anisotropy=clamp(Math.abs(l-w)/p);
 return[fill,pitchRatio,heightRatio,aspect,anisotropy,theta];
}
function descriptorForRow(row){const c=row?.candidate||{};return descriptorFromGeometry(c.geometry,c.wavelength_nm)}
function descriptorForObservation(o){
 const f=o?.features;if(f&&['fill','pitch_ratio','height_ratio','aspect','anisotropy','theta_norm'].every(k=>finite(f[k])))return[clamp(f.fill),clamp((Number(f.pitch_ratio)-.25)/1.25),clamp((Number(f.height_ratio)-.05)/2.95),clamp((Number(f.aspect)-.25)/3.75),clamp(f.anisotropy),clamp(f.theta_norm)];
 return descriptorFromGeometry(o?.geometry,o?.wavelength_nm)
}
function eligible(row){return row?.proof_projection?.gate==='STAY'&&String(row?.requested_solver||'').toLowerCase()==='rcwa'&&descriptorForRow(row)}
function riskScore(row){const m=row?.metrics||{};return clamp(.3*clamp(m.coupling_proxy_max)+.25*clamp(m.resonance_risk_max)+.2*clamp(m.diffraction_risk_max)+.15*clamp(m.fabrication_sensitivity)+.1*clamp(m.polarization_sensitivity))}
function objectiveScore(row){return clamp(Number(row?.metrics?.objective_score)||0)}
function calibrationGap(row,model){if(!model)return 0;const c=row?.candidate||{},m=row?.metrics||{},nominal=clamp(Number(m.mean_transmission??m.mean_useful_efficiency)||0),g=c.geometry||{},p=Number(g.pitch_nm),w=Number(g.width_nm),l=Number(g.length_nm),h=Number(g.height_nm),wl=Number(c.wavelength_nm)||550;if(![p,w,l,h,wl].every(finite)||Math.min(p,w,l,h,wl)<=0)return 0;const obs={geometry:g,wavelength_nm:wl,r145_transmission:nominal,features:{fill:clamp(w*l/(p*p)),pitch_ratio:p/wl,height_ratio:h/wl,aspect:l/Math.max(1e-9,w),anisotropy:Math.abs(l-w)/p,theta_norm:((((Number(g.theta_deg)||0)%180)+180)%180)/180},r145_metrics:{coupling_proxy:m.coupling_proxy_max||0,diffraction_risk:m.diffraction_risk_max||0,resonance_risk:m.resonance_risk_max||0}};try{return clamp(Math.abs(applyFullwaveCalibrationR147(model,obs)-nominal)/.25)}catch{return 0}}
function minDistance(x,refs){if(!refs.length)return 1;return clamp(Math.min(...refs.map(r=>dist(x,r)))/.7)}

export async function selectActiveFullwaveBatchR148(rows,observations=[],options={}){
 const source=Array.isArray(rows)?rows:[],solved=(Array.isArray(observations)?observations:[]).filter(o=>o?.fullwave_converged===true).map(descriptorForObservation).filter(Boolean),budget=Math.max(1,Math.min(R148_MAX_BUDGET,Math.floor(Number(options.budget)||6))),model=options.calibration_model||null;
 const weights={objective:clamp(options?.weights?.objective??.32),novelty:clamp(options?.weights?.novelty??.28),risk:clamp(options?.weights?.risk??.25),model_gap:clamp(options?.weights?.model_gap??.15),diversity:clamp(options?.weights?.diversity??.22)},sum=weights.objective+weights.novelty+weights.risk+weights.model_gap||1;
 const base=source.map((row,index)=>{const descriptor=descriptorForRow(row);if(!descriptor||!eligible(row))return null;const objective=objectiveScore(row),risk=riskScore(row),novelty=minDistance(descriptor,solved),gap=calibrationGap(row,model),baseAcquisition=(weights.objective*objective+weights.novelty*novelty+weights.risk*risk+weights.model_gap*gap)/sum;return{index,row,descriptor,objective,risk,novelty,model_gap:gap,base_acquisition:clamp(baseAcquisition)}}).filter(Boolean);
 const selected=[],remaining=[...base];
 while(selected.length<budget&&remaining.length){
  let best=null,bestPos=-1;
  for(let i=0;i<remaining.length;i++){
   const item=remaining[i],diversity=selected.length?minDistance(item.descriptor,selected.map(x=>x.descriptor)):1,score=clamp((1-weights.diversity)*item.base_acquisition+weights.diversity*diversity),candidateId=String(item.row?.candidate?.candidate_id||item.index);
   const ranked={...item,diversity,acquisition_score:score,candidate_id:candidateId};
   if(!best||ranked.acquisition_score>best.acquisition_score+1e-12||(Math.abs(ranked.acquisition_score-best.acquisition_score)<=1e-12&&candidateId<best.candidate_id)){best=ranked;bestPos=i}
  }
  const minScore=clamp(options.min_acquisition??.08);if(!best||best.acquisition_score<minScore)break;
  selected.push(best);remaining.splice(bestPos,1);
 }
 const selectedIds=selected.map(x=>x.candidate_id),core={schema:R148_SCHEMA,revision:'R148',engine:R148_ENGINE,budget_requested:budget,budget_selected:selected.length,eligible_candidates:base.length,prior_converged_observations:solved.length,calibration_model_sha256:model?.model_sha256||null,weights,selection:selected.map((x,i)=>({rank:i+1,candidate_id:x.candidate_id,acquisition_score:round(x.acquisition_score),base_acquisition:round(x.base_acquisition),objective:round(x.objective),risk:round(x.risk),novelty:round(x.novelty),model_gap:round(x.model_gap),diversity:round(x.diversity)})),selected_candidate_ids:selectedIds,laws:R148_LAWS};
 const acquisition_sha256=await sha256R145(core);
 return{ok:selected.length>0,...core,acquisition_sha256,selected_rows:selected.map(x=>x.row),state:selected.length?'SELECTED_FOR_R146_PROMOTION':'HOLD_NO_HIGH_VALUE_ELIGIBLE_QUERY',canonical_mutation:false,fullwave_validation:false,truth_boundary:'R148 allocates a bounded expensive-solver budget using deterministic information-value proxies. Selection does not execute RCWA, does not validate physics, and cannot bypass R145 proof eligibility, R146 promotion, authenticated Sovereign execution, or R125 admission.'};
}

export function activeFullwaveLearningManifestR148(){return{schema:R148_SCHEMA,revision:'R148',engine:R148_ENGINE,max_budget:R148_MAX_BUDGET,criteria:['R145 objective value','unresolved physics risk','distance from converged full-wave observations','optional R147 model-correction magnitude','within-batch descriptor diversity'],laws:R148_LAWS,authority:{selection:'ADVISORY_BUDGET_ALLOCATION',promotion:'R146_REQUIRED',calibration:'R147_HINT_ONLY',execution:'R142_REQUIRED',canonicalAdmission:'R125'}}}
