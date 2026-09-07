export const WHOLE_ORGANISM_REVISION_R191='R191' as const;
export const R191_PERFORMANCE_EVENT='omega-r191-performance-context' as const;

export type R191CacheStats={stateHits?:number;stateMisses?:number;neighborHits?:number;neighborMisses?:number;cachedStates?:number;cachedNeighborhoods?:number};
export type R191WholeOrganismContext={
 schema:'OMEGA_WHOLE_ORGANISM_CONTEXT_R191';revision:'R191';
 epistemic:{pressure:number;attention:'ROUTINE'|'TARGETED_REFINEMENT'|'EVIDENCE_REACQUIRE';metricCount:number;highUncertaintyRatio:number;singleSourceRatio:number;weakMetricMean:number;focusMetrics:string[];calibrationFingerprint:string|null};
 performance:{burden:number;headroom:number;terminalSamples:number;dispatchSamples:number;maturity:number;predictedChangePressure:number;source:'R185_TERMINAL_HISTORY'|'R185_PLAN_PLUS_HISTORY'|'NEUTRAL_NO_TERMINAL_HISTORY'};
 analysis:{localSteps:number;beamWidth:number;pathDepth:number;globalChunkSize:number;prewarmRadius:number;recommendedWorkingSet:number;fullFieldRecommended:boolean;fullFieldAuto:false;cacheReuseRequired:true};
 cache:R191CacheStats;
 authority:{executorSelection:'R147_ONLY';durableExecutionHistory:'R146_ONLY';performanceAdvice:'R185_ONLY';calibrationEstimate:'R181_NON_CANONICAL';analysisMemoization:'R189_ONLY';canonicalAdmission:'R125_ONLY'};
 canonicalMutation:false;evidenceMutation:false;executorSelectionAllowed:false;
 truthBoundary:string;
};

const cl=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
const finite=(v:any,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const choose=<T,>(v:number,rows:Array<[number,T]>,fallback:T)=>{for(const[cut,out]of rows)if(v<cut)return out;return fallback};

function epistemic(calibration:any){
 const residual=calibration?.residual||{},fused=calibration?.fusedMetrics||{},metricCount=Math.max(0,finite(residual.metricCount,Object.keys(fused).length)),den=Math.max(1,metricCount),high=cl(finite(residual.highUncertaintyCount)/den),single=cl(finite(residual.singleSourceMetricCount)/den),weakRows=Array.isArray(residual.weakestFirst)?residual.weakestFirst:[],weakMean=cl(mean(weakRows.slice(0,12).map((x:any)=>cl(finite(x?.evidenceWeakness),0,2)/2))),sourceCount=Math.max(0,finite(calibration?.sourceCount)),diversityPenalty=sourceCount?1/(1+sourceCount):1,pressure=cl(.34*high+.28*single+.24*weakMean+.14*diversityPenalty),attention=pressure>=.68?'EVIDENCE_REACQUIRE':pressure>=.36?'TARGETED_REFINEMENT':'ROUTINE',focusMetrics=weakRows.slice(0,8).map((x:any)=>String(x?.name||'').trim()).filter(Boolean);
 return{pressure,attention:attention as R191WholeOrganismContext['epistemic']['attention'],metricCount,highUncertaintyRatio:high,singleSourceRatio:single,weakMetricMean:weakMean,focusMetrics,calibrationFingerprint:String(calibration?.fingerprint||'')||null};
}
function performance(temporalHistory:any,temporalPlan:any){
 const rows=Object.values(temporalHistory?.executors||{}) as any[],terminalSamples=rows.reduce((s:any,x:any)=>s+Math.max(0,finite(x?.count)),0),dispatchSamples=rows.reduce((s:any,x:any)=>s+Math.max(0,finite(x?.dispatchCount)),0),mature=rows.filter(x=>finite(x?.count)>=1),weights=mature.map(x=>Math.max(1,finite(x?.count))),weightTotal=Math.max(1,weights.reduce((a,b)=>a+b,0)),burden=terminalSamples?cl(mature.reduce((s,x,i)=>{const success=cl(finite(x?.successEwma,.7)),verified=cl(finite(x?.verifiedEwma,.5)),latency=cl(finite(x?.latencyEwmaMs,1000)/8000),trend=cl(Math.max(0,finite(x?.latencyVelocityMs))/Math.max(500,finite(x?.latencyEwmaMs,1000)));return s+weights[i]*(.40*(1-success)+.18*(1-verified)+.30*latency+.12*trend)},0)/weightTotal):.35,headroom=cl(1-burden),predictedChangePressure=cl(finite(temporalPlan?.temporal?.predictedPressure,finite(temporalHistory?.route?.predictedPressure,.35))),maturity=cl(finite(temporalPlan?.history?.maturity,terminalSamples/24)),source=temporalPlan&&terminalSamples?'R185_PLAN_PLUS_HISTORY':terminalSamples?'R185_TERMINAL_HISTORY':'NEUTRAL_NO_TERMINAL_HISTORY';
 return{burden,headroom,terminalSamples,dispatchSamples,maturity,predictedChangePressure,source:source as R191WholeOrganismContext['performance']['source']};
}
export function compileWholeOrganismContextR191({calibration=null,temporalHistory=null,temporalPlan=null,cache={}}:{calibration?:any;temporalHistory?:any;temporalPlan?:any;cache?:R191CacheStats}={}):R191WholeOrganismContext{
 const e=epistemic(calibration),p=performance(temporalHistory,temporalPlan),demand=cl(.58*e.pressure+.42*p.predictedChangePressure),effective=cl(.56*demand+.44*p.headroom),localSteps=choose(effective,[[.24,6],[.46,8],[.68,12],[.86,16]],20),beamWidth=choose(effective,[[.24,6],[.46,8],[.68,12],[.86,16]],20),pathDepth=choose(effective,[[.28,4],[.52,6],[.76,8],[.9,10]],12),globalChunkSize=choose(p.headroom,[[.25,64],[.48,128],[.72,256],[.9,384]],512),prewarmRadius=p.headroom>=.72&&demand>=.38?2:p.headroom>=.45&&demand>=.28?1:0,recommendedWorkingSet=Number(temporalPlan?.work?.workingSetResolution)||choose(demand,[[.18,12],[.36,144],[.58,1728],[.80,20736]],248832),fullFieldRecommended=e.pressure>=.45&&p.headroom>=.32;
 return{schema:'OMEGA_WHOLE_ORGANISM_CONTEXT_R191',revision:'R191',epistemic:e,performance:p,analysis:{localSteps,beamWidth,pathDepth,globalChunkSize,prewarmRadius,recommendedWorkingSet,fullFieldRecommended,fullFieldAuto:false,cacheReuseRequired:true},cache:{...cache},authority:{executorSelection:'R147_ONLY',durableExecutionHistory:'R146_ONLY',performanceAdvice:'R185_ONLY',calibrationEstimate:'R181_NON_CANONICAL',analysisMemoization:'R189_ONLY',canonicalAdmission:'R125_ONLY'},canonicalMutation:false,evidenceMutation:false,executorSelectionAllowed:false,truthBoundary:'R191 couples epistemic attention to compute budgeting without collapsing authorities. R181 calibration weakness may focus analysis; R185 terminal-history and change-pressure signals may bound analysis cost; R189 must reuse exact analysis state. R191 cannot choose an executor, authorize or invoke execution, rewrite evidence or calibration packets, fabricate observations, convert performance telemetry into scientific evidence, or admit CanonState. Full-field R188 analysis remains explicit operator work.'};
}
