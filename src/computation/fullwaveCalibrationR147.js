import {sha256R145} from './advancedComputationKernelR145.js';

export const R147_SCHEMA='OMEGA_FULLWAVE_CALIBRATION_R147';
export const R147_ENGINE='R147_CROSS_VALIDATED_RESIDUAL_CALIBRATION_V1';
export const R147_MIN_OBSERVATIONS=20;
export const R147_FOLDS=5;
export const R147_LAWS=Object.freeze([
 'ONLY_CONVERGED_FULLWAVE_RETURNS_MAY_CALIBRATE',
 'CALIBRATION_FEATURES_MUST_EXIST_BEFORE_FULLWAVE_OBSERVATION',
 'OUT_OF_FOLD_IMPROVEMENT_IS_REQUIRED_BEFORE_MODEL_USE',
 'CALIBRATION_GATE_PASS_IS_NOT_CANONSTATE_ADMISSION',
 'CALIBRATION_NEVER_REWRITES_ORIGINAL_R145_RECEIPTS',
 'FAILED_OR_NONCONVERGED_SOLVES_REMAIN_SCAR_EVIDENCE',
 'FABRICATION_VALIDATION_REQUIRES_INDEPENDENT_MEASUREMENT',
 'R142_EXECUTION_R144_DEPLOYMENT_R125_ADMISSION_AUTHORITIES_REMAIN_SEPARATE'
]);

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=8)=>Number(Number(v).toFixed(n));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const rmse=(truth,pred)=>Math.sqrt(mean(truth.map((v,i)=>(v-pred[i])**2)));
const mae=(truth,pred)=>mean(truth.map((v,i)=>Math.abs(v-pred[i])));

function geometryFeatures(g={},wavelength=550){
 const p=Number(g.pitch_nm),w=Number(g.width_nm),l=Number(g.length_nm),h=Number(g.height_nm),wl=Number(wavelength);
 if(![p,w,l,h,wl].every(finite)||Math.min(p,w,l,h,wl)<=0)throw new Error('R147 observation requires positive finite geometry and wavelength');
 return{fill:clamp((w*l)/(p*p),0,1),pitch_ratio:p/wl,height_ratio:h/wl,aspect:l/Math.max(1e-9,w),anisotropy:Math.abs(l-w)/p,theta_norm:((((Number(g.theta_deg)||0)%180)+180)%180)/180};
}
function observationVector(o){
 const f=o.features||geometryFeatures(o.geometry,o.wavelength_nm),m=o.r145_metrics||{};
 const predicted=clamp(o.r145_transmission);
 return[1,predicted,f.fill,f.pitch_ratio,f.height_ratio,Math.min(4,f.aspect)/4,f.anisotropy,f.theta_norm,clamp(Number(m.coupling_proxy)||0),clamp(Number(m.diffraction_risk)||0),clamp(Number(m.resonance_risk)||0)];
}
function validObservation(o){return Boolean(o&&o.schema==='OMEGA_CALIBRATION_OBSERVATION_R147'&&o.fullwave_schema==='OMEGA_SPECTRAL_RESULT_v1'&&o.fullwave_converged===true&&finite(o.r145_transmission)&&finite(o.fullwave_transmission)&&Number(o.r145_transmission)>=0&&Number(o.r145_transmission)<=1&&Number(o.fullwave_transmission)>=0&&Number(o.fullwave_transmission)<=1&&String(o.r146_result_sha256||'').length===64&&String(o.r145_receipt||'').length>=32)}

function solveLinear(A,b){
 const n=b.length,M=A.map((row,i)=>[...row,b[i]]);
 for(let col=0;col<n;col++){
  let pivot=col;for(let r=col+1;r<n;r++)if(Math.abs(M[r][col])>Math.abs(M[pivot][col]))pivot=r;
  if(Math.abs(M[pivot][col])<1e-12)continue;
  [M[col],M[pivot]]=[M[pivot],M[col]];const d=M[col][col];for(let c=col;c<=n;c++)M[col][c]/=d;
  for(let r=0;r<n;r++){if(r===col)continue;const q=M[r][col];if(!q)continue;for(let c=col;c<=n;c++)M[r][c]-=q*M[col][c]}
 }
 return M.map((row,i)=>finite(row[n])?row[n]:0);
}
function ridgeFit(rows,lambda=.02){
 const X=rows.map(observationVector),y=rows.map(o=>Number(o.fullwave_transmission)-Number(o.r145_transmission)),p=X[0]?.length||0;
 if(!p)throw new Error('R147 cannot fit empty design matrix');
 const A=Array.from({length:p},()=>Array(p).fill(0)),b=Array(p).fill(0);
 for(let i=0;i<X.length;i++)for(let j=0;j<p;j++){b[j]+=X[i][j]*y[i];for(let k=0;k<p;k++)A[j][k]+=X[i][j]*X[i][k]}
 for(let j=1;j<p;j++)A[j][j]+=lambda*rows.length;
 return solveLinear(A,b);
}
function predictWith(beta,o){const x=observationVector(o);return clamp(Number(o.r145_transmission)+x.reduce((s,v,i)=>s+v*(beta[i]||0),0))}
function foldFor(o,index){let h=2166136261;const text=String(o.observation_id||index);for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h>>>0)%R147_FOLDS}

export function calibrationObservationR147({candidate,row,point,fullwavePoint,r145Receipt,r146ResultSha256}){
 const c=candidate||row?.candidate||{},screenPoint=point||{},full=fullwavePoint||{},child=full.result||{},wl=Number(full.wavelength_nm??screenPoint.wavelength_nm??c.wavelength_nm),pol=String(screenPoint.polarization||'s').toLowerCase()==='p'?'p':'s';
 if(child.schema!=='OMEGA_RESULT_v1'||child.solver!=='rcwa'||child.worker!=='omega-sovereign')throw new Error('R147 observation requires a Sovereign OMEGA_RESULT_v1 RCWA child');
 const geometry=c.geometry||{},features=geometryFeatures(geometry,wl),id=`r147_${String(c.candidate_id||c.source_packet_id||'candidate')}_${round(wl,4)}_${pol}`;
 return{schema:'OMEGA_CALIBRATION_OBSERVATION_R147',observation_id:id,candidate_id:c.candidate_id||null,source_packet_id:c.source_packet_id||null,wavelength_nm:wl,polarization:pol,geometry,features,r145_transmission:clamp(screenPoint.transmission),r145_metrics:{coupling_proxy:screenPoint.coupling_proxy||0,diffraction_risk:screenPoint.diffraction_risk||0,resonance_risk:screenPoint.resonance_risk||0},fullwave_transmission:clamp(child.observables?.T),fullwave_reflection:clamp(child.observables?.R),fullwave_converged:child.converged===true,fullwave_schema:'OMEGA_SPECTRAL_RESULT_v1',fullwave_child_sha256:child.result_sha256||null,r145_receipt:String(r145Receipt||''),r146_result_sha256:String(r146ResultSha256||''),lineage:[...(Array.isArray(c.lineage)?c.lineage:[]),`r145:receipt:${r145Receipt}`,`r146:result:${r146ResultSha256}`],truth_boundary:'One converged numerical RCWA observation paired to one pre-existing R145 reduced-order prediction. It is calibration evidence, not physical measurement.'};
}

export function observationsFromR145R146R147(row,spectralResult,r145Receipt){
 if(spectralResult?.schema!=='OMEGA_SPECTRAL_RESULT_v1'||spectralResult?.solver!=='rcwa'||spectralResult?.worker!=='omega-sovereign'||spectralResult?.converged_all!==true)throw new Error('R147 requires a fully converged Sovereign OMEGA_SPECTRAL_RESULT_v1');
 const screenPoints=Array.isArray(row?.points)?row.points:[],out=[];
 for(const full of spectralResult.points||[]){
  if(full?.result?.converged!==true)continue;
  const same=screenPoints.filter(p=>Math.abs(Number(p.wavelength_nm)-Number(full.wavelength_nm))<1e-5),preferred=same.find(p=>p.polarization==='s')||same[0];
  if(!preferred)continue;
  out.push(calibrationObservationR147({row,point:preferred,fullwavePoint:full,r145Receipt,r146ResultSha256:spectralResult.result_sha256}));
 }
 return out;
}

export async function fitFullwaveCalibrationR147(observations,options={}){
 const rows=(Array.isArray(observations)?observations:[]).filter(validObservation),minObs=Math.max(R147_MIN_OBSERVATIONS,Math.floor(Number(options.min_observations)||R147_MIN_OBSERVATIONS));
 if(rows.length<minObs)return{ok:false,schema:R147_SCHEMA,revision:'R147',engine:R147_ENGINE,state:'HOLD_INSUFFICIENT_EVIDENCE',observations:rows.length,required:minObs,canonical_mutation:false,truth_boundary:'No calibration model is emitted before the minimum converged full-wave evidence threshold is met.'};
 const lambda=Math.max(1e-6,Math.min(1,Number(options.lambda)||.02)),baseline=[],calibrated=[],truth=[],folds=[];
 for(let fold=0;fold<R147_FOLDS;fold++){
  const train=rows.filter((o,i)=>foldFor(o,i)!==fold),test=rows.filter((o,i)=>foldFor(o,i)===fold);if(!test.length||train.length<10)continue;
  const beta=ridgeFit(train,lambda),y=test.map(o=>Number(o.fullwave_transmission)),b=test.map(o=>Number(o.r145_transmission)),c=test.map(o=>predictWith(beta,o)),br=rmse(y,b),cr=rmse(y,c);
  truth.push(...y);baseline.push(...b);calibrated.push(...c);folds.push({fold,train:train.length,test:test.length,baseline_rmse:round(br),calibrated_rmse:round(cr),improvement:round(br>0?(br-cr)/br:0)});
 }
 if(truth.length<Math.max(5,Math.floor(rows.length*.6)))return{ok:false,schema:R147_SCHEMA,revision:'R147',engine:R147_ENGINE,state:'HOLD_CROSS_VALIDATION_INCOMPLETE',observations:rows.length,folds,canonical_mutation:false};
 const baselineRmse=rmse(truth,baseline),calibratedRmse=rmse(truth,calibrated),baselineMae=mae(truth,baseline),calibratedMae=mae(truth,calibrated),improvement=baselineRmse>0?(baselineRmse-calibratedRmse)/baselineRmse:0,maxFoldRegression=Math.max(0,...folds.map(f=>f.baseline_rmse>0?(f.calibrated_rmse-f.baseline_rmse)/f.baseline_rmse:0)),requiredImprovement=Math.max(.01,Math.min(.5,Number(options.required_improvement)||.05)),gate=improvement>=requiredImprovement&&calibratedRmse<baselineRmse&&maxFoldRegression<=.15?'PASS':'HOLD';
 const coefficients=ridgeFit(rows,lambda),modelCore={schema:'OMEGA_FULLWAVE_CALIBRATION_MODEL_R147',engine:R147_ENGINE,target:'RCWA_ZERO_ORDER_TRANSMISSION',feature_order:['bias','r145_transmission','fill','pitch_ratio','height_ratio','aspect_capped','anisotropy','theta_norm','coupling_proxy','diffraction_risk','resonance_risk'],coefficients:coefficients.map(x=>round(x,10)),lambda,training_observations:rows.length,source_r145_receipts:[...new Set(rows.map(x=>x.r145_receipt))].sort(),source_r146_results:[...new Set(rows.map(x=>x.r146_result_sha256))].sort(),cross_validation:{folds,baseline_rmse:round(baselineRmse),calibrated_rmse:round(calibratedRmse),baseline_mae:round(baselineMae),calibrated_mae:round(calibratedMae),relative_rmse_improvement:round(improvement),max_fold_regression:round(maxFoldRegression),required_improvement:requiredImprovement,gate},authority:'CALIBRATION_HINT_ONLY_NOT_CANONSTATE'};
 const model_sha256=await sha256R145(modelCore),model=gate==='PASS'?{...modelCore,model_sha256}:null,receiptCore={schema:R147_SCHEMA,revision:'R147',engine:R147_ENGINE,state:gate==='PASS'?'CALIBRATION_GATE_PASS':'HOLD_NO_GENERALIZATION_PROOF',observations:rows.length,model_sha256:model?.model_sha256||null,cross_validation:modelCore.cross_validation,source_r145_receipts:modelCore.source_r145_receipts,source_r146_results:modelCore.source_r146_results,canonical_mutation:false,screen_engine_mutation:false,physical_validation:false,laws:R147_LAWS},receipt_sha256=await sha256R145(receiptCore);
 return{ok:gate==='PASS',...receiptCore,receipt_sha256,model,truth_boundary:'R147 may expose a cross-validated correction as a screening hint only when out-of-fold RCWA residuals improve. It never rewrites historical R145 predictions, never self-modifies CanonState, and does not convert numerical agreement into fabrication evidence.'};
}

export function applyFullwaveCalibrationR147(model,observationLike){if(model?.schema!=='OMEGA_FULLWAVE_CALIBRATION_MODEL_R147'||!Array.isArray(model.coefficients))throw new Error('R147 calibration model required');return round(predictWith(model.coefficients,observationLike),8)}

export function fullwaveCalibrationManifestR147(){return{schema:R147_SCHEMA,revision:'R147',engine:R147_ENGINE,min_observations:R147_MIN_OBSERVATIONS,folds:R147_FOLDS,target:'RCWA_ZERO_ORDER_TRANSMISSION',laws:R147_LAWS,authority:{input:'CONVERGED_R146_SOVEREIGN_RESULTS',output:'CROSS_VALIDATED_SCREENING_HINT_ONLY',execution:'R142',deployment:'R144',canonicalAdmission:'R125'},truth_boundary:'Calibration may reduce model error against numerical RCWA evidence. It is neither an independent solver nor experimental validation.'}}
