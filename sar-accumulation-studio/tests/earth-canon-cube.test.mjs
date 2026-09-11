import test from 'node:test';
import assert from 'node:assert/strict';
import { EARTH_SOURCE_FAMILIES, canonPacket, mode188FromChart, buildCanonicalEarthCube, englishCubeSummary } from '../src/earth-canon-cube.mjs';

test('charted Mode 188 equation is executable and deterministic',()=>{
  const stay=mode188FromChart({C:1.2,Lambda:.2,q:.1}),turn=mode188FromChart({C:.31,Lambda:.2,q:.1,tau:.1}),escalate=mode188FromChart({C:.1,Lambda:.4,q:.3});
  assert.equal(stay.formula,'S = C / (Λ + q + Λq)');assert.equal(stay.decision,'STAY');assert.equal(stay.admissibility,'ACCEPT');assert.equal(turn.decision,'TURN');assert.equal(turn.admissibility,'CONDITIONAL');assert.equal(escalate.decision,'ESCALATE');assert.equal(escalate.admissibility,'PRUNE');
});

test('measured SAR remains measured and is never replaced by reconstruction',()=>{
  const measured=canonPacket({id:'m',sourceFamily:'SENTINEL1_SAR',parameter:'calibrated_backscatter',evidenceClass:'MEASURED',exactMeasured:true,continuity:1,value:-11,units:'dB',sourceProven:true});
  const inferred=canonPacket({id:'r',sourceFamily:'OMEGA_FIELD',parameter:'bounded_continuity_reconstruction',evidenceClass:'RECONSTRUCTED',continuity:.9,value:-4,units:'display'});
  const cube=buildCanonicalEarthCube([measured,inferred]);
  assert.equal(measured.measured,true);assert.equal(inferred.measured,false);assert.equal(cube.renderPlan.authority,'EXACT_MEASURED_SAR');assert.equal(cube.renderPlan.measuredWeight,1);assert.ok(cube.renderPlan.reconstructionWeight<.05);assert.match(cube.renderPlan.rule,/never overwrites measurement/i);
});

test('regional measured SAR plus DEM produces canonical shape authority without measurement promotion',()=>{
  const sar=canonPacket({sourceFamily:'SENTINEL1_SAR',parameter:'calibrated_backscatter',evidenceClass:'MEASURED',regionalMeasured:true,continuity:.98,sourceProven:true});
  const dem=canonPacket({sourceFamily:'TERRARIUM_DEM',parameter:'elevation',evidenceClass:'CONTEXT',continuity:.95});
  const cube=buildCanonicalEarthCube([sar,dem]);
  assert.equal(cube.renderPlan.authority,'REGIONAL_MEASURED_SAR');assert.equal(cube.renderPlan.primarySurface,'REGIONAL_CANONICAL_SHAPE');assert.ok(cube.renderPlan.terrainWeight>0);assert.equal(dem.measured,false);assert.equal(cube.summary.measured,1);
});

test('unknown and scars remain explicit instead of becoming zero measurements',()=>{
  const unknown=canonPacket({id:'u',sourceFamily:'GNSS',parameter:'station_velocity',evidenceClass:'UNKNOWN',scar:{reason:'DOCUMENTED_ADAPTER_PENDING'}});
  const cube=buildCanonicalEarthCube([unknown]);
  assert.equal(unknown.measured,false);assert.equal(unknown.value,null);assert.equal(cube.summary.unknown,1);assert.equal(cube.scars.length,1);assert.match(unknown.english.evidence,/unknown/i);
});

test('documented geodesy families are adapter pending, not falsely live',()=>{
  for(const family of ['GNSS','STRAIN','SEISMIC','TILT','PORE_PRESSURE','ENVIRONMENT'])assert.equal(EARTH_SOURCE_FAMILIES[family].status,'DOCUMENTED_ADAPTER_PENDING');
  const unproven=canonPacket({sourceFamily:'GNSS',parameter:'station_displacement',evidenceClass:'MEASURED',sourceProven:false,value:4,units:'mm'});assert.equal(unproven.canClaimLiveMeasurement,false);
});

test('English cube summary exposes authority and Mode 188 state',()=>{
  const cube=buildCanonicalEarthCube([canonPacket({sourceFamily:'SENTINEL1_SAR',parameter:'calibrated_backscatter',evidenceClass:'MEASURED',regionalMeasured:true,continuity:1,sourceProven:true})]);const text=englishCubeSummary(cube);assert.match(text,/REGIONAL MEASURED SAR/i);assert.match(text,/Mode 188/i);assert.match(text,/Primary surface/i);
});
