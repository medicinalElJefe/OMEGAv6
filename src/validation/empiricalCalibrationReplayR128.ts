import crypto from 'node:crypto';

export const R128_REVISION='R128' as const;
export const R128_SCHEMA='OMEGA_EMPIRICAL_CALIBRATION_REPLAY_R128' as const;
export const R128_LAWS=[
 'SYNTHETIC_DATA_NEVER_COUNTS_AS_EXTERNAL_VALIDATION',
 'HOLDOUT_DATA_NEVER_PARTICIPATES_IN_THRESHOLD_FIT',
 'SEMANTIC_REPLAY_HASH_EXCLUDES_WALL_CLOCK_METADATA',
 'ANY_SEMANTIC_INPUT_CHANGE_MUST_CHANGE_REPLAY_HASH',
 'NO_GROUND_TRUTH_MEANS_INCONCLUSIVE',
 'FAILED_REPRODUCTION_PREVENTS_VALIDATED_STATUS',
 'CALIBRATION_METRICS_MUST_BE_FINITE_AND_TRACEABLE',
 'VALIDATION_STATUS_IS_EVIDENCE_STATUS_NOT_UNIVERSAL_TRUTH',
 'EXTERNAL_VALIDATION_DOES_NOT_BYPASS_R125_CANONICAL_ADMISSION'
] as const;

export type DatasetClass='EXTERNAL'|'SYNTHETIC'|'INTERNAL_DERIVED';
export type Split='TRAIN'|'CALIBRATION'|'HOLDOUT';
export type BinaryExample={
 id:string;
 datasetId:string;
 datasetClass:DatasetClass;
 source:string;
 sourceFamily:string;
 split:Split;
 score:number;
 label:0|1;
 observedAt?:string;
 provenanceHash?:string;
};
export type CalibrationPolicy={
 thresholdGrid?:number[];
 optimize?:'F1'|'BALANCED_ACCURACY'|'BRIER';
 minExternalHoldout?:number;
 minF1?:number;
 maxBrier?:number;
 maxCalibrationError?:number;
 requireReproduction?:boolean;
};
export type ReproductionReceipt={
 id:string;
 targetSemanticHash:string;
 sourceFamily:string;
 verdict:'PASS'|'FAIL'|'INCONCLUSIVE';
 reproducible:boolean;
 independent:boolean;
 observedAt:string;
};
export type ReplayInput={
 experimentId:string;
 modelId:string;
 claim:string;
 examples:BinaryExample[];
 policy?:CalibrationPolicy;
 reproductionReceipts?:ReproductionReceipt[];
 upstreamProofHashes?:string[];
 notes?:string[];
};

const sha=(x:unknown)=>crypto.createHash('sha256').update(typeof x==='string'?x:stableStringify(x)).digest('hex');
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a));
const div=(a:number,b:number)=>b? a/b : 0;
const finite=(x:unknown)=>typeof x==='number'&&Number.isFinite(x);
const round=(x:number,n=12)=>Number(x.toFixed(n));
function stableStringify(x:unknown):string{
 if(x===null||typeof x!=='object')return JSON.stringify(x);
 if(Array.isArray(x))return`[${x.map(stableStringify).join(',')}]`;
 const o=x as Record<string,unknown>;
 return`{${Object.keys(o).sort().map(k=>`${JSON.stringify(k)}:${stableStringify(o[k])}`).join(',')}}`;
}
function validateExample(e:BinaryExample){
 const errors:string[]=[];
 if(!e.id)errors.push('id');
 if(!e.datasetId)errors.push('datasetId');
 if(!e.source)errors.push('source');
 if(!e.sourceFamily)errors.push('sourceFamily');
 if(!['EXTERNAL','SYNTHETIC','INTERNAL_DERIVED'].includes(e.datasetClass))errors.push('datasetClass');
 if(!['TRAIN','CALIBRATION','HOLDOUT'].includes(e.split))errors.push('split');
 if(!finite(e.score)||e.score<0||e.score>1)errors.push('score');
 if(e.label!==0&&e.label!==1)errors.push('label');
 if(e.provenanceHash&&!/^[a-f0-9]{64}$/i.test(e.provenanceHash))errors.push('provenanceHash');
 return errors;
}
function confusion(rows:BinaryExample[],threshold:number){
 let tp=0,tn=0,fp=0,fn=0;
 for(const r of rows){const p=r.score>=threshold?1:0;if(p===1&&r.label===1)tp++;else if(p===0&&r.label===0)tn++;else if(p===1)fp++;else fn++}
 const precision=div(tp,tp+fp),recall=div(tp,tp+fn),specificity=div(tn,tn+fp),accuracy=div(tp+tn,rows.length),f1=div(2*precision*recall,precision+recall),balancedAccuracy=(recall+specificity)/2;
 return{tp,tn,fp,fn,precision:round(precision),recall:round(recall),specificity:round(specificity),accuracy:round(accuracy),f1:round(f1),balancedAccuracy:round(balancedAccuracy)};
}
function brier(rows:BinaryExample[]){return rows.length?round(rows.reduce((s,r)=>s+(r.score-r.label)**2,0)/rows.length):0}
function calibrationError(rows:BinaryExample[],bins=10){
 if(!rows.length)return 0;
 let weighted=0;
 for(let b=0;b<bins;b++){
  const lo=b/bins,hi=(b+1)/bins;
  const bucket=rows.filter(r=>r.score>=lo&&(b===bins-1?r.score<=hi:r.score<hi));
  if(!bucket.length)continue;
  const meanScore=bucket.reduce((s,r)=>s+r.score,0)/bucket.length;
  const rate=bucket.reduce((s,r)=>s+r.label,0)/bucket.length;
  weighted+=bucket.length/rows.length*Math.abs(meanScore-rate);
 }
 return round(weighted);
}
function optimizeThreshold(rows:BinaryExample[],policy:Required<CalibrationPolicy>){
 const grid=[...new Set(policy.thresholdGrid.filter(x=>finite(x)&&x>=0&&x<=1).map(x=>round(x,6)))].sort((a,b)=>a-b);
 if(!grid.length)throw new Error('THRESHOLD_GRID_EMPTY');
 const ranked=grid.map(threshold=>{const c=confusion(rows,threshold),br=brier(rows);const objective=policy.optimize==='F1'?c.f1:policy.optimize==='BALANCED_ACCURACY'?c.balancedAccuracy:-br;return{threshold,objective,confusion:c,brier:br}}).sort((a,b)=>b.objective-a.objective||Math.abs(a.threshold-.5)-Math.abs(b.threshold-.5)||a.threshold-b.threshold);
 return ranked[0];
}
function policyDefaults(p:CalibrationPolicy={}):Required<CalibrationPolicy>{
 return{thresholdGrid:p.thresholdGrid??Array.from({length:101},(_,i)=>i/100),optimize:p.optimize??'F1',minExternalHoldout:p.minExternalHoldout??20,minF1:p.minF1??0.75,maxBrier:p.maxBrier??0.2,maxCalibrationError:p.maxCalibrationError??0.15,requireReproduction:p.requireReproduction??true};
}
function semanticPayload(input:ReplayInput){
 return{
  schema:R128_SCHEMA,
  experimentId:input.experimentId,
  modelId:input.modelId,
  claim:input.claim,
  examples:[...input.examples].map(({observedAt,...rest})=>rest).sort((a,b)=>`${a.datasetId}|${a.id}`.localeCompare(`${b.datasetId}|${b.id}`)),
  policy:policyDefaults(input.policy),
  upstreamProofHashes:[...(input.upstreamProofHashes??[])].sort(),
  notes:[...(input.notes??[])].sort()
 };
}
export function semanticReplayHashR128(input:ReplayInput){return sha(semanticPayload(input))}
export function replayCapsuleR128(input:ReplayInput){
 const semanticHash=semanticReplayHashR128(input);
 const datasetHashes=Object.entries(Object.groupBy(input.examples,e=>e.datasetId)).map(([datasetId,rows])=>({datasetId,sha256:sha((rows??[]).map(({observedAt,...r})=>r).sort((a,b)=>a.id.localeCompare(b.id)))})).sort((a,b)=>a.datasetId.localeCompare(b.datasetId));
 return{schema:'OMEGA_REPLAY_CAPSULE_R128',revision:R128_REVISION,semanticHash,datasetHashes,upstreamProofHashes:[...(input.upstreamProofHashes??[])].sort(),deterministic:true,wallClockExcludedFromSemanticHash:true};
}

export function evaluateEmpiricalCalibrationR128(input:ReplayInput){
 if(!input.experimentId||!input.modelId||!input.claim)throw new Error('EXPERIMENT_MODEL_CLAIM_REQUIRED');
 const invalid=input.examples.map(e=>({id:e.id,errors:validateExample(e)})).filter(x=>x.errors.length);
 if(invalid.length)return{schema:R128_SCHEMA,revision:R128_REVISION,status:'INCONCLUSIVE' as const,reason:'INVALID_EXAMPLES',invalid,canonicalMutation:false,authority:'R128_VALIDATION_EVIDENCE_NOT_CANON'};
 const policy=policyDefaults(input.policy);
 const semanticHash=semanticReplayHashR128(input);
 const calibration=input.examples.filter(e=>e.split==='CALIBRATION');
 const holdout=input.examples.filter(e=>e.split==='HOLDOUT');
 const externalHoldout=holdout.filter(e=>e.datasetClass==='EXTERNAL');
 const nonExternalHoldout=holdout.filter(e=>e.datasetClass!=='EXTERNAL');
 const externalCalibration=calibration.filter(e=>e.datasetClass==='EXTERNAL');
 const fitRows=externalCalibration.length?externalCalibration:calibration.filter(e=>e.datasetClass!=='SYNTHETIC');
 const leakageIds=new Set(fitRows.map(r=>r.id));
 const holdoutLeakage=holdout.filter(r=>leakageIds.has(r.id));
 if(!fitRows.length||!externalHoldout.length){
  return{schema:R128_SCHEMA,revision:R128_REVISION,semanticHash,status:'INCONCLUSIVE' as const,reason:'EXTERNAL_CALIBRATION_OR_HOLDOUT_MISSING',counts:{calibration:calibration.length,fit:fitRows.length,holdout:holdout.length,externalHoldout:externalHoldout.length,syntheticOrInternalHoldout:nonExternalHoldout.length},syntheticValidationCredit:0,holdoutUsedForFit:false,canonicalMutation:false,authority:'R128_VALIDATION_EVIDENCE_NOT_CANON'};
 }
 if(holdoutLeakage.length)throw new Error('HOLDOUT_LEAKAGE_DETECTED');
 const fit=optimizeThreshold(fitRows,policy);
 const holdoutConfusion=confusion(externalHoldout,fit.threshold);
 const holdoutBrier=brier(externalHoldout),holdoutCalibrationError=calibrationError(externalHoldout);
 const receipts=(input.reproductionReceipts??[]).filter(r=>r.targetSemanticHash===semanticHash&&r.independent&&r.reproducible&&Number.isFinite(Date.parse(r.observedAt)));
 const pass=receipts.filter(r=>r.verdict==='PASS'),fail=receipts.filter(r=>r.verdict==='FAIL'),families=new Set(pass.map(r=>r.sourceFamily));
 const reproductionPass=!policy.requireReproduction||(pass.length>=2&&families.size>=2&&fail.length===0);
 const enough=externalHoldout.length>=policy.minExternalHoldout;
 const performancePass=holdoutConfusion.f1>=policy.minF1&&holdoutBrier<=policy.maxBrier&&holdoutCalibrationError<=policy.maxCalibrationError;
 const status=fail.length?'NOT_VALIDATED':enough&&performancePass&&reproductionPass?'VALIDATED':'INCONCLUSIVE';
 const reason=fail.length?'REPRODUCTION_FAILED':!enough?'EXTERNAL_HOLDOUT_TOO_SMALL':!performancePass?'HOLDOUT_METRICS_BELOW_POLICY':!reproductionPass?'INDEPENDENT_REPRODUCTION_INSUFFICIENT':'POLICY_PASSED';
 const receipt={
  schema:'OMEGA_EMPIRICAL_VALIDATION_RECEIPT_R128',revision:R128_REVISION,experimentId:input.experimentId,modelId:input.modelId,claim:input.claim,semanticHash,status,reason,
  threshold:{value:fit.threshold,optimizedOn:'CALIBRATION_ONLY',objective:policy.optimize,holdoutUsedForFit:false},
  counts:{all:input.examples.length,fit:fitRows.length,externalHoldout:externalHoldout.length,syntheticHoldout:holdout.filter(e=>e.datasetClass==='SYNTHETIC').length,internalDerivedHoldout:holdout.filter(e=>e.datasetClass==='INTERNAL_DERIVED').length},
  calibration:{fitObjective:fit.objective,fitConfusion:fit.confusion},
  holdout:{confusion:holdoutConfusion,brier:holdoutBrier,expectedCalibrationError:holdoutCalibrationError},
  reproduction:{required:policy.requireReproduction,passes:pass.length,failures:fail.length,independentPassFamilies:families.size,passed:reproductionPass},
  policy:{minExternalHoldout:policy.minExternalHoldout,minF1:policy.minF1,maxBrier:policy.maxBrier,maxCalibrationError:policy.maxCalibrationError},
  boundaries:{syntheticValidationCredit:0,externalValidationRequired:true,canonicalMutation:false,universalTruthClaim:false},
  authority:'R128_EMPIRICAL_VALIDATION_EVIDENCE_NOT_CANON'
 };
 const receiptHash=sha(receipt);
 return{schema:R128_SCHEMA,revision:R128_REVISION,semanticHash,status,reason,receipt:{...receipt,receiptSha256:receiptHash},replay:replayCapsuleR128(input),canonicalMutation:false,authority:'R128_VALIDATION_EVIDENCE_NOT_CANON'};
}
