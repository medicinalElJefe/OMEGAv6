import {sha256R145} from './advancedComputationKernelR145.js';

export const R149_SCHEMA='OMEGA_GENERALIZATION_COVERAGE_R149';
export const R149_ENGINE='R149_GENERALIZATION_COVERAGE_CLOSURE_V1';
export const R149_MIN_OBSERVATIONS=32;
export const R149_TARGET_REGIONS=16;
export const R149_MAX_BUDGET=24;
export const R149_LAWS=Object.freeze([
 'GENERALIZATION_FAILURE_IS_EVIDENCE_NOT_PERMISSION_TO_RELAX_GATES',
 'COVERAGE_MUST_BE_MEASURED_BEFORE_CALIBRATION_RETEST',
 'ONLY_CONVERGED_R146_OBSERVATIONS_COUNT_AS_SOLVED_EVIDENCE',
 'COVERAGE_SELECTION_NEVER_BYPASSES_R145_STAY_AND_RCWA_ELIGIBILITY',
 'UNDEROBSERVED_HIGH_RESIDUAL_REGIONS_RECEIVE_PRIORITY',
 'DIVERSITY_PREVENTS_EXPENSIVE_SOLVER_COLLAPSE_INTO_ONE_NEIGHBORHOOD',
 'R149_READY_MEANS_RETEST_R147_NOT_ADMIT_MODEL',
 'FABRICATION_TRUTH_REMAINS_EXTERNAL_TO_NUMERICAL_COVERAGE'
]);

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=8)=>Number(Number(v).toFixed(n));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const std=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
const q=(a,p)=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?s[lo]:s[lo]+(s[hi]-s[lo])*(i-lo)};
const distance=(a,b)=>Math.sqrt(a.reduce((s,x,i)=>s+(x-b[i])**2,0)/Math.max(1,a.length));

function rawDescriptorFromGeometry(g={},wavelength=550){
 const pitch=Number(g.pitch_nm),width=Number(g.width_nm),length=Number(g.length_nm),height=Number(g.height_nm),wl=Number(wavelength),theta=((((Number(g.theta_deg)||0)%180)+180)%180)/180;
 if(![pitch,width,length,height,wl].every(finite)||Math.min(pitch,width,length,height,wl)<=0)return null;
 return{fill:clamp(width*length/(pitch*pitch)),pitch_ratio:pitch/wl,height_ratio:height/wl,aspect:length/Math.max(1e-9,width),anisotropy:clamp(Math.abs(length-width)/pitch),theta_norm:theta};
}
function rawDescriptorObservation(o){const f=o?.features;if(f&&['fill','pitch_ratio','height_ratio','aspect','anisotropy','theta_norm'].every(k=>finite(f[k])))return{fill:Number(f.fill),pitch_ratio:Number(f.pitch_ratio),height_ratio:Number(f.height_ratio),aspect:Number(f.aspect),anisotropy:Number(f.anisotropy),theta_norm:Number(f.theta_norm)};return rawDescriptorFromGeometry(o?.geometry,o?.wavelength_nm)}
function vector(f){return[clamp(f.fill),clamp((f.pitch_ratio-.25)/1.25),clamp((f.height_ratio-.05)/2.95),clamp((f.aspect-.25)/3.75),clamp(f.anisotropy),clamp(f.theta_norm)]}
function validObservation(o){return Boolean(o&&o.schema==='OMEGA_CALIBRATION_OBSERVATION_R147'&&o.fullwave_converged===true&&finite(o.r145_transmission)&&finite(o.fullwave_transmission)&&rawDescriptorObservation(o))}
function observationRow(o){const f=rawDescriptorObservation(o);return{source:o,features:f,descriptor:vector(f),residual:Number(o.fullwave_transmission)-Number(o.r145_transmission),abs_residual:Math.abs(Number(o.fullwave_transmission)-Number(o.r145_transmission))}}
function regionId(f){const bit=(x,t)=>Number(x>=t);return `R${bit(f.fill,.34)}${bit(f.pitch_ratio,.62)}${bit(f.height_ratio,.9)}${bit(f.anisotropy,.24)}`}
function eligible(row){return row?.proof_projection?.gate==='STAY'&&String(row?.requested_solver||'').toLowerCase()==='rcwa'&&rawDescriptorFromGeometry(row?.candidate?.geometry,row?.candidate?.wavelength_nm)}
function candidateRisk(row){const m=row?.metrics||{};return clamp(.28*clamp(m.coupling_proxy_max)+.24*clamp(m.resonance_risk_max)+.18*clamp(m.diffraction_risk_max)+.16*clamp(m.fabrication_sensitivity)+.14*clamp(m.polarization_sensitivity))}
function candidateObjective(row){return clamp(Number(row?.metrics?.objective_score)||0)}

export async function analyzeGeneralizationCoverageR149(observations,options={}){
 const solved=(Array.isArray(observations)?observations:[]).filter(validObservation).map(observationRow),minObservations=Math.max(16,Math.floor(Number(options.min_observations)||R149_MIN_OBSERVATIONS)),minOccupiedFraction=clamp(options.min_occupied_fraction??.625,.25,1),maxP90Nearest=Math.max(.05,Math.min(1,Number(options.max_p90_nearest)||.26)),maxRegionResidual=Math.max(.005,Math.min(.5,Number(options.max_region_mean_abs_residual)||.12));
 const regions=new Map();for(let i=0;i<16;i++)regions.set(`R${i.toString(2).padStart(4,'0')}`,[]);for(const row of solved)regions.get(regionId(row.features))?.push(row);
 const regionRows=[...regions.entries()].map(([id,rows])=>({id,count:rows.length,mean_abs_residual:round(mean(rows.map(x=>x.abs_residual))),residual_std:round(std(rows.map(x=>x.residual))),max_abs_residual:round(Math.max(0,...rows.map(x=>x.abs_residual))),r145_receipts:[...new Set(rows.map(x=>String(x.source.r145_receipt||'')).filter(Boolean))].length,r146_results:[...new Set(rows.map(x=>String(x.source.r146_result_sha256||'')).filter(Boolean))].length}));
 const occupied=regionRows.filter(x=>x.count>0),occupiedFraction=occupied.length/R149_TARGET_REGIONS,descriptors=solved.map(x=>x.descriptor),nearest=descriptors.map((x,i)=>{if(descriptors.length<2)return 1;return Math.min(...descriptors.filter((_,j)=>j!==i).map(y=>distance(x,y)))}),p90Nearest=q(nearest,.9),worstObservedResidual=Math.max(0,...occupied.map(x=>x.mean_abs_residual)),undercovered=regionRows.filter(x=>x.count<Math.max(1,Math.floor(Number(options.target_per_region)||2))).sort((a,b)=>a.count-b.count||b.mean_abs_residual-a.mean_abs_residual||a.id.localeCompare(b.id));
 const spread=descriptors.length?descriptors[0].map((_,j)=>q(descriptors.map(x=>x[j]),.9)-q(descriptors.map(x=>x[j]),.1)):Array(6).fill(0),spreadPass=spread.slice(0,5).filter(x=>x>=.12).length>=4;
 const enough=solved.length>=minObservations,coveragePass=occupiedFraction>=minOccupiedFraction&&p90Nearest<=maxP90Nearest&&spreadPass,residualPass=worstObservedResidual<=maxRegionResidual,state=!enough?'HOLD_INSUFFICIENT_OBSERVATIONS':coveragePass?'READY_FOR_R147_RETEST':'NEEDS_COVERAGE';
 const core={schema:R149_SCHEMA,revision:'R149',engine:R149_ENGINE,state,observations:solved.length,required_observations:minObservations,occupied_regions:occupied.length,total_regions:R149_TARGET_REGIONS,occupied_fraction:round(occupiedFraction),p90_nearest_neighbor_distance:round(p90Nearest),max_p90_nearest:maxP90Nearest,descriptor_spread_p10_p90:spread.map(x=>round(x)),spread_pass:spreadPass,worst_region_mean_abs_residual:round(worstObservedResidual),max_region_mean_abs_residual:maxRegionResidual,residual_stability_pass:residualPass,coverage_pass:coveragePass,regions:regionRows,undercovered_regions:undercovered.slice(0,16).map(x=>x.id),laws:R149_LAWS,canonical_mutation:false,calibration_model_admitted:false,physical_validation:false};
 const coverage_sha256=await sha256R145(core);return{ok:state==='READY_FOR_R147_RETEST',...core,coverage_sha256,truth_boundary:state==='READY_FOR_R147_RETEST'?'Coverage is broad enough to justify another independent R147 cross-validation attempt. READY does not approve or deploy a calibration model.':'Coverage evidence is not broad enough for calibration release. More targeted full-wave evidence is required; thresholds are not relaxed.'};
}

function localEvidence(candidateDescriptor,solved){
 if(!solved.length)return{nearest:1,coverage_deficit:1,local_abs_residual:1,local_instability:1,neighbors:0};
 const sorted=solved.map(x=>({...x,d:distance(candidateDescriptor,x.descriptor)})).sort((a,b)=>a.d-b.d),neighbors=sorted.slice(0,Math.min(7,sorted.length)),nearest=neighbors[0]?.d??1,weights=neighbors.map(x=>Math.exp(-(x.d*x.d)/(.18*.18))),ws=weights.reduce((s,x)=>s+x,0)||1,weightedAbs=neighbors.reduce((s,x,i)=>s+x.abs_residual*weights[i],0)/ws,weightedMean=neighbors.reduce((s,x,i)=>s+x.residual*weights[i],0)/ws,weightedVar=neighbors.reduce((s,x,i)=>s+(x.residual-weightedMean)**2*weights[i],0)/ws,density=neighbors.reduce((s,x)=>s+Math.exp(-(x.d*x.d)/(.14*.14)),0);
 return{nearest:clamp(nearest/.65),coverage_deficit:1-clamp(density/2.5),local_abs_residual:clamp(weightedAbs/.16),local_instability:clamp(Math.sqrt(weightedVar)/.12),neighbors:neighbors.length};
}

export async function selectCoverageClosureBatchR149(candidateRows,observations,options={}){
 const solved=(Array.isArray(observations)?observations:[]).filter(validObservation).map(observationRow),source=Array.isArray(candidateRows)?candidateRows:[],budget=Math.max(1,Math.min(R149_MAX_BUDGET,Math.floor(Number(options.budget)||8))),minScore=clamp(options.min_score??.12),weights={coverage:clamp(options?.weights?.coverage??.34),instability:clamp(options?.weights?.instability??.2),residual:clamp(options?.weights?.residual??.16),risk:clamp(options?.weights?.risk??.14),objective:clamp(options?.weights?.objective??.1),diversity:clamp(options?.weights?.diversity??.22)};
 const base=source.map((row,index)=>{if(!eligible(row))return null;const f=rawDescriptorFromGeometry(row.candidate.geometry,row.candidate.wavelength_nm),descriptor=vector(f),local=localEvidence(descriptor,solved),region=regionId(f),regionCount=solved.filter(x=>regionId(x.features)===region).length,regionDeficit=1-clamp(regionCount/3),coverage=clamp(.62*local.coverage_deficit+.38*regionDeficit),instability=local.local_instability,residual=local.local_abs_residual,risk=candidateRisk(row),objective=candidateObjective(row),denom=weights.coverage+weights.instability+weights.residual+weights.risk+weights.objective||1,base_score=clamp((weights.coverage*coverage+weights.instability*instability+weights.residual*residual+weights.risk*risk+weights.objective*objective)/denom);return{row,index,candidate_id:String(row?.candidate?.candidate_id||index),descriptor,region,region_count:regionCount,coverage_deficit:coverage,local_instability:instability,local_abs_residual:residual,risk,objective,nearest:local.nearest,base_score}}).filter(Boolean),selected=[],remaining=[...base];
 while(selected.length<budget&&remaining.length){let best=null,bestIndex=-1;for(let i=0;i<remaining.length;i++){const item=remaining[i],diversity=selected.length?clamp(Math.min(...selected.map(x=>distance(item.descriptor,x.descriptor)))/.6):1,score=clamp((1-weights.diversity)*item.base_score+weights.diversity*diversity),ranked={...item,diversity,closure_score:score};if(!best||score>best.closure_score+1e-12||(Math.abs(score-best.closure_score)<=1e-12&&item.candidate_id<best.candidate_id)){best=ranked;bestIndex=i}}if(!best||best.closure_score<minScore)break;selected.push(best);remaining.splice(bestIndex,1)}
 const core={schema:'OMEGA_GENERALIZATION_COVERAGE_SELECTION_R149',revision:'R149',engine:R149_ENGINE,state:selected.length?'SELECTED_FOR_R148_R146_EXECUTION':'HOLD_NO_ELIGIBLE_COVERAGE_QUERY',budget_requested:budget,budget_selected:selected.length,eligible_candidates:base.length,prior_converged_observations:solved.length,weights,selection:selected.map((x,i)=>({rank:i+1,candidate_id:x.candidate_id,region:x.region,region_count:x.region_count,closure_score:round(x.closure_score),coverage_deficit:round(x.coverage_deficit),local_instability:round(x.local_instability),local_abs_residual:round(x.local_abs_residual),risk:round(x.risk),objective:round(x.objective),novelty:round(x.nearest),diversity:round(x.diversity)})),selected_candidate_ids:selected.map(x=>x.candidate_id),laws:R149_LAWS,canonical_mutation:false,fullwave_validation:false,calibration_model_admitted:false};
 const selection_sha256=await sha256R145(core);return{ok:selected.length>0,...core,selection_sha256,selected_rows:selected.map(x=>x.row),truth_boundary:'R149 targets missing generalization evidence. Selection is not model admission or RCWA execution; selected rows still require R148 budget policy, R146 promotion, authenticated Sovereign execution, and a fresh R147 holdout gate.'};
}

export function generalizationCoverageManifestR149(){return{schema:R149_SCHEMA,revision:'R149',engine:R149_ENGINE,min_observations:R149_MIN_OBSERVATIONS,target_regions:R149_TARGET_REGIONS,max_budget:R149_MAX_BUDGET,criteria:['coarse descriptor-region occupancy','nearest-neighbor spacing','descriptor spread','local RCWA residual magnitude','local residual instability','R145 physics risk','R145 objective value','within-batch diversity'],laws:R149_LAWS,authority:{coverage:'EVIDENCE_GAP_DIAGNOSTIC',selection:'ADVISORY_QUERY_SET',budget:'R148_REQUIRED',promotion:'R146_REQUIRED',calibrationRetest:'R147_REQUIRED',execution:'R142_REQUIRED',canonicalAdmission:'R125'}}}
