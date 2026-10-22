import {BIO_CONTEXT_LAYERS_R281,BIO_DOMAINS_R281} from './bioInstrumentRuntimeR281';

export const BIO_EMPIRICAL_CONVERGENCE_R281_SCHEMA='OMEGA_BIO_EMPIRICAL_CONVERGENCE_R281' as const;
export const BIO_EMPIRICAL_CONVERGENCE_R281_LAWS=Object.freeze([
  'OBSERVED_REFERENCE_VALUES_ARE_INVARIANT_CARRY',
  'MODEL_AND_BASELINE_PREDICTIONS_NEVER_REWRITE_OBSERVATIONS',
  'FIT_PARTITIONS_MAY_PROPOSE_CALIBRATION_BUT_CANNOT_PROMOTE_IT',
  'HOLDOUT_OR_PROSPECTIVE_PARTITIONS_MUST_VALIDATE_ANY_CALIBRATION_CANDIDATE',
  'RESIDUALS_ARE_SCAR_HISTORY_CARRY_AND_REMAIN_VISIBLE',
  'DOMAIN_REGRESSIONS_ARE_NOT_HIDDEN_BY_GLOBAL_AVERAGES',
  'EMPIRICAL_SUPPORT_IS_SCOPE_BOUND_TO_THE_DATA_AND_METRIC_TESTED',
  'MEASUREMENT_AUTHORITY_REMAINS_ZERO_FOR_MODEL_CALIBRATION_OUTPUTS'
]);

export type BioEmpiricalPartitionR281='FIT'|'HOLDOUT'|'PROSPECTIVE';
export type BioEmpiricalCaseR281={
  id:string;
  domain:number;
  layer:number;
  variable:string;
  unit:string;
  observed:number;
  predicted:number;
  baseline:number;
  partition:BioEmpiricalPartitionR281;
  verified:boolean;
  weight?:number;
  observedAt?:string;
  source?:string;
};

export type BioEmpiricalResidualR281=BioEmpiricalCaseR281&{
  modelResidual:number;
  baselineResidual:number;
  modelAbsError:number;
  baselineAbsError:number;
  deltaAbsError:number;
  winner:'MODEL'|'BASELINE'|'TIE';
};

type Summary={n:number;mae:number|null;rmse:number|null;bias:number|null;baselineMae:number|null;baselineRmse:number|null;lift:number|null;wins:number;losses:number;ties:number};
const finite=(x:any)=>Number.isFinite(Number(x));
const axis=(x:any)=>Math.max(1,Math.min(12,Math.floor(Number(x)||1)));
const EPS=1e-12;
const mean=(xs:number[],weights?:number[])=>{if(!xs.length)return null;let n=0,d=0;for(let i=0;i<xs.length;i++){const w=weights?.[i]??1;n+=xs[i]*w;d+=w}return d>0?n/d:null};
const rmse=(xs:number[],weights?:number[])=>{if(!xs.length)return null;const m=mean(xs.map(x=>x*x),weights);return m==null?null:Math.sqrt(m)};

function summarize(rows:BioEmpiricalResidualR281[]):Summary{
  const w=rows.map(x=>finite(x.weight)&&Number(x.weight)>0?Number(x.weight):1);
  const mae=mean(rows.map(x=>x.modelAbsError),w),baselineMae=mean(rows.map(x=>x.baselineAbsError),w);
  return{
    n:rows.length,
    mae,
    rmse:rmse(rows.map(x=>x.modelResidual),w),
    bias:mean(rows.map(x=>x.modelResidual),w),
    baselineMae,
    baselineRmse:rmse(rows.map(x=>x.baselineResidual),w),
    lift:mae!=null&&baselineMae!=null&&baselineMae>EPS?(baselineMae-mae)/baselineMae:null,
    wins:rows.filter(x=>x.winner==='MODEL').length,
    losses:rows.filter(x=>x.winner==='BASELINE').length,
    ties:rows.filter(x=>x.winner==='TIE').length
  };
}

function candidateLinearCalibration(fit:BioEmpiricalResidualR281[]){
  if(fit.length<2)return{available:false,slope:1,offset:0,fitN:fit.length};
  const xs=fit.map(x=>x.predicted),ys=fit.map(x=>x.observed),ws=fit.map(x=>finite(x.weight)&&Number(x.weight)>0?Number(x.weight):1);
  const mx=mean(xs,ws)!,my=mean(ys,ws)!;let num=0,den=0;
  for(let i=0;i<xs.length;i++){num+=ws[i]*(xs[i]-mx)*(ys[i]-my);den+=ws[i]*(xs[i]-mx)**2}
  if(Math.abs(den)<EPS)return{available:false,slope:1,offset:my-mx,fitN:fit.length};
  const slope=num/den,offset=my-slope*mx;
  return{available:Number.isFinite(slope)&&Number.isFinite(offset),slope,offset,fitN:fit.length};
}

function evaluateCandidate(rows:BioEmpiricalResidualR281[],candidate:{available:boolean;slope:number;offset:number}){
  if(!candidate.available||!rows.length)return{n:rows.length,mae:null as number|null,rmse:null as number|null,bias:null as number|null,liftVsCurrent:null as number|null,liftVsBaseline:null as number|null};
  const residuals=rows.map(x=>x.observed-(candidate.slope*x.predicted+candidate.offset));
  const weights=rows.map(x=>finite(x.weight)&&Number(x.weight)>0?Number(x.weight):1);
  const candidateMae=mean(residuals.map(Math.abs),weights),candidateRmse=rmse(residuals,weights),candidateBias=mean(residuals,weights);
  const current=summarize(rows);
  return{
    n:rows.length,mae:candidateMae,rmse:candidateRmse,bias:candidateBias,
    liftVsCurrent:candidateMae!=null&&current.mae!=null&&current.mae>EPS?(current.mae-candidateMae)/current.mae:null,
    liftVsBaseline:candidateMae!=null&&current.baselineMae!=null&&current.baselineMae>EPS?(current.baselineMae-candidateMae)/current.baselineMae:null
  };
}

export function validateBioEmpiricalCaseR281(x:BioEmpiricalCaseR281){
  const errors:string[]=[];
  if(!x?.id)errors.push('MISSING_ID');
  if(!(Number(x?.domain)>=1&&Number(x?.domain)<=12))errors.push('INVALID_DOMAIN');
  if(!(Number(x?.layer)>=1&&Number(x?.layer)<=12))errors.push('INVALID_LAYER');
  if(!x?.variable)errors.push('MISSING_VARIABLE');
  if(!x?.unit)errors.push('MISSING_UNIT');
  if(!finite(x?.observed)||!finite(x?.predicted)||!finite(x?.baseline))errors.push('NONFINITE_VALUE');
  if(!['FIT','HOLDOUT','PROSPECTIVE'].includes(String(x?.partition)))errors.push('INVALID_PARTITION');
  if(!x?.verified)errors.push('UNVERIFIED_REFERENCE');
  return errors;
}

export function compileBioEmpiricalConvergenceR281(cases:BioEmpiricalCaseR281[]=[]){
  const rejected=cases.map(x=>({x,errors:validateBioEmpiricalCaseR281(x)})).filter(x=>x.errors.length);
  const accepted=cases.filter(x=>!validateBioEmpiricalCaseR281(x).length).map(x=>{const modelResidual=x.observed-x.predicted,baselineResidual=x.observed-x.baseline,modelAbsError=Math.abs(modelResidual),baselineAbsError=Math.abs(baselineResidual),d=modelAbsError-baselineAbsError;return{...x,domain:axis(x.domain),layer:axis(x.layer),modelResidual,baselineResidual,modelAbsError,baselineAbsError,deltaAbsError:d,winner:Math.abs(d)<1e-12?'TIE':d<0?'MODEL':'BASELINE'} as BioEmpiricalResidualR281});
  const fit=accepted.filter(x=>x.partition==='FIT'),holdout=accepted.filter(x=>x.partition==='HOLDOUT'),prospective=accepted.filter(x=>x.partition==='PROSPECTIVE');
  const candidate=candidateLinearCalibration(fit),holdoutCandidate=evaluateCandidate(holdout,candidate),prospectiveCandidate=evaluateCandidate(prospective,candidate);
  const overall=summarize(accepted),fitSummary=summarize(fit),holdoutSummary=summarize(holdout),prospectiveSummary=summarize(prospective);
  const domainSlices=BIO_DOMAINS_R281.map((name,i)=>{const rows=accepted.filter(x=>x.domain===i+1),summary=summarize(rows);return{index:i+1,name,...summary,status:summary.n===0?'NO_DATA':summary.lift==null?'UNRESOLVED':summary.lift>0?'MODEL_WINS':summary.lift<0?'BASELINE_WINS':'TIE'}});
  const layerSlices=BIO_CONTEXT_LAYERS_R281.map((name,i)=>{const rows=accepted.filter(x=>x.layer===i+1),summary=summarize(rows);return{index:i+1,name,...summary,status:summary.n===0?'NO_DATA':summary.lift==null?'UNRESOLVED':summary.lift>0?'MODEL_WINS':summary.lift<0?'BASELINE_WINS':'TIE'}});
  const regressions=domainSlices.filter(x=>x.status==='BASELINE_WINS');
  const holdoutBeatsBaseline=holdoutSummary.lift!=null&&holdoutSummary.lift>0;
  const candidateImprovesCurrent=holdoutCandidate.liftVsCurrent!=null&&holdoutCandidate.liftVsCurrent>0;
  const candidateBeatsBaseline=holdoutCandidate.liftVsBaseline!=null&&holdoutCandidate.liftVsBaseline>0;
  const candidatePromotable=holdout.length>=5&&candidate.available&&candidateImprovesCurrent&&candidateBeatsBaseline;
  let status='NO_EMPIRICAL_DATA';
  if(accepted.length&&holdout.length<5)status='HOLDOUT_REQUIRED';
  else if(holdout.length>=5&&holdoutBeatsBaseline&&regressions.length===0)status='EMPIRICAL_SUPPORTED';
  else if(holdout.length>=5&&holdoutBeatsBaseline)status='EMPIRICAL_SUPPORTED_WITH_DOMAIN_REGRESSIONS';
  else if(holdout.length>=5)status='EMPIRICAL_NOT_SUPPORTED_ON_HOLDOUT';
  return{
    schema:BIO_EMPIRICAL_CONVERGENCE_R281_SCHEMA,
    laws:BIO_EMPIRICAL_CONVERGENCE_R281_LAWS,
    measurementAuthority:0,
    status,
    supplied:cases.length,accepted:accepted.length,rejected:rejected.length,
    residuals:accepted,rejectedRows:rejected,
    summaries:{overall,fit:fitSummary,holdout:holdoutSummary,prospective:prospectiveSummary},
    candidate:{...candidate,holdout:holdoutCandidate,prospective:prospectiveCandidate,promotable:candidatePromotable,promotionLaw:'FIT proposes; HOLDOUT validates; PROSPECTIVE monitors; observations never mutate.'},
    atlas:{domains:domainSlices,layers:layerSlices,regressions:regressions.map(x=>x.index)},
    wovenContinuity:{partition:'domain × layer × variable × FIT/HOLDOUT/PROSPECTIVE',exchangeTransform:'candidate fit / comparison against baseline',invariantCarry:'observed reference + unit + verification + provenance',scarCarry:'signed residual + absolute-error delta + domain regression ledger',recontextualize:'re-evaluate candidate on untouched holdout/prospective partitions'},
    equation:'e_t = y_t - ŷ_t; θ* = argmin_θ Σ w·|y-f_θ(ŷ)|; promote only when untouched holdout improves against current model and baseline',
    truthBoundary:'Empirical support is local to the measured dataset, target, metric, partition and reference method. No global medical or biological claim is inferred from benchmark success.'
  };
}

function csvLine(line:string){const out:string[]=[];let cur='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out.map(x=>x.trim())}
const bool=(x:any)=>x===true||['true','1','yes'].includes(String(x).toLowerCase());

export function parseBioEmpiricalTextR281(text:string,fileName='empirical.json'):BioEmpiricalCaseR281[]{
  if(/\.json$/i.test(fileName)||text.trim().startsWith('[')||text.trim().startsWith('{')){
    const parsed=JSON.parse(text),rows=Array.isArray(parsed)?parsed:Array.isArray(parsed?.cases)?parsed.cases:[parsed];
    return rows.map((x:any,i:number)=>({id:String(x.id||`case-${i+1}`),domain:Number(x.domain),layer:Number(x.layer),variable:String(x.variable||''),unit:String(x.unit||''),observed:Number(x.observed),predicted:Number(x.predicted),baseline:Number(x.baseline),partition:String(x.partition||'HOLDOUT').toUpperCase() as BioEmpiricalPartitionR281,verified:bool(x.verified),weight:finite(x.weight)?Number(x.weight):undefined,observedAt:x.observedAt?String(x.observedAt):undefined,source:x.source?String(x.source):fileName}));
  }
  const lines=text.split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)return[];const headers=csvLine(lines[0]);
  return lines.slice(1).map((line,i)=>{const cells=csvLine(line),x:any={};headers.forEach((h,j)=>x[h]=cells[j]??'');return{id:String(x.id||`case-${i+1}`),domain:Number(x.domain),layer:Number(x.layer),variable:String(x.variable||''),unit:String(x.unit||''),observed:Number(x.observed),predicted:Number(x.predicted),baseline:Number(x.baseline),partition:String(x.partition||'HOLDOUT').toUpperCase() as BioEmpiricalPartitionR281,verified:bool(x.verified),weight:finite(x.weight)?Number(x.weight):undefined,observedAt:x.observedAt||undefined,source:x.source||fileName} as BioEmpiricalCaseR281});
}
