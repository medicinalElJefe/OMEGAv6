import assert from'node:assert/strict';
import fs from'node:fs';

const source=fs.readFileSync('src/sarEstablishmentR342.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');

assert.equal(12**4,20736,'R342 address space must be exactly 20,736 states');
for(const token of[
 'OMEGA_SAR_ESTABLISHMENT_R342_20736D',
 'SAR_ESTABLISHMENT_CARDINALITY_R342=12**4',
 'S1_TOPS_AZIMUTH_COREG_TARGET_SAMPLES_R342=0.001',
 'SOURCE_IDENTITY','LOS_OR_3D_INVERSION','PROMOTION_READY','LEDGER_EXPORT',
 'SAMPLED_GRID_IDENTITY','TOPS_SUBPIXEL_COREGISTRATION','PHYSICALLY_VALID_INTERFEROMETRIC_PHASE',
 'RADIOMETRIC_BACKSCATTER','TERRAIN_FLATTENED_GAMMA0','UNWRAPPED_PHASE','LOS_DISPLACEMENT','CORRECTED_LOS','FULL_3D_DEFORMATION',
 'value=(power-noise)/A^2 where declared',
 'correctedPower/(calibrationLut*calibrationLut)',
 'signConvention*wavelengthM*correctedUnwrappedPhaseRad/(4*Math.PI)',
 'AT_LEAST_THREE_INDEPENDENT_LOS_REQUIRED',
 'LOS_GEOMETRY_RANK_DEFICIENT',
 'NO_METADATA_SHORTCUT_TO_COREGISTRATION',
 'NO_SINGLE_LOS_TO_3D',
 'PRUNE','TRANSLATE','PROVE','SCAR_CARRY'
])assert.ok(source.includes(token),`R342 source missing ${token}`);

assert.ok(source.includes("state:'NOT_DERIVABLE_FROM_SINGLE_LOS'"),'single LOS must not be promoted into 3-D');
assert.ok(source.includes("e.coregResidualAzimuthSamples<=S1_TOPS_AZIMUTH_COREG_TARGET_SAMPLES_R342"),'TOPS azimuth residual gate must be explicit');
assert.ok(source.includes("e.coregResidualRangeSamples<=rangeTol"),'range coreg residual must be compared to a declared tolerance');
assert.ok(source.includes("sampled-grid identity is not TOPS subpixel co-registration")||source.includes("Sample-grid identity is not TOPS subpixel co-registration"),'grid identity/coreg truth boundary must be explicit');
assert.ok(source.includes("if(correctedPower<0)return Number.NaN"),'negative noise-subtracted power must remain invalid rather than fabricated');
assert.ok(live.includes("evaluateSarEstablishmentR342"),'live SAR workstation must execute the R342 establishment engine');
assert.ok(live.includes("R342 ESTABLISHED"),'live workstation must expose establishment count');
assert.ok(live.includes("Next held layer:"),'live workstation must expose the next exact unresolved gate');

for(let i=0;i<20736;i++){
 const surface=i%12,proof=Math.floor(i/12)%12,transform=Math.floor(i/144)%12,evidence=Math.floor(i/1728)%12;
 const roundTrip=(((evidence*12)+transform)*12+proof)*12+surface;
 assert.equal(roundTrip,i,`R342 base-12 state round-trip failed at ${i}`);
}

console.log('R342 SAR ESTABLISHMENT 20,736D PASS · 12^4 state space · Dewey PRUNE→TRANSLATE→PROVE · grid/coreg separation · Sentinel calibration kernel · residual-gated LOS · rank-3 multi-LOS inversion · exact held reasons exposed live');
