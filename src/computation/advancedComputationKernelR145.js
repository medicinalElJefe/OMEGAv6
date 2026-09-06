export const R145_COMPUTE_SCHEMA='OMEGA_ADVANCED_COMPUTATION_R145';
export const R145_BATCH_SCHEMA='OMEGA_COMPUTE_BATCH_RESULT_R145';
export const R145_RECEIPT_SCHEMA='OMEGA_COMPUTE_RECEIPT_R145';
export const R145_ENGINE='R145_PHYSICS_INFORMED_REDUCED_ORDER_V1';
export const R145_MAX_CANDIDATES=256;
export const R145_MAX_WAVELENGTHS=13;
export const R145_LAWS=Object.freeze([
 'REDUCED_ORDER_IS_NOT_FULLWAVE_MAXWELL_VALIDATION',
 'PARETO_RANK_IS_NOT_CANONSTATE_ADMISSION',
 'RCWA_QUEUE_REQUIRES_SCREEN_PROOF_STAY',
 'FDTD_LABEL_REQUIRES_REAL_EXECUTOR_RETURN',
 'FABRICATION_CLAIM_REQUIRES_INDEPENDENT_MEASUREMENT',
 'R142_REMAINS_EXECUTION_RECEIPT_AUTHORITY',
 'R144_REMAINS_DEPLOYMENT_ATTESTATION_AUTHORITY',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

const PI=Math.PI;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=6)=>Number(Number(v).toFixed(n));
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const rms=a=>a.length?Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length):0;
const variance=a=>{if(!a.length)return 0;const m=mean(a);return mean(a.map(v=>(v-m)*(v-m)))};
const std=a=>Math.sqrt(variance(a));
const min=a=>a.length?Math.min(...a):0;
const max=a=>a.length?Math.max(...a):0;
const deg2rad=d=>Number(d)*PI/180;
const wrapDeg=d=>((Number(d)%360)+360)%360;
export const circularDeltaDegR145=(a,b)=>Math.abs((((Number(a)-Number(b))+180)%360+360)%360-180);

function stableObject(value){
 if(Array.isArray(value))return value.map(stableObject);
 if(value&&typeof value==='object'){const out={};for(const key of Object.keys(value).sort())out[key]=stableObject(value[key]);return out}
 return value;
}
export async function sha256R145(value){
 const data=new TextEncoder().encode(JSON.stringify(stableObject(value)));
 const digest=await crypto.subtle.digest('SHA-256',data);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

function validGeometry(g){return Boolean(g&&['pitch_nm','width_nm','length_nm','height_nm'].every(k=>finite(g[k])&&Number(g[k])>0)&&Number(g.width_nm)<Number(g.pitch_nm)&&Number(g.length_nm)<Number(g.pitch_nm))}
function normalizeMaterial(m={}){
 return{
  n_incident:finite(m.n_incident)&&Number(m.n_incident)>0?Number(m.n_incident):1,
  n_feature:finite(m.n_feature)&&Number(m.n_feature)>0?Number(m.n_feature):2,
  n_background:finite(m.n_background)&&Number(m.n_background)>0?Number(m.n_background):1,
  n_substrate:finite(m.n_substrate)&&Number(m.n_substrate)>0?Number(m.n_substrate):1.46
 };
}
function normalizeCandidate(candidate,index=0){
 const g=candidate?.geometry||candidate||{},material=normalizeMaterial(candidate?.material_model||candidate?.material||{});
 if(!validGeometry(g))throw new Error(`candidate ${index} requires positive pitch/width/length/height with width,length < pitch`);
 const wavelength=finite(candidate?.wavelength_nm)&&Number(candidate.wavelength_nm)>0?Number(candidate.wavelength_nm):550;
 return{
  candidate_id:String(candidate?.candidate_id||candidate?.packet_id||`r145_candidate_${String(index+1).padStart(4,'0')}`),
  source_packet_id:candidate?.packet_id||candidate?.source_packet_id||null,
  state_id:candidate?.state_id||null,
  atlas_address:candidate?.atlas_address||null,
  source_sha:candidate?.source_sha||null,
  geometry:{pitch_nm:Number(g.pitch_nm),width_nm:Number(g.width_nm),length_nm:Number(g.length_nm),height_nm:Number(g.height_nm),theta_deg:finite(g.theta_deg)?Number(g.theta_deg):0,material:g.material||'NUMERIC_INDEX_MODEL'},
  wavelength_nm:wavelength,
  target_phase_deg:wrapDeg(finite(candidate?.target_phase_deg)?candidate.target_phase_deg:0),
  sigma:[-1,0,1].includes(Number(candidate?.sigma))?Number(candidate.sigma):0,
  material_model:material,
  proof:candidate?.proof&&typeof candidate.proof==='object'?candidate.proof:null,
  lineage:Array.isArray(candidate?.lineage)?[...candidate.lineage]:[],
  polarization:String(candidate?.polarization||'both').toLowerCase()
 };
}

function halton(index,base){let f=1,r=0,i=index;while(i>0){f/=base;r+=f*(i%base);i=Math.floor(i/base)}return r}
export function generateDesignSpaceR145(spec={}){
 const count=Math.max(1,Math.min(R145_MAX_CANDIDATES,Math.floor(Number(spec.count)||64)));
 const wavelength=finite(spec.wavelength_nm)&&Number(spec.wavelength_nm)>0?Number(spec.wavelength_nm):550;
 const material=normalizeMaterial(spec.material_model||{});
 const range=(name,lo,hi)=>{const x=spec?.ranges?.[name];if(Array.isArray(x)&&x.length===2&&finite(x[0])&&finite(x[1])&&Number(x[1])>Number(x[0]))return[Number(x[0]),Number(x[1])];return[lo,hi]};
 const pitchRange=range('pitch_nm',Math.max(180,.42*wavelength),Math.max(260,.88*wavelength));
 const widthRange=range('width_nm',Math.max(40,.12*wavelength),Math.max(90,.62*wavelength));
 const lengthRange=range('length_nm',Math.max(40,.12*wavelength),Math.max(110,.72*wavelength));
 const heightRange=range('height_nm',Math.max(80,.22*wavelength),Math.max(220,1.15*wavelength));
 const out=[];
 for(let i=1;i<=count;i++){
  const pitch=pitchRange[0]+halton(i,2)*(pitchRange[1]-pitchRange[0]);
  const rawW=widthRange[0]+halton(i,3)*(widthRange[1]-widthRange[0]);
  const rawL=lengthRange[0]+halton(i,5)*(lengthRange[1]-lengthRange[0]);
  const width=Math.min(rawW,pitch*.92),length=Math.min(rawL,pitch*.92),height=heightRange[0]+halton(i,7)*(heightRange[1]-heightRange[0]);
  out.push({candidate_id:`r145_halton_${String(i).padStart(4,'0')}`,geometry:{pitch_nm:round(pitch,4),width_nm:round(width,4),length_nm:round(length,4),height_nm:round(height,4),theta_deg:round(180*halton(i,11),4),material:'NUMERIC_INDEX_MODEL'},wavelength_nm:wavelength,target_phase_deg:wrapDeg(finite(spec.target_phase_deg)?spec.target_phase_deg:0),sigma:[-1,0,1].includes(Number(spec.sigma))?Number(spec.sigma):0,material_model:material,lineage:['r145:halton-design-space']});
 }
 return out;
}

function effectiveIndexR145(c,pol){
 const g=c.geometry,m=c.material_model,pitch=g.pitch_nm,fill=clamp((g.width_nm*g.length_nm)/(pitch*pitch),1e-6,.999999),epsF=m.n_feature*m.n_feature,epsB=m.n_background*m.n_background;
 const epsParallel=fill*epsF+(1-fill)*epsB;
 const epsPerpendicular=1/(fill/epsF+(1-fill)/epsB);
 const theta=deg2rad(g.theta_deg||0),lab=pol==='p'?PI/2:0,alignment=Math.cos(lab-theta)**2;
 const eps=alignment*epsParallel+(1-alignment)*epsPerpendicular;
 return{nEff:Math.sqrt(Math.max(1e-9,eps)),fill,epsParallel,epsPerpendicular};
}
function slabTransmissionR145(n0,n1,n2,heightNm,wavelengthNm){
 const delta=2*PI*n1*heightNm/wavelengthNm,r01=(n0-n1)/(n0+n1),r12=(n1-n2)/(n1+n2),t01=2*n0/(n0+n1),t12=2*n1/(n1+n2),q=r01*r12,cr=Math.cos(2*delta),si=Math.sin(2*delta),denRe=1+q*cr,denIm=q*si,den2=denRe*denRe+denIm*denIm,num=t01*t12;
 const amp2=(num*num)/Math.max(1e-12,den2),T=clamp((n2/n0)*amp2,0,1),R=clamp(1-T,0,1);
 return{T,R,delta};
}
function screenPointR145(c,wavelength,pol){
 const g=c.geometry,m=c.material_model,{nEff,fill}=effectiveIndexR145(c,pol),slab=slabTransmissionR145(m.n_incident,nEff,m.n_substrate,g.height_nm,wavelength),phase=wrapDeg(360*(nEff-m.n_background)*g.height_nm/wavelength),phaseError=circularDeltaDegR145(phase,c.target_phase_deg),gap=Math.max(0,g.pitch_nm-Math.max(g.width_nm,g.length_nm)),decay=Math.sqrt(Math.max(.01,nEff*nEff-m.n_background*m.n_background)),coupling=clamp(Math.exp(-2*PI*(gap/wavelength)*decay)),nMax=Math.max(m.n_incident,m.n_substrate),rayleighMargin=wavelength/(g.pitch_nm*nMax)-1,diffractionRisk=clamp(-rayleighMargin/.35),phaseAccuracy=clamp(1-phaseError/180),usefulEfficiency=clamp(slab.T*phaseAccuracy*(1-.6*diffractionRisk)*(1-.35*coupling)),resonanceRisk=clamp(Math.abs(Math.sin(slab.delta))*coupling+.55*diffractionRisk);
 return{wavelength_nm:wavelength,polarization:pol,n_eff:round(nEff),fill_fraction:round(fill),transmission:round(slab.T),reflection:round(slab.R),predicted_phase_deg:round(phase),phase_error_deg:round(phaseError),rayleigh_margin:round(rayleighMargin),diffraction_risk:round(diffractionRisk),coupling_proxy:round(coupling),resonance_risk:round(resonanceRisk),useful_efficiency:round(usefulEfficiency)};
}
function wavelengthGridR145(c,request={}){
 if(Array.isArray(request.wavelengths_nm)&&request.wavelengths_nm.length){const xs=[...new Set(request.wavelengths_nm.filter(x=>finite(x)&&Number(x)>0).map(Number))].sort((a,b)=>a-b).slice(0,R145_MAX_WAVELENGTHS);if(xs.length)return xs}
 const count=Math.max(1,Math.min(R145_MAX_WAVELENGTHS,Math.floor(Number(request.spectral_points)||5))),bw=clamp(finite(request.fractional_bandwidth)?request.fractional_bandwidth:.12,0,.8);if(count===1)return[c.wavelength_nm];
 return Array.from({length:count},(_,i)=>round(c.wavelength_nm*(1-bw/2+bw*i/(count-1)),6));
}
function perturbationsR145(c,toleranceNm){
 const t=Math.max(0,Number(toleranceNm)||0),g=c.geometry;if(!t)return[{name:'nominal',geometry:g}];
 const mk=(name,dw=0,dl=0,dh=0)=>({name,geometry:{...g,width_nm:Math.max(1,Math.min(g.pitch_nm*.98,g.width_nm+dw)),length_nm:Math.max(1,Math.min(g.pitch_nm*.98,g.length_nm+dl)),height_nm:Math.max(1,g.height_nm+dh)}});
 return[mk('nominal'),mk('width-',-t),mk('width+',t),mk('length-',0,-t),mk('length+',0,t),mk('height-',0,0,-t),mk('height+',0,0,t),mk('correlated-',-t,-t,-t),mk('correlated+',t,t,t)];
}
function solverRouteR145(metrics){
 if(metrics.rayleigh_margin_min<0||metrics.coupling_proxy_max>.22||metrics.resonance_risk_max>.72||metrics.fabrication_sensitivity>.38)return'fdtd';
 return'rcwa';
}
function proofProjectionR145(metrics){
 const phaseAccuracy=clamp(1-metrics.phase_rms_deg/180),rayleighHealth=clamp(.5+.5*metrics.rayleigh_margin_min),robustness=clamp(metrics.robustness_score),efficiency=clamp(metrics.mean_useful_efficiency),contradiction=clamp(.42*(1-phaseAccuracy)+.23*metrics.coupling_proxy_max+.2*clamp(-metrics.rayleigh_margin_min)+.15*metrics.polarization_sensitivity),scar=clamp(.45*metrics.fabrication_sensitivity+.3*metrics.coupling_proxy_max+.25*metrics.resonance_sensitivity),burden=clamp(.15+.3*(1-robustness)+.2*metrics.resonance_risk_max+.15*metrics.diffraction_risk_max),continuity=clamp(.38*efficiency+.23*robustness+.22*phaseAccuracy+.17*rayleighHealth),mode188=Math.max(0,1+.68*metrics.objective_score-.24*contradiction-.14*burden),gate=mode188>=1.05&&contradiction<.75?'STAY':'TURN';
 return{gate,mode188_score:round(mode188),continuity:round(continuity),burden:round(burden),contradiction:round(contradiction),scar:round(scar),authority:'R145_SCREENING_PROJECTION_NOT_CANONSTATE_ADMISSION'};
}
function queueRequestR145(c,metrics,proof){
 const solver=solverRouteR145(metrics);if(proof.gate!=='STAY')return null;
 if(solver!=='rcwa')return{schema:'OMEGA_FULLWAVE_REQUEST_R145',state:'CAPABILITY_REQUIRED',solver,source_candidate_id:c.candidate_id,reason:'R145 selected FDTD because periodic reduced-order assumptions are under stress. No FDTD execution is claimed until a real executor returns proof.',canonical_mutation:false};
 const complexity=clamp(.35*metrics.coupling_proxy_max+.25*metrics.resonance_risk_max+.2*metrics.fabrication_sensitivity+.2*metrics.diffraction_risk_max),harmonicsLow=Math.max(25,Math.min(81,25+Math.round(32*complexity))),harmonicsHigh=Math.max(harmonicsLow+8,Math.min(121,harmonicsLow+16+Math.round(24*complexity)));
 return{schema:'OMEGA_FULLWAVE_QUEUE_v1',job_id:`r145_${c.candidate_id}`,source_packet_id:c.source_packet_id||c.candidate_id,solver:'rcwa',geometry:c.geometry,wavelength_nm:c.wavelength_nm,polarization:'s',material_model:c.material_model,numerics:{nx:64,ny:64,harmonics_low:harmonicsLow,harmonics_high:harmonicsHigh,convergence_tolerance:.025,energy_tolerance:.025,incidence_theta_deg:0,incidence_phi_deg:0,spectral_points:Math.max(5,Math.min(13,Math.round(5+8*complexity)))},proof,lineage:[...c.lineage,`r145:advanced-screen:${c.candidate_id}`,'r145:rcwa-queue-request'],priority:round(.4+.6*metrics.objective_score),truth_boundary:'Queue readiness is not RCWA execution. A current authenticated Sovereign worker and R141/R142 returned proof are still required.'};
}
export function screenCandidateR145(candidate,request={},index=0){
 const c=normalizeCandidate(candidate,index),wavelengths=wavelengthGridR145(c,request),polarizations=request.polarizations||['s','p'],points=[];
 for(const wavelength of wavelengths)for(const pol of polarizations)points.push(screenPointR145(c,wavelength,String(pol).toLowerCase()==='p'?'p':'s'));
 const efficiencies=points.map(x=>x.useful_efficiency),phaseErrors=points.map(x=>x.phase_error_deg),couplings=points.map(x=>x.coupling_proxy),rayleigh=points.map(x=>x.rayleigh_margin),diffraction=points.map(x=>x.diffraction_risk),resonance=points.map(x=>x.resonance_risk),sEff=points.filter(x=>x.polarization==='s').map(x=>x.useful_efficiency),pEff=points.filter(x=>x.polarization==='p').map(x=>x.useful_efficiency),polSensitivity=Math.abs(mean(sEff)-mean(pEff));
 const tol=Math.max(0,Number(request.fabrication_tolerance_nm)||5),perturb=perturbationsR145(c,tol),robustSamples=[];
 for(const p of perturb){const pc={...c,geometry:p.geometry},sp=screenPointR145(pc,c.wavelength_nm,'s'),pp=screenPointR145(pc,c.wavelength_nm,'p');robustSamples.push(mean([sp.useful_efficiency,pp.useful_efficiency]))}
 const fabricationSensitivity=clamp(std(robustSamples)/Math.max(.05,mean(robustSamples))),robustness=clamp(min(robustSamples)/(Math.max(.05,mean(robustSamples)))),resonanceSensitivity=clamp(std(resonance)/Math.max(.08,mean(resonance)+.08)),phaseRms=rms(phaseErrors),phaseAccuracy=clamp(1-phaseRms/180),rayleighHealth=clamp(.5+.5*min(rayleigh)),objective=clamp(.29*mean(efficiencies)+.16*min(efficiencies)+.18*phaseAccuracy+.14*robustness+.09*(1-max(couplings))+.07*rayleighHealth+.04*(1-polSensitivity)+.03*(1-resonanceSensitivity));
 const metrics={mean_useful_efficiency:round(mean(efficiencies)),min_useful_efficiency:round(min(efficiencies)),mean_transmission:round(mean(points.map(x=>x.transmission))),phase_rms_deg:round(phaseRms),phase_max_deg:round(max(phaseErrors)),polarization_sensitivity:round(polSensitivity),rayleigh_margin_min:round(min(rayleigh)),diffraction_risk_max:round(max(diffraction)),coupling_proxy_max:round(max(couplings)),resonance_risk_max:round(max(resonance)),resonance_sensitivity:round(resonanceSensitivity),fabrication_sensitivity:round(fabricationSensitivity),robustness_score:round(robustness),objective_score:round(objective),spectral_points:wavelengths.length,polarization_points:polarizations.length,perturbation_points:perturb.length};
 const proof=proofProjectionR145(metrics),requestedSolver=solverRouteR145(metrics),fullwave=queueRequestR145(c,metrics,proof);
 return{schema:'OMEGA_COMPUTE_CANDIDATE_R145',candidate:c,metrics,proof_projection:proof,requested_solver:requestedSolver,fullwave_request:fullwave,points,robustness_samples:robustSamples.map(round),truth_boundary:'R145 uses effective-medium, thin-film, Rayleigh-margin, evanescent-coupling and perturbation models for screening. These are physics-informed reduced-order approximations, not RCWA/FDTD/FEM or measurement.'};
}

function dominatesR145(a,b){
 const am=a.metrics,bm=b.metrics,betterOrEqual=am.mean_useful_efficiency>=bm.mean_useful_efficiency&&am.min_useful_efficiency>=bm.min_useful_efficiency&&am.robustness_score>=bm.robustness_score&&am.phase_rms_deg<=bm.phase_rms_deg&&am.coupling_proxy_max<=bm.coupling_proxy_max&&am.fabrication_sensitivity<=bm.fabrication_sensitivity,strict=am.mean_useful_efficiency>bm.mean_useful_efficiency||am.min_useful_efficiency>bm.min_useful_efficiency||am.robustness_score>bm.robustness_score||am.phase_rms_deg<bm.phase_rms_deg||am.coupling_proxy_max<bm.coupling_proxy_max||am.fabrication_sensitivity<bm.fabrication_sensitivity;return betterOrEqual&&strict;
}
function paretoRanksR145(rows){
 const remaining=new Set(rows.map((_,i)=>i)),ranks=Array(rows.length).fill(0);let rank=1;
 while(remaining.size){const front=[];for(const i of remaining){let dominated=false;for(const j of remaining){if(i!==j&&dominatesR145(rows[j],rows[i])){dominated=true;break}}if(!dominated)front.push(i)}if(!front.length){for(const i of remaining)ranks[i]=rank;break}for(const i of front){ranks[i]=rank;remaining.delete(i)}rank++}
 return ranks;
}
export async function screenBatchR145(request={}){
 const started=Date.now(),generated=!Array.isArray(request.candidates)||!request.candidates.length,candidates=(generated?generateDesignSpaceR145(request.design_space||request):request.candidates).slice(0,R145_MAX_CANDIDATES),rows=candidates.map((c,i)=>screenCandidateR145(c,request,i)),ranks=paretoRanksR145(rows);
 rows.forEach((row,i)=>row.pareto_rank=ranks[i]);rows.sort((a,b)=>a.pareto_rank-b.pareto_rank||b.metrics.objective_score-a.metrics.objective_score||b.metrics.robustness_score-a.metrics.robustness_score);
 const rcwaReady=rows.filter(r=>r.proof_projection.gate==='STAY'&&r.requested_solver==='rcwa'&&r.fullwave_request?.schema==='OMEGA_FULLWAVE_QUEUE_v1'),fdtdNeeded=rows.filter(r=>r.proof_projection.gate==='STAY'&&r.requested_solver==='fdtd'),screenOnly=rows.filter(r=>r.proof_projection.gate!=='STAY'),requestFingerprint={schema:R145_COMPUTE_SCHEMA,engine:R145_ENGINE,generated,candidateCount:candidates.length,wavelengths:request.wavelengths_nm||null,spectral_points:request.spectral_points||5,fractional_bandwidth:request.fractional_bandwidth??.12,fabrication_tolerance_nm:request.fabrication_tolerance_nm??5,design_space:request.design_space||null,candidateIds:candidates.map((c,i)=>String(c?.candidate_id||c?.packet_id||i))},sourceHash=await sha256R145(requestFingerprint),resultFingerprint=rows.map(r=>({id:r.candidate.candidate_id,pareto:r.pareto_rank,metrics:r.metrics,gate:r.proof_projection.gate,solver:r.requested_solver})),resultHash=await sha256R145(resultFingerprint),runtimeMs=Date.now()-started;
 const receipt={schema:R145_RECEIPT_SCHEMA,state:'RETURNED',engine:R145_ENGINE,source_sha256:sourceHash,result_sha256:resultHash,candidate_count:rows.length,rcwa_ready:rcwaReady.length,fdtd_escalations:fdtdNeeded.length,screen_only:screenOnly.length,runtime_ms:runtimeMs,fullwave_validation:false,canonical_mutation:false,execution_authority:'R145_REDUCED_ORDER_COMPUTE_ONLY',downstream_execution_receipt_authority:'R142',deployment_attestation_authority:'R144',canonical_admission_authority:'R125'};
 return{ok:true,schema:R145_BATCH_SCHEMA,revision:'R145',engine:R145_ENGINE,generated_design_space:generated,summary:{candidate_count:rows.length,pareto_front_size:rows.filter(r=>r.pareto_rank===1).length,rcwa_ready:rcwaReady.length,fdtd_escalations:fdtdNeeded.length,screen_only:screenOnly.length,best_objective:round(rows[0]?.metrics?.objective_score||0),best_candidate_id:rows[0]?.candidate?.candidate_id||null},top_candidates:rows.slice(0,Math.min(32,rows.length)),fullwave_queue:rcwaReady.slice(0,Math.min(16,rcwaReady.length)).map(r=>r.fullwave_request),fdtd_requests:fdtdNeeded.slice(0,Math.min(16,fdtdNeeded.length)).map(r=>r.fullwave_request),receipt,laws:R145_LAWS,truth_boundary:'R145 can perform large deterministic reduced-order design-space screening and produce solver-ready RCWA requests. It cannot claim RCWA/FDTD execution, fabrication validity, measurement agreement, or CanonState admission until the separate R141/R142/R144/R125 proof chain supplies those facts.'};
}

export function computationManifestR145(){return{ok:true,schema:R145_COMPUTE_SCHEMA,revision:'R145',engine:R145_ENGINE,capabilities:['HALTON_DESIGN_SPACE','EFFECTIVE_MEDIUM_ANISOTROPY','THIN_FILM_TRANSFER','SPECTRAL_SWEEP','POLARIZATION_SWEEP','RAYLEIGH_MARGIN','EVANESCENT_COUPLING_PROXY','FABRICATION_PERTURBATION_ENSEMBLE','PARETO_RANKING','ADAPTIVE_RCWA_FDTD_ROUTING','SHA256_COMPUTE_RECEIPTS'],limits:{max_candidates:R145_MAX_CANDIDATES,max_wavelengths:R145_MAX_WAVELENGTHS,default_spectral_points:5,default_fabrication_tolerance_nm:5},authority:{execution:'REDUCED_ORDER_ONLY',fullwave:'SOVEREIGN_EXECUTOR_REQUIRED',executionReceipts:'R142',deployment:'R144',canonicalAdmission:'R125'},laws:R145_LAWS,truth_boundary:'This manifest describes implemented computation. It does not imply that a Sovereign RCWA/FDTD executor is currently online.'}}
