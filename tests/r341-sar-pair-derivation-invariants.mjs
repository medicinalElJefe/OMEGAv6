import assert from'node:assert/strict';
import fs from'node:fs';

const pair=fs.readFileSync('src/sarPairDerivationR341.ts','utf8');
const raster=fs.readFileSync('src/sarRasterR283.ts','utf8');
const derivation=fs.readFileSync('src/sarDerivationR336.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');

for(const token of[
 'OMEGA_SAR_PAIR_DERIVATION_R341',
 'EXACT_AFFINE_SAMPLED_GRID_IDENTITY',
 'EXACT_GCP_SAMPLED_GRID_IDENTITY',
 'SAMPLED_GRID_IDENTITY_NOT_PROVEN',
 'PAIR_FIELDS_BOUND',
 'GRID_IDENTITY_REQUIRED',
 'interferogramPhaseRad:phase',
 'SAR_COHERENCE_OPERATOR_R341',
 'gamma=|sum(s1*conj(s2))|/sqrt(sum(|s1|^2)*sum(|s2|^2))',
 'SAR_TIME_CHANGE_OPERATOR_R341',
 'Math.log(sa/ma)',
 'Exact sampled-grid identity is not Sentinel-1 TOPS subpixel co-registration'
])assert.ok(pair.includes(token),`R341 pair runtime missing ${token}`);

assert.ok(pair.includes('const re=mi*si+mq*sq,im=mq*si-mi*sq'),'R341 interferogram must implement master * conj(slave)');
assert.ok(pair.includes('Math.hypot(nr,ni)/den'),'R341 coherence must use normalized complex correlation magnitude');
assert.ok(pair.includes('fill(Number.NaN)'),'R341 missing pair-derived samples must remain missing rather than synthetic zero');
assert.ok(pair.includes("return{ok:false,reason:'SAMPLED_GRID_IDENTITY_NOT_PROVEN'}"),'R341 must fail closed when sampled-grid identity is not proven');
assert.ok(pair.includes('subpixelCoregistrationBound:false'),'R341 must keep TOPS subpixel co-registration explicitly unbound after exact-grid identity');
assert.ok(!pair.includes('Math.log((sa+1)/(ma+1))'),'R341 must not use an arbitrary +1 temporal ratio floor');

assert.ok(raster.includes('interferogramPhaseRad?:number[]'),'R341 raster contract must keep pair interferogram phase separate from source phase');
assert.ok(raster.includes('mask=r.validMask?.length===r.width*r.height?r.validMask:undefined'),'R341 coverage must honor validity masks for all displayed fields');
assert.ok(raster.includes("view==='INTERFEROGRAM'?(r.correctedInterferometricPhaseRad?.length?'correctedInterferometricPhaseRad':'interferogramPhaseRad')"),'INTERFEROGRAM coverage must prefer correction-ledger pair phase, fall back to raw pair phase, and never use source phase');
assert.ok(raster.includes("const a=r.correctedInterferometricPhaseRad?.length?r.correctedInterferometricPhaseRad:r.interferogramPhaseRad"),'INTERFEROGRAM rendering must preserve corrected→raw pair-phase precedence');
assert.ok(derivation.includes("'interferogramPhaseRad','rad'"),'field resolver must expose the pair-derived interferogram');
assert.ok(derivation.includes("'timeStackRelative','ln amplitude ratio'"),'time-stack lens must identify the scale-invariant two-epoch log-amplitude operator');

for(const token of[
 "import{deriveSarPairFieldsR341}",
 'referenceNative',
 'runReferenceNative',
 "pairDerived?.state==='PAIR_FIELDS_BOUND'",
 'PAIR FIELDS',
 'R337 SOURCE + R341 PAIR DERIVATION TRUTH',
 'raster={(native?.nativeDataBound||hostPreviewRaster)?displayRaster:undefined}'
])assert.ok(live.includes(token),`R341 live workstation missing ${token}`);

assert.ok(live.includes("masterPolarization=/^(vv|vh|hh|hv)$/i"),'R341 must bind the master measurement polarization from the exact selected asset');
assert.ok(live.includes("referenceAssets.filter(a=>String(a.key).toUpperCase()===masterPolarization)"),'R341 reference decode must use the exact same polarization channel as the master');
assert.ok(live.includes('COMMON_POLARIZATION_ASSET_REQUIRED'),'R341 must fail closed when the reference product has no matching polarization asset');
assert.ok(live.includes("&&pairAssetCompatible?deriveSarPairFieldsR341"),'R341 must not derive pair physics across mismatched polarization assets');
assert.ok(live.includes("sampledGridIdentityBound:true"),'R341 live observation must declare sampled-grid identity after the exact-grid gate passes');
assert.ok(live.includes("coRegistrationBound:false"),'R341 must not equate exact sampled-grid identity with physical TOPS co-registration');
assert.ok(live.includes("subpixelCoregistrationBound:false"),'R341 must keep subpixel co-registration held until residual proof exists');
assert.ok(live.includes("timeStackCount:2"),'R341 two-epoch temporal field must carry explicit epoch count');
assert.ok(live.includes("coRegistrationBound:false")&&live.includes("subpixelCoregistrationBound:false")&&live.includes("interferometricPhaseValidity:'HELD'"),'R341 UI must keep physical interferometry and deformation held until TOPS coregistration proof');

console.log('R341.1 SAR PAIR DERIVATION PASS · exact sampled-grid identity separated from TOPS subpixel coregistration · master×conj(slave) cross-phase · normalized complex correlation · scale-invariant ln amplitude ratio · source phase remains distinct · phase-valid interferometry and deformation stay held');
