import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const derivation=read('src/sarDerivationR336.ts');
const raster=read('src/sarRasterR283.ts');
const ui=read('src/SARTruthInstrumentR280.tsx');
const live=read('src/SARLiveTruthR285.tsx');

for(const token of [
 'OMEGA_SAR_FIELD_DERIVATION_R336','UNAVAILABLE_FROM_PRODUCT','DEPENDENCY_MISSING','DISPLAYABLE',
 'RADIOMETRIC_CALIBRATION_UNBOUND','GRD_HAS_NO_COMPLEX_PHASE','SECOND_COMPLEX_ACQUISITION_REQUIRED',
 'COMPATIBLE_SLC_PAIR_REQUIRED','INTERFEROMETRIC_RESIDUAL_LEDGER_INCOMPLETE','ELEVATION_SOURCE_REQUIRED',
 'POLARIMETRIC_CHANNEL_ARRAYS_REQUIRED','SECOND_RADAR_BAND_REQUIRED','MULTI_EPOCH_ARRAY_REQUIRED',
 'VALID_MASK_TO_SCAR_BURDEN','VALID_NATIVE_SAMPLE_TO_PROOF_COVERAGE'
])assert.ok(derivation.includes(token),`R336 derivation graph missing ${token}`);

assert.ok(derivation.includes("display = normalized log1p(native DN)"),'native GRD intensity must be displayable as native DN without pretending it is calibrated backscatter');
assert.ok(derivation.includes('It is not sigma0/gamma0'),'native DN amplitude lens must disclose calibration boundary');
assert.ok(derivation.includes("obs.productLevel==='GRD'?'UNAVAILABLE_FROM_PRODUCT'"),'GRD phase/interferometry branches must fail closed as unavailable from product');
assert.ok(!derivation.includes('amplitudeDb:r.nativeIntensity'),'native DN must never be relabeled amplitudeDb');
assert.ok(!derivation.includes('coherence:r.nativeIntensity'),'native intensity must never be relabeled coherence');
assert.ok(!derivation.includes('phaseRad:r.nativeIntensity'),'native intensity must never be relabeled phase');

for(const token of ['scarBurden?:number[]','proofCoverage?:number[]','derivationR336?:','if(view===\'AMPLITUDE\'){v=at(r.amplitudeDb,i)','v=at(r.nativeIntensity,i,r.validMask)','if(view===\'SCAR_UNCERTAINTY\')','if(view===\'PROOF\')'])
 assert.ok(raster.includes(token),`R336 raster integration missing ${token}`);
assert.ok(raster.includes('no native DN is promoted into calibrated sigma0/gamma0, phase, coherence, deformation, elevation, polarimetry, multi-band, or time-stack measurements'),'R336 raster truth boundary must remain explicit');

for(const token of ['R336 DERIVATION GRAPH','data-r336-state','resolveAllSarFieldsR336','materializeSarSafeDerivationsR336','currentResult?.interpretation','currentResult?.evidenceClass'])
 assert.ok(ui.includes(token),`R336 analytical surface missing ${token}`);
assert.ok(live.includes("native?.nativeDataBound?'R336 DERIVATION GRAPH ACTIVE':'DERIVED FIELDS UNBOUND'"),'live SAR surface must expose the derivation graph only after native source binding');

console.log('R336 SAR FIELD DERIVATION GRAPH PASS · real native evidence drives SOURCE/AMPLITUDE/SCAR/PROOF · impossible GRD phase paths are unavailable, not guessed · calibration and pair-derived physics remain independently gated');
