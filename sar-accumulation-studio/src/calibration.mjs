import { deweyAtlasEstimate } from './atlas.mjs';

export const EMPIRICAL_REFERENCE_LEDGER = Object.freeze({
  frameworkBenchmarks: [
    {
      id: 'PSC_HELDOUT_RECORDED',
      domain: 'prior framework benchmark',
      rows: 149679,
      r2: 0.8785,
      maeImprovementVsStatedBaselinePct: 65.84,
      status: 'RECORDED_SINGLE_DATASET_RESULT',
      useForSarClaim: false,
      boundary: 'Historical framework evidence only. It does not calibrate or validate SAR inference.'
    },
    {
      id: 'PLANCK_20736_REPRODUCTION',
      domain: 'numerical reproduction',
      cells: 20736,
      maxRelativeResidual: 1.42e-14,
      status: 'RECORDED_NUMERICAL_REPRODUCTION',
      useForSarClaim: false,
      boundary: 'Demonstrates numerical reconstruction fidelity for that analytic target; not evidence of SAR predictive accuracy.'
    },
    {
      id: 'SEED_CHAIN_600',
      domain: 'prior validation dataset',
      rows: 600,
      testRows: 180,
      baselineMAE: 0.1067787442837301,
      deweyMAE: 0.0281954303372119,
      deweyRMSE: 0.0362083255507555,
      deweyR2: 0.9180417606289796,
      improvementVsBaselinePct: 73.59452901759957,
      status: 'DEWEY_METHOD_SUPPORTED_ON_THIS_DATASET',
      useForSarClaim: false,
      boundary: 'Dataset-specific reference only; Auto-Ping did not converge in the stored result.'
    }
  ],
  universalClaimStatus: 'OPEN_REQUIRES_INDEPENDENT_MULTI_DATASET_BENCHMARKING'
});

export function mae(actual, predicted) {
  const pairs = actual.map((a,i)=>[Number(a),Number(predicted[i])]).filter(([a,p])=>Number.isFinite(a)&&Number.isFinite(p));
  return pairs.length ? pairs.reduce((s,[a,p])=>s+Math.abs(a-p),0)/pairs.length : null;
}

export function rmse(actual, predicted) {
  const pairs = actual.map((a,i)=>[Number(a),Number(predicted[i])]).filter(([a,p])=>Number.isFinite(a)&&Number.isFinite(p));
  return pairs.length ? Math.sqrt(pairs.reduce((s,[a,p])=>s+(a-p)**2,0)/pairs.length) : null;
}

export function r2(actual, predicted) {
  const pairs = actual.map((a,i)=>[Number(a),Number(predicted[i])]).filter(([a,p])=>Number.isFinite(a)&&Number.isFinite(p));
  if(pairs.length<2)return null;
  const mean=pairs.reduce((s,[a])=>s+a,0)/pairs.length;
  const ssTot=pairs.reduce((s,[a])=>s+(a-mean)**2,0);
  if(ssTot===0)return null;
  const ssRes=pairs.reduce((s,[a,p])=>s+(a-p)**2,0);
  return 1-ssRes/ssTot;
}

export function median(values){
  const v=values.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
  if(!v.length)return null;const m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;
}

export function mean(values){
  const v=values.map(Number).filter(Number.isFinite);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;
}

export function baselinePredictions(samples, holdoutIndex) {
  const target=samples[holdoutIndex];
  const train=samples.filter((_,i)=>i!==holdoutIndex).filter(s=>Number.isFinite(Number(s.value)));
  const earlier=train.filter(s=>new Date(s.time)<=new Date(target.time)).sort((a,b)=>new Date(a.time)-new Date(b.time));
  const nearest=train.slice().sort((a,b)=>Math.abs(new Date(a.time)-new Date(target.time))-Math.abs(new Date(b.time)-new Date(target.time)))[0];
  return {
    median: median(train.map(s=>s.value)),
    mean: mean(train.map(s=>s.value)),
    persistence: earlier.at(-1)?.value ?? nearest?.value ?? null
  };
}

function improvementPct(baseline,model){
  return Number.isFinite(baseline)&&baseline>0&&Number.isFinite(model)?100*(baseline-model)/baseline:null;
}

export function scoreRscFromCalibration({ coverage=0, modelMae=null, baselineMae=null, r2Value=null, uncertaintyRatio=null, outlierFraction=0 }={}){
  const CΩ=Math.max(0,Math.min(1,Number(coverage)||0));
  const gain=Number.isFinite(modelMae)&&Number.isFinite(baselineMae)&&baselineMae>0?Math.max(0,Math.min(1,(baselineMae-modelMae)/baselineMae)):0;
  const Φ=Math.max(0,Math.min(1,.55*gain+.45*Math.max(0,Math.min(1,(Number(r2Value)||0)))));
  const q=Math.max(.001,Math.min(1,Number(outlierFraction)||0));
  const Λ=Math.max(.001,Math.min(1,Number(uncertaintyRatio)||0));
  const epsilon=.001;
  const Dewey_S=(CΩ*Φ)/(q+Λ+epsilon);
  return {CΩ,Φ,q,Λ,epsilon,Dewey_S};
}

export const RSC_THRESHOLD_PROFILES=Object.freeze({
  research_environment_2026_07:{PASS:.7,PING:.86,WATCH:.7,REJECT:.5,epsilon:.001,source:'master_relational_skin_calculus_research_environment'},
  autoping_20736_2026_07:{PING:.55,WATCH:.45,epsilon:.001,source:'20736D_relational_skin_calculus_atlas_autoping'}
});

export function rscGate(score, profile='research_environment_2026_07'){
  const p=RSC_THRESHOLD_PROFILES[profile]||RSC_THRESHOLD_PROFILES.research_environment_2026_07;
  const s=Number(score);
  if(!Number.isFinite(s))return {state:'UNRESOLVED',profile,thresholds:p};
  if(s>=p.PING)return {state:'PING',profile,thresholds:p};
  if(s>=p.WATCH)return {state:'WATCH',profile,thresholds:p};
  if(p.REJECT!=null&&s<p.REJECT)return {state:'REJECT',profile,thresholds:p};
  return {state:'TURN',profile,thresholds:p};
}

export function leaveOneOutAtlasCalibration(samples, options={}){
  const clean=(samples||[]).map((s,i)=>({...s,index:i,value:Number(s.value)})).filter(s=>Number.isFinite(s.value)&&Number.isFinite(Number(s.lon))&&Number.isFinite(Number(s.lat))&&s.time);
  if(clean.length<4)return {state:'INSUFFICIENT_CALIBRATION_DATA',n:clean.length,minimum:4,folds:[]};
  const folds=[];
  for(let i=0;i<clean.length;i++){
    const target=clean[i],train=clean.filter((_,j)=>j!==i);
    const estimate=deweyAtlasEstimate(train,{lon:Number(target.lon),lat:Number(target.lat),time:target.time},options);
    const baselines=baselinePredictions(clean,i);
    folds.push({id:target.id||String(i),time:target.time,actual:target.value,predicted:Number.isFinite(estimate.value)?estimate.value:null,uncertainty:estimate.uncertainty??null,confidence:estimate.confidence??null,atlasLevel:estimate.level??null,baselines});
  }
  const actual=folds.map(f=>f.actual);
  const predicted=folds.map(f=>f.predicted);
  const baselineNames=['median','mean','persistence'];
  const model={mae:mae(actual,predicted),rmse:rmse(actual,predicted),r2:r2(actual,predicted)};
  const baselines=Object.fromEntries(baselineNames.map(name=>[name,{mae:mae(actual,folds.map(f=>f.baselines[name])),rmse:rmse(actual,folds.map(f=>f.baselines[name])),r2:r2(actual,folds.map(f=>f.baselines[name]))}]));
  const bestBaselineName=baselineNames.slice().sort((a,b)=>(baselines[a].mae??Infinity)-(baselines[b].mae??Infinity))[0];
  const bestBaseline=baselines[bestBaselineName];
  const improvement=improvementPct(bestBaseline.mae,model.mae);
  const coverage=folds.filter(f=>Number.isFinite(f.predicted)).length/folds.length;
  const scale=Math.max(1e-12,median(actual.map(v=>Math.abs(v)))||1);
  const uncertaintyRatio=median(folds.map(f=>Number(f.uncertainty)/scale).filter(Number.isFinite))??1;
  const residuals=folds.filter(f=>Number.isFinite(f.predicted)).map(f=>Math.abs(f.actual-f.predicted));
  const medRes=median(residuals)??0, mad=median(residuals.map(v=>Math.abs(v-medRes)))??0;
  const outlierFraction=residuals.length?residuals.filter(v=>v>medRes+6*Math.max(mad,1e-12)).length/residuals.length:1;
  const rsc=scoreRscFromCalibration({coverage,modelMae:model.mae,baselineMae:bestBaseline.mae,r2Value:model.r2,uncertaintyRatio,outlierFraction});
  const gate=rscGate(rsc.Dewey_S,options.thresholdProfile||'research_environment_2026_07');
  const calibrated=coverage>=.8&&Number.isFinite(improvement)&&improvement>0&&Number.isFinite(model.r2)&&model.r2>0;
  return {
    state:calibrated?'CALIBRATED_ON_CURRENT_MEASURED_STACK':'NOT_CALIBRATED_ON_CURRENT_MEASURED_STACK',
    n:clean.length,folds,coverage,model,baselines,bestBaselineName,bestBaseline,
    improvementVsBestBaselinePct:improvement,
    uncertaintyRatio,outlierFraction,rsc,gate,
    semantics:'Leave-one-out validation on the currently measured SAR stack. This calibrates only the present product/location/sample regime and does not imply universal validity.'
  };
}
