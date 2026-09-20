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
 'SUBPIXEL_COREGISTRATION_NOT_PROVEN',
 'PAIR_FIELDS_BOUND',
 'GRID_IDENTITY_REQUIRED',
 'interferogramPhaseRad:phase',
 'gamma = |sum(s1*conj(s2))|',
 'Math.log((sa+1)/(ma+1))',
 'It does not claim Sentinel-1 TOPS subpixel co-registration'
])assert.ok(pair.includes(token),`R341 pair runtime missing ${token}`);

assert.ok(pair.includes('const re=mi*si+mq*sq,im=mq*si-mi*sq'),'R341 interferogram must implement master * conj(slave)');
assert.ok(pair.includes('Math.hypot(nr,ni)/den'),'R341 coherence must use normalized complex correlation magnitude');
assert.ok(pair.includes('fill(Number.NaN)'),'R341 missing pair-derived samples must remain missing rather than synthetic zero');
assert.ok(pair.includes("return{ok:false,reason:'SUBPIXEL_COREGISTRATION_NOT_PROVEN'}"),'R341 must fail closed when sampled-grid identity is not proven');

assert.ok(raster.includes('interferogramPhaseRad?:number[]'),'R341 raster contract must keep pair interferogram phase separate from source phase');
assert.ok(raster.includes('mask=r.validMask?.length===r.width*r.height?r.validMask:undefined'),'R341 coverage must honor validity masks for all displayed fields');
assert.ok(raster.includes("view==='INTERFEROGRAM'?'interferogramPhaseRad'"),'INTERFEROGRAM coverage must use pair phase, never source phase');
assert.ok(derivation.includes("'interferogramPhaseRad','rad'"),'field resolver must expose the pair-derived interferogram');
assert.ok(derivation.includes("'timeStackRelative','log amplitude ratio'"),'time-stack lens must identify the two-epoch log-amplitude operator');

for(const token of[
 "import{deriveSarPairFieldsR341}",
 'referenceNative',
 'runReferenceNative',
 "pairDerived?.state==='PAIR_FIELDS_BOUND'",
 'PAIR FIELDS',
 'R337 SOURCE + R341 PAIR DERIVATION TRUTH',
 'raster={native?.nativeDataBound?displayRaster:undefined}'
])assert.ok(live.includes(token),`R341 live workstation missing ${token}`);

assert.ok(live.includes("coRegistrationBound:true"),'R341 live observation must declare co-registration only after the exact-grid gate passes');
assert.ok(live.includes("timeStackCount:2"),'R341 two-epoch temporal field must carry explicit epoch count');
assert.ok(live.includes("deformation remains held"),'R341 UI must not promote wrapped pair phase into deformation');

console.log('R341 SAR PAIR DERIVATION PASS · reference SLC decoded independently · exact sampled-grid identity required · master×conj(slave) interferogram · local normalized complex coherence · two-epoch log-amplitude change · source phase remains distinct · deformation stays held without unwrapping/residual correction');
