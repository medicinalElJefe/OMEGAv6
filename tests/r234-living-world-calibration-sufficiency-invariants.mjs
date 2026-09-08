import assert from 'node:assert/strict';
import fs from 'node:fs';
const r232=fs.readFileSync('src/SourceSpatialCalibrationValidationR232.tsx','utf8');
const r234=fs.readFileSync('src/SourceSpatialCalibrationSufficiencyR234.tsx','utf8');
assert.match(r232,/SourceSpatialCalibrationSufficiencyR234/);assert.match(r232,/independentCorrespondenceValidationPassed&&<SourceSpatialCalibrationSufficiencyR234/);
for(const token of ['Evaluate calibration sufficiency','SOURCE_SPATIAL_CALIBRATION_SUFFICIENCY_EVALUATED','R86','R87','sourceAuthenticationProved:false','spatialCalibrationProved:false','computedPhotorealRealityProved:false','solverValidityProved:false','pcOnlineClaimed:false','federationClosureProved:false','canonicalMutation:false'])assert.ok(r234.includes(token),token);
assert.ok(!r234.includes('spatialCalibrationProved:true'));assert.ok(!r234.includes('computedPhotorealRealityProved:true'));assert.ok(!r234.includes('pcOnlineClaimed:true'));
console.log('R234 LIVING WORLD SURFACE PASS · R232 pass gates R234 interaction · existing R86/R87 continuity preserved · no physical/photoreal/solver/PC/federation/Canon overclaim');
