import assert from'node:assert/strict';
import fs from'node:fs';
import{createHash}from'node:crypto';
import{
 R339_REVISION,R339_SCHEMA,R339_RELEASE_ID,R339_BASE_RELEASE_ID,R339_SOURCE_MANIFEST,R339_SOURCE_EXACT_SUMMARY,
 R339_ROUNDTRIP,R339_ABLATION,R339_PHYSICALITY_NEGATIVE_CONTROL,R339_SM_BASELINE,R339_FORECAST_CONTRACT,R339_CONTINUANCE,
 R339_TRANSPORT_NORMALIZATION,forecastReferenceCovarianceR339,ablationAreaInflationR339,ablationJointReductionR339,
 evaluateFrozenForecastR339,calibrationAdvancementManifestR339,calibratedRelativityR339
}from'../src/system/calibrationAdvancementR339.js';
import{R334_RELEASE_ID,R334_SOURCE_MANIFEST,R334_COMMON_STATE,cmsToAtlasR334,atlasToCmsR334}from'../src/system/calibrationR334.js';

const csvPath='public/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv';
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function parseCsv(source){
 const matrix=[],row=[],field=[];let quoted=false;
 const fd=()=>{row.push(field.join(''));field.length=0},rd=()=>{fd();matrix.push([...row]);row.length=0};
 for(let i=0;i<source.length;i++){const ch=source[i];if(quoted){if(ch==='"'){if(source[i+1]==='"'){field.push('"');i++}else quoted=false}else field.push(ch);continue}if(ch==='"'){quoted=true;continue}if(ch===','){fd();continue}if(ch==='\n'){rd();continue}if(ch==='\r'){if(source[i+1]==='\n')continue;rd();continue}field.push(ch)}
 if(field.length||row.length)rd();if(quoted)throw new Error('unterminated CSV');
 const header=matrix.shift()||[];return matrix.filter(x=>x.length>1||x[0]).map(values=>Object.fromEntries(header.map((key,i)=>[key,values[i]??''])));
}
const rows=parseCsv(fs.readFileSync(csvPath,'utf8')),by=Object.fromEntries(rows.map(x=>[x.row_id,x]));
const sources=Object.fromEntries(R339_SOURCE_MANIFEST.map(x=>[x.id,x]));
const r334Sources=Object.fromEntries(R334_SOURCE_MANIFEST.map(x=>[x.id,x]));

assert.equal(R339_REVISION,'R339');
assert.equal(R339_SCHEMA,'OMEGA_ABLATION_ROUNDTRIP_FORECAST_R339');
assert.equal(R339_BASE_RELEASE_ID,R334_RELEASE_ID);
assert.equal(R339_TRANSPORT_NORMALIZATION,'UTF8_BOM_REMOVED_CRLF_TO_LF_FINAL_EOL_REMOVED_VALUES_UNCHANGED');
assert.equal(R339_SOURCE_MANIFEST.length,2);
assert.equal(sources.MASTER_V4.rows,4285);
assert.equal(sources.MASTER_V4.columns,68);
assert.equal(sources.MASTER_V4.bytes,7938333);
assert.equal(sources.MASTER_V4.sha256,'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891');
assert.equal(sources.MASTER_V4.repositoryNormalizedSha256,'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2');
assert.equal(sources.MASTER_V4.repositoryNormalizedBytes,7934043);
assert.equal(sources.MASTER_V4.basePrefix.rows,4260);
assert.equal(sources.MASTER_V4.basePrefix.repositoryNormalizedSha256,r334Sources.MASTER_V3.repositoryNormalizedSha256);
assert.equal(sources.MASTER_V4.basePrefix.repositoryNormalizedBytes,r334Sources.MASTER_V3.repositoryNormalizedBytes);
assert.equal(sources.MASTER_V4.rows-sources.MASTER_V4.basePrefix.rows,25);

assert.equal(rows.length,25);
assert.equal(new Set(rows.map(x=>x.row_id)).size,25);
assert.equal(sha(csvPath),sources.ADV05_ADV07_V4.repositoryNormalizedSha256);
assert.equal(sources.ADV05_ADV07_V4.sha256,'e4aaaae441a326d663ba1de049e91c2ee9b392096b982f7608f6d10d6096d6b9');
assert.equal(sources.ADV05_ADV07_V4.bytes,10312);
assert.equal(sources.ADV05_ADV07_V4.repositoryNormalizedBytes,10282);
assert.deepEqual(Object.fromEntries(['ADV-05','ADV-06','ADV-07'].map(stage=>[stage,rows.filter(x=>x.stage===stage).length])),{'ADV-05':18,'ADV-06':5,'ADV-07':2});
assert.equal(R339_SOURCE_EXACT_SUMMARY.totalRows,4285);
assert.equal(R339_SOURCE_EXACT_SUMMARY.sourceExactRows,4105);
assert.equal(R339_SOURCE_EXACT_SUMMARY.derivedNoOverwriteRows,180);
assert.equal(R339_SOURCE_EXACT_SUMMARY.inheritedRows,4260);
assert.equal(R339_SOURCE_EXACT_SUMMARY.appendedRows,25);
assert.equal(R339_SOURCE_EXACT_SUMMARY.sourceExactRows+R339_SOURCE_EXACT_SUMMARY.derivedNoOverwriteRows,4285);

assert.equal(by['V4-0001'].result,'PASS');
assert.equal(by['V4-0002'].evidence_class,'NUMERICAL_ROUNDTRIP_PROOF');
assert.equal(Number(by['V4-0002'].value.split('=')[1]),R339_ROUNDTRIP.inversePointResidual);
assert.equal(Number(by['V4-0003'].value.split('=')[1]),R339_ROUNDTRIP.jacobianRoundtripResidual);
assert.equal(Number(by['V4-0004'].value.split('=')[1]),R339_ROUNDTRIP.covarianceRoundtripResidual);
const mapped=cmsToAtlasR334(R334_COMMON_STATE.fL,R334_COMMON_STATE.cParallel);
assert.ok(Math.abs(mapped.c21-R339_ROUNDTRIP.forward.c21)<1e-12);
assert.ok(Math.abs(mapped.c22-R339_ROUNDTRIP.forward.c22)<1e-12);
const inverted=atlasToCmsR334(R339_ROUNDTRIP.forward.c21,R339_ROUNDTRIP.forward.c22);
assert.ok(Math.abs(inverted.fL-R334_COMMON_STATE.fL)<1e-12);
assert.ok(Math.abs(inverted.cParallel-R334_COMMON_STATE.cParallel)<1e-12);

assert.equal(R339_ABLATION.joint.areaProxy,0.01971004271690502);
for(const [id,row] of Object.entries(R339_ABLATION.variants)){
 assert.ok(row.areaProxy>0,id+' invalid area proxy');
 assert.ok(Math.abs(ablationJointReductionR339(row.areaProxy)-row.jointReductionVsAblationPct)<0.001,id+' joint-reduction mismatch');
 if(Number.isFinite(row.areaInflationVsJointPct))assert.ok(Math.abs(ablationAreaInflationR339(row.areaProxy)-row.areaInflationVsJointPct)<0.001,id+' inflation mismatch');
}
assert.equal(by['V4-0012'].result,'BOUNDARY_ACTIVE');
assert.equal(R339_PHYSICALITY_NEGATIVE_CONTROL.result,'GATE_NECESSARY');
assert.ok(Math.abs(R339_PHYSICALITY_NEGATIVE_CONTROL.unconstrained.cParallel)>1);
assert.equal(R339_PHYSICALITY_NEGATIVE_CONTROL.constrained.cParallel,1);
assert.equal(by['V4-0023'].result,'DOMINANT_PRECISION_ANCHOR');
assert.equal(R339_ABLATION.c22Interpretation,'LOWER_INCREMENTAL_INFORMATION_NOT_PHYSICALLY_DISPENSABLE');
assert.equal(R339_SM_BASELINE.cmsDeltaChi2,2.850153633);
assert.equal(R339_SM_BASELINE.atlasSmMappedDeltaChi2,2.369639320);

assert.equal(by['V4-0040'].result,'FROZEN');
assert.equal(R339_FORECAST_CONTRACT.stateCenter.fL,R334_COMMON_STATE.fL);
assert.equal(R339_FORECAST_CONTRACT.stateCenter.cParallel,R334_COMMON_STATE.cParallel);
assert.equal(R339_FORECAST_CONTRACT.compatibilityThresholdD2,5.991464547108);
assert.equal(R339_FORECAST_CONTRACT.noRetuning,true);
assert.equal(by['V4-0044'].result,'HARD LOCK');
assert.match(by['V4-0044'].value,/No parameter, transform, covariance rule, interval, or pass threshold may be altered/i);
const ref=forecastReferenceCovarianceR339();
assert.ok(ref[0][0]>0&&ref[1][1]>0);
const center=evaluateFrozenForecastR339({contractId:R339_FORECAST_CONTRACT.id,basis:R339_FORECAST_CONTRACT.basis,assumptionsPreserved:true,fL:R339_FORECAST_CONTRACT.stateCenter.fL,cParallel:R339_FORECAST_CONTRACT.stateCenter.cParallel,covariance:[[0,0],[0,0]]});
assert.equal(center.state,'PASS');assert.equal(center.d2,0);
const far=evaluateFrozenForecastR339({contractId:R339_FORECAST_CONTRACT.id,basis:R339_FORECAST_CONTRACT.basis,assumptionsPreserved:true,fL:0.95,cParallel:-0.95,covariance:[[1e-6,0],[0,1e-6]]});
assert.equal(far.state,'FAIL');assert.ok(far.d2>R339_FORECAST_CONTRACT.compatibilityThresholdD2);
assert.equal(evaluateFrozenForecastR339({}).state,'HELD');
assert.equal(evaluateFrozenForecastR339({contractId:R339_FORECAST_CONTRACT.id,basis:R339_FORECAST_CONTRACT.basis,assumptionsPreserved:false}).reason,'ASSUMPTIONS_AND_COVARIANCE_PROVENANCE_REQUIRED');
assert.equal(evaluateFrozenForecastR339({contractId:R339_FORECAST_CONTRACT.id,basis:R339_FORECAST_CONTRACT.basis,assumptionsPreserved:true,fL:1.01,cParallel:0,covariance:[[0.01,0],[0,0.01]]}).reason,'RESTRICTED_PHYSICAL_DOMAIN_REQUIRED');
assert.equal(evaluateFrozenForecastR339({contractId:R339_FORECAST_CONTRACT.id,basis:R339_FORECAST_CONTRACT.basis,assumptionsPreserved:true,fL:0.5,cParallel:0,covariance:[[-0.01,0],[0,0.01]]}).reason,'POSITIVE_SEMIDEFINITE_INPUT_COVARIANCE_REQUIRED');
assert.equal(evaluateFrozenForecastR339({contractId:R339_FORECAST_CONTRACT.id,basis:R339_FORECAST_CONTRACT.basis,assumptionsPreserved:true,fL:0.5,cParallel:0,covariance:[[0.01,0.02],[0.02,0.01]]}).reason,'POSITIVE_SEMIDEFINITE_INPUT_COVARIANCE_REQUIRED');

assert.equal(by['V4-0050'].result,'PARTIAL PROMOTION');
assert.equal(by['V4-0051'].result,'PROMOTED AS NEXT INTERNAL PARENT');
assert.equal(R339_CONTINUANCE.canonicalMutation,false);
assert.equal(R339_CONTINUANCE.canonicalAdmission,false);
assert.equal(R339_CONTINUANCE.canonicalAdmissionAuthority,'R125');

const manifest=calibrationAdvancementManifestR339(),cal=calibratedRelativityR339();
assert.equal(manifest.releaseId,R339_RELEASE_ID);
assert.equal(manifest.baseRelease,R334_RELEASE_ID);
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmission,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.match(manifest.truthBoundary,/25 appended rows are DERIVED_NO_OVERWRITE/i);
assert.match(manifest.truthBoundary,/not an official ATLAS\/CMS combination/i);
assert.match(manifest.truthBoundary,/cannot independently mutate CanonState/i);
assert.equal(cal.base.releaseId,R334_RELEASE_ID);
assert.equal(cal.forecast.noRetuning,true);
assert.equal(cal.canonicalMutation,false);

console.log('R339 ABLATION + FORECAST BYTE/RUNTIME PASS · v4 4285-row master fingerprint bound · exact R334 4260-row normalized prefix retained · 25 normalized advancement rows SHA/census exact · round-trip residuals + ablation information loss + physicality negative control + frozen forecast/no-retuning gate executable · R125 admission preserved');
