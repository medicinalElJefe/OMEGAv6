import {compileWovenDimensionalRelativityR265,R265_SCHEMA,R265_REVISION} from './wovenDimensionalRelativityR265.js';

export const R266_SCHEMA='OMEGA_ADAPTIVE_COHERENCE_CYCLE_R266';
export const R266_REVISION='R266';
export const R266_PREDECESSOR=R265_REVISION;
export const R266_HISTORY_LIMIT=64;
export const R266_MIN_FULL_CONFIDENCE_SAMPLES=12;
export const R266_MAX_CALIBRATION_DELTA=.08;
export const R266_ADDRESS_LEVELS=Object.freeze([12,144,1728,20736,248832]);
export const R266_PROVENANCE_KINDS=Object.freeze(['EXPLICIT_OPERATOR_OUTCOME','OBSERVED_TRANSITION','RETURNED_PROOF']);
export const R266_CYCLE=Object.freeze(['OBSERVE','WATER_TRANSPORT','WOVEN_PATH','VIOLET_REEXPRESSION','PROVE','CARRY','RECONTEXTUALIZE','ADAPT_NEXT_CONTEXT']);
export const R266_AUTHORITY=Object.freeze({adaptation:'BOUNDED_CONTEXT_CALIBRATION_ONLY',planning:'R249_SCHEDULING_ONLY',sourceMutation:'R240_SINGLE_CANDIDATE_ONLY',dispatch:'R147',returnProof:'R141',history:'R146',canonAdmission:'R125',productionWriter:'.github/workflows/ci.yml',foundationWeightsChanged:false,addsPromotionAuthority:false});
export const R266_BOUNDARY='R266 closes the R265 cycle by allowing only explicit operator outcomes, observed transitions, and returned proof to influence bounded next-cycle software context. Cold start is exactly R265. Adaptation is not foundation-model training, empirical scientific validation, source mutation, deployment authority, or CanonState admission.';

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(n))?Number(n):a));
const finite=n=>Number.isFinite(Number(n))?Number(n):null;
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const acceptedKind=v=>R266_PROVENANCE_KINDS.includes(String(v||'').toUpperCase());
const outcomeOf=row=>row?.accepted===true?1:row?.accepted===false?0:finite(row?.outcomeScore);
const weightedMean=(rows,key)=>{let n=0,d=0;for(let i=0;i<rows.length;i++){const v=finite(key(rows[i]));if(v===null)continue;const w=(i+1)/rows.length;n+=w*v;d+=w}return d?n/d:null};

export function normalizeAdaptiveHistoryR266(history=[]){
 const rows=(Array.isArray(history)?history:[]).slice(-R266_HISTORY_LIMIT).map((row,index)=>({
  index,
  provenanceKind:String(row?.provenanceKind||row?.provenance||'').toUpperCase(),
  outcomeScore:outcomeOf(row),
  coherence:finite(row?.coherence??row?.r265Coherence??row?.r266Coherence),
  scar:finite(row?.scar),
  residual:finite(row?.residual),
  roundTripResidual:finite(row?.roundTripResidual),
  commutationResidual:finite(row?.commutationResidual)
 })).filter(row=>acceptedKind(row.provenanceKind)&&row.outcomeScore!==null);
 return rows;
}

export function compileAdaptiveCoherenceR266({current={},history=[]}={}){
 const r265=current?.schema===R265_SCHEMA?current:compileWovenDimensionalRelativityR265(current);
 const rows=normalizeAdaptiveHistoryR266(history);
 const sampleCount=rows.length,confidence=clamp(sampleCount/R266_MIN_FULL_CONFIDENCE_SAMPLES);
 const outcomeMean=weightedMean(rows,row=>row.outcomeScore);
 const historicalCoherence=weightedMean(rows,row=>row.coherence);
 const historicalScar=weightedMean(rows,row=>row.scar);
 const historicalResidual=weightedMean(rows,row=>row.residual);
 const firstCoherence=rows.find(row=>row.coherence!==null)?.coherence??null,lastCoherence=[...rows].reverse().find(row=>row.coherence!==null)?.coherence??null;
 const trend=firstCoherence===null||lastCoherence===null?0:clamp(lastCoherence-firstCoherence,-1,1);
 const outcomeDelta=outcomeMean===null?0:clamp((outcomeMean-.5)*.16,-R266_MAX_CALIBRATION_DELTA,R266_MAX_CALIBRATION_DELTA);
 const trendDelta=clamp(trend*.04,-.04,.04);
 const calibrationDelta=sampleCount?clamp(confidence*(outcomeDelta+trendDelta),-R266_MAX_CALIBRATION_DELTA,R266_MAX_CALIBRATION_DELTA):0;
 const baseCoherence=clamp(r265?.metrics?.computationCoherence);
 const adaptiveCoherence=sampleCount?clamp(baseCoherence+calibrationDelta):baseCoherence;
 const baseFuture=clamp(r265?.violet?.futurePreservingSoftwareScore);
 const adaptiveFuturePreservation=sampleCount?clamp(baseFuture+.5*calibrationDelta):baseFuture;
 const baseScar=clamp(r265?.metrics?.scar),carriedScar=sampleCount?clamp(Math.max(baseScar,confidence*clamp(historicalScar??0))):baseScar;
 const residualMemory=sampleCount?clamp(confidence*clamp(historicalResidual??0)):0;
 const baseWaterMemory=clamp(r265?.water?.memory);
 const adaptiveWaterMemory=sampleCount?clamp(.82*baseWaterMemory+.18*clamp(mean([outcomeMean??.5,1-carriedScar,1-residualMemory]))):baseWaterMemory;
 const measuredRoundTrips=rows.filter(row=>row.roundTripResidual!==null),measuredCommutations=rows.filter(row=>row.commutationResidual!==null);
 const roundTripResidual=weightedMean(measuredRoundTrips,row=>Math.abs(row.roundTripResidual)),commutationResidual=weightedMean(measuredCommutations,row=>Math.abs(row.commutationResidual));
 const proof={roundTripResidual,roundTripStatus:roundTripResidual===null?'NOT_MEASURED':roundTripResidual<=Number(r265?.proof?.residualThreshold??.05)?'PASS':'FAIL',commutationResidual,commutationStatus:commutationResidual===null?'NOT_MEASURED':commutationResidual<=Number(r265?.proof?.residualThreshold??.05)?'PASS':'FAIL',measuredRoundTripSamples:measuredRoundTrips.length,measuredCommutationSamples:measuredCommutations.length,externalScientificTruthClaimed:false};
 return{schema:R266_SCHEMA,revision:R266_REVISION,predecessor:R266_PREDECESSOR,cycle:[...R266_CYCLE],r265,currentR265Coherence:baseCoherence,history:{sampleCount,confidence,outcomeMean,historicalCoherence,historicalScar,historicalResidual,trend,acceptedProvenanceKinds:[...R266_PROVENANCE_KINDS],ignoredHistoryCount:Math.max(0,(Array.isArray(history)?history.length:0)-sampleCount),limit:R266_HISTORY_LIMIT},adaptation:{coldStartEquivalentToR265:sampleCount===0,calibrationDelta,maximumAbsoluteCalibrationDelta:R266_MAX_CALIBRATION_DELTA,adaptiveCoherence,adaptiveFuturePreservation,carriedScar,residualMemory,adaptiveWaterMemory,foundationWeightsChanged:false,unchosenCandidatesAreFailures:false},nextContext:{memory:adaptiveWaterMemory,scar:carriedScar,residual:clamp(Math.max(Number(r265?.woven?.residualCarry??0),residualMemory)),computationCoherence:adaptiveCoherence,futurePreservation:adaptiveFuturePreservation,provenance:['R265_CURRENT_STATE',...rows.map(row=>row.provenanceKind)].slice(-R266_HISTORY_LIMIT)},proof,authority:R266_AUTHORITY,boundary:R266_BOUNDARY};
}

export function projectAddressR266(address,sourceResolution,targetResolution){
 const s=Number(sourceResolution),t=Number(targetResolution),a=Math.floor(Number(address));
 if(!R266_ADDRESS_LEVELS.includes(s)||!R266_ADDRESS_LEVELS.includes(t))throw new Error('R266 projection requires declared 12^k address levels.');
 if(!Number.isInteger(a)||a<0||a>=s)throw new Error('R266 projection source address out of range.');
 if(s===t)return a;
 const center=(a+.5)/s;
 return Math.max(0,Math.min(t-1,Math.floor(center*t)));
}

export function compileResolutionBridgeR266({address,sourceResolution,targetResolution}={}){
 const sourceAddress=Math.floor(Number(address)),projectedAddress=projectAddressR266(sourceAddress,sourceResolution,targetResolution),roundTripAddress=projectAddressR266(projectedAddress,targetResolution,sourceResolution),roundTripResidual=Math.abs(roundTripAddress-sourceAddress)/Math.max(1,Number(sourceResolution)-1);
 return{schema:'OMEGA_R266_SPARSE_RESOLUTION_BRIDGE',revision:R266_REVISION,sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),sourceAddress,projectedAddress,roundTripAddress,roundTripResidual,roundTripStatus:roundTripResidual<=1/Math.max(1,Number(sourceResolution))?'PASS':'LOSSY_EXPECTED',enumeratedFullAtlas:false,physicalDimensionsClaimed:false,boundary:'This is a sparse normalized-address projection across declared atlas resolutions. Its round-trip residual measures this software projection only; it is not an empirical physical residual.'};
}
