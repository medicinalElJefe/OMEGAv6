export const R314_AUTONOMOUS_CONVERGENCE_SCHEMA='OMEGA_AUTONOMOUS_CONVERGENCE_R314';
export const R314_MAX_SAME_REPAIR_ATTEMPTS=2;

const SEVERITY_WEIGHT=Object.freeze({LOW:1,MEDIUM:3,HIGH:8,CRITICAL:16});
const MODE_WEIGHT=Object.freeze({OBSERVE_ONLY:0,QUEUE_FOR_REVIEW:2,BLOCK:8});

const upper=value=>String(value??'').trim().toUpperCase();
const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;

function hash32(text){
 let hash=0x811c9dc5;
 for(let i=0;i<text.length;i++){
  hash^=text.charCodeAt(i);
  hash=Math.imul(hash,0x01000193)>>>0;
 }
 return hash.toString(16).padStart(8,'0');
}

export function normalizeResidualR314(row={},index=0){
 return {
  id:String(row.id||`R314-RESIDUAL-${index+1}`),
  severity:upper(row.severity||'LOW'),
  mode:upper(row.mode||'OBSERVE_ONLY'),
  summary:String(row.summary||row.reason||''),
  evidenceId:String(row.evidenceId||row.proofId||''),
  source:String(row.source||row.authority||''),
 };
}

export function residualVectorR314(evidence={}){
 const residuals=(Array.isArray(evidence?.residuals)?evidence.residuals:[]).map(normalizeResidualR314).sort((a,b)=>a.id.localeCompare(b.id));
 const blocking=residuals.filter(row=>row.mode==='BLOCK'||['HIGH','CRITICAL'].includes(row.severity));
 const pressure=residuals.reduce((sum,row)=>sum+(SEVERITY_WEIGHT[row.severity]??2)+(MODE_WEIGHT[row.mode]??1),0);
 const canonical=JSON.stringify({state:upper(evidence?.state||'UNPROVEN'),residuals});
 return {schema:R314_AUTONOMOUS_CONVERGENCE_SCHEMA,state:upper(evidence?.state||'UNPROVEN'),residuals,blocking:blocking.map(row=>row.id),pressure,fingerprint:`r314-${hash32(canonical)}`};
}

export function candidateGainR314({before,after,risk=0,complexity=0,changedPaths=0}={}){
 const a=residualVectorR314(before||{}),b=residualVectorR314(after||{});
 const raw=a.pressure-b.pressure;
 const riskPenalty=Math.max(0,finite(risk))*2;
 const complexityPenalty=Math.max(0,finite(complexity));
 const surfacePenalty=Math.max(0,finite(changedPaths)-1)*0.05;
 const gain=raw-riskPenalty-complexityPenalty-surfacePenalty;
 return {schema:'OMEGA_R314_CANDIDATE_GAIN',before:a,after:b,rawGain:raw,riskPenalty,complexityPenalty,surfacePenalty,gain,improved:raw>0&&gain>0,newBlocking:b.blocking.length>a.blocking.length};
}

export function repairAttemptKeyR314({fingerprint,repairId}){
 return `${String(fingerprint||'UNPROVEN')}::${String(repairId||'UNSPECIFIED')}`;
}

export function repairAttemptCountR314(history=[],key){
 return (Array.isArray(history)?history:[]).filter(row=>row?.key===key&&['FAILED','NO_GAIN','REJECTED'].includes(upper(row?.outcome))).length;
}

export function canAttemptRepairR314({history=[],fingerprint,repairId,maxAttempts=R314_MAX_SAME_REPAIR_ATTEMPTS}={}){
 const key=repairAttemptKeyR314({fingerprint,repairId});
 const failedAttempts=repairAttemptCountR314(history,key);
 return {allow:failedAttempts<maxAttempts,key,failedAttempts,maxAttempts,reason:failedAttempts<maxAttempts?'repair hypothesis remains inside bounded retry budget':'same residual fingerprint + repair hypothesis exhausted; require new evidence or a changed repair hypothesis'};
}

export function recordRepairAttemptR314(history=[],entry={}){
 const row={key:repairAttemptKeyR314(entry),fingerprint:String(entry.fingerprint||'UNPROVEN'),repairId:String(entry.repairId||'UNSPECIFIED'),candidateSha:entry.candidateSha?String(entry.candidateSha):null,outcome:upper(entry.outcome||'UNKNOWN'),gain:Number.isFinite(Number(entry.gain))?Number(entry.gain):null,evidenceId:entry.evidenceId?String(entry.evidenceId):null,recordedAt:String(entry.recordedAt||new Date().toISOString())};
 return [...(Array.isArray(history)?history:[]),row].slice(-128);
}

export function decideCandidateAdmissionR314({before,after,risk=0,complexity=0,changedPaths=0,testsGreen=false,exactBase=false,allowlisted=false,history=[],repairId}={}){
 const prior=residualVectorR314(before||{});
 const retry=canAttemptRepairR314({history,fingerprint:prior.fingerprint,repairId});
 const gain=candidateGainR314({before,after,risk,complexity,changedPaths});
 const reasons=[];
 if(!retry.allow)reasons.push('REPEATED_NO_GAIN_REPAIR');
 if(!testsGreen)reasons.push('TESTS_NOT_GREEN');
 if(!exactBase)reasons.push('BASE_NOT_EXACT');
 if(!allowlisted)reasons.push('DIFF_NOT_ALLOWLISTED');
 if(!gain.improved)reasons.push('NO_MEASURABLE_RESIDUAL_REDUCTION');
 if(gain.newBlocking)reasons.push('NEW_BLOCKING_RESIDUAL');
 return {schema:'OMEGA_R314_CANDIDATE_ADMISSION',allow:reasons.length===0,reasons,retry,gain,canonicalAdmission:false,directProductionMutation:false};
}

export const R314_AUTONOMOUS_LAWS=Object.freeze([
 'SAME_RESIDUAL_PLUS_SAME_REPAIR_IS_BOUNDED',
 'NO_GAIN_MEANS_NO_PROMOTION',
 'NEW_BLOCKING_RESIDUAL_MEANS_NO_PROMOTION',
 'EXACT_BASE_AND_ALLOWLISTED_DIFF_REQUIRED',
 'ALL_DECLARED_TESTS_MUST_BE_GREEN',
 'SOURCE_PROMOTION_IS_NOT_CANONSTATE_ADMISSION',
 'AUTONOMOUS_CANDIDATE_NEVER_WRITES_PRODUCTION_DIRECTLY',
]);
