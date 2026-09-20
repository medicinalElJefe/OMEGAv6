import {R334_COMMON_STATE,R334_CROSS_REPRESENTATION,calibrationManifestR334} from './calibrationR334.js';

export const R339_REVISION='R339';
export const R339_SCHEMA='OMEGA_ABLATION_FORECAST_CALIBRATION_R339';
export const R339_RELEASE_ID='DEWEY_OMEGA_CERN_ABLATION_FORECAST_V4_2026-09-19';
export const R339_TRANSPORT_NORMALIZATION='UTF8_BOM_REMOVED_CRLF_TO_LF_FINAL_EOL_REMOVED_VALUES_UNCHANGED';

export const R339_SOURCE_MANIFEST=Object.freeze([
 {id:'MASTER_V4',name:'Dewey_OMEGA_CERN_Advanced_Master_v4_Ablation_Forecast_2026-09-19.csv',rows:4285,columns:68,bytes:7938333,sha256:'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891',repositoryNormalizedSha256:'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2',repositoryNormalizedBytes:7934043,role:'FULL_CALIBRATION_MASTER_V4',runtimePayload:'MANIFEST_ONLY',materialization:'EXTERNAL_MASTER_HASH_CENSUS_BOUND',composition:'4,260-row pre-suffix corpus plus 25 post-v3 ablation/forecast advancement rows; identity of the 4,260-row prefix to the earlier v3 master is not asserted by R339 without both full master byte streams in the same proof run.'},
 {id:'ADV05_ADV07_V4',name:'Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv',rows:25,columns:14,bytes:10312,sha256:'e4aaaae441a326d663ba1de049e91c2ee9b392096b982f7608f6d10d6096d6b9',repositoryNormalizedSha256:'d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410',repositoryNormalizedBytes:10282,publicPath:'/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv',role:'EXECUTABLE_ABLATION_ROUNDTRIP_FORECAST',runtimePayload:'REPOSITORY_CALIBRATION_ROWS',materialization:'REPOSITORY_EXACT_VALUES_NORMALIZED_TRANSPORT',stageCounts:Object.freeze({'ADV-05':18,'ADV-06':5,'ADV-07':2})}
]);

export const R339_MASTER_CENSUS=Object.freeze({
 rows:4285,
 columns:68,
 globalRowIdsUnique:true,
 globalSequenceContiguous:true,
 sourceExactPreservedRows:4105,
 derivedNoOverwriteRows:180,
 advancementSuffixRows:25,
 suffixLayer:'05_ABLATION_ROUNDTRIP_FORECAST',
 suffixOrigin:'POST_V3_PROOF_ADVANCEMENT'
});

export const R339_MASTER_SUFFIX_PROOF=Object.freeze({
 verifiedFromUploadedPair:true,
 masterSuffixRows:25,
 masterSuffixStartSequence:4261,
 masterSuffixEndSequence:4285,
 sourceRowOrderMatches:true,
 classificationMatchesResult:true,
 evidenceStatusMatchesEvidenceClass:true,
 sourceFileMatches:true,
 sourceRowKeys:Object.freeze(['V4-0001','V4-0002','V4-0003','V4-0004','V4-0010','V4-0011','V4-0012','V4-0013','V4-0014','V4-0015','V4-0016','V4-0017','V4-0020','V4-0021','V4-0022','V4-0023','V4-0024','V4-0030','V4-0040','V4-0041','V4-0042','V4-0043','V4-0044','V4-0050','V4-0051']),
 boundary:'This proves only that the final 25 rows of the uploaded 4,285-row master correspond one-to-one, in order, to the uploaded ADV05-ADV07 evidence rows by source_row_key, result/classification, evidence class/status, and source filename. It does not prove byte identity of the first 4,260 rows to the earlier v3 master.'
});

export const R339_ROUNDTRIP=Object.freeze({
 forward:Object.freeze({c21:-0.476181648882,c22:0.672883229686,result:'PASS'}),
 inversePointResidual:5.551115123125782702e-17,
 jacobianRoundTripResidual:2.081668171172168513e-17,
 covarianceRoundTripResidual:2.775642263565186517e-17,
 inverseDomain:'RESTRICTED_PHYSICAL_DOMAIN_ONLY'
});

export const R339_ABLATION=Object.freeze({
 jointFull:Object.freeze({fL:0.551411180,cParallel:0.451340589,c21:-0.476181649,c22:0.672883230,chi2:2.499909291,areaProxy:0.01971004271690502}),
 cmsOnly:Object.freeze({areaProxy:0.02950451271491152,jointReductionPct:33.197}),
 atlasOnlyPhysical:Object.freeze({areaProxy:0.1997355732482303,jointReductionPct:90.132,boundaryActive:true}),
 atlasOnlyUnconstrained:Object.freeze({areaProxy:0.27692646064007087,jointReductionPct:92.883,physical:false}),
 removeAtlasC21:Object.freeze({areaProxy:0.028805769354513726,jointReductionPct:31.576,reportedRemovalIncreasePct:46.148}),
 removeAtlasC22:Object.freeze({areaProxy:0.020149420543971747,jointReductionPct:2.181,reportedRemovalIncreasePct:2.229}),
 removeCmsFL:Object.freeze({areaProxy:0.09514233989180607,jointReductionPct:79.284,reportedRemovalIncreasePct:382.710}),
 removeCmsCParallel:Object.freeze({areaProxy:0.027056994663419532,jointReductionPct:27.154,reportedRemovalIncreasePct:37.275}),
 physicalityGate:'HARD_PRE_INTERPRETATION_GATE',
 retained:Object.freeze(['PHYSICALITY_GATE','CROSS_SKIN_TRANSFORM','COVARIANCE_CARRY','ATLAS_C21','CMS_fL','CMS_C_parallel']),
 pruned:Object.freeze(['EARLY_SCALAR_COMPRESSION'])
});

export const R339_FORECAST=Object.freeze({
 frozenAt:'2026-09-19',
 commonStateCenter:Object.freeze({fL:0.551411180209,cParallel:0.451340588867}),
 commonState95:Object.freeze({fL:[0.427006153,0.675118533],cParallel:[-0.165071802,0.927786963]}),
 atlasProjectionCenter:Object.freeze({c21:-0.476181648882,c22:0.672883229686}),
 atlasProjection95:Object.freeze({c21:[-0.969909731,0.173402373],c22:[0.487322201,0.859490771]}),
 negativity:Object.freeze({median:0.528866981067,interval95:[0.238152370091,0.876067421549],pPositiveApprox:1}),
 compatibilityThresholdD2:5.991464547108,
 compatibilityFormula:'D2=(x_new-x*)^T(Sigma_new+Sigma*)^-1(x_new-x*)',
 noRetuning:true,
 nextGate:'FIRST_SUITABLE_INDEPENDENT_FUTURE_H_TO_ZZ_SPIN_ENTANGLEMENT_MEASUREMENT'
});

export const R339_GOVERNANCE=Object.freeze({
 promotion:'PARTIAL_PROMOTION_WITHIN_RESTRICTED_BENCHMARK',
 nextInternalParent:'V4_FROZEN_STATE_PLUS_FORECAST_CONTRACT',
 externalEmpiricalStatus:'CONDITIONAL_ON_FUTURE_VALIDATION',
 canonicalMutation:false,
 canonicalAdmissionAuthority:'R125',
 forecastRetuningAllowed:false,
 externalReplicationGate:calibrationManifestR334().advancement.nativeAtlasReplication
});

export function futureMahalanobisD2R339(xNew,covNew,xStar=R339_FORECAST.commonStateCenter,covStar){
 const x=[Number(xNew?.fL),Number(xNew?.cParallel)],s=[Number(xStar?.fL),Number(xStar?.cParallel)];
 const a=Number(covNew?.[0]?.[0])+Number(covStar?.[0]?.[0]),b=Number(covNew?.[0]?.[1])+Number(covStar?.[0]?.[1]),c=Number(covNew?.[1]?.[0])+Number(covStar?.[1]?.[0]),d=Number(covNew?.[1]?.[1])+Number(covStar?.[1]?.[1]);
 const det=a*d-b*c;if(!x.every(Number.isFinite)||!s.every(Number.isFinite)||![a,b,c,d,det].every(Number.isFinite)||Math.abs(det)<1e-18)return null;
 const dx=x[0]-s[0],dy=x[1]-s[1],i00=d/det,i01=-b/det,i10=-c/det,i11=a/det;
 return dx*(i00*dx+i01*dy)+dy*(i10*dx+i11*dy);
}

export function evaluateFrozenForecastR339(xNew,covNew,covStar){
 const d2=futureMahalanobisD2R339(xNew,covNew,R339_FORECAST.commonStateCenter,covStar);
 return{d2,threshold:R339_FORECAST.compatibilityThresholdD2,state:d2==null?'HELD_INPUT_INVALID':d2<=R339_FORECAST.compatibilityThresholdD2?'PASS':'FAIL',retuned:false};
}

export function calibrationManifestR339(){
 return Object.freeze({
  schema:R339_SCHEMA,revision:R339_REVISION,releaseId:R339_RELEASE_ID,calibratedAt:'2026-09-19',
  inheritedR334:calibrationManifestR334(),sources:R339_SOURCE_MANIFEST,masterCensus:R339_MASTER_CENSUS,masterSuffixProof:R339_MASTER_SUFFIX_PROOF,roundTrip:R339_ROUNDTRIP,ablation:R339_ABLATION,forecast:R339_FORECAST,governance:R339_GOVERNANCE,
  canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R339 preserves the v4 ablation, round-trip, forecast, and governance rows as a successor evidence layer over R334. The forecast is a frozen prospective contract inside the restricted common-state model, not a guaranteed future measurement or an official ATLAS/CMS combination. Ablation importance is model- and approximation-dependent. No parameter, transform, covariance rule, interval, or threshold may be retuned after future target data are inspected without demoting the evaluation from predictive to descriptive.'
 });
}

export function calibratedForecastR339(){
 return Object.freeze({schema:'OMEGA_CALIBRATED_FORECAST_R339',revision:R339_REVISION,releaseId:R339_RELEASE_ID,commonState:R334_COMMON_STATE,crossRepresentation:R334_CROSS_REPRESENTATION,roundTrip:R339_ROUNDTRIP,ablation:R339_ABLATION,forecast:R339_FORECAST,governance:R339_GOVERNANCE,canonicalMutation:false,truthBoundary:calibrationManifestR339().truthBoundary});
}
